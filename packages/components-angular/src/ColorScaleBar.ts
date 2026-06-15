import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ColorScaleBarOrientation = "horizontal" | "vertical";

export type ColorScaleBarProps = {
  colors: string[];
  orientation?: ColorScaleBarOrientation;
  length?: number;
  thickness?: number;
  min?: string;
  max?: string;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-color-scale-bar",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ColorScaleBar {
  static readonly stComponentName = "ColorScaleBar";
  readonly componentName = "ColorScaleBar";
  @NgInput() colors!: string[];
  @NgInput() orientation?: ColorScaleBarOrientation;
  @NgInput() length?: number;
  @NgInput() thickness?: number;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-colorScaleBar",
      `st-colorScaleBar--${this.orientation ?? "horizontal"}`,
      this.classInput,
    );
  }
}
