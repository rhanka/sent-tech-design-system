import { defineComponent, h, ref } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export type RangeSliderSize = "sm" | "md" | "lg";

export type RangeSliderProps = {
  /** Valeur contrôlée via v-model [poignée basse, poignée haute]. */
  modelValue?: [number, number];
  /** Alias contrôlé sans v-model. */
  value?: [number, number];
  /** Valeur initiale en mode non-contrôlé. Défaut [min, max]. */
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  size?: RangeSliderSize;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  class?: string;
};

export const RangeSlider = defineComponent({
  name: "RangeSlider",
  props: {
    modelValue: { type: Array as unknown as PropType<[number, number]>, default: undefined },
    value: { type: Array as unknown as PropType<[number, number]>, default: undefined },
    defaultValue: { type: Array as unknown as PropType<[number, number]>, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    size: { type: String as () => RangeSliderSize, default: "md" },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    helperText: { type: String, default: undefined },
    errorText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    showValue: { type: Boolean, default: true },
    valueFormatter: { type: Function as PropType<(value: number) => string>, default: undefined },
    ariaLabelMin: { type: String, default: "Valeur minimale" },
    ariaLabelMax: { type: String, default: "Valeur maximale" },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    function clampStep(n: number): number {
      if (!Number.isFinite(n)) return props.min;
      let v = Math.min(Math.max(n, props.min), props.max);
      if (Number.isFinite(props.step) && props.step > 0) {
        v = props.min + Math.round((v - props.min) / props.step) * props.step;
        v = Math.min(Math.max(v, props.min), props.max);
      }
      return v;
    }

    function normalizePair(pair: [number, number]): [number, number] {
      let lo = clampStep(pair[0]);
      let hi = clampStep(pair[1]);
      if (lo > hi) {
        const mid = lo;
        lo = Math.min(mid, hi);
        hi = Math.max(mid, hi);
      }
      return [lo, hi];
    }

    const internal = ref<[number, number]>(
      normalizePair(props.defaultValue ?? [props.min, props.max])
    );

    return () => {
      const isControlled =
        Array.isArray(props.modelValue) || Array.isArray(props.value);
      const source = props.modelValue ?? props.value ?? internal.value ?? [
        props.min,
        props.max,
      ];
      const current = normalizePair(source as [number, number]);
      const lowValue = current[0];
      const highValue = current[1];

      const lowPercent =
        props.max === props.min ? 0 : ((lowValue - props.min) / (props.max - props.min)) * 100;
      const highPercent =
        props.max === props.min ? 0 : ((highValue - props.min) / (props.max - props.min)) * 100;

      const lowLabel = props.valueFormatter ? props.valueFormatter(lowValue) : String(lowValue);
      const highLabel = props.valueFormatter
        ? props.valueFormatter(highValue)
        : String(highValue);
      const isInvalid = props.invalid || Boolean(props.errorText);

      function commit(next: [number, number]) {
        const normalized = normalizePair(next);
        if (!isControlled) internal.value = normalized;
        emit("update:modelValue", normalized);
        emit("change", normalized);
      }

      function setLow(raw: number) {
        if (props.disabled) return;
        const lo = Math.min(clampStep(raw), highValue);
        commit([lo, highValue]);
      }

      function setHigh(raw: number) {
        if (props.disabled) return;
        const hi = Math.max(clampStep(raw), lowValue);
        commit([lowValue, hi]);
      }

      function keyDelta(event: KeyboardEvent, val: number): number | null {
        const big = (Number.isFinite(props.step) && props.step > 0 ? props.step : 1) * 10;
        const small = Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            return val + small;
          case "ArrowLeft":
          case "ArrowDown":
            return val - small;
          case "PageUp":
            return val + big;
          case "PageDown":
            return val - big;
          case "Home":
            return props.min;
          case "End":
            return props.max;
          default:
            return null;
        }
      }

      function onLowKeydown(event: KeyboardEvent) {
        if (props.disabled) return;
        const next = keyDelta(event, lowValue);
        if (next === null) return;
        event.preventDefault();
        setLow(next);
      }

      function onHighKeydown(event: KeyboardEvent) {
        if (props.disabled) return;
        const next = keyDelta(event, highValue);
        if (next === null) return;
        event.preventDefault();
        setHigh(next);
      }

      const headerChildren = [
        props.label ? h("span", { class: "st-field__label" }, props.label) : null,
        props.showValue
          ? h(
              "output",
              { class: "st-rangeSlider__value", "aria-live": "polite" },
              `${lowLabel} – ${highLabel}`
            )
          : null,
      ].filter(Boolean);

      const lowThumb = h(
        "span",
        {
          class: "st-rangeSlider__thumb st-rangeSlider__thumb--low",
          style: { left: `${lowPercent}%` },
          role: "slider",
          tabindex: props.disabled ? -1 : 0,
          "aria-label": props.ariaLabelMin,
          "aria-valuemin": props.min,
          "aria-valuemax": highValue,
          "aria-valuenow": lowValue,
          "aria-valuetext": lowLabel,
          "aria-disabled": props.disabled ? "true" : undefined,
          onKeydown: onLowKeydown,
        },
        props.showValue
          ? [h("span", { class: "st-rangeSlider__tooltip" }, lowLabel)]
          : []
      );

      const highThumb = h(
        "span",
        {
          class: "st-rangeSlider__thumb st-rangeSlider__thumb--high",
          style: { left: `${highPercent}%` },
          role: "slider",
          tabindex: props.disabled ? -1 : 0,
          "aria-label": props.ariaLabelMax,
          "aria-valuemin": lowValue,
          "aria-valuemax": props.max,
          "aria-valuenow": highValue,
          "aria-valuetext": highLabel,
          "aria-disabled": props.disabled ? "true" : undefined,
          onKeydown: onHighKeydown,
        },
        props.showValue
          ? [h("span", { class: "st-rangeSlider__tooltip" }, highLabel)]
          : []
      );

      const track = h(
        "span",
        {
          class: "st-rangeSlider__track",
          "aria-invalid": isInvalid ? "true" : undefined,
        },
        [
          h("span", {
            class: "st-rangeSlider__fill",
            style: {
              left: `${lowPercent}%`,
              width: `${Math.max(0, highPercent - lowPercent)}%`,
            },
          }),
          lowThumb,
          highThumb,
        ]
      );

      const footer = props.errorText
        ? h("span", { class: "st-field__error" }, props.errorText)
        : props.helperText
          ? h("span", { class: "st-field__help" }, props.helperText)
          : null;

      return h(
        "div",
        { class: classNames("st-field", props.class) },
        [
          h("div", { class: "st-rangeSlider__header" }, headerChildren),
          h(
            "span",
            {
              class: classNames(
                "st-rangeSlider",
                `st-rangeSlider--${props.size}`,
                props.disabled ? "st-rangeSlider--disabled" : undefined
              ),
            },
            [
              h("span", { class: "st-rangeSlider__bounds", "aria-hidden": "true" }, String(props.min)),
              track,
              h("span", { class: "st-rangeSlider__bounds", "aria-hidden": "true" }, String(props.max)),
            ]
          ),
          footer,
        ].filter(Boolean)
      );
    };
  },
});
