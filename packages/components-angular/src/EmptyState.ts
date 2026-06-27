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
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-empty-state__content">
        <h2 class="st-empty-state__title st-emptyState__title">{{ title }}</h2>
        @if (message) { <p class="st-empty-state__message st-emptyState__message">{{ message }}</p> }
        <ng-content></ng-content>
        @if (action) { <div class="st-empty-state__action">{{ action }}</div> }
      </div>
    </section>
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
