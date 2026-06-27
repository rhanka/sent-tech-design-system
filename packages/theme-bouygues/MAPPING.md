# Bouygues (groupe) → Sentropic mapping

This package maps the **public** brand of the **Bouygues GROUP** (the holding
"Groupe Bouygues / Donnons vie au progrès", [bouygues.com](https://www.bouygues.com/) —
**not** a subsidiary such as Bouygues Telecom, Bouygues Construction or Colas)
onto the Sentropic token structure (`TenantTheme`). Method = **measured-clone**:
the action colour, neutral scale, system colours, typeface choice and anatomy
signatures are **measured from the live bouygues.com CSS** and from the official
group logo SVG. Only public token/CSS values and font *names* are referenced —
no font binaries. Values that are not directly measured (derived tints, the
success hue, motion/shadow) are flagged `à confirmer`.

## Sources
- Bouygues group live site — https://www.bouygues.com/ (measured via the Wayback Machine snapshot `20260101235034`, the site WAF blocks direct fetches)
- Live theme CSS (measured) — `https://www.bouygues.com/wp-content/cache/autoptimize/css/autoptimize_0882ae700445b2b9c20fbb1487f5bf43.css` (autoptimized WordPress stylesheet)
- Official group logo (measured fill) — `https://www.bouygues.com/wp-content/uploads/2022/07/logo-bouygues-2022.svg`
- Cross-check (historical orange logo) — Wikimedia `File:Bouygues SA logo rvb.png`, `File:Bouygues logo.svg` (orange wing, confirms the brand is orange)

## ⚠️ Écart de prémisse — la marque GROUPE est ORANGE, pas bleue
The brief assumed the Bouygues group is a **blue** brand ("logotype bleu avec
le symbole de l'aile"). **Measurement contradicts this.** Two independent public
sources show the Bouygues GROUP is an **orange** brand:

1. **Official group logo** `logo-bouygues-2022.svg` draws the **"aile" (wing)
   emblem in orange `#f26724`** (+ near-black wordmark `#12100b`, white).
2. **Live bouygues.com CSS**: the primary action / link / button colour is
   **orange `#e75113`** — by far the most frequent brand colour (≈ 68 hits;
   `background:#e75113`, `color:#e75113`, gradients `#dc2319 → #e75113`).

The corporate **blue `#0050b4`**, the **navy `#273584`** and the **turquoise
`#3ec2cf`** are real but **secondary** (button fills, `#0050b4 → #3ec2cf`
gradients, dark sections). This package is therefore a faithful measured-clone:
**orange is wired as the primary**, and the **blue family is wired as the
prominent secondary accent** (`cyan` slot) **and the navy inverse surface**, so
the brand's blue is still strongly present. (Bouygues *Telecom* — a subsidiary —
leans more on royal/turquoise blue + orange; that is a different brand and out
of scope here.)

## Colour mapping

| Sentropic role | Bouygues source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | live CSS primary action (brand orange) | `#e75113` |
| brand orange — logo wing | `logo-bouygues-2022.svg` fill | `#f26724` |
| `action.primaryHover` | live CSS darker orange | `#d33f00` |
| `action.danger` / `feedback.error` | live CSS deep red-orange (gradient start) | `#dc2319` |
| `feedback.warning` | live CSS amber | `#f7921e` *(light for AA text — à confirmer)* |
| `feedback.info` / accent (`cyan` slot) / badge info | live CSS corporate blue | `#0050b4` |
| `surface.inverse` / navy accent | live CSS deep navy | `#273584` |
| turquoise accent (`data.*`) | live CSS gradient end | `#3ec2cf` |
| `surface.default` / `surface.raised` | surface default | `#ffffff` |
| `surface.subtle` / `action.secondary` | live CSS background tint | `#f1f1f1` |
| `border.subtle` | live CSS background/border tint | `#ebebeb` |
| `border.strong` / field stroke | live CSS border | `#c4c4c4` |
| `text.muted` | live CSS muted text | `#8f8f8f` |
| `text.secondary` | live CSS secondary text | `#646464` |
| `text.primary` | live CSS body text | `#14151a` |
| darkest neutral / logo wordmark | `logo-bouygues-2022.svg` | `#12100b` |
| `feedback.success` | derived green (AA on white) | `#1a7a43` *(à confirmer)* |

### À confirmer (derived or not publicly extracted)
- **`feedback.success` `#1a7a43`** — the measured greens on the live site
  (`#86bc22`, `#21ca99`, `#91c36e`) are decorative/category greens, not a
  semantic success token; this value is darkened for WCAG AA on white.
- **`feedback.warning` `#f7921e`** — measured amber; light for AA-on-white text,
  kept as the brand amber.
- **Derived tints** `orange.light #fdeae0`, `blue.light #e6f0fb` — derived
  lighter steps for low-emphasis surfaces / hover fills.
- The **8-colour categorical `data.*`** palette (`#e75113`, `#0050b4`,
  `#3ec2cf`, `#273584`, `#86bc22`, `#dc2319`, `#646464`, `#f7921e`) — a coherent
  proposal from the measured brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, `disabledOpacity`, and the sm/lg `density.*` paddings
  — not strongly tokenised publicly; kept aligned with the Sentropic base.
- `radius` — CTAs measured as pills (`border-radius:30px` on the live site);
  the exact **input/field** radius is `à confirmer` (set to 8px).
- `font.display` = Lato — Lato is the dominant measured UI font; **Roboto** also
  appears on the site as a secondary heading face (its exact role is `à confirmer`).

## Typography
- **Body / controls / fields / labels / display** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`'Lato', sans-serif`** — Lato is the
  primary UI/body typeface of bouygues.com (the WordPress theme exposes
  `--wp--preset--font-family--lato`; ≈ 21 measured usages).
- **Secondary face**: `Roboto` also appears (≈ 8 usages, some headings/callouts)
  — documented but not wired as a separate slot (`à confirmer`).
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: brand orange `#e75113`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill,
  1px `#c4c4c4` border, 8px radius). Native `<select>` chevron redrawn in brand
  orange `#e75113`.
- **Focus**: high-contrast **outline** in brand orange `#e75113`
  (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius**: 8px on inputs / tabs (`radius.md = 0.5rem`), 16px on cards
  (`radius.lg = 1rem`); **CTAs are pills** and tags/pills stay `999px`
  (measured `border-radius:30px` on live buttons).
- **Buttons**: primary = solid brand orange `#e75113` → hover `#d33f00`;
  secondary = **outlined orange** (transparent fill, `#e75113` border + text,
  light orange `#fdeae0` hover fill).
- **Tabs / top-nav**: active tab = bold orange label with a bottom orange
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless orange links; active page = filled brand orange
  `#e75113`.
- **Alert / callout**: 4px left orange filet on a transparent box (matches the
  live `border-left:4px solid #e75113` callout style).

## Asset officiel
- Bouygues group logo = the **orange "aile" (wing)** emblem (`#f26724`) + the
  **BOUYGUES wordmark** (near-black `#12100b`). Use the official SVG/PNG from the
  brand — **do not redraw the logo by hand**. This package only references font
  *names* (Lato) and measured public CSS/SVG values, never logo artwork or font
  binaries.
