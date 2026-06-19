import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type SliderSize = "sm" | "md" | "lg";

export type SliderProps = {
  label?: string;
  size?: SliderSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  modelValue?: number;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  disabled?: boolean;
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
    step: { type: Number, default: 1 },
    modelValue: { type: Number, default: undefined },
    helperText: { type: String, default: undefined },
    errorText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    showValue: { type: Boolean, default: true },
    valueFormatter: { type: Function as unknown as () => (value: number) => string, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    const seed = props.modelValue ?? props.value ?? props.defaultValue ?? props.min;
    const internal = ref<number>(Number.isFinite(Number(seed)) ? Number(seed) : props.min);

    return () => {
      const controlled = props.modelValue !== undefined || props.value !== undefined;
      const raw = controlled ? (props.modelValue ?? props.value ?? props.min) : internal.value;
      const min = props.min;
      const max = props.max;
      const safe = !Number.isFinite(Number(raw))
        ? min
        : Number(raw) < min
          ? min
          : Number(raw) > max
            ? max
            : Number(raw);
      const percent = max === min ? 0 : ((safe - min) / (max - min)) * 100;
      const formatted = props.valueFormatter ? props.valueFormatter(safe) : String(safe);
      const isInvalid = props.invalid || Boolean(props.errorText);

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-field", props.class),
        },
        [
          h("div", { class: "st-slider__header" }, [
            props.label ? h("span", { class: "st-field__label" }, props.label) : null,
            props.showValue
              ? h("output", { class: "st-slider__value", "aria-live": "polite" }, formatted)
              : null,
          ]),
          h("span", { class: classNames("st-slider", `st-slider--${props.size}`) }, [
            h("span", { class: "st-slider__bounds", "aria-hidden": "true" }, String(min)),
            h("span", { class: "st-slider__track" }, [
              h("span", {
                class: "st-slider__fill",
                style: `--st-slider-fill: ${percent}%`,
              }),
              h(
                "span",
                {
                  class: "st-slider__thumb",
                  style: `left: ${percent}%`,
                  "aria-hidden": "true",
                },
                props.showValue
                  ? h("span", { class: "st-slider__tooltip" }, formatted)
                  : undefined,
              ),
              h("input", {
                class: "st-slider__input",
                type: "range",
                "aria-label": props.label,
                "aria-invalid": isInvalid ? "true" : undefined,
                value: safe,
                min: props.min,
                max: props.max,
                step: props.step,
                disabled: props.disabled,
                onInput: (event: Event) => {
                  const val = Number((event.target as HTMLInputElement).value);
                  if (Number.isFinite(val)) {
                    if (!controlled) internal.value = val;
                    emit("update:modelValue", val);
                    emit("change", val);
                  }
                },
              }),
            ]),
            h("span", { class: "st-slider__bounds", "aria-hidden": "true" }, String(max)),
          ]),
          props.errorText
            ? h("span", { class: "st-field__error" }, props.errorText)
            : props.helperText
              ? h("span", { class: "st-field__help" }, props.helperText)
              : null,
        ],
      );
    };
  },
});
