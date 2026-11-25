# /dev/mtl → Sentropic mapping (v0 light)

This package maps the owner's `/dev/mtl` keynote deck stylesheet onto the Sentropic token structure (`TenantTheme`). Only measured CSS tokens and font *names* (`"Inter Variable"`, `Inter`) are referenced — no font binaries, no logo images, and no third-party trademark assets.

## Sources
- Local keynote deck stylesheet (read-only): `/home/antoinefa/src/dev-mtl/deck/deck.css`

## Colour mapping

| Sentropic role | `/dev/mtl` source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.strong` / `border.interactive` / `surface.inverse` / `buttonSecondary.border` / `buttonSecondary.text` / `tabs.activeText` / `pagination.activeBackground` / `badge.infoBackground` | `--navy` (`deck.css:1`, `button`, `button.pri`) | `#01055e` |
| `action.primaryHover` / `text.muted` dark anchor / `slate.90` | `--ink` (`deck.css:1`, `#tr .ink`) | `#0b0d32` |
| `focus.color` / `cyan.50` / `data.category2` | `--orange` (`deck.css:1`, `button:focus-visible`) | `#e87432` |
| `data.category4` | `--orange-l` (`deck.css:1`, `.hi.on::after`, `.hd-prog i`) | `#ff9b62` |
| `border.subtle` / `slate.20` | `--line` (`deck.css:1`, `#panel header`, `.run`, `.it`) | `#d6d9ea` |
| `surface.subtle` / `action.secondaryHover` / `buttonSecondary.hoverBackground` / `card.hoverBackground` / `tag.neutralBackground` | `--soft` (`deck.css:1`, `button:hover`, `.run>.h`) | `#f3f4fb` |
| `surface.default` / `surface.raised` / `action.primaryText` / `action.secondary` / `buttonSecondary.background` / `field.fillBg` / `text.inverse` | `--bg` (`deck.css:1`, `button`, `#stage`) | `#ffffff` |
| `text.primary` / `choice.labelColor` / `toggle.textColor` / `breadcrumb.currentText` | `--fg` (`deck.css:1`, `html,body`) | `#1f2437` |
| `text.secondary` / `breadcrumb.text` | `#msg` (`#445` in `deck.css:33`) | `#444455` |
| `text.muted` / `breadcrumb.separator` | `.tg .tl`, `.tp-sound` (`deck.css:65,69`) | `#6b7280` |
| `feedback.info` / `status.processing` / `data.category3` | `.hi.more` (`deck.css:59`) | `#4a4f8f` *(à confirmer)* |
| `cyan.70` / `data.category6` | `.tp-play:hover` (`deck.css:68`) | `#d4621f` *(à confirmer)* |
| `cyan.10` | `.it.cur` (`deck.css:31`) | `#fff3ea` *(à confirmer)* |
| `surface.overlay` | derived from `--ink` `#0b0d32` at 55% | `rgb(11 13 50 / 0.55)` *(à confirmer)* |
| `feedback.success` / `status.completed` / `data.category5` | derived WCAG AA green | `#15803d` *(à confirmer)* |
| `feedback.warning` / `status.pending` | derived WCAG AA amber | `#b45309` *(à confirmer)* |
| `action.danger` / `feedback.error` / `status.failed` / `data.category8` | derived WCAG AA red | `#dc2626` *(à confirmer)* |

## À confirmer
- **System / feedback colours**: `deck/deck.css` does not define success/warning/error status tokens; `#15803d`, `#b45309`, `#dc2626`, and `feedback.info` (`#4a4f8f`) are derived to clear WCAG AA (≥ 4.5:1) on `#ffffff`, and `surface.overlay` (`rgb(11 13 50 / 0.55)`) is derived from `--ink`.
- **`action.primaryHover`**: `#0b0d32` (`--ink`) is chosen as the darkened hover shade for `--navy` `#01055e` (not separately specified in `deck.css`).
- **Dark mode & component refinements**: deferred to a follow-up after v0 light.
- **Monospace font**: `'SFMono-Regular', Consolas, 'Liberation Mono', monospace` is not declared in `deck.css` (kept aligned with the Sentropic system mono stack).
- **Spacing, z-index, `density.sm` / `density.lg`, and `data.*` categorical palette**: `deck.css` does not specify an 8-hue chart scale or sm/lg control sizes; `data.*` combines `--navy`, `--orange`, `--orange-l`, `.hi.more`, `.tp-play:hover`, and status hues.
- **Hand-drawn border signature**: slide frames use thick navy hand-drawn borders with slightly irregular corners and orange accents; standard `createComponent` CSS variables expose `borderWidth.thin` (`1.5px`) and `borderWidth.thick` (`2px`), while custom irregular-corner SVG/path framing belongs in component refinements after v0.

## Typography
- **Body, controls, fields, display** (`font.sans`, `font.display`, `typography.control`, `typography.field`, `typography.label`): `'Inter Variable', Inter, system-ui, sans-serif` (`deck.css:2,37,92`), base `15px` (`0.9375rem`), line-height `1.4`, semibold `650` on active/header labels.
- **Monospace** (`font.mono`): system monospace stack (*à confirmer*).

## Signatures anatomiques
- **Buttons**: `1.5px` solid `#01055e` border, `8px` (`0.5rem`) radius, `padding: 4px 10px` (`0.25rem 0.625rem`); secondary/default = `#01055e` text on `#ffffff`, hover = `#f3f4fb` (`--soft`); primary = `#01055e` fill with `#ffffff` text.
- **Focus**: `focus.strategy = "outline"`, `3px` solid `#e87432` (`--orange`), `1px` offset (`button:focus-visible` in `deck.css:19`).
- **Fields**: `field.style = "outline"` (`#ffffff` fill, `1.5px` border, `8px` radius, native `<select>` chevron redrawn in `#01055e`).
- **Cards**: `1.5px` border (`#d6d9ea`), `10px` (`0.625rem`) radius, `#f3f4fb` hover background.
- **Visual signature**: thick navy hand-drawn borders with slightly irregular corners, orange accents (`#e87432` / `#ff9b62`), and text mark `/dev/mtl` (text only, no SVG/raster trademark artwork).

## Asset officiel
- Text logo `/dev/mtl` only; no logo image or third-party trademark asset is copied or shipped in this package.
