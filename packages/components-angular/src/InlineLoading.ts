import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type InlineLoadingStatus = "active" | "inactive" | "success" | "error";

export type InlineLoadingProps = {
  label?: unknown;
  status?: InlineLoadingStatus;
  class?: string;
};

@Component({
  selector: "st-inline-loading",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status" [attr.aria-label]="label">
      <span class="st-inlineLoading__spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `,
})
export class InlineLoading {
  static readonly stComponentName = "InlineLoading";
  readonly componentName = "InlineLoading";
  @NgInput() label?: unknown;
  @NgInput() status?: InlineLoadingStatus;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-inlineLoading",
      this.status && `st-inlineLoading--${this.status}`,
      this.classInput,
    );
  }
}
