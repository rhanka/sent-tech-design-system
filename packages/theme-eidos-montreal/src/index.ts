import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Eidos-Montréal (eidosmontreal.com — the AAA game studio behind Deus Ex:
 * Mankind Divided, Shadow of the Tomb Raider, Guardians of the Galaxy) theme for
 * the Sentropic token structure.
 *
 * Eidos-Montréal publishes no design-token file; the values below are MEASURED
 * from the live studio site's computed CSS (https://www.eidosmontreal.com,
 * inspected in a real browser). We only reference the font *names* here, never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Eidos-Montréal's identity is a MINIMAL MONOCHROME system: a clean, almost
 * editorial black-on-white studio look built on a neutral grotesk, a measured
 * neutral grey scale (#f8f8f8 subtle, #d5d5d5 / #c4c4c4 hairlines, #a2a2a2
 * muted), a deep studio-black inverse surface, and a near-pure-white page
 * (measured theme-color #ffffff). The brand reads almost entirely greyscale.
 *
 * The single WARM ORANGE STUDIO ACCENT (#e8552d) is À CONFIRMER: Eidos publishes
 * a largely monochrome site, and this warm orange is INFERRED FROM THE EIDOS
 * BRAND MARK (the logo's orange glyph), not measured from a CTA on the live
 * site. It is used here as the primary action / focus / active accent so the
 * Sentropic roles that *require* a brand hue have a coherent, on-brand value.
 * Treat every orange role as "à confirmer" until a real CTA colour is measured.
 *
 * Eidos-Montréal colour reference (measured monochrome + inferred accent):
 *   Orange accent (action / CTA)       #e8552d   warm studio orange — À CONFIRMER (from brand mark)
 *   Orange accent hover                #c8431f   darker orange — À CONFIRMER (derived −shade)
 *   White (surface default)            #ffffff   page background / measured theme-color
 *   Ink — primary text                 #1d1d1d   near-black studio ink
 *   Secondary text                     #5a5a5a   mid grey secondary text
 *   Deep studio black (inverse)        #1a1a1a   deep black inverse surface / footer
 *   Subtle fill surface                #f8f8f8   measured lightest neutral
 *   Field / strong border              #c4c4c4   measured hairline border
 *   Light divider                      #d5d5d5   measured light divider
 *   Muted text / disabled              #a2a2a2   measured muted grey
 */

// --- Eidos-Montréal raw colour palette (measured monochrome + inferred accent)
const eidosColor = {
  // The warm orange STUDIO ACCENT. À CONFIRMER — inferred from the Eidos brand
  // mark (the orange logo glyph), NOT measured from a CTA on the live site,
  // which is largely monochrome. Used as the primary action / focus / active hue.
  orange: "#e8552d", // warm studio orange CTA — À CONFIRMER (brand mark)
  orangeHover: "#c8431f", // darker orange on hover — À CONFIRMER (derived shade)
  white: "#ffffff", // page background — surface default (measured theme-color)
  // Near-black studio ink scale (measured from real elements).
  ink: {
    primary: "#1d1d1d", // near-black studio ink — body / heading text
    secondary: "#5a5a5a", // mid grey — secondary text
    muted: "#a2a2a2" // measured muted grey — muted text / disabled
  },
  // Deep studio black used for the inverse surface / footer band.
  black: "#1a1a1a", // deep studio black — inverse surface
  // Measured neutral surface / line greys (the monochrome backbone).
  grey: {
    subtle: "#f8f8f8", // measured lightest neutral — subtle fill surface
    divider: "#d5d5d5", // measured light divider
    border: "#c4c4c4" // measured field / strong hairline border
  },
  // Eidos shows essentially no decorative colour beyond the brand orange, so it
  // publishes no success/warning/error/info hues. These are restrained, legible
  // (WCAG AA on white) system colours kept quiet against the minimal aesthetic.
  // The danger red (#d32f2f) is the task-specified system danger; the rest are
  // "à confirmer" — Eidos has no measured equivalent.
  system: {
    danger: "#d32f2f", // material-grade red — error / danger (à confirmer)
    success: "#2e7d32", // muted green — à confirmer (no Eidos source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1a1a1a" // Eidos would use its studio black, not blue — à confirmer
  }
} as const;

// --- foundation (Eidos-Montréal-specific values) ----------------------------
const foundation = {
  color: {
    // Eidos has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the warm orange accent + monochrome ink
    // scale — the Eidos primary action IS the orange. (à confirmer: orange is
    // inferred from the brand mark, see header note.)
    blue: {
      10: eidosColor.grey.subtle, // #f8f8f8 lightest neutral tint
      60: eidosColor.orange, // #e8552d primary action (warm orange CTA — à confirmer)
      80: eidosColor.orangeHover // #c8431f darker orange step (à confirmer)
    },
    // Eidos has no cyan/accent. The Sentropic "cyan" accent slot is mapped to the
    // orange + monochrome scale (no decorative cyan exists). (à confirmer.)
    cyan: {
      10: eidosColor.grey.subtle, // #f8f8f8 light neutral tint
      50: eidosColor.orange, // #e8552d the studio accent (à confirmer)
      70: eidosColor.orangeHover // #c8431f (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Eidos monochrome ink/grey
    // scale.
    slate: {
      0: eidosColor.white, // #ffffff white
      10: eidosColor.grey.subtle, // #f8f8f8 subtle fill surface
      20: eidosColor.grey.border, // #c4c4c4 hairline / subtle border
      60: eidosColor.ink.secondary, // #5a5a5a secondary text
      80: eidosColor.ink.primary, // #1d1d1d primary text (near-black ink)
      90: eidosColor.black // #1a1a1a deep studio black
    },
    feedback: {
      success: eidosColor.system.success,
      warning: eidosColor.system.warning,
      error: eidosColor.system.danger,
      info: eidosColor.system.info
    }
  },
  // Eidos-Montréal sets its UI in a CLEAN STUDIO GROTESK — measured as a neutral
  // sans (we reference "'Inter', Helvetica, Arial, sans-serif"; exact face
  // à confirmer — the live site loads a near-identical custom grotesk). We
  // reference the *names* only. Mono is not part of Eidos — the Sentropic mono
  // stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Eidos' grid is whitespace-generous but its raw
  // spacing steps are not strongly tokenised publicly; kept aligned with the
  // Sentropic base 4px scale ("à confirmer" exact steps).
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
  // Eidos rounding is SHARP / STUDIO — measured square-to-minimal corners on
  // controls and cards (a crisp, modern game-studio look), softening only
  // slightly on larger panels. (Exact steps à confirmer; pill kept at 999px.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square (sharp studio)
    md: "2px", // button / input / tabs — minimal 2px
    lg: "6px", // cards / panels — soft 6px
    pill: "999px" // tags / pills
  },
  // Eidos elevation is restrained — it relies on hairlines and whitespace, with
  // soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Eidos animates with short, standard eases (≈ 150ms transitions; à confirmer
  // exact durations — not fully tokenised publicly).
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Eidos-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Eidos-Montréal) ---------------------------------
  // Eidos borders are thin neutral-grey hairlines (#c4c4c4 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Eidos hairline (#c4c4c4)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Eidos control density. CTA buttons sit ~44px tall with generous horizontal
  // padding; nav/body text is mid-sized grotesk. md targets a ~44px touch
  // height; sm/lg bracket it (à confirmer exact metrics).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Eidos typography = the clean grotesk. Control labels are mid-weight sans;
  // body/field text is sentence case. CTAs read UPPERCASE-tracked on the live
  // site (the studio's modern, game-marketing tone — à confirmer exact tracking).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Eidos links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Eidos dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Eidos FOCUS = a warm orange OUTLINE. We encode the orange outline strategy.
  // focus.color = #e8552d (the studio accent — à confirmer, inferred from mark).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: eidosColor.orange, // #e8552d — Eidos focuses in the studio orange (à confirmer)
    inset: "0"
  },
  // Eidos form fields are BOXED (outline): a white fill with a thin neutral-grey
  // hairline border and minimal rounding. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #c4c4c4 @1px hairline.
  field: {
    style: "outline",
    fillBg: eidosColor.white, // #ffffff
    underlineColor: eidosColor.grey.border, // #c4c4c4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the studio ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231d1d1d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Eidos cards: minimal-to-soft rounding (6px lg), a thin neutral hairline
  // rather than a heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: eidosColor.grey.subtle // #f8f8f8 faint hover tint
  },
  // Eidos secondary button = a soft-grey filled chip (light #f8f8f8 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the orange
  // primary.
  buttonSecondary: {
    background: eidosColor.grey.subtle, // #f8f8f8 soft fill
    border: eidosColor.grey.border, // #c4c4c4 light hairline
    hoverBackground: eidosColor.grey.divider // #d5d5d5 on hover
  },
  // Eidos tabs / sub-nav: active tab = orange-accented label with an orange
  // bottom underline (the studio indicator), transparent fill. (orange à confirmer)
  tabs: {
    activeText: eidosColor.orange, // #e8552d (à confirmer)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // orange underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Eidos pagination: borderless ink text links; active page = filled orange box
  // with white text (the studio accent as the active fill — à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: eidosColor.ink.primary, // #1d1d1d link text
    activeBackground: eidosColor.orange, // #e8552d filled active page (à confirmer)
    activeText: eidosColor.white, // white on orange
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Eidos breadcrumb: ink links, grey trail, orange current page, grey
  // separators — all grotesk type. (orange current à confirmer)
  breadcrumb: {
    linkText: eidosColor.ink.primary, // #1d1d1d
    text: eidosColor.ink.secondary, // #5a5a5a trail text
    currentText: eidosColor.orange, // #e8552d current page (à confirmer)
    separator: eidosColor.ink.secondary, // #5a5a5a
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Eidos notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.125rem", // 2px ::before accent bar (thin, minimal)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Eidos accordion / disclosure: an ink, plain-weight grotesk summary trigger,
  // minimal rounding, hairline separated.
  accordion: {
    text: eidosColor.ink.primary, // #1d1d1d summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid weight grotesk
    lineHeight: "1.25rem" // 20px
  },
  // Eidos tag: a small soft-grey chip with minimal rounding.
  tag: {
    radius: "2px", // minimal rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: eidosColor.grey.subtle, // #f8f8f8 subtle fill
    neutralText: eidosColor.ink.primary // #1d1d1d
  },
  // Eidos badge: a small filled badge — orange fill / white text, uppercase,
  // minimal 2px rounding. (orange info fill à confirmer)
  badge: {
    radius: "2px", // minimal rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Eidos labels read uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: eidosColor.orange, // #e8552d (Eidos "info" = studio orange — à confirmer)
    infoText: eidosColor.white // white on orange
  },
  // Eidos checkbox/radio label: small ink grotesk.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: eidosColor.ink.primary // #1d1d1d
  },
  // Eidos search input: a boxed light hairline field, grotesk type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Eidos toggle / switch label: small ink grotesk.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: eidosColor.ink.primary // #1d1d1d
  }
} as const;

// --- semantic (Eidos-Montréal-specific role mapping) ------------------------
const semantic = {
  surface: {
    default: eidosColor.white, // #ffffff white (measured theme-color)
    subtle: eidosColor.grey.subtle, // #f8f8f8 subtle fill surface
    raised: eidosColor.white, // #ffffff white
    inverse: eidosColor.black, // #1a1a1a deep studio black inverse surface (footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: eidosColor.ink.primary, // #1d1d1d (measured near-black studio ink)
    secondary: eidosColor.ink.secondary, // #5a5a5a
    muted: eidosColor.ink.muted, // #a2a2a2 (measured muted grey)
    inverse: eidosColor.white, // white on black / dark surfaces
    link: eidosColor.ink.primary // #1d1d1d — Eidos links are ink, not coloured
  },
  border: {
    subtle: eidosColor.grey.border, // #c4c4c4 light hairline (field / divider)
    strong: eidosColor.ink.secondary, // #5a5a5a stronger border
    interactive: eidosColor.orange // #e8552d focus / interactive (à confirmer)
  },
  action: {
    primary: eidosColor.orange, // #e8552d primary button (warm orange CTA — à confirmer)
    primaryHover: eidosColor.orangeHover, // #c8431f darker orange on hover (à confirmer)
    primaryText: eidosColor.white, // white text on orange
    secondary: eidosColor.grey.subtle, // #f8f8f8 secondary surface
    secondaryHover: eidosColor.grey.divider, // #d5d5d5
    secondaryText: eidosColor.ink.primary, // #1d1d1d
    danger: eidosColor.system.danger // #d32f2f
  },
  feedback: {
    success: eidosColor.system.success,
    warning: eidosColor.system.warning,
    error: eidosColor.system.danger,
    info: eidosColor.system.info
  },
  status: {
    pending: eidosColor.system.warning,
    processing: eidosColor.system.info,
    completed: eidosColor.system.success,
    failed: eidosColor.system.danger
  },
  // Categorical data-vis palette. Eidos publishes no data-vis scale and uses
  // almost no decorative colour, so this is a coherent proposal led by the warm
  // orange accent + the deep studio black, then the measured monochrome greys
  // and restrained system hues, drawn to honour the minimal identity (see
  // MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: eidosColor.orange, // #e8552d warm studio orange (à confirmer)
    category2: eidosColor.black, // #1a1a1a deep studio black
    category3: eidosColor.ink.secondary, // #5a5a5a mid grey
    category4: eidosColor.ink.muted, // #a2a2a2 muted grey
    category5: eidosColor.grey.border, // #c4c4c4 hairline grey
    category6: eidosColor.system.danger, // restrained red (à confirmer)
    category7: eidosColor.system.success, // restrained green (à confirmer)
    category8: eidosColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Eidos-Montréal theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Eidos-specific (minimal monochrome
 * studio + warm orange accent) values, and the `component` layer is REBUILT from
 * this theme's own semantic/foundation via `createComponent` — so Eidos'
 * greyscale-on-white grotesk identity (with its orange accent) reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const eidosMontrealTheme: TenantTheme = {
  id: "eidos-montreal",
  label: "Eidos-Montréal",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default eidosMontrealTheme;
