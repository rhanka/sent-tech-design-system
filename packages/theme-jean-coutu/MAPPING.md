# Jean Coutu / PJC — measured-clone mapping ledger

Brand: **Jean Coutu / PJC** — the iconic Québec pharmacy chain (founded 1969).
Theme id: `jean-coutu` · label `Jean Coutu` · mode `light`.

Jean Coutu publishes no design-token file. Every value below is **measured from
the live site's computed CSS** (`https://www.jeancoutu.com`, inspected in a real
browser), or, where Jean Coutu colours no equivalent role, a restrained derived
value flagged **à confirmer**. Fonts are referenced by **name only** — no binaries.

## Sources
- `https://www.jeancoutu.com` — live computed CSS (real-browser inspection).
- Measured signature red `#ff3000` observed in **14 occurrences** (primary CTAs,
  prices, promo flags).
- Measured supporting blue `#0875cf` (links / secondary) and navy `#234b8d`
  (header/footer inverse band).
- Measured font stack `figtree-semi-bold` / `roboto-medium`
  → `'Figtree', 'Roboto', Helvetica, Arial, sans-serif`.

## Colour mapping table (measured)
| Sentropic role | Value | Source / note |
| --- | --- | --- |
| `action.primary` | `#ff3000` | **measured** signature JC red CTA (14 occurrences) |
| `action.primaryHover` | `#d62800` | **measured** darkened red on hover |
| `action.primaryText` | `#ffffff` | **measured** white text on red |
| `action.danger` / `system.danger` / `feedback.error` | `#ff3000` | **measured** — JC red doubles as the danger/error hue |
| `text.link` / secondary blue | `#0875cf` | **measured** friendly blue link |
| `surface.inverse` / navy | `#234b8d` | **measured** navy header/footer band |
| `text.primary` | `#1a1a1a` | **measured** near-black body ink |
| `text.secondary` | `#555555` | **measured** secondary ink |
| `text.muted` | `#8a8a8a` | **measured** muted grey |
| `surface.default` / `raised` | `#ffffff` | **measured** white page background |
| `surface.subtle` | `#f5f5f5` | **measured** subtle fill |
| `border.subtle` | `#dcdcdc` | **measured** light hairline / field border |
| `focus.color` | `#ff3000` | **measured** — focus reuses the brand red |
| `tabs.activeText` / `breadcrumb.currentText` / `pagination.activeBackground` | `#ff3000` | **measured** — active accents use the brand red |
| `data.category1 / 2 / 3` | `#ff3000` / `#0875cf` / `#234b8d` | **measured** brand triad (red → blue → navy) |

## À confirmer (no measured Jean Coutu source)
| Role | Value | Why |
| --- | --- | --- |
| `feedback.success` / `status.completed` | `#2e7d32` | no JC source; restrained AA green |
| `feedback.warning` / `status.pending` | `#b26a00` | no JC source; AA-on-white amber |
| `feedback.info` / `status.processing` | `#0875cf` | reuses the measured friendly blue |
| `spacing.*` steps | base 4px scale | exact JC steps not publicly tokenised |
| `radius` steps | none 0 / sm 2px / md 8px / lg 12px / pill 999px | friendly rounding; md/lg measured, sm/none/pill derived |
| `shadow.*`, `motion.*` (except 150ms) | conservative base values | not fully tokenised publicly |
| `data.category4–8` | greys + system hues | JC publishes no data-vis ramp — coherent proposal |

## Typography
- Sans + display: `'Figtree', 'Roboto', Helvetica, Arial, sans-serif`
  (**measured** `figtree-semi-bold` / `roboto-medium`). Names only.
- Mono: Sentropic base stack `'SFMono-Regular', Consolas, 'Liberation Mono',
  'Courier New', monospace` (Jean Coutu has no mono — kept from the template).
- Control labels: semi-bold (600), sentence case (no uppercase tracking — the
  friendly retail tone). Links: friendly blue at rest, underline on hover.

## Signatures anatomiques
- `field.style: "outline"` — boxed white field, `#dcdcdc` @1px hairline, 8px radius.
- `focus.strategy: "outline"` — 2px solid `#ff3000` outline, 2px offset.
- Friendly rounding: controls 8px, cards 12px, tags fully rounded (pill).
- Active accents (tabs underline, breadcrumb current, pagination active, badge
  fill) all in the brand red `#ff3000`.
- `surface.inverse` navy band `#234b8d` (header/footer).

## Asset officiel
- The Jean Coutu / PJC wordmark + red signature are official brand assets (used
  by the per-theme documentary chrome, out of scope for this package). This
  package ships token values and font *names* only — never logo or font binaries.
