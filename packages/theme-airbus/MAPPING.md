# Airbus -> Sentropic token mapping

This package maps the local Airbus Design System reference at
`../airbus-design-system` onto the Sentropic `TenantTheme` contract.

The package is intentionally `private: true` for now. Airbus is tracked as a
client theme until publication scope, naming, and distribution rules are
explicitly decided.

## Sources

- `packages/design-tokens/src/core/color/palette.json`
- `packages/design-tokens/src/airbus/color/{surface,text,border}.json`
- `packages/design-tokens/src/core/font/{family,size,lineheight,weight}.json`
- `packages/design-tokens/src/core/size/{spacing,radius}.json`
- `packages/design-tokens/src/core/elevation/{shadow,zindex}.json`
- `packages/styles/src/elements/{Button,Input,Tabs,Card}/index.ts`
- `packages/styles/src/helpers/focus.ts`

## Foundation

| Sentropic role | Airbus source | Value |
|---|---|---|
| `color.blue.10` | `primaryblue.10` | `#e5ecf7` |
| `color.blue.60` | `primaryblue.60` | `#255fcc` |
| `color.blue.80` | `primaryblue.80` | `#002d80` |
| `color.cyan.10` | `skyblue.10` | `#ebf8ff` |
| `color.cyan.50` | `skyblue.60` | `#3cb7ff` |
| `color.cyan.70` | `skyblue.80` | `#0b78b8` |
| `color.slate.0` | `base.white` | `#ffffff` |
| `color.slate.10` | `warmgrey.10` | `#fafafa` |
| `color.slate.20` | `coolgrey.20` | `#e0e3e9` |
| `color.slate.60` | `coolgrey.60` | `#63728a` |
| `color.slate.80` | `coolgrey.80` | `#3c4657` |
| `color.slate.90` | `dark.70` | `#14171d` |
| `feedback.success` | `green.80` | `#08875b` |
| `feedback.warning` | `yellow.70` | `#bb8e09` |
| `feedback.error` | `red.70` | `#e4002b` |
| `feedback.info` | `primaryblue.60` | `#255fcc` |

Fonts use the Airbus token stack: `Inter, Arial, sans-serif` and `Roboto Mono`
for mono. Spacing maps pixel-for-pixel to the Sentropic keys that already carry
4px/8px-grid values. Radius maps Airbus `3px`/`6px` tokens onto Sentropic
`sm`/`md`/`lg`.

## Semantic

| Sentropic role | Airbus source | Value |
|---|---|---|
| `surface.default` | `base.white` | `#ffffff` |
| `surface.subtle` | `warmgrey.10` | `#fafafa` |
| `surface.raised` | `base.white` | `#ffffff` |
| `surface.inverse` | `dark.70` | `#14171d` |
| `text.primary` | `text.neutral.default.light` | `#14171d` |
| `text.secondary` | `coolgrey.60` | `#63728a` |
| `text.muted` | `coolgrey.50` | `#919cb0` |
| `text.link` | `text.link.neutral.default.light` | `#255fcc` |
| `border.subtle` | `coolgrey.20` | `#e0e3e9` |
| `border.strong` | `border.neutral.strong.light` | `#63728a` |
| `border.interactive` | `border.accent.focus.light` | `#255fcc` |
| `action.primary` | `surface.accent.default.light` | `#00205b` |
| `action.primaryHover` | `surface.accent.hover.light` | `#002d80` |
| `action.primaryText` | `text.neutral.minimal.light` | `#ffffff` |
| `action.secondary` | `surface.interaction.default.light` | `#ffffff` |
| `action.secondaryHover` | `surface.interaction.hover.light` | `#f1f1f1` |
| `action.secondaryText` | `text.accent.default.light` | `#00205b` |

## Anatomy

Initial anatomy covers the same pilot path used by DSFR/Carbon:

- Buttons: Airbus small technical buttons, bold 14px label, primary corporate
  blue, secondary outlined on white.
- Inputs/selects: filled field, `warmgrey.10` background, top radius `3px`,
  bottom rule via inset shadow, focus blue `#255fcc`.
- Tabs: square tabs, 8px/16px padding, bottom selected indicator.
- Cards: white elevated surface, 6px radius, no explicit border.
- Tags/search: basic geometry from Airbus styles, enough to start visual QA.

## Open Gaps

- Dark mode is not mapped yet.
- React/Angular component behavior is out of scope for this package; this is a
  theme port only.
- Fidelity still needs the `/compare` bench once a visual Airbus reference page
  is available locally.
- Publication is blocked until the client-theme privacy policy is decided.
