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
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <span class="st-colorScaleBar__label">{{ label }}</span>
      }
      <div class="st-colorScaleBar__track">
        @if (hasEndLabels) {
          <span class="st-colorScaleBar__end st-colorScaleBar__end--max">{{ max ?? "" }}</span>
        }
        <div
          class="st-colorScaleBar__bar"
          [style.background]="gradient"
          [style.width.px]="barWidthPx"
          [style.height.px]="barHeightPx"
          role="img"
          [attr.aria-label]="label"
        ></div>
        @if (hasEndLabels) {
          <span class="st-colorScaleBar__end st-colorScaleBar__end--min">{{ min ?? "" }}</span>
        }
      </div>
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

  get isVertical(): boolean {
    return (this.orientation ?? "horizontal") === "vertical";
  }

  get stops(): string[] {
    const colors = this.colors ?? [];
    return colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];
  }

  get gradient(): string {
    const stops = this.stops;
    const direction = this.isVertical ? "to top" : "to right";
    return stops.length ? `linear-gradient(${direction}, ${stops.join(", ")})` : "none";
  }

  private get safeLength(): number | undefined {
    return this.length !== undefined ? Math.max(Number(this.length) || 0, 1) : undefined;
  }

  private get safeThickness(): number | undefined {
    return this.thickness !== undefined ? Math.max(Number(this.thickness) || 0, 1) : undefined;
  }

  get barWidthPx(): number | null {
    const value = this.isVertical ? this.safeThickness : this.safeLength;
    return value ?? null;
  }

  get barHeightPx(): number | null {
    const value = this.isVertical ? this.safeLength : this.safeThickness;
    return value ?? null;
  }

  get hasEndLabels(): boolean {
    return this.min !== undefined || this.max !== undefined;
  }

  get hostClass(): string {
    return classNames(
      "st-colorScaleBar",
      `st-colorScaleBar--${this.orientation ?? "horizontal"}`,
      this.classInput,
    );
  }
}
