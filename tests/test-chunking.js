import { loadCorpus, chunkWithOverlap } from "../scripts/create-index.js";

console.log(
  chunkWithOverlap('', 400, 50)
);

console.log(
  chunkWithOverlap(
    'bonjour tout le monde',
    400,
    50
  )
);

console.log(
    chunkWithOverlap(
        'test',
        400,
        400
    )
);