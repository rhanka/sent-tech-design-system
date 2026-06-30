import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * DeepSeek theme for the Sentropic token structure.
 *
 * All values below are MEASURED from DeepSeek's PUBLIC web design system — the
 * `--dsw-*` CSS custom properties shipped on deepseek.com / chat.deepseek.com
 * (the `dsw` "DeepSeek Web" token layer: `static` raw scales, `alias` semantic
 * roles, `specific` component slots). Only the light-mode (`:root`) values are
 * used here; the dark-mode (`[data-ds-dark-theme]`) overrides are documented in
 * MAPPING.md. We reference the font *names* only (Inter for UI/headings, the
 * system monospace stack), never the binaries. Where DeepSeek publishes no
 * direct equivalent for a Sentropic role (e.g. a second accent hue, an 8-colour
 * data-vis scale), the closest brand token is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * DeepSeek colour reference (measured `--dsw-static-*`, light theme):
 *   White (bg-base)                       #ffffff   (neutral-bluish-00)
 *   Bluish 50 (alt surface / input fill)  #f9fafb   (neutral-bluish-50)
 *   Bluish 75 (hover-solid surface)       #f1f3f5   (neutral-bluish-75)
 *   Bluish 100 (sidebar active fill)      #ebeef2   (neutral-bluish-100)
 *   Bluish 200 (default border)           #e1e5ee   (neutral-bluish-200)
 *   Bluish 600 (tertiary text)            #81858c   (neutral-bluish-600)
 *   Bluish 700 (secondary text)           #61666b   (neutral-bluish-700)
 *   Bluish 800 (strong text)              #353638   (neutral-bluish-800)
 *   Bluish 1000 (primary text)            #0f1115   (neutral-bluish-1000)
 *   Bluish 950 (dark canvas / inverse)    #151517   (neutral-bluish-950)
 *   DeepSeek 50 (selected / bubble fill)  #edf3fe   (deepseek-50)
 *   DeepSeek 300 (active ghost border)    #b7c8fe   (deepseek-300)
 *   DeepSeek 400 (light brand blue)       #679efe   (deepseek-400)
 *   DeepSeek 450 (primary hover, light)   #5686fe   (deepseek-450)
 *   DeepSeek 500 (brand-primary / action) #3964fe   (deepseek-500)
 *   DeepSeek 600 (darker muted navy)      #4868b2   (deepseek-600)
 *   Green 500 (success)                   #22c55e   (green-500)
 *   Amber 600 (warning label, AA-tuned)   #dd8629   (amber-600)
 *   Red 600 (error / danger)              #ec1313   (red-600)
 *
 * Brand mark: the DeepSeek whale wordmark/logo uses the marketing electric blue
 * #4D6BFE (close to the UI action token #3964fe). The logo blue lives in
 * `brand.mark` and is documented as the asset colour, not a UI role.
 */

// --- DeepSeek raw colour palette (measured `--dsw-static-*`) ----------------
const deepseekColor = {
  // DeepSeek brand blue scale (`--dsw-static-deepseek-*`).
  brand: {
    50: "#edf3fe", // deepseek-50 — selected / chat-bubble fill (light)
    100: "#e4edfd", // deepseek-100 — ghost-active hover fill
    200: "#d3e2ff", // deepseek-200 — bubble highlight
    300: "#b7c8fe", // deepseek-300 — ghost-active border (light)
    400: "#679efe", // deepseek-400 — lighter brand blue
    450: "#5686fe", // deepseek-450 — primary button hover (light) / brand (dark)
    500: "#3964fe", // deepseek-500 — brand-primary / action (light)
    600: "#4868b2", // deepseek-600 — darker muted navy
    800: "#34415b", // deepseek-800 — deep navy
    900: "#283142", // deepseek-900 — deepest navy
    mark: "#4d6bfe" // marketing / whale-logo electric blue (brand asset) — à confirmer role
  },
  // DeepSeek primary neutral family (`--dsw-static-neutral-bluish-*`): a cool,
  // very slightly blue-tinted grey scale used for surfaces, text and borders.
  neutral: {
    0: "#ffffff", // bluish-00 — bg-base / white
    50: "#f9fafb", // bluish-50 — alt surface / login-input fill / sidebar
    75: "#f1f3f5", // bluish-75 — hover-solid surface / selector
    100: "#ebeef2", // bluish-100 — sidebar active / markdown citation
    150: "#e9ecf2", // bluish-150 — overlay surface (light)
    200: "#e1e5ee", // bluish-200 — default border
    300: "#cfd3d6", // bluish-300 — stronger border
    400: "#adb2b8", // bluish-400 — disabled / faint text
    500: "#979da6", // bluish-500 — placeholder / muted-er
    600: "#81858c", // bluish-600 — tertiary / caption text
    700: "#61666b", // bluish-700 — secondary text
    750: "#43454a", // bluish-750 — tooltip / toast bg (light)
    800: "#353638", // bluish-800 — strong text
    900: "#1b1b1c", // bluish-900 — near-black
    950: "#151517", // bluish-950 — dark canvas (inverse surface)
    1000: "#0f1115" // bluish-1000 — primary text (light)
  },
  // System / status colours (DeepSeek `--dsw-static-{green,amber,red}-*` mapped
  // through the `--dsw-alias-state-*` light-mode roles, AA-tuned where DeepSeek
  // ships a dedicated label tone).
  system: {
    success: "#22c55e", // green-500 — state-success-primary
    warning: "#dd8629", // amber-600 — state-warn-label (darker, AA on white)
    error: "#ec1313", // red-600 — state-error-primary (light)
    info: "#3964fe" // brand blue — DeepSeek has no distinct info hue (à confirmer)
  }
} as const;

// --- foundation (DeepSeek-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the DeepSeek brand blue scale.
    blue: {
      10: deepseekColor.brand[50], // #edf3fe lightest brand tint
      60: deepseekColor.brand[500], // #3964fe brand primary
      80: deepseekColor.brand[600] // #4868b2 darker muted navy
    },
    // DeepSeek ships a single-hue brand (no cyan/teal). The Sentropic "cyan"
    // accent slot reuses the lighter DeepSeek blues as the nearest accent — all
    // marked "à confirmer" in MAPPING.md.
    cyan: {
      10: deepseekColor.brand[100], // #e4edfd light blue tint (à confirmer)
      50: deepseekColor.brand[400], // #679efe lighter brand blue (à confirmer)
      70: deepseekColor.brand[600] // #4868b2 muted navy (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the DeepSeek bluish grey scale.
    slate: {
      0: deepseekColor.neutral[0], // white
      10: deepseekColor.neutral[50], // #f9fafb alt surface
      20: deepseekColor.neutral[200], // #e1e5ee border
      60: deepseekColor.neutral[700], // #61666b secondary text
      80: deepseekColor.neutral[800], // #353638 strong text
      90: deepseekColor.neutral[1000] // #0f1115 primary text / darkest
    },
    feedback: {
      success: deepseekColor.system.success,
      warning: deepseekColor.system.warning,
      error: deepseekColor.system.error,
      info: deepseekColor.system.info
    }
  },
  // DeepSeek UI ships Inter as the single sans family (UI + headings), with the
  // system monospace stack for code. Font *names* only, never binaries.
  font: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    display: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base for
  // component-grid fidelity; DeepSeek uses a Tailwind 4px grid).
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
  // DeepSeek aesthetic is generously ROUNDED & soft. Controls/inputs carry a
  // ~10px radius, cards 12px, the chat composer & chips read as pills. Measured
  // border-radius values on deepseek.com: 6/8/10/12/16px + 9999px (full).
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.625rem", // 10px — button / input (DeepSeek's common control radius)
    lg: "0.75rem", // 12px — cards / panels
    pill: "9999px" // chat composer / chips / pill buttons
  },
  // DeepSeek elevation: soft, low-opacity neutral shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(15 17 21 / 0.06), 0 1px 3px rgb(15 17 21 / 0.10)",
    medium: "0 2px 8px rgb(15 17 21 / 0.08), 0 4px 12px rgb(15 17 21 / 0.10)",
    floating: "0 8px 24px rgb(15 17 21 / 0.12), 0 12px 32px rgb(15 17 21 / 0.14)"
  },
  // Motion kept aligned with the Sentropic base; DeepSeek uses brisk, soft
  // transitions (exact curves "à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not DeepSeek-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (DeepSeek) ---------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // DeepSeek control density: compact, rounded controls. Default (md) ≈ 36px,
  // sm ≈ 32px, lg ≈ 44px (measured control heights 2 / 2.25 / 2.5rem).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "2.75rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" }
  },
  // DeepSeek typography: Inter throughout. UI/labels at medium 500, body/fields
  // at regular 400. Letter-spacing left at default (Inter ships its own metrics).
  typography: {
    control: { family: "Inter, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Inter, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Inter, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // DeepSeek links read as brand-blue text, underlined on hover (not at rest).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // à confirmer (DeepSeek dims disabled controls)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // DeepSeek FOCUS = a soft ring in brand blue around the box (the inputs flip
  // their border to brand blue + a light ring on focus). Encoded as "ring".
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: deepseekColor.brand[500], // #3964fe brand blue
    inset: "0"
  },
  // DeepSeek form fields are BOXED & ROUNDED (outline): a (near-)white fill with
  // a 1px cool-grey border and the ~10px control radius. The main chat composer
  // (`--dsw-specific-input-major`, light) is white #ffffff; auxiliary login
  // inputs use the #f9fafb subtle fill (documented in MAPPING.md). `style:
  // "outline"` draws four equal borders from `surface.default` + `border.subtle`;
  // the focus ring (above) tints the border DeepSeek blue on focus.
  field: {
    style: "outline",
    fillBg: deepseekColor.neutral[0], // #ffffff (main composer input)
    underlineColor: deepseekColor.neutral[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in DeepSeek brand blue with a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%233964fe' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // DeepSeek card / panel: a 1px cool-grey outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: deepseekColor.neutral[50] // #f9fafb
  },
  // DeepSeek secondary / default button = a subtle grey fill, no visible border,
  // slightly darker grey on hover.
  buttonSecondary: {
    background: deepseekColor.neutral[50], // #f9fafb
    border: "transparent",
    hoverBackground: deepseekColor.neutral[75] // #f1f3f5
  },
  // DeepSeek tabs: active tab = brand-blue label with a 2px bottom indicator (à confirmer).
  tabs: {
    activeText: deepseekColor.brand[500], // #3964fe
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // DeepSeek pagination: borderless brand-blue links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: deepseekColor.brand[500], // #3964fe link text
    activeBackground: deepseekColor.brand[500], // #3964fe filled active page
    activeText: deepseekColor.neutral[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // DeepSeek breadcrumb: brand-blue links, dark current page, cool-grey separators.
  breadcrumb: {
    linkText: deepseekColor.brand[500], // #3964fe
    text: deepseekColor.neutral[700], // #61666b trail text
    currentText: deepseekColor.neutral[1000], // #0f1115 current page
    separator: deepseekColor.neutral[500], // #979da6
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // DeepSeek banner / notice: a coloured LEFT accent filet on a soft box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // DeepSeek accordion / expansion: a dark medium summary trigger.
  accordion: {
    text: deepseekColor.neutral[1000], // #0f1115 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // DeepSeek chip / tag: a pill-rounded cool-grey chip.
  tag: {
    radius: "9999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.75rem", // 28px
    neutralBackground: deepseekColor.neutral[75], // #f1f3f5
    neutralText: deepseekColor.neutral[800] // #353638
  },
  // DeepSeek badge: a small rounded filled badge in brand blue.
  badge: {
    radius: "9999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: deepseekColor.brand[500], // #3964fe
    infoText: deepseekColor.neutral[0] // white
  },
  // DeepSeek checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: deepseekColor.neutral[1000] // #0f1115
  },
  // DeepSeek search / composer input.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // DeepSeek toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: deepseekColor.neutral[1000] // #0f1115
  }
} as const;

// --- semantic (DeepSeek role mapping, light mode) ---------------------------
const semantic = {
  surface: {
    default: deepseekColor.neutral[0], // white (bg-base light)
    subtle: deepseekColor.neutral[75], // #f1f3f5 hover-solid / subtle surface
    raised: deepseekColor.neutral[0], // white (bg-layer light)
    inverse: deepseekColor.neutral[950], // #151517 dark canvas (bg-base dark)
    overlay: "rgb(15 17 21 / 0.5)" // modal backdrop (bg-mask, dark navy tint)
  },
  text: {
    primary: deepseekColor.neutral[1000], // #0f1115 label-primary (light)
    secondary: deepseekColor.neutral[700], // #61666b label-secondary
    muted: deepseekColor.neutral[600], // #81858c label-tertiary / caption
    inverse: deepseekColor.neutral[0], // white on dark / coloured surfaces
    link: deepseekColor.brand[500] // #3964fe brand-blue link
  },
  border: {
    subtle: deepseekColor.neutral[200], // #e1e5ee default border
    strong: deepseekColor.neutral[300], // #cfd3d6 stronger border
    interactive: deepseekColor.brand[500] // #3964fe focus / interactive
  },
  action: {
    primary: deepseekColor.brand[500], // #3964fe brand-primary (light action)
    primaryHover: deepseekColor.brand[450], // #5686fe button-primary-hover (light)
    primaryText: deepseekColor.neutral[0], // white text on blue
    secondary: deepseekColor.neutral[50], // #f9fafb subtle secondary fill
    secondaryHover: deepseekColor.neutral[75], // #f1f3f5
    secondaryText: deepseekColor.brand[500], // #3964fe brand-blue secondary label
    danger: deepseekColor.system.error // #ec1313
  },
  feedback: {
    success: deepseekColor.system.success,
    warning: deepseekColor.system.warning,
    error: deepseekColor.system.error,
    info: deepseekColor.system.info
  },
  status: {
    pending: deepseekColor.system.warning,
    processing: deepseekColor.system.info,
    completed: deepseekColor.system.success,
    failed: deepseekColor.system.error
  },
  // Categorical data-vis palette built from the DeepSeek brand blue plus the
  // system tones. DeepSeek publishes no 8-colour sequential data-vis scale, so
  // this is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: deepseekColor.brand[500], // #3964fe brand blue
    category2: deepseekColor.brand[400], // #679efe lighter brand blue
    category3: deepseekColor.system.success, // #22c55e green
    category4: deepseekColor.system.warning, // #dd8629 amber
    category5: deepseekColor.system.error, // #ec1313 red
    category6: deepseekColor.brand[600], // #4868b2 muted navy
    category7: deepseekColor.brand[450], // #5686fe brand blue (mid)
    category8: deepseekColor.neutral[600] // #81858c neutral
  }
} as const;

/**
 * The DeepSeek theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry DeepSeek-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the DeepSeek brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const deepseekTheme: TenantTheme = {
  id: "deepseek",
  label: "DeepSeek",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default deepseekTheme;
