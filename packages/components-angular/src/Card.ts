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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Card {
  static readonly stComponentName = "Card";
  readonly componentName = "Card";
  @NgInput() interactive?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-card", this.classInput].filter(Boolean).join(" ");
  }
}
