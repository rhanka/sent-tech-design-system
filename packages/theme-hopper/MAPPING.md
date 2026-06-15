# Hopper → Sentropic theme mapping

Measured-clone of **Hopper** (hopper.com — the Montréal-HQ travel-booking app,
Hopper Inc.). Every token value below is **measured** from Hopper's live public
CSS (a Next.js + Tailwind v4 build that ships a full `:root{…}` design-token
block). Only **public design tokens and the font name** are used — no font
binaries, no proprietary assets. Anything not directly measured is flagged
**à confirmer**.

## Sources

- `https://www.hopper.com/` (homepage HTML, lists the CSS bundles)
- `https://www.hopper.com/_next/static/css/135659a85495ed28.css` — the main
  token block: `--coral-*`, `--gray-*`, `--blue-*`, `--green-*`, `--orange-*`,
  `--red-*`, `--yellow-*`, the `--color-surface-*` / `--color-primary-*` /
  `--color-link` / `--color-error|warning|success|discount|offer` semantic
  layer, `--radius-*`, `--spacing-*`, `--default-font-family`, the `--text-*`
  type ramp, `--font-weight-*`, `--ease-*`, `--ring`, `--input`, `--disabled`.
- `https://www.hopper.com/_next/static/css/31eccbeb3e11779a.css` — component
  utility layer (`.bg-surface-primary-resting`, focus `outline-offset:2px`, etc.)

## Colour mapping

| Sentropic role | Hopper source token | Hex |
|---|---|---|
| `action.primary` | `--coral-50` / `--color-strikethrough` | `#f05754` |
| `action.primaryHover` | `--coral-60` | `#c13943` |
| `action.danger` / `feedback.error` | `--red-50` / `--color-error` | `#d72021` |
| `border.interactive` | `--coral-50` | `#f05754` |
| `cyan` accent / `feedback.info` | `--blue-50` / `--color-surface-primary-resting` / `--color-primary-main` | `#1878ec` |
| `text.link` | `--blue-60` / `--color-link` | `#135fc3` |
| `text.primary` | `--gray-100` / `--color-primary` | `#111111` |
| `text.secondary` | `--gray-70` / `--color-secondary` | `#545454` |
| `text.muted` | `--gray-60` | `#767676` |
| `surface.default` / `.raised` | `--white` / `--color-surface-contrast-resting` | `#ffffff` |
| `surface.subtle` | `--gray-05` / `--color-main` | `#f5f5f5` |
| `surface.inverse` | `--gray-90` | `#232323` |
| `border.subtle` | `--gray-10` (≈ `--input` oklch 92.2%) | `#e7e7e7` |
| `border.strong` | `--gray-20` / `--color-divider` | `#d9d9d9` |
| `feedback.success` | `--green-50` / `--color-success` | `#37a14a` |
| `feedback.warning` | `--orange-50` / `--color-warning` | `#c45000` |
| `focus.color` (ring) | `--ring` oklch(70.8% 0 0) ≈ `--gray-40` | `#aaaaaa` |
| brand mascot accent | `--coral-40` / `--color-coral-40` | `#fa6866` |
| data category5 (offer) | `--yellow-20` / `--color-offer` | `#f6ca05` |
| data category3 (discount) | `--green-60` / `--color-discount` | `#1c7933` |

## À confirmer

- **Coral vs blue as the ACTION colour.** Hopper's measured product-UI primary
  surface is BLUE (`--color-surface-primary-resting = --blue-50 #1878ec`,
  `--color-primary-main = --blue-50`). We promote **coral** (`#f05754`,
  `--color-strikethrough`, the bunny-mascot brand hue) to the Sentropic
  `action.primary` because it is Hopper's most recognisable brand identity, and
  keep the real blue as the `cyan`/`info`/`link` accent. The opposite mapping
  (blue primary, coral as accent) is equally defensible.
- `surface.overlay` `rgb(0 0 0 / 0.5)` — exact modal-backdrop alpha not isolated
  in the static CSS.
- `shadow.floating` `0 12px 32px -8px …` — popover/dropdown elevation not found
  as a named token; derived from the measured Tailwind lifted shadow.
- `density.*` control heights (36/44/52px) — derived from the `--spacing-*`
  scale; Hopper does not publish a named control-height token.
- `data.category1..8` — Hopper ships oklch `--chart-1..5` (Tailwind defaults),
  not a named brand data-vis ramp; ours is a coherent proposal on the measured
  brand coral + blue + system hues, NOT the verbatim oklch chart values.
- `disabledOpacity 0.5` approximates Hopper's `--disabled #0000004d` (black 30%).

## Typography

- Brand typeface: **Proxima Nova** (`--default-font-family:"Proxima Nova",
  sans-serif`). Referenced by **name only**, with a system-sans fallback chain.
  No separate display face — display reuses Proxima Nova at a heavier weight.
- Weights: regular 400, semibold 600 (`--font-weight-semibold`), bold 700,
  extrabold 800. Controls/labels are semibold; body/fields are regular.
- Type ramp (`--text-*`): field/body 16px (`--text-4`, line-height 22px);
  label 14px (`--text-3`); tag 12px (`--text-2`).
- Mono: not part of Hopper — the Sentropic mono stack is kept.

## Signatures anatomiques

- **Field**: `style:"outline"` — boxed, white fill, 1px hairline border
  (`--input` ≈ gray-10 `#e7e7e7`), **8px** radius (`--radius-md`). Native
  `<select>` chevron redrawn (`appearance:none`) in Hopper ink grey `#545454`.
- **Radius**: 2 / 4 / **8** / 12 / 16 / 24 / 32px (`--radius-xs…3xl`). Controls
  use the dominant 8px (`md`); cards 12px (`lg`); chips/avatars fully rounded.
- **Focus**: `strategy:"outline"`, 2px ring, **`offset:2px`** (measured
  `outline-offset:2px`), colour `#aaaaaa` (`--ring` oklch 70.8% neutral).
- **Buttons**: primary = filled **coral** `#f05754` → hover `#c13943`, white
  text. Secondary = filled **dark accent** `#111111` → hover `#232323`
  (`--color-surface-accent-resting/hover`), white text.
- **Tabs**: near-black semibold active label, coral bottom-border indicator.
- **Pagination**: borderless dark links; active page = filled coral pill, white
  text.
- **Chevron**: redrawn data-URI SVG, ink grey `#545454`.
- **Density**: friendly/generous; md control ~44px with 16–24px inline padding.
- **Motion**: `0.15s` base duration, `cubic-bezier(0,0,.2,1)` ease-out.

## Asset officiel

Hopper's mascot/wordmark (the bunny + "hopper" logotype) is a proprietary brand
asset served from Hopper's own CDN. **Do not redraw it.** This theme references
only public design tokens and the font *name* ("Proxima Nova"); no logo,
mascot, or font binary is bundled.
