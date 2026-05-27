# DSFR → Sentropic mapping

This package maps the **public** [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/)
onto the Sentropic token structure (`TenantTheme`). The DSFR design system is
open source (MIT). Only the **Marianne** font *binary* has a restricted license
reserved for the French government — this package references the font **name**
only, never ships the file.

## Sources

- DSFR colors — palette & utility tokens: https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/couleurs-palette
- DSFR color usage / decision tokens: https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/couleurs-utilisation-dans-le-dsfr
- DSFR spacing (8px grid, "v" = 4px): https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/espacement
- DSFR source (SCSS tokens, MIT): https://github.com/GouvernementFR/dsfr
- Utility token hex reference (community): https://vue-ds.fr/couleurs

DSFR color tokens are named with light/dark lightness pairs (e.g. `--grey-1000-50`
means lightness 1000 in light theme, 50 in dark theme). This theme is `mode: "light"`,
so the **light** side of each pair is used.

## Color mapping

| DSFR token (value) | Sentropic role | Notes |
| --- | --- | --- |
| Bleu France `--blue-france-sun-113-625` `#000091` | `semantic.action.primary`, `semantic.text.link`, `semantic.border.interactive`, `foundation.color.blue[60]` | The signature DSFR brand blue. Drives all primary actions, links, focus. |
| Bleu France hover `#1212ff` | `foundation.color.blue[80]` | Darker interactive variant. |
| Bleu France `--blue-france-925-125` `#e3e3fd` | `foundation.color.blue[10]`, `semantic.action.secondary` | Lightest tint → secondary button surface. |
| Rouge Marianne `--red-marianne-main-472` `#e1000f` | `foundation.color.cyan[50]`, `data.category2` | Decorative brand red. DSFR has no cyan, so the Sentropic "accent" (cyan) slot carries Marianne red — **approximate** (see notes). |
| `--grey-1000-50` `#ffffff` | `surface.default`, `surface.raised`, `text.inverse`, `action.primaryText`, `slate[0]` | Background default (white). |
| `--grey-975-75` `#f6f6f6` | `surface.subtle`, `slate[10]` | Background alt. |
| `--grey-950-100` `#eeeeee` | `border.subtle`, `slate[20]` | Subtle borders / contrast background. |
| `--grey-425-625` `#666666` | `text.secondary`, `border.strong`, `slate[60]` | Secondary / mention text and strong borders. |
| `--grey-625-425` `#929292` | `text.muted`, `foundation` disabled | Disabled / placeholder text. |
| `--grey-50-1000` `#161616` | `text.primary`, `surface.inverse`, `slate[90]` | Title / primary text; also the inverse surface. |
| Success `--success-425-625` `#18753c` | `feedback.success`, `status.completed`, `foundation.color.feedback.success` | DSFR system green. |
| Error `--error-425-625` `#ce0500` | `feedback.error`, `action.danger`, `status.failed`, `foundation.color.feedback.error` | DSFR system red. |
| Warning `--warning-425-625` `#b34000` | `feedback.warning`, `status.pending` | DSFR system orange/brown. |
| Info `--info-425-625` `#0063cb` | `feedback.info`, `status.processing` | DSFR system blue. |

## Typography mapping

| DSFR | Sentropic role | Notes |
| --- | --- | --- |
| **Marianne** (sans + titles) | `foundation.font.sans`, `foundation.font.display` | Stack: `Marianne, arial, system-ui, …, sans-serif` — the official DSFR fallback chain starts with `arial`. Font binary not shipped (restricted license). |
| — (no DSFR mono) | `foundation.font.mono` | DSFR has no monospace token → Sentropic base mono stack kept. |
| ~~Spectral~~ (legacy serif) | — | Deprecated in DSFR; not mapped. |

## Spacing & radius

| DSFR | Sentropic role | Notes |
| --- | --- | --- |
| 8px grid, `v` unit = 4px (`1v`=0.25rem … `16v`=4rem) | `foundation.spacing` | Maps 1:1 to the Sentropic px-aligned keys (`1`=4px … `16`=64px). |
| Squared corners (default `0`) | `foundation.radius.none`, `.sm` = `0` | DSFR is visually squared; `sm` forced to `0`. |
| 4px / 8px radius (tiles, badges, cards) | `foundation.radius.md` = `0.25rem`, `.lg` = `0.5rem` | A minority of DSFR surfaces use small radii. |

## Data-vis palette (categorical)

DSFR does **not** publish an official 8-color sequential/categorical data-vis
scale. `semantic.data.category1..8` is a **coherent proposal** built from DSFR
decorative color families (Bleu France, Rouge Marianne, green-emeraude,
terre-battue, blue-ecume, yellow-tournesol, purple-glycine, blue-cumulus).
Marked **"à confirmer"** — the hexes for the decorative families are from DSFR
naming but the exact values and contrast pairing should be verified against the
current DSFR palette before production data-viz use.

## Maps cleanly vs. approximate

**Clean (direct DSFR token → Sentropic role):**
- Bleu France → primary action / link / focus / interactive border.
- Grey scale → surfaces, text, borders (DSFR's grey pairs map naturally).
- System colors (success / error / warning / info) → feedback + status.
- Marianne → sans / display font.
- Spacing 8px grid → Sentropic spacing keys (exact px match).

**Approximate / choices:**
- **Cyan slot ← Rouge Marianne.** Sentropic has a `cyan` accent family; DSFR has
  no cyan. Rather than invent a cyan, the accent slot carries the brand's
  decorative red (Rouge Marianne). This keeps the slot DSFR-authentic but
  semantically it is a red, not a cyan.
- **`action.secondary`.** Mapped to the lightest Bleu France tint with Bleu
  France text, matching DSFR's "secondary" button (outlined/tinted) intent.
- **`surface.inverse`.** Uses the darkest grey (`#161616`); DSFR light theme has
  no formal inverse surface token, this is the natural dark counterpart.

## "À confirmer" (not hallucinated — verify before production)

- `foundation.shadow.*` — DSFR elevation specs are not strongly tokenised in the
  public docs; values here are conservative approximations.
- `foundation.motion.*` — DSFR motion durations/easing are not publicly tokenised;
  kept aligned with the Sentropic base.
- `semantic.data.category1..8` — proposed categorical palette (see above).
- `foundation.color.slate[80]` `#3a3a3a` — intermediate strong-text grey inferred
  from the DSFR grey scale; confirm against `--grey-200-850`.

## Inherited, non-DSFR-specific branches

The `tokens` tree must be **complete** (`compileTheme` flattens the whole tree to
CSS variables; the `component` layer references `semantic`/`foundation` roles).
- `foundation` and `semantic` are fully redefined with DSFR values.
- `foundation.z` (z-index ordering) is product-structural, not brand-specific →
  kept identical to the Sentropic base.
- The entire `component` layer is **reused unchanged** from
  `@sentropic/design-system-themes`. It only wires component-level roles onto the
  `semantic`/`foundation` roles above, so it automatically inherits all DSFR
  values without DSFR-specific overrides. This mirrors the forge / entropic /
  carbon themes.
