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
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status">
      @if ((variant ?? 'spinner') === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      } @else {
        <div class="st-skeleton st-loading__skeleton">
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line" style="width:75%"></div>
        </div>
      }
      @if (title ?? label) { <p class="st-loading__label">{{ title ?? label }}</p> }
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
