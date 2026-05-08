import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';

function parseArgs(argv) {
  const args = {
    ref: 'HEAD',
    backupPrefix: 'backup/pre-author-rewrite',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    switch (current) {
      case '--shas-file':
        args.shasFile = argv[++index];
        break;
      case '--author-name':
        args.authorName = argv[++index];
        break;
      case '--author-email':
        args.authorEmail = argv[++index];
        break;
      case '--committer-name':
        args.committerName = argv[++index];
        break;
      case '--committer-email':
        args.committerEmail = argv[++index];
        break;
      case '--ref':
        args.ref = argv[++index];
        break;
      case '--backup-prefix':
        args.backupPrefix = argv[++index];
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        throw new Error(`Argument inconnu: ${current}`);
    }
  }

  return args;
}

function runGit(args, options = {}) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    throw new Error([stderr, stdout].filter(Boolean).join('\n'));
  }

  return typeof result.stdout === 'string' ? result.stdout.trim() : '';
}

function shellDoubleQuote(value) {
  return `"${String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')}"`;
}

function readTargetShas(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const shas = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (shas.length === 0) {
    throw new Error(`Aucun SHA trouvé dans ${filePath}`);
  }

  const invalid = shas.filter(sha => !/^[0-9a-fA-F]{7,40}$/.test(sha));
  if (invalid.length > 0) {
    throw new Error(`SHA invalide(s) dans ${filePath}: ${invalid.join(', ')}`);
  }

  return [...new Set(shas.map(sha => sha.toLowerCase()))];
}

function printUsage() {
  console.log(`
Usage:
  node scripts/reassign-commit-authors.js --shas-file .\\target-shas.txt --author-name "OmarK932" --author-email "omar@example.com" --ref main

Options:
  --shas-file        Fichier texte contenant un SHA par ligne, uniquement les commits à corriger
  --author-name      Nouveau nom d'auteur
  --author-email     Nouvel email d'auteur
  --committer-name   Nouveau nom de committer (par défaut: --author-name)
  --committer-email  Nouvel email de committer (par défaut: --author-email)
  --ref              Référence à réécrire, par défaut HEAD
  --backup-prefix    Préfixe de la branche de sauvegarde locale
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const missing = ['shasFile', 'authorName'].filter(key => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Arguments manquants: ${missing.join(', ')}`);
  }

  if (!args.committerName) {
    args.committerName = args.authorName;
  }

  if (!args.committerEmail) {
    args.committerEmail = args.authorEmail;
  }

  // Si l'email de l'auteur n'a pas été fourni via les arguments, demander en interactif
  if (!args.authorEmail) {
    const provided = await new Promise(resolve => {
      process.stdout.write("Aucun --author-email fourni. Saisir l'email de l'auteur (laisser vide pour utiliser 'omar@example.com') : ");
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', data => resolve(String(data).trim()));
    });

    args.authorEmail = provided || 'omar@example.com';
    console.log(`Email auteur utilisé : ${args.authorEmail}`);

    if (!args.committerEmail) {
      args.committerEmail = args.authorEmail;
    }
  }

  const repoRoot = runGit(['rev-parse', '--show-toplevel']);
  const targetShas = readTargetShas(args.shasFile);
  const targetSet = new Set(targetShas);

  const backupRef = `${args.backupPrefix}-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  console.log(`Dépôt: ${repoRoot}`);
  console.log(`Référence cible: ${args.ref}`);
  console.log(`Commits ciblés: ${targetShas.length}`);
  console.log(`Sauvegarde locale: ${backupRef}`);
  console.log('SHA ciblés:');
  targetShas.forEach(sha => console.log(`  - ${sha}`));

  const confirmation = await new Promise(resolve => {
    process.stdout.write('Continuer avec la réécriture de l\'historique ? (yes/no) ');
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', data => resolve(String(data).trim().toLowerCase()));
  });

  if (confirmation !== 'yes' && confirmation !== 'y') {
    console.log('Annulé.');
    return;
  }

  runGit(['branch', backupRef, args.ref]);

  const envFilter = [
    'case "$GIT_COMMIT" in',
    `  ${[...targetSet].join('|')})`,
    `    export GIT_AUTHOR_NAME=${shellDoubleQuote(args.authorName)}`,
    `    export GIT_AUTHOR_EMAIL=${shellDoubleQuote(args.authorEmail)}`,
    `    export GIT_COMMITTER_NAME=${shellDoubleQuote(args.committerName)}`,
    `    export GIT_COMMITTER_EMAIL=${shellDoubleQuote(args.committerEmail)}`,
    '    ;;',
    'esac',
  ].join('\n');

  console.log('Réécriture en cours...');
  runGit(['filter-branch', '--force', '--env-filter', envFilter, '--', args.ref], {
    stdio: 'inherit',
  });

  console.log('\nTerminé.');
  console.log(`Sauvegarde: git branch --list "${backupRef}"`);
  console.log('Si le dépôt est distant, il faudra pousser avec force après validation locale.');
}

main().catch(err => {
  console.error(err?.message || err);
  process.exitCode = 1;
});