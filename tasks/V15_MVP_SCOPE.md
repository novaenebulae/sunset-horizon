# Sunset Horizon — MVP Version 1.5

## Objectif général

La version 1.5 transforme le MVP fonctionnel en application réellement confortable à utiliser.

Le MVP actuel répond déjà à la question principale :

> À quelle heure le soleil disparaît-il réellement derrière le relief depuis un point donné ?

La version 1.5 améliore :

- le contrôle de la précision du calcul ;
- la comparaison entre plusieurs spots ;
- la persistance locale des résultats utiles ;
- la performance avec cache local ;
- le transfert local des données (export / import JSON) ;
- une première visualisation globale de l’horizon autour de l’observateur.

## Contraintes conservées

- Application statique React + Vite + TypeScript.
- Déploiement GitHub Pages.
- Aucun backend.
- Aucun compte utilisateur.
- Aucune synchronisation cloud.
- Aucune base distante.
- Pas de Supabase.
- Stockage local uniquement.
- Calcul côté navigateur.
- API IGN / Géoplateforme pour l’altimétrie.
- Ne pas intégrer le LiDAR HD en V1.5.

## Périmètre obligatoire V1.5

1. Réglages avancés du calcul.
2. Cache local IndexedDB des profils terrain.
3. Comparaison de spots sauvegardés.
4. Horizon 360 simplifié.
5. Validation et polish V1.5.

## Ajouts validés

6. Historique local des calculs.
7. Export / import JSON local.

## Hors périmètre V1.5

Ces fonctionnalités restent prévues pour une V2 ou une version ultérieure :

- mode lever de soleil ;
- carte solaire annuelle complète ;
- recommandation automatique du meilleur spot ;
- simulation animée du coucher ;
- horizon 360 haute précision ;
- LiDAR HD MNT / MNS / MNH ;
- synchronisation cloud ;
- comptes utilisateurs ;
- URL partageable sans backend ;
- panneau diagnostic du calcul.

## Définition de “MVP V1.5 terminé”

La V1.5 est considérée terminée si l’utilisateur peut :

1. Ajuster le calcul avec un mode rapide / équilibré / précis.
2. Comprendre les paramètres réellement utilisés via les réglages avancés.
3. Sauvegarder localement l’historique des derniers calculs.
4. Comparer plusieurs spots sauvegardés pour une même date.
5. Voir quel spot garde le soleil visible le plus tard.
6. Réutiliser les profils terrain via un cache IndexedDB transparent.
7. Vider le cache local depuis l’interface.
8. Exporter ses spots, réglages et historiques en JSON.
9. Réimporter ce JSON dans un autre navigateur.
10. Lancer manuellement un horizon 360 simplifié sans bloquer l’interface.
11. Conserver le parcours MVP initial intact.
12. Utiliser l’application correctement sur mobile, tablette et desktop.

## Ordre recommandé des prompts Cursor

1. `08A_V15_ADVANCED_CALCULATION_SETTINGS_PROMPT.md`
2. `08B_V15_LOCAL_CALCULATION_HISTORY_PROMPT.md`
3. `08C_V15_TERRAIN_PROFILE_CACHE_PROMPT.md`
4. `08D_V15_SPOT_COMPARISON_PROMPT.md`
5. `08F_V15_EXPORT_IMPORT_JSON_PROMPT.md`
6. `08H_V15_SIMPLIFIED_HORIZON_360_PROMPT.md`
7. `08I_V15_FINAL_VALIDATION_AND_POLISH_PROMPT.md`

## Risques principaux V1.5

### Explosion des appels IGN

Mesures : cache IndexedDB avant horizon 360, limite de spots comparés simultanément, calculs séquentiels ou concurrence limitée, bouton manuel pour horizon 360, pas de recalcul automatique lourd.

### Complexité UI

Mesures : panneaux repliables, résultat principal prioritaire, détails techniques masqués par défaut.

### Incohérence des paramètres

Mesures : enregistrer les réglages utilisés, intégrer les réglages dans les clés de cache, afficher le mode dans l’interface des résultats, exporter les réglages.

### Données locales corrompues

Mesures : versionner les schémas locaux, valider les imports, ignorer les entrées invalides, proposer une réinitialisation locale.
