# Rexel → Sentropic mapping

This package maps the **public** Rexel Group design system (`ds-rexel`, live at
design.rexel.com) onto the Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the France-theme primary (`#2e4eaa`, `$primary-600`,
DEFAULT BUTTON COLOR) is read from the public SCSS sources. Only public values
and font *names* are referenced — no font binaries. Derived/unmeasured values
are flagged `à confirmer`.

> Key measured fact: the theme file declares `$link-color: $primary-600`
> ("DEFAULT LINK COLOR"), but the shared variables file hard-assigns
> `$link-color: $gray-900` afterwards (import order in `rexel.scss`: theme,
> then variables, then bootstrap). Last rule wins: links render `#303545` at
> rest and `#2e4eaa` on hover. Both facts are recorded; `text.link` carries the
> hover identity `#2e4eaa`.

Convention de comptage (tout chiffre ci-dessous) : occurrences de la forme
hexadécimale 6 chiffres insensible à la casse, normalisée en minuscules ;
formes courtes (`#333`, `#000`) étendues avant comptage ; équivalents
`rgb()`/`rgba()` signalés sans être fusionnés ; région = fichiers de marque
(`scss/rexel/_theme_rexel.scss`, `scss/common/_variables_rexel_DS.scss`,
`scss/common/_custom_components.scss`) ; `scss/vendor/` et l'import bootstrap
exclus. Références `$var` = usages de la variable SCSS de marque, déclaration
incluse, sur la région de marque. Vérification orthographique seconde :
comptage des littéraux exacts 6 chiffres (`grep -o -i -E '#[0-9a-f]{6}\b'`) —
chaque hex du thème France y figure exactement une fois, à la casse d'écriture.

## Sources

- Rexel Group Design System, France theme —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/rexel/_theme_rexel.scss`
  (palette `$primary-*`, `$secondary-*`, `$gray-*`, `$primary`, `$link-color`)
- Rexel Group Design System, shared variables —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/common/_variables_rexel_DS.scss`
  (`$success/$info/$warning/$danger`, `$text-muted`, `$border-radius`,
  `$btn-*`, `$nav-pills-*`, `$pagination-*`, `$alert-*-color/bg/border`,
  `$badge-*`, `$input-*`, `$easeInOutCubic`, `$font-family-*`)
- Rexel Group Design System, brand rules —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/common/_custom_components.scss`
  (`.form-control` boxed + focus ring, `.btn-outline-primary`,
  `.nav-tabs`/`.nav-pills`, `.breadcrumb-item a`, `.card`, `.custom-switch`,
  `h1/h2` Montserrat, `.badge-pill.large-pill`)
- Rexel corporate site — https://www.rexel.com/ (200 OK ; logo officiel
  `#00448C` / `#2A96CF`, asset réservé au § Asset officiel, pas aux tokens UI)

## Upstream access

`rexel.com` répond 200 à l'outil réseau natif. Les feuilles du site corporate
ne sont pas adressables depuis le HTML traité, donc la mesure passe par le
paquet public `ds-rexel@2.0.17`, que le site corporate consomme lui-même
(`body.template-pages-layout-homePage` y est défini). Bootstrap 4.5 y est un
socle vendeur : toute valeur égale au stock Bootstrap est notée « défaut
vendeur conservé », jamais « décision de marque ».

## Colour mapping

| Sentropic role | Rexel source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | `$primary-600` DEFAULT BUTTON COLOR (`$primary`, 47 + 97 refs) | `#2e4eaa` |
| `action.primaryHover` | `$primary-500` `$primary-hover` (plus clair — mesuré, 18 refs) | `#3556b4` |
| `action.primaryText` | texte blanc (convention vendeur color-yiq sur couleur de marque, 7.54:1) | `#ffffff` |
| `action.secondary` | `$secondary-700` `$secondary` DEFAULT 2nd BUTTON (8 refs) | `#4487bd` |
| `action.secondaryHover` | `$secondary-600` (plus clair — mesuré, 5 refs) | `#4c99d1` |
| `action.secondaryText` | texte blanc (3.86:1 — arbitrage documenté, remplissage de marque conservé) | `#ffffff` |
| `text.link` / `tabs.activeText` | `$link-hover-color` + DEFAULT LINK COLOR du thème (restitution au § en-tête) | `#2e4eaa` |
| `text.primary` / `surface.inverse` | `$body-color` = `$gray-900` (54 refs, 12.20:1) | `#303545` |
| `text.secondary` | `$gray-600`, liens de fil d'Ariane (14 refs, 6.16:1) | `#596179` |
| `text.muted` | `$text-muted` = `$gray-500` (47 refs, **4.99:1**) | `#666F8A` |
| `border.subtle` / field stroke | `$gray-100`, bordures pagination/champs (84 refs) | `#D7D9E4` |
| `border.strong` | `$gray-400`, piste d'interrupteur (23 refs, 3.43:1, barre des lignes) | `#838AA1` |
| `surface.subtle` / `action` hover fills | `$background-color` = `$gray-50` (25 refs) | `#f3f3fa` |
| `surface.default` / `surface.raised` / `field.fillBg` | blanc (défaut vendeur conservé — peint : champs, cartes, boutons) | `#ffffff` |
| `surface.overlay` | voile dérivé de `$gray-900` à 60 % | `rgb(48 53 69 / 0.6)` *(à confirmer)* |
| `action.danger` / `feedback.error` | `$red` = `$danger` (5.88:1) | `#C8102E` |
| `feedback.success` | `$green` = `$success` (6.09:1) | `#16704a` |
| `feedback.warning` | `$orange` = `$warning` (remplissage de marque) | `#EE7900` |
| `feedback.info` | `$blue` = `$info` (4.89:1) | `#0072CE` |
| `buttonSecondary` border | `$primary-outlined` = `$primary` (3 refs) | `#2e4eaa` |
| `pagination` text / active | `$pagination-color` / `$pagination-active-color` + `-bg` | `#2e4eaa` / `#303545` sur `#f3f3fa` |
| `breadcrumb` links / current | `.breadcrumb-item a` / `.current-breadcrumb-link` | `#596179` / `#303545` |
| `badge.info*` | `$default-badge-primary-bg` / `-color` (9.56:1) | `#D6E5F5` / `#223361` |
| `alert` accents | `$alert-{info,success,warning,danger}-color` | `#055ea5` / `#16704a` / `#9b540c` / `#721c24` |
| `toggle` track / checked | `.custom-switch` off `$gray-400` / on `$success` | `#838AA1` / `#16704a` |
| `data.category1..8` | hex de marque (assignation à confirmer) | `#2e4eaa`, `#4487bd`, `#16704a`, `#EE7900`, `#C8102E`, `#0072CE`, `#092268`, `#ec6507` |

## À confirmer (derived or no published brand token)

- **`surface.overlay`** (`rgb(48 53 69 / 0.6)`) — aucun fond de modale publié ;
  voile dérivé du near-black de marque.
- **Géométrie `density` non publiée** : `lg.controlHeight 3rem`, tous les
  `minWidth`/`gap`, `paddingBlock` sm/lg — base Sentropic, pas la marque.
- **`z.*`, `cursor.*`, durées `motion.*`** — base Sentropic ; seul l'easing
  (`$easeInOutCubic`) est mesuré.
- **Géométrie `accordion.*`, `tag.*` (hors radius/neutres), `search` hérité,
  `alert` paddings/typo** — base Sentropic réécrite, pas omise.
- **`breadcrumb.separator`** (`#666F8A`) — pas de séparateur publié ; défaut
  `muted` réécrit.
- **`breadcrumb.currentWeight`, `typography.label` weight** (`600`) — pas de
  token publié ; base réécrite.
- **`iconSize.md`** (`1.125rem`) — base ; sm (`1rem`, indicateur) et lg
  (`1.25rem`, icône de recherche) sont mesurés.
- **Fond d'alerte mono-emplacement** (`#d9eaf8`, teinte info) — la marque
  publie quatre teintes (`#ccf2e2`, `#d9eaf8`, `#fde9d4`, `#f8d7da`) ; le
  créneau unique porte la représentante info, les quatre accents sont exacts.
- **Palette `data.*`** — les huit hex sont de marque, leur assignation aux
  catégories est une proposition cohérente, pas une échelle officielle.
- **`slate.90`** (`#02081A`, `$tertiary-800`, fond bas de page) — hex de
  marque, rôle assigné.
- None autre — tout le reste ci-dessus est mesuré des sources citées.

## Typography

- **Base / contrôles / champs** (`font.sans`, `typography.control/field`) :
  **'Open Sans'** (`$font-family-sans-serif: "open sans", sans-serif`,
  `$font-size-base: 0.875rem` = 14px à racine 16px — aucune redéfinition
  `html{font-size}` dans le DS). Boutons : 600 (`$btn-font-weight`), hauteur
  de ligne 1.3571 (`$button-line-height`). Champs : 400, 1.5
  (`$input-line-height` = 1.25 × 1.2). On référence le *nom* seul.
- **Titres** (`font.display`) : **'Montserrat'** (`$font-family-montserrat`,
  consommé par `h1/.h1` et `h2/.h2`, graisse normale, chasse −0.42px/−0.32px ;
  h3/h4 en Open Sans 600).
- **Monospace** (`font.mono`) : pile système Open Sans
  (`$font-family-monospace: "open sans", sans-serif` — fait mesuré : la marque
  ne publie pas de vraie chasse fixe).
- Links: `#303545` au repos, `#2e4eaa` au survol, **jamais soulignés**
  (`$link-decoration: none`, `$link-hover-decoration: none` ; seul
  `a.text-primary` souligne au survol/focus).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — champs boîtes (fond `#ffffff`,
  bordure 1px `#D7D9E4` sur quatre côtés, rayon 3px). Chevron du `<select>`
  natif redessiné en `#2e4eaa` (`$select-dropdown-primary`, état survol ;
  noir au repos — les deux états sont mesurés), `selectAppearance: "none"`
  mesuré, gouttière 1.625rem (0.625rem + icône 1rem).
- **Radius**: 3px partout (`.1875rem`, `$border-radius`), 6px large
  (`.375rem`, `$modal-content-border-radius`) ; pastilles `999px`.
- **Focus**: anneau **ring** bleu de marque (`focus.strategy = "ring"`,
  `box-shadow: 0 0 0 0.2rem rgba($primary, .25); outline: 0`, 2px effectifs) —
  technique Bootstrap re-teintée, pas un contour plein.
- **Buttons**: primaire plein `#2e4eaa` texte blanc (7.54:1) → survol
  `#3556b4` (plus clair — mesuré) ; secondaire **contourné** `#2e4eaa` sur
  blanc (fond blanc conservé au survol, texte `#3556b4`) ; promo `#ec6507`
  texte blanc (3.27:1 — remplissage de marque conservé, documenté).
- **Tabs / nav**: onglet actif = label `#2e4eaa` sur transparent, filet bas
  4px (`$border-width * 4`, `indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: liens `#2e4eaa` sur blanc, bordures `#D7D9E4` ; page active
  `#303545` sur `#f3f3fa`.
- **Géométrie mesurée citée** : champ md 2.375rem (21px + 16px + 1px), sm
  1.75rem (21px + 8px − 1px) ; paddings `.5rem`/`.75rem`
  (`$input-padding-y`, `$input-btn-padding-x`) ; `disabledOpacity` 0.5
  (`$btn-disabled-opacity`) ; ombres noires pures aux trois paliers.
- **Recherches vides citées** (preuve du repli « rien de publié ») :
  `input-border-width`, `input-focus-*`, `nav-link-padding-*`,
  `headings-font-family`, fond `body` global — absents du DS, donc stock
  vendeur Bootstrap conservé (bordure champ 1px, fond blanc, paddings
  pagination `.5rem`/`.75rem`) ou base Sentropic marquée à confirmer.

## Asset officiel

- Rexel logo = bandeau bleu profond `#00448C` + lame bleu clair `#2A96CF`
  (`/app/themes/rexel/assets/images/logo.svg` sur rexel.com). Utiliser le
  SVG/PNG officiel — **ne pas redessiner le logo à la main**. Ce paquet ne
  référence que des noms de fontes et des valeurs couleur publiques, jamais
  l'illustration du logo ni des binaires de fontes.
