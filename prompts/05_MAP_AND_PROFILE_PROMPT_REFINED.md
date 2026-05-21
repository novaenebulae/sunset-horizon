# Prompt Cursor — 05 — Carte, recherche d'adresse, profil et responsive

## Contexte

Sunset Horizon est une application React + Vite + TypeScript + Tailwind, déployée sur GitHub Pages, sans backend et sans Supabase.

Le moteur géographique, le moteur solaire, le client IGN et le moteur horizon sont déjà implémentés. Cette étape ne doit pas refaire les calculs métier. Elle doit améliorer l'interface carte/profil, ajouter la recherche d'adresse et corriger l'affichage desktop.

## À lire avant modification

- `AGENTS.md`
- `README.md`
- `docs/00_PROJECT_BRIEF.md`
- `docs/01_FUNCTIONAL_SPEC.md`
- `docs/02_ARCHITECTURE.md`
- `docs/03_ALGORITHM.md`
- `docs/04_DATA_SOURCES.md`
- `docs/05_UX_UI.md`
- `docs/06_DESIGN_SYSTEM.md`
- `tasks/MVP_BACKLOG.md` important pour visualiser et sauvegarder la progression actuelle
- `src/features/location/`
- `src/features/map/` si présent
- `src/features/results/` si présent
- `src/features/terrain/` si nécessaire uniquement pour les types
- `src/features/horizon/` si nécessaire uniquement pour les types

## Objectif

Finaliser l'interface MVP autour de quatre besoins :

1. Recherche d'adresse.
2. Carte de résultat.
3. Graphique de profil altimétrique.
4. Layout responsive mobile + desktop.

## Important — service de recherche d'adresse

Utiliser le service Géoplateforme / IGN, pas l'ancien endpoint `api-adresse.data.gouv.fr`.

Service recommandé :

```txt
https://data.geopf.fr/geocodage/search
```

Pour une saisie progressive, tu peux utiliser le service d'autocomplétion Géoplateforme si la signature est confirmée dans la documentation :

```txt
https://data.geopf.fr/geocodage/completion/
```

Ne devine pas les paramètres si la signature n'est pas claire. Consulte la documentation ou le swagger du service. L'objectif minimum du MVP est une recherche d'adresse après saisie, pas forcément une autocomplétion très avancée.

## Fonctionnalité A — barre de recherche d'adresse

Créer ou compléter un module isolé :

```txt
src/features/geocoding/
  geocodingTypes.ts
  geocodingClient.ts
  geocodingClient.test.ts
  AddressSearch.tsx
```

Si le projet possède déjà une structure équivalente, l'utiliser au lieu d'en créer une nouvelle.

### Comportement attendu

- Champ de recherche avec placeholder clair, par exemple : `Rechercher une adresse ou un lieu`.
- Ne pas lancer de recherche si la saisie contient moins de 3 caractères.
- Ajouter un debounce, par exemple 300 à 500 ms, si la recherche se déclenche pendant la frappe.
- Limiter les résultats affichés, par exemple 5.
- Afficher pour chaque résultat :
  - label principal ;
  - commune / code postal si disponibles ;
  - score ou type si utile, sans surcharger l'UI.
- Au clic sur un résultat :
  - extraire latitude / longitude ;
  - mettre à jour la position observateur ;
  - recentrer la carte ;
  - fermer ou réduire la liste de résultats ;
  - déclencher le recalcul si le flux actuel le fait déjà, sinon laisser le bouton `Recalculer` faire le travail.

### États à gérer

- Saisie vide.
- Recherche en cours.
- Aucun résultat.
- Erreur réseau.
- Réponse invalide.
- Résultat sans coordonnées exploitables.

### Contraintes

- Le client réseau ne doit pas être dans le composant React principal.
- Pas de clé API côté client si non nécessaire.
- Pas de backend.
- Pas de dépendance lourde pour cette étape.
- Ne pas utiliser Nominatim pour l'autocomplétion côté client.
- Ne pas appeler le géocodage à chaque rendu React.

## Fonctionnalité B — carte

La carte doit afficher :

- point observateur ;
- ligne d'azimut du coucher ;
- point bloquant si disponible ;
- éventuellement une ligne entre observateur et point bloquant si cela améliore la compréhension.

### Détails UI

- Utiliser l'accent soleil pour la ligne d'azimut.
- Utiliser l'accent horizon / relief pour le point bloquant.
- Garder une carte lisible sur mobile.
- Sur desktop, donner plus de hauteur à la carte si l'espace le permet.
- Ne pas afficher le point bloquant si `blockingSample` est `null`.
- Ne pas casser l'application si le profil ou le résultat est absent.

## Fonctionnalité C — graphique Recharts du profil altimétrique

Créer ou compléter un composant :

```txt
src/features/results/HorizonProfileChart.tsx
```

ou l'emplacement équivalent existant.

### Données attendues

Utiliser les données déjà produites par le moteur horizon :

- `distanceM` ;
- `elevationM` ;
- `apparentAngleDeg` si disponible ;
- `blockingSample` ;
- `horizonAngleDeg`.

Ne recalcule pas les distances ou les angles dans le composant, sauf transformation d'affichage triviale.

### Affichage attendu

- Axe X : distance en km.
- Axe Y principal : altitude terrain en mètres.
- Tooltip lisible : distance, altitude, angle apparent.
- Mise en évidence du point bloquant.
- Affichage textuel adjacent :
  - distance du point bloquant ;
  - altitude du point bloquant ;
  - angle d'horizon maximal.

### Contraintes mobile

- Graphique dans un conteneur responsive.
- Hauteur minimale suffisante, par exemple 220 à 280 px.
- Éviter les labels trop denses.
- Tooltip utilisable sur écran tactile.

## Fonctionnalité D — états UI

Ajouter ou stabiliser les états suivants :

- Initial : `Choisis un point, utilise ta position actuelle ou recherche une adresse.`
- Chargement : `Analyse du relief dans la direction du soleil…`
- Succès : afficher résultat corrigé, officiel, décalage, point bloquant, source et incertitude.
- Erreur GPS : garder la recherche adresse et le clic carte disponibles.
- Erreur adresse : afficher un message non bloquant.
- Erreur altitude IGN : proposer de réessayer ou de choisir un autre point.
- Aucun croisement trouvé : afficher une explication claire au lieu d'une heure vide.

## Fonctionnalité E — responsive desktop

Corriger le problème actuel : l'application reste visuellement bloquée à environ `512px` sur écran large.

### Attendu

- Mobile : layout empilé, largeur pleine, contenu prioritaire.
- Tablette / desktop : layout en grille.
- Exemple acceptable :

```txt
<main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
    colonne carte + profil
    colonne résultats + contrôles + spots
  </div>
</main>
```

Ce n'est qu'un exemple : adapte au code existant.

### Points à vérifier

- Supprimer ou déplacer les classes qui imposent `max-w-md`, `max-w-lg`, `w-[512px]`, `mx-auto` trop restrictif sur le conteneur global.
- Garder les cartes internes lisibles avec des `max-w-*` seulement si nécessaire.
- Ne pas étirer excessivement les textes.
- La carte et le graphique peuvent occuper plus d'espace que les cartes de métriques.

## Critères d'acceptation

- Je peux choisir un point via GPS.
- Je peux choisir un point en cliquant sur la carte.
- Je peux choisir un point via recherche d'adresse.
- La carte affiche observateur, azimut et point bloquant quand disponible.
- Le graphique affiche le profil et met en évidence le point bloquant.
- L'application reste mobile-first.
- Sur desktop, l'application exploite réellement la largeur de l'écran.
- Aucun calcul lourd n'est ajouté directement dans les composants React.
- `npm run build` passe.
- `npm run test` passe si disponible.

## Avant de coder

1. Analyse rapidement l'état actuel.
2. Identifie les composants responsables du layout global.
3. Identifie où la position observateur est centralisée.
4. Identifie les types de résultat horizon disponibles.
5. Propose un plan court.
6. Liste les fichiers à créer ou modifier.
7. Attends validation avant modification si le workflow du projet le demande.

## Après implémentation

- Résume les fichiers modifiés.
- Liste les éventuels compromis.
- Indique les tests lancés.
- Fais une revue de code mentale : types, erreurs possibles, edge cases, responsive, accessibilité minimale.

