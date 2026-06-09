import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type NumberInputSize = "sm" | "md" | "lg";

export type NumberInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: NumberInputSize;
  modelValue?: number | string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: number | string | null;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  incrementLabel?: string;
  decrementLabel?: string;
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
    value: { type: [Number, String] as unknown as () => number | string | null, default: undefined },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    min: { type: [Number, String], default: undefined },
    max: { type: [Number, String], default: undefined },
    step: { type: [Number, String], default: undefined },
    incrementLabel: { type: String, default: "Increment value" },
    decrementLabel: { type: String, default: "Decrement value" },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "input"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());
    // Internal value, seeded from modelValue/value; used when the consumer does
    // not control the field (the docs node specs pass an initial `value` only).
    const seed = props.modelValue ?? props.value;
    const internal = ref<number | null>(
      seed !== undefined && seed !== null && seed !== "" ? Number(seed) : null,
    );

    return () => {
      const inputId = autoId.value;
      const isInvalid = Boolean(props.errorText);
      const controlled = props.modelValue !== undefined;
      const bound = props.modelValue ?? props.value;
      const numValue: number | null = controlled
        ? bound === null || bound === undefined || bound === "" ? null : Number(bound)
        : internal.value;

      const numMin = props.min !== undefined && props.min !== "" ? Number(props.min) : undefined;
      const numMax = props.max !== undefined && props.max !== "" ? Number(props.max) : undefined;
      const numStep = props.step !== undefined && props.step !== "" ? Number(props.step) : 1;

      const clamp = (n: number): number => {
        if (numMin !== undefined && n < numMin) return numMin;
        if (numMax !== undefined && n > numMax) return numMax;
        return n;
      };
      const isAtMin = numValue !== null && numMin !== undefined && numValue <= numMin;
      const isAtMax = numValue !== null && numMax !== undefined && numValue >= numMax;

      const setValue = (next: number | null) => {
        if (!controlled) internal.value = next;
        emit("update:modelValue", next);
      };
      const increment = () => setValue(clamp((numValue ?? numMin ?? 0) + numStep));
      const decrement = () => setValue(clamp((numValue ?? numMax ?? 0) - numStep));

      return h(
        "div",
        {
          class: classNames(
            "st-field",
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
              h("span", { class: classNames("st-numberInput", `st-numberInput--${props.size}`) }, [
                h("input", {
                  ...attrs,
                  id: inputId,
                  class: "st-numberInput__control",
                  type: "number",
                  "aria-invalid": isInvalid ? "true" : undefined,
                  value: numValue ?? "",
                  disabled: props.disabled,
                  readonly: props.readonly,
                  min: props.min,
                  max: props.max,
                  step: props.step,
                  onInput: (event: Event) => {
                    const raw = (event.target as HTMLInputElement).value;
                    setValue(raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : numValue);
                    emit("input", event);
                  },
                  onChange: (event: Event) => {
                    emit("change", event);
                  },
                }),
                h("span", { class: "st-numberInput__buttons" }, [
                  h(
                    "button",
                    {
                      type: "button",
                      class: "st-numberInput__button",
                      "aria-label": props.decrementLabel,
                      disabled: props.disabled || isAtMin,
                      onClick: decrement,
                    },
                    h("span", { "aria-hidden": "true" }, "−"),
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      class: "st-numberInput__button",
                      "aria-label": props.incrementLabel,
                      disabled: props.disabled || isAtMax,
                      onClick: increment,
                    },
                    h("span", { "aria-hidden": "true" }, "+"),
                  ),
                ]),
              ]),
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
