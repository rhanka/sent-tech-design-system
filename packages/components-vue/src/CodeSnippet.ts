import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type CodeSnippetProps = {
  code: string;
  inline?: boolean;
  class?: string;
};

export const CodeSnippet = defineComponent({
  name: "CodeSnippet",
  props: {
    code: { type: String, required: true },
    inline: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const tag = props.inline ? "code" : "pre";
      return h(
        tag,
        {
          ...attrs,
          class: classNames(
            "st-codeSnippet",
            props.inline && "st-codeSnippet--inline",
            props.class,
          ),
        },
        h("code", { class: "st-codeSnippet__code" }, props.code),
      );
    };
  },
});
