import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * DSFR (Système de Design de l'État — French government design system) theme
 * for the Sentropic token structure.
 *
 * All values below are taken from the PUBLIC DSFR (the design system itself is
 * open source under the MIT license; only the Marianne font binary has a
 * restricted license — we only reference the font *name* here, not the file).
 * Sources are documented in MAPPING.md. Where DSFR has no direct equivalent for
 * a Sentropic role, the closest DSFR token is used and the choice is noted in
 * MAPPING.md.
 *
 * DSFR color reference (light theme — utility / decision tokens):
 *   White (background default)        #ffffff   (--grey-1000-50)
 *   Grey alt (background alt)         #f6f6f6   (--grey-975-75)
 *   Grey contrast (background)        #eeeeee   (--grey-950-100)
 *   Grey border / text mention        #666666   (--grey-425-625)
 *   Grey disabled                     #929292   (--grey-625-425)
 *   Text title / primary              #161616   (--grey-50-1000)
 *   Bleu France (sun-113)             #000091   (--blue-france-sun-113-625)
 *   Bleu France hover                 #1212ff   Bleu France active #2323ff
 *   Rouge Marianne (decorative)       #e1000f   (--red-marianne-main-472)
 *   Support: success #18753c  error #ce0500  warning #b34000  info #0063cb
 */

// --- DSFR raw color palette (public, MIT) ----------------------------------
const dsfrColor = {
  // Bleu France — the primary brand / action color
  blueFrance: {
    sun113: "#000091", // --blue-france-sun-113-625 (primary)
    hover: "#1212ff", // --blue-france-sun-113-625-hover
    active: "#2323ff", // --blue-france-sun-113-625-active
    "925": "#e3e3fd", // --blue-france-925-125 (lightest background)
    "850": "#cacafb" // --blue-france-850-200 (light surface)
  },
  // Rouge Marianne — decorative / accent red of the brand block
  redMarianne: {
    main: "#e1000f", // --red-marianne-main-472 (decorative accent)
    "925": "#fee9e9" // --red-marianne-925-125 (light background)
  },
  // Neutral grey scale (light theme). DSFR names encode light/dark pairs.
  grey: {
    1000: "#ffffff", // --grey-1000-50  (background default / white)
    975: "#f6f6f6", // --grey-975-75   (background alt)
    950: "#eeeeee", // --grey-950-100  (background contrast / borders)
    900: "#dddddd", // --grey-900-150  (border default light)
    625: "#929292", // --grey-625-425  (disabled / mention text)
    425: "#666666", // --grey-425-625  (default border / secondary text)
    200: "#3a3a3a", // --grey-200-850  (strong text on light)
    50: "#161616" // --grey-50-1000  (title / primary text)
  },
  // System / status colors (DSFR utility tokens, light theme)
  system: {
    success: "#18753c", // --success-425-625
    error: "#ce0500", // --error-425-625
    warning: "#b34000", // --warning-425-625
    info: "#0063cb", // --info-425-625
    successLight: "#dffee6", // --success-975-75
    errorLight: "#fff4f4", // --error-975-75
    warningLight: "#fff4f3", // --warning-975-75
    infoLight: "#f4f6ff" // --info-975-75
  }
} as const;

// --- foundation (DSFR-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Bleu France.
    blue: {
      10: dsfrColor.blueFrance["925"], // lightest Bleu France tint
      60: dsfrColor.blueFrance.sun113, // Bleu France (primary)
      80: dsfrColor.blueFrance.hover // darker interactive Bleu France
    },
    // DSFR has no dedicated cyan; the closest accent is Rouge Marianne, so the
    // Sentropic "cyan" accent slot is mapped to the Marianne red family.
    cyan: {
      10: dsfrColor.redMarianne["925"], // light Marianne tint
      50: dsfrColor.redMarianne.main, // Rouge Marianne accent
      70: dsfrColor.system.error // darker red (error utility)
    },
    // Sentropic "slate" role family mapped onto the DSFR grey scale.
    slate: {
      0: dsfrColor.grey[1000], // white
      10: dsfrColor.grey[975], // background alt
      20: dsfrColor.grey[950], // borders / contrast background
      60: dsfrColor.grey[425], // secondary text / default border
      80: dsfrColor.grey[200], // strong text
      90: dsfrColor.grey[50] // title / primary text
    },
    feedback: {
      success: dsfrColor.system.success,
      warning: dsfrColor.system.warning,
      error: dsfrColor.system.error,
      info: dsfrColor.system.info
    }
  },
  // DSFR ships the "Marianne" typeface for sans/title; "Spectral" was the
  // legacy serif (now deprecated). Mono is not part of DSFR, so the Sentropic
  // mono stack is kept. We only reference the font *name*, not the binary.
  font: {
    sans: "Marianne, arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "Marianne, arial, system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // DSFR spacing is an 8px grid expressed in rem. The "v" unit = 4px (1v),
  // so 1v=0.25rem, 2v=0.5rem, ... Mapped to Sentropic spacing keys by px value.
  spacing: {
    0: "0", // 0
    1: "0.25rem", // 4px  = 1v
    2: "0.5rem", // 8px  = 2v
    3: "0.75rem", // 12px = 3v
    4: "1rem", // 16px = 4v
    6: "1.5rem", // 24px = 6v
    8: "2rem", // 32px = 8v
    12: "3rem", // 48px = 12v
    16: "4rem" // 64px = 16v
  },
  // DSFR aesthetic is SQUARED. Controls (button/input/tabs) and cards have no
  // radius. Source: DSFR design fundamentals — squared corners are a brand
  // signature. Only pills/tags are rounded. (Prior 0.25rem on md/lg was a
  // color-era placeholder for tiles; the anatomy clone makes controls square.)
  radius: {
    none: "0", // DSFR default — squared corners
    sm: "0", // controls square
    md: "0", // button / input / tabs — square in DSFR
    lg: "0", // cards — square in DSFR
    pill: "999px" // tags / pills
  },
  // DSFR uses light, subtle elevation. Values approximate the DSFR shadow
  // ($shadow on raised surfaces); kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(22 22 22 / 0.08)",
    medium: "0 4px 12px rgb(22 22 22 / 0.16)",
    floating: "0 8px 24px rgb(22 22 22 / 0.24)"
  },
  // DSFR motion durations are not strongly tokenised publicly; kept aligned
  // with the Sentropic base with a standard ease ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not DSFR-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Phase 1, DSFR) ----------------------------------
  // DSFR borders: most controls use a 1px stroke; the brand outline is heavier.
  // Source: gouvernement.github.io/dsfr (foundamentals / borders).
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // DSFR control density. DSFR buttons (md) are 40px tall; sizes "sm" (32px) and
  // "lg" (48px) follow the DSFR size scale. Horizontal padding is generous.
  // Source: DSFR component "Bouton" (sizes SM/MD/LG). Exact paddings "à confirmer"
  // against the SCSS, but match the public component metrics closely.
  density: {
    // fontSize per size (anatomy v1.1.0). DSFR md label = 1rem (body). The sm/lg
    // label sizes follow the DSFR size scale; sm 0.875rem (14px) / lg 1.125rem
    // (18px) are "à confirmer" against the SCSS but match the public metrics.
    // DSFR « Champ de saisie » padding = 0.5rem 1rem (8px vertical, 16px inline).
    // The fields read md.paddingBlock (vertical) and sm.paddingInline (inline), so
    // both carry the DSFR field metrics: paddingBlock 0.5rem (8px) gives the
    // Input/Select vertical padding the spec wants, and sm.paddingInline 1rem
    // (16px) gives the 16px horizontal padding (was 12px). md.paddingBlock 8px
    // also lands the DSFR Button vertical padding (ref 8px) without changing the
    // 40px control height (border-box + min-height).
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // DSFR typography = Marianne. Button labels are medium/bold, no transform.
  // Source: DSFR "Typographie" — Marianne, body 1rem/1.5, label 0.875rem.
  typography: {
    control: { family: "Marianne, arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Marianne, arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Marianne, arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // DSFR links are underlined (link gestion = soulignement). Offset "à confirmer".
    // Hover keeps the underline (DSFR animates its thickness/offset — that animation
    // stays an escape, the line itself is tokenised). textDecorationHover = no-op vs rest.
    link: { family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none", textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.125em", textDecorationHover: "underline" }
  },
  disabledOpacity: "1", // DSFR disabled = greyed colours, not opacity dimming
  transition: { property: "background-color, border-color, color, outline-color", duration: "120ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.5rem" },
  // DSFR FOCUS = thick offset OUTLINE in the focus colour (2px, offset 2px).
  // Source: DSFR accessibility — visible focus uses `outline` (not box-shadow),
  // colour --focus #0a76f6 / Bleu France ring offset from the control.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: "#0a76f6", // DSFR --focus ring colour
    inset: "0"
  },
  // DSFR « Champ de saisie » is a FILLED field with a BOTTOM RULE only (not a
  // boxed encadré): a light grey fill + a single darker bottom rule. This is
  // the field-style primitive (anatomy v1.2.0+) that makes our input faithful.
  // Source: DSFR fondamentaux / composant « Champ de saisie » (gouvernement.
  // github.io/dsfr). fillBg = grey-950 #eeeeee (--grey-950-100, the contrast
  // background). Bottom rule = grey-200 #3a3a3a (~1px).
  //
  // v1.3.0 (F3/F4):
  //  - radiusTop 4px: DSFR rounds ONLY the top corners of a filled field
  //    (border-top-left/right-radius 4px) while the bottom stays square (the
  //    bottom rule needs a crisp 0 corner). Measured on the official .fr-input.
  //  - the bottom rule is rendered by the builder as a `box-shadow inset`
  //    (the real DSFR technique) — `border-bottom` is `none` (F4).
  field: {
    style: "filled-underline",
    fillBg: dsfrColor.grey[950], // #eeeeee
    underlineColor: dsfrColor.grey[200], // #3a3a3a
    underlineWidth: "1px",
    radiusTop: "4px", // DSFR field: 4px top corners, 0 bottom (F3)
    underlineMode: "shadow" // DSFR draws its bottom rule as a box-shadow inset (F4)
  },
  // DSFR « Carte » (.fr-card) has NO border — its separation is a bottom filet /
  // shadow on the enclosing tile, not a 1px stroke. Drop the card border to 0
  // (the base keeps its 1px stroke via the builder fallback). Fill stays white
  // (surface.raised), matching the .fr-card background.
  card: {
    borderWidth: "0"
  }
} as const;

// --- semantic (DSFR-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: dsfrColor.grey[1000], // background default (white)
    subtle: dsfrColor.grey[975], // background alt
    raised: dsfrColor.grey[1000], // raised cards sit on white in DSFR light
    inverse: dsfrColor.grey[50], // dark inverse surface (title grey)
    overlay: "rgb(22 22 22 / 0.50)" // modal backdrop
  },
  text: {
    // DSFR `--text-default-grey` (body + form controls) is #3a3a3a (grey-200),
    // NOT the #161616 title grey. Our `text.primary` is consumed broadly as the
    // content/field text colour (Input/Select/Textarea/Card all read it), so it
    // maps to grey-200 #3a3a3a to match the real DSFR field/body text. The
    // heavier #161616 title grey stays available via `surface.inverse`. Contrast
    // of #3a3a3a on the #eeeeee field fill is ~8:1 (AA+), no a11y regression.
    primary: dsfrColor.grey[200], // body / control text (#3a3a3a, --text-default-grey)
    secondary: dsfrColor.grey[425], // secondary / mention text (#666)
    muted: dsfrColor.grey[625], // disabled / placeholder (#929292)
    inverse: dsfrColor.grey[1000], // text on dark / colored surfaces
    link: dsfrColor.blueFrance.sun113 // links use Bleu France
  },
  border: {
    subtle: dsfrColor.grey[950], // default subtle border (#eee)
    strong: dsfrColor.grey[425], // strong border (#666)
    interactive: dsfrColor.blueFrance.sun113 // focus / interactive (Bleu France)
  },
  action: {
    primary: dsfrColor.blueFrance.sun113, // primary button = Bleu France
    primaryHover: dsfrColor.blueFrance.hover, // Bleu France hover #1212ff (anatomy v1.1.0)
    primaryText: dsfrColor.grey[1000], // white text on Bleu France
    secondary: dsfrColor.blueFrance["925"], // light Bleu France secondary surface
    secondaryHover: dsfrColor.blueFrance["850"], // darker light Bleu France on hover
    secondaryText: dsfrColor.blueFrance.sun113, // Bleu France text on light secondary
    danger: dsfrColor.system.error // destructive = DSFR error red
  },
  feedback: {
    success: dsfrColor.system.success,
    warning: dsfrColor.system.warning,
    error: dsfrColor.system.error,
    info: dsfrColor.system.info
  },
  status: {
    pending: dsfrColor.system.warning,
    processing: dsfrColor.system.info,
    completed: dsfrColor.system.success,
    failed: dsfrColor.system.error
  },
  // Categorical data-vis palette built from the DSFR brand/illustration hues.
  // DSFR does not publish an 8-color sequential data-vis palette, so this is a
  // coherent proposal drawn from DSFR decorative color families (see MAPPING.md,
  // marked "à confirmer" — these are a sensible default, not an official scale).
  data: {
    category1: "#000091", // Bleu France
    category2: "#e1000f", // Rouge Marianne
    category3: "#009081", // green-emeraude
    category4: "#e4794a", // terre-battue
    category5: "#6a6af4", // blue-ecume
    category6: "#c8aa39", // yellow-tournesol
    category7: "#a558a0", // purple-glycine
    category8: "#465f9d" // blue-cumulus
  }
} as const;

/**
 * The DSFR theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry DSFR-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so DSFR's brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly. Reusing the base `component` would leave components on Sent Tech.
 */
export const dsfrTheme: TenantTheme = {
  id: "dsfr",
  label: "DSFR",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dsfrTheme;
