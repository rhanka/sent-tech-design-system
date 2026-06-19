import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { CopyButton } from "./CopyButton.js";

export type CodeSnippetProps = {
  code: string;
  language?: string;
  inline?: boolean;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  class?: string;
};

export const CodeSnippet = defineComponent({
  name: "CodeSnippet",
  props: {
    code: { type: String, required: true },
    language: { type: String, default: undefined },
    inline: { type: Boolean, default: false },
    copyable: { type: Boolean, default: true },
    copyLabel: { type: String, default: "Copy" },
    copiedLabel: { type: String, default: "Copied" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      if (props.inline) {
        return h(
          "code",
          {
            ...attrs,
            class: classNames("st-codeSnippet--inline", props.class),
            "data-language": props.language,
          },
          props.code,
        );
      }
      return h(
        "div",
        { ...attrs, class: "st-codeSnippet__wrapper" },
        [
          h(
            "pre",
            {
              class: classNames("st-codeSnippet", props.class),
              "data-language": props.language,
            },
            h("code", { class: "st-codeSnippet__code" }, props.code),
          ),
          props.copyable
            ? h(
                "span",
                { class: "st-codeSnippet__copy" },
                h(CopyButton, {
                  value: props.code,
                  size: "sm",
                  label: props.copyLabel,
                  copiedLabel: props.copiedLabel,
                }),
              )
            : null,
        ],
      );
    };
  },
});
