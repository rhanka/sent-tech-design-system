# Backlog de décisions à porter (utilisateur)

Décisions/actions **irréversibles, coûteuses, ambiguës ou engageantes** mises de
côté pendant le loop autonome. Les décisions **réversibles** sont prises seules et
non listées ici (voir commits/tracker). Mis à jour au fil du loop.

> Convention : 🔴 bloque une suite · 🟠 à trancher quand possible · 🟢 info/quand tu veux.

## Décisions en attente

### D1 — 🟠 Bump + publication npm (DS coeur + thèmes)
Le contenu sur `main` (anatomie v1.2.0, builder, alias, thèmes anatomiques) n'est
**pas publié**. Proposition : tokens/themes/svelte `0.9.0`→**`0.10.0`** (tag `v0.10.0`),
theme-dsfr/carbon `0.1.0`→**`0.2.0`** (tag `themes-v0.2.0`), via OIDC (sans token).
**Action attendue** : ton « go » → je bump les package.json + lockfile + commit + tags.
*(Irréversible — unpublish npm difficile. Ne rien taguer sans go.)*

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

### D5 — 🟠 WP12 templates docs & slides (ESN)
Format de sortie `.pptx` + `.doc` à valider ; typologie slides ESN (decks Scalian/CGI
en réf, hors colorimétrie). Cadrage à faire avec toi avant tout dev.

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

## Fin du loop (réversible épuisé) — OBSOLÈTE, loop relancé

Loop autonome terminé : **12 livrables** (Footer, Tile, SkipLink, Quote, Highlight,
LanguageSelector, OrderedList, TreeView, DonutChart, ScatterPlot, StackedBarChart +
démo reasoning), tous `npm run verify` verts, commités/poussés sur `main`. Restant =
**décisions D1–D6 ci-dessus** + travaux **browser-dépendants** (T#9 sweep composants au
clic, WP6 retest overlays) qui requièrent ta présence/validation. Aucun publish npm.
