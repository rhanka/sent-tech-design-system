import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick } from "./chartScale.js";

export type StatusHistoryTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StatusHistoryBucket = {
  at: number;
  value: string | number;
  tone?: StatusHistoryTone;
};

export type StatusHistorySeries = {
  series: string;
  buckets: StatusHistoryBucket[];
};

export type StatusHistoryChartProps = {
  data: StatusHistorySeries[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

type ValidBucket = { at: number; value: string | number; tone?: StatusHistoryTone };
type ValidRow = { series: string; buckets: ValidBucket[] };

type CellItem = {
  key: string;
  datum: ValidBucket;
  x: number;
  width: number;
  cx: number;
  tone: StatusHistoryTone;
};

type RowItem = {
  datum: ValidRow;
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  cells: CellItem[];
};

type ColumnItem = {
  at: number;
  cx: number;
};

type LegendItem = {
  value: string;
  tone: StatusHistoryTone;
};

@Component({
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
})
export class StatusHistoryChart {
  static readonly stComponentName = "StatusHistoryChart";
  readonly componentName = "StatusHistoryChart";
  readonly MARGIN = MARGIN;

  hoveredKey: string | null = null;

  @NgInput() data: StatusHistorySeries[] = [];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-statusHistoryChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? this.size ?? 640;
  }

  get heightValue(): number {
    return this.height ?? 320;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  get validData(): ValidRow[] {
    return (this.data ?? [])
      .filter((d) => typeof d.series === "string" && d.series.length > 0)
      .map((d) => ({
        series: d.series,
        buckets: (d.buckets ?? [])
          .filter((b) => Number.isFinite(b.at))
          .map((b) => ({ at: b.at, value: b.value, tone: b.tone })),
      }));
  }

  get columnOrder(): number[] {
    const seen: number[] = [];
    for (const d of this.validData) {
      for (const b of d.buckets) {
        if (!seen.includes(b.at)) seen.push(b.at);
      }
    }
    return seen.sort((a, b) => a - b);
  }

  get statusOrder(): string[] {
    const seen: string[] = [];
    for (const d of this.validData) {
      for (const b of d.buckets) {
        const key = String(b.value);
        if (!seen.includes(key)) seen.push(key);
      }
    }
    return seen;
  }

  get explicitToneByStatus(): Map<string, StatusHistoryTone> {
    const map = new Map<string, StatusHistoryTone>();
    for (const d of this.validData) {
      for (const b of d.buckets) {
        if (b.tone) map.set(String(b.value), b.tone);
      }
    }
    return map;
  }

  toneOf(bucket: { value: string | number; tone?: StatusHistoryTone }): StatusHistoryTone {
    if (bucket.tone) return bucket.tone;
    const key = String(bucket.value);
    const explicit = this.explicitToneByStatus.get(key);
    if (explicit) return explicit;
    const idx = this.statusOrder.indexOf(key);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StatusHistoryTone;
  }

  get legendItems(): LegendItem[] {
    return this.statusOrder.map((value) => ({ value, tone: this.toneOf({ value }) }));
  }

  get rows(): RowItem[] {
    if (this.validData.length === 0 || this.columnOrder.length === 0) return [];
    const band = this.plotHeight / this.validData.length;
    const rowHeight = Math.min(band * 0.62, 28);
    const colWidth = this.plotWidth / this.columnOrder.length;
    return this.validData.map((d, i) => {
      const y = MARGIN.top + band * i + (band - rowHeight) / 2;
      const cells: CellItem[] = d.buckets.map((b, j) => {
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

  get columnItems(): ColumnItem[] {
    if (this.columnOrder.length === 0) return [];
    const colWidth = this.plotWidth / this.columnOrder.length;
    return this.columnOrder.map((at, index) => ({
      at,
      cx: MARGIN.left + (index + 0.5) * colWidth,
    }));
  }

  get hoveredCell(): { row: RowItem; cell: CellItem } | null {
    if (!this.hoveredKey) return null;
    for (const row of this.rows) {
      for (const cell of row.cells) {
        if (cell.key === this.hoveredKey) return { row, cell };
      }
    }
    return null;
  }

  get dataValueItems(): string[] {
    return this.validData.map(
      (d) => `${d.series}: ${d.buckets.map((b) => `${b.at} = ${b.value}`).join(", ")}`,
    );
  }

  formatAtLabel(at: number): string {
    return formatTick(at);
  }

  ellipsizeLabel(text: string): string {
    return ellipsize(text, 18);
  }

  cellClass(cell: CellItem): string {
    const dim = this.hoveredKey !== null && this.hoveredKey !== cell.key;
    return classNames("st-statusHistoryChart__cell", `st-statusHistoryChart__cell--${cell.tone}`, dim && "st-statusHistoryChart__cell--dim");
  }

  tooltipLeft(cell: CellItem): number {
    return (cell.cx / this.widthValue) * 100;
  }

  tooltipTop(row: RowItem): number {
    return (row.rowCenterY / this.heightValue) * 100;
  }

  handlePointerMove(e: PointerEvent): void {
    const target = e.target as Element | null;
    const key = target?.getAttribute("data-chart-key");
    if (key != null) this.hoveredKey = key;
  }
}
