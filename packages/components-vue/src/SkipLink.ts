import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SkipLinkProps = {
  href?: string;
  class?: string;
};

export const SkipLink = defineComponent({
  name: "SkipLink",
  props: {
    href: { type: String, default: "#main" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "a",
        {
          ...attrs,
          href: props.href,
          class: classNames("st-skipLink", props.class),
        },
        slots.default?.() ?? "Skip to content",
      );
  },
});
