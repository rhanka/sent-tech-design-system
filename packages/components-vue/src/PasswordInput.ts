import { defineComponent, h, ref } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type PasswordInputSize = "sm" | "md" | "lg";

export type PasswordInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: PasswordInputSize;
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-passwordInput-${++_counter}`;
}

export const PasswordInput = defineComponent({
  name: "PasswordInput",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    size: { type: String as () => PasswordInputSize, default: "md" },
    modelValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "input"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());
    const shown = ref(false);

    return () => {
      const inputId = autoId.value;
      const isInvalid = Boolean(props.errorText);

      return h(
        "div",
        {
          class: classNames(
            "st-field",
            props.class,
          ),
        },
        [
          h(
            "label",
            { class: "st-field__control", for: inputId },
            [
              props.label
                ? h("span", { class: "st-field__label" }, props.label as string)
                : null,
              h("span", { class: classNames("st-passwordInput", `st-passwordInput--${props.size}`) }, [
                h("input", {
                  ...attrs,
                  id: inputId,
                  class: "st-passwordInput__control",
                  type: shown.value ? "text" : "password",
                  "aria-invalid": isInvalid ? "true" : undefined,
                  value: props.modelValue,
                  disabled: props.disabled,
                  placeholder: props.placeholder,
                  onInput: (event: Event) => {
                    emit(
                      "update:modelValue",
                      (event.target as HTMLInputElement).value,
                    );
                    emit("input", event);
                  },
                  onChange: (event: Event) => {
                    emit("change", event);
                  },
                }),
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-passwordInput__toggle",
                    "aria-label": shown.value ? "Hide password" : "Show password",
                    "aria-pressed": shown.value ? "true" : "false",
                    onClick: () => {
                      shown.value = !shown.value;
                    },
                  },
                  h(shown.value ? EyeOff : Eye, { size: 16, strokeWidth: 2, "aria-hidden": "true" }),
                ),
              ]),
            ],
          ),
          props.errorText
            ? h(
                "span",
                { class: "st-field__error" },
                props.errorText as string,
              )
            : props.helperText
              ? h(
                  "span",
                  { class: "st-field__help" },
                  props.helperText as string,
                )
              : null,
        ],
      );
    };
  },
});
