# Cogeco → Sentropic mapping

This package maps the **measured** visual identity of [Cogeco Inc.](https://corpo.cogeco.com)
(the Québec-based telecommunications & media group) onto the Sentropic token structure
(`TenantTheme`). Cogeco publishes no public design-token file: every value below is read from
the live corporate site's computed CSS, or — where the JS-rendered site hides it — inferred and
flagged **à confirmer**. Only font *names* are referenced — no font binaries.

## Sources
- Cogeco corporate site — https://corpo.cogeco.com
- Cogeco consumer site — https://www.cogeco.com
- Measured: live computed CSS inspected in a real browser (no published token file exists).
- `theme-color` meta measured `#ffffff`; brand navy `#001e62` and coral `#ff6d70` read off the masthead / CTA / data accents.

## Colour mapping

| Sentropic role | Source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | measured deep-navy CTA / masthead | `#001e62` |
| `action.primaryHover` | measured navy hover/press | `#00154a` |
| `action.primaryText` / `text.inverse` | white on navy | `#ffffff` |
| accent (Sentropic `cyan`) / `data.category2` | measured coral data/highlight accent | `#ff6d70` |
| `text.primary` | measured near-black body text | `#1a1a1a` |
| `text.secondary` | measured cool blue-grey | `#555a66` |
| `text.muted` / `border.strong` | measured cool blue-grey | `#8a90a0` |
| `surface.subtle` / `action.secondary` | measured light cool fill | `#f4f5f8` |
| `border.subtle` / field hairline | measured light cool hairline | `#d7dbe2` |
| `surface.default` / `surface.raised` | page background | `#ffffff` |
| `surface.inverse` | measured navy band | `#001e62` |
| `action.danger` / `feedback.error` | measured red error/alert accent | `#d72020` |

### "À confirmer" (no measured Cogeco source)
- **Fonts** — the site is heavily JS-rendered, so the stack could not be read with confidence.
  Inferred Inter-led sans `'Inter', Helvetica, Arial, sans-serif` for `font.sans` / `font.display`
  and `typography.*`. Mono kept from the Sentropic/Simons base.
- **Coral accent** — measured as a highlight hue but its exact role coverage (data vs. emphasis vs.
  links) is inferred; mapped to the Sentropic `cyan` accent slot + `data.category2`.
- `feedback.success` `#1f7a40`, `feedback.warning` `#b26a00`, `feedback.info` `#001e62` (= brand navy) —
  restrained, AA-on-white system colours; no measured Cogeco equivalent.
- The 8-colour categorical `data.*` palette — a coherent proposal anchored on navy + coral, then the
  cool greys and system hues; **not** an official scale.
- `shadow.*`, `motion.*`, `spacing.*` exact steps — not strongly tokenised on the live site; kept
  aligned with the Sentropic base (navy-tinted shadows).

## Typography
- **All roles** (`font.sans`, `font.display`, `typography.control/field/label`): `'Inter', Helvetica, Arial, sans-serif` — **à confirmer** (JS-rendered site).
- **Monospace** (`font.mono`): `'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace` (base stack — Cogeco has no mono).
- Links navy at rest; underline appears on hover.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px cool-grey `#d7dbe2` border, 6px radius), native `<select>` chevron redrawn in `#555a66`.
- **Radius**: modern — `none 0`, `sm 2px`, `md 6px` (buttons/inputs/tabs), `lg 12px` (cards), `pill 999px`.
- **Focus**: crisp `2px` brand-navy `#001e62` outline (`focus.strategy = "outline"`, `offset 2px`).
- **Buttons**: primary = solid deep navy `#001e62` (hover `#00154a`); secondary = soft cool-grey `#f4f5f8` filled chip.
- **Tabs / sub-nav**: active tab = navy label with a bottom navy underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless navy links; active page = filled navy box, white text.
- **Breadcrumb**: navy links + current page, cool-grey trail and separators.
- **Density**: touch-friendly controls (md ≈ 44px height) with generous horizontal padding.

## Asset officiel
- Logo / wordmark: the official Cogeco mark is **not** redistributed here. Chrome/header work
  (WP14) should pull the official asset from the brand site, not redraw it.
