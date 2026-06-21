import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
export class RoseChart {
    static stComponentName = "RoseChart";
    componentName = "RoseChart";
    hoveredIndex = null;
    data = [];
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-roseChart", this.classInput);
    }
    get widthValue() { return this.width ?? 320; }
    get heightValue() { return this.height ?? 320; }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    safeValue(value) {
        return Number.isFinite(value) && value > 0 ? value : 0;
    }
    formatNumber(value) {
        if (!Number.isFinite(value))
            return "0";
        if (Number.isInteger(value))
            return String(value);
        return value.toFixed(2).replace(/\.?0+$/, "");
    }
    point(cx, cy, radius, angle) {
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }
    sectorPath(cx, cy, radius, start, end) {
        const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
        const large = safeEnd - start > Math.PI ? 1 : 0;
        const outerStart = this.point(cx, cy, radius, start);
        const outerEnd = this.point(cx, cy, radius, safeEnd);
        return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
    }
    get sectors() {
        const cx = this.widthValue / 2;
        const cy = this.heightValue / 2;
        const outerLimit = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 6, 1);
        const count = this.data.length;
        if (count === 0)
            return [];
        const maxValue = Math.max(0, ...this.data.map((d) => this.safeValue(d.value)));
        const safeMax = maxValue > 0 ? maxValue : 1;
        const sweep = (Math.PI * 2) / count;
        return this.data.map((datum, index) => {
            const value = this.safeValue(datum.value);
            const radius = Math.sqrt(value / safeMax) * outerLimit;
            const start = -Math.PI / 2 + sweep * index;
            const end = start + sweep;
            const midAngle = (start + end) / 2;
            const labelPoint = this.point(cx, cy, radius * 0.62, midAngle);
            return {
                datum,
                value,
                tone: datum.tone ?? TONES[index % TONES.length],
                radius,
                path: value > 0 ? this.sectorPath(cx, cy, radius, start, end) : "",
                labelX: labelPoint.x,
                labelY: labelPoint.y,
                showLabel: value > 0 && radius > outerLimit * 0.4,
            };
        });
    }
    get dataValueItems() {
        return this.data.map((d) => `${d.label}: ${this.formatNumber(this.safeValue(d.value))}`);
    }
    get tooltipLeft() {
        const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : null;
        return s ? (s.labelX / this.widthValue) * 100 : 0;
    }
    get tooltipTop() {
        const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : null;
        return s ? (s.labelY / this.heightValue) * 100 : 0;
    }
    sectorClass(sector, i) {
        return classNames("st-roseChart__sector", `st-roseChart__sector--${sector.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== i && "st-roseChart__sector--dim");
    }
    contrastText(tone) {
        return contrastTextForTone(tone);
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RoseChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: RoseChart, isStandalone: true, selector: "st-rose-chart", inputs: { data: "data", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-roseChart__visual"
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
          @for (sector of sectors; track sector.datum.label; let i = $index) {
            @if (sector.path) {
              <path
                [class]="sectorClass(sector, i)"
                [attr.d]="sector.path"
                [attr.data-chart-index]="i"
              ></path>
            }
          }

          @for (sector of sectors; track sector.datum.label) {
            @if (sector.showLabel) {
              <text
                class="st-roseChart__label"
                [attr.x]="sector.labelX"
                [attr.y]="sector.labelY"
                text-anchor="middle"
                dominant-baseline="middle"
                [attr.fill]="contrastText(sector.tone)"
              >{{ sector.datum.label }}</text>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && sectors[hoveredIndex] && sectors[hoveredIndex].value > 0) {
        <div
          class="st-roseChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + \'%\'"
          [style.top]="tooltipTop + \'%\'"
        >
          <span class="st-roseChart__tooltipLabel">{{ sectors[hoveredIndex].datum.label }}</span>
          <span class="st-roseChart__tooltipValue">{{ formatNumber(sectors[hoveredIndex].value) }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RoseChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-rose-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-roseChart__visual"
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
          @for (sector of sectors; track sector.datum.label; let i = $index) {
            @if (sector.path) {
              <path
                [class]="sectorClass(sector, i)"
                [attr.d]="sector.path"
                [attr.data-chart-index]="i"
              ></path>
            }
          }

          @for (sector of sectors; track sector.datum.label) {
            @if (sector.showLabel) {
              <text
                class="st-roseChart__label"
                [attr.x]="sector.labelX"
                [attr.y]="sector.labelY"
                text-anchor="middle"
                dominant-baseline="middle"
                [attr.fill]="contrastText(sector.tone)"
              >{{ sector.datum.label }}</text>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && sectors[hoveredIndex] && sectors[hoveredIndex].value > 0) {
        <div
          class="st-roseChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + \'%\'"
          [style.top]="tooltipTop + \'%\'"
        >
          <span class="st-roseChart__tooltipLabel">{{ sectors[hoveredIndex].datum.label }}</span>
          <span class="st-roseChart__tooltipValue">{{ formatNumber(sectors[hoveredIndex].value) }}</span>
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
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=RoseChart.js.map