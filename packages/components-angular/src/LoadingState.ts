import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LoadingStateVariant = "spinner" | "skeleton";

export type LoadingStateProps = {
  label?: unknown;
  title?: unknown;
  variant?: LoadingStateVariant;
  class?: string;
};

@Component({
  selector: "st-loading-state",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class LoadingState {
  static readonly stComponentName = "LoadingState";
  readonly componentName = "LoadingState";
  @NgInput() label?: unknown;
  @NgInput() title?: unknown;
  @NgInput() variant?: LoadingStateVariant;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-loading",
      `st-loading--${this.variant ?? "spinner"}`,
      this.classInput,
    );
  }
}
