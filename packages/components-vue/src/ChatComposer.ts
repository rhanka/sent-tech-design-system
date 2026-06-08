import { defineComponent, h, ref } from "vue";
import { Send } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type ChatComposerProps = {
  value?: string;
  placeholder?: string;
  submitLabel?: unknown;
  class?: string;
};

export const ChatComposer = defineComponent({
  name: "ChatComposer",
  props: {
    value: { type: String, default: "" },
    placeholder: { type: String, default: "Message" },
    submitLabel: { type: [String, Object] as unknown as () => unknown, default: "Send" },
    class: { type: String, default: undefined },
  },
  emits: ["submit"],
  setup(props, { emit, slots, attrs }) {
    const draft = ref(props.value ?? "");

    return () => {
      const placeholder = props.placeholder ?? "Message";
      const submitLabel = props.submitLabel ?? "Send";
      return h(
        "form",
        {
          ...attrs,
          class: classNames("st-chatComposer", props.class),
          onSubmit: (event: Event) => {
            event.preventDefault();
            emit("submit", { value: draft.value });
          },
        },
        [
          h("div", { class: "st-chatComposer__body" }, [
            h("div", { class: "st-chatComposer__inputShell" }, [
              h("textarea", {
                class: "st-chatComposer__textarea st-chatComposer__input",
                placeholder,
                value: draft.value,
                onInput: (event: Event) => {
                  draft.value = (event.currentTarget as HTMLTextAreaElement).value;
                },
              }),
            ]),
          ]),
          h("div", { class: "st-chatComposer__toolbar" }, [
            h(
              "div",
              { class: "st-chatComposer__actions st-chatComposer__actions--left" },
              slots.default?.(),
            ),
            h("div", { class: "st-chatComposer__actions st-chatComposer__actions--right" }, [
              h(
                "button",
                { type: "submit", class: "st-button st-button--primary st-button--sm" },
                [
                  h(Send, { size: 16, strokeWidth: 2, "aria-hidden": "true" }),
                  submitLabel as string,
                ],
              ),
            ]),
          ]),
        ],
      );
    };
  },
});
