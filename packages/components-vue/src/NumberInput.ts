import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type NumberInputSize = "sm" | "md" | "lg";

export type NumberInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: NumberInputSize;
  modelValue?: number | string;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-numberInput-${++_counter}`;
}

export const NumberInput = defineComponent({
  name: "NumberInput",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    size: { type: String as () => NumberInputSize, default: "md" },
    modelValue: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    min: { type: [Number, String], default: undefined },
    max: { type: [Number, String], default: undefined },
    step: { type: [Number, String], default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "input"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const inputId = autoId.value;
      const isInvalid = Boolean(props.errorText);

      return h(
        "div",
        {
          class: classNames(
            "st-field",
            "st-numberInput",
            `st-numberInput--${props.size}`,
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
              h("input", {
                ...attrs,
                id: inputId,
                class: "st-control st-numberInput__control",
                type: "number",
                "aria-invalid": isInvalid ? "true" : undefined,
                value: props.modelValue,
                disabled: props.disabled,
                readonly: props.readonly,
                min: props.min,
                max: props.max,
                step: props.step,
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
