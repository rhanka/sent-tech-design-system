import { defineComponent, h, type Component, type PropType } from "vue";
import {
  Settings,
  Eye,
  EyeOff,
  Layers,
  Target,
  X,
  ChevronDown,
  ChevronRight,
  CircleDashed,
} from "lucide-vue-next";
import { classNames } from "./classNames.js";

/**
 * Canonical Sentropic icon set (day-one).
 *
 * The DS prescribes ONE icon set, addressed by DS-owned names via {@link Icon}.
 * The visual source is lucide (stroke-24, the de-facto internal standard);
 * consumers address glyphs by these names, never by lucide component names, so
 * the source can evolve without breaking the public API. Names are ADDITIVE.
 */
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

/** An arbitrary lucide-vue-next component accepted by {@link Icon} via `glyph`. */
export type IconGlyph = Component;

export type IconProps = {
  size?: number;
  strokeWidth?: number;
  title?: string;
  class?: string;
  /**
   * Canonical DS icon name.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither renders nothing (null).
   */
  name?: IconName;
  /**
   * Arbitrary lucide glyph; wins over `name` when both are set.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither renders nothing (null).
   */
  glyph?: IconGlyph;
};

// `process` is bundler-replaced in apps and real in Node; declared locally so
// this file typechecks with or without @types/node.
declare const process: { env?: Record<string, string | undefined> } | undefined;

export const Icon = defineComponent({
  name: "Icon",
  props: {
    /** Canonical DS icon name. */
    name: { type: String as PropType<IconName>, required: false, default: undefined },
    /** Arbitrary lucide glyph; wins over `name` when both are set. */
    glyph: { type: [Object, Function] as PropType<IconGlyph>, required: false, default: undefined },
    /** Square size in px. Default 18 — the DS-standard inline glyph size. */
    size: { type: Number, default: 18 },
    /**
     * Stroke width. When omitted, the theme token
     * `--st-component-icon-strokeWidth` applies (default 2.25 — the DS's
     * existing lucide usage). When set, it wins over the token.
     */
    strokeWidth: { type: Number as PropType<number | undefined>, default: undefined },
    /** Accessible name; when omitted the icon is decorative (`aria-hidden`). */
    title: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    // Exactly one of `name`/`glyph` is expected; warn in dev, never throw.
    if (typeof process === "undefined" || process.env?.NODE_ENV !== "production") {
      const hasName = props.name != null;
      const hasGlyph = props.glyph != null;
      if (hasName === hasGlyph) {
        console.warn("[st-icon] Icon requires exactly one of `name` or `glyph`.");
      }
    }
    return () => {
      // `glyph` wins when both are set; neither renders nothing (null).
      const Glyph = props.glyph ?? (props.name != null ? ICONS[props.name] : undefined);
      if (!Glyph) return null;
      return h(Glyph, {
        size: props.size,
        strokeWidth: props.strokeWidth ?? 2.25,
        // An explicit prop is marked so the styles.css token rule leaves it alone.
        "data-st-icon-stroke": props.strokeWidth == null ? undefined : "prop",
        class: classNames("st-icon", props.class),
        role: props.title ? "img" : undefined,
        "aria-label": props.title,
        "aria-hidden": props.title ? undefined : "true",
        focusable: "false",
        ...attrs,
      });
    };
  },
});

export default Icon;
