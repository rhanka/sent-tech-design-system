# ELLIO theme — provenance mapping

This theme is a **measured clone** of the public ELLIO brand. ELLIO
(ellio.ca / en.ellio.ca) is a Montréal / Québec sustainable-development
consultancy and certified **B Corp**. Its site is built on **Webflow**; every
token value below is measured from the publicly served CSS bundle (notably its
`:root` design tokens) and its source is recorded here. Only the font **name**
(Exo) is referenced — never font binaries. Anything not directly measured is
flagged **à confirmer**.

## Sources
- Homepage (FR): `https://ellio.ca/`
- Homepage (EN): `https://en.ellio.ca/`
- Stylesheet (measured): `https://cdn.prod.website-files.com/5f60cebff1f1761b7c0b0c3f/css/ellio-lite.webflow.shared.1e5e86c67.css`
- Font: **Exo**, loaded via Google Fonts (WebFont.load in the page head).
- Measured `:root` custom properties:
  ```css
  --ellio_blue: #194f90;
  --ellio_vert: #00c08b;
  --grey-light-2: #959595;
  --white: white;
  --grey-light: #f1f1f1;
  --grey: #464444;
  --grey_3: #bdb9b9;
  --black: black;
  ```

## Colour mapping (role → source token → hex)
| Sentropic role | ELLIO source | Hex |
|---|---|---|
| `action.primary` / `text.link` / `surface.inverse` | `--ellio_blue` (links, nav, h1/h3, primary button) | `#194f90` |
| `action.primaryHover` / accent (`cyan.50`) | `--ellio_vert` (h2, link hover, B Corp green) | `#00c08b` |
| `cyan.70` (darker accent) / `feedback.success` | `.cercle_color_leg._7` (data ramp) | `#0ca783` |
| `text.primary` | `body { color: #333 }` | `#333333` |
| `text.secondary` | `--grey` | `#464444` |
| `text.muted` / `border.strong` | `--grey-light-2` | `#959595` |
| `border.subtle` | `--grey_3` | `#bdb9b9` |
| `surface.subtle` / `action.secondary` | `--grey-light` | `#f1f1f1` |
| `surface.default` / `text.inverse` | `--white` | `#ffffff` |
| `action.danger` / `feedback.error` | `.w-file-upload-error-msg` | `#ea384c` |
| `slate.90` | `.cookie-modal_button:hover` near-black | `#262926` |
| **data ramp** `category1..8` | `.cercle_color_leg._1.._7` + `--ellio_vert` | `#194f90 → #006fa8 → #318cbf → #57c0e0 → #64beba → #00a8a6 → #0ca783 → #00c08b` |

## À confirmer (derived / not directly measured)
- `blue.10` (`#e3edf6`), `green.tint` (`#e0f6ee`) — light tints synthesised for low-emphasis surfaces; ELLIO publishes no tint scale.
- `blue.80` (`#123a6c`) — darker brand blue for hover/active; derived (no measured darker blue token).
- `feedback.warning` (`#b35900`) — ELLIO publishes no amber; chosen for WCAG AA on white.
- `feedback.success` mapped to ramp green `#0ca783` (chosen over `--ellio_vert` `#00c08b` for AA on white).
- `font.mono` — ELLIO ships no monospace family; system mono stack used.
- `radius.md`/`lg` (6px / 10px) — ELLIO's literal signature is the **asymmetric corner** (rounded top-right + bottom-left, 10–15px on `.button-service.dark`, cards, `.search-input`). The token system only supports a symmetric radius, so a symmetric approximation is used.
- `focus.*` — the live Webflow stack uses the browser/Webflow default (`outline: 0`, input border → generic `#3898ec`). A brand-blue **outline** focus is encoded here for accessibility parity. Technique à confirmer.
- `shadow.*`, `motion.*`, `z.*`, `density.*` — not tokenised by ELLIO; aligned with the Sentropic base.

## Typography
- **Exo** (Google Fonts) is the single brand face — 47 `font-family: Exo, sans-serif` declarations in the bundle; body fallback is Arial. Mapped to both `font.sans` and `font.display`.
- Headings and interactive labels/buttons are **UPPERCASE** (measured: `h1`, `h2`, `.button-service`, `.nav-link-ellio` all set `text-transform: uppercase`; weights 500–700). Encoded in `typography.control`/`typography.label` (`textTransform: uppercase`, `letterSpacing: 0.02em`).
- Links are **not underlined** by default (`a { text-decoration: none }`); they shift blue → green on hover, with an underline added on hover.

## Signatures anatomiques
- **field.style**: `outline` — boxed. Webflow base `.w-input, .w-select`: white fill `#fff`, `1px solid #ccc`, 38px tall. (Some bespoke Ellio fields use an underline-only style; the dominant brand input is boxed.)
- **select chevron**: redrawn as a data-URI SVG in Ellio blue `#194f90`, `selectAppearance: none`, 2.5rem right gutter.
- **radius**: square base; `100px` pills (tags/badges); soft `10px` card corner approximating the asymmetric signature.
- **focus**: brand-blue `#194f90` outline, 2px width, 2px offset (à confirmer — live site uses Webflow default).
- **primary button**: brand blue `#194f90`, white uppercase text, **green `#00c08b` on hover** (the signature blue→green motion).
- **secondary button**: light grey chip `#f1f1f1`, blue uppercase text, green fill on hover.
- **tabs**: active label brand blue `#194f90`, bold, bottom-border underline.
- **pagination**: borderless blue links; active page filled brand blue, white text.
- **alert**: transparent box with a green left filet (`.intro_post` uses `border-left: 1px solid #00c08b`).
- **density**: Webflow base input 38px; md control ~44px for touch comfort.

## Asset officiel
- Official ELLIO logo and wordmark are served from the brand site
  (`cdn.prod.website-files.com/5f60cebff1f1761b7c0b0c3f/...`). Use the official
  asset for any chrome/logo work — **do not redraw it by hand**.
