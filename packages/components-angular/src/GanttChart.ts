import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { niceTicks, scaleLinear, formatTick } from "./chartScale.js";

export type GanttChartTask = {
  task: string;
  start: number;
  end: number;
  category?: string;
};

export type GanttChartProps = {
  data: GanttChartTask[];
  label: string;
  width?: number;
  height?: number;
  marker?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };
const TONES = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];

function ellipsize(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

@Component({
  selector: "st-gantt-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-ganttChart__visual" role="img" [attr.aria-label]="label"
           (pointermove)="handlePointerMove($event)" (pointerleave)="hoveredIndex = null">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (tick of ticks; track tick) {
            <line class="st-ganttChart__grid" [attr.x1]="xOf(tick)" [attr.x2]="xOf(tick)" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
            <text class="st-ganttChart__tickLabel" [attr.x]="xOf(tick)" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ fmtTick(tick) }}</text>
          }

          <line class="st-ganttChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-ganttChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (bar of bars; track bar.datum.task) {
            <text class="st-ganttChart__taskLabel" [attr.x]="MARGIN.left - 8" [attr.y]="bar.rowCenterY" text-anchor="end" dominant-baseline="middle">{{ ellipsize(bar.datum.task, 18) }}</text>
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
            ></rect>
          }

          @if (markerGeom) {
            <line class="st-ganttChart__marker" [attr.x1]="markerGeom.x" [attr.x2]="markerGeom.x" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          }
        </svg>
      </div>

      @if (hasCategories) {
        <ul class="st-ganttChart__legend" [attr.aria-label]="'Catégories de ' + label">
          @for (item of legendItems; track item.category) {
            <li class="st-ganttChart__legendItem">
              <span [class]="'st-ganttChart__legendSwatch st-ganttChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.category }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div class="st-ganttChart__tooltip" role="presentation" [style.left.%]="tooltipLeft(bar)" [style.top.%]="tooltipTop(bar)">
          <span class="st-ganttChart__tooltipLabel">{{ bar.datum.task }}</span>
          <span class="st-ganttChart__tooltipValue">{{ bar.datum.start }} → {{ bar.datum.end }}</span>
        </div>
      }
    </div>
  `,
})
export class GanttChart {
  static readonly stComponentName = "GanttChart";
  readonly componentName = "GanttChart";
  readonly MARGIN = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data: GanttChartTask[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() marker?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-ganttChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 640;
  }

  get heightValue(): number {
    return this.height ?? 320;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  get safeData(): GanttChartTask[] {
    return (this.data ?? []).filter(
      (d) => typeof d.task === "string" && d.task.length > 0 && Number.isFinite(d.start) && Number.isFinite(d.end),
    );
  }

  get domainBounds(): { rawMin: number; rawMax: number } {
    const vals: number[] = [];
    for (const d of this.safeData) vals.push(d.start, d.end);
    if (typeof this.marker === "number" && Number.isFinite(this.marker)) vals.push(this.marker);
    if (vals.length === 0) return { rawMin: 0, rawMax: 1 };
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  }

  get ticks(): number[] {
    return niceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? 1;
  }

  xOf(value: number): number {
    return MARGIN.left + scaleLinear(value, this.domainMin, this.domainMax, 0, this.plotWidth);
  }

  fmtTick(v: number): string {
    return formatTick(v);
  }

  ellipsize(text: string, n: number): string {
    return ellipsize(text, n);
  }

  get categoryList(): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of this.safeData) {
      if (d.category && !seen.has(d.category)) {
        seen.add(d.category);
        result.push(d.category);
      }
    }
    return result;
  }

  get hasCategories(): boolean {
    return this.categoryList.length > 0;
  }

  toneForCategory(category: string | undefined): string {
    if (!category) return "category1";
    const idx = this.categoryList.indexOf(category);
    return TONES[idx % TONES.length] ?? "category1";
  }

  get bars(): Array<{
    datum: GanttChartTask;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rowCenterY: number;
    tone: string;
  }> {
    const n = this.safeData.length;
    if (n === 0) return [];
    const band = this.plotHeight / n;
    const barHeight = Math.min(band * 0.62, 28);
    return this.safeData.map((datum, index) => {
      const x0 = this.xOf(Math.min(datum.start, datum.end));
      const x1 = this.xOf(Math.max(datum.start, datum.end));
      const rowCenterY = MARGIN.top + band * index + band / 2;
      return {
        datum,
        index,
        x: x0,
        y: rowCenterY - barHeight / 2,
        width: Math.max(x1 - x0, 1),
        height: barHeight,
        rowCenterY,
        tone: this.toneForCategory(datum.category),
      };
    });
  }

  barClass(bar: { index: number; tone: string }): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== bar.index;
    return classNames("st-ganttChart__bar", `st-ganttChart__bar--${bar.tone}`, dim && "st-ganttChart__bar--dim");
  }

  get hoveredBar() {
    if (this.hoveredIndex == null) return null;
    return this.bars[this.hoveredIndex] ?? null;
  }

  get markerGeom(): { x: number } | null {
    if (this.marker == null || !Number.isFinite(this.marker)) return null;
    return { x: this.xOf(this.marker) };
  }

  get legendItems(): Array<{ category: string; tone: string }> {
    return this.categoryList.map((category) => ({
      category,
      tone: this.toneForCategory(category),
    }));
  }

  get dataValueItems(): string[] {
    return this.safeData.map((d) => `${d.task}: ${d.start} → ${d.end}`);
  }

  tooltipLeft(bar: { x: number; width: number }): number {
    return ((bar.x + bar.width / 2) / this.widthValue) * 100;
  }

  tooltipTop(bar: { rowCenterY: number }): number {
    return (bar.rowCenterY / this.heightValue) * 100;
  }

  handlePointerMove(e: PointerEvent): void {
    const target = e.target as Element | null;
    const attr = target?.getAttribute("data-chart-index");
    if (attr != null) {
      const idx = Number(attr);
      if (Number.isFinite(idx)) {
        this.hoveredIndex = idx;
        return;
      }
    }
    this.hoveredIndex = null;
  }
}
