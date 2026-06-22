import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ButtonGroupSize = "sm" | "md" | "lg";

export type ButtonGroupProps = {
  orientation?: ButtonGroupOrientation;
  /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
  attached?: boolean;
  /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
  gap?: number;
  /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
  size?: ButtonGroupSize;
  /** Étiquette a11y du groupe. */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-button-group",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label ?? null"
      [attr.data-size]="size ?? 'md'"
      [style.gap]="gapValue"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class ButtonGroup {
  static readonly stComponentName = "ButtonGroup";
  readonly componentName = "ButtonGroup";
  @NgInput() orientation?: ButtonGroupOrientation;
  @NgInput() attached?: boolean;
  @NgInput() gap?: number;
  @NgInput() size?: ButtonGroupSize;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get gapValue(): string | null {
    if (this.attached || this.gap == null) return null;
    return `var(--st-spacing-${this.gap}, ${this.gap * 0.25}rem)`;
  }

  get hostClass(): string {
    return classNames(
      "st-buttonGroup",
      `st-buttonGroup--${this.orientation ?? "horizontal"}`,
      this.attached && "st-buttonGroup--attached",
      this.classInput,
    );
  }
}
