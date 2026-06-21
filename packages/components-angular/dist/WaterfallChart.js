import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
const LEGEND_ITEMS = [
    { type: "increase", label: "Hausse" },
    { type: "decrease", label: "Baisse" },
    { type: "total", label: "Total" },
];
export class WaterfallChart {
    static stComponentName = "WaterfallChart";
    componentName = "WaterfallChart";
    margin = MARGIN;
    legendItems = LEGEND_ITEMS;
    hoveredIndex = null;
    data = [];
    width;
    height;
    connectors;
    format;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-waterfallChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 240;
    }
    get connectorsValue() {
        return this.connectors ?? true;
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
    get computed() {
        let cumulative = 0;
        let seenStep = false;
        return this.data.map((d) => {
            const raw = Number.isFinite(d.value) ? d.value : 0;
            const type = d.type ?? (raw >= 0 ? "increase" : "decrease");
            let start;
            let end;
            let displayValue;
            if (type === "total") {
                if (seenStep && raw !== cumulative) {
                    // eslint-disable-next-line no-console
                    console.warn(`[WaterfallChart] total "${d.label}" = ${raw} ` +
                        `diverges from the running cumulative ${cumulative}.`);
                }
                start = 0;
                end = raw;
                cumulative = raw;
                displayValue = raw;
            }
            else {
                const signed = type === "decrease" ? -Math.abs(raw) : Math.abs(raw);
                start = cumulative;
                end = cumulative + signed;
                cumulative = end;
                displayValue = signed;
                seenStep = true;
            }
            return { datum: d, type, start, end, displayValue, cumulative };
        });
    }
    get ticks() {
        const bounds = this.computed.flatMap((c) => [c.start, c.end]);
        const minRaw = Math.min(0, ...bounds);
        const maxRaw = Math.max(0, ...bounds);
        return niceTicks(minRaw, maxRaw, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? this.domainMin;
    }
    get bars() {
        if (this.computed.length === 0)
            return [];
        const { domainMin, domainMax, plotWidth, plotHeight } = this;
        const band = plotWidth / this.computed.length;
        const barWidth = band * 0.62;
        return this.computed.map((c, i) => {
            const startY = scaleLinear(c.start, domainMin, domainMax, plotHeight, 0);
            const endY = scaleLinear(c.end, domainMin, domainMax, plotHeight, 0);
            const y = Math.min(startY, endY);
            const h = Math.abs(endY - startY);
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            return {
                x,
                y: MARGIN.top + y,
                width: barWidth,
                height: Math.max(h, 0.5),
                cx: MARGIN.left + band * (i + 0.5),
                cy: MARGIN.top + Math.min(startY, endY),
                type: c.type,
                datum: c.datum,
                displayValue: c.displayValue,
                cumulative: c.cumulative,
                index: i,
            };
        });
    }
    get connectorLines() {
        if (!this.connectorsValue || this.bars.length < 2)
            return [];
        const { domainMin, domainMax, plotHeight } = this;
        const lines = [];
        for (let i = 0; i < this.computed.length - 1; i++) {
            const level = this.computed[i].end;
            const y = MARGIN.top + scaleLinear(level, domainMin, domainMax, plotHeight, 0);
            lines.push({ x1: this.bars[i].x + this.bars[i].width, x2: this.bars[i + 1].x, y });
        }
        return lines;
    }
    get valueAxisTicks() {
        const { domainMin, domainMax, plotWidth, plotHeight } = this;
        return this.ticks.map((tick) => ({
            value: tick,
            x1: MARGIN.left,
            x2: MARGIN.left + plotWidth,
            y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
        }));
    }
    get zeroY() {
        return MARGIN.top + scaleLinear(0, this.domainMin, this.domainMax, this.plotHeight, 0);
    }
    get dataValueItems() {
        return this.computed.map((c) => `${c.datum.label}: ${this.formatValue(c.displayValue)}`);
    }
    formatTickLabel(value) {
        return formatTick(value);
    }
    formatValue(v) {
        return this.format ? this.format(v) : formatTick(v);
    }
    tooltipLeft() {
        if (this.hoveredIndex === null)
            return "0%";
        const bar = this.bars[this.hoveredIndex];
        return `${(bar.cx / this.widthValue) * 100}%`;
    }
    tooltipTop() {
        if (this.hoveredIndex === null)
            return "0%";
        const bar = this.bars[this.hoveredIndex];
        return `${(bar.cy / this.heightValue) * 100}%`;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: WaterfallChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: WaterfallChart, isStandalone: true, selector: "st-waterfall-chart", inputs: { data: "data", width: "width", height: "height", connectors: "connectors", format: "format", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-waterfallChart__visual"
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
            <line
              class="st-waterfallChart__grid"
              [attr.x1]="tick.x1"
              [attr.x2]="tick.x2"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-waterfallChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="heightValue - margin.bottom"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__zero"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="zeroY"
            [attr.y2]="zeroY"
          ></line>

          @for (line of connectorLines; track \$index) {
            <line
              class="st-waterfallChart__connector"
              [attr.x1]="line.x1"
              [attr.x2]="line.x2"
              [attr.y1]="line.y"
              [attr.y2]="line.y"
            ></line>
          }

          @for (bar of bars; track bar.datum.label) {
            <text
              class="st-waterfallChart__categoryLabel"
              [attr.x]="bar.x + bar.width / 2"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ bar.datum.label }}</text>
          }

          @for (bar of bars; track bar.datum.label; let i = \$index) {
            <rect
              [class]="'st-waterfallChart__bar st-waterfallChart__bar--' + bar.type"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="i"
            ></rect>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      <ul class="st-waterfallChart__legend" aria-hidden="true">
        @for (item of legendItems; track item.type) {
          <li class="st-waterfallChart__legendItem">
            <span [class]="'st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--' + item.type"></span>
            {{ item.label }}
          </li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-waterfallChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-waterfallChart__tooltipLabel">{{ bars[hoveredIndex].datum.label }}</span>
          <span class="st-waterfallChart__tooltipValue">{{ formatValue(bars[hoveredIndex].displayValue) }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: WaterfallChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-waterfall-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-waterfallChart__visual"
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
            <line
              class="st-waterfallChart__grid"
              [attr.x1]="tick.x1"
              [attr.x2]="tick.x2"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-waterfallChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="heightValue - margin.bottom"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__zero"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="zeroY"
            [attr.y2]="zeroY"
          ></line>

          @for (line of connectorLines; track \$index) {
            <line
              class="st-waterfallChart__connector"
              [attr.x1]="line.x1"
              [attr.x2]="line.x2"
              [attr.y1]="line.y"
              [attr.y2]="line.y"
            ></line>
          }

          @for (bar of bars; track bar.datum.label) {
            <text
              class="st-waterfallChart__categoryLabel"
              [attr.x]="bar.x + bar.width / 2"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ bar.datum.label }}</text>
          }

          @for (bar of bars; track bar.datum.label; let i = \$index) {
            <rect
              [class]="'st-waterfallChart__bar st-waterfallChart__bar--' + bar.type"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="i"
            ></rect>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      <ul class="st-waterfallChart__legend" aria-hidden="true">
        @for (item of legendItems; track item.type) {
          <li class="st-waterfallChart__legendItem">
            <span [class]="'st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--' + item.type"></span>
            {{ item.label }}
          </li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-waterfallChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-waterfallChart__tooltipLabel">{{ bars[hoveredIndex].datum.label }}</span>
          <span class="st-waterfallChart__tooltipValue">{{ formatValue(bars[hoveredIndex].displayValue) }}</span>
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
            }], connectors: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=WaterfallChart.js.map