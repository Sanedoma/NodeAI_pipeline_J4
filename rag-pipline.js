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