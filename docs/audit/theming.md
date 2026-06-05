# Audit théming / tokens — composants ajoutés cette session

> READ-ONLY. Aucune source modifiée, aucun commit. Périmètre : layout
> (Flex/Stack/Inline/Container/Row/Col/Hidden/Divider), groupes & identité
> (Avatar/AvatarGroup/ButtonGroup/CheckboxGroup/RadioGroup/Typography/Collapsible/Stepper),
> spécialisés (Rating/TimePicker/Calendar/SlideIndicator/Autosave), primitives
> (Portal/Popper), UAT8 (SelectableRow/SelectableList).
> Sources inspectées : `packages/components-svelte/src/lib/*.svelte`,
> `packages/tokens/src/component.ts`, `packages/themes/css/*.css`,
> `packages/components-{react,vue}/src/styles.css`.
> Date : 2026-06-05.

## Verdict express

- **Aucune valeur en dur « sale »** (couleur hex/rgb/oklch non-fallback) dans les
  composants de cette session : toutes les couleurs passent par un `var(--st-…)`
  avec fallback documenté. Les couleurs SVG de ForceGraph (category1-8) sont 100 %
  tokenisées.
- **Aucun token `--st-component-*` manquant en source** : tous les tokens
  consommés (selectableRow, control-hoverBackground, dropdown-selected*, popover-*,
  control-*) existent dans `component.ts` et sont émis dans les 3 thèmes CSS du
  workspace. Le bug selectableRow (token effacé au build) est bien corrigé.
- **Le vrai problème est le LOCKSTEP** : `tokens` et `themes` restent **0.10.3**,
  une version **antérieure** à l'ajout des tokens de la session. Les composants
  npm (react/vue 0.11.0, svelte 0.16.0) **épinglent `themes@0.10.3`** → les
  consommateurs npm n'ont PAS ces nouveaux tokens et tombent sur les fallbacks.
- **Dark-mode : non câblé du tout.** Aucun thème sombre n'existe ; les variantes
  `*Dark` de selectableRow sont émises dans les tokens mais **lues nulle part**.
  Quelques `color-mix(..., white)` / `..., black)` casseraient si un thème sombre
  était ajouté (latent, pas actif aujourd'hui).

## Tableau des problèmes (vrais problèmes uniquement)

| # | Composant | Problème théming | Sévérité | Détail | Correctif |
|---|-----------|------------------|----------|--------|-----------|
| 1 | **Lockstep global** (tokens + themes) | `@sentropic/design-system-tokens` et `…-themes` publiés restent **0.10.3** alors que la session a ajouté ~24 nouveaux `--st-component-*` (selectableRow×6, control-hoverBackground, paginationNav×10, menu danger×2, search padding×2, card hover, link decoration hover, field radiusBottom). | **Haute** | 0.10.3 a été figé au commit `8dfea94` (API sélection ForceGraph), AVANT `aa58657`/`03c1bb5` qui ajoutent selectableRow + control-hoverBackground aux thèmes. Les composants react/vue 0.11.0 et svelte 0.16.0 déclarent `"@sentropic/design-system-themes": "0.10.3"`. Donc tout consommateur npm reçoit du CSS qui référence des tokens absents du thème installé. | **Republier `tokens` + `themes` (≥ 0.11.0)** puis re-pin la dépendance des 3 packages composants sur la nouvelle version. C'est la seule action qui ferme l'écart proprement. |
| 2 | **SelectableRow / SelectableList** | Token `--st-component-selectableRow-selected*` absent du thème publié 0.10.3. | **Moyenne** (dégradé, pas cassé) | Fallback inline robuste : `color-mix(in oklch, action-primary 12%, transparent)` + texte `… 78%, black`, avec garde `@supports not (color-mix)` → surface teintée plate + texte primary. Le consommateur npm voit donc un état sélectionné correct mais PAS la valeur per-thème résolue (identique au fallback pour sent-tech ; léger écart possible pour forge/entropic). | Couvert par le correctif #1. En attendant, le fallback est acceptable visuellement. |
| 3 | **TimePicker, Calendar, Collapsible** (+ Rating/SlideIndicator focus) | `--st-component-control-hoverBackground` est **NOUVEAU** cette session, absent de 0.10.3. | **Moyenne** (dégradé, pas cassé) | Utilisé sur hover (navBtn, options, inRange, trigger). Fallback = `var(--st-semantic-surface-subtle)` qui, lui, EST publié → le hover reste visuellement correct. Aucune régression visible, juste la valeur per-thème non honorée. | Couvert par #1. |
| 4 | **Avatar** | `color-mix(in srgb, var(--st-semantic-data-categoryN) 16%, white)` — point d'ancrage **`white` en dur**. | **Moyenne** (dark-mode) | En thème clair c'est correct (8 tons OK, category1-8 tous définis et présents en 0.10.3). En thème sombre, teinter vers `white` produit des pastilles claires sur fond sombre → contraste inversé. Idem `selectableRow` fallback `…, black`. | Quand un thème sombre arrivera : remplacer `white`/`black` par un token de surface (`var(--st-semantic-surface-default)`) ou fournir une variante `*Dark`. Pas urgent (pas de thème sombre aujourd'hui). |
| 5 | **selectableRow `*Dark` (tokens)** | Variantes `selectedBackgroundDark/AccentDark/TextDark` **émises mais jamais consommées**. | **Faible** | Aucun sélecteur CSS (svelte/react/vue) ne lit ces tokens ; aucun thème sombre ni `prefers-color-scheme` n'existe dans le DS. Tokens « morts » pour l'instant. | Les câbler le jour où un thème sombre / `[data-theme=dark]` est introduit. Sinon inoffensif. |
| 6 | **Stepper** | Géométrie/typo **entièrement en dur** : `border: 1.5px solid`, cercle `1.5rem`, connecteurs `2px`, font-sizes `0.875/0.8125/0.75rem`, gaps `0.125rem`. Aucun `--st-component-*`. | **Faible** | Les **couleurs** sont toutes tokenisées (`--st-semantic-*`). Seules les métriques sont littérales → pas de personnalisation per-thème de la taille/épaisseur. Cohérent avec la convention du DS (Badge/Tag/Header font pareil) mais le composant n'a aucune couche `component` token. | Optionnel : exposer `--st-component-stepper-*` si la personnalisation per-thème devient un besoin. Sinon laisser tel quel. |
| 7 | **Typography** | font-size/weight/line-height **littéraux en rem** pour 11 variantes. | **Faible (par conception)** | Documenté explicitement dans le `<style>` : « pas de token d'échelle global dans le DS, tailles littérales comme Badge/Tag/Header ». Couleurs tokenisées. Non-bloquant, mais signifie qu'aucun thème ne peut redéfinir l'échelle typo. | Aucun correctif requis ; à revoir seulement si un thème doit altérer l'échelle. |
| 8 | **Avatar / AvatarGroup / TimePicker / ForceGraph** | Fallbacks couleur en dur APRÈS le `var()` (ex. `#fff`, `#eef2f7`, `#64748b`, `rgb(15 23 42 / 0.18)`). | **Faible (acceptable)** | Tous sont des **fallbacks documentés** derrière un token (`var(--st-…, #fff)`), pattern admis dans le DS. Le shadow `rgb(15 23 42 / .18)` de popover/TimePicker ne s'adapterait pas en sombre, mais c'est un fallback. | RAS tant que le token résout. Revoir les fallbacks de shadow pour le sombre (cf. #4). |
| 9 | **SlideIndicator** | Tailles dot/bar et largeur active (`0.375rem`…`2.25rem`) en dur, dot `border-radius: 50%`/`999px`. | **Faible (par conception)** | Couleurs OK (`--st-semantic-action-primary`, `border-strong`). Pas de couche `component` token, comme la plupart des primitives visuelles compactes. | Aucun, sauf besoin de personnalisation per-thème. |
| 10 | **Calendar `--today`** | `box-shadow: inset 0 0 0 1px var(--st-semantic-border-interactive)` + grilles `gap: 2px` en dur. | **Faible** | Couleur tokenisée ; seuls l'épaisseur (1px) et les gaps (2px) sont littéraux. Cohérent avec le reste. | RAS. |

## Détail lockstep — nouveaux tokens absents de 0.10.3 publié

Vérifié par diff `8dfea94..HEAD` sur `themes/css/sent-tech.css` :

```
+ --st-component-selectableRow-selectedBackground / Accent / Text (+ *Dark ×3)
+ --st-component-control-hoverBackground
+ --st-component-paginationNav-* (background/border/radius/text/hoverBackground/
                                  activeBackground/activeText/disabledText/ellipsisText)
+ --st-component-menu-dangerHoverBackground / dangerText
+ --st-component-search-paddingLeft / paddingRight
+ --st-component-card-anatomy-states-hover-bg
+ --st-component-link-anatomy-typography-decorationOffsetHover / decorationThicknessHover
+ --st-component-control-anatomy-field-radiusBottom
```

Tokens consommés par les composants de la session ET déjà présents en 0.10.3
(donc SANS risque lockstep) : `control-radius`, `control-focusRing`,
`control-hoverBorder`, `control-border/background/text`, `dropdown-selected*`,
`popover-*`, `field-*`, `accordion-*`, `semantic-data-category1-8`.

## Cohérence cross-framework (Svelte / React / Vue)

**Excellente.** Vérifié sur les composants à état sélectionné :
- SelectableRow : mêmes 3 tokens (`selectedBackground/Accent/Text`) + même garde
  `@supports not (color-mix)` dans les 3 frameworks (12 occurrences `st-selectableRow`
  côté react ET vue).
- Calendar/TimePicker : mêmes `--st-component-dropdown-selectedBackground/Text`
  pour l'état sélectionné dans react ET vue.
- `control-hoverBackground` : 23 usages identiques en react et en vue.
- Avatar `color-mix(in srgb … 16%, white)` : identique dans les 3 (même limite
  dark-mode partout).

Aucune divergence Svelte vs React/Vue détectée sur les composants de la session.

## Recommandation lockstep

**OUI — republier `tokens` et `themes` en ≥ 0.11.0 est requis**, puis re-pin la
dépendance `@sentropic/design-system-themes` des 3 packages composants sur cette
version. Sévérité réelle aujourd'hui : **modérée et non bloquante** (tous les
nouveaux tokens ont un fallback semantic publié qui tient visuellement), mais la
dérive est structurelle : à chaque session qui ajoute des tokens sans bump
tokens/themes, l'écart « valeur per-thème vs fallback » s'élargit silencieusement
(forge/entropic divergeront du fallback avant sent-tech). À corriger au prochain
cycle de publication.
