import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Jean Coutu / PJC (jeancoutu.com — the iconic Québec pharmacy chain founded by
 * Jean Coutu in 1969) theme for the Sentropic token structure.
 *
 * Jean Coutu publishes no design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://www.jeancoutu.com, inspected in a real
 * browser). We only reference the font *names* here ("'Figtree', 'Roboto',
 * Helvetica, Arial, sans-serif" — the measured "figtree-semi-bold / roboto-medium"
 * stack the brand uses), never font binaries. Sources and the full mapping table
 * are in MAPPING.md.
 *
 * Jean Coutu's identity is BRIGHT and FRIENDLY: its signature is the loud,
 * unmistakable Jean Coutu red (#ff3000, measured in 14 places — CTAs, prices,
 * promo flags) set against a clean white retail surface, supported by a friendly
 * blue link (#0875cf) and a navy band (#234b8d) used for the header/footer
 * inverse. Body text is a near-black ink. Corners are gently rounded (the
 * approachable "pharmacy" feel — 8px on controls, 12px on cards), and the brand
 * red doubles as the danger/error hue. Where Sentropic needs a role Jean Coutu
 * never colours (extra feedback states, the full data-vis ramp), a restrained
 * system colour or grey is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Jean Coutu colour reference (measured, light theme):
 *   JC red (action / CTA / danger)        #ff3000   the signature bright red CTA
 *   JC red hover                          #d62800   darkened red on hover
 *   White (surface default / on-red text) #ffffff   page background / text on red
 *   Link / secondary blue                 #0875cf   measured friendly blue link
 *   Navy (inverse band)                   #234b8d   measured header/footer navy
 *   Ink — primary text                    #1a1a1a   near-black body text
 *   Secondary text                        #555555   secondary / muted-strong ink
 *   Muted text                            #8a8a8a   measured muted grey
 *   Subtle fill surface                   #f5f5f5   light fill
 *   Subtle / field border                 #dcdcdc   light hairline border
 */

// --- Jean Coutu raw colour palette (measured from live computed CSS) ---------
const jeanCoutuColor = {
  // The signature Jean Coutu red — measured 14 occurrences across the live CSS
  // (primary CTA fill, prices, promo flags). It also doubles as the danger hue.
  red: "#ff3000", // primary CTA / brand red (measured, 14 occurrences)
  redHover: "#d62800", // darkened red on hover (measured)
  white: "#ffffff", // page background — surface default / text on red
  // Supporting blues. The friendly link blue and the navy inverse band.
  blue: "#0875cf", // measured secondary / link blue
  navy: "#234b8d", // measured navy — inverse band (header/footer)
  // Near-black ink scale (each value measured from a real element).
  ink: {
    // Primary body text — a near-black.
    primary: "#1a1a1a", // body text colour
    // Secondary text & strong-ish borders.
    secondary: "#555555", // secondary text
    // Muted text.
    muted: "#8a8a8a" // measured muted grey
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f5f5f5", // subtle fill surface
    border: "#dcdcdc" // subtle / field hairline border
  },
  // Jean Coutu's feedback palette. The brand RED doubles as the error/danger
  // accent (measured). Success/warning/info have no measured Jean Coutu source;
  // restrained, legible (WCAG AA on white) system colours are used and flagged
  // "à confirmer" in MAPPING.md.
  system: {
    danger: "#ff3000", // JC red doubles as danger / error (measured)
    success: "#2e7d32", // muted green — à confirmer (no Jean Coutu source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0875cf" // the measured friendly blue serves as info
  }
} as const;

// --- foundation (Jean Coutu-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Jean Coutu's
    // primary ACTION is its red, so the action step (60) is mapped to the red;
    // the lighter step is a neutral tint. (The literal brand blue lives in the
    // "cyan" accent slot below.)
    blue: {
      10: jeanCoutuColor.grey.subtle, // #f5f5f5 lightest neutral tint
      60: jeanCoutuColor.red, // #ff3000 primary action (JC red CTA)
      80: jeanCoutuColor.redHover // #d62800 darker action step (red hover)
    },
    // Sentropic "cyan" accent slot mapped onto Jean Coutu's friendly blue scale —
    // the literal supporting blue/navy the brand uses for links and the inverse
    // band.
    cyan: {
      10: jeanCoutuColor.grey.subtle, // #f5f5f5 light neutral tint
      50: jeanCoutuColor.blue, // #0875cf measured friendly blue link
      70: jeanCoutuColor.navy // #234b8d measured navy
    },
    // Sentropic "slate" role family mapped onto the Jean Coutu ink/grey scale.
    slate: {
      0: jeanCoutuColor.white, // #ffffff white
      10: jeanCoutuColor.grey.subtle, // #f5f5f5 subtle fill surface
      20: jeanCoutuColor.grey.border, // #dcdcdc hairline / subtle border
      60: jeanCoutuColor.ink.secondary, // #555555 secondary text
      80: jeanCoutuColor.ink.primary, // #1a1a1a primary text (near-black)
      90: jeanCoutuColor.ink.primary // #1a1a1a darkest (Jean Coutu body is near-black)
    },
    feedback: {
      success: jeanCoutuColor.system.success,
      warning: jeanCoutuColor.system.warning,
      error: jeanCoutuColor.system.danger,
      info: jeanCoutuColor.system.info
    }
  },
  // Jean Coutu sets its UI in Figtree — measured "figtree-semi-bold / roboto-medium"
  // resolving to "'Figtree', 'Roboto', Helvetica, Arial, sans-serif" across
  // headings and body, giving the clean friendly retail tone. We reference the
  // *names* only. Mono is not part of Jean Coutu — the Sentropic mono stack is
  // kept (same stack as the Simons template).
  font: {
    sans: "'Figtree', 'Roboto', Helvetica, Arial, sans-serif",
    display: "'Figtree', 'Roboto', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Jean Coutu's exact spacing steps are not strongly
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
  // Jean Coutu uses FRIENDLY ROUNDING — the approachable pharmacy feel: gentle
  // 8px on controls/inputs and 12px on cards; tags/pills fully rounded. Not boxy,
  // not square. (Exact steps à confirmer.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — slightly soft
    md: "8px", // button / input / tabs — friendly 8px (measured)
    lg: "12px", // cards — friendly 12px (measured)
    pill: "999px" // tags / pills
  },
  // Jean Coutu elevation is restrained retail — soft, low shadows on raised cards
  // and dropdowns. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Jean Coutu animates with short, standard eases (≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Jean Coutu-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Jean Coutu) -------------------------------------
  // Jean Coutu borders are thin LIGHT-GREY hairlines (#dcdcdc @1px). Encoded as
  // 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Jean Coutu hairline (#dcdcdc)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Jean Coutu control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px touch
  // height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Jean Coutu typography = the Figtree sans. Control labels are mid/semi-bold
  // sans; body/field text is sentence case. CTAs are sentence case (not tracked
  // uppercase) — the friendly retail tone.
  typography: {
    control: { family: "'Figtree', 'Roboto', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Figtree', 'Roboto', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Figtree', 'Roboto', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Jean Coutu links are the friendly blue at rest; underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Jean Coutu dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Jean Coutu FOCUS = a crisp RED OUTLINE (~2px solid #ff3000) — the brand red
  // is reused as the focus colour. We encode the outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: jeanCoutuColor.red, // #ff3000 — Jean Coutu focuses in its brand red
    inset: "0"
  },
  // Jean Coutu form fields are BOXED (outline): a white fill with a thin
  // light-grey hairline border and friendly 8px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #dcdcdc @1px hairline.
  field: {
    style: "outline",
    fillBg: jeanCoutuColor.white, // #ffffff
    underlineColor: jeanCoutuColor.grey.border, // #dcdcdc (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23555555' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Jean Coutu cards: friendly 12px rounding, a thin light-grey hairline, with a
  // faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: jeanCoutuColor.grey.subtle // #f5f5f5 faint hover tint
  },
  // Jean Coutu secondary button = a soft-grey filled chip (light #f5f5f5 fill,
  // ink text, slightly darker grey on hover) — the quiet alternative to the
  // filled red primary.
  buttonSecondary: {
    background: jeanCoutuColor.grey.subtle, // #f5f5f5 soft fill
    border: jeanCoutuColor.grey.border, // #dcdcdc light hairline
    hoverBackground: jeanCoutuColor.grey.border // #dcdcdc on hover
  },
  // Jean Coutu tabs / sub-nav: active tab = bold sans label with a RED bottom
  // underline (the brand indicator), transparent fill.
  tabs: {
    activeText: jeanCoutuColor.red, // #ff3000
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Jean Coutu pagination: borderless ink text links; active page = filled RED
  // box with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: jeanCoutuColor.ink.primary, // #1a1a1a link text
    activeBackground: jeanCoutuColor.red, // #ff3000 filled active page
    activeText: jeanCoutuColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Jean Coutu breadcrumb: blue links, grey trail, RED current page, grey
  // separators — all sans type.
  breadcrumb: {
    linkText: jeanCoutuColor.blue, // #0875cf
    text: jeanCoutuColor.ink.secondary, // #555555 trail text
    currentText: jeanCoutuColor.red, // #ff3000 current page
    separator: jeanCoutuColor.ink.secondary, // #555555
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Jean Coutu notice / alert: a minimal box — a thin coloured left filet on a
  // white box. The severity accent is a slim left bar.
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
  // Jean Coutu accordion / disclosure: an ink, medium-weight sans summary
  // trigger, friendly rounding, hairline separated.
  accordion: {
    text: jeanCoutuColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Jean Coutu tag: a small soft-grey chip, fully rounded (pill) — the friendly
  // retail chip.
  tag: {
    radius: "999px", // pill rounding (friendly retail chip)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: jeanCoutuColor.grey.subtle, // #f5f5f5 subtle fill
    neutralText: jeanCoutuColor.ink.primary // #1a1a1a
  },
  // Jean Coutu badge: a small filled badge — RED fill / white text, friendly 8px
  // rounding (the promo-flag look).
  badge: {
    radius: "8px", // friendly rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: jeanCoutuColor.red, // #ff3000 (Jean Coutu badge = brand red)
    infoText: jeanCoutuColor.white // white on red
  },
  // Jean Coutu checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: jeanCoutuColor.ink.primary // #1a1a1a
  },
  // Jean Coutu search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Jean Coutu toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: jeanCoutuColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Jean Coutu-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: jeanCoutuColor.white, // #ffffff white
    subtle: jeanCoutuColor.grey.subtle, // #f5f5f5 subtle fill surface
    raised: jeanCoutuColor.white, // #ffffff white
    inverse: jeanCoutuColor.navy, // #234b8d navy inverse band (header/footer)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: jeanCoutuColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: jeanCoutuColor.ink.secondary, // #555555
    muted: jeanCoutuColor.ink.muted, // #8a8a8a (measured)
    inverse: jeanCoutuColor.white, // white on navy / dark surfaces
    link: jeanCoutuColor.blue // #0875cf — Jean Coutu links are the friendly blue
  },
  border: {
    subtle: jeanCoutuColor.grey.border, // #dcdcdc light hairline (field / divider)
    strong: jeanCoutuColor.ink.secondary, // #555555 stronger border
    interactive: jeanCoutuColor.red // #ff3000 focus / interactive
  },
  action: {
    primary: jeanCoutuColor.red, // #ff3000 primary button (the iconic JC red CTA)
    primaryHover: jeanCoutuColor.redHover, // #d62800 darker red on hover (measured)
    primaryText: jeanCoutuColor.white, // white text on red
    secondary: jeanCoutuColor.grey.subtle, // #f5f5f5 secondary surface
    secondaryHover: jeanCoutuColor.grey.border, // #dcdcdc
    secondaryText: jeanCoutuColor.ink.primary, // #1a1a1a
    danger: jeanCoutuColor.system.danger // #ff3000 (JC red doubles as danger)
  },
  feedback: {
    success: jeanCoutuColor.system.success,
    warning: jeanCoutuColor.system.warning,
    error: jeanCoutuColor.system.danger,
    info: jeanCoutuColor.system.info
  },
  status: {
    pending: jeanCoutuColor.system.warning,
    processing: jeanCoutuColor.system.info,
    completed: jeanCoutuColor.system.success,
    failed: jeanCoutuColor.system.danger
  },
  // Categorical data-vis palette. Jean Coutu publishes no data-vis scale; this is
  // a coherent proposal built from the brand triad (red → blue → navy) plus greys
  // and the restrained system hues, drawn to honour the bright-retail identity
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: jeanCoutuColor.red, // #ff3000 brand red
    category2: jeanCoutuColor.blue, // #0875cf friendly blue
    category3: jeanCoutuColor.navy, // #234b8d navy
    category4: jeanCoutuColor.ink.secondary, // #555555 grey (à confirmer)
    category5: jeanCoutuColor.grey.border, // #dcdcdc grey (à confirmer)
    category6: jeanCoutuColor.system.success, // restrained green (à confirmer)
    category7: jeanCoutuColor.system.warning, // restrained amber (à confirmer)
    category8: jeanCoutuColor.ink.muted // #8a8a8a muted grey (à confirmer)
  }
} as const;

/**
 * The Jean Coutu theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Jean Coutu-specific (bright-red
 * friendly retail) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Jean Coutu's red-on-white
 * Figtree identity reaches the components (buttons, tabs, pagination, chat
 * bubbles…), not just the elements that read semantic vars directly.
 */
export const jeanCoutuTheme: TenantTheme = {
  id: "jean-coutu",
  label: "Jean Coutu",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default jeanCoutuTheme;
