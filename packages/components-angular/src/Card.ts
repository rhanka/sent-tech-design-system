import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CardProps = {
  interactive?: boolean;
  class?: string;
};

@Component({
  selector: "st-card",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </section>
  `,
})
export class Card {
  static readonly stComponentName = "Card";
  readonly componentName = "Card";
  @NgInput() interactive?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-card",
      this.interactive && "st-card--interactive",
      this.classInput,
    );
  }
}
