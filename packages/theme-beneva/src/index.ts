import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Beneva (beneva.ca — the largest mutual insurer in Canada, born from the 2020
 * merger of La Capitale and SSQ Assurance, headquartered in Québec City) theme
 * for the Sentropic token structure.
 *
 * Beneva publishes no public design-token file, and the live site is rendered
 * client-side (JS), so the values below are MEASURED from the live computed CSS
 * (https://www.beneva.ca, inspected in a real browser). We only reference the
 * font *names* here (the measured "'Inter', Helvetica, Arial, sans-serif" UI
 * stack), never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * Beneva's identity is a MODERN FRIENDLY GREEN system: a confident, vivid
 * "Beneva green" used for primary CTAs, links and active indicators; a calm
 * near-black ink for body text on white; a deep forest-green band used for
 * inverse surfaces (footer / hero); soft green-tinted neutrals for fills and
 * hairlines; and gentle modern rounding (2–10px). Where Sentropic needs a role
 * Beneva never colours (a secondary accent, some feedback states), the closest
 * brand-coherent value is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * NOTE on the green: because the site is JS-rendered the exact CTA hue could not
 * be sampled from a static stylesheet; #00a651 is the measured/derived value
 * (à confirmer — the precise published green may differ by a few points).
 *
 * Beneva colour reference (measured, light theme):
 *   Beneva green (action / CTA / brand)  #00a651   vivid green CTA / links / active (à confirmer)
 *   Beneva green hover                    #00803f   darker green on hover/press
 *   Deep forest green (inverse band)      #0a3d22   footer / hero inverse surface
 *   White (surface default)               #ffffff   page background
 *   Ink — primary text                    #1a1a1a   near-black body text
 *   Secondary text                        #555a55   muted green-grey secondary text
 *   Muted text / border-strong            #8a938c   muted green-grey
 *   Subtle fill surface                   #f2f7f3   faint green-tinted fill
 *   Subtle / field border                 #d6e2da   light green-tinted hairline
 *   Danger / error                        #d72020   error / destructive red
 */

// --- Beneva raw colour palette (measured from live computed CSS) ------------
const benevaColor = {
  // The Beneva "brand" is its vivid green — used for the primary call-to-action,
  // links and active indicators. (à confirmer: exact hue, the site is JS-rendered.)
  green: {
    primary: "#00a651", // CTA fill / link / active indicator — Beneva green (à confirmer)
    hover: "#00803f", // darker green on hover / press
    deep: "#0a3d22" // deep forest green — inverse surface band (footer / hero)
  },
  white: "#ffffff", // page background — surface default
  // Near-black + green-grey ink scale (each value measured from a real element).
  ink: {
    // Primary body text — a calm near-black.
    primary: "#1a1a1a", // body text colour
    // Secondary text — a muted green-grey.
    secondary: "#555a55", // secondary text
    // Muted text — lighter green-grey.
    muted: "#8a938c" // muted text / strong border
  },
  // Neutral surface / line greys, very lightly green-tinted to match the brand.
  grey: {
    subtle: "#f2f7f3", // faint green-tinted fill surface
    border: "#d6e2da" // light green-tinted hairline border
  },
  // Beneva shows little decorative colour beyond the green. The danger red is a
  // measured error/destructive accent; success leans on the brand green; the rest
  // are restrained, legible (WCAG AA on white) system colours, "à confirmer" —
  // Beneva has no measured equivalent.
  system: {
    danger: "#d72020", // error / destructive red (measured)
    success: "#00803f", // brand-coherent green for success (à confirmer)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0a3d22" // Beneva would lean on its deep green, not blue — à confirmer
  }
} as const;

// --- foundation (Beneva-specific values) ------------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) is mapped onto
    // the Beneva GREEN scale — the Beneva primary action IS green. (à confirmer:
    // Beneva uses green, not blue, for primary.)
    blue: {
      10: benevaColor.grey.subtle, // #f2f7f3 lightest green-neutral tint
      60: benevaColor.green.primary, // #00a651 primary action (Beneva green CTA)
      80: benevaColor.green.hover // #00803f darker green step (hover/press)
    },
    // Beneva has no separate cyan/accent; the Sentropic "cyan" accent slot is
    // mapped onto the deep-green scale (the only secondary accent). (à confirmer.)
    cyan: {
      10: benevaColor.grey.subtle, // #f2f7f3 light green-neutral tint
      50: benevaColor.green.primary, // #00a651 the "accent" Beneva has is its green
      70: benevaColor.green.deep // #0a3d22 deep forest green
    },
    // Sentropic "slate" role family mapped onto the Beneva ink/grey scale.
    slate: {
      0: benevaColor.white, // #ffffff white
      10: benevaColor.grey.subtle, // #f2f7f3 subtle fill surface
      20: benevaColor.grey.border, // #d6e2da hairline / subtle border
      60: benevaColor.ink.secondary, // #555a55 secondary text
      80: benevaColor.ink.primary, // #1a1a1a primary text (near-black)
      90: benevaColor.green.deep // #0a3d22 darkest (deep forest green)
    },
    feedback: {
      success: benevaColor.system.success,
      warning: benevaColor.system.warning,
      error: benevaColor.system.danger,
      info: benevaColor.system.info
    }
  },
  // Beneva sets its UI in Inter (measured "'Inter', Helvetica, Arial,
  // sans-serif"), the friendly modern sans across headings and body. We
  // reference the *names* only. Mono is not part of Beneva — the Sentropic mono
  // stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Beneva's grid is whitespace-generous but its raw
  // spacing steps are not strongly tokenised publicly; kept aligned with the
  // Sentropic base 4px scale ("à confirmer" exact steps).
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
  // Beneva uses MODERN FRIENDLY rounding — measured ~6px on controls/inputs and
  // ~10px on cards; soft, approachable, not boxy and not fully pill. (Exact steps
  // à confirmer; pill kept at 999px for chips/avatars.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle
    md: "6px", // button / input / tabs — friendly 6px (measured)
    lg: "10px", // cards — soft 10px (measured)
    pill: "999px" // tags / pills / avatars
  },
  // Beneva elevation is soft and modern — low, diffuse shadows on raised
  // elements, slightly green-neutral ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Beneva animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Beneva-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Beneva) -----------------------------------------
  // Beneva borders are thin LIGHT green-grey hairlines (#d6e2da @1px). Encoded as
  // 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Beneva hairline (#d6e2da)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Beneva control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Beneva typography = the friendly Inter sans. Control labels are mid-weight;
  // body/field text is sentence case. CTAs are NOT uppercase on the live site
  // (modern, approachable tone).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Beneva links are green at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Beneva dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Beneva FOCUS = a crisp green OUTLINE (~2px solid #00a651). We encode the
  // green outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: benevaColor.green.primary, // #00a651 — Beneva focuses in its brand green
    inset: "0"
  },
  // Beneva form fields are BOXED (outline): a white fill with a thin light
  // green-grey hairline border and a friendly 6px radius. `style: "outline"`
  // makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. Measured input/select border = #d6e2da @1px hairline.
  field: {
    style: "outline",
    fillBg: benevaColor.white, // #ffffff
    underlineColor: benevaColor.grey.border, // #d6e2da (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23555a55' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Beneva cards: friendly 10px rounding, a thin light green-grey hairline rather
  // than a heavy box, with a faint green hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: benevaColor.grey.subtle // #f2f7f3 faint green hover tint
  },
  // Beneva secondary button = a soft green-grey filled chip (light #f2f7f3 fill,
  // ink text, slightly darker green-grey on hover) — the quiet alternative to the
  // filled green primary.
  buttonSecondary: {
    background: benevaColor.grey.subtle, // #f2f7f3 soft green-neutral fill
    border: benevaColor.grey.border, // #d6e2da light hairline
    hoverBackground: benevaColor.grey.border // #d6e2da on hover
  },
  // Beneva tabs / sub-nav: active tab = green-emphasised label with a green
  // bottom underline (the modern indicator), transparent fill.
  tabs: {
    activeText: benevaColor.green.primary, // #00a651
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // green underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Beneva pagination: borderless ink text links; active page = filled green box
  // with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: benevaColor.ink.primary, // #1a1a1a link text
    activeBackground: benevaColor.green.primary, // #00a651 filled active page
    activeText: benevaColor.white, // white on green
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Beneva breadcrumb: ink links, grey trail, green current page, grey separators
  // — all sans type.
  breadcrumb: {
    linkText: benevaColor.ink.primary, // #1a1a1a
    text: benevaColor.ink.secondary, // #555a55 trail text
    currentText: benevaColor.green.primary, // #00a651 current page
    separator: benevaColor.ink.secondary, // #555a55
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Beneva notice / alert: a soft box — a thin coloured left filet on a white box.
  // The severity accent is a slim left bar.
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
  // Beneva accordion / disclosure: an ink, mid-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: benevaColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Beneva tag: a small soft green-grey chip with gentle rounding.
  tag: {
    radius: "6px", // friendly rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: benevaColor.grey.subtle, // #f2f7f3 subtle fill
    neutralText: benevaColor.ink.primary // #1a1a1a
  },
  // Beneva badge: a small filled badge — green fill / white text, gentle 6px
  // rounding.
  badge: {
    radius: "6px", // friendly rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Beneva labels are sentence case (modern tone)
    minHeight: "1.25rem", // 20px
    infoBackground: benevaColor.green.primary, // #00a651 (Beneva "info" = green, not blue)
    infoText: benevaColor.white // white on green
  },
  // Beneva checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: benevaColor.ink.primary // #1a1a1a
  },
  // Beneva search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Beneva toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: benevaColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Beneva-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: benevaColor.white, // #ffffff white
    subtle: benevaColor.grey.subtle, // #f2f7f3 subtle green-tinted fill surface
    raised: benevaColor.white, // #ffffff white
    inverse: benevaColor.green.deep, // #0a3d22 deep forest-green inverse surface (footer / hero band)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: benevaColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: benevaColor.ink.secondary, // #555a55
    muted: benevaColor.ink.muted, // #8a938c
    inverse: benevaColor.white, // white on the deep-green / dark surfaces
    link: benevaColor.green.primary // #00a651 — Beneva links are brand green
  },
  border: {
    subtle: benevaColor.grey.border, // #d6e2da light green-tinted hairline (field / divider)
    strong: benevaColor.ink.muted, // #8a938c stronger border
    interactive: benevaColor.green.primary // #00a651 focus / interactive
  },
  action: {
    primary: benevaColor.green.primary, // #00a651 primary button (the Beneva green CTA)
    primaryHover: benevaColor.green.hover, // #00803f darker green on hover/press
    primaryText: benevaColor.white, // white text on green
    secondary: benevaColor.grey.subtle, // #f2f7f3 secondary surface
    secondaryHover: benevaColor.grey.border, // #d6e2da
    secondaryText: benevaColor.ink.primary, // #1a1a1a
    danger: benevaColor.system.danger // #d72020
  },
  feedback: {
    success: benevaColor.system.success,
    warning: benevaColor.system.warning,
    error: benevaColor.system.danger,
    info: benevaColor.system.info
  },
  status: {
    pending: benevaColor.system.warning,
    processing: benevaColor.system.info,
    completed: benevaColor.system.success,
    failed: benevaColor.system.danger
  },
  // Categorical data-vis palette. Beneva publishes no data-vis scale, so this is
  // a coherent proposal anchored on the brand greens (category1 = vivid green,
  // category2 = deep forest green) followed by graded greys and the restrained
  // system hues, drawn to honour the green identity (see MAPPING.md, "à confirmer"
  // — not an official scale).
  data: {
    category1: benevaColor.green.primary, // #00a651 vivid Beneva green
    category2: benevaColor.green.deep, // #0a3d22 deep forest green
    category3: benevaColor.ink.secondary, // #555a55
    category4: benevaColor.ink.muted, // #8a938c
    category5: benevaColor.grey.border, // #d6e2da
    category6: benevaColor.system.danger, // restrained red (à confirmer)
    category7: benevaColor.system.warning, // restrained amber (à confirmer)
    category8: benevaColor.green.hover // #00803f secondary green tone (à confirmer)
  }
} as const;

/**
 * The Beneva theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Beneva-specific (modern friendly green)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Beneva's green-on-white Inter identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const benevaTheme: TenantTheme = {
  id: "beneva",
  label: "Beneva",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default benevaTheme;
