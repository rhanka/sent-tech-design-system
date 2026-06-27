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
    @if (isLabeled) {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" aria-orientation="horizontal" [ngStyle]="spacingStyle">
        <span class="st-divider__line" aria-hidden="true"></span>
        <span class="st-divider__label">{{ label }}</span>
        <span class="st-divider__line" aria-hidden="true"></span>
      </div>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass"
        role="separator" [attr.aria-orientation]="orientation ?? 'horizontal'" [ngStyle]="spacingStyle"></div>
    }
  `,
})
export class Divider {
  static readonly stComponentName = "Divider";
  readonly componentName = "Divider";
  @NgInput() orientation?: DividerOrientation;
  @NgInput() spacing?: number;
  @NgInput() label?: string;
  @NgInput() variant: DividerVariant = "solid";
  @NgInput("class") classInput?: string;

  get isLabeled(): boolean {
    return (
      (this.orientation ?? "horizontal") !== "vertical" &&
      this.label != null &&
      this.label !== ""
    );
  }

  get hostClass(): string {
    return classNames(
      "st-divider",
      `st-divider--${this.orientation ?? "horizontal"}`,
      `st-divider--${this.variant ?? "solid"}`,
      this.isLabeled && "st-divider--labeled",
      this.classInput,
    );
  }

  get spacingStyle(): Record<string, string | undefined> {
    const margin = this.spacing != null ? spacingToken(this.spacing) : undefined;
    const isVertical = (this.orientation ?? "horizontal") === "vertical";
    return {
      "margin-block": isVertical ? undefined : margin,
      "margin-inline": isVertical ? margin : undefined,
    };
  }
}
