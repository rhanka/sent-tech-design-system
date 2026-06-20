import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CardProps = {
  interactive?: boolean;
  title?: unknown;
  subtitle?: unknown;
  class?: string;
};

@Component({
  selector: "st-card",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (title || subtitle) {
        <div class="st-card__header">
          @if (title) {
            <h3 class="st-card__title">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="st-card__subtitle">{{ subtitle }}</p>
          }
        </div>
      }
      <div class="st-card__body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class Card {
  static readonly stComponentName = "Card";
  readonly componentName = "Card";
  @NgInput() interactive?: boolean;
  @NgInput() title?: unknown;
  @NgInput() subtitle?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-card",
      this.interactive && "st-card--interactive",
      this.classInput,
    );
  }
}
