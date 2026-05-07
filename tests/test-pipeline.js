import {
  retrieveContext,
  generateCompletion,
  ragQuery
} from "../rag-pipline.js";

const QUESTION_OK = 'Comment définir un outil dans Pydantic AI ?';
const QUESTION_KO = 'Quelle est la capitale du Pérou ?';

async function runRetrieve() {
  const context = await retrieveContext(QUESTION_OK);
  console.log('[retrieveContext]');
  console.log(context);
  console.log('\n');
}

async function runCompletion() {
  const context = await retrieveContext(QUESTION_OK);
  const answer = await generateCompletion(QUESTION_OK, context);
  console.log('[generateCompletion - question in-domain]');
  console.log(answer);
  console.log('\n');
}

async function runNegative() {
  const wrongContext = await retrieveContext(QUESTION_KO);
  const wrongAnswer = await generateCompletion(QUESTION_KO, wrongContext);
  console.log('[generateCompletion - question out-of-domain]');
  console.log(wrongAnswer);
  console.log('\n');
}

async function runRag() {
  const result = await ragQuery(QUESTION_OK, { verbose: true });
  console.log('[ragQuery.answer]');
  console.log(result.answer);
  console.log('\nSources :');
  result.chunks.forEach((chunk, index) => {
    console.log(
      `- [${index + 1}] ${chunk.source} (${chunk.score.toFixed(2)})`
    );
  });
  console.log('[ragQuery.metrics]');
  console.log(result.metrics);
  console.log('\n');
}

async function test(select = 'all') {
  switch (select) {
    case 'retrieve':
      await runRetrieve();
      break;
    case 'completion':
      await runCompletion();
      break;
    case 'negative':
      await runNegative();
      break;
    case 'rag':
      await runRag();
      break;
    case 'all':
      await runRetrieve();
      await runCompletion();
      await runNegative();
      await runRag();
      break;
    default:
      console.log('Mode inconnu. Utilise: retrieve | completion | negative | rag | all');
      process.exitCode = 1;
  }
}

const mode = process.argv[2] || 'all';

test(mode).catch(err => {
  console.error(err);
  process.exitCode = 1;
});