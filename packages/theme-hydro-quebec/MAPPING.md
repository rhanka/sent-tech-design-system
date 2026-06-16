# Hydro-Québec — measured-clone mapping ledger

Brand: **Hydro-Québec** (hydroquebec.com) — Québec's public electric utility, an
iconic crown corporation. Theme id `hydro-quebec`, label `Hydro-Québec`, mode
`light`.

## Sources

- Live computed CSS from https://www.hydroquebec.com inspected in a real browser.
- Hydro-Québec publishes **no public design-token file**, so every colour below
  is **measured** from the rendered site, or flagged `à confirmer` where no
  measured equivalent exists.
- The site is JS-rendered; the typographic face is therefore `à confirmer`.

## Colour mapping table

| Sentropic role                | Value     | Provenance |
| ----------------------------- | --------- | ---------- |
| action.primary (CTA / brand)  | `#0f096c` | **measured** deep indigo — most frequent brand hue (14 occurrences) |
| action.primaryHover           | `#0a0650` | measured darker pressed/hover indigo step |
| action.primaryText            | `#ffffff` | measured white on indigo |
| accent (amber)                | `#ff9b00` | **measured** warm signature accent (→ `cyan.50`, `data.category2`) |
| link / functional blue        | `#104cce` | **measured** bright functional blue (→ `text.link`, `blue.60`) |
| text.primary                  | `#1a1a1a` | measured near-black body text |
| text.secondary                | `#555a66` | measured cool blue-grey secondary |
| text.muted / border.strong    | `#8a90a0` | measured cool muted grey |
| surface.subtle                | `#eef1f8` | measured pale blue-tinted fill |
| border.subtle / field border  | `#d3d9ea` | measured cool light hairline |
| surface.inverse               | `#0f096c` | measured deep-indigo band |
| action.danger / system.danger | `#d72020` | **measured** error/system red |
| focus.color                   | `#0f096c` | measured — focus outline strategy `outline`, 2px |
| field.style                   | outline   | measured boxed inputs, white fill + #d3d9ea hairline, 4px radius |
| tabs/pagination/breadcrumb active | `#0f096c` | measured indigo active state |

## À confirmer (no measured equivalent)

- `font.sans` / `font.display` = `'Inter', Helvetica, Arial, sans-serif` — the
  site is JS-rendered; exact face unverified. Measured fallback stack only.
- `system.success` = `#1f7a3d` — institutional green, no measured source.
- `system.warning` = `#ff9b00` — reuses the measured amber accent.
- `system.info` = `#104cce` — reuses the measured bright blue.
- Spacing / shadow / motion / density steps — not strongly tokenised publicly;
  aligned with the Sentropic base scale.
- `data.category6..8` — proposal beyond the three measured brand hues.
- `mono` stack — Hydro-Québec has no monospace identity; Sentropic stack kept.

## Typography

- Sans / display: `'Inter', Helvetica, Arial, sans-serif` (à confirmer — JS-rendered).
- Controls: mid-weight (600) sans, **sentence case** (institutional, not tracked
  uppercase). Mono: Sentropic stack (no brand mono).

## Signatures anatomiques

- **field.style** `outline` — boxed white inputs, #d3d9ea hairline, 4px radius;
  native `<select>` chevron redrawn as an indigo (#0f096c) data-URI.
- **focus.strategy** `outline` — 2px solid deep-indigo (#0f096c), 2px offset.
- **radius** institutional ladder: none 0 / sm 2px / md 4px / lg 8px / pill 999px.
- **tabs** indigo bottom-border indicator; **pagination/badge** filled-indigo
  active; **breadcrumb** indigo current page.
- **tags** full-pill; **link** functional bright blue with hover underline.

## Asset officiel

- Hydro-Québec wordmark / logo — not bundled (names/values only, no binaries).
