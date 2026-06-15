import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * BRP (brp.com — Bombardier Recreational Products, Valcourt QC; the maker of
 * Ski-Doo, Sea-Doo and Can-Am) theme for the Sentropic token structure.
 *
 * BRP's public site is an Adobe Experience Manager ("nextgen") build whose brand
 * clientlib stylesheet (`clientlib-corpo`) is the source of truth. Every value
 * below is MEASURED from that live stylesheet, fetched directly via curl, plus
 * the Typekit kit (`use.typekit.net/xjw2jyf.css`) for the font family names. The
 * Bootstrap-default custom properties shipped in the same sheet (`--blue:#007bff`,
 * `--primary:#007bff`…) are framework noise and are deliberately IGNORED; the real
 * BRP brand layer is the high-frequency hand-authored hexes (`#ffd200` ×146,
 * `#2f2f2f`, `#f0f0f0`, `#25282a`, `#efba29`…) and the `.btn` / `.form-control` /
 * `header.next-gen` / `select` rules. We reference font NAMES only (the Trade
 * Gothic family served via Typekit), never font binaries. Sources and the full
 * mapping are in MAPPING.md.
 *
 * BRP's identity is BOLD and HIGH-CONTRAST: a vivid BRAND YELLOW (#ffd200 — the
 * primary CTA fill, accent underline and icon fill, measured ×146) on PURE BLACK
 * ink (#000 — CTA text, body copy) over a LIGHT GREY canvas (#f0f0f0 — measured
 * `body{background-color:#f0f0f0}`) with WHITE chrome (#fff — `header.next-gen`).
 * The dark base tones are a charcoal #2f2f2f and a near-black #25282a / #1e2021.
 * The primary `.btn` is a SQUARE (measured `border-radius:0`), UPPERCASE, ITALIC,
 * HEAVY-CONDENSED yellow block (measured `background:#ffd200; color:#000;
 * font-family:Trade Gothic Next LT Pro Heavy Condensed Italic; font-weight:800;
 * text-transform:uppercase; font-style:italic`). Form fields are FILLED-UNDERLINE
 * (measured `.form-control{background:#f9f9f9; border:none;
 * border-bottom:1px solid #b2b2b2; border-radius:.6rem; border-bottom-*-radius:0}`
 * → a grey fill, rounded TOP corners, square bottom, single grey bottom rule) and
 * focus turns that bottom rule to the BRAND YELLOW (measured
 * `.form-control:focus{background:#f9f9f9; border-bottom:2px solid #ffd200}`),
 * encoded as a filled-underline field with a 2px yellow shadow underline. Where
 * Sentropic needs a role BRP does not publish, the closest measured hex is used
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * BRP colour reference (measured hex, clientlib-corpo stylesheet):
 *   Brand yellow (CTA / accent / icon)    #ffd200   .btn background / select-underline / fill (×146) — THE BRP yellow
 *   Gold accent (warm secondary)          #efba29   measured gold accent (×45)
 *   Soft gold ink                         #cba052   measured warm gold ink
 *   Bright amber (alt accent)             #ffc72c   measured amber accent (à confirmer scale)
 *   Pure black (ink / CTA text)           #000000   .btn color / body ink — THE BRP ink
 *   Charcoal dark base                    #2f2f2f   --banner-bg-color dark / dark chrome base
 *   Near-black                            #25282a   measured near-black surface ink
 *   Deepest near-black                    #1e2021   measured deepest dark base
 *   Dark ink                              #1d1d1d   measured dark text ink
 *   Olive-grey ink                        #585c57   measured muted grey-green ink
 *   Mid grey (field underline)            #b2b2b2   .form-control border-bottom stroke (1px)
 *   Select border grey                    #aeb5b4   select border stroke
 *   Light grey (page canvas)              #f0f0f0   body{background-color} — THE BRP canvas (×171)
 *   Faint grey (field fill / raised)      #f9f9f9   .form-control fill / .more-expand bg (×66)
 *   Warm off-white                        #f4f2ef   measured warm panel tint
 *   Neutral panel                         #e3e3e3   measured neutral panel
 *   Warm beige divider                    #d6d5cf   measured warm divider
 *   White (chrome / raised)               #ffffff   header.next-gen / .navbar bg — THE BRP chrome
 *   Brand error red                       #d32f2f   measured error red
 *   Soft error tint                       #ff6d70   measured soft error
 *   Teal accent (data / cool accent)      #2cd5c4   measured teal accent (à confirmer)
 *   Success green                         #2e7d32   AA-grade success (not brand-published — à confirmer)
 *   Warning amber ink                     #8a6d3b   AA-grade amber (not brand-published — à confirmer)
 *   Info charcoal                         #2f2f2f   neutral info (brand dark base)
 */

// --- BRP raw colour palette (measured hex, clientlib-corpo stylesheet) -------
const brpColor = {
  // The brand IS the vivid yellow. Used for the primary CTA fill, the accent
  // underline/swipe, and icon fills (measured ×146 in clientlib-corpo).
  yellow: {
    500: "#ffd200", // .btn background / accent underline — THE BRP brand yellow
    gold: "#efba29", // measured gold accent (×45)
    goldInk: "#cba052", // measured warm gold ink
    amber: "#ffc72c" // measured bright amber accent (à confirmer scale)
  },
  // Ink + dark base tones (BRP uses PURE BLACK for CTA text + body, charcoal +
  // near-blacks for dark chrome / inverse surfaces).
  ink: {
    black: "#000000", // .btn color / body ink — THE BRP ink
    charcoal: "#2f2f2f", // --banner-bg-color dark / dark chrome base
    nearBlack: "#25282a", // measured near-black surface ink
    deepest: "#1e2021", // measured deepest dark base
    dark: "#1d1d1d", // measured dark text ink
    olive: "#585c57" // measured muted grey-green ink (secondary)
  },
  // Cool neutral grey ramp (page canvas + field fill + strokes).
  grey: {
    underline: "#b2b2b2", // .form-control border-bottom stroke (1px)
    selectBorder: "#aeb5b4", // select border stroke
    page: "#f0f0f0", // body background — THE BRP canvas (×171)
    faint: "#f9f9f9", // .form-control fill / raised panel (×66)
    panel: "#e3e3e3", // measured neutral panel
    divider: "#d6d5cf" // measured warm beige divider
  },
  // Warm off-white panel tint.
  warm: "#f4f2ef", // measured warm panel tint
  white: "#ffffff", // header.next-gen / chrome / raised surface — THE BRP chrome
  // System / status colours (measured error; teal accent measured; success/warning
  // derived to AA).
  system: {
    error: "#d32f2f", // measured brand error red
    errorSoft: "#ff6d70", // measured soft error tint
    teal: "#2cd5c4", // measured teal accent (à confirmer scale)
    success: "#2e7d32", // AA-grade success green (not brand-published — à confirmer)
    warning: "#8a6d3b", // AA-grade amber ink (not brand-published — à confirmer)
    info: "#2f2f2f" // neutral info (brand dark base)
  }
} as const;

// --- foundation (BRP-specific values) ---------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). BRP's PRIMARY ACTION
    // is the brand YELLOW, so the action steps are mapped to the yellow scale with
    // a faint grey lightest tint and a charcoal darkest active ground.
    blue: {
      10: brpColor.grey.faint, // #f9f9f9 faint grey tint
      60: brpColor.yellow[500], // #ffd200 THE BRP yellow (primary action)
      80: brpColor.ink.charcoal // #2f2f2f charcoal active ground
    },
    // Sentropic "cyan" accent slot. BRP's cool accent is the measured teal
    // (#2cd5c4); mapped here so a distinct cool accent survives (à confirmer).
    cyan: {
      10: "#e6f7f5", // faint teal tint (derived panel tint — à confirmer)
      50: brpColor.system.teal, // #2cd5c4 measured teal accent
      70: "#1aa392" // deeper teal (derived — à confirmer)
    },
    // Sentropic "slate" neutral family mapped onto the BRP ink, grey ramp and
    // light canvas.
    slate: {
      0: brpColor.white, // #ffffff white
      10: brpColor.grey.page, // #f0f0f0 light page canvas
      20: brpColor.grey.underline, // #b2b2b2 field underline / subtle border
      60: brpColor.ink.olive, // #585c57 muted grey-green secondary ink
      80: brpColor.ink.black, // #000000 primary ink (pure black)
      90: brpColor.ink.deepest // #1e2021 deepest dark base
    },
    feedback: {
      success: brpColor.system.success,
      warning: brpColor.system.warning,
      error: brpColor.system.error,
      info: brpColor.system.info
    }
  },
  // BRP serves the TRADE GOTHIC family via Typekit (kit xjw2jyf): "Trade Gothic LT
  // Pro" (body/UI sans, measured ×96), "Trade Gothic LT Pro Condensed" (the
  // dominant UI/condensed face, measured ×164) and "Trade Gothic Next LT Pro Heavy
  // Condensed Italic" (the heavy CTA/display face, measured ×98). We reference the
  // family NAMES only, with the brand's own sans fallback chain. Mono is not part
  // of BRP — the Sentropic mono stack is kept.
  font: {
    sans: "'Trade Gothic LT Pro', 'Trade Gothic LT Pro Condensed', 'Arial Narrow', Arial, sans-serif",
    display: "'Trade Gothic Next LT Pro Heavy Condensed Italic', 'Trade Gothic LT Pro Condensed', 'Arial Narrow', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // BRP spacing: the brand sheet is a rem-based ramp (root 10px → 1rem = 10px), so
  // the measured `.btn` padding `1rem 3rem 1.2367rem` ≈ 10px/30px and field padding
  // `1.2rem 1.5rem .9rem` ≈ 12px/15px. Expressed here on the Sentropic px-equivalent
  // step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px (measured field block padding ≈ 1.2rem @10px root)
    4: "1rem", // 16px
    6: "1.5rem", // 24px (measured field inline padding ≈ 1.5rem @10px root)
    8: "2rem", // 32px
    12: "3rem", // 48px (measured CTA inline padding ≈ 3rem @10px root)
    16: "4rem" // 64px
  },
  // BRP buttons are SQUARE (measured primary `.btn` `border-radius:0`); the
  // secondary/outline `.btn` rounds to 4px (measured `.btn-secondary
  // border-radius:4px`). Fields round only their TOP corners to 6px (measured
  // `.form-control border-radius:.6rem` with `border-bottom-*-radius:0`). Pills are
  // rare (measured 999px appears for a few chips).
  radius: {
    none: "0", // square — THE BRP primary CTA (.btn border-radius:0)
    sm: "2px", // measured 2px small step
    md: "4px", // measured secondary .btn / chip radius (4px — top of the histogram)
    lg: "6px", // measured field top-corner radius (.6rem ≈ 6px)
    pill: "999px" // measured rare pill chips
  },
  // BRP elevation is light (white chrome on a grey canvas). The brand sheet uses
  // soft neutral shadows (measured header `box-shadow:2px 0 3px 0 rgba(0,0,0,.1)`,
  // navhead `2px 2px 5px 0 rgba(0,0,0,.1)`); mapped to the three Sentropic slots.
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.10)", // measured header shadow tone
    medium: "0 2px 5px rgb(0 0 0 / 0.10)", // measured navhead shadow
    floating: "0 12px 32px rgb(0 0 0 / 0.16), 0 2px 6px rgb(0 0 0 / 0.08)"
  },
  // BRP transitions: measured `.btn.link transition:all .3s ease`, more-expand panel
  // `.5s ease`. Mapped to the Sentropic ramp.
  motion: {
    fast: "150ms",
    normal: "300ms", // measured .btn.link / accent-swipe transition (.3s)
    slow: "500ms", // measured panel transition (.5s ease)
    easing: "ease" // measured .btn.link easing
  },
  // z-index roles are not BRP-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (BRP) --------------------------------------------
  // BRP field underline measured 1px solid #b2b2b2; select border 1px #aeb5b4. The
  // focus underline thickens to 2px (measured `.form-control:focus border-bottom:2px`).
  borderWidth: {
    none: "0",
    thin: "1px", // measured field underline / select stroke
    thick: "2px" // measured focus underline thickness
  },
  borderStyle: { solid: "solid" },
  // BRP control density. The measured primary `.btn` is a chunky block (padding
  // `1rem 3rem 1.2367rem` @10px root ≈ 10/30/12px, large heavy-condensed label);
  // the measured `.form-control` field is tall (padding `1.2rem 1.5rem .9rem` +
  // `select height:50px`). md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "1rem", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1.125rem" }
  },
  // BRP typography. The control/CTA label is HEAVY (measured legacy primary `.btn`:
  // `font-family:Trade Gothic Next LT Pro Heavy Condensed Italic; font-weight:800;
  // font-style:italic; text-transform:uppercase; letter-spacing:0`). Field text is
  // the condensed sans at weight 500 (measured `.form-control font-family:Trade
  // Gothic LT Pro Condensed; font-weight:500`). Labels match the body sans.
  typography: {
    control: { family: "'Trade Gothic Next LT Pro Heavy Condensed Italic', 'Trade Gothic LT Pro Condensed', sans-serif", size: "1.125rem", weight: "800", lineHeight: "1.3", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Trade Gothic LT Pro Condensed', 'Trade Gothic LT Pro', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.6", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Trade Gothic LT Pro', 'Trade Gothic LT Pro Condensed', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // BRP links: black ink, UNDERLINED at rest (measured `.layout__content a
    // text-decoration-line:underline`), with the brand's signature yellow gradient
    // swipe on hover (`.btn.link background:linear-gradient(270deg,transparent 50%,
    // #ffd200 0)`). Encoded simply as underline at rest, underline kept on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "1px", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "2px", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // BRP disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "300ms", easing: "ease" }, // measured .btn.link transition .3s ease
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // BRP FOCUS = the field bottom rule shifts to the BRAND YELLOW. The brand sheet
  // largely suppresses native outlines (measured `outline-style:none` on inputs)
  // and instead focuses fields by thickening the bottom border to `2px solid
  // #ffd200` (measured `.form-control:focus`). We encode an INSET indicator in the
  // brand yellow — matching the real bottom-rule technique rather than an offset
  // ring.
  focus: {
    strategy: "inset",
    width: "2px",
    offset: "0",
    color: brpColor.yellow[500], // #ffd200 — brand-yellow focus indicator
    inset: "0"
  },
  // BRP form fields are FILLED-UNDERLINE: a faint grey fill (#f9f9f9), NO
  // top/right/left stroke, a single grey bottom rule (1px #b2b2b2) that turns
  // brand-yellow 2px on focus, with TOP corners rounded to 6px and SQUARE bottom
  // (measured `.form-control{background:#f9f9f9; border:none; border-bottom:1px
  // solid #b2b2b2; border-radius:.6rem; border-bottom-left/right-radius:0}`). The
  // bottom rule is drawn as a box-shadow inset (`underlineMode:"shadow"`). The
  // native <select> is redrawn with a grey chevron (measured `select appearance:
  // none` + a `#4F5555` arrow data-URI, border #aeb5b4, 22px right gutter).
  field: {
    style: "filled-underline",
    fillBg: brpColor.grey.faint, // #f9f9f9 measured field fill
    underlineColor: brpColor.grey.underline, // #b2b2b2 measured 1px bottom rule
    underlineWidth: "1px",
    radiusTop: "6px", // measured .6rem top corners
    radiusBottom: "0", // measured square bottom corners
    underlineMode: "shadow", // bottom rule rendered as a box-shadow inset
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234f5555' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 1.375rem center",
    selectPaddingRight: "2.75rem" // measured ~22px chevron gutter
  },
  // BRP cards: white/grey surface, mildly rounded (4px), a soft grey border and a
  // faint grey hover (measured `.navbar a:hover background-color:#f0f0f0`).
  card: {
    borderWidth: "1px",
    lineHeight: "1.6",
    hoverBackground: brpColor.grey.page // #f0f0f0 faint grey hover
  },
  // BRP secondary button = the outline `.btn-secondary`: transparent fill, 1px black
  // border, black text, 4px radius (measured `.btn-secondary{background:transparent;
  // border:1px solid #000; border-radius:4px; color:#000}`); hovers to faint grey.
  buttonSecondary: {
    background: "transparent", // measured transparent secondary fill
    border: brpColor.ink.black, // #000 measured 1px black border
    hoverBackground: brpColor.grey.page // #f0f0f0 faint grey hover
  },
  // BRP tabs / sub-nav: active tab = black bold label with a brand-yellow bottom
  // indicator (measured `border-bottom:2px solid #ffd200` accent), transparent fill.
  tabs: {
    activeText: brpColor.ink.black, // #000 active label (BRP ink)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // brand-yellow underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // BRP pagination: borderless black link text; active page = filled brand-yellow
  // block (the brand fill) with black text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: brpColor.ink.black, // #000 black link text
    activeBackground: brpColor.yellow[500], // #ffd200 filled active page (brand yellow)
    activeText: brpColor.ink.black, // black on yellow
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // BRP breadcrumb: black links, black trail, black current page (emphasised),
  // mid-grey separators.
  breadcrumb: {
    linkText: brpColor.ink.black, // #000
    text: brpColor.ink.olive, // #585c57 muted trail text
    currentText: brpColor.ink.black, // #000 current page
    separator: brpColor.grey.underline, // #b2b2b2
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // BRP notice / alert: a tinted box with a coloured left filet matching the
  // severity (brand yellow / error red accents).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // BRP accordion / disclosure: a bold black summary trigger, square, grey-separated.
  accordion: {
    text: brpColor.ink.black, // #000 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // BRP summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // BRP tag: a small SQUARE chip with a faint grey fill and black ink (the brand's
  // sharp block language).
  tag: {
    radius: "4px", // BRP chips are lightly rounded (4px — top of the radius histogram)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: brpColor.grey.faint, // #f9f9f9 faint grey fill
    neutralText: brpColor.ink.black // #000 black
  },
  // BRP badge: a small filled badge — brand yellow fill / black text.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: brpColor.yellow[500], // #ffd200 brand yellow
    infoText: brpColor.ink.black // black on yellow
  },
  // BRP checkbox/radio label: regular black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: brpColor.ink.black // #000 black
  },
  // BRP search input: a filled grey field, base type (matches the filled-underline
  // field family).
  search: {
    paddingBlock: "0.75rem", // 12px (measured field block padding)
    paddingInline: "0.9375rem", // 15px (measured field inline padding ≈ 1.5rem @10px root)
    fontSize: "1rem", // 16px
    lineHeight: "1.6rem" // measured field line-height 1.6
  },
  // BRP toggle / switch label: regular black type (measured switch focus
  // `outline:5px auto #000`).
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: brpColor.ink.black // #000 black
  }
} as const;

// --- semantic (BRP-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: brpColor.white, // #ffffff white chrome (header.next-gen / navbar)
    subtle: brpColor.grey.page, // #f0f0f0 light grey page canvas (body bg)
    raised: brpColor.grey.faint, // #f9f9f9 faint raised panel (.more-expand)
    inverse: brpColor.ink.charcoal, // #2f2f2f charcoal reversed surface (dark banner base)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (black, 60%)
  },
  text: {
    primary: brpColor.ink.black, // #000 pure black (body / CTA ink)
    secondary: brpColor.ink.olive, // #585c57 muted grey-green secondary ink
    muted: brpColor.ink.olive, // #585c57
    inverse: brpColor.white, // #ffffff white on dark
    link: brpColor.ink.black // #000 black link ink (underlined, yellow-swipe hover)
  },
  border: {
    subtle: brpColor.grey.underline, // #b2b2b2 field underline / divider
    strong: brpColor.grey.selectBorder, // #aeb5b4 stronger select/control outline
    interactive: brpColor.yellow[500] // #ffd200 brand yellow (interactive accent)
  },
  action: {
    primary: brpColor.yellow[500], // #ffd200 THE BRP yellow CTA
    primaryHover: brpColor.yellow.gold, // #efba29 gold hover (measured warm accent)
    primaryText: brpColor.ink.black, // #000 black text on yellow (measured .btn color)
    secondary: brpColor.grey.page, // #f0f0f0 soft grey secondary surface
    secondaryHover: brpColor.grey.panel, // #e3e3e3 neutral panel hover
    secondaryText: brpColor.ink.black, // #000 black secondary label
    danger: brpColor.system.error // #d32f2f measured error red
  },
  feedback: {
    success: brpColor.system.success, // #2e7d32
    warning: brpColor.system.warning, // #8a6d3b
    error: brpColor.system.error, // #d32f2f
    info: brpColor.system.info // #2f2f2f
  },
  status: {
    pending: brpColor.system.warning, // #8a6d3b
    processing: brpColor.system.info, // #2f2f2f
    completed: brpColor.system.success, // #2e7d32
    failed: brpColor.system.error // #d32f2f
  },
  // Categorical data-vis palette. BRP does not publish a single categorical token
  // list; the eight categories below are seeded from the measured brand hexes
  // (yellow lead, charcoal, gold, teal, olive, success, error, near-black) to give
  // a legible brand-true scale. See MAPPING.md, "à confirmer" — assembled scale.
  data: {
    category1: brpColor.yellow[500], // #ffd200 brand yellow
    category2: brpColor.ink.charcoal, // #2f2f2f charcoal
    category3: brpColor.yellow.gold, // #efba29 gold
    category4: brpColor.system.teal, // #2cd5c4 teal accent
    category5: brpColor.ink.olive, // #585c57 olive ink
    category6: brpColor.system.success, // #2e7d32 success green
    category7: brpColor.system.error, // #d32f2f error red
    category8: brpColor.ink.nearBlack // #25282a near-black
  }
} as const;

/**
 * The BRP theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry BRP-specific (bold yellow-on-black) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so BRP's yellow CTA, black ink, square buttons,
 * filled-underline grey fields and yellow focus rule reach the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const brpTheme: TenantTheme = {
  id: "brp",
  label: "BRP",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default brpTheme;
