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

const FUNNEL_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
] as const;

const FUNNEL_MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const FUNNEL_GAP = 6;

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
              [class]="segmentClass(seg, i)"
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

      @if (hoveredIndex !== null && segments[hoveredIndex!]) {
        <div
          class="st-funnelChart__tooltip"
          role="presentation"
          [style.left.%]="(segments[hoveredIndex!]!.cx / widthValue) * 100"
          [style.top.%]="(segments[hoveredIndex!]!.cy / heightValue) * 100"
        >
          <span class="st-funnelChart__tooltipLabel">{{ segments[hoveredIndex!]!.datum.label }}</span>
          <span class="st-funnelChart__tooltipValue">{{ segments[hoveredIndex!]!.datum.value }}{{ showPercentagesValue ? ' · ' + formatPercent(segments[hoveredIndex!]!.percent) : '' }}</span>
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

  @NgInput() data: FunnelChartDatum[] = [];
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() showPercentages?: boolean;
  @NgInput() percentMode?: "ofFirst" | "ofPrevious";
  @NgInput() legend?: boolean;
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  hoveredIndex: number | null = null;

  get hostClass(): string {
    return classNames("st-funnelChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 280; }
  get showPercentagesValue(): boolean { return this.showPercentages !== false; }
  get percentModeValue(): "ofFirst" | "ofPrevious" { return this.percentMode ?? "ofFirst"; }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  private magnitude(v: number): number {
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  formatPercent(p: number): string {
    if (!Number.isFinite(p)) return "0%";
    return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
  }

  get percents(): number[] {
    const data = this.data;
    const first = this.magnitude(data[0]?.value ?? 0);
    return data.map((d, i) => {
      const value = this.magnitude(d.value);
      const ref = this.percentModeValue === "ofPrevious"
        ? this.magnitude(data[i - 1]?.value ?? value)
        : first;
      return ref === 0 ? 0 : (value / ref) * 100;
    });
  }

  get segments(): FunnelSegment[] {
    const data = this.data;
    if (data.length === 0) return [];
    const maxValue = Math.max(0, ...data.map((d) => this.magnitude(d.value)));
    const safeMax = maxValue === 0 ? 1 : maxValue;
    const width = this.widthValue;
    const height = this.heightValue;
    const m = FUNNEL_MARGIN;
    const plotW = Math.max(width - m.left - m.right, 1);
    const plotH = Math.max(height - m.top - m.bottom, 1);
    const percents = this.percents;

    if ((this.orientation ?? "vertical") === "vertical") {
      const band = plotH / data.length;
      const segH = Math.max(band - FUNNEL_GAP, 1);
      const cx = m.left + plotW / 2;
      return data.map((d, i) => {
        const tone = d.tone ?? FUNNEL_TONES[i % FUNNEL_TONES.length];
        const topHalf = (this.magnitude(d.value) / safeMax) * (plotW / 2);
        const nextVal = data[i + 1] ? this.magnitude(data[i + 1].value) : this.magnitude(d.value);
        const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
        const y0 = m.top + band * i;
        const y1 = y0 + segH;
        const points = [
          `${cx - topHalf},${y0}`,
          `${cx + topHalf},${y0}`,
          `${cx + botHalf},${y1}`,
          `${cx - botHalf},${y1}`,
        ].join(" ");
        return { points, datum: d, tone, textColor: contrastTextForTone(tone), cx, cy: (y0 + y1) / 2, labelX: cx, labelY: (y0 + y1) / 2, percent: percents[i] };
      });
    }

    const band = plotW / data.length;
    const segW = Math.max(band - FUNNEL_GAP, 1);
    const cy = m.top + plotH / 2;
    return data.map((d, i) => {
      const tone = d.tone ?? FUNNEL_TONES[i % FUNNEL_TONES.length];
      const leftHalf = (this.magnitude(d.value) / safeMax) * (plotH / 2);
      const nextVal = data[i + 1] ? this.magnitude(data[i + 1].value) : this.magnitude(d.value);
      const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
      const x0 = m.left + band * i;
      const x1 = x0 + segW;
      const points = [
        `${x0},${cy - leftHalf}`,
        `${x1},${cy - rightHalf}`,
        `${x1},${cy + rightHalf}`,
        `${x0},${cy + leftHalf}`,
      ].join(" ");
      return { points, datum: d, tone, textColor: contrastTextForTone(tone), cx: (x0 + x1) / 2, cy, labelX: (x0 + x1) / 2, labelY: cy, percent: percents[i] };
    });
  }

  segmentClass(seg: FunnelSegment, i: number): string {
    const isDim = this.hoveredIndex !== null && this.hoveredIndex !== i;
    return classNames(
      "st-funnelChart__segment",
      `st-funnelChart__segment--${seg.tone}`,
      isDim ? "st-funnelChart__segment--dim" : undefined,
    );
  }

  get dataValueItems(): string[] {
    const percents = this.percents;
    return this.data.map((d, i) =>
      this.showPercentagesValue
        ? `${d.label}: ${d.value} (${this.formatPercent(percents[i])})`
        : `${d.label}: ${d.value}`,
    );
  }

  get legendItems(): Array<{ label: string; tone: FunnelChartTone }> {
    return this.data.map((d, i) => ({ label: d.label, tone: d.tone ?? FUNNEL_TONES[i % FUNNEL_TONES.length] }));
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) { this.hoveredIndex = null; return; }
    const raw = Number(target.getAttribute("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
