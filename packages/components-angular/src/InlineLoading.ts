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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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
    return ["st-inlineLoading", this.classInput].filter(Boolean).join(" ");
  }
}
