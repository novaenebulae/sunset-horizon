# Plan de test

## Tests unitaires

### Géographie

- distance entre deux points ;
- destination depuis un azimut ;
- conversion degrés/radians ;
- calcul angle apparent.

### Solaire

- coucher officiel pour une position fixe ;
- altitude/azimut cohérents autour du coucher ;
- correction de réfraction bornée.

### Horizon

- terrain plat => angle proche de 0 ;
- montagne synthétique => point bloquant correct ;
- relief derrière un premier obstacle moins haut => max correct.

### Stockage

- sauvegarde spot ;
- suppression ;
- migration simple des données.

## Tests d'intégration

- géolocalisation simulée ;
- clic carte ;
- appel client IGN mocké ;
- calcul complet avec profil mock.

## Tests manuels terrain

Créer une feuille de validation :

```txt
Date
Lieu
Coordonnées
Heure officielle
Heure estimée app
Heure observée réelle
Météo
Notes visibilité
Écart observé
```

Objectif MVP : écart inférieur à 5 minutes sur les spots testés.

## Tests limites

- GPS refusé ;
- hors France ;
- API IGN indisponible ;
- altitude manquante ;
- relief absent ;
- distance trop faible ;
- date hivernale / estivale.
