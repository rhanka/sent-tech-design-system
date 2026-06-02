import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type SelectSize = "sm" | "md" | "lg";

export type SelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type SelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  size?: SelectSize;
  options?: SelectOption[];
  modelValue?: string;
  disabled?: boolean;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-select-${++_counter}`;
}

export const Select = defineComponent({
  name: "Select",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    invalid: { type: Boolean, default: false },
    size: { type: String as () => SelectSize, default: "md" },
    options: { type: Array as () => SelectOption[], default: undefined },
    modelValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, slots, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const inputId = autoId.value;
      const isInvalid = props.invalid || Boolean(props.errorText);

      return h(
        "div",
        { class: classNames("st-field", props.class) },
        [
          h(
            "label",
            { class: "st-field__control", for: inputId },
            [
              props.label
                ? h(
                    "span",
                    { class: "st-field__label" },
                    props.label as string,
                  )
                : null,
              h(
                "select",
                {
                  ...attrs,
                  id: inputId,
                  class: classNames(
                    "st-select",
                    `st-select--${props.size}`,
                  ),
                  "aria-invalid": isInvalid ? "true" : undefined,
                  value: props.modelValue,
                  disabled: props.disabled,
                  onChange: (event: Event) => {
                    emit(
                      "update:modelValue",
                      (event.target as HTMLSelectElement).value,
                    );
                    emit("change", event);
                  },
                },
                slots.default?.() ??
                  (props.options?.map((option) =>
                    h(
                      "option",
                      {
                        key: option.value,
                        value: option.value,
                        disabled: option.disabled,
                      },
                      option.label as string,
                    ),
                  ) ?? []),
              ),
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
