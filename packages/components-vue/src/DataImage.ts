import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type DataImageFit = "cover" | "contain";

export type DataImageProps = {
  /** Image URL (required). */
  src: string;
  /** Alternative text (required for a11y; pass "" only for purely decorative images). */
  alt: string;
  /** Intrinsic / box width (number → px, or any CSS length). */
  width?: number | string;
  /** Intrinsic / box height (number → px, or any CSS length). */
  height?: number | string;
  /** `object-fit` behaviour inside its box. Default `cover`. */
  fit?: DataImageFit;
  /** Border radius (CSS length). */
  radius?: number | string;
  /** Image loading strategy. Default `lazy`; use `eager` for LCP images. */
  loading?: "eager" | "lazy";
  /** Image decoding hint. Default `async`. */
  decoding?: "async" | "sync" | "auto";
  class?: string;
};

const len = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

export const DataImage = defineComponent({
  name: "DataImage",
  props: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: [Number, String] as unknown as () => number | string, default: undefined },
    height: { type: [Number, String] as unknown as () => number | string, default: undefined },
    fit: { type: String as () => DataImageFit, default: "cover" },
    radius: { type: [Number, String] as unknown as () => number | string, default: undefined },
    loading: { type: String as () => "eager" | "lazy", default: "lazy" },
    decoding: { type: String as () => "async" | "sync" | "auto", default: "async" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const style: Record<string, string> = {};
      const w = len(props.width);
      const ht = len(props.height);
      const r = len(props.radius);
      if (w) style.width = w;
      if (ht) style.height = ht;
      if (r) style.borderRadius = r;
      const { style: callerStyle, ...restAttrs } = attrs;
      return h("img", {
        ...restAttrs,
        class: classNames("st-dataImage", `st-dataImage--${props.fit}`, props.class),
        src: props.src,
        alt: props.alt,
        style: [style, callerStyle as Record<string, string> | string | undefined],
        loading: props.loading,
        decoding: props.decoding,
      });
    };
  },
});
