# Notices de tiers — document de politique

Ce fichier ne ship nulle part, et c'est voulu. Le manifeste racine est
`private: true` : il n'est jamais empaqueté, donc rien de ce qui est écrit ici
n'atteint un consommateur. Un fichier de notices à la racine aurait exactement
le défaut qu'on a corrigé pour le `LICENSE` — être présent dans le dépôt et
absent des 11 tarballs.

**Les notices qui font foi sont ailleurs** : chaque paquet publiable porte son
propre `LICENSE.THIRD-PARTY.md`, à sa racine, qui ne recense que ce qui le
concerne. Ce document-ci explique le dispositif, consigne ce que la génération
automatique ne peut pas déduire, et nomme ce qui reste non tranché.

## 1. Où sont les notices, et comment elles sont produites

| | |
|---|---|
| Fichier par paquet | `packages/<paquet>/LICENSE.THIRD-PARTY.md` |
| Générateur | `scripts/generate-third-party-notices.mjs` |
| Données non déductibles | `scripts/third-party-sources.json` |
| Régénérer | `npm run notices:generate` |
| Porte exécutable | `npm run licensing:check` — aussi exécutée en tête de `npm run pack:smoke` |

Le contenu est **dérivé**, pas rédigé : la fermeture transitive vient de
`package-lock.json`, et les textes de licence sont relus dans les paquets
installés. Une liste écrite à la main dérive au premier `npm install` ; celle-ci
ne peut pas, parce que `licensing:check` la régénère en mémoire et échoue si le
fichier commité diffère.

### Pourquoi `LICENSE.THIRD-PARTY.md` et pas `NOTICE`

Mesuré, npm 11.17.0 : npm n'inclut d'office, quel que soit le champ `files`, que
`package.json`, `npm-shrinkwrap.json`, et les fichiers correspondant à
`/readme{,.*}`, `/copying{,.*}`, `/license{,.*}`, `/licence{,.*}`
(`npm-packlist/lib/index.js`). **`NOTICE` n'est pas dans cette liste** : un
fichier nommé `NOTICE` ou `NOTICE.md` à la racine d'un paquet est bel et bien
écarté du tarball — vérifié par `npm pack --dry-run` sur `theme-dsfr`, où
`LICENSE` et `COPYING` passent et `NOTICE` ne passe pas.

`LICENSE.THIRD-PARTY.md` correspond à `/license{,.*}`, donc il est inclus
d'office. Aucun paquet n'a besoin d'une entrée `files` que le douzième paquet
pourrait oublier. Et la porte ne fait pas confiance à ce raisonnement : elle
mesure la composition réelle du tarball avec `npm pack --dry-run --json`.

## 2. Ce qui a été corrigé, et ce qui ne l'était pas

Dénombrement exact, mesuré sur l'arbre : **11 manifestes publiables**, dont
**10 ne déclaraient aucun champ `license`** — `packages/skills` l'avait déjà. La
racine et `apps/docs` sont `private`, donc non publiables. Sur 134 paquets sous
`packages/`, 123 sont des thèmes privés hors périmètre de publication.

À la racine, il n'y a délibérément **ni fichier `LICENSE`, ni champ `license`
dans le manifeste**. L'arbre contient 123 clones mesurés de marques privées et
des emblèmes d'État suivis ; MIT accorde le droit de sous-licencier et de
vendre, et ce droit n'est pas le nôtre sur ces fichiers.

Le champ `license` de `package.json` méritait d'être retiré au même titre que le
fichier, et ne l'avait pas été. Il est inerte pour npm — le manifeste racine est
`private: true`, il n'est jamais publié — mais il ne l'est pas pour les lecteurs
de métadonnées : la détection de licence de GitHub et les outils de SBOM lisent
`package.json`. Le laisser à `MIT` réintroduisait sous forme lisible par machine
exactement la revendication que le retrait du `LICENSE` racine venait d'écarter.
« Rien à la racine » inclut ce champ.

## 3. Redistribution au niveau des sources — lucide

C'est le point qui manquait, et ce n'était pas une omission neutre : le document
précédent affirmait que « `@sentropic/design-system-angular` n'a aucune
dépendance tierce : ses tracés d'icônes sont inlinés », en présentant l'inlining
comme une raison de ne rien devoir. C'est l'inverse.

Les faits, mesurés :

- Des chaînes de tracé SVG identiques octet pour octet aux données lucide sont
  écrites dans nos sources et compilées dans les `dist/` publiés — **dans les
  quatre ports**, Angular, React, Vue et Svelte, pas seulement dans
  `packages/components-angular/src/Icon.ts`, qui n'en porte qu'une partie.
  Étendue mesurée contre `lucide-react` 0.562.0 : Angular 43 chaînes distinctes
  dans 20 fichiers, React 27 dans 3, Vue 27 dans 4, Svelte 21 dans 1. Ces
  chiffres ne sont pas à jour parce que quelqu'un les maintient : ils sont
  recalculés à chaque génération, et les valeurs qui font foi sont dans les
  fichiers générés.
- L'en-tête `@license` que lucide place en tête de chacun de ses fichiers
  (`@license lucide-react v0.562.0 - ISC`) n'a pas été repris.
- Le port Angular ne déclare **aucune** dépendance lucide : pour lui, la copie
  est la seule forme sous laquelle lucide arrive chez le consommateur.

Lucide porte un **double régime**, et les deux branches exigent que la notice de
copyright et la notice de permission figurent dans **toute copie** :

- **ISC** — « Copyright (c) for portions of Lucide are held by Cole Bemis
  2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are
  held by Lucide Contributors 2025. »
- **MIT** (portions dérivées de Feather) — « Copyright (c) 2013-2023 Cole
  Bemis ».

Correction apportée : `packages/components-angular/src/Icon.ts` porte à nouveau
un en-tête de provenance nommant l'amont et les deux régimes, et l'inventaire
exhaustif — fichier par fichier, avec les textes intégraux des deux licences —
est généré dans le `LICENSE.THIRD-PARTY.md` de chacun des quatre ports, qui
ship. L'inventaire est **mesuré** à chaque génération en comparant nos sources à
l'amont installé : ajouter ou retirer un glyphe change le fichier généré et fait
échouer `licensing:check` tant qu'il n'est pas régénéré.

## 4. Périmètre couvert, et périmètre non couvert

L'énoncé et le contenu doivent coïncider, ce qui n'était pas le cas : le
document annonçait recenser « ce qu'un consommateur installe réellement avec
nous » et ne listait que les dépendances directes. `jsdom` seul entraîne
**45 paquets** dans la fermeture transitive de `@sentropic/design-system-skills`,
couvrant **8 familles de licences** dont Apache-2.0 et BSD-3-Clause.

Ce qui est couvert, dans chaque fichier par paquet :

1. **Le code tiers recopié dans le paquet** — obligation stricte, nous
   distribuons une copie. Textes intégraux reproduits.
2. **La fermeture transitive** de `dependencies` et `optionalDependencies`,
   dérivée du lockfile, avec pour chaque paquet le texte de licence qu'il publie
   réellement. Ceux-là ne sont pas recopiés dans nos tarballs — npm les récupère
   du registre — mais ils arrivent dans le `node_modules` du consommateur de
   notre fait.

Ce qui n'est **pas** couvert, et pourquoi :

- **`peerDependencies`** — Angular, React, Svelte, Vue, CodeMirror, Lezer :
  fournies par le consommateur. Nous ne les distribuons pas.
- **`devDependencies`** : n'entrent dans aucun tarball publié.
- **Le seul paquet de la fermeture où un texte de licence manque à l'amont** :
  `saxes` 6.0.0, dont le tarball publié ne contient que `README.md`,
  `package.json`, `saxes.js`, `saxes.js.map` et `saxes.d.ts`. Il est marqué
  `source-gap` dans le fichier généré, avec l'identifiant déclaré, l'auteur et
  le dépôt. Le texte doit être relu à la source avant toute redistribution
  d'une copie de ce paquet.

  Ce document en annonçait **trois**, et deux de ces trois étaient faux :
  `punycode` 2.3.1 et `is-potential-custom-element-name` 1.0.1 publient chacun
  un texte MIT complet de 1 077 octets, nommé `LICENSE-MIT.txt`. C'est le
  détecteur du générateur qui les manquait — sa regex n'acceptait après
  `license` qu'une fin de chaîne ou un point littéral —, et les notices
  expédiées aux consommateurs affirmaient donc un `source-gap` inexistant tout
  en omettant les deux textes qu'elles existent pour transporter.
  `LICENSE-MIT` / `LICENSE-APACHE` étant la convention des paquets en double
  licence, le défaut était systémique et non anecdotique. Corrigé : les deux
  textes figurent intégralement dans
  `packages/skills/LICENSE.THIRD-PARTY.md`, et la correction a été repassée sur
  les 48 paquets de la fermeture réunie — aucun autre ne change de statut.

Deux obligations méritent d'être nommées plutôt que réduites à un identifiant :

- **Apache-2.0** (`xml-name-validator`) : sa section 4(d) impose de reconduire
  le fichier `NOTICE` de l'amont, lorsqu'il en existe un, dans toute œuvre
  dérivée distribuée. Les fichiers générés reprennent chaque fichier de notice
  publié par l'amont.
- **BSD-3-Clause** (`source-map-js`, `tough-cookie`) : sa troisième clause
  interdit d'employer le nom du titulaire ou de ses contributeurs pour endosser
  ou promouvoir un produit dérivé sans accord écrit préalable.

Un identifiant SPDX n'est pas une notice. ISC, par exemple, exige littéralement
que « the above copyright notice and this permission notice appear in all
copies » : écrire « ISC » dans une colonne ne satisfait ni l'une ni l'autre.

## 5. Questions ouvertes, non tranchées ici

### Les trois thèmes d'État publiables

`@sentropic/design-system-theme-dsfr`, `-theme-canada` et `-theme-quebec` sont
des transcriptions mesurées de systèmes de conception d'État. Le code de
transcription est publié sous la licence du paquet ; le régime applicable au
système transcrit lui-même, et aux marques et emblèmes d'État qu'il porte — dont
la signature et le mot-symbole fédéraux canadiens — est une **décision
propriétaire en attente**. Statut : `unresolved`. Ce document ne la tranche pas,
et le `LICENSE.THIRD-PARTY.md` de chacun des trois porte le même avertissement,
qui ship avec eux.

### `apps/docs`

`apps/docs` est `private` et n'est pas publié sur npm ; il est distribué par
GitHub Pages. C'est une voie de distribution distincte, avec ses propres
obligations, que ni ce document ni `licensing:check` ne couvrent. **Sujet
séparé**, à traiter pour lui-même.

## 6. Avant tout embarquement d'une dépendance de diagramme

**Rien de ce qui suit n'est adopté.** elkjs et bpmn-js ont été *qualifiés* au lot
A0 ; la porte D7=A réserve à l'owner l'adoption d'un nouveau runtime tiers. Les
conditions ci-dessous sont donc au conditionnel : elles décrivent ce qui
s'appliquerait si l'embarquement était décidé, pas un engagement du dépôt.

Source complète et mesures : `docs/a0-csp-dependency-qualification.md`, qui
n'existe **que sur la branche `feat/graph-dataviz-repatriation`** et sera
inatteignable depuis `main` tant que cette branche n'y est pas fusionnée. Les
conditions essentielles sont donc reproduites ici plutôt que référencées.

### elkjs — conditions du lot A0

Le paquet publié déclare `EPL-2.0 OR GPL-3.0-or-later` et son tarball ne porte
qu'un `LICENSE.md` au texte EPL-2.0. C'est un double licenciement au choix du
destinataire : la branche retenue devrait être **écrite explicitement**, faute
de quoi rien n'indiquerait laquelle engage le dépôt. L'orientation qualifiée au
lot A0 est EPL-2.0 ; elle n'est pas ratifiée.

| Condition | Motif |
|---|---|
| **Pin `0.12.0` exact**, pas de plage `^` | La version 0.11.0 déclarait EPL-2.0 seule. Une plage ferait glisser le régime de licence d'une version à l'autre sans revue. |
| **Pas de fork, pas de rapatriement des sources** | EPL-2.0 est un copyleft de fichier : consommer la bibliothèque non modifiée n'affecte pas notre code, la patcher oui. |
| **Mise à disposition du source** | EPL-2.0 §3.1 a) : qui distribue le Programme doit aussi le rendre disponible sous forme de code source, accompagner la distribution d'une déclaration en ce sens, et indiquer au destinataire comment l'obtenir, par un moyen usuel d'échange de logiciel. Cette obligation-là n'a pas d'équivalent MIT/ISC : elle demande un dispositif, pas une ligne de texte. |
| Consommé par un **paquet adaptateur dédié**, en `import()` paresseux | Chunk mesuré à 1 433 439 octets (443 ko gzip) : jamais dans le chemin critique d'un graphique. |
| Jamais dans un barrel de composants DS ni dans `@sentropic/dataviz-*` | Invariant D8. |
| Banc de comparaison réaligné sur le pin | Il tourne sur 0.11.0 : sinon nous mesurerions une version et livrerions l'autre. |

### bpmn-js — clause de filigrane

Licence MIT assortie d'une clause de filigrane. Le texte exige que le code
affichant le filigrane bpmn.io ne soit « removed or changed », et que le
filigrane reste « fully visible and not visually overlapped by other elements ».
Ce n'est pas qu'une notice à recopier : c'est une contrainte sur le rendu.

Distinguer ce que dit la licence de ce que nous poserions :

- **Ce que la licence exige** : le filigrane entièrement visible, non recouvert,
  son code ni retiré ni modifié. Elle ne donne aucune dimension.
- **Ce que nous poserions** : une zone d'exclusion de **100 × 48 px** au coin
  bas-droit du conteneur. C'est *notre* marge de sécurité, pas une exigence de
  la licence. Le filigrane lui-même mesure **53 × 23 px** (lien
  `.bjs-powered-by`, opacité 1, `z-index` 100, ancré à 15 px du bas et de la
  droite, posé par `addProjectLogo()` dans `lib/BaseViewer.js`). La marge existe
  parce que le bas-droit est précisément où l'on place spontanément les
  contrôles de zoom.
- **Corollaire** : interdiction de masquer par `opacity`, `visibility`,
  `clip-path` ou recouvrement transparent. Un recouvrement invisible reste un
  recouvrement.

**Point ouvert, arbitrage owner.** Le filigrane est un nœud DOM frère du SVG, pas
un contenu du SVG : un export SVG, PDF ou PNG produirait un rendu **sans**
filigrane, alors que la clause vise les diagrammes rendus. Deux branches, aucune
présélectionnée : réincorporer l'attribution dans les exports, ou renoncer à
bpmn-js comme moteur d'export.

### diagram-js

`diagram-js 15.26.0`, dépendance de bpmn-js, est **MIT sans clause**. Elle
arriverait avec bpmn-js et entrerait dans les notices au même titre.

## 7. Icônes de fournisseurs

Un pack d'icônes de fournisseurs — AWS, GCP, Azure et autres — relève d'un régime
distinct, et l'ajouter au tableau des dépendances ne suffirait pas. Les
collections candidates sont en CC0 ou MIT, mais le texte CC0 est explicite :
« No trademark or patent rights held by Affirmer are waived, abandoned,
surrendered, licensed or otherwise affected by this document. » La licence
couvre le fichier, pas l'usage de la marque, qui reste soumis aux conditions de
chaque fournisseur.
