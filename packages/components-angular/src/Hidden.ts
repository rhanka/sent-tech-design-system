import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type HiddenBreakpoint = "sm" | "md" | "lg" | "xl";

export type HiddenProps = {
  /** Hide when viewport is narrower than this breakpoint. */
  below?: HiddenBreakpoint;
  /** Hide when viewport is at or wider than this breakpoint. */
  above?: HiddenBreakpoint;
  as?: string;
  class?: string;
};

@Component({
  selector: "st-hidden",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Hidden {
  static readonly stComponentName = "Hidden";
  readonly componentName = "Hidden";
  @NgInput() below?: HiddenBreakpoint;
  @NgInput() above?: HiddenBreakpoint;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-hidden",
      this.below && `st-hidden--below-${this.below}`,
      this.above && `st-hidden--above-${this.above}`,
      this.classInput,
    );
  }
}
