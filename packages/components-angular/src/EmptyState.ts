import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type EmptyStateProps = {
  title: unknown;
  message?: unknown;
  action?: unknown;
  class?: string;
};

@Component({
  selector: "st-empty-state",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyState {
  static readonly stComponentName = "EmptyState";
  readonly componentName = "EmptyState";
  @NgInput() title!: unknown;
  @NgInput() message?: unknown;
  @NgInput() action?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-emptyState", this.classInput].filter(Boolean).join(" ");
  }
}
