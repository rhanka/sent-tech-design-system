# Accor → Sentropic mapping

This package maps the **public** official design system of Accor — **"Welcome by Accor"**
([design.accor.com](https://design.accor.com)) — onto the Sentropic token structure
(`TenantTheme`). Method = **measured clone**: every colour is measured from Accor's published
semantic design tokens (`wel.sem.color.*`), which expose explicit hex values on the Brand
Tokens page. Only public token values and font *names* are referenced — no font binaries. Any
value not directly measured is flagged "à confirmer".

> **Identity note.** Third-party brand aggregators (brandcolorcode, schemecolor…) still list a
> navy `#002B49` / gold `#E29C16` pair — that is the **legacy AccorHotels logo (pre-2023)**, not
> the current design system. The current Accor primary is the deep indigo `#050033`. The legacy
> values are deliberately **not** used here.

## Sources
- Accor design system — https://design.accor.com
- **Brand Tokens (measured, authoritative)** — https://design.accor.com/latest/foundations/color/brand-tokens-4AIv39qw
- Colour overview (primitives cross-check) — https://design.accor.com/latest/foundations/color/overview-LZF1CMgQ
- Radius — https://design.accor.com/latest/foundations/radius-4eS32Vqs-4eS32Vqs
- Focus — https://design.accor.com/latest/foundations/focus-TNKg3gdf-TNKg3gdf
- Typography (iOS/Android platform faces) — https://design.accor.com/latest/foundations/typography/typography-for-i-os-and-android-PZxCGE8a-PZxCGE8a
- Legacy-identity cross-check (NOT used) — https://colorindicator.com/brand/accor, https://www.brandcolorcode.com/accor-group

## Colour mapping (measured — `wel.sem.color.*`)

| Sentropic role | Accor token | Hex |
|---|---|---|
| `action.primary` / `surface.inverse` / `border` indigo / `blue.60` | `primary` | `#050033` |
| `action.primaryHover` (`blue.80`) | `on-primary-container` | `#1f1b4b` |
| `action.primaryText` / `text.inverse` / `pagination.activeText` | `on-primary` | `#f9f9ff` |
| `action.secondary` / `buttonSecondary.hover` / `blue.10` | `primary-container-hi` | `#e8edff` |
| `border.interactive` / `tabs.activeText` / `badge.infoBackground` / accent (`cyan.50`) | `accent` | `#2d4cd5` |
| `action.secondaryHover` / accent light (`cyan.10`) | `accent-container-hi` | `#ccd2ff` |
| `text.link` / `breadcrumb.linkText` / `feedback.info` / `cyan.70` | `link` | `#0051ae` |
| `focus.color` | `focus` (`:focus` outline-color) | `#2a71db` |
| `data.category5` (loyalty) | `loyalty` | `#5f5bd2` |
| `data.category4` (promo) | `offer` | `#b40875` |
| `surface.default` / `surface.raised` / `field.fillBg` (`slate.0`) | `surface` | `#ffffff` |
| `surface.subtle` / `card.hover` / `tag.neutralBackground` (`slate.10`) | `surface-container-mid` | `#f7f9fb` |
| `border.subtle` (`slate.20`) | `outline-low` | `#d9dadc` |
| `outline-mid` (mid border) | `outline-mid` | `#afb1b3` |
| `border.strong` / `breadcrumb.separator` | `outline-hi` | `#898c8e` |
| `text.muted` (`slate.60`) | `on-surface-low` | `#5e5b73` |
| `text.secondary` (`slate.80`) | `on-surface-mid` | `#38364d` |
| `text.primary` / `accordion`/`tag`/`toggle` text (`slate.90`) | `on-surface-hi` | `#232136` |
| `action.danger` / `feedback.error` | `danger` | `#be003c` |
| `feedback.warning` | `warning` (gold) | `#f2d166` |
| `feedback.success` | `success` (teal-green) | `#006a53` |
| `data.category8` (eco) | `eco` | `#237b00` |

## À confirmer (derived / not directly measured)
- **Web font name(s).** Accor publishes platform faces only — **SF Pro** (San Francisco, iOS) and
  **Roboto** (Android). The bespoke web face is a curated Adobe Fonts pack ("Typography Welcome
  Pack") whose names are not extractable from the public docs. `font.sans`/`display` lean on the
  documented platform faces; the web face is à confirmer.
- **Typography sizes/weights** (`typography.control/field/label`, `density.*` heights/paddings) —
  derived to a comfortable hospitality rhythm; the public DS does not publish exact control specs.
- **`action.primaryHover` `#1f1b4b`** — uses `on-primary-container` as a lighter indigo hover; the
  DS does not publish a separate filled-button hover token (à confirmer it is the exact hover).
- **`radius.md = 100px`** drives buttons (the measured `interactive-high/low` CTA pill) but in the
  base it is ALSO read by menus/dropdowns, which Accor measures at 6px (`container`). The pill CTA
  signature was prioritised; fields are decoupled to 6px via `field.radiusTop/Bottom`, cards via
  `radius.lg = 6px`. Menu/dropdown radius is therefore à confirmer.
- **`tag.radius = 6px`** (`static-lg`) — Accor does not publish a Chip/Tag radius explicitly; the
  measured Badge radius is `4px` (`static-md`, used here for `badge.radius`).
- **`feedback.warning` `#f2d166`** (measured gold) has low contrast on white as text/border (paired
  in the DS with `on-warning #070518`); kept as the real brand token, flagged here.
- **`shadow.*`, `motion.*`, `disabledOpacity 0.5`, `z.*`** — derived (the public DS does not
  tokenise elevation/motion in clear).
- **8-colour categorical `data.*` palette** — a coherent proposal from measured Accor hues
  (primary, accent, success, offer, loyalty, link, warning, eco), not an official sequential scale.
- **Production CSS of group.accor.com / all.accor.com** — not captured (Next.js bundles served
  403/markdown without styles); all hex above come from the official DS, not the live product CSS.

## Typography (font names only)
- **Body / UI / fields** (`font.sans`, `typography.control/field/label`): the documented platform
  faces — **SF Pro / San Francisco** (iOS) and **Roboto** (Android) — with a `system-ui` fallback.
- **Display** (`font.display`): same faces, the `SF Pro Display` cut first.
- **Monospace** (`font.mono`): Accor ships none; the Sentropic mono stack is kept.
- The bespoke Accor web face is **à confirmer** (not published in clear).

## Anatomy signatures (measured)
- **Radius**: FULL-PILL CTA buttons — `interactive-high/low = 100px` (`radius.md`); inputs `6px`
  (`input` → `field.radiusTop/Bottom`); cards `6px` (`container` → `radius.lg`); Badge `4px`
  (`static-md`); `static-sm 2px`; avatars/switch `full 100px`.
- **Focus**: 3px solid OUTLINE in `#2a71db` (`focus`), `outline-offset: 3px`, `outline-style:
  solid`, shown on **keyboard navigation only** (`use-keyboard`). Fallback `fuchsia.40` (magenta)
  when contrast < WCAG AA 3:1 — all measured on the Focus page.
- **Fields**: boxed outline (white fill, 1px `outline-low` `#d9dadc` border, 6px radius); native
  `<select>` chevron redrawn in the indigo primary `#050033`.
- **Buttons**: primary = solid deep indigo `#050033`, near-white text, full pill; secondary =
  outlined indigo (transparent fill, pale-indigo `#e8edff` hover).
- **Tabs**: active = bold accent-blue `#2d4cd5` label with a bottom accent underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless accent links; active page = filled indigo `#050033` with near-white
  text.
- **Tags / badges**: tag `6px`, badge `4px` (measured), badge info fill = accent `#2d4cd5`.

## Asset officiel
- Accor logo: use the official asset from Accor brand resources (do **not** redraw). The current
  identity is the gold-feathered "A" / Bernache emblem with the ACCOR wordmark; the UI primary is
  the deep indigo `#050033`. Never recreate the emblem by hand.
