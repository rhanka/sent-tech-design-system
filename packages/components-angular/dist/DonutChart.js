import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
const DONUT_TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const DATA_LABEL_MIN_DEG = 18;
export class DonutChart {
    static stComponentName = "DonutChart";
    componentName = "DonutChart";
    data = [];
    size;
    thickness;
    centerLabel;
    dataLabels;
    label = "";
    classInput;
    hoveredIndex = null;
    get hostClass() {
        return classNames("st-donutChart", this.classInput);
    }
    get sizeValue() {
        return this.size ?? 220;
    }
    get thicknessValue() {
        return this.thickness ?? 34;
    }
    get viewBox() {
        return `0 0 ${this.sizeValue} ${this.sizeValue}`;
    }
    get slices() {
        const data = this.data;
        const size = this.sizeValue;
        const thickness = this.thicknessValue;
        const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
        if (total <= 0)
            return { total: 0, items: [] };
        const cx = size / 2;
        const cy = size / 2;
        const rOuter = size / 2 - 2;
        const rInner = Math.max(rOuter - thickness, 1);
        const TWO_PI = Math.PI * 2;
        let angle = -Math.PI / 2;
        const polar = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        const items = data.map((d, i) => {
            const frac = Math.max(d.value, 0) / total;
            const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
            const a0 = angle;
            const a1 = angle + span;
            angle = a1;
            const large = span > Math.PI ? 1 : 0;
            const [x0o, y0o] = polar(rOuter, a0);
            const [x1o, y1o] = polar(rOuter, a1);
            const [x1i, y1i] = polar(rInner, a1);
            const [x0i, y0i] = polar(rInner, a0);
            const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
            const aMid = (a0 + a1) / 2;
            const rMid = (rOuter + rInner) / 2;
            const [labelX, labelY] = polar(rMid, aMid);
            return {
                datum: d,
                path,
                tone: d.tone ?? DONUT_TONES[i % DONUT_TONES.length],
                pct: frac * 100,
                spanDeg: (span * 180) / Math.PI,
                labelX,
                labelY,
            };
        });
        return { total, items };
    }
    sliceClass(slice, i) {
        const isDim = this.hoveredIndex !== null && this.hoveredIndex !== i;
        return classNames("st-donutChart__slice", `st-donutChart__slice--${slice.tone}`, isDim ? "st-donutChart__slice--dim" : undefined);
    }
    fmtPct(p) {
        return `${p.toFixed(p < 10 ? 1 : 0)}%`;
    }
    get dataValueItems() {
        return this.slices.items.map((slice) => `${slice.datum.label}: ${slice.datum.value} (${this.fmtPct(slice.pct)})`);
    }
    get dataLabelItems() {
        const opts = normalizeDataLabels(this.dataLabels);
        if (!opts.enabled)
            return [];
        return this.slices.items
            .filter((slice) => slice.spanDeg >= DATA_LABEL_MIN_DEG)
            .map((slice) => ({
            key: slice.datum.label,
            x: slice.labelX,
            y: slice.labelY,
            text: formatDataLabel(slice.datum.value, opts, (v) => String(v)),
        }));
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredIndex = null;
            return;
        }
        const raw = Number(target.getAttribute("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DonutChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DonutChart, isStandalone: true, selector: "st-donut-chart", inputs: { data: "data", size: "size", thickness: "thickness", centerLabel: "centerLabel", dataLabels: "dataLabels", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-donutChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @if (slices.total > 0) {
            @for (slice of slices.items; track slice.datum.label; let i = $index) {
              <path
                [class]="sliceClass(slice, i)"
                [attr.d]="slice.path"
                [attr.data-chart-index]="i"
              ></path>
            }
            @if (centerLabel !== null) {
              <text
                class="st-donutChart__center"
                [attr.x]="sizeValue / 2"
                [attr.y]="sizeValue / 2"
                text-anchor="middle"
                dominant-baseline="central"
              >{{ centerLabel !== undefined ? centerLabel : slices.total }}</text>
            }
            @if (dataLabelItems.length > 0) {
              <g class="st-donutChart__dataLabels" aria-hidden="true">
                @for (d of dataLabelItems; track d.key) {
                  <text
                    class="st-donutChart__dataLabel"
                    [attr.x]="d.x"
                    [attr.y]="d.y"
                    text-anchor="middle"
                    dominant-baseline="central"
                  >{{ d.text }}</text>
                }
              </g>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && slices.items[hoveredIndex!]) {
        <div class="st-donutChart__tooltip" role="presentation">
          <span class="st-donutChart__tooltipLabel">{{ slices.items[hoveredIndex!]!.datum.label }}</span>
          <span class="st-donutChart__tooltipValue">{{ slices.items[hoveredIndex!]!.datum.value }} · {{ fmtPct(slices.items[hoveredIndex!]!.pct) }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DonutChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-donut-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-donutChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @if (slices.total > 0) {
            @for (slice of slices.items; track slice.datum.label; let i = $index) {
              <path
                [class]="sliceClass(slice, i)"
                [attr.d]="slice.path"
                [attr.data-chart-index]="i"
              ></path>
            }
            @if (centerLabel !== null) {
              <text
                class="st-donutChart__center"
                [attr.x]="sizeValue / 2"
                [attr.y]="sizeValue / 2"
                text-anchor="middle"
                dominant-baseline="central"
              >{{ centerLabel !== undefined ? centerLabel : slices.total }}</text>
            }
            @if (dataLabelItems.length > 0) {
              <g class="st-donutChart__dataLabels" aria-hidden="true">
                @for (d of dataLabelItems; track d.key) {
                  <text
                    class="st-donutChart__dataLabel"
                    [attr.x]="d.x"
                    [attr.y]="d.y"
                    text-anchor="middle"
                    dominant-baseline="central"
                  >{{ d.text }}</text>
                }
              </g>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && slices.items[hoveredIndex!]) {
        <div class="st-donutChart__tooltip" role="presentation">
          <span class="st-donutChart__tooltipLabel">{{ slices.items[hoveredIndex!]!.datum.label }}</span>
          <span class="st-donutChart__tooltipValue">{{ slices.items[hoveredIndex!]!.datum.value }} · {{ fmtPct(slices.items[hoveredIndex!]!.pct) }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], thickness: [{
                type: NgInput
            }], centerLabel: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DonutChart.js.map