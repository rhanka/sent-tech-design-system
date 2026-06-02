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
  value?: number;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  class?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, min = 0, max = 100): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

export const ProgressBar = defineComponent({
  name: "ProgressBar",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
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
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const percent = pct(props.value ?? 0, 0, props.max ?? 100);

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-progressBar", props.class),
        },
        [
          props.label
            ? h(
                "div",
                { class: "st-progressBar__label" },
                props.label as string,
              )
            : null,
          h(
            "div",
            {
              class: classNames(
                "st-progressBar__track",
                `st-progressBar__track--${props.tone}`,
                `st-progressBar__track--${props.size}`,
                props.indeterminate &&
                  "st-progressBar__track--indeterminate",
              ),
              role: "progressbar",
              "aria-valuenow": props.indeterminate
                ? undefined
                : props.value,
              "aria-valuemin": 0,
              "aria-valuemax": props.max,
            },
            [
              h("div", {
                class: "st-progressBar__fill",
                style: {
                  width: props.indeterminate
                    ? undefined
                    : `${percent}%`,
                },
              }),
            ],
          ),
          h(
            "span",
            { class: "st-progressBar__value" },
            `${Math.round(percent)}%`,
          ),
        ],
      );
    };
  },
});
