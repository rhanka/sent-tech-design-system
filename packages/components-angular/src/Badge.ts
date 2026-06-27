import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

export type BadgeShape = "pill" | "circle";

export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  /** Texte affiché dans le badge. Si absent, utilise ng-content. */
  label?: unknown;
  class?: string;
};

@Component({
  selector: "st-badge",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label !== undefined) {
        {{ label }}
      } @else {
        <ng-content></ng-content>
      }
    </span>
  `,
})
export class Badge {
  static readonly stComponentName = "Badge";
  readonly componentName = "Badge";
  @NgInput() tone?: BadgeTone;
  @NgInput() shape?: BadgeShape;
  @NgInput() size?: BadgeSize;
  @NgInput() label?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-badge",
      `st-badge--${this.tone ?? "neutral"}`,
      `st-badge--${this.shape ?? "pill"}`,
      `st-badge--${this.size ?? "md"}`,
      this.classInput,
    );
  }
}
