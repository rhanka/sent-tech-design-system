import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SliderSize = "sm" | "md" | "lg";

export type SliderProps = {
  label?: string;
  size?: SliderSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  modelValue?: number;
  class?: string;
};

export const Slider = defineComponent({
  name: "Slider",
  props: {
    label: { type: String, default: undefined },
    size: { type: String as () => SliderSize, default: "md" },
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    modelValue: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    return () => {
      const numeric = props.modelValue ?? props.value ?? props.defaultValue ?? 0;

      return h(
        "div",
        {
          class: classNames("st-slider", `st-slider--${props.size}`, props.class),
        },
        [
          h("div", { class: "st-slider__header" }, [
            props.label
              ? h("label", { class: "st-field__label" }, props.label)
              : null,
            h("span", { class: "st-slider__value" }, String(numeric)),
          ]),
          h("input", {
            ...attrs,
            class: "st-slider__input",
            type: "range",
            min: props.min,
            max: props.max,
            value: numeric,
            onInput: (event: Event) => {
              const val = Number((event.target as HTMLInputElement).value);
              emit("update:modelValue", val);
              emit("change", event);
            },
          }),
        ],
      );
    };
  },
});
