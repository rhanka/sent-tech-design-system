# Microsoft Copilot → Sentropic mapping

This package maps the **public Fluent 2** design language (the open design system
behind Microsoft Copilot's product UI, [fluent2.microsoft.design](https://fluent2.microsoft.design/)
+ the open-source [`@fluentui/tokens`](https://github.com/microsoft/fluentui/tree/master/packages/tokens)
package) onto the Sentropic token structure (`TenantTheme`). Only public Fluent
tokens, the Copilot brand-mark spectrum, and font *names* are referenced — no font
binaries.

## Sources
- Fluent 2 colour / tokens overview — https://fluent2.microsoft.design/color-tokens
  and https://fluent2.microsoft.design/design-tokens.
- Fluent Communication-blue brand ramp (`brandWeb`, MIT) —
  https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/brandColors.ts
  (brand[40] `#0c3b5e`, brand[70] `#115ea3`, brand[80] `#0f6cbd`, brand[150]
  `#cfe4fa`, brand[160] `#ebf3fc`).
- Fluent neutral grey ramp + shared status colours (`colors.ts`, MIT) —
  https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/colors.ts
  (grey[14] `#242424` … grey[100] `#ffffff`; Green `#107c10`, Red foreground
  `#b10e1c`/danger bg `#c50f1f`, dark-gold warning `#835b00`).
- Fluent corner-radius / elevation / motion globals (`@fluentui/tokens`):
  borderRadiusSmall 2px, Medium 4px, Large 6px, XLarge 8px, Circular 10000px;
  shadow4/8/16; durationFast/Normal/Slow + curveEasyEase.
- Microsoft Copilot brand-mark gradient (the multicolour ribbon) — teal `#199fd7`,
  green `#99bd3c`, orange `#fc7942`, rose `#ee5091`, violet `#8a50d8`
  (https://www.color-hex.com/color-palette/1068243 and Copilot logo coverage).

## Colour mapping

| Sentropic role | Fluent / Copilot token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `feedback.info` / `blue.60` | colorBrandBackground (brand 80) | `#0f6cbd` |
| `action.primaryHover` / `text.link` / `blue.80` | colorBrandBackgroundHover / ForegroundLink (brand 70) | `#115ea3` |
| brand pressed (ref) | colorBrandBackgroundPressed (brand 40) | `#0c3b5e` |
| `blue.10` / brand light fill | brand 160 | `#ebf3fc` |
| accent (Sentropic `cyan`) | Copilot brand-mark violet | `#8a50d8` |
| `text.primary` / `surface.inverse` / tab+accordion+tag text | NeutralForeground1 (grey 14) | `#242424` |
| `text.secondary` / breadcrumb links | NeutralForeground2 (grey 26) | `#424242` |
| `text.muted` / `border.strong` | NeutralForeground3 / StrokeAccessible (grey 38) | `#616161` |
| disabled text (ref) | NeutralForegroundDisabled (grey 74) | `#bdbdbd` |
| `border.subtle` / default field+card stroke | NeutralStroke1 (grey 82) | `#d1d1d1` |
| stroke 2 (ref) | NeutralStroke2 (grey 88) | `#e0e0e0` |
| `surface.subtle` / `action.secondaryHover` / control hover | NeutralBackground3 / 1Hover (grey 96) | `#f5f5f5` |
| card hover | NeutralBackground2 (grey 98) | `#fafafa` |
| `surface.default` / `surface.raised` / `action.secondary` | NeutralBackground1 (white) | `#ffffff` |
| `action.danger` / `feedback.error` | colorStatusDangerForeground1 | `#b10e1c` |
| destructive button background (ref) | colorStatusDangerBackground3 | `#c50f1f` |
| `feedback.success` | colorStatusSuccessForeground1 | `#0e700e` |
| `feedback.warning` | colorStatusWarningForeground1 | `#835b00` |

## À confirmer (no direct Fluent public token / derived)
- `cyan.10` `#efe6fb` and `cyan.70` `#6c3aab` — derived light/dark violet tints
  around the Copilot brand-mark violet `#8a50d8` (not official Fluent tokens).
- `feedback.info` `#0f6cbd` — Fluent has no dedicated "info" hue; it reuses the
  brand blue. Contrast on white ≈ 4.6:1 (AA for normal text).
- `feedback.warning` `#835b00` and `success` `#0e700e` chosen as the AA *fore-*
  *ground* status tones; Fluent's bright yellow `#fde300` / green `#107c10` are
  the background/icon tones (not re-used for text to keep WCAG AA on white).
- `data.*` 8-colour categorical palette — a coherent proposal built from the
  Fluent brand blue + the Copilot brand-mark spectrum + a Fluent green; Fluent
  publishes no official sequential data-vis scale.
- `tabs.paddingInline` (10px) and the `alert`/`pagination` metrics — approximate:
  Fluent MessageBar uses a tinted fill + intent icon (modelled here as a left
  accent filet on a transparent box), and Fluent ships no first-party pagination.
- `disabledOpacity` `0.55` — Fluent recolours disabled controls to neutral grey
  tokens rather than dimming via opacity; the base dim is kept as an approximation.
- `shadow.*` (Fluent shadow4/8/16) and `motion.*` (durationFast/Normal/Slow +
  curveEasyEase) — taken from the Fluent global scales; exact per-component
  elevation not re-measured.

## Typography
- **UI text / fields / labels / buttons** (`font.sans`, `typography.*`):
  `'Segoe UI Variable', 'Segoe UI', sans-serif` — buttons & labels Semibold
  (600), body & fields Regular (400). Fluent Body1 = 14px / 20px line-height.
- **Display / headings** (`font.display`): `'Segoe UI Variable Display', 'Segoe
  UI Variable', sans-serif`.
- **Monospace** (`font.mono`): `Consolas, 'Courier New', monospace`
  (Fluent `fontFamilyMonospace`).
- Links are **not** underlined at rest (brand `#115ea3` text); underline on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — Fluent's default Input is a boxed,
  rounded field (white fill, 1px `#d1d1d1` stroke, 4px `borderRadiusMedium`),
  with an emphasised bottom rule that turns brand on focus. Not filled-underline.
- **Radius**: Fluent corner scale — controls/inputs/tabs `md = 4px`
  (borderRadiusMedium), cards `lg = 8px` (borderRadiusXLarge), `sm = 2px`,
  badge/pill = circular (`9999px`). Fluent is gently rounded, not square.
- **Focus**: `focus.strategy = "double"` — Fluent's two-tone keyboard ring: a 2px
  OUTER stroke in `colorStrokeFocus2` (`#000000`) over a 1px INNER white gap
  (`colorStrokeFocus1` `#ffffff`). Brand-agnostic, high-contrast — the authentic
  Fluent focus technique (not a brand-coloured ring).
- **Buttons**: primary = solid Fluent brand `#0f6cbd` (hover `#115ea3`);
  secondary = the Fluent default neutral button (white fill, 1px `#d1d1d1`
  stroke, `#242424` text, `#f5f5f5` hover fill).
- **Tabs**: selected tab keeps NEUTRAL `#242424` Semibold text with a brand
  `#0f6cbd` bottom indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Chevron (native `<select>`)**: redrawn as a Fluent brand `#0f6cbd` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: Fluent control heights — sm 24px / md 32px / lg 40px; medium
  Button/Input = 32px, label 14px Semibold.
- **Copilot gradient**: the multicolour brand-mark ribbon — teal `#199fd7` →
  violet `#8a50d8` → rose `#ee5091`. `TenantTheme` has no gradient token, so the
  stops live in `data.category3` / `data.category2` / `data.category4`.

## Asset officiel
- The Microsoft Copilot logo (the multicolour ribbon hexagon) and the Fluent
  brand assets are official Microsoft trademarks — reference them from the
  Microsoft brand resources, do not redraw. Copilot chrome should use the
  official Copilot mark + Segoe UI Variable wordmark, not a hand-drawn approximation.
