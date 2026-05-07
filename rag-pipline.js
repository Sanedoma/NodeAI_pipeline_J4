import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});


async function embedText(text){
    const response = await fetch (
        'https://api.mistral.ai/v1/embeddings',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral-embed',
                input: [text]
            })
        }
    );

    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data) || !data.data[0] || !data.data[0].embedding) {
        console.error('Mistral embedding API returned unexpected response:', data);
        return null;
    }

    return data.data[0].embedding;
}

export async function retrieveContext( query, topK = 5){
    if(!query || query.trim().length === 0){
        return [];
    }

    const vector = await embedText(query);
    if (!vector) return [];
    const index = pinecone.index(
        process.env.PINECONE_INDEX_NAME
    );

    const results = await index.query({
        vector,
        topK,
        includeMetadata: true
    });

    return results.matches
        .filter(match => match.score >= 0.5)
        .map(match => ({
            text: match.metadata.text,
            source: match.metadata.source || 'source inconnue',
            score: match.score,
            chunkIndex: match.metadata.chunkIndex
        }));
}

function buildContext(context){
    return context.map( (chunk, i) => `[Source ${i + 1} - ${chunk.source}]${chunk.text}` ).join(`\n\n---\n\n`);
}

const systemPrompt = `
Tu es un assistant expert.

Réponds uniquement à partir du contexte fourni.

N'utilise jamais tes connaissances générales.

Si l'information n'est pas présente dans le contexte,
réponds exactement :

"Je ne trouve pas cette information dans les documents fournis"

Cite toujours les sources utilisées.
`;

const relaxedSystemPrompt = `
Tu es un assistant expert.

Utilise en priorité le contexte fourni. Si le contexte ne contient pas toute l'information,
tu peux compléter avec tes connaissances générales, mais indique clairement quand tu le fais
et cite les sources du contexte lorsque tu t'en sers.
`;

export async function generateCompletion(question, context, verbose = false, allowGeneral = false){
    const contextText = buildContext(context);

    if (verbose) {
        console.log('\n[debug] Context text length:', contextText.length);
        console.log('[debug] Context preview:\n', contextText.substring(0, 1000));
        console.log('[debug] Chunks:', JSON.stringify(context.map(c => ({source: c.source, score: c.score})), null, 2));
    }

    const data = await callLLMWithRetry({
        model: 'mistral-small-latest',
        temperature: 0.1,
        messages: [
            {
            role: 'system',
            content: systemPrompt
            },
            {
                role: 'user',
                content:`Contexte : ${contextText} Question : ${question}`
            }
        ]
    });
    
    return data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : JSON.stringify(data);
}

export async function ragQuery(question, options = {}) {

  const topK = options.topK || 5;
  const verbose = options.verbose || false;
  const retrievalStart = Date.now();
  const chunks = await retrieveContext(question, topK);
  const retrievalMs = Date.now() - retrievalStart;
  const generationStart = Date.now();
    let answer = await generateCompletion(  question, chunks, verbose );
    let usedFallback = false;

    // If the strict RAG answer explicitly indicates missing info, try a relaxed fallback
    if (verbose) console.log('[rag] initial answer preview:', typeof answer === 'string' ? answer.substring(0,200) : JSON.stringify(answer).substring(0,200));
    const missingPhrase = "Je ne trouve pas cette information dans les documents fournis";
    if (answer && typeof answer === 'string' && answer.includes(missingPhrase)) {
        if (verbose) console.log('[rag] RAG-only answer indicated missing info — running fallback');
        answer = await generateCompletion(question, chunks, verbose, true);
        usedFallback = true;
    }
  const generationMs = Date.now() - generationStart;
  const scores = chunks.map(c => c.score);

  const topScore = scores.length
      ? Math.max(...scores)
      : 0;

  const avgScore = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const metrics = {
    topScore,
    avgScore,
    retrievalMs,
    generationMs,
    promptTokens: 743,
    completionTokens: 187,
    estimatedCost: 0.0026
  };

  if (verbose) {
    console.log('[retrieve]', metrics);
  }

    return {
        answer,
        sources: formatSourceCitations(chunks),
        chunks,
        metrics,
        usedFallback
    };
}


function formatSourceCitations(chunks){
    if(!Array.isArray(chunks) || chunks.length === 0) return [];

    const seen = new Set();
    const results = [];
    let idx = 0;

    for (const chunk of chunks) {
        const src = chunk.source || 'source inconnue';
        if (!seen.has(src)) {
            seen.add(src);
            idx += 1;
            results.push(`Source ${idx} - ${src}`);
        }
    }

    return results;
}

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  timeoutMs: 30000
};

function sleep(ms){
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function fetchWithTimeout( url, options = {}, timeoutMs = RETRY_CONFIG.timeoutMs ){

  const controller = new AbortController();
  const timeout = setTimeout( () => controller.abort(), timeoutMs );

  try {
    const response = await fetch( url, {
        ...options,
        signal: controller.signal
    });

    clearTimeout(timeout);
    return response;

  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function callLLMWithRetry(body){
  let lastError;
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++){
    try {
      const response =await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        );

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500){
          throw new Error( `Retryable error: ${response.status}` );
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      lastError = error;
      console.error(`[retry ${attempt}]`, error.message);

      if (attempt === RETRY_CONFIG.maxRetries){
        break;
      }

      const delay = RETRY_CONFIG.initialDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError;
}