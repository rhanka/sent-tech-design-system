import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Accor ("Welcome by Accor") corporate design system theme for the Sentropic
 * token structure.
 *
 * MEASURED CLONE — all colour values below are measured from Accor's PUBLIC
 * official design system, "Welcome by Accor" (design.accor.com), Brand Tokens
 * page, June 2026. Accor exposes its palette as semantic design tokens
 * (`wel.sem.color.*`) with explicit hex values; each comment cites the real
 * token. We only reference the font *names* (the platform faces Accor documents)
 * here, never the binaries. Sources and any derived ("à confirmer") values are
 * documented in MAPPING.md.
 *
 * NOTE on identity: third-party brand aggregators still list a navy #002B49 /
 * gold #E29C16 pair — that is the LEGACY "AccorHotels" logo (pre-2023), NOT the
 * current design system. The current Accor primary is a very deep indigo
 * `#050033` (almost black, bluish) on white, with a CTA accent blue `#2d4cd5`,
 * a magenta promo accent `#b40875`, and FULL-PILL (100px) CTA buttons — these
 * are the signature anatomy.
 *
 * Accor colour reference (measured, light theme — wel.sem.color.*):
 *   White (surface / background)        #ffffff   (surface)
 *   Ultra-light grey (background alt)   #f7f9fb   (surface-container-mid)
 *   Deep indigo (primary / text inv.)   #050033   (primary)
 *   Lighter indigo (primary hover)      #1f1b4b   (on-primary-container)
 *   Pale indigo (primary container)     #e8edff   (primary-container-hi)
 *   Near-white indigo (on-primary)      #f9f9ff   (on-primary)
 *   Accent CTA blue                     #2d4cd5   (accent)
 *   Pale accent blue                    #ccd2ff   (accent-container-hi)
 *   Link blue                           #0051ae   (link)
 *   Focus blue                          #2a71db   (focus, outline-color)
 *   Loyalty violet (ALL)                #5f5bd2   (loyalty)
 *   Offer / promo magenta               #b40875   (offer)
 *   Strong text (near-black)            #232136   (on-surface-hi)
 *   Mid text                            #38364d   (on-surface-mid)
 *   Low / placeholder text              #5e5b73   (on-surface-low)
 *   Border subtle                       #d9dadc   (outline-low)
 *   Border mid                          #afb1b3   (outline-mid)
 *   Border strong                       #898c8e   (outline-hi)
 *   Danger / error                      #be003c   (danger)
 *   Warning gold                        #f2d166   (warning, on-warning #070518)
 *   Success teal-green                  #006a53   (success)
 *   Eco green                           #237b00   (eco)
 */

// --- Accor raw colour palette (measured on design.accor.com Brand Tokens) ---
const accorColor = {
  // Deep indigo — the Accor primary / brand / action family.
  indigo: {
    primary: "#050033", // wel.sem.color.primary — deep indigo (primary action + inverse surface)
    onContainer: "#1f1b4b", // wel.sem.color.on-primary-container — lighter indigo (hover / strong)
    container: "#e8edff", // wel.sem.color.primary-container-hi — pale indigo container surface
    tint: "#f9f9ff" // wel.sem.color.on-primary / primary-container-low — near-white indigo tint
  },
  // CTA accent blue + supporting blues.
  accent: {
    base: "#2d4cd5", // wel.sem.color.accent — interactive CTA blue
    container: "#ccd2ff", // wel.sem.color.accent-container-hi — pale accent blue
    containerLow: "#f7f5ff", // wel.sem.color.accent-container-low — lightest accent tint
    link: "#0051ae", // wel.sem.color.link — link blue (darker accent for hover/active)
    focus: "#2a71db" // wel.sem.color.focus — keyboard focus outline colour
  },
  // Brand secondary hues (loyalty / promotional).
  brand: {
    loyalty: "#5f5bd2", // wel.sem.color.loyalty — ALL loyalty violet
    offer: "#b40875" // wel.sem.color.offer — promotional / offer magenta
  },
  // Neutral scale (surface + on-surface + outline tokens).
  grey: {
    0: "#ffffff", // wel.sem.color.surface — white
    50: "#f7f9fb", // wel.sem.color.surface-container-mid — ultra-light grey background alt
    200: "#d9dadc", // wel.sem.color.outline-low — subtle border
    400: "#afb1b3", // wel.sem.color.outline-mid — mid border
    500: "#898c8e", // wel.sem.color.outline-hi — strong border / separators
    600: "#5e5b73", // wel.sem.color.on-surface-low — placeholder / muted text
    700: "#38364d", // wel.sem.color.on-surface-mid — secondary text
    900: "#232136" // wel.sem.color.on-surface-hi — strong text (near-black)
  },
  // System / status colours.
  system: {
    success: "#006a53", // wel.sem.color.success — teal-green
    eco: "#237b00", // wel.sem.color.eco — eco green
    error: "#be003c", // wel.sem.color.danger
    warning: "#f2d166", // wel.sem.color.warning — gold (paired with on-warning #070518)
    info: "#0051ae" // wel.sem.color.link — reused as the info blue
  }
} as const;

// --- foundation (Accor-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Accor indigo primary.
    blue: {
      10: accorColor.indigo.container, // #e8edff pale indigo tint
      60: accorColor.indigo.primary, // #050033 deep indigo (primary)
      80: accorColor.indigo.onContainer // #1f1b4b lighter interactive indigo
    },
    // Accor has no cyan; its interactive accent is the CTA blue, so the Sentropic
    // "cyan" accent slot is mapped to the Accor accent-blue family.
    cyan: {
      10: accorColor.accent.container, // #ccd2ff pale accent blue
      50: accorColor.accent.base, // #2d4cd5 CTA accent blue
      70: accorColor.accent.link // #0051ae darker link blue
    },
    // Sentropic "slate" role family mapped onto the Accor neutral scale.
    slate: {
      0: accorColor.grey[0], // #ffffff white
      10: accorColor.grey[50], // #f7f9fb ultra-light grey (background alt)
      20: accorColor.grey[200], // #d9dadc subtle borders / contrast bg
      60: accorColor.grey[600], // #5e5b73 muted / placeholder text
      80: accorColor.grey[700], // #38364d secondary / strong text
      90: accorColor.grey[900] // #232136 darkest / primary text
    },
    feedback: {
      success: accorColor.system.success,
      warning: accorColor.system.warning,
      error: accorColor.system.error,
      info: accorColor.system.info
    }
  },
  // Accor documents platform typefaces on its design system: San Francisco
  // (SF Pro) on iOS and Roboto on Android. The bespoke web face ("Typography
  // Welcome Pack", Adobe Fonts) is not published in clear, so the web stack
  // leans on those documented platform faces (font *names* only, never binaries
  // — see MAPPING.md "à confirmer" for the web face).
  font: {
    sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', Roboto, 'Segoe UI', system-ui, sans-serif",
    display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro', Roboto, 'Segoe UI', system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
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
  // Accor radius (measured, design.accor.com Radius page):
  //   interactive-high/low = 100px (FULL-PILL CTA buttons) → radius.md (buttons)
  //   container-low/high / surface = 6px (cards) → radius.lg
  //   input = 6px (form fields) → field.radiusTop/Bottom (decoupled below)
  //   static-sm = 2px → radius.sm ; full = 100px (avatar/toggle) → radius.pill
  // NB: in the base, buttons AND menus/dropdowns read radius.md; setting it to
  // the measured 100px pill correctly pills the CTAs (the Accor signature) but
  // also rounds menus/dropdowns more than their measured 6px (à confirmer).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px — static-sm
    md: "100px", // interactive-high/low — full-pill CTA buttons (Accor signature)
    lg: "0.375rem", // 6px — container-low/high / surface (cards)
    pill: "999px" // full pill — tags / switch track / avatars
  },
  // Accor elevation is soft and indigo-neutral. Exact specs derived
  // ("à confirmer") — the DS relies on light Material-style elevation.
  shadow: {
    subtle: "0 1px 2px rgb(5 0 51 / 0.08)",
    medium: "0 4px 12px rgb(5 0 51 / 0.12)",
    floating: "0 10px 30px rgb(5 0 51 / 0.16)"
  },
  // Motion is not strongly tokenised in the public DS; kept aligned with the
  // Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Accor-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Accor) ------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Accor control density: comfortable, modern. Heights/paddings are derived to
  // express the brand's airy hospitality rhythm (à confirmer — the public DS
  // does not publish exact control heights).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1.125rem" }
  },
  // Accor typography: a single sans family (the documented platform faces) for
  // interactive/labels/fields. Sizes/weights derived (à confirmer).
  typography: {
    control: { family: "var(--st-font-sans)", size: "1rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "var(--st-font-sans)", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "var(--st-font-sans)", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Accor links: the link blue, underlined; underline thickens on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.18em",
      textDecorationHover: "underline", decorationThicknessHover: "0.12em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.5", // Accor dims disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Accor FOCUS = a 3px solid OUTLINE in the focus blue, offset 3px, shown on
  // keyboard navigation only. Measured: outline-style solid, width 3px,
  // outline-offset 3px, colour wel.sem.color.focus #2a71db.
  focus: {
    strategy: "outline",
    width: "3px", // measured
    offset: "3px", // measured
    color: accorColor.accent.focus, // #2a71db wel.sem.color.focus
    inset: "0"
  },
  // Accor form fields are BOXED (outline): white fill, 1px border (outline-low),
  // and a MEASURED 6px radius (`input` radius token). radiusTop/Bottom are set
  // explicitly so the field stays at 6px even though the button radius (md) is
  // the 100px CTA pill. Native <select> chevron redrawn in the indigo primary.
  field: {
    style: "outline",
    fillBg: accorColor.grey[0], // #ffffff (surface)
    underlineColor: accorColor.grey[200], // #d9dadc (outline-low) — unused for outline, kept for completeness
    underlineWidth: "1px",
    radiusTop: "6px", // wel input radius (decouples fields from the 100px button radius)
    radiusBottom: "6px", // wel input radius
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23050033' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Accor cards: a thin 1px border, 6px radius (container token), pale hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: accorColor.grey[50] // #f7f9fb
  },
  // Accor secondary button = TONAL/OUTLINED: transparent fill, indigo border +
  // text, pale-indigo (secondary-container) fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: accorColor.indigo.primary, // #050033 indigo stroke
    hoverBackground: accorColor.indigo.container // #e8edff pale indigo fill on hover
  },
  // Accor tabs / nav: active tab = bold accent-blue label with a bottom accent
  // underline.
  tabs: {
    activeText: accorColor.accent.base, // #2d4cd5
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // accent underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Accor pagination: borderless accent links; active page = filled indigo.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: accorColor.accent.base, // #2d4cd5 link text
    activeBackground: accorColor.indigo.primary, // #050033 filled active page
    activeText: accorColor.indigo.tint, // #f9f9ff near-white on indigo
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accor breadcrumb: link-blue links, near-black current page, grey separators.
  breadcrumb: {
    linkText: accorColor.accent.link, // #0051ae
    text: accorColor.grey[600], // #5e5b73 trail text
    currentText: accorColor.grey[900], // #232136 current page
    separator: accorColor.grey[500], // #898c8e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Accor notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Accor details: a near-black bold summary trigger.
  accordion: {
    text: accorColor.grey[900], // #232136 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Accor tag: a small 6px-radius (static-lg) grey chip.
  tag: {
    radius: "6px", // static-lg
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: accorColor.grey[50], // #f7f9fb
    neutralText: accorColor.grey[900] // #232136
  },
  // Accor badge: a 4px-radius (static-md, measured for Badge) filled badge.
  badge: {
    radius: "4px", // static-md — measured Badge radius
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: accorColor.accent.base, // #2d4cd5 accent
    infoText: accorColor.grey[0] // #ffffff (on-accent)
  },
  // Accor checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: accorColor.grey[900] // #232136
  },
  // Accor search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accor toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: accorColor.grey[900] // #232136
  }
} as const;

// --- semantic (Accor-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: accorColor.grey[0], // #ffffff white (surface)
    subtle: accorColor.grey[50], // #f7f9fb ultra-light grey background alt
    raised: accorColor.grey[0], // #ffffff white
    inverse: accorColor.indigo.primary, // #050033 deep indigo inverse surface (footer/dark)
    overlay: "rgb(5 0 51 / 0.6)" // modal backdrop (indigo tint)
  },
  text: {
    primary: accorColor.grey[900], // #232136 (on-surface-hi)
    secondary: accorColor.grey[700], // #38364d (on-surface-mid)
    muted: accorColor.grey[600], // #5e5b73 (on-surface-low)
    inverse: accorColor.indigo.tint, // #f9f9ff near-white on dark / indigo surfaces
    link: accorColor.accent.link // #0051ae (link)
  },
  border: {
    subtle: accorColor.grey[200], // #d9dadc (outline-low)
    strong: accorColor.grey[500], // #898c8e (outline-hi)
    interactive: accorColor.accent.base // #2d4cd5 accent (interactive)
  },
  action: {
    primary: accorColor.indigo.primary, // #050033 deep indigo primary button
    primaryHover: accorColor.indigo.onContainer, // #1f1b4b lighter indigo hover (on-primary-container)
    primaryText: accorColor.indigo.tint, // #f9f9ff near-white on indigo (on-primary)
    secondary: accorColor.indigo.container, // #e8edff pale indigo secondary surface
    secondaryHover: accorColor.accent.container, // #ccd2ff
    secondaryText: accorColor.indigo.primary, // #050033 indigo text
    danger: accorColor.system.error // #be003c
  },
  feedback: {
    success: accorColor.system.success, // #006a53 teal-green
    warning: accorColor.system.warning, // #f2d166 gold
    error: accorColor.system.error, // #be003c
    info: accorColor.system.info // #0051ae link blue
  },
  status: {
    pending: accorColor.system.warning, // gold
    processing: accorColor.system.info, // link blue
    completed: accorColor.system.success, // teal-green
    failed: accorColor.system.error // red
  },
  // Categorical data-vis palette built from the measured Accor brand hues.
  // (Accor publishes no 8-colour sequential scale — see MAPPING.md "à confirmer".)
  data: {
    category1: accorColor.indigo.primary, // #050033 deep indigo
    category2: accorColor.accent.base, // #2d4cd5 accent blue
    category3: accorColor.system.success, // #006a53 teal-green
    category4: accorColor.brand.offer, // #b40875 offer magenta
    category5: accorColor.brand.loyalty, // #5f5bd2 loyalty violet
    category6: accorColor.accent.link, // #0051ae link blue
    category7: accorColor.system.warning, // #f2d166 warning gold
    category8: accorColor.system.eco // #237b00 eco green
  }
} as const;

/**
 * The Accor theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Accor-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Accor's brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const accorTheme: TenantTheme = {
  id: "accor",
  label: "Accor",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default accorTheme;
