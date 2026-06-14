import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

export type BadgeProps = {
  tone?: BadgeTone;
  class?: string;
};

@Component({
  selector: "st-badge",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Badge {
  static readonly stComponentName = "Badge";
  readonly componentName = "Badge";
  @NgInput() tone?: BadgeTone;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-badge", this.classInput].filter(Boolean).join(" ");
  }
}
