import { retrieveContext, generateCompletion } from "../rag-pipline.js";

async function test() {

  const context = await retrieveContext(
    'Comment définir un outil dans Pydantic AI ?'
  );

  const answer = await generateCompletion(
    'Comment définir un outil dans Pydantic AI ?',
    context
  );

  console.log(answer + '\n\n\n');

  const wrongContext = await retrieveContext(
    'Quelle est la capitale du Pérou ?'
  );

  const wrongAnswer = await generateCompletion(
    'Quelle est la capitale du Pérou ?',
    context
  );

  console.log(wrongAnswer + '\n\n\n');

  
}

test();