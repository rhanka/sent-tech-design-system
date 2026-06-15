# BRP — measured-clone mapping

Faithful "measured-clone" of **BRP** (brp.com — Bombardier Recreational Products, Valcourt QC; the maker of Ski-Doo, Sea-Doo and Can-Am) mapped onto the Sentropic token structure.

**Scope / honesty.** Only BRP's **public CSS tokens** and **font family names** are reproduced — no font binaries, no proprietary assets. Every value below is MEASURED from the live `brp.com` Adobe Experience Manager ("nextgen") clientlib stylesheet, fetched via curl. The same sheet ships Bootstrap-default custom properties (`--blue:#007bff`, `--primary:#007bff`, `--teal:#20c997`…) which are framework noise and are **deliberately ignored**; the real BRP brand layer is the hand-authored high-frequency hexes and the `.btn` / `.form-control` / `header.next-gen` / `select` rules. Any value not directly measured is flagged **à confirmer** below.

## Sources
- `https://www.brp.com/en/` (and `/fr/`) — homepage HTML (AEM nextgen, Drupal-free; sticky white header).
- `https://www.brp.com/etc.clientlibs/nextgen/clientlibs/clientlib-corpo.lc-7a47483e018c645ee8ebbf8fd03e6559-lc.min.css` — **brand clientlib (1.48 MB), the source of truth** (`.btn`, `.form-control`, `header.next-gen`, `select`, brand hexes).
- `https://www.brp.com/etc.clientlibs/nextgen/clientlibs/clientlib-base.lc-…-lc.min.css` — base reset / layout.
- `https://use.typekit.net/xjw2jyf.css` — Adobe Fonts (Typekit) kit: the Trade Gothic Next family + Navigo / Industry / Neue Haas Unica.

## Colour mapping (measured → Sentropic role)
| Sentropic role | BRP source (measured) | Hex |
|---|---|---|
| `action.primary` | `.btn{background:#ffd200}` — THE BRP yellow CTA (×146) | `#ffd200` |
| `action.primaryText` | `.btn{color:#000}` — black text on yellow | `#000000` |
| `action.primaryHover` | measured gold accent (×45) | `#efba29` |
| `action.danger` / `feedback.error` | measured brand error red | `#d32f2f` |
| `text.primary` / ink | `.btn`/body ink — pure black | `#000000` |
| `text.secondary` / `muted` | measured olive-grey ink | `#585c57` |
| `border.subtle` | `.form-control{border-bottom:1px solid #b2b2b2}` field underline | `#b2b2b2` |
| `border.strong` | `select{border:1px solid #aeb5b4}` | `#aeb5b4` |
| `border.interactive` | brand-yellow accent | `#ffd200` |
| `surface.default` | `header.next-gen{background:#fff}` white chrome | `#ffffff` |
| `surface.subtle` | `body{background-color:#f0f0f0}` page canvas (×171) | `#f0f0f0` |
| `surface.raised` | `.form-control` fill / `.more-expand{background:#f9f9f9}` (×66) | `#f9f9f9` |
| `surface.inverse` | `--banner-bg-color:#2f2f2f` charcoal dark base | `#2f2f2f` |
| `field.fillBg` | `.form-control{background:#f9f9f9}` | `#f9f9f9` |
| `focus.color` | `.form-control:focus{border-bottom:2px solid #ffd200}` | `#ffd200` |
| `data.category4` / cool accent | measured teal accent | `#2cd5c4` |

### À confirmer (derived / not brand-published)
- **`feedback.success` `#2e7d32`** and **`feedback.warning` `#8a6d3b`** — BRP publishes no accessible green/amber; both derived to WCAG AA on white.
- **`feedback.info` `#2f2f2f`** — mapped to the brand charcoal dark base (no published info colour).
- **`color.cyan` ramp** (`#e6f7f5` / `#2cd5c4` / `#1aa392`) — only the mid teal `#2cd5c4` is measured; the lighter/darker steps are derived.
- **`color.blue` lightest `#f9f9f9`** and **darkest `#2f2f2f`** — BRP's primary action is the yellow, so the action scale is anchored on the measured yellow + grey/charcoal brackets.
- **`data.category*`** — assembled categorical scale seeded from measured brand hexes (BRP publishes no categorical list).
- **`disabledOpacity` 0.4**, **shadow `floating`**, **z-index roles** — not separately published; Sentropic defaults / measured shadow tones.
- **`spacing` step keys** — BRP uses a 10px rem root; measured paddings re-expressed on the Sentropic px-equivalent keys.

## Typography (font NAMES only, served via Typekit kit xjw2jyf)
- **Body / UI sans:** `Trade Gothic LT Pro` (×96) + `Trade Gothic LT Pro Condensed` (the dominant UI face, ×164). → `font.sans`, `typography.field`/`label`.
- **Display / CTA face:** `Trade Gothic Next LT Pro Heavy Condensed Italic` (×98) — heavy, condensed, italic. → `font.display`, `typography.control`.
- **Measured CTA label:** `.btn{font-family:Trade Gothic Next LT Pro Heavy Condensed Italic; font-weight:800; font-style:italic; text-transform:uppercase; letter-spacing:0}`.
- **Measured field text:** `.form-control{font-family:Trade Gothic LT Pro Condensed; font-weight:500; font-size:1.6rem; line-height:1.6}`.
- Mono: not part of BRP → Sentropic mono stack kept.

## Signatures anatomiques (measured)
- **Primary button:** `.btn{background:#ffd200; color:#000; border:none; border-radius:0; text-transform:uppercase; font-style:italic; font-weight:800; padding:1rem 3rem 1.2367rem}` → **SQUARE**, UPPERCASE, ITALIC, HEAVY-CONDENSED yellow block. (Component `button.radius` follows `radius.md` 4px = the top of the radius histogram / the secondary `.btn-secondary` radius.)
- **Secondary button:** `.btn-secondary{background:transparent; border:1px solid #000; border-radius:4px; color:#000}` → outlined.
- **Field:** `.form-control{background:#f9f9f9; border:none; border-bottom:1px solid #b2b2b2; border-radius:.6rem; border-bottom-left/right-radius:0}` → **filled-underline**, fill `#f9f9f9`, **top corners 6px / square bottom**, single grey bottom rule (rendered as a box-shadow inset, `underlineMode:"shadow"`).
- **Focus:** `.form-control:focus{background:#f9f9f9; border-bottom:2px solid #ffd200}` → bottom rule shifts to **brand yellow 2px**; native outlines suppressed (`outline-style:none`). Encoded as `focus.strategy:"inset"`, `width:2px`, `color:#ffd200`.
- **Select chevron:** `select{appearance:none; background-image:<grey #4F5555 arrow data-URI>; border:1px solid #aeb5b4; padding-right gutter ≈22px}` → redrawn grey chevron, `selectAppearance:"none"`, `selectPaddingRight:2.75rem`.
- **Link:** black `#000`, underlined at rest (`text-decoration-line:underline`), with the signature **yellow gradient swipe** on hover (`.btn.link{background:linear-gradient(270deg,transparent 50%,#ffd200 0)}`).
- **Tabs / accent:** active = black bold label + brand-yellow bottom indicator (`border-bottom:2px solid #ffd200`).
- **Radius:** square primary CTA (0); 4px chips/secondary; 6px field top corners. **Mode: light** (white `header.next-gen`, `#f0f0f0` body canvas).
- **Transition:** `.btn.link{transition:all .3s ease}`; panels `.5s ease`.

## Asset officiel
- BRP wordmark / Ski-Doo·Sea-Doo·Can-Am brand marks: use the official assets from brp.com — **do not redraw**. (Chrome/logo work is out of scope for this token package.)
