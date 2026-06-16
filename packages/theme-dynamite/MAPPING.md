# Dynamite — theme provenance (MAPPING.md)

Brand: **Dynamite** (Groupe Dynamite) — chic Montréal women's-fashion brand,
founded in Montréal in 1975. Site: https://www.dynamiteclothing.com

## Sources

- **Site (JS-rendered):** https://www.dynamiteclothing.com — the storefront is
  client-rendered (JS), so a static computed-CSS read was not possible. The token
  values below are **brand-inferred** from Dynamite's sophisticated, minimal
  women's-fashion identity (confident near-black on white with a single warm
  blush accent), **not measured** from a stylesheet. Every value is therefore
  flagged **à confirmer** — they should be re-measured against the live computed
  CSS in a real browser before being treated as authoritative.
- **Structural template:** `packages/theme-simons/` (file structure, anatomy
  primitives, `field.style: "outline"`, focus-outline strategy, mono stack).

## Colour mapping table (all à confirmer — brand-inferred)

| Role | Hex | Source / rationale |
| --- | --- | --- |
| action.primary (CTA fill) | `#1a1a1a` | confident near-black CTA — à confirmer |
| action.primaryHover | `#000000` | pure black hover deepen — à confirmer |
| action.primaryText | `#ffffff` | white on near-black |
| accent (blush rose) | `#b76e79` | the single warm accent — à confirmer |
| text.primary | `#1a1a1a` | confident near-black body text — à confirmer |
| text.secondary | `#555050` | warm grey secondary ink — à confirmer |
| text.muted | `#8a857f` | warm grey muted ink — à confirmer |
| surface.default | `#ffffff` | page background |
| surface.subtle | `#f7f3f1` | warm blush-neutral fill — à confirmer |
| surface.inverse | `#1a1a1a` | confident near-black inverse — à confirmer |
| border.subtle | `#e6e2df` | warm hairline — à confirmer |
| action.danger / system.danger | `#c0392b` | restrained brick red — à confirmer |
| feedback.success | `#2e7d32` | restrained green — à confirmer (no source) |
| feedback.warning | `#b26a00` | dark amber, AA on white — à confirmer (no source) |
| feedback.info | `#1a1a1a` | Dynamite would use near-black, not blue — à confirmer |

### Data-vis categorical scale (proposal, à confirmer)

`category1 #1a1a1a` (near-black) → `category2 #b76e79` (blush accent) →
`category3 #555050` → `category4 #8a857f` → `category5 #e6e2df` →
`category6 #c0392b` (danger) → `category7 #2e7d32` (success) →
`category8 #b26a00` (warning). Not an official Dynamite scale.

## À confirmer (everything is inferred)

Because the site is JS-rendered, **all** colour, font, radius, spacing, density,
shadow, motion and anatomy values are inferred from the brand identity rather than
measured. Highest-priority items to verify against live computed CSS:

- The exact CTA near-black (`#1a1a1a` vs pure `#000000`) and its hover behaviour.
- The blush accent hex (`#b76e79`) and where/how often it is actually used.
- The warm-neutral fill (`#f7f3f1`) and hairline (`#e6e2df`) tones.
- The real font stack (assumed `'Inter', Helvetica, Arial, sans-serif`).
- Control radii (assumed sharp/fashion-minimal: none 0, sm 0, md 2px, lg 4px).
- Whether form fields are truly boxed (`field.style: "outline"`) and the focus
  technique (assumed a crisp ~2px near-black outline, `focus.color #1a1a1a`).

## Typography

- **sans / display:** `'Inter', Helvetica, Arial, sans-serif` — clean modern sans
  implied by Dynamite's minimal fashion-editorial tone (à confirmer; names only,
  never binaries).
- **mono:** `'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace`
  — not part of Dynamite; the Sentropic/Simons-template mono stack is preserved.
- Fashion CTAs assumed UPPERCASE with light tracking (à confirmer).

## Signatures anatomiques

- **field.style:** `"outline"` — boxed white field, thin warm-grey hairline
  (`#e6e2df` @1px), barely-there 2px radius; native `<select>` chevron redrawn in
  near-black (`#1a1a1a`) via data-URI + `selectAppearance: "none"`.
- **focus.strategy:** `"outline"` — crisp ~2px solid near-black (`#1a1a1a`) outline,
  2px offset. Tabs/pagination/breadcrumb active = `#1a1a1a`.
- **radius:** fashion-minimal/sharp — none 0, sm 0, md 2px, lg 4px, pill 999px.
- **mode:** `light`.

## Asset officiel

- Logo / wordmark: the official Dynamite wordmark from dynamiteclothing.com —
  not bundled here (theme package ships token values only; chrome/logo assets are
  handled separately in the docs chrome per theme). À confirmer / to source.
