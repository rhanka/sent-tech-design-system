import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WindBarbChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type WindBarbChartDatum = {
  at: number;
  speed: number;
  direction: number;
};

export type WindBarbChartProps = {
  data: WindBarbChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

type BarbTick = { x1: number; y1: number; x2: number; y2: number; kind: "full" | "half" | "flag1" | "flag2" };
type WindBarb = { key: string; datum: WindBarbChartDatum; cx: number; cy: number; tipX: number; tipY: number; ticks: BarbTick[]; tone: WindBarbChartTone };

const MARGIN = { top: 16, right: 18, bottom: 36, left: 24 } as const;
const TONES: WindBarbChartTone[] = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];

function barbCounts(speed: number): { flags: number; full: number; half: number } {
  let rounded = Math.max(0, Math.round(speed / 5) * 5);
  const flags = Math.floor(rounded / 50);
  rounded -= flags * 50;
  const full = Math.floor(rounded / 10);
  rounded -= full * 10;
  const half = Math.floor(rounded / 5);
  return { flags, full, half };
}

@Component({
  selector: "st-wind-barb-chart",
  standalone: true,
  imports: [NgFor],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-windBarbChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <text *ngFor="let tick of xAxisTicks" class="st-windBarbChart__tick" [attr.x]="tick.x" [attr.y]="resolvedHeight - margin.bottom + 16" text-anchor="middle">{{ format(tick.value) }}</text>
          <line class="st-windBarbChart__axis" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="resolvedHeight - margin.bottom" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <g *ngFor="let barb of barbs" [attr.class]="barbClass(barb)" [attr.data-chart-key]="barb.key">
            <line class="st-windBarbChart__shaft" [attr.x1]="barb.cx" [attr.y1]="barb.cy" [attr.x2]="barb.tipX" [attr.y2]="barb.tipY" [attr.data-chart-key]="barb.key"></line>
            <line *ngFor="let tick of barb.ticks" [attr.class]="featherClass(tick)" [attr.x1]="tick.x1" [attr.y1]="tick.y1" [attr.x2]="tick.x2" [attr.y2]="tick.y2"></line>
          </g>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'wind barb') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div class="st-windBarbChart__tooltip" role="presentation" [style.display]="hoveredBarb ? 'inline-flex' : 'none'" [style.left]="tooltipLeft" [style.top]="tooltipTop">
        <span class="st-windBarbChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-windBarbChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
})
export class WindBarbChart {
  static readonly stComponentName = "WindBarbChart";
  readonly componentName = "WindBarbChart";
  readonly margin = MARGIN;

  @NgInput() data: WindBarbChartDatum[] = [];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  hoveredKey: string | null = null;

  get hostClass(): string {
    return ["st-windBarbChart", this.classInput].filter(Boolean).join(" ");
  }

  get resolvedWidth(): number { return this.finitePositive(this.width, 640); }
  get resolvedHeight(): number { return this.finitePositive(this.height, 160); }
  get resolvedSize(): number { return this.finitePositive(this.size, 32); }
  get viewBox(): string { return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`; }

  get validData(): WindBarbChartDatum[] {
    return (this.data ?? []).filter((datum) => Boolean(datum) && Number.isFinite(datum.at) && Number.isFinite(datum.speed) && datum.speed >= 0 && Number.isFinite(datum.direction));
  }

  get xTicks(): number[] {
    const ats = this.validData.map((datum) => datum.at);
    return niceTicks(ats.length ? Math.min(...ats) : 0, ats.length ? Math.max(...ats) : 1);
  }

  get plotWidth(): number { return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1); }
  get xMin(): number { return this.xTicks[0] ?? 0; }
  get xMax(): number { return this.xTicks[this.xTicks.length - 1] ?? 1; }
  get baseY(): number { return MARGIN.top + (this.resolvedHeight - MARGIN.top - MARGIN.bottom) / 2; }

  get xAxisTicks(): Array<{ value: number; x: number }> {
    return this.xTicks.map((value) => ({ value, x: MARGIN.left + scaleLinear(value, this.xMin, this.xMax, 0, this.plotWidth) }));
  }

  get barbs(): WindBarb[] {
    const maxSpeed = this.validData.reduce((max, datum) => (datum.speed > max ? datum.speed : max), 0);
    const max = maxSpeed > 0 ? maxSpeed : 1;
    return this.validData.map((datum, index) => {
      const cx = MARGIN.left + scaleLinear(datum.at, this.xMin, this.xMax, 0, this.plotWidth);
      const cy = this.baseY;
      const rad = ((datum.direction - 90) * Math.PI) / 180;
      const ux = Math.cos(rad);
      const uy = Math.sin(rad);
      const tipX = cx + ux * this.resolvedSize;
      const tipY = cy + uy * this.resolvedSize;
      const px = -uy;
      const py = ux;
      const { flags, full, half } = barbCounts(datum.speed);
      const barbLen = this.resolvedSize * 0.42;
      const halfLen = barbLen * 0.55;
      const spacing = this.resolvedSize * 0.16;
      const ticks: BarbTick[] = [];
      let along = this.resolvedSize - spacing;
      for (let flag = 0; flag < flags; flag++) {
        const ax = cx + ux * along;
        const ay = cy + uy * along;
        const bAlong = along - spacing;
        const bx = cx + ux * bAlong;
        const by = cy + uy * bAlong;
        const fx = ax + px * barbLen;
        const fy = ay + py * barbLen;
        ticks.push({ x1: ax, y1: ay, x2: fx, y2: fy, kind: "flag1" });
        ticks.push({ x1: bx, y1: by, x2: fx, y2: fy, kind: "flag2" });
        along = bAlong - spacing;
      }
      for (let fullTick = 0; fullTick < full; fullTick++) {
        const ax = cx + ux * along;
        const ay = cy + uy * along;
        ticks.push({ x1: ax, y1: ay, x2: ax + px * barbLen, y2: ay + py * barbLen, kind: "full" });
        along -= spacing;
      }
      for (let halfTick = 0; halfTick < half; halfTick++) {
        const ax = cx + ux * along;
        const ay = cy + uy * along;
        ticks.push({ x1: ax, y1: ay, x2: ax + px * halfLen, y2: ay + py * halfLen, kind: "half" });
        along -= spacing;
      }
      const bin = Math.min(Math.floor((datum.speed / max) * TONES.length), TONES.length - 1);
      return { key: `${index}`, datum, cx, cy, tipX, tipY, ticks, tone: TONES[Math.max(0, bin)] };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map((datum) => `${formatTick(datum.at)} - ${formatTick(datum.speed)} kt @ ${formatTick(datum.direction)}deg`);
  }

  get hoveredBarb(): WindBarb | null { return this.hoveredKey === null ? null : this.barbs.find((barb) => barb.key === this.hoveredKey) ?? null; }
  get tooltipLeft(): string { const barb = this.hoveredBarb; return barb ? `${(barb.cx / this.resolvedWidth) * 100}%` : "0"; }
  get tooltipTop(): string { const barb = this.hoveredBarb; return barb ? `${(barb.cy / this.resolvedHeight) * 100}%` : "0"; }
  get tooltipLabel(): string { const barb = this.hoveredBarb; return barb ? formatTick(barb.datum.at) : ""; }
  get tooltipValue(): string { const barb = this.hoveredBarb; return barb ? `${formatTick(barb.datum.speed)} kt @ ${formatTick(barb.datum.direction)}deg` : ""; }

  handlePointerMove(event: PointerEvent): void { const target = event.target; this.hoveredKey = target instanceof Element ? target.getAttribute("data-chart-key") : null; }
  handleLeave(): void { this.hoveredKey = null; }
  barbClass(barb: WindBarb): string { return classNames("st-windBarbChart__barb", `st-windBarbChart__barb--${barb.tone}`, this.hoveredKey !== null && this.hoveredKey !== barb.key ? "st-windBarbChart__barb--dim" : undefined); }
  featherClass(tick: BarbTick): string { return classNames("st-windBarbChart__feather", `st-windBarbChart__feather--${tick.kind}`); }
  format(value: number): string { return formatTick(value); }
  private finitePositive(value: number | undefined, fallback: number): number { return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback; }
}
