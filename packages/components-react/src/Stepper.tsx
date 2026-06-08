import React from "react";
import { Check } from "lucide-react";
import { classNames } from "./classNames.js";

export interface StepperStep {
  label: string;
  description?: string;
}

export type StepperOrientation = "horizontal" | "vertical";

export type StepperProps = Omit<React.HTMLAttributes<HTMLOListElement>, "className"> & {
  steps: StepperStep[];
  /** Index de l'étape courante (0-based). */
  current?: number;
  orientation?: StepperOrientation;
  /** Autorise la navigation au clic sur les étapes. */
  clickable?: boolean;
  onStepClick?: (index: number) => void;
  /** Étiquette a11y de la liste d'étapes. */
  label?: string;
  className?: string;
};

function CheckIcon() {
  return <Check size={14} strokeWidth={2.5} aria-hidden="true" />;
}

export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    { steps, current = 0, orientation = "horizontal", clickable = false, onStepClick, label = "Progression", className, ...rest },
    ref,
  ) => {
    const classes = classNames("st-stepper", `st-stepper--${orientation}`, className);

    function stateOf(index: number): "complete" | "current" | "upcoming" {
      if (index < current) return "complete";
      if (index === current) return "current";
      return "upcoming";
    }

    function handleClick(index: number) {
      if (!clickable) return;
      onStepClick?.(index);
    }

    return (
      <ol {...rest} ref={ref} className={classes} aria-label={label}>
        {steps.map((step, index) => {
          const state = stateOf(index);
          const isLast = index === steps.length - 1;
          return (
            <li
              key={index}
              className={classNames("st-stepper__step", `st-stepper__step--${state}`)}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="st-stepper__indicator">
                {clickable ? (
                  <button
                    type="button"
                    className="st-stepper__circle st-stepper__circle--button"
                    onClick={() => handleClick(index)}
                    aria-label={step.label}
                  >
                    {state === "complete" ? <CheckIcon /> : <span className="st-stepper__index">{index + 1}</span>}
                  </button>
                ) : (
                  <span className="st-stepper__circle">
                    {state === "complete" ? <CheckIcon /> : <span className="st-stepper__index">{index + 1}</span>}
                  </span>
                )}
                {!isLast ? <span className="st-stepper__connector" /> : null}
              </span>
              <span className="st-stepper__text">
                <span className="st-stepper__label">{step.label}</span>
                {step.description ? <span className="st-stepper__description">{step.description}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    );
  },
);

Stepper.displayName = "Stepper";
