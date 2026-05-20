# UX / UI

## Objectif UX

L'application doit répondre en moins de 10 secondes à la question :

> À quelle heure le soleil va-t-il réellement disparaître derrière le relief depuis ici ?

## Écran principal

### Structure

```txt
Header
  Sunset Horizon
  Date sélectionnée

MapPanel
  Carte
  Position observateur
  Ligne azimut coucher
  Point bloquant

ResultCard
  Heure réelle estimée
  Heure officielle
  Décalage
  Azimut
  Relief bloquant
  Précision

HorizonProfileChart
  Profil altimétrique
  Ligne horizon
  Point bloquant

Controls
  Me localiser
  Sélection date
  Enregistrer spot
  Réglages avancés
```

## Description visuelle

- Interface sombre.
- Heure corrigée très grande.
- Carte compacte mais prioritaire.
- Accent orange pour le soleil.
- Accent bleu pour l'horizon/relief.
- Résultats lisibles sur mobile.

## États

### Initial

Message : “Choisis un point ou utilise ta position actuelle.”

### Chargement

Message : “Analyse du relief dans la direction du soleil…”

### Succès

Afficher :

- heure corrigée ;
- heure officielle ;
- décalage ;
- point bloquant ;
- source des données.

### Erreur GPS

Message : “Géolocalisation indisponible. Clique sur la carte ou saisis des coordonnées.”

### Erreur altitude

Message : “Impossible de récupérer le profil altimétrique IGN pour cette zone.”

## Visualisations proposées

### V1 — Profil horizon

Graphique distance/altitude avec point bloquant.

C'est la visualisation prioritaire.

### V1.5 — Ligne de visée solaire

Superposer une ligne représentant la hauteur angulaire du soleil au moment du croisement.

### V2 — Horizon 360°

Diagramme polaire :

- axe horizontal = azimut ;
- rayon ou hauteur = angle d'horizon ;
- trajectoire solaire superposée.

### V2 — Simulation coucher

Petite scène stylisée :

- relief en silhouette ;
- disque solaire ;
- curseur temporel ;
- animation lente autour du coucher.

### V2 — Carte annuelle

Heatmap ou calendrier indiquant :

- jours où le soleil reste visible le plus longtemps ;
- jours avec obstruction forte ;
- azimuts saisonniers.
