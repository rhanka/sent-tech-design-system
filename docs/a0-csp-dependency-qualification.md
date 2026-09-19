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
| Taux de remplissage | ratio à définir | **règle opérante** : un libellé ne s'affiche que s'il tient sans troncature à la taille minimale ratifiée, sinon infobulle ou légende | ancrée sur les garde-fous DS réels (`w > 28 && h > 14`, `LABEL_MIN_W = 44`) et vérifiable automatiquement, ce qu'un ratio n'est pas |
| Rôles de texte | `label/caption/title/annotation` | **quatre rôles de diagramme à tokeniser** : titre de vue, libellé de nœud, annotation, légende/axe | les quatre rôles tokenisés du DS sont `control/field/label/link`, des rôles de formulaire ; le DS a déjà trois systèmes typographiques non réconciliés, il n'en recevra pas un quatrième |

Le balayage ELK — grille bornée, nombre de candidats, budget de temps — n'est pas
ratifié : les seuls chiffres disponibles proviennent d'un graphe jouet à
2 groupes et 4 nœuds (86 ms navigateur, 80 ms Node). Ratification après mesure
sur corpus réel.

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
