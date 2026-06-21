import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };
function ellipsize(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    if (maxChars <= 1)
        return "…";
    return `${text.slice(0, maxChars - 1)}…`;
}
export class StatusHistoryChart {
    static stComponentName = "StatusHistoryChart";
    componentName = "StatusHistoryChart";
    MARGIN = MARGIN;
    hoveredKey = null;
    data = [];
    label;
    width;
    height;
    size;
    classInput;
    get hostClass() {
        return classNames("st-statusHistoryChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? this.size ?? 640;
    }
    get heightValue() {
        return this.height ?? 320;
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
        return (this.data ?? [])
            .filter((d) => typeof d.series === "string" && d.series.length > 0)
            .map((d) => ({
            series: d.series,
            buckets: (d.buckets ?? [])
                .filter((b) => Number.isFinite(b.at))
                .map((b) => ({ at: b.at, value: b.value, tone: b.tone })),
        }));
    }
    get columnOrder() {
        const seen = [];
        for (const d of this.validData) {
            for (const b of d.buckets) {
                if (!seen.includes(b.at))
                    seen.push(b.at);
            }
        }
        return seen.sort((a, b) => a - b);
    }
    get statusOrder() {
        const seen = [];
        for (const d of this.validData) {
            for (const b of d.buckets) {
                const key = String(b.value);
                if (!seen.includes(key))
                    seen.push(key);
            }
        }
        return seen;
    }
    get explicitToneByStatus() {
        const map = new Map();
        for (const d of this.validData) {
            for (const b of d.buckets) {
                if (b.tone)
                    map.set(String(b.value), b.tone);
            }
        }
        return map;
    }
    toneOf(bucket) {
        if (bucket.tone)
            return bucket.tone;
        const key = String(bucket.value);
        const explicit = this.explicitToneByStatus.get(key);
        if (explicit)
            return explicit;
        const idx = this.statusOrder.indexOf(key);
        return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
    }
    get legendItems() {
        return this.statusOrder.map((value) => ({ value, tone: this.toneOf({ value }) }));
    }
    get rows() {
        if (this.validData.length === 0 || this.columnOrder.length === 0)
            return [];
        const band = this.plotHeight / this.validData.length;
        const rowHeight = Math.min(band * 0.62, 28);
        const colWidth = this.plotWidth / this.columnOrder.length;
        return this.validData.map((d, i) => {
            const y = MARGIN.top + band * i + (band - rowHeight) / 2;
            const cells = d.buckets.map((b, j) => {
                const colIndex = Math.max(0, this.columnOrder.indexOf(b.at));
                const x = MARGIN.left + colIndex * colWidth;
                const w = Math.max(colWidth - 2, 1);
                return {
                    key: `${i}-${j}`,
                    datum: b,
                    x,
                    width: w,
                    cx: x + w / 2,
                    tone: this.toneOf(b),
                };
            });
            return {
                datum: d,
                index: i,
                y,
                height: rowHeight,
                rowCenterY: MARGIN.top + band * (i + 0.5),
                cells,
            };
        });
    }
    get columnItems() {
        if (this.columnOrder.length === 0)
            return [];
        const colWidth = this.plotWidth / this.columnOrder.length;
        return this.columnOrder.map((at, index) => ({
            at,
            cx: MARGIN.left + (index + 0.5) * colWidth,
        }));
    }
    get hoveredCell() {
        if (!this.hoveredKey)
            return null;
        for (const row of this.rows) {
            for (const cell of row.cells) {
                if (cell.key === this.hoveredKey)
                    return { row, cell };
            }
        }
        return null;
    }
    get dataValueItems() {
        return this.validData.map((d) => `${d.series}: ${d.buckets.map((b) => `${b.at} = ${b.value}`).join(", ")}`);
    }
    formatAtLabel(at) {
        return formatTick(at);
    }
    ellipsizeLabel(text) {
        return ellipsize(text, 18);
    }
    cellClass(cell) {
        const dim = this.hoveredKey !== null && this.hoveredKey !== cell.key;
        return classNames("st-statusHistoryChart__cell", `st-statusHistoryChart__cell--${cell.tone}`, dim && "st-statusHistoryChart__cell--dim");
    }
    tooltipLeft(cell) {
        return (cell.cx / this.widthValue) * 100;
    }
    tooltipTop(row) {
        return (row.rowCenterY / this.heightValue) * 100;
    }
    handlePointerMove(e) {
        const target = e.target;
        const key = target?.getAttribute("data-chart-key");
        if (key != null)
            this.hoveredKey = key;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusHistoryChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StatusHistoryChart, isStandalone: true, selector: "st-status-history-chart", inputs: { data: "data", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-statusHistoryChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredKey = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (col of columnItems; track col.at) {
            <text class="st-statusHistoryChart__tickLabel"
              [attr.x]="col.cx"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatAtLabel(col.at) }}</text>
          }

          <line class="st-statusHistoryChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line class="st-statusHistoryChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (row of rows; track row.index) {
            <text class="st-statusHistoryChart__seriesLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="row.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsizeLabel(row.datum.series) }}</text>
            @for (cell of row.cells; track cell.key) {
              <rect
                [class]="cellClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="row.y"
                [attr.width]="cell.width"
                [attr.height]="row.height"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
            }
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-statusHistoryChart__legend" [attr.aria-label]="'Statuts de ' + (label ?? 'status history')">
          @for (item of legendItems; track item.value) {
            <li class="st-statusHistoryChart__legendItem">
              <span [class]="'st-statusHistoryChart__legendSwatch st-statusHistoryChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.value }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'status history')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell; as hc) {
        <div
          class="st-statusHistoryChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hc.cell)"
          [style.top.%]="tooltipTop(hc.row)"
        >
          <span class="st-statusHistoryChart__tooltipLabel">{{ hc.row.datum.series }} · {{ hc.cell.datum.at }}</span>
          <span class="st-statusHistoryChart__tooltipValue">{{ hc.cell.datum.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StatusHistoryChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-status-history-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-statusHistoryChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredKey = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (col of columnItems; track col.at) {
            <text class="st-statusHistoryChart__tickLabel"
              [attr.x]="col.cx"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatAtLabel(col.at) }}</text>
          }

          <line class="st-statusHistoryChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line class="st-statusHistoryChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (row of rows; track row.index) {
            <text class="st-statusHistoryChart__seriesLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="row.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsizeLabel(row.datum.series) }}</text>
            @for (cell of row.cells; track cell.key) {
              <rect
                [class]="cellClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="row.y"
                [attr.width]="cell.width"
                [attr.height]="row.height"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
            }
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-statusHistoryChart__legend" [attr.aria-label]="'Statuts de ' + (label ?? 'status history')">
          @for (item of legendItems; track item.value) {
            <li class="st-statusHistoryChart__legendItem">
              <span [class]="'st-statusHistoryChart__legendSwatch st-statusHistoryChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.value }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'status history')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell; as hc) {
        <div
          class="st-statusHistoryChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hc.cell)"
          [style.top.%]="tooltipTop(hc.row)"
        >
          <span class="st-statusHistoryChart__tooltipLabel">{{ hc.row.datum.series }} · {{ hc.cell.datum.at }}</span>
          <span class="st-statusHistoryChart__tooltipValue">{{ hc.cell.datum.value }}</span>
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
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StatusHistoryChart.js.map