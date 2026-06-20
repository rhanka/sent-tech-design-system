import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

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
  imports: [NgStyle],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="spacingStyle">
      @if (label) {
        <span class="st-divider__label">{{ label }}</span>
      }
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
    return classNames(
      "st-divider",
      `st-divider--${this.orientation ?? 'horizontal'}`,
      this.variant && `st-divider--${this.variant}`,
      this.classInput,
    );
  }

  get spacingStyle(): Record<string, string | undefined> {
    const margin = this.spacing != null ? spacingToken(this.spacing) : undefined;
    return { margin };
  }
}
