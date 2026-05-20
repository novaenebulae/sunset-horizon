# Prompt Cursor — Module solaire

Implémente le module solaire.

Créer :

```txt
src/features/solar/
  solarService.ts
  refraction.ts
  types.ts
  solarService.test.ts
```

Objectifs :

1. Calculer l'heure officielle du coucher pour une latitude/longitude/date.
2. Calculer altitude et azimut du soleil pour un instant donné.
3. Préparer une fonction d'échantillonnage autour du coucher officiel.
4. Ajouter une correction simple de réfraction atmosphérique, documentée et désactivable.

Contraintes :

- Utiliser une librairie solaire existante.
- Garder les fonctions testables.
- Ne pas encore intégrer IGN.
- Ne pas coder le croisement relief.

Ajouter une petite intégration UI pour afficher :

- coucher officiel ;
- azimut approximatif du coucher.
