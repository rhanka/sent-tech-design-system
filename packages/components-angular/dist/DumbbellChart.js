import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";
import * as i0 from "@angular/core";
const DB_MARGIN = { top: 16, right: 20, bottom: 32, left: 96 };
const DOT_RADIUS = 5;
export class DumbbellChart {
    static stComponentName = "DumbbellChart";
    componentName = "DumbbellChart";
    MARGIN_LEFT = DB_MARGIN.left;
    MARGIN_RIGHT = DB_MARGIN.right;
    MARGIN_TOP = DB_MARGIN.top;
    MARGIN_BOTTOM = DB_MARGIN.bottom;
    DOT_RADIUS = DOT_RADIUS;
    hoveredIndex = null;
    data = [];
    width;
    height;
    lowTone;
    highTone;
    lowLabel;
    highLabel;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-dumbbellChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 240;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() {
        return Math.max(this.widthValue - DB_MARGIN.left - DB_MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - DB_MARGIN.top - DB_MARGIN.bottom, 1);
    }
    get lowToneValue() {
        return this.lowTone ?? "category1";
    }
    get highToneValue() {
        return this.highTone ?? "category2";
    }
    get lowLabelValue() {
        return this.lowLabel ?? "Bas";
    }
    get highLabelValue() {
        return this.highLabel ?? "Haut";
    }
    normalize(d) {
        if (!Number.isFinite(d.low) || !Number.isFinite(d.high))
            return null;
        return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
    }
    get validData() {
        return this.data.filter((d) => this.normalize(d) !== null);
    }
    get dataValueItems() {
        return this.validData.map((d) => {
            const r = this.normalize(d);
            return `${d.category}: ${r.lo} – ${r.hi}`;
        });
    }
    get xTicks() {
        if (this.validData.length === 0)
            return [0];
        const lows = this.validData.map((d) => this.normalize(d).lo);
        const highs = this.validData.map((d) => this.normalize(d).hi);
        const minRaw = Math.min(...lows);
        const maxRaw = Math.max(...highs);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        return niceTicks(minRaw - padded, maxRaw + padded, 5);
    }
    get xDomain() {
        if (this.xTicks.length === 0)
            return { min: 0, max: 1 };
        return { min: this.xTicks[0], max: this.xTicks[this.xTicks.length - 1] };
    }
    get rows() {
        if (this.validData.length === 0)
            return [];
        const band = this.plotHeight / this.validData.length;
        return this.validData.map((d, i) => {
            const r = this.normalize(d);
            const cy = DB_MARGIN.top + band * (i + 0.5);
            const xLow = DB_MARGIN.left + scaleLinear(r.lo, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
            const xHigh = DB_MARGIN.left + scaleLinear(r.hi, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
            return { datum: d, range: r, cy, xLow, xHigh, index: i };
        });
    }
    get gridLines() {
        return this.xTicks.map((tick) => ({
            value: tick,
            x: DB_MARGIN.left + scaleLinear(tick, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
        }));
    }
    get legendEntries() {
        return [
            { label: this.lowLabelValue, shape: "circle", tone: this.lowToneValue },
            { label: this.highLabelValue, shape: "circle", tone: this.highToneValue },
        ];
    }
    get dotLowClass() {
        return `st-dumbbellChart__dot st-dumbbellChart__dot--low st-dumbbellChart__dot--${this.lowToneValue}`;
    }
    get dotHighClass() {
        return `st-dumbbellChart__dot st-dumbbellChart__dot--high st-dumbbellChart__dot--${this.highToneValue}`;
    }
    get hoveredRow() {
        return this.hoveredIndex !== null ? (this.rows[this.hoveredIndex] ?? null) : null;
    }
    formatTickLabel(v) {
        return formatTick(v);
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    handlePointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DumbbellChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DumbbellChart, isStandalone: true, selector: "st-dumbbell-chart", inputs: { data: "data", width: "width", height: "height", lowTone: "lowTone", highTone: "highTone", lowLabel: "lowLabel", highLabel: "highLabel", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-dumbbellChart__visual"
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
          @for (g of gridLines; track g.value) {
            <line class="st-dumbbellChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
            <text class="st-dumbbellChart__tickLabel" [attr.x]="g.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (row of rows; track row.index) {
            <text class="st-dumbbellChart__categoryLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="row.cy" text-anchor="end" dominant-baseline="middle">{{ row.datum.category }}</text>
            <line class="st-dumbbellChart__connector" [attr.x1]="row.xLow" [attr.x2]="row.xHigh" [attr.y1]="row.cy" [attr.y2]="row.cy"></line>
            <circle [class]="dotLowClass" [attr.cx]="row.xLow" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
            <circle [class]="dotHighClass" [attr.cx]="row.xHigh" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
          }
        </svg>
        <st-graph-legend class="st-dumbbellChart__legend" [entries]="legendEntries"></st-graph-legend>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRow; as row) {
        <div
          class="st-dumbbellChart__tooltip"
          role="presentation"
          [style.left]="((row.xLow + row.xHigh) / 2 / widthValue * 100) + '%'"
          [style.top]="(row.cy / heightValue * 100) + '%'"
        >
          <span class="st-dumbbellChart__tooltipLabel">{{ row.datum.category }}</span>
          <span class="st-dumbbellChart__tooltipValue">{{ row.range.lo }} – {{ row.range.hi }}</span>
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: GraphLegend, selector: "st-graph-legend", inputs: ["entries", "title", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DumbbellChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dumbbell-chart",
                    standalone: true,
                    imports: [GraphLegend],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-dumbbellChart__visual"
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
          @for (g of gridLines; track g.value) {
            <line class="st-dumbbellChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
            <text class="st-dumbbellChart__tickLabel" [attr.x]="g.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (row of rows; track row.index) {
            <text class="st-dumbbellChart__categoryLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="row.cy" text-anchor="end" dominant-baseline="middle">{{ row.datum.category }}</text>
            <line class="st-dumbbellChart__connector" [attr.x1]="row.xLow" [attr.x2]="row.xHigh" [attr.y1]="row.cy" [attr.y2]="row.cy"></line>
            <circle [class]="dotLowClass" [attr.cx]="row.xLow" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
            <circle [class]="dotHighClass" [attr.cx]="row.xHigh" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
          }
        </svg>
        <st-graph-legend class="st-dumbbellChart__legend" [entries]="legendEntries"></st-graph-legend>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRow; as row) {
        <div
          class="st-dumbbellChart__tooltip"
          role="presentation"
          [style.left]="((row.xLow + row.xHigh) / 2 / widthValue * 100) + '%'"
          [style.top]="(row.cy / heightValue * 100) + '%'"
        >
          <span class="st-dumbbellChart__tooltipLabel">{{ row.datum.category }}</span>
          <span class="st-dumbbellChart__tooltipValue">{{ row.range.lo }} – {{ row.range.hi }}</span>
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
            }], lowTone: [{
                type: NgInput
            }], highTone: [{
                type: NgInput
            }], lowLabel: [{
                type: NgInput
            }], highLabel: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DumbbellChart.js.map