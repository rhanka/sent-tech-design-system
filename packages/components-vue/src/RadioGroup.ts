import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";
import { Radio } from "./Radio.js";

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = {
  legend: string;
  /** Valeur sélectionnée (contrôlée). */
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé garantissant l'exclusivité radio. Requis. */
  name: string;
  options?: RadioGroupOption[];
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

export const RadioGroup = defineComponent({
  name: "RadioGroup",
  props: {
    legend: { type: String, required: true },
    value: { type: String, default: undefined },
    onChange: {
      type: Function as PropType<(value: string) => void>,
      default: undefined,
    },
    orientation: {
      type: String as () => "vertical" | "horizontal",
      default: "vertical",
    },
    name: { type: String, required: true },
    options: {
      type: Array as PropType<RadioGroupOption[]>,
      default: () => [],
    },
    helperText: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { slots, attrs, emit }) {
    function select(optionValue: string) {
      if (optionValue === props.value) return;
      props.onChange?.(optionValue);
      emit("change", optionValue);
    }

    return () => {
      const classes = classNames(
        "st-radioGroup",
        `st-radioGroup--${props.orientation}`,
        props.class,
      );
      return h(
        "fieldset",
        { ...attrs, class: classes, disabled: props.disabled },
        [
          h("legend", { class: "st-radioGroup__legend" }, props.legend),
          props.helperText
            ? h("p", { class: "st-radioGroup__help" }, props.helperText)
            : null,
          h("div", { class: "st-radioGroup__options" }, [
            ...props.options.map((option) =>
              h(Radio, {
                key: option.value,
                label: option.label,
                helperText: option.helperText,
                name: props.name,
                value: option.value,
                checked: props.value === option.value,
                disabled: option.disabled,
                onChange: () => select(option.value),
              }),
            ),
            slots.default?.(),
          ]),
        ],
      );
    };
  },
});
