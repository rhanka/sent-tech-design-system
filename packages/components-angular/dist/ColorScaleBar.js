import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ColorScaleBar {
    static stComponentName = "ColorScaleBar";
    componentName = "ColorScaleBar";
    colors;
    orientation;
    length;
    thickness;
    min;
    max;
    label;
    classInput;
    get isVertical() {
        return (this.orientation ?? "horizontal") === "vertical";
    }
    get stops() {
        const colors = this.colors ?? [];
        return colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];
    }
    get gradient() {
        const stops = this.stops;
        const direction = this.isVertical ? "to top" : "to right";
        return stops.length ? `linear-gradient(${direction}, ${stops.join(", ")})` : "none";
    }
    get safeLength() {
        return this.length !== undefined ? Math.max(Number(this.length) || 0, 1) : undefined;
    }
    get safeThickness() {
        return this.thickness !== undefined ? Math.max(Number(this.thickness) || 0, 1) : undefined;
    }
    get barWidthPx() {
        const value = this.isVertical ? this.safeThickness : this.safeLength;
        return value ?? null;
    }
    get barHeightPx() {
        const value = this.isVertical ? this.safeLength : this.safeThickness;
        return value ?? null;
    }
    get hasEndLabels() {
        return this.min !== undefined || this.max !== undefined;
    }
    get hostClass() {
        return classNames("st-colorScaleBar", `st-colorScaleBar--${this.orientation ?? "horizontal"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorScaleBar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ColorScaleBar, isStandalone: true, selector: "st-color-scale-bar", inputs: { colors: "colors", orientation: "orientation", length: "length", thickness: "thickness", min: "min", max: "max", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColorScaleBar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-color-scale-bar",
                    standalone: true,
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
                }]
        }], propDecorators: { colors: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], length: [{
                type: NgInput
            }], thickness: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ColorScaleBar.js.map