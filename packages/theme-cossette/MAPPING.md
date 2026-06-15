# Cossette → Sentropic theme mapping (provenance ledger)

Measured-clone of **Cossette** (cossette.com — Montréal advertising agency).
Every value below is either MEASURED from Cossette's public CSS / page meta, or
flagged **à confirmer** when Cossette has no measured equivalent and a coherent
value was derived to honour the brand identity.

## Sources
- `https://cossette.com` — live site, inspected in a real browser (computed CSS).
- Page `<meta name="theme-color" content="#ffee00">` — the brand yellow signature.
- Dominant hero hex `#ffee00` (brand yellow) over a black/white monochrome system.
- No published design-token file exists; all colour/type values are read off the
  live computed styles.

## Colour mapping table

| Sentropic role | Value | Source |
| --- | --- | --- |
| `action.primary` | `#ffee00` | meta `theme-color` + hero hex — brand yellow CTA |
| `action.primaryHover` | `#e6d600` | **à confirmer** — derived ~10% darker yellow (no measured hover token) |
| `action.primaryText` | `#111111` | **CRITICAL** — black text on yellow; white fails WCAG contrast on #ffee00 |
| `text.primary` | `#111111` | measured near-black body ink |
| `text.secondary` | `#555555` | measured secondary text |
| `text.muted` | `#8a8a8a` | measured muted text |
| `surface.default` | `#ffffff` | page background |
| `surface.subtle` | `#f5f5f5` | measured subtle fill |
| `surface.inverse` | `#111111` | near-black inverse band |
| `border.subtle` | `#e0e0e0` | measured hairline border |
| `action.danger` / `feedback.error` | `#d32f2f` | measured error/danger red |

## On-yellow text behaviour (CRITICAL)
The brand colour `#ffee00` is a pure high-luminance yellow; **white text on it is
illegible** (fails WCAG AA badly). `createComponent` derives on-primary text from
`semantic.action.primaryText`, so it is set to `#111111` (near-black). Every other
"text on the brand fill" role is likewise driven to `#111111`:
- `semantic.action.primaryText` → `#111111`
- `foundation.badge.infoText` (info badge = yellow fill) → `#111111`
- `foundation.pagination.activeText` (active page = yellow fill) → `#111111`
- `foundation.tabs.activeText` (yellow underline indicator, near-black label) → `#111111`
- `foundation.breadcrumb.currentText` → `#111111`

Focus is also drawn in near-black (`focus.color = #111111`): a yellow focus ring
against white would be invisible.

## À confirmer (no measured Cossette equivalent)
- `action.primaryHover` `#e6d600` — derived darker yellow.
- `feedback.success` `#2e7d32`, `feedback.warning` `#b26a00`, `feedback.info`
  `#111111` — Cossette publishes no success/warning/info hues; legible AA-on-white
  values chosen (info maps to near-black ink, not blue).
- Spacing / radius exact steps — not strongly tokenised publicly; kept on the base
  4px scale. Radius is SQUARE (`md: 0`, `lg: 2px`) to read as a sharp agency grid.
- Shadow / motion / z specs — kept conservative, aligned to the Sentropic base.
- Data-vis scale — coherent proposal leading with brand yellow then near-black,
  not an official Cossette scale.

## Typography
- `font.sans` / `font.display`: `'Helvetica Neue', Helvetica, Arial, sans-serif`
  — measured bold agency grotesk. Names only; no binaries.
- `font.mono`: kept from the Sentropic/Simons base stack (mono is not part of the
  Cossette brand).
- CTAs / control labels are UPPERCASE-tracked (measured letter-spacing), weight
  600–700 — an agency convention.

## Signatures anatomiques
- `field.style: "outline"` — boxed white field, thin `#e0e0e0` hairline, square.
- `focus.strategy: "outline"`, width 2px, offset 2px, colour `#111111` (black).
- `radius`: SHARP — `none/sm/md: 0`, `lg: 2px`, `pill: 999px`.
- Brand fills (primary button, active pagination, info badge, tab indicator) use
  `#ffee00` with `#111111` text/labels.

## Asset officiel
- Brand yellow `#ffee00`, near-black `#111111`, white `#ffffff`.
- No logo binary is bundled; only colour + font *names* are referenced.
