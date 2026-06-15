# Mirego theme — provenance mapping

This package is a **measured clone** of [mirego.com](https://www.mirego.com), the
Montréal digital product studio. Every token value below is measured from
Mirego's **publicly served CSS** (the `mirego-*.css` asset bundle). Only font
**names** are referenced — never font binaries. Values with no measured source
are flagged **à confirmer**.

Scope: this maps Mirego's *public CSS tokens* and the *names* of its bespoke
typefaces (Almirego, Almirego Display) into the Sentropic token contract. It does
not redistribute any Mirego font files or proprietary assets.

## Sources

| What | URL |
|---|---|
| Homepage | https://www.mirego.com/ |
| Main CSS bundle (measured) | https://www.mirego.com/assets/mirego-9abb76d5f659709fc054fae6af2f02f1.css |
| Vendor CSS | https://www.mirego.com/assets/vendor-125d57f634e3813cb75cebfffdc65343.css |
| Chunk CSS | https://www.mirego.com/assets/chunk.524.1347a99ed8ce787f786d.css |

All measurements taken by direct `curl` of the live bundle (frequency counts are
occurrences in `mirego-*.css`).

## Colour mapping

| Role (Sentropic) | Mirego token / source | Hex |
|---|---|---|
| text.primary / action.primary / brand | `body{color:#050307}` (142×) | `#050307` |
| surface.default (page) | `--page-background:#fff` (103×) | `#ffffff` |
| surface.subtle (signature) | `--primary-color:#f7edde` (37×) | `#f7edde` |
| accent (signature) | `::selection{background:#b5a6ff}` + accent fills (30×) | `#b5a6ff` |
| editorial pop | `color/background:#ff4524` (24×) | `#ff4524` |
| action.danger / field error | input `border-color:#d52a0b` (9×) | `#d52a0b` |
| action.primaryHover (dark surface) | dark UI tone `#211e25` (8×) | `#211e25` |
| border.strong (field) | `border:1px solid #a5a4a6` / `rgba(165,164,166,.3)` (6×) | `#a5a4a6` |
| text.secondary | secondary text `#5b5b5b` (6×) | `#5b5b5b` |
| dark charcoal | `#242424` (5×) | `#242424` |
| border.subtle | hairline `#e0dfe0` (3×) | `#e0dfe0` |
| text.muted | warm grey `#948e85` (3×) | `#948e85` |
| card border (warm) | `border:1px solid #c6beb2;background:#fff` | `#c6beb2` |
| editorial teal | quote `#2e6d5d` / `--quote-gradient-right:#113b31` | `#2e6d5d` / `#113b31` |
| soft teal | `--quote-gradient-left-color:#83c3b0` | `#83c3b0` |
| editorial violet | `background:#6d6499` | `#6d6499` |
| cool tint surface | `--column-background:#eaf0f6` | `#eaf0f6` |

### À confirmer (derived / no measured Mirego source)

- **feedback.success** `#2e6d5d` — reuses the measured editorial teal; Mirego
  publishes no success hue.
- **feedback.warning** `#9a6700` — dark amber chosen for WCAG AA on white/cream;
  **no Mirego source**.
- **feedback.info** `#6d6499` — reuses the measured editorial violet; no info hue.
- **feedback.error** `#d52a0b` — measured, but only as a *form-input error*
  border colour, not a published semantic error token.
- **action.primaryHover** `#211e25` — measured dark UI tone used as a plausible
  "lifted ink" hover; the exact CTA hover delta is not separately tokenised.
- **blue / cyan foundation families** — Mirego has no blue and no cyan; the
  Sentropic "blue" family carries ink and "cyan" carries the periwinkle accent.
- **spacing scale** — kept on the Sentropic 4px base; Mirego's raw steps are not
  strongly tokenised in the bundle.
- **shadow** specs — Mirego elevation is soft/whitespace-led; values are
  conservative ink-tinted derivations.
- **data.category1..8** — a proposal built from Mirego's measured editorial hues
  (ink, periwinkle, orange-red, teals, violet, warm grey); **not** an official
  Mirego data-vis scale.
- **mono font** — Mirego ships no monospace; the Sentropic mono stack is kept.

## Typography

| Slot | Family | Source |
|---|---|---|
| sans (body / UI) | **Almirego** | `font-family:Almirego,serif` (57×), `@font-face` Almirego Light/Regular/Bold |
| display (headings) | **Almirego Display** | `font-family:"Almirego Display",serif` (48×), `@font-face` weights 300/400/700 |
| serif accent (italic) | **Newsreader** | `@font-face{font-family:Newsreader;src:newsreader-italic.ttf}`, `font-family:Newsreader,serif` |
| mono | Sentropic stack | no Mirego source — à confirmer |

Mirego's measured fallback is `serif` (not sans), reflecting its editorial,
typographic identity. Bespoke faces (Almirego, Almirego Display) are referenced
by **name only**; no binaries are bundled. Measured field font-size = 18px;
CTA = Almirego Display 17px / letter-spacing .34px; labels ≈ 0.9375rem
(`--label-font-size`).

## Signatures anatomiques

- **field.style = `outline`** — boxed input: `border:1px solid rgba(165,164,166,.3)`
  (≈ `#a5a4a6` @30%), `border-radius:6px` (`--border-radius` default),
  `background:rgba(255,255,255,.5)`, Almirego 18px, placeholder `rgba(5,3,7,.3)`.
  Error state border `#d52a0b` / `#ff4524`. Native `<select>` chevron redrawn in
  ink (`#050307`) via data-URI + `appearance:none`.
- **focus.strategy = `outline`** — measured
  `:focus-visible{outline-style:solid;outline-width:2px;outline-offset:4px}`
  (some controls `outline-offset:3px`). Outline colour = ink `#050307`.
- **radius** — softly rounded: `--border-radius:6px` (small controls),
  `--cta-border-radius:9.5px` (CTA), `24px`/`32px`/`44px` (cards/panels, dominant
  large radii), `500px` (pills). Mapped sm 6px / md 9.5px / lg 24px / pill 500px.
- **buttons** — primary = filled ink: `background:#050307;color:#fff`
  (measured CTA). Secondary = outlined ink hairline with cream hover.
- **tabs** — active = ink (`#050307`) bold label with an ink bottom underline
  (`--active::after{background-color:#050307}`); transparent fill.
- **pagination** — borderless ink links; active = filled ink pill, white text.
- **borders** — 1px hairlines dominant; emphasis strokes 1.5px (`#050307`/`#272425`);
  heavy editorial frames up to 4px.
- **density** — airy: measured form inputs 64px tall (padding 12px / 10px 16px),
  small CTA 32px; md targets a comfortable ~48px control.
- **motion** — measured `0.3s cubic-bezier(.215,.61,.355,1)` (ease-out-cubic) on
  inputs; `0.5s ease-in` on accent fills.
- **::selection** — `background:#b5a6ff` (the periwinkle accent).

## Asset officiel

Mirego's wordmark/logo is served from `https://www.mirego.com/assets/images/`.
Use the official SVG asset for any chrome — **do not redraw it by hand**. This
package ships tokens only (no logo assets).
