import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Amazon Cloudscape (AWS) Design System theme for the Sentropic token structure.
 *
 * Cloudscape is Amazon's OPEN-SOURCE design system (Apache-2.0), the language of
 * the AWS Management Console. All values below are taken from the PUBLIC
 * Cloudscape design tokens (`@cloudscape-design/design-tokens`, the
 * `style-dictionary` "visual refresh" palette). We only reference the font
 * *name* "Amazon Ember" (the AWS console face) here, never the binary — the
 * open-source Cloudscape package itself ships "Open Sans" as the substitute, so
 * Open Sans is kept as the first fallback. Sources are documented in MAPPING.md.
 * Where Cloudscape has no direct equivalent for a Sentropic role, the closest
 * Cloudscape token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Cloudscape colour reference (visual refresh, light mode):
 *   White (background default)          #ffffff   (colorWhite)
 *   Grey 100 (background alt / hover)   #f9f9fa   (colorGrey100)
 *   Grey 200 (contrast background)      #f3f3f7   (colorGrey200)
 *   Grey 300 (subtle border)            #dedee3   (colorGrey300)
 *   Grey 350 (divider default)          #c6c6cd   (colorBorderDividerDefault)
 *   Grey 500 (input border)             #8c8c94   (colorBorderInputDefault)
 *   Grey 600 (muted text)               #656871   (colorGrey600)
 *   Grey 650 (secondary text)           #424650   (colorTextBodySecondary)
 *   Grey 750 (strong text)              #232b37   (colorGrey750)
 *   Grey 950 (body / heading text)      #0f141a   (colorTextBodyDefault)
 *   AWS Blue 600 (action / link)        #006ce0   (colorPrimary600 / colorTextLinkDefault)
 *   AWS Blue 900 (primary hover)        #002b66   (colorBackgroundButtonPrimaryHover)
 *   AWS Blue 50 (light fill)            #f0fbff   (colorBlue50)
 *   Amazon Orange (brand accent)        #ff9900   (colorAmber400 — AWS "smile")
 *   Squid Ink (top-nav / inverse)       #232f3e   (colorAwsSquidInk)
 *   Status: success #00802f  error #db0000  warning #855900  info #006ce0
 */

// --- Cloudscape raw colour palette (public, Apache-2.0) ---------------------
const amazonColor = {
  // AWS Blue — the primary action / link family (Cloudscape colorPrimary = colorBlue).
  blue: {
    600: "#006ce0", // colorBlue600 / colorPrimary600 — primary button, link, focus, info
    700: "#004a9e", // colorBlue700 — darker interactive
    900: "#002b66", // colorBlue900 — primary button hover (colorBackgroundButtonPrimaryHover)
    100: "#d1f1ff", // colorBlue100 — light fill
    50: "#f0fbff" // colorBlue50 — lightest tint / normal-button hover fill
  },
  // Amazon Orange — the brand accent (the AWS "smile"). Cloudscape colorAmber400.
  orange: {
    400: "#ff9900", // colorAmber400 — Amazon orange (logo smile, ratings, highlights)
    100: "#ffe8bd", // colorAmber100 — light orange tint
    600: "#d14600" // colorAmber600 — darker orange
  },
  // Squid ink — the iconic AWS Management Console top-navigation navy.
  squidInk: "#232f3e", // colorAwsSquidInk — top nav / dark inverse surface
  // Neutral grey scale (Cloudscape colorGrey / colorNeutral, visual refresh).
  grey: {
    0: "#ffffff", // colorWhite
    100: "#f9f9fa", // colorGrey100 — background alt / subtle surface / hover fill
    200: "#f3f3f7", // colorGrey200 — contrast background
    300: "#dedee3", // colorGrey300 — subtle border tint
    350: "#c6c6cd", // colorGrey350 — divider default (colorBorderDividerDefault)
    500: "#8c8c94", // colorGrey500 — input border (colorBorderInputDefault)
    600: "#656871", // colorGrey600 — muted / placeholder text
    650: "#424650", // colorGrey650 — secondary text (colorTextBodySecondary)
    750: "#232b37", // colorGrey750 — strong text
    900: "#131920", // colorGrey900
    950: "#0f141a" // colorGrey950 — body / heading text (colorTextBodyDefault)
  },
  // System / status colours (Cloudscape status tokens, light mode).
  system: {
    success: "#00802f", // colorGreen600 (colorTextStatusSuccess)
    error: "#db0000", // colorRed600 (colorTextStatusError)
    warning: "#855900", // colorYellow900 (colorTextStatusWarning — dark amber, AA on white)
    info: "#006ce0" // colorBlue600 (colorTextStatusInfo)
  }
} as const;

// --- foundation (Cloudscape-specific values) -------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto AWS Blue.
    blue: {
      10: amazonColor.blue[50], // lightest AWS Blue tint
      60: amazonColor.blue[600], // AWS Blue 600 (primary)
      80: amazonColor.blue[900] // AWS Blue 900 (darker interactive / hover)
    },
    // Cloudscape has no cyan; the signature non-blue brand accent is Amazon
    // orange, so the Sentropic "cyan" accent slot maps to the Amazon orange family.
    cyan: {
      10: amazonColor.orange[100], // light orange tint
      50: amazonColor.orange[400], // Amazon orange accent
      70: amazonColor.orange[600] // darker orange
    },
    // Sentropic "slate" role family mapped onto the Cloudscape grey scale.
    slate: {
      0: amazonColor.grey[0], // white
      10: amazonColor.grey[100], // background alt
      20: amazonColor.grey[300], // subtle borders / contrast background
      60: amazonColor.grey[600], // muted / secondary text
      80: amazonColor.grey[750], // strong text
      90: amazonColor.grey[950] // body / title text
    },
    feedback: {
      success: amazonColor.system.success,
      warning: amazonColor.system.warning,
      error: amazonColor.system.error,
      info: amazonColor.system.info
    }
  },
  // Cloudscape ships "Amazon Ember" in the AWS console (display + body) and falls
  // back to "Open Sans" in the open-source package; mono is "Monaco, Menlo…". We
  // reference the font *names* only, never the binaries.
  font: {
    sans: "'Amazon Ember', 'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif",
    display: "'Amazon Ember', 'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif",
    mono: "Monaco, Menlo, Consolas, 'Courier Prime', Courier, 'Courier New', monospace"
  },
  // Cloudscape uses a 4px-based spacing scale. Mapped to Sentropic spacing keys
  // by px value (kept aligned with the base for component-grid fidelity).
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
  // Cloudscape radii (visual refresh): input/field/dropdown 8px, container/card
  // 16px, badge 4px. Buttons are 20px (near-pill) in the real Cloudscape but the
  // Sentropic model drives buttons from `radius.md` (the control radius = 8px) —
  // the 20px button is noted "à confirmer" in MAPPING.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — badge
    md: "0.5rem", // 8px — input / field / dropdown / tabs / button
    lg: "1rem", // 16px — container / card
    pill: "999px" // tokens / pills
  },
  // Cloudscape elevation: soft, neutral, low-opacity shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 1px rgb(15 20 26 / 0.10), 0 1px 4px rgb(15 20 26 / 0.08)",
    medium: "0 2px 6px rgb(15 20 26 / 0.14)",
    floating: "0 4px 20px rgb(15 20 26 / 0.20)"
  },
  // Cloudscape motion durations are quick. Kept close to the Cloudscape scale;
  // exact easing "à confirmer".
  motion: {
    fast: "90ms",
    normal: "135ms",
    slow: "270ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Cloudscape-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Cloudscape) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Cloudscape control density is COMPACT / applicative. Default control height
  // ~32px (md), body type 14px. sm (28px) and lg (40px) follow the size scale.
  // Fields read md.paddingBlock (vertical 4px) and sm.paddingInline (inline 12px).
  density: {
    sm: { controlHeight: "1.75rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "1.75rem", fontSize: "0.75rem" },
    md: { controlHeight: "2rem", paddingBlock: "0.25rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }
  },
  // Cloudscape typography = Amazon Ember. Body 14px / 20px line-height (1.43).
  // Button + form labels are bold (fontWeightButton / heading = 700).
  typography: {
    control: { family: "'Amazon Ember', 'Open Sans', sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Amazon Ember', 'Open Sans', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Amazon Ember', 'Open Sans', sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cloudscape links are NOT underlined at rest (AWS Blue text); underline
    // appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Cloudscape greys out disabled controls (approx — à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "90ms", easing: "ease-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.25rem" }, // Cloudscape icons 16 / 16 / 20px
  // Cloudscape FOCUS = a 2px AWS Blue ring offset from the control (a box-shadow
  // ring with a gap), colour colorBorderItemFocused #006ce0. Source: Cloudscape
  // visual-refresh focus indicator.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: amazonColor.blue[600], // #006ce0 AWS Blue focus ring
    inset: "0"
  },
  // Cloudscape form fields are BOXED (outline): a white fill with a 1px grey
  // border (colorBorderInputDefault #8c8c94) and an 8px radius. `style: "outline"`
  // makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`; on focus the AWS Blue ring (above) wraps the box.
  field: {
    style: "outline",
    fillBg: amazonColor.grey[0], // #ffffff
    underlineColor: amazonColor.grey[500], // #8c8c94 input border (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in AWS Blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23006ce0' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cloudscape Container / Card: white fill, 16px radius, a subtle 1px divider
  // border, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.43",
    hoverBackground: amazonColor.grey[100] // #f9f9fa
  },
  // Cloudscape "normal" button = a bordered button: transparent/white fill, a 2px
  // AWS Blue border + AWS Blue text, light AWS-Blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: amazonColor.blue[600], // #006ce0 stroke
    hoverBackground: amazonColor.blue[50] // #f0fbff light fill on hover
  },
  // Cloudscape Tabs: active tab = AWS Blue bold label with a 2px bottom indicator.
  tabs: {
    activeText: amazonColor.blue[600], // #006ce0
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // Cloudscape indicator sits on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Cloudscape Pagination: borderless AWS Blue text links; the current page is a
  // non-link dark number (NOT a filled tile).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: amazonColor.blue[600], // #006ce0 link text
    activeBackground: "transparent", // current page has no fill in Cloudscape
    activeText: amazonColor.grey[950], // #0f141a dark current-page number
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cloudscape BreadcrumbGroup: AWS Blue links, dark non-link current page, grey
  // "/" separators.
  breadcrumb: {
    linkText: amazonColor.blue[600], // #006ce0
    text: amazonColor.grey[650], // #424650 trail text
    currentText: amazonColor.grey[950], // #0f141a current page
    separator: amazonColor.grey[600], // #656871
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "400" // Cloudscape current page is not bolded
  },
  // Cloudscape Alert: a bordered box with a coloured left accent. (The real
  // Cloudscape alert is a full status-tinted box with a 2px border + 12px radius;
  // the left-filet model is used here, noted "à confirmer" in MAPPING.)
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "0.75rem", // 12px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.75rem", // 12px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cloudscape ExpandableSection header: a dark bold trigger.
  accordion: {
    text: amazonColor.grey[950], // #0f141a header label
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.25rem", // 4px
    fontSize: "0.875rem", // 14px
    fontWeight: "700", // Cloudscape header is bold
    lineHeight: "1.25rem" // 20px
  },
  // Cloudscape token / chip: a small grey pill (filter tokens).
  tag: {
    radius: "4px",
    paddingBlock: "0", // 0
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.25rem", // 20px
    neutralBackground: amazonColor.grey[200], // #f3f3f7
    neutralText: amazonColor.grey[950] // #0f141a
  },
  // Cloudscape Badge: a small 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: amazonColor.blue[600], // #006ce0
    infoText: amazonColor.grey[0] // white
  },
  // Cloudscape checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: amazonColor.grey[950] // #0f141a
  },
  // Cloudscape search / input.
  search: {
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cloudscape Toggle / switch label (checked track = AWS Blue, via control).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: amazonColor.grey[950] // #0f141a
  }
} as const;

// --- semantic (Cloudscape-specific role mapping) ---------------------------
const semantic = {
  surface: {
    default: amazonColor.grey[0], // white
    subtle: amazonColor.grey[100], // #f9f9fa background alt / hover fill
    raised: amazonColor.grey[0], // white containers
    inverse: amazonColor.squidInk, // #232f3e AWS top-nav squid ink
    overlay: "rgb(15 20 26 / 0.50)" // modal backdrop (grey-950 tint)
  },
  text: {
    primary: amazonColor.grey[950], // #0f141a (colorTextBodyDefault / heading)
    secondary: amazonColor.grey[650], // #424650 (colorTextBodySecondary)
    muted: amazonColor.grey[600], // #656871 muted / placeholder
    inverse: amazonColor.grey[0], // white on dark / coloured surfaces
    link: amazonColor.blue[600] // #006ce0 (colorTextLinkDefault)
  },
  border: {
    subtle: amazonColor.grey[350], // #c6c6cd (colorBorderDividerDefault)
    strong: amazonColor.grey[500], // #8c8c94 (colorBorderInputDefault)
    interactive: amazonColor.blue[600] // #006ce0 focus / interactive
  },
  action: {
    primary: amazonColor.blue[600], // #006ce0 primary button (colorBackgroundButtonPrimaryDefault)
    primaryHover: amazonColor.blue[900], // #002b66 (colorBackgroundButtonPrimaryHover)
    primaryText: amazonColor.grey[0], // white text on blue
    secondary: amazonColor.blue[50], // #f0fbff light secondary surface
    secondaryHover: amazonColor.blue[100], // #d1f1ff
    secondaryText: amazonColor.blue[600], // #006ce0
    danger: amazonColor.system.error // #db0000
  },
  feedback: {
    success: amazonColor.system.success,
    warning: amazonColor.system.warning,
    error: amazonColor.system.error,
    info: amazonColor.system.info
  },
  status: {
    pending: amazonColor.system.warning,
    processing: amazonColor.system.info,
    completed: amazonColor.system.success,
    failed: amazonColor.system.error
  },
  // Categorical data-vis palette built from the Cloudscape charts categorical
  // palette (light mode). These are the Cloudscape chart hues; exact values are
  // noted "à confirmer" in MAPPING.md.
  data: {
    category1: "#688ae8", // Cloudscape categorical 1 (blue)
    category2: "#c33d69", // Cloudscape categorical 2 (pink/red)
    category3: "#2ea597", // Cloudscape categorical 3 (teal)
    category4: "#8456ce", // Cloudscape categorical 4 (purple)
    category5: "#e07941", // Cloudscape categorical 5 (orange)
    category6: "#3759ce", // Cloudscape categorical 6 (indigo)
    category7: "#962249", // Cloudscape categorical 7 (dark pink)
    category8: "#096f64" // Cloudscape categorical 8 (dark teal)
  }
} as const;

/**
 * The Amazon Cloudscape theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Cloudscape-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the AWS brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const amazonTheme: TenantTheme = {
  id: "amazon",
  label: "Amazon",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default amazonTheme;
