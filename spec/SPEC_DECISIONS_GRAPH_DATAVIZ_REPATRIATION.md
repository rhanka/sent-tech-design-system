# Décisions ouvertes — Programme graph/dataviz

Date : 2026-09-15. Préparation : Astra. Destinataire de la restitution : owner, via conducteur `design-system` et module h2a-focus avec le DS. **Incomplete : challenges fable 5.1 et gemini 3.7 non encore reçus.** Les recommandations sont des jugements provisoires ; aucune option n'est sélectionnée, aucune compréhension ou signature n'est présumée. Les travaux M0 et le déplacement conservatoire M1 continuent indépendamment.

Format de transmission : chaque dossier ci-dessous contient son contexte et ses critères ; le fichier JSON compagnon fournit `id`, `title`, `context`, `options`, `recommendation`, `targets` et le texte intégral pour Track/Focus. Le conducteur présente ce lot de quatre questions après réconciliation des deux challenges. L'owner n'a pas à rouvrir les décisions déjà prises : dépôt DS, six noms de packages, réemploi Sentropic et absence de dépendances tierces implicites.

## D1 — Quel contrat persistant pour les documents et profils métier ?

### 1. Décision demandée

Choisir le contrat de stockage public M2 des documents sémantiques, vues et profils BPMN/ArchiMate/UML : **A** noyau typé avec profils versionnés ; **B** documents natifs séparés par domaine ; **C** format source comme document maître et vues dérivées.

### 2. Contexte

**[FACT]** Le mandat §4 impose cinq objets distincts (sémantique, vues/occurrences, projection, scène, AST/CST) et des modèles plus riches que nodes/edges. Les packages actuels portent des buffers de rendu et modèles de charts, pas ce contrat documentaire : [étude §4](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md). **[JUDGMENT]** Un noyau commun peut factoriser identités, transactions et vues si les contraintes de chaque profil restent exécutables. **Unknown :** tailles des documents métier réels, extensions fournisseurs et règles de compatibilité attendues par leurs propriétaires.

### 3. Enjeux

**[JUDGMENT]** Schéma persistant/public et migration multi-repos : ce choix déterminera les coûts de validation, codecs, undo et compatibilité sur plusieurs releases. Cibles : `GD-M2-MODEL`, puis M3/M4 ; M1 reste indépendant.

### 4. Options

| ID | Choix | Meilleur argument pour | Meilleur argument contre | Coût relatif | Réversibilité | Condition qui le ferait gagner |
|---|---|---|---|---|---|---|
| A | Noyau typé de références/relations/vues + profils versionnés à schéma explicite | Invariants/transactions mutualisés ; multi-vues cohérentes | Risque de schéma commun trop pauvre ou trop général | moyen puis migrations de profils | facile avant publication, coûteuse après données persistées | mêmes opérations d'édition requises sur plusieurs domaines |
| B | Modèle natif indépendant BPMN, ArchiMate, UML ; projection commune | Règles métier proches des standards ; moins d'abstraction forcée | Multiplication des adaptateurs/commandes ; liens entre modèles plus coûteux | élevé en infrastructure partagée | migrations indépendantes mais nombreuses | invariants métier incompatibles avec le noyau A après fixtures |
| C | Texte/XML natif maître ; AST/CST et vues dérivées | Intégration outils existants et conservation des sources | Édition visuelle multi-source et commandes atomiques plus complexes | moyen pour lecture, élevé pour édition | coûteuse si l'éditeur s'appuie sur un dialecte | la majorité des utilisateurs éditent le texte dans un outil externe |

Les coûts sont des **[JUDGMENT]**, sans estimation calendrier avant fixtures.

### 5. Recommandation

**A, provisoire [JUDGMENT].** Isoler un petit noyau de références/vues/transactions et valider les règles métier dans des profils explicitement versionnés. Ne figer le schéma qu'après une fixture BPMN multi-vues et une ArchiMate avec contraintes de relations. B gagne si ces fixtures imposent des exceptions structurelles au noyau.

### 6. Réversibilité / coût

**[JUDGMENT]** L'étude et les types expérimentaux sont réversibles ; la publication d'un format persistant crée un coût de migration. Conserver les originaux et un registre de migrations limite le coût de retour. Investissement irrécupérable : codecs écrits sur un modèle finalement abandonné. Durée : unknown avant tranche prototype.

### 7. Attendus

| Critère | Source | Couvert par | Gap |
|---|---|---|---|
| multi-occurrences et identité métier distinctes | mandat §4 | A/B/C via vues séparées | fixture propriétaire à qualifier |
| règles métier exécutables | mandat §4/10 | profils A, natifs B, validateurs source C | versions et extensions réelles |
| mêmes commandes humain/agent | mandat §6 | transaction M2 | revue du schéma public |
| aucune perte silencieuse | mandat §4 | rapports conversion/migration | à prouver par fixture |

### 8. Réponse attendue et audit du biais

Après challenge : **A, B ou C**, avec les contraintes de données qui invalideraient l'option retenue.

- **Meilleure objection à A :** une abstraction commune peut faire disparaître des règles métier importantes sous des extensions pourtant stockées ; leur conservation ne vaut pas leur compréhension.
- **Ce qui renverserait la recommandation :** des fixtures ne pouvant exprimer containment, endpoints ou profils sans échappatoire non validée.
- **Pré-mortem :** dans six mois les imports semblent réussir mais l'éditeur ne peut valider ni réexporter les extensions essentielles ; les utilisateurs ne font plus confiance au document canonique.
- **Intérêt agent :** A réduit le nombre d'infrastructures à maintenir et facilite mes modifications ; cela pourrait sous-estimer le coût métier des exceptions.
- **Intérêt owner :** invariants contrôlables, données durables, coût de migration et interop vérifiable.
- **Revue :** fable 5.1 et gemini 3.7 pending ; recommandation non ratifiée.

## D2 — Comment transférer les releases et la publication npm ?

### 1. Décision demandée

Choisir la politique de versions/publication après rapatriement : **A** graph indépendant + famille dataviz lockstep + DS existant ; **B** tout le monorepo DS en lockstep ; **C** chaque package indépendamment avec versions compatibles déclarées.

### 2. Contexte

**[FACT]** Graph 0.2.0 utilise une publication manuelle documentée ; dataviz utilise OIDC sur tags `v*` pour quatre packages, Angular étant privé. Dataviz HEAD est trois commits après `v0.4.52`. Le DS a déjà sa machinerie de release : [inventaire consolidé](../docs/graph-dataviz-source-map.md), [plan de streams](../plan/00-SEGMENTATION-STREAMS.md). **[JUDGMENT]** Conserver les familles limite les changements de versions consommateurs. **Unknown :** configuration effective des trusted publishers npm et droits de transfert du dépôt pour chaque nom.

### 3. Enjeux

Contrat de distribution et responsabilités multi-repos ; collisions de tags/workflows et risque de publier le mauvais snapshot. Cible : phase release de `GD-M1-PACKAGING`. Copier/tester les packages n'attend pas cette réponse.

### 4. Options

| ID | Choix | Meilleur argument pour | Meilleur argument contre | Coût relatif | Réversibilité | Condition qui le ferait gagner |
|---|---|---|---|---|---|---|
| A | graph indépendant ; dataviz lockstep ; DS garde ses familles | Continuité consommateur ; cadence adaptée aux bibliothèques | Plusieurs pipelines et matrice compat DS↔dataviz à maintenir | moyen | règles réversibles, versions publiées immuables | propriétaires/cadences réellement distincts |
| B | Un numéro/version et train de release global | Snapshot cohérent simple ; une recette d'intégration | Bumps massifs sans changement et couplage de toutes les cadences | élevé à la transition | difficile après adoption | consommateurs adoptent toujours l'ensemble du monorepo |
| C | Versions et releases indépendantes par package | Releases ciblées ; minimum de bumps inutiles | Matrice compat et cohérence des quatre adapters plus complexes | élevé en outillage | flexible mais retour lockstep coûteux | usages/cadences des adaptateurs divergent durablement |

Coûts et conditions : **[JUDGMENT]**.

### 5. Recommandation

**A, provisoire [JUDGMENT].** Conserver les contrats connus, définir des tags non ambigus et prouver la résolution locale des versions avant publication. Un seul dépôt publie chaque nom après bascule des trusted publishers ; les anciens workflows cessent de publier ces bibliothèques.

### 6. Réversibilité / coût

Les manifestes/CI sont réversibles jusqu'au publish. Une version npm publiée ne doit pas être remplacée : correction par nouvelle version. Coûts : configuration registry, preuves pack/consumer, décommission des anciens publishers. Durée : unknown tant que l'accès de publication n'est pas vérifié.

### 7. Attendus

| Critère | Source | Couvert par | Gap |
|---|---|---|---|
| noms conservés | mandat règles dures | A/B/C | aucun renommage proposé |
| packaging/peers/CSS/lockfile | mandat §9/10 | M1 tests tarballs | matrice 4 adaptateurs |
| OIDC et publisher unique | mandat §8/9 | S6 migration workflows | droits registry non audités |
| absence de version consommée ambiguë | drift inventaire dataviz | release manifest + consumer smoke | politique à choisir |

### 8. Réponse attendue et audit du biais

Après challenge : **A, B ou C**. La configuration des droits npm sera vérifiée avant toute publication.

- **Meilleure objection à A :** conserver les familles conserve aussi la complexité qui a déjà permis le drift de release.
- **Ce qui renverserait la recommandation :** tous les consommateurs exigent un unique snapshot atomique DS+dataviz, ou un outil de release existant élimine le coût B.
- **Pré-mortem :** deux dépôts publient encore le même nom, un tag hérite du mauvais workflow et la version npm ne correspond pas à la recette consommateur.
- **Intérêt agent :** A minimise mes changements de pipeline initiaux ; cela ne garantit pas le moindre coût de maintenance owner.
- **Intérêt owner :** livraison fiable, traçabilité commit→artefact→consommateur, cadence maîtrisée.
- **Revue :** fable 5.1 et gemini 3.7 pending ; recommandation non ratifiée.

## D3 — Quelle garantie qualifier en premier sur les pivots ?

### 1. Décision demandée

Choisir le niveau d'engagement M4 par format : **A** sous-ensembles sémantiques et vues explicitement qualifiés, extensions conservées ; **B** fidélité aller-retour d'un dialecte/outillage pilote par domaine avant élargissement ; **C** import large en lecture avec diagnostic, puis édition/export plus tard.

### 2. Contexte

**[FACT]** Le mandat exige UML/PlantUML, Mermaid, BPMN XML+DI, ArchiMate Open Group Exchange, draw.io et Sparx EA XMI/profils avec rapports de pertes. Il refuse un aller-retour universel sans perte. Aucun de ces codecs n'est déjà fourni par les six packages inventoriés. **[FACT]** BPMN et ArchiMate natifs restent obligatoires en M3 quel que soit ce choix. Source : [étude §4/5](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md). **Unknown :** dialectes/version d'EA, profils UML, bibliothèques draw.io et familles Mermaid réellement prioritaires.

### 3. Enjeux

Contrat de données et confiance utilisateurs ; couverture large et fidélité approfondie n'ont pas le même coût. Cible : `GD-M4-CODECS`. Le noyau et les deux profils natifs M3 avancent indépendamment.

### 4. Options

| ID | Choix | Meilleur argument pour | Meilleur argument contre | Coût relatif | Réversibilité | Condition qui le ferait gagner |
|---|---|---|---|---|---|---|
| A | Petit sous-ensemble prouvé pour chaque pivot, extensions conservées et diagnostic | Couverture de tous les pivots ; engagement mesurable par fixture | Première couverture peu profonde ; cas métier riches bloqués | moyen puis incréments | forte avant promesse de fidélité | plusieurs formats nécessaires dès le lancement |
| B | Un dialecte outil/version pilote profond par domaine | Migration réelle plus sûre ; aller-retour utile sur données propriétaire | Collecte de fixtures et couplage vendeur ralentissent la largeur | élevé initial | moyenne, fixtures réutilisables | reprise de documents complexes existants prioritaire |
| C | Import large read-only avec diagnostics puis édition/export | Exploration rapide ; visibilité immédiate des sources | Peut reporter longtemps l'édition interop et ne ferme pas M4 | faible entrée, élevé différé | forte pour lecture | besoin immédiat d'inventorier/visualiser un patrimoine |

Coûts et effets : **[JUDGMENT]**.

### 5. Recommandation

**A, provisoire [JUDGMENT]**, avec une fixture pilote représentative par format et bascule vers B si une perte déclarée touche une opération owner indispensable. L'API signale chaque conversion/dégradation ; aucun label « supporté » global sans matrice par version/famille.

### 6. Réversibilité / coût

Codecs et fixtures se réutilisent ; les promesses de compatibilité publiques se rétractent difficilement. Retour possible : garder le source original en lecture, bloquer seulement l'export destructeur et publier une version de codec plus précise. Calendrier unknown faute de corpus pilote.

### 7. Attendus

| Critère | Source | Couvert par | Gap |
|---|---|---|---|
| tous les pivots inventoriés et planifiés | mandat §4 | matrice A/B/C et catalogue | priorités/familles à qualifier |
| rapport sans perte silencieuse | mandat §4 | rapport par champ/élément | corpus de qualification |
| BPMN/ArchiMate natifs | mandat §9 M3 | M3 indépendant | validation native reste à construire |
| ne pas inventer format universel EA | mandat §4 | dialecte/version explicites | versions EA owner unknown |

### 8. Réponse attendue et audit du biais

Après challenge : **A, B ou C**, et le format/dialecte dont la perte serait inacceptable pour le premier usage. Sans corpus externe, des fixtures Sentropic versionnées permettent le développement, avec qualification propriétaire `unverified`.

- **Meilleure objection à A :** une série de petits sous-ensembles peut produire une belle matrice sans importer utilement un seul document propriétaire complet.
- **Ce qui renverserait la recommandation :** un patrimoine existant sur un outil dominant est la principale source de valeur de M4.
- **Pré-mortem :** chaque format a une démo verte mais les propriétés/diagrammes indispensables au métier apparaissent systématiquement dans les pertes ; personne ne peut migrer.
- **Intérêt agent :** A répartit le travail en tâches testables et permet des gains visibles rapides ; cela peut surestimer la valeur de la largeur.
- **Intérêt owner :** documents effectivement utilisables, fidélité explicite, visibilité du coût d'une reprise complète.
- **Revue :** fable 5.1 et gemini 3.7 pending ; recommandation non ratifiée.

## D4 — Quel seuil avant la publication de dataviz-angular ?

### 1. Décision demandée

Choisir le seuil d'ouverture publique du package Angular une fois rapatrié en M1 : **A** tranche M3 complète et parité des contrats partagés, puis expansion mesurée ; **B** toute la couverture des trois autres adaptateurs avant publication ; **C** publier d'abord le seam expérimental actuel clairement limité.

### 2. Contexte

**[FACT]** `dataviz-angular` est privé, fournit le bridge signals et deux composants, et dépend d'un tarball local DS. Les trois autres adaptateurs ont chacun plus d'une centaine de composants. Ses 510 exports incluent surtout les 495 réexports core : ce nombre ne mesure pas la parité UI. Sources : [correspondance](../docs/graph-dataviz-source-map.md), [audit DS](../docs/graph-dataviz-ds-audit.md). **[FACT]** Le mandat exige de rapatrier les cinq packages et de piloter les quatre frameworks de façon équilibrée. Ce dossier ne remet pas le rapatriement Angular en question.

### 3. Enjeux

Calendrier/coût de parité et contrat public d'un nouveau package ; confiance des consommateurs Angular. Cible : `GD-M2-PARITY` et future publication `GD-M1-DATAVIZ-ANGULAR`. Le déplacement privé avec résolution workspace est indépendant.

### 4. Options

| ID | Choix | Meilleur argument pour | Meilleur argument contre | Coût relatif | Réversibilité | Condition qui le ferait gagner |
|---|---|---|---|---|---|---|
| A | Tranche M3 identique sur 4 frameworks avant public, dette globale visible | Parcours utile complet ; feedback Angular avant backlog entier | Grande différence de catalogue demeure temporairement | moyen avant public | moyenne après adoption du contrat | usages pilotes concentrés sur la tranche diagramme/dashboard |
| B | Catalogue UI complet et tests équivalents avant public | Promesse de parité simple ; aucune surprise de composant absent | Retarde fortement les premiers usages Angular | élevé avant public | faible coût de promesse, gros coût initial | les consommateurs attendent interchangeabilité immédiate |
| C | Seam actuel expérimental publié après packaging/SSR | Accès rapide aux signals et 2 composants ; feedback réel | Le label expérimental peut durer et fragmenter les usages | faible avant public | moyenne, consommateurs à migrer | besoin Angular immédiat limité au seam actuel |

Coûts et conséquences : **[JUDGMENT]**.

### 5. Recommandation

**A, provisoire [JUDGMENT].** Mesurer une tranche utile avec les mêmes scénarios et contrats sur quatre frameworks ; publier la matrice des absences. Affecter le travail restant à S2, sans comptabiliser les réexports core comme des composants livrés.

### 6. Réversibilité / coût

Garder le package privé pendant M1 ne casse aucun consommateur npm. Après publication les callbacks/peers/types deviennent un engagement semver. Coût principal : composants manquants, tests clavier/SSR et wrappers store ; durée unknown avant comparaison détaillée des usages prioritaires.

### 7. Attendus

| Critère | Source | Couvert par | Gap |
|---|---|---|---|
| cinq packages rapatriés | mandat §1 | M1 dans A/B/C | aucun package exclu |
| quatre frameworks équilibrés | mandat §8 | même gate de tranche A ou catalogue B | seuil de publication à choisir |
| private/tarball traités explicitement | inventaire Angular | workspace M1 + décision avant npm | preuve publish consumer |
| a11y/SSR/clavier/IME | mandat §10 | gate commun et cas Angular | couverture actuelle partielle |

### 8. Réponse attendue et audit du biais

Après challenge : **A, B ou C**, en indiquant si un consommateur Angular exige le catalogue entier dès sa première version.

- **Meilleure objection à A :** une tranche choisie trop étroite peut différer indéfiniment l'égalité des frameworks malgré une publication annoncée comme prête.
- **Ce qui renverserait la recommandation :** un consommateur doit substituer Angular aux trois autres frameworks sur tout le catalogue immédiatement.
- **Pré-mortem :** la tranche pilote marche mais les équipes réécrivent tous les composants absents ; une deuxième bibliothèque Angular apparaît hors du DS.
- **Intérêt agent :** A réduit la masse de travail initiale ; cela pourrait transférer au consommateur le coût des manques.
- **Intérêt owner :** une capacité réellement utilisable et testée, une dette chiffrée et un engagement de parité explicite.
- **Revue :** fable 5.1 et gemini 3.7 pending ; recommandation non ratifiée.
