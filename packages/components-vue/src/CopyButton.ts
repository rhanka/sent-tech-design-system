import { defineComponent, h, ref } from "vue";
import { Check, Copy } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type CopyButtonSize = "sm" | "md" | "lg";

export type CopyButtonProps = {
  text?: string;
  value?: string;
  locale?: string;
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
    locale: { type: String, default: "fr-FR" },
    label: { type: String, default: undefined },
    copiedLabel: { type: String, default: undefined },
    size: { type: String as () => CopyButtonSize, default: "md" },
    class: { type: String, default: undefined },
  },
  emits: ["click"],
  setup(props, { emit, attrs }) {
    const copied = ref(false);

    return () => {
      const isFr = (props.locale ?? "fr-FR").toLowerCase().startsWith("fr");
      const resolvedLabel = props.label ?? (isFr ? "Copier" : "Copy");
      const resolvedCopiedLabel = props.copiedLabel ?? (isFr ? "Copié" : "Copied");

      return h(
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
        [
          h(
            "span",
            { class: "st-copyButton__icon", "aria-hidden": "true" },
            h(copied.value ? Check : Copy, { size: 14, strokeWidth: 2, "aria-hidden": "true" }),
          ),
          h("span", { class: "st-copyButton__label" }, copied.value ? resolvedCopiedLabel : resolvedLabel),
        ],
      );
    };
  },
});
