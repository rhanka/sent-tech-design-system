# Poe (by Quora) → Sentropic mapping

This package maps the **public, live** Poe design language onto the Sentropic
token structure (`TenantTheme`). Every value is **measured** from the `--pdl-*`
("Poe Design Language") CSS custom properties Poe serves on
[poe.com](https://poe.com/), captured from the rendered `:root` of the login
surface. Only public token values and font *names* are referenced — Poe ships no
webfont binary (it uses the native system-ui stack).

## Sources
- Live `--pdl-*` / `--text-*` CSS custom properties read from `getComputedStyle`
  on `https://poe.com/login` (`:root`), plus measured computed styles of the
  rendered buttons and input. Captured 2026-06.
- Poe rebrand context (purple-to-pink brand identity, "Poe Design Language") —
  Quora Design, https://quoradesign.quora.com/Poe-rebrand and brand coverage on
  https://1000logos.net/poe-chatbot-logo/.

## Colour mapping

| Sentropic role | Poe token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / accent | `--pdl-accent-base` / `--pdl-comp-button-theme-primary-bg` | `#5d5cde` |
| `action.primaryHover` / `text.link` | `--pdl-accent-emphasis` / `--pdl-comp-button-theme-primary-hover-bg` / `--pdl-link-theme-primary-default-fg` | `#413fa9` |
| accent bold | `--pdl-accent-bold` | `#333180` |
| accent muted (data) | `--pdl-accent-muted` | `#8f97ed` |
| accent subtle | `--pdl-accent-subtle` | `#d7dbf4` |
| accent faint (`blue.10`) | `--pdl-accent-faint` | `#e4e7f9` |
| `text.primary` / `surface.inverse` | `--pdl-fg-base` / `--pdl-bg-reverse` | `#0d0d0d` |
| `text.secondary` / `focus.color` | `--pdl-fg-muted` / `--pdl-border-bold` | `#505157` |
| `text.muted` / placeholder | `--pdl-fg-subtle` / `--pdl-action-default-fg-placeholder` | `#616165` |
| disabled fg / `bg-emphasis` | `--pdl-action-disabled-fg` / `--pdl-bg-emphasis` | `#88898e` |
| `border.strong` | `--pdl-border-emphasis` | `#bbbcc1` |
| input border | `--pdl-action-default-border` | `#cccdd1` |
| `border.subtle` / `surface` secondary btn | `--pdl-border-base` / `--pdl-bg-muted` | `#e3e3e7` |
| `action.secondaryHover` / `bg-subtle` | `--pdl-bg-subtle` / `--pdl-comp-button-theme-secondary-hover-bg` | `#eaeaee` |
| `surface.subtle` / card hover | `--pdl-bg-faint` | `#f6f6f8` |
| `surface.default` / `surface.raised` | `--pdl-bg-base` | `#ffffff` |
| `action.danger` / `feedback.error` | `--pdl-action-error-border` | `#d00e49` |
| error text | `--pdl-fg-error` | `#bb0541` |
| `feedback.success` | `--pdl-fg-success` | `#26a682` |
| success bright (data/cyan) | measured raw success | `#1dddae` |
| `feedback.warning` | `--pdl-fg-warning` | `#ce8c16` |
| warning base (data) | `--pdl-warning-base` | `#f2c110` |
| `feedback.info` | `--pdl-fg-info` | `#1254d6` |
| feature magenta (data) | `--pdl-fg-feature` | `#ce40db` |

### "À confirmer" (derived / not directly measured)
- `cyan.10` `#d7f5e9` — light teal tint derived around Poe's success teal
  `#1dddae` (Poe has no cyan family; the Sentropic cyan accent slot is mapped to
  the measured teal/success family).
- `data.*` — the 8-colour categorical sequence is a coherent proposal built from
  the measured Poe accent + system colours, not an official Poe data-vis scale.
- `shadow.*` — soft neutral elevation approximating Poe's surfaces; exact box
  specs not re-measured.
- `motion.*` — kept aligned with the Sentropic base; Poe durations/easing not
  measured.
- `tabs.*`, `pagination.*`, `breadcrumb.*` — Poe ships these components but they
  were not present on the measured login surface; values follow Poe's accent +
  neutral signatures (violet active/links, filled-violet active page) and are
  approximate.
- `typography.link` underline behaviour — modelled as no underline at rest,
  underline on hover; not directly measured.
- `disabledOpacity` `0.5` — derived from the measured
  `--pdl-comp-button-theme-primary-disabled-fg: #ffffff80` (50% white).

## Typography
- **All UI text** (`font.sans`, `font.display`, `typography.field`): the native
  system stack `-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
  Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`
  (`--pdl-font-families-body-*`). Headings use the same stack at weight **700**;
  controls/labels at weight **600** (semibold).
- **Monospace** (`font.mono`): `SFMono-Regular, Consolas, monaco, monospace`
  (`--pdl-font-family-mono`).
- Poe ships **no webfont** — only the native system stacks are referenced.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#cccdd1` border, **8px** radius; `--pdl-comp-text-input-border-radius:
  .5rem`). Not a filled-underline.
- **Radius**: inputs/dropdowns/chips `md = 8px` (`.5rem`), cards/modals/message
  bubbles `lg = 12px` (`.75rem`), and **buttons are FULL PILLS** `pill = 9999px`
  (`--pdl-comp-button-border-radius`) — the signature Poe shape; tags `sm = 4px`.
- **Focus**: `focus.strategy = "double"` — a **neutral grey** double ring (white
  inner halo + grey outer), measured `--pdl-action-focus-ring-primary-outer:
  0 0 0 1px #fff, 0 0 0 2px #505157`. Notably NOT the accent violet.
- **Buttons**: primary = solid Poe violet `#5d5cde` (hover `#413fa9`, white
  semibold label); secondary = **filled light grey** `#e3e3e7` (hover `#eaeaee`,
  `#0d0d0d` label); OAuth/outline buttons = white fill + `#cccdd1` border. All
  pill-shaped, ~40px tall (md), 16px horizontal padding, 16px semibold label.
- **Checkbox/switch**: checked = Poe violet `#5d5cde`
  (`--pdl-action-checked-bg/-border`); switch track is a pill (`9999px`).
- **Chevron (native `<select>`)**: redrawn as a neutral grey `#505157` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: control md ≈ 40px height, 16px horizontal padding; labels/controls
  semibold (600).
- **Palette character**: a single violet `#5d5cde` accent on a near-monochrome
  neutral grey scale (`#0d0d0d` → `#ffffff`); the brand's purple→pink gradient is
  reserved for the logo, not the UI chrome.

## Asset officiel
- The Poe speech-bubble mark and the purple→pink gradient are official Quora/Poe
  brand assets — reference them, do not redraw. Poe chrome should use the genuine
  Poe wordmark / bubble glyph, not a hand-drawn approximation.
