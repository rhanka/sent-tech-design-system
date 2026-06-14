import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToggletipPlacement = "top" | "bottom" | "start" | "end";

export type ToggletipProps = {
  label: unknown;
  content?: unknown;
  open?: boolean;
  placement?: ToggletipPlacement;
  class?: string;
};

@Component({
  selector: "st-toggletip",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Toggletip {
  static readonly stComponentName = "Toggletip";
  readonly componentName = "Toggletip";
  @NgInput() label!: unknown;
  @NgInput() content?: unknown;
  @NgInput() open?: boolean;
  @NgInput() placement?: ToggletipPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-toggletip", this.classInput].filter(Boolean).join(" ");
  }
}
