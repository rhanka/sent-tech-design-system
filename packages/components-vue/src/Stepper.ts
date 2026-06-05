import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export interface StepperStep {
  label: string;
  description?: string;
}

export type StepperOrientation = "horizontal" | "vertical";

export type StepperProps = {
  steps: StepperStep[];
  /** Index de l'étape courante (0-based). */
  current?: number;
  orientation?: StepperOrientation;
  /** Autorise la navigation au clic sur les étapes. */
  clickable?: boolean;
  onStepClick?: (index: number) => void;
  /** Étiquette a11y de la liste d'étapes. */
  label?: string;
  class?: string;
};

function CheckIcon() {
  return h(
    "svg",
    {
      width: 14,
      height: 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      focusable: "false",
      "aria-hidden": "true",
    },
    [h("path", { d: "M20 6 9 17l-5-5" })],
  );
}

export const Stepper = defineComponent({
  name: "Stepper",
  props: {
    steps: { type: Array as PropType<StepperStep[]>, required: true },
    current: { type: Number, default: 0 },
    orientation: {
      type: String as () => StepperOrientation,
      default: "horizontal",
    },
    clickable: { type: Boolean, default: false },
    onStepClick: {
      type: Function as PropType<(index: number) => void>,
      default: undefined,
    },
    label: { type: String, default: "Progression" },
    class: { type: String, default: undefined },
  },
  emits: ["stepClick"],
  setup(props, { attrs, emit }) {
    function stateOf(index: number): "complete" | "current" | "upcoming" {
      if (index < props.current) return "complete";
      if (index === props.current) return "current";
      return "upcoming";
    }

    function handleClick(index: number) {
      if (!props.clickable) return;
      props.onStepClick?.(index);
      emit("stepClick", index);
    }

    return () => {
      const classes = classNames(
        "st-stepper",
        `st-stepper--${props.orientation}`,
        props.class,
      );
      return h(
        "ol",
        { ...attrs, class: classes, "aria-label": props.label },
        props.steps.map((step, index) => {
          const state = stateOf(index);
          const isLast = index === props.steps.length - 1;
          return h(
            "li",
            {
              key: index,
              class: classNames(
                "st-stepper__step",
                `st-stepper__step--${state}`,
              ),
              "aria-current": state === "current" ? "step" : undefined,
            },
            [
              h("span", { class: "st-stepper__indicator" }, [
                props.clickable
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "st-stepper__circle st-stepper__circle--button",
                        onClick: () => handleClick(index),
                        "aria-label": step.label,
                      },
                      [
                        state === "complete"
                          ? CheckIcon()
                          : h(
                              "span",
                              { class: "st-stepper__index" },
                              index + 1,
                            ),
                      ],
                    )
                  : h("span", { class: "st-stepper__circle" }, [
                      state === "complete"
                        ? CheckIcon()
                        : h("span", { class: "st-stepper__index" }, index + 1),
                    ]),
                !isLast
                  ? h("span", { class: "st-stepper__connector" })
                  : null,
              ]),
              h("span", { class: "st-stepper__text" }, [
                h("span", { class: "st-stepper__label" }, step.label),
                step.description
                  ? h(
                      "span",
                      { class: "st-stepper__description" },
                      step.description,
                    )
                  : null,
              ]),
            ],
          );
        }),
      );
    };
  },
});
