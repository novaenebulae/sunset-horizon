# Roadmap MVP → Version 2

## Phase 0 — Initialisation projet

Objectif : créer un socle propre.

Tâches :

1. Créer repo GitHub.
2. Initialiser Vite React TypeScript.
3. Installer Tailwind.
4. Installer Leaflet, Recharts, librairie solaire.
5. Configurer ESLint/Prettier si souhaité.
6. Configurer Vitest.
7. Ajouter GitHub Actions build.
8. Préparer GitHub Pages.

Livrable : app vide déployée.

## Phase 1 — MVP UI statique

Objectif : créer l'interface sans logique réelle.

Tâches :

1. Créer layout principal.
2. Créer cartes de résultats mockées.
3. Créer carte Leaflet.
4. Créer panneau de sélection date.
5. Créer composant profil altimétrique mock.
6. Créer composants d'erreur/chargement.

Livrable : prototype navigable.

## Phase 2 — Géolocalisation et carte

Objectif : rendre l'observation interactive.

Tâches :

1. Implémenter Geolocation API.
2. Afficher précision GPS.
3. Autoriser clic carte.
4. Déplacer marqueur observateur.
5. Centraliser l'état de position.

Livrable : choix réel d'un point.

## Phase 3 — Calcul solaire

Objectif : obtenir coucher officiel et azimut.

Tâches :

1. Ajouter service `solarService`.
2. Calculer coucher officiel.
3. Calculer altitude/azimut à une date donnée.
4. Échantillonner la fenêtre autour du coucher.
5. Ajouter tests unitaires.

Livrable : données solaires fiables.

## Phase 4 — Client IGN

Objectif : récupérer altitude et profil.

Tâches :

1. Créer client `ignAltimetryClient`.
2. Récupérer altitude observateur.
3. Générer ligne selon azimut.
4. Récupérer profil altimétrique.
5. Gérer limites API et erreurs.
6. Ajouter mocks de tests.

Livrable : profil terrain réel.

## Phase 5 — Moteur horizon

Objectif : trouver le relief bloquant.

Tâches :

1. Calculer distances géodésiques.
2. Calculer angles apparents.
3. Identifier angle maximal.
4. Identifier point bloquant.
5. Afficher ligne et point sur carte.
6. Tester sur cas synthétiques.

Livrable : horizon effectif calculé.

## Phase 6 — Croisement soleil/relief

Objectif : calculer l'heure corrigée.

Tâches :

1. Comparer altitude solaire et horizon.
2. Trouver premier croisement par balayage.
3. Affiner par dichotomie.
4. Ajouter correction réfraction simple.
5. Afficher incertitude.
6. Tester manuellement sur un lieu connu.

Livrable : MVP fonctionnel.

## Phase 7 — LocalStorage spots

Objectif : sauvegarder les lieux.

Tâches :

1. Créer modèle `SavedSpot`.
2. Sauvegarder spot.
3. Lister spots.
4. Recharger spot.
5. Supprimer spot.
6. Export/import JSON local optionnel.

Livrable : spots persistants sur l'appareil.

## Phase 8 — Version 1.5

Objectif : améliorer l'usage réel.

Tâches :

1. Comparaison de spots.
2. Horizon 360 simplifié.
3. Cache local IndexedDB optionnel.
4. Réglages avancés : distance max, pas d'échantillonnage, réfraction.
5. Mode précision : rapide / équilibré / précis.

Livrable : application confortable.

## Phase 9 — Version 2

Objectif : fonctionnalités avancées validées.

Tâches :

1. Mode lever de soleil.
2. Horizon 360 complet.
3. Carte solaire annuelle.
4. Recommandation du meilleur spot.
5. Simulation visuelle du coucher.
6. Exploration LiDAR HD MNT/MNS/MNH.

Livrable : produit complet sans compte utilisateur.
