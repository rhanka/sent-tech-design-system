import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Hugging Face theme for the Sentropic token structure.
 *
 * All values below are measured on Hugging Face's PUBLIC site
 * (huggingface.co) and brand page (huggingface.co/brand). The Hub front-end
 * ships Tailwind CSS v4, so its neutral / status palette IS the Tailwind v4
 * default scale (gray / indigo / emerald / red / amber / blue), exposed as
 * `--color-*` custom properties in the live stylesheet; those oklch values are
 * converted to their canonical sRGB hex here. The brand signature is the warm
 * yellow `#FFD21E` (the hugging-emoji face), always paired with black
 * `#000000` (the emoji outline / text), plus the orange cheek `#FF9D00`. We
 * only reference font *names* (Source Sans Pro, IBM Plex Mono) here, never the
 * font binaries. Sources are documented in MAPPING.md. Where Hugging Face
 * publishes no direct equivalent for a Sentropic role, the closest measured
 * token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Hugging Face colour reference (light theme):
 *   White (surface default)            #ffffff
 *   Gray 50  (surface alt)             #f9fafb
 *   Gray 100 (subtle surface / fill)   #f3f4f6
 *   Gray 200 (subtle border)           #e5e7eb
 *   Gray 300 (default border)          #d1d5dc
 *   Gray 400 (muted / placeholder)     #99a1af
 *   Gray 500 (secondary text)          #6a7282
 *   Gray 700 (strong text)             #364153
 *   Gray 900 (primary text / inverse)  #101828
 *   Brand Yellow (action / signature)  #ffd21e
 *   Brand Orange (cheek accent)        #ff9d00
 *   Indigo 600 (interactive / link)    #4f39f6
 *   Emerald 600 (success)              #009966
 *   Red 600 (error / danger)           #e7000b
 *   Amber 500 (warning, brand-orange)  #fe9a00
 *   Pink 600 (gradient companion)      #e60076
 *
 * Hugging Face primary buttons read as PILLS. The literal Sign-Up CTA on the
 * Hub is a dark gray-900 pill (white text); the brand-forward primary here is
 * the yellow `#FFD21E` pill with black text (the iconic HF pairing). The dark
 * pill is preserved via `surface.inverse`. Brand gradient cards run
 * `#ff9d00`/yellow → `#e60076` (pink); `TenantTheme` has no gradient token, so
 * those stops live in `data.category6`/`data.category5` (see MAPPING.md).
 */

// --- Hugging Face raw colour palette (public brand + Tailwind v4 scale) -----
const hfColor = {
  // Brand yellow — the hugging-emoji face / signature.
  yellow: {
    main: "#ffd21e", // HF brand yellow (brand page + live `text-[#FFD21E]`)
    hover: "#e6bd1b", // darker brand yellow for filled-button hover (derived — à confirmer)
    soft: "#fefce8" // very light yellow tint (Tailwind yellow-50, used in from-yellow-50 banners)
  },
  // Brand orange — the emoji cheeks / warm accent.
  orange: {
    main: "#ff9d00", // HF brand orange (brand page)
    warning: "#e17100" // Tailwind amber-600, darkened brand-orange direction for AA warning text
  },
  // Indigo — the Hub interactive accent (repo hover, links, focus).
  indigo: {
    primary: "#4f39f6", // Tailwind indigo-600 — interactive / link
    hover: "#432dd7", // Tailwind indigo-700 — darker interactive
    50: "#eef2ff", // Tailwind indigo-50 — light selected fill
    100: "#e0e7ff" // Tailwind indigo-100
  },
  // Brand pink — gradient companion (from-yellow-600 to-pink-600 cards).
  pink: {
    main: "#e60076" // Tailwind pink-600
  },
  // Tailwind v4 default gray scale (HF neutrals; measured oklch → hex).
  gray: {
    0: "#ffffff",
    50: "#f9fafb", // gray-50 — surface alt
    100: "#f3f4f6", // gray-100 — subtle surface / hover fill
    200: "#e5e7eb", // gray-200 — subtle border
    300: "#d1d5dc", // gray-300 — default border
    400: "#99a1af", // gray-400 — muted / placeholder text
    500: "#6a7282", // gray-500 — secondary text
    600: "#4a5565", // gray-600
    700: "#364153", // gray-700 — strong text
    800: "#1e2939", // gray-800
    900: "#101828" // gray-900 — primary text / dark surface / dark CTA pill
  },
  // System / status colours (Tailwind v4 scale, AA-checked on white).
  system: {
    success: "#009966", // Tailwind emerald-600
    error: "#e7000b", // Tailwind red-600
    warning: "#e17100", // Tailwind amber-600 (darkened HF orange for AA)
    info: "#155dfc" // Tailwind blue-600
  }
} as const;

// --- foundation (Hugging Face-specific values) -----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the HF interactive indigo.
    blue: {
      10: hfColor.indigo[50], // lightest indigo tint
      60: hfColor.indigo.primary, // indigo-600 (interactive)
      80: hfColor.indigo.hover // indigo-700 (darker interactive)
    },
    // HF has no cyan; the signature non-neutral accent is the brand yellow, so
    // the Sentropic "cyan" accent slot maps to the HF yellow family.
    cyan: {
      10: hfColor.yellow.soft, // light yellow tint (à confirmer)
      50: hfColor.yellow.main, // HF brand yellow accent
      70: hfColor.yellow.hover // darker brand yellow (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Tailwind gray scale.
    slate: {
      0: hfColor.gray[0], // white
      10: hfColor.gray[50], // surface alt
      20: hfColor.gray[300], // borders / contrast
      60: hfColor.gray[500], // secondary text
      80: hfColor.gray[700], // strong text
      90: hfColor.gray[900] // primary text / darkest
    },
    feedback: {
      success: hfColor.system.success,
      warning: hfColor.system.warning,
      error: hfColor.system.error,
      info: hfColor.system.info
    }
  },
  // HF ships "Source Sans Pro" for all UI text (body + headings; there is no
  // separate display face — headings are Source Sans Pro in heavier weights)
  // and "IBM Plex Mono" for code. Font *names* only, never binaries. (HF also
  // uses "Charter" for long-form prose; no Sentropic slot for it — see MAPPING.)
  font: {
    sans: "'Source Sans Pro', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    display: "'Source Sans Pro', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    mono: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard 4px-based rem spacing scale (Tailwind 0.25rem unit; aligned with
  // the Sentropic base for component-grid fidelity).
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
  // HF aesthetic is friendly and ROUNDED: inputs/buttons read as rounded-lg
  // (8px) and many buttons / tags are full pills (rounded-full). Cards use
  // rounded-xl (12px). Tailwind radius scale: sm .25rem, md .375rem, lg .5rem,
  // xl .75rem; HF UI predominantly uses lg + full.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px (Tailwind radius-sm)
    md: "0.5rem", // 8px — control / input (HF rounded-lg)
    lg: "0.75rem", // 12px — cards (HF rounded-xl)
    pill: "999px" // pill buttons / tags (HF rounded-full)
  },
  // Soft, neutral, low-opacity shadows (Tailwind shadow-sm/md/lg families).
  // Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    medium: "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)",
    floating: "0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)"
  },
  // Motion durations / easing — kept aligned with the Sentropic base (Tailwind
  // defaults ~150ms ease). "à confirmer".
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not HF-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Hugging Face) -----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // HF control density — compact, Tailwind-style controls. md ≈ 36px with
  // pill/lg rounding; sm 32px, lg 44px. Heights/paddings approximate ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.375rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.75rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" }
  },
  // HF typography: Source Sans Pro everywhere; buttons/labels are semibold 600,
  // body/fields normal 400.
  typography: {
    control: { family: "'Source Sans Pro', ui-sans-serif, system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Source Sans Pro', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Source Sans Pro', ui-sans-serif, system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // HF links are not underlined at rest; underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // Tailwind disabled:opacity-50
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // HF FOCUS = a soft box-shadow RING in the interactive indigo around the box
  // (Tailwind focus:ring-2), not a native offset outline. Exact ring colour
  // varies by control — indigo-600 used here ("à confirmer").
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: hfColor.indigo.primary, // #4f39f6 indigo interactive
    inset: "0"
  },
  // HF form fields are BOXED & ROUNDED (outline): a white fill with a 1px
  // gray-300 border and the 8px control radius (rounded-lg inputs). `style:
  // "outline"` draws four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: hfColor.gray[0], // #ffffff
    underlineColor: hfColor.gray[300], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in HF gray-500 with a generous gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%236a7282' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // HF card: a 1px gray outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: hfColor.gray[50] // #f9fafb
  },
  // HF secondary button = white/transparent fill with a gray border + dark
  // text, light gray state fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: hfColor.gray[300], // #d1d5dc stroke
    hoverBackground: hfColor.gray[100] // #f3f4f6 light fill on hover
  },
  // HF tabs: active tab = dark label with a 2px bottom indicator (yellow brand).
  tabs: {
    activeText: hfColor.gray[900], // #101828 dark active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator sits on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // HF pagination: borderless dark/indigo text links; active page = filled.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: hfColor.gray[700], // #364153 link text
    activeBackground: hfColor.gray[900], // #101828 filled active page (dark pill)
    activeText: hfColor.gray[0], // white on dark
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // HF breadcrumb: indigo links, dark current page, grey separators.
  breadcrumb: {
    linkText: hfColor.indigo.primary, // #4f39f6
    text: hfColor.gray[500], // #6a7282 trail text
    currentText: hfColor.gray[900], // #101828 current page
    separator: hfColor.gray[400], // #99a1af
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // HF banner / notice: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // HF expansion panel: a dark semibold summary trigger.
  accordion: {
    text: hfColor.gray[900], // #101828 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "600", // semibold
    lineHeight: "1.25rem" // 20px
  },
  // HF chip / tag: a pill-rounded light gray chip (HF uses rounded-full tags).
  tag: {
    radius: "999px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: hfColor.gray[100], // #f3f4f6
    neutralText: hfColor.gray[700] // #364153
  },
  // HF badge: a small rounded filled badge.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: hfColor.indigo.primary, // #4f39f6
    infoText: hfColor.gray[0] // white
  },
  // HF checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: hfColor.gray[900] // #101828
  },
  // HF search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // HF toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: hfColor.gray[900] // #101828
  }
} as const;

// --- semantic (Hugging Face-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: hfColor.gray[0], // white
    subtle: hfColor.gray[100], // #f3f4f6 background alt / hover fill
    raised: hfColor.gray[0], // white
    inverse: hfColor.gray[900], // #101828 dark inverse surface / dark CTA pill
    overlay: "rgb(16 24 40 / 0.6)" // modal backdrop (gray-900 tint)
  },
  text: {
    primary: hfColor.gray[900], // #101828 primary text
    secondary: hfColor.gray[500], // #6a7282 secondary text
    muted: hfColor.gray[400], // #99a1af placeholder / disabled text
    inverse: hfColor.gray[0], // white on dark / coloured surfaces
    link: hfColor.indigo.primary // #4f39f6 indigo interactive link
  },
  border: {
    subtle: hfColor.gray[300], // #d1d5dc default border
    strong: hfColor.gray[400], // #99a1af stronger border
    interactive: hfColor.indigo.primary // #4f39f6 focus / interactive
  },
  action: {
    // Brand-forward primary: the iconic HF yellow pill with BLACK text (the
    // hugging-emoji pairing). The literal dark Sign-Up CTA lives in
    // surface.inverse.
    primary: hfColor.yellow.main, // #ffd21e HF brand yellow
    primaryHover: hfColor.yellow.hover, // #e6bd1b darker yellow (à confirmer)
    primaryText: "#000000", // black text on yellow (HF emoji-outline pairing)
    secondary: hfColor.gray[100], // #f3f4f6 secondary surface
    secondaryHover: hfColor.gray[200], // #e5e7eb
    secondaryText: hfColor.gray[900], // #101828 dark label
    danger: hfColor.system.error // #e7000b
  },
  feedback: {
    success: hfColor.system.success,
    warning: hfColor.system.warning,
    error: hfColor.system.error,
    info: hfColor.system.info
  },
  status: {
    pending: hfColor.system.warning,
    processing: hfColor.system.info,
    completed: hfColor.system.success,
    failed: hfColor.system.error
  },
  // Categorical data-vis palette built from the HF brand (yellow + orange +
  // pink gradient companions) plus the Tailwind interactive/status hues. HF
  // publishes no sequential data-vis scale, so this is a coherent proposal
  // (see MAPPING.md, "à confirmer"). The HF brand gradient is #ff9d00/yellow
  // (category6) → #e60076 (category5).
  data: {
    category1: hfColor.yellow.main, // HF brand yellow
    category2: hfColor.indigo.primary, // indigo-600
    category3: hfColor.system.success, // emerald-600
    category4: hfColor.system.error, // red-600
    category5: hfColor.pink.main, // pink-600 (gradient end)
    category6: hfColor.orange.main, // HF orange (gradient start)
    category7: hfColor.system.info, // blue-600
    category8: hfColor.gray[600] // gray-600
  }
} as const;

/**
 * The Hugging Face theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry HF-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the HF brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const huggingfaceTheme: TenantTheme = {
  id: "huggingface",
  label: "Hugging Face",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default huggingfaceTheme;
