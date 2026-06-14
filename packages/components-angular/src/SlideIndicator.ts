import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SlideIndicatorVariant = "dots" | "bars";

export type SlideIndicatorSize = "sm" | "md" | "lg";

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type SlideIndicatorProps = {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: number;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: SlideIndicatorSize;
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-slide-indicator",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SlideIndicator {
  static readonly stComponentName = "SlideIndicator";
  readonly componentName = "SlideIndicator";
  @NgInput() count!: number;
  @NgInput() current?: number;
  @NgInput() onChange?: (index: number) => void;
  @NgInput() size?: SlideIndicatorSize;
  @NgInput() variant?: SlideIndicatorVariant;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-slideIndicator", this.classInput].filter(Boolean).join(" ");
  }
}
