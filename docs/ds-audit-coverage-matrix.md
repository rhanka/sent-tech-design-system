# WP7 — Matrice de couverture & traçabilité audit DS

Document de traçabilité (livrable documentaire WP7). Deux matrices :

1. **Couverture des références upstream `pbakaus/impeccable`** : pour chaque référence, son cluster (A–E), son statut de couverture, et le doc d'audit local qui la traite.
2. **Traçabilité `finding WP7 → règle WP8 (packages/skills) → test`** : pour chaque règle réellement présente dans le code, le finding source et le test qui la couvre.

Ce fichier ne modifie aucun autre track : il consolide ce qui est *prouvé par les fichiers du repo*, pas ce qui est promis.

## Méthode & limites

### Sources lues

- `docs/workpackages.md` (section WP7 : énumération des clusters A–E, 25 noms).
- `docs/impeccable-roadmap.md` (description du skill upstream : « 7 références de domaine » + « 23 sous-commandes »).
- `docs/ds-audit-report.md`, `docs/ds-audit-consolidated-v2.md` (findings priorisés P0/P1/P2).
- Les 5 docs cluster : `docs/ds-audit-typography.md`, `ds-audit-color.md`, `ds-audit-spatial.md`, `ds-audit-motion.md`, `ds-audit-meta.md`.
- La skill upstream installée **dans le repo** : `/.agents/skills/impeccable/` (et non `~/.claude`, où seule la skill `graphify` est présente — `impeccable` n'y est pas installée globalement).
  - `reference/*.md` : **36 fichiers** de référence réels.
  - `scripts/command-metadata.json` : **23 commandes** décrites.
  - `SKILL.md` : table de **24 commandes** (les 23 + `shape`).
- Le moteur réel : `packages/skills/src/rules/*.ts`, `src/rules/index.ts`, et le test `packages/skills/test-fixtures/skills.test.js`.

### Compte réel des références : 36 fichiers trouvés, pas exactement « 37 »

Le chiffre « 37 références upstream » de `docs/workpackages.md` n'est **pas reproductible à l'identique** depuis les fichiers du repo. Ce qui est mesurable :

- `.agents/skills/impeccable/reference/` contient **36 fichiers `.md`**.
- Le tableau de commandes de `SKILL.md` liste **24 commandes** (dont `pin`/`unpin` sans fichier de référence).
- `command-metadata.json` décrit **23 commandes**.

Hypothèses les plus plausibles pour « 37 » :
- **36 fichiers de référence + 1** (probablement la CLI déterministe `npx impeccable detect` décrite dans la roadmap, qui n'a pas de fichier `reference/*.md` mais est une « capacité » à part entière). → **36/37 fichiers présents, 1 « référence » = capacité CLI**.
- Ou un décompte upstream antérieur (24 commandes + 7 domaines + 6 supports = 37) qui ne colle pas exactement au snapshot présent.

**Décision de ce document** : on documente honnêtement **les 36 fichiers réellement présents**, on les classe par cluster, et on marque l'écart au « 37 » comme **à confirmer** (voir ligne `detect (CLI)` plus bas). Aucune référence n'est inventée pour atteindre 37.

### Ce qui reste incertain

- Le mapping cluster→référence pour les fichiers **hors des 25 noms de `workpackages.md`** (les ~11 fichiers « en plus ») est *déduit* du titre/objet de chaque fichier, pas d'une déclaration explicite WP7. Ils sont marqués `(déduit)`.
- Les statuts de couverture A=70 % / … / E=60 % viennent de `workpackages.md` ; à l'échelle d'une *référence individuelle*, « couverte » signifie : un doc d'audit local la nomme explicitement comme cluster source ou la traite par un finding. Beaucoup de références sont **nommées par cluster mais non traitées individuellement** → statut `Partielle`.

---

## 1. Matrice de couverture des références upstream

Clusters : **A** typo/writing · **B** color/contrast · **C** spatial/responsive · **D** motion/interaction · **E** audit/critique/polish · **—** support/méta hors clusters A–E.

Statut : `Couverte` = traitée par ≥1 finding ou nommée cluster source explicite dans un doc local · `Partielle` = nommée comme source de cluster mais pas de finding propre · `Non couverte` = aucun doc local ne la traite · `À confirmer` = existence/décompte incertain.

### Cluster A — Typography & writing (`docs/ds-audit-typography.md`)

| # | Référence upstream | Cluster | Statut | Doc d'audit local |
|---|---|---|---|---|
| 1 | `typography` | A | Couverte | `ds-audit-typography.md` (P0-5 single-font, P0-4 line-length, P1-1 échelle) |
| 2 | `typeset` | A | Partielle | nommée cluster A dans `workpackages.md` ; pas de finding propre dans `ds-audit-typography.md` |
| 3 | `ux-writing` | A | Couverte | `ds-audit-typography.md` (P1-3 em dash) |
| 4 | `clarify` | A | Partielle | nommée cluster A ; aucun finding `clarify`-spécifique |
| 5 | `cognitive-load` | A | Non couverte | fichier `reference/cognitive-load.md` présent ; aucun doc local ne le traite |

### Cluster B — Color & contrast (`docs/ds-audit-color.md`)

| # | Référence upstream | Cluster | Statut | Doc d'audit local |
|---|---|---|---|---|
| 6 | `color-and-contrast` | B | Couverte | `ds-audit-color.md` (P0-1 hard-coded, P0-2 contraste) |
| 7 | `colorize` | B | Partielle | nommée cluster B ; pas de finding propre |
| 8 | `bolder` | B | Partielle | nommée cluster B ; pas de finding propre |
| 9 | `quieter` | B | Partielle | nommée cluster B ; pas de finding propre |

### Cluster C — Spatial & responsive (`docs/ds-audit-spatial.md`)

| # | Référence upstream | Cluster | Statut | Doc d'audit local |
|---|---|---|---|---|
| 10 | `spatial-design` | C | Couverte | `ds-audit-spatial.md` (P1-7 padding-scale, P0-3 grilles) |
| 11 | `layout` | C | Couverte | `ds-audit-spatial.md` (P0-3 monotonie de grilles) |
| 12 | `responsive-design` | C | Partielle | nommée cluster C ; P1-2 touch-target partiellement responsive, pas de finding responsive dédié |
| 13 | `shape` | C | Partielle | nommée cluster C ; corrélée P1-5 rail+arrondi mais pas de finding `shape` propre |

### Cluster D — Motion & interaction (`docs/ds-audit-motion.md`)

| # | Référence upstream | Cluster | Statut | Doc d'audit local |
|---|---|---|---|---|
| 14 | `motion-design` | D | Couverte | `ds-audit-motion.md` (P1-6 absence de motion, P2-5 reduced-motion) |
| 15 | `animate` | D | Partielle | nommée cluster D ; pas de finding propre |
| 16 | `delight` | D | Partielle | nommée cluster D ; pas de finding propre |
| 17 | `overdrive` | D | Partielle | nommée cluster D ; pas de finding propre |
| 18 | `interaction-design` | D | Partielle | cluster source listé dans `ds-audit-motion.md` ; pas de finding interaction dédié (focus/forms/loading) |

### Cluster E — Audit / critique / polish (`docs/ds-audit-meta.md`)

| # | Référence upstream | Cluster | Statut | Doc d'audit local |
|---|---|---|---|---|
| 19 | `audit` | E | Couverte | `ds-audit-meta.md` + `ds-audit-report.md` (scan `npx impeccable detect`) |
| 20 | `critique` | E | Couverte | `ds-audit-meta.md` (consolidation V1→V2) |
| 21 | `polish` | E | Couverte | `ds-audit-meta.md` (priorités de consolidation P0) |
| 22 | `harden` | E | Partielle | nommée cluster E ; pas de finding `harden` propre |
| 23 | `optimize` | E | Partielle | nommée cluster E ; pas de finding `optimize` propre |
| 24 | `extract` | E | Partielle | nommée cluster E ; pas de finding `extract` propre |
| 25 | `distill` | E | Partielle | nommée cluster E ; pas de finding `distill` propre |
| 26 | `craft` | E | Partielle | nommée cluster E ; pas de finding `craft` propre |

### Hors clusters A–E — références présentes mais non rattachées par WP7

Ces fichiers existent dans `reference/` mais ne figurent dans **aucun** des 5 clusters énumérés par `workpackages.md`. Cluster proposé `(déduit)` à partir du contenu du fichier.

| # | Référence upstream | Cluster (déduit) | Statut | Note |
|---|---|---|---|---|
| 27 | `teach` | — (setup) | Non couverte | one-time setup PRODUCT.md/DESIGN.md ; hors périmètre audit |
| 28 | `document` | — (setup) | Non couverte | génère DESIGN.md ; hors périmètre audit |
| 29 | `onboard` | E ou D (déduit) | Non couverte | first-run/empty states ; aucun doc local |
| 30 | `adapt` | C (déduit) | Non couverte | adaptation devices/écrans ; aucun finding propre |
| 31 | `live` | — (itération) | Non couverte | mode navigateur ; cité comme source dans `ds-audit-meta.md` (`reference/live.md`) mais non audité |
| 32 | `brand` | — (registre) | Non couverte | registre brand ; pas une référence d'audit |
| 33 | `product` | — (registre) | Non couverte | registre product ; pas une référence d'audit |
| 34 | `cognitive-load` | A (déduit) | Non couverte | déjà compté en A (#5) — fichier unique, double-rattachement possible |
| 35 | `heuristics-scoring` | E (déduit) | Non couverte | guide de scoring ; support de `critique`, pas audité localement |
| 36 | `personas` | E ou D (déduit) | Non couverte | tests par persona ; `--personas` explicitement **refusé** par la CLI (cf. test) |
| 37 | `codex` | — (asset/visuel) | Non couverte | direction visuelle / production d'assets ; hors périmètre audit DS |

> Note décompte : `cognitive-load` apparaît une fois en cluster A (#5) et une fois ici (#34) parce que `workpackages.md` le range en A alors que le fichier est par ailleurs un support transverse. Il s'agit du **même fichier** ; ne pas le compter deux fois dans le total de fichiers.

### Synthèse couverture

- **Fichiers de référence réels** : **36** dans `reference/`.
- **Objectif annoncé** : 37. **Écart de 1** → marqué **À confirmer** : la « 37e référence » correspond le plus probablement à la **CLI déterministe `npx impeccable detect`** (capacité sans fichier `reference/*.md`), pas à un fichier manquant.

| Statut | Nombre (sur 36 fichiers) |
|---|---|
| Couverte | 9 (`typography`, `ux-writing`, `color-and-contrast`, `spatial-design`, `layout`, `motion-design`, `audit`, `critique`, `polish`) |
| Partielle | 16 lignes de référence (`typeset`, `clarify`, `colorize`, `bolder`, `quieter`, `responsive-design`, `shape`, `animate`, `delight`, `overdrive`, `interaction-design`, `harden`, `optimize`, `extract`, `distill`, `craft`), certaines recoupées |
| Non couverte | les supports/hors-cluster (`cognitive-load`, `teach`, `document`, `onboard`, `adapt`, `live`, `brand`, `product`, `heuristics-scoring`, `personas`, `codex`) |
| À confirmer | la 37e « référence » (capacité CLI `detect`) |

**Couverture réellement *prouvée par un finding local* : 9 / 36 références.** Le reste est soit « nommé comme cluster source » sans finding propre (Partielle), soit hors périmètre audit (Non couverte). Les statuts A–E à « 60–70 % » de `workpackages.md` sont donc optimistes au regard du nombre de références *individuellement* traitées.

---

## 2. Matrice de traçabilité `finding WP7 → règle WP8 → test`

### Règles réellement présentes dans le code

Source : `packages/skills/src/rules/index.ts` (`defaultRules`) et les fichiers `src/rules/*.ts`. **25 règles actives** en WP8, chacune reliée dans le code à un principe `design` et à un finding WP7 via `Rule.principle` / `Rule.wp7Finding`. *(Note : le moteur vit dans `packages/skills`, pas `packages/impeccable` — ancien chemin corrigé.)*

| `ruleId` (exact) | Export (nom de code) | Fichier source |
|---|---|---|
| `single-font` | `singleFontRule` | `src/rules/singleFontRule.ts` |
| `no-bare-hex` | `noBareHexRule` | `src/rules/noBareHexRule.ts` |
| `no-em-dash` | `noEmDashRule` | `src/rules/noEmDashRule.ts` |
| `side-tab-on-rounded` | `sideTabOnRoundedRule` | `src/rules/sideTabOnRoundedRule.ts` |
| `line-length-cap` | `lineLengthRule` | `src/rules/lineLengthRule.ts` |
| `touch-target-44` | `touchTargetRule` | `src/rules/touchTargetRule.ts` |
| `heading-hierarchy` | `headingHierarchyRule` | `src/rules/headingHierarchyRule.ts` |
| `underline-hardcoded-border` | `underlineBorderRule` | `src/rules/underlineBorderRule.ts` |
| `cramped-padding` | `crampedPaddingRule` | `src/rules/crampedPaddingRule.ts` |
| `motion-subtle` | `motionSubtleRule` | `src/rules/motionSubtleRule.ts` |
| `padding-scale-token` | `paddingScaleTokenRule` | `src/rules/paddingScaleTokenRule.ts` |
| `rail-vs-radius-consistency` | `railVsRadiusConsistencyRule` | `src/rules/railVsRadiusConsistencyRule.ts` |
| `grid-variance` | `gridVarianceRule` | `src/rules/gridVarianceRule.ts` |
| `contrast-token-pair` | `contrastTokenPairRule` | `src/rules/contrastTokenPairRule.ts` |
| `typography-scale-token` | `typographyScaleTokenRule` | `src/rules/typographyScaleTokenRule.ts` |
| `no-pure-black-white` | `noPureBlackWhiteRule` | `src/rules/noPureBlackWhiteRule.ts` |
| `raw-color-value` | `rawColorValueRule` | `src/rules/rawColorValueRule.ts` |
| `font-family-token` | `fontFamilyTokenRule` | `src/rules/fontFamilyTokenRule.ts` |
| `display-body-font-pair` | `displayBodyFontPairRule` | `src/rules/displayBodyFontPairRule.ts` |
| `line-length-max-width` | `lineLengthMaxWidthRule` | `src/rules/lineLengthMaxWidthRule.ts` |
| `h1-inline-badge` | `h1InlineBadgeRule` | `src/rules/h1InlineBadgeRule.ts` |
| `status-indicator-label` | `statusIndicatorLabelRule` | `src/rules/statusIndicatorLabelRule.ts` |
| `redundant-url-label` | `redundantUrlLabelRule` | `src/rules/redundantUrlLabelRule.ts` |
| `auto-fit-card-grid` | `autoFitCardGridRule` | `src/rules/autoFitCardGridRule.ts` |
| `focus-visible-ring` | `focusVisibleRingRule` | `src/rules/focusVisibleRingRule.ts` |

### Table de traçabilité

Finding = entrée priorisée de `docs/ds-audit-consolidated-v2.md` (et son ID cluster dans `ds-audit-report.md` / docs cluster). Test = présence dans `packages/skills/test-fixtures/skills.test.js`.

> **Mise à jour WP8** : les 25 règles actives ont une couverture directe via `audit()` (positif + négatif pour les règles comportementales) et le test de garde vérifie aussi `defaultRules.length === 25` plus la présence de `principle` / `wp7Finding`.

| Finding WP7 (consolidated-v2 / cluster) | Règle WP8 (`ruleId`) | Test couvrant la règle | Statut test |
|---|---|---|---|
| P0-5 `single-font` / `overused-font` (cluster A) | `single-font` | test positif (1 famille → finding) + négatifs (2 familles → rien, `@font-face` seul ignoré) + stylesheet lié local | **Couvert** |
| P0-1 couleurs hard-codées (`#fff`/`#000`/hex) (cluster B) | `no-bare-hex` | tests positifs (hex inline + hex direct en `<style>` → finding) + négatifs (token sémantique, déclaration de token CSS et fallback `var(...)` → rien) ; aussi couverture indirecte via `align --tones` | **Couvert** |
| P1-3 em dash (`—`) en microcopy (cluster A) | `no-em-dash` | test positif (— → finding) + négatif + garde anti-duplication ancêtres/direct text | **Couvert** |
| P1-5 rail gauche + container arrondi / side-tab (cluster C + `known-issues`) | `side-tab-on-rounded` | test positif (border-left + radius → finding) + négatif (radius 0) | **Couvert** |
| P0-4 longueur de ligne > 75ch (cluster A) | `line-length-cap` | test positif (paragraphe long sans max-width → finding) + négatifs (max-width inline, `<style>` et stylesheet lié local) | **Couvert** |
| P1-2 cible tactile < 44px (cluster C) | `touch-target-44` | **Oui** : 3 tests asservissent `findings.some(ruleId === "touch-target-44")` (contrat `audit`, `check --technical`, exit code 1) | **Couvert** |
| (anti-pattern a11y générique, non listé P0/P1/P2 explicitement) | `heading-hierarchy` | test positif (niveau sauté H1→H3 → finding) + négatif (H1→H2) | **Couvert** |
| P1-5 tailles d'espace bruitées / alignement par bord | `underline-hardcoded-border` | test positif (border-bottom hardcodé) + négatif (box-shadow inset) | **Couvert** |
| P1-7 cramped spacing sur certains blocs docs | `cramped-padding` | test positif (surface padding 4px) + négatif (padding tokenisé) | **Couvert** |
| P1-6 motion quasi absente + P2-5 absence de `prefers-reduced-motion` | `motion-subtle` | test positif (transition brute sans garde) + négatif (token + media reduced-motion) | **Couvert** |
| P1-5 tailles d'espace bruitées | `padding-scale-token` | test positif (spacing 5/6/7px) + négatif (token ou grille 4px) | **Couvert** |
| P1-4 rail gauche + surface arrondie | `rail-vs-radius-consistency` | test positif (rail arrondi) + négatif (rail carré) | **Couvert** |
| P0-3 monotonie des grilles de cartes | `grid-variance` | test positif (6 cartes, repeat(3,1fr)) + négatif (grille tokenisée) | **Couvert** |
| P0-2 contraste/alignement chromatique incohérent | `contrast-token-pair` | test positif (paire hex faible contraste) + négatif (paire tokenisée) | **Couvert** |
| P1-1 échelle typographique dense | `typography-scale-token` | test positif (font-size/line-height hors échelle) + négatif (token ou palier autorisé) | **Couvert** |
| P0-2 contraste/alignement chromatique incohérent sur fonds colorés | `no-pure-black-white` | test positif (#fff/#000 → finding) + négatif (tokens texte/surface) | **Couvert** |
| P0-1 couleurs hard-codées hors tokens | `raw-color-value` | test positif (`rgb`/`hsl` bruts → finding) + négatif (tokens couleur) | **Couvert** |
| P0-5 `single-font` / `overused-font` | `font-family-token` | test positif (Inter brut → finding) + négatif (token font) | **Couvert** |
| P0-5 `single-font` / `overused-font` | `display-body-font-pair` | test positif (même famille display/body) + négatif (tokens distincts) | **Couvert** |
| P0-4 longueur de ligne trop élevée | `line-length-max-width` | test positif (`max-width:48rem` sur texte long) + négatif (`65ch`) | **Couvert** |
| P2-2 badge inline dans le H1 | `h1-inline-badge` | test positif (badge dans H1) + négatif (badge hors H1) | **Couvert** |
| P2-4 statut docs sans légende explicite | `status-indicator-label` | test positif (dot sans nom) + négatifs (`aria-label`, libellé court, enfant décoratif d'un indicateur nommé) | **Couvert** |
| P2-3 labels mineurs sans coût informationnel | `redundant-url-label` | test positif (URL visible redondante) + négatif (libellé utile) | **Couvert** |
| P0-3 monotonie des grilles de cartes | `auto-fit-card-grid` | test positif (`repeat(auto-fit,minmax(...))`) + négatif (token layout) | **Couvert** |
| P1-2 cible/affordance interactive insuffisante | `focus-visible-ring` | test positif (`outline:none` sans focus-visible) + négatif (focus ring tokenisé) | **Couvert** |

### Findings priorisés restant SANS règle implémentée

Issus de la liste opérationnelle de `consolidated-v2.md` et des findings P2 :

| Finding / règle planifiée | État dans le code |
|---|---|
| P2-1 dark-mode absent (cluster B) | **Aucune règle** : nécessite une preuve de thème runtime ou un contrat de démo, pas un scan HTML statique seul |

### Findings du scan déterministe NON couverts par règle (limites connues)

D'après `consolidated-v2.md` § « Alignement avec known-issues » :
- `OverflowMenu` z-index trop bas : **non détecté** par le scan, **aucune règle**.
- Drawer/menu close conflict : **non détecté**, **aucune règle**.

---

## 3. Trous identifiés (synthèse factuelle)

### Références non couvertes (par un finding local)
27 des 36 fichiers de référence ne sont **pas** traités par un finding propre : toutes les références marquées `Partielle` (nommées cluster source mais sans finding) et toutes les `Non couverte` (supports/registres : `cognitive-load`, `teach`, `document`, `onboard`, `adapt`, `live`, `brand`, `product`, `heuristics-scoring`, `personas`, `codex`).

### Findings sans règle
Les principaux P0/P1 issus de WP7 et les P2 éditoriaux exploitables en statique ont désormais une règle déterministe dans `packages/skills`. Les manques restants sont surtout non déterministes en statique : dark-mode absent, `OverflowMenu` z-index trop bas et conflit Drawer/menu close.

### Règles sans test — RÉSOLU
~~6 des 7 règles actives n'avaient aucun test direct~~ → **25/25 règles couvertes**. Les règles WP8 ajoutées
(`cramped-padding`, `motion-subtle`, `padding-scale-token`, `rail-vs-radius-consistency`,
`grid-variance`, `contrast-token-pair`, `typography-scale-token`, `no-pure-black-white`,
`raw-color-value`, `font-family-token`, `display-body-font-pair`, `line-length-max-width`,
`h1-inline-badge`, `status-indicator-label`, `redundant-url-label`, `auto-fit-card-grid`,
`focus-visible-ring`) ont chacune reçu un test positif + négatif via `audit()` dans
`packages/skills/test-fixtures/skills.test.js`. Le test de garde vérifie aussi la traçabilité
`principle` / `wp7Finding` de chaque règle.

### Écart de décompte
**36 fichiers de référence trouvés vs 37 annoncés** → 1 écart, attribué (à confirmer) à la capacité CLI `npx impeccable detect` qui n'a pas de fichier `reference/*.md`. Aucune référence n'a été inventée pour combler l'écart.
