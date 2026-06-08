import { defineComponent, h } from "vue";
import { X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type TagTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";
export type TagSize = "sm" | "md";

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  /** Svelte/React-canonical callback; fires alongside the `dismiss` emit. */
  onDismiss?: (event: MouseEvent) => void;
  class?: string;
};

export const Tag = defineComponent({
  name: "Tag",
  props: {
    tone: { type: String as () => TagTone, default: "neutral" },
    size: { type: String as () => TagSize, default: "md" },
    disabled: { type: Boolean, default: false },
    dismissible: { type: Boolean, default: false },
    dismissLabel: { type: String, default: "Dismiss" },
    onDismiss: { type: Function as unknown as () => (event: MouseEvent) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["dismiss"],
  setup(props, { slots, emit, attrs }) {
    const handleDismiss = (event: MouseEvent) => {
      if (props.disabled) return;
      props.onDismiss?.(event);
      emit("dismiss", event);
    };

    return () =>
      h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-tag",
            `st-tag--${props.tone}`,
            `st-tag--${props.size}`,
            props.disabled && "st-tag--disabled",
            props.class,
          ),
          "aria-disabled": props.disabled ? "true" : undefined,
        },
        [
          h("span", { class: "st-tag__label" }, slots.default?.()),
          props.dismissible
            ? h(
                "button",
                {
                  type: "button",
                  class: "st-tag__dismiss",
                  "aria-label": props.dismissLabel,
                  disabled: props.disabled,
                  onClick: handleDismiss,
                },
                h(X, { size: 14, strokeWidth: 2, "aria-hidden": "true" }),
              )
            : null,
        ],
      );
  },
});
