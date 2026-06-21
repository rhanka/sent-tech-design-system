import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
const DOT_RADIUS = 5;
export class LollipopChart {
    static stComponentName = "LollipopChart";
    componentName = "LollipopChart";
    MARGIN = MARGIN;
    DOT_RADIUS = DOT_RADIUS;
    hoveredIndex = null;
    data = [];
    width;
    height;
    orientation;
    label = "";
    domain;
    classInput;
    get hostClass() {
        return classNames("st-lollipopChart", this.classInput);
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
    get isVertical() {
        return (this.orientation ?? "vertical") === "vertical";
    }
    get plotWidth() {
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    get validData() {
        return (this.data ?? []).filter((d) => Number.isFinite(d.value));
    }
    get validDomain() {
        if (!this.domain)
            return null;
        const [d0, d1] = this.domain;
        if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1)
            return null;
        return [d0, d1];
    }
    get scales() {
        const values = this.validData.map((d) => d.value);
        const minRaw = this.validDomain ? this.validDomain[0] : Math.min(0, ...values);
        const maxRaw = this.validDomain ? this.validDomain[1] : Math.max(0, ...values);
        const ticks = niceTicks(minRaw, maxRaw, 5);
        return {
            ticks,
            domainMin: ticks[0] ?? minRaw,
            domainMax: ticks[ticks.length - 1] ?? maxRaw,
        };
    }
    get lollipops() {
        const { domainMin, domainMax } = this.scales;
        if (this.validData.length === 0)
            return [];
        if (this.isVertical) {
            const band = this.plotWidth / this.validData.length;
            const zeroY = scaleLinear(0, domainMin, domainMax, this.plotHeight, 0);
            return this.validData.map((d, i) => {
                const valueY = scaleLinear(d.value, domainMin, domainMax, this.plotHeight, 0);
                const cx = MARGIN.left + band * (i + 0.5);
                return {
                    datum: d,
                    tone: (d.tone ?? "category1"),
                    stemX1: cx,
                    stemY1: MARGIN.top + zeroY,
                    stemX2: cx,
                    stemY2: MARGIN.top + valueY,
                    cx,
                    cy: MARGIN.top + valueY,
                    labelX: cx,
                    labelY: this.heightValue - MARGIN.bottom + 16,
                };
            });
        }
        const band = this.plotHeight / this.validData.length;
        const zeroX = scaleLinear(0, domainMin, domainMax, 0, this.plotWidth);
        return this.validData.map((d, i) => {
            const valueX = scaleLinear(d.value, domainMin, domainMax, 0, this.plotWidth);
            const cy = MARGIN.top + band * (i + 0.5);
            return {
                datum: d,
                tone: (d.tone ?? "category1"),
                stemX1: MARGIN.left + zeroX,
                stemY1: cy,
                stemX2: MARGIN.left + valueX,
                stemY2: cy,
                cx: MARGIN.left + valueX,
                cy,
                labelX: MARGIN.left - 6,
                labelY: cy,
            };
        });
    }
    get valueAxisTicks() {
        const { ticks, domainMin, domainMax } = this.scales;
        if (this.isVertical) {
            return ticks.map((tick) => ({
                value: tick,
                x1: MARGIN.left,
                x2: MARGIN.left + this.plotWidth,
                y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, this.plotHeight, 0),
            }));
        }
        return ticks.map((tick) => ({
            value: tick,
            x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, this.plotWidth),
            y1: MARGIN.top,
            y2: MARGIN.top + this.plotHeight,
        }));
    }
    get dataValueItems() {
        return this.validData.map((d) => `${d.label}: ${d.value}`);
    }
    get hoveredLollipop() {
        if (this.hoveredIndex === null)
            return null;
        return this.lollipops[this.hoveredIndex] ?? null;
    }
    fmtTick(v) {
        return formatTick(v);
    }
    contrastText(tone) {
        return contrastTextForTone(tone);
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LollipopChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LollipopChart, isStandalone: true, selector: "st-lollipop-chart", inputs: { data: "data", width: "width", height: "height", orientation: "orientation", label: "label", domain: "domain", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lollipopChart__visual"
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
          @if (isVertical) {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="MARGIN.left - 6"
                [attr.y]="tick.y"
                text-anchor="end"
                dominant-baseline="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          } @else {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x" [attr.x2]="tick.x" [attr.y1]="tick.y1" [attr.y2]="tick.y2"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="tick.x"
                [attr.y]="heightValue - MARGIN.bottom + 16"
                text-anchor="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          }

          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (pop of lollipops; track pop.datum.label) {
            @if (isVertical) {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="middle">{{ pop.datum.label }}</text>
            } @else {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="end" dominant-baseline="middle">{{ pop.datum.label }}</text>
            }
          }

          @for (pop of lollipops; track pop.datum.label; let i = $index) {
            <line
              class="st-lollipopChart__stem"
              [attr.x1]="pop.stemX1"
              [attr.y1]="pop.stemY1"
              [attr.x2]="pop.stemX2"
              [attr.y2]="pop.stemY2"
            ></line>
            <circle
              [class]="'st-lollipopChart__dot st-lollipopChart__dot--' + pop.tone"
              [attr.cx]="pop.cx"
              [attr.cy]="pop.cy"
              [attr.r]="DOT_RADIUS"
              [attr.data-chart-index]="i"
            ></circle>
            <text
              class="st-lollipopChart__valueLabel"
              [attr.x]="pop.cx"
              [attr.y]="isVertical ? pop.cy - DOT_RADIUS - 4 : pop.cy"
              [attr.dx]="isVertical ? 0 : DOT_RADIUS + 4"
              [attr.text-anchor]="isVertical ? 'middle' : 'start'"
              [attr.dominant-baseline]="isVertical ? 'auto' : 'middle'"
              [style.fill]="contrastText(pop.tone)"
            >{{ fmtTick(pop.datum.value) }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredLollipop; as pop) {
        <div
          class="st-lollipopChart__tooltip"
          role="presentation"
          [style.left.%]="(pop.cx / widthValue) * 100"
          [style.top.%]="(pop.cy / heightValue) * 100"
        >
          <span class="st-lollipopChart__tooltipLabel">{{ pop.datum.label }}</span>
          <span class="st-lollipopChart__tooltipValue">{{ pop.datum.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LollipopChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-lollipop-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lollipopChart__visual"
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
          @if (isVertical) {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="MARGIN.left - 6"
                [attr.y]="tick.y"
                text-anchor="end"
                dominant-baseline="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          } @else {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x" [attr.x2]="tick.x" [attr.y1]="tick.y1" [attr.y2]="tick.y2"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="tick.x"
                [attr.y]="heightValue - MARGIN.bottom + 16"
                text-anchor="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          }

          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (pop of lollipops; track pop.datum.label) {
            @if (isVertical) {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="middle">{{ pop.datum.label }}</text>
            } @else {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="end" dominant-baseline="middle">{{ pop.datum.label }}</text>
            }
          }

          @for (pop of lollipops; track pop.datum.label; let i = $index) {
            <line
              class="st-lollipopChart__stem"
              [attr.x1]="pop.stemX1"
              [attr.y1]="pop.stemY1"
              [attr.x2]="pop.stemX2"
              [attr.y2]="pop.stemY2"
            ></line>
            <circle
              [class]="'st-lollipopChart__dot st-lollipopChart__dot--' + pop.tone"
              [attr.cx]="pop.cx"
              [attr.cy]="pop.cy"
              [attr.r]="DOT_RADIUS"
              [attr.data-chart-index]="i"
            ></circle>
            <text
              class="st-lollipopChart__valueLabel"
              [attr.x]="pop.cx"
              [attr.y]="isVertical ? pop.cy - DOT_RADIUS - 4 : pop.cy"
              [attr.dx]="isVertical ? 0 : DOT_RADIUS + 4"
              [attr.text-anchor]="isVertical ? 'middle' : 'start'"
              [attr.dominant-baseline]="isVertical ? 'auto' : 'middle'"
              [style.fill]="contrastText(pop.tone)"
            >{{ fmtTick(pop.datum.value) }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredLollipop; as pop) {
        <div
          class="st-lollipopChart__tooltip"
          role="presentation"
          [style.left.%]="(pop.cx / widthValue) * 100"
          [style.top.%]="(pop.cy / heightValue) * 100"
        >
          <span class="st-lollipopChart__tooltipLabel">{{ pop.datum.label }}</span>
          <span class="st-lollipopChart__tooltipValue">{{ pop.datum.value }}</span>
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
            }], orientation: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], domain: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=LollipopChart.js.map