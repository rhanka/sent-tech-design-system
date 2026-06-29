# Google Gemini → Sentropic mapping

This package maps the **public** Google brand / Material design language (as used
on [gemini.google.com](https://gemini.google.com/)) onto the Sentropic token
structure (`TenantTheme`). Only public brand colours, the Google UI grey scale,
the Gemini gradient, and font *names* are referenced — no font binaries.

## Sources
- Google brand colours — https://about.google/brand-resource-center/ and
  https://usbrandcolors.com/google-colors/ (Blue #4285F4, Red #EA4335,
  Yellow #FBBC04, Green #34A853).
- Google UI blue / grey scale (Workspace / Material GM2 tokens used across
  Gemini): Blue 600 #1A73E8, Blue 700 #1967D2, Blue 50 #E8F0FE; Grey 50 #F8F9FA,
  Grey 100 #F1F3F4, Grey 300 #DADCE0, Grey 500 #9AA0A6, Grey 700 #5F6368,
  Grey 800 #3C4043, Grey 900 #202124.
- Gemini brand gradient (blue → purple) — #4285F4 → #9B72CB (Gemini launch
  branding; https://9to5google.com/ coverage of the Gemini logo/gradient).
- Material Design 3 typography & shape — https://m3.material.io/styles/typography/fonts
  (Google Sans / Google Sans Text / Roboto).

## Colour mapping

| Sentropic role | Google token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` | Google Blue 600 | `#1a73e8` |
| `action.primaryHover` | Google Blue 700 | `#1967d2` |
| `focus.color` | Google Blue 600 | `#1a73e8` |
| `blue.10` / secondary hover surface tint | Google Blue 50 | `#e8f0fe` |
| accent (Sentropic `cyan`) | Gemini gradient purple | `#9b72cb` |
| `text.primary` / `surface.inverse` | Google Grey 900 | `#202124` |
| `text.secondary` | Google Grey 700 | `#5f6368` |
| `text.muted` / `border.strong` | Google Grey 500 | `#9aa0a6` |
| `border.subtle` | Google Grey 300 | `#dadce0` |
| `surface.subtle` / `action.secondary` | Google Grey 100 | `#f1f3f4` |
| background alt / card hover | Google Grey 50 | `#f8f9fa` |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `action.danger` / `feedback.error` | Google Red 700 | `#d93025` |
| brand red (data) | Google Red 500 | `#ea4335` |
| `feedback.success` | Google Green 700 | `#188038` |
| brand green (data) | Google Green 600 | `#34a853` |
| brand yellow (data) | Google Yellow 500 | `#fbbc04` |

### "À confirmer" (no direct Google public token)
- `cyan.10` `#f3e8fd` and `cyan.70` `#7b4fa8` — derived purple tints around the
  Gemini gradient purple `#9b72cb`.
- `red.50` `#fce8e6`, `green.50` `#e6f4ea`, `blue.50` `#e8f0fe` — Google "50"
  tints (well-known Material values, not re-measured here).
- `feedback.warning` `#e37400` — Google amber/orange 700, darkened from the brand
  yellow `#fbbc04` for WCAG AA on white (yellow text fails contrast).
- `data.category8` `#1ba1e3` — Gemini teal accent; a coherent gradient companion,
  not an official sequential-scale token.
- The 8-colour categorical `data.*` palette overall — a coherent proposal from
  the Google four-colour brand + Gemini gradient, not an official data-vis scale.
- `shadow.*` (Material key+ambient elevation) and `motion.*` — approximate the
  Material elevation/easing; exact dp specs not re-measured.
- Letter-spacing on `typography.control`/`label` (`0.0107em` / `0.0071em`) —
  Material label tracking, approximate.

## Typography
- **Display / headings / buttons** (`font.display`, `typography.control`,
  `typography.label`): `'Google Sans', Roboto, sans-serif` (medium 500).
- **Body / fields** (`font.sans`, `typography.field`): `'Google Sans Text',
  Roboto, sans-serif`.
- **Monospace** (`font.mono`): `'Roboto Mono', monospace`.
- Links are **not** underlined at rest (Google Blue text); underline appears on
  hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#dadce0` border, 8px radius), the modern Material 3 / Gemini "outlined
  text field" look. Not a filled-underline.
- **Radius**: Material rounding — controls/inputs `md = 8px`, cards `lg = 12px`,
  chips/buttons read as pills (`pill = 999px`); `sm = 4px`.
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in Google Blue
  `#1a73e8` (3px, offset 2px), the Material/base focus technique (not a native
  offset outline).
- **Buttons**: primary = solid Google Blue `#1a73e8`; secondary = Material
  "outlined" button (transparent fill, blue stroke + text, `#e8f0fe` light-blue
  state-layer fill on hover).
- **Tabs**: active tab = Google Blue medium label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Google Blue.
- **Chevron (native `<select>`)**: redrawn as a Google Blue `#1a73e8` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: Material touch targets (md ≈ 40px control height) with generous
  horizontal padding; button label 14px (`0.875rem`) medium.
- **Gemini gradient**: `#4285f4` → `#9b72cb` (blue → purple). `TenantTheme` has
  no gradient token, so the two stops live in `data.category6` / `data.category5`
  and are noted here as the brand signature.

## Asset officiel
- Google "G" logo and the Gemini sparkle/gradient mark are official Google brand
  assets — reference them from the Google Brand Resource Center, do not redraw.
  Gemini chrome should use the Gemini wordmark + four-colour sparkle, not a
  hand-drawn approximation.
