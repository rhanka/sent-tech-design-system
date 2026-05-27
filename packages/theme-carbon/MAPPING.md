# Carbon → Sentropic token mapping

This package maps **public, open-source** tokens from the [IBM Carbon Design
System](https://carbondesignsystem.com/) (v11) onto the Sentropic token
structure (`foundation` / `semantic` / `component`) as a `TenantTheme`.

Only published Carbon values are used. Where Carbon has no exact equivalent for
a Sentropic role, the closest Carbon token is chosen and flagged
**(approx / à confirmer)**.

## Sources

- Carbon color tokens (gray / blue / cyan / support):
  https://carbondesignsystem.com/elements/color/tokens/
- Carbon IBM Color palette swatch values (Gray, Blue, Cyan, Red, Green,
  Yellow, etc.): https://carbondesignsystem.com/elements/color/usage/
- Carbon spacing scale (`$spacing-01..13`):
  https://carbondesignsystem.com/elements/spacing/overview/
- Carbon type (IBM Plex): https://carbondesignsystem.com/elements/typography/overview/
- Carbon motion (`$duration-*`, easing):
  https://carbondesignsystem.com/elements/motion/overview/
- Carbon data visualization categorical palette:
  https://carbondesignsystem.com/data-visualization/color-palettes/
- IBM Plex web font: https://www.ibm.com/plex/

## Raw Carbon palette used

| Carbon token | Hex | Used for |
|---|---|---|
| White | `#ffffff` | `slate.0`, surfaces, text-on-color |
| Gray 10 | `#f4f4f4` | `slate.10`, subtle surface (`$layer-01`) |
| Gray 20 | `#e0e0e0` | `slate.20`, subtle border (`$border-subtle`) |
| Gray 50 | `#8d8d8d` | strong border (`$border-strong`) |
| Gray 60 | `#6f6f6f` | muted text (`$text-helper`) |
| Gray 70 | `#525252` | secondary text (`$text-secondary`) |
| Gray 80 | `#393939` | `slate.80`, secondary action surface |
| Gray 90 | `#262626` | `slate.90`, inverse surface (`$background-inverse`) |
| Gray 100 | `#161616` | primary text (`$text-primary`) |
| Blue 10 | `#edf5ff` | `blue.10` |
| Blue 60 | `#0f62fe` | `blue.60`, `$interactive` / primary action / link / focus |
| Blue 70 | `#0043ce` | `$support-info`, hover |
| Blue 80 | `#002d9c` | `blue.80`, data category 8 |
| Cyan 50 | `#1192e8` | `cyan.50`, data category 2 |
| Cyan 70 | `#00539a` | `cyan.70` |
| Red 60 | `#da1e28` | `$support-error` / danger |
| Green 50 | `#24a148` | `$support-success` |
| Yellow 30 | `#f1c21b` | `$support-warning` |

## foundation

### foundation.color

| Sentropic role | Carbon token | Value | Notes |
|---|---|---|---|
| `color.blue.10` | Blue 10 | `#edf5ff` | clean |
| `color.blue.60` | Blue 60 (`$interactive`) | `#0f62fe` | clean — Carbon's primary interactive |
| `color.blue.80` | Blue 80 | `#002d9c` | clean |
| `color.cyan.10` | Cyan 10 | `#e5f6ff` | clean |
| `color.cyan.50` | Cyan 50 | `#1192e8` | clean |
| `color.cyan.70` | Cyan 70 | `#00539a` | clean |
| `color.slate.0` | White | `#ffffff` | clean (Sentropic "slate" family ← Carbon Gray) |
| `color.slate.10` | Gray 10 | `#f4f4f4` | clean |
| `color.slate.20` | Gray 20 | `#e0e0e0` | clean |
| `color.slate.60` | Gray 60 | `#6f6f6f` | clean |
| `color.slate.80` | Gray 80 | `#393939` | clean |
| `color.slate.90` | Gray 90 | `#262626` | clean |
| `color.feedback.success` | Green 50 (`$support-success`) | `#24a148` | clean |
| `color.feedback.warning` | Yellow 30 (`$support-warning`) | `#f1c21b` | clean |
| `color.feedback.error` | Red 60 (`$support-error`) | `#da1e28` | clean |
| `color.feedback.info` | Blue 70 (`$support-info`) | `#0043ce` | clean |

The Sentropic `slate` key keeps its name but carries Carbon's neutral **Gray**
ramp. Only the six grays needed by `semantic` are exposed (0/10/20/60/80/90),
matching the Sentropic base which also only exposes those keys.

### foundation.font

| Sentropic role | Carbon | Value |
|---|---|---|
| `font.sans` | IBM Plex Sans | `'IBM Plex Sans', system-ui, …, sans-serif` |
| `font.display` | IBM Plex Sans | `'IBM Plex Sans', system-ui, sans-serif` (approx — Carbon has no separate display face; IBM Plex Sans serves headings) |
| `font.mono` | IBM Plex Mono | `'IBM Plex Mono', 'SFMono-Regular', …, monospace` |

### foundation.spacing

Carbon scale (`$spacing-01..13`): 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96,
160 px (base 8px, mini 2px). The Sentropic spacing object uses a different set
of keys; each key is mapped to the Carbon step whose pixel value matches
(16px = 1rem).

| Sentropic key | rem | px | Carbon step |
|---|---|---|---|
| `0` | `0` | 0 | — |
| `1` | `0.25rem` | 4 | `$spacing-02` |
| `2` | `0.5rem` | 8 | `$spacing-03` |
| `3` | `0.75rem` | 12 | `$spacing-04` |
| `4` | `1rem` | 16 | `$spacing-05` |
| `6` | `1.5rem` | 24 | `$spacing-06` |
| `8` | `2rem` | 32 | `$spacing-07` |
| `12` | `3rem` | 48 | `$spacing-09` |
| `16` | `4rem` | 64 | `$spacing-10` |

Values are identical to the Sentropic base spacing because both systems use a
4px/8px grid and a 16px rem; the mapping is a pixel-for-pixel match against the
Carbon scale rather than an invented set.

### foundation.radius

Carbon corners are nearly square; most components have 0 radius, with small
2–8px radii on buttons, tiles and tags.

| Sentropic role | Value | Carbon notes |
|---|---|---|
| `radius.none` | `0` | Carbon default for most components |
| `radius.sm` | `0.125rem` (2px) | small element rounding |
| `radius.md` | `0.25rem` (4px) | button / tile rounding (approx) |
| `radius.lg` | `0.5rem` (8px) | larger containers (approx) |
| `radius.pill` | `999px` | tags / pills |

**(approx)** — Carbon does not publish a single canonical radius token scale;
these are reasonable values reflecting Carbon's square-ish aesthetic.

### foundation.shadow

| Sentropic role | Value | Notes |
|---|---|---|
| `shadow.subtle` | `0 1px 2px rgb(22 22 22 / 0.10)` | Carbon Gray 100 tint |
| `shadow.medium` | `0 2px 6px rgb(22 22 22 / 0.20)` | **(approx)** Carbon elevation guidance |
| `shadow.floating` | `0 8px 16px rgb(22 22 22 / 0.30)` | **(approx)** |

**(approx)** — Carbon expresses elevation via guidance rather than fixed SCSS
shadow tokens; values approximate the published elevation levels and use
Carbon's Gray 100 (`#161616`) as the shadow color.

### foundation.motion

| Sentropic role | Carbon token | Value |
|---|---|---|
| `motion.fast` | `$duration-fast-02` | `110ms` |
| `motion.normal` | `$duration-moderate-01` | `150ms` |
| `motion.slow` | `$duration-moderate-02` | `240ms` |
| `motion.easing` | productive standard | `cubic-bezier(0.2, 0, 0.38, 0.9)` |

### foundation.z

Not Carbon-specific. Kept aligned with the Sentropic base z-index roles
(`header` 50, `toast` 60, `overlay` 80, `modal` 100, `chat` 110).

## semantic

| Sentropic role | Carbon token | Value | Notes |
|---|---|---|---|
| `surface.default` | `$background` | `#ffffff` | clean |
| `surface.subtle` | `$layer-01` / `$background-active` | `#f4f4f4` | clean |
| `surface.raised` | `$layer-01` on white | `#ffffff` | clean |
| `surface.inverse` | `$background-inverse` | `#262626` (Gray 90) | clean |
| `surface.overlay` | `$overlay` | `rgb(22 22 22 / 0.50)` | clean (Gray 100 @ 50%) |
| `text.primary` | `$text-primary` | `#161616` (Gray 100) | clean |
| `text.secondary` | `$text-secondary` | `#525252` (Gray 70) | clean |
| `text.muted` | `$text-helper` | `#6f6f6f` (Gray 60) | clean |
| `text.inverse` | `$text-inverse` | `#ffffff` | clean |
| `text.link` | `$link-primary` | `#0f62fe` (Blue 60) | clean |
| `border.subtle` | `$border-subtle` | `#e0e0e0` (Gray 20) | clean |
| `border.strong` | `$border-strong` | `#8d8d8d` (Gray 50) | clean |
| `border.interactive` | `$border-interactive` / `$focus` | `#0f62fe` (Blue 60) | clean |
| `action.primary` | `$interactive` / `$button-primary` | `#0f62fe` (Blue 60) | clean |
| `action.primaryText` | `$text-on-color` | `#ffffff` | clean |
| `action.secondary` | `$button-secondary` | `#393939` (Gray 80) | clean |
| `action.secondaryText` | `$text-on-color` | `#ffffff` | clean |
| `action.danger` | `$button-danger-primary` | `#da1e28` (Red 60) | clean |
| `feedback.*` | `$support-*` | see foundation | clean |
| `status.pending` | — | `#f1c21b` | mapped via feedback.warning (approx, no Carbon status token) |
| `status.processing` | — | `#0043ce` | mapped via feedback.info (approx) |
| `status.completed` | — | `#24a148` | mapped via feedback.success (approx) |
| `status.failed` | — | `#da1e28` | mapped via feedback.error (approx) |

### semantic.data — Carbon categorical data-vis palette

Carbon's 14-color categorical palette, first 8 colors:

| Sentropic role | Carbon swatch | Value |
|---|---|---|
| `data.category1` | Purple 70 | `#6929c4` |
| `data.category2` | Cyan 50 | `#1192e8` |
| `data.category3` | Teal 70 | `#005d5d` |
| `data.category4` | Magenta 70 | `#9f1853` |
| `data.category5` | Red 50 | `#fa4d56` |
| `data.category6` | Red 90 | `#570408` |
| `data.category7` | Green 60 | `#198038` |
| `data.category8` | Blue 80 | `#002d9c` |

This is the published Carbon categorical sequence (clean).

## component

The `component` layer wires component-level roles (button, card, input, chat,
etc.) to `semantic`/`foundation` roles. It is **structural, not
Carbon-specific**, so the Sentropic base `component` tokens are reused
unchanged — the same approach used by the `forge` and `entropic` themes in
`@sentropic/design-system-themes`. Carbon's color/type/spacing intent flows
through because `component` references resolve to the Carbon values defined
above when the theme is consumed.

> Note: like the base `forge`/`entropic` themes, `component` is imported from
> `@sentropic/design-system-themes`; its literal values were resolved from the
> base Sentropic semantic layer. If fully Carbon-resolved component vars are
> required, the `component` object can later be reconstructed from this file's
> `semantic`/`foundation` — left out here to mirror the existing theme pattern.

## Summary: clean vs approximate

**Clean / direct Carbon tokens:** all colors (gray ramp, blue, cyan, support),
IBM Plex fonts, spacing scale (pixel-matched to `$spacing-*`), motion durations
and easing, full data-vis categorical palette, and every `surface` / `text` /
`border` / `action` / `feedback` semantic role.

**Approximate / à confirmer:** `font.display` (Carbon has no dedicated display
face — IBM Plex Sans reused); `radius.*` (Carbon publishes no canonical radius
token scale); `shadow.*` (Carbon uses elevation guidance, not fixed shadow
tokens); `semantic.status.*` (no Carbon status token — mapped through feedback
colors); `foundation.z.*` (not a Carbon concern — kept from Sentropic base).
