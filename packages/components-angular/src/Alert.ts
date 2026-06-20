import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AlertTone = "info" | "success" | "warning" | "error";

export type AlertProps = {
  tone?: AlertTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
  class?: string;
};

@Component({
  selector: "st-alert",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Alert {
  static readonly stComponentName = "Alert";
  readonly componentName = "Alert";
  @NgInput() tone?: AlertTone;
  @NgInput() title!: unknown;
  @NgInput() message?: unknown;
  @NgInput() actions?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-alert",
      this.tone && `st-alert--${this.tone}`,
      this.classInput,
    );
  }
}
