import { defineComponent, h } from "vue";
import {
  Settings,
  Eye,
  EyeOff,
  Layers,
  Target,
  X,
  ChevronDown,
  ChevronRight,
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
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  title?: string;
  class?: string;
};

export const Icon = defineComponent({
  name: "Icon",
  props: {
    /** Canonical DS icon name. */
    name: { type: String as () => IconName, required: true },
    /** Square size in px. Default 18 — the DS-standard inline glyph size. */
    size: { type: Number, default: 18 },
    /** Stroke width. Default 2.25 — matches the DS's existing lucide usage. */
    strokeWidth: { type: Number, default: 2.25 },
    /** Accessible name; when omitted the icon is decorative (`aria-hidden`). */
    title: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const Glyph = ICONS[props.name];
      if (!Glyph) return null;
      return h(Glyph, {
        size: props.size,
        strokeWidth: props.strokeWidth,
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
