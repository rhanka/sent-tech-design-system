import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type LinkProps = {
  href?: string;
  muted?: boolean;
  standalone?: boolean;
  disabled?: boolean;
  class?: string;
};

export const Link = defineComponent({
  name: "Link",
  props: {
    href: { type: String, default: undefined },
    muted: { type: Boolean, default: false },
    standalone: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "a",
        {
          ...attrs,
          href: props.href,
          class: classNames(
            "st-link",
            props.muted && "st-link--muted",
            props.standalone && "st-link--standalone",
            props.disabled && "st-link--disabled",
            props.class,
          ),
          "aria-disabled": props.disabled || undefined,
        },
        slots.default?.(),
      );
  },
});
