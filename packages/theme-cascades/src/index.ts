import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * CASCADES (cascades.com — the Québec eco-friendly packaging, hygiene & recovery
 * company) theme for the Sentropic token structure.
 *
 * Cascades ships its corporate site on a Drupal theme ("cascades_corpo") built on
 * Bootstrap, with a named brand palette exposed as CSS custom properties in
 * `:root` (`--vert-cascades`, `--vert-pale`, `--creme`, `--bleu-recyclage`, …).
 * Every value below is MEASURED from the live site's CSS bundles
 * (https://www.cascades.com/en, the two compiled `cascades_corpo` stylesheets:
 * the `:root` token table + computed styles on `.btn-primary`, `.form-control`,
 * `.heading-*`, anchors and `@font-face`). We reference font *names* only
 * ("Roboto-Regular" body, "Cambon-ExtraBold" serif display — measured
 * `font-family` / `@font-face`), never font binaries. Sources and the full
 * mapping table are in MAPPING.md.
 *
 * Cascades's identity is an ECO / RECYCLED-PACKAGING system: the DEEP FOREST
 * CASCADES GREEN (#00483c, `--vert-cascades`) drives every primary action, the
 * brand mark, links and headings; surfaces are WHITE on a light page, BUT the
 * recycled-brand signature is that FORM FIELDS are filled with a warm RECYCLED-
 * PAPER CREAM (#ebe8db, `--creme`) — not white — inside a thin warm-grey stroke
 * (#b9bab2, `--gris-chaud`). Ink is a soft warm near-black (#464646, `--tundora`,
 * the measured body colour — not pure black). Corners are GENEROUSLY rounded
 * (10px on controls — `border-radius:1rem` at the site's 62.5% / 10px root).
 * Display headings are a SERIF (Cambon), body/UI is Roboto. Focus is a soft GREEN
 * RING (box-shadow, brand green at 25% alpha) with a bright turquoise field
 * border on focus (#00c8a6). Where Sentropic needs a role Cascades does not
 * publish, the closest measured token is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Cascades colour reference (measured `:root` custom properties + computed CSS):
 *   Cascades green (action / brand / link / heading)  #00483c  --vert-cascades / --primary
 *   Green hover (button-primary:hover bg)             #00221c  measured .btn-primary:hover
 *   Green active/hover border                         #001512  measured .btn-primary:hover border
 *   Mid green (vert-pale)                             #0f774b  --vert-pale
 *   Apple green (vert-pomme)                          #84bd00  --vert-pomme
 *   Lime (vert-lime)                                  #c8dc5f  --vert-lime
 *   Sage green (vert-sauge)                           #7ea88b  --vert-sauge
 *   Mint (menthe, faint green tint)                   #dbede4  --menthe
 *   Focus ring base / shadow tint                     rgba(0,72,60,…)  measured box-shadow
 *   Field focus border (turquoise)                    #00c8a6  measured .form-control:focus border-color
 *   Recycled-paper cream (field fill)                 #ebe8db  --creme
 *   Pale cream (creme-pale)                           #f3f2ed  --creme-pale
 *   Sand (sable)                                      #e2cca0  --sable
 *   Anchor brown (ancre)                              #5a422f  --ancre
 *   Recycling blue (bleu-recyclage / secondary)       #0064a8  --bleu-recyclage / --secondary
 *   Emerald blue (bleu-emeraude)                      #2a8b9a  --bleu-emeraude
 *   Deep blue (bleu-profond)                          #254252  --bleu-profond
 *   Aqua                                              #2cd5c4  --aqua
 *   Warm ink / body text (tundora)                    #464646  --tundora (measured body color)
 *   Field text ink                                    #495057  measured .form-control color
 *   Body ink (bootstrap base)                         #212529  measured body / .btn color
 *   Warm grey (gris-chaud, field stroke)              #b9bab2  --gris-chaud (1px field border)
 *   Gallery grey (divider)                            #eeeeee  --gallery
 *   Alabaster (faint surface)                         #f7f7f7  --alabaster
 *   Muted grey                                        #6c757d  --gray (bootstrap)
 *   White (surface default)                           #ffffff  measured body background-color
 *   Rust red (rouge-rouille brand accent)             #cc472b  --rouge-rouille
 *   System danger / red                               #dc3545  --danger (bootstrap)
 *   System success / green                            #28a745  --success (bootstrap)
 *   System warning / amber                            #ffc107  --warning (bootstrap)
 *   System info / teal                                #17a2b8  --info (bootstrap)
 *   Jaune (yellow brand)                              #ffbf3f  --jaune
 *   Orange (brand)                                    #f89844  --orange
 */

// --- CASCADES raw colour palette (measured `:root` / computed CSS) -----------
const cascadesColor = {
  // The brand IS the deep forest Cascades green. Used for the logo, every primary
  // CTA, links and headings.
  green: {
    cascades: "#00483c", // --vert-cascades / --primary — THE Cascades green
    hover: "#00221c", // measured .btn-primary:hover background-color (darkens toward black-green)
    hoverBorder: "#001512", // measured .btn-primary:hover border-color (darkest)
    pale: "#0f774b", // --vert-pale — brighter mid green
    pomme: "#84bd00", // --vert-pomme — apple green
    lime: "#c8dc5f", // --vert-lime — lime
    sauge: "#7ea88b", // --vert-sauge — muted sage green
    menthe: "#dbede4", // --menthe — faint mint tint (light green surface)
    focusTurquoise: "#00c8a6" // measured .form-control:focus border-color — bright turquoise focus accent
  },
  // Warm, recycled-paper neutrals (the eco signature).
  cream: {
    creme: "#ebe8db", // --creme — recycled-paper cream (the measured field fill)
    cremePale: "#f3f2ed", // --creme-pale — paler cream surface
    sable: "#e2cca0", // --sable — sand
    ancre: "#5a422f" // --ancre — anchor brown
  },
  // Blue / aqua secondary family (recycling blue).
  blue: {
    recyclage: "#0064a8", // --bleu-recyclage / --secondary — recycling blue (secondary action / accent)
    emeraude: "#2a8b9a", // --bleu-emeraude
    profond: "#254252", // --bleu-profond — deep navy-teal
    aqua: "#2cd5c4" // --aqua
  },
  // Warm near-black ink scale (Cascades body ink is warm grey, never pure black).
  ink: {
    body: "#464646", // --tundora — measured body color (warm soft near-black) — primary text
    bootstrap: "#212529", // measured bootstrap base body / .btn color — high-contrast ink
    field: "#495057", // measured .form-control color — field text ink
    muted: "#6c757d" // --gray (bootstrap) — secondary / muted text
  },
  // Cool grey neutral scale.
  grey: {
    field: "#b9bab2", // --gris-chaud — measured 1px field/select stroke
    gallery: "#eeeeee", // --gallery — soft divider
    alabaster: "#f7f7f7", // --alabaster — faint surface tint
    silder: "#bbbbbb" // --silder
  },
  white: "#ffffff", // measured body background-color — surface default
  // System / status colours (Bootstrap theme defaults, measured `:root`).
  system: {
    danger: "#dc3545", // --danger / --red
    rust: "#cc472b", // --rouge-rouille — brand rust accent (warmer error-adjacent tone)
    success: "#28a745", // --success / --green
    warning: "#ffc107", // --warning / --yellow
    info: "#17a2b8", // --info / --cyan
    jaune: "#ffbf3f", // --jaune — brand yellow
    orange: "#f89844" // --orange — brand orange
  }
} as const;

// --- foundation (CASCADES-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Cascades's PRIMARY
    // ACTION is the deep forest green, so the action steps are mapped to the green
    // scale; the lightest step is the faint mint tint.
    blue: {
      10: cascadesColor.green.menthe, // #dbede4 faint mint tint
      60: cascadesColor.green.cascades, // #00483c THE Cascades green (primary action)
      80: cascadesColor.green.hover // #00221c dark hover green (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Cascades's secondary accent is the recycling
    // BLUE (#0064a8), a genuine distinct cool accent on the site.
    cyan: {
      10: cascadesColor.blue.aqua, // #2cd5c4 aqua tint
      50: cascadesColor.blue.recyclage, // #0064a8 recycling blue accent
      70: cascadesColor.blue.profond // #254252 deep blue
    },
    // Sentropic "slate" neutral family mapped onto the Cascades warm-grey ink and
    // cool greys.
    slate: {
      0: cascadesColor.white, // #ffffff white
      10: cascadesColor.grey.alabaster, // #f7f7f7 faint surface
      20: cascadesColor.grey.gallery, // #eeeeee divider / subtle border
      60: cascadesColor.ink.muted, // #6c757d secondary text
      80: cascadesColor.ink.body, // #464646 primary text (warm near-black)
      90: cascadesColor.ink.bootstrap // #212529 high-contrast ink
    },
    feedback: {
      success: cascadesColor.system.success,
      warning: cascadesColor.system.warning,
      error: cascadesColor.system.danger,
      info: cascadesColor.system.info
    }
  },
  // Cascades serves "Roboto" for body/UI and the proprietary SERIF "Cambon" for
  // display headings (measured `font-family` + `@font-face`). The brand uses the
  // exact face names "Roboto-Regular"/"Roboto-Bold"/"Roboto-Light" with a "Gotham"
  // fallback, and "Cambon-ExtraBold"/"Cambon-Regular" with an "Arial", serif
  // fallback for headings. We reference NAMES only. Mono is not part of Cascades —
  // the Sentropic mono stack is kept.
  font: {
    sans: "'Roboto-Regular', 'Gotham', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    display: "'Cambon-ExtraBold', 'Cambon-Regular', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Cascades spacing: the site uses a 10px root (font-size:62.5%) with rem-based
  // padding (.25rem / .5rem / 1rem / 2rem / 3rem on controls = 2.5/5/10/20/30px).
  // Aligned here to the Sentropic step keys (kept on the standard 4px ramp — the
  // exact site ramp is rem-based on a 10px root, à confirmer).
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
  // Cascades rounds GENEROUSLY. The measured control radius is `border-radius:1rem`
  // = 10px (the site root is 62.5% / 10px); inputs are 6px; large surfaces step up
  // to big organic corners (10–15rem one-corner). md = the 10px control radius.
  radius: {
    none: "0", // square (some media tiles)
    sm: "6px", // measured .form-control border-radius (6px)
    md: "10px", // measured .btn border-radius (1rem @ 10px root) — control radius
    lg: "16px", // larger surfaces / cards (à confirmer — derived step)
    pill: "999px" // measured 50rem pill buttons / round chips
  },
  // Cascades elevation is not exposed as named tokens; the measured shadows are
  // soft, low-opacity drops. Mapped to the three Sentropic slots (à confirmer —
  // exact site values are component-local).
  shadow: {
    subtle: "0px 1px 3px rgb(0 0 0 / 0.10)",
    medium: "0px 4px 12px rgb(0 0 0 / 0.12)",
    floating: "0px 12px 32px rgb(0 0 0 / 0.16), 0px 2px 6px rgb(0 0 0 / 0.08)"
  },
  // Cascades transitions are short and standard (measured 0.15s ease-in-out on
  // buttons, fields and links). Exact tokens are not published; kept aligned.
  motion: {
    fast: "150ms", // measured 0.15s on .btn / .form-control / a
    normal: "200ms",
    slow: "320ms",
    easing: "ease-in-out" // measured ease-in-out
  },
  // z-index roles are not Cascades-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (CASCADES) ---------------------------------------
  // Cascades field/select borders measured at 1px solid #b9bab2; buttons use a
  // 2px solid border (the brand's signature thick CTA stroke).
  borderWidth: {
    none: "0",
    thin: "1px", // measured field stroke 1px solid #b9bab2
    thick: "2px" // measured .btn border: 2px solid
  },
  borderStyle: { solid: "solid" },
  // Cascades control density. Measured CTA: padding .375rem 3rem (≈4px/30px) with a
  // 1.6rem/16px label; measured input: height calc(1.5em + 2rem + 2px) ≈ 46px with
  // 1rem/2rem (10px/20px) padding and 1.6rem/16px text. md targets a comfortable
  // ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Cascades typography: body/UI/fields = Roboto regular (400); DISPLAY headings =
  // the serif Cambon ExtraBold. Base type is 16px (1.6rem @ 10px root). Control
  // labels are regular weight (measured .btn font-weight: 400). Headings are
  // green serif (.heading-xlarge color #00483c, "Cambon-ExtraBold").
  typography: {
    control: { family: "'Roboto-Regular', 'Gotham', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto-Regular', 'Gotham', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto-Bold', 'Gotham', sans-serif", size: "1rem", weight: "700", lineHeight: "1.4", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cascades links are the brand green and underline on hover (measured anchor
    // color #00483c).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0.02em", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.65", // Cascades disables via bootstrap .disabled opacity:.65 (measured)
  transition: { property: "color, background-color, border-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // CASCADES FOCUS = a soft GREEN RING (box-shadow), not an outline. Measured
  // `.btn:focus` / `.form-control:focus` box-shadow `0 0 0 .2rem rgba(0,72,60,…)`
  // — the brand green at low alpha. Encoded as the "ring" strategy with the brand
  // green; .2rem ≈ 2px (3.2px at the site's 10px root) spread.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "0",
    color: "rgb(0 72 60 / 0.5)", // measured box-shadow tint rgba(0,72,60,0.5) — brand green ring
    inset: "0"
  },
  // CASCADES form fields are FILLED OUTLINES with a recycled-paper cream fill — the
  // eco signature: a #ebe8db (`--creme`) fill inside a 1px warm-grey (#b9bab2)
  // stroke, 6px radius (measured .form-control). We use `style: "outline"` so the
  // builder draws four equal borders, and override `fillBg` to the cream so the
  // field reads as recycled paper rather than plain white. On focus the border
  // turns bright turquoise (#00c8a6) with the green ring. The native <select>
  // chevron is redrawn in the brand green with a right gutter.
  field: {
    style: "outline",
    fillBg: cascadesColor.cream.creme, // #ebe8db recycled-paper cream fill
    underlineColor: cascadesColor.grey.field, // #b9bab2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300483c' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Cascades cards: white surface, generously rounded, a soft warm-grey border and
  // a faint mint-tinted hover (the brand's light green surface).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: cascadesColor.green.menthe // #dbede4 faint mint hover
  },
  // Cascades secondary button = OUTLINED green ghost: transparent fill, green text
  // + green border (measured .btn-outline-primary color/border-color #00483c),
  // faint mint fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: cascadesColor.green.cascades, // #00483c green stroke
    hoverBackground: cascadesColor.green.menthe // #dbede4 faint mint fill on hover
  },
  // Cascades tabs / sub-nav: active tab = green bold label with a green bottom
  // indicator, transparent fill.
  tabs: {
    activeText: cascadesColor.green.cascades, // #00483c active label (brand green)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Cascades base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // green underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Cascades pagination: borderless green link text; active page = filled green
  // box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cascadesColor.green.cascades, // #00483c link text (Cascades links are green)
    activeBackground: cascadesColor.green.cascades, // #00483c filled active page (brand green)
    activeText: cascadesColor.white, // white on green
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cascades breadcrumb: green links, warm-grey trail, body ink current page.
  breadcrumb: {
    linkText: cascadesColor.green.cascades, // #00483c
    text: cascadesColor.ink.muted, // #6c757d trail text
    currentText: cascadesColor.ink.body, // #464646 current page
    separator: cascadesColor.ink.muted, // #6c757d
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Cascades notice / alert: a tinted box with a coloured left filet matching the
  // severity.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cascades accordion / disclosure: a bold green-ink summary trigger, generously
  // rounded.
  accordion: {
    text: cascadesColor.green.cascades, // #00483c summary label (brand green)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // Cascades summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // Cascades tag: a small PILL chip with a faint mint fill and brand-green ink.
  tag: {
    radius: "999px", // Cascades chips round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: cascadesColor.green.menthe, // #dbede4 mint fill
    neutralText: cascadesColor.green.cascades // #00483c brand green
  },
  // Cascades badge: a small filled badge — brand green fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: cascadesColor.green.cascades, // #00483c brand green
    infoText: cascadesColor.white // white on green
  },
  // Cascades checkbox/radio label: regular warm-ink type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: cascadesColor.ink.body // #464646
  },
  // Cascades search input: the cream-filled boxed field, base type.
  search: {
    paddingBlock: "1rem", // 10px (1rem @ 10px root)
    paddingInline: "2rem", // 20px (2rem @ 10px root)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cascades toggle / switch label: regular warm-ink type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: cascadesColor.ink.body // #464646
  }
} as const;

// --- semantic (CASCADES-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: cascadesColor.white, // #ffffff white (measured body background-color)
    subtle: cascadesColor.cream.cremePale, // #f3f2ed pale recycled cream (eco page tone)
    raised: cascadesColor.white, // #ffffff white
    inverse: cascadesColor.green.cascades, // #00483c deep forest green reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (à confirmer — site uses dark overlays)
  },
  text: {
    primary: cascadesColor.ink.body, // #464646 (--tundora, measured body color — warm near-black)
    secondary: cascadesColor.ink.muted, // #6c757d (--gray)
    muted: cascadesColor.ink.muted, // #6c757d
    inverse: cascadesColor.white, // white on dark/green surfaces
    link: cascadesColor.green.cascades // #00483c (measured anchor color — Cascades links are green)
  },
  border: {
    subtle: cascadesColor.grey.gallery, // #eeeeee divider
    strong: cascadesColor.grey.field, // #b9bab2 field / input stroke (--gris-chaud)
    interactive: cascadesColor.green.cascades // #00483c brand green (interactive accent)
  },
  action: {
    primary: cascadesColor.green.cascades, // #00483c THE Cascades green CTA
    primaryHover: cascadesColor.green.hover, // #00221c (measured .btn-primary:hover)
    primaryText: cascadesColor.white, // white text on green
    secondary: cascadesColor.cream.creme, // #ebe8db recycled-paper cream secondary surface
    secondaryHover: cascadesColor.green.menthe, // #dbede4 mint hover
    secondaryText: cascadesColor.green.cascades, // #00483c green secondary label
    danger: cascadesColor.system.danger // #dc3545 (--danger)
  },
  feedback: {
    success: cascadesColor.system.success, // #28a745
    warning: cascadesColor.system.warning, // #ffc107
    error: cascadesColor.system.danger, // #dc3545
    info: cascadesColor.system.info // #17a2b8
  },
  status: {
    pending: cascadesColor.system.warning, // #ffc107
    processing: cascadesColor.system.info, // #17a2b8
    completed: cascadesColor.system.success, // #28a745
    failed: cascadesColor.system.danger // #dc3545
  },
  // Categorical data-vis palette. Cascades publishes a rich named brand palette
  // (vert-cascades, vert-pale, vert-pomme, bleu-recyclage, bleu-emeraude,
  // bleu-profond, aqua, rouge-rouille, …); the eight categories below are seeded
  // from those measured `:root` brand hues, led by the brand green. See MAPPING.md,
  // "à confirmer" — this is an assembled categorical scale, not one published
  // categorical token list.
  data: {
    category1: cascadesColor.green.cascades, // #00483c brand green
    category2: cascadesColor.blue.recyclage, // #0064a8 recycling blue
    category3: cascadesColor.green.pomme, // #84bd00 apple green
    category4: cascadesColor.blue.emeraude, // #2a8b9a emerald blue
    category5: cascadesColor.system.orange, // #f89844 orange
    category6: cascadesColor.green.pale, // #0f774b mid green
    category7: cascadesColor.blue.profond, // #254252 deep blue
    category8: cascadesColor.system.rust // #cc472b rust red
  }
} as const;

/**
 * The CASCADES theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Cascades-specific (forest-green-on-cream eco)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Cascades's green CTA, warm ink,
 * recycled-paper cream fields and green focus ring reach the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const cascadesTheme: TenantTheme = {
  id: "cascades",
  label: "Cascades",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cascadesTheme;
