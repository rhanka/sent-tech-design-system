import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Bolloré SE brand theme for the Sentropic token structure.
 *
 * Bolloré SE is a holding company; its group site (bollore.com, a WordPress
 * institutional site) is the only brand surface measured here. The brand
 * publishes no `--*` colour tokens, so every promoted hex is a literal read
 * from the public brand stylesheets and carries a `//` comment citing its
 * real source declaration; only font *names* are referenced — never font
 * binaries. Sources, counts (with their convention) and exact provenance are
 * documented in MAPPING.md. Where the brand publishes no equivalent for a
 * Sentropic role (status green/amber, large control geometry, modal-grade
 * elevation), the closest derived value is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Bolloré SE colour reference (light theme — literal occurrences in the brand
 * region: style.css ll.6050-7289 + 7395-17839 with the embedded slick block
 * ll.7290-7394 excluded, plus style_override.css; short/long forms unified,
 * comments excluded):
 *   Brand action blue                #007bc0   (89: `.--titleBlue1/9`, `.link--blue`, forms, breadcrumb current, slider chevrons)
 *   White (body + surfaces)          #ffffff   (64: 52 `#ffffff` + 12 `#fff`)
 *   Capsule purple (red variant)     #7a1f5e   (39: 31 + 8 style_override.css)
 *   Link / footer dark grey          #58585a   (31: `a{color}`, section backgrounds)
 *   Title blue `.--titleBlue4`        #007eba   (23)
 *   Body text grey                   #585857   (18: `body{color}`)
 *   Capsule blue-green               #0089a6   (18: 15 + 3 style_override.css)
 *   Content-link blue                #0095db   (17: `.listeEnSavoirPlus__lien a`)
 *   Button blue `.--linkPlus.is-blue`#0093e0   (15)
 *   Table border blue                #007bbc   (11: `.tableau th/td`)
 *   Subsidiary-tint background       #f9f9f9   (11: `.filiale`)
 *   Nav / submenu blue               #1e7dbf   (11: submenu fill + indicator)
 *   Push-link blue (invert)          #0086cc   (9)
 *   Capsule red                      #e91c3a   (8: 6 + 2 style_override.css)
 *   Title blue `.--titleBlue2`        #0f88a5   (7)
 *   Title red `.--titleRed3`          #ef153e   (7)
 *   Capsule grey                     #6c8ca6   (6: 1 + 5 style_override.css)
 *   Push-invert background           #f1f0ee   (4: `.blockPushInfo--invert`)
 *   Key-figure red                   #ce1a37   (3: `.chiffre__txt1`, popin)
 *   Title blue `.--titleBlue3`        #2a95cf   (2)
 *   Title grey `.--titleGrey2`        #839bb1   (2)
 *   Title red `.--titleRed2`          #ad0911   (2)
 *   Mobile submenu grey (vendor-zone)#a0a3a5   (2, retained — not promoted)
 *   Alert banner red                 #e32948   (1: `.alertBannerHome`)
 *   Logo asset blue (SVG only)       #003764   (0 in CSS/HTML — not promoted, see Asset officiel)
 */

// --- Bolloré SE raw colour palette ------------------------------------------
const bolloreColor = {
  // Brand action blue — the single dominant brand hue. No `--*` token declares
  // it (the sheet's only `:root` rule sets `--check-primary:-10px`); it is
  // painted literally 89 times (style.css brand region: `.--titleBlue1`,
  // `.--titleBlue9`, `.link--blue`, `.filtreDocuments select`, forms, breadcrumb).
  brand: {
    primary: "#007bc0", // `.--titleBlue1` / `.--titleBlue9` + `.link--blue`
    hover: "#006ba7", // derived darker blue, 1 HSL step (H/S kept, L-0.05), white-on 5.74 (à confirmer)
    light: "#dbf2ff" // derived light blue tint (H/S kept, L=0.93) for low-emphasis surfaces (à confirmer)
  },
  // Measured blue ramp, all read in the brand region of style.css.
  blue: {
    title4: "#007eba", // `.--titleBlue4` (23 occurrences)
    contentLink: "#0095db", // `.listeEnSavoirPlus__lien a` (17 occurrences)
    buttonBlue: "#0093e0", // `.--linkPlus.is-blue` background (15 occurrences)
    tableBorder: "#007bbc", // `.tableau th/td{border:1px solid}` (11 occurrences, 4.61:1 on white)
    nav: "#1e7dbf", // submenu fill + menu indicator (11 occurrences)
    pushInvert: "#0086cc", // `.blockPushInfo--invert` link/border (9 occurrences)
    title2: "#0f88a5", // `.--titleBlue2` (7 occurrences)
    title3: "#2a95cf" // `.--titleBlue3` (2 occurrences)
  },
  accent: {
    purple: "#7a1f5e", // `.--titleRed5` + `.capsule--purple` (39: 31 + 8 style_override.css)
    blueGreen: "#0089a6", // capsule `.is-bluegreen` (18: 15 + 3 style_override.css)
    greyBlue: "#6c8ca6" // capsule `.is-grey` (6: 1 + 5 style_override.css, 3.54:1 on white)
  },
  grey: {
    0: "#ffffff", // `body{background-color}` + surfaces (64 unified occurrences)
    50: "#f9f9f9", // `.filiale{background}` subsidiary tint (11 occurrences)
    100: "#f1f0ee", // `.blockPushInfo--invert{background-color}` (4 occurrences)
    600: "#839bb1", // `.--titleGrey2` (2 occurrences; 2.88:1 on white — never text)
    700: "#58585a", // `a{color}` + section backgrounds (31 occurrences, 7.10:1)
    800: "#585857", // `body{color}` body text (18 occurrences, 7.12:1)
    900: "#58585a" // converges with 700: the darkest painted grey is the link grey (see MAPPING.md)
  },
  // Reds. The error role takes the key-figure red, the only red that clears
  // 4.5:1 as text on white; the banner/capsule reds stay fills.
  red: {
    error: "#ce1a37", // `.chiffre__txt1{color}` + `.popin--information{background}` (3 occurrences, 5.49:1)
    capsule: "#e91c3a", // `.listeEnSavoirPlus__lien.is-red a` (8: 6 + 2 style_override.css)
    title3: "#ef153e", // `.--titleRed3` (7 occurrences)
    banner: "#e32948", // `.alertBannerHome{background}` (1 occurrence)
    title2: "#ad0911" // `.--titleRed2` (2 occurrences, 7.44:1)
  },
  // System / status colours. The brand publishes no green and no amber (the
  // 30-hex inventory holds blues, greys, whites and reds only), so success
  // and warning are derived stand-ins chosen to clear WCAG AA on white
  // (à confirmer); error reuses the measured key-figure red.
  system: {
    success: "#1e7e34", // derived legible green (5.14:1 on white)
    error: "#ce1a37", // measured key-figure red (5.49:1 on white)
    warning: "#8a4b00", // derived dark amber (6.80:1 on white)
    info: "#007bc0" // brand action blue in the info role (4.57:1 on white)
  }
} as const;

// --- foundation (Bolloré-specific values) ------------------------------------
const foundation = {
  color: {
    // The brand's colour of action is the painted blue, not a tint scale.
    blue: {
      10: bolloreColor.brand.light, // #dbf2ff derived light tint (à confirmer)
      60: bolloreColor.brand.primary, // #007bc0 brand action blue
      80: bolloreColor.brand.hover // #006ba7 derived darker blue (à confirmer)
    },
    // The brand publishes no cyan accent; the slot carries the measured
    // blue-green/grey-blue capsule accents over a measured near-white.
    cyan: {
      10: bolloreColor.grey[50], // #f9f9f9 subsidiary tint
      50: bolloreColor.accent.blueGreen, // #0089a6 capsule blue-green (4.09:1 — lines/fills, never text)
      70: bolloreColor.blue.title2 // #0f88a5 title blue (4.13:1 — lines/fills, never text)
    },
    // Sentropic "slate" role family mapped onto the measured grey ramp.
    slate: {
      0: bolloreColor.grey[0], // white
      10: bolloreColor.grey[50], // subsidiary tint
      20: bolloreColor.grey[100], // push-invert background
      60: bolloreColor.grey[700], // link grey
      80: bolloreColor.grey[800], // body text
      90: bolloreColor.grey[900] // converges with 60 (darkest painted grey)
    },
    feedback: {
      success: bolloreColor.system.success,
      warning: bolloreColor.system.warning,
      error: bolloreColor.system.error,
      info: bolloreColor.system.info
    }
  },
  // Bolloré SE ships Gotham for everything (body, controls, hero titles in
  // Gotham 700/800, self-hosted 400/700/800 in style.css `@font-face`); the
  // Google Fonts Candal import has a single decorative use (key figures) and
  // is not promoted (see MAPPING.md). We reference the font *names* only.
  font: {
    sans: "'Gotham', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Gotham', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand authors its lengths in rem at a 10px
  // root and in px — à confirmer).
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Bolloré SE corners are square: the brand region carries no `border-radius`
  // on any control (the only two hits are the decorative loader `50%`); pills
  // stay structural (à confirmer).
  radius: {
    none: "0",
    sm: "0", // square controls (measured absence)
    md: "0", // square buttons / inputs / tables (measured absence)
    lg: "0", // square banners / cards (measured absence)
    pill: "999px" // structural pill default (à confirmer)
  },
  // Publication images carry `box-shadow:0px 1px 3px 1px rgba(163,163,163,.48)`
  // (`.pub__image`); no elevation system is published, so medium/floating stay
  // neutral, aligned with the reference theme package's geometry (à confirmer).
  shadow: {
    subtle: "0px 1px 3px 1px rgba(163, 163, 163, 0.48)", // measured image shadow
    medium: "0 4px 12px rgb(0 0 0 / 0.14)", // (à confirmer)
    floating: "0 8px 24px rgb(0 0 0 / 0.18)" // (à confirmer)
  },
  // Measured transition durations: menu indicator `all 0.2s ease`, submenu
  // links `all 0.25s ease` / `0.3s`, header logo and push links `all 0.6s
  // ease`; `ease` dominates (slider uses `0.5s ease-out` / `linear`).
  motion: {
    fast: "200ms", // menu-indicator `transition:all 0.2s ease`
    normal: "300ms", // submenu `transition:all 0.3s ease`
    slow: "600ms", // header-logo `transition:all 0.6s ease`
    easing: "ease" // dominant brand easing
  },
  // Measured stacking: nav submenu `z-index:2000`, generic `.overlay` 999,
  // disclaimer overlay 3000; toast/chat unpublished (à confirmer).
  z: {
    header: 2000,
    toast: 60,
    overlay: 999,
    modal: 3000,
    chat: 110
  },
  // --- Anatomy primitives (Bolloré SE) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // forms, tables and push links are 1px
    thick: "2px" // `.linkG{border:2px solid #007bc0}` CTA stroke
  },
  borderStyle: { solid: "solid" },
  // Control density: the brand publishes no standard control-height system —
  // controls are sized in em inside scoped components (filter select
  // `font-size:2em` + `padding:0.4em 2.9em 0.45em 0.95em`, forms `font-size:18px`
  // with no height, header search with `padding-top:3px` only). Greps quoted in
  // MAPPING.md. Base values reused explicitly (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  },
  // Bolloré typography: Gotham everywhere; forms set 18px/400
  // (`.formsBloc input/select/textarea{font-size:18px}` = 1.125rem); labels
  // unpublished (à confirmer); content links underlined at rest, plain on
  // hover (`.listeEnSavoirPlus__lien a` — the base `a` stays unadorned, noted
  // in MAPPING.md).
  typography: {
    control: { family: "'Gotham', system-ui, sans-serif", size: "1.125rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Gotham', system-ui, sans-serif", size: "1.125rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Gotham', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Content links are the brand blue `#007bc0`
    // (`.link--blue`, `.listeEnSavoirPlus__lien a{color:#0095db}` family),
    // underlined at rest, plain on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.55", // Sentropic base value (à confirmer — no disabled-control rule; brand `opacity:0.5` is a hero-image treatment)
  transition: { property: "all", duration: "250ms", easing: "ease" }, // measured nav/submenu transition
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS: the brand publishes no focus technique — the brand region holds
  // only scoped `outline:none` resets (logo link, header search input, menu
  // links, popin link) and no positive `outline`/`:focus-visible`/ring rule
  // after them (last focus rule: `.popin--information .popin__link:focus`).
  // Strategy stays the browser-default outline; the colour is routed to the
  // measured brand blue (4.57:1 on white, clears the 3:1 line floor).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: bolloreColor.brand.primary, // #007bc0 brand blue (role assignment à confirmer)
    inset: "0"
  },
  // Form fields are BOXED (outline): white fill, 1px brand-blue stroke
  // (`.formsBloc input{color + border #007bc0}`, `.formsBloc__textarea{border:1px
  // solid #007bc0}`, `.filtreDocuments select{border:solid 1px #007bc0}` with
  // `appearance:none`). `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.strong`.
  field: {
    style: "outline",
    fillBg: bolloreColor.grey[0], // #ffffff forms background
    underlineColor: bolloreColor.brand.primary, // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23007bc0' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: subsidiary-tint blocks (`.filiale{background:#f9f9f9}`); hover fill
  // composed from the measured push-invert tint (à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: bolloreColor.grey[100] // #f1f0ee push-invert tint
  },
  // Secondary button = invert push link: transparent fill, `#0086cc` stroke,
  // brand-blue hover fill with near-white text (measured
  // `.blockPushInfo--invert` pairing — composition à confirmer).
  buttonSecondary: {
    background: "transparent",
    border: "#0086cc", // invert push-link stroke
    hoverBackground: bolloreColor.brand.primary // #007bc0 measured hover fill
  },
  // Top-nav: bold menu links (15px/10px padding, 1.6rem) turning `#1e7dbf` on
  // hover over a `#1e7dbf` submenu with white links; the active tab carries
  // the measured action blue with a bottom border indicator (colours measured,
  // tab composition à confirmer).
  tabs: {
    activeText: bolloreColor.brand.primary, // #007bc0 action blue
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.9375rem", // 15px menu-link padding
    paddingInline: "0.625rem", // 10px menu-link padding
    fontSize: "1rem", // 1.6rem at the 10px root
    lineHeight: "1.3", // submenu links
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: no page-box published; slider chevrons in action blue
  // (`.slider__next/.slider__prev{color:#007bc0}`, red variant `#7a1f5e`) with
  // a pointer cursor; active page = filled blue with white text (measured
  // white-on-blue pairing — composition à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bolloreColor.grey[700], // #58585a link grey
    activeBackground: bolloreColor.brand.primary, // #007bc0 filled active page
    activeText: bolloreColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb transcribed from `.breadcrumb` (14px/500 Gotham, current page
  // `#007bc0` via `.breadcrumb__last`, red variant `#7a1f5e` noted).
  breadcrumb: {
    linkText: bolloreColor.grey[700], // #58585a inherited link grey
    text: bolloreColor.grey[700], // #58585a trail text
    currentText: bolloreColor.brand.primary, // #007bc0 current page
    separator: bolloreColor.grey[700], // #58585a
    fontSize: "0.875rem", // 1.4rem at the 10px root
    lineHeight: "1.5rem", // unpublished (à confirmer)
    currentWeight: "500"
  },
  // Alert transcribed from the homepage banner
  // (`.alertBannerHome{background:#E32948;padding:25px 60px}`, Gotham 14px/400
  // white text with underlined links, icomoon glyph marker).
  alert: {
    background: bolloreColor.red.banner, // #e32948 measured banner fill
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0",
    paddingTop: "1.5625rem", // 25px
    paddingRight: "3.75rem", // 60px
    paddingBottom: "1.5625rem", // 25px
    paddingLeft: "3.75rem", // 60px
    fontSize: "0.875rem", // 1.4rem at the 10px root
    lineHeight: "1.5rem" // `line-height:normal` (à confirmer)
  },
  // Accordion: no accordion component published (only `.faqLink:hover` and a
  // `.faqBlock table` shell) — text from the body grey, geometry structural
  // (à confirmer).
  accordion: {
    text: bolloreColor.grey[800], // #585857 body grey
    paddingBlock: "1.25rem", // 20px
    paddingInline: "1.25rem", // 20px
    fontSize: "1rem", // 16px
    fontWeight: "400",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: no chip published; square subsidiary-tint chip (derived — à confirmer).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: bolloreColor.grey[50], // #f9f9f9
    neutralText: bolloreColor.grey[700] // #58585a
  },
  // Badge: square badge in the action blue with white text (measured
  // white-on-blue pairing — à confirmer).
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: bolloreColor.brand.primary, // #007bc0
    infoText: bolloreColor.grey[0] // white
  },
  // Choice label transcribed from the forms type size (`font-size:18px` =
  // 1.125rem); no checkbox/radio published (à confirmer).
  choice: {
    labelFontSize: "1.125rem", // 18px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: bolloreColor.grey[800] // #585857 body grey
  },
  // Search input transcribed from the header search
  // (`.header-info-search{font-size:1.5rem;line-height:1.5rem;font-style:italic}`,
  // input with `padding-top:3px`; geometry completed structurally — à confirmer).
  search: {
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.9375rem", // 1.5rem at the 10px root
    lineHeight: "1.5rem" // block line-height
  },
  // Toggle / switch label (à confirmer — no switch published).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: bolloreColor.grey[800] // #585857
  }
} as const;

// --- semantic (Bolloré-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: bolloreColor.grey[0], // white (`body{background-color:#ffffff}`)
    subtle: bolloreColor.grey[50], // #f9f9f9 (`.filiale{background}`)
    raised: bolloreColor.grey[0], // white
    inverse: bolloreColor.grey[700], // #58585a painted section backgrounds
    overlay: "rgba(0, 0, 0, 0.7)" // generic `.overlay{position:fixed;background}` backdrop
  },
  text: {
    primary: bolloreColor.grey[800], // #585857 body text (7.12:1 on white)
    secondary: bolloreColor.grey[700], // #58585a base links (7.10:1 on white)
    muted: bolloreColor.accent.greyBlue, // #6c8ca6 capsule grey (3.54:1 on white — documented arbitration)
    inverse: bolloreColor.grey[0], // white on dark / blue surfaces
    link: bolloreColor.brand.primary // #007bc0 content-link blue (4.57:1 on white)
  },
  border: {
    subtle: bolloreColor.blue.tableBorder, // #007bbc content-table borders (4.61:1 on white)
    strong: bolloreColor.brand.primary, // #007bc0 form/select strokes
    interactive: bolloreColor.brand.primary // #007bc0 (4.57:1 on white, clears the 3:1 line floor)
  },
  action: {
    primary: bolloreColor.brand.primary, // #007bc0 brand action blue
    primaryHover: bolloreColor.brand.hover, // #006ba7 derived darker blue (à confirmer)
    primaryText: bolloreColor.grey[0], // white on blue (4.57:1)
    secondary: bolloreColor.grey[50], // #f9f9f9 subsidiary tint
    secondaryHover: bolloreColor.grey[100], // #f1f0ee push-invert tint
    secondaryText: bolloreColor.grey[800], // #585857 on tint (6.76:1)
    danger: bolloreColor.system.error // #ce1a37 measured key-figure red (white-on 5.49)
  },
  feedback: {
    success: bolloreColor.system.success,
    warning: bolloreColor.system.warning,
    error: bolloreColor.system.error,
    info: bolloreColor.system.info
  },
  status: {
    pending: bolloreColor.system.warning,
    processing: bolloreColor.system.info,
    completed: bolloreColor.system.success,
    failed: bolloreColor.system.error
  },
  // Categorical data-vis palette built from the brand blues + ramp. The brand
  // publishes no chart scale, so this is a coherent proposal drawn from the
  // measured title blues, greys and capsule accents (see MAPPING.md, "à confirmer").
  data: {
    category1: bolloreColor.brand.primary, // #007bc0 action blue
    category2: bolloreColor.grey[700], // #58585a link grey
    category3: bolloreColor.system.success, // green
    category4: bolloreColor.system.warning, // amber
    category5: bolloreColor.system.error, // #ce1a37 red
    category6: bolloreColor.blue.nav, // #1e7dbf nav blue
    category7: bolloreColor.accent.purple, // #7a1f5e purple
    category8: bolloreColor.accent.greyBlue // #6c8ca6 grey-blue
  }
} as const;

/**
 * The Bolloré SE theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Bolloré-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the action blue reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const bolloreTheme: TenantTheme = {
  id: "bollore",
  label: "Bolloré",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bolloreTheme;

