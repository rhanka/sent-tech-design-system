import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };
export class HLCChart {
    static stComponentName = "HLCChart";
    componentName = "HLCChart";
    margin = MARGIN;
    hoveredIndex = null;
    data = [];
    label = "";
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-hlcChart", this.classInput);
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
        return this.data.filter((d) => Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close));
    }
    get ticks() {
        const allVals = [];
        for (const d of this.validData) {
            allVals.push(d.high, d.low, d.close);
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
    get bars() {
        if (this.validData.length === 0)
            return [];
        const band = this.plotWidth / this.validData.length;
        const tickW = Math.min(band * 0.3, 12);
        return this.validData.map((d, i) => {
            const clampedHigh = Math.max(d.high, d.close);
            const clampedLow = Math.min(d.low, d.close);
            const prevClose = i > 0 ? this.validData[i - 1].close : d.close;
            const bullish = d.close >= prevClose;
            const centerX = MARGIN.left + band * i + band / 2;
            const highY = MARGIN.top + scaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
            const lowY = MARGIN.top + scaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);
            const closeY = MARGIN.top + scaleLinear(d.close, this.domainMin, this.domainMax, this.plotHeight, 0);
            return {
                datum: d,
                index: i,
                bullish,
                centerX,
                barHighY: highY,
                barLowY: lowY,
                closeY,
                closeX: centerX + tickW,
                tooltipY: Math.min(highY, closeY),
            };
        });
    }
    get dataValueItems() {
        return this.validData.map((d) => `${d.label}: H ${d.high} L ${d.low} C ${d.close}`);
    }
    get hoveredBar() {
        return this.hoveredIndex !== null ? (this.bars[this.hoveredIndex] ?? null) : null;
    }
    barGroupClass(b) {
        const dim = this.hoveredIndex !== null && this.hoveredIndex !== b.index;
        return classNames("st-hlcChart__bar", `st-hlcChart__bar--${b.bullish ? "up" : "down"}`, dim && "st-hlcChart__bar--dim");
    }
    formatTickLabel(tick) {
        return formatTick(tick);
    }
    tooltipLeftPct(b) {
        return `${(b.centerX / this.widthValue) * 100}%`;
    }
    tooltipTopPct(b) {
        return `${(b.tooltipY / this.heightValue) * 100}%`;
    }
    handlePointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) ? raw : null;
    }
    handlePointerLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HLCChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: HLCChart, isStandalone: true, selector: "st-hlc-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hlcChart__visual"
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
            <line class="st-hlcChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hlcChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (b of bars; track b.index) {
            <g [class]="barGroupClass(b)">
              <line
                class="st-hlcChart__range"
                [attr.x1]="b.centerX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.barHighY"
                [attr.y2]="b.barLowY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-hlcChart__close"
                [attr.x1]="b.centerX"
                [attr.x2]="b.closeX"
                [attr.y1]="b.closeY"
                [attr.y2]="b.closeY"
                [attr.data-chart-index]="b.index"
              ></line>
            </g>
            <text
              class="st-hlcChart__categoryLabel"
              [attr.x]="b.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ b.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar) {
        <div
          class="st-hlcChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredBar)"
          [style.top]="tooltipTopPct(hoveredBar)"
        >
          <span class="st-hlcChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
          <span class="st-hlcChart__tooltipValue">H {{ hoveredBar.datum.high }} L {{ hoveredBar.datum.low }} C {{ hoveredBar.datum.close }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: HLCChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-hlc-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hlcChart__visual"
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
            <line class="st-hlcChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hlcChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (b of bars; track b.index) {
            <g [class]="barGroupClass(b)">
              <line
                class="st-hlcChart__range"
                [attr.x1]="b.centerX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.barHighY"
                [attr.y2]="b.barLowY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-hlcChart__close"
                [attr.x1]="b.centerX"
                [attr.x2]="b.closeX"
                [attr.y1]="b.closeY"
                [attr.y2]="b.closeY"
                [attr.data-chart-index]="b.index"
              ></line>
            </g>
            <text
              class="st-hlcChart__categoryLabel"
              [attr.x]="b.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ b.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar) {
        <div
          class="st-hlcChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredBar)"
          [style.top]="tooltipTopPct(hoveredBar)"
        >
          <span class="st-hlcChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
          <span class="st-hlcChart__tooltipValue">H {{ hoveredBar.datum.high }} L {{ hoveredBar.datum.low }} C {{ hoveredBar.datum.close }}</span>
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
//# sourceMappingURL=HLCChart.js.map