# xAI (Grok) → Sentropic mapping

This package maps xAI's **public website design tokens** (as shipped on
[x.ai](https://x.ai/) and cross-checked on [grok.com](https://grok.com/)) onto the
Sentropic token structure (`TenantTheme`). Only the public CSS custom properties
(the Tailwind HSL palette in `:root` / `.dark`) and font *names* are referenced —
no font binaries. xAI's brand typeface ("Universal Sans") and Grok's UI font
("Vazirmatn") are proprietary; we reference their family names only.

This is a **DARK-FIRST** clone (`mode: "dark"`): the iconic xAI/Grok stage is a
near-black, ultra-minimal, high-contrast monochrome with a single vivid orange
accent and an inverted **white** primary button.

## Sources
- **x.ai design tokens** — measured directly from the site CSS chunks
  (`x.ai/_next/static/chunks/*.css`), `:root` (light) and `.dark` blocks:
  `--color-jet 0 0% 4%`, `--color-charcoal 0 0% 10%`, `--color-umbra 221 12% 14%`,
  `--color-ink 213 11% 16%`, `--color-steel 216 4% 22%`, `--color-fog 216 4% 51%`,
  `--color-pewter 213 12% 70%`, `--color-dove 222 19% 86%`, `--color-ivory 40 18% 97%`,
  `--color-white 0 0% 100%`, `--color-sunset 22 100% 51.6%`, `--color-dawn 37 100% 76%`,
  `--color-breeze 214 48.9% 73.9%`, `--color-twilight 255 92% 76%`,
  `--color-dusk 263 70% 50.4%`; semantic aliases `--primary`, `--accent`,
  `--background`, `--foreground`, `--card`, `--border`, `--input`;
  `--success/--warning/--error` (light + `.dark`); `--radius .5rem` / `16px` / `24px`;
  fonts `--font-universal-sans "universalSans"`, `--font-universal-sans-display
  "universalSansDisplay"`, `--font-geist-mono "GeistMono"`.
- **grok.com** — cross-check: app surfaces `#1e1f22` (dark) / `#f9f8f7` (light, ≈
  ivory), UI font `--font-vazirmatn` ("Vazirmatn").
- **xAI brand guidelines** — https://x.ai/legal/brand-guidelines (monochrome
  black/white identity; geometric custom logo letterforms).
- HSL→hex conversions of the above triples are exact (computed); see the inline
  reference table in `src/index.ts`.

## Colour mapping

| Sentropic role | xAI token | Value |
|---|---|---|
| `surface.default` | `--background` dark = `--color-jet` | `#0a0a0a` |
| `surface.subtle` / `border.subtle` / `field.fillBg` | `--background-hover` / `--border` dark = `--color-umbra` | `#1f2228` |
| `surface.raised` / `card` / `alert` fill | `--card` dark = `--color-charcoal` | `#1a1a1a` |
| `surface.inverse` / `action.primaryHover` | `--color-ivory` (`--card` light) | `#f9f8f6` |
| `text.primary` | `--foreground` dark = `--color-dove` | `#d5d9e2` |
| `text.secondary` / pagination link | `--color-pewter` | `#a9b2bc` |
| `text.muted` / `border.strong` | `--input` dark = `--color-fog` | `#7d8187` |
| `text.inverse` / `primaryText` / pagination active text | `--color-jet` | `#0a0a0a` |
| `text.link` / `feedback.info` | `--info` = `--color-breeze` | `#9cb8dd` |
| `action.primary` / `border.interactive` / focus / tabs active / badge / pagination active | `--primary` dark = `--color-white` | `#ffffff` |
| `action.secondaryHover` / `buttonSecondary.border` | `--color-steel` | `#36383a` |
| accent (Sentropic `cyan.50`) | `--accent` = `--color-sunset` | `#ff6308` |
| `cyan.10` (accent hover) | `--accent-hover` = `--color-dawn` | `#ffd085` |
| `feedback.success` (dark) | `--success` `.dark` | `#4ade80` |
| `feedback.warning` (dark) | `--warning` `.dark` | `#f8c630` |
| `feedback.error` / `action.danger` (dark) | `--error` `.dark` | `#e66565` |
| `blue.60` (interactive blue) | `--terminal-blue` dark | `#93adff` |
| `blue.80` | `--terminal-blue` light (bright) | `#2365d1` |
| data purple | `--color-twilight` / `--color-dusk` | `#a689fa` / `#6c28d9` |

## À confirmer (derived / not a direct public token)
- `cyan.70` `#cc4e06` — a darker sunset for the accent-70 step; derived from
  `--color-sunset` `#ff6308` (x.ai ships no darker-orange token).
- `mode: "dark"` choice — x.ai's *default* `:root` is a **light/cream** palette
  (background white, card ivory `#f9f8f6`, foreground jet); the `.dark` block (used
  here) is the secondary skin. Grok's app, however, defaults to dark (`#1e1f22`),
  and the monochrome-black identity is the brand's most recognisable signature, so
  this clone is dark-first. A light variant is fully measurable from `:root` if needed.
- `feedback.*` use x.ai's measured **dark-mode** system values (lightened for
  legibility on the near-black stage); they are not re-checked for WCAG AA on a
  light background.
- `text.link` / `border.interactive` — xAI is monochrome-interactive; the primary
  action and focus are white/foreground and links use the soft `--info` breeze blue.
  The orange `--accent` is reserved for highlights and data-vis (not structural).
- `shadow.*`, `motion.normal/slow`, `z.*`, `spacing.*` — approximate / aligned with
  the Sentropic base; x.ai uses ~90ms linear micro-transitions (`motion.fast`) but
  does not publish a full elevation/duration scale.
- `density.*`, control `radius.md` (12px), button/tab/tag metrics — read from the
  rounded, pill-friendly x.ai/Grok controls; exact px not all tokenised publicly.
- The 8-colour categorical `data.*` palette — a coherent proposal from the measured
  xAI accents + neutrals, not an official sequential data-vis scale.

## Typography
- **UI / display** (`font.sans`, `font.display`, `typography.control/field/label`):
  `'universalSans'` / `'universalSansDisplay'` — xAI's custom **Universal Sans**
  brand typeface (`--font-universal-sans` / `--font-universal-sans-display`), with
  `'Vazirmatn'` (grok.com's `--font-vazirmatn`) then `system-ui` as fallbacks.
- **Monospace** (`font.mono`): `'Geist Mono'` / `GeistMono` (`--font-geist-mono`).
- Links are **not** underlined at rest (foreground / cool-blue text); underline
  appears on hover.

## Signatures anatomiques
- **Stage**: dark-first, near-black monochrome — `surface.default` jet `#0a0a0a`,
  card charcoal `#1a1a1a`, hover/subtle umbra `#1f2228`; text off-white dove `#d5d9e2`.
- **Primary button**: the iconic **inverted white** button — `action.primary`
  `#ffffff` with jet `#0a0a0a` text, ivory `#f9f8f6` on hover. Secondary = a ghost
  button (transparent, 1px steel `#36383a` outline, charcoal fill on hover).
- **Accent**: a single vivid **sunset orange** `#ff6308` (mapped to the Sentropic
  `cyan` slot), used sparingly; `#ffd085` amber as the accent-hover.
- **Fields**: `field.style = "outline"` — boxed, recessed dark inputs (umbra
  `#1f2228` fill ≈ grok.com's `#1e1f22` prompt bar, 1px border, rounded `md`).
- **Radius**: generous rounding — base `--radius` `.5rem`; controls `md = 12px`,
  cards `lg = 16px` (measured `--radius: 16px`), chips/pill buttons `pill = 999px`.
- **Focus**: `focus.strategy = "ring"` — a soft monochrome **white** box-shadow ring
  (2px, offset 2px), not the orange accent and not a native offset outline.
- **Tabs**: active tab = monochrome white label with a bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless muted links; active page = filled white with jet text
  (mirrors the inverted primary).
- **Tag / chip**: pill-rounded (`999px`) subtle umbra chip; **badge** mirrors the
  monochrome primary (white fill, jet text).
- **Chevron (native `<select>`)**: redrawn as an off-white `#d5d9e2` arrow,
  `appearance: none`, 40px right gutter.
- **Alert / callout**: a tinted charcoal panel (no border, no left filet).

## Asset officiel
- The xAI logo (geometric "x·A·I" letterforms) and the Grok mark are official xAI
  brand assets — reference them from xAI's brand guidelines, do **not** redraw by
  hand. xAI/Grok chrome should use the official wordmark/symbol, not an approximation.
