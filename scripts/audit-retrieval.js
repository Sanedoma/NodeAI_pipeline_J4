import { readFileSync, writeFileSync } from 'fs';
import { retrieveContext } from '../rag-pipline.js';

const TOP_K_VALUES = [1, 5, 10];
const THRESHOLDS = [0.3, 0.5, 0.7];

function readQuestions(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim() && /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function estimateTokens(text) {
  const safeText = typeof text === 'string' ? text : String(text ?? '');
  return Math.max(1, Math.ceil(safeText.split(/\s+/).length * 1.3));
}

function getCompletionText(result) {
  if (typeof result === 'string') return result;
  if (result && typeof result.content === 'string') return result.content;
  if (result && typeof result.answer === 'string') return result.answer;
  return String(result ?? '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetries(fn, retries = 3, initialDelayMs = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const message = String(err?.message || err);
      const isRateLimit = /rate limit|429|rate_limited/i.test(message);

      if (!isRateLimit || attempt === retries) {
        throw err;
      }

      await sleep(initialDelayMs * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

function avg(arr){
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function toMdTable(rows, headers){
  let md = headers.join(' | ') + '\n';
  md += headers.map(()=>'---').join(' | ') + '\n';
  rows.forEach(r => md += r.join(' | ') + '\n');
  return md;
}

async function run() {
  const questions = readQuestions('./questions-test.txt');

  const baselineTopK = 5;
  const maxTopK = Math.max(...TOP_K_VALUES, baselineTopK);
  const retrievalCache = new Map();

  async function getChunks(question) {
    const cacheKey = `${maxTopK}::${question}`;
    if (!retrievalCache.has(cacheKey)) {
      retrievalCache.set(cacheKey, withRetries(() => retrieveContext(question, maxTopK)));
    }
    return retrievalCache.get(cacheKey);
  }

  const baselineRows = [];

  console.log(`Running baseline topK=${baselineTopK}`);

  for (let i=0;i<questions.length;i++){
    const q = questions[i];
    try {
      const chunks = (await getChunks(q)).slice(0, baselineTopK);
      const scores = chunks.map(c=>c.score||0);
      const top1 = scores[0] ?? 0;
      const top3 = avg(scores.slice(0,3));
      const inputTokens = estimateTokens(q);
      const outputTokens = estimateTokens(JSON.stringify(chunks));
      const answer = chunks.length > 0
        ? `Retrieved ${chunks.length} chunks`
        : 'No chunks retrieved';

      baselineRows.push([
        String(i+1),
        q.replace(/\|/g,'\\|'),
        top1.toFixed(3),
        top3.toFixed(3),
        `${inputTokens} / ${outputTokens}`,
        '$' + ( (inputTokens+outputTokens)*0.000001 ).toFixed(6),
        assessPertinence(chunks),
        assessFidelity(answer),
        computeNote(chunks)
      ]);
    } catch (err) {
      console.error(`Error processing question ${i+1}:`, err.message);
      baselineRows.push([String(i+1), q.replace(/\|/g,'\\|'), 'ERR','ERR','?','?','Erreur','Erreur','0/5']);
    }
  }

  // Variants: topK and threshold
  const variants = [];

  for (const topK of TOP_K_VALUES){
    const rows = [];
    for (let i=0;i<questions.length;i++){
      const q = questions[i];
      const chunks = (await getChunks(q)).slice(0, topK);
      const scores = chunks.map(c=>c.score||0);
      const top1 = scores[0] ?? 0;
      const top3 = avg(scores.slice(0,3));
      const pertinence = assessPertinence(chunks);
      const fidelity = 'À vérifier';
      rows.push([
        String(i+1), q.replace(/\|/g,'\\|'), top1.toFixed(3), top3.toFixed(3), pertinence, fidelity, computeNote(chunks)
      ]);
    }
    variants.push({ name: `topK=${topK}`, headers: ['#','Question','Top-1 Score','Avg Top-3','Pertinence','Fidélité','Notes'], rows });
  }

  for (const threshold of THRESHOLDS){
    const rows = [];
    for (let i=0;i<questions.length;i++){
      const q = questions[i];
      const chunks = (await getChunks(q)).slice(0, baselineTopK);
      const filtered = chunks.filter(c=> (c.score||0) >= threshold);
      const scores = filtered.map(c=>c.score||0);
      const top1 = scores[0] ?? null;
      const top3 = scores.length? avg(scores.slice(0,3)) : null;
      const pertinence = assessPertinence(filtered);
      const fidelity = 'À vérifier';
      rows.push([
        String(i+1), q.replace(/\|/g,'\\|'), (top1===null)?'Aucun':(top1.toFixed(3)), (top3===null)?'Aucun':(top3.toFixed(3)), pertinence, fidelity, computeNote(filtered)
      ]);
    }
    variants.push({ name: `threshold=${threshold}`, headers: ['#','Question','Top-1 Score','Avg Top-3','Pertinence','Fidélité','Notes'], rows });
  }

  // Generate markdown
  let md = '# Evaluation RAG Pipeline\n\n';
  md += '## Baseline\n\n';
  md += toMdTable(baselineRows, ['#','Question','Top-1 Score','Avg Top-3','Tokens (in/out)','Cost ($)','Pertinence','Fidélité','Notes']);

  for (const v of variants){
    md += `\n## Variante — ${v.name}\n\n`;
    md += toMdTable(v.rows, v.headers);
  }

  writeFileSync('eval-table.md', md, 'utf-8');
  console.log('Wrote eval-table.md');
}

function assessPertinence(chunks){
  if (!chunks || chunks.length === 0) return 'Non trouvé';
  const avgScore = avg(chunks.map(c=>c.score||0));
  if (avgScore >= 0.75) return '5';
  if (avgScore >= 0.5) return '3';
  return '1';
}

function assessFidelity(answer){
  if (!answer) return 'À vérifier';
  if (answer.toLowerCase().includes('je ne trouve pas')) return '5';
  return 'À vérifier';
}

function computeNote(chunks){
  if (!chunks || chunks.length === 0) return '0/5';
  const avgScore = avg(chunks.map(c=>c.score||0));
  const note = Math.max(0, Math.min(5, Math.round(avgScore * 5)));
  return `${note}/5`;
}

run().catch(err=>{
  console.error(err);
  process.exitCode = 1;
});
