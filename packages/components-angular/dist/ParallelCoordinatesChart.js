import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];
const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };
export class ParallelCoordinatesChart {
    static stComponentName = "ParallelCoordinatesChart";
    componentName = "ParallelCoordinatesChart";
    margin = MARGIN;
    hoveredIndex = null;
    axes = [];
    data = [];
    label = "";
    tones;
    width;
    height;
    classInput;
    get hostClass() { return classNames("st-parallelCoordinatesChart", this.classInput); }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 300; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    axisDomain(axis) {
        const vals = (this.data ?? []).map((d) => {
            const raw = d[axis.key];
            if (typeof raw === "number")
                return Number.isFinite(raw) ? raw : null;
            if (typeof raw === "string" && raw !== "") {
                const n = Number(raw);
                return Number.isFinite(n) ? n : null;
            }
            return null;
        }).filter((v) => v !== null);
        const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
        const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
        const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;
        return { min: Number.isFinite(axis.min) ? axis.min : rawMin, max: Number.isFinite(axis.max) ? axis.max : safeMax };
    }
    axisXPositions() {
        const axes = this.axes ?? [];
        return axes.map((_, i) => MARGIN.left + (axes.length <= 1 ? this.plotWidth / 2 : (i / (axes.length - 1)) * this.plotWidth));
    }
    parseStrictFinite(raw) {
        if (typeof raw === "number")
            return Number.isFinite(raw) ? raw : null;
        if (typeof raw === "string" && raw !== "") {
            const n = Number(raw);
            return Number.isFinite(n) ? n : null;
        }
        return null;
    }
    buildPathWithGaps(points) {
        const parts = [];
        let segment = [];
        for (const pt of points) {
            if (pt === null) {
                if (segment.length > 0) {
                    parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
                    segment = [];
                }
            }
            else {
                segment.push(pt);
            }
        }
        if (segment.length > 0)
            parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
        return parts.join(" ");
    }
    get lines() {
        const axisX = this.axisXPositions();
        const axes = this.axes ?? [];
        return (this.data ?? []).map((row, ri) => {
            const rowTone = (this.tones ?? [])[ri] ?? TONES[ri % TONES.length];
            const points = axes.map((axis, ai) => {
                const domain = this.axisDomain(axis);
                const val = this.parseStrictFinite(row[axis.key]);
                if (val === null)
                    return null;
                const clamped = Math.min(Math.max(val, domain.min), domain.max);
                const t = domain.max === domain.min ? 0.5 : (clamped - domain.min) / (domain.max - domain.min);
                return { x: axisX[ai], y: MARGIN.top + (1 - t) * this.plotHeight };
            });
            return { points, tone: rowTone, index: ri, path: this.buildPathWithGaps(points) };
        });
    }
    get axisGeoms() {
        const axisX = this.axisXPositions();
        return (this.axes ?? []).map((axis, ai) => {
            const domain = this.axisDomain(axis);
            return { key: axis.key, label: axis.label, ax: axisX[ai], domainMin: domain.min, domainMax: domain.max };
        });
    }
    get dataValueItems() {
        return (this.data ?? []).map((row) => (this.axes ?? []).map((axis) => `${axis.label}: ${row[axis.key] ?? ""}`).join(", "));
    }
    lineClass(line) {
        return classNames("st-parallelCoordinatesChart__line", `st-parallelCoordinatesChart__line--${line.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== line.index && "st-parallelCoordinatesChart__line--dim", this.hoveredIndex === line.index && "st-parallelCoordinatesChart__line--active");
    }
    fmtTick(v) {
        if (Math.abs(v) >= 1000)
            return `${(v / 1000).toFixed(1)}k`;
        return Number.isInteger(v) ? String(v) : v.toFixed(1);
    }
    handleLeave() { this.hoveredIndex = null; }
    handlePointerMove(event) {
        const target = event.target;
        const idx = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ParallelCoordinatesChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ParallelCoordinatesChart, isStandalone: true, selector: "st-parallel-coordinates-chart", inputs: { axes: "axes", data: "data", label: "label", tones: "tones", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ParallelCoordinatesChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { axes: [{
                type: NgInput
            }], data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], tones: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ParallelCoordinatesChart.js.map