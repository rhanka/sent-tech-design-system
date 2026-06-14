import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type QuoteProps = {
  author?: unknown;
  source?: unknown;
  class?: string;
};

@Component({
  selector: "st-quote",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Quote {
  static readonly stComponentName = "Quote";
  readonly componentName = "Quote";
  @NgInput() author?: unknown;
  @NgInput() source?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-quote", this.classInput].filter(Boolean).join(" ");
  }
}
