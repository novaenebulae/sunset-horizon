# Données d'altitude

## Source prioritaire — IGN Géoplateforme Altimétrie

L'API de calcul altimétrique de la Géoplateforme permet d'obtenir :

- l'altitude d'un ou plusieurs points ;
- le profil altimétrique le long d'une courbe.

Documentation :

- https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/
- https://data.geopf.fr/altimetrie/resources
- https://geoplateforme.pages.gpf-tech.ign.fr/altimetrie/api-rest-calcul-altimetrique/

Limites connues (API REST altimétrie Géoplateforme) :

- 5 requêtes par seconde depuis une même IP ;
- profil `elevationLine.json` : paramètre `sampling` entre 2 et **5 000** points par requête ;
- altitude multi-points `elevation.json` : jusqu’à **5 000** coordonnées par requête.

Référence : [Service calcul altimétrique IGN](https://geoservices.ign.fr/node/1439).

## Stratégie API

### MVP

- Utiliser l'API de profil altimétrique si elle répond correctement aux besoins.
- Sinon, générer une liste de points et utiliser l'endpoint altitude multi-points.
- Grouper les requêtes pour éviter trop d'appels.

### Paramètres recommandés

```txt
Distance minimale : 50 m
Distance maximale : 30 km par défaut
Distance maximale avancée : 80 km
Pas initial (mode normal) : 250 m
Pas précis : 100 m (jusqu’à 5 000 points IGN par requête ; profils plus denses découpés en segments)
```

## LiDAR HD IGN

L'IGN propose des données LiDAR HD avec :

- nuages de points classés ;
- MNT ;
- MNS ;
- MNH.

Documentation générale :

- https://www.ign.fr/institut/programme-lidar-hd-vers-une-nouvelle-cartographie-3d-du-territoire
- https://geoservices.ign.fr/lidarhd

## Positionnement LiDAR HD dans le projet

Le LiDAR HD est très pertinent pour la précision, surtout pour distinguer :

- sol topographique ;
- bâtiments ;
- végétation ;
- obstacles proches.

Mais son intégration directe dans une application GitHub Pages est plus complexe, car les produits sont souvent téléchargés sous forme de tuiles/données volumineuses.

Décision recommandée :

1. MVP : API altimétrique Géoplateforme.
2. Version 1.5 : vérifier si une ressource API basée sur données haute résolution est disponible pour la zone ciblée.
3. Version 2 : prototype LiDAR HD sur zone locale, avec prétraitement externe si nécessaire.

## Fallback mondial optionnel

À ne pas prioriser tant que le projet cible la France.

Options possibles :

- Open-Meteo Elevation API ;
- OpenTopoData.
