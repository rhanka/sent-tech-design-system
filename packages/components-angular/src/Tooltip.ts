import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TooltipPlacement = "top" | "bottom";

export type TooltipProps = {
  content: unknown;
  placement?: TooltipPlacement;
  class?: string;
};

@Component({
  selector: "st-tooltip",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Tooltip {
  static readonly stComponentName = "Tooltip";
  readonly componentName = "Tooltip";
  @NgInput() content!: unknown;
  @NgInput() placement?: TooltipPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tooltip", this.classInput].filter(Boolean).join(" ");
  }
}
