import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: boolean;
  as?: string;
  class?: string;
};

export const Container = defineComponent({
  name: "Container",
  props: {
    size: { type: String as () => ContainerSize, default: "lg" },
    padding: { type: Boolean, default: true },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.as,
        {
          ...attrs,
          class: classNames(
            "st-container",
            `st-container--${props.size}`,
            props.padding && "st-container--padded",
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});
