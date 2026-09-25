import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Eiffage brand theme for the Sentropic token structure.
 *
 * Eiffage (construction / concessions, CAC 40) publishes no tokenised design
 * system; this package is a MEASURED-CLONE mapping read from the public
 * eiffage.com stylesheet (single host — eiffage.fr redirects to eiffage.com
 * serving the same bundle). The signature is the Eiffage action red
 * (#eb0000, the `.main .btn-bg` fill carrying white text), set over a
 * black/slate/grey text scale on white. We reference the brand font *names*
 * (Montserrat for controls/body, DM Serif Text for display titles) only —
 * never font binaries. Sources and exact provenance are documented in
 * MAPPING.md. Where the brand publishes no direct equivalent for a Sentropic
 * role (feedback hues, hover/deep red tints, control geometry, radii, motion),
 * the closest derived value is used and flagged "à confirmer" in MAPPING.md.
 *
 * Eiffage colour reference (light theme):
 *   White (background default)        #ffffff   (surface default)
 *   Filter-bar light grey             #eeeeee   (subtle surface / light tint)
 *   Hairline grey                     #dedede   (subtle borders)
 *   Form-stroke / meta grey           #757575   (strong borders / muted text)
 *   Dark slate (titles / links)       #333745   (secondary text / link)
 *   Footer dark                       #333333   (inverse surface)
 *   Form near-black                   #111111   (darkest slate)
 *   Body black                        #000000   (primary text)
 *   Eiffage action red                #eb0000   (primary action / interactive)
 *   Darker hover red                  #bf0000   (derived hover — à confirmer)
 *   Success green                     #1e7e34   (derived — à confirmer)
 *   Warning amber                     #8a5a00   (derived — à confirmer)
 *   Error red                         #b3261e   (derived — à confirmer)
 *   Info blue                         #0b5fa5   (derived — à confirmer)
 */

// --- Eiffage raw colour palette ---------------------------------------------
const eiffageColor = {
  // Eiffage action red — the brand signature. `.main .btn-bg` fills buttons
  // with it and sets white text on top (white on #eb0000 = 4.63:1, AA).
  brand: {
    primary: "#eb0000", // `.main .btn-bg{background-color:#eb0000}` (action / brand)
    hover: "#bf0000" // derived darker red for hover (à confirmer)
  },
  // Neutral / dark scale, all measured in brand-owned rules (see MAPPING.md).
  slate: {
    0: "#ffffff", // white / body background (`body{background-color:#fff}`)
    50: "#eeeeee", // filter-tag bar fill (`.news-filters`, `.liste-*__filters-tags`)
    200: "#dedede", // hairline borders (`.stock .table--current-day__row`, popin-press inputs)
    500: "#757575", // meta text + general form stroke (`.contact .form__input--*`)
    800: "#333745", // titles + text links (`.title`, `.tg-link{color:#333745}`)
    900: "#111111" // form text near-black (`.contact .form__input--*{color:#111}`)
  },
  // Dark surfaces / text.
  ink: {
    body: "#000000", // `body{color:#000}` (primary text)
    inverse: "#333333" // `.footer-block{background-color:#333}` (inverse surface)
  },
  // System / status colours (derived — à confirmer; each clears AA on white
  // at step 0, so no stop-rule walk was needed — ratios in MAPPING.md).
  system: {
    success: "#1e7e34", // derived success green, 5.14:1 (à confirmer)
    warning: "#8a5a00", // derived warning amber, 5.93:1 (à confirmer)
    error: "#b3261e", // derived error red, 6.54:1 (à confirmer)
    info: "#0b5fa5" // derived info blue, 6.57:1 (à confirmer)
  }
} as const;

// --- foundation (Eiffage-specific values) -----------------------------------
const foundation = {
  color: {
    // Eiffage has no brand BLUE; the Sentropic "blue" role family (primary
    // action / link tint / interactive) carries the action red — the brand's
    // colour of action.
    blue: {
      10: eiffageColor.slate[50], // #eeeeee light neutral tint (filter-bar grey)
      60: eiffageColor.brand.primary, // #eb0000 Eiffage action red (primary)
      80: eiffageColor.brand.hover // #bf0000 darker hover red (à confirmer)
    },
    // Eiffage has no cyan accent; the Sentropic "cyan" accent slot carries a
    // deep slate accent drawn from the brand text scale.
    cyan: {
      10: eiffageColor.slate[50], // light neutral tint
      50: eiffageColor.slate[500], // #757575 mid grey accent
      70: eiffageColor.slate[800] // #333745 deep slate accent
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: eiffageColor.slate[0], // white
      10: eiffageColor.slate[50], // filter-bar light grey
      20: eiffageColor.slate[200], // hairline borders
      60: eiffageColor.slate[500], // meta text / form stroke
      80: eiffageColor.slate[800], // titles / links
      90: eiffageColor.slate[900] // form near-black
    },
    feedback: {
      success: eiffageColor.system.success,
      warning: eiffageColor.system.warning,
      error: eiffageColor.system.error,
      info: eiffageColor.system.info
    }
  },
  // Eiffage's brand typefaces: Montserrat dominates the stylesheet (152
  // `font-family` declarations across brand components) for body, controls
  // and links; DM Serif Text (37+) sets the `.title` display headings. We
  // use Montserrat for body/controls and DM Serif Text for display; mono is
  // the system stack. We reference the font *names* only, not binaries.
  font: {
    sans: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'DM Serif Text', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // The brand publishes no general radius (the `border-radius: 0` rules live
  // in OverlayScrollbars / tiny-slider vendor blocks; `4px` appears in two
  // scattered rules; buttons ship square with no declared radius) — so the
  // radii below are aligned with the reference theme package's geometry
  // (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px (à confirmer)
    md: "0.25rem", // 4px — button / input / tabs (à confirmer)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "999px" // tags / pills (à confirmer)
  },
  // Light, neutral elevation. Exact specs "à confirmer" (aligned with the
  // reference theme package's geometry).
  shadow: {
    subtle: "0 1px 2px rgb(51 55 69 / 0.10)", // brand slate tint (à confirmer)
    medium: "0 4px 12px rgb(51 55 69 / 0.14)", // (à confirmer)
    floating: "0 8px 24px rgb(51 55 69 / 0.18)" // (à confirmer)
  },
  // Motion durations are not tokenised by the brand publicly; kept aligned
  // with the reference theme package's geometry ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // (à confirmer)
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Eiffage) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // hairline borders
    thick: "2px" // form strokes (`border-bottom: 2px solid #757575`)
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes no usable general control geometry:
  // the paddings its general rules declare are variant-specific and
  // asymmetric (`.contact .form__input--text`: 13px top / 10px bottom;
  // `--select`: 10px top / 13px bottom; 8px inline), the button padding is
  // fluid (`.main .btn-bg`: `11.5px 6.6%`), the only `height` values are
  // widget-scoped (search input 38px/64px, textarea 170px multi-line area),
  // and no general rule declares `height`/`min-height` — see MAPPING.md.
  // Density is therefore aligned with the reference theme package's
  // geometry ("à confirmer"). `controlHeight`/`iconSize` match the base.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Eiffage typography: Montserrat for interactive/fields/labels, DM Serif
  // Text for display. Control text reuses the brand text-link spec
  // (`.tg-link`: Montserrat 600, `font-size: 1rem` at the brand's 18px root
  // = 18px → 1.125rem at 16px; `line-height: 1em` = 18px on 18px → 1).
  // Field text reuses the general form input spec
  // (`.contact .form__input--*`: 0.8333rem at the brand's 18px root = 15px
  // → 0.9375rem at 16px; line 0.8889rem = 16px → 1.07). Label size/weight
  // and the remaining leaves are aligned with the reference theme package's
  // geometry (à confirmer).
  typography: {
    control: { family: "'Montserrat', system-ui, sans-serif", size: "1.125rem", weight: "600", lineHeight: "1", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', system-ui, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.07", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Montserrat', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand text links (`.tg-link`) are dark slate #333745 (11.84:1), not
    // underlined at rest; the hover underline below is reference-aligned
    // (à confirmer) — the brand hover only recolours to #eb0000.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS. The brand publishes no site-wide focus technique (no
  // `:focus-visible` rule; `outline` appears only in search/popin reset
  // rules scoped to single widgets). The colour is the brand red #eb0000 —
  // the colour of the scoped focus rules (`.nav button:focus{color:#eb0000}`,
  // `.menu__search .search__input:focus{caret-color:#eb0000}`) and of the
  // brand action — at 4.63:1 on white it clears the 3:1 line threshold.
  // Technique/width/offset are aligned with the reference theme package's
  // geometry (à confirmer).
  focus: {
    strategy: "outline", // (à confirmer)
    width: "2px", // (à confirmer)
    offset: "2px", // (à confirmer)
    color: eiffageColor.brand.primary, // #eb0000 brand red focus
    inset: "0"
  },
  // Form fields are PARTIAL-BORDER (`.contact .form__input--text/--textarea/
  // --select`): a white fill with NO full box (`border: 0`) and 2px #757575
  // strokes on the bottom AND right sides. The closest Sentropic style is
  // `filled-underline` (fill-first family): `fillBg` is the measured white
  // fill, `underlineColor`/`underlineWidth` carry the 2px #757575 bottom
  // stroke drawn as a `border`. The extra right-side stroke has no primitive
  // and is recorded in MAPPING.md. (The search widget `.menu__search
  // .search__input` is a boxed 1px #dadada exception scoped to that widget —
  // not the general field, so it does not set this value.)
  field: {
    style: "filled-underline",
    fillBg: eiffageColor.slate[0], // #ffffff measured field fill
    underlineColor: eiffageColor.slate[500], // #757575 measured form stroke
    underlineWidth: "2px", // measured stroke width
    underlineMode: "border",
    // Native <select>: redraw the chevron in the Eiffage action red
    // (`%23eb0000` = measured brand red); the 40px right gutter follows the
    // reference theme package's geometry (à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23eb0000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem" // (à confirmer)
  },
  // Cards: a subtle 1px hairline border + slight radius, light hover tint
  // (aligned with the reference theme package's geometry — à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: eiffageColor.slate[50] // #eeeeee
  },
  // Secondary button = OUTLINED in the action red: transparent fill, red
  // border + dark text, light neutral fill on hover (à confirmer geometry;
  // colours measured).
  buttonSecondary: {
    background: "transparent",
    border: eiffageColor.brand.primary, // #eb0000 stroke
    hoverBackground: eiffageColor.slate[50] // #eeeeee light fill on hover
  },
  // Tabs: the brand draws its tab set as radio tabs whose checked label is a
  // red fill with white text (`.tabs input[type="radio"]:checked +
  // label{background:#eb0000;color:#fff}`). Metrics are reference-aligned
  // (à confirmer).
  tabs: {
    activeText: "#ffffff", // measured checked-tab label colour
    activeBackground: eiffageColor.brand.primary, // #eb0000 measured checked-tab fill
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless slate text links; active page = filled action red
  // with white text for AA contrast (4.63:1, measured pair). Metrics are
  // reference-aligned (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: eiffageColor.slate[800], // #333745 link text
    activeBackground: eiffageColor.brand.primary, // #eb0000 filled active page
    activeText: "#ffffff", // white on the action red (measured `.btn-bg` pair)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    minSize: "2.25rem", // 36px page box (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Breadcrumb: dark-slate links, near-black current page. (The single
  // `acumin-pro` breadcrumb declaration is a one-rule legacy exception next
  // to 152 Montserrat declarations — not the site value; see MAPPING.md.)
  breadcrumb: {
    linkText: eiffageColor.slate[800], // #333745
    text: eiffageColor.slate[500], // #757575 trail text
    currentText: eiffageColor.slate[900], // #111111 current page
    separator: eiffageColor.slate[500], // #757575
    fontSize: "0.875rem", // 14px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box
  // (reference-aligned geometry — à confirmer).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (à confirmer)
    paddingTop: "1rem", // 16px (à confirmer)
    paddingRight: "1rem", // 16px (à confirmer)
    paddingBottom: "1rem", // 16px (à confirmer)
    paddingLeft: "1.25rem", // 20px (clears the left filet) (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: eiffageColor.slate[800], // #333745 summary label
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag: a small 4px-radius light-grey chip (reference-aligned metrics —
  // à confirmer; colours measured).
  tag: {
    radius: "4px", // (à confirmer)
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: eiffageColor.slate[50], // #eeeeee
    neutralText: eiffageColor.slate[800] // #333745
  },
  // Badge: a 4px-radius filled badge in the action red with white text
  // (measured pair, 4.63:1; metrics reference-aligned — à confirmer).
  badge: {
    radius: "4px", // (à confirmer)
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none",
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: eiffageColor.brand.primary, // #eb0000
    infoText: "#ffffff" // white on the action red (measured pair)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px (à confirmer)
    labelLineHeight: "1.5rem", // 24px (à confirmer)
    radioLineHeight: "1.5rem", // 24px (à confirmer)
    labelColor: eiffageColor.slate[800] // #333745
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: eiffageColor.slate[800] // #333745
  }
} as const;

// --- semantic (Eiffage-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: eiffageColor.slate[0], // white (`body{background-color:#fff}`)
    subtle: eiffageColor.slate[50], // #eeeeee filter-bar fill
    raised: eiffageColor.slate[0], // white
    inverse: eiffageColor.ink.inverse, // #333333 dark footer (`.footer-block`)
    overlay: "rgb(255 255 255 / 0.4)" // `.popin-intro__bkg{background:rgba(255,255,255,0.4)}` (modal veil)
  },
  text: {
    primary: eiffageColor.ink.body, // #000000 (`body{color:#000}`)
    secondary: eiffageColor.slate[800], // #333745 (titles, 11.84:1)
    muted: eiffageColor.slate[500], // #757575 (meta text, 4.61:1)
    inverse: eiffageColor.slate[0], // white on dark / coloured surfaces (`.footer-block`, `.btn-bg`)
    link: eiffageColor.slate[800] // #333745 legible slate link (`.tg-link`, 11.84:1)
  },
  border: {
    subtle: eiffageColor.slate[200], // #dedede (hairline borders)
    strong: eiffageColor.slate[500], // #757575 (form strokes)
    interactive: eiffageColor.brand.primary // #eb0000 action red (4.63:1, clears 3:1)
  },
  action: {
    primary: eiffageColor.brand.primary, // #eb0000 Eiffage action red
    primaryHover: eiffageColor.brand.hover, // #bf0000 darker hover (à confirmer)
    primaryText: "#ffffff", // white on the action red (measured `.btn-bg`, 4.63:1)
    secondary: eiffageColor.slate[50], // #eeeeee secondary surface
    secondaryHover: eiffageColor.slate[200], // #dedede
    secondaryText: eiffageColor.slate[800], // #333745 (10.21:1 on #eeeeee)
    danger: eiffageColor.system.error // #b3261e error red (à confirmer)
  },
  feedback: {
    success: eiffageColor.system.success,
    warning: eiffageColor.system.warning,
    error: eiffageColor.system.error,
    info: eiffageColor.system.info
  },
  status: {
    pending: eiffageColor.system.warning,
    processing: eiffageColor.system.info,
    completed: eiffageColor.system.success,
    failed: eiffageColor.system.error
  },
  // Categorical data-vis palette led by the brand red over the measured
  // neutrals, completed with the derived system hues. The brand publishes no
  // 8-colour scale, so this is a coherent proposal (see MAPPING.md,
  // "à confirmer").
  data: {
    category1: eiffageColor.brand.primary, // #eb0000 Eiffage red (à confirmer)
    category2: eiffageColor.slate[800], // #333745 dark slate (à confirmer)
    category3: eiffageColor.system.info, // #0b5fa5 info blue (à confirmer)
    category4: eiffageColor.system.warning, // #8a5a00 amber (à confirmer)
    category5: eiffageColor.system.success, // #1e7e34 green (à confirmer)
    category6: eiffageColor.slate[500], // #757575 grey (à confirmer)
    category7: eiffageColor.system.error, // #b3261e red (à confirmer)
    category8: eiffageColor.slate[900] // #111111 near-black (à confirmer)
  }
} as const;

/**
 * The Eiffage theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Eiffage-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the action red reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const eiffageTheme: TenantTheme = {
  id: "eiffage",
  label: "Eiffage",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default eiffageTheme;
