# Evaluation RAG Pipeline

## Baseline

# | Question | Top-1 Score | Avg Top-3 | Tokens (in/out) | Cost ($) | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 11 / 747 | $0.000758 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 12 / 13 | $0.000025 | 5 | 5 | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 7 / 13 | $0.000020 | 3 | 5 | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 7 / 13 | $0.000020 | 3 | 5 | 
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 8 / 13 | $0.000021 | 3 | 5 | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 7 / 760 | $0.000767 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 7 / 13 | $0.000020 | 3 | 5 | 
8 | Comment utiliser un modèle ? | 0.764 | 0.751 | 7 / 553 | $0.000560 | 3 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 10 / 13 | $0.000023 | 3 | 5 | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.698 | 0.687 | 12 / 13 | $0.000025 | 3 | 5 | 

## Variante — topK=1

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.800 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.776 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.721 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.759 | 5 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.744 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.708 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | 0.764 | 0.764 | 5 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.716 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.699 | 3 | À vérifier | 

## Variante — topK=5

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | 0.764 | 0.751 | 3 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 

## Variante — topK=10

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | 0.764 | 0.751 | 3 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 

## Variante — threshold=0.3

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.759 | 0.752 | 3 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | 0.764 | 0.751 | 3 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 

## Variante — threshold=0.5

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | 0.695 | 0.695 | 3 | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.760 | 0.752 | 3 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.696 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | 0.764 | 0.751 | 3 | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.716 | 0.713 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | 0.699 | 0.687 | 3 | À vérifier | 

## Variante — threshold=0.7

# | Question | Top-1 Score | Avg Top-3 | Pertinence | Fidélité | Notes
--- | --- | --- | --- | --- | --- | ---
1 | Comment définir un outil dans Pydantic AI ? | 0.800 | 0.795 | 5 | À vérifier | 
2 | Quelle est la différence entre Agent et RunContext ? | 0.776 | 0.773 | 5 | À vérifier | 
3 | Comment streamer une réponse ? | 0.721 | 0.720 | 3 | À vérifier | 
4 | Comment gérer les erreurs ? | Aucun | Aucun | Non trouvé | À vérifier | 
5 | Comment fonctionne le dependency injection ? | 0.760 | 0.752 | 3 | À vérifier | 
6 | Comment utiliser les retries ? | 0.744 | 0.740 | 3 | À vérifier | 
7 | Comment fonctionne le contexte ? | 0.708 | 0.708 | 3 | À vérifier | 
8 | Comment utiliser un modèle ? | Aucun | Aucun | Non trouvé | À vérifier | 
9 | Quelle est la capitale du Pérou ? | 0.715 | 0.713 | 3 | À vérifier | 
10 | Qui a gagné la coupe du monde 2018 ? | Aucun | Aucun | Non trouvé | À vérifier | 
