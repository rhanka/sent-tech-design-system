import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ProgressBarTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";
export type ProgressBarSize = "sm" | "md" | "lg";

export type ProgressBarProps = {
  label?: unknown;
  helperText?: string;
  value?: number;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  showValue?: boolean;
  valueText?: string;
  class?: string;
};

export const ProgressBar = defineComponent({
  name: "ProgressBar",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: String, default: undefined },
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    tone: {
      type: String as () => ProgressBarTone,
      default: "neutral",
    },
    size: {
      type: String as () => ProgressBarSize,
      default: "md",
    },
    indeterminate: { type: Boolean, default: false },
    showValue: { type: Boolean, default: false },
    valueText: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const max = props.max ?? 100;
      const value = props.value ?? 0;
      const clamped = max <= 0 ? 0 : Math.min(Math.max(value, 0), max);
      const percent = props.indeterminate ? 0 : (clamped / max) * 100;
      const displayValue = props.valueText
        ? props.valueText
        : props.indeterminate
          ? ""
          : `${Math.round(percent)}%`;
      const showValueSpan = props.showValue && !props.indeterminate;

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-progressBar", props.class),
        },
        [
          props.label || showValueSpan
            ? h("div", { class: "st-progressBar__header" }, [
                props.label
                  ? h(
                      "span",
                      { class: "st-progressBar__label" },
                      props.label as string,
                    )
                  : null,
                showValueSpan
                  ? h(
                      "span",
                      { class: "st-progressBar__value", "aria-hidden": "true" },
                      displayValue,
                    )
                  : null,
              ])
            : null,
          h(
            "div",
            {
              class: classNames(
                "st-progressBar__track",
                `st-progressBar__track--${props.size}`,
                `st-progressBar__track--${props.tone}`,
                props.indeterminate &&
                  "st-progressBar__track--indeterminate",
              ),
              role: "progressbar",
              "aria-valuemin": props.indeterminate ? undefined : 0,
              "aria-valuemax": props.indeterminate ? undefined : max,
              "aria-valuenow": props.indeterminate ? undefined : clamped,
              "aria-valuetext": props.indeterminate ? undefined : displayValue,
              "aria-label": typeof props.label === "string" ? props.label : undefined,
            },
            [
              h("div", {
                class: "st-progressBar__fill",
                style: { "--st-progressBar-pct": `${percent}%` },
              }),
            ],
          ),
          props.helperText
            ? h("span", { class: "st-progressBar__help" }, props.helperText)
            : null,
        ],
      );
    };
  },
});
