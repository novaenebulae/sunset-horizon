# Prompt Cursor — 07 — Validation finale MVP et polish

## Contexte

Les modules principaux de Sunset Horizon sont en place :

- sélection GPS ;
- sélection manuelle sur carte ;
- recherche d'adresse ;
- calcul solaire ;
- client IGN ;
- moteur horizon ;
- carte ;
- profil altimétrique ;
- spots sauvegardés localement.

Cette étape ne doit pas ajouter de grosse fonctionnalité. Elle doit stabiliser le MVP, vérifier le parcours utilisateur complet, corriger les derniers problèmes UX/responsive et préparer le projet pour une validation terrain.

## À lire avant modification

- `AGENTS.md`
- `README.md`
- `docs/00_PROJECT_BRIEF.md`
- `docs/01_FUNCTIONAL_SPEC.md`
- `docs/02_ARCHITECTURE.md`
- `docs/03_ALGORITHM.md`
- `docs/04_DATA_SOURCES.md`
- `docs/05_UX_UI.md`
- `docs/06_DESIGN_SYSTEM.md`
- `docs/08_TEST_PLAN.md`
- `MVP_BACKLOG_REFINED.md`

## Objectif

Auditer et finaliser l'application MVP.

## Parcours utilisateur à vérifier

### Parcours 1 — GPS

1. Cliquer sur `Me localiser`.
2. Vérifier coordonnées et précision.
3. Lancer ou vérifier le calcul.
4. Lire l'heure officielle.
5. Lire l'heure corrigée.
6. Voir le point bloquant.
7. Voir le profil altimétrique.
8. Sauvegarder le spot.

### Parcours 2 — adresse

1. Chercher une adresse.
2. Sélectionner un résultat.
3. Vérifier le déplacement du marqueur.
4. Vérifier le recalcul.
5. Sauvegarder le spot.

### Parcours 3 — carte

1. Cliquer sur la carte.
2. Vérifier le déplacement du marqueur.
3. Vérifier le recalcul.
4. Vérifier carte + profil + résultats.

### Parcours 4 — spots sauvegardés

1. Créer un spot.
2. Recharger la page.
3. Vérifier que le spot existe encore.
4. Charger le spot.
5. Supprimer le spot.

## Audit calcul / cohérence

Vérifier sans réécrire toute la logique :

- L'heure officielle est clairement indiquée comme horizon théorique.
- L'heure corrigée est clairement indiquée comme estimation.
- Le décalage en minutes a le bon signe et une formulation compréhensible.
- L'azimut affiché correspond à la ligne sur la carte.
- Le point bloquant affiché correspond au graphique.
- Le point bloquant est déterminé par l'angle apparent maximal.
- Les résultats `null` sont gérés proprement.
- L'incertitude est visible si disponible.

## Audit responsive

Vérifier :

- mobile étroit ;
- mobile large ;
- tablette ;
- desktop 1366px ;
- desktop large.

Corriger si nécessaire :

- largeur globale bloquée à `512px` ;
- carte trop basse ou trop haute ;
- graphique illisible ;
- boutons trop proches ;
- colonnes desktop mal équilibrées ;
- scroll horizontal involontaire.

## Audit accessibilité minimale

Corriger si nécessaire :

- boutons sans label clair ;
- inputs sans label ;
- focus clavier invisible ;
- message d'erreur non associé à l'action ;
- contraste insuffisant ;
- icônes seules sans texte accessible.

## Audit erreurs

Tester ou simuler :

- GPS refusé ;
- recherche adresse sans résultat ;
- erreur réseau géocodage ;
- erreur IGN ;
- profil vide ;
- point bloquant absent ;
- localStorage indisponible ;
- localStorage corrompu.

## Documentation à mettre à jour

Mettre à jour le README si nécessaire avec :

- objectif du projet ;
- commandes `npm install`, `npm run dev`, `npm run build`, `npm run test` ;
- limites du MVP ;
- sources de données utilisées ;
- explication courte de l'incertitude ;
- rappel : pas de backend, pas de compte utilisateur, données locales.

## Validation terrain

Créer si utile un fichier :

```txt
docs/FIELD_VALIDATION_TEMPLATE.md
```

Contenu attendu :

```txt
Date
Lieu
Coordonnées
Heure officielle affichée
Heure corrigée affichée
Heure observée réelle
Météo
Visibilité
Notes relief
Écart observé
Conclusion
```

## Contraintes

- Ne pas ajouter de backend.
- Ne pas ajouter Supabase.
- Ne pas ajouter d'authentification.
- Ne pas ajouter de fonctionnalité V1.5 ou V2.
- Ne pas remplacer le moteur de calcul.
- Corriger seulement ce qui est nécessaire pour stabiliser le MVP.

## Critères d'acceptation finale

- Le MVP permet de calculer une estimation depuis GPS, carte ou adresse.
- L'application est utilisable sur mobile et desktop.
- Les erreurs courantes sont gérées.
- Les spots locaux fonctionnent.
- Le README est cohérent.
- `npm run build` passe.
- `npm run test` passe si disponible.

## Avant de coder

1. Fais une revue de l'état actuel.
2. Liste les problèmes constatés.
3. Classe-les en : bloquant MVP, important, polish.
4. Propose un plan court.
5. Attends validation si le workflow du projet le demande.

## Après correction

- Résume les problèmes corrigés.
- Liste les fichiers modifiés.
- Indique les commandes lancées.
- Liste les problèmes restants non bloquants.
