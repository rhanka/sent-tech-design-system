import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type StackedBarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StackedBarSegment = {
  label: string;
  value: number;
  tone?: StackedBarTone;
};

export type StackedBarDatum = {
  label: string;
  segments: StackedBarSegment[];
};

export type StackedBarChartProps = {
  data: StackedBarDatum[];
  width?: number;
  height?: number;
  label: string;
  showLegend?: boolean;
  /**
   * Per-segment value labels. `false`/absent (default) → none. `true` → each
   * segment's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override (default `center` of the segment). Segments too
   * short to host a legible label are skipped. Labels are `aria-hidden` — the
   * values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * Interactive legend (FR-4). Ids/labels of series hidden from the render
   * (controlled by the parent; default = all visible). Each segment whose
   * `label` ∈ `hiddenSeries` is omitted and its legend item is shown "off"
   * (`aria-pressed`). Undefined → legacy non-interactive legend, unless
   * `onToggleSeries` is provided.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 };
const TONES: StackedBarTone[] = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];

@Component({
  selector: "st-stacked-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-stackedBarChart__visual" role="img" [attr.aria-label]="label">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stackedBarChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stackedBarChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (col of columns; track col.datum.label) {
            <text class="st-stackedBarChart__categoryLabel" [attr.x]="col.cx" [attr.y]="heightValue - MARGIN.bottom + 18" text-anchor="middle">{{ col.datum.label }}</text>
            @for (seg of col.segments; track seg.segLabel) {
              <rect
                [class]="'st-stackedBarChart__segment st-stackedBarChart__segment--' + seg.tone"
                [attr.x]="col.x"
                [attr.y]="seg.y"
                [attr.width]="col.width"
                [attr.height]="seg.height"
                rx="1"
              ></rect>
              @if (dlEnabled && seg.height > 14) {
                <text
                  class="st-stackedBarChart__dataLabel"
                  aria-hidden="true"
                  [attr.x]="col.cx"
                  [attr.y]="seg.y + seg.height / 2"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ formatDataLabel(seg.value) }}</text>
              }
            }
          }
        </svg>
      </div>

      @if (showLegend !== false && legendItems.length > 0) {
        <ul class="st-stackedBarChart__legend" [attr.aria-label]="'Légende de ' + label">
          @for (item of legendItems; track item.label) {
            @if (legendInteractive) {
              <li>
                <button
                  type="button"
                  [class]="'st-stackedBarChart__legendItem' + (hiddenSet.has(item.label) ? ' st-stackedBarChart__legendItem--off' : '')"
                  [attr.aria-pressed]="!hiddenSet.has(item.label)"
                  (click)="toggleSeries(item.label)"
                >
                  <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                  {{ item.label }}
                </button>
              </li>
            } @else {
              <li class="st-stackedBarChart__legendItem">
                <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                {{ item.label }}
              </li>
            }
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `,
})
export class StackedBarChart {
  static readonly stComponentName = "StackedBarChart";
  readonly componentName = "StackedBarChart";
  readonly MARGIN = MARGIN;

  @NgInput() data: StackedBarDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput() showLegend?: boolean;
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-stackedBarChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get safeData(): StackedBarDatum[] { return this.data ?? []; }

  get hiddenSet(): Set<string> { return new Set(this.hiddenSeries ?? []); }

  get legendInteractive(): boolean {
    return typeof this.onToggleSeries === "function" || this.hiddenSeries !== undefined;
  }

  get dlEnabled(): boolean { return normalizeDataLabels(this.dataLabels).enabled; }

  get segmentLabels(): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const datum of this.safeData) {
      for (const seg of datum.segments) {
        if (!seen.has(seg.label)) {
          seen.add(seg.label);
          result.push(seg.label);
        }
      }
    }
    return result;
  }

  toneForLabel(label: string): StackedBarTone {
    const idx = this.segmentLabels.indexOf(label);
    return TONES[idx % TONES.length] ?? "category1";
  }

  get columnTotals(): number[] {
    return this.safeData.map((datum) =>
      datum.segments
        .filter((s) => !this.hiddenSet.has(s.label))
        .reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0)
    );
  }

  get totalMax(): number {
    return Math.max(0, ...this.columnTotals);
  }

  get yTicks(): number[] {
    return niceTicks(0, this.totalMax, 5);
  }

  get yDomain(): { min: number; max: number } {
    const t = this.yTicks;
    return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
  }

  yPixel(y: number): number {
    return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
  }

  get gridLines(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
  }

  get columns(): Array<{
    datum: StackedBarDatum;
    x: number;
    cx: number;
    width: number;
    segments: Array<{ segLabel: string; value: number; tone: StackedBarTone; y: number; height: number }>;
  }> {
    const n = this.safeData.length;
    if (n === 0) return [];
    const band = this.plotWidth / n;
    const barWidth = band * 0.62;
    const baselineY = this.yPixel(0);

    return this.safeData.map((datum, i) => {
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      const cx = MARGIN.left + band * (i + 0.5);
      const visibleSegs = datum.segments.filter((s) => !this.hiddenSet.has(s.label));
      let currentY = baselineY;
      const segments = visibleSegs
        .filter((s) => Number.isFinite(s.value) && s.value > 0)
        .map((s) => {
          const h = this.plotHeight * (s.value / Math.max(this.yDomain.max, 1));
          const y = currentY - h;
          currentY = y;
          return {
            segLabel: s.label,
            value: s.value,
            tone: (s.tone ?? this.toneForLabel(s.label)) as StackedBarTone,
            y,
            height: Math.max(h, 0.5),
          };
        });
      return { datum, x, cx, width: barWidth, segments };
    });
  }

  get legendItems(): Array<{ label: string; tone: StackedBarTone }> {
    return this.segmentLabels.map((label) => ({
      label,
      tone: this.toneForLabel(label),
    }));
  }

  get dataValueItems(): string[] {
    return this.safeData.flatMap((datum) =>
      datum.segments
        .filter((s) => !this.hiddenSet.has(s.label))
        .map((s) => `${datum.label} / ${s.label}: ${s.value}`)
    );
  }

  formatTick(v: number): string { return formatTick(v); }

  formatDataLabel(v: number): string { return formatTick(v); }

  toggleSeries(label: string): void {
    this.onToggleSeries?.(label);
  }
}
