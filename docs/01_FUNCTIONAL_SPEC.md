# Spécifications fonctionnelles

## MVP

### FS-01 — Géolocalisation

L'utilisateur peut utiliser sa position actuelle via la Geolocation API.

Critères d'acceptation :

- bouton “Me localiser” ;
- affichage latitude/longitude ;
- affichage de la précision GPS si disponible ;
- message explicite en cas de refus ou d'échec.

### FS-02 — Position manuelle

L'utilisateur peut choisir un point sur la carte.

Critères d'acceptation :

- clic sur la carte ;
- déplacement du marqueur ;
- recalcul automatique ou bouton “Recalculer”.

### FS-03 — Date d'observation

L'utilisateur peut choisir une date.

Critères d'acceptation :

- date du jour par défaut ;
- sélecteur de date ;
- recalcul possible pour une date future.

### FS-04 — Coucher officiel

L'application affiche l'heure de coucher officielle calculée pour la position.

Critères d'acceptation :

- heure locale ;
- mention “horizon théorique”.

### FS-05 — Coucher corrigé par relief

L'application calcule l'heure où le soleil croise l'horizon effectif.

Critères d'acceptation :

- heure locale corrigée ;
- différence en minutes ;
- point bloquant identifié ;
- résultat marqué comme “estimation”.

### FS-06 — Profil altimétrique

L'application affiche le profil du relief dans la direction du soleil.

Critères d'acceptation :

- distance en km ;
- altitude terrain ;
- point bloquant mis en évidence ;
- horizon angulaire maximal affiché.

### FS-07 — Sauvegarde locale des spots

L'utilisateur peut sauvegarder des lieux localement.

Critères d'acceptation :

- nom du spot ;
- latitude ;
- longitude ;
- altitude observateur ;
- suppression possible ;
- aucune connexion requise.

## Version 1.5

### FS-08 — Comparaison de spots

Comparer plusieurs lieux enregistrés pour une même date.

### FS-09 — Horizon 360 simplifié

Pré-calculer l'horizon effectif sur plusieurs azimuts pour comprendre le panorama.

### FS-10 — Cache local optionnel

Mettre en cache localement les profils déjà calculés, sans Supabase.

Stockage recommandé : IndexedDB si les profils deviennent volumineux.

## Version 2

### FS-11 — Mode lever de soleil

Même logique, mais autour du lever.

### FS-12 — Horizon 360 complet

Calculer l'horizon réel autour de l'observateur par pas d'azimut.

### FS-13 — Carte solaire annuelle

Afficher les variations de coucher réel au cours de l'année.

### FS-14 — Recommandation du meilleur spot

Comparer les spots locaux et recommander celui où le soleil reste visible le plus longtemps ou s'aligne avec un azimut intéressant.

### FS-15 — Prise en compte avancée du sursol

Explorer MNS/MNH LiDAR HD pour bâtiments et végétation si accessible de manière compatible avec une app statique.
