# Workflow Cursor

## Installation

1. Installer Cursor depuis https://cursor.com/
2. Ouvrir le dossier du projet.
3. Initialiser Git.
4. Créer les règles Cursor dans `.cursor/rules/`.
5. Ouvrir le chat Agent.
6. Donner une tâche courte et vérifiable.

## Méthode de travail recommandée

Ne pas demander “développe toute l'application” en une seule fois.

Utiliser des tâches courtes :

```txt
1 fonctionnalité = 1 prompt = 1 commit
```

Cycle :

```txt
Prompt Cursor
→ inspection du diff
→ npm test
→ npm run build
→ correction
→ commit
```

## Réglage conseillé

Demander à Cursor :

- de lire `docs/` avant de coder ;
- de respecter `.cursor/rules/sunset-horizon.mdc` ;
- de créer des tests pour les fonctions mathématiques ;
- de ne pas inventer d'API IGN si la signature n'est pas confirmée ;
- d'isoler les appels réseau dans un client dédié.

## Prompts courts plutôt que longs

Mauvais prompt :

```txt
Code toute l'app.
```

Bon prompt :

```txt
Implémente uniquement le module geo avec les fonctions distance, destinationPoint et bearing. Ajoute les tests unitaires Vitest. Ne modifie pas l'UI.
```

## Validation obligatoire

Après chaque étape, demander :

```txt
Lance mentalement une revue de code : erreurs possibles, types manquants, edge cases, tests manquants. Corrige uniquement les problèmes nécessaires.
```
