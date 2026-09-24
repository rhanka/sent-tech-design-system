# SPEC EVOL — GD-DATAVIZ-DOCS : documenter les composants dataviz sur les quatre frameworks

Statut : cadrage, 2026-09-24.
Programme : [étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md), [plan](../plan/10-BRANCH_graph-dataviz-repatriation.md),
[relevé de parité](../docs/dataviz-docs-parity.md).
Décision owner appliquée : **documenter les quatre frameworks** (Svelte, React, Vue, Angular).

## 1. Point de départ (vérifié le 2026-09-24 sur `main`)

- **119 composants dataviz distincts** (union des barils svelte et react), dont **116 enveloppent un
  composant du design system** qui existe déjà dans les quatre frameworks ; trois n'en ont pas
  (`UrlSync`, `WebFrame`, `TimeSeriesLineChart`).
- **69 de ces 119 portent le nom d'un composant DS natif déjà documenté** (« homonymes » du relevé).
- Le catalogue du site compte **205 entrées** pour **207 routes** sous `apps/docs/src/routes/components/`,
  et **aucune page d'adaptateur dataviz** : la parité annoncée n'est aujourd'hui montrée nulle part.
- La parité Angular est en cours : **12 adaptateurs sur 119** au moment d'écrire, les autres arrivant
  par lots de 20 à 25 (voir `PATTERN.md` du paquet et la ligne `GD-M2-PARITY` du plan).
- Convention de page en vigueur : `TabbedExample` avec démos Svelte/React/Vue/Angular, table d'API,
  table des tokens CSS ; 199 des 206 pages la suivent, et le portail qualité exige un score ≥ 95.

## 2. Décision de structure (réversible, prise ici)

**Un composant homonyme n'obtient pas une seconde page.** Il gagne une **section « piloté par store »**
sur sa page existante : un second `TabbedExample` dont les démos consomment un `DashboardStore`, la
table de props de l'adaptateur, et une phrase qui nomme la différence de contrat (le composant DS
reçoit ses données, l'adaptateur les dérive d'un store partagé).

Motif : 69 pages quasi jumelles doubleraient le catalogue sans rien apprendre, dilueraient la
recherche et multiplieraient par deux le coût de toute évolution de composant. La page d'un composant
doit raconter ses deux modes d'emploi, pas exister deux fois.

**Un composant sans homonyme obtient sa page**, à la convention, catégorie `data`.

## 3. Travail demandé, par lots alignés sur la parité Angular

Un lot de documentation **suit** le lot de parité correspondant : on ne documente pas un onglet
Angular qui n'existe pas. Chaque lot livre, pour ses composants :

1. l'entrée de catalogue (`apps/docs/src/lib/components-catalog.ts`), catégorie `data`, statut
   `documented`, description d'une ligne ;
2. la section « piloté par store » sur la page existante, ou la page complète pour un composant sans
   homonyme ;
3. les démos des **quatre** frameworks dans `apps/docs/src/lib/framework/examples.ts`, chacune
   construisant un store minimal et réel — pas un store simulé ;
4. l'entrée d'index de recherche (`docs-search-index.ts`) et les libellés `i18n.ts` ;
5. la mise à jour du relevé de parité : les composants documentés cessent d'être comptés comme
   « absents du catalogue DS ».

### 3.1 Les trois composants sans composant DS sous-jacent

`UrlSync`, `WebFrame` et `TimeSeriesLineChart` sont documentés en premier, parce qu'ils sont les seuls
dont le contrat n'est pas déjà décrit ailleurs sur le site, et parce que `UrlSync` n'existe pas côté
Vue : sa page doit énoncer l'absence au lieu de la masquer.

## 4. Hors périmètre

La parité Angular elle-même (`GD-M2-PARITY`), les pages des composants DS natifs, la refonte de la
recherche, toute publication npm, et le site dataviz amont — qui renvoie désormais toutes ses URL vers
ce site (dataviz #18).

## 5. Critères d'acceptation (tous exécutés et consignés)

1. **Périmètre** : le diff ne touche que `apps/docs/**`, `docs/dataviz-docs-parity.md`, `spec/**`,
   `plan/**` et `.track/**` via Track.
2. **Portes** : `npm run build`, `npm run check`, `npm test`, plus le portail qualité
   (`--fail-under 95 --warn-only csp-no-style-attr`) et `npm run csp:check`.
3. **Les quatre onglets rendent** : pour chaque composant documenté, une vérification **sur le site
   construit** que les quatre démos produisent du markup (pas seulement que l'onglet existe), sur le
   modèle de ce qui a été fait pour `PriorityMatrix`.
4. **Aucune page jumelle** : un test assère qu'aucun slug de catalogue n'est créé pour un nom qui
   possède déjà une page DS.
5. **Le compte du relevé** : après chaque lot, `docs/dataviz-docs-parity.md` porte le nombre exact de
   composants documentés et de composants restants, recalculé et non estimé.
6. **Absences énoncées** : tout composant manquant dans un framework (aujourd'hui `UrlSync` côté Vue,
   `TimeSeriesLineChart` côté React seulement) est signalé sur sa page, pas omis.
7. **Forme** : commits en anglais avec corps mesuré ; aucun trailer d'attribution ; aucun Python.

## 6. Inconnues et risques

- **Poids du bundle docs** : chaque démo store-based tire un paquet `dataviz-*` dans le site. Le
  premier lot mesure l'effet sur la taille du build et le temps de construction ; si la progression est
  linéaire et forte, le lot suivant tranche entre chargement paresseux et démos plus petites.
- **Les 69 homonymes ne sont pas tous de vrais jumeaux** : un nom identique ne garantit pas un contrat
  identique. Chaque section « piloté par store » doit être écrite en regardant les deux composants, et
  toute divergence de nom de prop ou de classe CSS est signalée plutôt que lissée.
- **Ordre de dépendance** : documenter avant que l'adaptateur Angular existe produirait un onglet vide,
  ce que le §3 interdit. La file de documentation est donc pilotée par la file de parité.
