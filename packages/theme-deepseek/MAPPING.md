# DeepSeek → Sentropic mapping

This package maps DeepSeek's **public** web design system onto the Sentropic
token structure (`TenantTheme`). All colour values are **measured** from the
`--dsw-*` CSS custom properties shipped in the production stylesheets of
[deepseek.com](https://www.deepseek.com/) / [chat.deepseek.com](https://chat.deepseek.com/)
(the `dsw` "DeepSeek Web" token layer). Only the **light-mode** (`:root`) values
are used; the dark-mode (`[data-ds-dark-theme]`) overrides are listed below for
reference. Only public token values and font *names* are referenced — no font
binaries.

## Sources
- DeepSeek production CSS bundles (measured June 2026), served from
  `https://www.deepseek.com/_next/static/css/*.css` — the `--dsw-static-*` raw
  scales (`deepseek`, `neutral-bluish`, `neutral`, `red`, `green`, `amber`,
  `blue`), the `--dsw-alias-*` semantic roles (`brand-primary`, `button-*`,
  `label-*`, `bg-*`, `state-*`), and the `--dsw-specific-*` component slots
  (`input-major`, `login-input`, `bubble`, `sidebar-*`).
- DeepSeek brand colour / logo references — https://brandfetch.com/deepseek.com
  and logo galleries (marketing whale-logo blue `#4D6BFE`, secondary white,
  "Shark" `#212327`).
- Typography measured from the same bundles: `--dsw-font-family` resolves to
  `Inter` (with a `quote-cjk-patch` CJK fallback) + the system sans stack; code
  uses the `ui-monospace, SFMono-Regular, …` system stack.

## Colour mapping (light mode)

| Sentropic role | DeepSeek token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` / `tabs.activeText` | `deepseek-500` (`alias-brand-primary` light) | `#3964fe` |
| `action.primaryHover` | `deepseek-450` (`alias-button-primary-hover` light) | `#5686fe` |
| `focus.color` | `deepseek-500` | `#3964fe` |
| `blue.10` / selected / chat-bubble fill | `deepseek-50` (`alias-button-ghost-active-fill`, `specific-bubble`) | `#edf3fe` |
| accent (Sentropic `cyan`) — closest brand blues | `deepseek-100` / `deepseek-400` / `deepseek-600` | `#e4edfd` / `#679efe` / `#4868b2` |
| `text.primary` | `neutral-bluish-1000` (`alias-label-primary` light) | `#0f1115` |
| `text.secondary` | `neutral-bluish-700` (`alias-label-secondary` light) | `#61666b` |
| `text.muted` | `neutral-bluish-600` (`alias-label-tertiary`/`caption` light) | `#81858c` |
| `surface.subtle` / `action.secondaryHover` | `neutral-bluish-75` (`alias-interactive-bg-hover-solid` light) | `#f1f3f5` |
| `action.secondary` / alt surface / sidebar fill | `neutral-bluish-50` (`specific-sidebar-fill` light) | `#f9fafb` |
| `border.subtle` | `neutral-bluish-200` | `#e1e5ee` |
| `border.strong` | `neutral-bluish-300` | `#cfd3d6` |
| strong text (`slate.80`) | `neutral-bluish-800` | `#353638` |
| `surface.default` / `surface.raised` / `field.fillBg` | `neutral-bluish-00` (`alias-bg-base` light, `specific-input-major`) | `#ffffff` |
| `surface.inverse` | `neutral-bluish-950` (`alias-bg-base` **dark**) | `#151517` |
| `action.danger` / `feedback.error` | `red-600` (`alias-state-error-primary` light) | `#ec1313` |
| `feedback.success` | `green-500` (`alias-state-success-primary`) | `#22c55e` |
| `feedback.warning` | `amber-600` (`alias-state-warn-label`) | `#dd8629` |

### "À confirmer" (no direct DeepSeek public token, or derived)
- **`action.primary` choice** — the UI uses `deepseek-500` `#3964fe` as the
  light-mode brand action; the **marketing/logo** whale blue is `#4D6BFE`
  (`brand.mark`). The two are near-identical electric blues; the measured UI
  action token was preferred for component fidelity. The logo blue is recorded
  as an asset colour, not a UI role.
- **`cyan.*` accent slot** (`#e4edfd` / `#679efe` / `#4868b2`) — DeepSeek ships a
  single-hue brand (no second accent / teal / cyan). The Sentropic accent slot
  reuses lighter/darker DeepSeek blues as the nearest equivalent.
- **`feedback.info` `#3964fe`** — DeepSeek has no distinct info hue; the brand
  blue stands in.
- **`data.*` (8-colour categorical)** — DeepSeek publishes no sequential
  data-vis scale; this is a coherent proposal from the brand blue + system tones.
- **`shadow.*`, `motion.*`, `disabledOpacity`** — approximate DeepSeek's soft
  elevation / brisk transitions; exact specs not re-measured.
- **Radius scale** — DeepSeek uses Tailwind utilities; measured `border-radius`
  values were `6 / 8 / 10 / 12 / 16px` + `9999px`. Mapped to `sm 6 / md 10 /
  lg 12 / pill 9999`.
- **Density / control heights** — measured control heights `2 / 2.25 / 2.5rem`;
  paddings approximated.
- **`field.fillBg`** — the main chat composer (`specific-input-major`, light) is
  white `#ffffff` (used here); auxiliary login inputs use `specific-login-input`
  `#f9fafb` (the subtle bluish fill).

### Dark-mode reference (not used; documented for fidelity)
- `bg-base` `neutral-bluish-950` `#151517`; `label-primary` `neutral-bluish-50`
  `#f9fafb`; `brand-primary` `deepseek-450` `#5686fe`; `button-primary-hover`
  `deepseek-500` `#3964fe`. (Light mode inverts each of these — see the table.)

## Typography
- **UI + headings** (`font.sans`, `font.display`, `typography.control/label`):
  `Inter, system-ui, …, sans-serif` — DeepSeek ships **Inter** as its single
  sans family (`--dsw-font-family`), with a `quote-cjk-patch` CJK fallback that
  is omitted here.
- **Body / fields** (`typography.field`): Inter regular 400, ~15px.
- **Monospace** (`font.mono`): the system `ui-monospace, SFMono-Regular, …`
  stack used by DeepSeek's code blocks.
- Links read as brand-blue text, underlined on hover (not at rest).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#e1e5ee` cool-grey border, ~10px radius). The hero chat composer is a
  large pill (`pill = 9999px`). Not a filled-underline.
- **Radius**: soft, generous rounding — controls/inputs `md = 10px`, cards
  `lg = 12px`, chips/composer read as pills (`pill = 9999px`); `sm = 6px`.
- **Focus**: `focus.strategy = "ring"` — inputs flip their border to brand blue
  `#3964fe` with a soft ring on focus (3px, offset 2px).
- **Buttons**: primary = solid brand blue `#3964fe`, lightening to `#5686fe` on
  hover (DeepSeek's measured light-mode hover); secondary/default = subtle
  `#f9fafb` grey fill, no border, `#f1f3f5` on hover.
- **Chat bubble**: the user message bubble uses the light-blue `deepseek-50`
  `#edf3fe` fill (`--dsw-specific-bubble`) — a signature DeepSeek tint.
- **Tabs**: active tab = brand-blue medium label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`) — à confirmer.
- **Chevron (native `<select>`)**: redrawn as a brand-blue `#3964fe` arrow,
  `appearance: none`, right gutter.
- **Density**: compact controls (md ≈ 36px) on a 4px Tailwind grid; UI label
  weight 500.

## Asset officiel
- The DeepSeek whale wordmark/logo (marketing electric blue `#4D6BFE`) is an
  official DeepSeek brand asset — reference it from DeepSeek's own site/brand
  assets, do **not** redraw. DeepSeek chrome should use the official whale mark,
  not a hand-drawn approximation.
