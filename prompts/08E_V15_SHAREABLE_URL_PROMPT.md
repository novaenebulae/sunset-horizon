# Prompt Cursor — 08E V1.5 URL partageable sans backend

Nouveau prompt V1.5.

Lis avant de modifier le code :

- AGENTS.md
- README.md
- docs/01_FUNCTIONAL_SPEC.md
- docs/02_ARCHITECTURE.md
- docs/03_ALGORITHM.md
- docs/04_DATA_SOURCES.md
- docs/05_UX_UI.md
- docs/06_DESIGN_SYSTEM.md
- docs/07_ROADMAP.md
- docs/08_TEST_PLAN.md
- docs/09_CURSOR_WORKFLOW.md

Règles générales :

- Ne pas ajouter de backend.
- Ne pas ajouter Supabase.
- Ne pas ajouter d’authentification.
- Ne pas ajouter de synchronisation cloud.
- Préserver le fonctionnement complet du MVP existant.
- Garder une architecture par feature.
- Garder les tests proches des fichiers testés.
- Ne pas déplacer les fichiers existants sauf nécessité justifiée.
- Ne pas dupliquer la logique métier existante.
- Ne pas faire de calcul lourd directement dans les composants React.
- Utiliser TypeScript strictement.
- Garder l’UI mobile-first, puis responsive desktop.
- Avant de coder : analyser l’existant, proposer un plan court, lister les fichiers créés/modifiés, attendre validation.
- Après implémentation : lancer `npm test` si disponible, lancer `npm run build`, résumer les modifications et les risques restants.


## Objectif

Permettre de partager ou rouvrir une configuration de calcul via l’URL, sans backend et sans compte utilisateur.

## Fonctionnalités attendues

### 1. Paramètres supportés

Supporter : `lat`, `lon`, `date`, `mode`. Optionnel : `refraction`, `maxDistanceM`, `sampleStepM`.

Ne pas inclure par défaut : nom privé du spot, historique, données cache, adresse personnelle.

### 2. Sérialisation

Créer :

```ts
buildShareableUrl(input: ShareableCalculationState): string
```

### 3. Parsing

Créer :

```ts
parseShareableUrl(searchParams: URLSearchParams): ParsedShareableState
```

Valider coordonnées, date et mode. Ignorer paramètres invalides ou inconnus.

### 4. Application au chargement

Si l’URL est valide : initialiser position, date, réglages concernés, puis afficher un message discret.

### 5. Bouton copier

Ajouter `Copier le lien`, avec succès/erreur Clipboard API.

### 6. Confidentialité

Indiquer que le lien contient uniquement coordonnées, date et réglages essentiels.

## Architecture attendue

Créer :

```txt
src/features/share/
  shareTypes.ts
  shareUrl.ts
  useShareableUrl.ts
  ShareButton.tsx
  shareUrl.test.ts
```

## Contraintes spécifiques

- Pas de raccourcisseur d’URL.
- Respecter le `base` de Vite / GitHub Pages.
- Ne pas exposer de données privées inutiles.
- Ne pas rendre le chargement initial fragile.
- Ne pas lancer de calcul lourd automatiquement si l’app fonctionne par bouton “Recalculer”.

## Tests attendus

Ajouter des tests pour : URL complète valide, paramètres manquants, latitude invalide, longitude invalide, date invalide, mode inconnu, paramètres inconnus ignorés, sérialisation puis parsing cohérents.

## Validation manuelle

1. Choisir point/date/mode.
2. Copier le lien.
3. Ouvrir dans nouvel onglet.
4. Vérifier position/date/réglages.
5. Modifier un paramètre invalide et vérifier l’absence de crash.
6. Tester sur GitHub Pages si possible.

## Commandes finales

```bash
npm test
npm run build
```
