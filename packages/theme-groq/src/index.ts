import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Groq (groq.com / GroqCloud) theme for the Sentropic token structure.
 *
 * Every value below is measured from Groq's PUBLIC site CSS (the Next.js token
 * bundle served from groq.com — CSS custom properties `--color-*`, `--ff-*`,
 * `--bdrs*`, `--border-*`). We only reference font *names* (Space Grotesk, IBM
 * Plex Mono) here, never the font binaries. Sources and the per-token provenance
 * are documented in MAPPING.md; any value Groq does not publish a direct token
 * for is marked `à confirmer` inline and in MAPPING.md.
 *
 * Groq colour reference (measured `--color-*` custom properties):
 *   Orange base   (--color-orange / --color-orange-base)  #F43E01  primary / btn
 *   Orange dark   (--color-orange-dark)                    #C23101  hover / link-hover
 *   Orange middle (--color-orange-middle)                  #FE9E20  amber accent
 *   Orange light  (--color-orange-light)                   #FFD1A3  light orange tint
 *   Cream 98      (--color-utility-98-yellow)              #FAFAF8  warm page bg
 *   Cream 95      (--color-utility-95-yellow)              #F3F3EE  subtle warm fill
 *   Cream 91      (--color-utility-91-yellow)              #E8E8DE  warm border
 *   Cream 81      (--color-utility-81-yellow)              #CECEBF  stronger border
 *   Cream 61      (--color-utility-61-yellow)              #9C9C90  muted text
 *   Cream 41      (--color-utility-41-yellow)              #69695D  secondary text
 *   Cream 20      (--color-utility-20-yellow)              #34342E  warm dark
 *   Cream 16      (--color-utility-16-yellow)              #2A2A25  warm darkest
 *   Ink 20-blue   (--color-utility-20-blue)                #2D2F33  primary text / inverse
 *   Ink 16-blue   (--color-utility-16-blue)                #26292E  darkest inverse
 *   Fluo green    (--color-fluorescent-green-base)         #10E68D  accent / success
 *   Fluo green lt (--color-fluorescent-green-light)        #A9FFDB  light green
 *   Fluo blue     (--color-fluorescent-blue-base)          #5FC0FF  accent / info
 *   Fluo purple   (--color-fluorescent-purple-base)        #D377FD  accent (data)
 *   Fluo pink     (--color-fluorescent-pink-base)          #F392DD  accent (data)
 *   Fluo yellow   (--color-fluorescent-yellow-base)        #FDEB20  accent (data)
 *   Teal          (--color-green)                          #39C5C0  accent (data)
 *
 * Signature shape: pill buttons (`.btn` radius `--bdrs-l` = 1000px) over boxed
 * 4px inputs (`--border-radius-input: 4px`); a real 3px orange focus outline
 * (`outline: 3px solid …`); Space Grotesk display/body + IBM Plex Mono.
 */

// --- Groq raw colour palette (public site CSS custom properties) -----------
const groqColor = {
  // Brand orange — the signature action family (`--color-orange*`).
  orange: {
    base: "#f43e01", // --color-orange-base / --color-orange (primary, btn bg)
    dark: "#c23101", // --color-orange-dark (hover / link-hover)
    middle: "#fe9e20", // --color-orange-middle (amber accent / warning)
    light: "#ffd1a3" // --color-orange-light (light orange tint)
  },
  // Warm "yellow" utility scale — Groq's neutral surfaces & text in light mode.
  cream: {
    98: "#fafaf8", // --color-utility-98-yellow (warm page background)
    95: "#f3f3ee", // --color-utility-95-yellow (subtle warm fill / hover)
    91: "#e8e8de", // --color-utility-91-yellow (warm border)
    81: "#cecebf", // --color-utility-81-yellow (stronger border)
    61: "#9c9c90", // --color-utility-61-yellow (muted / placeholder text)
    41: "#69695d", // --color-utility-41-yellow (secondary text)
    20: "#34342e", // --color-utility-20-yellow (warm dark)
    16: "#2a2a25" // --color-utility-16-yellow (warm darkest)
  },
  // Cool "blue" utility scale — Groq's dark/inverse surfaces & primary text.
  ink: {
    16: "#26292e", // --color-utility-16-blue (darkest inverse)
    20: "#2d2f33", // --color-utility-20-blue (primary text / inverse surface)
    29: "#2c364a", // --color-utility-29-blue
    41: "#3e4c69" // --color-utility-41-blue
  },
  // Fluorescent accent palette — Groq's bright secondary accents / data-vis.
  fluoro: {
    green: "#10e68d", // --color-fluorescent-green-base
    greenLight: "#a9ffdb", // --color-fluorescent-green-light
    blue: "#5fc0ff", // --color-fluorescent-blue-base
    purple: "#d377fd", // --color-fluorescent-purple-base
    pink: "#f392dd", // --color-fluorescent-pink-base
    yellow: "#fdeb20" // --color-fluorescent-yellow-base
  },
  teal: "#39c5c0", // --color-green (teal accent)
  white: "#ffffff", // --color-white
  black: "#000000" // --color-black
} as const;

// --- foundation (Groq-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" interactive family mapped onto the Groq orange brand.
    blue: {
      10: groqColor.orange.light, // #ffd1a3 lightest orange tint
      60: groqColor.orange.base, // #f43e01 primary orange
      80: groqColor.orange.dark // #c23101 darker interactive
    },
    // Groq has no cyan; the signature non-orange accent is the fluorescent
    // green, so the Sentropic "cyan" accent slot maps to the Groq fluoro green.
    cyan: {
      10: groqColor.fluoro.greenLight, // #a9ffdb light green
      50: groqColor.fluoro.green, // #10e68d fluoro green accent
      70: "#0ba96a" // darker green (derived — à confirmer)
    },
    // Sentropic "slate" neutral family mapped onto Groq's warm cream + ink.
    slate: {
      0: groqColor.white, // #ffffff
      10: groqColor.cream[98], // #fafaf8 warm page background
      20: groqColor.cream[91], // #e8e8de warm border
      60: groqColor.cream[41], // #69695d secondary text
      80: groqColor.cream[20], // #34342e warm dark
      90: groqColor.ink[20] // #2d2f33 primary text / darkest
    },
    feedback: {
      success: groqColor.fluoro.green, // #10e68d (à confirmer — no semantic token)
      warning: groqColor.orange.middle, // #fe9e20 (à confirmer)
      error: groqColor.orange.dark, // #c23101 (à confirmer)
      info: groqColor.fluoro.blue // #5fc0ff (à confirmer)
    }
  },
  // Groq ships "Space Grotesk" (--ff-space-grotesk, display + body) and "IBM
  // Plex Mono" (--ff-ibm-plex-mono, code). Font *names* only, never binaries.
  font: {
    sans: "'Space Grotesk', system-ui, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Space Grotesk', system-ui, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base; Groq
  // uses a fixed-step `--space-fixed-*` grid — exact steps à confirmer).
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
  // Groq shape: sharp 4px inputs (`--border-radius-input: 4px`), generously
  // ROUNDED ~20px cards (`--bdrs`), and PILL buttons/chips (`--bdrs-l` 1000px).
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px (measured small radius)
    md: "0.25rem", // 4px — inputs / controls (--border-radius-input)
    lg: "1.25rem", // 20px — cards (--bdrs ≈ 1.43rem at Groq's 14px root → ~20px)
    pill: "999px" // pills / chips / buttons (--bdrs-l)
  },
  // Groq UI is fairly flat; soft neutral ink shadows. Exact specs à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(45 47 51 / 0.06)",
    medium: "0 2px 8px rgb(45 47 51 / 0.08)",
    floating: "0 8px 24px rgb(45 47 51 / 0.12)"
  },
  // Motion kept aligned with the Sentropic base; durations/easing à confirmer.
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Groq-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Groq) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // --bdw / --border-input
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Groq control density. Buttons read tall & pill-rounded with generous
  // horizontal padding. Exact heights à confirmer (not pixel-measured).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Groq typography: Space Grotesk everywhere (display + body + controls), IBM
  // Plex Mono for code. Buttons/labels read medium (500); weights à confirmer.
  typography: {
    control: { family: "'Space Grotesk', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Space Grotesk', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Space Grotesk', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Groq prose links are dark text, underlined at rest, turning orange on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.18em",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // à confirmer
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // à confirmer
  // Groq FOCUS = a real OUTLINE (`outline: 3px solid …`, `outline-offset`), the
  // colour falling to the brand orange on interactive elements.
  focus: {
    strategy: "outline",
    width: "3px", // measured `outline: 3px solid`
    offset: "2px", // `outline-offset: .3ch` ≈ 2px (à confirmer)
    color: groqColor.orange.base, // #f43e01
    inset: "0"
  },
  // Groq form fields are BOXED (outline): a white fill, a 1px warm border
  // (`--border-input: 1px solid …`) and a small 4px radius
  // (`--border-radius-input`). Not a filled-underline.
  field: {
    style: "outline",
    fillBg: groqColor.white, // #ffffff white input fill
    underlineColor: groqColor.cream[91], // #e8e8de (inert for outline)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Groq orange with a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23f43e01' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Groq card: a 1px warm border + the rounded card radius, subtle warm hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: groqColor.cream[95] // #f3f3ee
  },
  // Groq secondary button = transparent fill, a subtle warm border, dark text,
  // a light warm fill on hover (the pill outline button).
  buttonSecondary: {
    background: "transparent",
    border: groqColor.cream[81], // #cecebf
    hoverBackground: groqColor.cream[95] // #f3f3ee
  },
  // Groq tabs: active tab reads the brand orange with a 2px bottom indicator.
  // (à confirmer — tab styling not directly measured.)
  tabs: {
    activeText: groqColor.orange.base, // #f43e01
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Groq pagination: borderless dark links; active page = filled orange.
  // (à confirmer.)
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: groqColor.ink[20], // #2d2f33
    activeBackground: groqColor.orange.base, // #f43e01
    activeText: groqColor.white,
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "0.9375rem",
    lineHeight: "1.25rem"
  },
  // Groq breadcrumb: dark links + trail, orange-on-hover handled by the link role.
  // (à confirmer.)
  breadcrumb: {
    linkText: groqColor.ink[20], // #2d2f33
    text: groqColor.cream[41], // #69695d
    currentText: groqColor.ink[20], // #2d2f33
    separator: groqColor.cream[61], // #9c9c90
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    currentWeight: "500"
  },
  // Groq chip/tag: a pill-rounded warm chip. (à confirmer.)
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    lineHeight: "1.25rem",
    minHeight: "2rem",
    neutralBackground: groqColor.cream[95], // #f3f3ee
    neutralText: groqColor.ink[20] // #2d2f33
  },
  // Groq badge: a small pill filled in the brand orange. (à confirmer.)
  badge: {
    radius: "999px",
    paddingBlock: "0.125rem",
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    lineHeight: "1rem",
    textTransform: "none",
    minHeight: "1.25rem",
    infoBackground: groqColor.orange.base, // #f43e01
    infoText: groqColor.white
  },
  // Groq toggle / switch: orange checked track over a warm resting track.
  // (à confirmer.)
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.25rem",
    trackColor: groqColor.cream[81], // #cecebf
    trackCheckedColor: groqColor.orange.base, // #f43e01
    textColor: groqColor.ink[20] // #2d2f33
  }
} as const;

// --- semantic (Groq-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: groqColor.cream[98], // #fafaf8 warm cream page background (signature)
    subtle: groqColor.cream[95], // #f3f3ee subtle warm fill / hover
    raised: groqColor.white, // #ffffff white cards lift off the cream
    inverse: groqColor.ink[20], // #2d2f33 dark inverse surface
    overlay: "rgb(45 47 51 / 0.6)" // modal backdrop (ink-20 tint)
  },
  text: {
    primary: groqColor.ink[20], // #2d2f33 primary text (--color-text-primary)
    secondary: groqColor.cream[41], // #69695d secondary text (--color-text-secondary)
    muted: groqColor.cream[61], // #9c9c90 muted / placeholder
    inverse: groqColor.white, // #ffffff on dark / orange surfaces
    // Groq prose links are dark text (underlined) turning orange on hover; the
    // hover orange falls out of `action.primary` via createComponent.
    link: groqColor.ink[20] // #2d2f33
  },
  border: {
    subtle: groqColor.cream[91], // #e8e8de warm border (--color-bd)
    strong: groqColor.cream[81], // #cecebf stronger border
    interactive: groqColor.orange.base // #f43e01 focus / interactive
  },
  action: {
    primary: groqColor.orange.base, // #f43e01 primary button (--color-orange)
    primaryHover: groqColor.orange.dark, // #c23101 darker hover (à confirmer — Groq inverts to white-bg/orange-text)
    primaryText: groqColor.white, // #ffffff text on orange
    secondary: groqColor.cream[95], // #f3f3ee secondary surface
    secondaryHover: groqColor.cream[91], // #e8e8de
    secondaryText: groqColor.ink[20], // #2d2f33 dark text
    danger: groqColor.orange.dark // #c23101 (à confirmer — no dedicated danger red)
  },
  feedback: {
    success: groqColor.fluoro.green, // #10e68d (à confirmer)
    warning: groqColor.orange.middle, // #fe9e20 (à confirmer)
    error: groqColor.orange.dark, // #c23101 (à confirmer)
    info: groqColor.fluoro.blue // #5fc0ff (à confirmer)
  },
  status: {
    pending: groqColor.orange.middle, // warning
    processing: groqColor.fluoro.blue, // info
    completed: groqColor.fluoro.green, // success
    failed: groqColor.orange.dark // error
  },
  // Categorical data-vis palette built from the Groq brand orange + the full
  // fluorescent accent set. Groq publishes no sequential data-vis scale, so this
  // is a coherent proposal from its real accent tokens (see MAPPING.md).
  data: {
    category1: groqColor.orange.base, // #f43e01 brand orange
    category2: groqColor.fluoro.blue, // #5fc0ff fluoro blue
    category3: groqColor.fluoro.green, // #10e68d fluoro green
    category4: groqColor.fluoro.purple, // #d377fd fluoro purple
    category5: groqColor.fluoro.pink, // #f392dd fluoro pink
    category6: groqColor.fluoro.yellow, // #fdeb20 fluoro yellow
    category7: groqColor.orange.middle, // #fe9e20 orange amber
    category8: groqColor.teal // #39c5c0 teal
  }
} as const;

/**
 * The Groq theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry the Groq-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent`, then given a single escape-hatch override — the PILL button
 * radius — so Groq's signature pill buttons survive while inputs keep their
 * measured 4px (`radius.md`). All other component values stay createComponent's.
 */
type ComponentFactoryInput = Parameters<typeof createComponent>;

function createGroqComponent(semanticTheme: ComponentFactoryInput[0], foundationTheme: ComponentFactoryInput[1]) {
  const component = createComponent(semanticTheme, foundationTheme);
  return {
    ...component,
    // Escape hatch (à la airbus): Groq buttons are PILLS (`.btn` radius
    // `--bdrs-l` = 1000px) while inputs keep the 4px control radius. The shared
    // `radius.md` cannot express both, so override only the button leaf.
    button: {
      ...component.button,
      radius: "999px",
      anatomy: {
        ...component.button.anatomy,
        shape: { ...component.button.anatomy.shape, radius: "999px" }
      }
    }
  };
}

export const groqTheme: TenantTheme = {
  id: "groq",
  label: "Groq",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createGroqComponent(semantic, foundation)
  }
};

export default groqTheme;
