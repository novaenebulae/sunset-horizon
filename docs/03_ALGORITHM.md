# Algorithme de calcul

## Vue d'ensemble

L'heure réelle est déterminée par le premier instant où l'altitude apparente du soleil devient inférieure ou égale à l'angle d'horizon réel dans la même direction.

```txt
sun_altitude(t) <= terrain_horizon_angle(sun_azimuth(t))
```

## Étape 1 — Position observateur

Entrées :

```ts
lat: number
lon: number
date: Date
```

Récupérer aussi :

- altitude observateur via IGN ;
- précision GPS si disponible ;
- fuseau horaire local du navigateur.

## Étape 2 — Heure officielle

Utiliser une librairie solaire pour obtenir l'heure standard du coucher.

Cette heure sert de point de départ, pas de résultat final.

## Étape 3 — Fenêtre de recherche

Analyser une fenêtre autour du coucher officiel :

```txt
start = coucher officiel - 120 min
end   = coucher officiel + 30 min
step  = 60 s au MVP
```

Ensuite affiner par dichotomie à 10 secondes ou 30 secondes.

## Étape 4 — Azimut solaire

Pour chaque instant `t`, calculer :

```txt
altitude solaire apparente
azimut solaire
```

Le relief pertinent dépend de l'azimut : le soleil ne se couche pas toujours derrière le même relief selon la saison.

## Étape 5 — Profil terrain

Pour un azimut donné :

1. Générer une ligne depuis l'observateur.
2. Échantillonner entre 50 m et 30/80 km.
3. Récupérer les altitudes via IGN.
4. Calculer pour chaque point :

```txt
angle = atan((altitude_point - altitude_observateur) / distance)
```

5. L'angle d'horizon est le maximum des angles.

## Étape 6 — Point bloquant

Le point bloquant est l'échantillon qui maximise l'angle apparent.

```txt
blockingSample = max(samples, sample.apparentAngleDeg)
```

## Étape 7 — Croisement

On cherche le premier `t` tel que :

```txt
solarAltitudeDeg(t) <= horizonAngleDeg(azimuth(t))
```

Au MVP, simplifier en calculant l'horizon sur l'azimut du coucher officiel.

Version avancée : recalculer ou interpoler l'horizon pour l'azimut solaire exact à chaque instant.

## Réfraction atmosphérique

Correction recommandée :

- intégrer une fonction de réfraction atmosphérique simple ;
- documenter qu'elle reste approximative ;
- permettre éventuellement de l'activer/désactiver dans les réglages avancés.

## Incertitude

Sources d'incertitude :

- précision GPS ;
- résolution du modèle d'altitude ;
- distance du relief ;
- végétation ou bâtiments non inclus ;
- météo et réfraction.

MVP : afficher une marge indicative :

```txt
±2 à ±5 min selon précision et source de données
```
