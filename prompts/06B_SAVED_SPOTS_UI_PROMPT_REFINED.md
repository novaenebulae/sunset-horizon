# Prompt Cursor — 06B — Interface des spots sauvegardés

## Contexte

La couche `localStorage` des spots a été créée à l'étape 06A. Cette étape ajoute l'interface utilisateur permettant d'enregistrer, lister, charger et supprimer des spots d'observation.

Ne pas accéder directement à `localStorage` depuis les composants React : utiliser uniquement l'API `spotStorage` ou un hook qui l'encapsule.

## À lire avant modification

- `AGENTS.md`
- `README.md`
- `docs/01_FUNCTIONAL_SPEC.md`
- `docs/02_ARCHITECTURE.md`
- `docs/05_UX_UI.md`
- `docs/06_DESIGN_SYSTEM.md`
- `prompts/06A_LOCAL_STORAGE_LAYER_PROMPT_REFINED.md`
- `src/features/spots/`
- `src/features/location/`
- `src/features/results/`

## Objectif

Ajouter une UI simple et fiable pour gérer les spots sauvegardés localement.

## Architecture attendue

Créer ou compléter :

```txt
src/features/spots/
  SavedSpotForm.tsx
  SavedSpotList.tsx
  SavedSpotCard.tsx
  useSavedSpots.ts
```

Optionnel si utile :

```txt
src/features/spots/SaveCurrentSpotButton.tsx
```

## Fonctionnalités attendues

### A — Enregistrer le spot courant

- Afficher un bouton `Enregistrer ce spot` quand une position observateur existe.
- Ouvrir un formulaire simple ou afficher un champ inline.
- Permettre de saisir un nom.
- Proposer un nom par défaut si possible, par exemple :
  - adresse sélectionnée ;
  - `Spot 48.6431, 6.1899` ;
  - date locale.
- Sauvegarder :
  - latitude ;
  - longitude ;
  - altitude observateur si disponible ;
  - dernier résultat calculé si disponible.

### B — Liste des spots

Afficher pour chaque spot :

- nom ;
- latitude / longitude arrondies ;
- altitude si disponible ;
- dernière date de calcul si disponible ;
- décalage du dernier résultat si disponible ;
- actions `Charger` et `Supprimer`.

### C — Charger un spot

Au clic sur `Charger` :

- mettre à jour la position observateur ;
- recentrer la carte si le composant carte expose cette capacité ;
- relancer le calcul si le flux actuel le permet ;
- sinon afficher clairement l'action `Recalculer`.

### D — Supprimer un spot

- Supprimer le spot de la couche storage.
- Mettre à jour l'UI immédiatement.
- Ajouter une confirmation simple si l'action est trop proche d'autres boutons.

### E — États UI

Gérer :

- aucun spot sauvegardé ;
- spot sauvegardé avec succès ;
- erreur de sauvegarde ;
- erreur de suppression ;
- localStorage indisponible ;
- position courante absente.

## Hook recommandé

Créer un hook `useSavedSpots` qui encapsule :

```ts
spots
error
saveCurrentSpot(...)
loadSpots()
updateSpot(...)
deleteSpot(...)
refreshSpots()
```

Le hook peut utiliser `useState` / `useEffect`, mais la logique de persistance doit rester dans `spotStorage.ts`.

## Intégration UI

- Intégrer les spots dans le layout existant sans casser le mobile-first.
- Sur mobile : section repliée ou placée après les résultats.
- Sur desktop : section dans la colonne latérale avec résultats / contrôles.
- Respecter le design sombre existant.
- Utiliser les composants existants si disponibles : card, button, input, badge, warning.

## Contraintes

- Pas de Supabase.
- Pas d'authentification.
- Pas de backend.
- Pas d'IndexedDB.
- Ne pas dupliquer la logique localStorage.
- Ne pas modifier le moteur de calcul sauf si nécessaire pour récupérer le résultat courant.
- Garder les composants typés.
- Accessibilité minimale : labels, boutons explicites, focus visible.

## Critères d'acceptation

- Je peux enregistrer le point courant avec un nom.
- Je peux voir la liste des spots sauvegardés.
- Je peux charger un spot et replacer l'observateur.
- Je peux supprimer un spot.
- Les spots persistent après rechargement de page.
- L'UI fonctionne sur mobile et desktop.
- Aucune interaction directe avec `localStorage` depuis les composants.
- `npm run build` passe.
- `npm run test` passe si disponible.

## Avant de coder

1. Vérifie que l'étape 06A est bien présente.
2. Identifie où la position observateur et le résultat courant sont stockés.
3. Identifie le meilleur emplacement UI pour la section spots.
4. Propose un plan court.
5. Liste les fichiers créés ou modifiés.
6. Attends validation si le workflow du projet le demande.

## Après implémentation

- Résume les composants créés.
- Explique brièvement le flux `enregistrer → lister → charger → supprimer`.
- Indique les tests manuels effectués.
- Indique les commandes lancées.
- Fais une revue de code mentale : état vide, erreurs, rechargement page, responsive.
