import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LoadingStateVariant = "spinner" | "skeleton";

export type LoadingStateProps = {
  label?: string;
  variant?: LoadingStateVariant;
  class?: string;
};

@Component({
  selector: "st-loading-state",
  standalone: true,
  template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="label"
      aria-busy="true"
    >
      @if (resolvedVariant === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true"></span>
      } @else {
        <span class="st-loading__skeleton" aria-hidden="true"></span>
      }
      <span class="st-loading__label">{{ label }}</span>
    </section>
  `,
})
export class LoadingState {
  static readonly stComponentName = "LoadingState";
  readonly componentName = "LoadingState";
  @NgInput() label = "Loading";
  @NgInput() variant?: LoadingStateVariant;
  @NgInput("class") classInput?: string;

  get resolvedVariant(): LoadingStateVariant {
    return this.variant ?? "spinner";
  }

  get hostClass(): string {
    return classNames(
      "st-loading",
      `st-loading--${this.resolvedVariant}`,
      this.classInput,
    );
  }
}
