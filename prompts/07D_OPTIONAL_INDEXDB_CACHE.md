\# Prompt Cursor — V1.5 Cache local IndexedDB optionnel



Lis avant de modifier le code :

\- AGENTS.md

\- README.md

\- docs/02\_ARCHITECTURE.md

\- docs/04\_DATA\_SOURCES.md

\- src/features/terrain/

\- src/features/settings/



Objectif :

Ajouter un cache local IndexedDB pour éviter de recalculer ou retélécharger trop souvent les profils terrain.



Fonctionnalités attendues :

1\. Stocker localement les profils terrain calculés.

2\. Réutiliser un profil si les paramètres sont identiques ou suffisamment proches.

3\. Ajouter une durée de validité longue.

4\. Permettre de vider le cache local.

5\. Afficher la taille approximative du cache si possible.

6\. Ne jamais synchroniser les données.



Architecture attendue :

Créer :



src/features/cache/

&#x20; terrainProfileCache.ts

&#x20; cacheTypes.ts

&#x20; cacheKey.ts

&#x20; cacheSettings.ts



Contraintes :

\- IndexedDB uniquement.

\- Pas de Supabase.

\- Pas de compte utilisateur.

\- Pas de cloud.

\- Ne pas bloquer le calcul si le cache échoue.

\- Le cache doit être transparent pour le reste de l’application.

\- Le TerrainProvider doit pouvoir utiliser le cache sans que l’UI dépende d’IndexedDB.



Avant de coder :

1\. Analyse l’état actuel.

2\. Vérifie si le cache est réellement nécessaire.

3\. Propose un plan court.

4\. Liste les fichiers créés ou modifiés.

5\. Attends validation.



Après implémentation :

\- vérifier npm run build ;

\- tester cache hit ;

\- tester cache miss ;

\- tester suppression du cache.

