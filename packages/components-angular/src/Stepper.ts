import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progression'"
    >
      @for (step of steps; track $index) {
        <li
          [class]="stepClass($index)"
          [attr.aria-current]="stateOf($index) === 'current' ? 'step' : null"
        >
          <span class="st-stepper__indicator">
            @if (clickable) {
              <button
                type="button"
                class="st-stepper__circle st-stepper__circle--button"
                [attr.aria-label]="step.label"
                (click)="handleClick($index)"
              >
                @if (stateOf($index) === 'complete') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                } @else {
                  <span class="st-stepper__index">{{ $index + 1 }}</span>
                }
              </button>
            } @else {
              <span class="st-stepper__circle">
                @if (stateOf($index) === 'complete') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                } @else {
                  <span class="st-stepper__index">{{ $index + 1 }}</span>
                }
              </span>
            }
            @if ($index < steps.length - 1) {
              <span class="st-stepper__connector"></span>
            }
          </span>
          <span class="st-stepper__text">
            <span class="st-stepper__label">{{ step.label }}</span>
            @if (step.description) {
              <span class="st-stepper__description">{{ step.description }}</span>
            }
          </span>
        </li>
      }
    </ol>
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

  @Output() readonly stepClick = new EventEmitter<number>();

  stateOf(index: number): "complete" | "current" | "upcoming" {
    const cur = this.current ?? 0;
    if (index < cur) return "complete";
    if (index === cur) return "current";
    return "upcoming";
  }

  stepClass(index: number): string {
    return classNames(
      "st-stepper__step",
      `st-stepper__step--${this.stateOf(index)}`,
    );
  }

  handleClick(index: number): void {
    if (!this.clickable) return;
    this.onStepClick?.(index);
    this.stepClick.emit(index);
  }

  get hostClass(): string {
    return classNames(
      "st-stepper",
      `st-stepper--${this.orientation ?? "horizontal"}`,
      this.classInput,
    );
  }
}
