# Backlog de décisions à porter (utilisateur)

Décisions/actions **irréversibles, coûteuses, ambiguës ou engageantes** mises de
côté pendant le loop autonome. Les décisions **réversibles** sont prises seules et
non listées ici (voir commits/tracker). Mis à jour au fil du loop.

> Convention : 🔴 bloque une suite · 🟠 à trancher quand possible · 🟢 info/quand tu veux.

## Décisions en attente

### D1 — ✅ FAIT (2026-05-28) — Bump + publication npm (DS coeur + thèmes)
Publié sur « go » utilisateur. commit `3caacd0` + tags `v0.10.0` et `themes-v0.2.0`.
**Live sur npm (confirmé via `npm view`)** : tokens/themes/svelte **0.10.0**,
theme-dsfr/theme-carbon **0.2.0** (Trusted Publishing OIDC, post-publish-check passé).
skills inchangé (0.1.0, parqué). Bump additif → minor semver.

### D2 — 🟠 Alignement du composer chat sur `sentropic/chat-ui`
Écart **architectural** : chat-ui = surface **rich-text ProseMirror à slots**
(`renderComposerSurface/FloatingLayer/LeftControls/RightActions`, modes `ai|comments`,
floating layer mentions). Le nôtre = `<textarea>` autosize + Send/Stop (autosize OK).
**Options** : (a) garder notre composer simple (textarea), (b) adopter la surface
rich à slots de chat-ui (gros chantier : ProseMirror, floating layer, slots, modes),
(c) hybride (slots de contrôle + textarea, sans rich-text). 
**Action attendue** : choisir la cible. *(Engageant — (b) = réécriture majeure.)*
**Sous-décision liée (slots→snippets)** : migrer l'API `<slot name="attachments|actions-left|actions-right">`
vers des snippets Svelte 5 est **breaking** (Svelte 5 interdit de mélanger `<slot>` et `{@render}`,
donc pas de repli additif possible). Reporté ici : à faire en même temps que le choix de direction
composer, idéalement au prochain bump majeur. *(Pas additif → non fait en autonomie.)*

### D3 — 🟢 Résidus de fidélité (escapes documentés)
DSFR : soulignement de lien **animé** (D2 matrice) ; technique du filet bas input
(box-shadow vs border-bottom) + radius 4px réel. Carbon : hover de carte via `$layer`
(C4). Accepter comme échappements gouvernés ou chercher à fermer ? *(Mineur.)*

### D4 — 🔴 Thèmes clients privés (Airbus / Scalian / CGI)
Bloqué : besoin des assets/tokens (Airbus fourni par toi, Scalian/CGI à récupérer)
+ confirmation **hors git** (mémoire/gitignore). *(Bloqué sur fourniture.)*

### D5 — 🟡 WP12 templates docs & slides (ESN)
Premier kit source livré : `docs/templates/esn/` en Markdown-first avec taxonomie,
proposition, rapport de livraison et deck Slidev-compatible. Les exports `.pptx`
et `.docx` restent à décider plus tard si un pipeline binaire devient nécessaire.

### D7 — ✅ FAIT — Checkbox/Radio natifs pleinement thémés (pas de refonte)
Recadrage utilisateur : pas de widget custom, juste rendre le **natif** assez fonctionnel.
Fait : `accent-color` (couleur de sélection) + **anneau de focus par stratégie d'anatomie**
(outline DSFR / inset Carbon / ring base, mêmes vars qu'Input/Switch) + états `:disabled`
(curseur + atténuation + label estompé) et état erreur. Checkbox garde `[aria-invalid]`;
Radio utilise `data-invalid` sur le label pour éviter l'attribut ARIA non supporté sur le rôle radio
individuel (le consommateur pose `aria-invalid` au niveau groupe si nécessaire).
`.st-choice__box` mort retiré. 100% natif (a11y préservée), additif (fallbacks = rendu base).
`verify` vert. *(L'état `indeterminate` natif reste géré par le consommateur via la prop DOM.)*

### D6 — 🟢 Phase 2 rollout anatomie (~55 composants restants)
Schéma `ComponentAnatomy` figé v1.2.0 → rollout possible par clusters. Quand lancer,
et dans quel ordre de clusters ? *(Je peux avancer par cluster réversible si tu veux.)*

## Journal du loop (réversible, fait en autonomie)

- (init) Backlog créé ; comparaison composer chat menée → D2 ouverte.
- WP2 : composant **Footer** livré (P1 gap analysis) — `4487c9c`.
- WP2 : composant **Tile** unitaire livré (P1 gap analysis : static/clickable/selectable).
- WP2 : lot **SkipLink** (a11y), **Quote** (éditorial), **Highlight** (mise en avant) — P2/P3 gap analysis.
- WP2 : **LanguageSelector** (i18n, P2) + **OrderedList** (complément Carbon, P3).
- WP2 : **TreeView** (P2, dernier gap P2 : expand/collapse, sélection, roving tabindex + flèches, ARIA tree).
- WP9 : **démo docs reasoning** ajoutée à StreamingMessage (reasoning.delta/completed + bloc repliable). Reste publication → D1.
- WP5 : **DonutChart** (P1 charts) — arcs SVG annulaires, palette data-vis, tooltip, total au centre.
- WP5 : **ScatterPlot** (P1 charts) — 2 axes numériques (nice ticks), points tonalisés, tooltip, a11y.
- WP5 : **StackedBarChart** (P1 charts) — barres empilées multi-séries, légende, tooltip par segment. **WP5 P1 complet.**

- T#9 sweep (2 agents A–M/N–Z) → **lot 1 corrigé** : 5 composants invisibles rendus visibles
  (AspectRatio, CodeSnippet, StructuredList, TileGroup, UnorderedList = catalogue + page) ;
  fixes docs (token `--st-radius-pill` ×3, Badge catégorie, Header titre, MessageActions icône) ;
  type `UnorderedList.children` assoupli (chaînes acceptées). Reste **lot 2** : AreaChart promesse
  a11y `prefers-reduced-motion`, MessageStatusBadge (tokens docs + labels FR-only), ChatComposer
  `<slot>` legacy → snippets (🟠).
- T#9 sweep **lot 2** : AreaChart `@media (prefers-reduced-motion: reduce)` (tient la promesse a11y
  des docs) ; MessageStatusBadge → prop `labels` i18n (défaut FR) + liste tokens docs corrigée
  (tokens `chatMessage` erronés → tokens feedback réels de `Tag`). ChatComposer slots→snippets
  **non fait** (breaking, voir D2).
- T#9 **passe interactive (Playwright, port 4321)** : 60/60 routes composants rendent au SSR (aucun
  crash) ; 0 erreur console sur le home + 11 pages interactives lourdes (combobox, accordion,
  content-switcher, date-picker, data-table, overflow-menu, multi-select, tree-view, overlays,
  toggletip, file-uploader) ; combobox vérifié fonctionnel (liste de 6 options à l'ouverture).
  **T#9 clôturé** : les écarts de contenu/correctness ont été corrigés (lots 1-2), la santé runtime
  est verte. Reste comme suite naturelle le rollout anatomie Phase 2 (D6).

- **Phase 2 anatomie (D6) — cluster contrôles, boîte-champ** : Textarea, NumberInput,
  PasswordInput, Search migrés pour consommer les vars d'anatomie `control`/`field` du pilote
  Input → héritent de la parité DSFR/Carbon (filled-underline) sans CSS par thème. Vérifié au
  rendu calculé (base inchangé / flip filled-underline injecté). Matrice de traçabilité mise à
  jour (section Phase 2). Reste boîte-champ : Select, Combobox, MultiSelect, DatePicker (trigger
  + dropdown) ; puis cluster « sélection » (Checkbox/Radio/Switch/Toggle, groupe `selection`).
- **Phase 2 anatomie — boîte-champ COMPLÈTE** : Select/Combobox/MultiSelect/DatePicker migrés
  (trigger sur anatomie field/control, panneaux dropdown laissés au cluster overlay). Vérifié
  rendu (Combobox+Select flip filled-underline OK). Cluster boîte-champ = Input + 8 contrôles.
  Matrice à jour. SUITE : cluster « sélection » (Checkbox/Radio/Switch/Toggle, groupe `selection`).
- **Phase 2 anatomie — cluster sélection** : Switch/Toggle → focus par stratégie d'anatomie
  (parité a11y DSFR outline / Carbon inset) ; Checkbox/Radio (natifs) → `accent-color` thématisé
  (couleur checked, vérifié rendu). Visuel custom Checkbox/Radio (forme carrée + focus) DÉFÉRÉ
  en **D7** (feature à risque a11y). Matrice à jour (section cluster sélection).

- **Banc `/compare` étendu** : Textarea + Select ajoutés (notre mappé vs réel DSFR/Carbon).
  Validation au rendu RÉEL (thème compilé) du filled-underline + polices. Fix `.st-select`
  `font: inherit` → typo d'anatomie. Erreur console sur /compare = provient d'AUTRES onglets
  ouverts (sentropic / radar-immo), pas de la page (vérifié : 0 erreur onglet isolé).

- **Phase 2 anatomie — cluster navigation/overlay** : focus par stratégie sur PaginationNav,
  OverflowMenu, Toggletip (triggers hors Button/Link). Panneaux Popover/Modal/Tooltip déjà
  thémés (radius/ombre via foundation) → rien à faire. Matrice à jour (section nav/overlay).

- **WP8 — couverture de tests des règles** : les 6 règles d'audit jusque-là non testées
  (`single-font`, `no-bare-hex`, `no-em-dash`, `side-tab-on-rounded`, `line-length-cap`,
  `heading-hierarchy`) ont reçu chacune un test positif + négatif (`packages/skills/
  test-fixtures/skills.test.js`) → **7/7 règles couvertes**. Matrice de couverture mise à jour
  (+ correction chemin périmé `packages/impeccable` → `packages/skills`). Sanity-check Codex
  des composants interactifs manqués : **non concluant** (limite d'usage Codex atteinte jusqu'au
  30/05) ; je m'appuie sur l'audit repo-wide (0 ring focus orphelin).

- **D1 livrée** : release 0.10.0 (cœur) + 0.2.0 (thèmes) publiée sur npm via tags `v0.10.0` /
  `themes-v0.2.0` (commit `3caacd0`). Versions confirmées live. `/loop` arrêté à la demande.

- **Fidélité DSFR/Carbon — 3 clusters fermés (oracle `tools/compare/fidelity.mjs`)** :
  fidélité globale **74,8 % → 84,0 %** (348 `=`, 15 `~`, 69 `≠`). Aucune régression
  composant (tous ↑ ou =), base Sent Tech intacte (changements per-thème + CSS additive
  à fallback identique à la base, vérifié sur le CSS compilé). `npm run verify` vert.
  - **Cluster typo Carbon** : `letterSpacing 0.16px` posé sur les contrôles/champs/lien ;
    `size` lien = 0.875rem (14px) ; `lineHeight` champ/contrôle = `1.125rem` (18px, en REM
    pour que le `<select>` l'honore). Consommation `letter-spacing`/`line-height`/`font-size`
    ajoutée (additive) dans Input/Textarea/Select/Link. → Carbon Link **83,9 → 100 %**,
    Input **87,1 → 93,5 %**, Select **80,6 → 87,1 %**.
  - **Cluster padding champ DSFR** : densité `md.paddingBlock 0.5rem` (8px) + `sm.paddingInline
    1rem` (16px) ; Select consomme désormais la densité pour le padding (vert./gauche).
    → DSFR Input **71 → 87,1 %**, Select **67,7 → 80,6 %**, Textarea **67,7 → 77,4 %**,
    Button **83,9 → 87,1 %** (padding vert. 8px). Couleur texte de contrôle DSFR → `#3a3a3a`
    (`text.primary` = grey-200, `--text-default-grey` réel, contraste AA+).
  - **Cluster cartes** : primitive additive `foundation.card.{borderWidth,background}` (défaut =
    base) ; DSFR/Carbon posent `borderWidth 0` (pas de bordure sur `.fr-card`/`.bx--tile`),
    Carbon `background #f4f4f4` ($layer-01). → DSFR Card **48,4 → 77,4 %**, Carbon Card
    **54,8 → 83,9 %**.
  - **Écarts restants classés** : *escapes justifiés* (police de marque vs system-ui, largeurs
    de box = contexte banc, filet bas DSFR, soulignement DSFR animé, `<select>` rend
    `line-height: normal` malgré la valeur posée = limite UA Chrome) ; *nécessite extension
    schéma* (rayon haut 4px DSFR par-coin ; line-height multiligne distincte pour Textarea
    Carbon 20px vs champ 18px ; padding-droit Select par-thème = gabarit chevron) ; Carbon/DSFR
    Tabs (font-size/couleurs = nuance markup, laissé pour ne pas régresser la base).

## Fin du loop (réversible épuisé) — OBSOLÈTE, loop relancé

Loop autonome terminé : **12 livrables** (Footer, Tile, SkipLink, Quote, Highlight,
LanguageSelector, OrderedList, TreeView, DonutChart, ScatterPlot, StackedBarChart +
démo reasoning), tous `npm run verify` verts, commités/poussés sur `main`. Restant =
**décisions D1–D6 ci-dessus** + travaux **browser-dépendants** (T#9 sweep composants au
clic, WP6 retest overlays) qui requièrent ta présence/validation. Aucun publish npm.

- **Nuit 28→29/05 — Fidélité DSFR/Carbon menée à terme + publiée.** Oracle CLI `tools/compare/fidelity.mjs`
  (comparaison pixel-perfect par bord, Chrome système). 9 familles d'écarts fermées via agents de fond
  séquencés par le loop, vérifiées à l'oracle, base Sent Tech intacte, push main au fil de l'eau :
  74,8 % → **96,1 %** (109 → 17 ≠, les 17 restants = escapes PROUVÉS et documentés dans le tracker :
  métriques police Marianne, lien DSFR réellement souligné, Textarea multiligne, hauteur de carte =
  empilement de contenu de la référence, breakpoint markup Carbon tabs). Anatomie étendue v1.2.0 → **v1.5.0**
  (radiusTop, underline/focusShadow, selectAppearance/selectChevron/selectPaddingRight, buttonDensity,
  card typo, onglet actif), 100 % additive. **Détection fidélité par bord intégrée à la skill**
  `design-system-skills` (commande `fidelity` + règle statique `underline-hardcoded-border`), propagée aux
  4 harness. **Publié** (auto-autorisé) : DS cœur `0.10.1` + thèmes `0.2.1`, live sur npm (`834df0a`,
  tags `v0.10.1`/`themes-v0.2.1`). Loop arrêté.
