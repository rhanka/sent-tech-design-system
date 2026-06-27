import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const PADDING = 2;
export class Sparkline {
    static stComponentName = "Sparkline";
    componentName = "Sparkline";
    data;
    width;
    height;
    tone;
    strokeWidth;
    area;
    label;
    classInput;
    get toneValue() {
        return this.tone ?? "neutral";
    }
    get widthValue() {
        return this.width ?? 120;
    }
    get heightValue() {
        return this.height ?? 28;
    }
    get strokeWidthValue() {
        return this.strokeWidth ?? 1.5;
    }
    get areaValue() {
        return this.area ?? false;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get hostClass() {
        return classNames("st-sparkline", `st-sparkline--${this.toneValue}`, this.classInput);
    }
    get geometry() {
        const data = this.data;
        if (!data || data.length === 0) {
            return { line: "", area: "" };
        }
        const width = this.widthValue;
        const height = this.heightValue;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const span = max - min || 1;
        const innerWidth = Math.max(width - PADDING * 2, 1);
        const innerHeight = Math.max(height - PADDING * 2, 1);
        const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
        const points = data.map((value, index) => {
            const x = PADDING + step * index;
            const normalised = (value - min) / span;
            const y = PADDING + (1 - normalised) * innerHeight;
            return { x, y };
        });
        const line = points
            .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
            .join(" ");
        const baseline = height - PADDING;
        const first = points[0];
        const last = points[points.length - 1];
        const areaPath = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
        return { line, area: areaPath };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Sparkline, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Sparkline, isStandalone: true, selector: "st-sparkline", inputs: { data: "data", width: "width", height: "height", tone: "tone", strokeWidth: "strokeWidth", area: "area", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="img"
      [attr.aria-label]="label"
    >
      <svg
        [attr.width]="widthValue"
        [attr.height]="heightValue"
        [attr.viewBox]="viewBox"
        preserveAspectRatio="none"
        [attr.aria-hidden]="label ? 'true' : null"
        focusable="false"
      >
        @if (areaValue && geometry.area) {
          <path [attr.d]="geometry.area" class="st-sparkline__area"></path>
        }
        @if (geometry.line) {
          <path
            [attr.d]="geometry.line"
            class="st-sparkline__line"
            fill="none"
            [attr.stroke-width]="strokeWidthValue"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        }
      </svg>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Sparkline, decorators: [{
            type: Component,
            args: [{
                    selector: "st-sparkline",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="img"
      [attr.aria-label]="label"
    >
      <svg
        [attr.width]="widthValue"
        [attr.height]="heightValue"
        [attr.viewBox]="viewBox"
        preserveAspectRatio="none"
        [attr.aria-hidden]="label ? 'true' : null"
        focusable="false"
      >
        @if (areaValue && geometry.area) {
          <path [attr.d]="geometry.area" class="st-sparkline__area"></path>
        }
        @if (geometry.line) {
          <path
            [attr.d]="geometry.line"
            class="st-sparkline__line"
            fill="none"
            [attr.stroke-width]="strokeWidthValue"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        }
      </svg>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], strokeWidth: [{
                type: NgInput
            }], area: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Sparkline.js.map