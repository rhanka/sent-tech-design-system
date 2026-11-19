import {
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Eye,
  EyeOff,
  Layers,
  Settings,
  Target,
  X,
} from "lucide-preact";
import type { LucideIcon } from "lucide-preact";
import type { SVGAttributes } from "preact";
import { classNames } from "./classNames.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. The glyph renders intrinsic `<svg>` with a
// camelCase `tabIndex` pass-through; without this import a bundler applying
// `sideEffects` barrel optimisation (or a direct deep import) would never
// evaluate runtime.js and `tabIndex` would revert to the broken camelCase
// attribute, leaving the node unfocusable.
import "./runtime.js";

// ── Icon — canonical DS icon set ──────────────────────────────────────────
// The DS prescribes ONE icon set, addressed by DS-owned names via <Icon>. The
// visual source is lucide (stroke-24, the de-facto internal standard); consumers
// address glyphs by these names, never by lucide component names, so the source
// can evolve without breaking the public API. Names are ADDITIVE.
export const ICONS = {
  settings: Settings,
  eye: Eye,
  "eye-off": EyeOff,
  layers: Layers,
  target: Target,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "circle-dashed": CircleDashed,
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** An arbitrary lucide glyph component accepted by {@link Icon} via `glyph`. */
export type IconGlyph = LucideIcon;

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "name"> & {
  /** Square size in px. Default 18 — the DS-standard inline glyph size. */
  size?: number;
  /**
   * Stroke width. When the theme token `--st-component-icon-strokeWidth`
   * applies (default 2.25 — the DS's existing lucide usage). When set, it wins
   * over the token.
   */
  strokeWidth?: number;
  /** Accessible name; when omitted the icon is decorative (`aria-hidden`). */
  title?: string;
  /**
   * Canonical DS icon name.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither renders nothing (returns null).
   */
  name?: IconName;
  /**
   * Arbitrary lucide glyph; wins over `name` when both are set.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither renders nothing (returns null).
   */
  glyph?: IconGlyph;
};

export function Icon({ name, glyph, size = 18, strokeWidth, title, className, ...rest }: IconProps) {
  // `glyph` wins when both are set; neither renders nothing (returns null).
  const Glyph = glyph ?? (name == null ? undefined : ICONS[name]);
  if (!Glyph) return null;
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth ?? 2.25}
      // An explicit prop is marked so the styles.css token rule leaves it alone.
      data-st-icon-stroke={strokeWidth == null ? undefined : "prop"}
      className={classNames("st-icon", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
      {...rest}
    />
  );
}
