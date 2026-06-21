import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SolidGaugeChart {
    static stComponentName = "SolidGaugeChart";
    componentName = "SolidGaugeChart";
    value = 0;
    min;
    max;
    thresholds;
    innerRadius;
    label;
    format;
    unit;
    size;
    startAngle;
    endAngle;
    classInput;
    get hostClass() {
        return classNames("st-solidGaugeChart", this.classInput);
    }
    get minValue() {
        return this.min ?? 0;
    }
    get maxValue() {
        return this.max ?? 100;
    }
    get sizeValue() {
        return this.size ?? 220;
    }
    get startAngleValue() {
        return this.startAngle ?? 180;
    }
    get endAngleValue() {
        return this.endAngle ?? 360;
    }
    get innerRadiusValue() {
        return this.innerRadius ?? 0.72;
    }
    get span() {
        return Math.max(this.maxValue - this.minValue, 0);
    }
    get clamped() {
        return Math.min(Math.max(this.value, this.minValue), this.maxValue);
    }
    get frac() {
        return this.span > 0 ? (this.clamped - this.minValue) / this.span : 0;
    }
    get cx() {
        return this.sizeValue / 2;
    }
    get cy() {
        return this.sizeValue / 2;
    }
    get r() {
        return this.sizeValue / 2 - 2;
    }
    get innerR() {
        return Math.min(Math.max(this.innerRadiusValue, 0), 0.95) * this.r;
    }
    get thicknessComputed() {
        return Math.max(this.r - this.innerR, 1);
    }
    get trackR() {
        return (this.r + this.innerR) / 2;
    }
    get a0() {
        return (this.startAngleValue * Math.PI) / 180;
    }
    get a1() {
        return (this.endAngleValue * Math.PI) / 180;
    }
    get totalAngle() {
        return this.a1 - this.a0;
    }
    polar(radius, angle) {
        return [this.cx + radius * Math.cos(angle), this.cy + radius * Math.sin(angle)];
    }
    arcPath(fromFrac, toFrac) {
        const from = this.a0 + this.totalAngle * fromFrac;
        const to = this.a0 + this.totalAngle * toFrac;
        const [x0, y0] = this.polar(this.trackR, from);
        const [x1, y1] = this.polar(this.trackR, to);
        const large = Math.abs(to - from) > Math.PI ? 1 : 0;
        const sweep = this.totalAngle >= 0 ? 1 : 0;
        return `M ${x0} ${y0} A ${this.trackR} ${this.trackR} 0 ${large} ${sweep} ${x1} ${y1}`;
    }
    get viewBoxStr() {
        const samples = 64;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i <= samples; i++) {
            const a = this.a0 + (this.totalAngle * i) / samples;
            const yOuter = this.cy + this.r * Math.sin(a);
            minY = Math.min(minY, yOuter);
            maxY = Math.max(maxY, yOuter);
        }
        minY = Math.min(minY, this.cy - this.r);
        const vbTop = Math.max(minY, 0);
        const vbH = Math.max(Math.min(maxY, this.sizeValue) - vbTop, this.thicknessComputed);
        return `0 ${vbTop} ${this.sizeValue} ${vbH}`;
    }
    get activeTone() {
        if (!this.thresholds || this.thresholds.length === 0 || this.span <= 0)
            return null;
        const sorted = [...this.thresholds].sort((a, b) => a.value - b.value);
        let tone = sorted[0].tone;
        for (const t of sorted) {
            if (this.clamped >= t.value)
                tone = t.tone;
        }
        return tone;
    }
    get progressClass() {
        return this.activeTone
            ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${this.activeTone}`
            : "st-solidGaugeChart__progress";
    }
    get formatted() {
        if (this.format === "percent") {
            const pct = this.span > 0 ? Math.round(this.frac * 100) : 0;
            return `${pct}%`;
        }
        const num = Number.isInteger(this.clamped) ? String(this.clamped) : this.clamped.toFixed(1);
        return this.unit ? `${num} ${this.unit}` : num;
    }
    get ariaValueText() {
        return this.label ? `${this.label}: ${this.formatted}` : this.formatted;
    }
    get dataValueItems() {
        return [`${this.label ? `${this.label}: ` : ""}${this.formatted} (min ${this.minValue}, max ${this.maxValue})`];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SolidGaugeChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SolidGaugeChart, isStandalone: true, selector: "st-solid-gauge-chart", inputs: { value: "value", min: "min", max: "max", thresholds: "thresholds", innerRadius: "innerRadius", label: "label", format: "format", unit: "unit", size: "size", startAngle: "startAngle", endAngle: "endAngle", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-solidGaugeChart__visual"
        role="meter"
        [attr.aria-valuenow]="clamped"
        [attr.aria-valuemin]="minValue"
        [attr.aria-valuemax]="maxValue"
        [attr.aria-valuetext]="ariaValueText"
        [attr.aria-label]="label"
      >
        <svg
          [attr.viewBox]="viewBoxStr"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <path class="st-solidGaugeChart__track" [attr.d]="arcPath(0, 1)" fill="none" [attr.stroke-width]="thicknessComputed" />

          @if (frac > 0) {
            <path
              [class]="progressClass"
              [attr.d]="arcPath(0, frac)"
              fill="none"
              [attr.stroke-width]="thicknessComputed"
            ></path>
          }

          <text
            class="st-solidGaugeChart__value"
            [attr.x]="cx"
            [attr.y]="cy - thicknessComputed * 0.1"
            text-anchor="middle"
            dominant-baseline="auto"
          >{{ formatted }}</text>

          @if (label) {
            <text
              class="st-solidGaugeChart__label"
              [attr.x]="cx"
              [attr.y]="cy + thicknessComputed * 0.35"
              text-anchor="middle"
              dominant-baseline="hanging"
            >{{ label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'gauge')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SolidGaugeChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-solid-gauge-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-solidGaugeChart__visual"
        role="meter"
        [attr.aria-valuenow]="clamped"
        [attr.aria-valuemin]="minValue"
        [attr.aria-valuemax]="maxValue"
        [attr.aria-valuetext]="ariaValueText"
        [attr.aria-label]="label"
      >
        <svg
          [attr.viewBox]="viewBoxStr"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <path class="st-solidGaugeChart__track" [attr.d]="arcPath(0, 1)" fill="none" [attr.stroke-width]="thicknessComputed" />

          @if (frac > 0) {
            <path
              [class]="progressClass"
              [attr.d]="arcPath(0, frac)"
              fill="none"
              [attr.stroke-width]="thicknessComputed"
            ></path>
          }

          <text
            class="st-solidGaugeChart__value"
            [attr.x]="cx"
            [attr.y]="cy - thicknessComputed * 0.1"
            text-anchor="middle"
            dominant-baseline="auto"
          >{{ formatted }}</text>

          @if (label) {
            <text
              class="st-solidGaugeChart__label"
              [attr.x]="cx"
              [attr.y]="cy + thicknessComputed * 0.35"
              text-anchor="middle"
              dominant-baseline="hanging"
            >{{ label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'gauge')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], thresholds: [{
                type: NgInput
            }], innerRadius: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], unit: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], startAngle: [{
                type: NgInput
            }], endAngle: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SolidGaugeChart.js.map