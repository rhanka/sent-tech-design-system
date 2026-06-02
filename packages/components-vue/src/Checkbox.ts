import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type CheckboxProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

export const Checkbox = defineComponent({
  name: "Checkbox",
  props: {
    label: { type: String, required: true },
    helperText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    modelValue: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    return () =>
      h(
        "label",
        {
          class: classNames("st-choice", "st-choice--checkbox", props.class),
        },
        [
          h("input", {
            ...attrs,
            class: "st-choice__input",
            type: "checkbox",
            name: props.name,
            value: props.value,
            checked: props.modelValue ?? props.checked,
            disabled: props.disabled,
            "aria-invalid": props.invalid ? "true" : undefined,
            onChange: (event: Event) => {
              const checked = (event.target as HTMLInputElement).checked;
              emit("update:modelValue", checked);
              emit("change", event);
            },
          }),
          h("span", { class: "st-choice__content" }, [
            h("span", { class: "st-choice__label" }, props.label),
            props.helperText
              ? h("span", { class: "st-choice__help" }, props.helperText)
              : null,
          ]),
        ],
      );
  },
});
