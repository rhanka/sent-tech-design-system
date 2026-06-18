import { NgFor, NgIf } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type PointAndFigureChartMark = "x" | "o";

export type PointAndFigureChartDatum = {
  date: number;
  close: number;
};

export type PointAndFigureChartProps = {
  data: PointAndFigureChartDatum[];
  boxSize?: number;
  reversal?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

type RawColumn = { mark: PointAndFigureChartMark; low: number; high: number };
type PnfColumn = RawColumn & { priceLow: number; priceHigh: number };
type PnfMark = { key: string; mark: PointAndFigureChartMark; cx: number; cy: number; r: number; priceLow: number; priceHigh: number };

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

@Component({
  selector: "st-point-and-figure-chart",
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-pointAndFigureChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <ng-container *ngFor="let tick of yAxisTicks">
            <line class="st-pointAndFigureChart__grid" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text class="st-pointAndFigureChart__tick" [attr.x]="margin.left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle">{{ format(tick.value) }}</text>
          </ng-container>
          <line class="st-pointAndFigureChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <line class="st-pointAndFigureChart__axis" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="resolvedHeight - margin.bottom" [attr.y2]="resolvedHeight - margin.bottom"></line>

          <ng-container *ngFor="let mark of marks">
            <g *ngIf="mark.mark === 'x'" [attr.class]="markClass(mark)" [attr.data-chart-key]="mark.key">
              <line class="st-pointAndFigureChart__glyph" [attr.x1]="mark.cx - mark.r" [attr.y1]="mark.cy - mark.r" [attr.x2]="mark.cx + mark.r" [attr.y2]="mark.cy + mark.r" [attr.data-chart-key]="mark.key"></line>
              <line class="st-pointAndFigureChart__glyph" [attr.x1]="mark.cx - mark.r" [attr.y1]="mark.cy + mark.r" [attr.x2]="mark.cx + mark.r" [attr.y2]="mark.cy - mark.r" [attr.data-chart-key]="mark.key"></line>
            </g>
            <circle *ngIf="mark.mark === 'o'" [attr.class]="markClass(mark) + ' st-pointAndFigureChart__glyph'" [attr.cx]="mark.cx" [attr.cy]="mark.cy" [attr.r]="mark.r" [attr.data-chart-key]="mark.key"></circle>
          </ng-container>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'point and figure') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div class="st-pointAndFigureChart__tooltip" role="presentation" [style.display]="hoveredMark ? 'inline-flex' : 'none'" [style.left]="tooltipLeft" [style.top]="tooltipTop">
        <span class="st-pointAndFigureChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-pointAndFigureChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
})
export class PointAndFigureChart {
  static readonly stComponentName = "PointAndFigureChart";
  readonly componentName = "PointAndFigureChart";
  readonly margin = MARGIN;

  @NgInput() data: PointAndFigureChartDatum[] = [];
  @NgInput() boxSize?: number;
  @NgInput() reversal?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  hoveredKey: string | null = null;

  get hostClass(): string { return ["st-pointAndFigureChart", this.classInput].filter(Boolean).join(" "); }
  get resolvedWidth(): number { return this.finitePositive(this.width, 640); }
  get resolvedHeight(): number { return this.finitePositive(this.height, 320); }
  get viewBox(): string { return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`; }

  get validData(): PointAndFigureChartDatum[] {
    return (this.data ?? []).filter((datum) => Boolean(datum) && Number.isFinite(datum.date) && Number.isFinite(datum.close));
  }

  get closes(): number[] { return this.validData.map((datum) => datum.close); }
  get baseMin(): number { return this.closes.length ? Math.min(...this.closes) : 0; }

  get effectiveBox(): number {
    if (typeof this.boxSize === "number" && Number.isFinite(this.boxSize) && this.boxSize > 0) return this.boxSize;
    if (!this.closes.length) return 1;
    const span = Math.max(...this.closes) - Math.min(...this.closes);
    return span > 0 ? span / 20 : 1;
  }

  get reversalBoxes(): number {
    const value = typeof this.reversal === "number" && Number.isFinite(this.reversal) ? this.reversal : 3;
    return Math.max(1, Math.floor(value));
  }

  get rawColumns(): RawColumn[] {
    const raw: RawColumn[] = [];
    if (this.validData.length === 0 || this.effectiveBox <= 0) return raw;
    const boxIndex = (price: number) => Math.floor((price - this.baseMin) / this.effectiveBox + 1e-9);
    const firstBoxIndex = boxIndex(this.closes[0]);
    let mark: PointAndFigureChartMark | null = null;
    let low = firstBoxIndex;
    let high = firstBoxIndex;
    for (let index = 1; index < this.closes.length; index++) {
      const current = boxIndex(this.closes[index]);
      if (mark === null) {
        if (current >= firstBoxIndex + 1) {
          mark = "x";
          low = firstBoxIndex;
          high = current;
        } else if (current <= firstBoxIndex - 1) {
          mark = "o";
          low = current;
          high = firstBoxIndex;
        }
        continue;
      }
      if (mark === "x") {
        if (current > high) {
          high = current;
        } else if (current <= high - this.reversalBoxes) {
          raw.push({ mark, low, high });
          mark = "o";
          high -= 1;
          low = current;
        }
      } else if (current < low) {
        low = current;
      } else if (current >= low + this.reversalBoxes) {
        raw.push({ mark, low, high });
        mark = "x";
        low += 1;
        high = current;
      }
    }
    if (mark !== null && high >= low) raw.push({ mark, low, high });
    return raw;
  }

  get pnfColumns(): PnfColumn[] {
    return this.rawColumns.map((column) => ({
      ...column,
      priceLow: this.baseMin + column.low * this.effectiveBox,
      priceHigh: this.baseMin + (column.high + 1) * this.effectiveBox,
    }));
  }

  get priceMin(): number {
    if (!this.pnfColumns.length) return this.closes.length ? Math.min(...this.closes) : 0;
    return Math.min(...this.pnfColumns.map((column) => column.priceLow));
  }

  get priceMax(): number {
    if (!this.pnfColumns.length) return this.closes.length ? Math.max(...this.closes) : 0;
    return Math.max(...this.pnfColumns.map((column) => column.priceHigh));
  }

  get yTicks(): number[] { return niceTicks(this.priceMin, this.priceMax); }
  get yMin(): number { return this.yTicks[0] ?? 0; }
  get yMax(): number { return this.yTicks[this.yTicks.length - 1] ?? 1; }
  get plotWidth(): number { return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1); }

  get yAxisTicks(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({ value, y: MARGIN.top + scaleLinear(value, this.yMin, this.yMax, this.plotHeight, 0) }));
  }

  get marks(): PnfMark[] {
    const colWidth = this.pnfColumns.length > 0 ? this.plotWidth / this.pnfColumns.length : this.plotWidth;
    const glyph = Math.min(colWidth, scaleLinear(this.effectiveBox, 0, Math.max(this.yMax - this.yMin, this.effectiveBox), 0, this.plotHeight)) * 0.7;
    const marks: PnfMark[] = [];
    this.pnfColumns.forEach((column, columnIndex) => {
      const cx = MARGIN.left + colWidth * columnIndex + colWidth / 2;
      for (let box = column.low; box <= column.high; box++) {
        const priceMid = this.baseMin + (box + 0.5) * this.effectiveBox;
        marks.push({
          key: `${columnIndex}-${box}`,
          mark: column.mark,
          cx,
          cy: MARGIN.top + scaleLinear(priceMid, this.yMin, this.yMax, this.plotHeight, 0),
          r: Math.max(glyph / 2, 2),
          priceLow: column.priceLow,
          priceHigh: column.priceHigh,
        });
      }
    });
    return marks;
  }

  get dataValueItems(): string[] {
    return this.pnfColumns.map((column) => `${column.mark === "x" ? "X" : "O"} ${formatTick(column.priceLow)} -> ${formatTick(column.priceHigh)}`);
  }

  get hoveredMark(): PnfMark | null { return this.hoveredKey === null ? null : this.marks.find((mark) => mark.key === this.hoveredKey) ?? null; }
  get tooltipLeft(): string { const mark = this.hoveredMark; return mark ? `${(mark.cx / this.resolvedWidth) * 100}%` : "0"; }
  get tooltipTop(): string { const mark = this.hoveredMark; return mark ? `${(mark.cy / this.resolvedHeight) * 100}%` : "0"; }
  get tooltipLabel(): string { const mark = this.hoveredMark; return mark ? (mark.mark === "x" ? "X" : "O") : ""; }
  get tooltipValue(): string { const mark = this.hoveredMark; return mark ? `${formatTick(mark.priceLow)} -> ${formatTick(mark.priceHigh)}` : ""; }

  handlePointerMove(event: PointerEvent): void { const target = event.target; this.hoveredKey = target instanceof Element ? target.getAttribute("data-chart-key") : null; }
  handleLeave(): void { this.hoveredKey = null; }
  markClass(mark: PnfMark): string { return classNames("st-pointAndFigureChart__mark", `st-pointAndFigureChart__mark--${mark.mark}`, this.hoveredKey !== null && this.hoveredKey !== mark.key ? "st-pointAndFigureChart__mark--dim" : undefined); }
  format(value: number): string { return formatTick(value); }
  private finitePositive(value: number | undefined, fallback: number): number { return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback; }
}
