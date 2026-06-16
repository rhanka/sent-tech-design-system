import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Air Transat (airtransat.com — the Montréal-based leisure airline / travel
 * brand, part of Transat A.T. Inc.) theme for the Sentropic token structure.
 *
 * Air Transat publishes no public design-token file; the values below are
 * MEASURED from the live site's computed CSS (https://www.airtransat.com,
 * inspected in a real browser). We only reference the font *names* here, never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Air Transat's identity is a strong-BLUE + deep-NAVY system: a vivid Transat
 * blue for primary CTAs (measured #005eba, the single most frequent brand
 * colour — 261 occurrences in the live CSS), a deep navy for hover / inverse
 * bands (#002855), and a bright light-blue accent (#3fbbef) for highlights and
 * data. Body text is a near-black soft grey on white, with measured neutral
 * greys for fills and hairlines. Where Sentropic needs a role Air Transat never
 * colours (e.g. a non-brand accent or some feedback states) the closest
 * measured/derived value is used and noted "à confirmer" in MAPPING.md.
 *
 * Air Transat colour reference (measured, light theme):
 *   Transat blue (action / CTA)        #005eba   measured, 261 occurrences
 *   Deep navy (hover / inverse band)   #002855   measured
 *   Darkest navy                       #0f254a   measured (terminal navy)
 *   Light-blue accent                  #3fbbef   measured highlight / data accent
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #1a1a1a   near-black body text
 *   Secondary text                     #696969   rgb(105,105,105) measured
 *   Muted text                         #8a8f96   measured neutral grey
 *   Subtle fill surface                #f2f6fb   pale blue-grey fill (measured)
 *   Field / hairline border            #c2c2c2   rgb(194,194,194) measured
 *   Danger / error                     #d72020   measured system red
 */

// --- Air Transat raw colour palette (measured from live computed CSS) -------
const airTransatColor = {
  // The brand / CTA blue. The single most frequent colour in the live CSS
  // (measured 261 occurrences) — used for the primary call-to-action, links,
  // active tabs/pagination/breadcrumb and focus.
  blue: "#005eba", // Transat blue — primary action / CTA (measured)
  // Deep navy — the hover state for the primary CTA and the inverse band tone.
  navy: "#002855", // deep navy — primary hover / inverse surface (measured)
  // Darkest navy — the terminal dark step (footer / heaviest navy).
  navyDarkest: "#0f254a", // darkest navy (measured)
  // Bright light-blue accent — highlights, the Sentropic "cyan" accent slot,
  // and the second data-vis category.
  accent: "#3fbbef", // light-blue accent (measured)
  white: "#ffffff", // page background — surface default
  // Soft monochrome ink scale (each value measured from a real element).
  ink: {
    // Primary body text — a near-black.
    primary: "#1a1a1a", // near-black body text colour
    // Secondary text.
    secondary: "#696969", // rgb(105,105,105) — secondary text (measured)
    // Muted text / neutral grey.
    muted: "#8a8f96" // measured neutral grey — muted text
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f2f6fb", // pale blue-grey subtle fill surface (measured)
    border: "#c2c2c2" // rgb(194,194,194) — field / hairline border (measured)
  },
  // Feedback / system hues. The danger red is measured from the live CSS; the
  // remaining states are restrained, legible (WCAG AA on white) values chosen
  // to sit with the blue/navy identity — "à confirmer", no measured equivalent.
  system: {
    danger: "#d72020", // measured system red — error / danger
    success: "#2e7d32", // muted green — à confirmer (no Air Transat source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#005eba" // Air Transat "info" = its Transat blue, not a generic blue
  }
} as const;

// --- foundation (Air Transat-specific values) -------------------------------
const foundation = {
  color: {
    // Air Transat's brand IS a blue — the Sentropic "blue" role family (action /
    // primary / link) maps directly onto the measured Transat blue → navy ramp.
    blue: {
      10: airTransatColor.grey.subtle, // #f2f6fb lightest blue-grey tint
      60: airTransatColor.blue, // #005eba primary action (Transat blue CTA)
      80: airTransatColor.navy // #002855 deep navy (hover / dark step)
    },
    // The Sentropic "cyan" accent slot maps onto Air Transat's bright light-blue
    // accent (#3fbbef).
    cyan: {
      10: airTransatColor.grey.subtle, // #f2f6fb light blue-grey tint
      50: airTransatColor.accent, // #3fbbef light-blue accent (measured)
      70: airTransatColor.blue // #005eba Transat blue
    },
    // Sentropic "slate" role family mapped onto the Air Transat ink/grey/navy
    // scale.
    slate: {
      0: airTransatColor.white, // #ffffff white
      10: airTransatColor.grey.subtle, // #f2f6fb subtle fill surface
      20: airTransatColor.grey.border, // #c2c2c2 hairline / subtle border
      60: airTransatColor.ink.secondary, // #696969 secondary text
      80: airTransatColor.ink.primary, // #1a1a1a primary text (near-black)
      90: airTransatColor.navyDarkest // #0f254a darkest navy
    },
    feedback: {
      success: airTransatColor.system.success,
      warning: airTransatColor.system.warning,
      error: airTransatColor.system.danger,
      info: airTransatColor.system.info
    }
  },
  // Air Transat sets its UI in 'Jokker', a proprietary geometric sans-serif that
  // is not publicly distributable. We substitute Inter (a close, open geometric
  // humanist sans) and reference the *names* only — à confirmer (Jokker is
  // proprietary, Inter is our substitute). Mono is not part of Air Transat — the
  // Sentropic mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Air Transat's raw spacing steps are not strongly
  // tokenised publicly; kept aligned with the Sentropic base 4px scale
  // ("à confirmer" exact steps).
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
  // Air Transat uses MODERN rounding — measured small radii on controls, a soft
  // 6px on buttons/inputs and ~10px on cards, with pill chips. Friendly, not
  // boxy.
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle 2px (measured)
    md: "6px", // button / input / tabs — soft 6px (measured)
    lg: "10px", // cards — rounded 10px (measured)
    pill: "999px" // tags / pills / chips
  },
  // Air Transat elevation is soft and modern — low, blue-tinted shadows on
  // raised elements. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 40 85 / 0.08)",
    medium: "0 4px 12px rgb(0 40 85 / 0.12)",
    floating: "0 8px 24px rgb(0 40 85 / 0.16)"
  },
  // Air Transat animates with short, standard eases (measured ≈ 200ms
  // transitions). Durations not fully tokenised publicly; kept aligned with the
  // base.
  motion: {
    fast: "120ms",
    normal: "200ms", // measured button transition duration
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Air Transat-specific; kept aligned with the Sentropic
  // base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Air Transat) ------------------------------------
  // Air Transat borders are thin neutral-grey hairlines (#c2c2c2 @1px). Encoded
  // as 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Air Transat hairline (#c2c2c2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Air Transat control density. Measured CTA buttons sit ~44px tall with
  // generous horizontal padding; nav/body text is mid-sized sans. md targets a
  // ~44px touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Air Transat typography = the geometric sans. Control labels are mid-weight
  // sans; body/field text is sentence case. CTAs are not tracked uppercase on
  // the live site (measured — sentence/normal case).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Air Transat links are Transat blue at rest; the hover affordance is an
    // underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Air Transat dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Air Transat FOCUS = a crisp Transat-blue OUTLINE (~2px solid #005eba). We
  // encode the blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: airTransatColor.blue, // #005eba — Air Transat focuses in Transat blue
    inset: "0"
  },
  // Air Transat form fields are BOXED (outline): a white fill with a thin
  // neutral-grey hairline border and a soft 6px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #c2c2c2 @1px hairline.
  field: {
    style: "outline",
    fillBg: airTransatColor.white, // #ffffff
    underlineColor: airTransatColor.grey.border, // #c2c2c2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the Transat blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23005eba' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Air Transat cards: soft 10px rounding, a thin neutral hairline rather than a
  // heavy box, with a faint pale-blue hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: airTransatColor.grey.subtle // #f2f6fb faint hover tint
  },
  // Air Transat secondary button = a soft pale-blue-grey filled chip (light
  // #f2f6fb fill, navy text, slightly darker on hover) — the quiet alternative
  // to the filled Transat-blue primary.
  buttonSecondary: {
    background: airTransatColor.grey.subtle, // #f2f6fb soft fill
    border: airTransatColor.grey.border, // #c2c2c2 light hairline
    hoverBackground: airTransatColor.grey.border // #c2c2c2 on hover
  },
  // Air Transat tabs / sub-nav: active tab = Transat-blue label with a Transat-
  // blue bottom underline (the indicator), transparent fill.
  tabs: {
    activeText: airTransatColor.blue, // #005eba
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // Transat-blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Air Transat pagination: borderless ink text links; active page = filled
  // Transat-blue box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: airTransatColor.ink.primary, // #1a1a1a link text
    activeBackground: airTransatColor.blue, // #005eba filled active page
    activeText: airTransatColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Air Transat breadcrumb: ink links, grey trail, Transat-blue current page,
  // grey separators — all sans type.
  breadcrumb: {
    linkText: airTransatColor.ink.primary, // #1a1a1a
    text: airTransatColor.ink.secondary, // #696969 trail text
    currentText: airTransatColor.blue, // #005eba current page
    separator: airTransatColor.ink.secondary, // #696969
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Air Transat notice / alert: a minimal box — a thin coloured left filet on a
  // white box, no fill. The severity accent is a slim left bar.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.1875rem", // 3px ::before accent bar
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Air Transat accordion / disclosure: an ink, mid-weight sans summary trigger,
  // soft rounding, hairline separated.
  accordion: {
    text: airTransatColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Air Transat tag: a small soft pale-blue-grey pill chip.
  tag: {
    radius: "999px", // pill rounding (modern chip)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: airTransatColor.grey.subtle, // #f2f6fb subtle fill
    neutralText: airTransatColor.ink.primary // #1a1a1a
  },
  // Air Transat badge: a small filled badge — Transat-blue fill / white text,
  // soft 6px rounding.
  badge: {
    radius: "6px", // soft rounding (matches md)
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Air Transat labels are sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: airTransatColor.blue, // #005eba (Air Transat "info" = Transat blue)
    infoText: airTransatColor.white // white on blue
  },
  // Air Transat checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: airTransatColor.ink.primary // #1a1a1a
  },
  // Air Transat search input: a boxed neutral hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Air Transat toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: airTransatColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Air Transat-specific role mapping) ---------------------------
const semantic = {
  surface: {
    default: airTransatColor.white, // #ffffff white
    subtle: airTransatColor.grey.subtle, // #f2f6fb pale blue-grey subtle fill
    raised: airTransatColor.white, // #ffffff white
    inverse: airTransatColor.navy, // #002855 deep navy inverse band
    overlay: "rgb(0 40 85 / 0.5)" // modal backdrop — navy @50%
  },
  text: {
    primary: airTransatColor.ink.primary, // #1a1a1a near-black body text
    secondary: airTransatColor.ink.secondary, // #696969 (measured)
    muted: airTransatColor.ink.muted, // #8a8f96 (measured neutral grey)
    inverse: airTransatColor.white, // white on navy / dark surfaces
    link: airTransatColor.blue // #005eba — Air Transat links are Transat blue
  },
  border: {
    subtle: airTransatColor.grey.border, // #c2c2c2 light hairline (field / divider)
    strong: airTransatColor.ink.secondary, // #696969 stronger border
    interactive: airTransatColor.blue // #005eba focus / interactive
  },
  action: {
    primary: airTransatColor.blue, // #005eba primary button (Transat blue CTA)
    primaryHover: airTransatColor.navy, // #002855 deep navy on hover (measured)
    primaryText: airTransatColor.white, // white text on blue
    secondary: airTransatColor.grey.subtle, // #f2f6fb secondary surface
    secondaryHover: airTransatColor.grey.border, // #c2c2c2
    secondaryText: airTransatColor.ink.primary, // #1a1a1a
    danger: airTransatColor.system.danger // #d72020
  },
  feedback: {
    success: airTransatColor.system.success,
    warning: airTransatColor.system.warning,
    error: airTransatColor.system.danger,
    info: airTransatColor.system.info
  },
  status: {
    pending: airTransatColor.system.warning,
    processing: airTransatColor.system.info,
    completed: airTransatColor.system.success,
    failed: airTransatColor.system.danger
  },
  // Categorical data-vis palette. Air Transat publishes no data-vis scale, so
  // this is a coherent proposal built on the measured brand blues (Transat blue
  // → light-blue accent → deep navy) plus neutral greys and the restrained
  // system hues (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: airTransatColor.blue, // #005eba Transat blue
    category2: airTransatColor.accent, // #3fbbef light-blue accent
    category3: airTransatColor.navy, // #002855 deep navy
    category4: airTransatColor.ink.secondary, // #696969 grey
    category5: airTransatColor.grey.border, // #c2c2c2 light grey
    category6: airTransatColor.system.danger, // restrained red (à confirmer)
    category7: airTransatColor.system.success, // restrained green (à confirmer)
    category8: airTransatColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Air Transat theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Air Transat-specific (strong-blue
 * / deep-navy) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Air Transat's Transat-blue
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const airTransatTheme: TenantTheme = {
  id: "air-transat",
  label: "Air Transat",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default airTransatTheme;
