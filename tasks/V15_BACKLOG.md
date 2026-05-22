# Backlog — Sunset Horizon V1.5

## Statut de départ

- [x] MVP implémenté.
- [x] Calcul du coucher corrigé fonctionnel.
- [x] Carte et profil altimétrique intégrés.
- [x] Recherche d’adresse intégrée.
- [x] Spots sauvegardés localement.
- [x] Application responsive MVP.

## Epic 1 — Réglages avancés de calcul

Objectif : permettre à l’utilisateur d’ajuster précision, performance et comportement du calcul.

Statut : terminé.

- [x] Créer `CalculationSettings`.
- [x] Créer les presets `fast`, `balanced`, `precise`.
- [x] Ajouter `maxDistanceM`.
- [x] Ajouter `sampleStepM`.
- [x] Ajouter `timeStepSeconds`.
- [x] Ajouter `refinementStepSeconds`.
- [x] Ajouter `refractionEnabled`.
- [x] Ajouter validation des valeurs.
- [x] Ajouter valeurs par défaut sûres.
- [x] Persister les réglages en localStorage.
- [x] Créer un panneau repliable de réglages avancés.
- [x] Brancher les réglages sur le calcul terrain / horizon.
- [x] Ajouter tests unitaires des presets.
- [x] Ajouter tests unitaires de validation.

Critères d’acceptation :

- [x] Les trois modes produisent des paramètres cohérents.
- [x] Les valeurs invalides sont corrigées ou refusées.
- [x] Le calcul MVP fonctionne toujours avec les paramètres par défaut.
- [x] Les réglages persistent après rechargement.
- [x] `npm test` passe.
- [x] `npm run build` passe.

## Epic 2 — Historique local des calculs

Objectif : conserver localement les derniers calculs utiles pour un spot.

Statut : terminé.

- [x] Créer `CalculationHistoryEntry`.
- [x] Associer un historique à un spot sauvegardé.
- [x] Enregistrer date d’observation.
- [x] Enregistrer heure officielle.
- [x] Enregistrer heure corrigée.
- [x] Enregistrer delta minutes.
- [x] Enregistrer azimut du coucher.
- [x] Enregistrer angle horizon.
- [x] Enregistrer distance du point bloquant.
- [x] Enregistrer source terrain.
- [x] Enregistrer warnings.
- [x] Enregistrer réglages utilisés.
- [x] Limiter le nombre d’entrées par spot.
- [x] Afficher les dernières entrées dans l’UI.
- [x] Ajouter suppression de l’historique d’un spot.
- [x] Ajouter tests de persistance.

Critères d’acceptation :

- [x] Un calcul réussi peut être rattaché à un spot.
- [x] Les historiques sont conservés après rechargement.
- [x] Les entrées anciennes sont limitées ou nettoyées.
- [x] Une corruption localStorage ne casse pas l’application.
- [x] `npm test` passe.
- [x] `npm run build` passe.

## Epic 3 — Cache local IndexedDB des profils terrain

Objectif : éviter les téléchargements / recalculs de profils identiques ou très proches.

Statut : terminé.

- [x] Créer `src/features/cache/`.
- [x] Créer `TerrainProfileCacheEntry`.
- [x] Créer `cacheKey.ts`.
- [x] Intégrer position observateur arrondie dans la clé.
- [x] Intégrer azimut arrondi dans la clé.
- [x] Intégrer distance maximale dans la clé.
- [x] Intégrer pas d’échantillonnage dans la clé.
- [x] Intégrer version d’algorithme dans la clé.
- [x] Ajouter TTL long (30 jours).
- [x] Ajouter lecture cache.
- [x] Ajouter écriture cache.
- [x] Ajouter suppression du cache.
- [x] Ajouter estimation de taille si possible.
- [x] Gérer IndexedDB indisponible.
- [x] Ne jamais bloquer le calcul si le cache échoue.
- [x] Brancher le cache au terrain provider.
- [x] Ajouter tests cache hit / cache miss.

Critères d’acceptation :

- [x] Un profil identique est relu depuis le cache.
- [x] Un changement de paramètres crée une nouvelle clé.
- [x] Une erreur IndexedDB bascule vers le calcul normal.
- [x] Le cache peut être vidé depuis l’interface.
- [x] `npm test` passe.
- [x] `npm run build` passe.

## Epic 4 — Comparaison de spots

Objectif : comparer plusieurs lieux sauvegardés pour une même date.

- [ ] Créer `src/features/comparison/`.
- [ ] Créer modèle `SpotComparisonResult`.
- [ ] Sélectionner plusieurs spots.
- [ ] Choisir une date commune.
- [ ] Appliquer les réglages courants.
- [ ] Lancer les calculs avec concurrence limitée.
- [ ] Afficher loading par spot.
- [ ] Afficher erreurs par spot.
- [ ] Afficher heure officielle.
- [ ] Afficher heure corrigée.
- [ ] Afficher delta.
- [ ] Afficher azimut.
- [ ] Afficher distance du relief bloquant.
- [ ] Afficher angle horizon.
- [ ] Afficher source terrain.
- [ ] Mettre en avant le spot avec coucher corrigé le plus tard.
- [ ] Ajouter tri par heure corrigée, delta, nom et statut.
- [ ] Ajouter limite de spots simultanés.
- [ ] Ajouter option pour sauvegarder le résultat dans l’historique.

Critères d’acceptation :

- [ ] La comparaison fonctionne avec au moins deux spots.
- [ ] Une erreur sur un spot ne bloque pas les autres.
- [ ] Le meilleur spot est clairement identifié.
- [ ] L’UI reste lisible sur mobile.
- [ ] `npm test` passe.
- [ ] `npm run build` passe.

## Epic 5 — URL partageable sans backend

Objectif : permettre de rouvrir ou partager une configuration sans compte utilisateur.

- [ ] Définir les paramètres supportés dans l’URL.
- [ ] Inclure latitude.
- [ ] Inclure longitude.
- [ ] Inclure date d’observation.
- [ ] Inclure mode de précision.
- [ ] Inclure éventuellement réfraction activée.
- [ ] Ne pas inclure de nom privé par défaut.
- [ ] Ajouter parsing robuste au chargement.
- [ ] Ajouter validation des paramètres.
- [ ] Ajouter bouton “Copier le lien”.
- [ ] Ajouter message de succès / erreur.
- [ ] Ajouter tests de parsing / sérialisation.

Critères d’acceptation :

- [ ] Un lien copié rouvre le même point.
- [ ] Un lien copié rouvre la même date.
- [ ] Les paramètres invalides sont ignorés proprement.
- [ ] Aucune donnée privée inutile n’est exposée.
- [ ] `npm test` passe.
- [ ] `npm run build` passe.

## Epic 6 — Export / import JSON local

Objectif : permettre à l’utilisateur de sauvegarder et transférer ses données locales.

- [ ] Définir `SunsetHorizonExport`.
- [ ] Exporter spots.
- [ ] Exporter réglages.
- [ ] Exporter historiques.
- [ ] Ne pas exporter le cache IndexedDB par défaut.
- [ ] Ajouter version de schéma.
- [ ] Ajouter date d’export.
- [ ] Ajouter bouton export JSON.
- [ ] Ajouter import JSON.
- [ ] Valider le fichier importé.
- [ ] Proposer fusion ou remplacement.
- [ ] Gérer conflits d’id.
- [ ] Afficher résumé avant import.
- [ ] Ajouter tests d’import valide / invalide.

Critères d’acceptation :

- [ ] L’export produit un JSON lisible.
- [ ] L’import restaure spots, réglages et historiques.
- [ ] Un JSON invalide ne casse pas l’application.
- [ ] Le cache n’est pas exporté sauf choix explicite futur.
- [ ] `npm test` passe.
- [ ] `npm run build` passe.

## Epic 7 — Panneau diagnostic du calcul

Objectif : rendre le calcul vérifiable et faciliter le debug.

- [ ] Créer `src/features/diagnostics/`.
- [ ] Créer `CalculationDiagnostic`.
- [ ] Mesurer temps de calcul total.
- [ ] Afficher mode de précision utilisé.
- [ ] Afficher distance max.
- [ ] Afficher pas d’échantillonnage.
- [ ] Afficher nombre d’échantillons terrain.
- [ ] Afficher azimut du calcul.
- [ ] Afficher angle horizon.
- [ ] Afficher point bloquant.
- [ ] Afficher source terrain.
- [ ] Afficher cache hit / miss si disponible.
- [ ] Afficher warnings.
- [ ] Afficher erreurs techniques utiles.
- [ ] Ajouter panneau repliable masqué par défaut.
- [ ] Prévoir affichage mobile lisible.

Critères d’acceptation :

- [ ] L’utilisateur peut comprendre quel calcul a été effectué.
- [ ] Le panneau ne surcharge pas l’écran principal.
- [ ] Les informations sensibles ne sont pas exposées inutilement.
- [ ] `npm run build` passe.

## Epic 8 — Horizon 360 simplifié

Objectif : visualiser l’horizon effectif autour de l’observateur.

- [ ] Créer `src/features/horizon360/`.
- [ ] Créer `Horizon360Sample`.
- [ ] Créer `horizon360Service`.
- [ ] Échantillonner les azimuts tous les 15° par défaut.
- [ ] Utiliser mode rapide par défaut.
- [ ] Réutiliser les réglages si compatibles.
- [ ] Réutiliser le cache terrain.
- [ ] Calculer angle horizon par azimut.
- [ ] Afficher progression.
- [ ] Permettre annulation.
- [ ] Ne pas recalculer automatiquement.
- [ ] Afficher graphique azimut / angle horizon.
- [ ] Mettre en évidence azimut du coucher.
- [ ] Afficher warnings en cas de calcul partiel.
- [ ] Ajouter tests avec terrain provider mock.

Critères d’acceptation :

- [ ] Le calcul est déclenché manuellement.
- [ ] L’UI ne se bloque pas.
- [ ] Un calcul partiel reste exploitable.
- [ ] L’azimut du coucher est visible.
- [ ] `npm test` passe.
- [ ] `npm run build` passe.

## Epic 9 — Validation et polish V1.5

Objectif : livrer une version confortable et cohérente.

- [ ] Vérifier tous les parcours MVP.
- [ ] Vérifier réglages avancés.
- [ ] Vérifier historique.
- [ ] Vérifier cache.
- [ ] Vérifier comparaison.
- [ ] Vérifier URL partageable.
- [ ] Vérifier export/import.
- [ ] Vérifier diagnostic.
- [ ] Vérifier horizon 360.
- [ ] Tester mobile.
- [ ] Tester tablette.
- [ ] Tester desktop large.
- [ ] Tester erreur GPS.
- [ ] Tester erreur géocodage.
- [ ] Tester erreur IGN.
- [ ] Tester localStorage indisponible.
- [ ] Tester IndexedDB indisponible.
- [ ] Mettre à jour README.
- [ ] Mettre à jour documentation utilisateur.
- [ ] Mettre à jour limites connues.

Critères d’acceptation :

- [ ] Tous les parcours principaux fonctionnent.
- [ ] Les erreurs sont explicites.
- [ ] Le build GitHub Pages reste compatible.
- [ ] `npm test` passe.
- [ ] `npm run build` passe.
