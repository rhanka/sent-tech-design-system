import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BackToTopProps = {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  class?: string;
};

@Component({
  selector: "st-back-to-top",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BackToTop {
  static readonly stComponentName = "BackToTop";
  readonly componentName = "BackToTop";
  @NgInput() label?: string;
  @NgInput() disabled?: boolean;
  @NgInput() targetId?: string;
  @NgInput() threshold?: number;
  @NgInput() autoHide?: boolean;
  @NgInput() smooth?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-backToTop", this.classInput].filter(Boolean).join(" ");
  }
}
