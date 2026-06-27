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
    <aside [attr.data-st-component]="componentName" [class]="hostClass">
      @if (title) { <h3 class="st-highlight__title">{{ title }}</h3> }
      <div class="st-highlight__body"><ng-content></ng-content></div>
    </aside>
  `,
})
export class Highlight {
  static readonly stComponentName = "Highlight";
  readonly componentName = "Highlight";
  @NgInput() tone: HighlightTone = "neutral";
  @NgInput() title?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-highlight",
      `st-highlight--${this.tone}`,
      this.classInput,
    );
  }
}
