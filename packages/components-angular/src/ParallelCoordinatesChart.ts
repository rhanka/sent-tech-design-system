import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";

export type ParallelCoordinatesChartTone = "category1"|"category2"|"category3"|"category4"|"category5"|"category6"|"category7"|"category8";
export type ParallelAxis = { key: string; label: string; min?: number; max?: number };
export type ParallelCoordinatesChartProps = { axes: ParallelAxis[]; data: Record<string, unknown>[]; label: string; tones?: ParallelCoordinatesChartTone[]; width?: number; height?: number; class?: string };

const TONES: ParallelCoordinatesChartTone[] = ["category1","category2","category3","category4","category5","category6","category7","category8"];
const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };

type LineGeom = { path: string; tone: ParallelCoordinatesChartTone; index: number };
type AxisGeom = { key: string; label: string; ax: number; domainMin: number; domainMax: number };

@Component({
  selector: "st-parallel-coordinates-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-parallelCoordinatesChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          @for (line of lines; track line.index) {
            <path [class]="lineClass(line)" [attr.d]="line.path" fill="none" [attr.data-chart-index]="line.index"></path>
          }
          @for (axisGeom of axisGeoms; track axisGeom.key) {
            <line class="st-parallelCoordinatesChart__axis" [attr.x1]="axisGeom.ax" [attr.x2]="axisGeom.ax" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
            <text class="st-parallelCoordinatesChart__axisLabel" [attr.x]="axisGeom.ax" [attr.y]="margin.top - 10" text-anchor="middle">{{ axisGeom.label }}</text>
            <text class="st-parallelCoordinatesChart__tickLabel" [attr.x]="axisGeom.ax + 4" [attr.y]="margin.top + plotHeight" dominant-baseline="auto">{{ fmtTick(axisGeom.domainMin) }}</text>
            <text class="st-parallelCoordinatesChart__tickLabel" [attr.x]="axisGeom.ax + 4" [attr.y]="margin.top" dominant-baseline="hanging">{{ fmtTick(axisGeom.domainMax) }}</text>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
    </div>
  `,
})
export class ParallelCoordinatesChart {
  static readonly stComponentName = "ParallelCoordinatesChart";
  readonly componentName = "ParallelCoordinatesChart";
  readonly margin = MARGIN;
  private hoveredIndex: number | null = null;
  @NgInput() axes: ParallelAxis[] = [];
  @NgInput() data: Record<string, unknown>[] = [];
  @NgInput() label = "";
  @NgInput() tones?: ParallelCoordinatesChartTone[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;
  get hostClass(): string { return classNames("st-parallelCoordinatesChart", this.classInput); }
  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 300; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
  private axisDomain(axis: ParallelAxis): { min: number; max: number } {
    const vals = (this.data ?? []).map((d) => {
      const raw = d[axis.key];
      if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
      if (typeof raw === "string" && raw !== "") { const n = Number(raw); return Number.isFinite(n) ? n : null; }
      return null;
    }).filter((v): v is number => v !== null);
    const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
    const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
    const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;
    return { min: Number.isFinite(axis.min) ? (axis.min as number) : rawMin, max: Number.isFinite(axis.max) ? (axis.max as number) : safeMax };
  }
  private axisXPositions(): number[] {
    const axes = this.axes ?? [];
    return axes.map((_, i) => MARGIN.left + (axes.length <= 1 ? this.plotWidth / 2 : (i / (axes.length - 1)) * this.plotWidth));
  }
  private parseStrictFinite(raw: unknown): number | null {
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
    if (typeof raw === "string" && raw !== "") { const n = Number(raw); return Number.isFinite(n) ? n : null; }
    return null;
  }
  private buildPathWithGaps(points: ({ x: number; y: number } | null)[]): string {
    const parts: string[] = []; let segment: { x: number; y: number }[] = [];
    for (const pt of points) {
      if (pt === null) {
        if (segment.length > 0) { parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")); segment = []; }
      } else { segment.push(pt); }
    }
    if (segment.length > 0) parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
    return parts.join(" ");
  }
  get lines(): LineGeom[] {
    const axisX = this.axisXPositions();
    const axes = this.axes ?? [];
    return (this.data ?? []).map((row, ri) => {
      const rowTone = (this.tones ?? [])[ri] ?? TONES[ri % TONES.length];
      const points: ({ x: number; y: number } | null)[] = axes.map((axis, ai) => {
        const domain = this.axisDomain(axis);
        const val = this.parseStrictFinite(row[axis.key]);
        if (val === null) return null;
        const clamped = Math.min(Math.max(val, domain.min), domain.max);
        const t = domain.max === domain.min ? 0.5 : (clamped - domain.min) / (domain.max - domain.min);
        return { x: axisX[ai], y: MARGIN.top + (1 - t) * this.plotHeight };
      });
      return { points, tone: rowTone, index: ri, path: this.buildPathWithGaps(points) };
    });
  }
  get axisGeoms(): AxisGeom[] {
    const axisX = this.axisXPositions();
    return (this.axes ?? []).map((axis, ai) => {
      const domain = this.axisDomain(axis);
      return { key: axis.key, label: axis.label, ax: axisX[ai], domainMin: domain.min, domainMax: domain.max };
    });
  }
  get dataValueItems(): string[] {
    return (this.data ?? []).map((row) => (this.axes ?? []).map((axis) => `${axis.label}: ${row[axis.key] ?? ""}`).join(", "));
  }
  lineClass(line: LineGeom): string {
    return classNames("st-parallelCoordinatesChart__line", `st-parallelCoordinatesChart__line--${line.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== line.index && "st-parallelCoordinatesChart__line--dim",
      this.hoveredIndex === line.index && "st-parallelCoordinatesChart__line--active");
  }
  fmtTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }
  handleLeave(): void { this.hoveredIndex = null; }
  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const idx = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(idx) && idx >= 0 ? idx : null;
  }
}
