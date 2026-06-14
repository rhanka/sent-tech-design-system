import { Component, Input as NgInput } from "@angular/core";

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

@Component({
  selector: "st-stepper",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Stepper {
  static readonly stComponentName = "Stepper";
  readonly componentName = "Stepper";
  @NgInput() steps!: StepperStep[];
  @NgInput() current?: number;
  @NgInput() orientation?: StepperOrientation;
  @NgInput() clickable?: boolean;
  @NgInput() onStepClick?: (index: number) => void;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-stepper", this.classInput].filter(Boolean).join(" ");
  }
}
