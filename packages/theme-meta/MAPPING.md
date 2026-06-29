# Meta AI (Llama) → Sentropic mapping

This package maps the **public** Meta brand palette (as published in Meta's brand
resource center and used across [ai.meta.com](https://ai.meta.com/),
[meta.ai](https://www.meta.ai/) and [llama.com](https://www.llama.com/)) onto the
Sentropic token structure (`TenantTheme`). Only public brand colours, the
Meta/Facebook UI grey scale, the Meta AI gradient ring, and font *names* are
referenced — no font binaries.

## Sources
- Meta official brand colours — https://www.facebook.com/brand/resources/meta/company-brand/
  (Meta Blue `#0064E0` / "dark blue", Meta Bright Blue `#0082FB` / "light blue").
  Mirrored at https://pickcoloronline.com/brands/meta/ and
  https://brandpalettes.com/meta-color-codes/ (Meta Blue `#0668E1`, Light Blue
  `#0080FB`, Meta Gray `#1C2B33`).
- Meta AI gradient "ring" stops — https://www.brandcolorcode.com/meta-ai
  (Turquoise `#71F6D2`, Blue `#0DACF1`, Pink `#F5A3E0`).
- Meta typography — "Optimistic" custom type family by Dalton Maag (Optimistic
  Display + Optimistic Text), https://fontsinuse.com/typefaces/180257/optimistic
  and https://developers.meta.com/horizon/design/fonts-icons/.
- Meta/Facebook UI grey scale and system accents — well-known Meta surface
  neutrals (`#f0f2f5`, `#e4e6eb`, `#ced0d4`, `#65676b`), flagged below where not
  re-measured from the brand center.

## Colour mapping

| Sentropic role | Meta token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` / `focus.color` | Meta Blue (official "dark blue") | `#0064e0` |
| `action.primaryHover` | darker Meta Blue (derived) | `#0653b3` |
| `blue.10` / light blue fill | Meta Blue tint (derived) | `#e7f0fe` |
| Bright accent / `data.category6` | Meta Bright Blue (official) | `#0082fb` |
| accent (Sentropic `cyan`) | Meta AI ring turquoise / blue | `#71f6d2` / `#0dacf1` |
| `text.primary` / `surface.inverse` / accordion / current breadcrumb | Meta Gray (official) | `#1c2b33` |
| `text.secondary` / `breadcrumb.text` | Meta grey 700 | `#65676b` |
| `text.muted` / `border.strong` | Meta grey 500 | `#8a8d91` |
| `border.subtle` | Meta grey 300 | `#ced0d4` |
| `surface.subtle` / `action.secondary` / chip fill | Meta grey 100 | `#e4e6eb` |
| background alt / card hover | Meta light grey | `#f0f2f5` |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `slate.90` (near-black primary) | Meta/FB near-black | `#050505` |
| `action.danger` / `feedback.error` | Meta/FB red (AA-tuned) | `#e41e3f` |
| `feedback.success` | Meta/FB green | `#31a24c` |
| `feedback.warning` | amber (AA-tuned) | `#b26b00` |
| `data.category2` | Meta AI ring pink | `#f5a3e0` |

### "À confirmer" (no direct Meta public token)
- `blue.hover` `#0653b3` and `blue.10` `#e7f0fe` — darker / lighter Meta Blue
  tints derived around the official `#0064e0`, not published tokens.
- `cyan.10` `#cffaee` — light turquoise tint derived around the Meta AI ring
  turquoise `#71f6d2`.
- Grey scale `#f0f2f5`, `#e4e6eb`, `#ced0d4`, `#8a8d91`, `#65676b`, `#050505` —
  well-known Meta/Facebook UI surface neutrals, not re-measured from the brand
  center (Meta Gray `#1c2b33` is the one official neutral).
- `system.success` `#31a24c` — Meta/Facebook success green (UI convention).
- `system.error` `#e41e3f` — Meta/Facebook red tuned for WCAG AA on white (the
  brand red is `#fa383e`, which fails AA as text).
- `feedback.warning` `#b26b00` — amber darkened for AA on white (Meta has no
  published warning token).
- `data.category5` `#a64dff` — violet companion to the Meta AI gradient ring,
  a coherent stop, not an official token.
- The 8-colour categorical `data.*` palette overall — a coherent proposal from
  the Meta Blue family + Meta AI ring, not an official data-vis scale.
- `shadow.*` and `motion.*` — approximate Meta's soft light-UI elevation /
  easing; exact specs not re-measured.
- `density.*`, paddings and `radius.*` — Meta's rounded clean aesthetic
  (8px controls, 12px cards, pill CTAs), approximate from the live UI.

## Typography
- **Display / headings** (`font.display`): `'Optimistic Display', 'Optimistic
  Text', system-ui, …` — Meta's custom Dalton Maag display face.
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.control`,
  `typography.label`): `'Optimistic Text', system-ui, …` — semibold (600) for
  interactive/labels, regular (400) for body/fields.
- **Monospace** (`font.mono`): platform monospace fallback (`ui-monospace,
  'SFMono-Regular', Menlo, …`) — Meta ships no custom mono.
- Links are **not** underlined at rest (Meta Blue text); underline on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#ced0d4` border, 8px radius), Meta's modern "outlined" input look. Not a
  filled-underline.
- **Radius**: Meta rounding — controls/inputs `md = 8px`, cards `lg = 12px`,
  primary CTAs / chips read as pills (`pill = 999px`); `sm = 6px`.
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in Meta Blue
  `#0064e0` (3px, offset 2px), the modern Meta UI focus technique (not a native
  offset outline).
- **Buttons**: primary = solid Meta Blue `#0064e0` (pill CTA); secondary = Meta
  "neutral" button (light grey `#e4e6eb` fill, dark `#1c2b33` label, `#ced0d4`
  on hover).
- **Tabs**: active tab = Meta Blue semibold label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Meta Blue.
- **Chevron (native `<select>`)**: redrawn as a Meta Blue `#0064e0` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: Meta touch targets (md ≈ 40px control height) with generous
  horizontal padding; button label 15px (`0.9375rem`) semibold.
- **Meta AI gradient ring**: `#0dacf1` (sky) → `#71f6d2` (turquoise) → `#f5a3e0`
  (pink), with a derived violet companion `#a64dff`. `TenantTheme` has no
  gradient token, so the stops live across `data.category*` and are noted here
  as the brand signature.

## Asset officiel
- The Meta wordmark, the Meta infinity logo and the Meta AI gradient "ring"
  mark are official Meta brand assets — reference them from Meta's Brand
  Resource Center, do not redraw. Meta AI chrome should use the official Meta AI
  ring (turquoise→blue→pink gradient), not a hand-drawn approximation.
