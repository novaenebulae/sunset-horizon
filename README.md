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

## Développement

Prérequis : Node.js 20+.

```bash
npm install
npm run dev      # serveur local http://localhost:5173
npm run build    # build production dans dist/
npm run test     # tests Vitest
npm run preview  # prévisualiser le build (base /sunset-horizon/)
```

### Déploiement GitHub Pages

- URL publique : `https://<votre-compte>.github.io/sunset-horizon/`
- Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publie automatiquement sur chaque push vers `main`.
- Dans les paramètres du dépôt GitHub : **Pages → Source : GitHub Actions**.

### Phase 0 (état actuel)

- React + Vite + TypeScript strict + Tailwind v4
- Page d'accueil minimale (thème sombre)
- Arborescence `src/` prête pour les features
- Pas encore : géolocalisation, calcul solaire, API IGN

Les dépendances Leaflet, Recharts et SunCalc seront ajoutées aux phases suivantes.

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
