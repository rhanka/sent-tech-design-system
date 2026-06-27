# Capgemini → Sentropic mapping

This package maps **Capgemini's public brand identity** onto the Sentropic token
structure (`TenantTheme`). Method = **measured-clone** from the brand's public
references. Unlike ENGIE (which publishes an open, tokenised "Fluid Design
System"), Capgemini does **not** expose an open design-token system, so only two
classes of value are brand-anchored: (1) the **two official brand blues**
(Capgemini Blue, Vibrant Blue), and (2) the **documented web typeface**
(Ubuntu). Every other value — the neutral scale, feedback hues, derived
hover/tint steps, anatomy paddings — is a faithful derivation and is flagged
`à confirmer`. Only public colour anchors and font *names* are referenced — no
font binaries, no logo artwork.

## Sources
- Capgemini corporate site — https://www.capgemini.com/ (live brand surface; uses `capgeminiBlue.svg` logotype, light/dark toggle)
- Capgemini brand colour reference — https://www.brandcolorcode.com/capgemini (Capgemini Blue `#0070AD` Pantone 7461 C; Vibrant Blue `#17ABDA` Pantone 2191 C)
- Cross-check colour reference — https://colorcodeshub.com/brand/capgemini (same two blues; "vibrant blues" + "darker blue for dependability")
- Capgemini brand guidelines (third-party) — https://visualidentity.capgemini.com/wp-content/uploads/2019/06/Brand_Guidelines_Third_Party_032019.pdf
- Brandfetch (cross-check, 403 at fetch time) — https://brandfetch.com/capgemini.com

## Colour mapping

| Sentropic role | Capgemini source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | official **"Capgemini Blue"** / Pantone 7461 C — primary/dependable | `#0070AD` |
| `action.primaryHover` | derived darker Capgemini Blue | `#005a8c` *(à confirmer)* |
| accent (`cyan` slot) | official **"Vibrant Blue"** / Pantone 2191 C — accent / logotype spark | `#17ABDA` |
| `surface.default` / `surface.raised` | neutral 0 / surface default | `#ffffff` |
| `surface.subtle` / `action.secondary` | blue-tinted neutral (light) | `#f2f6f9` *(à confirmer)* |
| `border.subtle` / field stroke | blue-tinted neutral | `#d0d9e0` *(à confirmer)* |
| `text.secondary` / `border.strong` | blue-tinted neutral | `#5f6b75` *(à confirmer)* |
| `text.muted` | blue-tinted neutral | `#44505a` *(à confirmer)* |
| `text.primary` | dark blue-slate | `#1c2a35` *(à confirmer)* |
| `surface.inverse` | dark blue-slate | `#1c2a35` *(à confirmer)* |
| darkest neutral | dark blue-slate | `#0c1620` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived feedback error | `#d6273c` *(à confirmer)* |
| `feedback.success` | derived feedback success | `#2e9e5b` *(à confirmer)* |
| `feedback.warning` | derived feedback warning | `#f0a500` *(à confirmer)* |
| `feedback.info` | feedback info = Capgemini Blue | `#0070AD` |

> **Capgemini Blue vs Vibrant Blue — important distinction.** Capgemini's
> identity is built on **two** official blues. **Capgemini Blue `#0070AD`**
> (Pantone 7461 C) is the deep blue of *dependability / heritage* and carries
> every interactive role here (buttons, links, focus, active states). **Vibrant
> Blue `#17ABDA`** (Pantone 2191 C) is the lighter, energetic blue of the
> logotype spark / brand accent; it is parked in the `cyan` accent slot
> (accent / data-vis), not wired to interactive UI.
>
> **Note on the accent hex.** The build brief proposed `#12ABDB` as the vibrant
> accent anchor; two independent public colour references
> (brandcolorcode.com, colorcodeshub.com) instead converge on the **official
> `#17ABDA`** (Pantone 2191 C). This package uses `#17ABDA`.

### À confirmer (derived or not publicly extracted)
- **Neutral scale** `#f2f6f9 / #d0d9e0 / #5f6b75 / #44505a / #1c2a35 / #0c1620` — Capgemini publishes no exact neutral scale; this blue-tinted scale is derived to sit beside the brand blues.
- **Feedback hues** `success #2e9e5b`, `warning #f0a500`, `error #d6273c`, `info #0070AD` — derived (info reuses Capgemini Blue); Capgemini publishes no feedback palette.
- **Derived blue tints** `blue.hover #005a8c`, `blue.deep #004a73`, `blue.light #e6f1f7`, `blue.vibrantLight #e7f6fb`, `blue.vibrantDark #1296be` — derived darker/lighter steps for hover, deep and tint surfaces.
- **`surface.inverse` `#1c2a35`** — no single published dark-surface token; the dark blue-slate neutral is used as a dark inverse.
- The **8-colour categorical `data.*`** palette (`#0070AD`, `#17ABDA`, `#2e9e5b`, `#f0a500`, `#d6273c`, `#004a73`, `#5f6b75`, `#1296be`) — a coherent proposal from the brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not tokenised publicly; kept aligned with the Sentropic base / standard size scale.
- **`focus.width` `2px` / `offset` `2px`** — a clear Capgemini Blue outline; width/offset are the closest faithful expression, not a measured value.
- **`field.style = "outline"`** (boxed inputs) — Capgemini's live forms appear boxed; not confirmed against a published input spec.
- **Radius** `sm/md = 4px`, `lg = 8px` — Capgemini's web aesthetic is lightly rounded; some marketing CTAs render as **pills** (`radius.pill = 999px` is available). The exact control radius is not published — à confirmer on the live CSS.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'Ubuntu', sans-serif`** — Ubuntu is Capgemini's signature web typeface. Font *names* only; the package never network-loads Ubuntu (it is referenced as a named family that resolves locally / via the host page).
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: Capgemini Blue `#0070AD`, not underlined at rest, underlined on hover.
- *à confirmer*: weights (control 500 / label 700) and the exact Ubuntu fallback chain mirror the Sentropic base; not verified against a published Capgemini type spec.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#d0d9e0` border, 4px radius). Native `<select>` chevron redrawn in Capgemini Blue `#0070AD`. *(à confirmer)*
- **Focus**: high-contrast **outline** in Capgemini Blue `#0070AD` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius**: 4px on controls / inputs / tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`); pills/tags stay `999px` (some CTAs are fully pill — à confirmer).
- **Buttons**: primary = solid Capgemini Blue `#0070AD` → hover `#005a8c`; secondary = **outlined Capgemini Blue** (transparent fill, `#0070AD` border + text, light blue `#e6f1f7` hover fill).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Capgemini Blue `#0070AD`.

## Asset officiel
- Capgemini logo = the **Capgemini wordmark** + the **spark / étincelle** in Vibrant Blue `#17ABDA` (the energetic accent). Use the official SVG/PNG from the brand (`capgeminiBlue.svg` / `capgeminiWhite.svg`) — **do not redraw the logo by hand**. This package only references font *names* (Ubuntu) and public colour anchors, never logo artwork or font binaries.
