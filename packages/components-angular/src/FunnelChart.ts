import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";

export type FunnelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FunnelChartDatum = {
  label: string;
  value: number;
  tone?: FunnelChartTone;
};

export type FunnelChartProps = {
  data: FunnelChartDatum[];
  orientation?: "vertical" | "horizontal";
  showPercentages?: boolean;
  percentMode?: "ofFirst" | "ofPrevious";
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const TONES: FunnelChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const GAP = 6;

type FunnelSegment = {
  points: string;
  datum: FunnelChartDatum;
  tone: FunnelChartTone;
  textColor: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  percent: number;
};

@Component({
  selector: "st-funnel-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-funnelChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (seg of segments; track seg.datum.label; let i = $index) {
            <polygon
              [class]="segmentClass(i)"
              [attr.points]="seg.points"
              [attr.data-chart-index]="i"
            ></polygon>
          }
          @for (seg of segments; track seg.datum.label) {
            <text
              class="st-funnelChart__label"
              [attr.x]="seg.labelX"
              [attr.y]="seg.labelY - 6"
              text-anchor="middle"
              dominant-baseline="middle"
              [attr.style]="'fill: ' + seg.textColor"
            >{{ seg.datum.label }}</text>
            <text
              class="st-funnelChart__value"
              [attr.x]="seg.labelX"
              [attr.y]="seg.labelY + 8"
              text-anchor="middle"
              dominant-baseline="middle"
              [attr.style]="'fill: ' + seg.textColor"
            >{{ seg.datum.value }}{{ showPercentagesValue ? ' · ' + formatPercent(seg.percent) : '' }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && segments[hoveredIndex]) {
        <div
          class="st-funnelChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(segments[hoveredIndex])"
          [style.top]="tooltipTop(segments[hoveredIndex])"
        >
          <span class="st-funnelChart__tooltipLabel">{{ segments[hoveredIndex].datum.label }}</span>
          <span class="st-funnelChart__tooltipValue">{{ segments[hoveredIndex].datum.value }}{{ showPercentagesValue ? ' · ' + formatPercent(segments[hoveredIndex].percent) : '' }}</span>
        </div>
      }

      @if (legend && legendItems.length > 0) {
        <ul class="st-funnelChart__legend" aria-hidden="true">
          @for (item of legendItems; track item.label) {
            <li class="st-funnelChart__legendItem">
              <span [class]="'st-funnelChart__legendSwatch st-funnelChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FunnelChart {
  static readonly stComponentName = "FunnelChart";
  readonly componentName = "FunnelChart";

  hoveredIndex: number | null = null;

  @NgInput() data: FunnelChartDatum[] = [];
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() showPercentages?: boolean;
  @NgInput() percentMode?: "ofFirst" | "ofPrevious";
  @NgInput() legend?: boolean;
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-funnelChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }
  get heightValue(): number {
    return this.height ?? 280;
  }
  get orientationValue(): "vertical" | "horizontal" {
    return this.orientation ?? "vertical";
  }
  get showPercentagesValue(): boolean {
    return this.showPercentages ?? true;
  }
  get percentModeValue(): "ofFirst" | "ofPrevious" {
    return this.percentMode ?? "ofFirst";
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  magnitude(v: number): number {
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  formatPercent(p: number): string {
    if (!Number.isFinite(p)) return "0%";
    return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
  }

  get percents(): number[] {
    const first = this.magnitude(this.data[0]?.value ?? 0);
    return this.data.map((d, i) => {
      const value = this.magnitude(d.value);
      const ref =
        this.percentModeValue === "ofPrevious"
          ? this.magnitude(this.data[i - 1]?.value ?? value)
          : first;
      return ref === 0 ? 0 : (value / ref) * 100;
    });
  }

  get segments(): FunnelSegment[] {
    if (this.data.length === 0) return [];
    const maxValue = Math.max(0, ...this.data.map((d) => this.magnitude(d.value)));
    const safeMax = maxValue === 0 ? 1 : maxValue;
    const plotW = Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    const percents = this.percents;

    if (this.orientationValue === "vertical") {
      const band = plotH / this.data.length;
      const segH = Math.max(band - GAP, 1);
      const cx = MARGIN.left + plotW / 2;
      return this.data.map((d, i) => {
        const tone = d.tone ?? TONES[i % TONES.length];
        const topHalf = (this.magnitude(d.value) / safeMax) * (plotW / 2);
        const nextVal = this.data[i + 1] ? this.magnitude(this.data[i + 1].value) : this.magnitude(d.value);
        const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
        const y0 = MARGIN.top + band * i;
        const y1 = y0 + segH;
        const points = [`${cx - topHalf},${y0}`, `${cx + topHalf},${y0}`, `${cx + botHalf},${y1}`, `${cx - botHalf},${y1}`].join(" ");
        return {
          points,
          datum: d,
          tone,
          textColor: contrastTextForTone(tone),
          cx,
          cy: (y0 + y1) / 2,
          labelX: cx,
          labelY: (y0 + y1) / 2,
          percent: percents[i],
        };
      });
    }

    const band = plotW / this.data.length;
    const segW = Math.max(band - GAP, 1);
    const cy = MARGIN.top + plotH / 2;
    return this.data.map((d, i) => {
      const tone = d.tone ?? TONES[i % TONES.length];
      const leftHalf = (this.magnitude(d.value) / safeMax) * (plotH / 2);
      const nextVal = this.data[i + 1] ? this.magnitude(this.data[i + 1].value) : this.magnitude(d.value);
      const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
      const x0 = MARGIN.left + band * i;
      const x1 = x0 + segW;
      const points = [
        `${x0},${cy - leftHalf}`,
        `${x1},${cy - rightHalf}`,
        `${x1},${cy + rightHalf}`,
        `${x0},${cy + leftHalf}`,
      ].join(" ");
      return {
        points,
        datum: d,
        tone,
        textColor: contrastTextForTone(tone),
        cx: (x0 + x1) / 2,
        cy,
        labelX: (x0 + x1) / 2,
        labelY: cy,
        percent: percents[i],
      };
    });
  }

  get legendItems(): Array<{ label: string; tone: FunnelChartTone }> {
    return this.data.map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }));
  }

  get dataValueItems(): string[] {
    const percents = this.percents;
    return this.data.map((d, i) =>
      this.showPercentagesValue ? `${d.label}: ${d.value} (${this.formatPercent(percents[i])})` : `${d.label}: ${d.value}`,
    );
  }

  segmentClass(i: number): string {
    return classNames(
      "st-funnelChart__segment",
      `st-funnelChart__segment--${this.segments[i]?.tone ?? "category1"}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-funnelChart__segment--dim",
    );
  }

  tooltipLeft(seg: FunnelSegment): string {
    return `${(seg.cx / this.widthValue) * 100}%`;
  }

  tooltipTop(seg: FunnelSegment): string {
    return `${(seg.cy / this.heightValue) * 100}%`;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
