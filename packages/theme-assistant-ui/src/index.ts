import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * assistant-ui theme for the Sentropic token structure.
 *
 * assistant-ui (https://www.assistant-ui.com,
 * https://github.com/assistant-ui/assistant-ui) is an open-source chat UI
 * library built on shadcn/ui + Radix + Tailwind. Its default theme is the
 * shadcn "zinc" base (Tailwind v4 oklch tokens): an almost-neutral, slightly
 * cool grey scale with a near-black zinc PRIMARY, a single red destructive
 * accent, and the Geist typeface. Because assistant-ui is open source, the
 * values below are MEASURED from its public CSS (`templates/default/app/
 * globals.css` and `apps/registry/app/globals.css`) and converted from oklch to
 * sRGB hex. We only reference the font *names* (Geist, Geist Mono), never the
 * binaries. Sources + per-token provenance live in MAPPING.md. Where shadcn
 * publishes no direct token for a Sentropic role (success/warning/info, an
 * accent hue, the 6th-8th data-vis categories), the closest Tailwind value is
 * used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * assistant-ui / shadcn-zinc colour reference (light theme, oklch → hex):
 *   --background / --card / --popover  oklch(1 0 0)               #ffffff
 *   --foreground                       oklch(0.141 0.005 285.823) #09090b  (zinc-950)
 *   --primary                          oklch(0.21 0.006 285.885)  #18181b  (zinc-900, "primary sombre")
 *   --primary-foreground               oklch(0.985 0 0)           #fafafa  (zinc-50)
 *   --secondary/--muted/--accent       oklch(0.967 0.001 286.375) #f4f4f5  (zinc-100)
 *   --muted-foreground                 oklch(0.552 0.016 285.938) #71717b  (zinc-500)
 *   --border / --input                 oklch(0.92 0.004 286.32)   #e4e4e7  (zinc-200)
 *   --ring                             oklch(0.705 0.015 286.067) #9f9fa9  (zinc-400)
 *   --destructive                      oklch(0.577 0.245 27.325)  #e7000b  (red-600)
 *   --chart-1                          oklch(0.646 0.222 41.116)  #f54900  (orange-600)
 *   --chart-2                          oklch(0.6 0.118 184.704)   #009689  (teal-600)
 *   --chart-3                          oklch(0.398 0.07 227.392)  #104e64  (cyan-900)
 *   --chart-4                          oklch(0.828 0.189 84.429)  #ffb900  (amber-400)
 *   --chart-5                          oklch(0.769 0.188 70.08)   #fe9a00  (amber-500)
 *   --radius                           0.625rem (10px)
 *   (dark surfaces, for inverse: zinc-800 #27272a, zinc-950 #09090b)
 */

// --- assistant-ui / shadcn-zinc raw colour palette (measured from globals.css) ---
const assistantUiColor = {
  // The "brand / action" family is the near-black zinc PRIMARY (monochrome).
  zinc: {
    50: "#fafafa", // --primary-foreground oklch(0.985 0 0)
    100: "#f4f4f5", // --secondary/--muted/--accent oklch(0.967 0.001 286.375)
    200: "#e4e4e7", // --border/--input oklch(0.92 0.004 286.32)
    400: "#9f9fa9", // --ring oklch(0.705 0.015 286.067)
    500: "#71717b", // --muted-foreground oklch(0.552 0.016 285.938)
    800: "#27272a", // dark --secondary/--muted oklch(0.274 0.006 286.033)
    900: "#18181b", // --primary oklch(0.21 0.006 285.885) — primary sombre
    950: "#09090b" // --foreground oklch(0.141 0.005 285.823)
  },
  // The single chromatic accent shadcn ships: the destructive red.
  red: {
    main: "#e7000b", // --destructive oklch(0.577 0.245 27.325) — red-600
    50: "#fef2f2" // red-50 light tint (Tailwind v4, derived — à confirmer)
  },
  // chart-* data-vis stops (measured from --chart-1..5).
  chart: {
    1: "#f54900", // --chart-1 orange-600
    2: "#009689", // --chart-2 teal-600
    3: "#104e64", // --chart-3 cyan-900 (dark teal-blue)
    4: "#ffb900", // --chart-4 amber-400
    5: "#fe9a00" // --chart-5 amber-500
  },
  // Status colours. shadcn ships NO success/warning/info token; these are the
  // closest Tailwind v4 values, AA-checked on white (see MAPPING.md "à confirmer").
  system: {
    success: "#00a63e", // Tailwind v4 green-600 (à confirmer — no shadcn token)
    warning: "#e17100", // Tailwind v4 amber-600, darkened for AA (à confirmer)
    error: "#e7000b", // --destructive (measured)
    info: "#155dfc" // Tailwind v4 blue-600 (à confirmer — no shadcn token)
  }
} as const;

// --- foundation (assistant-ui / shadcn-zinc specific values) ----------------
const foundation = {
  color: {
    // Sentropic "blue" action-family slot mapped onto the monochrome zinc
    // primary (assistant-ui has no chromatic brand colour — the action colour
    // IS the near-black zinc).
    blue: {
      10: assistantUiColor.zinc[100], // light zinc fill / selected tint
      60: assistantUiColor.zinc[900], // #18181b primary action (primary sombre)
      80: assistantUiColor.zinc[950] // #09090b darker interactive
    },
    // shadcn has no cyan; the nearest chromatic accent in the palette is the
    // chart-2 teal, so the Sentropic "cyan" accent slot maps to that teal.
    cyan: {
      10: "#d4f4ef", // light teal tint around chart-2 (derived — à confirmer)
      50: assistantUiColor.chart[2], // #009689 teal accent (chart-2)
      70: assistantUiColor.chart[3] // #104e64 darker cyan (chart-3)
    },
    // Sentropic "slate" neutral family mapped onto the zinc grey scale.
    slate: {
      0: "#ffffff", // --background
      10: assistantUiColor.zinc[100], // #f4f4f5 subtle surface
      20: assistantUiColor.zinc[200], // #e4e4e7 borders
      60: assistantUiColor.zinc[500], // #71717b secondary text
      80: assistantUiColor.zinc[800], // #27272a strong / dark surface
      90: assistantUiColor.zinc[950] // #09090b primary text / darkest
    },
    feedback: {
      success: assistantUiColor.system.success,
      warning: assistantUiColor.system.warning,
      error: assistantUiColor.system.error,
      info: assistantUiColor.system.info
    }
  },
  // assistant-ui ships Geist (sans, display, buttons, labels) and Geist Mono
  // (code). Font *names* only, never binaries.
  font: {
    sans: "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Geist Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Tailwind 4px-based rem spacing scale (assistant-ui is Tailwind-built).
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
  // shadcn radius scale derived from `--radius: 0.625rem` (10px):
  // sm = radius-4px (6px), md = radius-2px (8px), lg = radius (10px),
  // xl = radius+4px (14px). Controls/inputs use rounded-md (8px); cards
  // rounded-xl (14px); badges/avatars rounded-full.
  radius: {
    none: "0",
    sm: "0.375rem", // 6px (--radius-sm)
    md: "0.5rem", // 8px (--radius-md) — button / input / tabs
    lg: "0.625rem", // 10px (--radius / --radius-lg) — cards/popovers
    pill: "9999px" // rounded-full chips / avatars
  },
  // Tailwind default shadow scale (assistant-ui uses shadow-xs/sm/md). Exact
  // utilities "à confirmer".
  shadow: {
    subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    medium: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    floating: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  },
  // Tailwind default motion durations / ease-in-out easing ("à confirmer").
  motion: {
    fast: "100ms",
    normal: "150ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not assistant-ui-specific; kept aligned with Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (assistant-ui / shadcn) --------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // shadcn control density: button sm = h-8 (32px), default = h-9 (36px),
  // lg = h-10 (40px); inputs h-9 (36px); all text-sm (14px). Generous
  // horizontal padding (px-3 / px-4 / px-6).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" }
  },
  // Geist everywhere. Buttons/labels = medium (500); body/fields = regular (400).
  typography: {
    control: { family: "'Geist', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Geist', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Geist', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // shadcn link button: not underlined at rest, underline on hover (offset-4).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // shadcn disabled = disabled:opacity-50
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // shadcn icons size-4 (16px) default
  // shadcn FOCUS = a soft box-shadow RING in the neutral `--ring` zinc-400
  // (focus-visible:ring-[3px] ring-ring/50), not a native offset outline.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "0",
    color: assistantUiColor.zinc[400], // #9f9fa9 --ring (rendered at ~50% opacity)
    inset: "0"
  },
  // shadcn form fields are BOXED & rounded (outline): white fill, 1px zinc-200
  // border, rounded-md (8px). `style: "outline"` draws four equal borders from
  // `surface.default` + `border.subtle`; the focus ring tints the border.
  field: {
    style: "outline",
    fillBg: "#ffffff", // --background
    underlineColor: assistantUiColor.zinc[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in muted-foreground zinc-500.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2371717b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2rem"
  },
  // shadcn card: 1px zinc-200 outline + rounded-xl, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: assistantUiColor.zinc[100] // #f4f4f5
  },
  // shadcn "outline" button = transparent/white fill, zinc-200 border, accent
  // (zinc-100) fill on hover.
  buttonSecondary: {
    background: "#ffffff",
    border: assistantUiColor.zinc[200], // #e4e4e7
    hoverBackground: assistantUiColor.zinc[100] // #f4f4f5 accent on hover
  },
  // shadcn tabs: muted track, active trigger = white pill with foreground text
  // (a filled background indicator, not a bottom border underline).
  tabs: {
    activeText: assistantUiColor.zinc[900], // #18181b foreground/primary
    activeBackground: "#ffffff",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "background" // active state is a filled white pill, not a filet
  },
  // shadcn pagination: ghost links; active page = bordered (outline) box.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: assistantUiColor.zinc[900], // #18181b
    activeBackground: "#ffffff", // active = outline variant (white + border)
    activeText: assistantUiColor.zinc[900], // #18181b
    activeBorderWidth: "1px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px (h-9)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // shadcn breadcrumb: muted-foreground links, foreground current page.
  breadcrumb: {
    linkText: assistantUiColor.zinc[500], // #71717b muted-foreground
    text: assistantUiColor.zinc[500], // #71717b trail
    currentText: assistantUiColor.zinc[950], // #09090b foreground current page
    separator: assistantUiColor.zinc[400], // #9f9fa9
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "400" // BreadcrumbPage = font-normal text-foreground
  },
  // shadcn alert: a full rounded-lg bordered box (border + bg-card), coloured
  // text/border per variant — NOT a left-accent filet.
  alert: {
    background: "#ffffff",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0", // no coloured left filet; shadcn alerts are full-border boxes
    paddingTop: "0.75rem", // 12px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.75rem", // 12px
    paddingLeft: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // shadcn accordion: a foreground medium summary trigger.
  accordion: {
    text: assistantUiColor.zinc[950], // #09090b summary label
    paddingBlock: "1rem", // 16px (py-4)
    paddingInline: "0", // accordion trigger is flush
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // font-medium
    lineHeight: "1.25rem" // 20px
  },
  // shadcn badge (secondary): pill-rounded zinc chip.
  tag: {
    radius: "9999px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px (text-xs)
    fontWeight: "500", // font-medium
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: assistantUiColor.zinc[100], // #f4f4f5 secondary
    neutralText: assistantUiColor.zinc[900] // #18181b secondary-foreground
  },
  // shadcn badge (default): small rounded-md filled badge.
  badge: {
    radius: "9999px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: assistantUiColor.zinc[900], // #18181b primary
    infoText: assistantUiColor.zinc[50] // #fafafa primary-foreground
  },
  // shadcn checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: assistantUiColor.zinc[950] // #09090b foreground
  },
  // shadcn search/input.
  search: {
    paddingBlock: "0.25rem", // 4px (py-1)
    paddingInline: "0.75rem", // 12px (px-3)
    fontSize: "0.875rem", // 14px (md:text-sm)
    lineHeight: "1.25rem" // 20px
  },
  // shadcn switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: assistantUiColor.zinc[950] // #09090b foreground
  }
} as const;

// --- semantic (assistant-ui / shadcn role mapping) --------------------------
const semantic = {
  surface: {
    default: "#ffffff", // --background
    subtle: assistantUiColor.zinc[100], // #f4f4f5 --muted/--secondary (subtle bg / hover)
    raised: "#ffffff", // --card
    inverse: assistantUiColor.zinc[900], // #18181b dark zinc inverse surface
    overlay: "rgb(9 9 11 / 0.6)" // modal backdrop (zinc-950 tint)
  },
  text: {
    primary: assistantUiColor.zinc[950], // #09090b --foreground
    secondary: assistantUiColor.zinc[500], // #71717b --muted-foreground
    muted: assistantUiColor.zinc[400], // #9f9fa9 placeholder / disabled text
    inverse: assistantUiColor.zinc[50], // #fafafa on dark / primary surfaces
    link: assistantUiColor.zinc[900] // #18181b primary-coloured link
  },
  border: {
    subtle: assistantUiColor.zinc[200], // #e4e4e7 --border
    strong: assistantUiColor.zinc[400], // #9f9fa9 stronger border
    interactive: assistantUiColor.zinc[400] // #9f9fa9 --ring focus/interactive
  },
  action: {
    primary: assistantUiColor.zinc[900], // #18181b --primary (primary sombre)
    primaryHover: assistantUiColor.zinc[800], // #27272a primary/90 hover effect
    primaryText: assistantUiColor.zinc[50], // #fafafa --primary-foreground
    secondary: assistantUiColor.zinc[100], // #f4f4f5 --secondary
    secondaryHover: assistantUiColor.zinc[200], // #e4e4e7 secondary/80
    secondaryText: assistantUiColor.zinc[900], // #18181b --secondary-foreground
    danger: assistantUiColor.system.error // #e7000b --destructive
  },
  feedback: {
    success: assistantUiColor.system.success,
    warning: assistantUiColor.system.warning,
    error: assistantUiColor.system.error,
    info: assistantUiColor.system.info
  },
  status: {
    pending: assistantUiColor.system.warning,
    processing: assistantUiColor.system.info,
    completed: assistantUiColor.system.success,
    failed: assistantUiColor.system.error
  },
  // Categorical data-vis palette from the shadcn --chart-1..5 tokens (measured).
  // shadcn ships only 5 chart colours, so categories 6-8 extend with the zinc
  // primary, muted-foreground and destructive (see MAPPING.md, "à confirmer").
  data: {
    category1: assistantUiColor.chart[1], // #f54900 chart-1 (orange)
    category2: assistantUiColor.chart[2], // #009689 chart-2 (teal)
    category3: assistantUiColor.chart[3], // #104e64 chart-3 (cyan)
    category4: assistantUiColor.chart[4], // #ffb900 chart-4 (amber)
    category5: assistantUiColor.chart[5], // #fe9a00 chart-5 (amber)
    category6: assistantUiColor.zinc[900], // #18181b zinc primary (à confirmer)
    category7: assistantUiColor.zinc[500], // #71717b muted-foreground (à confirmer)
    category8: assistantUiColor.red.main // #e7000b destructive (à confirmer)
  }
} as const;

/**
 * The assistant-ui theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry the measured shadcn-zinc values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the assistant-ui look reaches every component
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const assistantUiTheme: TenantTheme = {
  id: "assistant-ui",
  label: "assistant-ui",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default assistantUiTheme;
