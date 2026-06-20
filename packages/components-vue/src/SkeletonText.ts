import { computed, defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SkeletonTextProps = {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  locale?: string;
  loadingLabel?: string;
  class?: string;
};

export const SkeletonText = defineComponent({
  name: "SkeletonText",
  props: {
    lines: { type: Number, default: 1 },
    width: { type: String, default: undefined },
    heading: { type: Boolean, default: false },
    paragraph: { type: Boolean, default: false },
    locale: { type: String, default: "fr-FR" },
    loadingLabel: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const isFr = computed(() => (props.locale ?? "fr-FR").toLowerCase().startsWith("fr"));
    const resolvedLoadingLabel = computed(() => props.loadingLabel ?? (isFr.value ? "Chargement…" : "Loading…"));
    return () => {
      const lineCount = props.paragraph ? Math.max(props.lines ?? 1, 3) : props.lines ?? 1;
      const lineWidth = (index: number): string | undefined => {
        if (props.width && index === 0) return props.width;
        if (props.paragraph && index === lineCount - 1) return "60%";
        return undefined;
      };
      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-skeleton", props.class),
          role: "status",
          "aria-label": resolvedLoadingLabel.value,
          "aria-busy": "true",
        },
        Array.from({ length: lineCount }, (_, index) => {
          const w = lineWidth(index);
          return h("span", {
            key: index,
            class: classNames(
              "st-skeleton__line",
              props.heading && "st-skeleton__line--heading",
            ),
            style: w ? `width:${w}` : undefined,
          });
        }),
      );
    };
  },
});
