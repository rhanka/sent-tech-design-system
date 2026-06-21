import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type GaugeChartTone =
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

export type GaugeChartThreshold = {
  value: number;
  tone: GaugeChartTone;
};

export type GaugeChartFormat = "number" | "percent";

export type GaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: GaugeChartThreshold[];
  label?: string;
  format?: GaugeChartFormat;
  unit?: string;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

type GaugeBand = { from: number; to: number; tone: GaugeChartTone };

@Component({
  selector: "st-gauge-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-gaugeChart__visual"
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
          <path class="st-gaugeChart__track" [attr.d]="arcPath(0, 1)" fill="none" [attr.stroke-width]="thicknessValue"></path>

          @for (band of bands; track $index) {
            <path
              [class]="'st-gaugeChart__band st-gaugeChart__band--' + band.tone"
              [attr.d]="arcPath(band.from, band.to)"
              fill="none"
              [attr.stroke-width]="thicknessValue"
            ></path>
          }

          @if (bands.length === 0) {
            <path
              class="st-gaugeChart__progress"
              [attr.d]="arcPath(0, frac)"
              fill="none"
              [attr.stroke-width]="thicknessValue"
            ></path>
          }

          <path class="st-gaugeChart__needle" [attr.d]="needle"></path>
          <circle class="st-gaugeChart__hub" [attr.cx]="cx" [attr.cy]="cy" [attr.r]="Math.max(thicknessValue * 0.22, 4)"></circle>

          <text
            class="st-gaugeChart__value"
            [attr.x]="cx"
            [attr.y]="cy - thicknessValue * 0.55"
            text-anchor="middle"
            dominant-baseline="auto"
          >{{ formatted }}</text>
          @if (label) {
            <text
              class="st-gaugeChart__label"
              [attr.x]="cx"
              [attr.y]="cy - thicknessValue * 0.05"
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
export class GaugeChart {
  static readonly stComponentName = "GaugeChart";
  readonly componentName = "GaugeChart";

  @NgInput() value = 0;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() thresholds?: GaugeChartThreshold[];
  @NgInput() label?: string;
  @NgInput() format?: GaugeChartFormat;
  @NgInput() unit?: string;
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() startAngle?: number;
  @NgInput() endAngle?: number;
  @NgInput("class") classInput?: string;

  readonly Math = Math;

  get hostClass(): string {
    return classNames("st-gaugeChart", this.classInput);
  }

  get minValue(): number { return this.min ?? 0; }
  get maxValue(): number { return this.max ?? 100; }
  get sizeValue(): number { return this.size ?? 220; }
  get thicknessValue(): number { return this.thickness ?? 22; }
  get startAngleValue(): number { return this.startAngle ?? 180; }
  get endAngleValue(): number { return this.endAngle ?? 360; }

  get span(): number { return Math.max(this.maxValue - this.minValue, 0); }
  get clamped(): number { return Math.min(Math.max(this.value, this.minValue), this.maxValue); }
  get frac(): number { return this.span > 0 ? (this.clamped - this.minValue) / this.span : 0; }

  get cx(): number { return this.sizeValue / 2; }
  get cy(): number { return this.sizeValue / 2; }
  get r(): number { return this.sizeValue / 2 - this.thicknessValue / 2 - 2; }

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
    const thickness = this.thicknessValue;
    const a0 = this.a0;
    const totalAngle = this.totalAngle;
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cx + (r + thickness / 2) * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cx - (r + thickness / 2));
    const vbTop = Math.max(minY, 0);
    const vbHeight = Math.max(Math.min(maxY, size) - vbTop, thickness);
    return `0 ${vbTop} ${size} ${vbHeight}`;
  }

  arcPath(fromFrac: number, toFrac: number): string {
    const from = this.a0 + this.totalAngle * fromFrac;
    const to = this.a0 + this.totalAngle * toFrac;
    const [x0, y0] = this.polar(this.r, from);
    const [x1, y1] = this.polar(this.r, to);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = this.totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${this.r} ${this.r} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  get bands(): GaugeBand[] {
    const thresholds = this.thresholds;
    if (!thresholds || thresholds.length === 0 || this.span <= 0) return [];
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    const result: GaugeBand[] = [];
    let start = this.minValue;
    const span = this.span;
    const min = this.minValue;
    const max = this.maxValue;
    for (const t of sorted) {
      const end = Math.min(Math.max(t.value, min), max);
      if (end <= start) continue;
      result.push({ from: (start - min) / span, to: (end - min) / span, tone: t.tone });
      start = end;
    }
    if (start < max) {
      const lastTone = sorted[sorted.length - 1]?.tone ?? "neutral";
      result.push({ from: (start - min) / span, to: 1, tone: lastTone });
    }
    return result;
  }

  get needle(): string {
    const a = this.a0 + this.totalAngle * this.frac;
    const thickness = this.thicknessValue;
    const [tipX, tipY] = this.polar(this.r + thickness / 2, a);
    const [lx, ly] = this.polar(thickness * 0.18, a + Math.PI / 2);
    const [rx, ry] = this.polar(thickness * 0.18, a - Math.PI / 2);
    return `M ${lx} ${ly} L ${tipX} ${tipY} L ${rx} ${ry} Z`;
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
