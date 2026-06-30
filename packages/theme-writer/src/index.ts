import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Writer (writer.com) theme for the Sentropic token structure.
 *
 * All values below are measured from Writer's PUBLIC marketing site CSS
 * (writer.com, a WordPress/`writercom` theme). We only reference the font
 * *names* (Poppins, PP Formula Condensed, SF Mono) here, never the font
 * binaries. Sources are documented in MAPPING.md. Where Writer publishes no
 * direct equivalent for a Sentropic role (feedback colours, data-vis scale,
 * focus technique), the closest measured token is used and the choice is
 * flagged "à confirmer" in MAPPING.md.
 *
 * Writer colour reference (light theme, measured on writer.com):
 *   Writer Indigo (primary CTA / link)   #5551ff   (.btn-primary bg, checked controls)
 *   Writer Indigo dark (hover/active)     #2e2ae8   (.btn-primary:hover bg+border)
 *   Indigo tint (lightest brand wash)     #f3f5ff
 *   Indigo tint (light brand wash)        #e4e9ff
 *   Lavender (disabled / soft accent)     #bfcbff
 *   White (surface default)               #ffffff
 *   Grey 50 (subtle surface / alt bg)     #eff0f2
 *   Grey 100 (default border, dominant)   #e4e7ed
 *   Grey 200 (stronger border)            #d4d6db
 *   Grey 400 (input border)               #9aa2af   (input { border:1px solid })
 *   Grey 500 (muted / placeholder text)   #828282
 *   Grey 600 (secondary text)             #5e5e5e
 *   Grey 800 (strong text)                #262626
 *   Grey 900 (primary text, near-black)   #151515
 *   Black                                 #000000
 *
 * Writer primary buttons are pill-shaped (border-radius 9999px) indigo fills;
 * inputs are boxed/outlined (white fill, 1px #9aa2af border, 4px radius).
 */

// --- Writer raw colour palette (public marketing CSS) ----------------------
const writerColor = {
  // Writer Indigo — the brand / action family.
  indigo: {
    primary: "#5551ff", // Writer Indigo — primary CTA / link / interactive
    dark: "#2e2ae8", // hover / active (.btn-primary:hover)
    tintLightest: "#f3f5ff", // lightest brand wash
    tint: "#e4e9ff", // light brand wash / selected tint
    lavender: "#bfcbff" // disabled / soft brand accent
  },
  // Neutral grey scale (measured greys across the site).
  grey: {
    0: "#ffffff",
    50: "#eff0f2", // subtle surface / background alt
    100: "#e4e7ed", // default border (most frequent border)
    200: "#d4d6db", // stronger border
    400: "#9aa2af", // input border
    500: "#828282", // muted / placeholder text
    600: "#5e5e5e", // secondary text
    800: "#262626", // strong text
    900: "#151515", // primary text (near-black)
    1000: "#000000"
  },
  // System / status colours. Writer's marketing CSS does not expose a clear
  // semantic feedback palette, so these are AA-on-white standards (à confirmer);
  // `info` reuses the Writer Indigo brand.
  system: {
    success: "#1f9d57", // à confirmer
    warning: "#b54708", // à confirmer (AA on white)
    error: "#d92d20", // à confirmer
    info: "#5551ff" // Writer Indigo
  }
} as const;

// --- foundation (Writer-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Writer Indigo.
    blue: {
      10: writerColor.indigo.tintLightest, // #f3f5ff lightest brand wash
      60: writerColor.indigo.primary, // #5551ff Writer Indigo (primary)
      80: writerColor.indigo.dark // #2e2ae8 darker interactive
    },
    // Writer has no cyan; its only non-indigo accent is the lavender brand
    // wash, so the Sentropic "cyan" slot maps to the Writer lavender tints.
    cyan: {
      10: writerColor.indigo.tint, // #e4e9ff light brand wash (à confirmer)
      50: writerColor.indigo.lavender, // #bfcbff lavender accent (à confirmer)
      70: writerColor.indigo.primary // #5551ff deep accent = brand indigo (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Writer grey scale.
    slate: {
      0: writerColor.grey[0], // white
      10: writerColor.grey[50], // #eff0f2 background alt
      20: writerColor.grey[100], // #e4e7ed default border
      60: writerColor.grey[600], // #5e5e5e secondary text
      80: writerColor.grey[800], // #262626 strong text
      90: writerColor.grey[900] // #151515 primary text / darkest
    },
    feedback: {
      success: writerColor.system.success,
      warning: writerColor.system.warning,
      error: writerColor.system.error,
      info: writerColor.system.info
    }
  },
  // Writer ships "PP Formula Condensed" (display / hero headings, Pangram Pangram
  // foundry), "Poppins" (body / UI / buttons) and "SF Mono" (mono). Font *names*
  // only, never binaries.
  font: {
    sans: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'PP Formula Condensed', 'PPFormulaCondensed', 'Poppins', system-ui, -apple-system, sans-serif",
    mono: "'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (8px grid built on a 4px unit; aligned
  // with the Sentropic base for component-grid fidelity).
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
  // Writer aesthetic: pill-shaped buttons, lightly rounded inputs, rounded cards.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — inputs (measured: border-radius 4px)
    md: "0.375rem", // 6px — small controls / chips
    lg: "0.75rem", // 12px — cards (measured: border-radius 12px)
    pill: "9999px" // pill buttons (measured: border-radius 60px / 9999px)
  },
  // Soft neutral shadows. Exact specs not published — approximate (à confirmer).
  shadow: {
    subtle: "0 1px 2px rgb(21 21 21 / 0.06), 0 1px 3px rgb(21 21 21 / 0.10)",
    medium: "0 4px 12px rgb(21 21 21 / 0.10), 0 2px 4px rgb(21 21 21 / 0.06)",
    floating: "0 12px 32px rgb(21 21 21 / 0.14), 0 4px 8px rgb(21 21 21 / 0.08)"
  },
  // Writer transitions read "background 0.2s ease, box-shadow 0.2s ease".
  // Durations approximate the measured 0.1–0.2s range (à confirmer).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Writer-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Writer) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Writer control density: comfortable pill buttons with generous horizontal
  // padding (md ≈ 44px). sm/lg follow the same scale.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Writer typography: Poppins everywhere on the product/UI (medium for controls
  // & labels, regular for fields). Display headings use PP Formula Condensed.
  typography: {
    control: { family: "'Poppins', sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Poppins', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Poppins', sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Writer links: indigo text, underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // à confirmer
  transition: { property: "background-color, border-color, color, box-shadow", duration: "200ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Writer FOCUS: a soft ring in Writer Indigo (the marketing CSS animates a
  // box-shadow on interactive controls). Exact ring spec à confirmer.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: writerColor.indigo.primary, // #5551ff
    inset: "0"
  },
  // Writer form fields are BOXED & OUTLINED: white fill, a 1px grey border
  // (#9aa2af) and a 4px radius (measured `input { background:#fff; border:1px
  // solid #9aa2af; border-radius:4px }`). `style: "outline"` draws four equal
  // borders from `surface.default` + `border.subtle`; the focus ring tints the
  // border indigo on focus.
  field: {
    style: "outline",
    fillBg: writerColor.grey[0], // #ffffff
    underlineColor: writerColor.grey[400], // #9aa2af measured input border
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Writer Indigo with a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%235551ff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Writer card: a 1px grey outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: writerColor.grey[50] // #eff0f2
  },
  // Writer secondary button: a white/bordered pill (indigo stroke + text), soft
  // brand-tint fill on hover (à confirmer).
  buttonSecondary: {
    background: writerColor.grey[0], // #ffffff
    border: writerColor.indigo.primary, // #5551ff stroke
    hoverBackground: writerColor.indigo.tintLightest // #f3f5ff light brand fill
  },
  // Writer tabs: active tab = Writer Indigo label with a 2px bottom indicator.
  tabs: {
    activeText: writerColor.indigo.primary, // #5551ff
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Writer pagination: borderless indigo links; active page = filled indigo.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: writerColor.indigo.primary, // #5551ff link text
    activeBackground: writerColor.indigo.primary, // #5551ff filled active page
    activeText: writerColor.grey[0], // white on indigo
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Writer breadcrumb: indigo links, near-black current page, grey separators.
  breadcrumb: {
    linkText: writerColor.indigo.primary, // #5551ff
    text: writerColor.grey[600], // #5e5e5e trail text
    currentText: writerColor.grey[900], // #151515 current page
    separator: writerColor.grey[500], // #828282
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  }
} as const;

// --- semantic (Writer-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: writerColor.grey[0], // white
    subtle: writerColor.grey[50], // #eff0f2 background alt / hover fill
    raised: writerColor.grey[0], // white
    inverse: writerColor.grey[900], // #151515 dark inverse surface
    overlay: "rgb(21 21 21 / 0.6)" // modal backdrop (grey 900 tint)
  },
  text: {
    primary: writerColor.grey[900], // #151515 primary text
    secondary: writerColor.grey[600], // #5e5e5e secondary text
    muted: writerColor.grey[500], // #828282 placeholder / muted text
    inverse: writerColor.grey[0], // white on dark / coloured surfaces
    link: writerColor.indigo.primary // #5551ff Writer Indigo link
  },
  border: {
    subtle: writerColor.grey[100], // #e4e7ed default border
    strong: writerColor.grey[400], // #9aa2af stronger / input border
    interactive: writerColor.indigo.primary // #5551ff focus / interactive
  },
  action: {
    primary: writerColor.indigo.primary, // #5551ff primary button
    primaryHover: writerColor.indigo.dark, // #2e2ae8 darker hover
    primaryText: writerColor.grey[0], // white text on indigo
    secondary: writerColor.indigo.tintLightest, // #f3f5ff light brand surface
    secondaryHover: writerColor.indigo.tint, // #e4e9ff
    secondaryText: writerColor.indigo.primary, // #5551ff
    danger: writerColor.system.error // #d92d20 (à confirmer)
  },
  feedback: {
    success: writerColor.system.success,
    warning: writerColor.system.warning,
    error: writerColor.system.error,
    info: writerColor.system.info
  },
  status: {
    pending: writerColor.system.warning,
    processing: writerColor.system.info,
    completed: writerColor.system.success,
    failed: writerColor.system.error
  },
  // Categorical data-vis palette built from the Writer Indigo brand plus its
  // lavender wash and the neutral greys. Writer does not publish an 8-colour
  // sequential data-vis scale, so this is a coherent proposal (see MAPPING.md,
  // "à confirmer").
  data: {
    category1: writerColor.indigo.primary, // #5551ff Writer Indigo
    category2: writerColor.indigo.dark, // #2e2ae8 deep indigo
    category3: writerColor.indigo.lavender, // #bfcbff lavender
    category4: writerColor.system.success, // #1f9d57 (à confirmer)
    category5: writerColor.system.warning, // #b54708 (à confirmer)
    category6: writerColor.system.error, // #d92d20 (à confirmer)
    category7: writerColor.grey[600], // #5e5e5e neutral
    category8: writerColor.grey[400] // #9aa2af neutral (à confirmer)
  }
} as const;

/**
 * The Writer theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Writer-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Writer brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const writerTheme: TenantTheme = {
  id: "writer",
  label: "Writer",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default writerTheme;
