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