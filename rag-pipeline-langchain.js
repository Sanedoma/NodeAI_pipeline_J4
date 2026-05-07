import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { MistralAIEmbeddings, ChatMistralAI } from '@langchain/mistralai';
import { PineconeStore } from '@langchain/pinecone';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

let initialized = false;
let vectorStore, llm;

async function initialize() {
  if (initialized) return;

  console.log('[LangChain RAG] Initialisation...');

  // ======================================================
  // CONFIGURATION PINECONE
  // ======================================================
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const pineconeIndex = pinecone.index(
    process.env.PINECONE_INDEX_NAME
  );

  // ======================================================
  // EMBEDDINGS
  // ======================================================
  const embeddings = new MistralAIEmbeddings({
    model: 'mistral-embed',
    apiKey: process.env.MISTRAL_API_KEY
  });

  // ======================================================
  // VECTOR STORE
  // ======================================================
  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex
  });

  // ======================================================
  // MODELE LLM
  // ======================================================
  llm = new ChatMistralAI({
    model: 'mistral-small-latest',
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.1
  });

  initialized = true;
  console.log('[LangChain RAG] ✅ Initialisation complète');
}

const SYSTEM_PROMPT = `Tu es un assistant expert qui répond uniquement à partir du contexte fourni.

Règles importantes :

- Réponds uniquement avec les informations présentes dans le contexte
- N'utilise pas tes connaissances générales
- Cite toujours les sources sous la forme [Source: nom_du_fichier]
- Si la réponse n'existe pas dans le contexte, réponds exactement :
"Je ne trouve pas cette information dans les documents fournis."`;

// ======================================================
// FONCTION PRINCIPALE
// ======================================================

export async function ragQueryLangChain(question) {
  await initialize();

  const start = Date.now();

  try {
    // ==========================================
    // RETRIEVAL - RECHERCHER LES DOCUMENTS
    // ==========================================
    const retriever = vectorStore.asRetriever({ k: 5 });
    const docs = await retriever.invoke(question);

    // ==========================================
    // FORMAT CONTEXTE
    // ==========================================
    const contextText = docs
      .map((doc, i) => {
        const source = doc.metadata?.source || 'Source inconnue';
        return `[${i + 1}] (${source}):\n${doc.pageContent}`;
      })
      .join('\n\n---\n\n');

    // ==========================================
    // GENERATION - APPELER LE LLM
    // ==========================================
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(
        `Contexte:\n${contextText}\n\nQuestion: ${question}`
      )
    ];

    const response = await llm.invoke(messages);
    const answer = response.content || 'Pas de réponse';

    // ==========================================
    // RECUPERATION DOCUMENTS
    // ==========================================
    const chunks = docs.map((doc, index) => {
      return {
        text: doc.pageContent,
        source: doc.metadata?.source || 'Source inconnue',
        chunkIndex: doc.metadata?.chunkIndex ?? index,
        score: doc.metadata?.score || null
      };
    });

    // ==========================================
    // SOURCES UNIQUES
    // ==========================================
    const uniqueSources = [];
    const seen = new Set();

    for (const chunk of chunks) {
      if (!seen.has(chunk.source)) {
        seen.add(chunk.source);
        uniqueSources.push(chunk.source);
      }
    }

    // ==========================================
    // METRICS
    // ==========================================
    const totalMs = Date.now() - start;

    return {
      answer,
      sources: uniqueSources,
      chunks,
      metrics: {
        totalMs,
        chunksUsed: chunks.length
      }
    };
  } catch (error) {
    console.error('[ragQueryLangChain] Erreur:', error.message);
    return {
      answer: `Erreur: ${error.message}`,
      sources: [],
      chunks: [],
      metrics: {
        error: error.message
      }
    };
  }
}