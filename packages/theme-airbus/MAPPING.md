# Airbus -> Sentropic token mapping

This package maps the local Airbus Design System reference at
`../airbus-design-system` onto the Sentropic `TenantTheme` contract.

## Gouvernance de distribution (WP10 — décision formalisée 2026-06-21)

Ce thème est **STRICTEMENT PRIVÉ** : il ne sera jamais publié sur npmjs.com public.

- `publishConfig.access: "restricted"` — empêche toute publication publique accidentelle.
- Le package est exclu du workflow de publication OIDC (les tags `theme-airbus-v*` ne déclenchent aucune CI publish).
- Distribution autorisée uniquement via un registre npm privé, à la demande explicite du client Airbus.
- Raison : données de design propriétaires Airbus, accords de confidentialité, branding contrôlé.

## Sources

- `packages/design-tokens/src/core/color/palette.json`
- `packages/design-tokens/src/airbus/color/{surface,text,border}.json`
- `packages/design-tokens/src/airbus/color/{dimmed,saturated}.json`
- `packages/design-tokens/src/core/font/{family,size,lineheight,weight}.json`
- `packages/design-tokens/src/core/size/{spacing,radius}.json`
- `packages/design-tokens/src/core/elevation/{shadow,zindex}.json`
- `packages/styles/src/elements/{Button,Input,Tabs,Card,Chip,Badge,Breadcrumb,Pagination,Checkbox,Radio,Toggle,Toast}/index.ts`
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

## Dark Semantic

The package also exports `airbusDarkTheme` (`id: airbus-dark`, `mode: dark`).
Dark values follow the same Airbus decision-token families:

| Sentropic role | Airbus source | Value |
|---|---|---|
| `surface.default` | `surface.interaction.default.dark` | `#111111` |
| `surface.subtle` | `surface.componentbackground.minimal.dark` | `#25282e` |
| `surface.raised` | `surface.elevation.1.dark` | `#14171d` |
| `text.primary` | `text.neutral.default.dark` | `#ffffff` |
| `text.secondary` | `text.neutral.moderate.dark` | `#e0e3e9` |
| `text.link` | `text.link.neutral.default.dark` | `#638ee0` |
| `border.subtle` | `border.neutral.moderate.dark` | `#3c4657` |
| `border.strong` | `border.neutral.strong.dark` | `#ced5dd` |
| `border.interactive` | `border.accent.focus.dark` | `#e5ecf7` |
| `action.primary` | `surface.accent.default.dark` | `#86a8e9` |
| `action.primaryHover` | `surface.accent.hover.dark` | `#b3cbf8` |
| `action.primaryText` | `text.neutral.minimal.dark` | `#14171d` |

## Anatomy

Anatomy now covers the Airbus component primitives supported by
`createComponent`:

- Buttons: Airbus small technical buttons, bold 14px label, primary corporate
  blue, secondary outlined on white.
- Inputs/selects/search: filled field, `warmgrey.10` light background
  (`dark.40` in dark mode), top radius `3px`, bottom rule via inset shadow,
  focus blue from the Airbus focus border token.
- Tabs: 8px/16px padding, bold selected tab, bottom selected indicator.
- Cards: white/dark elevated surface, 6px radius, no explicit border.
- Chip/tag and badge: Airbus chip and badge geometry (`24px` chip,
  `16px` badge) mapped onto Sentropic tag/badge roles.
- Breadcrumb and pagination: 14px labels, 24px line-height, active pagination
  on Airbus active accent blue with borderless icon-button geometry.
- Checkbox/radio and toggle: Airbus 14px choice labels, 48px by 24px toggle
  track, 18px thumb, Airbus accent checked states.
- Alert: mapped from the inline Toast/Banner anatomy: left status rail, compact
  8px/16px body padding and 14px/20px text.

## Open Gaps

- React/Angular component behavior is out of scope for this package; this is a
  theme port only.
- Fidelity still needs the `/compare` bench once a visual Airbus reference page
  is available locally.
- Publication is blocked until the client-theme versioning and release policy is
  decided.
