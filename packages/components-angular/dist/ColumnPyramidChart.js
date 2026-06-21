import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
export class ColumnPyramidChart {
    static stComponentName = "ColumnPyramidChart";
    componentName = "ColumnPyramidChart";
    margin = MARGIN;
    hoveredIndex = null;
    data = [];
    width;
    height;
    label = "";
    tone;
    classInput;
    get hostClass() {
        return classNames("st-columnPyramidChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 280;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() {
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    get defaultTone() {
        return this.tone ?? "category1";
    }
    get validData() {
        return this.data.filter((d) => Number.isFinite(d.value) && d.value > 0);
    }
    get ticks() {
        const values = this.validData.map((d) => d.value);
        const maxRaw = Math.max(0, ...values);
        return niceTicks(0, maxRaw, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? 1;
    }
    get valueAxisTicks() {
        return this.ticks.map((tick) => ({
            value: tick,
            x1: MARGIN.left,
            x2: MARGIN.left + this.plotWidth,
            y: MARGIN.top + scaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0),
        }));
    }
    get columns() {
        if (this.validData.length === 0)
            return [];
        const band = this.plotWidth / this.validData.length;
        const baseWidth = band * 0.7;
        const zeroY = MARGIN.top + scaleLinear(0, this.domainMin, this.domainMax, this.plotHeight, 0);
        return this.validData.map((d, i) => {
            const apexY = MARGIN.top + scaleLinear(d.value, this.domainMin, this.domainMax, this.plotHeight, 0);
            const cx = MARGIN.left + band * (i + 0.5);
            const leftX = cx - baseWidth / 2;
            const rightX = cx + baseWidth / 2;
            const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
            return {
                datum: d,
                tone: (d.tone ?? this.defaultTone),
                points,
                cx,
                cy: apexY,
                labelX: cx,
                labelY: this.heightValue - MARGIN.bottom + 16,
                index: i,
            };
        });
    }
    get dataValueItems() {
        return this.validData.map((d) => `${d.category}: ${d.value}`);
    }
    get hoveredColumn() {
        return this.hoveredIndex !== null ? (this.columns[this.hoveredIndex] ?? null) : null;
    }
    columnClass(col) {
        return classNames("st-columnPyramidChart__column", `st-columnPyramidChart__column--${col.tone}`);
    }
    formatTickLabel(value) {
        return formatTick(value);
    }
    tooltipLeftPct(col) {
        return `${(col.cx / this.widthValue) * 100}%`;
    }
    tooltipTopPct(col) {
        return `${(col.cy / this.heightValue) * 100}%`;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColumnPyramidChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ColumnPyramidChart, isStandalone: true, selector: "st-column-pyramid-chart", inputs: { data: "data", width: "width", height: "height", label: "label", tone: "tone", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-columnPyramidChart__visual"
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
          @for (tick of valueAxisTicks; track tick.value) {
            <line class="st-columnPyramidChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text
              class="st-columnPyramidChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (col of columns; track col.datum.category) {
            <text
              class="st-columnPyramidChart__categoryLabel"
              [attr.x]="col.labelX"
              [attr.y]="col.labelY"
              text-anchor="middle"
            >{{ col.datum.category }}</text>
          }

          @for (col of columns; track col.datum.category) {
            <polygon
              [class]="columnClass(col)"
              [attr.points]="col.points"
              [attr.data-chart-index]="col.index"
            ></polygon>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredColumn) {
        <div
          class="st-columnPyramidChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredColumn)"
          [style.top]="tooltipTopPct(hoveredColumn)"
        >
          <span class="st-columnPyramidChart__tooltipLabel">{{ hoveredColumn.datum.category }}</span>
          <span class="st-columnPyramidChart__tooltipValue">{{ hoveredColumn.datum.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ColumnPyramidChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-column-pyramid-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-columnPyramidChart__visual"
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
          @for (tick of valueAxisTicks; track tick.value) {
            <line class="st-columnPyramidChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text
              class="st-columnPyramidChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (col of columns; track col.datum.category) {
            <text
              class="st-columnPyramidChart__categoryLabel"
              [attr.x]="col.labelX"
              [attr.y]="col.labelY"
              text-anchor="middle"
            >{{ col.datum.category }}</text>
          }

          @for (col of columns; track col.datum.category) {
            <polygon
              [class]="columnClass(col)"
              [attr.points]="col.points"
              [attr.data-chart-index]="col.index"
            ></polygon>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredColumn) {
        <div
          class="st-columnPyramidChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredColumn)"
          [style.top]="tooltipTopPct(hoveredColumn)"
        >
          <span class="st-columnPyramidChart__tooltipLabel">{{ hoveredColumn.datum.category }}</span>
          <span class="st-columnPyramidChart__tooltipValue">{{ hoveredColumn.datum.value }}</span>
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
            }], label: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ColumnPyramidChart.js.map