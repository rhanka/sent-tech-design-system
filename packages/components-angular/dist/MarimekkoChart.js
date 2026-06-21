import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";
import * as i0 from "@angular/core";
const TONES = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];
const MARGIN = { top: 12, right: 16, bottom: 32, left: 8 };
export class MarimekkoChart {
    static stComponentName = "MarimekkoChart";
    componentName = "MarimekkoChart";
    margin = MARGIN;
    hoveredKey = null;
    data = [];
    label = "";
    width;
    height;
    classInput;
    get hostClass() { return classNames("st-marimekkoChart", this.classInput); }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 300; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get totalWidth() {
        const sum = (this.data ?? []).reduce((acc, d) => acc + (Number.isFinite(d.width) && d.width > 0 ? d.width : 0), 0);
        return sum > 0 ? sum : 1;
    }
    get cells() {
        let xCursor = MARGIN.left;
        const result = [];
        for (const datum of this.data ?? []) {
            const safeW = Number.isFinite(datum.width) && datum.width > 0 ? datum.width : 0;
            if (safeW <= 0)
                continue;
            const colW = (safeW / this.totalWidth) * this.plotWidth;
            const colPct = safeW / this.totalWidth;
            const validSegs = datum.segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
            const segSum = validSegs.reduce((acc, s) => acc + s.value, 0);
            const safeSum = segSum > 0 ? segSum : 1;
            let yCursor = MARGIN.top;
            for (let si = 0; si < validSegs.length; si++) {
                const seg = validSegs[si];
                const pct = seg.value / safeSum;
                const segH = pct * this.plotHeight;
                const tone = seg.tone ?? TONES[si % TONES.length];
                const w = Math.max(colW - 1, 1);
                const h = Math.max(segH, 1);
                result.push({
                    key: `${datum.label}-${seg.label}`, catLabel: datum.label, segLabel: seg.label, tone,
                    x: xCursor, y: yCursor, w, h, cx: xCursor + colW / 2, cy: yCursor + segH / 2,
                    pct, colPct, textColor: contrastTextForTone(tone), showLabel: w > 28 && h > 14,
                });
                yCursor += segH;
            }
            xCursor += colW;
        }
        return result;
    }
    get catLabels() {
        const result = [];
        for (const datum of this.data ?? []) {
            if (!Number.isFinite(datum.width) || datum.width <= 0)
                continue;
            const firstCell = this.cells.find((c) => c.catLabel === datum.label);
            if (!firstCell)
                continue;
            const colW = (datum.width / this.totalWidth) * this.plotWidth;
            result.push({ label: datum.label, x: firstCell.x + colW / 2 });
        }
        return result;
    }
    get dataValueItems() {
        return this.cells.map((c) => `${c.catLabel}, ${c.segLabel}: ${Math.round(c.pct * 100)}% (colonne ${Math.round(c.colPct * 100)}%)`);
    }
    get hoveredCell() {
        return this.hoveredKey !== null ? (this.cells.find((c) => c.key === this.hoveredKey) ?? null) : null;
    }
    cellClass(cell) {
        return classNames("st-marimekkoChart__cell", `st-marimekkoChart__cell--${cell.tone}`, this.hoveredKey !== null && this.hoveredKey !== cell.key && "st-marimekkoChart__cell--dim");
    }
    cellPct(value) { return Math.round(value * 100); }
    tooltipLeft() { const c = this.hoveredCell; return c ? `${(c.cx / this.widthValue) * 100}%` : "0%"; }
    tooltipTop() { const c = this.hoveredCell; return c ? `${(c.cy / this.heightValue) * 100}%` : "0%"; }
    handleLeave() { this.hoveredKey = null; }
    handlePointerMove(event) {
        const target = event.target;
        this.hoveredKey = target?.getAttribute?.("data-chart-key") ?? null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MarimekkoChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MarimekkoChart, isStandalone: true, selector: "st-marimekko-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-marimekkoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <line class="st-marimekkoChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @for (cell of cells; track cell.key) {
            <rect [class]="cellClass(cell)" [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.w" [attr.height]="cell.h" [attr.data-chart-key]="cell.key"></rect>
            @if (cell.showLabel) {
              <text class="st-marimekkoChart__cellLabel" [attr.x]="cell.cx" [attr.y]="cell.cy" text-anchor="middle" dominant-baseline="middle" [attr.fill]="cell.textColor" pointer-events="none">{{ cellPct(cell.pct) }}%</text>
            }
          }
          @for (cat of catLabels; track cat.label) {
            <text class="st-marimekkoChart__catLabel" [attr.x]="cat.x" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ cat.label }}</text>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredCell) {
        <div class="st-marimekkoChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-marimekkoChart__tooltipLabel">{{ hoveredCell.catLabel }} / {{ hoveredCell.segLabel }}</span>
          <span class="st-marimekkoChart__tooltipValue">{{ cellPct(hoveredCell.pct) }}%</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MarimekkoChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-marimekko-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-marimekkoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <line class="st-marimekkoChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @for (cell of cells; track cell.key) {
            <rect [class]="cellClass(cell)" [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.w" [attr.height]="cell.h" [attr.data-chart-key]="cell.key"></rect>
            @if (cell.showLabel) {
              <text class="st-marimekkoChart__cellLabel" [attr.x]="cell.cx" [attr.y]="cell.cy" text-anchor="middle" dominant-baseline="middle" [attr.fill]="cell.textColor" pointer-events="none">{{ cellPct(cell.pct) }}%</text>
            }
          }
          @for (cat of catLabels; track cat.label) {
            <text class="st-marimekkoChart__catLabel" [attr.x]="cat.x" [attr.y]="heightValue - margin.bottom + 16" text-anchor="middle">{{ cat.label }}</text>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredCell) {
        <div class="st-marimekkoChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-marimekkoChart__tooltipLabel">{{ hoveredCell.catLabel }} / {{ hoveredCell.segLabel }}</span>
          <span class="st-marimekkoChart__tooltipValue">{{ cellPct(hoveredCell.pct) }}%</span>
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
//# sourceMappingURL=MarimekkoChart.js.map