import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * GitHub Primer design system theme for the Sentropic token structure.
 *
 * All values below are taken from the PUBLIC Primer design system (Primer
 * Primitives are open source; the Mona Sans / Hubot Sans typefaces are GitHub's
 * open-source brand fonts — we only reference the font *names* here, never the
 * binaries). Sources are documented in MAPPING.md. Where Primer has no direct
 * equivalent for a Sentropic role, the closest Primer token is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Primer functional colour reference (light mode):
 *   White (canvas / bg default)        #ffffff   (--bgColor-default / --fgColor-onEmphasis)
 *   Grey muted (bg muted / inset)      #f6f8fa   (--bgColor-muted / --bgColor-inset)
 *   Neutral muted (chip / hover)       #eaeef2   (--bgColor-neutral-muted, resolved — à confirmer)
 *   Border default                     #d1d9e0   (--borderColor-default)
 *   Border emphasis / disabled fg      #818b98   (--borderColor-emphasis / --fgColor-disabled)
 *   Text muted / secondary             #59636e   (--fgColor-muted)
 *   Text default / primary             #1f2328   (--fgColor-default)
 *   Emphasis surface (inverse dark)    #25292e   (--bgColor-emphasis)
 *   Accent blue (link/focus/select)    #0969da   (--fgColor-accent / --fgColor-link / --bgColor-accent-emphasis)
 *   Green (PRIMARY button / success)   #1f883d   (--bgColor-success-emphasis / --button-primary-bgColor-rest)
 *   Coral (UnderlineNav active)        #fd8c73   (--underlineNav-borderColor-active)
 *   Danger red (button)                #cf222e   (--bgColor-danger-emphasis)
 *   Danger fg / error text             #d1242f   (--fgColor-danger)
 *   Attention amber                    #9a6700   (--fgColor-attention)
 *   Done / purple                      #8250df   (--fgColor-done)
 */

// --- Primer raw colour palette (public design primitives, light mode) -------
const githubColor = {
  // Accent blue — the interactive family: links, focus ring, selection.
  blue: {
    fg: "#0969da", // --fgColor-accent / --fgColor-link / --bgColor-accent-emphasis
    emphasis: "#0550ae", // darker accent for hover/active (Primer blue-7 — à confirmer)
    muted: "#ddf4ff" // --bgColor-accent-muted (light accent tint)
  },
  // Green — GitHub's PRIMARY action colour (buttons) and success.
  green: {
    emphasis: "#1f883d", // --bgColor-success-emphasis / --button-primary-bgColor-rest
    fg: "#1a7f37", // --fgColor-success (primary button hover)
    muted: "#dafbe1" // --bgColor-success-muted (light success tint)
  },
  // Coral — UnderlineNav active indicator / decorative "open" accent.
  coral: {
    fg: "#fd8c73", // --underlineNav-borderColor-active (active tab underline)
    severe: "#bc4c00", // --fgColor-severe (darker coral/orange)
    muted: "#fff1e5" // --bgColor-severe-muted (light tint — à confirmer)
  },
  // Red — danger / destructive.
  red: {
    emphasis: "#cf222e", // --bgColor-danger-emphasis (danger button fill)
    fg: "#d1242f", // --fgColor-danger (error text)
    muted: "#ffebe9" // --bgColor-danger-muted (light error tint)
  },
  purple: "#8250df", // --fgColor-done (done / sponsors / upsell accent)
  amber: "#9a6700", // --fgColor-attention (warning text)
  // Neutral grey scale (Primer functional greys, light mode).
  grey: {
    0: "#ffffff", // --bgColor-default / --fgColor-onEmphasis (white)
    50: "#f6f8fa", // --bgColor-muted / --bgColor-inset (subtle background)
    100: "#eaeef2", // --bgColor-neutral-muted resolved (chip / hover — à confirmer)
    150: "#eff2f5", // --control-bgColor-hover resolved (default-button hover — à confirmer)
    200: "#d1d9e0", // --borderColor-default
    400: "#818b98", // --borderColor-emphasis / --fgColor-disabled (strong border / muted)
    500: "#59636e", // --fgColor-muted (secondary text)
    800: "#25292e", // --bgColor-emphasis (dark inverse surface)
    900: "#1f2328" // --fgColor-default (primary text — darkest)
  }
} as const;

// --- foundation (Primer-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Primer's accent blue.
    blue: {
      10: githubColor.blue.muted, // #ddf4ff lightest accent tint
      60: githubColor.blue.fg, // #0969da accent (link/focus/selection)
      80: githubColor.blue.emphasis // #0550ae darker accent (hover)
    },
    // Primer has no dedicated cyan; the closest secondary accent is the coral
    // used by the active UnderlineNav indicator, so the Sentropic "cyan" slot is
    // mapped onto the GitHub coral/severe family.
    cyan: {
      10: githubColor.coral.muted, // #fff1e5 light coral tint
      50: githubColor.coral.fg, // #fd8c73 coral accent
      70: githubColor.coral.severe // #bc4c00 darker coral/orange
    },
    // Sentropic "slate" role family mapped onto the Primer grey scale.
    slate: {
      0: githubColor.grey[0], // white
      10: githubColor.grey[50], // #f6f8fa subtle background
      20: githubColor.grey[200], // #d1d9e0 default border
      60: githubColor.grey[500], // #59636e muted text
      80: githubColor.grey[800], // #25292e dark inverse surface
      90: githubColor.grey[900] // #1f2328 primary text (darkest)
    },
    feedback: {
      success: githubColor.green.fg, // #1a7f37
      warning: githubColor.amber, // #9a6700
      error: githubColor.red.fg, // #d1242f
      info: githubColor.blue.fg // #0969da
    }
  },
  // GitHub ships "Mona Sans" as the primary brand sans (the product
  // `--fontStack-sansSerif` now leads with 'Mona Sans VF'), "Hubot Sans" as the
  // expressive display companion, and the system `ui-monospace` stack for code
  // (`--fontStack-monospace`). We reference the font *names* only, not binaries.
  font: {
    sans: "'Mona Sans VF', 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    display: "'Hubot Sans', 'Mona Sans VF', 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Primer base spacing scale (--base-size-*) is a 4px/rem grid; mapped onto the
  // Sentropic spacing keys by px value.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  — --base-size-4
    2: "0.5rem", // 8px  — --base-size-8
    3: "0.75rem", // 12px — --base-size-12
    4: "1rem", // 16px — --base-size-16
    6: "1.5rem", // 24px — --base-size-24
    8: "2rem", // 32px — --base-size-32
    12: "3rem", // 48px — --base-size-48
    16: "4rem" // 64px — --base-size-64
  },
  // Primer radius: controls/inputs/cards use --borderRadius-medium (6px); small
  // chips use --borderRadius-small (3px); pills/labels are fully rounded.
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px  — --borderRadius-small
    md: "0.375rem", // 6px  — --borderRadius-medium (button / input / tabs)
    lg: "0.375rem", // 6px  — --borderRadius-medium (cards / .Box)
    pill: "999px" // labels / counters / state pills
  },
  // Primer elevation (--shadow-*): very light, neutral-tinted. Exact specs are
  // close to the published Primer shadow tokens ("à confirmer" against SCSS).
  shadow: {
    subtle: "0 1px 0 rgb(31 35 40 / 0.04)", // ~ --shadow-resting-small
    medium: "0 3px 6px rgb(140 149 159 / 0.15)", // ~ --shadow-resting-medium
    floating: "0 8px 24px rgb(140 149 159 / 0.2)" // ~ --shadow-floating-small
  },
  // Primer transitions are quick (≈80ms). Durations are not heavily tokenised
  // publicly; kept conservative and aligned with GitHub's button timing.
  motion: {
    fast: "80ms",
    normal: "120ms",
    slow: "240ms",
    easing: "cubic-bezier(0.33, 1, 0.68, 1)"
  },
  // z-index roles are not Primer-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Primer) -----------------------------------------
  // Primer borders: most controls use a 1px stroke (--borderWidth-default 1px);
  // the heavier accent is 2px (--borderWidth-thick).
  borderWidth: {
    none: "0",
    thin: "1px", // --borderWidth-default
    thick: "2px" // --borderWidth-thick
  },
  borderStyle: { solid: "solid" },
  // Primer control density (--control-*-size). md = 32px is the default GitHub
  // control height; sm = 28px, lg = 40px. GitHub UI text is compact (14px).
  // Fields read md.paddingBlock (vertical, GitHub input ≈5px) and sm.paddingInline
  // (inline, GitHub input 12px); buttons read md.paddingInline (12px).
  density: {
    sm: { controlHeight: "1.75rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "1.75rem", fontSize: "0.75rem" }, // 28px / 12px
    md: { controlHeight: "2rem", paddingBlock: "0.3125rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // 32px / 5px·12px / 14px
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" } // 40px / 16px
  },
  // Primer typography = Mona Sans. Buttons are medium (500), labels semibold
  // (600), body/fields normal (400). GitHub UI base size = 14px, line-height 1.5.
  typography: {
    control: { family: "'Mona Sans VF', 'Mona Sans', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Mona Sans VF', 'Mona Sans', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Mona Sans VF', 'Mona Sans', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // GitHub links are NOT underlined at rest; the underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.6", // GitHub dims disabled controls (also recolours to muted — à confirmer)
  transition: { property: "color, background-color, border-color, box-shadow", duration: "80ms", easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.25rem" }, // GitHub Octicons default 16px
  // Primer FOCUS = a 2px solid accent OUTLINE drawn inset (outline-offset -2px),
  // the published Primer `focusOutline` technique (outline, not box-shadow).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "-2px", // Primer draws the focus outline INSET on filled controls
    color: githubColor.blue.fg, // #0969da accent ring
    inset: "0"
  },
  // GitHub form fields (.form-control) are BOXED (outline): a white fill, a 1px
  // grey border (--borderColor-default) and a 6px radius (not a filled-underline).
  // `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: githubColor.grey[0], // #ffffff
    underlineColor: githubColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select> (.form-select): redraw the chevron in the muted grey with a
    // ~32px right gutter; appearance:none lets the anatomy line-height take effect.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2359636e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.5rem center",
    selectPaddingRight: "2rem"
  },
  // GitHub cards (.Box): a 1px grey border + 6px radius; list rows tint to the
  // muted grey on hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: githubColor.grey[50] // #f6f8fa
  },
  // GitHub "default" button = a FILLED light-grey button with a 1px border (NOT
  // a transparent outline): bg #f6f8fa, border #d1d9e0, dark text, slightly
  // darker grey fill on hover.
  buttonSecondary: {
    background: githubColor.grey[50], // #f6f8fa fill
    border: githubColor.grey[200], // #d1d9e0 stroke
    hoverBackground: githubColor.grey[150] // #eff2f5 hover fill (à confirmer)
  },
  // GitHub UnderlineNav (repo tabs): active tab = dark semibold label with a
  // bottom border indicator, transparent fill. NOTE: the builder ties the
  // indicator COLOUR to `action.primary` (green here); GitHub's real active
  // underline is coral #fd8c73 — see MAPPING.md "à confirmer / limitations".
  tabs: {
    activeText: githubColor.grey[900], // #1f2328 dark active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // GitHub underline sits on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // GitHub pagination (.pagination): borderless page links in accent blue; the
  // current page is a filled accent-blue square with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: githubColor.blue.fg, // #0969da link text
    activeBackground: githubColor.blue.fg, // #0969da filled current page
    activeText: githubColor.grey[0], // white on accent
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // GitHub breadcrumb (.breadcrumb-item): accent-blue links, muted trail, dark
  // bold current page, muted "/" separators.
  breadcrumb: {
    linkText: githubColor.blue.fg, // #0969da
    text: githubColor.grey[500], // #59636e trail text
    currentText: githubColor.grey[900], // #1f2328 current page
    separator: githubColor.grey[500], // #59636e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // GitHub flash / alert (.flash): a tinted box with a 1px border and 6px radius
  // (full box, not a left filet). The exact severity tints/border colour are the
  // base feedback colours — exact .flash anatomy is "à confirmer" in MAPPING.
  alert: {
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // GitHub disclosure (<details> / .Details): dark semibold summary trigger.
  accordion: {
    text: githubColor.grey[900], // #1f2328 summary label
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "600", // GitHub summary is semibold
    lineHeight: "1.25rem" // 20px
  },
  // GitHub Counter / topic chip: a small pill-rounded grey chip.
  tag: {
    radius: "999px", // GitHub Label/Counter is fully rounded
    paddingBlock: "0", // 0
    paddingInline: "0.5rem", // 7–8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.25rem", // 20px
    neutralBackground: githubColor.grey[100], // #eaeef2 (--bgColor-neutral-muted resolved)
    neutralText: githubColor.grey[900] // #1f2328
  },
  // GitHub State label (.State): a filled pill badge (not uppercase).
  badge: {
    radius: "999px", // State label is fully rounded
    paddingBlock: "0", // 0
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: githubColor.blue.fg, // #0969da accent info badge
    infoText: githubColor.grey[0] // white
  },
  // GitHub checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: githubColor.grey[900] // #1f2328
  },
  // GitHub search input.
  search: {
    paddingBlock: "0.3125rem", // 5px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // GitHub ToggleSwitch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: githubColor.grey[900] // #1f2328
  }
} as const;

// --- semantic (Primer-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: githubColor.grey[0], // white (--bgColor-default)
    subtle: githubColor.grey[50], // #f6f8fa (--bgColor-muted)
    raised: githubColor.grey[0], // white
    inverse: githubColor.grey[800], // #25292e (--bgColor-emphasis)
    overlay: "rgb(31 35 40 / 0.5)" // modal backdrop (fg default tint)
  },
  text: {
    primary: githubColor.grey[900], // #1f2328 (--fgColor-default)
    secondary: githubColor.grey[500], // #59636e (--fgColor-muted)
    muted: githubColor.grey[400], // #818b98 (--fgColor-disabled)
    inverse: githubColor.grey[0], // white on dark / coloured surfaces
    link: githubColor.blue.fg // #0969da (--fgColor-link)
  },
  border: {
    subtle: githubColor.grey[200], // #d1d9e0 (--borderColor-default)
    strong: githubColor.grey[400], // #818b98 (--borderColor-emphasis)
    interactive: githubColor.blue.fg // #0969da accent (focus/interactive)
  },
  action: {
    primary: githubColor.green.emphasis, // #1f883d GitHub PRIMARY button (green)
    primaryHover: githubColor.green.fg, // #1a7f37 darker green hover
    primaryText: githubColor.grey[0], // white text on green
    secondary: githubColor.grey[50], // #f6f8fa default-button fill
    secondaryHover: githubColor.grey[150], // #eff2f5 default-button hover
    secondaryText: githubColor.grey[900], // #1f2328 dark default-button text
    danger: githubColor.red.emphasis // #cf222e danger button (--bgColor-danger-emphasis)
  },
  feedback: {
    success: githubColor.green.fg, // #1a7f37
    warning: githubColor.amber, // #9a6700
    error: githubColor.red.fg, // #d1242f
    info: githubColor.blue.fg // #0969da
  },
  status: {
    pending: githubColor.amber, // #9a6700
    processing: githubColor.blue.fg, // #0969da
    completed: githubColor.green.fg, // #1a7f37
    failed: githubColor.red.fg // #d1242f
  },
  // Categorical data-vis palette built from Primer brand hues. Primer publishes
  // a data-viz scale, but this is a coherent proposal from its functional hues
  // (see MAPPING.md, "à confirmer" — not the exact published sequential scale).
  data: {
    category1: githubColor.blue.fg, // accent blue #0969da
    category2: githubColor.coral.fg, // coral #fd8c73
    category3: githubColor.purple, // purple #8250df
    category4: githubColor.green.emphasis, // green #1f883d
    category5: githubColor.amber, // amber #9a6700
    category6: githubColor.coral.severe, // severe orange #bc4c00
    category7: githubColor.red.fg, // red #d1242f
    category8: githubColor.grey[500] // muted grey #59636e
  }
} as const;

/**
 * The GitHub Primer theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Primer-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so GitHub's brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly. Reusing the base `component` would leave components on Sent Tech.
 */
export const githubTheme: TenantTheme = {
  id: "github",
  label: "GitHub",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default githubTheme;
