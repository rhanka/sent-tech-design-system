# Van Houtte — provenance ledger (`@sentropic/design-system-theme-van-houtte`)

Faithful "measured-clone" theme for **Van Houtte** (vanhoutte.com — iconic Québec
coffee roaster, founded by Albert-Louis Van Houtte in 1919).

## Sources

- **Brand site:** https://www.vanhoutte.com — **JS-rendered**; the computed CSS
  is not statically scrapable, so token values below could NOT be measured off a
  live stylesheet.
- **Identity basis:** Van Houtte's well-known coffee-house brand identity — a deep
  roasted maroon-red CTA on a warm coffee-cream canvas, with a discreet gold
  accent. Reconstructed from the public brand, **not** a measured stylesheet.
- Consequently almost every value here is **à confirmer** (see below).

## Colour mapping table

| Sentropic role                  | Value     | Source / rationale                                  |
| ------------------------------- | --------- | --------------------------------------------------- |
| `action.primary`                | `#9e1b32` | Van Houtte roasted maroon-red CTA (brand-known)     |
| `action.primaryHover`           | `#7d1527` | darker pressed/hover maroon                         |
| `action.primaryText`            | `#ffffff` | white text on maroon                                |
| `text.primary`                  | `#1a1a1a` | near-black body text                                |
| `text.secondary`                | `#5a5550` | warm taupe-grey secondary text                      |
| `text.muted`                    | `#8a8278` | warm muted taupe (à confirmer)                      |
| `surface.default`               | `#ffffff` | page background                                     |
| `surface.subtle`                | `#f6f0e8` | warm coffee-cream fill (brand signature warm tone)  |
| `surface.inverse`               | `#1a1a1a` | near-black inverse band / footer                    |
| `border.subtle`                 | `#e6ddd2` | warm cream-taupe hairline                           |
| `text.muted` / `border.strong`  | `#8a8278` / `#5a5550` | warm muted / strong warm border         |
| gold accent (`data.category2`)  | `#c8a45c` | discreet brand gold highlight                       |
| `action.danger` / `system.danger` | `#c0392b` | warm error red                                    |
| `feedback.success`              | `#2e7d32` | restrained green — no Van Houtte source             |
| `feedback.warning`              | `#b26a00` | dark amber, AA on white — no Van Houtte source      |
| `feedback.info`                 | `#5a5550` | warm ink (Van Houtte uses no blue)                  |

## À confirmer

- The whole palette is reconstructed from the **public brand identity**, not a
  measured live stylesheet (vanhoutte.com is JS-rendered). All hexes are
  brand-known approximations pending a real DevTools/computed-CSS measurement.
- `font`: `'Inter', Helvetica, Arial, sans-serif` is a **reconstruction** — the
  exact webfont could not be read off the JS-rendered site. Mono stack kept from
  the Sentropic base (Van Houtte ships no mono).
- Spacing, shadow, motion, density, and all anatomy primitives are aligned with
  the Sentropic base scale — Van Houtte's exact steps are not publicly tokenised.
- `radius`: warm/friendly steps (none 0, sm 2px, md 4px, lg 8px, pill 999px) are
  brand-feel approximations.
- The data-vis categorical scale is a coherent **warm proposal** (maroon + gold +
  warm greys + restrained system hues), not an official Van Houtte scale.

## Typography

- **Sans / display:** `'Inter', Helvetica, Arial, sans-serif` (à confirmer).
- **Mono:** Sentropic base mono stack (Van Houtte has no mono).
- Names only — no font binaries are vendored.

## Signatures anatomiques

- `field.style: "outline"` — boxed white fields with a thin warm hairline (#e6ddd2).
- `focus.strategy: "outline"` — 2px outline in the brand maroon (#9e1b32).
- Active indicators (tabs / pagination / breadcrumb) use the brand maroon (#9e1b32);
  pagination active page is a filled maroon box with white text.
- Warm coffee-cream (#f6f0e8) used for `surface.subtle`, secondary buttons, card
  hover, tag and neutral chips.
- Gentle friendly rounding (2/4/8px); warm-tinted ink scale rather than cool grey.

## Asset officiel

- Logo/wordmark NOT vendored. Only font *names* are referenced; no binaries.
