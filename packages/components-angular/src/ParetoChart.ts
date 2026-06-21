import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { niceTicks, scaleLinear } from "./chartScale.js";

export type ParetoChartTone = "category1"|"category2"|"category3"|"category4"|"category5"|"category6"|"category7"|"category8";
export type ParetoChartDatum = { label: string; value: number; tone?: ParetoChartTone };
export type ParetoChartProps = { data: ParetoChartDatum[]; width?: number; height?: number; label: string; class?: string };

const MARGIN = { top: 12, right: 44, bottom: 32, left: 44 };
const DOT_RADIUS = 4;

type ParetoEntry = {
  datum: ParetoChartDatum; tone: ParetoChartTone;
  x: number; y: number; width: number; height: number;
  cumPercent: number; cx: number; cy: number; index: number;
};

@Component({
  selector: "st-pareto-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-paretoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handleVisualPointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          @for (tick of valueAxisTicks; track tick.value) {
            <line class="st-paretoChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text class="st-paretoChart__tickLabel" [attr.x]="margin.left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle">{{ fmtTick(tick.value) }}</text>
          }
          @for (tick of percentAxisTicks; track tick.value) {
            <text class="st-paretoChart__percentLabel" [attr.x]="widthValue - margin.right + 6" [attr.y]="tick.y" text-anchor="start" dominant-baseline="middle">{{ tick.value }}%</text>
          }
          <line class="st-paretoChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-paretoChart__axis" [attr.x1]="widthValue - margin.right" [attr.x2]="widthValue - margin.right" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-paretoChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @for (e of entries; track e.datum.label) {
            <text class="st-paretoChart__categoryLabel" [attr.x]="e.x + e.width / 2" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ e.datum.label }}</text>
          }
          @for (e of entries; track e.datum.label) {
            <rect [class]="barClass(e)" [attr.x]="e.x" [attr.y]="e.y" [attr.width]="e.width" [attr.height]="e.height" rx="2" [attr.data-chart-index]="e.index"></rect>
          }
          @if (entries.length > 0) {
            <path class="st-paretoChart__cumLine" [attr.d]="cumulativePath" fill="none"></path>
            @for (e of entries; track e.datum.label) {
              <circle class="st-paretoChart__cumDot" [attr.cx]="e.cx" [attr.cy]="e.cy" [attr.r]="dotRadius" [attr.data-chart-index]="e.index"></circle>
            }
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredIndex !== null && entries[hoveredIndex]) {
        <div class="st-paretoChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-paretoChart__tooltipLabel">{{ entries[hoveredIndex].datum.label }}</span>
          <span class="st-paretoChart__tooltipValue">{{ entries[hoveredIndex].datum.value }} · {{ fmtTick(entries[hoveredIndex].cumPercent) }}%</span>
        </div>
      }
    </div>
  `,
})
export class ParetoChart {
  static readonly stComponentName = "ParetoChart";
  readonly componentName = "ParetoChart";
  readonly margin = MARGIN;
  readonly dotRadius = DOT_RADIUS;
  hoveredIndex: number | null = null;
  @NgInput() data: ParetoChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;
  get hostClass(): string { return classNames("st-paretoChart", this.classInput); }
  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get sortedData(): ParetoChartDatum[] {
    return (this.data ?? []).filter((d) => Number.isFinite(d.value) && d.value >= 0).slice().sort((a, b) => b.value - a.value);
  }
  get total(): number { return this.sortedData.reduce((acc, d) => acc + d.value, 0); }
  get scales() {
    const values = this.sortedData.map((d) => d.value);
    const ticks = niceTicks(0, Math.max(0, ...values), 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1], plotWidth: Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1), plotHeight: Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1) };
  }
  get entries(): ParetoEntry[] {
    const { domainMin, domainMax, plotWidth, plotHeight } = this.scales;
    if (this.sortedData.length === 0) return [];
    const band = plotWidth / this.sortedData.length;
    const barWidth = band * 0.62;
    const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    let running = 0;
    return this.sortedData.map((d, i) => {
      running += d.value;
      const cumPercent = this.total > 0 ? (running / this.total) * 100 : 0;
      const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(valueY, zeroY);
      const h = Math.abs(zeroY - valueY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      return { datum: d, tone: (d.tone ?? "category1") as ParetoChartTone, x, y: MARGIN.top + y, width: barWidth, height: Math.max(h, 0.5), cumPercent, cx: MARGIN.left + band * (i + 0.5), cy: MARGIN.top + scaleLinear(cumPercent, 0, 100, plotHeight, 0), index: i };
    });
  }
  get cumulativePath(): string { return this.entries.map((e, i) => `${i === 0 ? "M" : "L"} ${e.cx} ${e.cy}`).join(" "); }
  get dataValueItems(): string[] { return this.entries.map((e) => `${e.datum.label}: ${e.datum.value} (${this.fmtTick(e.cumPercent)}% cumulé)`); }
  get valueAxisTicks() {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = this.scales;
    return ticks.map((tick) => ({ value: tick, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0) }));
  }
  get percentAxisTicks() {
    const { plotHeight } = this.scales;
    return [0, 25, 50, 75, 100].map((pct) => ({ value: pct, y: MARGIN.top + scaleLinear(pct, 0, 100, plotHeight, 0) }));
  }
  barClass(e: ParetoEntry): string { return `st-paretoChart__bar st-paretoChart__bar--${e.tone}`; }
  fmtTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }
  tooltipLeft(): string { const e = this.hoveredIndex !== null ? this.entries[this.hoveredIndex] : null; return e ? `${(e.cx / this.widthValue) * 100}%` : "0%"; }
  tooltipTop(): string { const e = this.hoveredIndex !== null ? this.entries[this.hoveredIndex] : null; return e ? `${(e.cy / this.heightValue) * 100}%` : "0%"; }
  handleLeave(): void { this.hoveredIndex = null; }
  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && raw >= 0 ? raw : null;
  }
}
