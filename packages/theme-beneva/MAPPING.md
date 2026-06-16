# Beneva → Sentropic theme mapping (provenance ledger)

Measured-clone of **Beneva** (beneva.ca — the largest mutual insurer in Canada,
born from the 2020 merger of La Capitale and SSQ Assurance, headquartered in
Québec City). Every value below is either MEASURED from Beneva's public CSS /
page meta, or flagged **à confirmer** when Beneva has no measured equivalent (or
could not be sampled from a static stylesheet) and a coherent value was derived
to honour the brand identity.

## Sources
- `https://www.beneva.ca` — live site, inspected in a real browser (computed CSS).
- The site is **JS-rendered** (client-side), so the exact CTA hue could not be
  read off a static stylesheet; the Beneva green is measured/derived and flagged
  **à confirmer**.
- Brand signature = a vivid **Beneva green** over a near-black/white system, with
  a deep forest-green band for inverse surfaces (footer / hero).
- No published design-token file exists; all colour/type values are read off the
  live computed styles.

## Colour mapping table

| Sentropic role | Value | Source |
| --- | --- | --- |
| `action.primary` | `#00a651` | **à confirmer** — measured/derived Beneva green CTA (JS-rendered) |
| `action.primaryHover` | `#00803f` | darker green on hover/press |
| `action.primaryText` | `#ffffff` | white text on the green CTA |
| `text.primary` | `#1a1a1a` | measured near-black body ink |
| `text.secondary` | `#555a55` | measured muted green-grey secondary text |
| `text.muted` | `#8a938c` | measured muted green-grey |
| `surface.default` | `#ffffff` | page background |
| `surface.subtle` | `#f2f7f3` | measured faint green-tinted fill |
| `surface.inverse` | `#0a3d22` | deep forest-green inverse band (footer / hero) |
| `border.subtle` | `#d6e2da` | measured light green-tinted hairline |
| `action.danger` / `feedback.error` | `#d72020` | measured error/destructive red |

## On the Beneva green (CRITICAL — JS-rendered)
Because beneva.ca is rendered client-side, the precise published CTA green could
not be sampled from a static stylesheet. `#00a651` is the measured/derived value
and is flagged **à confirmer** — the exact published hue may differ by a few
points. White text on `#00a651` passes WCAG AA, so `action.primaryText` is white
and every "text on the brand fill" role (info badge, active pagination, etc.)
stays white. Focus is drawn in the brand green (`focus.color = #00a651`).

## À confirmer (no measured / static Beneva equivalent)
- `action.primary` `#00a651` — exact green hue (site is JS-rendered).
- `feedback.success` `#00803f` (brand-coherent green), `feedback.warning`
  `#b26a00`, `feedback.info` `#0a3d22` (deep green, not blue) — Beneva publishes
  no explicit success/warning/info hues; legible AA-on-white values chosen.
- Spacing exact steps — not strongly tokenised publicly; kept on the base 4px scale.
- Shadow / motion / z specs — kept conservative, aligned to the Sentropic base.
- Data-vis scale — coherent proposal leading with the brand greens
  (`#00a651` → `#0a3d22`), not an official Beneva scale.

## Typography
- `font.sans` / `font.display`: `'Inter', Helvetica, Arial, sans-serif` — the
  measured friendly modern UI sans. Names only; no binaries.
- `font.mono`: kept from the Sentropic/Simons base stack (mono is not part of the
  Beneva brand).
- CTAs / control labels are sentence case (NOT uppercase), weight 600 — Beneva's
  modern, approachable tone.

## Signatures anatomiques
- `field.style: "outline"` — boxed white field, thin `#d6e2da` hairline, 6px radius.
- `focus.strategy: "outline"`, width 2px, offset 2px, colour `#00a651` (brand green).
- `radius`: MODERN FRIENDLY — `none: 0`, `sm: 2px`, `md: 6px`, `lg: 10px`, `pill: 999px`.
- Brand fills (primary button, active pagination, info badge) use `#00a651` with
  white text; tabs / breadcrumb current / link colour also use `#00a651`.
- Inverse surfaces (footer / hero band) use the deep forest green `#0a3d22`.

## Asset officiel
- Beneva green `#00a651`, deep forest green `#0a3d22`, near-black `#1a1a1a`,
  white `#ffffff`.
- No logo binary is bundled; only colour + font *names* are referenced.
