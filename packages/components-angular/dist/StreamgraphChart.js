import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 };
export class StreamgraphChart {
    static stComponentName = "StreamgraphChart";
    componentName = "StreamgraphChart";
    MARGIN_LEFT = MARGIN.left;
    MARGIN_RIGHT = MARGIN.right;
    MARGIN_BOTTOM = MARGIN.bottom;
    hovered = null;
    data = [];
    width;
    height;
    label = "";
    smooth;
    showLegend;
    classInput;
    get hostClass() {
        return classNames("st-streamgraphChart", this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 240; }
    get smoothValue() { return this.smooth !== false; }
    get showLegendValue() { return this.showLegend !== false; }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    safeV(v) {
        return Number.isFinite(v) && v > 0 ? v : 0;
    }
    get series() {
        const seen = new Map();
        this.data.forEach((d) => d.values.forEach((sv) => {
            if (!seen.has(sv.label))
                seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
        }));
        return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
    }
    get halfMax() {
        let max = 0;
        for (const d of this.data) {
            let sum = 0;
            for (const sv of d.values)
                sum += this.safeV(sv.value);
            if (sum > max)
                max = sum;
        }
        return max / 2 || 1;
    }
    computeBands() {
        const xs = this.computeXs();
        const midY = MARGIN.top + this.plotHeight / 2;
        const valToY = (signed) => midY - scaleLinear(signed, 0, this.halfMax, 0, this.plotHeight / 2);
        const result = this.series.map(() => []);
        this.data.forEach((d, xi) => {
            const total = d.values.reduce((s, sv) => s + this.safeV(sv.value), 0);
            let acc = -total / 2;
            this.series.forEach((s, si) => {
                const sv = d.values.find((v) => v.label === s.seriesLabel);
                const v = sv ? this.safeV(sv.value) : 0;
                const lower = acc;
                const upper = acc + v;
                acc = upper;
                result[si].push({ x: xs[xi], top: valToY(upper), bottom: valToY(lower) });
            });
        });
        return result;
    }
    computeXs() {
        const n = this.data.length;
        return this.data.map((_, i) => {
            const denom = Math.max(n - 1, 1);
            const xRatio = n === 1 ? 0.5 : i / denom;
            return MARGIN.left + xRatio * this.plotWidth;
        });
    }
    get areas() {
        const bandsData = this.computeBands();
        return this.series.map((s, si) => {
            const band = bandsData[si];
            if (!band || band.length === 0)
                return { tone: s.tone, seriesLabel: s.seriesLabel, d: "" };
            const topPts = band.map((b) => ({ x: b.x, y: b.top }));
            const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
            const topPath = this.smoothValue ? buildSmoothPath(topPts) : buildLinearPath(topPts);
            const bottomPath = (this.smoothValue ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, "L");
            return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
        });
    }
    get xTickEntries() {
        const n = this.data.length;
        if (n === 0)
            return [];
        const target = Math.min(5, n);
        const stride = Math.max(1, Math.round((n - 1) / (target - 1 || 1)));
        const entries = [];
        const xsData = this.computeXs();
        for (let i = 0; i < n; i += stride)
            entries.push({ x: xsData[i], label: this.data[i].category });
        const lastIdx = n - 1;
        if (entries[entries.length - 1]?.label !== this.data[lastIdx].category) {
            entries.push({ x: xsData[lastIdx], label: this.data[lastIdx].category });
        }
        return entries;
    }
    get dataValueItems() {
        const items = this.series.map((s) => {
            const total = this.data.reduce((sum, d) => {
                const sv = d.values.find((v) => v.label === s.seriesLabel);
                return sum + (sv ? this.safeV(sv.value) : 0);
            }, 0);
            return `${s.seriesLabel}: ${total}`;
        });
        const grand = this.data.reduce((sum, d) => sum + d.values.reduce((s, sv) => s + this.safeV(sv.value), 0), 0);
        if (this.series.length > 0)
            items.push(`Total: ${grand}`);
        return items;
    }
    get tooltip() {
        if (this.hovered === null || !this.series[this.hovered])
            return null;
        const s = this.series[this.hovered];
        const bandsData = this.computeBands();
        const band = bandsData[this.hovered];
        if (!band || band.length === 0)
            return null;
        const mid = band[Math.floor(band.length / 2)];
        const total = this.data.reduce((sum, d) => {
            const sv = d.values.find((v) => v.label === s.seriesLabel);
            return sum + (sv ? this.safeV(sv.value) : 0);
        }, 0);
        return { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
    }
    get tooltipLeftPct() {
        return this.tooltip ? (this.tooltip.cx / this.widthValue) * 100 : 0;
    }
    get tooltipTopPct() {
        return this.tooltip ? (this.tooltip.cy / this.heightValue) * 100 : 0;
    }
    areaClass(area, si) {
        return classNames("st-streamgraphChart__area", `st-streamgraphChart__area--${area.tone}`, this.hovered !== null && this.hovered !== si && "st-streamgraphChart__area--dim");
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-series-index"));
        this.hovered = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hovered = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamgraphChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StreamgraphChart, isStandalone: true, selector: "st-streamgraph-chart", inputs: { data: "data", width: "width", height: "height", label: "label", smooth: "smooth", showLegend: "showLegend", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-streamgraphChart__visual"
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
          <line class="st-streamgraphChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (tick of xTickEntries; track $index) {
            <text class="st-streamgraphChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (area of areas; track area.seriesLabel; let si = $index) {
            @if (area.d) {
              <path
                [class]="areaClass(area, si)"
                [attr.d]="area.d"
                [attr.data-series-index]="si"
              ></path>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (tooltip) {
        <div
          class="st-streamgraphChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct + \'%\'"
          [style.top]="tooltipTopPct + \'%\'"
        >
          <span class="st-streamgraphChart__tooltipLabel">{{ tooltip.label }}</span>
          <span class="st-streamgraphChart__tooltipValue">{{ tooltip.value }}</span>
        </div>
      }

      @if (showLegendValue && series.length > 0) {
        <ul class="st-streamgraphChart__legend">
          @for (item of series; track item.seriesLabel) {
            <li class="st-streamgraphChart__legendItem">
              <span [class]="\'st-streamgraphChart__legendSwatch st-streamgraphChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.seriesLabel }}
            </li>
          }
        </ul>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamgraphChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-streamgraph-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-streamgraphChart__visual"
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
          <line class="st-streamgraphChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (tick of xTickEntries; track $index) {
            <text class="st-streamgraphChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (area of areas; track area.seriesLabel; let si = $index) {
            @if (area.d) {
              <path
                [class]="areaClass(area, si)"
                [attr.d]="area.d"
                [attr.data-series-index]="si"
              ></path>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (tooltip) {
        <div
          class="st-streamgraphChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct + \'%\'"
          [style.top]="tooltipTopPct + \'%\'"
        >
          <span class="st-streamgraphChart__tooltipLabel">{{ tooltip.label }}</span>
          <span class="st-streamgraphChart__tooltipValue">{{ tooltip.value }}</span>
        </div>
      }

      @if (showLegendValue && series.length > 0) {
        <ul class="st-streamgraphChart__legend">
          @for (item of series; track item.seriesLabel) {
            <li class="st-streamgraphChart__legendItem">
              <span [class]="\'st-streamgraphChart__legendSwatch st-streamgraphChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.seriesLabel }}
            </li>
          }
        </ul>
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
            }], smooth: [{
                type: NgInput
            }], showLegend: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StreamgraphChart.js.map