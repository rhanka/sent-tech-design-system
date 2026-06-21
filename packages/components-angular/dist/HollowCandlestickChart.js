import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };
export class HollowCandlestickChart {
    static stComponentName = "HollowCandlestickChart";
    componentName = "HollowCandlestickChart";
    margin = MARGIN;
    hoveredIndex = null;
    data = [];
    label = "";
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-hollowCandlestickChart", this.classInput);
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
    get validData() {
        return this.data.filter((d) => Number.isFinite(d.open) &&
            Number.isFinite(d.high) &&
            Number.isFinite(d.low) &&
            Number.isFinite(d.close));
    }
    get ticks() {
        const allVals = [];
        for (const d of this.validData) {
            allVals.push(d.open, d.high, d.low, d.close);
        }
        if (allVals.length === 0)
            return [0, 1];
        const rawMin = Math.min(...allVals);
        const rawMax = Math.max(...allVals);
        const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;
        return niceTicks(rawMin, safeMax, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? 1;
    }
    get gridItems() {
        return this.ticks.map((tick) => ({
            tick,
            y: MARGIN.top + scaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0),
        }));
    }
    get candles() {
        if (this.validData.length === 0)
            return [];
        const band = this.plotWidth / this.validData.length;
        const bodyW = band * 0.55;
        return this.validData.map((d, i) => {
            const clampedHigh = Math.max(d.high, d.open, d.close);
            const clampedLow = Math.min(d.low, d.open, d.close);
            const prevClose = i > 0 ? this.validData[i - 1].close : d.open;
            const up = d.close >= prevClose;
            const hollow = d.close >= d.open;
            const centerX = MARGIN.left + band * i + band / 2;
            const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
            const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
            const highY = MARGIN.top + scaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
            const lowY = MARGIN.top + scaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);
            return {
                datum: d,
                index: i,
                up,
                hollow,
                centerX,
                bodyX: centerX - bodyW / 2,
                bodyY: bodyTop,
                bodyW,
                bodyH: Math.max(bodyBot - bodyTop, 0.5),
                wickHighY: highY,
                wickLowY: lowY,
                tooltipY: bodyTop,
            };
        });
    }
    get dataValueItems() {
        return this.validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
    }
    get hoveredCandle() {
        return this.hoveredIndex !== null ? (this.candles[this.hoveredIndex] ?? null) : null;
    }
    wickClass(c) {
        return classNames("st-hollowCandlestickChart__wick", `st-hollowCandlestickChart__wick--${c.up ? "up" : "down"}`);
    }
    candleClass(c) {
        const dim = this.hoveredIndex !== null && this.hoveredIndex !== c.index;
        return classNames("st-hollowCandlestickChart__candle", `st-hollowCandlestickChart__candle--${c.up ? "up" : "down"}`, `st-hollowCandlestickChart__candle--${c.hollow ? "hollow" : "filled"}`, dim && "st-hollowCandlestickChart__candle--dim");
    }
    formatTickLabel(tick) {
        return formatTick(tick);
    }
    tooltipLeftPct(c) {
        return `${(c.centerX / this.widthValue) * 100}%`;
    }
    tooltipTopPct(c) {
        return `${(c.tooltipY / this.heightValue) * 100}%`;
    }
    handlePointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) ? raw : null;
    }
    handlePointerLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HollowCandlestickChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: HollowCandlestickChart, isStandalone: true, selector: "st-hollow-candlestick-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hollowCandlestickChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (item of gridItems; track item.tick) {
            <line class="st-hollowCandlestickChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hollowCandlestickChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (c of candles; track c.index) {
            <line
              [class]="wickClass(c)"
              [attr.x1]="c.centerX"
              [attr.x2]="c.centerX"
              [attr.y1]="c.wickHighY"
              [attr.y2]="c.wickLowY"
              [attr.data-chart-index]="c.index"
            ></line>
            <rect
              [class]="candleClass(c)"
              [attr.x]="c.bodyX"
              [attr.y]="c.bodyY"
              [attr.width]="c.bodyW"
              [attr.height]="c.bodyH"
              rx="1"
              [attr.data-chart-index]="c.index"
            ></rect>
            <text
              class="st-hollowCandlestickChart__categoryLabel"
              [attr.x]="c.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ c.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCandle) {
        <div
          class="st-hollowCandlestickChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredCandle)"
          [style.top]="tooltipTopPct(hoveredCandle)"
        >
          <span class="st-hollowCandlestickChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span>
          <span class="st-hollowCandlestickChart__tooltipValue">O {{ hoveredCandle.datum.open }} H {{ hoveredCandle.datum.high }} L {{ hoveredCandle.datum.low }} C {{ hoveredCandle.datum.close }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HollowCandlestickChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-hollow-candlestick-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hollowCandlestickChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (item of gridItems; track item.tick) {
            <line class="st-hollowCandlestickChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hollowCandlestickChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (c of candles; track c.index) {
            <line
              [class]="wickClass(c)"
              [attr.x1]="c.centerX"
              [attr.x2]="c.centerX"
              [attr.y1]="c.wickHighY"
              [attr.y2]="c.wickLowY"
              [attr.data-chart-index]="c.index"
            ></line>
            <rect
              [class]="candleClass(c)"
              [attr.x]="c.bodyX"
              [attr.y]="c.bodyY"
              [attr.width]="c.bodyW"
              [attr.height]="c.bodyH"
              rx="1"
              [attr.data-chart-index]="c.index"
            ></rect>
            <text
              class="st-hollowCandlestickChart__categoryLabel"
              [attr.x]="c.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ c.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCandle) {
        <div
          class="st-hollowCandlestickChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredCandle)"
          [style.top]="tooltipTopPct(hoveredCandle)"
        >
          <span class="st-hollowCandlestickChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span>
          <span class="st-hollowCandlestickChart__tooltipValue">O {{ hoveredCandle.datum.open }} H {{ hoveredCandle.datum.high }} L {{ hoveredCandle.datum.low }} C {{ hoveredCandle.datum.close }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=HollowCandlestickChart.js.map