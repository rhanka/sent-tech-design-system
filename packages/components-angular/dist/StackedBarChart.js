import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 };
const TONES = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];
export class StackedBarChart {
    static stComponentName = "StackedBarChart";
    componentName = "StackedBarChart";
    MARGIN = MARGIN;
    data = [];
    width;
    height;
    label = "";
    showLegend;
    dataLabels;
    hiddenSeries;
    onToggleSeries;
    classInput;
    get hostClass() {
        return classNames("st-stackedBarChart", this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 240; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get safeData() { return this.data ?? []; }
    get hiddenSet() { return new Set(this.hiddenSeries ?? []); }
    get legendInteractive() {
        return typeof this.onToggleSeries === "function" || this.hiddenSeries !== undefined;
    }
    get dlEnabled() { return normalizeDataLabels(this.dataLabels).enabled; }
    get segmentLabels() {
        const seen = new Set();
        const result = [];
        for (const datum of this.safeData) {
            for (const seg of datum.segments) {
                if (!seen.has(seg.label)) {
                    seen.add(seg.label);
                    result.push(seg.label);
                }
            }
        }
        return result;
    }
    toneForLabel(label) {
        const idx = this.segmentLabels.indexOf(label);
        return TONES[idx % TONES.length] ?? "category1";
    }
    get columnTotals() {
        return this.safeData.map((datum) => datum.segments
            .filter((s) => !this.hiddenSet.has(s.label))
            .reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0));
    }
    get totalMax() {
        return Math.max(0, ...this.columnTotals);
    }
    get yTicks() {
        return niceTicks(0, this.totalMax, 5);
    }
    get yDomain() {
        const t = this.yTicks;
        return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
    }
    yPixel(y) {
        return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
    }
    get gridLines() {
        return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
    }
    get columns() {
        const n = this.safeData.length;
        if (n === 0)
            return [];
        const band = this.plotWidth / n;
        const barWidth = band * 0.62;
        const baselineY = this.yPixel(0);
        return this.safeData.map((datum, i) => {
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            const cx = MARGIN.left + band * (i + 0.5);
            const visibleSegs = datum.segments.filter((s) => !this.hiddenSet.has(s.label));
            let currentY = baselineY;
            const segments = visibleSegs
                .filter((s) => Number.isFinite(s.value) && s.value > 0)
                .map((s) => {
                const h = this.plotHeight * (s.value / Math.max(this.yDomain.max, 1));
                const y = currentY - h;
                currentY = y;
                return {
                    segLabel: s.label,
                    value: s.value,
                    tone: (s.tone ?? this.toneForLabel(s.label)),
                    y,
                    height: Math.max(h, 0.5),
                };
            });
            return { datum, x, cx, width: barWidth, segments };
        });
    }
    get legendItems() {
        return this.segmentLabels.map((label) => ({
            label,
            tone: this.toneForLabel(label),
        }));
    }
    get dataValueItems() {
        return this.safeData.flatMap((datum) => datum.segments
            .filter((s) => !this.hiddenSet.has(s.label))
            .map((s) => `${datum.label} / ${s.label}: ${s.value}`));
    }
    formatTick(v) { return formatTick(v); }
    formatDataLabel(v) { return formatTick(v); }
    toggleSeries(label) {
        this.onToggleSeries?.(label);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StackedBarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StackedBarChart, isStandalone: true, selector: "st-stacked-bar-chart", inputs: { data: "data", width: "width", height: "height", label: "label", showLegend: "showLegend", dataLabels: "dataLabels", hiddenSeries: "hiddenSeries", onToggleSeries: "onToggleSeries", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-stackedBarChart__visual" role="img" [attr.aria-label]="label">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stackedBarChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stackedBarChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (col of columns; track col.datum.label) {
            <text class="st-stackedBarChart__categoryLabel" [attr.x]="col.cx" [attr.y]="heightValue - MARGIN.bottom + 18" text-anchor="middle">{{ col.datum.label }}</text>
            @for (seg of col.segments; track seg.segLabel) {
              <rect
                [class]="'st-stackedBarChart__segment st-stackedBarChart__segment--' + seg.tone"
                [attr.x]="col.x"
                [attr.y]="seg.y"
                [attr.width]="col.width"
                [attr.height]="seg.height"
                rx="1"
              ></rect>
              @if (dlEnabled && seg.height > 14) {
                <text
                  class="st-stackedBarChart__dataLabel"
                  aria-hidden="true"
                  [attr.x]="col.cx"
                  [attr.y]="seg.y + seg.height / 2"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ formatDataLabel(seg.value) }}</text>
              }
            }
          }
        </svg>
      </div>

      @if (showLegend !== false && legendItems.length > 0) {
        <ul class="st-stackedBarChart__legend" [attr.aria-label]="'Légende de ' + label">
          @for (item of legendItems; track item.label) {
            @if (legendInteractive) {
              <li>
                <button
                  type="button"
                  [class]="'st-stackedBarChart__legendItem' + (hiddenSet.has(item.label) ? ' st-stackedBarChart__legendItem--off' : '')"
                  [attr.aria-pressed]="!hiddenSet.has(item.label)"
                  (click)="toggleSeries(item.label)"
                >
                  <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                  {{ item.label }}
                </button>
              </li>
            } @else {
              <li class="st-stackedBarChart__legendItem">
                <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                {{ item.label }}
              </li>
            }
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StackedBarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-stacked-bar-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-stackedBarChart__visual" role="img" [attr.aria-label]="label">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stackedBarChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stackedBarChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stackedBarChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (col of columns; track col.datum.label) {
            <text class="st-stackedBarChart__categoryLabel" [attr.x]="col.cx" [attr.y]="heightValue - MARGIN.bottom + 18" text-anchor="middle">{{ col.datum.label }}</text>
            @for (seg of col.segments; track seg.segLabel) {
              <rect
                [class]="'st-stackedBarChart__segment st-stackedBarChart__segment--' + seg.tone"
                [attr.x]="col.x"
                [attr.y]="seg.y"
                [attr.width]="col.width"
                [attr.height]="seg.height"
                rx="1"
              ></rect>
              @if (dlEnabled && seg.height > 14) {
                <text
                  class="st-stackedBarChart__dataLabel"
                  aria-hidden="true"
                  [attr.x]="col.cx"
                  [attr.y]="seg.y + seg.height / 2"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ formatDataLabel(seg.value) }}</text>
              }
            }
          }
        </svg>
      </div>

      @if (showLegend !== false && legendItems.length > 0) {
        <ul class="st-stackedBarChart__legend" [attr.aria-label]="'Légende de ' + label">
          @for (item of legendItems; track item.label) {
            @if (legendInteractive) {
              <li>
                <button
                  type="button"
                  [class]="'st-stackedBarChart__legendItem' + (hiddenSet.has(item.label) ? ' st-stackedBarChart__legendItem--off' : '')"
                  [attr.aria-pressed]="!hiddenSet.has(item.label)"
                  (click)="toggleSeries(item.label)"
                >
                  <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                  {{ item.label }}
                </button>
              </li>
            } @else {
              <li class="st-stackedBarChart__legendItem">
                <span [class]="'st-stackedBarChart__legendSwatch st-stackedBarChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                {{ item.label }}
              </li>
            }
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
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
            }], showLegend: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], hiddenSeries: [{
                type: NgInput
            }], onToggleSeries: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StackedBarChart.js.map