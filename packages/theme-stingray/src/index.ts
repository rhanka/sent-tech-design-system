import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Stingray (stingray.com — Stingray Group Inc., the Montréal music & media-tech
 * company founded in 2007) theme for the Sentropic token structure.
 *
 * IMPORTANT PROVENANCE NOTE (à confirmer): Stingray publishes no design-token
 * file, and the live corporate site leaks the *WordPress default* palette in its
 * computed CSS (generic theme blues/greys), NOT the brand. So unlike a true
 * measured-clone, the values below are NOT read off the live computed CSS —
 * they are drawn from Stingray's visual IDENTITY: the vivid CORAL-RED stingray
 * logomark paired with a deep navy ink. Every brand hue here is therefore marked
 * "à confirmer" — the exact hex values are approximations of the coral/navy
 * identity and should be reconciled against an official brand asset later. We
 * reference only the font *names* ("'Inter', Helvetica, Arial, sans-serif" — a
 * clean modern sans matching Stingray's contemporary tech tone, à confirmer),
 * never font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Stingray's identity reads as a MODERN TECH system: a vivid coral-red brand CTA
 * against a deep-navy ink, clean grey structure, a clean geometric sans, modern
 * (4–8px) rounding, and a coral focus outline. The brand "colour" is the
 * coral-red (#ee3e38, à confirmer); navy (#1a2b3c, à confirmer) carries text and
 * inverse surfaces. Where Sentropic needs a role Stingray's identity does not
 * obviously colour (feedback states, accents), a restrained system value is used
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Stingray colour reference (identity-derived, light theme — all à confirmer):
 *   Coral-red (action / CTA / accent)  #ee3e38   vivid stingray-mark coral CTA
 *   Coral-red hover (darker)           #c92f2a   pressed/hover CTA
 *   Navy ink — primary text / inverse  #1a2b3c   deep navy ink + inverse band
 *   White (surface default / CTA text) #ffffff   page background / on-coral text
 *   Secondary text                     #5a6b7c   rgb(90,107,124) muted navy-grey
 *   Muted text                         #8a96a3   muted grey
 *   Subtle fill surface                #f4f6f8   light cool-grey fill
 *   Subtle / field border              #d6dde4   light cool-grey hairline
 *   System danger                      #d32f2f   error red (distinct from brand coral)
 */

// --- Stingray raw colour palette (identity-derived, à confirmer) ------------
const stingrayColor = {
  // The brand / CTA hue is the vivid CORAL-RED of the stingray logomark. Used for
  // the primary call-to-action, active indicators and the primary accent.
  // (à confirmer — drawn from the identity, not measured off the WP-default site.)
  coral: "#ee3e38", // primary brand CTA — vivid coral-red (à confirmer)
  coralHover: "#c92f2a", // pressed/hover state of the coral CTA (à confirmer)
  white: "#ffffff", // page background — surface default / on-coral text
  // Deep navy ink scale. Stingray pairs the coral with a deep navy for ink and
  // inverse surfaces (à confirmer).
  navy: {
    // Primary body text & inverse surface — a deep navy ink.
    primary: "#1a2b3c", // deep navy ink — body text + inverse band (à confirmer)
    // Secondary text — a muted navy-grey.
    secondary: "#5a6b7c", // rgb(90,107,124) — secondary text (à confirmer)
    // Muted text.
    muted: "#8a96a3" // muted grey — muted text (à confirmer)
  },
  // Neutral surface / line greys (cool, à confirmer).
  grey: {
    subtle: "#f4f6f8", // light cool-grey — subtle fill surface (à confirmer)
    border: "#d6dde4" // light cool-grey — subtle / field hairline (à confirmer)
  },
  // Feedback system hues. The danger red is deliberately a DISTINCT error red
  // (#d32f2f) rather than the brand coral, so error states do not read as a CTA.
  // The rest are restrained, legible (WCAG AA on white) system colours — all
  // "à confirmer", Stingray exposes no measured feedback scale.
  system: {
    danger: "#d32f2f", // error red — distinct from brand coral (à confirmer)
    success: "#2e7d32", // muted green — à confirmer (no Stingray source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1a2b3c" // Stingray would lean on its navy ink, not blue — à confirmer
  }
} as const;

// --- foundation (Stingray-specific values) ----------------------------------
const foundation = {
  color: {
    // Stingray's "primary action" hue is the coral-red, not a blue. The Sentropic
    // "blue" role family (action / primary / link) is mapped onto the coral/navy
    // identity — the Stingray primary action IS coral. (à confirmer.)
    blue: {
      10: stingrayColor.grey.subtle, // #f4f6f8 lightest neutral tint
      60: stingrayColor.coral, // #ee3e38 primary action (Stingray coral CTA)
      80: stingrayColor.coralHover // #c92f2a darker pressed coral
    },
    // Stingray has no separate cyan/accent — the accent IS the brand coral. The
    // Sentropic "cyan" accent slot is mapped to the coral/navy identity.
    // (à confirmer.)
    cyan: {
      10: stingrayColor.grey.subtle, // #f4f6f8 light neutral tint
      50: stingrayColor.coral, // #ee3e38 the accent is the brand coral
      70: stingrayColor.coralHover // #c92f2a darker coral
    },
    // Sentropic "slate" role family mapped onto the Stingray navy/grey scale.
    slate: {
      0: stingrayColor.white, // #ffffff white
      10: stingrayColor.grey.subtle, // #f4f6f8 subtle fill surface
      20: stingrayColor.grey.border, // #d6dde4 hairline / subtle border
      60: stingrayColor.navy.secondary, // #5a6b7c secondary text
      80: stingrayColor.navy.primary, // #1a2b3c primary text (deep navy)
      90: stingrayColor.navy.primary // #1a2b3c darkest (navy ink)
    },
    feedback: {
      success: stingrayColor.system.success,
      warning: stingrayColor.system.warning,
      error: stingrayColor.system.danger,
      info: stingrayColor.system.info
    }
  },
  // Stingray sets its UI in a clean modern SANS — "'Inter', Helvetica, Arial,
  // sans-serif" (à confirmer), matching its contemporary music/media-tech tone.
  // We reference the *names* only. Mono is not part of Stingray's identity — the
  // Simons/Sentropic mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale, aligned with the Sentropic base 4px scale
  // ("à confirmer" exact steps — no Stingray source).
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
  // Stingray reads as a MODERN system — clean 4px rounding on controls/inputs and
  // 8px on cards; not square, not pill. (Exact steps à confirmer; pill kept at
  // 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — modern 4px (à confirmer)
    lg: "8px", // cards — modern 8px (à confirmer)
    pill: "999px" // tags / pills
  },
  // Stingray elevation — restrained, soft modern shadows on raised elements.
  // Kept conservative and navy-neutral ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Standard short eases ("à confirmer" — no Stingray source). Kept aligned with
  // the base.
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Stingray-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Stingray) ---------------------------------------
  // Stingray borders are thin cool-grey hairlines (#d6dde4 @1px). Encoded as 1px
  // thin / 2px thick. (à confirmer.)
  borderWidth: {
    none: "0",
    thin: "1px", // Stingray hairline (#d6dde4)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Stingray control density — modern CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it. (à confirmer.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Stingray typography = the clean modern sans. Control labels are mid-weight
  // sans; body/field text is sentence case. (à confirmer.)
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Stingray links are coral; the hover affordance is an underline. (à confirmer.)
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Stingray dims disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Stingray FOCUS = a crisp CORAL OUTLINE (~2px solid #ee3e38). We encode the
  // coral outline strategy. (à confirmer.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: stingrayColor.coral, // #ee3e38 — Stingray focuses in its brand coral
    inset: "0"
  },
  // Stingray form fields are BOXED (outline): a white fill with a thin cool-grey
  // hairline border and a modern 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Field
  // border = #d6dde4 @1px hairline. (à confirmer.)
  field: {
    style: "outline",
    fillBg: stingrayColor.white, // #ffffff
    underlineColor: stingrayColor.grey.border, // #d6dde4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary navy-grey with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%235a6b7c' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Stingray cards: modern 8px rounding, a thin cool-grey hairline rather than a
  // heavy box, with a faint hover tint. (à confirmer.)
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: stingrayColor.grey.subtle // #f4f6f8 faint hover tint
  },
  // Stingray secondary button = a soft cool-grey filled chip (light #f4f6f8 fill,
  // navy ink text, slightly darker grey on hover) — the quiet alternative to the
  // filled coral primary. (à confirmer.)
  buttonSecondary: {
    background: stingrayColor.grey.subtle, // #f4f6f8 soft fill
    border: stingrayColor.grey.border, // #d6dde4 light hairline
    hoverBackground: stingrayColor.grey.border // #d6dde4 on hover
  },
  // Stingray tabs / sub-nav: active tab = coral label with a coral bottom
  // underline (the brand indicator), transparent fill. (à confirmer.)
  tabs: {
    activeText: stingrayColor.coral, // #ee3e38
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // coral underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Stingray pagination: borderless ink text links; active page = filled coral
  // box with white text (the brand fill). (à confirmer.)
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: stingrayColor.navy.primary, // #1a2b3c link text
    activeBackground: stingrayColor.coral, // #ee3e38 filled active page
    activeText: stingrayColor.white, // white on coral
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Stingray breadcrumb: navy links, grey trail, coral current page, grey
  // separators — all sans type. (à confirmer.)
  breadcrumb: {
    linkText: stingrayColor.navy.primary, // #1a2b3c
    text: stingrayColor.navy.secondary, // #5a6b7c trail text
    currentText: stingrayColor.coral, // #ee3e38 current page
    separator: stingrayColor.navy.secondary, // #5a6b7c
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Stingray notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar. (à confirmer.)
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
  // Stingray accordion / disclosure: a navy, plain-weight sans summary trigger,
  // modern rounding, hairline separated. (à confirmer.)
  accordion: {
    text: stingrayColor.navy.primary, // #1a2b3c summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Stingray tag: a small soft cool-grey chip with modern 4px rounding.
  // (à confirmer.)
  tag: {
    radius: "4px", // modern rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: stingrayColor.grey.subtle, // #f4f6f8 subtle fill
    neutralText: stingrayColor.navy.primary // #1a2b3c
  },
  // Stingray badge: a small filled badge — coral fill / white text, modern 4px
  // rounding. (à confirmer.)
  badge: {
    radius: "4px", // modern rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: stingrayColor.coral, // #ee3e38 (Stingray "info" badge = brand coral)
    infoText: stingrayColor.white // white on coral
  },
  // Stingray checkbox/radio label: small navy sans. (à confirmer.)
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: stingrayColor.navy.primary // #1a2b3c
  },
  // Stingray search input: a boxed cool-grey hairline field, sans type.
  // (à confirmer.)
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Stingray toggle / switch label: small navy sans. (à confirmer.)
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: stingrayColor.navy.primary // #1a2b3c
  }
} as const;

// --- semantic (Stingray-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: stingrayColor.white, // #ffffff white
    subtle: stingrayColor.grey.subtle, // #f4f6f8 subtle fill surface
    raised: stingrayColor.white, // #ffffff white
    inverse: stingrayColor.navy.primary, // #1a2b3c deep navy inverse band
    overlay: "rgb(26 43 60 / 0.5)" // modal backdrop — navy @50%
  },
  text: {
    primary: stingrayColor.navy.primary, // #1a2b3c deep navy ink (body text)
    secondary: stingrayColor.navy.secondary, // #5a6b7c (à confirmer)
    muted: stingrayColor.navy.muted, // #8a96a3 (à confirmer)
    inverse: stingrayColor.white, // white on navy / dark surfaces
    link: stingrayColor.coral // #ee3e38 — Stingray links are coral
  },
  border: {
    subtle: stingrayColor.grey.border, // #d6dde4 light hairline (field / divider)
    strong: stingrayColor.navy.secondary, // #5a6b7c stronger border
    interactive: stingrayColor.coral // #ee3e38 focus / interactive (brand coral)
  },
  action: {
    primary: stingrayColor.coral, // #ee3e38 primary button (the coral CTA)
    primaryHover: stingrayColor.coralHover, // #c92f2a pressed/hover coral
    primaryText: stingrayColor.white, // white text on coral
    secondary: stingrayColor.grey.subtle, // #f4f6f8 secondary surface
    secondaryHover: stingrayColor.grey.border, // #d6dde4
    secondaryText: stingrayColor.navy.primary, // #1a2b3c
    danger: stingrayColor.system.danger // #d32f2f (distinct from brand coral)
  },
  feedback: {
    success: stingrayColor.system.success,
    warning: stingrayColor.system.warning,
    error: stingrayColor.system.danger,
    info: stingrayColor.system.info
  },
  status: {
    pending: stingrayColor.system.warning,
    processing: stingrayColor.system.info,
    completed: stingrayColor.system.success,
    failed: stingrayColor.system.danger
  },
  // Categorical data-vis palette. Stingray publishes no data-vis scale, so this
  // is a coherent proposal anchored on the brand coral + navy identity, then the
  // greys and the restrained system hues (see MAPPING.md, "à confirmer" — not an
  // official scale).
  data: {
    category1: stingrayColor.coral, // #ee3e38 brand coral
    category2: stingrayColor.navy.primary, // #1a2b3c deep navy
    category3: stingrayColor.navy.secondary, // #5a6b7c
    category4: stingrayColor.navy.muted, // #8a96a3
    category5: stingrayColor.grey.border, // #d6dde4
    category6: stingrayColor.system.danger, // restrained red (à confirmer)
    category7: stingrayColor.system.success, // restrained green (à confirmer)
    category8: stingrayColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Stingray theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Stingray-specific (modern coral-red/navy
 * sans) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Stingray's coral-on-navy modern
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…), not
 * just the elements that read semantic vars directly.
 */
export const stingrayTheme: TenantTheme = {
  id: "stingray",
  label: "Stingray",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stingrayTheme;
