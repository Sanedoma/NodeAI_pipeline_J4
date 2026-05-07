import { ragQueryLangChain } from "../rag-pipeline-langchain.js";

async function test() {
  const result = await ragQueryLangChain("Comment gérer les erreurs dans un stream ?");

  console.log('\n===== REPONSE =====\n');
  console.log(result.answer);
  console.log('\n===== SOURCES =====\n');
  console.log(result.sources);
  console.log('\n===== METRICS =====\n');
  console.log(result.metrics);
}

test().catch(console.error);