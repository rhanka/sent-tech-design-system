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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
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

  get hostClass(): string {
    return ["st-buttonGroup", this.classInput].filter(Boolean).join(" ");
  }
}
