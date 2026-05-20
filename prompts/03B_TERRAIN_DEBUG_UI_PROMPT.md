# Prompt Cursor — Interface de diagnostic terrain IGN

Lis avant de modifier le code :

- [AGENTS.md](http://AGENTS.md)

- [README.md](http://README.md)

- docs/02_[ARCHITECTURE.md](http://ARCHITECTURE.md)

- docs/03_[ALGORITHM.md](http://ALGORITHM.md)

- docs/04_DATA_[SOURCES.md](http://SOURCES.md)

- docs/05_UX_[UI.md](http://UI.md)

- docs/06_DESIGN_[SYSTEM.md](http://SYSTEM.md)

- prompts/03_IGN_CLIENT_[PROMPT.md](http://PROMPT.md)

- src/features/terrain/

- src/features/location/

- src/lib/geo/

Objectif :

Ajouter une interface de diagnostic simple pour vérifier que les données altimétriques récupérées depuis le client terrain sont exploitables.

Fonctionnalités attendues :

1. Afficher l’altitude estimée du point d’observation.

2. Afficher la source utilisée : mock ou IGN réel.

3. Permettre de lancer une récupération de profil terrain mocké.

4. Afficher une liste synthétique des points du profil :

   - distance ;

   - latitude ;

   - longitude ;

   - altitude.

5. Afficher les erreurs réseau ou API de manière lisible.

6. Ajouter un badge “mode mock” si le fournisseur mock est utilisé.

Contraintes :

- Ne pas implémenter encore le moteur horizon.

- Ne pas calculer encore l’heure corrigée.

- Ne pas complexifier l’interface principale.

- L’UI doit être considérée comme un panneau de diagnostic temporaire ou semi-avancé.

- Toute logique réseau doit rester dans src/features/terrain/.

- Les composants ne doivent pas appeler fetch directement.

- Garder l’application compatible GitHub Pages.

Avant de coder :

1. Analyse l’état actuel.

2. Propose un plan court.

3. Liste les fichiers créés ou modifiés.

4. Attends validation.

Après implémentation :

- vérifier npm run build ;

- vérifier que le mode mock fonctionne sans API externe ;

- vérifier que l’interface affiche une erreur propre si l’API réelle échoue.