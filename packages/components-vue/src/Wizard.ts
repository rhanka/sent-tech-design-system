import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type WizardStep = { label: string; description?: string };

export type WizardProps = {
  stepperLabel?: string;
  steps: WizardStep[];
  currentStep?: number;
  stepTitle?: string;
  cancelLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  isLast?: boolean;
  oncancel?: () => void;
  onback?: () => void;
  onnext?: () => void;
  onfinish?: () => void;
  class?: string;
};

export const Wizard = defineComponent({
  name: "Wizard",
  props: {
    stepperLabel: { type: String, default: "Progress" },
    steps: { type: Array as PropType<WizardStep[]>, required: true },
    currentStep: { type: Number, default: 0 },
    stepTitle: { type: String, default: undefined },
    cancelLabel: { type: String, default: "Cancel" },
    backLabel: { type: String, default: "Back" },
    nextLabel: { type: String, default: "Next" },
    finishLabel: { type: String, default: "Finish" },
    isLast: { type: Boolean, default: false },
    oncancel: { type: Function as PropType<() => void>, default: undefined },
    onback: { type: Function as PropType<() => void>, default: undefined },
    onnext: { type: Function as PropType<() => void>, default: undefined },
    onfinish: { type: Function as PropType<() => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const current = props.currentStep ?? 0;
      return h("div", { ...attrs, class: classNames("st-wz", props.class) }, [
        h("div", { class: "st-wz__stepper" }, [
          h("p", { class: "st-wz__stepper-label" }, props.stepperLabel ?? "Progress"),
          h(
            "ol",
            { class: "st-stepper", "aria-label": props.stepperLabel ?? "Progress" },
            (props.steps ?? []).map((step, i) =>
              h(
                "li",
                {
                  key: i,
                  class: classNames(
                    "st-stepper__item",
                    i < current
                      ? "st-stepper__item--complete"
                      : i === current
                        ? "st-stepper__item--current"
                        : undefined,
                  ),
                },
                [
                  h("span", { class: "st-stepper__index" }, String(i + 1)),
                  h("span", { class: "st-stepper__label" }, step.label),
                  step.description ? h("span", { class: "st-stepper__description" }, step.description) : null,
                ],
              ),
            ),
          ),
        ]),
        h("div", { class: "st-wz__body" }, [
          props.stepTitle ? h("h3", { class: "st-wz__step-title" }, props.stepTitle) : null,
          h("div", { class: "st-wz__content" }, slots.default ? slots.default() : []),
        ]),
        h("div", { class: "st-wz__footer" }, [
          h(
            "button",
            {
              type: "button",
              class: "st-button st-button--ghost",
              onClick: () => props.oncancel?.(),
            },
            props.cancelLabel ?? "Cancel",
          ),
          h("div", { class: "st-wz__footer-actions" }, [
            current > 0
              ? h(
                  "button",
                  {
                    type: "button",
                    class: "st-button st-button--secondary",
                    onClick: () => props.onback?.(),
                  },
                  props.backLabel ?? "Back",
                )
              : null,
            props.isLast
              ? h(
                  "button",
                  {
                    type: "button",
                    class: "st-button st-button--primary",
                    onClick: () => props.onfinish?.(),
                  },
                  props.finishLabel ?? "Finish",
                )
              : h(
                  "button",
                  {
                    type: "button",
                    class: "st-button st-button--primary",
                    onClick: () => props.onnext?.(),
                  },
                  props.nextLabel ?? "Next",
                ),
          ]),
        ]),
      ]);
    };
  },
});
