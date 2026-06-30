import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * AI21 Labs theme for the Sentropic token structure.
 *
 * All values below are MEASURED from AI21 Labs' PUBLIC website CSS
 * (https://www.ai21.com — WordPress theme `build/css/main.min.css`, the
 * `:root` custom-property block and the live component rules). We only
 * reference the font *names* (Inter, Polysans, Aeonik Pro, Aeonik Fono,
 * Sohne) here, never the font binaries. Sources + provenance are documented
 * in MAPPING.md. Where AI21 publishes no direct equivalent for a Sentropic
 * role, the closest measured brand token is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * AI21 colour reference (measured `:root` custom properties, light theme):
 *   --deep-pink              #e61e93   brand primary (the AI21 magenta-pink)
 *   --primary-magenta        #f06b98   lighter brand pink
 *   --primary-magenta-light  #ed4b82
 *   --primary-magenta-dark   #d00b4e   darker interactive / hover
 *   --primary-magenta-darker #ac043d   deepest crimson (danger / error)
 *   --default-black          #212121   body text
 *   --neutral-100            #f8f7fc   lightest surface (purple-tinted)
 *   --neutral-200            #e1dfec   subtle border
 *   --neutral-300            #bcb8d0   strong border
 *   --neutral-400            #8c87a6   muted text
 *   --neutral-500            #5b5675   secondary text
 *   --neutral-700            #2a263f   strong text
 *   --neutral-800            #141125   primary text (near-black, brand tint)
 *   --neutral-900            #0a071b   darkest inverse surface
 *   --turquoise-normal       #5ec6e8   turquoise accent
 *   --turquoise-dark         #1c8ab9   turquoise (info)
 *   --turquoise-darker       #066188
 *   --read-primary-blue-light#ace6f9   light turquoise tint
 *   --yellow-normal          #f9bd64   brand yellow
 *   --yellow-darker          #a96b0f   yellow darkened for AA warning text
 *   --write-primary-normal   #6e42e1   purple accent
 *   --write-primary-light    #a23bcb
 *   --light-steel-blue       #a4c4fa   pale blue accent
 *
 * AI21 brand gradients (no Sentropic gradient token; documented in MAPPING):
 *   page bg     linear-gradient(0deg, #FFF4E1 0%, #F6F5F3 81.5%)  (warm cream)
 *   pink CTA    linear-gradient(90deg, #FFBDB6 -51.58%, #FFD6EC 74.31%)
 */

// --- AI21 raw colour palette (measured `:root` custom properties) ----------
const ai21Color = {
  // The AI21 brand magenta-pink family — the signature identity colour.
  pink: {
    deep: "#e61e93", // --deep-pink — brand primary
    magenta: "#f06b98", // --primary-magenta — lighter brand pink
    magentaLight: "#ed4b82", // --primary-magenta-light
    magentaDark: "#d00b4e", // --primary-magenta-dark — hover/active
    magentaDarker: "#ac043d", // --primary-magenta-darker — deepest crimson / danger
    carmineHover: "#771234", // measured carmine button hover text
    tint10: "#fde7f2" // light pink fill (derived from --deep-pink — à confirmer)
  },
  // AI21 turquoise accent family (mapped to the Sentropic cyan slot).
  turquoise: {
    light: "#ace6f9", // --read-primary-blue-light
    normal: "#5ec6e8", // --turquoise-normal
    dark: "#1c8ab9", // --turquoise-dark — info
    darker: "#066188" // --turquoise-darker
  },
  // AI21 yellow / amber accent.
  yellow: {
    light: "#feddac", // --yellow-light
    normal: "#f9bd64", // --yellow-normal
    dark: "#db942a", // --yellow-dark
    darker: "#a96b0f" // --yellow-darker — AA-safe warning text on white
  },
  // AI21 purple ("write") accent family.
  purple: {
    normal: "#6e42e1", // --write-primary-normal
    light: "#a23bcb", // --write-primary-light
    dark: "#7b08a9", // --write-primary-dark
    secondary: "#ddd0ff" // --write-secondary
  },
  // AI21 pale blue accent.
  steelBlue: "#a4c4fa", // --light-steel-blue
  // AI21 neutral scale — a distinctly PURPLE-TINTED grey ramp.
  neutral: {
    0: "#ffffff", // white
    50: "#fbfbfb", // measured body background
    100: "#f8f7fc", // --neutral-100 — lightest surface
    200: "#e1dfec", // --neutral-200 — subtle border
    300: "#bcb8d0", // --neutral-300 — strong border
    400: "#8c87a6", // --neutral-400 — muted text
    500: "#5b5675", // --neutral-500 — secondary text
    600: "#3c3754", // --neutral-600
    700: "#2a263f", // --neutral-700 — strong text
    800: "#141125", // --neutral-800 — primary text (near-black, brand tint)
    900: "#0a071b", // --neutral-900 — darkest inverse surface
    black: "#212121" // --default-black — measured body copy colour
  },
  // System / status colours. AI21 publishes no green; success is introduced
  // (à confirmer). The others are drawn from the measured accent families.
  system: {
    success: "#157f4f", // introduced AA green — AI21 has no published green (à confirmer)
    warning: "#a96b0f", // --yellow-darker (AA on white)
    error: "#ac043d", // --primary-magenta-darker — deep crimson, distinct from primary pink
    info: "#1c8ab9" // --turquoise-dark
  }
} as const;

// --- foundation (AI21-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (the primary/action family) mapped onto the
    // AI21 brand PINK — AI21's action colour is magenta-pink, not blue.
    blue: {
      10: ai21Color.pink.tint10, // light pink fill (à confirmer)
      60: ai21Color.pink.deep, // #e61e93 deep-pink (primary)
      80: ai21Color.pink.magentaDarker // #ac043d darkest interactive
    },
    // AI21 has no cyan; the closest accent is the turquoise family, so the
    // Sentropic "cyan" accent slot maps onto AI21 turquoise.
    cyan: {
      10: ai21Color.turquoise.light, // #ace6f9
      50: ai21Color.turquoise.normal, // #5ec6e8
      70: ai21Color.turquoise.darker // #066188
    },
    // Sentropic "slate" role family mapped onto the AI21 purple-tinted neutrals.
    slate: {
      0: ai21Color.neutral[0], // white
      10: ai21Color.neutral[100], // #f8f7fc lightest surface
      20: ai21Color.neutral[200], // #e1dfec subtle border
      60: ai21Color.neutral[500], // #5b5675 secondary text
      80: ai21Color.neutral[700], // #2a263f strong text
      90: ai21Color.neutral[900] // #0a071b darkest
    },
    feedback: {
      success: ai21Color.system.success,
      warning: ai21Color.system.warning,
      error: ai21Color.system.error,
      info: ai21Color.system.info
    }
  },
  // AI21 ships "Inter" (body), "Polysans" (h1–h6 default), "Aeonik Pro" (hero
  // titles), "Aeonik Fono" (buttons / captions — uppercase) and "Sohne" (hero
  // body). Font *names* only, never binaries.
  font: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Polysans', 'Aeonik Pro', 'Inter', system-ui, -apple-system, sans-serif",
    mono: "'Aeonik Fono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base for
  // component-grid fidelity; AI21 publishes no public spacing scale — à confirmer).
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
  // AI21 rounding: the measured site uses 4px (search inputs), 10px (the most
  // common card/box radius), 15px (larger cards), and 40px+ pill buttons.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — search input (measured)
    md: "0.625rem", // 10px — most common card/box radius (measured)
    lg: "0.9375rem", // 15px — larger cards (measured)
    pill: "999px" // pill buttons (measured border-radius:40px)
  },
  // Soft neutral elevation. AI21 publishes no public shadow scale — these
  // approximate the site's subtle card shadows (à confirmer), tinted with the
  // brand purple-black neutral.
  shadow: {
    subtle: "0 1px 2px rgb(20 17 37 / 0.06), 0 1px 3px rgb(20 17 37 / 0.10)",
    medium: "0 2px 6px rgb(20 17 37 / 0.08), 0 6px 16px rgb(20 17 37 / 0.12)",
    floating: "0 8px 24px rgb(20 17 37 / 0.16), 0 16px 48px rgb(20 17 37 / 0.18)"
  },
  // Motion. AI21 buttons transition at 150ms ease (measured); the rest is
  // aligned with the Sentropic base (à confirmer).
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition
    slow: "280ms",
    easing: "ease" // measured (transition: all 150ms ease)
  },
  // z-index roles are not AI21-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (AI21) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // AI21 control density. The marketing site uses generous, chunky controls
  // (search input ≈ 50px). Densities kept reasonable for a DS; exact spec
  // "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2.25rem", gap: "0.625rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // AI21 typography: buttons/controls use "Aeonik Fono" UPPERCASE (the measured
  // .btn signature); labels use the body Inter; fields use Inter; links inherit.
  typography: {
    control: { family: "'Aeonik Fono', 'Inter', monospace", size: "0.875rem", weight: "400", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', sans-serif", size: "1rem", weight: "300", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // AI21 links are NOT underlined (measured `a { text-decoration: none; color: inherit }`).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // à confirmer (no measured disabled spec)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // AI21 FOCUS: the live site suppresses native outlines (`outline: none` on
  // controls). For an accessible DS we add a brand-pink box-shadow RING — the
  // technique is introduced, the colour is the measured brand pink (à confirmer).
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: ai21Color.pink.deep, // #e61e93 brand pink
    inset: "0"
  },
  // AI21 form fields are UNDERLINED, not boxed. Measured on the real
  // `.select2-selection--single` / contact-form inputs:
  //   border: none; border-bottom: .5px solid #212121; border-radius: 0;
  //   background: none; font-family: "Inter".
  // → `filled-underline` with a transparent fill, a real bottom border, and
  // square corners. The 0.5px bottom rule is rounded to 1px.
  field: {
    style: "filled-underline",
    fillBg: "transparent", // measured `background: none`
    underlineColor: ai21Color.neutral.black, // #212121 bottom rule
    underlineWidth: "1px", // measured 0.5px → rounded to 1px
    radiusTop: "0", // square corners (measured border-radius:0)
    radiusBottom: "0",
    underlineMode: "border", // a real bottom border (measured), not a shadow inset
    // Native <select>: AI21 redraws the chevron (bg-select.svg); we redraw it as
    // a dark #212121 arrow with appearance:none and a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23212121' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.5rem center",
    selectPaddingRight: "2rem"
  },
  // AI21 card: a soft rounded box (10px radius), subtle neutral hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: ai21Color.neutral[100] // #f8f7fc
  },
  // AI21 secondary/primary CTA: an OUTLINED pill — transparent fill, a 1px
  // near-black border, uppercase label (measured `.btn--primary`).
  buttonSecondary: {
    background: "transparent",
    border: ai21Color.neutral.black, // #212121 stroke
    hoverBackground: ai21Color.neutral[100] // #f8f7fc light fill on hover
  },
  // AI21 tabs: active tab in the brand pink with a bottom indicator (à confirmer
  // — no dedicated public tab component measured; modelled on the brand accent).
  tabs: {
    activeText: ai21Color.pink.deep, // #e61e93
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "400",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // AI21 pagination: borderless brand-pink links; active page filled pink
  // (à confirmer — modelled on the brand accent).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ai21Color.pink.deep, // #e61e93
    activeBackground: ai21Color.pink.deep, // #e61e93 filled active page
    activeText: ai21Color.neutral[0], // white on pink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // AI21 breadcrumb: pink links, dark current page, neutral separators
  // (à confirmer — modelled on the brand accent + neutrals).
  breadcrumb: {
    linkText: ai21Color.pink.deep, // #e61e93
    text: ai21Color.neutral[500], // #5b5675 trail text
    currentText: ai21Color.neutral[800], // #141125 current page
    separator: ai21Color.neutral[400], // #8c87a6
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "400"
  },
  // Banner / notice: a coloured LEFT accent filet on a transparent box
  // (à confirmer — modelled, no measured alert component).
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Accordion: a dark summary trigger (à confirmer — modelled on the neutrals).
  accordion: {
    text: ai21Color.neutral[800], // #141125 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem" // 20px
  },
  // Tag / chip: a pill-rounded neutral chip (à confirmer — modelled on the neutrals).
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px
    neutralBackground: ai21Color.neutral[100], // #f8f7fc
    neutralText: ai21Color.neutral[700] // #2a263f
  },
  // Badge: a small filled badge (à confirmer — modelled).
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: ai21Color.pink.deep, // #e61e93
    infoText: ai21Color.neutral[0] // white
  },
  // Checkbox/radio label (à confirmer — modelled on the neutrals).
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: ai21Color.neutral[800] // #141125
  },
  // Search input (measured: input[type=search] is a 4px-radius white box).
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label (à confirmer — modelled on the neutrals).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: ai21Color.neutral[800] // #141125
  }
} as const;

// --- semantic (AI21-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: ai21Color.neutral[0], // white
    subtle: ai21Color.neutral[100], // #f8f7fc lightest surface / hover fill
    raised: ai21Color.neutral[0], // white
    inverse: ai21Color.neutral[900], // #0a071b deep purple-black inverse surface
    overlay: "rgb(10 7 27 / 0.6)" // modal backdrop (neutral-900 tint)
  },
  text: {
    primary: ai21Color.neutral[800], // #141125 primary text (brand-tinted near-black)
    secondary: ai21Color.neutral[500], // #5b5675 secondary text
    muted: ai21Color.neutral[400], // #8c87a6 muted / placeholder text
    inverse: ai21Color.neutral[0], // white on dark / coloured surfaces
    link: ai21Color.pink.deep // #e61e93 brand pink link (à confirmer — site uses inherit)
  },
  border: {
    subtle: ai21Color.neutral[200], // #e1dfec default border
    strong: ai21Color.neutral[300], // #bcb8d0 stronger border
    interactive: ai21Color.pink.deep // #e61e93 focus / interactive
  },
  action: {
    primary: ai21Color.pink.deep, // #e61e93 primary button (brand pink)
    primaryHover: ai21Color.pink.magentaDark, // #d00b4e darker hover
    primaryText: ai21Color.neutral[0], // white text on pink (à confirmer — AA)
    secondary: ai21Color.neutral[100], // #f8f7fc secondary surface
    secondaryHover: ai21Color.neutral[200], // #e1dfec
    secondaryText: ai21Color.neutral[800], // #141125
    danger: ai21Color.system.error // #ac043d deep crimson
  },
  feedback: {
    success: ai21Color.system.success,
    warning: ai21Color.system.warning,
    error: ai21Color.system.error,
    info: ai21Color.system.info
  },
  status: {
    pending: ai21Color.system.warning,
    processing: ai21Color.system.info,
    completed: ai21Color.system.success,
    failed: ai21Color.system.error
  },
  // Categorical data-vis palette built from the measured AI21 accent families
  // (pink, turquoise, yellow, purple). AI21 publishes no 8-colour sequential
  // data-vis scale, so this is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: ai21Color.pink.deep, // #e61e93 deep-pink
    category2: ai21Color.turquoise.normal, // #5ec6e8 turquoise
    category3: ai21Color.yellow.normal, // #f9bd64 yellow
    category4: ai21Color.purple.normal, // #6e42e1 purple
    category5: ai21Color.turquoise.darker, // #066188 deep turquoise
    category6: ai21Color.pink.magentaDarker, // #ac043d deep crimson
    category7: ai21Color.purple.light, // #a23bcb light purple
    category8: ai21Color.steelBlue // #a4c4fa pale blue
  }
} as const;

/**
 * The AI21 Labs theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry AI21-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the AI21 brand (pink action, underlined fields,
 * uppercase Aeonik Fono buttons, purple-tinted neutrals) reaches the
 * components, not just the elements that read semantic vars directly.
 */
export const ai21Theme: TenantTheme = {
  id: "ai21",
  label: "AI21 Labs",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ai21Theme;
