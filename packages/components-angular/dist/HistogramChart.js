import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { scaleLinear, niceTicks } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 14, right: 16, bottom: 36, left: 44 };
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
export class HistogramChart {
    static stComponentName = "HistogramChart";
    componentName = "HistogramChart";
    MARGIN = MARGIN;
    hoveredIndex = null;
    data = [];
    bins;
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-histogramChart", this.classInput);
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
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    isNumberArray(values) {
        return values.every((value) => typeof value === "number");
    }
    formatNumber(value) {
        if (!Number.isFinite(value))
            return "0";
        if (Number.isInteger(value))
            return String(value);
        return value.toFixed(2).replace(/\.?0+$/, "");
    }
    buildNumericBins(values, count) {
        const finite = values.filter(Number.isFinite);
        if (finite.length === 0)
            return [];
        const binCount = Math.max(1, Math.floor(count));
        const min = Math.min(...finite);
        const max = Math.max(...finite);
        const step = max === min ? 1 : (max - min) / binCount;
        const out = Array.from({ length: binCount }, (_, index) => {
            const start = min + step * index;
            const end = index === binCount - 1 ? max : min + step * (index + 1);
            return {
                label: `${this.formatNumber(start)}-${this.formatNumber(end)}`,
                value: 0,
                tone: TONES[index % TONES.length] ?? "category1",
            };
        });
        for (const value of finite) {
            const index = value === max ? binCount - 1 : Math.max(0, Math.min(binCount - 1, Math.floor((value - min) / step)));
            out[index].value += 1;
        }
        return out;
    }
    get normalizedBins() {
        const safeData = this.data ?? [];
        if (this.isNumberArray(safeData)) {
            return this.buildNumericBins(safeData, this.bins ?? 10);
        }
        return safeData.map((datum, index) => ({
            label: datum.label,
            value: Number.isFinite(datum.value) ? datum.value : 0,
            tone: datum.tone ?? TONES[index % TONES.length] ?? "category1",
        }));
    }
    get bars() {
        const bins = this.normalizedBins;
        const maxValue = Math.max(0, ...bins.map((bin) => bin.value));
        const safeMax = maxValue > 0 ? maxValue : 1;
        const band = bins.length > 0 ? this.plotWidth / bins.length : this.plotWidth;
        const barWidth = Math.max(band * 0.68, 1);
        return bins.map((bin, index) => {
            const h = scaleLinear(bin.value, 0, safeMax, 0, this.plotHeight);
            return {
                bin,
                x: MARGIN.left + band * index + (band - barWidth) / 2,
                y: MARGIN.top + this.plotHeight - h,
                width: barWidth,
                height: Math.max(h, 0.5),
                labelX: MARGIN.left + band * (index + 0.5),
            };
        });
    }
    get dataValueItems() {
        return this.normalizedBins.map((bin) => `${bin.label}: ${bin.value}`);
    }
    barClass(bar, i) {
        return classNames("st-histogramChart__bar", `st-histogramChart__bar--${bar.bin.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== i && "st-histogramChart__bar--dim");
    }
    tooltipLeft(bar) {
        return (bar.labelX / this.widthValue) * 100;
    }
    tooltipTop(bar) {
        return (bar.y / this.heightValue) * 100;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HistogramChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: HistogramChart, isStandalone: true, selector: "st-histogram-chart", inputs: { data: "data", bins: "bins", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-histogramChart__visual"
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
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.bin.label; let i = $index) {
            <rect
              [class]="barClass(bar, i)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              [attr.data-chart-index]="i"
            ></rect>
            <text
              class="st-histogramChart__label"
              [attr.x]="bar.labelX"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ bar.bin.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-histogramChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bars[hoveredIndex])"
          [style.top.%]="tooltipTop(bars[hoveredIndex])"
        >
          <span class="st-histogramChart__tooltipLabel">{{ bars[hoveredIndex].bin.label }}</span>
          <span class="st-histogramChart__tooltipValue">{{ bars[hoveredIndex].bin.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HistogramChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-histogram-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-histogramChart__visual"
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
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.bin.label; let i = $index) {
            <rect
              [class]="barClass(bar, i)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              [attr.data-chart-index]="i"
            ></rect>
            <text
              class="st-histogramChart__label"
              [attr.x]="bar.labelX"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ bar.bin.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-histogramChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bars[hoveredIndex])"
          [style.top.%]="tooltipTop(bars[hoveredIndex])"
        >
          <span class="st-histogramChart__tooltipLabel">{{ bars[hoveredIndex].bin.label }}</span>
          <span class="st-histogramChart__tooltipValue">{{ bars[hoveredIndex].bin.value }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], bins: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=HistogramChart.js.map