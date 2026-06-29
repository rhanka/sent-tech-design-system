import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Microsoft Copilot theme for the Sentropic token structure.
 *
 * Microsoft Copilot's product UI is built on **Fluent 2** — Microsoft's OPEN
 * design system (fluent2.microsoft.design + the open-source `@fluentui/tokens`
 * package). All values below are taken from the PUBLIC Fluent 2 token set: the
 * Communication-blue brand ramp (`brandWeb`), the Fluent neutral grey ramp, the
 * Fluent shared status colours, the Fluent corner-radius / elevation / motion
 * scales, and the Copilot brand-mark spectrum gradient. We only reference the
 * font *names* (Segoe UI Variable, Consolas) here, never the font binaries.
 * Sources are documented in MAPPING.md; any value with no direct Fluent token is
 * marked "à confirmer".
 *
 * Fluent 2 colour reference (light theme — @fluentui/tokens):
 *   White (NeutralBackground1)         #ffffff   grey[100]
 *   NeutralBackground2                 #fafafa   grey[98]
 *   NeutralBackground3 / 1Hover        #f5f5f5   grey[96]
 *   NeutralBackground4                 #f0f0f0   grey[94]
 *   NeutralStroke2                     #e0e0e0   grey[88]
 *   NeutralStroke1 (default border)    #d1d1d1   grey[82]
 *   NeutralForegroundDisabled          #bdbdbd   grey[74]
 *   NeutralForeground4                 #707070   grey[44]
 *   NeutralForeground3 / StrokeAccess. #616161   grey[38]
 *   NeutralForeground2                 #424242   grey[26]
 *   NeutralForeground1 (primary text)  #242424   grey[14]
 *   Brand / BrandBackground (brand 80) #0f6cbd   brandWeb[80]  (primary action)
 *   BrandBackgroundHover (brand 70)    #115ea3   brandWeb[70]  (= ForegroundLink)
 *   BrandBackgroundPressed (brand 40)  #0c3b5e   brandWeb[40]
 *   Brand light tints                  #ebf3fc / #cfe4fa   brandWeb[160]/[150]
 *   Success (Green primary)            #0e700e   colorStatusSuccessForeground1
 *   Danger / error (Red foreground)    #b10e1c   colorStatusDangerForeground1
 *   Destructive button background      #c50f1f   colorStatusDangerBackground3
 *   Warning (dark gold foreground)     #835b00   colorStatusWarningForeground1
 *
 * Copilot brand-mark gradient (the multicolour ribbon): teal #199fd7 → violet
 * #8a50d8 → rose #ee5091. `TenantTheme` has no gradient token, so the stops live
 * in the `data.*` categorical palette and are documented in MAPPING.md.
 */

// --- Fluent 2 / Copilot raw colour palette (public) ------------------------
const copilotColor = {
  // Fluent Communication-blue brand ramp (`brandWeb`) — the brand / action family.
  brand: {
    pressed: "#0c3b5e", // brandWeb[40] — colorBrandBackgroundPressed
    link: "#115ea3", // brandWeb[70] — colorBrandForegroundLink / BrandBackgroundHover
    primary: "#0f6cbd", // brandWeb[80] — colorBrandBackground (primary)
    light: "#cfe4fa", // brandWeb[150] — light brand tint
    lighter: "#ebf3fc" // brandWeb[160] — lightest brand tint (selected fill)
  },
  // Copilot brand-mark spectrum (the multicolour ribbon gradient).
  copilot: {
    teal: "#199fd7", // gradient teal
    green: "#99bd3c", // gradient green
    orange: "#fc7942", // gradient orange
    rose: "#ee5091", // gradient pink / rose
    violet: "#8a50d8" // gradient violet / purple
  },
  // Fluent neutral grey ramp (light theme, @fluentui/tokens grey[N]).
  grey: {
    100: "#ffffff", // grey[100] — NeutralBackground1 / white
    98: "#fafafa", // grey[98]  — NeutralBackground2
    96: "#f5f5f5", // grey[96]  — NeutralBackground3 / NeutralBackground1Hover
    94: "#f0f0f0", // grey[94]  — NeutralBackground4 / NeutralStroke3
    88: "#e0e0e0", // grey[88]  — NeutralStroke2
    82: "#d1d1d1", // grey[82]  — NeutralStroke1 (default border)
    74: "#bdbdbd", // grey[74]  — NeutralForegroundDisabled
    44: "#707070", // grey[44]  — NeutralForeground4
    38: "#616161", // grey[38]  — NeutralForeground3 / NeutralStrokeAccessible
    26: "#424242", // grey[26]  — NeutralForeground2
    14: "#242424" // grey[14]  — NeutralForeground1 (primary text)
  },
  // Fluent shared status colours (light theme, AA-checked on white).
  system: {
    success: "#0e700e", // colorStatusSuccessForeground1 (Green)
    error: "#b10e1c", // colorStatusDangerForeground1 (Red foreground, AA)
    danger: "#c50f1f", // colorStatusDangerBackground3 (destructive button bg)
    warning: "#835b00", // colorStatusWarningForeground1 (dark gold, AA on white)
    info: "#0f6cbd" // Fluent reuses the brand blue for informative
  }
} as const;

// --- foundation (Fluent 2 / Copilot-specific values) -----------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Fluent brand ramp.
    blue: {
      10: copilotColor.brand.lighter, // lightest Fluent brand tint (#ebf3fc)
      60: copilotColor.brand.primary, // Fluent brand #0f6cbd (primary)
      80: copilotColor.brand.link // darker interactive Fluent brand #115ea3
    },
    // Fluent's brand is monochrome blue; the signature non-blue accent is the
    // Copilot brand-mark VIOLET, so the Sentropic "cyan" accent slot maps to it.
    cyan: {
      10: "#efe6fb", // light violet tint around #8a50d8 (derived — à confirmer)
      50: copilotColor.copilot.violet, // Copilot violet accent #8a50d8
      70: "#6c3aab" // darker violet (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Fluent grey ramp.
    slate: {
      0: copilotColor.grey[100], // white
      10: copilotColor.grey[96], // background alt
      20: copilotColor.grey[82], // default border / contrast
      60: copilotColor.grey[38], // secondary text / accessible stroke
      80: copilotColor.grey[26], // strong text
      90: copilotColor.grey[14] // primary text / darkest
    },
    feedback: {
      success: copilotColor.system.success,
      warning: copilotColor.system.warning,
      error: copilotColor.system.error,
      info: copilotColor.system.info
    }
  },
  // Fluent ships "Segoe UI Variable" (fontFamilyBase) for UI text and "Segoe UI
  // Variable Display" for large display sizes; mono = Consolas (fontFamily-
  // Monospace). Font *names* only, never binaries.
  font: {
    sans: "'Segoe UI Variable', 'Segoe UI Variable Text', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    display: "'Segoe UI Variable Display', 'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "Consolas, 'Courier New', Courier, 'SFMono-Regular', monospace"
  },
  // Fluent spacingHorizontal/Vertical scale is a 4px grid expressed in rem.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  — spacingS
    2: "0.5rem", // 8px  — spacingM
    3: "0.75rem", // 12px — spacingL
    4: "1rem", // 16px — spacingXL
    6: "1.5rem", // 24px — spacingXXL
    8: "2rem", // 32px — spacingXXXL
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Fluent corner radius scale: None 0, Small 2px, Medium 4px, Large 6px,
  // XLarge 8px, Circular 10000px. Controls/inputs/tabs use Medium (4px), cards
  // XLarge (8px). Source: @fluentui/tokens borderRadius* global tokens.
  radius: {
    none: "0",
    sm: "0.125rem", // 2px  — borderRadiusSmall
    md: "0.25rem", // 4px  — borderRadiusMedium (button / input / tabs)
    lg: "0.5rem", // 8px  — borderRadiusXLarge (cards)
    pill: "9999px" // borderRadiusCircular (badge / pill)
  },
  // Fluent depth elevation tokens (shadow4 / shadow8 / shadow16) — the soft
  // key+ambient pairs from @fluentui/tokens.
  shadow: {
    subtle: "0 1.6px 3.6px rgba(0, 0, 0, 0.132), 0 0.3px 0.9px rgba(0, 0, 0, 0.108)", // shadow4
    medium: "0 3.2px 7.2px rgba(0, 0, 0, 0.132), 0 0.6px 1.8px rgba(0, 0, 0, 0.108)", // shadow8
    floating: "0 6.4px 14.4px rgba(0, 0, 0, 0.132), 0 1.2px 3.6px rgba(0, 0, 0, 0.108)" // shadow16
  },
  // Fluent motion: durationFast 150ms / Normal 200ms / Slow 300ms, curveEasyEase.
  motion: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.33, 0, 0.67, 1)" // Fluent curveEasyEase
  },
  // z-index roles are not Fluent-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Fluent 2 / Copilot) -----------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // strokeWidthThin
    thick: "2px" // strokeWidthThick (focus / selected indicator)
  },
  borderStyle: { solid: "solid" },
  // Fluent control density. Fluent Button sizes: small 24px / medium 32px /
  // large 40px. The medium Button/Input height is 32px (the Fluent default).
  // Fields read md.paddingBlock (vertical) and sm.paddingInline (inline).
  density: {
    sm: { controlHeight: "1.5rem", paddingBlock: "0", paddingInline: "0.625rem", gap: "0.375rem", minWidth: "1.5rem", fontSize: "0.75rem" },
    md: { controlHeight: "2rem", paddingBlock: "0.3125rem", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }
  },
  // Fluent typography: Segoe UI Variable everywhere. Button labels are Semibold
  // (600); body/fields are Regular (400); field labels are Semibold (600).
  // Fluent Body1 = 14px / 20px line-height.
  typography: {
    control: { family: "'Segoe UI Variable', 'Segoe UI', sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4286", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Segoe UI Variable', 'Segoe UI', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4286", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Segoe UI Variable', 'Segoe UI', sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4286", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Fluent links are NOT underlined at rest (brand text); underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.55", // Fluent recolours disabled to neutral greys (à confirmer); base dim kept
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.33, 0, 0.67, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // Fluent icons 16/20/24
  // Fluent FOCUS = a TWO-TONE keyboard ring: a 2px OUTER stroke in
  // colorStrokeFocus2 (#000000) over a 1px INNER white gap (colorStrokeFocus1
  // #ffffff). This is the "double" strategy (outer outline + inner light ring).
  // The focus ring is brand-agnostic (high-contrast black/white), per Fluent a11y.
  focus: {
    strategy: "double",
    width: "2px", // outer stroke 2px
    offset: "1px", // push the outer stroke out
    color: "#000000", // colorStrokeFocus2 (outer)
    inset: "1px" // inner white gap (colorStrokeFocus1)
  },
  // Fluent Input (default appearance "outline") is a BOXED, rounded field: a
  // white fill, a 1px neutral stroke (#d1d1d1) on all sides, a 4px radius
  // (borderRadiusMedium) and an emphasised bottom rule that turns brand on focus.
  // `style: "outline"` draws the four equal borders from surface.default +
  // border.subtle; the native <select> chevron is redrawn in Fluent brand blue.
  field: {
    style: "outline",
    fillBg: copilotColor.grey[100], // #ffffff
    underlineColor: copilotColor.grey[38], // #616161 (Fluent input bottom accent; unused for outline)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230f6cbd' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Fluent Card: a white surface, a 1px neutral stroke and an 8px radius, with a
  // subtle hover tint. Source: Fluent Card (appearance "outline").
  card: {
    borderWidth: "1px",
    lineHeight: "1.4286", // Fluent Body1 20px / 14px
    hoverBackground: copilotColor.grey[98] // #fafafa
  },
  // Fluent default ("secondary") Button = a neutral filled button: white fill, a
  // 1px #d1d1d1 stroke, dark #242424 text, #f5f5f5 hover fill. (The Fluent
  // "primary" appearance is the solid brand button = action.primary.)
  buttonSecondary: {
    background: copilotColor.grey[100], // #ffffff
    border: copilotColor.grey[82], // #d1d1d1 1px neutral stroke
    hoverBackground: copilotColor.grey[96] // #f5f5f5 hover fill
  },
  // Fluent TabList: the selected tab keeps NEUTRAL #242424 semibold text and an
  // accent indicator on the bottom edge; the indicator is brand #0f6cbd (drawn
  // from action.primary by the builder). Inactive tabs use secondary text.
  tabs: {
    activeText: copilotColor.grey[14], // #242424 (Fluent selected tab text is neutral, not brand)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.625rem", // 10px (Fluent tab horizontal padding, approx — à confirmer)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // Fluent selected indicator sits on the bottom edge
    indicatorMode: "border" // a real bottom border accent (brand)
  },
  // Fluent has no first-party pagination; a Fluent-flavoured borderless brand
  // text link, active page filled brand (à confirmer — not an official spec).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: copilotColor.brand.primary, // #0f6cbd link text
    activeBackground: copilotColor.brand.primary, // #0f6cbd filled active page
    activeText: copilotColor.grey[100], // white on brand
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Fluent Breadcrumb: neutral links (#424242), dark current page (#242424,
  // semibold), neutral separators (#616161).
  breadcrumb: {
    linkText: copilotColor.grey[26], // #424242
    text: copilotColor.grey[26], // #424242 trail text
    currentText: copilotColor.grey[14], // #242424 current page
    separator: copilotColor.grey[38], // #616161
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Fluent MessageBar: a coloured LEFT accent filet on a transparent box (the
  // real MessageBar uses a tinted fill + intent icon; the left filet is the
  // closest anatomy primitive — exact fill/icon à confirmer).
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
  // Fluent Accordion header: a dark #242424 semibold summary trigger.
  accordion: {
    text: copilotColor.grey[14], // #242424 summary label
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    fontWeight: "600", // Fluent Semibold
    lineHeight: "1.25rem" // 20px
  },
  // Fluent Tag: a rounded-rect (4px, NOT a pill) subtle grey chip with a 1px
  // stroke; fill #f5f5f5, text #242424.
  tag: {
    radius: "4px", // borderRadiusMedium (Fluent tags are rounded-rect)
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px (Fluent Tag small height)
    neutralBackground: copilotColor.grey[96], // #f5f5f5
    neutralText: copilotColor.grey[14] // #242424
  },
  // Fluent Badge (default "filled" brand): a circular brand pill, white text.
  badge: {
    radius: "9999px", // borderRadiusCircular (Fluent Badge default shape)
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px (Fluent Badge medium)
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px Badge box
    infoBackground: copilotColor.brand.primary, // #0f6cbd brand fill
    infoText: copilotColor.grey[100] // white
  },
  // Fluent Checkbox / Radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: copilotColor.grey[14] // #242424
  },
  // Fluent SearchBox inner input (32px, 14px body, 8px inline padding).
  search: {
    paddingBlock: "0.3125rem", // 5px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Fluent Switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: copilotColor.grey[14] // #242424
  }
} as const;

// --- semantic (Fluent 2 / Copilot-specific role mapping) -------------------
const semantic = {
  surface: {
    default: copilotColor.grey[100], // white (NeutralBackground1)
    subtle: copilotColor.grey[96], // #f5f5f5 background alt / hover fill
    raised: copilotColor.grey[100], // white
    inverse: copilotColor.grey[14], // #242424 dark inverse surface
    overlay: "rgb(36 36 36 / 0.4)" // modal backdrop (NeutralForeground1 tint)
  },
  text: {
    primary: copilotColor.grey[14], // #242424 NeutralForeground1
    secondary: copilotColor.grey[26], // #424242 NeutralForeground2
    muted: copilotColor.grey[38], // #616161 NeutralForeground3 / placeholder
    inverse: copilotColor.grey[100], // white on dark / coloured surfaces
    link: copilotColor.brand.link // #115ea3 colorBrandForegroundLink
  },
  border: {
    subtle: copilotColor.grey[82], // #d1d1d1 NeutralStroke1 (default border)
    strong: copilotColor.grey[38], // #616161 NeutralStrokeAccessible
    interactive: copilotColor.brand.primary // #0f6cbd brand focus / interactive
  },
  action: {
    primary: copilotColor.brand.primary, // #0f6cbd colorBrandBackground (primary button)
    primaryHover: copilotColor.brand.link, // #115ea3 colorBrandBackgroundHover
    primaryText: copilotColor.grey[100], // white text on brand
    secondary: copilotColor.grey[100], // #ffffff Fluent default-button fill
    secondaryHover: copilotColor.grey[96], // #f5f5f5 hover fill
    secondaryText: copilotColor.grey[14], // #242424 dark text on the neutral button
    danger: copilotColor.system.error // #b10e1c destructive
  },
  feedback: {
    success: copilotColor.system.success,
    warning: copilotColor.system.warning,
    error: copilotColor.system.error,
    info: copilotColor.system.info
  },
  status: {
    pending: copilotColor.system.warning,
    processing: copilotColor.system.info,
    completed: copilotColor.system.success,
    failed: copilotColor.system.error
  },
  // Categorical data-vis palette: the Fluent brand blue + the Copilot brand-mark
  // spectrum (teal / green / orange / rose / violet) + a Fluent green. Fluent
  // does not publish an 8-colour sequential data-vis scale, so this is a coherent
  // proposal (see MAPPING.md, "à confirmer"). The Copilot gradient signature is
  // teal #199fd7 → violet #8a50d8 → rose #ee5091.
  data: {
    category1: copilotColor.brand.primary, // #0f6cbd Fluent brand blue
    category2: copilotColor.copilot.violet, // #8a50d8 Copilot violet (gradient)
    category3: copilotColor.copilot.teal, // #199fd7 Copilot teal (gradient)
    category4: copilotColor.copilot.rose, // #ee5091 Copilot rose (gradient)
    category5: copilotColor.copilot.green, // #99bd3c Copilot green (gradient)
    category6: copilotColor.copilot.orange, // #fc7942 Copilot orange (gradient)
    category7: copilotColor.system.success, // #0e700e Fluent green
    category8: copilotColor.grey[38] // #616161 Fluent neutral grey
  }
} as const;

/**
 * The Microsoft Copilot theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Fluent 2 / Copilot-specific values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Fluent brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const copilotTheme: TenantTheme = {
  id: "copilot",
  label: "Microsoft Copilot",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default copilotTheme;
