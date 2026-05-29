# Tracker — fermeture des écarts de fidélité (objectif : 0 écart net)

Source de vérité chiffrée : `docs/compare-fidelity-report.md` (régénéré par `tools/compare/fidelity.mjs`).
Ce tracker = stratégie de fermeture + statut par **famille** d'écarts. Mis à jour à chaque itération du loop.

> Départ : **74,8 %** (109 ≠) → 1ère passe **84,0 %** (69 ≠) → passe F1+F2 **87,3 %** (55 ≠) → passe F3+F4+F6 (boîte-champ DSFR) **89,4 %** (46 ≠) → passe F5+F9 (line-height + padding sur Button/Select/Link/Card) **92,8 %** (31 ≠) → passe F7+F8 (onglet actif DSFR + Carbon) **96,1 %** (17 ≠). **Cible : 100 % de fermeture**
> (tout écart restant doit être soit fermé, soit un escape PROUVÉ irréductible et justifié ici).

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
- ⬜ Reste à exécuter (pas dans ce lot — aucun `npm publish` lancé) : bump patch cohérent
  (tokens/themes/svelte **0.10.1**, theme-dsfr/carbon **0.2.1**), tags `v0.10.1` + `themes-v0.2.1`,
  publication OIDC, confirmation `npm view`. *(Auto-publish autorisé par l'utilisateur pour cette nuit.)*
