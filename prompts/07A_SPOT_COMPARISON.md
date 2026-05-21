\# Prompt Cursor — V1.5 Comparaison de spots



Lis avant de modifier le code :

\- AGENTS.md

\- README.md

\- docs/01\_FUNCTIONAL\_SPEC.md

\- docs/05\_UX\_UI.md

\- docs/06\_DESIGN\_SYSTEM.md

\- docs/07\_ROADMAP.md

\- src/features/spots/

\- src/features/results/

\- src/features/horizon/



Objectif :

Permettre à l’utilisateur de comparer plusieurs spots sauvegardés pour une même date.



Fonctionnalités attendues :

1\. Sélectionner plusieurs spots sauvegardés.

2\. Lancer un calcul pour chaque spot sélectionné.

3\. Afficher un tableau comparatif :

&#x20;  - nom du spot ;

&#x20;  - coucher officiel ;

&#x20;  - coucher corrigé ;

&#x20;  - décalage ;

&#x20;  - distance du relief bloquant ;

&#x20;  - angle horizon ;

&#x20;  - statut du calcul.

4\. Mettre en avant le spot avec le coucher visible le plus tard.

5\. Gérer les erreurs par spot sans bloquer toute la comparaison.



Architecture attendue :

Créer :



src/features/comparison/

&#x20; SpotComparisonPage.tsx

&#x20; SpotComparisonTable.tsx

&#x20; comparisonTypes.ts

&#x20; useSpotComparison.ts



Contraintes :

\- Ne pas ajouter de backend.

\- Ne pas ajouter Supabase.

\- Réutiliser les fonctions existantes.

\- Ne pas dupliquer la logique horizon.

\- Les composants doivent rester lisibles sur mobile.

\- Prévoir un état loading par spot.



Avant de coder :

1\. Analyse l’état actuel.

2\. Propose un plan court.

3\. Liste les fichiers créés ou modifiés.

4\. Attends validation.



Après implémentation :

\- vérifier npm run build ;

\- tester avec au moins deux spots sauvegardés ;

\- vérifier les cas d’erreur partielle.

