import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 };
export class ViolinChart {
    static stComponentName = "ViolinChart";
    componentName = "ViolinChart";
    hoveredIndex = null;
    MARGIN_LEFT = MARGIN.left;
    MARGIN_RIGHT = MARGIN.right;
    MARGIN_TOP = MARGIN.top;
    MARGIN_BOTTOM = MARGIN.bottom;
    data = [];
    bins;
    quartiles;
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-violinChart", this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 280; }
    get binCount() { return Math.max(1, Math.floor(this.bins ?? 20)); }
    get quartilesValue() { return this.quartiles ?? true; }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    formatNumber(value) {
        if (!Number.isFinite(value))
            return "0";
        if (Number.isInteger(value))
            return String(value);
        return value.toFixed(2).replace(/\.?0+$/, "");
    }
    scaleLinear(v, d0, d1, r0, r1) {
        if (d1 === d0)
            return r0;
        return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
    }
    quantile(sorted, q) {
        if (sorted.length === 0)
            return 0;
        if (sorted.length === 1)
            return sorted[0];
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        const next = sorted[base + 1];
        return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
    }
    get cleaned() {
        return this.data
            .map((datum, index) => ({ datum, index, finite: datum.values.filter(Number.isFinite) }))
            .filter((entry) => entry.finite.length > 0);
    }
    get domain() {
        const all = this.cleaned.flatMap((e) => e.finite);
        if (all.length === 0)
            return { min: 0, max: 1 };
        const min = Math.min(...all);
        const max = Math.max(...all);
        if (min === max) {
            const pad = Math.max(Math.abs(max), 1) * 0.1;
            return { min: min - pad, max: max + pad };
        }
        const pad = (max - min) * 0.06;
        return { min: min - pad, max: max + pad };
    }
    get violins() {
        if (this.cleaned.length === 0)
            return [];
        const band = this.plotWidth / this.cleaned.length;
        const halfWidth = Math.min(54, Math.max(14, band * 0.36));
        const { min: dMin, max: dMax } = this.domain;
        const step = (dMax - dMin) / this.binCount;
        const yOf = (value) => MARGIN.top + this.scaleLinear(value, dMin, dMax, this.plotHeight, 0);
        return this.cleaned.map((entry, position) => {
            const cx = MARGIN.left + band * (position + 0.5);
            const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];
            const counts = new Array(this.binCount).fill(0);
            for (const value of entry.finite) {
                const raw = step > 0 ? Math.floor((value - dMin) / step) : 0;
                const bin = Math.max(0, Math.min(this.binCount - 1, raw));
                counts[bin] += 1;
            }
            const maxCount = Math.max(1, ...counts);
            const profile = counts.map((count, bin) => ({
                y: yOf(dMin + step * (bin + 0.5)),
                w: (count / maxCount) * halfWidth,
            }));
            const right = profile.map((p) => `${cx + p.w},${p.y}`);
            const left = [...profile].reverse().map((p) => `${cx - p.w},${p.y}`);
            const path = `M ${right.join(" L ")} L ${left.join(" L ")} Z`;
            const sorted = [...entry.finite].sort((a, b) => a - b);
            const median = this.quantile(sorted, 0.5);
            const q1 = this.quantile(sorted, 0.25);
            const q3 = this.quantile(sorted, 0.75);
            return {
                datum: entry.datum,
                tone,
                cx,
                path,
                halfWidth,
                n: entry.finite.length,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                median,
                medianY: yOf(median),
                q1Y: yOf(q1),
                q3Y: yOf(q3),
                boxWidth: Math.max(halfWidth * 0.4, 4),
            };
        });
    }
    get dataValueItems() {
        return this.violins.map((v) => `${v.datum.label}: ${v.n} points, min ${this.formatNumber(v.min)}, median ${this.formatNumber(v.median)}, max ${this.formatNumber(v.max)}`);
    }
    boxY(violin) {
        return Math.min(violin.q1Y, violin.q3Y);
    }
    boxH(violin) {
        return Math.max(Math.abs(violin.q1Y - violin.q3Y), 1);
    }
    violinShapeClass(violin, i) {
        return classNames("st-violinChart__shape", `st-violinChart__shape--${violin.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== i && "st-violinChart__shape--dim");
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ViolinChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ViolinChart, isStandalone: true, selector: "st-violin-chart", inputs: { data: "data", bins: "bins", quartiles: "quartiles", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-violinChart__visual"
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
          <line class="st-violinChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-violinChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (violin of violins; track violin.datum.label; let i = $index) {
            <path
              [class]="violinShapeClass(violin, i)"
              [attr.d]="violin.path"
              [attr.data-chart-index]="i"
            ></path>
            @if (quartilesValue) {
              <rect
                class="st-violinChart__box"
                [attr.x]="violin.cx - violin.boxWidth / 2"
                [attr.y]="boxY(violin)"
                [attr.width]="violin.boxWidth"
                [attr.height]="boxH(violin)"
                [attr.data-chart-index]="i"
              ></rect>
              <line
                class="st-violinChart__median"
                [attr.x1]="violin.cx - violin.boxWidth / 2"
                [attr.x2]="violin.cx + violin.boxWidth / 2"
                [attr.y1]="violin.medianY"
                [attr.y2]="violin.medianY"
                [attr.data-chart-index]="i"
              ></line>
            }
            <text class="st-violinChart__label" [attr.x]="violin.cx" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ violin.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && violins[hoveredIndex]) {
        <div
          class="st-violinChart__tooltip"
          role="presentation"
          [style.left]="(violins[hoveredIndex].cx / widthValue * 100) + '%'"
          [style.top]="(violins[hoveredIndex].medianY / heightValue * 100) + '%'"
        >
          <span class="st-violinChart__tooltipLabel">{{ violins[hoveredIndex].datum.label }}</span>
          <span class="st-violinChart__tooltipValue">Median {{ formatNumber(violins[hoveredIndex].median) }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ViolinChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-violin-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-violinChart__visual"
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
          <line class="st-violinChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-violinChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (violin of violins; track violin.datum.label; let i = $index) {
            <path
              [class]="violinShapeClass(violin, i)"
              [attr.d]="violin.path"
              [attr.data-chart-index]="i"
            ></path>
            @if (quartilesValue) {
              <rect
                class="st-violinChart__box"
                [attr.x]="violin.cx - violin.boxWidth / 2"
                [attr.y]="boxY(violin)"
                [attr.width]="violin.boxWidth"
                [attr.height]="boxH(violin)"
                [attr.data-chart-index]="i"
              ></rect>
              <line
                class="st-violinChart__median"
                [attr.x1]="violin.cx - violin.boxWidth / 2"
                [attr.x2]="violin.cx + violin.boxWidth / 2"
                [attr.y1]="violin.medianY"
                [attr.y2]="violin.medianY"
                [attr.data-chart-index]="i"
              ></line>
            }
            <text class="st-violinChart__label" [attr.x]="violin.cx" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ violin.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && violins[hoveredIndex]) {
        <div
          class="st-violinChart__tooltip"
          role="presentation"
          [style.left]="(violins[hoveredIndex].cx / widthValue * 100) + '%'"
          [style.top]="(violins[hoveredIndex].medianY / heightValue * 100) + '%'"
        >
          <span class="st-violinChart__tooltipLabel">{{ violins[hoveredIndex].datum.label }}</span>
          <span class="st-violinChart__tooltipValue">Median {{ formatNumber(violins[hoveredIndex].median) }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], bins: [{
                type: NgInput
            }], quartiles: [{
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
//# sourceMappingURL=ViolinChart.js.map