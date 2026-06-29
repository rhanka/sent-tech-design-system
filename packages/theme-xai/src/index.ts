import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * xAI (Grok) theme for the Sentropic token structure.
 *
 * Every value below is MEASURED on xAI's PUBLIC website CSS: the design-token
 * custom properties shipped on x.ai (the `:root` / `.dark` Tailwind HSL palette —
 * `--color-jet`, `--color-ivory`, `--color-sunset`, `--accent`, `--background`,
 * `--foreground`, `--card`, `--border`, `--input`, `--success/--warning/--error`)
 * and cross-checked against grok.com. We only reference the font *names*
 * (universalSans / universalSansDisplay — xAI's brand typeface — Geist Mono, and
 * Vazirmatn as used on grok.com), never font binaries. Sources are documented in
 * MAPPING.md. Where xAI publishes no direct equivalent for a Sentropic role, the
 * closest measured token is used and the choice is noted "à confirmer".
 *
 * The xAI / Grok signature is an ultra-minimal, HIGH-CONTRAST MONOCHROME look on
 * a near-black stage: the surfaces are jet/charcoal/umbra blacks, text is a cool
 * off-white, the primary action button is pure WHITE (inverted) and the single
 * brand accent is a vivid "sunset" ORANGE used sparingly. This is a DARK-FIRST
 * clone (`mode: "dark"`), mapping x.ai's `.dark` palette onto the Sentropic
 * semantic layer (x.ai also ships a light/cream `:root`, kept for reference).
 *
 * x.ai colour reference (HSL tokens decoded to hex):
 *   Jet      (dark app background)   hsl(0 0% 4%)      #0a0a0a  (--color-jet / --background dark)
 *   Charcoal (card surface)          hsl(0 0% 10%)     #1a1a1a  (--color-charcoal / --card dark)
 *   Umbra    (subtle / hover / border)hsl(221 12% 14%) #1f2228  (--color-umbra / --border dark)
 *   Ink                              hsl(213 11% 16%)  #24282d  (--color-ink)
 *   Steel                            hsl(216 4% 22%)   #36383a  (--color-steel)
 *   Fog      (muted text / input br) hsl(216 4% 51%)   #7d8187  (--color-fog / --input dark)
 *   Pewter   (secondary text)        hsl(213 12% 70%)  #a9b2bc  (--color-pewter)
 *   Dove     (primary text dark)     hsl(222 19% 86%)  #d5d9e2  (--color-dove / --foreground dark)
 *   Ivory    (light cream surface)   hsl(40 18% 97%)   #f9f8f6  (--color-ivory / --card light)
 *   White    (primary action dark)   hsl(0 0% 100%)    #ffffff  (--color-white / --primary dark)
 *   Sunset   (brand accent)          hsl(22 100% 51.6%)#ff6308  (--color-sunset / --accent)
 *   Dawn     (accent hover, amber)   hsl(37 100% 76%)  #ffd085  (--color-dawn / --accent-hover)
 *   Breeze   (info / link blue)      hsl(214 48.9% 73.9%)#9cb8dd (--color-breeze / --info)
 *   Twilight (purple)                hsl(255 92% 76%)  #a689fa  (--color-twilight)
 *   Dusk     (purple)                hsl(263 70% 50.4%)#6c28d9  (--color-dusk)
 *   Success / warning / error (dark) hsl(142 69% 58%) / hsl(45 93% 58%) / hsl(0 72% 65%)
 *                                    #4ade80 / #f8c630 / #e66565  (--success/--warning/--error dark)
 */

// --- xAI raw colour palette (public x.ai `:root` / `.dark` tokens) ----------
const xaiColor = {
  // Monochrome blacks → off-white (the whole UI rides this neutral ramp).
  jet: "#0a0a0a", // --color-jet — dark app background / inverse ink
  charcoal: "#1a1a1a", // --color-charcoal — card surface on dark
  umbra: "#1f2228", // --color-umbra — subtle/hover surface, dark border, input fill
  ink: "#24282d", // --color-ink — deep neutral
  steel: "#36383a", // --color-steel — raised neutral / outline
  fog: "#7d8187", // --color-fog — muted text / input border (--input dark)
  pewter: "#a9b2bc", // --color-pewter — secondary text on dark
  dove: "#d5d9e2", // --color-dove — primary text on dark (--foreground dark)
  ivory: "#f9f8f6", // --color-ivory — warm cream light surface (--card light)
  white: "#ffffff", // --color-white — primary action on dark (--primary dark)
  // Brand accent — the single saturated hue in the system (used sparingly).
  sunset: "#ff6308", // --color-sunset / --accent — vivid brand orange
  dawn: "#ffd085", // --color-dawn / --accent-hover — light amber
  sunsetDark: "#cc4e06", // darker sunset for the accent-70 step (derived — à confirmer)
  // Cool chromatic accents (info / data-vis only — never structural).
  breeze: "#9cb8dd", // --color-breeze / --info — soft info blue / link
  terminalBlue: "#93adff", // --terminal-blue (dark) — interactive blue
  terminalBlueBright: "#2365d1", // --terminal-blue (light) — saturated blue
  twilight: "#a689fa", // --color-twilight — light purple
  dusk: "#6c28d9", // --color-dusk — purple
  // System / status colours — x.ai's measured DARK-mode values (lightened so the
  // text/icon reads on the near-black stage; these are the `.dark` --success/etc).
  system: {
    success: "#4ade80", // --success dark — hsl(142 69% 58%)
    warning: "#f8c630", // --warning dark — hsl(45 93% 58%)
    error: "#e66565", // --error dark — hsl(0 72% 65%)
    info: "#9cb8dd" // --info — breeze
  }
} as const;

// --- foundation (xAI-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto xAI's cool info/interactive blue
    // (breeze / terminal-blue). xAI is monochrome-interactive, so blue is reserved
    // for info, links and data-vis — never for the primary action.
    blue: {
      10: xaiColor.breeze, // #9cb8dd lightest info blue
      60: xaiColor.terminalBlue, // #93adff interactive / link blue (dark)
      80: xaiColor.terminalBlueBright // #2365d1 darker saturated blue
    },
    // xAI has no "cyan"; the signature non-neutral accent is the sunset ORANGE,
    // so the Sentropic "cyan" accent slot maps onto the xAI sunset family.
    cyan: {
      10: xaiColor.dawn, // #ffd085 light amber (accent hover)
      50: xaiColor.sunset, // #ff6308 sunset orange accent
      70: xaiColor.sunsetDark // #cc4e06 darker sunset (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the xAI neutral ramp (light → dark).
    // The dark semantic layer pulls the blacks from the bottom of this ramp.
    slate: {
      0: xaiColor.white, // #ffffff
      10: xaiColor.ivory, // #f9f8f6 warm cream light surface
      20: xaiColor.dove, // #d5d9e2 light text / light border
      60: xaiColor.fog, // #7d8187 muted text / strong border
      80: xaiColor.charcoal, // #1a1a1a card surface on dark
      90: xaiColor.jet // #0a0a0a dark app background
    },
    feedback: {
      success: xaiColor.system.success,
      warning: xaiColor.system.warning,
      error: xaiColor.system.error,
      info: xaiColor.system.info
    }
  },
  // xAI ships "Universal Sans" (universalSans / universalSansDisplay — its custom
  // brand typeface) for UI/headings and "Geist Mono" for code; grok.com pairs the
  // UI with "Vazirmatn". Font *names* only, never binaries.
  font: {
    sans: "'universalSans', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'universalSansDisplay', 'universalSans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', GeistMono, 'SFMono-Regular', ui-monospace, Consolas, 'Liberation Mono', monospace"
  },
  // x.ai is built on a 4px-based rem scale (Tailwind). Aligned with the Sentropic
  // base for component-grid fidelity.
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
  // xAI aesthetic is GENEROUSLY ROUNDED: the base `--radius` is .5rem (8px) and
  // cards use 16px; chips and primary buttons read as pills (rounded-full).
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.75rem", // 12px — button / input / tabs (rounded controls)
    lg: "1rem", // 16px — cards (measured --radius: 16px)
    pill: "999px" // chips / pill buttons / the Grok prompt bar
  },
  // xAI dark elevation: soft, low-opacity black shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.40)",
    medium: "0 4px 12px rgb(0 0 0 / 0.50)",
    floating: "0 8px 30px rgb(0 0 0 / 0.60)"
  },
  // Motion is not strongly tokenised publicly; kept aligned with the Sentropic
  // base. x.ai uses ~90ms linear micro-transitions; normal/slow extrapolated
  // ("à confirmer").
  motion: {
    fast: "90ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not xAI-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (xAI / Grok) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // xAI control density: comfortable, pill-friendly. md targets ~40px with
  // generous horizontal padding; sm 32px, lg 48px.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.0625rem" }
  },
  // xAI typography: Universal Sans throughout; labels/controls medium (500),
  // body/fields regular (400).
  typography: {
    control: { family: "'universalSans', 'Vazirmatn', system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'universalSans', 'Vazirmatn', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'universalSans', 'Vazirmatn', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // xAI links are NOT underlined at rest (foreground / cool-blue text); the
    // underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // xAI dims disabled controls to ~50%
  transition: { property: "background-color, border-color, color, box-shadow", duration: "90ms", easing: "linear" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // xAI FOCUS = a soft box-shadow RING in the foreground (monochrome white) around
  // the box — the minimal, high-contrast xAI focus technique (not the orange
  // accent, which is reserved for highlights). Exact technique "à confirmer".
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: xaiColor.white, // #ffffff monochrome focus ring on dark
    inset: "0"
  },
  // xAI / Grok form fields are BOXED (outline): a recessed dark fill (umbra,
  // ≈ grok.com's #1e1f22 prompt bar) with a 1px border and the rounded control
  // radius. `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`; the focus ring (above) brightens the
  // border to white on focus.
  field: {
    style: "outline",
    fillBg: xaiColor.umbra, // #1f2228 recessed dark input (--input area on dark)
    underlineColor: xaiColor.fog, // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the off-white text colour, 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23d5d9e2' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // xAI card on dark = the charcoal surface with a subtle umbra hairline + 16px
  // radius; hover lifts to the umbra tint.
  card: {
    borderWidth: "1px",
    background: xaiColor.charcoal, // #1a1a1a card surface (--card dark)
    hoverBackground: xaiColor.umbra, // #1f2228
    lineHeight: "1.5"
  },
  // xAI secondary button = a minimal GHOST button: transparent fill, a 1px steel
  // outline + off-white text, with a subtle charcoal fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: xaiColor.steel, // #36383a outline
    hoverBackground: xaiColor.charcoal // #1a1a1a subtle fill on hover
  },
  // xAI tabs: active tab = off-white/white label with a bottom indicator bar
  // (monochrome), inactive tabs are muted grey.
  tabs: {
    activeText: xaiColor.white, // #ffffff
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // indicator on the bottom edge
    indicatorMode: "border" // a real bottom border (monochrome)
  },
  // xAI pagination: borderless muted links; active page = filled white with jet
  // text (mirrors the iconic inverted primary button).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: xaiColor.pewter, // #a9b2bc muted link text
    activeBackground: xaiColor.white, // #ffffff filled active page
    activeText: xaiColor.jet, // #0a0a0a jet on white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // xAI breadcrumb: muted grey links, off-white current page, fog separators.
  breadcrumb: {
    linkText: xaiColor.pewter, // #a9b2bc
    text: xaiColor.fog, // #7d8187 trail text
    currentText: xaiColor.dove, // #d5d9e2 current page
    separator: xaiColor.fog, // #7d8187
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // xAI callout / note = a TINTED dark panel (no border, no left filet): a subtle
  // charcoal fill, off-white text, generous padding.
  alert: {
    background: xaiColor.charcoal, // #1a1a1a tinted panel
    text: xaiColor.dove, // #d5d9e2
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // whole box is tinted, no left bar
    filetWidth: "0",
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // xAI accordion / details: an off-white medium summary trigger.
  accordion: {
    text: xaiColor.dove, // #d5d9e2 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0", // flush trigger
    fontSize: "0.9375rem", // 15px
    fontWeight: "500", // medium
    lineHeight: "1.5rem" // 24px
  },
  // xAI tag / chip: a pill-rounded subtle dark chip.
  tag: {
    radius: "999px", // pill
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: xaiColor.umbra, // #1f2228
    neutralText: xaiColor.dove // #d5d9e2
  },
  // xAI badge: a small rounded filled badge; mirrors the monochrome primary
  // (white fill, jet text) for an iconic high-contrast chip.
  badge: {
    radius: "0.375rem", // 6px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: xaiColor.white, // #ffffff iconic white badge
    infoText: xaiColor.jet // #0a0a0a jet on white
  },
  // xAI checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: xaiColor.dove // #d5d9e2
  },
  // xAI search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // xAI toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: xaiColor.dove // #d5d9e2
  }
} as const;

// --- semantic (xAI dark role mapping) --------------------------------------
const semantic = {
  surface: {
    default: xaiColor.jet, // #0a0a0a dark app background (--background dark)
    subtle: xaiColor.umbra, // #1f2228 subtle / hover surface (--background-hover dark)
    raised: xaiColor.charcoal, // #1a1a1a card / elevated surface (--card dark)
    inverse: xaiColor.ivory, // #f9f8f6 warm cream light inverse surface
    overlay: "rgb(10 10 10 / 0.7)" // jet backdrop
  },
  text: {
    primary: xaiColor.dove, // #d5d9e2 primary text (--foreground dark)
    secondary: xaiColor.pewter, // #a9b2bc secondary text
    muted: xaiColor.fog, // #7d8187 muted / placeholder text
    inverse: xaiColor.jet, // #0a0a0a text on light surfaces
    link: xaiColor.breeze // #9cb8dd cool info-blue link (--info)
  },
  border: {
    subtle: xaiColor.umbra, // #1f2228 dark divider (--border dark)
    strong: xaiColor.fog, // #7d8187 stronger border (--input dark)
    interactive: xaiColor.white // #ffffff monochrome interactive / focus
  },
  action: {
    primary: xaiColor.white, // #ffffff iconic inverted white primary button (--primary dark)
    primaryHover: xaiColor.ivory, // #f9f8f6 warm cream hover (--primary-hover dark)
    primaryText: xaiColor.jet, // #0a0a0a jet text on white
    secondary: xaiColor.umbra, // #1f2228 dark secondary surface
    secondaryHover: xaiColor.steel, // #36383a lighter on hover
    secondaryText: xaiColor.dove, // #d5d9e2 off-white text
    danger: xaiColor.system.error // #e66565
  },
  feedback: {
    success: xaiColor.system.success, // #4ade80
    warning: xaiColor.system.warning, // #f8c630
    error: xaiColor.system.error, // #e66565
    info: xaiColor.system.info // #9cb8dd
  },
  status: {
    pending: xaiColor.system.warning, // #f8c630
    processing: xaiColor.system.info, // #9cb8dd
    completed: xaiColor.system.success, // #4ade80
    failed: xaiColor.system.error // #e66565
  },
  // Categorical data-vis palette built from the xAI accent + neutral palette.
  // x.ai publishes no ordered 8-colour sequential scale, so the ordering is a
  // coherent proposal drawn from the measured tokens (see MAPPING.md, "à confirmer").
  data: {
    category1: xaiColor.terminalBlue, // #93adff blue
    category2: xaiColor.sunset, // #ff6308 sunset orange (brand accent)
    category3: xaiColor.system.success, // #4ade80 green
    category4: xaiColor.twilight, // #a689fa light purple
    category5: xaiColor.dawn, // #ffd085 amber
    category6: xaiColor.breeze, // #9cb8dd info blue
    category7: xaiColor.pewter, // #a9b2bc neutral grey
    category8: xaiColor.dusk // #6c28d9 purple
  }
} as const;

/**
 * The xAI (Grok) theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry xAI-specific (dark) values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the xAI brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const xaiTheme: TenantTheme = {
  id: "xai",
  label: "xAI (Grok)",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default xaiTheme;
