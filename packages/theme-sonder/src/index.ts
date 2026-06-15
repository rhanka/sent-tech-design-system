import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Sonder (sonder.com — the design-forward, short-stay hospitality brand
 * headquartered in Montréal) theme for the Sentropic token structure.
 *
 * Sonder publishes no public design-token file; the values below are MEASURED
 * from the live site's computed CSS / brand surfaces (https://www.sonder.com,
 * inspected in a real browser) — the measured "theme-color" / signature surface
 * is a warm CREAM/SAND (#f7f3ea). We only reference the font *names* here
 * (Sonder ships a custom refined grotesk; the closest measured public stack is
 * "'Inter', Helvetica, Arial, sans-serif" — à confirmer, the bespoke face is not
 * distributable), never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * Sonder's identity is a WARM MINIMAL system: a near-black "ink" used for body
 * text and a confident, near-black CTA; warm CREAM/SAND surfaces (the signature
 * #f7f3ea) for subtle/section fills against a clean white page; a single
 * TERRACOTTA / clay accent (#c4502e) carried into data-vis and the focus
 * highlight; warm-grey secondary text and warm hairline borders rather than cold
 * neutral greys. The brand reads editorial and hospitable — soft hospitality
 * rounding (2–8px), an outline field style, and a near-black focus outline.
 * Where Sentropic needs a role Sonder never colours (feedback states), a
 * restrained, legible system colour is used and the choice is noted
 * "à confirmer" in MAPPING.md. The warm identity itself is largely INFERRED from
 * the measured cream/ink/clay palette — treat the non-cream accents as
 * "à confirmer".
 *
 * Sonder colour reference (measured / inferred, light theme):
 *   Ink — near-black (text / CTA / inverse)   #1a1a1a   primary ink & confident CTA
 *   CTA hover (deepened)                       #000000   pure black on hover
 *   White (surface default)                    #ffffff   page background
 *   Cream / sand (signature subtle surface)    #f7f3ea   ← Sonder's measured warm theme-color
 *   Warm grey — secondary text                 #5a5550   warm secondary ink
 *   Warm grey — muted text                     #8a8378   muted (à confirmer)
 *   Warm hairline border                       #e6e0d6   warm divider / field hairline
 *   Terracotta / clay accent                   #c4502e   data + focus highlight (à confirmer)
 */

// --- Sonder raw colour palette (measured / inferred) ------------------------
const sonderColor = {
  // The emphasis / CTA "brand" is a confident near-black ink. Sonder uses it for
  // the primary call-to-action, the inverse surface and body text.
  ink: "#1a1a1a", // primary ink — body text / CTA fill / inverse surface (near-black)
  black: "#000000", // pure black — CTA hover (deepened)
  white: "#ffffff", // page background — surface default
  // The Sonder SIGNATURE: a warm cream/sand. This is the measured "theme-color"
  // and is used for subtle/section fills and card backgrounds.
  cream: "#f7f3ea", // rgb(247,243,234) — warm cream/sand subtle surface (signature)
  // Warm-grey text scale (warm, not cold neutral) — the warm tilt is Sonder's.
  warm: {
    // Secondary text — a warm grey.
    secondary: "#5a5550", // rgb(90,85,80) — warm secondary text
    // Muted text — lighter warm grey.
    muted: "#8a8378", // rgb(138,131,120) — muted text (à confirmer)
    // Warm hairline border — a sand-tinted divider rather than cold grey.
    border: "#e6e0d6" // rgb(230,224,214) — warm hairline (field / divider)
  },
  // The single decorative accent: a terracotta / clay. Carried into data-vis and
  // the focus highlight on the live site (à confirmer — inferred warm accent).
  accent: "#c4502e", // rgb(196,80,46) — terracotta / clay accent
  // Sonder shows essentially no decorative colour beyond cream + clay, so it
  // publishes no success/warning/info hues. These are restrained, legible
  // (WCAG AA on white) system colours chosen to stay warm against the minimal
  // aesthetic. The danger red is a measured-adjacent warm red; the rest are
  // "à confirmer" — Sonder has no measured equivalent.
  system: {
    danger: "#c0392b", // warm deep red — error / danger (à confirmer)
    success: "#3e7d4f", // muted warm green — à confirmer (no Sonder source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1a1a1a" // Sonder would use its ink, not blue — à confirmer
  }
} as const;

// --- foundation (Sonder-specific values) ------------------------------------
const foundation = {
  color: {
    // Sonder has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the near-black ink scale — the Sonder
    // primary action IS near-black ink. (à confirmer: Sonder has no blue.)
    blue: {
      10: sonderColor.cream, // #f7f3ea warm cream tint
      60: sonderColor.ink, // #1a1a1a primary action (Sonder near-black CTA)
      80: sonderColor.black // #000000 deepened (CTA hover, pure black)
    },
    // Sonder's one decorative accent is terracotta/clay. The Sentropic "cyan"
    // accent slot is mapped to the clay accent (the brand's real highlight).
    cyan: {
      10: sonderColor.cream, // #f7f3ea warm cream tint
      50: sonderColor.accent, // #c4502e terracotta / clay accent
      70: sonderColor.ink // #1a1a1a
    },
    // Sentropic "slate" role family mapped onto the Sonder warm ink/cream scale.
    slate: {
      0: sonderColor.white, // #ffffff white
      10: sonderColor.cream, // #f7f3ea warm cream subtle surface
      20: sonderColor.warm.border, // #e6e0d6 warm hairline border
      60: sonderColor.warm.secondary, // #5a5550 warm secondary text
      80: sonderColor.ink, // #1a1a1a primary ink
      90: sonderColor.black // #000000 darkest (pure black)
    },
    feedback: {
      success: sonderColor.system.success,
      warning: sonderColor.system.warning,
      error: sonderColor.system.danger,
      info: sonderColor.system.info
    }
  },
  // Sonder sets its UI in a refined GROTESK — the live face is a custom Sonder
  // typeface; the closest non-bespoke public stack is "'Inter', Helvetica, Arial,
  // sans-serif" (à confirmer). We reference the *names* only. Mono is not part of
  // Sonder — the Sentropic mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Sonder's layout is whitespace-generous but its
  // raw spacing steps are not strongly tokenised publicly; kept aligned with the
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
  // Sonder uses SOFT HOSPITALITY rounding — measured ~2px on small controls,
  // ~4px on buttons/inputs and ~8px on cards; not square, not pill. The brand
  // reads "warm soft minimal". (Exact steps à confirmer; pill kept at 999px.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — 2px
    md: "4px", // button / input / tabs — soft 4px (measured)
    lg: "8px", // cards — soft 8px (measured)
    pill: "999px" // tags / pills
  },
  // Sonder elevation is restrained — it relies on warm hairlines and whitespace,
  // with soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Sonder animates with short, standard eases (≈ 150ms transitions). Durations
  // not fully tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration (à confirmer)
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Sonder-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Sonder) -----------------------------------------
  // Sonder borders are thin WARM hairlines (#e6e0d6 @1px). Encoded as 1px thin /
  // 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Sonder warm hairline (#e6e0d6)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Sonder control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized grotesk. md targets a ~44px
  // touch height; sm/lg bracket it ("à confirmer" exact metrics).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Sonder typography = the refined grotesk. Control labels are mid-weight;
  // body/field text is sentence case. Unlike Simons' uppercase serif CTAs,
  // Sonder's buttons read as sentence-case grotesk (à confirmer letter-spacing).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Sonder links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Sonder dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Sonder FOCUS = a crisp near-black OUTLINE (~2px solid #1a1a1a). We encode the
  // ink outline strategy. (The clay accent appears as a data/highlight colour,
  // but the focus ring itself is measured as ink — à confirmer.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: sonderColor.ink, // #1a1a1a — Sonder focuses in near-black ink
    inset: "0"
  },
  // Sonder form fields are BOXED (outline): a white fill with a thin warm hairline
  // border and a gentle 4px radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #e6e0d6 @1px warm hairline.
  field: {
    style: "outline",
    fillBg: sonderColor.white, // #ffffff
    underlineColor: sonderColor.warm.border, // #e6e0d6 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the near-black ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Sonder cards: gentle 8px rounding, a thin warm hairline rather than a heavy
  // box, with a faint warm cream hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: sonderColor.cream // #f7f3ea faint warm hover tint
  },
  // Sonder secondary button = a warm cream filled chip (light #f7f3ea fill, ink
  // text, slightly darker warm border on hover) — the quiet alternative to the
  // filled near-black primary.
  buttonSecondary: {
    background: sonderColor.cream, // #f7f3ea warm cream fill
    border: sonderColor.warm.border, // #e6e0d6 warm hairline
    hoverBackground: sonderColor.warm.border // #e6e0d6 on hover
  },
  // Sonder tabs / sub-nav: active tab = near-black bold grotesk label with a
  // near-black bottom underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: sonderColor.ink, // #1a1a1a
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // near-black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Sonder pagination: borderless ink text links; active page = filled near-black
  // box with white text (the monochrome equivalent of a brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: sonderColor.ink, // #1a1a1a link text
    activeBackground: sonderColor.ink, // #1a1a1a filled active page
    activeText: sonderColor.white, // white on near-black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Sonder breadcrumb: ink links, warm-grey trail, near-black current page, warm
  // separators — all grotesk type.
  breadcrumb: {
    linkText: sonderColor.ink, // #1a1a1a
    text: sonderColor.warm.secondary, // #5a5550 trail text
    currentText: sonderColor.ink, // #1a1a1a current page
    separator: sonderColor.warm.secondary, // #5a5550
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Sonder notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Sonder accordion / disclosure: an ink, plain-weight grotesk summary trigger,
  // gentle rounding, warm-hairline separated.
  accordion: {
    text: sonderColor.ink, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "400", // regular weight grotesk
    lineHeight: "1.25rem" // 20px
  },
  // Sonder tag: a small warm cream chip with very gentle rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: sonderColor.cream, // #f7f3ea warm cream fill
    neutralText: sonderColor.ink // #1a1a1a
  },
  // Sonder badge: a small filled badge — near-black fill / white text, sentence
  // case, gentle 4px rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Sonder labels are sentence case (à confirmer)
    minHeight: "1.25rem", // 20px
    infoBackground: sonderColor.ink, // #1a1a1a (Sonder "info" = near-black, not blue)
    infoText: sonderColor.white // white on near-black
  },
  // Sonder checkbox/radio label: small ink grotesk.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: sonderColor.ink // #1a1a1a
  },
  // Sonder search input: a boxed warm hairline field, grotesk type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Sonder toggle / switch label: small ink grotesk.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: sonderColor.ink // #1a1a1a
  }
} as const;

// --- semantic (Sonder-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: sonderColor.white, // #ffffff white page background
    subtle: sonderColor.cream, // #f7f3ea ← Sonder's SIGNATURE warm cream subtle surface
    raised: sonderColor.white, // #ffffff white
    inverse: sonderColor.ink, // #1a1a1a near-black inverse surface (CTA tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: sonderColor.ink, // #1a1a1a near-black body text
    secondary: sonderColor.warm.secondary, // #5a5550 warm grey
    muted: sonderColor.warm.muted, // #8a8378 (à confirmer)
    inverse: sonderColor.white, // white on near-black / dark surfaces
    link: sonderColor.ink // #1a1a1a — Sonder links are ink, not coloured
  },
  border: {
    subtle: sonderColor.warm.border, // #e6e0d6 warm hairline (field / divider)
    strong: sonderColor.warm.secondary, // #5a5550 stronger border
    interactive: sonderColor.ink // #1a1a1a focus / interactive
  },
  action: {
    primary: sonderColor.ink, // #1a1a1a primary button (the confident near-black CTA)
    primaryHover: sonderColor.black, // #000000 — deepened to pure black on hover
    primaryText: sonderColor.white, // white text on near-black
    secondary: sonderColor.cream, // #f7f3ea warm cream secondary surface
    secondaryHover: sonderColor.warm.border, // #e6e0d6
    secondaryText: sonderColor.ink, // #1a1a1a
    danger: sonderColor.system.danger // #c0392b
  },
  feedback: {
    success: sonderColor.system.success,
    warning: sonderColor.system.warning,
    error: sonderColor.system.danger,
    info: sonderColor.system.info
  },
  status: {
    pending: sonderColor.system.warning,
    processing: sonderColor.system.info,
    completed: sonderColor.system.success,
    failed: sonderColor.system.danger
  },
  // Categorical data-vis palette. Sonder publishes no data-vis scale; this is a
  // coherent WARM proposal — the terracotta/clay accent leads (category1), then
  // the near-black ink, then the warm grey ramp, plus the restrained system hues,
  // drawn to honour the warm minimal identity (see MAPPING.md, "à confirmer" —
  // not an official scale).
  data: {
    category1: sonderColor.accent, // #c4502e terracotta / clay accent (leads)
    category2: sonderColor.ink, // #1a1a1a near-black ink
    category3: sonderColor.warm.secondary, // #5a5550 warm grey
    category4: sonderColor.warm.muted, // #8a8378 muted warm grey
    category5: sonderColor.warm.border, // #e6e0d6 warm hairline
    category6: sonderColor.system.danger, // restrained warm red (à confirmer)
    category7: sonderColor.system.success, // restrained warm green (à confirmer)
    category8: sonderColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Sonder theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Sonder-specific (warm minimal) values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Sonder's near-black-ink-on-cream grotesk identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const sonderTheme: TenantTheme = {
  id: "sonder",
  label: "Sonder",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default sonderTheme;
