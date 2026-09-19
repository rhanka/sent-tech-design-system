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
