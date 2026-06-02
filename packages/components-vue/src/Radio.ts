import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type RadioProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

export const Radio = defineComponent({
  name: "Radio",
  props: {
    label: { type: String, required: true },
    helperText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    modelValue: { type: String, default: undefined },
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
          class: classNames("st-choice", "st-choice--radio", props.class),
        },
        [
          h("input", {
            ...attrs,
            class: "st-choice__input",
            type: "radio",
            name: props.name,
            value: props.value,
            checked:
              props.checked ??
              (props.modelValue !== undefined && props.modelValue === props.value),
            disabled: props.disabled,
            "aria-invalid": props.invalid ? "true" : undefined,
            onChange: (event: Event) => {
              const value = (event.target as HTMLInputElement).value;
              emit("update:modelValue", value);
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
