# Quiz Dynamique

Un quiz interactif en HTML/CSS/JS permettant :
- Un **timer** par question,
- Un **feedback** rouge/vert immédiat,
- Une **barre de progression** (question X/Y),
- Une **sauvegarde du meilleur score** en localStorage.

## Fonctionnalités

1. Chronomètre par question (10s, 5s…).
2. Feedback visuel (vert/rouge).
3. Indicateur de progression.
4. Meilleur score stocké localement.

## Installation

1. Cloner ce dépôt :
`git clone https://github.com/votre-nom/quiz-dynamique.git`

2. Ouvrir `index.html` dans un navigateur.

## Utilisation

- **Démarrage** : Un bouton “Commencer le quiz” lance la première question.
- **Réponse** : Un clic sur une proposition déclenche le feedback.
- **Temps** : Si le chrono arrive à zéro, on bloque la question.
- **Score final** : Indiqué en fin de quiz, compare avec le meilleur score.

## Améliorations possibles

- Mélanger l’ordre des questions.
- Récapitulatif des erreurs.
- Mode multi-thème.
- Etc.

## Workflow Git

- **main** : version stable.
- **develop** : pour intégrer les nouvelles features.
- **feature/…** : chaque fonctionnalité.

## Auteurs

Ce projet sert d’exemple pédagogique pour comprendre la structure d’une application web simple, sa documentation et son organisation agile (backlog, user stories) et Gitflow.
