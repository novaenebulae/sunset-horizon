# Prompt Cursor — 08F V1.5 Export / import JSON local

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

Permettre à l’utilisateur d’exporter et réimporter ses données locales sans compte utilisateur : spots, réglages et historique. Le cache IndexedDB ne doit pas être exporté par défaut.

## Fonctionnalités attendues

### 1. Format d’export

Créer :

```ts
export type SunsetHorizonExport = {
  schemaVersion: 1
  exportedAt: string
  appName: 'Sunset Horizon'
  data: {
    spots: SavedSpot[]
    calculationSettings: CalculationSettings
    calculationHistory: CalculationHistoryEntry[]
  }
}
```

### 2. Export

Ajouter bouton `Exporter mes données`, produisant `sunset-horizon-export-YYYY-MM-DD.json`.

### 3. Import

Ajouter sélection d’un fichier `.json`, parsing robuste, validation, résumé avant import.

### 4. Fusion/remplacement

Prévoir au minimum une fusion. Si remplacement, demander confirmation. En cas de conflit : même id + `updatedAt` plus récent => remplacer ; plus ancien => conserver local.

### 5. Validation stricte

Valider version, structure, coordonnées, dates, noms, réglages, historiques.

### 6. Cache

Ne pas exporter IndexedDB. Ajouter une note : “Le cache terrain n’est pas exporté. Il sera reconstruit automatiquement.”

## Architecture attendue

Créer :

```txt
src/features/importExport/
  exportTypes.ts
  exportData.ts
  importData.ts
  importExportValidation.ts
  ImportExportPanel.tsx
  importExport.test.ts
```

## Contraintes spécifiques

- Pas de cloud.
- Pas de backend.
- Pas de dépendance lourde.
- Ne pas importer silencieusement des données invalides.
- Ne pas supprimer les données locales sans confirmation.
- Garder l’UI simple.

## Tests attendus

Ajouter des tests pour : export valide, import valide, JSON invalide, version inconnue, spot invalide, réglage invalide, historique invalide, conflit d’id, fusion simple.

## Validation manuelle

1. Créer spots/réglages/historiques.
2. Exporter JSON.
3. Vérifier lisibilité.
4. Modifier/supprimer localement.
5. Réimporter.
6. Vérifier restauration.
7. Importer un fichier invalide.

## Commandes finales

```bash
npm test
npm run build
```
