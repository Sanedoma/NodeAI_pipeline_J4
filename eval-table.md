# Evaluation RAG Pipeline

## Baseline

# | Question | Top-1 Score | Avg Top-3 | Tokens (in/out) | Cost ($) | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 11 / 1148 | $0.001159 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 12 / 1599 | $0.001611 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 7 / 1332 | $0.001339 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 7 / 821 | $0.000828 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 8 / 1323 | $0.001331 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 7 / 1458 | $0.001465 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 7 / 324 | $0.000331 | 3 | À vérifier | 3/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 7 / 484 | $0.000491 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 10 / 570 | $0.000580 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 12 / 537 | $0.000549 | 3 | À vérifier | 3/5

## Variante — topK=1

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.800 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.776 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.721 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.759 | 5 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.744 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.708 | 3 | À vérifier | 4/5
8 | Comment utiliser un modèle ? | 0.765 | 0.765 | 5 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.716 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.699 | 3 | À vérifier | 3/5

## Variante — topK=5

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 3/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 3/5

## Variante — topK=10

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 3/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 3/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 3/5

## Variante — threshold=0.3

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 3/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 3/5

## Variante — threshold=0.5

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 3/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 3/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 3/5

## Variante — threshold=0.7

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 4/5
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 4/5
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 4/5
4 | Comment gérer les erreurs ? | Aucun | Aucun | Non trouvé | À vérifier | 0/5
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 4/5
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 4/5
7 | Comment fonctionne le contexte ? | 0.708 | 0.708 | 3 | À vérifier | 4/5
8 | Comment utiliser un modèle ? | 0.765 | 0.751 | 3 | À vérifier | 4/5
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 4/5
10 | Qui a gagné la coupe du monde 2018 ? | Aucun | Aucun | Non trouvé | À vérifier | 0/5
