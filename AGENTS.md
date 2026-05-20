# Instructions agent — Sunset Horizon

## Mission

Développer une application web statique permettant d'estimer le coucher de soleil réel derrière le relief depuis un point d'observation.

## Contraintes strictes

- Pas de backend.
- Pas de Supabase.
- Pas de compte utilisateur.
- Stockage local uniquement.
- Ne jamais exposer de secret côté client.
- Ne pas inventer de contrat API non vérifié.
- Toute logique mathématique doit être testée.
- L'application doit rester compatible GitHub Pages.

## Stack

- React
- TypeScript strict
- Vite
- Tailwind CSS
- Leaflet
- Recharts
- SunCalc ou Astronomy Engine
- Vitest

## Architecture

Respecter la séparation :

- `features/solar` pour la position solaire ;
- `features/terrain` pour IGN et profils ;
- `features/horizon` pour les angles et croisements ;
- `features/map` pour la carte ;
- `features/results` pour l'affichage ;
- `lib/storage` pour localStorage/IndexedDB.

## Qualité

- Fonctions pures pour les calculs.
- Types explicites.
- Tests unitaires pour les calculs critiques.
- Gestion claire des erreurs réseau.
- États loading/error/success dans l'UI.
- Pas de dépendances inutiles.

## UX

- Mobile-first.
- Heure corrigée prioritaire.
- Toujours afficher source et incertitude.
- Toujours permettre position manuelle.
