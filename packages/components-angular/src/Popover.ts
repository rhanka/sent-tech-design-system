import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type PopoverPlacement = "top" | "right" | "bottom" | "left";

export type PopoverProps = {
  content?: string;
  open?: boolean;
  placement?: PopoverPlacement;
  class?: string;
};

@Component({
  selector: "st-popover",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Popover {
  static readonly stComponentName = "Popover";
  readonly componentName = "Popover";
  @NgInput() content?: string;
  @NgInput() open?: boolean;
  @NgInput() placement?: PopoverPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-popover", this.classInput].filter(Boolean).join(" ");
  }
}
