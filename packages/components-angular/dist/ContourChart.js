import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };
const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8",
];
function normalizedScale(value) {
    return value === "categorical" ? "categorical" : "sequential";
}
function niceTicks(min, max, target = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        return [Number.isFinite(max) ? max : 0];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const power = Math.pow(10, Math.floor(Math.log10(rough)));
    const normalized = rough / power;
    let step;
    if (normalized < 1.5)
        step = power;
    else if (normalized < 3)
        step = 2 * power;
    else if (normalized < 7)
        step = 5 * power;
    else
        step = 10 * power;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [];
    for (let value = start; value <= end + step / 2; value += step)
        ticks.push(Number(value.toFixed(10)));
    return ticks;
}
function scaleLinear(value, domainStart, domainEnd, rangeStart, rangeEnd) {
    if (domainEnd === domainStart)
        return rangeStart;
    return rangeStart + ((value - domainStart) * (rangeEnd - rangeStart)) / (domainEnd - domainStart);
}
function formatTickLabel(value) {
    if (Math.abs(value) >= 1000)
        return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
export class ContourChart {
    static stComponentName = "ContourChart";
    componentName = "ContourChart";
    margin = MARGIN;
    data = [];
    levels;
    scale;
    label;
    width;
    height;
    size;
    classInput;
    hoveredKey = null;
    get resolvedScale() {
        return normalizedScale(this.scale);
    }
    get resolvedWidth() {
        return this.width ?? 640;
    }
    get resolvedHeight() {
        return this.height ?? 320;
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
    }
    get hostClass() {
        return classNames("st-contourChart", `st-contourChart--${this.resolvedScale}`, this.classInput);
    }
    get validData() {
        return (this.data ?? []).filter((datum) => datum && Number.isFinite(datum.x) && Number.isFinite(datum.y) && Number.isFinite(datum.value));
    }
    get levelCount() {
        const value = typeof this.levels === "number" && Number.isFinite(this.levels) ? this.levels : 6;
        return Math.max(1, Math.min(TONES.length, Math.floor(value)));
    }
    get valueMin() {
        const values = this.validData.map((datum) => datum.value);
        return values.length ? Math.min(...values) : 0;
    }
    get valueMax() {
        const values = this.validData.map((datum) => datum.value);
        return values.length ? Math.max(...values) : 0;
    }
    get xValues() {
        return Array.from(new Set(this.validData.map((datum) => datum.x))).sort((a, b) => a - b);
    }
    get yValues() {
        return Array.from(new Set(this.validData.map((datum) => datum.y))).sort((a, b) => a - b);
    }
    get xTicks() {
        const xs = this.validData.map((datum) => datum.x);
        return niceTicks(Math.min(...xs), Math.max(...xs));
    }
    get yTicks() {
        const ys = this.validData.map((datum) => datum.y);
        return niceTicks(Math.min(...ys), Math.max(...ys));
    }
    get plotWidth() {
        return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
    }
    get xMin() {
        return this.xTicks[0];
    }
    get xMax() {
        return this.xTicks[this.xTicks.length - 1];
    }
    get yMin() {
        return this.yTicks[0];
    }
    get yMax() {
        return this.yTicks[this.yTicks.length - 1];
    }
    get dx() {
        return this.xValues.length > 1 ? this.xValues[1] - this.xValues[0] : 1;
    }
    get dy() {
        return this.yValues.length > 1 ? this.yValues[1] - this.yValues[0] : 1;
    }
    toneForBand(band) {
        const toneIndex = Math.max(0, Math.min(TONES.length - 1, Math.floor((band / Math.max(this.levelCount - 1, 1)) * (TONES.length - 1))));
        return TONES[toneIndex];
    }
    bandOf(value) {
        const ratio = this.valueMax > this.valueMin ? (value - this.valueMin) / (this.valueMax - this.valueMin) : 0;
        const band = Math.max(0, Math.min(this.levelCount - 1, Math.floor(ratio * this.levelCount)));
        return { band, tone: this.toneForBand(band) };
    }
    get cells() {
        const xIndexByValue = new Map(this.xValues.map((value, index) => [value, index]));
        const yIndexByValue = new Map(this.yValues.map((value, index) => [value, index]));
        return this.validData.map((datum, index) => {
            const left = MARGIN.left + scaleLinear(datum.x - this.dx / 2, this.xMin, this.xMax, 0, this.plotWidth);
            const right = MARGIN.left + scaleLinear(datum.x + this.dx / 2, this.xMin, this.xMax, 0, this.plotWidth);
            const top = MARGIN.top + scaleLinear(datum.y + this.dy / 2, this.yMin, this.yMax, this.plotHeight, 0);
            const bottom = MARGIN.top + scaleLinear(datum.y - this.dy / 2, this.yMin, this.yMax, this.plotHeight, 0);
            const { band, tone } = this.bandOf(datum.value);
            return {
                key: `${index}`,
                datum,
                band,
                col: xIndexByValue.get(datum.x) ?? 0,
                row: yIndexByValue.get(datum.y) ?? 0,
                x: Math.min(left, right),
                y: Math.min(top, bottom),
                width: Math.abs(right - left),
                height: Math.abs(bottom - top),
                cx: (left + right) / 2,
                cy: (top + bottom) / 2,
                tone,
            };
        });
    }
    get contourSegments() {
        const cells = this.cells;
        const cellByGridKey = new Map(cells.map((cell) => [`${cell.col}:${cell.row}`, cell]));
        return cells.flatMap((cell) => {
            const segments = [];
            const right = cellByGridKey.get(`${cell.col + 1}:${cell.row}`);
            if (right && right.band !== cell.band) {
                segments.push({
                    key: `${cell.key}:right`,
                    x1: cell.x + cell.width,
                    y1: cell.y,
                    x2: cell.x + cell.width,
                    y2: cell.y + cell.height,
                });
            }
            const upper = cellByGridKey.get(`${cell.col}:${cell.row + 1}`);
            if (upper && upper.band !== cell.band) {
                segments.push({
                    key: `${cell.key}:top`,
                    x1: cell.x,
                    y1: cell.y,
                    x2: cell.x + cell.width,
                    y2: cell.y,
                });
            }
            return segments;
        });
    }
    get xAxisTicks() {
        return this.xTicks.map((value) => ({
            value,
            x: MARGIN.left + scaleLinear(value, this.xMin, this.xMax, 0, this.plotWidth),
        }));
    }
    get yAxisTicks() {
        return this.yTicks.map((value) => ({
            value,
            y: MARGIN.top + scaleLinear(value, this.yMin, this.yMax, this.plotHeight, 0),
        }));
    }
    get legendItems() {
        return Array.from({ length: this.levelCount }, (_, band) => ({ band, tone: this.toneForBand(band) }));
    }
    get hasLegend() {
        return this.validData.length > 0;
    }
    get dataValueItems() {
        return this.validData.map((datum) => `x ${datum.x}, y ${datum.y} · ${formatTickLabel(datum.value)}`);
    }
    get hoveredCell() {
        return this.hoveredKey === null ? null : this.cells.find((cell) => cell.key === this.hoveredKey) ?? null;
    }
    get tooltipLeft() {
        const cell = this.hoveredCell;
        return cell ? `${(cell.cx / this.resolvedWidth) * 100}%` : "0%";
    }
    get tooltipTop() {
        const cell = this.hoveredCell;
        return cell ? `${(cell.cy / this.resolvedHeight) * 100}%` : "0%";
    }
    get tooltipLabel() {
        const cell = this.hoveredCell;
        return cell ? `x ${cell.datum.x} · y ${cell.datum.y}` : "";
    }
    get tooltipValue() {
        const cell = this.hoveredCell;
        return cell ? formatTickLabel(cell.datum.value) : "";
    }
    formatTick(value) {
        return formatTickLabel(value);
    }
    cellClass(key, tone) {
        return classNames("st-contourChart__cell", `st-contourChart__cell--${tone}`, this.hoveredKey !== null && this.hoveredKey !== key ? "st-contourChart__cell--dim" : undefined);
    }
    handlePointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredKey = null;
            return;
        }
        this.hoveredKey = target.getAttribute("data-chart-key");
    }
    handleLeave() {
        this.hoveredKey = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ContourChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ContourChart, isStandalone: true, selector: "st-contour-chart", inputs: { data: "data", levels: "levels", scale: "scale", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-contourChart__visual"
        role="img"
        [attr.aria-label]="label"
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
          <rect
            *ngFor="let cell of cells"
            [attr.class]="cellClass(cell.key, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            [attr.data-chart-key]="cell.key"
          ></rect>

          <line
            *ngFor="let segment of contourSegments"
            class="st-contourChart__isoline"
            [attr.x1]="segment.x1"
            [attr.y1]="segment.y1"
            [attr.x2]="segment.x2"
            [attr.y2]="segment.y2"
          ></line>

          <ng-container *ngFor="let tick of yAxisTicks">
            <line
              class="st-contourChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="resolvedWidth - margin.right"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-contourChart__tick"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTick(tick.value) }}</text>
          </ng-container>

          <text
            *ngFor="let tick of xAxisTicks"
            class="st-contourChart__tick"
            [attr.x]="tick.x"
            [attr.y]="resolvedHeight - margin.bottom + 16"
            text-anchor="middle"
          >{{ formatTick(tick.value) }}</text>

          <line
            class="st-contourChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-contourChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
        </svg>
      </div>

      <div class="st-contourChart__legend" aria-hidden="true" [style.display]="hasLegend ? 'flex' : 'none'">
        <span class="st-contourChart__legendText">Low</span>
        <span class="st-contourChart__legendRamp">
          <span
            *ngFor="let item of legendItems"
            [attr.class]="'st-contourChart__legendSwatch st-contourChart__legendSwatch--' + item.tone"
          ></span>
        </span>
        <span class="st-contourChart__legendText">High</span>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'contour') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-contourChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-contourChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-contourChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ContourChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-contour-chart",
                    standalone: true,
                    imports: [NgFor],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-contourChart__visual"
        role="img"
        [attr.aria-label]="label"
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
          <rect
            *ngFor="let cell of cells"
            [attr.class]="cellClass(cell.key, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            [attr.data-chart-key]="cell.key"
          ></rect>

          <line
            *ngFor="let segment of contourSegments"
            class="st-contourChart__isoline"
            [attr.x1]="segment.x1"
            [attr.y1]="segment.y1"
            [attr.x2]="segment.x2"
            [attr.y2]="segment.y2"
          ></line>

          <ng-container *ngFor="let tick of yAxisTicks">
            <line
              class="st-contourChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="resolvedWidth - margin.right"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-contourChart__tick"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTick(tick.value) }}</text>
          </ng-container>

          <text
            *ngFor="let tick of xAxisTicks"
            class="st-contourChart__tick"
            [attr.x]="tick.x"
            [attr.y]="resolvedHeight - margin.bottom + 16"
            text-anchor="middle"
          >{{ formatTick(tick.value) }}</text>

          <line
            class="st-contourChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-contourChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
        </svg>
      </div>

      <div class="st-contourChart__legend" aria-hidden="true" [style.display]="hasLegend ? 'flex' : 'none'">
        <span class="st-contourChart__legendText">Low</span>
        <span class="st-contourChart__legendRamp">
          <span
            *ngFor="let item of legendItems"
            [attr.class]="'st-contourChart__legendSwatch st-contourChart__legendSwatch--' + item.tone"
          ></span>
        </span>
        <span class="st-contourChart__legendText">High</span>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'contour') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-contourChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-contourChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-contourChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], levels: [{
                type: NgInput
            }], scale: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ContourChart.js.map