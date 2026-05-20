# Sunset Horizon

Application web statique permettant d'estimer l'heure réelle à laquelle le soleil disparaît derrière le relief visible depuis un point d'observation.

## Objectif

Les heures classiques de coucher de soleil sont calculées pour un horizon théorique. Sunset Horizon remplace cet horizon théorique par un horizon effectif calculé à partir du relief IGN/Géoplateforme.

L'application doit répondre rapidement à trois questions :

1. À quelle heure le soleil disparaît-il réellement depuis ce point ?
2. Quel relief masque le soleil ?
3. Dans quelle direction regarder et quel est le niveau d'incertitude ?

## Décisions validées

- Application statique, sans backend.
- Hébergement GitHub Pages.
- Stack React + Vite + TypeScript.
- Données d'altitude France : IGN Géoplateforme, priorité à la précision.
- Stockage local : localStorage au MVP, IndexedDB possible si le volume augmente.
- Pas de Supabase.
- Pas de compte utilisateur.
- Pas de synchronisation cloud.
- Visualisation du coucher à intégrer progressivement.
- Prise en compte de la réfraction atmosphérique dans le moteur de calcul.
- Exploration du LiDAR HD IGN pour les versions avancées.

## Stack recommandée

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Leaflet
- Recharts
- SunCalc ou Astronomy Engine
- IGN Géoplateforme Altimétrie
- GitHub Pages
- Vitest
- Playwright optionnel

## Commandes initiales

```bash
npm create vite@latest sunset-horizon -- --template react-ts
cd sunset-horizon
npm install
npm install leaflet react-leaflet recharts suncalc date-fns
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

## Structure cible

```txt
src/
  app/
  components/
  features/
    map/
    solar/
    terrain/
    horizon/
    results/
    spots/
    visualization/
  lib/
    geo/
    ign/
    storage/
    time/
  styles/
  types/
```
