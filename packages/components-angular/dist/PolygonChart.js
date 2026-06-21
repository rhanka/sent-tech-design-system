import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 };
export class PolygonChart {
    static stComponentName = "PolygonChart";
    componentName = "PolygonChart";
    margin = MARGIN;
    hoveredIndex = null;
    data = [];
    label = "";
    tone = "category1";
    width;
    height;
    classInput;
    get hostClass() { return classNames("st-polygonChart", this.classInput); }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 360; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get validData() {
        return (this.data ?? []).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));
    }
    get scales() {
        const xs = this.validData.map((d) => d.x);
        const ys = this.validData.map((d) => d.y);
        const xTicks = xs.length > 0 ? niceTicks(Math.min(...xs), Math.max(...xs)) : [0, 1];
        const yTicks = ys.length > 0 ? niceTicks(Math.min(...ys), Math.max(...ys)) : [0, 1];
        const plotW = Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
        const plotH = Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
        return { xTicks, yTicks, xMin: xTicks[0], xMax: xTicks[xTicks.length - 1], yMin: yTicks[0], yMax: yTicks[yTicks.length - 1], plotW, plotH };
    }
    get points() {
        const { xMin, xMax, yMin, yMax, plotW, plotH } = this.scales;
        return this.validData.map((d, i) => ({
            cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
            cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
            datum: d, index: i,
        }));
    }
    get polygonPointsStr() { return this.points.map((p) => `${p.cx},${p.cy}`).join(" "); }
    get polygonClass() { return `st-polygonChart__polygon st-polygonChart__polygon--${this.tone}`; }
    get vertexClass() { return `st-polygonChart__vertex st-polygonChart__vertex--${this.tone}`; }
    get dataValueItems() { return this.validData.map((d) => `x ${d.x}, y ${d.y}`); }
    get hoveredPoint() {
        return this.hoveredIndex !== null ? (this.points[this.hoveredIndex] ?? null) : null;
    }
    xPixel(t) {
        return MARGIN.left + scaleLinear(t, this.scales.xMin, this.scales.xMax, 0, this.scales.plotW);
    }
    yPixel(t) {
        return MARGIN.top + scaleLinear(t, this.scales.yMin, this.scales.yMax, this.scales.plotH, 0);
    }
    fmtTick(v) {
        if (Math.abs(v) >= 1000)
            return String(Math.round(v / 1000)) + "k";
        return Number.isInteger(v) ? String(v) : v.toFixed(1);
    }
    tooltipLeft() { const p = this.hoveredPoint; return p ? `${(p.cx / this.widthValue) * 100}%` : "0%"; }
    tooltipTop() { const p = this.hoveredPoint; return p ? `${(p.cy / this.heightValue) * 100}%` : "0%"; }
    handleLeave() { this.hoveredIndex = null; }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && raw >= 0 && raw < this.points.length ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PolygonChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: PolygonChart, isStandalone: true, selector: "st-polygon-chart", inputs: { data: "data", label: "label", tone: "tone", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-polygonChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handleVisualPointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          @for (t of scales.yTicks; track t) {
            <line class="st-polygonChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="yPixel(t)" [attr.y2]="yPixel(t)"></line>
            <text class="st-polygonChart__tick" [attr.x]="margin.left - 6" [attr.y]="yPixel(t)" text-anchor="end" dominant-baseline="middle">{{ fmtTick(t) }}</text>
          }
          @for (t of scales.xTicks; track t) {
            <text class="st-polygonChart__tick" [attr.x]="xPixel(t)" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ fmtTick(t) }}</text>
          }
          <line class="st-polygonChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-polygonChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @if (points.length >= 2) {
            <polygon [class]="polygonClass" [attr.points]="polygonPointsStr"></polygon>
          }
          @for (p of points; track p.index) {
            <circle [class]="vertexClass" [attr.cx]="p.cx" [attr.cy]="p.cy" r="3.5" [attr.data-chart-index]="p.index"></circle>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredPoint) {
        <div class="st-polygonChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-polygonChart__tooltipValue">x {{ hoveredPoint.datum.x }} · y {{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: PolygonChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-polygon-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-polygonChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handleVisualPointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          @for (t of scales.yTicks; track t) {
            <line class="st-polygonChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="yPixel(t)" [attr.y2]="yPixel(t)"></line>
            <text class="st-polygonChart__tick" [attr.x]="margin.left - 6" [attr.y]="yPixel(t)" text-anchor="end" dominant-baseline="middle">{{ fmtTick(t) }}</text>
          }
          @for (t of scales.xTicks; track t) {
            <text class="st-polygonChart__tick" [attr.x]="xPixel(t)" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ fmtTick(t) }}</text>
          }
          <line class="st-polygonChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-polygonChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @if (points.length >= 2) {
            <polygon [class]="polygonClass" [attr.points]="polygonPointsStr"></polygon>
          }
          @for (p of points; track p.index) {
            <circle [class]="vertexClass" [attr.cx]="p.cx" [attr.cy]="p.cy" r="3.5" [attr.data-chart-index]="p.index"></circle>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredPoint) {
        <div class="st-polygonChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-polygonChart__tooltipValue">x {{ hoveredPoint.datum.x }} · y {{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=PolygonChart.js.map