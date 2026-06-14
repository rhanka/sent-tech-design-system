import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { spacingToken } from "./Flex.js";

export type DividerOrientation = "horizontal" | "vertical";

export type DividerVariant = "solid" | "dashed";

export type DividerProps = {
  orientation?: DividerOrientation;
  /** Spacing scale step (0..12) applied as margin around the divider. */
  spacing?: number;
  /** Optional label centered on a horizontal divider line. */
  label?: string;
  variant?: DividerVariant;
  class?: string;
};

@Component({
  selector: "st-divider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Divider {
  static readonly stComponentName = "Divider";
  readonly componentName = "Divider";
  @NgInput() orientation?: DividerOrientation;
  @NgInput() spacing?: number;
  @NgInput() label?: string;
  @NgInput() variant?: DividerVariant;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-divider", this.classInput].filter(Boolean).join(" ");
  }
}
