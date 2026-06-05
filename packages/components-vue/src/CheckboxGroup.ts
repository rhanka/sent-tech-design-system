import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";
import { Checkbox } from "./Checkbox.js";

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = {
  legend: string;
  /** Valeurs cochées (liste contrôlée). */
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé par les cases (utile pour la soumission de formulaire). */
  name?: string;
  options?: CheckboxGroupOption[];
  /** Description optionnelle affichée sous la légende. */
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

export const CheckboxGroup = defineComponent({
  name: "CheckboxGroup",
  props: {
    legend: { type: String, required: true },
    value: { type: Array as PropType<string[]>, default: () => [] },
    onChange: {
      type: Function as PropType<(value: string[]) => void>,
      default: undefined,
    },
    orientation: {
      type: String as () => "vertical" | "horizontal",
      default: "vertical",
    },
    name: { type: String, default: undefined },
    options: {
      type: Array as PropType<CheckboxGroupOption[]>,
      default: () => [],
    },
    helperText: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { slots, attrs, emit }) {
    function toggle(optionValue: string, checked: boolean) {
      const next = checked
        ? [...props.value, optionValue]
        : props.value.filter((v) => v !== optionValue);
      props.onChange?.(next);
      emit("change", next);
    }

    return () => {
      const classes = classNames(
        "st-checkboxGroup",
        `st-checkboxGroup--${props.orientation}`,
        props.class,
      );
      return h(
        "fieldset",
        { ...attrs, class: classes, disabled: props.disabled },
        [
          h("legend", { class: "st-checkboxGroup__legend" }, props.legend),
          props.helperText
            ? h("p", { class: "st-checkboxGroup__help" }, props.helperText)
            : null,
          h("div", { class: "st-checkboxGroup__options" }, [
            ...props.options.map((option) =>
              h(Checkbox, {
                key: option.value,
                label: option.label,
                helperText: option.helperText,
                name: props.name,
                value: option.value,
                checked: props.value.includes(option.value),
                disabled: option.disabled,
                onChange: (event: Event) =>
                  toggle(
                    option.value,
                    (event.target as HTMLInputElement).checked,
                  ),
              }),
            ),
            slots.default?.(),
          ]),
        ],
      );
    };
  },
});
