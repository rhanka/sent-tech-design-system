import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 };
export class RenkoChart {
    static stComponentName = "RenkoChart";
    componentName = "RenkoChart";
    margin = MARGIN;
    data = [];
    boxSize;
    label;
    width;
    height;
    size;
    classInput;
    hoveredKey = null;
    get hostClass() { return ["st-renkoChart", this.classInput].filter(Boolean).join(" "); }
    get resolvedWidth() { return this.finitePositive(this.width, 640); }
    get resolvedHeight() { return this.finitePositive(this.height, 320); }
    get viewBox() { return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`; }
    get validData() {
        return (this.data ?? []).filter((datum) => Boolean(datum) && Number.isFinite(datum.date) && Number.isFinite(datum.close));
    }
    get closes() { return this.validData.map((datum) => datum.close); }
    get effectiveBox() {
        if (typeof this.boxSize === "number" && Number.isFinite(this.boxSize) && this.boxSize > 0)
            return this.boxSize;
        if (!this.closes.length)
            return 1;
        const span = Math.max(...this.closes) - Math.min(...this.closes);
        return span > 0 ? span / 20 : 1;
    }
    get bricks() {
        const bricks = [];
        if (this.validData.length === 0 || this.effectiveBox <= 0)
            return bricks;
        let base = this.validData[0].close;
        let direction = null;
        for (let index = 1; index < this.validData.length; index++) {
            const price = this.validData[index].close;
            if (direction !== "down") {
                while (price >= base + this.effectiveBox) {
                    bricks.push({ bottom: base, top: base + this.effectiveBox, direction: "up" });
                    base += this.effectiveBox;
                    direction = "up";
                }
            }
            if (direction === "up") {
                if (price <= base - 2 * this.effectiveBox) {
                    base -= this.effectiveBox;
                    do {
                        bricks.push({ bottom: base - this.effectiveBox, top: base, direction: "down" });
                        base -= this.effectiveBox;
                        direction = "down";
                    } while (price <= base - this.effectiveBox);
                }
                continue;
            }
            while (price <= base - this.effectiveBox) {
                bricks.push({ bottom: base - this.effectiveBox, top: base, direction: "down" });
                base -= this.effectiveBox;
                direction = "down";
            }
            if (direction === "down" && price >= base + 2 * this.effectiveBox) {
                base += this.effectiveBox;
                do {
                    bricks.push({ bottom: base, top: base + this.effectiveBox, direction: "up" });
                    base += this.effectiveBox;
                    direction = "up";
                } while (price >= base + this.effectiveBox);
            }
        }
        return bricks;
    }
    get priceMin() {
        if (!this.bricks.length)
            return this.closes.length ? Math.min(...this.closes) : 0;
        return Math.min(...this.bricks.map((brick) => brick.bottom));
    }
    get priceMax() {
        if (!this.bricks.length)
            return this.closes.length ? Math.max(...this.closes) : 0;
        return Math.max(...this.bricks.map((brick) => brick.top));
    }
    get yTicks() { return niceTicks(this.priceMin, this.priceMax); }
    get yMin() { return this.yTicks[0] ?? 0; }
    get yMax() { return this.yTicks[this.yTicks.length - 1] ?? 1; }
    get plotWidth() { return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1); }
    get yAxisTicks() {
        return this.yTicks.map((value) => ({ value, y: MARGIN.top + scaleLinear(value, this.yMin, this.yMax, this.plotHeight, 0) }));
    }
    get columns() {
        const colWidth = this.bricks.length > 0 ? this.plotWidth / this.bricks.length : this.plotWidth;
        const brickWidth = colWidth * 0.86;
        return this.bricks.map((brick, index) => {
            const cx = MARGIN.left + colWidth * index + colWidth / 2;
            const top = MARGIN.top + scaleLinear(brick.top, this.yMin, this.yMax, this.plotHeight, 0);
            const bottom = MARGIN.top + scaleLinear(brick.bottom, this.yMin, this.yMax, this.plotHeight, 0);
            return {
                key: `${index}`,
                brick,
                x: cx - brickWidth / 2,
                y: Math.min(top, bottom),
                width: brickWidth,
                height: Math.max(Math.abs(bottom - top), 0.5),
                cx,
                cy: (top + bottom) / 2,
                direction: brick.direction,
            };
        });
    }
    get dataValueItems() {
        return this.columns.map((column) => `${column.direction === "up" ? "UP" : "DOWN"} ${formatTick(column.brick.bottom)} -> ${formatTick(column.brick.top)}`);
    }
    get hoveredColumn() { return this.hoveredKey === null ? null : this.columns.find((column) => column.key === this.hoveredKey) ?? null; }
    get tooltipLeft() { const column = this.hoveredColumn; return column ? `${(column.cx / this.resolvedWidth) * 100}%` : "0"; }
    get tooltipTop() { const column = this.hoveredColumn; return column ? `${(column.cy / this.resolvedHeight) * 100}%` : "0"; }
    get tooltipLabel() { const column = this.hoveredColumn; return column ? (column.direction === "up" ? "UP" : "DOWN") : ""; }
    get tooltipValue() { const column = this.hoveredColumn; return column ? `${formatTick(column.brick.bottom)} -> ${formatTick(column.brick.top)}` : ""; }
    handlePointerMove(event) { const target = event.target; this.hoveredKey = target instanceof Element ? target.getAttribute("data-chart-key") : null; }
    handleLeave() { this.hoveredKey = null; }
    brickClass(column) { return classNames("st-renkoChart__brick", `st-renkoChart__brick--${column.direction}`, this.hoveredKey !== null && this.hoveredKey !== column.key ? "st-renkoChart__brick--dim" : undefined); }
    format(value) { return formatTick(value); }
    finitePositive(value, fallback) { return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback; }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RenkoChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: RenkoChart, isStandalone: true, selector: "st-renko-chart", inputs: { data: "data", boxSize: "boxSize", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-renkoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <ng-container *ngFor="let tick of yAxisTicks">
            <line class="st-renkoChart__grid" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text class="st-renkoChart__tick" [attr.x]="margin.left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle">{{ format(tick.value) }}</text>
          </ng-container>
          <line class="st-renkoChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <line class="st-renkoChart__axis" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="resolvedHeight - margin.bottom" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <rect *ngFor="let column of columns" [attr.class]="brickClass(column)" [attr.x]="column.x" [attr.y]="column.y" [attr.width]="column.width" [attr.height]="column.height" [attr.data-chart-key]="column.key"></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'renko') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div class="st-renkoChart__tooltip" role="presentation" [style.display]="hoveredColumn ? 'inline-flex' : 'none'" [style.left]="tooltipLeft" [style.top]="tooltipTop">
        <span class="st-renkoChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-renkoChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RenkoChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-renko-chart",
                    standalone: true,
                    imports: [NgFor],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-renkoChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handlePointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          <ng-container *ngFor="let tick of yAxisTicks">
            <line class="st-renkoChart__grid" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text class="st-renkoChart__tick" [attr.x]="margin.left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle">{{ format(tick.value) }}</text>
          </ng-container>
          <line class="st-renkoChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <line class="st-renkoChart__axis" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="resolvedHeight - margin.bottom" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <rect *ngFor="let column of columns" [attr.class]="brickClass(column)" [attr.x]="column.x" [attr.y]="column.y" [attr.width]="column.width" [attr.height]="column.height" [attr.data-chart-key]="column.key"></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'renko') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div class="st-renkoChart__tooltip" role="presentation" [style.display]="hoveredColumn ? 'inline-flex' : 'none'" [style.left]="tooltipLeft" [style.top]="tooltipTop">
        <span class="st-renkoChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-renkoChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], boxSize: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=RenkoChart.js.map