# Lot A0 — qualification des dépendances de diagramme et verdict CSP

Date de mesure : 2026-09-19. Portée : elkjs et bpmn-js, demandés par le dossier
« cœur commun des diagrammes » (D4=B, D5, elkjs comme cible de placement).
Harnais rejouable : [`tools/csp-spike/`](../tools/csp-spike/README.md).
Preuve brute : `tools/csp-spike/evidence/2026-09-19-chromium-151.json`.

Ce document qualifie. Il ne franchit pas la porte D7=A, qui réserve à
l'owner l'adoption d'un nouveau runtime tiers.

## 1. Verdict CSP

Mesuré en navigateur réel, Chromium 151.0.7922.34, CSP servie en en-tête HTTP :

```
default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'none';
img-src 'self' data:; font-src 'self' data:; connect-src 'self';
worker-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

| Page mesurée | Violations | Détail |
|---|---|---|
| Témoin positif | **1**, `style-src-attr` | attendu : `setAttribute('style', …)` bloqué, style non appliqué (`rgba(0,0,0,0)`) ; l'écriture CSSOM voisine s'applique |
| elkjs 0.12.0 `elk.bundled.js` | **0** | layered, groupes imbriqués, 86 ms |
| bpmn-js 18.28.0 Viewer | **0** | import XML, fit-viewport, 10 éléments, 16 ms |
| bpmn-js 18.28.0 Modeler | **0** | sélection, `appendShape`, `directEditing` actif, aller-retour `saveXML` |
| Couture Focus | **0** | vue placée consommée sans placeur embarqué, 2 ms |

Le témoin positif conditionne la lecture de tout le tableau : il établit que le
harnais détecte bien les violations qu'il prétend mesurer. Sans lui, un zéro
n'aurait signifié qu'une absence d'observation.

**Cause racine de l'écart avec xyflow.** bpmn-js applique ses styles par
`assignStyle` de min-dom, qui écrit `element.style[clé] = valeur` en CSSOM.
`style-src-attr` gouverne l'attribut `style`, pas les écritures CSSOM. Le repli
« SVG statique » reste justifié pour la scène générique v1, mais il n'est pas
justifié par la CSP pour le parcours BPMN.

**Preuves d'exécution obtenues par construction.** `worker-src 'none'` sans
violation établit qu'elkjs n'ouvre aucun worker : son `elk.bundled.js` embarque
un worker factice qui dispatche en processus. L'absence d'`unsafe-eval` sans
violation établit qu'il n'évalue aucun code.

**Portée.** Chromium seul, rendu par défaut, sans thème DS ni palette DOM
personnalisée. Nos extensions pourront réintroduire des violations : c'est notre
code qui sera à remesurer, pas celui des bibliothèques.

## 2. elkjs — qualifié sous conditions

Licence : le paquet publié déclare `EPL-2.0 OR GPL-3.0-or-later`, et le tarball
ne porte qu'un `LICENSE.md`, texte EPL-2.0. Double licenciement au choix du
destinataire ; nous retenons **EPL-2.0**, à tracer explicitement. La version
0.11.0 déclarait EPL-2.0 seule : une plage `^` pourrait donc faire glisser le
régime de licence sans revue.

| Condition | Motif |
|---|---|
| Pin **0.12.0 exact** | version mesurée ; le régime de licence change entre 0.11 et 0.12 |
| Consommée par un **paquet adaptateur dédié**, en `import()` paresseux | chunk mesuré à **1 433 439 octets** (443 ko gzip) : jamais dans le chemin critique d'un graphique |
| Jamais dans un barrel de composants DS ni dans `@sentropic/dataviz-*` | invariant D8 |
| **Pas de fork ni de rapatriement des sources** | EPL-2.0 est un copyleft de fichier ; consommer non modifié ne contamine pas notre code, patcher oui |
| Banc de comparaison réaligné sur le pin | il tourne sur 0.11.0 : sinon nous mesurons une version et livrons l'autre |

## 3. bpmn-js — qualifié, clause de filigrane tenable

Licence : MIT assortie d'une clause de filigrane. Texte contraignant : le code du
filigrane « MUST NOT be removed or changed », et « the watermark must stay fully
visible and not visually overlapped by other elements ».

Filigrane mesuré en place : lien `.bjs-powered-by` vers bpmn.io, **53 × 23 px**,
visible, opacité 1, `z-index` 100, ancré à 15 px du bas et de la droite du
conteneur (`addProjectLogo()` dans `lib/BaseViewer.js`).

| Condition | Motif |
|---|---|
| **Zone d'exclusion 100 × 48 px** au coin bas-droit du conteneur | aucun chrome DS — barre d'outils, inspecteur, légende, **contrôles de zoom** — ne doit recouvrir le filigrane ; le bas-droit est précisément où l'on place spontanément le zoom |
| Interdiction de masquer par `opacity`, `visibility`, `clip-path` ou recouvrement transparent | un recouvrement invisible reste un recouvrement |
| **Ne pas câbler bpmn-js dans `graph-export`** tant que l'arbitrage export n'est pas rendu | voir ci-dessous |
| Chargement paresseux | Viewer 200 966 o, Modeler 375 295 o, CSS 118 ko, police BPMN (SVG 136 ko, EOT 49 ko) |

**Point ouvert, arbitrage owner.** Le filigrane est un nœud DOM frère du SVG, pas
un contenu du SVG : un export SVG, PDF ou PNG produit un rendu **sans** filigrane,
alors que la clause vise « les diagrammes rendus ». Deux branches, aucune
présélectionnée : réincorporer l'attribution dans les exports, ou renoncer à
bpmn-js comme moteur d'export. C'est le point qui peut faire tomber D5.

diagram-js 15.26.0, dépendance de bpmn-js, est MIT sans clause.

## 4. Couture Focus — confirmée en lecture, limitée en édition

Démonstration mesurée, pas théorique : placement elkjs exécuté **côté serveur en
Node** (80 ms), vue placée sérialisée en JSON de **1 391 octets**, rendue par une
page dont le chunk pèse **1 052 octets** et n'embarque aucun placeur
(`elkInBundle: false`), sans violation CSP.

La règle « Focus consomme, il ne calcule pas » tient donc — **en lecture**.
Trois régimes à distinguer explicitement, plutôt que de découvrir l'écart au
lot 10 :

1. **Lecture seule** : placement serveur, vue placée transmise par HTTP. Confirmé.
2. **Édition avec aller-retour serveur par commande** : tenable, au prix d'une
   latence par geste ; à mesurer avant engagement.
3. **Édition interactive fluide** (glisser, reroutage) : placeur client
   obligatoire, donc Focus embarque elkjs ou bpmn-js. Incompatible avec la règle
   actuelle, qui devra être amendée et non contournée.

Observé pendant la mesure : `appendShape` du Modeler calcule la position côté
client. L'édition n'est pas neutre pour la couture.

## 5. Seuils de lisibilité — ratification par amendement

Les seuils transmis étaient proposés et non ratifiés. Aucun des trois n'existe
dans le dépôt DS. Les écarts ci-dessous sont sensibles et ont été signalés en
amont à l'émetteur des propositions.

| Point | Proposition | Ratification DS | Motif |
|---|---|---|---|
| Seuil écran | 11 px | **12 px** | `FONT_SIZE_SCALE` (`packages/skills/src/rules/typographyScaleTokenRule.ts`) a 12 pour plus petite valeur ; ratifier 11 contredirait le linter du DS |
| Zone de référence | 1 440 × 900 (r4) contre 1 440 × 1 000 (r3) | **1 440 × 900** | aucune autorité DS ne soutient 1 000 ; les scripts d'audit DS utilisent 1 440 × 1 100 pour un autre usage |
| Impression | 7 pt A4 | **non ratifiable en l'état** | le DS n'a aucune unité `pt`, aucun `@media print`, aucune feuille d'impression : le seuil serait invérifiable. Intérimaire : 8 pt pour le texte de lecture, 7 pt réservé à l'annotation secondaire, à confirmer sur un rendu A4 réel |
| Taux de remplissage | ratio à définir | **règle opérante** : un libellé ne s'affiche que s'il tient sans troncature à la taille minimale ratifiée ; sinon la vue ne passe pas la porte | ancrée sur les garde-fous DS réels (`w > 28 && h > 14`, `LABEL_MIN_W = 44`) et vérifiable automatiquement, ce qu'un ratio n'est pas |

La règle ci-dessus **détecte**, elle ne remédie pas. Le repli en infobulle ou en
légende n'est pas ratifié comme chemin par défaut : l'owner a posé la contrainte
« ne jamais retirer d'information pour passer la porte », et le choix entre
scission par domaine, ouverture à taille lisible avec défilement, ou vue
compacte assumée lui revient. Une vue qui échoue à la porte remonte comme
arbitrage de découpage, pas comme dégradation automatique.
| Rôles de texte | `label/caption/title/annotation` | **quatre rôles de diagramme à tokeniser** : titre de vue, libellé de nœud, annotation, légende/axe | les quatre rôles tokenisés du DS sont `control/field/label/link`, des rôles de formulaire ; le DS a déjà trois systèmes typographiques non réconciliés, il n'en recevra pas un quatrième |

Le balayage ELK — grille bornée, nombre de candidats, budget de temps — n'est pas
ratifié : les seuls chiffres disponibles proviennent d'un graphe jouet à
2 groupes et 4 nœuds (86 ms navigateur, 80 ms Node). Ratification après mesure
sur corpus réel.

### 5.1 Ce que le corpus réel révèle sur le plancher

Corpus de scènes réelles fourni en entrée ELK sérialisée, rejoué avec le pin
0.12.0. Harnais : [`tools/elk-corpus-measure/`](../tools/elk-corpus-measure/),
preuve : `evidence/2026-09-19-corpus-icond.json`.

| Vue | Cartes | Boîte ELK | Occupation | Échelle ajustée | Plafond si empaqueté |
|---|---:|---|---:|---:|---:|
| architecture | 28 | 4347 × 2456 | 24,1 % | 0,331 | **0,709** |
| séquence | 14 | 3562 × 2038 | 17,7 % | 0,404 | **1,003** |
| mise en service | 12 | 3072 × 1942 | 18,5 % | 0,463 | **1,084** |

Taille de police source qu'il faudrait pour rendre 12 px — formulation
indépendante de la typographie réelle des cartes, donc vérifiable :

| Vue | À l'échelle ajustée | Au plafond empaqueté |
|---|---:|---:|
| architecture | 36,2 px | **16,9 px** |
| séquence | 29,7 px | **12,0 px** |
| mise en service | 25,9 px | **11,1 px** |

Deux conclusions distinctes, à ne pas confondre :

- **L'architecture est hors d'atteinte par le placement.** L'aire cumulée de ses
  28 cartes vaut 2 576 000 px² contre 1 296 000 px² pour le cadre : les cartes
  font deux fois le cadre. Aucun réglage ELK ne rattrape un facteur deux ; seule
  une décision de découpage le peut.
- **La séquence et la mise en service ne sont pas contraintes par la densité.**
  Leur plafond d'empaquetage dépasse 1 : les cartes tiennent dans le cadre. Ce
  qui les bloque est le gaspillage d'espace du placement, qui laisse plus de
  80 % du cadre vide. Pour ces deux vues, le plancher reste atteignable par le
  placement.

Réserve : le plafond d'empaquetage ignore les couloirs de routage orthogonal et
l'écart de rapport d'aspect. C'est une borne inatteignable, à lire comme telle.
L'écart entre 0,40 et 1,00 reste toutefois trop large pour que cette réserve
renverse la conclusion.

## 5.2 Parité de style entre cibles d'export

Mesure de ce qu'une cible conserve réellement au rendu, plutôt que de ce que sa
documentation annonce. Harnais : [`tools/style-parity-probe/`](../tools/style-parity-probe/),
preuve : `evidence/2026-09-19-mermaid-12.json`.

mermaid 12.0.0, `classDef` appliqué à cinq formes, propriétés relevées sur le
SVG produit : `fill`, `stroke`, `stroke-width`, `stroke-dasharray`, `color`,
`font-size`, `font-weight`, `font-family` et `text-align` **survivent tous**.

Deux faits qui élargissent ce que mermaid peut porter :

- **53 formes nommées**, dont `cyl`, `h-cyl`, `lin-cyl`, `datastore` et
  `bucket` : les formes spéciales C4 pour bases de données et buckets existent
  nativement.
- `registerIconPacks` existe : un jeu d'icônes peut être enregistré. La question
  devient l'origine et la licence du paquet d'icônes — donc D7 — et non une
  limite du format.

**Le point dur est géométrique, pas typographique.** Le rayon d'angle n'est pas
une propriété de style en mermaid : `rx` est absent du SVG produit, et l'arrondi
est cuit dans le tracé de la forme choisie (`rounded` contre `rect`). Or
« carré ou arrondi » est le premier axe de skin demandé. Conséquence pour un
éventuel modèle de style unifié : le rayon doit être une **énumération** à
quelques crans, projetable sur un choix de forme mermaid et sur `rounded=1;arcSize=…`
en mxGraph, et non un token numérique continu. La forme des tokens est
contrainte par la cible la plus pauvre, pas seulement leurs valeurs.

Limite assumée : le versant mxGraph n'est pas mesuré faute de rendu draw.io
vérifiable. Aucune matrice de capacités à trois colonnes ne sera signée tant
qu'une de ses colonnes reposerait sur de la documentation plutôt que sur un
rendu observé.

### 5.3 État réel du design system, colonne par colonne

Inventaire du dépôt, pour situer le DS face aux cibles d'export. Il contredit le
cadrage spontané du problème : sur plusieurs axes, **la cible la plus pauvre est
le design system**, pas mermaid.

**Export : aucune capacité implémentée.** Les occurrences de mermaid et draw.io
sont des cibles de spec ou des diagrammes de documentation. `@sentropic/graph-codecs`,
qui porterait `mermaid` et `drawio`, est à créer ; le lot `GD-M4-CODECS` du plan
de rapatriement est non coché. Les capacités marquées « source-present » dans
l'étude de couverture vivent dans les dépôts d'origine et ne sont pas encore
rapatriées : dans ce monorepo, la surface d'export est vide.

Conséquence de planification : les deux exportateurs sont à écrire. La contrainte
de forme des tokens peut donc être posée **avant** qu'aucun exportateur existe,
ce qui est le moment le moins coûteux. Imposée après coup, elle obligerait à
réécrire deux exportateurs et le moteur.

**Icônes : huit.** Le DS prescrit 8 icônes sous noms DS gelés — `settings`,
`eye`, `eye-off`, `layers`, `target`, `close`, `chevron-down`, `chevron-right`.
lucide est une dépendance d'usage interne, explicitement pas un ré-export : le
consommateur adresse les icônes par les noms DS, jamais par les noms lucide.
Angular n'a aucune dépendance lucide, ses tracés sont inlinés.

Icônes de fournisseurs — AWS, GCP, Azure, kubernetes, base de données, bucket :
**aucune**. Ni sprite, ni mapping, ni fichier. Une attente exprimée comme
« compléter le jeu d'icônes à la manière de draw.io » porte en réalité sur
plusieurs milliers de formes de fournisseurs, avec leur gouvernance de noms,
leur provenance et leurs conditions d'usage — ce qui retombe sur D7.

Tokens d'icône : la taille est tokenisée (`iconSize` sm/md/lg). **L'épaisseur de
trait ne l'est pas** (`2.25` codé en dur dans les quatre composants) et **la
couleur non plus** (héritée par `currentColor`). Ces deux axes bloquent toute
promesse de rendu identique entre cibles tant qu'ils ne sont pas tokenisés.

**Formes : sept, et pas les bonnes.** Le DS rend aujourd'hui `ForceGraph` en SVG
sur les quatre frameworks, avec 7 géométries normalisées en aire — cercle,
losange, étoile, hexagone, carré, rectangle arrondi, triangle. Pas de cylindre,
pas de bucket, pas de stadium : précisément les formes que C4 réclame pour ses
bases de données et ses buckets, et précisément celles que mermaid possède
nativement.

**Style par nœud.** Paramétrable : tonalité parmi 8 catégories sémantiques,
groupe, poids, forme, étiquette. Non paramétrable : remplissage arbitraire,
couleur de trait, épaisseur de trait, rayon d'arrondi, alignement du texte. Le
moteur `@sentropic/graph` rapatrié ajoute `fill: solid|hollow` et
`border: normal|bold`, avec une limite inscrite dans son propre type — le
backend WebGL les ignore.

**Gabarits et skins : inexistants.** Le mot « gabarit » désigne dans le DS les
gabarits de page. L'équivalent fonctionnel actuel est le système de thèmes, qui
pilote les nœuds par variables CSS de catégorie, pas un gabarit de nœud.

Récapitulatif de l'écart à combler avant toute promesse de parité :

| Axe | DS aujourd'hui | mermaid 12 |
|---|---|---|
| Formes | 7, sans cylindre ni bucket | 53, cylindres et bucket inclus |
| Remplissage arbitraire | non | oui |
| Couleur et épaisseur de trait | non | oui |
| Rayon d'angle | non paramétrable | choix de forme, pas de valeur |
| Alignement du texte | non | oui |
| Icônes de fournisseurs | aucune | paquets enregistrables |
| Export | aucun | n/a (c'est la cible) |

## 6. Icônes de fournisseurs — qualification du pack

Harnais : [`tools/icon-provider-audit/`](../tools/icon-provider-audit/README.md),
preuve : `evidence/2026-09-19-iconify.json`.

Ce qui existe réellement, par collection iconify candidate :

| Collection | AWS | GCP | Azure | OVHcloud | Scaleway | Kubernetes |
|---|---:|---:|---:|---:|---:|---:|
| `logos` | **65** | 4 | 2 | **0** | **0** | 1 |
| `devicon` | 0 | 0 | 5 | **0** | 2 | 2 |
| `simple-icons` | 6 | 0 | 5 | **1** | **1** | 1 |
| `skill-icons` | 2 | 2 | 2 | **0** | **0** | 1 |

Point de comparaison mesuré dans le dépôt draw.io : le stencil `mxgraph.aws4`
compte **1 050 formes**.

**OVHcloud et Scaleway n'existent qu'en marque.** `simple-icons:ovh`,
`devicon:scaleway` et son wordmark sont des logos, pas des jeux de services.
Kubernetes n'a pas davantage d'icônes de ressources : `deployment`, `ingress` et
`statefulset` ne donnent rien. Une attente formulée comme « à la manière de
draw.io » n'est donc pas satisfaite par un pack iconify : l'écart est d'un
facteur 16 sur AWS, et total sur les deux fournisseurs ajoutés en dernier.

**La licence du pack ne transmet aucun droit de marque.** Les collections sont en
CC0 ou MIT, et le texte CC0 est explicite : « No trademark or patent rights held
by Affirmer are waived, abandoned, surrendered, licensed or otherwise affected by
this document. » Les logos restent soumis aux conditions de leur propriétaire.
C'est la structure de la clause bpmn.io : libre de copier, pas libre d'employer
comme on veut.

### 6.1 Sortie proposée : résoudre l'icône par cible

Plutôt qu'un jeu unique poussé vers les trois cibles, appliquer à l'icône le
mécanisme déjà retenu pour le style — le métamodèle porte un **identifiant
d'icône abstrait**, et l'adaptateur le résout :

| Cible | Source des tracés |
|---|---|
| xyflow | pack iconify enregistré par nous |
| draw.io | **stencils natifs** `mxgraph.aws4.*`, `mxgraph.gcp*`, `mxgraph.azure*`, kubernetes |
| mermaid | pack enregistré, lorsque le visualiseur l'autorise |

Ce découpage limite l'exposition aux marques à la seule cible xyflow, et donne en
draw.io des icônes d'un ordre de grandeur plus riches que tout ce que nous
pourrions embarquer. La gouvernance de noms reste au DS ; seule la source des
tracés change.

## 7. Adaptateur mxGraph — faits établis sur source

Lecture du source mxGraph 4.2.2 (Apache-2.0) et du dépôt draw.io. Établi plus
solidement que de la documentation, mais **pas encore par un rendu draw.io
observé** : la colonne draw.io d'une matrice de capacités reste non signée tant
qu'un rendu vérifiable manque.

**La chaîne de style n'échappe pas le point-virgule.** `mxStylesheet.prototype.getCellStyle`
fait `name.split(';')` puis cherche un `=` dans chaque fragment. Une valeur
contenant `;` est coupée, et `data:image/svg+xml;base64,…` perd son contenu. La
forme utilisable est `image=data:image/svg+xml,<base64>`.

**Le rayon d'angle est un pourcentage par défaut, et l'absolu vaut la moitié.**
`mxShape.prototype.getArcSize` :

- sans `absoluteArcSize` : `f = arcSize / 100`, `r = min(w·f, h·f)` — pourcentage
  du plus petit côté, défaut `RECTANGLE_ROUNDING_FACTOR = 0.15`, soit 15 % ;
- avec `absoluteArcSize=1` : `r = min(w/2, min(h/2, arcSize/2))`.

Le rayon rendu vaut donc **`arcSize/2`**. Pour 8 px de rayon il faut écrire
`arcSize=16;absoluteArcSize=1`. À inscrire au contrat d'adaptateur : quiconque
écrit `arcSize=8` obtient 4 px et conclura à un défaut de son propre code.

**draw.io couvre déjà ArchiMate et C4 nativement.** Le dépôt contient
`Sidebar-ArchiMate.js`, `Sidebar-ArchiMate3.js` et `Sidebar-ArchiMate4.js`, plus
`Sidebar-C4.js` et `shapes/mxC4.js`, ainsi que BPMN, SysML, UML 2.5 et Kubernetes,
sur 52 jeux de stencils. Reconstruire ces gabarits à la main pour la cible
draw.io serait du travail perdu.

## 8. Porte de lisibilité et exports

Le plancher de 12 px est une porte **d'écran**, ratifiée à 1 440 × 900. Il n'est
pas transportable en l'état : ce qui est invariant à l'échelle n'est pas une
taille en pixels mais le rapport entre la taille du texte et la géométrie de la
scène. Chaque cible porte donc son niveau à sa définition :

| Cible | Porte de lisibilité |
|---|---|
| xyflow | plancher applicable tel quel, 12 px à 1 440 × 900 |
| draw.io | **non applicable en pixels** — le lecteur choisit son zoom. Garantie substituée : la fidélité géométrique préserve le rapport texte/carte, et l'export **déclare le facteur de zoom** auquel la scène satisfait le plancher. Un export incapable de le déclarer échoue la porte |
| mermaid | **non applicable et non approximable** — mermaid calcule sa propre géométrie. Seule l'identité des jetons et de la famille de forme est garantie |
| SVG figé | plancher exprimable en unités document : l'export **déclare sa taille de rendu nominale** et le plancher s'applique à cette taille. Une mise à l'échelle par le visualiseur sort de notre contrôle et n'est pas garantie |

Règle générale : le plancher est une propriété de la **scène rendue**, pas du
document. Hors xyflow, ce qui est ratifié est le rapport préservé et la taille
nominale déclarée — jamais une promesse de pixels. Écrire que mermaid respecte le
plancher serait invérifiable.

## 9. Épinglage mermaid et visualiseur de référence

### 9.1 Correction de la mesure de §5.2

La sonde de §5.2 tournait sur **mermaid 12.0.0**, dernière version publiée.
**Aucun visualiseur ne fait tourner la 12** : GitHub sert 11.17.2, GitLab
déclare 11.16.1, VS Code 11.16.1, et `mmdc` résout en 11.x. La mesure portait
donc sur une version que personne ne rend. Elle a été refaite sur **11.17.2**.

Inchangé : 53 formes nommées, `bucket`, `cyl`, `datastore`, `h-cyl` et `lin-cyl`
présents, `registerIconPacks` présent, et les neuf propriétés de style qui
survivent au rendu.

Corrigé : en 11.17.2 la forme `rounded` rend un `<rect rx="5">` — l'attribut
**existe**, contrairement à ce que §5.2 affirmait d'après la 12. Mais il vaut 5,
constante de mermaid, alors que la `classDef` demandait `rx:8`. En 12.0.0 c'est
un `path` sans `rx`. **La conclusion est inchangée et plus nette : le rayon n'est
réglable dans aucune des deux versions** ; seule la manière dont mermaid l'ignore
change.

### 9.2 Pin : 11.17.2

C'est la version servie par GitHub, à un patch de GitLab et VS Code, et celle où
`mmdc` résout. La 12.0.0 apporte des ruptures — ELK par défaut, nouveau thème,
exigences de moteur relevées — pour un parc installé de zéro visualiseur.

Réserve : GitHub ne documente sa version nulle part ; 11.17.2 vient de
l'inspection de l'asset déployé. Elle peut changer sans préavis — raison de plus
pour que le visualiseur de référence ne soit pas une plateforme.

### 9.3 Visualiseur de référence : `mmdc`

| Visualiseur | Version | Packs d'icônes arbitraires |
|---|---|---|
| **`mmdc`** | 11.17.0, mermaid 11.x | **oui** — `--iconPacks` (11.4.3), `--iconPacksNamesAndUrls` (11.10.1) |
| VS Code intégré | 11.16.1 | partiel — `logos` et `mdi` codés en dur, non configurable |
| GitHub | 11.17.2 | **non** — `registerIconPacks` exporté, jamais appelé |
| GitLab | 11.16.1 | **non** — absent du dépôt |

`mmdc` est le seul à satisfaire simultanément les formes nommées et les packs
d'icônes. Conséquence à inscrire au contrat : **sur GitHub et GitLab, nos icônes
n'existeront pas** — limite de plateforme, pas dégradation choisie.

VS Code code en dur la collection `logos`, précisément celle qui porte les 65
icônes AWS comptées en §6 : s'y limiter en fait un second visualiseur viable
sans configuration.

### 9.4 Limite de taille GitLab, mesurée sur les scènes réelles

GitLab plafonne à **2 000 caractères par diagramme**, 50 blocs par page, et
diffère le rendu au-delà. Mermaid généré pour les scènes du corpus, avec
identifiants nettoyés, une seule `classDef`, aucune icône et aucun style par
nœud :

| Vue | Nœuds | Caractères | GitLab |
|---|---:|---:|---|
| **architecture-sauvegardes** | 35 | **2 879** | **dépassée de 879** |
| sequence-bout-en-bout | 17 | 1 678 | passe |
| mise-en-service | 15 | 1 564 | passe |

Deux contraintes indépendantes désignent la même vue : l'architecture échoue la
porte de lisibilité **et** la limite GitLab, tandis que les deux autres passent
les deux. Scinder cette vue n'est donc pas seulement une affaire de lisibilité,
c'est ce qui la rend publiable.

### 9.5 Contraintes de sécurité des plateformes

GitHub fige `securityLevel: "antiscript"` et rend non surchargeables par
directive `secure`, `securityLevel`, `startOnLoad` et `maxTextSize`. GitLab est
en `strict`, avec bac à sable et `dompurifyConfig`, et **supprime les `<img>`**
hors de sa table d'asset-proxy.

Le risque `<img>` associé — un pack d'icônes produisant des `<img>` que GitLab
supprimerait — **a été mesuré et n'existe pas** : voir §9.7.

### 9.6 Deux profils d'export mermaid

Aucun visualiseur unique ne couvre tout, donc l'export déclare son profil :

- **portable** — formes nommées et `classDef`, sans icône. Rend sur GitHub,
  GitLab, VS Code et `mmdc`. Profil par défaut d'un export destiné à un dépôt.
- **complet** — avec icônes, qualifié sur `mmdc` seul. Profil d'un export destiné
  à une chaîne que nous contrôlons.

Le profil est une propriété de l'export, pas de la scène : un même document
produit l'un ou l'autre.

## 6. Dettes DS bloquantes pour l'embarquement

Ces deux dettes conditionnent l'adoption, parce qu'EPL-2.0 comme la clause
bpmn.io exigent la conservation des notices :

- le champ `license` manque sur **11 des 12 paquets publiables** ;
- il n'existe **aucun fichier d'attribution tierce**, ni allowlist, ni
  vérificateur de licences, ni étape de licence en CI.

## 7. Porte restante

**D7=A** — « nouveau runtime tiers seulement après décision owner explicite ».
La qualification technique ci-dessus est favorable et ne remplace pas cette
décision. Le câblage peut être préparé derrière l'adaptateur paresseux ; l'ajout
effectif aux manifestes publiés attend l'owner.

### 9.7 Comment mermaid rend les icônes d'un pack enregistré

Mesuré : mermaid 11.17.2, pack `@iconify-json/logos` enregistré,
`securityLevel: 'strict'`, rendu Chromium. Preuve :
`tools/style-parity-probe/evidence/2026-09-20-mermaid-icones.json`.

| Relevé | Valeur |
|---|---:|
| `<img>` | **0** |
| `<image>` SVG | **0** |
| data URI | aucun |
| href externes | aucun |
| icônes rendues | 2 `<svg>` imbriqués **inline** |

Le contenu provient bien du pack : viewBox `0 0 256 153` et `fill="#252f3e"`,
valeurs de l'icône AWS du paquet.

**Conséquence : le risque de suppression des `<img>` par GitLab ne s'applique
pas.** mermaid inline les tracés, il ne référence rien. Le seul obstacle GitLab
reste celui de §9.3 — il n'appelle jamais `registerIconPacks`, donc les icônes
n'y parviennent pas du tout.

### 9.8 Dégradés référencés par identifiant — risque pour l'export

La mesure ci-dessus a révélé un point adjacent. Les icônes de fournisseurs sont
fréquemment en dégradé, et mermaid rend alors
`fill="url(#IconifyId1a0bf420eda89cdac0)"` — une référence par identifiant.
Preuve : `evidence/2026-09-20-collision-identifiants.json`.

| Scénario | Résultat |
|---|---|
| Deux rendus distincts sur une même page (cas des 50 blocs GitLab) | identifiants `…fa30` et `…fa31` — **aucune collision** |
| Le même SVG inliné deux fois (cas de l'export) | **identifiant dupliqué** : le second dégradé se lie à la première définition |

Non établi : sur deux exécutions séparées, les identifiants partagent le préfixe
`IconifyId1a0bf42` et ne diffèrent que par la fin. Aucune collision entre
exécutions n'a été observée, mais le préfixe commun la rend possible. C'est
signalé comme une hypothèse, pas comme un fait.

**Règle pour le contrat d'export** : l'export SVG figé doit **réécrire ou
préfixer les identifiants Iconify** avant d'être tenu pour inlinable. Sans cela,
deux diagrammes exportés posés sur une même page peuvent voir leurs dégradés se
mélanger — un défaut invisible à l'export, visible seulement chez le lecteur, et
silencieux : des icônes aux mauvaises couleurs, sans aucune erreur.

## 10. Correction : la cause de l'échec CSP attribué à xyflow

L'amendement 6 s'appuie sur l'énoncé « xyflow interactif ne passe PAS
`style-src-attr 'none'` (1 violation au load) », sans cause identifiée. La cause
est maintenant établie, et **ce n'est pas xyflow**. Harnais :
[`tools/xyflow-csp-probe/`](../tools/xyflow-csp-probe/README.md), preuve :
`evidence/2026-09-20-bissection.txt`.

`@xyflow/svelte` 1.6.6, `@xyflow/system` 0.0.82, Svelte 5.57.1, même CSP stricte
et même témoin positif qu'en §1 :

| MiniMap | Interaction | Violations |
|---|---|---:|
| non | non | **0** |
| non | oui — glisser, molette, panoramique | **0** |
| oui | non | **1** `style-src-attr` |
| oui | oui | **1** |

Le canevas, les nœuds, les liaisons, le fond, les contrôles, le glisser et le
zoom passent tous à zéro violation. **MiniMap est la cause unique.**

Le gabarit fautif, extrait du bundle, est `style="display: contents"`. Il vient
du **compilateur Svelte** : quand un composant reçoit une propriété CSS
personnalisée, Svelte émet `<svelte-css-wrapper style='display: contents'>`,
instancié par `innerHTML`, donc bloqué. Reproduit sans xyflow, avec un composant
trivial :

- `<Carte titre="…" />` → **0 violation**, aucune enveloppe ;
- `<Carte --st-fond="#cfe" titre="…" />` → **1 violation**, attribut relevé dans
  le DOM : `display: contents; --st-fond: #cfe;`.

**Conséquences.** L'incompatibilité appartient à un **idiome Svelte**, pas à
xyflow ; toute bibliothèque de composants, y compris la nôtre, tomberait sur le
même mur. Le repli « v1 = SVG statique » peut rester le bon choix pour la
simplicité, le rendu serveur ou le poids — **il n'est plus justifié par la CSP**.

Vérifié : **aucun composant du design system ni la documentation n'emploie cet
idiome** aujourd'hui. Cela rassure sur le présent et ne dit rien du futur — or
c'est précisément l'idiome vers lequel on tend quand on veut thématiser un
composant par jeton, c'est-à-dire ce que D8 demande de faire. Ce n'est donc pas
une note de bas de page du dossier diagrammes, c'est une **règle de conception
du design system**. Voir §10.1.

### 10.1 Règle de conception — porter un jeton jusqu'à un composant

Nommer le chemin interdit ne suffit pas : il fallait mesurer les remplacements.
Harnais : [`tools/xyflow-csp-probe/token-paths/`](../tools/xyflow-csp-probe/token-paths/README.md),
preuve : `evidence/2026-09-20-chemins-jeton.jsonl`.

| Chemin | Violations | Enveloppe | Jeton appliqué |
|---|---:|---:|---|
| **A** — propriété CSS passée au composant | **1** | 1 `<svelte-css-wrapper>` | oui |
| **B** — variable posée sur un élément ancêtre (`style:--x={…}`) | **0** | 0 | oui |
| **C** — thématisation par classe | **0** | 0 | oui |
| **D** — CSSOM après montage (`setProperty`) | **0** | 0 | oui |
| **E** — même idiome qu'en A, en espace de noms SVG | **0** | 0 (un `<g>`) | non concluant |

Les trois remplacements appliquent bien le jeton. **Le chemin interdit n'apporte
donc rien** que B, C ou D n'apportent, et le coût de la règle est nul.

> **Règle.** Un composant destiné à tourner sous CSP stricte ne reçoit pas ses
> jetons par propriété CSS personnalisée passée en attribut. Il les reçoit par
> une variable posée sur un ancêtre, par une classe, ou par le CSSOM après
> montage.

Sur E : le compilateur émet `<g>` au lieu de `<svelte-css-wrapper>` en espace de
noms SVG, donc aucun attribut `style` littéral. L'application du jeton n'est pas
concluante dans cette sonde — elle lisait `backgroundColor` sur un `<rect>`, qui
se peint par `fill`. À remesurer avant de s'appuyer dessus ; **non mesuré**, pas
« ne marche pas ».

**Rendre la règle exécutoire.** Les règles de `@sentropic/design-system-skills`
s'appliquent au **DOM rendu**, pas à la source. La forme naturelle est donc une
règle signalant tout élément portant un attribut `style` littéral dans le rendu :
elle attrape cette classe de défaut sans avoir à reconnaître un idiome de
compilateur, et elle en attrape d'autres du même genre. Cette règle toucherait un
paquet publié : elle est proposée, pas ajoutée.

### 10.2 Règle de renseignement des capacités

Issue de la réserve posée sur `elevation` en §5.3, et généralisée à toute la
matrice :

> Ne jamais inscrire « impossible » quand on veut dire « pas essayé ». Un axe non
> mesuré se borne prudemment et se déclare **non mesuré** ; il ne se déclare pas
> incapable.

Motif : un axe déclaré incapable est un axe que personne ne réessaiera, alors
qu'une borne prudente invite à la mesure.

## 11. Dimensionnement côté serveur

§4 démontrait qu'un serveur sait **placer**. Il ne démontrait rien sur sa
capacité à **dimensionner** : les dimensions y étaient codées en dur
(`width: 90, height: 40`), et celles du corpus étaient lues du corpus. Or ELK
place des boîtes dont la taille dépend du texte.

Mesuré : mêmes chaînes, même fichier de police enregistré des deux côtés,
`@napi-rs/canvas` en Node contre `measureText` en Chromium. Harnais :
[`tools/text-metrics-probe/`](../tools/text-metrics-probe/README.md).

**Écart maximal 0,005 px** sur 10 chaînes et 3 corps ; la mesure SVG
`getComputedTextLength` s'en écarte d'au plus 0,02 px.

**Une table de métriques versionnée est donc une commodité, pas une nécessité** —
à une condition qui devient la vraie exigence : **le fichier de police doit être
épinglé et disponible au placeur**. Ce n'est pas une table de nombres qu'il faut
versionner, c'est une police.

`@napi-rs/canvas` est déjà une devDependency de `@sentropic/graph` rapatrié : la
capacité est présente, seule sa promotion en dépendance d'exécution serait une
décision.

Portée : largeurs d'avance, une seule police, sans chaîne de repli, sans
`letter-spacing` ni `font-feature-settings`. Avec une fonte web et un repli, la
mesure serveur ne vaut que si le repli est identique des deux côtés.

Cela ne change pas la scission entre **axes géométriques** — résolus avant le
placement, tout changement impose un replacement — et **axes de peinture**,
résolus au rendu. Cela en change le coût : épingler une police, non figer une
table.
