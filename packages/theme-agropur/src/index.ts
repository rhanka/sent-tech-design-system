import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Agropur (agropur.com — the Québec dairy cooperative founded in 1938) theme for
 * the Sentropic token structure.
 *
 * Agropur publishes no public design-token file; the values below are MEASURED
 * from the live site's computed CSS (https://www.agropur.com, inspected in a real
 * browser). We only reference the font *names* here, never font binaries. The
 * brand sets its UI in a proprietary geometric sans called "Maax"; since Maax is
 * not freely distributable we substitute "Inter" (the closest open geometric
 * humanist sans) and flag the swap "à confirmer" in MAPPING.md. Sources and the
 * full colour mapping table are in MAPPING.md.
 *
 * Agropur's identity is a CORPORATE-COOPERATIVE system: a deep navy base that
 * carries CTAs, the inverse band and structural emphasis, lifted by a distinctive
 * warm PINK/MAGENTA accent and a supporting bright BLUE. Body text is a near-black
 * ink on white; structure is built from cool blue-greys. Rounding is modern and
 * gentle (2–10px). Where Sentropic needs a role Agropur never colours, the closest
 * measured value is used (or a restrained system colour for feedback) and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Agropur colour reference (measured, light theme):
 *   Navy (action / CTA / inverse)      #162f53   primary CTA / navy band (61 occ.)
 *   Navy hover (darker)                #0e2244   pressed/hover CTA (measured)
 *   Pink / magenta accent              #eb6888   warm decorative accent (measured)
 *   Supporting blue                    #1997cc   bright supporting blue (measured)
 *   Magenta (strong)                   #ca0f67   strong magenta highlight (measured)
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #1a1a1a   near-black body text
 *   Secondary text                     #6a6a76   rgb(106,106,118) (measured)
 *   Muted text                         #8a90a0   cool blue-grey muted (measured)
 *   Subtle fill surface                #f3f5f8   cool light fill (measured)
 *   Subtle / field border              #d6dbe4   cool light hairline (measured)
 *   Danger red                         #d72020   error / system danger (measured)
 */

// --- Agropur raw colour palette (measured from live computed CSS) -----------
const agropurColor = {
  // The emphasis / CTA "brand" is a deep navy. Agropur uses it for the primary
  // call-to-action, the navy header/footer band and inverse surfaces. Measured at
  // 61 occurrences across the live stylesheet — clearly the structural base.
  navy: "#162f53", // CTA fill / navy band / inverse surface (measured, 61 occ.)
  navyHover: "#0e2244", // darker pressed/hover navy (measured)
  white: "#ffffff", // page background — surface default
  // The distinctive warm accent — a pink/magenta used for decorative highlights,
  // illustration and secondary emphasis on the live site.
  pink: "#eb6888", // warm pink accent (measured)
  // A bright supporting blue used for links/illustrative accents alongside navy.
  blue: "#1997cc", // supporting blue (measured)
  // A strong magenta used as a punchy highlight / hover on accents.
  magenta: "#ca0f67", // strong magenta highlight (measured)
  // Near-black/blue-grey ink scale (each value measured from a real element).
  ink: {
    // Primary body text — a near-black.
    primary: "#1a1a1a", // body text colour (measured)
    // Secondary text — a cool grey.
    secondary: "#6a6a76", // rgb(106,106,118) — secondary text (measured)
    // Muted text — a cool blue-grey.
    muted: "#8a90a0" // cool blue-grey muted text (measured)
  },
  // Neutral surface / line greys — Agropur's are cool (blue-tinted).
  grey: {
    subtle: "#f3f5f8", // cool light fill surface (measured)
    border: "#d6dbe4" // cool light hairline / field border (measured)
  },
  // Agropur shows little decorative feedback colour; the danger red is measured
  // from the site, the rest are restrained, legible (WCAG AA on white) system
  // colours chosen to sit with the cooperative palette and flagged "à confirmer".
  system: {
    danger: "#d72020", // red — error / system danger (measured)
    success: "#2e7d32", // muted green — à confirmer (no Agropur source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1997cc" // Agropur's supporting blue doubles as info (measured hue)
  }
} as const;

// --- foundation (Agropur-specific values) -----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) is Agropur's
    // navy base — the primary action IS navy.
    blue: {
      10: agropurColor.grey.subtle, // #f3f5f8 lightest cool neutral tint
      60: agropurColor.navy, // #162f53 primary action (Agropur navy CTA)
      80: agropurColor.navyHover // #0e2244 darker pressed navy
    },
    // The Sentropic "cyan" accent slot carries Agropur's bright supporting blue.
    cyan: {
      10: agropurColor.grey.subtle, // #f3f5f8 light neutral tint
      50: agropurColor.blue, // #1997cc supporting blue accent
      70: agropurColor.navy // #162f53 deep terminal step (navy)
    },
    // Sentropic "slate" role family mapped onto Agropur's cool ink/grey scale.
    slate: {
      0: agropurColor.white, // #ffffff white
      10: agropurColor.grey.subtle, // #f3f5f8 subtle cool fill surface
      20: agropurColor.grey.border, // #d6dbe4 cool hairline / subtle border
      60: agropurColor.ink.secondary, // #6a6a76 secondary text
      80: agropurColor.ink.primary, // #1a1a1a primary text (near-black)
      90: agropurColor.navy // #162f53 darkest structural (navy)
    },
    feedback: {
      success: agropurColor.system.success,
      warning: agropurColor.system.warning,
      error: agropurColor.system.danger,
      info: agropurColor.system.info
    }
  },
  // Agropur sets its UI in the proprietary geometric sans "Maax". Maax is not
  // freely distributable, so we substitute "Inter" (closest open geometric
  // humanist sans) and reference font *names* only. Mono keeps the Sentropic
  // stack (Agropur has no monospace identity). (à confirmer: Maax → Inter swap.)
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Agropur's raw spacing steps are not strongly
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
  // Agropur uses MODERN, gentle rounding — measured ~2px on the smallest controls,
  // ~6px on buttons/inputs, ~10px on cards, full pill on tags. Reads "soft modern".
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle 2px (measured)
    md: "6px", // button / input / tabs — modern 6px (measured)
    lg: "10px", // cards — soft 10px (measured)
    pill: "999px" // tags / pills
  },
  // Agropur elevation is restrained corporate — soft, low, cool-tinted shadows
  // on raised elements ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(22 47 83 / 0.06)",
    medium: "0 4px 12px rgb(22 47 83 / 0.10)",
    floating: "0 8px 24px rgb(22 47 83 / 0.14)"
  },
  // Agropur animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Agropur-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Agropur) ----------------------------------------
  // Agropur borders are thin cool-grey hairlines (#d6dbe4 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Agropur cool hairline (#d6dbe4)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Agropur control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding. md targets a ~44px touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Agropur typography = the geometric sans (Inter substitute for Maax). Control
  // labels are mid-weight; body/field text is sentence case. CTAs are not
  // uppercase on the live site — Agropur keeps button labels in sentence case.
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Agropur links are navy at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Agropur dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Agropur FOCUS = a crisp navy OUTLINE (~2px solid #162f53). We encode the
  // navy outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: agropurColor.navy, // #162f53 — Agropur focuses in its navy
    inset: "0"
  },
  // Agropur form fields are BOXED (outline): a white fill with a thin cool-grey
  // hairline border and a gentle 6px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d6dbe4 @1px hairline.
  field: {
    style: "outline",
    fillBg: agropurColor.white, // #ffffff
    underlineColor: agropurColor.grey.border, // #d6dbe4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the navy with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23162f53' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Agropur cards: gentle 10px rounding, a thin cool-grey hairline rather than a
  // heavy box, with a faint cool hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: agropurColor.grey.subtle // #f3f5f8 faint cool hover tint
  },
  // Agropur secondary button = a soft cool-grey filled chip (light #f3f5f8 fill,
  // ink text, slightly darker grey on hover) — the quiet alternative to the
  // filled navy primary.
  buttonSecondary: {
    background: agropurColor.grey.subtle, // #f3f5f8 soft cool fill
    border: agropurColor.grey.border, // #d6dbe4 cool hairline
    hoverBackground: agropurColor.grey.border // #d6dbe4 on hover
  },
  // Agropur tabs / sub-nav: active tab = navy bold label with a navy bottom
  // underline (the indicator), transparent fill.
  tabs: {
    activeText: agropurColor.navy, // #162f53
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // navy underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Agropur pagination: borderless ink text links; active page = filled navy box
  // with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: agropurColor.ink.primary, // #1a1a1a link text
    activeBackground: agropurColor.navy, // #162f53 filled active page
    activeText: agropurColor.white, // white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Agropur breadcrumb: ink links, grey trail, navy current page, grey separators.
  breadcrumb: {
    linkText: agropurColor.ink.primary, // #1a1a1a
    text: agropurColor.ink.secondary, // #6a6a76 trail text
    currentText: agropurColor.navy, // #162f53 current page
    separator: agropurColor.ink.secondary, // #6a6a76
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Agropur notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar.
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
  // Agropur accordion / disclosure: an ink, mid-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: agropurColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Agropur tag: a small soft cool-grey chip with gentle rounding.
  tag: {
    radius: "6px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: agropurColor.grey.subtle, // #f3f5f8 subtle cool fill
    neutralText: agropurColor.ink.primary // #1a1a1a
  },
  // Agropur badge: a small filled badge — navy fill / white text, gentle 6px
  // rounding.
  badge: {
    radius: "6px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Agropur badges are sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: agropurColor.navy, // #162f53 (Agropur "info" badge = navy)
    infoText: agropurColor.white // white on navy
  },
  // Agropur checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: agropurColor.ink.primary // #1a1a1a
  },
  // Agropur search input: a boxed cool hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Agropur toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: agropurColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Agropur-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: agropurColor.white, // #ffffff white
    subtle: agropurColor.grey.subtle, // #f3f5f8 subtle cool fill surface
    raised: agropurColor.white, // #ffffff white
    inverse: agropurColor.navy, // #162f53 navy inverse surface (CTA/band tone)
    overlay: "rgb(22 47 83 / 0.5)" // modal backdrop — navy @50%
  },
  text: {
    primary: agropurColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: agropurColor.ink.secondary, // #6a6a76 (measured)
    muted: agropurColor.ink.muted, // #8a90a0 (measured)
    inverse: agropurColor.white, // white on navy / dark surfaces
    link: agropurColor.navy // #162f53 — Agropur links are navy
  },
  border: {
    subtle: agropurColor.grey.border, // #d6dbe4 cool hairline (field / divider)
    strong: agropurColor.ink.secondary, // #6a6a76 stronger border
    interactive: agropurColor.navy // #162f53 focus / interactive
  },
  action: {
    primary: agropurColor.navy, // #162f53 primary button (the navy CTA)
    primaryHover: agropurColor.navyHover, // #0e2244 darker navy on hover (measured)
    primaryText: agropurColor.white, // white text on navy
    secondary: agropurColor.grey.subtle, // #f3f5f8 secondary surface
    secondaryHover: agropurColor.grey.border, // #d6dbe4
    secondaryText: agropurColor.ink.primary, // #1a1a1a
    danger: agropurColor.system.danger // #d72020
  },
  feedback: {
    success: agropurColor.system.success,
    warning: agropurColor.system.warning,
    error: agropurColor.system.danger,
    info: agropurColor.system.info
  },
  status: {
    pending: agropurColor.system.warning,
    processing: agropurColor.system.info,
    completed: agropurColor.system.success,
    failed: agropurColor.system.danger
  },
  // Categorical data-vis palette. Agropur publishes no official data-vis scale;
  // this is a coherent proposal that leads with the brand trio (navy → pink →
  // blue), then cool greys and the restrained system hues (see MAPPING.md,
  // "à confirmer" — not an official scale).
  data: {
    category1: agropurColor.navy, // #162f53 navy
    category2: agropurColor.pink, // #eb6888 pink accent
    category3: agropurColor.blue, // #1997cc supporting blue
    category4: agropurColor.ink.muted, // #8a90a0 cool blue-grey
    category5: agropurColor.grey.border, // #d6dbe4 cool hairline grey
    category6: agropurColor.system.danger, // #d72020 red (à confirmer)
    category7: agropurColor.system.success, // restrained green (à confirmer)
    category8: agropurColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Agropur theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Agropur-specific (navy + pink/blue accent)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Agropur's navy-on-white cooperative
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…), not
 * just the elements that read semantic vars directly.
 */
export const agropurTheme: TenantTheme = {
  id: "agropur",
  label: "Agropur",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default agropurTheme;
