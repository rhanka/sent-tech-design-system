import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * DIALOGUE (dialogue.co — the Montréal virtual-care / well-being platform) theme
 * for the Sentropic token structure.
 *
 * Dialogue's marketing site is a HubSpot theme ("Dialogue_May2020") that ships no
 * `--*` design-token custom properties; every value below is therefore MEASURED
 * directly from the live, served CSS rules — the template stylesheet
 * `template_Dialogue_May2020-style.css` plus the header/menu and login-menu module
 * bundles (`module_Dialogue_Aug2022_Menu`, `module_Dialogue_May2021_Login_Menu`),
 * read from real element rules: `body`, `h1`–`h6`, `a`, the `.custom-blue-btn`
 * and `.hs-button.primary` CTAs, the global `input/textarea/select` field block,
 * the `.c--secondary` text class and the `#DDD7E0` dividers. We reference the font
 * *names* only ("Roboto" body + "Poynter Oldstyle Disp Semi Bd" display), never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Dialogue's identity is a CALM, HUMAN HEALTH-TECH system, but the brand it
 * actually ships is WARMER than a generic clinical teal/green: a TERRACOTTA/coral
 * accent (#dd7146) carries links and the marketing CTAs, ink is a soft near-black
 * (#212120, never pure black), the secondary voice is a PURPLE-NAVY (#534f70) with
 * a soft lavender-grey muted tone (#7e79a3), surfaces are white over a faint
 * LAVENDER page (#f9f7fa) with a warm CREAM accent panel (#ffefe2), corners are
 * SOFTLY ROUNDED (pill 30px CTAs, ~5px on small controls), headings are set in the
 * serif "Poynter Oldstyle Display Semi Bold" while body/UI is Roboto, form fields
 * are FILLED-UNDERLINE (white fill, a single bottom rule that turns the brand's
 * bright BLUE #1fa5ff on focus/hover) and that same bright blue is the brand's
 * interactive/focus accent (also the text-selection highlight). Where Sentropic
 * needs a role Dialogue does not publish, the closest measured value is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Dialogue colour reference (measured, light theme):
 *   Terracotta / coral (action / link / brand)  #dd7146   a {color}, .custom-blue-btn background
 *   Coral hover tint                             #f79574   .custom-orange-btn background (lighter coral)
 *   Coral wash                                   #fabaa4   coral surface/border wash
 *   Bright blue (interactive / focus / accent)   #1fa5ff   input:focus border-bottom-color, .custom-blue-btn accents
 *   Selection blue                               #3399ff   ::selection background
 *   Ink default (text primary / headings)        #212120   body / h1–h6 color
 *   Ink contrast                                 #000000   pure black (rare)
 *   Secondary ink (purple-navy)                  #534f70   .c-- / nav / secondary text
 *   Muted ink (lavender-grey)                    #7e79a3   .c--secondary, .custom-logo
 *   White (surface default)                      #ffffff   input/card background
 *   Lavender page (subtle surface)               #f9f7fa   section background-color
 *   Cream panel (warm accent surface)            #ffefe2   panel/banner background, on-dark text
 *   Lavender divider / border                    #ddd7e0   border-top/​bottom 1px dividers
 *   Light purple-grey                            #c4c4c4   neutral grey
 *   Roboto grey body alt                         #495057   alt body ink (bootstrap-derived rows)
 */

// --- DIALOGUE raw colour palette (measured from served HubSpot CSS) ----------
const dialogueColor = {
  // The warm coral/terracotta IS Dialogue's marketing accent: every text link
  // (`a { color: #DD7146 }`) and the primary marketing CTA (`.custom-blue-btn`,
  // despite its name) render this hue.
  coral: {
    500: "#dd7146", // a {color} / .custom-blue-btn background — THE Dialogue coral accent
    400: "#f79574", // .custom-orange-btn background — lighter coral (hover/secondary fill)
    300: "#fabaa4", // coral wash (background-color / border-color)
    100: "#ffefe2" // warm cream panel (background) / on-dark text — faint coral tint
  },
  // Dialogue's bright interactive blue — the field-underline focus colour and the
  // brand's "active/interactive" cue. Distinct from the coral brand accent, so the
  // focus indicator stays visible on coral controls.
  blue: {
    500: "#1fa5ff", // input:focus/hover border-bottom-color — interactive / focus accent
    400: "#3399ff", // ::selection background (text-highlight blue)
    600: "#008deb" // darker step of the bright blue (deeper accent)
  },
  // Soft near-black ink (Dialogue never uses pure black for body text or headings).
  ink: {
    default: "#212120", // body / h1–h6 color — primary text (soft near-black)
    contrast: "#000000" // pure black (rare, high-contrast only)
  },
  // Purple-navy secondary/muted voice (Dialogue's calm, human secondary tone).
  purple: {
    secondary: "#534f70", // .c-- / nav secondary text (purple-navy)
    muted: "#7e79a3" // .c--secondary / .custom-logo — soft lavender-grey muted text
  },
  // Lavender-tinted neutral scale (Dialogue's cool greys carry a faint violet).
  grey: {
    50: "#f9f7fa", // section background-color — faint lavender page
    200: "#ddd7e0", // border-top/bottom 1px dividers — lavender divider
    300: "#c4c4c4", // neutral grey
    400: "#939393", // mid grey
    bodyAlt: "#495057" // alt body ink in bootstrap-derived rows
  },
  white: "#ffffff" // input/card/surface default
} as const;

// --- foundation (DIALOGUE-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Dialogue's PRIMARY
    // marketing ACTION is the coral CTA, so the action steps map to the coral
    // scale; the lightest step is the warm cream tint.
    blue: {
      10: dialogueColor.coral[100], // #ffefe2 cream tint
      60: dialogueColor.coral[500], // #dd7146 THE Dialogue coral (primary action)
      80: dialogueColor.ink.default // #212120 soft-black (hover/active/border ground)
    },
    // Sentropic "cyan" accent slot — mapped to Dialogue's bright INTERACTIVE BLUE
    // (the real field-focus / accent hue, #1fa5ff), which is genuinely a cool
    // accent distinct from the coral brand.
    cyan: {
      10: dialogueColor.grey[50], // #f9f7fa faint lavender tint
      50: dialogueColor.blue[500], // #1fa5ff bright interactive blue
      70: dialogueColor.blue[600] // #008deb darker blue step
    },
    // Sentropic "slate" neutral family mapped onto Dialogue's lavender-tinted grey
    // ramp and soft-black ink.
    slate: {
      0: dialogueColor.white, // #ffffff white
      10: dialogueColor.grey[50], // #f9f7fa lavender page
      20: dialogueColor.grey[200], // #ddd7e0 divider / subtle border
      60: dialogueColor.purple.muted, // #7e79a3 muted text (lavender-grey)
      80: dialogueColor.ink.default, // #212120 primary text (soft near-black)
      90: dialogueColor.ink.contrast // #000000 contrast black
    },
    feedback: {
      success: "#1f9d6b", // calm health green (AA on white) — see MAPPING "à confirmer"
      warning: "#b07a1a", // amber (AA-grade) — à confirmer
      error: "#c0392b", // measured-adjacent red — à confirmer
      info: dialogueColor.blue[600] // #008deb bright-blue info (measured accent)
    }
  },
  // Dialogue serves Roboto for all body / UI / fields and the serif "Poynter
  // Oldstyle Display Semi Bold" for every heading and the marketing-CTA label
  // (measured `font-family` on `body`, `h1`–`h6` and `.custom-blue-btn`). We
  // reference the NAMES only with the brand's own fallbacks. Mono is not part of
  // Dialogue — the Sentropic mono stack is kept.
  font: {
    sans: "'Roboto', sans-serif",
    display: "'Poynter Oldstyle Disp Semi Bd', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Dialogue spacing — the served CSS uses an 8px-ish rhythm (16/24/32/72/96px
  // measured paddings). Aligned here to the Sentropic step keys (4px base ramp);
  // exact tokenised steps are not published (à confirmer).
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px (measured form-field gap)
    6: "1.5rem", // 24px (measured card padding)
    8: "2rem", // 32px (measured)
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Dialogue rounds SOFTLY: marketing CTAs are full PILLS (measured 30px radius),
  // small controls/cards use ~5px (the most common measured radius), inputs are
  // effectively square (bottom-rule fields). Mapped to the Sentropic ramp.
  radius: {
    none: "0", // square (the filled-underline input)
    sm: "3px", // measured small-control radius
    md: "5px", // measured most-common control/card radius
    lg: "12px", // larger surfaces
    pill: "999px" // pill CTAs (measured 30px → fully rounded role)
  },
  // Dialogue elevation is light and diffuse on its airy lavender/white surfaces.
  // Exact shadow tokens are not published; a soft 3-step ramp aligned to the base
  // (à confirmer).
  shadow: {
    subtle: "0px 1px 2px rgb(83 79 112 / 0.08)", // tinted with the purple-navy ink
    medium: "0px 4px 12px rgb(83 79 112 / 0.10)",
    floating: "0px 12px 32px rgb(83 79 112 / 0.14)"
  },
  // Dialogue transitions are short (measured `transition: linear .4s` on CTAs and
  // `.15s ease-in-out` on fields). Kept aligned to the base; exact steps à confirmer.
  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms", // measured CTA transition (linear .4s)
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Dialogue-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (DIALOGUE) ---------------------------------------
  // Dialogue dividers are 1px solid #ddd7e0 (measured `border-top/​bottom`); the
  // field rule is a single bottom border. Thin = 1px, thick = 2px for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // measured 1px dividers / field underline
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Dialogue control density. Measured marketing CTA = ~58px tall (15–17px block
  // padding, 40px inline, 24px serif label); the global field is compact (4px
  // block padding, 14px Roboto text). md targets a comfortable ~44px control.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0.9375rem", paddingInline: "2.5rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1.125rem" }
  },
  // Dialogue typography. CONTROL labels (the marketing CTA) are set in the SERIF
  // display face at 24px/regular (measured `.custom-blue-btn`). Body/field text is
  // Roboto regular (400); fields are 14px (measured). Labels are Roboto medium.
  typography: {
    control: { family: "'Poynter Oldstyle Disp Semi Bd', Georgia, serif", size: "1.125rem", weight: "400", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', sans-serif", size: "1rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Dialogue links are coral with NO underline at rest (measured `a {
    // text-decoration: none; color: #DD7146 }`); they darken to the ink on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.45", // Dialogue dims disabled controls (no published token — à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "250ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // DIALOGUE FOCUS = the bright interactive BLUE (#1fa5ff). The real field draws
  // its focus as the bottom-rule turning blue (`input:focus { border-bottom-color:
  // #1FA5FF }`); for the generic focus indicator we encode a matching blue ring,
  // deliberately NOT the coral brand, so it stays visible on coral controls.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: dialogueColor.blue[500], // #1fa5ff — bright interactive blue focus
    inset: "0"
  },
  // DIALOGUE form fields are FILLED-UNDERLINE: a white fill with a SINGLE bottom
  // rule (measured `border-top/left/right: none; border-bottom`) that is invisible
  // at rest and turns the brand bright blue #1fa5ff on focus/hover. `underlineMode:
  // "border"` draws a real bottom border; the native <select> chevron is redrawn in
  // the soft-black ink with a 36px right gutter (measured `appearance: none`).
  field: {
    style: "filled-underline",
    fillBg: dialogueColor.white, // #ffffff white fill (measured input background)
    underlineColor: dialogueColor.grey[200], // #ddd7e0 resting underline (lavender) — focus turns blue
    underlineWidth: "1px",
    underlineMode: "border", // a real bottom border (not a box-shadow inset)
    radiusTop: "0",
    radiusBottom: "0",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23212120' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Dialogue cards: white surface, softly rounded (5px), a lavender divider border
  // and a faint lavender-page hover (the measured section background).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: dialogueColor.grey[50] // #f9f7fa faint lavender hover
  },
  // Dialogue secondary CTA = OUTLINED coral ghost: transparent fill, coral text +
  // coral border, soft coral wash on hover (the measured coral CTA family).
  buttonSecondary: {
    background: "transparent",
    border: dialogueColor.coral[500], // #dd7146 coral stroke
    hoverBackground: dialogueColor.coral[100] // #ffefe2 cream fill on hover
  },
  // Dialogue tabs / sub-nav: active tab = coral bold label with a coral bottom
  // indicator, transparent fill.
  tabs: {
    activeText: dialogueColor.coral[500], // #dd7146 active label (brand coral)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // coral underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Dialogue pagination: borderless coral link text; active page = filled coral
  // pill with cream/dark text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: dialogueColor.coral[500], // #dd7146 link text
    activeBackground: dialogueColor.coral[500], // #dd7146 filled active page (brand coral)
    activeText: dialogueColor.coral[100], // #ffefe2 cream on coral (measured CTA on-dark)
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Dialogue breadcrumb: coral links, purple-navy trail, soft-black current page.
  breadcrumb: {
    linkText: dialogueColor.coral[500], // #dd7146
    text: dialogueColor.purple.secondary, // #534f70 trail text (purple-navy)
    currentText: dialogueColor.ink.default, // #212120 current page
    separator: dialogueColor.purple.muted, // #7e79a3
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Dialogue notice / alert: a tinted box with a coloured left filet matching the
  // severity (no published alert token — modelled on the calm health palette).
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
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Dialogue accordion / disclosure: a serif soft-black summary trigger, softly
  // rounded, lavender-separated.
  accordion: {
    text: dialogueColor.ink.default, // #212120 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1.125rem", // 18px (measured body size)
    fontWeight: "400", // Dialogue display face carries weight, not 700
    lineHeight: "1.5rem" // 24px
  },
  // Dialogue tag: a soft PILL chip with a cream fill and coral ink (the warm
  // accent tone).
  tag: {
    radius: "999px", // Dialogue chips round fully (pill CTA signature)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: dialogueColor.coral[100], // #ffefe2 cream fill
    neutralText: dialogueColor.coral[500] // #dd7146 coral ink
  },
  // Dialogue badge: a small filled badge — coral fill / cream text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: dialogueColor.coral[500], // #dd7146 brand coral
    infoText: dialogueColor.coral[100] // #ffefe2 cream on coral
  },
  // Dialogue checkbox/radio label: regular soft-black Roboto at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: dialogueColor.ink.default // #212120
  },
  // Dialogue search input: a filled-underline field, base type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Dialogue toggle / switch label: regular soft-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: dialogueColor.ink.default // #212120
  }
} as const;

// --- semantic (DIALOGUE-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: dialogueColor.white, // #ffffff white (measured input/card background)
    subtle: dialogueColor.grey[50], // #f9f7fa lavender page (measured section bg)
    raised: dialogueColor.white, // #ffffff white
    inverse: dialogueColor.ink.default, // #212120 dark inverse surface (measured dark CTA/menu bg)
    overlay: "rgb(33 33 32 / 0.6)" // modal backdrop — tinted with the soft-black ink
  },
  text: {
    primary: dialogueColor.ink.default, // #212120 (measured body / heading colour, soft near-black)
    secondary: dialogueColor.purple.secondary, // #534f70 purple-navy secondary voice
    muted: dialogueColor.purple.muted, // #7e79a3 lavender-grey muted (.c--secondary)
    inverse: dialogueColor.coral[100], // #ffefe2 cream on dark (measured on-dark text)
    link: dialogueColor.coral[500] // #dd7146 coral link (measured a {color})
  },
  border: {
    subtle: dialogueColor.grey[200], // #ddd7e0 lavender divider (measured 1px border)
    strong: dialogueColor.purple.muted, // #7e79a3 stronger lavender-grey stroke
    interactive: dialogueColor.blue[500] // #1fa5ff bright interactive blue (field-focus rule)
  },
  action: {
    primary: dialogueColor.coral[500], // #dd7146 THE Dialogue coral CTA
    primaryHover: dialogueColor.ink.default, // #212120 — measured CTA hover (darkens to ink)
    primaryText: dialogueColor.coral[100], // #ffefe2 cream text on coral (measured CTA on-dark)
    secondary: dialogueColor.grey[50], // #f9f7fa lavender secondary surface
    secondaryHover: dialogueColor.grey[200], // #ddd7e0
    secondaryText: dialogueColor.purple.secondary, // #534f70 purple-navy secondary label
    danger: foundation.color.feedback.error // #c0392b (à confirmer — no published error token)
  },
  feedback: {
    success: foundation.color.feedback.success, // #1f9d6b
    warning: foundation.color.feedback.warning, // #b07a1a
    error: foundation.color.feedback.error, // #c0392b
    info: foundation.color.feedback.info // #008deb (measured bright-blue accent)
  },
  status: {
    pending: foundation.color.feedback.warning, // #b07a1a
    processing: dialogueColor.blue[500], // #1fa5ff bright interactive blue
    completed: foundation.color.feedback.success, // #1f9d6b
    failed: foundation.color.feedback.error // #c0392b
  },
  // Categorical data-vis palette. Dialogue publishes no categorical token list; the
  // eight categories are seeded from the measured brand hues — coral, bright blue,
  // purple-navy, calm green, the cream/coral washes and the muted lavender — for a
  // warm, human health-tech scale. See MAPPING.md "à confirmer".
  data: {
    category1: dialogueColor.coral[500], // #dd7146 brand coral
    category2: dialogueColor.blue[500], // #1fa5ff bright interactive blue
    category3: dialogueColor.purple.secondary, // #534f70 purple-navy
    category4: foundation.color.feedback.success, // #1f9d6b calm health green
    category5: dialogueColor.coral[400], // #f79574 lighter coral
    category6: dialogueColor.blue[600], // #008deb deeper blue
    category7: dialogueColor.purple.muted, // #7e79a3 lavender-grey
    category8: dialogueColor.coral[300] // #fabaa4 coral wash
  }
} as const;

/**
 * The DIALOGUE theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Dialogue-specific (coral-on-white health-tech)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Dialogue's coral CTA, soft-black
 * ink, purple-navy secondary voice, filled-underline fields and bright-blue focus
 * reach the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const dialogueTheme: TenantTheme = {
  id: "dialogue",
  label: "Dialogue",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dialogueTheme;
