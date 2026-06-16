# Lufa Farms — Sentropic theme mapping

Measured-clone provenance ledger for `@sentropic/design-system-theme-lufa-farms`.

## Sources

- **Brand site:** https://www.lufa.com — Montréal urban rooftop-greenhouse company
  and online grocery marketplace (founded 2009).
- **Caveat:** lufa.com is heavily **JS-rendered**; its computed CSS is not
  reliably scrapeable from a static fetch. The token values below are therefore
  **inferred from Lufa's fresh / organic brand identity** (a vivid leaf green on
  a clean white canvas) rather than measured from a stable stylesheet. Every
  value is consequently flagged **à confirmer** — confirm against the live
  computed CSS in a real browser before treating any value as canonical.
- **Fonts:** names only, never binaries. The interface reads as a clean humanist
  sans; mapped to `'Inter', Helvetica, Arial, sans-serif` (à confirmer). The mono
  stack is inherited from the Simons structural template (Lufa has no mono use).

## Colour mapping table

| Sentropic role                  | Value     | Lufa source (à confirmer)                          |
| ------------------------------- | --------- | -------------------------------------------------- |
| `action.primary`                | `#6cb33f` | Lufa leaf-green CTA (brand-inferred)               |
| `action.primaryHover`           | `#5a9633` | darker leaf green on hover                          |
| `action.primaryText`            | `#ffffff` | white text on leaf green                            |
| `action.danger` / `system.danger` | `#d72020` | sale / error red                                |
| `text.primary`                  | `#1a1a1a` | near-black body text                               |
| `text.secondary`                | `#555a52` | green-tinted secondary grey                        |
| `text.muted`                    | `#8a9384` | muted sage grey                                    |
| `text.link`                     | `#6cb33f` | leaf-green links                                   |
| `surface.default` / `raised`    | `#ffffff` | clean white canvas                                 |
| `surface.subtle`                | `#f4f7f1` | faint green-white fill                             |
| `surface.inverse`               | `#1a1a1a` | near-black inverse band                            |
| `border.subtle`                 | `#dce4d6` | soft green hairline                                |
| `border.strong`                 | `#8a9384` | muted sage border                                  |
| `border.interactive`            | `#6cb33f` | leaf-green focus / interactive                     |
| deep forest green (emphasis)    | `#2f5d1e` | deep green — emphasis / 2nd data category          |
| `data.category1`                | `#6cb33f` | leaf green                                         |
| `data.category2`                | `#2f5d1e` | deep forest green                                  |

## À confirmer

- **Everything is à confirmer** — see the Sources caveat: lufa.com is JS-rendered
  and these are brand-inferred, not measured. Confirm each hex against the live
  computed CSS.
- **`text.muted` `#8a9384`** — sage grey, inferred.
- **Feedback hues** — `warning #b26a00` and `info #2f5d1e` have no measured Lufa
  equivalent; `success #2f5d1e` reuses Lufa's forest green; `error #d72020` is the
  inferred sale/error red.
- **Spacing / shadow / motion / z** — not tokenised publicly; kept aligned with
  the Sentropic base scale.
- **Radius steps** — `sm 2px / md 8px / lg 12px` inferred from a fresh / friendly
  rounding read; confirm against live controls and cards.
- **Density / typography sizes** — control heights and font sizes inferred
  (~44px md touch target); confirm against measured controls.

## Typography

- **Sans / display:** `'Inter', Helvetica, Arial, sans-serif` (à confirmer —
  clean humanist sans read from the brand identity; JS-rendered site).
- **Mono:** `'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New',
  monospace` — inherited from the Simons template (Lufa has no mono use).
- **Casing:** CTAs and labels are sentence / title case (not tracked-uppercase).

## Signatures anatomiques

- **`field.style: "outline"`** — boxed white fields with a thin soft green-grey
  (`#dce4d6` @1px) hairline and a friendly 8px radius.
- **`focus.strategy: "outline"`** — a ~2px leaf-green (`#6cb33f`) outline at 2px
  offset.
- **Native `<select>` chevron** — redrawn as a leaf-green (`%236cb33f`) data-URI
  with `selectAppearance: "none"` and a 2.5rem right gutter.
- **Tabs / pagination / breadcrumb active** — leaf green `#6cb33f` (active tab
  bottom-border indicator; filled leaf-green active page; leaf-green current
  breadcrumb).
- **Rounding** — gentle / friendly: 8px controls, 12px cards.

## Asset officiel

- Logo / wordmark not bundled (names + tokens only, per skill rules). The Lufa
  Farms leaf-mark and wordmark live on lufa.com; reproduce pixel-perfect from the
  official asset if a chrome/header clone is later commissioned (not in scope for
  this theme package).
