import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  tone?: ToastTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
};

export type ToastProps = {
  tone?: ToastTone;
  title?: unknown;
  message?: unknown;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  class?: string;
};

@Component({
  selector: "st-toast",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Toast {
  static readonly stComponentName = "Toast";
  readonly componentName = "Toast";
  @NgInput() tone?: ToastTone;
  @NgInput() title?: unknown;
  @NgInput() message?: unknown;
  @NgInput() items?: ToastItem[];
  @NgInput() autoDismiss?: boolean;
  @NgInput() duration?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-toast", this.classInput].filter(Boolean).join(" ");
  }
}
