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
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-colorSwatch__chip"
        [style.background-color]="color"
        [style.width.px]="safeSize"
        [style.height.px]="safeSize"
        role="img"
        [attr.aria-label]="accessibleLabel"></span>
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

  get safeSize(): number {
    return Math.max(Number(this.size ?? 24) || 0, 1);
  }

  get accessibleLabel(): string {
    return this.label ?? this.color;
  }

  get hostClass(): string {
    return classNames("st-colorSwatch", `st-colorSwatch--${this.shape ?? "square"}`, this.classInput);
  }
}
