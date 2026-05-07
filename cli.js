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

// Couleurs ANSI simples
const C = {
    reset: '\u001b[0m',
    bright: '\u001b[1m',
    dim: '\u001b[2m',
    fg: {
        red: '\u001b[31m',
        green: '\u001b[32m',
        yellow: '\u001b[33m',
        blue: '\u001b[34m',
        magenta: '\u001b[35m',
        cyan: '\u001b[36m',
        white: '\u001b[37m'
    }
};

function separator(title) {
    console.log(C.fg.cyan + '===============================================' + C.reset);
    console.log(C.bright + C.fg.white + `|   ${title}` + C.reset);
    console.log(C.fg.cyan + '===============================================\n' + C.reset);
}

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

            // Commandes spéciales pour quitter et aide
            const cmd = question.trim().toLowerCase();
            if (['code:breaker', 'quit', 'exit', 'q', 'bye'].includes(cmd)) {
                console.log('\nFermeture du programme par commande utilisateur...');
                rl.close();
                process.exit(0);
            }

            if (cmd === 'help' || cmd === 'h' || cmd === '?') {
                console.log('\nCommandes disponibles:');
                console.log('  - code:breaker / exit / quit / q / bye : quitter');
                console.log('  - help : afficher cette aide');
                console.log('  - tapez votre question et appuyez sur Entrée');
                continue;
            }

            if (question.length > 5000) {
                console.log('\nQuestion trop longue (max 5000 caractères).\n');
                continue;
            }

            console.log('\n' + C.fg.yellow + 'Recherche en cours...' + C.reset + '\n');
            const result  =await ragQuery(question, {
                topK: 5,
                verbose: true
            });

            separator('REPONSE');
            console.log(C.fg.cyan + result.answer + C.reset);

            separator('SOURCES');
            if (!result.sources || result.sources.length === 0) {
                console.log(C.fg.dim + 'Aucune source trouvée.' + C.reset);
            } else {
                result.sources.forEach((s, i) => {
                    console.log(`${C.fg.yellow}- [${i + 1}] ${s}${C.reset}`);
                });
            }

            separator('METRICS');
            console.log(C.fg.magenta, result.metrics, C.reset);


            console.log('\n');
        }catch (error){
            console.error('\nErreur CLI:', error.message);
        }
    }
}

main();