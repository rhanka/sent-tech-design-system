/**
 * ComponentAnatomy — typed, versioned contract for theme-portable component
 * anatomy (Phase 1 pilot, cf. spec §3.3).
 *
 * This is the *schema* (livrable n°1). It is deliberately a strict TypeScript
 * type — NOT a free `TokenTree` — so that a theme cannot silently drift away
 * from the shape a component reads. Every leaf is a CSS-ready string (a value
 * or a `var(--st-*)` reference). When `createComponent` builds the anatomy from
 * a theme's `semantic` + `foundation`, the result is checked against these
 * types at compile time.
 *
 * Versioning: bump ANATOMY_VERSION (semver-ish) when the *shape* changes so the
 * matrix / consumers can detect a schema move. Phase 2 rollout MUST NOT begin
 * while this number is still moving (cf. spec §5).
 */

import type { TokenTree } from "./foundation.js";

export const ANATOMY_VERSION = "1.2.0";

/** A CSS-ready value: a literal or a `var(--st-*)` reference. */
export type CssValue = string;

/**
 * Focus strategy = first-class primitive. `strategy` selects which CSS
 * technique a shared mixin renders; the rest parametrise it.
 * - `outline`: native `outline` + `outline-offset` (DSFR-like, offset ring)
 * - `ring`:    `box-shadow` ring around the box (base default)
 * - `inset`:   `box-shadow inset` drawn *inside* the box (Carbon)
 * - `double`:  two-tone outline (outer + inner), DSFR accessibility ring
 */
export type FocusStrategy = "outline" | "ring" | "inset" | "double";

export interface FocusAnatomy {
  // Index signature keeps the block structurally compatible with TokenTree
  // (so it can live under TenantTheme.tokens) while the named keys below stay
  // strictly typed — excess-property checks still catch typos in literals.
  [key: string]: CssValue;
  strategy: FocusStrategy;
  width: CssValue;
  offset: CssValue;
  color: CssValue;
  /** Inset distance used by the `inset` / `double` strategies. */
  inset: CssValue;
}

/** Shape = corners + stroke. */
export interface ShapeAnatomy {
  [key: string]: CssValue;
  radius: CssValue;
  borderWidth: CssValue;
  borderStyle: CssValue;
}

/**
 * Field style = first-class primitive (v1.2.0). Distinguishes a *boxed* input
 * (uniform stroke on all four sides, base Sent Tech) from a *filled-underline*
 * input (filled background + a single bottom rule, no top/right/left stroke) —
 * the real signature of DSFR « Champ de saisie » and Carbon « Text input ».
 * Before this primitive, the input anatomy only carried a uniform border, so a
 * filled-underline theme could not be rendered faithfully (it looked boxed).
 *
 * - `outline`:          4 equal borders (`border.subtle`), `fillBg = surface.default`.
 * - `filled-underline`: filled `fillBg`, top/right/left = none, only `borderBottom`.
 *
 * The per-side borders are RESOLVED here (already combining width + style +
 * color into a CSS-ready shorthand) so a component applies them verbatim with
 * no per-theme branching.
 */
export type FieldStyle = "outline" | "filled-underline";

export interface FieldAnatomy {
  [key: string]: CssValue;
  style: FieldStyle;
  /** Field background fill (`surface.default` for outline; the fill tone otherwise). */
  fillBg: CssValue;
  /** Resolved per-side border shorthands (`<width> <style> <color>` or `none`). */
  borderTop: CssValue;
  borderRight: CssValue;
  borderBottom: CssValue;
  borderLeft: CssValue;
}

/** Density = the geometric envelope of a control for one size. */
export interface DensityAnatomy {
  // `undefined` permitted so optional leaves (fontSize) satisfy the index sig.
  [key: string]: CssValue | undefined;
  controlHeight: CssValue;
  paddingBlock: CssValue;
  paddingInline: CssValue;
  gap: CssValue;
  minWidth: CssValue;
  /**
   * Font size for this size token (v1.1.0). Density is already per-size
   * (sm/md/lg), so the label scale rides with the control geometry instead of
   * a single typography size + per-size CSS escapes. `md` mirrors the role
   * typography size; sm/lg carry the theme's smaller/larger label sizes.
   */
  fontSize?: CssValue;
}

/** Typography by role (self-contained, theme-portable). */
export interface TypographyAnatomy {
  // `undefined` permitted so optional leaves (textDecorationHover) satisfy it.
  [key: string]: CssValue | undefined;
  family: CssValue;
  size: CssValue;
  weight: CssValue;
  lineHeight: CssValue;
  letterSpacing: CssValue;
  textTransform: CssValue;
  textDecoration: CssValue;
  decorationThickness: CssValue;
  decorationOffset: CssValue;
  /**
   * Decoration line in the hover state (v1.1.0). Source for
   * `states.hover.decoration` on the link anatomy: DSFR/base stay `underline`
   * (no-op), Carbon goes from `none` at rest to `underline` on hover.
   */
  textDecorationHover?: CssValue;
}

export interface IconAnatomy {
  [key: string]: CssValue;
  size: CssValue;
  gap: CssValue;
}

/**
 * Per-state delta. Every field is optional: a state only overrides what it
 * actually changes. `transform` covers micro-interaction lifts; `opacity`
 * covers disabled dimming; `decoration` covers underline toggles (links).
 */
export interface StateDelta {
  [key: string]: CssValue | undefined;
  bg?: CssValue;
  border?: CssValue;
  text?: CssValue;
  decoration?: CssValue;
  transform?: CssValue;
  opacity?: CssValue;
}

export interface StatesAnatomy {
  [key: string]: StateDelta | undefined;
  hover?: StateDelta;
  active?: StateDelta;
  focus?: StateDelta;
  disabled?: StateDelta;
}

/**
 * The anatomy of one component. `shape`, `density`, `typography`, `focus`,
 * `icon` and `states` describe the theme-portable form; the remaining keys are
 * the color *roles* the component paints with. Color roles stay loosely keyed
 * (each component owns its own role names) but the anatomy block is strict.
 */
export interface ComponentAnatomy {
  [key: string]: TokenTree | undefined;
  shape: ShapeAnatomy;
  density?: {
    sm?: Partial<DensityAnatomy>;
    md?: Partial<DensityAnatomy>;
    lg?: Partial<DensityAnatomy>;
  };
  typography: TypographyAnatomy;
  focus: FocusAnatomy;
  icon?: IconAnatomy;
  states?: StatesAnatomy;
  /** Field style (v1.2.0) — only meaningful on the input/control anatomy. */
  field?: FieldAnatomy;
}
