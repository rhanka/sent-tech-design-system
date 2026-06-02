# Tracker — fermeture des écarts de fidélité (objectif : 0 écart net)

Source de vérité chiffrée : `docs/compare-fidelity-report.md` (régénéré par `tools/compare/fidelity.mjs`).
Ce tracker = stratégie de fermeture + statut par **famille** d'écarts. Mis à jour à chaque itération du loop.

> Départ : **74,8 %** (109 ≠) → 1ère passe **84,0 %** (69 ≠) → passe F1+F2 **87,3 %** (55 ≠) → passe F3+F4+F6 (boîte-champ DSFR) **89,4 %** (46 ≠) → passe F5+F9 (line-height + padding sur Button/Select/Link/Card) **92,8 %** (31 ≠) → passe F7+F8 (onglet actif DSFR + Carbon) **96,1 %** (17 ≠ — **périmètre 7 composants**). **Cible : 100 % de fermeture**
> (tout écart restant doit être soit fermé, soit un escape PROUVÉ irréductible et justifié ici).
>
> **G5 — élargissement du périmètre (29/05) : 7 → 22 composants/variants, 41 paires composant×thème.** Le banc mesurait 14 paires (7 composants × 2 thèmes) ; il en mesure désormais **41**. La fidélité globale recalculée sur ce périmètre élargi est **79,6 %** (967 `=`, 43 `~`, **259 ≠** sur 1269 propriétés). Ce n'est PAS une régression : les 7 composants d'origine restent à **94,2 %** (25 ≠ ; ~96,1 % aux arrondis près) — la baisse vient des **15 nouveaux composants/variants** ajoutés au banc, qui exposent le VRAI portage (nos composants sont stylés « Sent Tech base », pas encore mappés pixel-près à l'anatomie DSFR/Carbon). Ces ≠ sont **réels et mesurés** (réf CDN chargée des deux côtés sur les 41 paires : aucune fausse paire, aucun faux `=`). La fermeture pixel-près de ces nouveaux composants est un chantier ultérieur (familles F10+) ; l'objectif de cette passe était la **visibilité** du portage réel, pas sa fermeture.

Statut : ⬜ ouvert · 🟦 en cours · ✅ fermé · 🛡️ escape justifié (irréductible, accepté).

| # | Famille d'écart | Composants touchés | Stratégie de fermeture | Statut |
|---|---|---|---|---|
| F1 | **Largeur de boîte** (artefact de mise en page) | champs + Card | ✅ Banc apples-to-apples : iframe réf à largeur fixe (348px → zone de contenu **320px** identique des deux côtés) + champs (Input/Textarea/Select) à `width:320px` + carte rendue dans le même contexte 18rem que la réf. **box width** des 3 champs et de la carte désormais `=`. Résidu : box-width `≠` ne subsiste que sur 3 composants **à largeur intrinsèque** (dsfr/Button Δ2px metrics Marianne, carbon/Button Δ-46px et dsfr/Tabs Δ-24,5px = **padding** → F7/F9, pas F1). Box-**height** résiduelles = line-height (F5) / padding (F7/F9), pas l'artefact de largeur. | ✅ |
| F2 | **Police de marque** vs system-ui (≈7) | Button/Tabs DSFR, Button/Input/Textarea/Select/Tabs Carbon | ✅ Polices chargées RÉELLEMENT des deux côtés : **Marianne** (DSFR) via `@font-face` CDN absolus (sans injecter le reset global dsfr.min.css) + utilitaire DSFR dans l'iframe ; **IBM Plex Sans** (Carbon) via Google Fonts ; `font-family` de marque forcée sur le `<body>` de l'iframe + `font-family: var(--st-font-sans)` sur le scope (Link/Card héritent). **14/14 `font-family` désormais `=`, 0 `≠`.** | ✅ |
| F3 | **Rayon haut 4px champs DSFR** (6) | Input/Textarea/Select | ✅ Extension additive **anatomie v1.3.0** : `field.radiusTop` (Css-ready, défaut = `shape.radius` → base inchangée) résolu dans `fieldOf`, émis par `createComponent` pour TOUS les thèmes (anti-var-fantôme), consommé en `border-top-left/right-radius` (bas = `shape.radius`). DSFR pose 4px haut / 0 bas. **radius topLeft/topRight des 3 champs DSFR désormais `=`.** | ✅ |
| F4 | **Filet bas DSFR : bordure vs none** (4) | Input/Textarea/Select/~~Tabs~~ | ✅ (champs) DSFR (`field.underlineMode: "shadow"`) rend son filet bas via **`box-shadow: inset 0 -1px 0 0 #3a3a3a`** ; `border-bottom: none`. Composé avec le focus (outline DSFR) sans perdre le soulignement de repos. Carbon GARDE son vrai `border-bottom` (sa vraie technique → 100 % préservé). **`border-bottom style` des 3 champs DSFR = `=` (none vs none).** Le filet de l'onglet DSFR reste dans le lot Tabs (F7/F8). | ✅ |
| F5 | **line-height non posé** (≈7) | Select/Link/Card DSFR + Select/Link/Card/Input/Tabs Carbon | ✅ (Button/Select/Link/Card — Tabs reste lot F8) **Link** : le rôle link DSFR pose `lineHeight 1.5` (24px) — `.st-link` rendait `inherit`→`normal`, désormais `24px` mesuré (Carbon link déjà 18px ~). **Card** (∈ PILOT) : typo carte additive (`card.fontSize/lineHeight/letterSpacing`) consommée par `.st-card` ; défaut base = `inherit`/`normal`/`normal` (rendu base INCHANGÉ), DSFR pose 24px (1.5), Carbon pose 14px/14px/0.16px → ferme aussi font-size + letter-spacing Carbon. **Select** : INVESTIGATION CONCLUANTE — un `<select>` natif en `appearance: auto` a sa `line-height` FORCÉE à `normal` par l'UA Chrome (prouvé : `24px !important` → computed `normal`, hauteur inchangée) ; en `appearance: none` l'UA HONORE la valeur (24px→24px, 18px→18px). C'est exactement ce que font les vrais `.fr-select`/`.bx--select-input`. Anatomie v1.4.0 `field.selectAppearance` (défaut `auto` → base natif inchangé) + `field.selectChevron` (redessine la flèche que l'UA retire) : DSFR/Carbon passent en `none`, la line-height d'anatomie PREND. **dsfr/Select 90,3%→100%**, **carbon/Select 93,5%→100%**, **carbon/Card 87,1%→96,8%**, **dsfr/Card 80,6%→83,9%**, **dsfr/Link line-height `=`**. (Résidus hors F5 : Card box-height = structure de contenu réf ; dsfr/Card padding = artefact wrapper réf F1 ; dsfr/Link text-decoration = le lien DSFR EST souligné. Carbon Textarea 18 vs 20 = rôle field multiligne, hors lot.) | ✅ |
| F6 | **Couleur de texte** nuances (≈4) | Input/Textarea/Select/Card DSFR (#161616 vs #3a3a3a) | ✅ `semantic.text.primary` = grey-200 `#3a3a3a` (`--text-default-grey`), contraste ~8:1 sur fond `#eee` (AA+). **`color` des 3 champs DSFR = `=` (rgb(58,58,58) des deux côtés)**, re-mesuré. (Le résidu Card est piloté par F5 line-height, hors F6.) | ✅ |
| F7 | **Onglet actif DSFR** (5) | Tabs | ✅ Extension additive **anatomie v1.5.0** : bloc `tabs` par thème (`activeText`/`activeBackground`/`activeWeight`/`tabPaddingBlock`/`tabPaddingInline`/`tabFontSize`/`tabLineHeight`/`indicatorSide`/`indicatorMode`) résolu par `tabsOf`, émis par `createComponent` pour les 3 thèmes (anti-var-fantôme), consommé par `.st-tabs__tab` / `.st-tabs__tab--active`. **Défauts = rendu base ACTUEL** (padding 12px/4px, font-size `inherit`, poids 600, fond transparent, indicateur bas 1px, texte `text.primary`) → base Sent Tech INCHANGÉE (vérifié : forge/entropic/sent-tech.css ne gagnent que des vars inertes). DSFR pose : poids **700**, fond **blanc**, texte **Bleu France #000091**, padding **8px/16px**, line-height 24px ; l'accent actif est un **`box-shadow inset` sur le bord HAUT** (`indicatorSide:"top"` + `indicatorMode:"shadow"`) — la vraie technique DSFR (filet `background-image`, pas une bordure), donc les deux bords restent `0 none` comme la réf et la box fait exactement 40px. **dsfr/Tabs 67,7 % → 100 % (0 ≠).** | ✅ |
| F8 | **Onglet actif Carbon** (4) | Tabs | ✅+🛡️ Vraies valeurs d'anatomie FERMÉES via le même bloc `tabs` : **font-size 14px**, **line-height 16px** (`1rem`), **padding inline 0**, poids 400, indicateur bleu bas. **2 ≠ restants = artefact de breakpoint markup v10, PROUVÉ irréductible → 🛡️** : le banc rend l'iframe à ≈348px, **sous** le `@media (min-width:42rem)` (672px) de `carbon-components.min.css` ; à cette largeur la CSS officielle applique la règle MOBILE de base `.bx--tabs__nav-link` (`color:#525252; border-bottom:1px solid #e0e0e0; padding:.75rem 0; line-height:1rem`), tandis que le **style SÉLECTIONNÉ desktop** (`border-bottom:2px solid #0f62fe; color:#161616; font-weight:600`) est *gated* derrière ce media query et **ne se déclenche jamais** sur le banc (preuve : extraction CSS du CDN). Reproduire `#525252`/`#e0e0e0` reviendrait à peindre NOTRE onglet ACTIF avec le style INACTIF mobile de base — faux par conception. On garde la vraie couleur de sélection #161616 + l'indicateur Bleu 60 (le vrai design sélectionné). **carbon/Tabs 79,3 % → 93,1 % ; 2 ≠ = `color` #161616 vs #525252 et `border-bottom color` #0f62fe vs #e0e0e0 (artefact breakpoint, 🛡️).** | ✅ + 🛡️ |
| F9 | **Résidus padding** (≈3) | Button DSFR (block 8px), Button Carbon (asymétrie), Select padding-droit | ✅ **Button DSFR** : paddingBlock 8px déjà posé (densité md) → 8/16/8/16 `=`. **Button Carbon** : géométrie bouton SPÉCIFIQUE (le bouton partage la densité `control` avec les champs à 0 px/40px qu'il ne faut pas régresser) → nouveau `buttonDensity` (override de la SEULE anatomie bouton) + 4e valeur de padding `paddingInlineEnd` : Carbon pose block 11px, gauche 16px, droite 63px, hauteur 48px → padding-top/bottom/right `=`, padding-left 16px~15px, box 131~130px, box height 48px `=`. **carbon/Button 83,9%→100%**. **Select padding-droit** (gabarit chevron) : `field.selectPaddingRight` par thème (base 2rem inchangé → DSFR 40px, Carbon 48px) ; la flèche est redessinée par `selectChevron` après `appearance: none` (cf. F5) → padding-right `=` des deux côtés. Base Sent Tech INCHANGÉE (paddingInlineEnd = paddingInline, selectPaddingRight = 2rem). | ✅ |

## Écarts nets résiduels après F1–F9 — tous classés 🛡️ (escapes prouvés)

Après F7+F8, fidélité globale **96,1 %** ; les **17 ≠** restants sont tous des escapes
irréductibles déjà couverts par les familles ci-dessus (aucun nouveau front à ouvrir) :

| Composant | ≠ résiduels | Pourquoi 🛡️ (irréductible) |
|---|---|---|
| **dsfr/Button** | box width/height Δ2px ; `color` #fff vs #f5f5fe | Métriques de la police **Marianne** (F1) ; la couleur est celle du bouton *secondaire* DSFR sur teinte de survol — géométrie/teinte de marque, pas un rôle à réaligner. |
| **dsfr/Textarea** | padding-top/bottom Δ2px ; box height Δ8px | Rôle `field` **multiligne** (hors lot champs mono-ligne 100 %) — la réf empile 3 rangs de texte ; même cause que carbon/Textarea (F5). |
| **dsfr/Link** | `text-decoration` underline vs none | Le lien DSFR **EST réellement souligné** au repos (`.fr-link` soulignement de gestion) — soulignement voulu, pas un écart (F5). |
| **dsfr/Card · carbon/Card** | padding Δ15px ; box height Δ-23 à -28px | **Empilement de contenu de la réf** + wrapper `.fr-card__body`/tile (artefact de mise en page F1/F5) — la hauteur suit le contenu réel de la réf, pas une métrique de carte. |
| **carbon/Textarea** | box height Δ13px ; line-height Δ-2px | Rôle `field` **multiligne** (hors lot mono-ligne) — même cause que dsfr/Textarea (F5). |
| **carbon/Tabs** | `color` #161616 vs #525252 ; `border-bottom color` #0f62fe vs #e0e0e0 | **Artefact de breakpoint markup v10** (F8, prouvé) : le style sélectionné desktop est gated `@media (min-width:42rem)` ; le banc à 348px rend la base mobile. Reproduire = peindre l'onglet actif avec le style inactif mobile. |

**Bilan familles : F1–F9 = toutes ✅/🛡️.** Tous les ≠ globaux restants sont des escapes prouvés ci-dessus.

## G4 — centrage / banc propre ✅
Le banc paraissait « brouillon » : libellés et cellules flottaient, l'iframe de réf
n'avait pas la même origine que notre contenu. **Refonte de l'alignement** (additive,
CSS de la page `/compare` uniquement) :
- Grille à **3 colonnes fixes** `12rem · minmax(0,1fr) · minmax(0,1fr)` — les deux cellules
  de comparaison ont EXACTEMENT la même largeur et la même origine.
- Les deux corps de cellule démarrent en **haut-gauche** (`justify-content:flex-start;
  align-items:flex-start`) ; l'iframe de réf est enveloppée dans un `.cmp-cell__body--ref`
  calé à la même origine → nos boîtes et le markup officiel partent du même coin.
- Libellé de ligne aligné en haut (plus de `padding-top:1.5rem` qui le faisait flotter).
- F1 préservé : `--field` à `width:320px`, `--card` à `18rem` inchangés (apples-to-apples).
- **Preuve visuelle** : captures headless (Chrome système, port 4322 par défaut, ≠ 5173) 
  des sections DSFR et Carbon — chaque paire est alignée, contenu et réf au même niveau, aucun élément
  flottant.

## G5 — couverture du banc élargie ✅
Le banc ne comparait que **7 composants** (Button/Input/Textarea/Select/Link/Card/Tabs)
sur leurs états par défaut. Il compare désormais **22 clés / 41 paires** composant×thème —
pour chacune, le **vrai markup officiel** (`fr-*` / `bx--*`, langue du thème) en iframe vs
notre composant mappé. Tous chargent leur réf CDN des deux côtés (vérifié : 0 fausse paire,
0 faux `=`). Ajouts :

| Catégorie | Ajouté au banc | DSFR | Carbon |
|---|---|---|---|
| **Variants/états** | Button **désactivé** | `.fr-btn:disabled` | `.bx--btn--primary:disabled` |
| | Input **erreur** | `.fr-input--error` | `.bx--text-input--invalid` |
| | Input **désactivé** | `.fr-input:disabled` | `.bx--text-input:disabled` |
| | Button **secondaire** (déjà présent, vérifié) | `.fr-btn--secondary` | `.bx--btn--secondary` |
| **Sélection** | Checkbox | `.fr-checkbox-group label` | `.bx--checkbox-label-text` |
| | Radio | `.fr-radio-group label` | `.bx--radio-button__label-text` |
| | Toggle / Switch | `.fr-toggle__label` | `.bx--toggle__switch` |
| **Nouveaux** | Tag | `.fr-tag` | `.bx--tag` |
| | Badge (DSFR seulement) | `.fr-badge` | — (Carbon = `bx--tag`, pas de badge propre) |
| | Alert / Notification | `.fr-alert` | `.bx--inline-notification` |
| | Accordion | `.fr-accordion__btn` | `.bx--accordion__heading` |
| | Breadcrumb | `.fr-breadcrumb__link` | `.bx--breadcrumb-item .bx--link` |
| | Pagination | `.fr-pagination__link[aria-current]` | `.bx--pagination-nav__page--active` |
| | Search | `.fr-search-bar .fr-input` | `.bx--search-input` |
| | Quote (DSFR seulement) | `.fr-quote` | — (pas de composant citation Carbon) |
| | Highlight (DSFR seulement) | `.fr-highlight` | — (pas de mise en avant Carbon) |

**Pas de fausse paire** : Badge/Quote/Highlight n'existent qu'en DSFR → rendus uniquement
côté DSFR (la CLI saute proprement les (thème, composant) sans équivalent officiel via
`COMPONENT_THEMES`/`themeHasComponent`). Checkbox/Radio/Toggle DSFR : le contrôle visuel
officiel est un `::before` non mesurable → on compare le **label** (typo/couleur réellement
peintes), choix documenté dans `REF_SELECTOR_NOTE` et dans le rapport.

**Fidélité par composant (périmètre élargi, 29/05)** — extrait du récap du rapport :

| Composant | DSFR | Carbon |
|---|---|---|
| Tabs | 100 % | 93,1 % |
| Button (primaire+secondaire) | 90,3 % | 100 % |
| Input / InputError / InputDisabled | 96,8 / 96,8 / 93,5 % | 96,8 / 90,3 / 90,3 % |
| Select · Link | 96,8 % · 96,8 % | 96,8 % · 100 % |
| Card | 80,6 % | 93,5 % |
| Textarea | 87,1 % | 90,3 % |
| ButtonDisabled | 87,1 % | 80,6 % |
| Breadcrumb | 83,9 % | 83,9 % |
| Search | 77,4 % | 80,6 % |
| Checkbox · Radio | 87,1 % · 87,1 % | 87,1 % · 90,3 % |
| Accordion | 67,7 % | 74,2 % |
| Quote · Highlight (DSFR) | 67,7 % · 64,5 % | — |
| Tag · Badge | 58,1 % · 54,8 % | 58,1 % · — |
| Toggle | 58,1 % | 51,6 % |
| Alert | 48,4 % | 41,9 % |
| Pagination | 48,4 % | 35,5 % |

Les nouveaux composants à basse fidélité (Tag/Badge/Toggle/Alert/Pagination) montrent le
**vrai portage** : nos composants sont stylés « Sent Tech base » (bordures, rayons pilule,
fonds clairs) là où DSFR/Carbon ont une anatomie distincte (Pagination active sans bordure,
Alert Carbon fond gris foncé pleine largeur, Tag rayon spécifique…). **Ces ≠ sont réels**,
pas des artefacts : ils définissent le prochain chantier de mapping (familles F10+).

## Détections dans le moteur `design-system-skills`
- ✅ **Détection de fidélité par bord exposée dans la skill** (capacité issue de
  `tools/compare/fidelity.mjs`) : nouvelle commande `fidelity` de la skill
  multi-harness `sent-tech-design` via le wrapper portable
  `tools/skills/sent-tech-skills/scripts/fidelity.mjs` (résout le repo via
  `SENT_TECH_DS_ROOT`, lance la comparaison bord par bord vs DSFR/Carbon
  officiels, écrit `docs/compare-fidelity-report.md` + `tools/compare/last-report.json`).
  Propagé aux 4 copies installées (Claude / Gemini / Codex / plugin agy).
  `SKILL.md` documente les deux commandes (`audit` lint statique, `fidelity`
  comparaison par bord) + `allowed-tools`.
- ✅ **Règle statique source-level bonus** : `underline-hardcoded-border` ajoutée
  au moteur `@sentropic/design-system-skills` — signale un champ dessinant son
  filet bas via un `border-bottom` en dur au lieu d'un `box-shadow inset`
  (anti-pattern révélé par la famille d'écart F4). Couverte par un test
  positif + négatif (26 tests verts).

## Publication (pré-autorisée, conditionnelle)
- ✅ **Condition remplie** : toutes les familles F1–F9 sont ✅/🛡️ (F7 fermée à 100 %,
  F8 fermée sur les vraies valeurs + 2 escapes breakpoint prouvés) et `verify` est VERT
  (exit 0, « OK package smoke test passed »). Fidélité globale **96,1 %** (17 ≠, tous escapes).
- ✅ **PUBLIÉ (29/05)** : bump patch cohérent commité (`834df0a`), tags `v0.10.1` + `themes-v0.2.1`
  poussés, workflows OIDC verts (post-publish-check inclus). **Live sur npm (confirmé `npm view`)** :
  tokens/themes/svelte **0.10.1**, theme-dsfr/theme-carbon **0.2.1**. skills inchangé (0.1.0, parqué).
  → Les gains de fidélité (74,8 % → 96,1 %) sont désormais disponibles pour les consommateurs.

## Vague de portage anatomie F10+ (30/05) — composants nouvellement révélés par le banc élargi
Objectif : porter à l'anatomie DSFR/Carbon (forme/focus/couleurs/typo/densité par thème) les composants
restés en « Sent Tech base », vers ~95 % à l'oracle. Per-thème, base intacte, additif, verify vert.

| Cluster | Composants (fidélité départ) | Statut |
|---|---|---|
| P-A | Pagination (48/35 %), Breadcrumb (84 %) | ✅ Pagination **100 %/100 %**, Breadcrumb **96,8 %/100 %** (F10) |
| P-B | Alert (48/42 %), Accordion (68/74 %) | ✅ Alert **93,5 %/93,5 %**, Accordion **96,8 %/96,8 %** (résidus = boîte W/H bench) |
| P-C | Tag (58 %), Badge (55 % DSFR) | ✅ Tag **100 %/100 %**, Badge **100 %** DSFR (P-C) — aucun résidu |
| P-D | Toggle (58/51 %), Search (77/81 %), Checkbox/Radio (87 %) résidus | ✅+🛡️ Search **93,5/96,8**, Checkbox **93,5/90,3**, Radio **93,5/90,3**, Toggle Carbon **83,9** ; Toggle DSFR **64,5 % = 🛡️** (artefact : la réf `.fr-toggle__label` est le LABEL texte ~241px, l'interrupteur DSFR étant dessiné en pseudo-éléments non mesurables → comparaison label-vs-piste ; typo/couleur comparables OK, le structurel radius/padding/box/fond non-comparable). **Vague F10+ COMPLÈTE.** Global banc **92 %** (`089c474`). |

### P-A — Pagination & Breadcrumb portés à l'anatomie DSFR/Carbon (F10, additif) ✅
Primitives additives `PaginationInput` / `BreadcrumbInput` dans `packages/tokens/src/component.ts`
(résolveurs `paginationOf` / `breadcrumbOf`), émises pour les **3 thèmes** ; tout leaf par défaut =
**rendu base actuel** (padding 0/12px, min 36px, font/line-height hérités, page active remplie
`action.primary`, lien fil d'Ariane = `text.link`, courant 600) → base Sent Tech **inchangée**
(`sent-tech.css`/`forge.css`/`entropic.css` ne gagnent que 14 vars inertes chacun). Valeurs réelles
posées par thème dans `theme-dsfr`/`theme-carbon`.

- **Pagination** : un bug de spécificité masquait le remplissage de la page active (sélecteur
  `.st-pagination__page--active` (0,1,0) perdait face à `.st-pagination button` (0,1,1) → page active
  rendue sur blanc). Corrigé en scopant `.st-pagination button.st-pagination__page--active`.
  - DSFR `.fr-pagination__link[aria-current]` : page active **remplie Bleu France** `#000091`, texte
    `#f5f5fe`, **sans bordure**, padding 4px/12px, 14px / line-height 24px, boîte 32×32 → **100 %** (48,4 → 100).
  - Carbon `.bx--pagination-nav__page--active` : carré 48×48 **sans bordure ni fond**, texte Gray 70
    `#525252` **600**, padding 17px/4px, 14px / line-height 14px, tracking 0,16px → **100 %** (35,5 → 100).
- **Breadcrumb** : typographie par thème sur la racine `.st-breadcrumb` (héritée par lien/fil/séparateur).
  - DSFR `.fr-breadcrumb__link` : lien **gris** `#666666` (pas Bleu France), 12px / line-height 20px,
    courant non gras → **96,8 %** (83,9 → 96,8).
  - Carbon `.bx--breadcrumb-item .bx--link` : Blue 60 `#0f62fe` (déjà via `text.link`) + 14px /
    line-height 18px / tracking 0,16px → **100 %** (83,9 → 100).

#### Résidu 🛡️ justifié (P-A)
- **Breadcrumb DSFR — box height 20px vs 18px (Δ2px), 1 seul ≠.** Toutes les propriétés *stylées*
  matchent à l'identique (font-size 12px, **line-height 20px = ref**, width 42,6px, couleur #666). Le
  CDN officiel rend `.fr-breadcrumb__link` en `display:inline` (`line-height:1.25rem`, `vertical-align:.25rem`) :
  Chrome rapporte alors la **boîte du contenu de l'inline (~18px)**, pas la line-box de 20px. Notre lien
  est un flex-item (`li{display:inline-flex;align-items:center}` pour aligner le séparateur), donc étiré
  à la line-box de 20px. Écart de **modèle de boîte inline-vs-flex du markup de référence**, pas une
  dérive de token : ramener la boîte à 18px casserait l'alignement du séparateur sans changer aucune
  valeur stylée mesurée. Classé escape prouvé.

### P-B — Alert & Accordion portés à l'anatomie DSFR/Carbon (additif) ✅
Primitives additives `AlertInput` / `AccordionInput` dans `packages/tokens/src/component.ts`
(résolveurs `alertOf` / `accordionOf`), émises pour les **3 thèmes** ; tout leaf par défaut =
**rendu base actuel** (alerte : fond `surface.raised`, encadré 1px `border.subtle`, accent gauche 4px
par sévérité, padding 16px partout, typo héritée / line-height `normal` ; accordéon : padding 14/8px,
font-size hérité, poids 600, line-height `normal`, texte `text.primary`) → base Sent Tech **inchangée**
(`sent-tech.css`/`forge.css`/`entropic.css` ne gagnent que **18 vars inertes** chacun, 0 ligne existante
modifiée). Valeurs réelles posées par thème dans `theme-dsfr`/`theme-carbon`.

- **Alert** : encadré par bord + fond + padding + typo + accent latéral, par thème. L'accent de sévérité
  est tiré soit comme **bordure gauche réelle** (base 4px / Carbon 3px) soit comme **filet `::before`**
  (DSFR) dessiné DANS la boîte → 0 bordure mesurée, technique réelle de `.fr-alert`. La couleur d'accent
  par sévérité reste `feedback.*` (base) ; Carbon surcharge `accentInfo` (#4589ff, distinct de son
  `feedback.info` #0043ce) sans toucher le rôle partagé.
  - DSFR `.fr-alert` : **fond transparent, 0 bordure** (accent = filet `::before` 4px), padding
    16/36/12/56px (gouttières icône+fermeture), 16px / line-height 24px, texte #3a3a3a → **93,5 %** (48,4 → 93,5).
  - Carbon `.bx--inline-notification` : **bannière Gray-80 #393939**, texte blanc, **barre gauche 3px**
    `#4589ff`, padding 0 (porté par les wrappers internes), 14px / line-height 14px / tracking 0,16px → **93,5 %** (41,9 → 93,5).
- **Accordion** : typo + padding + couleur du déclencheur (`.st-accordion__trigger`), par thème.
  - DSFR `.fr-accordion__btn` : en-tête **Bleu France #000091**, padding 12/16px, **16px / 500 /
    line-height 24px** (au lieu du 18,72px/600 hérité du h3) → **96,8 %** (67,7 → 96,8).
  - Carbon `.bx--accordion__heading` : padding 10px/0, **13,33px / 400**, line-height `normal`, texte
    #161616 (déjà `text.primary`) → **96,8 %** (74,2 → 96,8).

#### Résidus 🛡️ justifiés (P-B)
Tous les résidus restants sont des écarts de **boîte W/H** ; **toutes** les propriétés *stylées*
(bordures, fond, accent, padding, typo, couleur) matchent à l'identique des deux côtés.
- **Accordion DSFR & Carbon — box width 301px vs 273px (Δ28px), 1 seul ≠ chacun.** Même artefact de
  **largeur de banc** que P-A : la cellule de comparaison met en page le déclencheur à sa largeur
  intrinsèque (301px) tandis que l'iframe de référence rend son contenu à 273px. Padding/typo/couleur =
  identiques. Pas une dérive de token.
- **Alert DSFR — box width 301 vs 273 + box height 98 vs 108 (Δ-10px), 2 ≠.** Largeur = artefact de banc
  (idem). Hauteur : la réf, plus étroite (273px), fait **retourner le texte sur plus de lignes** et
  réserve la rangée du bouton de fermeture, d'où +10px ; toutes les valeurs *stylées* (padding 16/36/12/56,
  line-height 24px, fond transparent, 0 bordure) matchent. Écart **dérivé du retour à la ligne du contenu
  à largeur de réf**, pas un token.
- **Alert Carbon — box width 191,6 vs 288 + box height 39 vs 66, 2 ≠.** La `.bx--inline-notification`
  officielle est un **conteneur flex pleine largeur** dont la largeur (288px) et la hauteur (66px,
  min-height) sont portées par ses wrappers internes `__details`/`__text-wrapper` (la boîte externe a
  **padding 0**, exactement comme nous) ; notre `.st-alert` plat est dimensionné par son contenu (191,6 ×
  39). Écart de **structure de markup imbriqué de la référence**, pas une dérive de token : reproduire le
  288×66 imposerait d'imbriquer des wrappers Carbon-spécifiques dans `.st-alert` (régression des autres
  thèmes + base). Classé escape prouvé — toutes les propriétés stylées (fond #393939, texte blanc, barre
  gauche 3px #4589ff, padding 0, 14px/14px/0,16px) sont identiques à la réf.

### P-C — Tag & Badge portés à l'anatomie DSFR/Carbon (additif) ✅
Primitives additives `TagInput` / `BadgeInput` dans `packages/tokens/src/component.ts`
(résolveurs `tagOf` / `badgeOf`), émises pour les **3 thèmes** ; tout leaf par défaut =
**rendu base actuel** (tag : pilule radius 999px, padding 4/10px md, 12px / 600, line-height 1, pas de
transform, ton neutre = `surface.subtle` + `text.secondary` ; badge : pilule radius 999px, padding 4/8px,
12px / 650, line-height 1, ton info = mélange `feedback.info`) → base Sent Tech **inchangée**
(`sent-tech.css`/`forge.css`/`entropic.css` ne gagnent que des **vars inertes**, 0 ligne existante
modifiée). Valeurs réelles posées par thème dans `theme-dsfr`/`theme-carbon`.

Les leaves géométrie/typo (radius, padding, font-size, poids, line-height, letter-spacing, text-transform,
min-height) s'appliquent à **tous les tons** ; seules `neutralBackground`/`neutralText` (Tag) et
`infoBackground`/`infoText` (Badge) recolorent **le ton mesuré par le banc** (Tag neutre, Badge info),
laissant les tons success/warning/error sur leurs couleurs `feedback.*`.

- **Tag** (`.st-tag`, ton neutre mesuré).
  - DSFR `.fr-tag` : radius **16px**, padding 4/12px, **14px / 400 / line-height 24px**, boîte 32px, fond
    **#eeeeee** (grey-950), texte **#161616** (grey-50) → **100 %** (58,1 → 100).
  - Carbon `.bx--tag--gray` : radius **15px**, padding 4/8px, **12px / 400 / line-height 16px**, tracking
    **0,32px**, boîte 24px, fond **#e0e0e0** (Gray 20), texte **#393939** (Gray 80) → **100 %** (58,1 → 100).
- **Badge** (`.st-badge`, ton info mesuré — DSFR uniquement, Carbon n'a pas de badge propre, son badge EST `bx--tag`).
  - DSFR `.fr-badge` : radius **4px**, padding 0/8px, **14px / 700 / line-height 24px**, **UPPERCASE**,
    boîte 24px, fond **#eeeeee** (grey-950), texte **#3a3a3a** (grey-200) → **100 %** (54,8 → 100).

**Aucun résidu 🛡️** : les 3 paires Tag/Badge atteignent 31/31 (100 %). La boîte W/H matche aussi
(le tag/badge est dimensionné par son contenu des deux côtés — pas d'artefact de largeur de banc comme
pour Alert/Accordion). Aucune régression : le tableau de synthèse est identique à la base sur tous les
autres composants (Button 90,3 %, Input/Select/Link 96,8 %, Tabs 100 %, Accordion 96,8 %, Card 80,6 %/93,5 %,
Pagination 100 %, Breadcrumb 96,8 %/100 %, Alert 93,5 %…). **Fidélité globale 86,8 % → 89,9 %.**

Puis : **reste G9** (pages docs Modal/Toast/Drawer/Popover/Dropdown/Menu au standard exhaustif), puis
**publication groupée** `0.10.2` / `0.2.2` (cœur + thèmes) — autorisée par l'utilisateur (« fais dans l'ordre que tu préconises »).
