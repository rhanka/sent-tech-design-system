import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  buildLinearPath,
  buildSmoothPath,
  formatTick,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type BellCurveChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BellCurveChartProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: BellCurveChartTone;
  smooth?: boolean;
  intervals?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;
const SQRT_2PI = Math.sqrt(2 * Math.PI);

type CurvePoint = { x: number; y: number; vx: number };
type GridLine = { value: number; x: number };
type SdMark = { k: number; x: number; yTop: number };
type MeanMark = { x: number; yTop: number };
type Stats = { mean: number; sd: number; n: number };

@Component({
  selector: "st-bell-curve-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-bellCurveChart__visual"
        role="img"
        [attr.aria-label]="ariaLabel"
        (pointermove)="handlePointerMove($event)"
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
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="currentColor" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>

          @for (g of gridLines; track g.value) {
            <line class="st-bellCurveChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN_TOP" [attr.y2]="baseY"></line>
            <text class="st-bellCurveChart__tickLabel" [attr.x]="g.x" [attr.y]="baseY + 16" text-anchor="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-bellCurveChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="baseY"></line>
          <line class="st-bellCurveChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="baseY" [attr.y2]="baseY"></line>

          @if (areaPath) {
            <path class="st-bellCurveChart__area" [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'"></path>
          }
          @if (linePath) {
            <path class="st-bellCurveChart__line" [attr.d]="linePath" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (m of sdMarks; track m.k) {
            <line class="st-bellCurveChart__sdMark" [attr.x1]="m.x" [attr.x2]="m.x" [attr.y1]="m.yTop" [attr.y2]="baseY"></line>
          }

          @if (meanMark; as mm) {
            <line class="st-bellCurveChart__mean" [attr.x1]="mm.x" [attr.x2]="mm.x" [attr.y1]="mm.yTop" [attr.y2]="baseY"></line>
            <text class="st-bellCurveChart__meanLabel" [attr.x]="mm.x" [attr.y]="MARGIN_TOP - 2" text-anchor="middle">μ</text>
          }

          @for (p of curvePoints; track $index) {
            <circle class="st-bellCurveChart__hit" [attr.cx]="p.x" [attr.cy]="p.y" r="6" [attr.data-chart-index]="$index"></circle>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="ariaLabel">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && curvePoints[hoveredIndex] && stats) {
        <div
          class="st-bellCurveChart__tooltip"
          role="presentation"
          [style.left]="(curvePoints[hoveredIndex].x / widthValue * 100) + '%'"
          [style.top]="(curvePoints[hoveredIndex].y / heightValue * 100) + '%'"
        >
          <span class="st-bellCurveChart__tooltipLabel">x ≈ {{ roundStat(curvePoints[hoveredIndex].vx) }}</span>
          <span class="st-bellCurveChart__tooltipValue">densité {{ roundStat(pdfAt(curvePoints[hoveredIndex].vx)) }}</span>
        </div>
      }
    </div>
  `,
})
export class BellCurveChart {
  static readonly stComponentName = "BellCurveChart";
  readonly componentName = "BellCurveChart";

  readonly MARGIN_LEFT = MARGIN.left;
  readonly MARGIN_RIGHT = MARGIN.right;
  readonly MARGIN_TOP = MARGIN.top;
  readonly MARGIN_BOTTOM = MARGIN.bottom;

  readonly gradientId = "st-bellcurve-gradient";

  hoveredIndex: number | null = null;

  @NgInput() data: number[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: BellCurveChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() intervals?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-bellCurveChart", `st-bellCurveChart--${this.toneValue}`, this.classInput);
  }

  get toneValue(): BellCurveChartTone {
    return this.tone ?? "category1";
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 240;
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

  get sampleCount(): number {
    return Math.max(8, Math.floor(this.intervals ?? 64) || 64);
  }

  get sample(): number[] {
    return this.data.filter((d) => Number.isFinite(d));
  }

  get stats(): Stats | null {
    const n = this.sample.length;
    if (n < 2) return null;
    const mean = this.sample.reduce((a, b) => a + b, 0) / n;
    const variance = this.sample.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    if (!(sd > 0) || !Number.isFinite(sd)) return null;
    return { mean, sd, n };
  }

  pdf(x: number, mean: number, sd: number): number {
    const z = (x - mean) / sd;
    return Math.exp(-(z * z) / 2) / (sd * SQRT_2PI);
  }

  pdfAt(vx: number): number {
    return this.stats ? this.pdf(vx, this.stats.mean, this.stats.sd) : 0;
  }

  get xDomain(): { min: number; max: number } {
    if (!this.stats) return { min: 0, max: 1 };
    return { min: this.stats.mean - 4 * this.stats.sd, max: this.stats.mean + 4 * this.stats.sd };
  }

  get yMax(): number {
    return this.stats ? this.pdf(this.stats.mean, this.stats.mean, this.stats.sd) : 1;
  }

  get yDomain(): { min: number; max: number } {
    return { min: 0, max: this.yMax * 1.08 };
  }

  get xTicks(): number[] {
    if (!this.stats) return [0];
    return niceTicks(this.xDomain.min, this.xDomain.max, 5);
  }

  get curvePoints(): CurvePoint[] {
    if (!this.stats) return [];
    const pts: CurvePoint[] = [];
    for (let i = 0; i <= this.sampleCount; i++) {
      const vx = this.xDomain.min + ((this.xDomain.max - this.xDomain.min) * i) / this.sampleCount;
      const vy = this.pdf(vx, this.stats.mean, this.stats.sd);
      pts.push({
        x: MARGIN.left + scaleLinear(vx, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
        y: MARGIN.top + scaleLinear(vy, this.yDomain.min, this.yDomain.max, this.plotHeight, 0),
        vx,
      });
    }
    return pts;
  }

  get linePath(): string {
    if (this.curvePoints.length === 0) return "";
    return (this.smooth ?? true) ? buildSmoothPath(this.curvePoints) : buildLinearPath(this.curvePoints);
  }

  get areaPath(): string {
    if (this.curvePoints.length === 0) return "";
    const base = MARGIN.top + this.plotHeight;
    const first = this.curvePoints[0];
    const last = this.curvePoints[this.curvePoints.length - 1];
    return `${this.linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  }

  get baseY(): number {
    return MARGIN.top + this.plotHeight;
  }

  get meanMark(): MeanMark | null {
    if (!this.stats) return null;
    return {
      x: MARGIN.left + scaleLinear(this.stats.mean, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
      yTop: MARGIN.top + scaleLinear(this.yMax, this.yDomain.min, this.yDomain.max, this.plotHeight, 0),
    };
  }

  get sdMarks(): SdMark[] {
    if (!this.stats) return [];
    return [-2, -1, 1, 2].map((k) => {
      const vx = this.stats!.mean + k * this.stats!.sd;
      const vy = this.pdf(vx, this.stats!.mean, this.stats!.sd);
      return {
        k,
        x: MARGIN.left + scaleLinear(vx, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
        yTop: MARGIN.top + scaleLinear(vy, this.yDomain.min, this.yDomain.max, this.plotHeight, 0),
      };
    });
  }

  get gridLines(): GridLine[] {
    return this.xTicks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
    }));
  }

  roundStat(v: number): number {
    return Math.round(v * 100) / 100;
  }

  get dataValueItems(): string[] {
    if (!this.stats) {
      return [
        this.sample.length < 2
          ? "Échantillon insuffisant (au moins 2 valeurs requises)"
          : "Écart-type nul (valeurs identiques)",
      ];
    }
    return [
      `Moyenne (μ): ${this.roundStat(this.stats.mean)}`,
      `Écart-type (σ): ${this.roundStat(this.stats.sd)}`,
      `Taille de l'échantillon (n): ${this.stats.n}`,
    ];
  }

  get ariaLabel(): string {
    return this.stats
      ? `${this.label} — μ ${this.roundStat(this.stats.mean)}, σ ${this.roundStat(this.stats.sd)}, n ${this.stats.n}`
      : this.label;
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
