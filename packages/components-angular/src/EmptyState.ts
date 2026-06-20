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
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status">
      <div class="st-emptyState__body">
        <p class="st-emptyState__title">{{ title }}</p>
        @if (message) { <p class="st-emptyState__message">{{ message }}</p> }
        @if (action) { <div class="st-emptyState__action">{{ action }}</div> }
      </div>
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
    return classNames("st-empty-state", "st-emptyState", this.classInput);
  }
}
