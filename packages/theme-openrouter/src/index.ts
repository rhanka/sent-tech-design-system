import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * OpenRouter theme for the Sentropic token structure.
 *
 * All values below are MEASURED from the PUBLIC CSS of openrouter.ai (computed
 * styles + the site's design tokens). OpenRouter ships a shadcn/ui surface built
 * on the Tailwind "zinc" neutral scale, a Radix UI colour spectrum (loaded as
 * `--<hue>-N` custom properties on :root), an indigo `--primary`
 * (HSL 239 84% 67% = #6366f1, used for the progress bar / accents), and a
 * near-black ("ink") primary call-to-action button (#101012 / zinc-900). Type is
 * Inter (body + headings), with the brand "Lumen Sans" display face used in the
 * top navigation and "Geist Mono" (@font-face GeistMono) for monospace. We only
 * reference font *names* here, never the binaries. Sources + provenance live in
 * MAPPING.md; any value with no directly measured token is marked "à confirmer".
 *
 * OpenRouter colour reference (measured, light surface + dark chrome):
 *   White (surface default)             #ffffff   (body background)
 *   Zinc 100 (subtle surface / hover)   #f4f4f5   (à confirmer — standard zinc)
 *   Zinc 200 (default border)           #e4e4e7   (--border 240 5.9% 90%)
 *   Zinc 400 (focus ring / placeholder) #a1a1aa   (--ring 240 5% 64.9%)
 *   Zinc 500 (secondary / muted text)   #71717a   (--muted-foreground 240 3.8% 46.1%)
 *   Zinc 900 (primary text / ink CTA)   #18181b   (H1 colour rgb(24,24,27))
 *   Zinc 950 (body foreground / black)  #09090b   (body colour rgb(9,9,11))
 *   Brand ink (dark chrome / button)    #101012   (rgb(16,16,18) — nav + CTA bg)
 *   Indigo primary (--primary)          #6366f1   (HSL 239 84% 67%)
 *   Indigo hover                        #4f46e5   (à confirmer — indigo 600)
 *   Indigo light fill                   #eef2ff   (à confirmer — indigo 50)
 *   Teal accent (Radix teal 9)          #12a594
 *   Radix blue 9 / red 9 / green 9 …    (data-vis spectrum, measured on :root)
 */

// --- OpenRouter raw colour palette (measured public CSS) --------------------
const openrouterColor = {
  // Tailwind "zinc" neutral scale — the shadcn surface OpenRouter ships.
  zinc: {
    0: "#ffffff", // white — surface default / card / body background
    50: "#fafafa", // zinc 50 — lightest surface tint (à confirmer)
    100: "#f4f4f5", // zinc 100 — subtle surface / hover fill (à confirmer)
    200: "#e4e4e7", // --border (240 5.9% 90%) — default border / card outline
    400: "#a1a1aa", // --ring (240 5% 64.9%) — focus ring / placeholder
    500: "#71717a", // --muted-foreground (240 3.8% 46.1%) — secondary / muted text
    700: "#3f3f46", // zinc 700 — strong border / tertiary surface (à confirmer)
    900: "#18181b", // zinc 900 — primary text / ink CTA (measured H1)
    950: "#09090b" // zinc 950 — body foreground / deepest black (measured body)
  },
  // Brand "ink" — the near-black used for the dark chrome (top nav) and the
  // primary marketing call-to-action button.
  ink: "#101012", // rgb(16,16,18) — measured nav + CTA background
  // Indigo — OpenRouter's `--primary` design token (progress bar, accents, focus
  // emphasis, link / interactive). HSL 239 84% 67% resolves to #6366f1.
  indigo: {
    primary: "#6366f1", // --primary
    hover: "#4f46e5", // indigo 600 — darker hover (à confirmer)
    light: "#eef2ff" // indigo 50 — light fill / selected tint (à confirmer)
  },
  // Radix UI teal — the signature non-blue accent (mapped to the "cyan" slot).
  teal: {
    main: "#12a594", // Radix --teal-9
    light: "#e0f8f3", // Radix --teal-3 (light tint)
    dark: "#008573" // Radix --teal-11 (AA text)
  },
  // Radix UI accent "9" solids (measured on :root) — the data-vis spectrum.
  radix: {
    blue: "#0090ff", // --blue-9
    green: "#30a46c", // --green-9
    orange: "#f76b15", // --orange-9
    red: "#e5484d", // --red-9
    purple: "#8e4ec6", // --purple-9
    pink: "#d6409f" // --pink-9
  },
  // System / status colours — Radix "11" steps (designed for AA text on white).
  system: {
    success: "#218358", // Radix --green-11
    warning: "#ab6400", // Radix --amber-11
    error: "#ce2c31", // Radix --red-11
    info: "#0d74ce", // Radix --blue-11
    danger: "#e5484d" // Radix --red-9 (destructive solid fill)
  }
} as const;

// --- foundation (OpenRouter-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto OpenRouter's indigo `--primary`.
    blue: {
      10: openrouterColor.indigo.light, // indigo 50 light fill (à confirmer)
      60: openrouterColor.indigo.primary, // #6366f1 --primary
      80: openrouterColor.indigo.hover // indigo 600 (à confirmer)
    },
    // OpenRouter has no cyan; the signature non-blue accent is Radix teal.
    cyan: {
      10: openrouterColor.teal.light, // #e0f8f3 Radix teal 3
      50: openrouterColor.teal.main, // #12a594 Radix teal 9
      70: openrouterColor.teal.dark // #008573 Radix teal 11
    },
    // Sentropic "slate" role family mapped onto the Tailwind zinc scale.
    slate: {
      0: openrouterColor.zinc[0], // white
      10: openrouterColor.zinc[100], // subtle surface (à confirmer)
      20: openrouterColor.zinc[200], // #e4e4e7 default border
      60: openrouterColor.zinc[500], // #71717a muted text
      80: openrouterColor.zinc[700], // #3f3f46 strong (à confirmer)
      90: openrouterColor.zinc[900] // #18181b primary text
    },
    feedback: {
      success: openrouterColor.system.success,
      warning: openrouterColor.system.warning,
      error: openrouterColor.system.error,
      info: openrouterColor.system.info
    }
  },
  // OpenRouter ships Inter (body + headings), the brand "Lumen Sans" display face
  // (top navigation), and "Geist Mono" (@font-face GeistMono) for monospace.
  // Font *names* only, never binaries.
  font: {
    sans: "Inter, 'Inter Fallback', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    display: "'Lumen Sans', Inter, 'Inter Fallback', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'Geist Mono', GeistMono, ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (Tailwind grid; aligned with the
  // Sentropic base for component-grid fidelity).
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
  // shadcn rounding: `--radius` = 0.5rem (8px). Controls/buttons read ~4-6px,
  // cards 12px (measured), pills 999px.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — buttons / chips (measured 4px)
    md: "0.5rem", // 8px — --radius base (inputs / controls)
    lg: "0.75rem", // 12px — cards (measured 12px)
    pill: "999px" // pills / rounded-full (measured "Sign in" pill)
  },
  // shadcn elevation: soft, neutral, low-opacity shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px 0 rgb(9 9 11 / 0.05)",
    medium: "0 4px 6px -1px rgb(9 9 11 / 0.10), 0 2px 4px -2px rgb(9 9 11 / 0.10)",
    floating: "0 10px 15px -3px rgb(9 9 11 / 0.10), 0 4px 6px -4px rgb(9 9 11 / 0.10)"
  },
  // Tailwind/shadcn motion durations + standard easing (à confirmer — aligned
  // with the Sentropic base).
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not OpenRouter-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (OpenRouter) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // measured ~0.6-1px borders
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // shadcn control density: button default h-9 (36px), sm h-8 (32px), lg h-10
  // (40px); text-sm (14px) medium labels with px-4 padding.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }
  },
  // OpenRouter typography: Inter everywhere, with a slight negative tracking on
  // headings/controls (measured H1 letter-spacing -1.5px, H2/H3 -0.5px).
  typography: {
    control: { family: "Inter, 'Inter Fallback', sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "-0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Inter, 'Inter Fallback', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Inter, 'Inter Fallback', sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // shadcn links are NOT underlined at rest; underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // shadcn disabled = opacity-50
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // shadcn FOCUS = a soft box-shadow RING. OpenRouter's `--ring` is the neutral
  // zinc 400 (#a1a1aa), the minimal/monochrome focus technique, not a coloured
  // outline.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: openrouterColor.zinc[400], // #a1a1aa measured --ring
    inset: "0"
  },
  // shadcn form fields are BOXED & ROUNDED (outline): white fill, 1px zinc 200
  // border, the 8px control radius. `style: "outline"` draws four equal borders
  // from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: openrouterColor.zinc[0], // #ffffff
    underlineColor: openrouterColor.zinc[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in zinc 500 with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2371717a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // shadcn card: a 1px zinc 200 outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: openrouterColor.zinc[100] // #f4f4f5
  },
  // shadcn "outline" button = transparent fill, zinc 200 border + ink text,
  // subtle zinc 100 fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: openrouterColor.zinc[200], // #e4e4e7 stroke
    hoverBackground: openrouterColor.zinc[100] // #f4f4f5 light fill on hover
  },
  // shadcn tabs = a segmented control: active tab = white raised pill on a zinc
  // 100 track, ink label.
  tabs: {
    activeText: openrouterColor.zinc[900], // #18181b
    activeBackground: openrouterColor.zinc[0], // #ffffff raised pill
    inactiveBackground: openrouterColor.zinc[100], // #f4f4f5 track
    activeWeight: "500",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "background" // segmented background, not a bottom border
  },
  // OpenRouter pagination: borderless ink text links; active page = filled ink.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: openrouterColor.zinc[900], // #18181b
    activeBackground: openrouterColor.zinc[900], // #18181b filled active page
    activeText: openrouterColor.zinc[0], // white on ink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // OpenRouter breadcrumb: muted trail, ink current page, zinc separators.
  breadcrumb: {
    linkText: openrouterColor.zinc[500], // #71717a
    text: openrouterColor.zinc[500], // #71717a trail text
    currentText: openrouterColor.zinc[900], // #18181b current page
    separator: openrouterColor.zinc[400], // #a1a1aa
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // shadcn alert: a 1px zinc outline box with the indigo accent filet.
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
  // shadcn accordion: a dark medium summary trigger.
  accordion: {
    text: openrouterColor.zinc[900], // #18181b
    paddingBlock: "1rem", // 16px
    paddingInline: "0", // shadcn accordion has no inline padding on the trigger
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // shadcn badge/chip: a small rounded zinc chip.
  tag: {
    radius: "8px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.5rem", // 24px
    neutralBackground: openrouterColor.zinc[100], // #f4f4f5
    neutralText: openrouterColor.zinc[900] // #18181b
  },
  // shadcn badge: a small 6px-radius filled badge (indigo primary).
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: openrouterColor.indigo.primary, // #6366f1
    infoText: openrouterColor.zinc[0] // white
  },
  // OpenRouter checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: openrouterColor.zinc[900] // #18181b
  },
  // OpenRouter search input (⌘K trigger).
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // OpenRouter toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: openrouterColor.zinc[900] // #18181b
  }
} as const;

// --- semantic (OpenRouter-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: openrouterColor.zinc[0], // white
    subtle: openrouterColor.zinc[100], // #f4f4f5 subtle / hover fill
    raised: openrouterColor.zinc[0], // white
    inverse: openrouterColor.zinc[950], // #09090b deepest black (dark chrome)
    overlay: "rgb(9 9 11 / 0.6)" // modal backdrop (zinc 950 tint)
  },
  text: {
    primary: openrouterColor.zinc[900], // #18181b primary text (measured H1)
    secondary: openrouterColor.zinc[500], // #71717a secondary / muted-foreground
    muted: openrouterColor.zinc[400], // #a1a1aa placeholder / disabled text
    inverse: openrouterColor.zinc[0], // white on dark / coloured surfaces
    link: openrouterColor.indigo.primary // #6366f1 indigo interactive link
  },
  border: {
    subtle: openrouterColor.zinc[200], // #e4e4e7 default border
    strong: openrouterColor.zinc[400], // #a1a1aa stronger border
    interactive: openrouterColor.indigo.primary // #6366f1 interactive emphasis
  },
  action: {
    primary: openrouterColor.zinc[900], // #18181b ink CTA (measured black button)
    primaryHover: openrouterColor.zinc[950], // #09090b darker hover
    primaryText: openrouterColor.zinc[0], // white text on ink
    secondary: openrouterColor.zinc[100], // #f4f4f5 secondary surface
    secondaryHover: openrouterColor.zinc[200], // #e4e4e7
    secondaryText: openrouterColor.zinc[900], // #18181b
    danger: openrouterColor.system.danger // #e5484d Radix red 9
  },
  feedback: {
    success: openrouterColor.system.success,
    warning: openrouterColor.system.warning,
    error: openrouterColor.system.error,
    info: openrouterColor.system.info
  },
  status: {
    pending: openrouterColor.system.warning,
    processing: openrouterColor.system.info,
    completed: openrouterColor.system.success,
    failed: openrouterColor.system.error
  },
  // Categorical data-vis palette built from OpenRouter's indigo `--primary` plus
  // the Radix UI accent "9" solids loaded on :root. OpenRouter does not publish
  // a single sequential data-vis scale, so this is a coherent proposal from the
  // measured Radix spectrum (see MAPPING.md, "à confirmer").
  data: {
    category1: openrouterColor.indigo.primary, // #6366f1 indigo --primary
    category2: openrouterColor.radix.blue, // #0090ff Radix blue 9
    category3: openrouterColor.teal.main, // #12a594 Radix teal 9
    category4: openrouterColor.radix.green, // #30a46c Radix green 9
    category5: openrouterColor.radix.orange, // #f76b15 Radix orange 9
    category6: openrouterColor.radix.red, // #e5484d Radix red 9
    category7: openrouterColor.radix.purple, // #8e4ec6 Radix purple 9
    category8: openrouterColor.radix.pink // #d6409f Radix pink 9
  }
} as const;

/**
 * The OpenRouter theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry OpenRouter-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the OpenRouter brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const openrouterTheme: TenantTheme = {
  id: "openrouter",
  label: "OpenRouter",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default openrouterTheme;
