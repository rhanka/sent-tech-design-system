# Nous Research / Hermes — token mapping & provenance

This theme (`id: "nous-hermes"`, label **"Nous Hermes"**) is a **measured clone** of
the public Nous Research / Hermes design language for the Sentropic token
structure. Only **public CSS/theme tokens and font *names*** are used — never
font binaries. Every value is either measured (with its source variable cited
inline in `src/index.ts`) or **derived** and listed under **À confirmer**.

Nous Research is "the AI accelerator company" behind the open **Hermes** model
family and the **Hermes Agent**. Its identity is **dark, near-black navy,
terminal-monospace, ice-blue accent, amber warm-glow**.

## Sources

- **Marketing site** — https://nousresearch.com (WordPress + Elementor "Hello"
  theme). Brand palette + typography measured from the Elementor global **kit**:
  `https://nousresearch.com/wp-content/uploads/elementor/css/post-4.css`
  (custom `--e-global-color-*` block) and the page `<head>` font links
  (`Courier Prime`, `Open Sans`) + the kit display face declaration
  (`font-family:"mondwest mike"` → PP Mondwest).
- **Hermes Agent dashboard** — https://hermes-agent.nousresearch.com, doc
  "Extending the Dashboard"
  (`/docs/user-guide/features/extending-the-dashboard`): the documented 3-layer
  palette + warm-glow vignette + shadcn `color-mix()` cascade and the typography
  tokens (`fontMono`, `fontSans`, `fontDisplay`, `baseSize`, `--radius`,
  `--spacing-mul`).

## Colour mapping

| Role (Sentropic) | Source token | Hex |
|---|---|---|
| surface.default (stage) | Hermes `palette.background` ("near-black") | `#05091a` |
| (marketing stage, cross-check) | `--e-global-color-4e71b2c` | `#010a26` |
| surface.subtle / card / field fill | `color-mix(background, midground ~8%)` *(derived)* | `#161c2c` |
| surface.raised | `color-mix(background, midground ~12%)` *(derived)* | `#1e2536` |
| surface.inverse | Hermes `palette.midground` (ice) | `#d8f0ff` |
| text.primary | Hermes `palette.midground` ("primary text + accent") | `#d8f0ff` |
| text.secondary | `color-mix(midground, background ~25%)` *(derived)* | `#a3b6c6` |
| text.muted | `color-mix(midground, background ~45%)` *(derived)* | `#798898` |
| text.link | brightened marketing brand blue *(derived)* | `#7fc5ec` |
| border.subtle | `color-mix(background, midground ~18%)` *(derived)* | `#2b3343` |
| border.strong | `color-mix(background, midground ~28%)` *(derived)* | `#3c4658` |
| border.interactive / focus | Hermes accent (`palette.midground`) | `#d8f0ff` |
| action.primary | Hermes accent (`palette.midground`) | `#d8f0ff` |
| action.primaryText | Hermes `palette.background` (dark on ice) | `#05091a` |
| action.danger / feedback.error | shadcn `destructive` (AA-tuned on dark) *(derived)* | `#f0616d` |
| feedback.warning / amber | Hermes `warmGlow` `rgba(255,199,55,.24)` base | `#ffc737` |
| feedback.success | terminal green, AA on dark *(derived)* | `#3fb950` |
| feedback.info | lighter marketing brand blue *(derived)* | `#4d9fd6` |
| brand blue (data, marketing) | `--e-global-color-primary` | `#0171a9` |
| brand blue mid (data) | `--e-global-color-060187c` | `#276285` |
| dark teal (data) | `--e-global-color-d95b8fd` | `#013b4f` |
| vivid indigo (data) | `--e-global-color-3fbfbb5` | `#3430f7` |
| pale blue-grey | `--e-global-color-2d36193` | `#dae3e8` |
| foreground highlight | Hermes `palette.foreground` | `#ffffff` |

### À confirmer (derived / not directly measured)

- **All shadcn surface/border/muted hexes** (`surface.subtle #161c2c`,
  `surface.raised #1e2536`, `border.subtle #2b3343`, `border.strong #3c4658`,
  `text.secondary #a3b6c6`, `text.muted #798898`): the Hermes dashboard builds
  these at runtime via CSS `color-mix()` from the `background ↔ midground`
  triplet, so the exact output hexes are not published. The values here are
  pre-blended approximations of the documented mix ratios.
- **`action.primaryHover #b9e0f5`**, **`text.link #7fc5ec`**: derived tints of
  the ice accent / brand blue (no measured hover/link hex).
- **`feedback.success #3fb950`, `feedback.error #f0616d`, `feedback.info
  #4d9fd6`**: Nous publishes only a shadcn `destructive` slot (no hex) and the
  amber warm-glow; these severity hues are tuned for AA legibility on the
  `#05091a` stage.
- **`data.category7 #7fc5ec`, `data.category8 #9a6cff`**: there is no published
  Nous 8-step data-vis scale; categories 1–6 use measured Nous blues + the amber
  warm-glow, 7–8 are derived tints/violet to complete the sequence.
- **Radius ramp (`md 4px`, etc.)**: Hermes exposes a `--radius` override but
  publishes no measured value; the crisp ramp reflects the terminal/monospace
  identity (à confirmer).
- **Density / base type (15px), spacing, motion, shadows, z**: shadcn-typical /
  Sentropic-base values; Hermes exposes `baseSize` (14/15/16) and `--spacing-mul`
  but no fixed measured base.
- **`focus` ring width/offset, `disabledOpacity 0.5`**: shadcn-default
  conventions (`focus-visible:ring-2 … ring-offset-2`), exact px not isolated.

## Typography

- **Monospace (the brand voice)** — `'Share Tech Mono'` (Hermes dashboard
  `fontMono`), with `'Courier Prime'` (the marketing site's loaded mono webfont)
  and `ui-monospace`/system mono as fallbacks. Used for `font.mono` **and** for
  the `typography.control / field / label` roles — a full terminal type voice.
- **Display (retro)** — `'PP Mondwest'` (the marketing kit display face, declared
  `font-family:"mondwest mike"`), a retro pixel face, with `'Share Tech Mono'`
  fallback → `font.display`.
- **Body (sans)** — `'Open Sans'` (marketing body webfont) + Helvetica/system →
  `font.sans`, reserved for long-form text.
- Font **names only**; no binaries shipped. (The Hermes demo theme example in the
  docs also showed an `Orbitron/Eurostile` `fontSans`, but that is a *user demo
  override*, not the Nous default, so it is intentionally **not** used here.)

## Signatures anatomiques

- **Stage**: a deep near-black navy (`#05091a` Hermes / `#010a26` marketing) —
  `mode: "dark"`.
- **Accent = ink**: the ice blue `#d8f0ff` is simultaneously the primary text and
  the interactive accent / focus ring / primary CTA fill (dark text on it) — a
  monochrome terminal read.
- **Warm-glow vignette**: `rgba(255,199,55,0.24)` is a page-background amber glow
  (no Sentropic token); its solid base `#ffc737` lives in `feedback.warning` and
  `data.category3`.
- **Field**: `style: "outline"` — a boxed dark input (`#161c2c`) with a 1px
  border and a crisp 4px radius; the ring/border turns ice on focus. Native
  `<select>` chevron redrawn as an ice (`#d8f0ff`) data-URI with a 2.25rem gutter.
- **Focus**: `strategy: "ring"`, 2px, 2px offset, ice `#d8f0ff` (shadcn
  `ring`/`ring-offset`).
- **Radius**: crisp/terminal — controls 4px, cards 8px, pills 999px.
- **Buttons**: primary = ice fill / dark text; secondary = transparent + 1px
  border, raised fill on hover (terminal ghost).
- **Tabs**: ice active label + ice bottom-border indicator on a transparent strip.
- **Pagination**: borderless ice links; active page = filled ice with dark text.

## Asset officiel

- The Nous Research wordmark / logo lives on the marketing site
  (https://nousresearch.com); the Hermes Agent brand lives at
  https://hermes-agent.nousresearch.com. **Do not redraw** — reuse the official
  asset when a chrome/logo is wired up separately by the orchestrator.
