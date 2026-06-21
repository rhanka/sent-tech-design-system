import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SolidGaugeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SolidGaugeThreshold = {
  value: number;
  tone: SolidGaugeTone;
};

export type SolidGaugeFormat = "number" | "percent";

export type SolidGaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: SolidGaugeThreshold[];
  innerRadius?: number;
  label?: string;
  format?: SolidGaugeFormat;
  unit?: string;
  size?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

@Component({
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
          [attr.viewBox]="svgViewBox"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <path class="st-solidGaugeChart__track" [attr.d]="arcPath(0, 1)" fill="none" [attr.stroke-width]="thickness"></path>

          @if (frac > 0) {
            <path
              [class]="progressClass"
              [attr.d]="arcPath(0, frac)"
              fill="none"
              [attr.stroke-width]="thickness"
            ></path>
          }

          <text
            class="st-solidGaugeChart__value"
            [attr.x]="cx"
            [attr.y]="cy - thickness * 0.1"
            text-anchor="middle"
            dominant-baseline="auto"
          >{{ formatted }}</text>
          @if (label) {
            <text
              class="st-solidGaugeChart__label"
              [attr.x]="cx"
              [attr.y]="cy + thickness * 0.35"
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
})
export class SolidGaugeChart {
  static readonly stComponentName = "SolidGaugeChart";
  readonly componentName = "SolidGaugeChart";

  @NgInput() value = 0;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() thresholds?: SolidGaugeThreshold[];
  @NgInput() innerRadius?: number;
  @NgInput() label?: string;
  @NgInput() format?: SolidGaugeFormat;
  @NgInput() unit?: string;
  @NgInput() size?: number;
  @NgInput() startAngle?: number;
  @NgInput() endAngle?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-solidGaugeChart", this.classInput);
  }

  get minValue(): number { return this.min ?? 0; }
  get maxValue(): number { return this.max ?? 100; }
  get sizeValue(): number { return this.size ?? 220; }
  get innerRadiusValue(): number { return this.innerRadius ?? 0.72; }
  get startAngleValue(): number { return this.startAngle ?? 180; }
  get endAngleValue(): number { return this.endAngle ?? 360; }

  get span(): number { return Math.max(this.maxValue - this.minValue, 0); }
  get clamped(): number { return Math.min(Math.max(this.value, this.minValue), this.maxValue); }
  get frac(): number { return this.span > 0 ? (this.clamped - this.minValue) / this.span : 0; }

  get cx(): number { return this.sizeValue / 2; }
  get cy(): number { return this.sizeValue / 2; }
  get r(): number { return this.sizeValue / 2 - 2; }
  get innerR(): number { return Math.min(Math.max(this.innerRadiusValue, 0), 0.95) * this.r; }
  get thickness(): number { return Math.max(this.r - this.innerR, 1); }
  get trackR(): number { return (this.r + this.innerR) / 2; }

  private toRad(deg: number): number { return (deg * Math.PI) / 180; }
  private get a0(): number { return this.toRad(this.startAngleValue); }
  private get a1(): number { return this.toRad(this.endAngleValue); }
  private get totalAngle(): number { return this.a1 - this.a0; }

  private polar(radius: number, angle: number): [number, number] {
    return [this.cx + radius * Math.cos(angle), this.cy + radius * Math.sin(angle)];
  }

  get svgViewBox(): string {
    const size = this.sizeValue;
    const cx = this.cx;
    const r = this.r;
    const a0 = this.a0;
    const totalAngle = this.totalAngle;
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cx + r * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cx - r);
    const vbTop = Math.max(minY, 0);
    const vbHeight = Math.max(Math.min(maxY, size) - vbTop, this.thickness);
    return `0 ${vbTop} ${size} ${vbHeight}`;
  }

  arcPath(fromFrac: number, toFrac: number): string {
    const from = this.a0 + this.totalAngle * fromFrac;
    const to = this.a0 + this.totalAngle * toFrac;
    const [x0, y0] = this.polar(this.trackR, from);
    const [x1, y1] = this.polar(this.trackR, to);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = this.totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${this.trackR} ${this.trackR} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  get activeTone(): SolidGaugeTone | null {
    const thresholds = this.thresholds;
    if (!thresholds || thresholds.length === 0 || this.span <= 0) return null;
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    let tone: SolidGaugeTone = sorted[0].tone;
    for (const t of sorted) {
      if (this.clamped >= t.value) tone = t.tone;
    }
    return tone;
  }

  get progressClass(): string {
    const tone = this.activeTone;
    return tone
      ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${tone}`
      : "st-solidGaugeChart__progress";
  }

  get formatted(): string {
    if (this.format === "percent") {
      const pct = this.span > 0 ? Math.round(this.frac * 100) : 0;
      return `${pct}%`;
    }
    const num = Number.isInteger(this.clamped) ? String(this.clamped) : this.clamped.toFixed(1);
    return this.unit ? `${num} ${this.unit}` : num;
  }

  get ariaValueText(): string {
    return this.label ? `${this.label}: ${this.formatted}` : this.formatted;
  }

  get dataValueItems(): string[] {
    return [`${this.label ? `${this.label}: ` : ""}${this.formatted} (min ${this.minValue}, max ${this.maxValue})`];
  }
}
