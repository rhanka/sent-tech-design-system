# Eidos-Montréal — measured-clone provenance ledger

Theme package: `@sentropic/design-system-theme-eidos-montreal`
Brand: **Eidos-Montréal** (eidosmontreal.com) — AAA game studio (Deus Ex: Mankind Divided, Shadow of the Tomb Raider, Marvel's Guardians of the Galaxy).

## Sources
- Live site computed CSS — https://www.eidosmontreal.com (inspected in a real browser).
- Eidos brand mark (the orange logo glyph) — source of the inferred warm accent.
- Eidos publishes **no public design-token file**; all values are MEASURED from
  the live site or explicitly flagged `à confirmer` / derived.

## Identity
| Field | Value |
|-------|-------|
| `id` | `eidos-montreal` |
| `label` | `Eidos-Montréal` |
| `mode` | `light` |

## Colour mapping table
| Role | Hex | Provenance |
|------|-----|------------|
| Page surface (white) | `#ffffff` | Measured `theme-color` / page background |
| Subtle fill surface | `#f8f8f8` | Measured lightest neutral |
| Light divider | `#d5d5d5` | Measured light divider |
| Field / strong border | `#c4c4c4` | Measured hairline border |
| Muted text / disabled | `#a2a2a2` | Measured muted grey |
| Secondary text | `#5a5a5a` | Measured mid grey |
| Primary text (ink) | `#1d1d1d` | Measured near-black studio ink |
| Inverse surface (deep black) | `#1a1a1a` | Measured deep studio black / footer |
| **Action primary (orange)** | `#e8552d` | **À CONFIRMER** — inferred from Eidos brand mark, NOT a measured CTA |
| **Action primary hover** | `#c8431f` | **À CONFIRMER** — derived darker shade of the accent |
| Action primary text | `#ffffff` | White on orange |
| System danger / error | `#d32f2f` | Task-specified material-grade red (à confirmer) |

## À confirmer
The Eidos site is **largely monochrome** (greyscale-on-white). The single warm
**orange accent `#e8552d`** (and its hover `#c8431f`) is **inferred from the
Eidos brand mark**, not measured from any CTA/button on the live site. Every
orange role below is therefore `à confirmer` until a real CTA colour is sampled:
- `action.primary` / `action.primaryHover`
- `border.interactive` (focus)
- `focus.color`
- `tabs.activeText`, `pagination.activeBackground`, `breadcrumb.currentText`
- `badge.infoBackground`
- `data.category1`

Other `à confirmer` values (no Eidos source exists):
- `feedback.success` `#2e7d32`, `feedback.warning` `#b26a00`, `feedback.info` `#1a1a1a`
- `data.category6..8` (restrained system hues)
- exact spacing/motion/density steps (kept aligned to the Sentropic base)
- exact radius steps (sharp studio: none/sm 0, md 2px, lg 6px)

## Typography
| Token | Value | Provenance |
|-------|-------|------------|
| `font.sans` | `'Inter', Helvetica, Arial, sans-serif` | Clean studio grotesk — exact custom face **à confirmer** (live site loads a near-identical grotesk); names only, no binaries |
| `font.display` | `'Inter', Helvetica, Arial, sans-serif` | Same grotesk for display — à confirmer |
| `font.mono` | `'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace` | Not part of Eidos — Sentropic base mono stack kept |

## Signatures anatomiques
- **`field.style`**: `"outline"` — boxed white fields, thin `#c4c4c4` hairline,
  minimal 2px radius; native `<select>` chevron redrawn in `#1d1d1d` ink via
  `selectChevron` data-URI + `selectAppearance: "none"`.
- **`focus.strategy`**: `"outline"` — 2px solid orange (`#e8552d`, à confirmer),
  2px offset.
- **`radius`**: sharp studio — `none`/`sm` 0, `md` 2px, `lg` 6px, `pill` 999px.
- **Active accents**: tabs (bottom orange underline), pagination (orange fill),
  breadcrumb current, badge info → all the studio orange (à confirmer).
- **CTAs**: uppercase-tracked grotesk labels (`textTransform: uppercase`,
  `letterSpacing: 0.04em`, weight 600) — studio/game-marketing tone (à confirmer).

## Asset officiel
- Eidos brand mark (orange logo glyph) — basis for the inferred warm accent.
  Pixel-perfect logo reproduction is out of scope for this token package; the
  chrome/logo treatment is handled separately by the docs orchestrator.
