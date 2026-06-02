import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type QuoteProps = {
  author?: unknown;
  source?: unknown;
  class?: string;
};

export const Quote = defineComponent({
  name: "Quote",
  props: {
    author: { type: [String, Object] as unknown as () => unknown, default: undefined },
    source: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "blockquote",
        {
          ...attrs,
          class: classNames("st-quote", props.class),
        },
        [
          h("p", { class: "st-quote__text" }, slots.default?.()),
          props.author || props.source
            ? h("footer", { class: "st-quote__attribution" }, [
                props.author
                  ? h(
                      "span",
                      { class: "st-quote__author" },
                      props.author as string,
                    )
                  : null,
                props.source
                  ? h(
                      "span",
                      { class: "st-quote__source" },
                      props.source as string,
                    )
                  : null,
              ])
            : null,
        ],
      );
  },
});
