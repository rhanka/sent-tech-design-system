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
    <span [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label || color" role="img">
      <span class="st-colorSwatch__preview"
        [style.background-color]="color"
        [style.width.px]="size ?? 24"
        [style.height.px]="size ?? 24"></span>
      @if (label) { <span class="st-colorSwatch__label">{{ label }}</span> }
    </span>
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
