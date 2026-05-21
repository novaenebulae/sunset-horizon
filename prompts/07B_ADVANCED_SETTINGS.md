\# Prompt Cursor — V1.5 Réglages avancés



Lis avant de modifier le code :

\- AGENTS.md

\- README.md

\- docs/03\_ALGORITHM.md

\- docs/05\_UX\_UI.md

\- docs/06\_DESIGN\_SYSTEM.md

\- src/features/solar/

\- src/features/terrain/

\- src/features/horizon/



Objectif :

Ajouter des réglages avancés permettant d’ajuster la précision et le comportement du calcul.



Réglages attendus :

1\. Distance maximale du profil terrain.

2\. Pas d’échantillonnage du profil.

3\. Réfraction atmosphérique activée / désactivée.

4\. Mode de précision :

&#x20;  - rapide ;

&#x20;  - équilibré ;

&#x20;  - précis.

5\. Réinitialisation aux valeurs par défaut.



Architecture attendue :

Créer :



src/features/settings/

&#x20; calculationSettingsTypes.ts

&#x20; defaultCalculationSettings.ts

&#x20; CalculationSettingsPanel.tsx

&#x20; useCalculationSettings.ts



Contraintes :

\- Ne pas stocker encore ces réglages en cloud.

\- localStorage autorisé si la couche spots existe déjà.

\- Ne pas rendre l’interface principale trop complexe.

\- Les réglages avancés doivent être dans un panneau repliable.

\- Les valeurs doivent être validées.

\- Les réglages doivent être utilisés par le calcul terrain / horizon.

\- Préserver des valeurs par défaut sûres.



Avant de coder :

1\. Analyse l’état actuel.

2\. Propose un plan court.

3\. Liste les fichiers créés ou modifiés.

4\. Attends validation.



Après implémentation :

\- vérifier npm run build ;

\- tester chaque mode de précision ;

\- vérifier que les valeurs invalides ne cassent pas le calcul.

