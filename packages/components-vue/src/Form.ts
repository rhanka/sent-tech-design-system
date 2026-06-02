import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type FormStatus = "idle" | "submitting" | "submitted" | "error";

export type FormProps = {
  status?: FormStatus;
  message?: string;
  class?: string;
};

export const Form = defineComponent({
  name: "Form",
  props: {
    status: { type: String as () => FormStatus, default: "idle" },
    message: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["submit"],
  setup(props, { emit, slots, attrs }) {
    return () =>
      h(
        "form",
        {
          ...attrs,
          class: classNames("st-form", props.class),
          onSubmit: (event: Event) => {
            emit("submit", event);
          },
        },
        [
          h("div", { class: "st-form__body" }, slots.default?.()),
          props.message
            ? h(
                "p",
                {
                  class: classNames(
                    "st-form__message",
                    `st-form__message--${
                      props.status === "submitted"
                        ? "success"
                        : props.status === "error"
                          ? "error"
                          : "help"
                    }`,
                  ),
                },
                props.message,
              )
            : null,
        ],
      );
  },
});
