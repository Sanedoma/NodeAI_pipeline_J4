import readLine from 'readline';
import { ragQuery } from './rag-pipline.js';



const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(promt){
    return new Promise((resolve) => {
        rl.question(promt, resolve);
    });
}

console.log('\n========================================');
console.log(' Mini-Perplexity CLI');
console.log(' Posez vos questions sur le corpus');
console.log(' "code:breaker" ou ctr+C pour quitter');
console.log('========================================\n');

process.on('SIGINT', () => {
    console.log('\n\nFermeture du CLI...');
    rl.close();
    process.exit(0);
})

async function main(){
    while(true){
        try{
            const question = await ask('user>');

            if(!question || question.trim() === ''){
                console.log('\nVeuillez entrer un question valide si vous voulez une réponse.\n');
                continue;
            }

            // Commandes spéciales pour quitter
            const cmd = question.trim().toLowerCase();
            if (cmd === 'code:breaker' || cmd === 'quit') {
                console.log('\nFermeture du programme par commande utilisateur...');
                rl.close();
                process.exit(0);
            }

            if (question.length > 5000) {
                console.log('\nQuestion trop longue (max 5000 caractères).\n');
                continue;
            }

            console.log('\nRecherche en cours...\n');
            const result  =await ragQuery(question, {
                topK: 5,
                verbose: true
            });

            console.log('===============================================');
            console.log('|   REPONSE');
            console.log('===============================================\n');
            console.log(result.answer);

            console.log('\n===============================================');
            console.log('|   SOURCES');
            console.log('===============================================\n');

            if (result.sources.length === 0) {
                console.log('Aucune source trouvée.');
            }else{
                console.log(result.sources);
            }

            console.log('\n===============================================');
            console.log('|   METRICS');
            console.log('===============================================\n');
            console.log(result.metrics);


            console.log('\n');
        }catch (error){
            console.error('\nErreur CLI:', error.message);
        }
    }
}

main();