# Agropur — measured-clone mapping (provenance ledger)

Theme package: `@sentropic/design-system-theme-agropur` (`id: "agropur"`, `mode: "light"`).
Every value below is **measured from Agropur's live public CSS** (agropur.com,
inspected in a real browser) unless flagged **à confirmer** (no measured source —
a coherent derived value honouring the brand's identity).

## Sources

- https://www.agropur.com — primary site (header navy band, footer, CTAs, forms).
- Live computed CSS inspected in a real browser (DevTools): button/CTA fills,
  text inks, hairline borders, accent colours, focus outline, radii.
- The brand "navy" `#162f53` is the dominant structural colour — measured at
  **61 occurrences** across the live stylesheet.

## Colour mapping table (measured)

| Role (Sentropic)                | Value      | Source / note                                            |
| ------------------------------- | ---------- | -------------------------------------------------------- |
| `action.primary`                | `#162f53`  | measured navy CTA (61 occ.) — structural base            |
| `action.primaryHover`           | `#0e2244`  | measured darker pressed/hover navy                       |
| `action.primaryText`            | `#ffffff`  | measured white text on navy CTA                           |
| accent — pink/magenta           | `#eb6888`  | measured warm pink accent → `data.category2`             |
| supporting blue                 | `#1997cc`  | measured bright blue → `data.category3`, `feedback.info` |
| magenta (strong)                | `#ca0f67`  | measured strong magenta highlight (raw palette)          |
| `text.primary`                  | `#1a1a1a`  | measured near-black body text                            |
| `text.secondary`                | `#6a6a76`  | measured rgb(106,106,118)                                |
| `text.muted`                    | `#8a90a0`  | measured cool blue-grey muted                            |
| `surface.inverse`               | `#162f53`  | measured navy band / inverse surface                     |
| `action.danger` / system danger | `#d72020`  | measured error red                                       |
| `surface.subtle`                | `#f3f5f8`  | measured cool light fill                                 |
| `border.subtle`                 | `#d6dbe4`  | measured cool light hairline                             |
| `surface.default` / white       | `#ffffff`  | page background                                          |

## À confirmer (no measured equivalent — derived)

- **Font face**: Agropur sets its UI in the proprietary geometric sans **"Maax"**.
  Maax is not freely distributable, so we substitute **"Inter"**
  (`'Inter', Helvetica, Arial, sans-serif`) as the closest open geometric humanist
  sans. **à confirmer** — Maax → Inter visual swap. `mono` keeps the Sentropic
  default stack (Agropur has no monospace identity).
- **feedback.success** `#2e7d32`, **feedback.warning** `#b26a00` — restrained,
  WCAG-AA-on-white system hues; Agropur publishes no success/warning colour.
- **feedback.info** `#1997cc` — reuses the measured supporting blue (legitimate).
- **spacing** steps — kept on the Sentropic 4px base; Agropur's raw spacing is not
  publicly tokenised.
- **shadow / motion** specs — restrained corporate defaults, cool-navy-tinted; not
  individually measured.
- **data-vis categories 4–8** — cool greys + system hues; not an official Agropur
  scale. Categories 1–3 are the measured brand trio (navy / pink / blue).

## Typography

- `sans` / `display`: `'Inter', Helvetica, Arial, sans-serif` (Maax substitute).
- `mono`: Sentropic default monospace stack.
- Control labels: mid-weight (600), **sentence case** (Agropur does not uppercase
  CTAs). Field/body text: regular weight, sentence case.

## Signatures anatomiques

- **field.style**: `"outline"` — boxed white field, cool `#d6dbe4` @1px hairline,
  6px radius. Native `<select>` chevron redrawn as a navy `#162f53` data-URI with a
  2.5rem right gutter (`selectAppearance: "none"`).
- **focus.strategy**: `"outline"` — 2px solid navy `#162f53`, 2px offset.
- **radius**: modern — `none 0`, `sm 2px`, `md 6px`, `lg 10px`, `pill 999px`.
- **tabs / pagination / breadcrumb** active = navy `#162f53` (underline indicator
  for tabs; filled navy box for the active pagination page; navy current page in
  breadcrumb).
- **secondary button** = cool-grey filled chip (`#f3f5f8` fill, `#d6dbe4` border).
- **inverse / overlay** = navy `#162f53` (overlay = navy @50%).

## Asset officiel

- Agropur wordmark + cooperative logo: official assets to be sourced from
  agropur.com brand resources for the per-theme docs chrome (handled separately by
  the orchestrator — this package ships tokens only, no binaries).
