import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, isNumeric, niceTicks, scaleLinear, } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
export class StepLineChart {
    static stComponentName = "StepLineChart";
    componentName = "StepLineChart";
    MARGIN = MARGIN;
    hoveredIndex = null;
    data = [];
    width;
    height;
    tone;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-stepLineChart", `st-stepLineChart--${this.tone ?? "category1"}`, this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 240; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get safeData() {
        return (this.data ?? []).filter((d) => Number.isFinite(d.y) && (typeof d.x === "string" || isNumeric(d.x)));
    }
    get xIsNumeric() {
        return this.safeData.every((d) => isNumeric(d.x));
    }
    get xDomain() {
        if (this.xIsNumeric) {
            const xs = this.safeData.map((d) => d.x);
            return { min: Math.min(...xs), max: Math.max(...xs) };
        }
        return { min: 0, max: Math.max(this.safeData.length - 1, 1) };
    }
    get yValues() { return this.safeData.map((d) => d.y).filter(Number.isFinite); }
    get yTicks() {
        if (this.yValues.length === 0)
            return [0];
        const minRaw = Math.min(...this.yValues);
        const maxRaw = Math.max(...this.yValues);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        return niceTicks(minRaw - padded, maxRaw + padded, 5);
    }
    get yDomain() {
        const t = this.yTicks;
        return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
    }
    xPixel(datum, index) {
        if (this.xIsNumeric) {
            return MARGIN.left + scaleLinear(datum.x, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
        }
        return MARGIN.left + (this.safeData.length <= 1 ? 0 : scaleLinear(index, 0, this.safeData.length - 1, 0, this.plotWidth));
    }
    yPixel(y) {
        return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
    }
    get points() {
        return this.safeData.map((datum, index) => ({
            x: this.xPixel(datum, index),
            y: this.yPixel(datum.y),
            datum,
            index,
        }));
    }
    get stepPath() {
        const pts = this.points;
        if (pts.length === 0)
            return "";
        if (pts.length === 1)
            return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
        let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
        for (let i = 1; i < pts.length; i++) {
            const cur = pts[i];
            const prev = pts[i - 1];
            d += ` L${cur.x.toFixed(2)},${prev.y.toFixed(2)} L${cur.x.toFixed(2)},${cur.y.toFixed(2)}`;
        }
        return d;
    }
    get gridLines() {
        return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
    }
    get xTickEntries() {
        return this.points.map((pt) => ({
            key: String(pt.datum.x),
            x: pt.x,
            label: String(pt.datum.x),
        }));
    }
    get dataValueItems() {
        return this.safeData.map((d) => `${d.x}: ${d.y}`);
    }
    formatTick(v) { return formatTick(v); }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StepLineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StepLineChart, isStandalone: true, selector: "st-step-line-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-stepLineChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stepLineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stepLineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-stepLineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (stepPath) {
            <path class="st-stepLineChart__line" [attr.d]="stepPath" fill="none"></path>
          }

          @for (pt of points; track pt.index) {
            <circle class="st-stepLineChart__dot" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" [attr.data-chart-index]="pt.index"></circle>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && points[hoveredIndex]) {
        <div
          class="st-stepLineChart__tooltip"
          role="presentation"
          [style.left]="(points[hoveredIndex].x / widthValue * 100) + '%'"
          [style.top]="(points[hoveredIndex].y / heightValue * 100) + '%'"
        >
          <span class="st-stepLineChart__tooltipLabel">{{ points[hoveredIndex].datum.x }}</span>
          <span class="st-stepLineChart__tooltipValue">{{ points[hoveredIndex].datum.y }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StepLineChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-step-line-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-stepLineChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stepLineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stepLineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-stepLineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (stepPath) {
            <path class="st-stepLineChart__line" [attr.d]="stepPath" fill="none"></path>
          }

          @for (pt of points; track pt.index) {
            <circle class="st-stepLineChart__dot" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" [attr.data-chart-index]="pt.index"></circle>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && points[hoveredIndex]) {
        <div
          class="st-stepLineChart__tooltip"
          role="presentation"
          [style.left]="(points[hoveredIndex].x / widthValue * 100) + '%'"
          [style.top]="(points[hoveredIndex].y / heightValue * 100) + '%'"
        >
          <span class="st-stepLineChart__tooltipLabel">{{ points[hoveredIndex].datum.x }}</span>
          <span class="st-stepLineChart__tooltipValue">{{ points[hoveredIndex].datum.y }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StepLineChart.js.map