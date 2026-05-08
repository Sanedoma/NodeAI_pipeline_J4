import { readFileSync, writeFileSync } from 'fs';
import { ragQuery } from '../rag-pipline.js';

// Coûts Mistral (en USD par million de tokens, approx)
const MISTRAL_EMBED_COST = 0.02 / 1_000_000;
const MISTRAL_SMALL_INPUT_COST = 0.14 / 1_000_000;
const MISTRAL_SMALL_OUTPUT_COST = 0.42 / 1_000_000;

function estimateTokens(text) {
  const safeText = typeof text === 'string' ? text : String(text ?? '');
  return Math.ceil(safeText.split(/\s+/).length * 1.3); // rough estimate
}

function calculateCost(inputTokens, outputTokens) {
  const embedCost = inputTokens * MISTRAL_EMBED_COST;
  const genInputCost = inputTokens * MISTRAL_SMALL_INPUT_COST;
  const genOutputCost = outputTokens * MISTRAL_SMALL_OUTPUT_COST;
  return (embedCost + genInputCost + genOutputCost).toFixed(6);
}

function readQuestions(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim() && /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function assessPertinence(chunks, question) {
  // Simple heuristic: if avg score >= 0.75, question is in-domain
  if (chunks.length === 0) return 'Non trouvé';
  const avgScore = chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;
  return avgScore >= 0.75 ? 'Oui' : avgScore >= 0.5 ? 'Partiel' : 'Non';
}

function assessFidelity(answer) {
  // Simple heuristic: if answer contains "Je ne trouve pas", it's faithful
  if (answer.toLowerCase().includes('je ne trouve pas')) {
    return 'Fidèle (refus)';
  }
  // Otherwise assume it's a generated response (harder to judge without ground truth)
  return 'À vérifier';
}

async function evaluateRag() {
  const questions = readQuestions('./questions-test.txt');
  console.log(`📊 Évaluation RAG sur ${questions.length} questions\n`);

  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`[${i + 1}/${questions.length}] ${question.substring(0, 50)}...`);

    try {
      const result = await ragQuery(question, { verbose: false });

      const topScore = result.metrics.topScore || 0;
      const avgScore = result.metrics.avgScore || 0;

      // Estimate tokens
      const inputTokens = estimateTokens(question);
      const outputTokens = estimateTokens(result.answer);
      const cost = calculateCost(inputTokens, outputTokens);

      // Assess pertinence and fidelity
      const pertinence = assessPertinence(result.chunks, question);
      const fidelity = assessFidelity(result.answer);

      // Handle sources (can be array or Set)
      const sourcesList = Array.isArray(result.sources) 
        ? result.sources 
        : result.sources instanceof Set
        ? Array.from(result.sources)
        : [];

      results.push({
        question,
        topScore: topScore.toFixed(3),
        avgTopK: avgScore.toFixed(3),
        tokens: inputTokens + outputTokens,
        cost,
        pertinence,
        fidelity,
        sources: sourcesList.join(', ')
      });
    } catch (err) {
      console.error(`  ❌ Erreur: ${err.message}`);
      results.push({
        question,
        topScore: 'ERR',
        avgTopK: 'ERR',
        tokens: '?',
        cost: '?',
        pertinence: 'Erreur',
        fidelity: 'Erreur',
        sources: ''
      });
    }
  }

  // Generate markdown table
  const markdown = generateMarkdownTable(results);
  writeFileSync('./eval-table.md', markdown, 'utf-8');
  console.log('\n✅ Résultats sauvegardés dans eval-table.md');

  // Print summary
  const validResults = results.filter(r => r.topScore !== 'ERR');
  if (validResults.length > 0) {
    const avgTopScore = validResults
      .reduce((sum, r) => sum + parseFloat(r.topScore), 0) / validResults.length;
    const avgCost = validResults
      .reduce((sum, r) => sum + parseFloat(r.cost), 0) / validResults.length;
    console.log(`\n📈 Statistiques:
  - Taux réussite: ${((validResults.length / results.length) * 100).toFixed(0)}%
  - Score top-1 moyen: ${avgTopScore.toFixed(3)}
  - Coût moyen par requête: $${avgCost.toFixed(6)}`);
  }
}

function generateMarkdownTable(results) {
  let md = '| Question | Top-1 score | Avg top-3 | Tokens | Coût | Pertinence | Fidélité | Sources |\n';
  md += '|---|---|---|---|---|---|---|---|\n';

  results.forEach(r => {
    const question = r.question.substring(0, 40) + (r.question.length > 40 ? '...' : '');
    md += `| ${question} | ${r.topScore} | ${r.avgTopK} | ${r.tokens} | $${r.cost} | ${r.pertinence} | ${r.fidelity} | ${r.sources.substring(0, 20)}${r.sources.length > 20 ? '...' : ''} |\n`;
  });

  return md;
}

evaluateRag().catch(console.error);
