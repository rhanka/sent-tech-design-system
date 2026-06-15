import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * HOPPER (hopper.com — the Montréal-HQ travel-booking app, Hopper Inc.) theme
 * for the Sentropic token structure.
 *
 * Hopper ships a full, public design-token system as CSS custom properties on
 * its live marketing site (a Next.js + Tailwind v4 build). Every value below is
 * MEASURED from the site's actual stylesheets:
 *   - /_next/static/css/135659a85495ed28.css  (the main token block — the
 *     `:root{ --coral-*; --gray-*; --blue-*; --color-surface-*; --radius-*;
 *     --default-font-family; ... }` system)
 *   - /_next/static/css/31eccbeb3e11779a.css  (component utility layer)
 * We reference the font *name* only ("Proxima Nova", Hopper's brand typeface),
 * never font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Hopper's identity is PLAYFUL and colourful — the bunny mascot. The signature
 * brand hue is a vivid CORAL/red-pink (`--coral-40 #fa6866`, `--coral-50
 * #f05754`, the latter being Hopper's `--color-strikethrough` deal-price token).
 * We map the Sentropic primary ACTION onto coral so the friendly brand colour
 * reaches the CTAs. Hopper's *product-UI* primary surface is actually measured
 * as BLUE (`--color-surface-primary-resting = --blue-50 #1878ec`); that blue is
 * kept as the secondary/info/link accent (see MAPPING.md "à confirmer": coral vs
 * blue as the action colour). Shapes are friendly and rounded (8px md radius,
 * 12px cards), white surfaces, a neutral grey scale, a near-black ink (`#111`),
 * boxed (outline) form fields with a thin grey ring, and a soft neutral focus
 * ring at a 2px offset.
 *
 * Hopper colour reference (measured, light theme):
 *   Brand coral (action / brand)        #f05754   --coral-50 / --color-strikethrough
 *   Coral bright (mascot / accent)      #fa6866   --coral-40
 *   Coral darker (hover / active)       #c13943   --coral-60
 *   Coral deep (pressed / data ramp)    #932832   --coral-70
 *   Coral faint tint (subtle fill)      #ffebe6   --coral-05
 *   Blue (product action / link base)   #1878ec   --blue-50 / --color-surface-primary-resting / --color-primary-main
 *   Blue darker (link / hover)          #135fc3   --blue-60 / --color-link
 *   Blue deep (active)                  #0e4799   --blue-70 / --color-surface-primary-active
 *   Blue faint tint                     #e7f8ff   --blue-05
 *   Near-black ink (text primary)       #111111   --gray-100 / --color-primary
 *   Charcoal (inverse surface)          #232323   --gray-90
 *   Grey 70 (secondary text)            #545454   --gray-70 / --color-secondary
 *   Grey 60 (muted text)                #767676   --gray-60
 *   Grey 40 (tertiary / ring)           #aaaaaa   --gray-40 / --color-tertiary
 *   Grey 20 (divider / border)          #d9d9d9   --gray-20 / --color-divider
 *   Grey 10 (input border / hairline)   #e7e7e7   --gray-10 (~ --input oklch 92.2%)
 *   Grey 05 (subtle surface)            #f5f5f5   --gray-05 / --color-main
 *   White (surface default)             #ffffff   --white / --color-surface-contrast-resting
 *   Success green                       #37a14a   --green-50 / --color-success
 *   Discount green                      #1c7933   --green-60 / --color-discount
 *   Warning orange                      #c45000   --orange-50 / --color-warning
 *   Error red                           #d72021   --red-50 / --color-error
 *   Offer yellow                        #f6ca05   --yellow-20 / --color-offer
 */

// --- HOPPER raw colour palette (measured from live CSS custom props) ---------
const hopperColor = {
  // The Hopper BRAND is coral (the bunny). `--color-strikethrough` (coral-50) is
  // the most-used coral token; coral-40 is the bright mascot tone. We use coral
  // as the primary action fill, darkening on hover/active.
  coral: "#f05754", // --coral-50 / --color-strikethrough — primary action / brand
  coralBright: "#fa6866", // --coral-40 / --color-coral-40 — bright mascot accent
  coralDarker: "#c13943", // --coral-60 — hover / active
  coralDeep: "#932832", // --coral-70 — pressed / data ramp
  coralTint: "#ffebe6", // --coral-05 — faint coral fill
  // Hopper's measured product-UI action is BLUE; kept as the secondary/info accent.
  blue: "#1878ec", // --blue-50 / --color-surface-primary-resting / --color-primary-main
  blueDarker: "#135fc3", // --blue-60 / --color-link — link / hover
  blueDeep: "#0e4799", // --blue-70 / --color-surface-primary-active
  blueTint: "#e7f8ff", // --blue-05 / --color-surface-primary-tint-resting
  // Near-black ink + neutral grey scale (each value measured from a real token).
  ink: "#111111", // --gray-100 / --color-primary — primary text
  grey: {
    g90: "#232323", // --gray-90 — charcoal inverse surface
    g80: "#383838", // --gray-80 — dark hover
    g70: "#545454", // --gray-70 / --color-secondary — secondary text
    g60: "#767676", // --gray-60 — muted text
    g50: "#939393", // --gray-50
    g40: "#aaaaaa", // --gray-40 / --color-tertiary — disabled-ish / ring
    g30: "#c3c3c3", // --gray-30
    g20: "#d9d9d9", // --gray-20 / --color-divider — divider / strong border
    g10: "#e7e7e7", // --gray-10 (~ --input oklch 92.2%) — input border / hairline
    g05: "#f5f5f5", // --gray-05 / --color-main — subtle surface
    white: "#ffffff" // --white / --color-surface-contrast-resting — default surface
  },
  // System / feedback hues (Hopper publishes these as semantic tokens).
  system: {
    success: "#37a14a", // --green-50 / --color-success
    discount: "#1c7933", // --green-60 / --color-discount (deeper green)
    warning: "#c45000", // --orange-50 / --color-warning
    error: "#d72021", // --red-50 / --color-error
    info: "#1878ec", // --blue-50 (Hopper info aligns with the blue primary surface)
    offer: "#f6ca05" // --yellow-20 / --color-offer
  }
} as const;

// --- foundation (HOPPER-specific values) -------------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) is mapped onto
    // Hopper's CORAL — the brand action colour we surface for CTAs.
    // (à confirmer: Hopper's measured product-UI surface-primary is BLUE; we
    // promote coral because it IS Hopper's brand identity. The real blue lives
    // in the "cyan" accent slot below.)
    blue: {
      10: hopperColor.coralTint, // #ffebe6 faint coral tint
      60: hopperColor.coral, // #f05754 primary action / brand coral
      80: hopperColor.coralDarker // #c13943 darker coral step (hover/active)
    },
    // The Sentropic "cyan" accent slot carries Hopper's real product BLUE
    // (--blue-50 / --color-surface-primary-resting), the measured secondary/info
    // accent (à confirmer mapping onto the cyan role).
    cyan: {
      10: hopperColor.blueTint, // #e7f8ff faint blue tint
      50: hopperColor.blue, // #1878ec Hopper blue accent
      70: hopperColor.blueDarker // #135fc3 darker blue / link
    },
    // Sentropic "slate" role family mapped onto Hopper's neutral grey scale.
    slate: {
      0: hopperColor.grey.white, // #ffffff white
      10: hopperColor.grey.g05, // #f5f5f5 subtle surface
      20: hopperColor.grey.g20, // #d9d9d9 divider / border
      60: hopperColor.grey.g70, // #545454 secondary text
      80: hopperColor.ink, // #111111 primary text
      90: hopperColor.grey.g90 // #232323 charcoal inverse
    },
    feedback: {
      success: hopperColor.system.success,
      warning: hopperColor.system.warning,
      error: hopperColor.system.error,
      info: hopperColor.system.info
    }
  },
  // Hopper's brand typeface is Proxima Nova (measured
  // `--default-font-family:"Proxima Nova",sans-serif`). We reference the *name*
  // only, with a system sans fallback chain. Display uses the same family at a
  // heavier weight (Hopper has no separate display face). Mono is not part of
  // Hopper — the Sentropic mono stack is kept.
  font: {
    sans: "'Proxima Nova', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    display: "'Proxima Nova', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Hopper's measured spacing scale (`--spacing-*`): 25=2px, 50=4px, 100=8px,
  // 150=12px, 200=16px, 300=24px, 400=32px, 600=48px, 800=64px. Mapped onto the
  // Sentropic 4px-base steps.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px — --spacing-50
    2: "0.5rem", // 8px — --spacing-100
    3: "0.75rem", // 12px — --spacing-150
    4: "1rem", // 16px — --spacing-200
    6: "1.5rem", // 24px — --spacing-300
    8: "2rem", // 32px — --spacing-400
    12: "3rem", // 48px — --spacing-600
    16: "4rem" // 64px — --spacing-800
  },
  // Hopper's measured radius scale: xs 2px, sm 4px, md 8px, lg 12px, xl 16px,
  // 2xl 24px, 3xl 32px. Buttons/inputs use the dominant 8px (md); cards use 12px
  // (lg); pills are fully rounded for chips/avatars.
  radius: {
    none: "0", // --radius-none 0
    sm: "0.25rem", // 4px — --radius-sm (small chips / inputs)
    md: "0.5rem", // 8px — --radius-md (buttons / inputs — dominant control radius)
    lg: "0.75rem", // 12px — --radius-lg (cards)
    pill: "999px" // fully rounded chips / avatars / mascot pills
  },
  // Hopper elevation is soft and modern (measured Tailwind shadow tokens:
  // `0 1px 2px 0 #0000000d` small, `0 10px 15px -3px #0000001a` lifted).
  shadow: {
    subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // measured --tw-shadow small
    medium: "0 4px 6px -4px rgb(0 0 0 / 0.10), 0 10px 15px -3px rgb(0 0 0 / 0.10)", // measured --tw-shadow lifted
    floating: "0 12px 32px -8px rgb(0 0 0 / 0.18)" // à confirmer (popover elevation)
  },
  // Hopper transition tokens (measured `--default-transition-duration:.15s`, the
  // ease-out curve `cubic-bezier(0,0,.2,1)`, and Tailwind duration steps .2/.3/.4s).
  motion: {
    fast: "150ms", // --default-transition-duration 0.15s
    normal: "200ms", // --tw-duration 0.2s (the workhorse duration)
    slow: "400ms", // --tw-duration 0.4s
    easing: "cubic-bezier(0, 0, 0.2, 1)" // --ease-out
  },
  // z-index roles are not Hopper-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (HOPPER) -----------------------------------------
  // Hopper inputs/controls use a 1px border (measured --input border, the
  // gray-10/oklch-92.2% hairline). No signature 2px control stroke.
  borderWidth: {
    none: "0",
    thin: "1px", // measured input/divider border 1px
    thick: "2px" // emphasis border (focus offset width)
  },
  borderStyle: { solid: "solid" },
  // Hopper control density. Measured CTA / input heights track a friendly,
  // generous scale: md targets ~44px with 16–24px horizontal padding; sm/lg
  // bracket it. (à confirmer exact px — derived from the spacing scale.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // Hopper typography = Proxima Nova. Buttons/labels are semibold (measured
  // --font-weight-semibold 600); body/fields are regular (400). Field text ~16px
  // (measured --text-4 16px / line-height 22px).
  typography: {
    control: { family: "'Proxima Nova', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.375", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Proxima Nova', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.375", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Proxima Nova', ui-sans-serif, system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4286", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Hopper links are blue (--color-link #135fc3), underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.16em"
    }
  },
  disabledOpacity: "0.5", // Hopper disables to black/30% (--disabled #0000004d); 0.5 approximates the dim
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "cubic-bezier(0, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // HOPPER FOCUS = a soft neutral ring at a 2px offset. Measured
  // `--ring: oklch(70.8% 0 0)` (≈ grey-40 #aaa), `outline-offset:2px`. We encode
  // a 2px grey outline ring offset 2px from the control.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px", // measured outline-offset:2px
    color: hopperColor.grey.g40, // #aaaaaa — --ring oklch(70.8% 0 0) neutral ring
    inset: "0"
  },
  // HOPPER form fields are BOXED (outline): white fill, a thin grey hairline
  // border (measured --input ≈ gray-10 #e7e7e7), and an 8px radius (md). The
  // native <select> chevron is REDRAWN in Hopper grey ink.
  field: {
    style: "outline",
    fillBg: hopperColor.grey.white, // #ffffff measured field background
    underlineColor: hopperColor.grey.g10, // #e7e7e7 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Hopper ink grey, appearance:none,
    // with a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23545454' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Hopper cards: 12px-rounded boxes with a hairline border and soft shadow;
  // hover lifts to a faint grey tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.375",
    hoverBackground: hopperColor.grey.g05 // #f5f5f5 faint grey hover tint
  },
  // Hopper secondary button = the DARK accent CTA (measured
  // --color-surface-accent-resting = gray-100 #111, hover gray-90 #232323):
  // filled near-black with white text. We encode it as a filled dark secondary.
  buttonSecondary: {
    background: hopperColor.ink, // #111111 dark accent fill
    border: hopperColor.ink, // #111111
    hoverBackground: hopperColor.grey.g90 // #232323 measured hover (surface-accent-hover)
  },
  // Hopper tabs / sub-nav: the active item is marked with a CORAL underline (the
  // brand accent) and near-black bold label.
  tabs: {
    activeText: hopperColor.ink, // #111111 active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600", // semibold active
    paddingBlock: "0.75rem", // 12px — --spacing-150
    paddingInline: "1rem", // 16px — --spacing-200
    fontSize: "1rem", // 16px — --text-4
    lineHeight: "1.375rem", // 22px — --text-4 line-height
    indicatorSide: "bottom", // coral underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Hopper pagination: borderless dark text links; active page = filled CORAL
  // pill with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: hopperColor.ink, // #111111 link text
    activeBackground: hopperColor.coral, // #f05754 filled active page (brand coral)
    activeText: hopperColor.grey.white, // white on coral
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.375rem" // 22px
  },
  // Hopper breadcrumb: dark links, grey trail, dark current page, grey separators.
  breadcrumb: {
    linkText: hopperColor.ink, // #111111
    text: hopperColor.grey.g70, // #545454 trail text (--color-secondary)
    currentText: hopperColor.ink, // #111111 current page
    separator: hopperColor.grey.g40, // #aaaaaa (--color-tertiary)
    fontSize: "0.875rem", // 14px — --text-3
    lineHeight: "1.25rem", // 20px — --text-3 line-height
    currentWeight: "600" // current page semibold
  },
  // Hopper notice / alert: a soft 12px box with a faint fill and a coloured left
  // filet for the severity accent.
  alert: {
    background: hopperColor.grey.g05, // #f5f5f5 faint grey fill
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1.25rem", // 20px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Hopper accordion / disclosure (FAQ expanders): a dark, semibold summary
  // trigger, soft-rounded, hairline separated.
  accordion: {
    text: hopperColor.ink, // #111111 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0",
    fontSize: "1.0625rem", // 17px summary type
    fontWeight: "600", // semibold summary
    lineHeight: "1.5rem" // 24px
  },
  // Hopper tag: a small ROUNDED grey chip (8px radius — matches the control
  // radius).
  tag: {
    radius: "0.5rem", // 8px — rounded chip (--radius-md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px — --text-2
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: hopperColor.grey.g05, // #f5f5f5 subtle fill
    neutralText: hopperColor.ink // #111111
  },
  // Hopper badge: a small ROUNDED filled badge — CORAL fill / white text (the
  // brand emphasis colour).
  badge: {
    radius: "0.5rem", // 8px rounded (--radius-md)
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: hopperColor.coral, // #f05754 (Hopper emphasis = brand coral)
    infoText: hopperColor.grey.white // white on coral
  },
  // Hopper checkbox/radio label: near-black ink text.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: hopperColor.ink // #111111
  },
  // Hopper search input: a boxed field, body type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Hopper toggle / switch label: near-black ink text.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: hopperColor.ink // #111111
  }
} as const;

// --- semantic (HOPPER-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: hopperColor.grey.white, // #ffffff white (--color-surface-contrast-resting)
    subtle: hopperColor.grey.g05, // #f5f5f5 subtle grey surface (--color-main / --gray-05)
    raised: hopperColor.grey.white, // #ffffff white raised
    inverse: hopperColor.grey.g90, // #232323 charcoal inverse (dark sections)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop (à confirmer exact alpha)
  },
  text: {
    primary: hopperColor.ink, // #111111 (--color-primary / --gray-100)
    secondary: hopperColor.grey.g70, // #545454 (--color-secondary / --gray-70)
    muted: hopperColor.grey.g60, // #767676 (--gray-60)
    inverse: hopperColor.grey.white, // white on charcoal / dark surfaces
    link: hopperColor.blueDarker // #135fc3 — Hopper links (--color-link)
  },
  border: {
    subtle: hopperColor.grey.g10, // #e7e7e7 hairline (--input ≈ gray-10)
    strong: hopperColor.grey.g20, // #d9d9d9 divider (--color-divider / --gray-20)
    interactive: hopperColor.coral // #f05754 brand coral interactive accent
  },
  action: {
    primary: hopperColor.coral, // #f05754 the brand coral CTA
    primaryHover: hopperColor.coralDarker, // #c13943 measured darker coral
    primaryText: hopperColor.grey.white, // white text on coral
    secondary: hopperColor.grey.g05, // #f5f5f5 secondary surface
    secondaryHover: hopperColor.grey.g10, // #e7e7e7 hover
    secondaryText: hopperColor.ink, // #111111
    danger: hopperColor.system.error // #d72021 (--color-error / red-50)
  },
  feedback: {
    success: hopperColor.system.success, // #37a14a
    warning: hopperColor.system.warning, // #c45000
    error: hopperColor.system.error, // #d72021
    info: hopperColor.system.info // #1878ec
  },
  status: {
    pending: hopperColor.system.warning, // #c45000
    processing: hopperColor.system.info, // #1878ec
    completed: hopperColor.system.success, // #37a14a
    failed: hopperColor.system.error // #d72021
  },
  // Categorical data-vis palette. Hopper publishes Tailwind chart vars in oklch
  // (--chart-1..5) but no named brand data scale; this is a coherent proposal
  // anchored on the measured brand coral + blue + system hues (see MAPPING.md
  // "à confirmer" — not the verbatim oklch chart ramp).
  data: {
    category1: hopperColor.coral, // #f05754 brand coral
    category2: hopperColor.blue, // #1878ec blue
    category3: hopperColor.system.success, // #37a14a green
    category4: hopperColor.system.warning, // #c45000 orange
    category5: hopperColor.system.offer, // #f6ca05 yellow (offer)
    category6: hopperColor.coralDeep, // #932832 deep coral
    category7: hopperColor.grey.g60, // #767676 grey
    category8: hopperColor.blueDeep // #0e4799 deep blue
  }
} as const;

/**
 * The HOPPER theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Hopper-specific (coral-brand, blue-accent,
 * neutral-grey) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Hopper's playful coral
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const hopperTheme: TenantTheme = {
  id: "hopper",
  label: "Hopper",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default hopperTheme;
