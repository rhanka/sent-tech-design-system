# Amazon Cloudscape (AWS) → Sentropic mapping

This package maps the **public** [Cloudscape Design System](https://cloudscape.design/) — Amazon's
open-source design language for the AWS Management Console (Apache-2.0) — onto the Sentropic token
structure (`TenantTheme`). Only public design tokens (`@cloudscape-design/design-tokens`, the
`style-dictionary` "visual refresh" palette) and font *names* are referenced — no font binaries.
The AWS console face **Amazon Ember** is referenced by name only; the open-source Cloudscape package
itself substitutes **Open Sans**, kept here as the first fallback.

## Sources
- Cloudscape Design System — https://cloudscape.design/
- Design tokens — https://cloudscape.design/foundation/visual-foundation/design-tokens/
- Colors — https://cloudscape.design/foundation/visual-foundation/colors/
- Typography — https://cloudscape.design/foundation/visual-foundation/typography/
- Raw palette — `cloudscape-design/components` `style-dictionary/core/color-palette.ts`
- Semantic mapping — `style-dictionary/visual-refresh/colors.ts`, `color-palette.ts`
- Borders / radii — `style-dictionary/visual-refresh/borders.ts`
- AWS brand — https://aws.amazon.com/

## Colour mapping

| Sentropic role | Cloudscape token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | `colorPrimary600` / `colorBlue600` / `colorTextLinkDefault` | `#006ce0` |
| `action.primaryHover` | `colorBackgroundButtonPrimaryHover` / `colorBlue900` | `#002b66` |
| `text.primary` / `accordion`/`tag`/`choice`/`toggle` text | `colorTextBodyDefault` / `colorGrey950` | `#0f141a` |
| `text.secondary` / breadcrumb trail | `colorTextBodySecondary` / `colorGrey650` | `#424650` |
| `text.muted` | `colorGrey600` | `#656871` |
| `border.subtle` | `colorBorderDividerDefault` / `colorGrey350` | `#c6c6cd` |
| `border.strong` / `field.underlineColor` | `colorBorderInputDefault` / `colorGrey500` | `#8c8c94` |
| `surface.subtle` / `card.hoverBackground` | `colorGrey100` | `#f9f9fa` |
| `tag.neutralBackground` | `colorGrey200` | `#f3f3f7` |
| `surface.default` / `surface.raised` / `field.fillBg` | `colorWhite` / `colorBackgroundContainerContent` | `#ffffff` |
| `surface.inverse` | `colorAwsSquidInk` (AWS top nav) | `#232f3e` |
| accent (Sentropic `cyan`) | Amazon orange `colorAmber400` | `#ff9900` |
| `action.danger` / `feedback.error` | `colorTextStatusError` / `colorRed600` | `#db0000` |
| `feedback.success` | `colorTextStatusSuccess` / `colorGreen600` | `#00802f` |
| `feedback.warning` | `colorTextStatusWarning` / `colorYellow900` | `#855900` |
| `feedback.info` | `colorTextStatusInfo` / `colorBlue600` | `#006ce0` |

### "À confirmer" (no direct Cloudscape token / derived)
- **Buttons radius**: real Cloudscape `borderRadiusButton` = `20px` (near-pill), but the Sentropic
  model drives buttons from `radius.md` (the control radius, set to `8px` = `borderRadiusInput`).
  Inputs/fields/tabs are faithfully `8px`; the rounder 20px button is the known compromise.
- **`disabledOpacity` `0.4`** — Cloudscape greys disabled controls with dedicated colour tokens, not
  a single opacity; `0.4` approximates the dim.
- **Amazon orange `#ff9900`** maps to the Sentropic `cyan` accent slot (Cloudscape has no cyan; the
  orange is the AWS brand accent, not a UI-action colour).
- **Alert** — the real Cloudscape Alert is a full status-tinted box (2px border, 12px radius); the
  left-filet model (`alert.*`) is used here as the closest available anatomy.
- **Pagination** — Cloudscape current page is a dark non-link number (`activeBackground: transparent`,
  `activeText: #0f141a`), not a filled tile.
- **`shadow.*` and `motion.*`** — approximations of Cloudscape elevation / quick motion; exact specs
  not strongly tokenised publicly.
- **`data.*`** — the Cloudscape charts categorical palette (`#688ae8`, `#c33d69`, `#2ea597`,
  `#8456ce`, `#e07941`, `#3759ce`, `#962249`, `#096f64`); hues drawn from the Cloudscape chart scale.

## Typography
- **Headings / body / interactive** (`font.sans`, `font.display`, `typography.control/field/label`):
  `'Amazon Ember', 'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif`.
- **Monospace** (`font.mono`): `Monaco, Menlo, Consolas, 'Courier Prime', Courier, monospace`
  (Cloudscape `fontFamilyMonospace`).
- Body type **14px / 20px line-height** (`fontSizeBodyM` / `lineHeightBodyM`, ratio ≈ 1.43).
- Button + form labels are **bold 700** (`fontWeightButton` / `fontWeightHeadingM`).
- Links are **not underlined at rest** (AWS Blue text); underline appears on hover.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px grey border `#8c8c94`, 8px
  radius), not a filled-underline. Native `<select>` chevron redrawn in AWS Blue `#006ce0`.
- **Radius**: `borderRadiusInput` 8px (`radius.md`), `borderRadiusContainer` 16px (`radius.lg`),
  `borderRadiusBadge` 4px (`radius.sm` / tag / badge); pills `999px`. (Button 20px — see à confirmer.)
- **Focus**: `strategy: "ring"`, 2px AWS Blue ring offset 2px (`#006ce0`).
- **Buttons**: primary = solid AWS Blue `#006ce0` (hover `#002b66`); secondary/"normal" = outlined
  (transparent fill, 2px AWS Blue border + blue text, light-blue `#f0fbff` hover fill).
- **Tabs**: active tab = bold AWS Blue label with a 2px bottom border (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless AWS Blue links; current page = dark non-link number.
- **Density**: compact / applicative — md control ≈ 32px height, body 14px.

## Asset officiel
- AWS / Amazon brand assets (the "smile" orange logo, squid-ink top nav) are official Amazon marks —
  reuse the official asset, **do not redraw**. Squid ink `#232f3e` + Amazon orange `#ff9900` are the
  brand signatures.
