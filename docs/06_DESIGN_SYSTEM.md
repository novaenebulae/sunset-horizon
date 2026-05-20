# Design system

## Identité

```txt
Nom : Sunset Horizon
Style : scientifique, calme, crépusculaire
Priorité : lisibilité mobile
```

## Couleurs

```txt
Background principal : #0B1020
Surface principale : #111827
Surface secondaire : #1F2937
Bordure : #374151
Texte principal : #F9FAFB
Texte secondaire : #9CA3AF
Accent soleil : #F97316
Accent horizon : #38BDF8
Succès : #22C55E
Warning : #FACC15
Erreur : #EF4444
```

## Typographie

```txt
UI : Inter, system-ui
Chiffres : JetBrains Mono, Geist Mono ou ui-monospace
```

## Composants

- `AppShell`
- `MapPanel`
- `LocationControls`
- `DateSelector`
- `ResultCard`
- `MetricTile`
- `HorizonProfileChart`
- `SpotList`
- `SettingsDrawer`
- `AccuracyBadge`
- `WarningBanner`

## Principes

- Ne jamais afficher une heure sans préciser si elle est officielle ou corrigée.
- Afficher la source de données d'altitude.
- Afficher les limites du résultat si précision faible.
- Toujours permettre une correction manuelle de la position.
