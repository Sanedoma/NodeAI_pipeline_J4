# NodeAI_pipeline_J4

Un pipeline RAG (Retrieval-Augmented Generation) léger pour expérimenter l'indexation, la récupération et la génération avec Mistral + Pinecone. Ce repo contient des scripts d'indexation, des variantes LangChain, des tests et des outils d'audit pour mesurer la qualité de la récupération.

**Quick Overview**
- **But :** construire, évaluer et auditer un pipeline RAG en séparant nettement la récupération (retrieval) et la génération (generation).
- **Langages :** JavaScript (Node.js)
- **Principaux fournisseurs :** Mistral (embeddings & chat), Pinecone (vector DB)

**Prérequis**
- Node.js moderne (testé localement avec Node v25+)
- Variables d'environnement configurées :
  - `PINECONE_API_KEY` — clé Pinecone
  - `PINECONE_INDEX_NAME` — nom de l'index Pinecone
  - `MISTRAL_API_KEY` — clé Mistral
- Installer les dépendances :

```bash
npm install
```

**Commandes utiles**
- Créer / indexer le corpus (chunk + embed + upsert) :

```bash
node scripts/create-index.js
```

- Lancer le pipeline RAG (script interactif CLI) :

```bash
node cli.js
```

- Exécuter le test harness principal :

```bash
node tests/test-pipeline.js
```

- Tester la variante LangChain :

```bash
node tests/test-langchain.js
```

- Générer un fichier d'évaluation basique :

```bash
node scripts/eval-rag.js
```

- Lancer l'audit automatisé de récupération (Phase 11) — génère `eval-table.md` :

```bash
node scripts/audit-retrieval.js
```

**Fichiers importants**
- `scripts/create-index.js` — chunking, embedding et upsert vers Pinecone.
- `rag-pipline.js` — pipeline RAG principal (retrieve + generate + métriques).
- `rag-pipeline-langchain.js` — variante basée sur LangChain.
- `scripts/audit-retrieval.js` — script d'audit & comparaison des variantes (topK / threshold).
- `scripts/eval-rag.js` — génération d'un tableau d'évaluation simple.
- `tests/` — scripts de test et d'intégration rapide.

**Notes opérationnelles & recommandations**
- Les appels embedding peuvent subir des limites de débit (429). Le code inclut des protections basiques ; si vous indexez un grand corpus, cadencez les requêtes ou ajoutez un backoff adapté.
- Valeurs recommandées (empiriques) : `topK=5`, seuil de similarité autour de `0.5` — affiner selon vos besoins et la granularité des chunks.
- `eval-table.md` est écrit à la racine lorsque vous lancez `scripts/audit-retrieval.js`.

**Comment contribuer / prochaines étapes**
- Ajouter des tests unitaires ciblés pour la fonction d'embed et la normalisation des metadata.
- Compléter l'audit avec annotations humaines (fidé­lité / pertinence) et un rapport synthétique des régressions.
- Optionnel : brancher un runner CI pour exécuter les tests et l'audit sur push.

**Licence**
- Code fourni tel quel — ajoutez une licence si vous souhaitez en publier.

---

Si vous voulez que j'ajoute une section « Exemples de commandes » plus détaillée, ou que je crée un petit script `make` / `npm` pour automatiser l'indexation + audit, je peux le faire.