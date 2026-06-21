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
          [attr.viewBox]="viewBoxStr"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <path class="st-gaugeChart__track" [attr.d]="arcPath(0, 1)" fill="none" [attr.stroke-width]="thicknessValue" />

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

          <path class="st-gaugeChart__needle" [attr.d]="needlePath"></path>
          <circle class="st-gaugeChart__hub" [attr.cx]="cx" [attr.cy]="cy" [attr.r]="hubRadius"></circle>

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

  get hostClass(): string {
    return classNames("st-gaugeChart", this.classInput);
  }

  get minValue(): number {
    return this.min ?? 0;
  }
  get maxValue(): number {
    return this.max ?? 100;
  }
  get thicknessValue(): number {
    return this.thickness ?? 22;
  }
  get sizeValue(): number {
    return this.size ?? 220;
  }
  get startAngleValue(): number {
    return this.startAngle ?? 180;
  }
  get endAngleValue(): number {
    return this.endAngle ?? 360;
  }

  get span(): number {
    return Math.max(this.maxValue - this.minValue, 0);
  }
  get clamped(): number {
    return Math.min(Math.max(this.value, this.minValue), this.maxValue);
  }
  get frac(): number {
    return this.span > 0 ? (this.clamped - this.minValue) / this.span : 0;
  }

  get cx(): number {
    return this.sizeValue / 2;
  }
  get cy(): number {
    return this.sizeValue / 2;
  }
  get r(): number {
    return this.sizeValue / 2 - this.thicknessValue / 2 - 2;
  }
  get a0(): number {
    return (this.startAngleValue * Math.PI) / 180;
  }
  get a1(): number {
    return (this.endAngleValue * Math.PI) / 180;
  }
  get totalAngle(): number {
    return this.a1 - this.a0;
  }

  polar(radius: number, angle: number): [number, number] {
    return [this.cx + radius * Math.cos(angle), this.cy + radius * Math.sin(angle)];
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

  get viewBoxStr(): string {
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = this.a0 + (this.totalAngle * i) / samples;
      const yOuter = this.cy + (this.r + this.thicknessValue / 2) * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, this.cy - (this.r + this.thicknessValue / 2));
    const vbTop = Math.max(minY, 0);
    const vbH = Math.max(Math.min(maxY, this.sizeValue) - vbTop, this.thicknessValue);
    return `0 ${vbTop} ${this.sizeValue} ${vbH}`;
  }

  get bands(): GaugeBand[] {
    if (!this.thresholds || this.thresholds.length === 0 || this.span <= 0) return [];
    const sorted = [...this.thresholds].sort((a, b) => a.value - b.value);
    const segments: GaugeBand[] = [];
    let start = this.minValue;
    for (const t of sorted) {
      const end = Math.min(Math.max(t.value, this.minValue), this.maxValue);
      if (end <= start) continue;
      segments.push({ from: (start - this.minValue) / this.span, to: (end - this.minValue) / this.span, tone: t.tone });
      start = end;
    }
    if (start < this.maxValue) {
      const lastTone = sorted[sorted.length - 1]?.tone ?? "neutral";
      segments.push({ from: (start - this.minValue) / this.span, to: 1, tone: lastTone });
    }
    return segments;
  }

  get needlePath(): string {
    const a = this.a0 + this.totalAngle * this.frac;
    const tip = this.polar(this.r + this.thicknessValue / 2, a);
    const left = this.polar(this.thicknessValue * 0.18, a + Math.PI / 2);
    const right = this.polar(this.thicknessValue * 0.18, a - Math.PI / 2);
    return `M ${left[0]} ${left[1]} L ${tip[0]} ${tip[1]} L ${right[0]} ${right[1]} Z`;
  }

  get hubRadius(): number {
    return Math.max(this.thicknessValue * 0.22, 4);
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
