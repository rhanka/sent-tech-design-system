import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type CopyButtonSize = "sm" | "md" | "lg";

export type CopyButtonProps = {
  text?: string;
  value?: string;
  label?: string;
  copiedLabel?: string;
  size?: CopyButtonSize;
  class?: string;
};

export const CopyButton = defineComponent({
  name: "CopyButton",
  props: {
    text: { type: String, default: undefined },
    value: { type: String, default: undefined },
    label: { type: String, default: "Copy" },
    copiedLabel: { type: String, default: "Copied" },
    size: { type: String as () => CopyButtonSize, default: "md" },
    class: { type: String, default: undefined },
  },
  emits: ["click"],
  setup(props, { emit, attrs }) {
    const copied = ref(false);

    return () =>
      h(
        "button",
        {
          ...attrs,
          type: "button",
          class: classNames(
            "st-copyButton",
            `st-copyButton--${props.size}`,
            copied.value && "st-copyButton--copied",
            props.class,
          ),
          onClick: (event: MouseEvent) => {
            copied.value = true;
            void navigator.clipboard?.writeText(props.value ?? props.text ?? "");
            emit("click", event);
          },
        },
        h("span", { class: "st-copyButton__label" }, copied.value ? props.copiedLabel : props.label),
      );
  },
});
