import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 };
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
function uniqueInOrder(values) {
    const seen = new Set();
    const out = [];
    for (const value of values) {
        if (!seen.has(value)) {
            seen.add(value);
            out.push(value);
        }
    }
    return out;
}
function normalizedScale(value) {
    return value === "sequential" ? "sequential" : "categorical";
}
function toneForValue(value, min, max) {
    if (!Number.isFinite(value) || max <= min)
        return "category1";
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
    return TONES[index];
}
export class HeatmapChart {
    static stComponentName = "HeatmapChart";
    componentName = "HeatmapChart";
    margin = MARGIN;
    tones = TONES;
    data = [];
    width;
    height;
    scale;
    legend;
    label;
    classInput;
    hoveredIndex = null;
    get resolvedScale() {
        return normalizedScale(this.scale);
    }
    get resolvedWidth() {
        return this.width ?? 480;
    }
    get resolvedHeight() {
        return this.height ?? 300;
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
    }
    get hostClass() {
        return classNames("st-heatmapChart", `st-heatmapChart--${this.resolvedScale}`, this.classInput);
    }
    get xLabels() {
        return uniqueInOrder((this.data ?? []).map((d) => d.x));
    }
    get yLabels() {
        return uniqueInOrder((this.data ?? []).map((d) => d.y));
    }
    get plotWidth() {
        return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
    }
    get cells() {
        const data = this.data ?? [];
        const xLabels = this.xLabels;
        const yLabels = this.yLabels;
        const cellWidth = xLabels.length > 0 ? this.plotWidth / xLabels.length : this.plotWidth;
        const cellHeight = yLabels.length > 0 ? this.plotHeight / yLabels.length : this.plotHeight;
        const values = data.map((d) => d.value).filter(Number.isFinite);
        const min = values.length > 0 ? Math.min(...values) : 0;
        const max = values.length > 0 ? Math.max(...values) : 1;
        return data.map((datum) => {
            const xIndex = Math.max(0, xLabels.indexOf(datum.x));
            const yIndex = Math.max(0, yLabels.indexOf(datum.y));
            const x = MARGIN.left + xIndex * cellWidth;
            const y = MARGIN.top + yIndex * cellHeight;
            return {
                datum,
                tone: this.resolvedScale === "sequential" ? toneForValue(datum.value, min, max) : datum.tone ?? toneForValue(datum.value, min, max),
                x,
                y,
                width: Math.max(cellWidth - 2, 1),
                height: Math.max(cellHeight - 2, 1),
                cx: x + cellWidth / 2,
                cy: y + cellHeight / 2,
            };
        });
    }
    get dataValueItems() {
        return (this.data ?? []).map((d) => `${d.y}, ${d.x}: ${d.value}`);
    }
    get hoveredCell() {
        return this.hoveredIndex !== null ? this.cells[this.hoveredIndex] : undefined;
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
        return cell ? `${cell.datum.y}, ${cell.datum.x}` : "";
    }
    get tooltipValue() {
        const cell = this.hoveredCell;
        return cell ? String(cell.datum.value) : "";
    }
    maxCount(value) {
        return Math.max(value, 1);
    }
    cellClass(index, tone) {
        return classNames("st-heatmapChart__cell", `st-heatmapChart__cell--${tone}`, this.hoveredIndex !== null && this.hoveredIndex !== index ? "st-heatmapChart__cell--dim" : undefined);
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredIndex = null;
            return;
        }
        const index = Number(target.getAttribute("data-chart-index"));
        this.hoveredIndex = Number.isInteger(index) ? index : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HeatmapChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: HeatmapChart, isStandalone: true, selector: "st-heatmap-chart", inputs: { data: "data", width: "width", height: "height", scale: "scale", legend: "legend", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-heatmapChart__visual"
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
          <text
            *ngFor="let yLabel of yLabels; let row = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y"
            [attr.x]="margin.left - 8"
            [attr.y]="margin.top + (row + 0.5) * (plotHeight / maxCount(yLabels.length))"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ yLabel }}</text>

          <text
            *ngFor="let xLabel of xLabels; let column = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x"
            [attr.x]="margin.left + (column + 0.5) * (plotWidth / maxCount(xLabels.length))"
            [attr.y]="resolvedHeight - margin.bottom + 20"
            text-anchor="middle"
          >{{ xLabel }}</text>

          <rect
            class="st-heatmapChart__plot"
            [attr.x]="margin.left"
            [attr.y]="margin.top"
            [attr.width]="plotWidth"
            [attr.height]="plotHeight"
          ></rect>

          <rect
            *ngFor="let cell of cells; let i = index"
            [attr.class]="cellClass(i, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            rx="2"
            [attr.data-chart-index]="i"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-heatmapChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-heatmapChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-heatmapChart__tooltipValue">{{ tooltipValue }}</span>
      </div>

      <div class="st-heatmapChart__legend" aria-hidden="true" [style.display]="legend ? 'flex' : 'none'">
        <span class="st-heatmapChart__legendText">Low</span>
        <span class="st-heatmapChart__legendRamp">
          <span
            *ngFor="let tone of tones"
            [attr.class]="'st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--' + tone"
          ></span>
        </span>
        <span class="st-heatmapChart__legendText">High</span>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HeatmapChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-heatmap-chart",
                    standalone: true,
                    imports: [NgFor],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-heatmapChart__visual"
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
          <text
            *ngFor="let yLabel of yLabels; let row = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y"
            [attr.x]="margin.left - 8"
            [attr.y]="margin.top + (row + 0.5) * (plotHeight / maxCount(yLabels.length))"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ yLabel }}</text>

          <text
            *ngFor="let xLabel of xLabels; let column = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x"
            [attr.x]="margin.left + (column + 0.5) * (plotWidth / maxCount(xLabels.length))"
            [attr.y]="resolvedHeight - margin.bottom + 20"
            text-anchor="middle"
          >{{ xLabel }}</text>

          <rect
            class="st-heatmapChart__plot"
            [attr.x]="margin.left"
            [attr.y]="margin.top"
            [attr.width]="plotWidth"
            [attr.height]="plotHeight"
          ></rect>

          <rect
            *ngFor="let cell of cells; let i = index"
            [attr.class]="cellClass(i, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            rx="2"
            [attr.data-chart-index]="i"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-heatmapChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-heatmapChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-heatmapChart__tooltipValue">{{ tooltipValue }}</span>
      </div>

      <div class="st-heatmapChart__legend" aria-hidden="true" [style.display]="legend ? 'flex' : 'none'">
        <span class="st-heatmapChart__legendText">Low</span>
        <span class="st-heatmapChart__legendRamp">
          <span
            *ngFor="let tone of tones"
            [attr.class]="'st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--' + tone"
          ></span>
        </span>
        <span class="st-heatmapChart__legendText">High</span>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], scale: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=HeatmapChart.js.map