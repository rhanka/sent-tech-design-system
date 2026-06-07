import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { AspectRatio } from "./AspectRatio.js";

export type EmbedProps = {
  /** URL of the embedded document (required). */
  src: string;
  /**
   * Accessible name of the frame (required for a11y — every iframe must carry a
   * meaningful `title`).
   */
  title: string;
  /**
   * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass your
   * own token list to relax it deliberately.
   */
  sandbox?: string;
  /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
  aspectRatio?: string;
  /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
  allow?: string;
  /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
  loading?: "eager" | "lazy";
  class?: string;
};

export const Embed = defineComponent({
  name: "Embed",
  props: {
    src: { type: String, required: true },
    title: { type: String, required: true },
    sandbox: { type: String, default: "" },
    aspectRatio: { type: String, default: "16/9" },
    allow: { type: String, default: undefined },
    loading: { type: String as () => "eager" | "lazy", default: "lazy" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-embed", props.class) }, [
        h(AspectRatio, { ratio: props.aspectRatio }, {
          default: () =>
            h("iframe", {
              class: "st-embed__frame",
              src: props.src,
              title: props.title,
              sandbox: props.sandbox,
              allow: props.allow,
              loading: props.loading,
            }),
        }),
      ]);
  },
});
