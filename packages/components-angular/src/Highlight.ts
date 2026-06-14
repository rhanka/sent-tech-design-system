import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type HighlightTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type HighlightProps = {
  tone?: HighlightTone;
  title?: unknown;
  class?: string;
};

@Component({
  selector: "st-highlight",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Highlight {
  static readonly stComponentName = "Highlight";
  readonly componentName = "Highlight";
  @NgInput() tone?: HighlightTone;
  @NgInput() title?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-highlight", this.classInput].filter(Boolean).join(" ");
  }
}
