# Backlog MVP — Sunset Horizon

> État mis à jour : le moteur horizon et son intégration UI sont considérés comme implémentés côté code, même si l'ancien backlog ne les cochait pas. Les tâches ci-dessous servent maintenant au suivi Cursor pour finaliser le MVP, fiabiliser l'interface et préparer la validation terrain.

## Légende de suivi

- `[x]` terminé
- `[~]` implémenté mais à auditer / stabiliser
- `[ ]` à faire
- `Prompt` : fichier recommandé pour Cursor

---

## Epic 1 — Setup projet

Statut : terminé.

- [x] Initialiser React + Vite + TypeScript
- [x] Installer Tailwind CSS
- [x] Configurer structure projet
- [x] Configurer GitHub Pages
- [x] Ajouter GitHub Actions build

Critère de sortie : l'application se build et se déploie sur GitHub Pages.

---

## Epic 2 — UI générale et layout responsive

Statut : partiellement terminé.

Prompt principal : `05_MAP_AND_PROFILE_PROMPT_REFINED.md`

### À conserver

- [x] App shell mobile-first
- [x] Interface sombre
- [x] Carte intégrée
- [x] Résultats principaux présents dans l'interface

### À finaliser

- [ ] Corriger le layout desktop : ne plus limiter toute l'application à `512px` sur écran large.
- [ ] Conserver une largeur confortable sur mobile.
- [ ] Ajouter un conteneur responsive : largeur pleine sur mobile, layout en grille sur tablette/desktop.
- [ ] Sur écran large, afficher idéalement :
  - colonne gauche : carte + contrôles de position ;
  - colonne droite : résultats + profil altimétrique + spots.
- [ ] Garder une largeur maximale lisible, par exemple `max-w-6xl` ou `max-w-7xl`, sans étirer excessivement les cartes de texte.
- [ ] Vérifier les breakpoints Tailwind `sm`, `md`, `lg`, `xl`.
- [ ] Vérifier que la carte garde une hauteur utile sur desktop et mobile.
- [ ] Vérifier que le graphique Recharts reste lisible sur mobile.

Critères d'acceptation :

- Sur mobile, l'application reste empilée et lisible.
- Sur desktop, l'application utilise correctement l'espace horizontal disponible.
- Aucun panneau principal ne reste bloqué à `512px` sauf composant explicitement prévu pour cela.
- Les résultats restent visibles sans scroll excessif sur écran large.

---

## Epic 3 — Position observateur

Statut : terminé avec extension à ajouter.

### Déjà terminé

- [x] Géolocalisation navigateur
- [x] Clic carte
- [x] Déplacement / sélection du marqueur observateur
- [x] Affichage précision GPS si disponible

### Extension MVP — recherche d'adresse

Prompt principal : `05_MAP_AND_PROFILE_PROMPT_REFINED.md`

- [ ] Ajouter une barre de recherche d'adresse.
- [ ] Utiliser le service de géocodage Géoplateforme / IGN.
- [ ] Ne pas utiliser l'ancien endpoint `api-adresse.data.gouv.fr`.
- [ ] Créer un client isolé, par exemple `src/features/geocoding/geocodingClient.ts`.
- [ ] Ajouter des types dédiés : `AddressSearchResult`, `GeocodingFeature`, etc.
- [ ] Gérer les états : saisie vide, chargement, aucun résultat, erreur réseau, sélection réussie.
- [ ] Au clic sur un résultat :
  - mettre à jour le point observateur ;
  - recentrer la carte ;
  - déclencher le recalcul si la logique actuelle le permet, sinon afficher un bouton `Recalculer`.
- [ ] Ajouter un debounce côté UI pour éviter les appels réseau à chaque frappe.
- [ ] Limiter les résultats affichés, par exemple 5.
- [ ] Afficher le label d'adresse et la ville / code postal si disponibles.
- [ ] Prévoir un message si la recherche sort de la zone France ou si l'altimétrie IGN échoue ensuite.

Critères d'acceptation :

- L'utilisateur peut trouver un lieu par adresse sans utiliser le GPS.
- La sélection d'une adresse met à jour le marqueur.
- La recherche n'effectue pas d'appels inutiles pour moins de 3 caractères.
- Les erreurs sont affichées sans bloquer le reste de l'application.

---

## Epic 4 — Calcul solaire

Statut : terminé, à surveiller lors des intégrations.

- [x] Coucher officiel
- [x] Azimut solaire
- [x] Altitude solaire
- [x] Fenêtre d'échantillonnage
- [x] Tests unitaires

Critères de non-régression :

- L'heure officielle reste affichée comme horizon théorique.
- L'azimut utilisé pour la carte correspond au calcul solaire affiché.
- Les dates futures restent calculables.

---

## Epic 5 — IGN terrain

Statut : terminé, à surveiller lors des intégrations.

- [x] Client IGN isolé
- [x] Altitude observateur avec `elevation.json`
- [x] Profil altimétrique avec `elevationLine.json`
- [x] Normalisation des réponses `zonly=true` et `zonly=false`
- [x] Gestion erreurs
- [x] Mock API

Critères de non-régression :

- L'application ne suppose pas que l'API IGN fournit une distance dans les points du profil.
- La distance doit rester calculée localement si nécessaire.
- Les erreurs IGN affichent un état clair et ne cassent pas l'UI.

---

## Epic 6 — Horizon et coucher corrigé

Statut : implémenté, à auditer / valider.

Prompt recommandé si audit nécessaire : créer un prompt séparé `04C_HORIZON_AUDIT_PROMPT.md` ou intégrer l'audit dans la validation finale.

- [x] Calcul angles apparents
- [x] Identification du point bloquant
- [x] Croisement soleil / relief
- [~] Correction optionnelle de réfraction atmosphérique
- [x] Incertitude
- [x] Intégration UI du résultat corrigé

Checklist d'audit :

- [x] Vérifier que le point bloquant est le maximum d'angle apparent, pas simplement l'altitude maximale.
- [x] Vérifier que l'angle apparent utilise `atan((altitudePoint - altitudeObserver) / distanceM)`.
- [x] Vérifier que les distances nulles ou trop faibles sont ignorées.
- [x] Vérifier que le croisement cherche le premier instant où `solarAltitudeDeg <= horizonAngleDeg`.
- [x] Vérifier que le résultat peut être `null` si aucun croisement valide n'est trouvé.
- [x] Vérifier que l'incertitude est affichée comme estimation et non comme certitude.
- [x] Vérifier que le point bloquant est cohérent entre carte, résultats et graphique.

Critères d'acceptation :

- Terrain plat : angle proche de 0°.
- Montagne synthétique : point bloquant attendu.
- Obstacle proche moins haut mais plus angulaire : obstacle correctement identifié.
- L'heure corrigée est toujours clairement distinguée de l'heure officielle.

---

## Epic 7 — Carte et profil altimétrique finalisés

Statut : à finaliser.

Prompt principal : `05_MAP_AND_PROFILE_PROMPT_REFINED.md`

- [ ] Afficher marqueur observateur.
- [ ] Afficher ligne d'azimut coucher.
- [ ] Afficher point bloquant si disponible.
- [ ] Afficher profil altimétrique avec Recharts.
- [ ] Mettre en évidence le point bloquant sur le profil.
- [ ] Afficher angle d'horizon maximal.
- [ ] Afficher distance du point bloquant.
- [ ] Afficher altitude du point bloquant.
- [ ] Ajouter états : initial, loading, success, error.
- [ ] Vérifier que carte et graphique utilisent la même source de données.

Critères d'acceptation :

- Le point bloquant visible sur la carte correspond au point mis en évidence dans le graphique.
- Le graphique indique clairement distance et altitude.
- Les états d'erreur ne suppriment pas la possibilité de choisir un autre point.

---

## Epic 8 — Stockage local des spots

Statut : à faire.

Prompt principal : `06A_LOCAL_STORAGE_LAYER_PROMPT_REFINED.md`

- [ ] Créer `src/features/spots/spotTypes.ts`.
- [ ] Créer `src/features/spots/spotStorage.ts`.
- [ ] Créer `src/features/spots/spotStorage.test.ts`.
- [ ] Définir `SavedSpot`.
- [ ] Sauvegarder un spot.
- [ ] Charger tous les spots.
- [ ] Mettre à jour un spot.
- [ ] Supprimer un spot.
- [ ] Gérer version de schéma.
- [ ] Gérer migration simple.
- [ ] Gérer localStorage indisponible.
- [ ] Gérer JSON invalide.

Critères d'acceptation :

- Les fonctions sont testables sans React.
- Les composants UI ne manipulent jamais directement `localStorage`.
- Les données restent locales au navigateur.

---

## Epic 9 — Interface des spots sauvegardés

Statut : à faire après Epic 8.

Prompt principal : `06B_SAVED_SPOTS_UI_PROMPT_REFINED.md`

- [ ] Bouton `Enregistrer ce spot`.
- [ ] Formulaire de nommage.
- [ ] Liste des spots.
- [ ] Carte ou ligne par spot.
- [ ] Action `Charger`.
- [ ] Action `Supprimer`.
- [ ] Affichage coordonnées.
- [ ] Affichage altitude si disponible.
- [ ] Affichage dernière date de calcul si disponible.
- [ ] État vide.
- [ ] Confirmation simple avant suppression si nécessaire.
- [ ] Recalcul depuis un spot chargé.

Critères d'acceptation :

- Après rechargement de page, les spots existent encore.
- Charger un spot remplace la position observateur courante.
- Supprimer un spot met à jour l'interface immédiatement.

---

## Epic 10 — Validation finale MVP

Statut : à faire en fin de chaîne.

Prompt recommandé : `07_FINAL_MVP_VALIDATION_PROMPT.md`

- [ ] Vérifier l'ensemble du parcours utilisateur :
  - localisation GPS ;
  - clic carte ;
  - recherche adresse ;
  - calcul relief ;
  - lecture résultat ;
  - sauvegarde spot ;
  - rechargement spot.
- [ ] Vérifier mobile, tablette et desktop.
- [ ] Vérifier `npm run build`.
- [ ] Vérifier `npm run test` si disponible.
- [ ] Vérifier l'accessibilité minimale : labels, boutons nommés, focus clavier.
- [ ] Vérifier les états d'erreur : GPS refusé, adresse introuvable, IGN indisponible, localStorage indisponible.
- [ ] Créer une fiche de validation terrain manuelle.
- [ ] Mettre à jour le README avec limites et mode d'emploi.

Critères d'acceptation MVP :

- L'utilisateur peut obtenir une estimation du coucher corrigé par relief depuis une position GPS, une adresse ou un point manuel.
- Le résultat affiche l'heure officielle, l'heure corrigée, le décalage, l'azimut, le point bloquant, la source des données et l'incertitude.
- L'application fonctionne sans backend, sans compte utilisateur et sans stockage distant.
- L'application est lisible sur mobile et exploite correctement l'espace sur desktop.
