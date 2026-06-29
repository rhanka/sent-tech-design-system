import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * NOUS RESEARCH / HERMES theme for the Sentropic token structure.
 *
 * Nous Research ("the AI accelerator company", maker of the open Hermes model
 * family and the Hermes Agent) presents a DARK, near-black, TERMINAL-MONOSPACE
 * identity across both of its public properties:
 *
 *   1. The marketing site (https://nousresearch.com — a WordPress/Elementor
 *      build) ships an Elementor global "kit" (measured at
 *      /wp-content/uploads/elementor/css/post-4.css) whose custom brand palette
 *      is BLUE-on-deep-navy: `--e-global-color-4e71b2c:#010A26` (the near-black
 *      navy stage), `--e-global-color-primary:#0171A9` and `…-060187c:#276285`
 *      (brand blues), `--e-global-color-d95b8fd:#013B4F` (dark teal),
 *      `--e-global-color-3fbfbb5:#3430F7` (a vivid indigo) and
 *      `--e-global-color-2d36193:#DAE3E8` (a pale blue-grey). The page loads the
 *      retro pixel display face "PP Mondwest" (declared `font-family:"mondwest
 *      mike"`) for headings, the monospace webfont "Courier Prime", and "Open
 *      Sans"/"Helvetica" for body — a deliberate retro-terminal type system.
 *
 *   2. The Hermes Agent dashboard (https://hermes-agent.nousresearch.com) is a
 *      shadcn-based UI driven by a documented 3-layer palette + warm-glow
 *      vignette (the "Extending the Dashboard" docs). Measured demo/default
 *      values: `palette.background:"#05091a"` ("deepest canvas — near-black"),
 *      `palette.midground:"#d8f0ff"` ("primary text AND accent" — a pale ice
 *      blue), `palette.foreground:"#ffffff"` (top highlight) and
 *      `warmGlow:"rgba(255,199,55,0.24)"` (an amber page-vignette). Typography
 *      tokens: `fontMono:"Share Tech Mono", ui-monospace, monospace`. Every
 *      shadcn token (card/popover/muted/border/primary/ring/destructive) is
 *      DERIVED from that triplet via CSS `color-mix()`.
 *
 * The two properties converge: a deep near-black navy stage (#05091a Hermes /
 * #010A26 marketing), an ICE-BLUE that is simultaneously body ink and the
 * interactive accent (#d8f0ff), brand blues for data/links, an amber warm-glow
 * secondary, and a monospace/terminal type voice (Share Tech Mono primary,
 * Courier Prime fallback, PP Mondwest retro display). This is therefore a DARK
 * theme: `mode:"dark"`.
 *
 * Font *names* only are referenced here, never binaries. The Hermes shadcn
 * surfaces are produced by `color-mix()` at runtime, so the exact card/border/
 * muted hexes are not directly published; the values below are pre-blended
 * derivations of the documented `background ↔ midground` mix and are flagged
 * "à confirmer" in MAPPING.md. Where Sentropic needs a role Nous does not
 * publish (success/error/info hues, the full 8-step data-vis scale), the
 * closest measured token is used and the choice is noted "à confirmer".
 *
 * Nous Research / Hermes colour reference (measured + derived, dark theme):
 *   Background / stage (Hermes)        #05091a   palette.background ("near-black")
 *   Marketing navy stage               #010A26   --e-global-color-4e71b2c
 *   Midground (text + accent)          #d8f0ff   palette.midground (ice blue)
 *   Foreground highlight               #ffffff   palette.foreground
 *   Warm glow (amber vignette)         #ffc737   warmGlow rgba(255,199,55,.24)
 *   Brand blue (marketing primary)     #0171A9   --e-global-color-primary
 *   Brand blue mid                     #276285   --e-global-color-060187c
 *   Dark teal                          #013B4F   --e-global-color-d95b8fd
 *   Vivid indigo                       #3430F7   --e-global-color-3fbfbb5
 *   Pale blue-grey                     #dae3e8   --e-global-color-2d36193
 *   Card / input surface (derived)     #161c2c   color-mix(bg, midground ~8%)
 *   Raised surface (derived)           #1e2536   color-mix(bg, midground ~12%)
 *   Border (derived)                   #2b3343   color-mix(bg, midground ~18%)
 *   Secondary text (derived)           #a3b6c6   color-mix(midground, bg ~25%)
 *   Muted text (derived)               #798898   color-mix(midground, bg ~45%)
 */

// --- NOUS RESEARCH / HERMES raw colour palette (measured + derived) ----------
const nousColor = {
  // The Hermes ICE BLUE — `palette.midground`, documented as "primary text AND
  // accent". It is both the body-ink and the interactive accent / focus ring.
  ice: {
    main: "#d8f0ff", // palette.midground — primary text + accent
    dim: "#b9e0f5", // dimmer ice for hover/active (derived — à confirmer)
    white: "#ffffff" // palette.foreground — top highlight
  },
  // Marketing brand blues (Elementor kit custom palette) — used for links and
  // the categorical data-vis scale.
  blue: {
    brand: "#0171a9", // --e-global-color-primary — marketing brand blue
    mid: "#276285", // --e-global-color-060187c — mid blue
    teal: "#013b4f", // --e-global-color-d95b8fd — dark teal
    indigo: "#3430f7", // --e-global-color-3fbfbb5 — vivid indigo
    pale: "#dae3e8", // --e-global-color-2d36193 — pale blue-grey
    info: "#4d9fd6", // lighter brand-blue for info on dark (derived — à confirmer)
    link: "#7fc5ec" // brightened brand blue for link ink on the dark stage (derived — à confirmer)
  },
  // The deep near-black navy stage + its color-mix() derived lifts. The Hermes
  // shadcn cascade builds card/border/muted from `background ↔ midground` mixes;
  // these flat hexes are pre-blended derivations (à confirmer).
  navy: {
    stage: "#05091a", // palette.background — the near-black stage (Hermes)
    marketing: "#010a26", // --e-global-color-4e71b2c — marketing navy stage
    card: "#161c2c", // color-mix(stage, midground ~8%) — card / input surface
    raised: "#1e2536", // color-mix(stage, midground ~12%) — raised surface
    border: "#2b3343", // color-mix(stage, midground ~18%) — border / divider
    borderStrong: "#3c4658" // color-mix(stage, midground ~28%) — strong border
  },
  // Ink ramp: the ice midground stepped down toward the stage (derived mixes).
  ink: {
    primary: "#d8f0ff", // midground — primary ink
    secondary: "#a3b6c6", // color-mix(midground, stage ~25%) — secondary ink
    muted: "#798898" // color-mix(midground, stage ~45%) — muted / placeholder
  },
  // The amber warm-glow vignette, opacity stripped to a solid accent — the
  // signature secondary/warning hue (measured warmGlow rgba(255,199,55,.24)).
  amber: "#ffc737",
  // System / status colours. Nous publishes only a shadcn `destructive` slot
  // (no hex) plus the amber warm-glow; success/error/info hues are derived to
  // sit AA-legibly on the #05091a stage (à confirmer).
  system: {
    success: "#3fb950", // terminal green, AA on the dark stage (derived — à confirmer)
    warning: "#ffc737", // the amber warm-glow base (measured)
    error: "#f0616d", // shadcn `destructive` on dark, AA-tuned (derived — à confirmer)
    info: "#4d9fd6" // lighter brand blue for info (derived — à confirmer)
  }
} as const;

// --- foundation (NOUS RESEARCH / HERMES-specific values) ---------------------
const foundation = {
  color: {
    // Sentropic "blue" role family — Nous's interactive accent is the Hermes ice
    // midground; the darker steps fall to the marketing brand blue.
    blue: {
      10: nousColor.ice.main, // #d8f0ff lightest ice accent
      60: nousColor.blue.brand, // #0171a9 marketing brand blue
      80: nousColor.blue.teal // #013b4f dark teal
    },
    // Nous has no separate cyan; the closest cool accents are the ice midground
    // and the marketing brand blues. (à confirmer.)
    cyan: {
      10: nousColor.ice.main, // #d8f0ff ice tint
      50: nousColor.blue.mid, // #276285 mid blue
      70: nousColor.blue.teal // #013b4f dark teal
    },
    // Sentropic "slate" neutral family mapped onto the dark navy stage + ice ink
    // (dark-first: 0 is the lightest ink, 90 is the near-black stage).
    slate: {
      0: nousColor.ice.white, // #ffffff foreground highlight (lightest)
      10: nousColor.ink.secondary, // #a3b6c6 secondary ink
      20: nousColor.navy.borderStrong, // #3c4658 strong border on dark
      60: nousColor.ink.muted, // #798898 muted / placeholder ink
      80: nousColor.navy.card, // #161c2c subtle raised surface
      90: nousColor.navy.stage // #05091a the near-black navy stage (darkest)
    },
    feedback: {
      success: nousColor.system.success,
      warning: nousColor.system.warning,
      error: nousColor.system.error,
      info: nousColor.system.info
    }
  },
  // Nous's retro-terminal type system: "Share Tech Mono" (Hermes `fontMono`) is
  // the primary monospace voice for UI/controls/labels, with "Courier Prime"
  // (the marketing site's loaded mono webfont) as a fallback; "PP Mondwest" (the
  // marketing display face, declared `mondwest mike`) is the retro pixel display
  // face; "Open Sans" (marketing body) carries long-form sans body text. Font
  // NAMES only, never binaries.
  font: {
    sans: "'Open Sans', 'Helvetica Neue', Helvetica, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif",
    display: "'PP Mondwest', 'Mondwest', 'Share Tech Mono', ui-monospace, 'Courier Prime', monospace",
    mono: "'Share Tech Mono', 'Courier Prime', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale. Hermes exposes a `--spacing-mul`
  // multiplier but no measured base; the Sentropic 4px grid is kept (à confirmer).
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
  // Terminal/crisp rounding. Hermes exposes a `--radius` override but publishes
  // no measured value; the monospace/terminal identity reads as SHARP, so a
  // tight ramp is used (controls land on 4px). (Exact radius à confirmer.)
  radius: {
    none: "0",
    sm: "2px", // hairline rounding
    md: "4px", // buttons / inputs / tabs (crisp terminal corner)
    lg: "8px", // cards / larger surfaces
    pill: "999px" // pills / circular controls
  },
  // Dark elevation: deep, near-black shadows over the navy stage (the Hermes
  // warm-glow vignette is a page-background effect, not a component shadow — it
  // is documented in MAPPING.md, "Signatures anatomiques"). Exact dp à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.50)",
    medium: "0 4px 16px rgb(0 0 0 / 0.60)",
    floating: "0 8px 32px rgb(0 0 0 / 0.70)"
  },
  // Motion durations / easing are not Nous-specific; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Nous-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (NOUS RESEARCH / HERMES) -------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // hairline dividers / field borders (crisp 1px)
    thick: "2px" // focus ring / emphasis
  },
  borderStyle: { solid: "solid" },
  // Control density. shadcn defaults: inputs/buttons ~h-10 (40px); sm h-9 (36px),
  // lg h-11 (44px). Base type 14–16px (`baseSize` 14/15/16 — à confirmer).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" }
  },
  // Type roles: monospace ("Share Tech Mono") for controls/labels/fields (the
  // terminal voice), "Open Sans" reserved for long-form body. Links are the
  // brightened brand blue, underlined on hover.
  typography: {
    control: { family: "'Share Tech Mono', 'Courier Prime', ui-monospace, monospace", size: "0.9375rem", weight: "400", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Share Tech Mono', 'Courier Prime', ui-monospace, monospace", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Share Tech Mono', 'Courier Prime', ui-monospace, monospace", size: "0.875rem", weight: "400", lineHeight: "1.3", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // shadcn disabled ≈ 50% opacity (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // FOCUS = a shadcn-style RING in the ice accent (shadcn `focus-visible:ring-2
  // ring-ring ring-offset-2`; `--ring` derives from the midground accent). On the
  // near-black stage the ice ring is the most legible indicator.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: nousColor.ice.main, // #d8f0ff ice-blue ring
    inset: "0"
  },
  // Form fields are BOXED (shadcn outlined input): a dark input surface, a 1px
  // border, a crisp 4px radius; the border/ring turns ice on focus. `style:
  // "outline"` makes the builder draw four equal borders from `surface` +
  // `border`. The native <select> chevron is redrawn in the ice accent.
  field: {
    style: "outline",
    fillBg: nousColor.navy.card, // #161c2c dark input surface on the navy stage
    underlineColor: nousColor.navy.border, // #2b3343 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23d8f0ff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // shadcn card: a subtle dark `--card` surface lift on the navy stage, a 1px
  // border, faint hover lift.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: nousColor.navy.raised // #1e2536 faint lift on the dark card
  },
  // shadcn "outline" / "secondary" button = transparent fill, a 1px border, a
  // subtle raised fill on hover (terminal/ghost button).
  buttonSecondary: {
    background: "transparent",
    border: nousColor.navy.borderStrong, // #3c4658 stroke on the dark stage
    hoverBackground: nousColor.navy.raised // #1e2536 quiet fill on hover
  },
  // Tabs: active tab = ice label with an ice bottom indicator, transparent fill.
  tabs: {
    activeText: nousColor.ice.main, // #d8f0ff active label (ice accent)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "400",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // ice underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Pagination: borderless ice link text on the dark stage; active page = filled
  // ice with the dark stage as text (the shadcn `primary` inversion).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: nousColor.ink.secondary, // #a3b6c6 link text on dark
    activeBackground: nousColor.ice.main, // #d8f0ff filled active page
    activeText: nousColor.navy.stage, // #05091a dark text on ice
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Breadcrumb: ice links, secondary trail, ice current page, muted separators —
  // on the dark stage.
  breadcrumb: {
    linkText: nousColor.blue.link, // #7fc5ec
    text: nousColor.ink.secondary, // #a3b6c6 trail text
    currentText: nousColor.ink.primary, // #d8f0ff current page
    separator: nousColor.ink.muted, // #798898
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "400"
  },
  // Notice / alert: a tinted dark box with a coloured left filet matching the
  // severity, over the navy stage.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / disclosure: an ice summary trigger on a subtle raised row.
  accordion: {
    text: nousColor.ink.primary, // #d8f0ff summary label on dark
    paddingBlock: "0.875rem", // 14px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "400",
    lineHeight: "1.5rem" // 24px
  },
  // Tag / chip: a subtle dark chip — a raised fill with secondary ink, crisp 4px
  // radius (matching the terminal control radius).
  tag: {
    radius: "4px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.8125rem", // 13px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: nousColor.navy.raised, // #1e2536 dark chip fill
    neutralText: nousColor.ink.secondary // #a3b6c6 secondary ink
  },
  // Badge: a small filled badge — ice fill / dark stage text (the info emphasis),
  // crisp corners.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: nousColor.ice.main, // #d8f0ff ice fill
    infoText: nousColor.navy.stage // #05091a dark text on ice
  },
  // Checkbox/radio label: secondary ink at base size on the dark stage.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: nousColor.ink.secondary // #a3b6c6 label ink on dark
  },
  // Search input: a boxed, 4px-radius field on the dark stage, base type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label: secondary ink; the checked track is the ice accent
  // (the interactive colour).
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: nousColor.ink.secondary // #a3b6c6
  }
} as const;

// --- semantic (NOUS RESEARCH / HERMES role mapping, DARK-first) --------------
const semantic = {
  surface: {
    default: nousColor.navy.stage, // #05091a the near-black navy stage (palette.background)
    subtle: nousColor.navy.card, // #161c2c subtle surface / card (color-mix derived)
    raised: nousColor.navy.raised, // #1e2536 raised surface (color-mix derived)
    inverse: nousColor.ice.main, // #d8f0ff inverse (light ice) surface
    overlay: "rgb(5 9 26 / 0.70)" // modal backdrop — the navy stage at .7
  },
  text: {
    primary: nousColor.ink.primary, // #d8f0ff ice ink (palette.midground — primary text)
    secondary: nousColor.ink.secondary, // #a3b6c6 secondary ink (derived)
    muted: nousColor.ink.muted, // #798898 muted / placeholder ink (derived)
    inverse: nousColor.navy.stage, // #05091a dark text on light / ice surfaces
    link: nousColor.blue.link // #7fc5ec brightened brand-blue link
  },
  border: {
    subtle: nousColor.navy.border, // #2b3343 subtle divider on dark (derived)
    strong: nousColor.navy.borderStrong, // #3c4658 stronger border (derived)
    interactive: nousColor.ice.main // #d8f0ff ice interactive / focus accent
  },
  action: {
    primary: nousColor.ice.main, // #d8f0ff the ice accent CTA (palette.midground)
    primaryHover: nousColor.ice.dim, // #b9e0f5 dimmer ice on hover (derived)
    primaryText: nousColor.navy.stage, // #05091a dark stage text on the ice CTA
    secondary: nousColor.navy.raised, // #1e2536 neutral secondary surface
    secondaryHover: nousColor.navy.borderStrong, // #3c4658
    secondaryText: nousColor.ink.primary, // #d8f0ff ice secondary label
    danger: nousColor.system.error // #f0616d (shadcn destructive on dark)
  },
  feedback: {
    success: nousColor.system.success, // #3fb950 (derived)
    warning: nousColor.system.warning, // #ffc737 (amber warm-glow base — measured)
    error: nousColor.system.error, // #f0616d (derived)
    info: nousColor.system.info // #4d9fd6 (derived)
  },
  status: {
    pending: nousColor.system.warning, // #ffc737
    processing: nousColor.system.info, // #4d9fd6
    completed: nousColor.system.success, // #3fb950
    failed: nousColor.system.error // #f0616d
  },
  // Categorical data-vis palette. Nous publishes no 8-step data-vis scale, so
  // this is a coherent proposal (see MAPPING.md, "à confirmer") built from the
  // measured Nous blues + the amber warm-glow, extended with derived tints.
  data: {
    category1: nousColor.ice.main, // #d8f0ff ice (midground)
    category2: nousColor.blue.brand, // #0171a9 brand blue
    category3: nousColor.amber, // #ffc737 amber warm-glow
    category4: nousColor.blue.indigo, // #3430f7 vivid indigo
    category5: nousColor.blue.mid, // #276285 mid blue
    category6: nousColor.blue.teal, // #013b4f dark teal
    category7: "#7fc5ec", // brightened brand-blue tint (derived — à confirmer)
    category8: "#9a6cff" // violet from the indigo family (derived — à confirmer)
  }
} as const;

/**
 * The NOUS RESEARCH / HERMES theme as a Sentropic `TenantTheme`. The `tokens`
 * tree is complete: `foundation` and `semantic` carry Nous-specific (ice-on-
 * near-black-navy, dark-first, terminal-monospace) values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Nous ice accent, monospace type voice, dark navy
 * surfaces, crisp 4px fields and ice focus ring reach the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly. `mode:"dark"` because both Nous properties render on a
 * near-black navy stage.
 */
export const nousHermesTheme: TenantTheme = {
  id: "nous-hermes",
  label: "Nous Hermes",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default nousHermesTheme;
