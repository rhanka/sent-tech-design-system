import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Poe (by Quora) theme for the Sentropic token structure.
 *
 * All values below are MEASURED from the live, public CSS custom properties of
 * Poe's design language (the `--pdl-*` / "Poe Design Language" token set served
 * on poe.com, captured on the login surface). We only reference font *names*
 * here (Poe ships the native system-ui stack and the SFMono mono stack — no
 * webfont binary). Sources and the measured variable for each value are
 * documented in MAPPING.md. Where Poe publishes no direct equivalent for a
 * Sentropic role, the closest measured Poe token is used and the choice is
 * noted "à confirmer" in MAPPING.md.
 *
 * Poe colour reference (light theme, measured `--pdl-*` variables):
 *   White (bg-base / surface)            #ffffff   --pdl-bg-base
 *   Grey faint (bg-faint / subtle)       #f6f6f8   --pdl-bg-faint
 *   Grey subtle (bg-subtle / hover)      #eaeaee   --pdl-bg-subtle
 *   Grey muted (bg-muted / border-base)  #e3e3e7   --pdl-bg-muted / --pdl-border-base
 *   Input border (action-default)        #cccdd1   --pdl-action-default-border
 *   Border emphasis                      #bbbcc1   --pdl-border-emphasis
 *   Mid grey (disabled fg / emphasis)    #88898e   --pdl-action-disabled-fg
 *   Subtle text / placeholder            #616165   --pdl-fg-subtle
 *   Muted text / bold border             #505157   --pdl-fg-muted / --pdl-border-bold
 *   Base text / inverse surface          #0d0d0d   --pdl-fg-base / --pdl-bg-reverse
 *   Accent base (THE Poe violet)         #5d5cde   --pdl-accent-base
 *   Accent emphasis (hover / link)       #413fa9   --pdl-accent-emphasis
 *   Accent bold                          #333180   --pdl-accent-bold
 *   Brand                                #4f4bca   --pdl-fg-brand
 *   Accent muted                         #8f97ed   --pdl-accent-muted
 *   Accent hover border                  #777de9   --pdl-action-hover-border-accent
 *   Accent subtle                        #d7dbf4   --pdl-accent-subtle
 *   Accent faint                         #e4e7f9   --pdl-accent-faint
 *   Success text                         #26a682   --pdl-fg-success
 *   Success bright                       #1dddae   (measured raw success)
 *   Warning base                         #f2c110   --pdl-warning-base
 *   Warning text                         #ce8c16   --pdl-fg-warning
 *   Error (banner / border / danger)     #d00e49   --pdl-action-error-border
 *   Error text                           #bb0541   --pdl-fg-error
 *   Info                                 #1254d6   --pdl-fg-info
 *   Feature magenta                      #ce40db   --pdl-fg-feature
 *
 * Poe's signature is the violet #5d5cde paired with PILL buttons (9999px) and
 * boxed, 8px-rounded OUTLINE inputs, on a near-monochrome neutral grey scale.
 * The focus ring is NEUTRAL grey, not the accent (a white→grey double ring:
 * `0 0 0 1px #fff, 0 0 0 2px #505157`).
 */

// --- Poe raw colour palette (measured `--pdl-*`) ---------------------------
const poeColor = {
  // The Poe violet — the brand / accent / action family.
  violet: {
    base: "#5d5cde", // --pdl-accent-base — primary button, checked, interactive
    emphasis: "#413fa9", // --pdl-accent-emphasis — primary hover + link text
    bold: "#333180", // --pdl-accent-bold — deepest violet
    brand: "#4f4bca", // --pdl-fg-brand
    muted: "#8f97ed", // --pdl-accent-muted — light violet
    hoverBorder: "#777de9", // --pdl-action-hover-border-accent
    subtle: "#d7dbf4", // --pdl-accent-subtle — primary disabled fill
    faint: "#e4e7f9" // --pdl-accent-faint — lightest violet wash
  },
  // Poe's near-monochrome neutral grey scale.
  grey: {
    0: "#ffffff", // --pdl-bg-base — surface
    faint: "#f6f6f8", // --pdl-bg-faint — subtle surface / hover fill
    subtle: "#eaeaee", // --pdl-bg-subtle — secondary hover fill
    muted: "#e3e3e7", // --pdl-bg-muted / --pdl-border-base — default border + secondary btn
    border: "#cccdd1", // --pdl-action-default-border — input border
    emphasis: "#bbbcc1", // --pdl-border-emphasis — strong border
    mid: "#88898e", // --pdl-action-disabled-fg / --pdl-bg-emphasis
    placeholder: "#616165", // --pdl-fg-subtle — placeholder / tertiary text
    secondaryText: "#505157", // --pdl-fg-muted / --pdl-border-bold — secondary text + focus ring
    base: "#0d0d0d" // --pdl-fg-base / --pdl-bg-reverse — primary text + inverse surface
  },
  // System / status colours (measured Poe semantic tokens, AA-checked text on white).
  system: {
    successBright: "#1dddae", // measured raw success (bright teal)
    success: "#26a682", // --pdl-fg-success — success text (AA on white)
    warningBase: "#f2c110", // --pdl-warning-base — brand warning yellow
    warning: "#ce8c16", // --pdl-fg-warning — warning text (AA on white)
    errorBold: "#d00e49", // --pdl-action-error-border — banner / danger
    error: "#bb0541", // --pdl-fg-error — error text
    info: "#1254d6", // --pdl-fg-info — info blue
    feature: "#ce40db" // --pdl-fg-feature — magenta feature accent
  }
} as const;

// --- foundation (Poe-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Poe violet.
    blue: {
      10: poeColor.violet.faint, // #e4e7f9 lightest violet wash
      60: poeColor.violet.base, // #5d5cde primary violet
      80: poeColor.violet.emphasis // #413fa9 darker interactive violet
    },
    // Poe has no cyan; the closest measured non-violet accent is the success
    // teal family, so the Sentropic "cyan" accent slot maps to Poe's teal.
    cyan: {
      10: "#d7f5e9", // light teal tint (derived — à confirmer)
      50: poeColor.system.successBright, // #1dddae Poe bright teal
      70: poeColor.system.success // #26a682 Poe teal text
    },
    // Sentropic "slate" role family mapped onto the Poe neutral grey scale.
    slate: {
      0: poeColor.grey[0], // white
      10: poeColor.grey.faint, // #f6f6f8 subtle surface
      20: poeColor.grey.muted, // #e3e3e7 default border
      60: poeColor.grey.placeholder, // #616165 tertiary / placeholder text
      80: poeColor.grey.secondaryText, // #505157 secondary text
      90: poeColor.grey.base // #0d0d0d primary text / darkest
    },
    feedback: {
      success: poeColor.system.success,
      warning: poeColor.system.warning,
      error: poeColor.system.errorBold,
      info: poeColor.system.info
    }
  },
  // Poe ships NO webfont: the native system-ui stack for all UI text (the same
  // stack drives body and headings — headings differ only by weight 700), and
  // SFMono for code. Font *names* only, never binaries.
  font: {
    sans: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
    display:
      "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
    mono: "SFMono-Regular, Consolas, monaco, monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base; Poe
  // uses a 4px grid — measured component paddings are multiples of 4px).
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
  // Poe radii (measured): inputs/dropdowns/chips 8px, cards/modals/bubbles 12px,
  // buttons are FULL PILLS (9999px) — the signature Poe shape.
  radius: {
    none: "0", // --pdl-sizing-radius-none
    sm: "0.25rem", // 4px — --pdl-sizing-radius-sm / tag
    md: "0.5rem", // 8px — --pdl-comp-text-input-border-radius / --pdl-sizing-radius-md
    lg: "0.75rem", // 12px — --pdl-comp-card-border-radius / --pdl-sizing-radius-lg
    pill: "9999px" // --pdl-comp-button-border-radius — buttons & switches
  },
  // Poe shadows: soft, low-opacity neutral elevation. Exact specs à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(13 13 13 / 0.06), 0 1px 3px rgb(13 13 13 / 0.10)",
    medium: "0 2px 6px rgb(13 13 13 / 0.08), 0 4px 12px rgb(13 13 13 / 0.10)",
    floating: "0 8px 24px rgb(13 13 13 / 0.12), 0 16px 40px rgb(13 13 13 / 0.14)"
  },
  // Motion durations / easing kept aligned with the Sentropic base. à confirmer.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Poe-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Poe) --------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Poe control density. Measured primary/oauth buttons sit at ~40px (md), with
  // 16px horizontal padding; sm (32px) and lg (48px) follow the scale.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.0625rem" }
  },
  // Poe typography: the system stack throughout. Buttons/controls are SEMIBOLD
  // (measured weight 600, 16px); body/fields are normal 400; labels semibold.
  typography: {
    control: { family: "inherit", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "inherit", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "inherit", size: "0.875rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Poe links are violet text; underline behaviour at rest not measured (à confirmer) —
    // modelled as no underline at rest, underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // measured primary-disabled fg = #ffffff80 ≈ 50%
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Poe FOCUS = a NEUTRAL grey double ring (white inner halo + grey outer), not
  // an accent ring. Measured: --pdl-action-focus-ring-primary-outer =
  // `0 0 0 1px #fff, 0 0 0 2px #505157`. Encoded as the "double" strategy with
  // the grey #505157 outer colour.
  focus: {
    strategy: "double",
    width: "2px",
    offset: "1px",
    color: poeColor.grey.secondaryText, // #505157 neutral grey ring
    inset: "0"
  },
  // Poe form fields are BOXED & ROUNDED (outline): white fill, a 1px #cccdd1
  // border and an 8px radius (measured --pdl-comp-text-input-border-radius =
  // .5rem, --pdl-action-default-border = #cccdd1). `style: "outline"`.
  field: {
    style: "outline",
    fillBg: poeColor.grey[0], // #ffffff
    underlineColor: poeColor.grey.border, // #cccdd1 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Poe's secondary grey with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23505157' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Poe card: a 1px grey outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: poeColor.grey.faint // #f6f6f8
  },
  // Poe secondary button = a FILLED light-grey button (not outline).
  buttonSecondary: {
    background: poeColor.grey.muted, // #e3e3e7
    border: "transparent",
    hoverBackground: poeColor.grey.subtle // #eaeaee
  },
  // Poe tabs: active tab = violet label with a bottom indicator (specifics not
  // directly measured on the login surface — à confirmer).
  tabs: {
    activeText: poeColor.violet.base, // #5d5cde
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Poe pagination: borderless violet links; active page = filled violet (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: poeColor.violet.emphasis, // #413fa9 link text
    activeBackground: poeColor.violet.base, // #5d5cde filled active page
    activeText: poeColor.grey[0], // white on violet
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Poe breadcrumb: violet links, dark current page, grey separators (à confirmer).
  breadcrumb: {
    linkText: poeColor.violet.emphasis, // #413fa9
    text: poeColor.grey.secondaryText, // #505157 trail text
    currentText: poeColor.grey.base, // #0d0d0d current page
    separator: poeColor.grey.mid, // #88898e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600"
  },
  // Poe inline notification: rounded 8px box with a coloured left filet (measured
  // --pdl-comp-inline-notification-border-radius = .5rem).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "1.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  },
  // Poe expansion/section trigger: a dark semibold summary.
  accordion: {
    text: poeColor.grey.base, // #0d0d0d
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.25rem"
  },
  // Poe tag: a small 4px-radius grey chip (measured --pdl-comp-tag-border-radius = .25rem).
  tag: {
    radius: "0.25rem", // 4px
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: poeColor.grey.subtle, // #eaeaee
    neutralText: poeColor.grey.base // #0d0d0d
  },
  // Poe badge: a small filled violet badge.
  badge: {
    radius: "0.25rem", // 4px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: poeColor.violet.base, // #5d5cde
    infoText: poeColor.grey[0] // white
  },
  // Poe checkbox/radio label (measured checked bg/border = #5d5cde, checkbox radius .25rem).
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: poeColor.grey.base // #0d0d0d
  },
  // Poe search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Poe toggle / switch (measured --pdl-comp-switch-border-radius = 9999px, checked = #5d5cde).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: poeColor.grey.base // #0d0d0d
  }
} as const;

// --- semantic (Poe-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: poeColor.grey[0], // #ffffff --pdl-bg-base
    subtle: poeColor.grey.faint, // #f6f6f8 --pdl-bg-faint
    raised: poeColor.grey[0], // #ffffff
    inverse: poeColor.grey.base, // #0d0d0d --pdl-bg-reverse
    overlay: "rgb(0 0 0 / 0.85)" // --pdl-bg-backdrop #000000d9 ≈ 0.85
  },
  text: {
    primary: poeColor.grey.base, // #0d0d0d --pdl-fg-base
    secondary: poeColor.grey.secondaryText, // #505157 --pdl-fg-muted
    muted: poeColor.grey.placeholder, // #616165 --pdl-fg-subtle / placeholder
    inverse: poeColor.grey[0], // white on dark / coloured surfaces
    link: poeColor.violet.emphasis // #413fa9 --pdl-link-theme-primary-default-fg
  },
  border: {
    subtle: poeColor.grey.muted, // #e3e3e7 --pdl-border-base
    strong: poeColor.grey.emphasis, // #bbbcc1 --pdl-border-emphasis
    interactive: poeColor.violet.base // #5d5cde --pdl-accent-base
  },
  action: {
    primary: poeColor.violet.base, // #5d5cde --pdl-comp-button-theme-primary-bg
    primaryHover: poeColor.violet.emphasis, // #413fa9 --pdl-comp-button-theme-primary-hover-bg
    primaryText: poeColor.grey[0], // #ffffff --pdl-comp-button-theme-primary-fg
    secondary: poeColor.grey.muted, // #e3e3e7 filled grey secondary
    secondaryHover: poeColor.grey.subtle, // #eaeaee --pdl-comp-button-theme-secondary-hover-bg
    secondaryText: poeColor.grey.base, // #0d0d0d
    danger: poeColor.system.errorBold // #d00e49 --pdl-action-error-border
  },
  feedback: {
    success: poeColor.system.success, // #26a682
    warning: poeColor.system.warning, // #ce8c16
    error: poeColor.system.errorBold, // #d00e49
    info: poeColor.system.info // #1254d6
  },
  status: {
    pending: poeColor.system.warning, // #ce8c16
    processing: poeColor.system.info, // #1254d6
    completed: poeColor.system.success, // #26a682
    failed: poeColor.system.errorBold // #d00e49
  },
  // Categorical data-vis palette built from the measured Poe accent + system
  // colours. Poe does not publish an 8-colour sequential data-vis scale, so the
  // overall sequence is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: poeColor.violet.base, // #5d5cde Poe violet
    category2: poeColor.system.feature, // #ce40db feature magenta
    category3: poeColor.system.info, // #1254d6 info blue
    category4: poeColor.system.successBright, // #1dddae teal
    category5: poeColor.system.warningBase, // #f2c110 yellow
    category6: poeColor.system.errorBold, // #d00e49 pink-red
    category7: poeColor.violet.muted, // #8f97ed light violet
    category8: poeColor.violet.emphasis // #413fa9 deep violet
  }
} as const;

/**
 * The Poe (by Quora) theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Poe-specific measured values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Poe brand reaches the components (buttons, tabs,
 * fields, chat bubbles…), not just the elements that read semantic vars directly.
 */
export const poeTheme: TenantTheme = {
  id: "poe",
  label: "Poe",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default poeTheme;
