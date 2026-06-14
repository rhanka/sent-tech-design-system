import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type NotificationTone = "info" | "success" | "warning" | "error";

export type NotificationProps = {
  tone?: NotificationTone;
  title: string;
  message?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  class?: string;
};

@Component({
  selector: "st-notification",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Notification {
  static readonly stComponentName = "Notification";
  readonly componentName = "Notification";
  @NgInput() tone?: NotificationTone;
  @NgInput() title!: string;
  @NgInput() message?: string;
  @NgInput() dismissible?: boolean;
  @NgInput() dismissLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-notification", this.classInput].filter(Boolean).join(" ");
  }
}
