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
« SVG statique » était motivé par la CSP ; ce motif est réfuté pour le parcours BPMN
par la mesure ci-dessus, et pour la scène générique au §10. Les motifs restants
invoqués sont la simplicité, le rendu serveur et le poids ; le §12 mesure le rendu
serveur, le poids et le coût du premier rendu, la simplicité n'y est pas mesurée.

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
| Ombre portée | aucune ombre paramétrable par nœud ; un `drop-shadow` codé en dur marque le focus de `ForceGraph` (quatre frameworks) | par nœud via `themeCSS` (règle ciblant la classe du nœud) ; pour tout le diagramme via le look `neo` ; pas via `classDef` (`filter:…(…)` refusé à l'analyse, `box-shadow` accepté mais non peint) — mesuré en 11.17.2 sans CSP, §9.9 |

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
La qualification technique ci-dessus — « elkjs — qualifié sous conditions » (§2),
« bpmn-js — qualifié, clause de filigrane tenable » (§3) — ne remplace pas cette
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

### 9.9 Ombre portée via `classDef` — mesure

Mesuré le 2026-09-21 : mermaid 11.17.2 (pin de §9.2), `securityLevel: 'strict'`,
Chromium 153. Harnais : [`tools/style-parity-probe/`](../tools/style-parity-probe/README.md)
(`npm run measure:shadow`), preuve : `evidence/2026-09-21-mermaid-ombre.json`. La page
est servie sans CSP, puis sous la CSP stricte de §1 en en-tête. L'ombre est jugée aux
pixels : luminance moyenne d'une bande de 4 px juste sous le nœud, fond blanc = 255.

| Écriture | Analyse | Mécanisme dans le SVG | Ombre peinte, sans CSP | CSP stricte, SVG en ligne | CSP stricte, SVG en `<img>` |
|---|---|---|---|---|---|
| témoin : `classDef` sans ombre | acceptée | règle `.ombre>*` dans le `<style>` du SVG et attribut `style` sur la forme (`fill`, `stroke`) | non : 255 | non ; `fill` et `stroke` perdus | non : 255 |
| `classDef … filter:drop-shadow(2px 3px 2px #00000066)` | erreur : `(` refusé (jeton `PS`) | — | — | — | — |
| idem, `rgba(0\,0\,0\,0.4)` à virgules échappées | erreur | — | — | — | — |
| `classDef … filter:url(#ombre)` | erreur | — | — | — | — |
| `classDef … box-shadow:2px 3px 2px #00000066` | acceptée | même double émission que le témoin, `box-shadow` compris, `!important` | non : calculée, bande à 255 | non | non : 255 |
| `themeCSS` : `.ombre rect, .ombre path, .ombre polygon { filter: drop-shadow(…) }`, plus `class A,B ombre` | acceptée | règle `themeCSS` dans le `<style>` du SVG, portée par l'identifiant du diagramme | oui : 196,3 | non : `<style>` bloqué par `style-src-elem` | oui : 196,3 |
| look `neo`, sans `classDef` | acceptée | règle de thème `filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1))` dans le `<style>` du SVG | oui : 225,6 | non : `<style>` bloqué par `style-src-elem` | oui : 225,7 |

Quatre faits :

- **`classDef` n'exprime pas d'ombre portée.** Sa grammaire refuse la parenthèse, donc
  toute fonction CSS : `drop-shadow()` comme `url(#…)`. `box-shadow` passe l'analyse et
  le navigateur la calcule, mais elle ne peint pas une forme SVG.
- **`themeCSS` porte une ombre par nœud** : une règle libre ciblant la classe que
  `class` pose sur le nœud, compilée dans l'élément `<style>` du SVG. L'acceptation de
  `themeCSS` par GitHub, GitLab, VS Code et `mmdc` n'est pas mesurée.
- **Le look `neo` porte une ombre pour tout le diagramme**, par une règle de thème dans
  le même élément `<style>`.
- **Sous la CSP stricte, un SVG mermaid inséré dans la page perd tout son style**, pas
  seulement l'ombre : l'élément `<style>` tombe sous `style-src-elem`, les attributs
  `style` sous `style-src-attr` — environ 48 violations `style-src-attr` et 3
  `style-src-elem` par diagramme. Servi comme image, le même SVG garde l'ombre de
  `themeCSS` et du look `neo` sous la même CSP.

Portée : la mesure de §5.2 (neuf propriétés conservées) était faite sans CSP. Sous la
CSP stricte, en ligne, le témoin perd son `fill` et son `stroke` ; les sept autres
propriétés n'y ont pas été remesurées une à une.

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
même mur. **La CSP ne justifie plus le repli « v1 = SVG statique ».** Les motifs
restants invoqués en sa faveur sont la simplicité, le rendu serveur et le poids ; voir
les mesures au §12.

Vérifié : **aucun composant du design system ni la documentation n'emploie cet
idiome** aujourd'hui. Cela rassure sur le présent et ne dit rien du futur — or
c'est précisément l'idiome vers lequel on tend quand on veut thématiser un
composant par jeton, c'est-à-dire ce que D8 demande de faire. Ce n'est donc pas
une note de bas de page du dossier diagrammes, c'est une **règle de conception
du design system**. Voir §10.1.

### 10.1 Règle de conception — porter un jeton jusqu'à un composant

Nommer le chemin interdit ne suffit pas : il fallait mesurer les remplacements.
Harnais : [`tools/xyflow-csp-probe/token-paths/`](../tools/xyflow-csp-probe/token-paths/README.md),
preuve : `evidence/2026-09-20-chemins-jeton.jsonl`, et `evidence/2026-09-21-chemins-jeton-svg.jsonl`
pour E (remesuré, Chromium 153).

| Chemin | Violations | Enveloppe | Jeton appliqué |
|---|---:|---:|---|
| **A** — propriété CSS passée au composant | **1** | 1 `<svelte-css-wrapper>` | oui |
| **B** — variable posée sur un élément ancêtre (`style:--x={…}`) | **0** | 0 | oui |
| **C** — thématisation par classe | **0** | 0 | oui |
| **D** — CSSOM après montage (`setProperty`) | **0** | 0 | oui |
| **E** — même idiome qu'en A, en espace de noms SVG | **0** | 0 (un `<g>`) | oui — `fill` calculé `rgb(204, 255, 238)` ; témoin sans jeton `rgb(238, 238, 238)` |

Les trois remplacements appliquent bien le jeton. **Le chemin interdit n'apporte
donc rien** que B, C ou D n'apportent, et le coût de la règle est nul.

> **Règle.** Un composant destiné à tourner sous CSP stricte ne reçoit pas ses
> jetons par propriété CSS personnalisée passée en attribut. Il les reçoit par
> une variable posée sur un ancêtre, par une classe, ou par le CSSOM après
> montage.

Sur E, remesuré le 2026-09-21 : la première sonde lisait `backgroundColor` sur un
`<rect>`, qui vaut toujours transparent en SVG ; la propriété qui peint est `fill`.
Lue correctement, elle vaut le jeton, et un témoin sans propriété CSS vaut le repli
`#eee` : la lecture distingue bien les deux. Le compilateur émet `<g>` au lieu de
`<svelte-css-wrapper>` et y pose la variable par CSSOM, sans violation ; une variante
qui peint par une règle CSS du composant plutôt que par l'attribut `fill` donne le
même résultat. E fonctionne en rendu client.

Réserve, en rendu serveur : `svelte/server` sérialise ce `<g>` avec un attribut
`style` littéral, `<g style="--st-fond: #cfe;">`. Servi sous `style-src-attr 'none'`,
un attribut `style` présent dans le HTML est bloqué à l'analyse — mécanisme mesuré
pour xyflow au §12. Pour E lui-même, le chargement SSR sous CSP n'est pas mesuré.

**Rendre la règle exécutoire.** Les règles de `@sentropic/design-system-skills`
s'appliquent au **DOM rendu**, pas à la source. La forme naturelle est donc une
règle signalant tout élément portant un attribut `style` littéral dans le rendu :
elle attrape cette classe de défaut sans avoir à reconnaître un idiome de
compilateur, et elle en attrape d'autres du même genre. Cette règle toucherait un
paquet publié : elle est proposée, pas ajoutée.

### 10.2 Règle de renseignement des capacités

Issue de la réserve posée sur l'ombre (`elevation`) — désormais mesurée, voir la
ligne « Ombre portée » de §5.3 et §9.9 — et généralisée à toute la matrice :

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

## 12. Repli « SVG statique » — poids, premier rendu, rendu serveur

§10 retire la CSP des motifs du repli v1 « SVG statique » et en laisse trois
invoqués : la simplicité, le rendu serveur, le poids. Ce paragraphe mesure les deux
derniers, plus le coût du premier rendu. La simplicité n'est pas mesurée. Rien ici ne
tranche : la décision reste à l'owner.

Harnais : [`tools/csp-spike/`](../tools/csp-spike/README.md), étendu par `o3/`,
commande unique `npm run o3`. Preuve, échantillons bruts compris :
`tools/csp-spike/evidence/2026-09-22-o3-chromium-153.json`.

Dans tous les tableaux de ce paragraphe, les candidats sont rangés par ordre
alphabétique ; la ligne de référence vient en dernier.

**Ce qui est comparé.**

| Candidat | Forme mesurée |
|---|---|
| bpmn-js | 18.28.0, Viewer et Modeler (§3) |
| elkjs dans le navigateur | elkjs 0.12.0 place la scène dans la page, puis même rendu SVG que le SVG statique |
| SVG statique (repli v1) | vue placée par elkjs en Node, rendue en SVG sans placeur : DOM sans framework, composant Svelte, et le même composant rendu serveur puis hydraté |
| xyflow | `@xyflow/svelte` 1.6.6, configuration CSP-sûre de §10 : fond et contrôles, sans MiniMap |

Aucun composant du dépôt n'implémente aujourd'hui la scène statique v1 : le composant
mesuré est une implémentation minimale écrite pour la mesure
(`o3/src/StaticScene.svelte` : rectangles, libellés, arêtes orthogonales, classes,
aucun attribut `style`). Ses chiffres sont une borne basse du chemin statique, sans
chrome DS. mermaid n'est pas candidat : c'est une cible d'export (§9), pas un moteur de
rendu dans l'application.

**Scènes.** Deux scènes déterministes : 35 nœuds et 40 arêtes, la taille de la plus
grande vue du corpus en §9.4, puis 200 nœuds et 238 arêtes. Nœuds de 120 × 48, arbre
binaire plus une arête transverse tous les cinq nœuds, placement ELK `layered`. Tous
les candidats reçoivent les mêmes positions de nœuds. Les arêtes diffèrent : bpmn-js et
le SVG statique reprennent les tracés ELK (le BPMN, DI comprise, est dérivé de la vue
placée), elkjs dans le navigateur les recalcule sur la même entrée, et xyflow trace ses
propres courbes entre poignées. Le corpus réel n'est pas dans le dépôt et n'est pas
rejoué ici.

**Protocole.** Chromium 153.0.8010.36 sans interface, CSP stricte de §1 en en-tête,
témoin positif valide (une violation `style-src-attr`, style non appliqué). Viewport
1 440 × 900, build de production Vite 8.3.0, une entrée HTML par candidat. 30 tours ; à
chaque tour l'ordre des pages est mélangé (graine fixe), et chaque chargement ouvre un
contexte neuf, cache vide ; 2 chargements d'échauffement par page sont écartés.
Serveur local : le transfert n'entre pas dans les temps ; l'analyse et la compilation du
JS chargé, elles, y entrent.

- `tReady` : ms depuis le début de la navigation jusqu'à la scène complète dans le DOM,
  mise en page forcée. Les pages client récupèrent d'abord leurs données de scène par
  `fetch` ; ce délai est inclus.
- **Écart de définition.** Hors xyflow, `tReady` est pris dès que le rendu est terminé,
  sans attendre de trame. xyflow ne peut être complet qu'après au moins une trame :
  il mesure ses nœuds par `ResizeObserver`, puis applique `fitView`. Sa complétude (nœuds
  visibles, arêtes tracées, `fitView` appliqué) est détectée par `MutationObserver`, sans
  attente supplémentaire, mais elle inclut cette trame.
- `tPainted` : deux `requestAnimationFrame` après `tReady`, pris de la même façon pour
  tous ; quantifié par les trames, environ 16,7 ms.
- `tRender` : `tReady` moins l'appel du moteur, données déjà chargées.

Machine : AMD Ryzen AI Max+ 395 (32 fils), 57 Go, Linux 7.0.0-31 (Ubuntu 26.04),
Node 22.22.1, playwright-core 1.60.0 ; charge moyenne sur une minute en fin de run :
3,1 pour 32 fils. Autres versions : svelte 5.57.1, `@sveltejs/vite-plugin-svelte`
7.3.0, `@xyflow/system` 0.0.82, diagram-js 15.26.0, jsdom 30.1.1. Mesuré le 2026-09-22.

### 12.1 Poids chargé

JS, CSS et autres ressources chargés par la page, relevés sur les réponses réseau puis
pesés sur disque ; ko = 1 000 octets, gzip niveau 6, fichier par fichier. Le document HTML
et les données de scène ne sont pas comptés. Chaque page compte aussi 2,9 ko bruts
(1,4 ko gzip) d'instrumentation commune, CSP et chronométrage, identique d'une page à
l'autre.

| Page | JS brut | JS gzip | CSS brut | CSS gzip | Total brut | Total gzip |
|---|---:|---:|---:|---:|---:|---:|
| bpmn-js Modeler | 578,2 | 166,4 | 118,9 | 50,8 | 697,1 | 217,1 |
| bpmn-js Viewer | 204,5 | 59,8 | 25,9 | 5,2 | 230,4 | 64,9 |
| elkjs dans le navigateur, puis rendu SVG | 1 436,4 | 438,7 | 0,4 | 0,2 | 1 436,8 | 438,9 |
| SVG statique, DOM sans framework | 4,3 | 2,2 | 0,4 | 0,2 | 4,7 | 2,4 |
| SVG statique, composant Svelte | 54,9 | 21,5 | 0,4 | 0,2 | 55,3 | 21,7 |
| xyflow | 216,6 | 72,4 | 16,7 | 3,0 | 233,3 | 75,4 |
| Référence : page Svelte vide, runtime seul | 53,9 | 20,9 | 0,4 | 0,2 | 54,3 | 21,1 |

- Dans un hôte Svelte, le runtime de la ligne de référence est déjà payé. Au-delà : le
  composant SVG statique ajoute 1,0 ko brut (0,6 ko gzip), xyflow 179,0 ko bruts (54,3 ko gzip).
- Pages rendues serveur : JS et CSS identiques à leurs équivalents client. Le document
  HTML servi, non compté ci-dessus, porte en plus le rendu serveur et la vue placée
  inline : 22,6 / 131,6 ko (3,4 / 16,5 ko gzip) pour le SVG statique, 52,0 / 277,5 ko
  (5,2 / 19,4 ko gzip) pour xyflow par défaut, à 35 / 200 nœuds.
- Données de scène des pages client, non comptées ci-dessus : vue placée 14,1 ko à
  35 nœuds et 84,8 ko à 200 ; BPMN 19,5 et 116,3 ko ; entrée ELK brute
  4,7 et 26,8 ko.
- La CSS du Modeler comprend une feuille de 93,0 ko qui embarque la police BPMN.
- Écart avec §2 et §3 : ces chiffres comptent la page entière et le gzip de zlib ; les
  « 443 ko gzip » d'elkjs en §2 venaient du rapporteur de Vite.

### 12.2 Coût du premier rendu

Médiane [p25–p75] (min–max), en ms, 30 exécutions par case, quantiles par interpolation
linéaire. Toutes les exécutions chronométrées ont abouti, sans violation CSP. Les pages
xyflow rendues serveur ne sont pas chronométrées : leur rendu sous CSP est incomplet
(§12.3).

À 35 nœuds :

| Candidat | `tReady` | `tPainted` | `tRender` |
|---|---|---|---|
| bpmn-js Modeler | 65,8 [64,3–67,8] (60,2–76,7) | 72,5 [71,4–75,3] (66,9–86,2) | 35,8 [34,1–37,6] |
| bpmn-js Viewer | 49,5 [48,5–51,8] (44,4–58,3) | 55,5 [54,6–57,8] (50,5–64,6) | 30,9 [28,6–32,2] |
| elkjs dans le navigateur, puis rendu SVG | 173,7 [166,7–182,0] (157,2–195,7) | 195,8 [188,2–205,3] (169,1–225,1) | 96,9 [94,8–107,1] |
| SVG statique, DOM sans framework | 17,4 [15,7–18,8] (13,4–23,5) | 41,1 [37,3–43,7] (29,9–51,9) | 2,7 [2,5–3,1] |
| SVG statique, composant Svelte | 23,2 [21,7–25,1] (18,6–30,7) | 40,4 [37,5–46,6] (33,1–55,2) | 5,4 [5,0–6,4] |
| SVG statique, rendu serveur puis hydratation | 20,8 [19,5–22,8] (16,4–27,4) | 40,5 [37,2–42,9] (31,3–46,0) | 4,1 [3,3–6,2] |
| xyflow | 65,5 [61,6–67,2] (57,1–77,7) | 74,7 [71,2–78,3] (61,2–92,2) | 43,5 [41,2–44,9] |
| Référence : page Svelte vide, runtime seul | 17,8 [16,8–19,1] (15,1–22,6) | 39,3 [36,5–41,5] (32,0–43,7) | 2,7 [2,3–2,8] |

À 200 nœuds :

| Candidat | `tReady` | `tPainted` | `tRender` |
|---|---|---|---|
| bpmn-js Modeler | 104,5 [101,2–107,6] (95,5–116,6) | 114,8 [111,8–117,8] (106,6–127,5) | 74,0 [71,9–76,5] |
| bpmn-js Viewer | 85,0 [82,8–87,9] (78,3–102,7) | 94,5 [91,7–96,9] (87,1–111,9) | 65,7 [63,4–68,9] |
| elkjs dans le navigateur, puis rendu SVG | 251,1 [245,2–253,9] (239,7–260,2) | 270,9 [262,0–272,9] (241,9–284,0) | 175,7 [169,0–179,3] |
| SVG statique, DOM sans framework | 23,4 [21,3–24,6] (18,1–27,1) | 41,0 [35,6–42,6] (28,9–46,9) | 8,8 [6,5–9,3] |
| SVG statique, composant Svelte | 32,5 [30,4–35,0] (28,1–38,1) | 42,7 [41,0–46,0] (35,7–53,8) | 13,4 [12,6–15,1] |
| SVG statique, rendu serveur puis hydratation | 30,5 [28,8–32,3] (25,1–39,8) | 42,2 [38,5–44,5] (32,0–54,0) | 11,4 [9,0–12,6] |
| xyflow | 109,3 [105,4–113,6] (96,1–119,3) | 123,0 [120,3–126,2] (107,9–136,1) | 87,6 [84,3–92,4] |

- elkjs dans le navigateur : sur les 96,9 ms de `tRender` à 35 nœuds, le placement en
  prend 94,2 [92,0–104,4] ; à 200 nœuds, 169,2 [162,9–173,1] sur 175,7.
- SVG statique rendu serveur : données inline dans le HTML, sans `fetch` ; la scène est
  dans le document avant toute exécution de script, et `tReady` marque la fin de
  l'hydratation, pas la première apparition de la scène.

### 12.3 Rendu serveur

Côté Node, rendu à chaud, 30 rendus, médiane. Côté navigateur, la page rendue serveur
est chargée sous la CSP stricte, avec puis sans JavaScript. Violations comptées sur la
console du navigateur. « Violation ajoutée » : écart entre le compte avec JavaScript et
le compte sans JavaScript ; l'écouteur de la page n'en relève aucune non plus.

| Candidat | Rendu serveur | Durée, 35 / 200 nœuds | HTML rendu, 35 / 200 nœuds | Attributs `style` dans ce HTML | CSP stricte, sans JavaScript | CSP stricte, après hydratation |
|---|---|---|---|---|---|---|
| bpmn-js (Viewer) | non | — | — | — | — | — |
| elkjs | placement seulement, sans rendu | 13,9 / 49,4 ms | — (vue placée JSON 14,1 / 84,8 ko) | — | — | — |
| SVG statique (Svelte) | oui | 0,1 / 0,2 ms | 7,8 / 46,0 ko | 0 / 0 | 0 / 0 violations, pour 0 / 0 éléments à attribut `style` ; nœuds présents 35/35 et 200/200, visibles et positionnés : non relevés ; arêtes 40/40 et 238/238 | 0 / 0 violation ajoutée ; nœuds présents 35/35 et 200/200, visibles et positionnés : non relevés ; arêtes 40/40 et 238/238 |
| xyflow, configuration par défaut | oui | 0,8 / 4,2 ms | 37,0 / 191,9 ko | 36 / 201 (`transform`, `z-index`, `visibility`) | 36 / 201 violations, pour 36 / 201 éléments à attribut `style` ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 0/40 et 0/238 | 0 / 0 violation ajoutée ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 40/40 et 238/238 |
| xyflow, dimensions fournies | oui | 0,8 / 3,9 ms | 38,2 / 197,4 ko | 37 / 202 (s'y ajoutent `width`, `height`) | 37 / 202 violations, pour 37 / 202 éléments à attribut `style` ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 0/40 et 0/238 | 0 / 0 violation ajoutée ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 40/40 et 238/238 |
| xyflow, dimensions et poignées | oui | 1,1 / 6,0 ms | 63,9 / 352,3 ko | 77 / 440 | 77 / 440 violations, pour 77 / 440 éléments à attribut `style` ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 40/40 et 238/238 | 0 / 0 violation ajoutée ; nœuds présents 35/35 et 200/200, visibles 35/35 et 200/200, positionnés 0/35 et 0/200 ; arêtes 40/40 et 238/238 |

- **bpmn-js** : pas de rendu serveur. En Node nu, l'import direct échoue sans empaqueteur
  (`ERR_UNSUPPORTED_DIR_IMPORT`) ; empaqueté, `new Viewer()` échoue faute de `document`.
  Sous jsdom, `new Viewer()` passe et `importXML` échoue : `getBBox` manque, jsdom ne
  calcule pas la géométrie SVG. Un moteur qui la calcule côté serveur n'a pas été essayé,
  ni le Modeler.
- **elkjs** : placement en Node, 13,9 [12,3–14,6] ms à 35 nœuds et 49,4 [47,5–52,0] ms à
  200, à chaud. Au premier placement d'un processus neuf : 111,0 [109,9–113,5] ms et
  206,3 [200,8–209,0] ms, plus 64,8 et 64,5 ms d'import du module (médianes,
  10 processus neufs par taille).
- **SVG statique** : rendu par `svelte/server` en Node nu, sans DOM ni canvas. La
  géométrie passe par des attributs SVG, la peinture par des classes : aucun attribut
  `style` dans le HTML, scène complète sans JavaScript. Hydratation : `tRender`
  4,1 / 11,4 ms (§12.2).
- **xyflow** : rendu par `svelte/server` en Node nu, sans DOM ni canvas. La géométrie des
  nœuds passe par des attributs `style` ; servis dans le HTML, ils sont bloqués à
  l'analyse, et l'hydratation ne les rétablit pas. Témoin sans CSP, un chargement par
  page : 35/35 et 200/200 nœuds positionnés après hydratation. Explication compatible avec
  ces relevés, non vérifiée dans le source de Svelte : l'hydratation ne réécrit pas une
  valeur de style inchangée, donc le `transform` servi puis bloqué n'est jamais
  réappliqué. Le HTML serveur marque aussi chaque nœud des classes `selected` et
  `dragging` (35/35 et 200/200, pour chacune).

**Non mesuré.**

- Autres navigateurs que Chromium : `unverified`.
- Réseau réel et processeur bridé : serveur local et machine de bureau, donc le coût de
  transfert du poids n'apparaît dans aucun temps.
- React, Vue, Angular : seul le pilote Svelte est mesuré.
- Chrome DS, thème, interactions (glisser, zoom), mémoire, coût au-delà du premier
  rendu : `not covered`.
- Première peinture (FCP) : l'entrée n'était pas disponible au moment de la lecture dans
  la plupart des exécutions ; non rapportée.
- Hydratation de xyflow rendu serveur sous CSP : non chronométrée, puisque le rendu est
  incomplet ; sans CSP, un seul échantillon par page, pas de statistique.
- bpmn-js pré-rendu par un navigateur côté serveur, ou sous un autre émulateur de DOM ;
  bpmn-js Modeler en Node : non essayés.
- Idiome E de §10.1 chargé en rendu serveur sous CSP : non mesuré.
- Visibilité et position calculées des nœuds du SVG statique rendu serveur : non
  relevées par la sonde, qui en compte seulement la présence.
- Corpus réel : `source-gap`, absent du dépôt.
