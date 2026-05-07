import { retrieveContext } from "../rag-pipline.js";

async function test() {

  const results = await retrieveContext(
    'Comment définir un outil dans Pydantic AI ?'
  );

  console.log(results);
}

test();