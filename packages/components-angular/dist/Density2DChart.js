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
function toneForDensity(density, densityMax) {
    if (!Number.isFinite(density) || densityMax <= 0)
        return "category1";
    const ratio = Math.max(0, Math.min(1, density / densityMax));
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
    return TONES[index];
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
export class Density2DChart {
    static stComponentName = "Density2DChart";
    componentName = "Density2DChart";
    margin = MARGIN;
    tones = TONES;
    data = [];
    bins;
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
        return this.width ?? this.size ?? 640;
    }
    get resolvedHeight() {
        return this.height ?? 320;
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
    }
    get hostClass() {
        return classNames("st-density2DChart", `st-density2DChart--${this.resolvedScale}`, this.classInput);
    }
    get plotWidth() {
        return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
    }
    get binCount() {
        const value = typeof this.bins === "number" && Number.isFinite(this.bins) ? this.bins : 12;
        return Math.max(1, Math.min(40, Math.floor(value)));
    }
    get validData() {
        return (this.data ?? []).filter((datum) => datum && Number.isFinite(datum.x) && Number.isFinite(datum.y));
    }
    get xTicks() {
        const xs = this.validData.map((datum) => datum.x);
        return niceTicks(xs.length ? Math.min(...xs) : 0, xs.length ? Math.max(...xs) : 1);
    }
    get yTicks() {
        const ys = this.validData.map((datum) => datum.y);
        return niceTicks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
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
    get layout() {
        const validData = this.validData;
        if (validData.length === 0 || this.xMax === this.xMin || this.yMax === this.yMin) {
            return { bins: [], densityMax: 0 };
        }
        const counts = new Float64Array(this.binCount * this.binCount);
        const indexOf = (ix, iy) => iy * this.binCount + ix;
        for (const datum of validData) {
            const fx = (datum.x - this.xMin) / (this.xMax - this.xMin);
            const fy = (datum.y - this.yMin) / (this.yMax - this.yMin);
            const ix = Math.max(0, Math.min(this.binCount - 1, Math.floor(fx * this.binCount)));
            const iy = Math.max(0, Math.min(this.binCount - 1, Math.floor(fy * this.binCount)));
            const weight = typeof datum.weight === "number" && Number.isFinite(datum.weight) ? datum.weight : 1;
            counts[indexOf(ix, iy)] += weight;
        }
        let densityMax = 0;
        for (let index = 0; index < counts.length; index++)
            densityMax = Math.max(densityMax, counts[index]);
        const cellWidth = this.plotWidth / this.binCount;
        const cellHeight = this.plotHeight / this.binCount;
        const bins = [];
        for (let iy = 0; iy < this.binCount; iy++) {
            for (let ix = 0; ix < this.binCount; ix++) {
                const density = counts[indexOf(ix, iy)];
                if (density <= 0)
                    continue;
                const x = MARGIN.left + ix * cellWidth;
                const y = MARGIN.top + (this.binCount - 1 - iy) * cellHeight;
                bins.push({
                    key: `${ix}-${iy}`,
                    density,
                    x,
                    y,
                    width: Math.max(cellWidth - 1, 1),
                    height: Math.max(cellHeight - 1, 1),
                    cx: x + cellWidth / 2,
                    cy: y + cellHeight / 2,
                    x0: this.xMin + (ix / this.binCount) * (this.xMax - this.xMin),
                    x1: this.xMin + ((ix + 1) / this.binCount) * (this.xMax - this.xMin),
                    y0: this.yMin + (iy / this.binCount) * (this.yMax - this.yMin),
                    y1: this.yMin + ((iy + 1) / this.binCount) * (this.yMax - this.yMin),
                    tone: toneForDensity(density, densityMax),
                });
            }
        }
        return { bins, densityMax };
    }
    get binCells() {
        return this.layout.bins;
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
    get dataValueItems() {
        return this.binCells.map((bin) => `[${formatTickLabel(bin.x0)}–${formatTickLabel(bin.x1)}] × [${formatTickLabel(bin.y0)}–${formatTickLabel(bin.y1)}]: ${bin.density}`);
    }
    get hasLegend() {
        return this.binCells.length > 0;
    }
    get hoveredCell() {
        return this.hoveredKey !== null ? this.binCells.find((bin) => bin.key === this.hoveredKey) ?? null : null;
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
        return cell ? `[${formatTickLabel(cell.x0)}–${formatTickLabel(cell.x1)}] × [${formatTickLabel(cell.y0)}–${formatTickLabel(cell.y1)}]` : "";
    }
    get tooltipValue() {
        const cell = this.hoveredCell;
        return cell ? String(cell.density) : "";
    }
    formatTick(value) {
        return formatTickLabel(value);
    }
    cellClass(key, tone) {
        return classNames("st-density2DChart__cell", `st-density2DChart__cell--${tone}`, this.hoveredKey !== null && this.hoveredKey !== key ? "st-density2DChart__cell--dim" : undefined);
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Density2DChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Density2DChart, isStandalone: true, selector: "st-density2-d-chart", inputs: { data: "data", bins: "bins", scale: "scale", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-density2DChart__visual"
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
          <text
            *ngFor="let tick of yAxisTicks"
            class="st-density2DChart__tickLabel"
            [attr.x]="margin.left - 8"
            [attr.y]="tick.y"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ formatTick(tick.value) }}</text>

          <text
            *ngFor="let tick of xAxisTicks"
            class="st-density2DChart__tickLabel"
            [attr.x]="tick.x"
            [attr.y]="resolvedHeight - margin.bottom + 16"
            text-anchor="middle"
          >{{ formatTick(tick.value) }}</text>

          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>

          <rect
            *ngFor="let cell of binCells"
            [attr.class]="cellClass(cell.key, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            [attr.data-chart-key]="cell.key"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'density') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-density2DChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-density2DChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-density2DChart__tooltipValue">{{ tooltipValue }}</span>
      </div>

      <div class="st-density2DChart__legend" aria-hidden="true" [style.display]="hasLegend ? 'flex' : 'none'">
        <span class="st-density2DChart__legendText">Low</span>
        <span class="st-density2DChart__legendRamp">
          <span
            *ngFor="let tone of tones"
            [attr.class]="'st-density2DChart__legendSwatch st-density2DChart__legendSwatch--' + tone"
          ></span>
        </span>
        <span class="st-density2DChart__legendText">High</span>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Density2DChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-density2-d-chart",
                    standalone: true,
                    imports: [NgFor],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-density2DChart__visual"
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
          <text
            *ngFor="let tick of yAxisTicks"
            class="st-density2DChart__tickLabel"
            [attr.x]="margin.left - 8"
            [attr.y]="tick.y"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ formatTick(tick.value) }}</text>

          <text
            *ngFor="let tick of xAxisTicks"
            class="st-density2DChart__tickLabel"
            [attr.x]="tick.x"
            [attr.y]="resolvedHeight - margin.bottom + 16"
            text-anchor="middle"
          >{{ formatTick(tick.value) }}</text>

          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>

          <rect
            *ngFor="let cell of binCells"
            [attr.class]="cellClass(cell.key, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            [attr.data-chart-key]="cell.key"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'density') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-density2DChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-density2DChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-density2DChart__tooltipValue">{{ tooltipValue }}</span>
      </div>

      <div class="st-density2DChart__legend" aria-hidden="true" [style.display]="hasLegend ? 'flex' : 'none'">
        <span class="st-density2DChart__legendText">Low</span>
        <span class="st-density2DChart__legendRamp">
          <span
            *ngFor="let tone of tones"
            [attr.class]="'st-density2DChart__legendSwatch st-density2DChart__legendSwatch--' + tone"
          ></span>
        </span>
        <span class="st-density2DChart__legendText">High</span>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], bins: [{
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
//# sourceMappingURL=Density2DChart.js.map