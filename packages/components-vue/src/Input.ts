import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  size?: InputSize;
  id?: string;
  class?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
};

let _counter = 0;
function nextId(): string {
  return `st-input-${++_counter}`;
}

export const Input = defineComponent({
  name: "Input",
  props: {
    label: { type: String, default: undefined },
    helperText: { type: String, default: undefined },
    errorText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    size: { type: String as () => InputSize, default: "md" },
    id: { type: String, default: undefined },
    class: { type: String, default: undefined },
    modelValue: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "change", "input", "focus", "blur"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const inputId = props.id ?? autoId.value;
      const isInvalid = props.invalid || Boolean(props.errorText);

      return h("div", { class: classNames("st-field", props.class) }, [
        h("label", { class: "st-field__control", for: inputId }, [
          props.label
            ? h("span", { class: "st-field__label" }, props.label)
            : null,
          h("input", {
            ...attrs,
            id: inputId,
            class: classNames("st-control", `st-control--${props.size}`),
            "aria-invalid": isInvalid ? "true" : undefined,
            value: props.modelValue,
            placeholder: props.placeholder,
            disabled: props.disabled,
            readonly: props.readonly,
            onInput: (event: Event) => {
              emit("update:modelValue", (event.target as HTMLInputElement).value);
              emit("input", event);
            },
            onChange: (event: Event) => {
              emit("change", event);
            },
          }),
        ]),
        props.errorText
          ? h("span", { class: "st-field__error" }, props.errorText)
          : props.helperText
            ? h("span", { class: "st-field__help" }, props.helperText)
            : null,
      ]);
    };
  },
});
