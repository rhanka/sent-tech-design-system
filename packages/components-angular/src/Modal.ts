import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  class?: string;
};

@Component({
  selector: "st-modal",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Modal {
  static readonly stComponentName = "Modal";
  readonly componentName = "Modal";
  @NgInput() open?: boolean;
  @NgInput() title?: string;
  @NgInput() description?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-modal", this.classInput].filter(Boolean).join(" ");
  }
}
