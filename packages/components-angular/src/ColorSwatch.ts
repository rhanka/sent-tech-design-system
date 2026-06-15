import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ColorSwatchShape = "square" | "circle" | "pill";

export type ColorSwatchProps = {
  color: string;
  size?: number;
  shape?: ColorSwatchShape;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-color-swatch",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ColorSwatch {
  static readonly stComponentName = "ColorSwatch";
  readonly componentName = "ColorSwatch";
  @NgInput() color!: string;
  @NgInput() size?: number;
  @NgInput() shape?: ColorSwatchShape;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-colorSwatch", `st-colorSwatch--${this.shape ?? "square"}`, this.classInput);
  }
}
