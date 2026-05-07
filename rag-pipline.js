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

    return data.data[0].embedding;
}

export async function retrieveContext( query, topK = 5){
    if(!query || query.trim().length === 0){
        return [];
    }

    const vector = await embedText(query);
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

export async function generateCompletion(question, context){
    const contextText = buildContext(context);

    const response = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                temperature: 0.1,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: `Contexte: ${contextText} Question: ${question}`,
                    }
                ]
            })
        }
    );

    const data = await response.json();

    return data.choices[0].message.content;
}

export async function ragQuery(question, options = {}) {

  const topK = options.topK || 5;
  const verbose = options.verbose || false;
  const retrievalStart = Date.now();
  const chunks = await retrieveContext(question, topK);
  const retrievalMs = Date.now() - retrievalStart;
  const generationStart = Date.now();
  const answer = await generateCompletion(  question, chunks );
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
    generationMs
  };

  if (verbose) {
    console.log('[retrieve]', metrics);
  }

  return {
    answer,
    sources: formatSourceCitations,
    chunks,
    metrics
  };
}


function formatSourceCitations(chunks){

    const unique = new Map();

    chunks.forEach((chunk, i) => {
        const source = chunk.source || 'Source inconnue';

        if(!unique.has(source)) {
            unique.set(source, {
                index: index + 1,
                file: source,
                relevance: chunk.score
            });
        }
    });

    return [...unique.values()];
}