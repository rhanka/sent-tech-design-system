import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * /dev/mtl keynote theme for the Sentropic token structure (light v0).
 *
 * Measured from the owner's keynote deck stylesheet (`deck/deck.css`). Only
 * font *names* ("Inter Variable", Inter) are referenced here, never font
 * binaries, and no logo image or third-party trademark asset is included.
 * Where `deck/deck.css` declares no direct equivalent for a Sentropic role,
 * a coherent derived value is used and marked "à confirmer" in MAPPING.md.
 *
 * /dev/mtl colour reference (light v0 — `deck/deck.css`):
 *   Navy (brand / primary / border)   #01055e   (--navy)
 *   Ink (handover line / darkest)     #0b0d32   (--ink)
 *   Orange (focus / active accent)    #e87432   (--orange)
 *   Orange light (underline / bar)    #ff9b62   (--orange-l)
 *   Line (subtle divider / border)    #d6d9ea   (--line)
 *   Soft (hover / subtle surface)     #f3f4fb   (--soft)
 *   Background (page white)           #ffffff   (--bg)
 *   Foreground (body text)            #1f2437   (--fg)
 */

// --- /dev/mtl raw colour palette (deck/deck.css) ----------------------------
const devmtlColor = {
  // Brand navy — primary action, strong borders, headings, inverse surface.
  navy: {
    primary: "#01055e", // --navy
    ink: "#0b0d32", // --ink (handover rule / deepest navy)
    more: "#4a4f8f", // .hi.more (secondary nav accent)
    softTint: "#eef0fb" // .tl.on / .tp-sound.on (active tool tint)
  },
  // Brand orange — focus outline, active highlights, accents.
  orange: {
    primary: "#e87432", // --orange
    light: "#ff9b62", // --orange-l
    hover: "#d4621f", // .tp-play:hover (darkened orange)
    tint: "#fff3ea" // .it.cur (current item tint)
  },
  // Neutral ramp measured from deck.css.
  neutral: {
    0: "#ffffff", // --bg (#fff)
    50: "#f3f4fb", // --soft
    200: "#d6d9ea", // --line
    400: "#6b7280", // .tg .tl / .tp-sound muted label (4.83:1 on white)
    600: "#444455", // #msg (#445) secondary text (9.53:1 on white)
    800: "#1f2437", // --fg primary body text
    900: "#0b0d32" // --ink darkest
  },
  // System / status colours (not declared in deck.css — derived AA hues, à confirmer).
  system: {
    success: "#15803d", // derived AA green (5.02:1 on white — à confirmer)
    warning: "#b45309", // derived AA amber (5.02:1 on white — à confirmer)
    error: "#dc2626", // derived AA red (4.83:1 on white — à confirmer)
    info: "#4a4f8f" // .hi.more indigo-navy (7.48:1 on white — à confirmer)
  }
} as const;

// --- foundation (/dev/mtl-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto /dev/mtl brand navy.
    blue: {
      10: devmtlColor.neutral[50], // --soft
      60: devmtlColor.navy.primary, // --navy (primary)
      80: devmtlColor.navy.ink // --ink (darkest navy)
    },
    // Sentropic "cyan" accent slot mapped onto /dev/mtl brand orange (à confirmer).
    cyan: {
      10: devmtlColor.orange.tint, // #fff3ea (.it.cur)
      50: devmtlColor.orange.primary, // --orange
      70: devmtlColor.orange.hover // #d4621f (.tp-play:hover)
    },
    // Sentropic "slate" role family mapped onto the /dev/mtl neutral scale.
    slate: {
      0: devmtlColor.neutral[0], // --bg (#ffffff)
      10: devmtlColor.neutral[50], // --soft (#f3f4fb)
      20: devmtlColor.neutral[200], // --line (#d6d9ea)
      60: devmtlColor.neutral[600], // #444455 (#msg)
      80: devmtlColor.neutral[800], // --fg (#1f2437)
      90: devmtlColor.neutral[900] // --ink (#0b0d32)
    },
    feedback: {
      success: devmtlColor.system.success,
      warning: devmtlColor.system.warning,
      error: devmtlColor.system.error,
      info: devmtlColor.system.info
    }
  },
  // Measured from deck.css: `"Inter Variable", Inter, system-ui, sans-serif`.
  // Font names only, never binaries.
  font: {
    sans: "'Inter Variable', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Inter Variable', Inter, system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" // à confirmer
  },
  // Standard 4px rem spacing scale (aligned with Sentropic base — à confirmer).
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
  // Measured from deck.css: buttons, selects, and toggles use 8px radius;
  // cards (.run) and control bar (#bar) use 10px radius; focus outline uses 4px.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px (.hd button:focus-visible)
    md: "0.5rem", // 8px (button, .row select, .tl, .tg, .hd-lang, .mi)
    lg: "0.625rem", // 10px (.run card, #bar)
    pill: "999px" // .tp-play, .sec-b .num
  },
  // Measured from deck.css (.hd, #bar, .hd-menu).
  shadow: {
    subtle: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // .hd
    medium: "0 2px 10px rgb(0 0 0 / 0.2)", // #bar (#0003)
    floating: "0 12px 32px -8px rgb(1 5 94 / 0.28), 0 2px 6px rgb(0 0 0 / 0.08)" // .hd-menu
  },
  // Measured from deck.css (#view .35s, .hd .2s, .sub .36s, cubic-bezier(.3,0,.2,1)).
  motion: {
    fast: "150ms", // à confirmer
    normal: "200ms", // .2s in deck.css
    slow: "360ms", // .36s in deck.css (.sub)
    easing: "cubic-bezier(0.3, 0, 0.2, 1)" // #view transition easing in deck.css
  },
  // z-index roles aligned with Sentropic base (à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (/dev/mtl) ---------------------------------------
  // Measured from deck.css: buttons, selects, .run cards use 1.5px; .tg and .hd-lang use 2px.
  borderWidth: {
    none: "0",
    thin: "1.5px", // button, .row select, .run
    thick: "2px" // .tg, .hd-lang
  },
  borderStyle: { solid: "solid" },
  // Control density: `button` uses padding 4px 10px at 15px/1.4 body text.
  // sm/lg scales are derived (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0.25rem", paddingInline: "0.5rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.25rem", paddingInline: "0.625rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1.0625rem" }
  },
  // Typography roles measured from deck.css (15px / 1.4, weight 650 on active/headings).
  typography: {
    control: { family: "'Inter Variable', Inter, system-ui, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter Variable', Inter, system-ui, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter Variable', Inter, system-ui, sans-serif", size: "0.9375rem", weight: "650", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.18em",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.55",
  transition: { property: "background-color, border-color, color, outline-color", duration: "200ms", easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.5rem" }, // .tl svg = 24px
  // FOCUS = 3px solid orange (#e87432) outline, offset 1px (deck.css button:focus-visible).
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "1px",
    color: devmtlColor.orange.primary, // #e87432 (--orange)
    inset: "0"
  },
  // Boxed outline fields (.row select: white fill, 1.5px navy/line border, 8px radius).
  field: {
    style: "outline",
    fillBg: devmtlColor.neutral[0], // #ffffff
    underlineColor: devmtlColor.navy.primary, // unused for outline
    underlineWidth: "1.5px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2301055e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards (.run): 1.5px border, 10px radius, soft hover tint.
  card: {
    borderWidth: "1.5px",
    lineHeight: "1.4",
    hoverBackground: devmtlColor.neutral[50] // #f3f4fb (--soft)
  },
  // Secondary / default button in deck.css: white fill, 1.5px navy border, navy text, --soft hover.
  buttonSecondary: {
    background: devmtlColor.neutral[0], // #ffffff
    border: devmtlColor.navy.primary, // #01055e (--navy)
    hoverBackground: devmtlColor.neutral[50] // #f3f4fb (--soft)
  },
  // Tabs / header nav: navy bold active label with bottom accent.
  tabs: {
    activeText: devmtlColor.navy.primary, // #01055e (--navy)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "650",
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.875rem", // 14px (.mi)
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.4",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: transparent navy links; active = solid navy fill, white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: devmtlColor.navy.primary, // #01055e
    activeBackground: devmtlColor.navy.primary, // #01055e
    activeText: devmtlColor.neutral[0], // #ffffff
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2.25rem", // 36px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.4"
  },
  // Breadcrumb: navy links, body current page, muted separator.
  breadcrumb: {
    linkText: devmtlColor.navy.primary, // #01055e
    text: devmtlColor.neutral[600], // #444455
    currentText: devmtlColor.neutral[800], // #1f2437
    separator: devmtlColor.neutral[400], // #6b7280
    fontSize: "0.875rem", // 14px
    lineHeight: "1.4",
    currentWeight: "650"
  },
  // Alert / notice: left accent filet (4px) on white/transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px
    paddingTop: "0.75rem",
    paddingRight: "1rem",
    paddingBottom: "0.75rem",
    paddingLeft: "1.25rem",
    fontSize: "0.9375rem",
    lineHeight: "1.4"
  },
  // Accordion / collapsible summary (.run > .h): navy semibold trigger.
  accordion: {
    text: devmtlColor.navy.primary, // #01055e
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    fontSize: "0.9375rem",
    fontWeight: "650",
    lineHeight: "1.4"
  },
  // Tag: 8px-radius soft chip with navy text.
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.8125rem",
    fontWeight: "600",
    lineHeight: "1.4",
    minHeight: "1.5rem",
    neutralBackground: devmtlColor.neutral[50], // #f3f4fb
    neutralText: devmtlColor.navy.primary // #01055e
  },
  // Badge: 8px-radius filled navy badge with white text.
  badge: {
    radius: "8px",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.8125rem",
    fontWeight: "650",
    lineHeight: "1.4",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: devmtlColor.navy.primary, // #01055e
    infoText: devmtlColor.neutral[0] // #ffffff
  },
  // Checkbox / radio label.
  choice: {
    labelFontSize: "0.9375rem",
    labelLineHeight: "1.4",
    radioLineHeight: "1.4",
    labelColor: devmtlColor.neutral[800] // #1f2437
  },
  // Search input.
  search: {
    paddingBlock: "0.25rem",
    paddingInline: "0.625rem",
    fontSize: "0.9375rem",
    lineHeight: "1.4"
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.4",
    textColor: devmtlColor.neutral[800] // #1f2437
  }
} as const;

// --- semantic (/dev/mtl role mapping) ---------------------------------------
const semantic = {
  surface: {
    default: devmtlColor.neutral[0], // #ffffff (--bg)
    subtle: devmtlColor.neutral[50], // #f3f4fb (--soft)
    raised: devmtlColor.neutral[0], // #ffffff
    inverse: devmtlColor.navy.primary, // #01055e (--navy)
    overlay: "rgb(11 13 50 / 0.55)" // derived from --ink (à confirmer)
  },
  text: {
    primary: devmtlColor.neutral[800], // #1f2437 (--fg)
    secondary: devmtlColor.neutral[600], // #444455 (#msg)
    muted: devmtlColor.neutral[400], // #6b7280 (.tg .tl)
    inverse: devmtlColor.neutral[0], // #ffffff
    link: devmtlColor.navy.primary // #01055e (--navy)
  },
  border: {
    subtle: devmtlColor.neutral[200], // #d6d9ea (--line)
    strong: devmtlColor.navy.primary, // #01055e (--navy)
    interactive: devmtlColor.navy.primary // #01055e (--navy)
  },
  action: {
    primary: devmtlColor.navy.primary, // #01055e (button.pri)
    primaryHover: devmtlColor.navy.ink, // #0b0d32 (--ink, à confirmer)
    primaryText: devmtlColor.neutral[0], // #ffffff
    secondary: devmtlColor.neutral[0], // #ffffff (button)
    secondaryHover: devmtlColor.neutral[50], // #f3f4fb (--soft, button:hover)
    secondaryText: devmtlColor.navy.primary, // #01055e (--navy)
    danger: devmtlColor.system.error // #dc2626 (à confirmer)
  },
  feedback: {
    success: devmtlColor.system.success,
    warning: devmtlColor.system.warning,
    error: devmtlColor.system.error,
    info: devmtlColor.system.info
  },
  status: {
    pending: devmtlColor.system.warning,
    processing: devmtlColor.system.info,
    completed: devmtlColor.system.success,
    failed: devmtlColor.system.error
  },
  // Categorical data-vis palette drawn from /dev/mtl navy/orange hues (à confirmer).
  data: {
    category1: devmtlColor.navy.primary, // #01055e (--navy)
    category2: devmtlColor.orange.primary, // #e87432 (--orange)
    category3: devmtlColor.navy.more, // #4a4f8f (.hi.more)
    category4: devmtlColor.orange.light, // #ff9b62 (--orange-l)
    category5: devmtlColor.system.success, // #15803d
    category6: devmtlColor.orange.hover, // #d4621f (.tp-play:hover)
    category7: devmtlColor.neutral[400], // #6b7280
    category8: devmtlColor.system.error // #dc2626
  }
} as const;

/**
 * The /dev/mtl keynote theme as a Sentropic `TenantTheme` (light v0).
 * `component` is rebuilt from `semantic` and `foundation` via `createComponent`.
 */
export const devmtlTheme: TenantTheme = {
  id: "devmtl",
  label: "/dev/mtl",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default devmtlTheme;
