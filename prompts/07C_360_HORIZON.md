\# Prompt Cursor — V1.5 Horizon 360 simplifié



Lis avant de modifier le code :

\- AGENTS.md

\- README.md

\- docs/03\_ALGORITHM.md

\- docs/05\_UX\_UI.md

\- docs/06\_DESIGN\_SYSTEM.md

\- src/features/terrain/

\- src/features/horizon/

\- src/lib/geo/



Objectif :

Ajouter une première version simplifiée de l’horizon 360 autour du point d’observation.



Fonctionnalités attendues :

1\. Échantillonner plusieurs azimuts autour de l’observateur.

2\. Calculer un angle d’horizon simplifié pour chaque azimut.

3\. Afficher un graphique simple :

&#x20;  - azimut ;

&#x20;  - angle horizon.

4\. Mettre en évidence l’azimut du coucher du soleil.

5\. Afficher un état loading progressif.

6\. Permettre d’annuler ou éviter les calculs trop longs si nécessaire.



Architecture attendue :

Créer :



src/features/horizon360/

&#x20; horizon360Types.ts

&#x20; horizon360Service.ts

&#x20; Horizon360Chart.tsx

&#x20; useHorizon360.ts



Contraintes :

\- Ne pas chercher une précision maximale dans cette étape.

\- Ne pas intégrer LiDAR HD.

\- Ne pas ajouter de backend.

\- Ne pas bloquer l’UI pendant les calculs.

\- Prévoir peu d’azimuts au départ, par exemple tous les 10° ou 15°.

\- Utiliser le TerrainProvider existant.

\- Garder le graphique lisible sur mobile.



Avant de coder :

1\. Analyse l’état actuel.

2\. Propose un plan court.

3\. Liste les fichiers créés ou modifiés.

4\. Attends validation.



Après implémentation :

\- vérifier npm run build ;

\- tester avec le provider mock ;

\- tester avec peu d’azimuts avant d’augmenter la résolution.

