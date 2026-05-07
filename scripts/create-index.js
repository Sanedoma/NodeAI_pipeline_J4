import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';


export const CONFIG = {
    chunkSize: 400,
    overlap: 50,
    batchSize: 50,
    embedConcurrency: 5,
    maxEmbedRetries: 5,
    baseRetryDelayMs: 1000
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function chunkWithOverlap(text, chunkSize, overlap) {

    if (!text || text.trim().length === 0) {
        return [];
    }

    if (overlap >= chunkSize) {
        throw new Error(
        'overlap doit être inférieur à chunkSize'
        );
    }

    const words = text.split(' ');

    const chunks = [];

    let i = 0;

    while (i < words.length) {

        const chunk = words
        .slice(i, i + chunkSize)
        .join(' ');

        if (chunk.trim().length > 0) {
        chunks.push(chunk);
        }

        i += chunkSize - overlap;
    }

    return chunks;
}

export function loadCorpus(dir){
    const files = readdirSync(dir)
        .filter(file => 
            file.endsWith('.txt') ||
            file.endsWith('.md')
        );
    
        return files.map(file => ({
            filename: file,
            text: readFileSync( join(dir, file), 'utf-8' )
        }));
}

//********************************************************************************//
//********************Batch embed et indexation Pinecone**************************//
//********************************************************************************//
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

async function embedBatch(texts){
    for (let attempt = 0; attempt <= CONFIG.maxEmbedRetries; attempt++) {
      const response = await fetch(
        'https://api.mistral.ai/v1/embeddings',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mistral-embed',
            input: texts
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (!Array.isArray(data.data)) {
          throw new Error(
            `Réponse embeddings invalide: ${JSON.stringify(data)}`
          );
        }

        return data.data.map(item => item.embedding);
      }

      if (response.status === 429 && attempt < CONFIG.maxEmbedRetries) {
        const delayMs = CONFIG.baseRetryDelayMs * (2 ** attempt);
        console.warn(
          `Rate limit Mistral, tentative ${attempt + 1}/${CONFIG.maxEmbedRetries}. Retry dans ${delayMs} ms...`
        );
        await sleep(delayMs);
        continue;
      }

      throw new Error(
        `Erreur API Mistral (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return null;

}

export async function embedAndIndex(chunks) {

  const index = pinecone.index(
    process.env.PINECONE_INDEX_NAME
  );

  const vectors = [];

  for (
    let i = 0;
    i < chunks.length;
    i += CONFIG.embedConcurrency
  ) {

    const batch = chunks.slice(
      i,
      i + CONFIG.embedConcurrency
    );

    const embeddings = await embedBatch(
      batch.map(chunk => chunk.text)
    );

    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      console.warn(`Aucun embedding retourné pour le batch à l'index ${i}. Skip.`);
      continue;
    }

    embeddings.forEach((embedding, idx) => {
      if (!embedding) {
        console.warn(`Embedding manquant pour chunk idx ${i + idx}, skip.`);
        return;
      }

      const chunk = batch[idx];

      vectors.push({
        id: `${chunk.filename}-chunk-${chunk.chunkIndex}`,
        values: embedding,
        metadata: {
          text: chunk.text,
          source: chunk.filename,
          chunkIndex: chunk.chunkIndex
        }
      });
    });
  }

  for (
    let i = 0;
    i < vectors.length;
    i += CONFIG.batchSize
  ) {

    const batch = vectors.slice(
      i,
      i + CONFIG.batchSize
    );

    if (batch.length === 0) {
      console.warn(`Skip upsert vide à l'index ${i}`);
      continue;
    }

    await index.upsert({ records: batch });

    console.log(
      `Upsert ${i + batch.length}/${vectors.length}`
    );
  }

  console.log(
    `Indexation terminée : ${vectors.length} vecteurs`
  );
}

async function main() {

  const corpus = loadCorpus('./corpus');

  let allChunks = [];

  corpus.forEach(file => {

    const chunks = chunkWithOverlap(
      file.text,
      CONFIG.chunkSize,
      CONFIG.overlap
    );

    const formatted = chunks.map(
      (chunk, index) => ({
        text: chunk,
        filename: file.filename,
        chunkIndex: index
      })
    );

    allChunks.push(...formatted);
  });

  console.log(
    `${allChunks.length} chunks créés`
  );

  await embedAndIndex(allChunks);
}

main().catch(console.error);