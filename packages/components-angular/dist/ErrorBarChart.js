import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 20, bottom: 32, left: 96 };
const MARKER_RADIUS = 4;
const CAP_HALF = 5;
export class ErrorBarChart {
    static stComponentName = "ErrorBarChart";
    componentName = "ErrorBarChart";
    MARGIN = MARGIN;
    MARKER_RADIUS = MARKER_RADIUS;
    CAP_HALF = CAP_HALF;
    hoveredIndex = null;
    data = [];
    width;
    height;
    tone;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-errorBarChart", this.classInput);
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
    get toneValue() {
        return this.tone ?? "category1";
    }
    get plotWidth() {
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    normalize(d) {
        if (!Number.isFinite(d.value) || !Number.isFinite(d.low) || !Number.isFinite(d.high))
            return null;
        const lo = Math.min(d.low, d.high);
        const hi = Math.max(d.low, d.high);
        const mid = Math.min(hi, Math.max(lo, d.value));
        return { lo, mid, hi };
    }
    get validData() {
        return (this.data ?? []).filter((d) => this.normalize(d) !== null);
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
            const cy = MARGIN.top + band * (i + 0.5);
            const xLow = MARGIN.left + scaleLinear(r.lo, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
            const xMid = MARGIN.left + scaleLinear(r.mid, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
            const xHigh = MARGIN.left + scaleLinear(r.hi, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
            return { datum: d, range: r, cy, xLow, xMid, xHigh, index: i };
        });
    }
    get gridLines() {
        return this.xTicks.map((tick) => ({
            value: tick,
            x: MARGIN.left + scaleLinear(tick, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
        }));
    }
    get legendEntries() {
        return [{ label: this.label, shape: "circle", tone: this.toneValue }];
    }
    get dataValueItems() {
        return this.validData.map((d) => {
            const r = this.normalize(d);
            return `${d.category}: ${r.mid} (${r.lo} – ${r.hi})`;
        });
    }
    get hoveredRow() {
        if (this.hoveredIndex === null)
            return null;
        return this.rows[this.hoveredIndex] ?? null;
    }
    fmtTick(v) {
        return formatTick(v);
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const attr = target?.getAttribute("data-chart-index");
        if (attr != null) {
            const idx = Number(attr);
            if (Number.isInteger(idx)) {
                this.hoveredIndex = idx;
                return;
            }
        }
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorBarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ErrorBarChart, isStandalone: true, selector: "st-error-bar-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-errorBarChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
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
            <line class="st-errorBarChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
            <text class="st-errorBarChart__tickLabel" [attr.x]="g.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ fmtTick(g.value) }}</text>
          }

          <line class="st-errorBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-errorBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (row of rows; track row.index) {
            <text
              class="st-errorBarChart__categoryLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="row.cy"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ row.datum.category }}</text>
            <line
              [class]="'st-errorBarChart__whisker st-errorBarChart__whisker--' + toneValue"
              [attr.x1]="row.xLow"
              [attr.x2]="row.xHigh"
              [attr.y1]="row.cy"
              [attr.y2]="row.cy"
            ></line>
            <line
              [class]="'st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--' + toneValue"
              [attr.x1]="row.xLow"
              [attr.x2]="row.xLow"
              [attr.y1]="row.cy - CAP_HALF"
              [attr.y2]="row.cy + CAP_HALF"
            ></line>
            <line
              [class]="'st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--' + toneValue"
              [attr.x1]="row.xHigh"
              [attr.x2]="row.xHigh"
              [attr.y1]="row.cy - CAP_HALF"
              [attr.y2]="row.cy + CAP_HALF"
            ></line>
            <circle
              [class]="'st-errorBarChart__marker st-errorBarChart__marker--' + toneValue"
              [attr.cx]="row.xMid"
              [attr.cy]="row.cy"
              [attr.r]="MARKER_RADIUS"
              [attr.data-chart-index]="row.index"
            ></circle>
          }
        </svg>
        <st-graph-legend class="st-errorBarChart__legend" [entries]="legendEntries"></st-graph-legend>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRow; as row) {
        <div
          class="st-errorBarChart__tooltip"
          role="presentation"
          [style.left.%]="(row.xMid / widthValue) * 100"
          [style.top.%]="(row.cy / heightValue) * 100"
        >
          <span class="st-errorBarChart__tooltipLabel">{{ row.datum.category }}</span>
          <span class="st-errorBarChart__tooltipValue">{{ row.range.mid }} ({{ row.range.lo }} – {{ row.range.hi }})</span>
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: GraphLegend, selector: "st-graph-legend", inputs: ["entries", "title", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ErrorBarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-error-bar-chart",
                    standalone: true,
                    imports: [GraphLegend],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-errorBarChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
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
            <line class="st-errorBarChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
            <text class="st-errorBarChart__tickLabel" [attr.x]="g.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ fmtTick(g.value) }}</text>
          }

          <line class="st-errorBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-errorBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (row of rows; track row.index) {
            <text
              class="st-errorBarChart__categoryLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="row.cy"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ row.datum.category }}</text>
            <line
              [class]="'st-errorBarChart__whisker st-errorBarChart__whisker--' + toneValue"
              [attr.x1]="row.xLow"
              [attr.x2]="row.xHigh"
              [attr.y1]="row.cy"
              [attr.y2]="row.cy"
            ></line>
            <line
              [class]="'st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--' + toneValue"
              [attr.x1]="row.xLow"
              [attr.x2]="row.xLow"
              [attr.y1]="row.cy - CAP_HALF"
              [attr.y2]="row.cy + CAP_HALF"
            ></line>
            <line
              [class]="'st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--' + toneValue"
              [attr.x1]="row.xHigh"
              [attr.x2]="row.xHigh"
              [attr.y1]="row.cy - CAP_HALF"
              [attr.y2]="row.cy + CAP_HALF"
            ></line>
            <circle
              [class]="'st-errorBarChart__marker st-errorBarChart__marker--' + toneValue"
              [attr.cx]="row.xMid"
              [attr.cy]="row.cy"
              [attr.r]="MARKER_RADIUS"
              [attr.data-chart-index]="row.index"
            ></circle>
          }
        </svg>
        <st-graph-legend class="st-errorBarChart__legend" [entries]="legendEntries"></st-graph-legend>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRow; as row) {
        <div
          class="st-errorBarChart__tooltip"
          role="presentation"
          [style.left.%]="(row.xMid / widthValue) * 100"
          [style.top.%]="(row.cy / heightValue) * 100"
        >
          <span class="st-errorBarChart__tooltipLabel">{{ row.datum.category }}</span>
          <span class="st-errorBarChart__tooltipValue">{{ row.range.mid }} ({{ row.range.lo }} – {{ row.range.hi }})</span>
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
//# sourceMappingURL=ErrorBarChart.js.map