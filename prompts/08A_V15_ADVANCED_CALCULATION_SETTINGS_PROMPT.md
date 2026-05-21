# Prompt Cursor — 08A V1.5 Réglages avancés de calcul

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

Ajouter une couche de réglages avancés permettant à l’utilisateur d’ajuster la précision, la performance et le comportement du calcul coucher / relief. Cette étape doit précéder cache, comparaison, URL partageable et horizon 360, car ces fonctionnalités doivent utiliser les mêmes paramètres.

## Fonctionnalités attendues

### 1. Modèle de réglages

Créer un modèle typé :

```ts
export type PrecisionMode = 'fast' | 'balanced' | 'precise'

export type CalculationSettings = {
  precisionMode: PrecisionMode
  maxDistanceM: number
  sampleStepM: number
  timeStepSeconds: number
  refinementStepSeconds: number
  refractionEnabled: boolean
}
```

### 2. Presets

Créer trois presets :

- `fast` : calcul rapide, distance plus courte, pas plus large.
- `balanced` : valeur par défaut proche du MVP actuel.
- `precise` : distance plus longue, pas plus fin, calcul plus lent.

Valeurs indicatives :

```ts
fast     = { maxDistanceM: 15000, sampleStepM: 250, timeStepSeconds: 120, refinementStepSeconds: 60, refractionEnabled: true }
balanced = { maxDistanceM: 30000, sampleStepM: 100, timeStepSeconds: 60,  refinementStepSeconds: 30, refractionEnabled: true }
precise  = { maxDistanceM: 80000, sampleStepM: 50,  timeStepSeconds: 30,  refinementStepSeconds: 10, refractionEnabled: true }
```

Adapter ces valeurs si le code actuel utilise déjà des constantes différentes, mais documenter le choix.

### 3. Validation

Créer `validateCalculationSettings(input: unknown): CalculationSettings`.

Contraintes de validation :

- `maxDistanceM` entre 1 000 et 80 000 ;
- `sampleStepM` entre 25 et 1 000 ;
- `timeStepSeconds` entre 10 et 300 ;
- `refinementStepSeconds` entre 5 et 120 ;
- `refinementStepSeconds <= timeStepSeconds` ;
- fallback vers `balanced` si données invalides.

### 4. Persistance locale

Créer une persistance localStorage dédiée, versionnée et robuste.

### 5. UI

Ajouter un panneau repliable de réglages avancés avec :

- sélection rapide / équilibré / précis ;
- indication des valeurs principales ;
- option réfraction ;
- bouton reset ;
- message indiquant que le mode précis peut être plus lent.

### 6. Intégration calcul

Brancher les réglages sur :

- génération du profil terrain ;
- distance maximale ;
- pas d’échantillonnage ;
- recherche temporelle du croisement ;
- réfraction si disponible.

## Architecture attendue

Créer ou compléter :

```txt
src/features/settings/
  calculationSettingsTypes.ts
  defaultCalculationSettings.ts
  calculationSettingsValidation.ts
  calculationSettingsStorage.ts
  useCalculationSettings.ts
  CalculationSettingsPanel.tsx
  calculationSettings.test.ts
```

## Contraintes spécifiques

- Ne pas casser le résultat MVP par défaut.
- Le preset `balanced` doit reproduire au plus proche le comportement actuel du MVP.
- Les réglages doivent être sérialisables pour les futures étapes : cache, historique, comparaison, URL, export/import, diagnostic.
- Éviter les valeurs qui déclenchent trop d’appels IGN.
- Ne pas créer d’état global complexe si un hook local suffit.

## Tests attendus

Ajouter des tests pour :

- récupération du preset `balanced` ;
- validation d’un objet valide ;
- fallback sur données invalides ;
- bornage des distances ;
- bornage des pas ;
- comportement sans localStorage ;
- reset aux valeurs par défaut si testable.

## Validation manuelle

1. Lancer un calcul avec le preset équilibré.
2. Passer en mode rapide et relancer.
3. Passer en mode précis et relancer.
4. Désactiver la réfraction si disponible.
5. Recharger la page et vérifier la persistance.
6. Réinitialiser les réglages.
7. Vérifier que le MVP fonctionne toujours.

## Commandes finales

```bash
npm test
npm run build
```

