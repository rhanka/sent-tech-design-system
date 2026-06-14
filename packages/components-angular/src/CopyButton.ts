import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CopyButtonSize = "sm" | "md" | "lg";

export type CopyButtonProps = {
  text?: string;
  value?: string;
  label?: string;
  copiedLabel?: string;
  size?: CopyButtonSize;
  class?: string;
};

@Component({
  selector: "st-copy-button",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CopyButton {
  static readonly stComponentName = "CopyButton";
  readonly componentName = "CopyButton";
  @NgInput() text?: string;
  @NgInput() value?: string;
  @NgInput() label?: string;
  @NgInput() copiedLabel?: string;
  @NgInput() size?: CopyButtonSize;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-copyButton", this.classInput].filter(Boolean).join(" ");
  }
}
