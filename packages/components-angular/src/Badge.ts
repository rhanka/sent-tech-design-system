import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

export type BadgeShape = "pill" | "circle";

export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  class?: string;
};

@Component({
  selector: "st-badge",
  standalone: true,
  template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </span>
  `,
})
export class Badge {
  static readonly stComponentName = "Badge";
  readonly componentName = "Badge";
  @NgInput() tone?: BadgeTone;
  @NgInput() shape?: BadgeShape;
  @NgInput() size?: BadgeSize;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-badge",
      this.tone && `st-badge--${this.tone}`,
      this.shape && `st-badge--${this.shape}`,
      this.size && `st-badge--${this.size}`,
      this.classInput,
    );
  }
}
