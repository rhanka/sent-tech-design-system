import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Unibail-Rodamco-Westfield brand theme for the Sentropic token structure.
 *
 * Unibail-Rodamco-Westfield (urw.com) ships no tokenised public design system,
 * but its corporate site stylesheet declares a named brand palette through its
 * Tailwind theme tokens (`main-red`, `soft-gray`, `mist-gray`,
 * `secondary-black`, `corn-silk`, `floral-white`) plus site-owned rich-text
 * rules. This package is a MEASURED-CLONE mapping: the signature brand red
 * (#d62d20, the `main-red` token) and the neutral scale are read from the
 * public site stylesheet, and we reference the brand font *names*
 * (FlamaCondensed, the `@font-face` brand face; Helvetica for body) only —
 * never font binaries. Sources and exact provenance are documented in
 * MAPPING.md. Where the site publishes no direct equivalent for a Sentropic
 * role (the red hover/deep/light tints, the feedback hues, the categorical
 * data palette, the modal backdrop), the closest derived value is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Unibail-Rodamco-Westfield colour reference (light theme):
 *   White (background default)        #ffffff   (surface default)
 *   Mist grey (background alt)         #f1f1f3   (named `mist-gray` token — context)
 *   Soft grey (surface alt)            #e8e8e8   (named `soft-gray` token)
 *   Field border subtle                #cdd0d4   (`.border-left` border declaration)
 *   Field stroke                       #cccccc   (`.contact-form` input stroke)
 *   Secondary black                    #333333   (named `secondary-black` token)
 *   Muted grey                         #666666   (`.contact-form .form-note` text)
 *   Body / primary text (near-black)   #242424   (`.text-title` / `.article__text-body`)
 *   Darkest                            #111111   (`.contact-form-container h2` text)
 *   Main Red (brand / action)          #d62d20   (named `main-red` token)
 *   Main Red hover                     #bb271c   (derived darker red for hover — à confirmer)
 *   Light red tint                     #fae3e1   (derived light red tint — à confirmer)
 *   Corn silk accent                   #e0d9d1   (named `corn-silk` token)
 *   Floral accent                      #a99f93   (named `floral-white` token)
 *   Deep taupe accent                  #7d7468   (derived deep taupe — à confirmer)
 *   Success green                      #166534   (derived — à confirmer)
 *   Warning amber                      #b45309   (derived — à confirmer)
 *   Info blue                          #1d4ed8   (derived — à confirmer)
 */

// --- Unibail-Rodamco-Westfield raw colour palette ---------------------------
const unibailRodamcoWestfieldColor = {
  // Main Red — the URW signature brand colour (the named `main-red` Tailwind
  // theme token: `.text-main-red`, `.bg-main-red`, `.border-main-red`,
  // `.focus:ring-main-red`).
  red: {
    primary: "#d62d20", // URW `main-red` — brand red (action / brand)
    hover: "#bb271c", // derived darker red for hover (à confirmer)
    light: "#fae3e1" // derived light red tint (à confirmer)
  },
  // Neutral scale. Every step is read from a brand-owned rule (named theme
  // tokens or site-owned selectors — see MAPPING.md); only the darkest step
  // below doubles from a single heading rule, the rest are named tokens.
  slate: {
    0: "#ffffff", // white / body background
    50: "#e8e8e8", // named `soft-gray` token (surface alt)
    200: "#cdd0d4", // `.border-left` border declaration
    500: "#333333", // named `secondary-black` token (secondary text)
    600: "#666666", // `.contact-form .form-note` text (muted)
    800: "#242424", // `.text-title` / `.article__text-body` (primary text)
    900: "#111111" // `.contact-form-container h2` text (darkest)
  },
  // Named `gray` theme token (`.text-gray` / `.border-gray` / `.bg-gray`).
  grey: {
    strong: "#b4b3b3" // named `gray` token (strong borders)
  },
  // Warm neutral accents from the named theme tokens.
  accent: {
    cornSilk: "#e0d9d1", // named `corn-silk` token
    floral: "#a99f93", // named `floral-white` token
    deep: "#7d7468" // derived deep taupe (à confirmer)
  },
  // System / status colours. The error role reuses the brand Main Red
  // (measured); success / warning / info are derived (à confirmer).
  system: {
    success: "#166534", // derived success green (à confirmer)
    warning: "#b45309", // derived warning amber (à confirmer)
    error: "#d62d20", // URW `main-red` doubles as the error red
    info: "#1d4ed8" // derived info blue (à confirmer)
  }
} as const;

// --- foundation (Unibail-Rodamco-Westfield-specific values) ------------------
const foundation = {
  color: {
    // URW has no dominant brand BLUE; the Sentropic "blue" role family
    // (primary action / link / interactive) carries the Main Red — the
    // brand's colour of action.
    blue: {
      10: unibailRodamcoWestfieldColor.red.light, // #fae3e1 lightest red tint (à confirmer)
      60: unibailRodamcoWestfieldColor.red.primary, // #d62d20 Main Red (primary)
      80: unibailRodamcoWestfieldColor.red.hover // #bb271c darker interactive red (à confirmer)
    },
    // The Sentropic "cyan" accent slot carries the warm neutral accent family
    // drawn from the named `corn-silk` / `floral-white` tokens.
    cyan: {
      10: unibailRodamcoWestfieldColor.accent.cornSilk, // #e0d9d1 `corn-silk` token
      50: unibailRodamcoWestfieldColor.accent.floral, // #a99f93 `floral-white` token
      70: unibailRodamcoWestfieldColor.accent.deep // #7d7468 deep taupe (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: unibailRodamcoWestfieldColor.slate[0], // white
      10: unibailRodamcoWestfieldColor.slate[50], // `soft-gray` background alt
      20: unibailRodamcoWestfieldColor.slate[200], // `.border-left` subtle border
      60: unibailRodamcoWestfieldColor.slate[500], // `secondary-black` secondary text
      80: unibailRodamcoWestfieldColor.slate[800], // primary text
      90: unibailRodamcoWestfieldColor.slate[900] // darkest
    },
    feedback: {
      success: unibailRodamcoWestfieldColor.system.success,
      warning: unibailRodamcoWestfieldColor.system.warning,
      error: unibailRodamcoWestfieldColor.system.error,
      info: unibailRodamcoWestfieldColor.system.info
    }
  },
  // URW's corporate site self-hosts "FlamaCondensed" as its brand display face
  // (`@font-face` + `.font-flama` utility) and uses Helvetica for body text
  // (`.font-helvetica` utility); display carries the brand face, sans the body
  // face. mono is the system stack. We reference the font *names* only.
  font: {
    sans: "'Helvetica', Arial, sans-serif",
    display: "'FlamaCondensed', 'Helvetica', Arial, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand publishes no spacing scale).
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
  // URW form geometry is softly rounded: contact inputs/buttons carry a 6px
  // radius (`.contact-form input` / `button`), panels a 12px radius
  // (`.contact-form-container`).
  radius: {
    none: "0",
    sm: "0.375rem", // 6px — `.contact-form` input radius
    md: "0.375rem", // 6px — button / input / tabs
    lg: "0.75rem", // 12px — `.contact-form-container` panel radius
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand near-black. Exact specs
  // "à confirmer" (aligned with the reference theme package's geometry).
  shadow: {
    subtle: "0 1px 2px rgb(36 36 36 / 0.10)", // à confirmer
    medium: "0 4px 12px rgb(36 36 36 / 0.14)", // à confirmer
    floating: "0 8px 24px rgb(36 36 36 / 0.18)" // à confirmer
  },
  // Motion durations are not tokenised publicly by the brand; kept aligned
  // with the reference theme package's geometry ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // à confirmer
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Unibail-Rodamco-Westfield) -----------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px (`.contact-form` inputs)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes input padding (10px 12px) but no full
  // size grid, so density is aligned with the reference theme package's
  // geometry ("à confirmer"); only controlHeight/iconSize match the Sentropic
  // base values.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // à confirmer
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // à confirmer
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // à confirmer
  },
  // URW typography: FlamaCondensed for interactive/display, Helvetica for
  // fields/labels. Button labels use a medium weight (500), no transform
  // (the control-family assignment itself is à confirmer).
  typography: {
    control: { family: "'FlamaCondensed', 'Helvetica', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links read in the Main Red #d62d20 (legible at 4.93:1 on white),
    // not underlined at rest (rest state unmeasured — à confirmer), underlined
    // on hover (`.siteCoreContainer a:hover`).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // aligned with the reference theme package's geometry (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // à confirmer
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a Main Red RING (`.focus:ring-main-red` declares a ring-colour
  // technique in the brand red; width/offset unmeasured — à confirmer).
  focus: {
    strategy: "ring",
    width: "2px", // à confirmer
    offset: "2px", // à confirmer
    color: unibailRodamcoWestfieldColor.red.primary, // #d62d20 `main-red` ring (4.93:1 on white)
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px `#ccc`-family grey
  // border (`.contact-form input`) and a 6px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` +
  // `border.subtle`.
  field: {
    style: "outline",
    fillBg: unibailRodamcoWestfieldColor.slate[0], // #ffffff
    underlineColor: unibailRodamcoWestfieldColor.slate[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the Main Red with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23d62d20' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + panel radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: unibailRodamcoWestfieldColor.slate[50] // #e8e8e8 `soft-gray`
  },
  // Secondary button = OUTLINED in the Main Red: transparent fill, red
  // border + text, light red fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: unibailRodamcoWestfieldColor.red.primary, // #d62d20 stroke
    hoverBackground: unibailRodamcoWestfieldColor.red.light // #fae3e1 light fill on hover (à confirmer)
  },
  // Tabs / top-nav: active tab = Main Red label with a bottom red underline.
  tabs: {
    activeText: unibailRodamcoWestfieldColor.red.primary, // #d62d20 Main Red label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless Main Red text links; active page = filled Main Red
  // with white text for AA contrast (4.93:1).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: unibailRodamcoWestfieldColor.red.primary, // #d62d20 link text
    activeBackground: unibailRodamcoWestfieldColor.red.primary, // #d62d20 filled active page
    activeText: "#ffffff", // white text on the Main Red for AA contrast (à confirmer)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: Main Red links, dark current page, grey separators.
  breadcrumb: {
    linkText: unibailRodamcoWestfieldColor.red.primary, // #d62d20
    text: unibailRodamcoWestfieldColor.slate[500], // #333333 trail text
    currentText: unibailRodamcoWestfieldColor.slate[800], // #242424 current page
    separator: unibailRodamcoWestfieldColor.slate[500], // #333333
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box.
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
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: unibailRodamcoWestfieldColor.slate[800], // #242424 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small pill grey chip (pill shape unmeasured — à confirmer).
  tag: {
    radius: "999px", // à confirmer
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: unibailRodamcoWestfieldColor.slate[50], // #e8e8e8
    neutralText: unibailRodamcoWestfieldColor.slate[800] // #242424
  },
  // Badge: a pill filled badge in the Main Red with white text (pill shape unmeasured — à confirmer).
  badge: {
    radius: "999px", // à confirmer
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: unibailRodamcoWestfieldColor.red.primary, // #d62d20
    infoText: "#ffffff" // white text on Main Red for AA contrast (à confirmer)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: unibailRodamcoWestfieldColor.slate[800] // #242424
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: unibailRodamcoWestfieldColor.slate[800] // #242424
  }
} as const;

// --- semantic (Unibail-Rodamco-Westfield-specific role mapping) --------------
const semantic = {
  surface: {
    default: unibailRodamcoWestfieldColor.slate[0], // white
    subtle: unibailRodamcoWestfieldColor.slate[50], // #e8e8e8 `soft-gray` alt
    raised: unibailRodamcoWestfieldColor.slate[0], // white
    inverse: unibailRodamcoWestfieldColor.slate[800], // #242424 near-black inverse surface
    overlay: "rgb(36 36 36 / 0.6)" // derived modal backdrop from the brand near-black (à confirmer)
  },
  text: {
    primary: unibailRodamcoWestfieldColor.slate[800], // #242424 (body color)
    secondary: unibailRodamcoWestfieldColor.slate[500], // #333333 (`secondary-black`)
    muted: unibailRodamcoWestfieldColor.slate[600], // #666666 (form note)
    inverse: unibailRodamcoWestfieldColor.slate[0], // white on dark / coloured surfaces
    link: unibailRodamcoWestfieldColor.red.primary // #d62d20 Main Red link (4.93:1 on white)
  },
  border: {
    subtle: unibailRodamcoWestfieldColor.slate[200], // #cdd0d4 (`.border-left` stroke)
    strong: unibailRodamcoWestfieldColor.grey.strong, // #b4b3b3 named `gray` token
    interactive: unibailRodamcoWestfieldColor.red.primary // #d62d20 Main Red interactive (4.93:1)
  },
  action: {
    primary: unibailRodamcoWestfieldColor.red.primary, // #d62d20 Main Red primary
    primaryHover: unibailRodamcoWestfieldColor.red.hover, // #bb271c darker hover (à confirmer)
    primaryText: "#ffffff", // white text on the Main Red for AA contrast (4.93:1 — à confirmer)
    secondary: unibailRodamcoWestfieldColor.slate[50], // #e8e8e8 secondary surface
    secondaryHover: unibailRodamcoWestfieldColor.slate[200], // #cdd0d4
    secondaryText: unibailRodamcoWestfieldColor.slate[800], // #242424
    danger: unibailRodamcoWestfieldColor.system.error // #d62d20 Main Red
  },
  feedback: {
    success: unibailRodamcoWestfieldColor.system.success,
    warning: unibailRodamcoWestfieldColor.system.warning,
    error: unibailRodamcoWestfieldColor.system.error,
    info: unibailRodamcoWestfieldColor.system.info
  },
  status: {
    pending: unibailRodamcoWestfieldColor.system.warning,
    processing: unibailRodamcoWestfieldColor.system.info,
    completed: unibailRodamcoWestfieldColor.system.success,
    failed: unibailRodamcoWestfieldColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. The brand
  // publishes no 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: unibailRodamcoWestfieldColor.red.primary, // #d62d20 Main Red
    category2: unibailRodamcoWestfieldColor.slate[800], // #242424 near-black
    category3: unibailRodamcoWestfieldColor.system.info, // #1d4ed8 info blue (à confirmer)
    category4: unibailRodamcoWestfieldColor.system.warning, // #b45309 amber (à confirmer)
    category5: unibailRodamcoWestfieldColor.system.success, // #166534 green (à confirmer)
    category6: unibailRodamcoWestfieldColor.accent.floral, // #a99f93 taupe
    category7: unibailRodamcoWestfieldColor.slate[500], // #333333 grey
    category8: unibailRodamcoWestfieldColor.red.hover // #bb271c deep red (à confirmer)
  }
} as const;

/**
 * The Unibail-Rodamco-Westfield theme as a Sentropic `TenantTheme`. The
 * `tokens` tree is complete: `foundation` and `semantic` carry
 * Unibail-Rodamco-Westfield-specific values, and the `component` layer is
 * REBUILT from this theme's own semantic/foundation via `createComponent` —
 * so the Main Red brand reaches the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const unibailRodamcoWestfieldTheme: TenantTheme = {
  id: "unibail-rodamco-westfield",
  label: "Unibail-Rodamco-Westfield",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default unibailRodamcoWestfieldTheme;
