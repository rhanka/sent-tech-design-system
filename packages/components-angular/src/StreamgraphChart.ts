import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, scaleLinear } from "./chartScale.js";

export type StreamgraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StreamgraphChartSeriesValue = {
  label: string;
  value: number;
  tone?: StreamgraphChartTone;
};

export type StreamgraphChartDatum = {
  category: string;
  values: StreamgraphChartSeriesValue[];
};

export type StreamgraphChartProps = {
  data: StreamgraphChartDatum[];
  width?: number;
  height?: number;
  label: string;
  smooth?: boolean;
  showLegend?: boolean;
  class?: string;
};

const TONES: StreamgraphChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 };

type SeriesEntry = { seriesLabel: string; tone: StreamgraphChartTone };
type BandPoint = { x: number; top: number; bottom: number };
type AreaItem = { tone: StreamgraphChartTone; seriesLabel: string; d: string };
type XTick = { x: number; label: string };
type TooltipData = { label: string; value: number; cx: number; cy: number };

@Component({
  selector: "st-streamgraph-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-streamgraphChart__visual"
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
          <line class="st-streamgraphChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (tick of xTickEntries; track $index) {
            <text class="st-streamgraphChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (area of areas; track area.seriesLabel; let si = $index) {
            @if (area.d) {
              <path
                [class]="areaClass(area, si)"
                [attr.d]="area.d"
                [attr.data-series-index]="si"
              ></path>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (tooltip) {
        <div
          class="st-streamgraphChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct + \'%\'"
          [style.top]="tooltipTopPct + \'%\'"
        >
          <span class="st-streamgraphChart__tooltipLabel">{{ tooltip.label }}</span>
          <span class="st-streamgraphChart__tooltipValue">{{ tooltip.value }}</span>
        </div>
      }

      @if (showLegendValue && series.length > 0) {
        <ul class="st-streamgraphChart__legend">
          @for (item of series; track item.seriesLabel) {
            <li class="st-streamgraphChart__legendItem">
              <span [class]="\'st-streamgraphChart__legendSwatch st-streamgraphChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.seriesLabel }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class StreamgraphChart {
  static readonly stComponentName = "StreamgraphChart";
  readonly componentName = "StreamgraphChart";

  readonly MARGIN_LEFT = MARGIN.left;
  readonly MARGIN_RIGHT = MARGIN.right;
  readonly MARGIN_BOTTOM = MARGIN.bottom;

  hovered: number | null = null;

  @NgInput() data: StreamgraphChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput() smooth?: boolean;
  @NgInput() showLegend?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-streamgraphChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get smoothValue(): boolean { return this.smooth !== false; }
  get showLegendValue(): boolean { return this.showLegend !== false; }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  private safeV(v: number): number {
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  get series(): SeriesEntry[] {
    const seen = new Map<string, StreamgraphChartTone>();
    this.data.forEach((d) =>
      d.values.forEach((sv) => {
        if (!seen.has(sv.label)) seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
      }),
    );
    return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
  }

  get halfMax(): number {
    let max = 0;
    for (const d of this.data) {
      let sum = 0;
      for (const sv of d.values) sum += this.safeV(sv.value);
      if (sum > max) max = sum;
    }
    return max / 2 || 1;
  }

  private computeBands(): BandPoint[][] {
    const xs = this.computeXs();
    const midY = MARGIN.top + this.plotHeight / 2;
    const valToY = (signed: number) => midY - scaleLinear(signed, 0, this.halfMax, 0, this.plotHeight / 2);

    const result = this.series.map(() => [] as BandPoint[]);
    this.data.forEach((d, xi) => {
      const total = d.values.reduce((s, sv) => s + this.safeV(sv.value), 0);
      let acc = -total / 2;
      this.series.forEach((s, si) => {
        const sv = d.values.find((v) => v.label === s.seriesLabel);
        const v = sv ? this.safeV(sv.value) : 0;
        const lower = acc;
        const upper = acc + v;
        acc = upper;
        result[si].push({ x: xs[xi], top: valToY(upper), bottom: valToY(lower) });
      });
    });
    return result;
  }

  private computeXs(): number[] {
    const n = this.data.length;
    return this.data.map((_, i) => {
      const denom = Math.max(n - 1, 1);
      const xRatio = n === 1 ? 0.5 : i / denom;
      return MARGIN.left + xRatio * this.plotWidth;
    });
  }

  get areas(): AreaItem[] {
    const bandsData = this.computeBands();
    return this.series.map((s, si) => {
      const band = bandsData[si];
      if (!band || band.length === 0) return { tone: s.tone, seriesLabel: s.seriesLabel, d: "" };
      const topPts = band.map((b) => ({ x: b.x, y: b.top }));
      const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
      const topPath = this.smoothValue ? buildSmoothPath(topPts) : buildLinearPath(topPts);
      const bottomPath = (this.smoothValue ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, "L");
      return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
    });
  }

  get xTickEntries(): XTick[] {
    const n = this.data.length;
    if (n === 0) return [];
    const target = Math.min(5, n);
    const stride = Math.max(1, Math.round((n - 1) / (target - 1 || 1)));
    const entries: XTick[] = [];
    const xsData = this.computeXs();
    for (let i = 0; i < n; i += stride) entries.push({ x: xsData[i], label: this.data[i].category });
    const lastIdx = n - 1;
    if (entries[entries.length - 1]?.label !== this.data[lastIdx].category) {
      entries.push({ x: xsData[lastIdx], label: this.data[lastIdx].category });
    }
    return entries;
  }

  get dataValueItems(): string[] {
    const items = this.series.map((s) => {
      const total = this.data.reduce((sum, d) => {
        const sv = d.values.find((v) => v.label === s.seriesLabel);
        return sum + (sv ? this.safeV(sv.value) : 0);
      }, 0);
      return `${s.seriesLabel}: ${total}`;
    });
    const grand = this.data.reduce(
      (sum, d) => sum + d.values.reduce((s, sv) => s + this.safeV(sv.value), 0),
      0,
    );
    if (this.series.length > 0) items.push(`Total: ${grand}`);
    return items;
  }

  get tooltip(): TooltipData | null {
    if (this.hovered === null || !this.series[this.hovered]) return null;
    const s = this.series[this.hovered];
    const bandsData = this.computeBands();
    const band = bandsData[this.hovered];
    if (!band || band.length === 0) return null;
    const mid = band[Math.floor(band.length / 2)];
    const total = this.data.reduce((sum, d) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      return sum + (sv ? this.safeV(sv.value) : 0);
    }, 0);
    return { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
  }

  get tooltipLeftPct(): number {
    return this.tooltip ? (this.tooltip.cx / this.widthValue) * 100 : 0;
  }

  get tooltipTopPct(): number {
    return this.tooltip ? (this.tooltip.cy / this.heightValue) * 100 : 0;
  }

  areaClass(area: AreaItem, si: number): string {
    return classNames(
      "st-streamgraphChart__area",
      `st-streamgraphChart__area--${area.tone}`,
      this.hovered !== null && this.hovered !== si && "st-streamgraphChart__area--dim",
    );
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-series-index"));
    this.hovered = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hovered = null;
  }
}
