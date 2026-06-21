import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";

export type MarimekkoChartTone = "category1"|"category2"|"category3"|"category4"|"category5"|"category6"|"category7"|"category8";
export type MarimekkoChartSegment = { label: string; value: number; tone?: MarimekkoChartTone };
export type MarimekkoChartDatum = { label: string; width: number; segments: MarimekkoChartSegment[] };
export type MarimekkoChartProps = { data: MarimekkoChartDatum[]; label: string; width?: number; height?: number; class?: string };

const TONES: MarimekkoChartTone[] = ["category1","category2","category3","category4","category5","category6","category7","category8"];
const MARGIN = { top: 12, right: 16, bottom: 32, left: 8 };

type CellGeom = {
  key: string; catLabel: string; segLabel: string; tone: MarimekkoChartTone;
  x: number; y: number; w: number; h: number; cx: number; cy: number;
  pct: number; colPct: number; textColor: string; showLabel: boolean;
};
type CatLabel = { label: string; x: number };

@Component({
  selector: "st-marimekko-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-marimekkoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <line class="st-marimekkoChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @for (cell of cells; track cell.key) {
            <rect [class]="cellClass(cell)" [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.w" [attr.height]="cell.h" [attr.data-chart-key]="cell.key"></rect>
            @if (cell.showLabel) {
              <text class="st-marimekkoChart__cellLabel" [attr.x]="cell.cx" [attr.y]="cell.cy" text-anchor="middle" dominant-baseline="middle" [attr.fill]="cell.textColor" pointer-events="none">{{ cellPct(cell.pct) }}%</text>
            }
          }
          @for (cat of catLabels; track cat.label) {
            <text class="st-marimekkoChart__catLabel" [attr.x]="cat.x" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ cat.label }}</text>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredCell) {
        <div class="st-marimekkoChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-marimekkoChart__tooltipLabel">{{ hoveredCell.catLabel }} / {{ hoveredCell.segLabel }}</span>
          <span class="st-marimekkoChart__tooltipValue">{{ cellPct(hoveredCell.pct) }}%</span>
        </div>
      }
    </div>
  `,
})
export class MarimekkoChart {
  static readonly stComponentName = "MarimekkoChart";
  readonly componentName = "MarimekkoChart";
  readonly margin = MARGIN;
  private hoveredKey: string | null = null;
  @NgInput() data: MarimekkoChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;
  get hostClass(): string { return classNames("st-marimekkoChart", this.classInput); }
  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 300; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
  get totalWidth(): number {
    const sum = (this.data ?? []).reduce((acc, d) => acc + (Number.isFinite(d.width) && d.width > 0 ? d.width : 0), 0);
    return sum > 0 ? sum : 1;
  }
  get cells(): CellGeom[] {
    let xCursor = MARGIN.left;
    const result: CellGeom[] = [];
    for (const datum of this.data ?? []) {
      const safeW = Number.isFinite(datum.width) && datum.width > 0 ? datum.width : 0;
      if (safeW <= 0) continue;
      const colW = (safeW / this.totalWidth) * this.plotWidth;
      const colPct = safeW / this.totalWidth;
      const validSegs = datum.segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
      const segSum = validSegs.reduce((acc, s) => acc + s.value, 0);
      const safeSum = segSum > 0 ? segSum : 1;
      let yCursor = MARGIN.top;
      for (let si = 0; si < validSegs.length; si++) {
        const seg = validSegs[si];
        const pct = seg.value / safeSum;
        const segH = pct * this.plotHeight;
        const tone = seg.tone ?? TONES[si % TONES.length];
        const w = Math.max(colW - 1, 1);
        const h = Math.max(segH, 1);
        result.push({
          key: `${datum.label}-${seg.label}`, catLabel: datum.label, segLabel: seg.label, tone,
          x: xCursor, y: yCursor, w, h, cx: xCursor + colW / 2, cy: yCursor + segH / 2,
          pct, colPct, textColor: contrastTextForTone(tone), showLabel: w > 28 && h > 14,
        });
        yCursor += segH;
      }
      xCursor += colW;
    }
    return result;
  }
  get catLabels(): CatLabel[] {
    const result: CatLabel[] = [];
    for (const datum of this.data ?? []) {
      if (!Number.isFinite(datum.width) || datum.width <= 0) continue;
      const firstCell = this.cells.find((c) => c.catLabel === datum.label);
      if (!firstCell) continue;
      const colW = (datum.width / this.totalWidth) * this.plotWidth;
      result.push({ label: datum.label, x: firstCell.x + colW / 2 });
    }
    return result;
  }
  get dataValueItems(): string[] {
    return this.cells.map((c) => `${c.catLabel}, ${c.segLabel}: ${Math.round(c.pct * 100)}% (colonne ${Math.round(c.colPct * 100)}%)`);
  }
  get hoveredCell(): CellGeom | null {
    return this.hoveredKey !== null ? (this.cells.find((c) => c.key === this.hoveredKey) ?? null) : null;
  }
  cellClass(cell: CellGeom): string {
    return classNames("st-marimekkoChart__cell", `st-marimekkoChart__cell--${cell.tone}`,
      this.hoveredKey !== null && this.hoveredKey !== cell.key && "st-marimekkoChart__cell--dim");
  }
  cellPct(value: number): number { return Math.round(value * 100); }
  tooltipLeft(): string { const c = this.hoveredCell; return c ? `${(c.cx / this.widthValue) * 100}%` : "0%"; }
  tooltipTop(): string { const c = this.hoveredCell; return c ? `${(c.cy / this.heightValue) * 100}%` : "0%"; }
  handleLeave(): void { this.hoveredKey = null; }
  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    this.hoveredKey = target?.getAttribute?.("data-chart-key") ?? null;
  }
}
