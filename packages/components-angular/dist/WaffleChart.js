import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const GAP = 2;
export class WaffleChart {
    static stComponentName = "WaffleChart";
    componentName = "WaffleChart";
    data = [];
    totalCells;
    columns;
    label;
    size;
    classInput;
    get hostClass() {
        return classNames("st-waffleChart", this.classInput);
    }
    get sizeValue() { return this.size ?? 240; }
    get safeTotalCells() { return Math.max(Math.round(this.totalCells ?? 100), 1); }
    get safeColumns() { return Math.max(Math.round(this.columns ?? 10), 1); }
    get rowsCount() { return Math.ceil(this.safeTotalCells / this.safeColumns); }
    get computedCellSize() {
        return (this.sizeValue - GAP * (this.safeColumns - 1)) / this.safeColumns;
    }
    get svgHeight() {
        return this.rowsCount > 0
            ? this.rowsCount * this.computedCellSize + GAP * (this.rowsCount - 1)
            : this.sizeValue;
    }
    get viewBox() {
        return `0 0 ${this.sizeValue} ${this.svgHeight}`;
    }
    get validData() {
        return this.data.filter((d) => typeof d.label === "string" && d.label.length > 0 && Number.isFinite(d.value) && d.value > 0);
    }
    get total() {
        return this.validData.reduce((sum, d) => sum + d.value, 0);
    }
    toneOf(datum, index) {
        return datum.tone ?? `category${(index % 8) + 1}`;
    }
    get allocation() {
        if (this.total <= 0)
            return [];
        let used = 0;
        const out = this.validData.map((datum, index) => {
            const cells = Math.round((datum.value / this.total) * this.safeTotalCells);
            return { datum, tone: this.toneOf(datum, index), cells, index };
        });
        for (const a of out)
            used += a.cells;
        const overflow = used - this.safeTotalCells;
        if (overflow !== 0 && out.length > 0) {
            const last = out[out.length - 1];
            last.cells = Math.max(0, last.cells - overflow);
        }
        return out;
    }
    get cellTones() {
        const tones = [];
        for (const a of this.allocation) {
            for (let i = 0; i < a.cells && tones.length < this.safeTotalCells; i++) {
                tones.push(a.tone);
            }
        }
        while (tones.length < this.safeTotalCells)
            tones.push(null);
        return tones;
    }
    get cells() {
        const cs = Math.max(this.computedCellSize, 1);
        return this.cellTones.map((tone, index) => {
            const col = index % this.safeColumns;
            const rowFromTop = this.rowsCount - 1 - Math.floor(index / this.safeColumns);
            return {
                index,
                tone,
                x: col * (cs + GAP),
                y: rowFromTop * (cs + GAP),
                cellSize: cs,
            };
        });
    }
    get legendItems() {
        return this.allocation.map((a) => ({
            label: a.datum.label,
            tone: a.tone,
            percent: this.total > 0 ? Math.round((a.datum.value / this.total) * 100) : 0,
        }));
    }
    get hasLegend() {
        return this.allocation.length > 0;
    }
    get dataValueItems() {
        return this.allocation.map((a) => `${a.datum.label}: ${a.datum.value} (${this.total > 0 ? Math.round((a.datum.value / this.total) * 100) : 0}%)`);
    }
    cellClass(cell) {
        return cell.tone
            ? classNames("st-waffleChart__cell", `st-waffleChart__cell--${cell.tone}`)
            : classNames("st-waffleChart__cell", "st-waffleChart__cell--track");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: WaffleChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: WaffleChart, isStandalone: true, selector: "st-waffle-chart", inputs: { data: "data", totalCells: "totalCells", columns: "columns", label: "label", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-waffleChart__visual" role="img" [attr.aria-label]="label">
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (cell of cells; track cell.index) {
            <rect
              [class]="cellClass(cell)"
              [attr.x]="cell.x"
              [attr.y]="cell.y"
              [attr.width]="cell.cellSize"
              [attr.height]="cell.cellSize"
              rx="2"
            ></rect>
          }
        </svg>
      </div>

      @if (hasLegend) {
        <ul class="st-waffleChart__legend" [attr.aria-label]="\'Catégories de \' + (label ?? \'waffle\')">
          @for (item of legendItems; track item.label) {
            <li class="st-waffleChart__legendItem">
              <span [class]="\'st-waffleChart__legendSwatch st-waffleChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.label }} \xB7 {{ item.percent }}%
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + (label ?? \'waffle\')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: WaffleChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-waffle-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-waffleChart__visual" role="img" [attr.aria-label]="label">
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (cell of cells; track cell.index) {
            <rect
              [class]="cellClass(cell)"
              [attr.x]="cell.x"
              [attr.y]="cell.y"
              [attr.width]="cell.cellSize"
              [attr.height]="cell.cellSize"
              rx="2"
            ></rect>
          }
        </svg>
      </div>

      @if (hasLegend) {
        <ul class="st-waffleChart__legend" [attr.aria-label]="\'Catégories de \' + (label ?? \'waffle\')">
          @for (item of legendItems; track item.label) {
            <li class="st-waffleChart__legendItem">
              <span [class]="\'st-waffleChart__legendSwatch st-waffleChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.label }} \xB7 {{ item.percent }}%
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + (label ?? \'waffle\')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], totalCells: [{
                type: NgInput
            }], columns: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=WaffleChart.js.map