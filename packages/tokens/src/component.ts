import { foundation } from "./foundation.js";
import { semantic } from "./semantic.js";
import type { ComponentAnatomy, DensityAnatomy, FieldAnatomy, TypographyAnatomy } from "./anatomy.js";

// Formes minimales requises par le builder (feuilles string/number), de sorte
// qu'un thème puisse passer son propre semantic/foundation (valeurs élargies en
// string) sans friction de types littéraux.
interface SemanticInput {
  surface: { default: string; subtle: string; raised: string; inverse: string; overlay: string };
  text: { primary: string; secondary: string; muted: string; inverse: string; link: string };
  action: { primary: string; primaryText: string; secondary: string; secondaryText: string; primaryHover?: string; secondaryHover?: string };
  border: { subtle: string; strong: string; interactive: string };
  feedback: { info: string; success: string; warning: string; error: string };
  data: { category1: string; category2: string; category3: string; category4: string };
}

// Density / typography / focus leaves a theme may or may not provide. Anatomy
// primitives are optional on the INPUT (a theme can omit them and fall back to
// the base) but the OUTPUT anatomy is fully typed via ComponentAnatomy.
type DensityInput = Partial<Record<"sm" | "md" | "lg", Partial<DensityAnatomy>>>;
type TypographyRolesInput = Partial<Record<"control" | "field" | "label" | "link", Partial<TypographyAnatomy>>>;

interface FocusInput {
  strategy?: string;
  width?: string;
  offset?: string;
  color?: string;
  inset?: string;
}

// Field style primitive a theme may or may not provide (v1.2.0). Optional on
// the INPUT (fallback = outline / base look); the OUTPUT FieldAnatomy is fully
// typed. `fillBg`/`underlineColor`/`underlineWidth` only matter when
// style = filled-underline; for outline the builder uses semantic roles.
interface FieldInput {
  style?: string;
  fillBg?: string;
  underlineColor?: string;
  underlineWidth?: string;
}

// Card surface primitive a theme may or may not provide. Optional on the INPUT
// (fallback = base Sent Tech: a `borderWidth.thin` stroke + surface.raised fill).
// DSFR .fr-card / Carbon .bx--tile have NO border; Carbon's tile fill is the
// $layer-01 grey (#f4f4f4). `borderWidth` lets a theme drop the stroke to 0 and
// `background` lets it pick a layer tone — both without touching the base look.
interface CardInput {
  borderWidth?: string;
  background?: string;
}

interface FoundationInput {
  radius: { none?: string; sm?: string; md: string; lg: string; pill: string };
  shadow: { subtle: string; medium: string; floating: string };
  spacing: { readonly [key: number]: string };
  z: { overlay: number; modal: number; toast: number };
  // Anatomy primitives (Phase 1) — optional so legacy callers still type-check.
  borderWidth?: { none?: string; thin?: string; thick?: string };
  borderStyle?: { solid?: string };
  density?: DensityInput;
  typography?: TypographyRolesInput;
  disabledOpacity?: string;
  transition?: { property?: string; duration?: string; easing?: string };
  cursor?: { interactive?: string; disabled?: string; text?: string };
  iconSize?: { sm?: string; md?: string; lg?: string };
  focus?: FocusInput;
  field?: FieldInput;
  card?: CardInput;
}

// Defaults used when a theme omits an anatomy primitive. These mirror the base
// foundation so the OUTPUT is always a complete, typed ComponentAnatomy.
const FALLBACK = {
  borderWidth: { none: "0", thin: "1px", thick: "2px" },
  borderStyle: "solid",
  density: {
    // fontSize per size (v1.1.0): md mirrors the control typography size; sm/lg
    // carry the label scale so the font rides with the control geometry.
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  } satisfies Record<"sm" | "md" | "lg", DensityAnatomy>,
  typography: {
    control: { family: "var(--st-font-sans)", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "var(--st-font-sans)", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "var(--st-font-sans)", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Base/DSFR links are underlined at rest → underline on hover is a no-op.
    link: { family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none", textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.18em", textDecorationHover: "underline" }
  } satisfies Record<"control" | "field" | "label" | "link", TypographyAnatomy>,
  disabledOpacity: "0.55",
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "120ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  focus: { strategy: "outline", width: "2px", offset: "2px", color: "var(--st-semantic-border-interactive)", inset: "0" },
  // Field style fallback = boxed outline (base Sent Tech). underlineColor /
  // underlineWidth are inert for outline; they only drive filled-underline.
  field: { style: "outline", fillBg: "", underlineColor: "", underlineWidth: "1px" }
} as const;

function densityOf(f: FoundationInput, size: "sm" | "md" | "lg"): DensityAnatomy {
  const base = FALLBACK.density[size];
  const themed = f.density?.[size] ?? {};
  return {
    controlHeight: themed.controlHeight ?? base.controlHeight,
    paddingBlock: themed.paddingBlock ?? base.paddingBlock,
    paddingInline: themed.paddingInline ?? base.paddingInline,
    gap: themed.gap ?? base.gap,
    minWidth: themed.minWidth ?? base.minWidth,
    fontSize: themed.fontSize ?? base.fontSize
  };
}

function typographyOf(f: FoundationInput, role: "control" | "field" | "label" | "link"): TypographyAnatomy {
  // Widen to TypographyAnatomy so the optional textDecorationHover leaf is
  // readable across all roles (only `link` carries it in the FALLBACK literal).
  const base: TypographyAnatomy = FALLBACK.typography[role];
  const themed = f.typography?.[role] ?? {};
  return {
    family: themed.family ?? base.family,
    size: themed.size ?? base.size,
    weight: themed.weight ?? base.weight,
    lineHeight: themed.lineHeight ?? base.lineHeight,
    letterSpacing: themed.letterSpacing ?? base.letterSpacing,
    textTransform: themed.textTransform ?? base.textTransform,
    textDecoration: themed.textDecoration ?? base.textDecoration,
    decorationThickness: themed.decorationThickness ?? base.decorationThickness,
    decorationOffset: themed.decorationOffset ?? base.decorationOffset,
    textDecorationHover: themed.textDecorationHover ?? base.textDecorationHover
  };
}

function focusOf(f: FoundationInput): ComponentAnatomy["focus"] {
  const base = FALLBACK.focus;
  const themed = f.focus ?? {};
  const strategy = (themed.strategy ?? base.strategy) as ComponentAnatomy["focus"]["strategy"];
  const width = themed.width ?? base.width;
  const offset = themed.offset ?? base.offset;
  const color = themed.color ?? base.color;
  const inset = themed.inset ?? base.inset;
  // The focus STRATEGY is resolved here into the two CSS channels a shared
  // mixin needs: `outline` and `boxShadow`. A component applies BOTH on
  // :focus-visible; the strategy decides which is "live" (the other is a no-op).
  // This is what lets DSFR (offset outline) and Carbon (inset box-shadow) differ
  // by *technique*, not just values, while staying 100% token-driven.
  let outline = "none";
  let boxShadow = "none";
  switch (strategy) {
    case "outline":
      // DSFR-like: native outline, offset away from the box.
      outline = `${width} solid ${color}`;
      break;
    case "ring":
      // Base default: a soft ring drawn just outside the box.
      boxShadow = `0 0 0 ${width} ${color}`;
      break;
    case "inset":
      // Carbon: a ring drawn INSIDE the box via inset box-shadow.
      boxShadow = `inset 0 0 0 ${width} ${color}`;
      break;
    case "double":
      // Two-tone accessibility ring (outer color + inner light gap).
      outline = `${width} solid ${color}`;
      boxShadow = `0 0 0 ${inset} #ffffff`;
      break;
  }
  return { strategy, width, offset, color, inset, outline, boxShadow };
}

/**
 * Resolves the FIELD STYLE (v1.2.0) into a fully-typed FieldAnatomy: a fill
 * background + four per-side border shorthands a component applies verbatim.
 *
 * - `outline` (default, base Sent Tech): `fillBg = surface.default`, the four
 *   borders all = `<borderWidth.thin> solid <border.subtle>`. This reproduces
 *   the existing boxed input EXACTLY → no Sent Tech regression.
 * - `filled-underline` (DSFR / Carbon): `fillBg` = the theme's field fill tone,
 *   top/right/left = `none`, only `borderBottom` = `<underlineWidth> solid
 *   <underlineColor>`. This is what makes DSFR/Carbon inputs faithful (filled +
 *   bottom rule only) instead of a boxed encadré.
 */
function fieldOf(
  semantic: SemanticInput,
  f: FoundationInput,
  bw: { none?: string; thin?: string; thick?: string },
  borderStyle: string
): FieldAnatomy {
  const themed = f.field ?? {};
  const style = (themed.style ?? FALLBACK.field.style) as FieldAnatomy["style"];
  const thin = bw.thin ?? "1px";

  if (style === "filled-underline") {
    const fillBg = themed.fillBg || semantic.surface.subtle;
    const underlineColor = themed.underlineColor || semantic.border.strong;
    const underlineWidth = themed.underlineWidth || thin;
    return {
      style,
      fillBg,
      borderTop: "none",
      borderRight: "none",
      borderBottom: `${underlineWidth} ${borderStyle} ${underlineColor}`,
      borderLeft: "none"
    };
  }

  // outline (default): boxed, 4 equal borders — identical to the prior look.
  const fillBg = themed.fillBg || semantic.surface.default;
  const border = `${thin} ${borderStyle} ${semantic.border.subtle}`;
  return {
    style: "outline",
    fillBg,
    borderTop: border,
    borderRight: border,
    borderBottom: border,
    borderLeft: border
  };
}

/**
 * Construit la couche `component` à partir d'un `semantic` et d'un `foundation`
 * donnés. Les rôles composant sont CÂBLÉS sur les rôles semantic/foundation du
 * thème appelant — c'est ce qui permet à un thème (DSFR, Carbon, forge…) de
 * propager sa marque jusqu'aux composants. Réutiliser un `component` figé sur
 * une autre base rendrait les composants inertes au changement de thème.
 */
export function createComponent(semantic: SemanticInput, foundation: FoundationInput) {
  const bw = { ...FALLBACK.borderWidth, ...(foundation.borderWidth ?? {}) };
  const borderStyle = foundation.borderStyle?.solid ?? FALLBACK.borderStyle;
  const disabledOpacity = foundation.disabledOpacity ?? FALLBACK.disabledOpacity;
  const cursor = { ...FALLBACK.cursor, ...(foundation.cursor ?? {}) };
  const icon = { ...FALLBACK.iconSize, ...(foundation.iconSize ?? {}) };
  const focus = focusOf(foundation);

  // Anatomy block for the 5 pilot components. Typed against ComponentAnatomy so
  // a theme cannot drift the *shape*; values resolve from this theme's own
  // foundation (radius/density/typography/focus) → the brand reaches anatomy.
  const buttonAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.md, borderWidth: bw.thin, borderStyle },
    density: { sm: densityOf(foundation, "sm"), md: densityOf(foundation, "md"), lg: densityOf(foundation, "lg") },
    typography: typographyOf(foundation, "control"),
    focus,
    icon: { size: icon.md, gap: densityOf(foundation, "md").gap },
    states: {
      // v1.1.0: hover bg sourced from the semantic layer (primaryHover, with a
      // fallback to primary so a theme that omits it stays inert, not blank).
      hover: { bg: semantic.action.primaryHover ?? semantic.action.primary, transform: "none" },
      active: { transform: "none" },
      disabled: { opacity: disabledOpacity }
    }
  };

  const inputAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.md, borderWidth: bw.thin, borderStyle },
    density: { sm: densityOf(foundation, "sm"), md: densityOf(foundation, "md"), lg: densityOf(foundation, "lg") },
    typography: typographyOf(foundation, "field"),
    focus,
    // Field style (v1.2.0): outline (boxed, base) vs filled-underline (DSFR/Carbon).
    field: fieldOf(semantic, foundation, bw, borderStyle),
    states: {
      hover: { border: semantic.border.strong },
      focus: { border: semantic.border.interactive },
      // Inputs convey disabled via bg + text, not via global dimming.
      disabled: { bg: semantic.surface.subtle, text: semantic.text.muted }
    }
  };

  const linkTypography = typographyOf(foundation, "link");
  const linkAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.sm ?? foundation.radius.md, borderWidth: bw.none, borderStyle },
    typography: linkTypography,
    focus,
    states: {
      // v1.1.0: hover decoration sourced from the link role typography
      // (textDecorationHover). DSFR/base = underline (no-op vs rest); Carbon
      // goes none → underline on hover. Fallback to underline if a theme omits.
      hover: { text: semantic.action.primary, decoration: linkTypography.textDecorationHover ?? "underline" },
      disabled: { text: semantic.text.muted, decoration: "none", opacity: disabledOpacity }
    }
  };

  // Card surface (additive): borderWidth defaults to the base `thin` stroke so
  // Sent Tech is unchanged; DSFR/Carbon set it to 0 (their cards/tiles have no
  // border). The fill defaults to surface.raised (base), Carbon overrides it to
  // its $layer-01 tone via `card.background`.
  const cardBorderWidth = foundation.card?.borderWidth ?? bw.thin;
  const cardBackground = foundation.card?.background || semantic.surface.raised;
  const cardAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.lg, borderWidth: cardBorderWidth, borderStyle },
    typography: typographyOf(foundation, "field"),
    focus,
    states: {
      hover: { transform: "translateY(-1px)" }
    }
  };

  const tabsAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.none ?? "0", borderWidth: bw.thin, borderStyle },
    density: { md: densityOf(foundation, "md") },
    typography: typographyOf(foundation, "control"),
    focus,
    states: {
      hover: { text: semantic.text.primary },
      disabled: { opacity: disabledOpacity }
    }
  };

  return {
    button: {
      radius: foundation.radius.md,
      primaryBackground: semantic.action.primary,
      primaryText: semantic.action.primaryText,
      secondaryBackground: semantic.action.secondary,
      secondaryText: semantic.action.secondaryText,
      anatomy: buttonAnatomy
    },
    link: {
      text: semantic.text.link,
      hoverText: semantic.action.primary,
      disabledText: semantic.text.muted,
      focusRing: semantic.border.interactive,
      anatomy: linkAnatomy
    },
    alert: {
      background: semantic.surface.raised,
      text: semantic.text.primary,
      border: semantic.border.subtle,
      infoBorder: semantic.feedback.info,
      successBorder: semantic.feedback.success,
      warningBorder: semantic.feedback.warning,
      errorBorder: semantic.feedback.error,
      radius: foundation.radius.lg
    },
    card: {
      background: cardBackground,
      border: semantic.border.subtle,
      radius: foundation.radius.lg,
      shadow: foundation.shadow.subtle,
      anatomy: cardAnatomy
    },
    menu: {
      background: semantic.surface.raised,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      itemHoverBackground: semantic.surface.subtle,
      disabledText: semantic.text.muted,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium
    },
    popover: {
      background: semantic.surface.raised,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      zIndex: foundation.z.overlay
    },
    dropdown: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      optionHoverBackground: semantic.surface.subtle,
      selectedBackground: semantic.action.primary,
      selectedText: semantic.action.primaryText,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium
    },
    input: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      focusRing: semantic.border.interactive,
      radius: foundation.radius.md
    },
    field: {
      labelText: semantic.text.primary,
      helpText: semantic.text.secondary,
      errorText: semantic.feedback.error,
      gap: foundation.spacing[2],
      maxWidth: "28rem",
      labelTypography: typographyOf(foundation, "label")
    },
    control: {
      background: semantic.surface.default,
      text: semantic.text.primary,
      placeholderText: semantic.text.muted,
      border: semantic.border.subtle,
      hoverBorder: semantic.border.strong,
      focusRing: semantic.border.interactive,
      invalidBorder: semantic.feedback.error,
      disabledBackground: semantic.surface.subtle,
      disabledText: semantic.text.muted,
      radius: foundation.radius.md,
      smHeight: "2rem",
      mdHeight: "2.5rem",
      lgHeight: "3rem",
      anatomy: inputAnatomy
    },
    selection: {
      checkedBackground: semantic.action.primary,
      checkedText: semantic.action.primaryText,
      border: semantic.border.subtle,
      switchTrack: semantic.border.strong,
      switchTrackChecked: semantic.action.primary,
      switchThumb: semantic.surface.default
    },
    overlay: {
      backdrop: semantic.surface.overlay,
      surface: semantic.surface.raised,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      zIndex: foundation.z.modal
    },
    drawer: {
      backdrop: semantic.surface.overlay,
      surface: semantic.surface.raised,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      width: "24rem",
      zIndex: foundation.z.modal
    },
    emptyState: {
      background: semantic.surface.subtle,
      border: semantic.border.subtle,
      titleText: semantic.text.primary,
      messageText: semantic.text.secondary,
      radius: foundation.radius.lg
    },
    loadingState: {
      indicator: semantic.action.primary,
      track: semantic.surface.subtle,
      text: semantic.text.secondary,
      radius: foundation.radius.pill
    },
    tooltip: {
      background: semantic.surface.inverse,
      text: semantic.text.inverse,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium,
      zIndex: foundation.z.overlay
    },
    toast: {
      background: semantic.surface.raised,
      text: semantic.text.primary,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      infoBorder: semantic.feedback.info,
      successBorder: semantic.feedback.success,
      warningBorder: semantic.feedback.warning,
      errorBorder: semantic.feedback.error,
      zIndex: foundation.z.toast
    },
    dataTable: {
      headerBackground: semantic.surface.subtle,
      rowBackground: semantic.surface.default,
      rowHoverBackground: semantic.surface.subtle,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      captionText: semantic.text.secondary,
      radius: foundation.radius.lg
    },
    tabs: {
      activeText: semantic.text.primary,
      inactiveText: semantic.text.secondary,
      border: semantic.border.subtle,
      indicator: semantic.action.primary,
      panelBackground: semantic.surface.default,
      anatomy: tabsAnatomy
    },
    pagination: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      activeBackground: semantic.action.primary,
      activeText: semantic.action.primaryText,
      disabledText: semantic.text.muted,
      radius: foundation.radius.md
    },
    breadcrumb: {
      text: semantic.text.secondary,
      currentText: semantic.text.primary,
      separator: semantic.text.muted,
      linkText: semantic.text.link
    },
    sideNav: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      itemText: semantic.text.secondary,
      activeBackground: semantic.surface.subtle,
      activeText: semantic.text.primary,
      width: "16rem"
    },
    chat: {
      userBubbleBackground: semantic.action.primary,
      userBubbleText: semantic.action.primaryText,
      assistantBubbleBackground: semantic.surface.subtle,
      assistantBubbleText: semantic.text.primary,
      composerSurface: semantic.surface.raised,
      toolCallSurface: semantic.surface.subtle
    },
    graph: {
      panelBackground: semantic.surface.inverse,
      panelText: semantic.text.inverse,
      edgeDefault: "rgb(226 232 240 / 0.56)",
      community1: semantic.data.category1,
      community2: semantic.data.category2,
      community3: semantic.data.category3,
      community4: semantic.data.category4
    }
  } as const;
}

export const component = createComponent(semantic, foundation);
