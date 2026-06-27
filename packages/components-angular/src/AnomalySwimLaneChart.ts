import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AnomalySwimLaneTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AnomalySwimLaneChartScale = "categorical" | "sequential";

export type AnomalySwimLaneBucket = {
  at: number;
  score: number;
};

export type AnomalySwimLaneSeries = {
  job: string;
  buckets: AnomalySwimLaneBucket[];
};

export type AnomalySwimLaneChartProps = {
  data: AnomalySwimLaneSeries[];
  max?: number;
  scale?: AnomalySwimLaneChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

type AnomalyRowCell = {
  key: string;
  datum: AnomalySwimLaneBucket;
  x: number;
  width: number;
  cx: number;
  tone: AnomalySwimLaneTone;
};

type AnomalyRow = {
  datum: AnomalySwimLaneSeries;
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  cells: AnomalyRowCell[];
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 132 } as const;
const TONES: AnomalySwimLaneTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function normalizedScale(value: AnomalySwimLaneChartScale | undefined): AnomalySwimLaneChartScale {
  return value === "categorical" ? "categorical" : "sequential";
}

function toneForScore(score: number, scoreMax: number): AnomalySwimLaneTone {
  if (!Number.isFinite(score) || scoreMax <= 0) return "category1";
  const ratio = Math.max(0, Math.min(1, score / scoreMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
}

function ellipsizeLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

function formatTickLabel(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

@Component({
  selector: "st-anomaly-swim-lane-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-anomalySwimLaneChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
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
          @for (column of columns; track column.at) {
            <text
              class="st-anomalySwimLaneChart__tickLabel"
              [attr.x]="column.cx"
              [attr.y]="resolvedHeight - margin.bottom + 16"
              text-anchor="middle"
            >{{ formatTick(column.at) }}</text>
          }

          <line
            class="st-anomalySwimLaneChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-anomalySwimLaneChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>

          @for (row of rows; track row.index) {
            <text
              class="st-anomalySwimLaneChart__jobLabel"
              [attr.x]="margin.left - 8"
              [attr.y]="row.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsize(row.datum.job, 18) }}</text>

            @for (cell of row.cells; track cell.key) {
              <rect
                [attr.class]="cellClass(cell.key, cell.tone)"
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

      @if (hasLegend) {
        <div class="st-anomalySwimLaneChart__legend" aria-hidden="true">
          <span class="st-anomalySwimLaneChart__legendText">Low</span>
          <span class="st-anomalySwimLaneChart__legendRamp">
            @for (tone of tones; track tone) {
              <span [attr.class]="'st-anomalySwimLaneChart__legendSwatch st-anomalySwimLaneChart__legendSwatch--' + tone"></span>
            }
          </span>
          <span class="st-anomalySwimLaneChart__legendText">High</span>
        </div>
      }

      @if (dataValueItems.length > 0) {
        <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'anomaly swim lane')">
          @for (item of dataValueItems; track $index) {
            <li>{{ item }}</li>
          }
        </ul>
      }

      @if (hoveredCell; as hovered) {
        <div
          class="st-anomalySwimLaneChart__tooltip"
          role="presentation"
          [style.left.%]="(hovered.cell.cx / resolvedWidth) * 100"
          [style.top.%]="(hovered.row.rowCenterY / resolvedHeight) * 100"
        >
          <span class="st-anomalySwimLaneChart__tooltipLabel">{{ hovered.row.datum.job }} · {{ hovered.cell.datum.at }}</span>
          <span class="st-anomalySwimLaneChart__tooltipValue">{{ hovered.cell.datum.score }}</span>
        </div>
      }
    </div>
  `,
})
export class AnomalySwimLaneChart {
  static readonly stComponentName = "AnomalySwimLaneChart";
  readonly componentName = "AnomalySwimLaneChart";
  readonly margin = MARGIN;
  readonly tones = TONES;

  @NgInput() data: AnomalySwimLaneSeries[] = [];
  @NgInput() max?: number;
  @NgInput() scale?: AnomalySwimLaneChartScale;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  hoveredKey: string | null = null;

  get resolvedScale(): AnomalySwimLaneChartScale {
    return normalizedScale(this.scale);
  }

  get resolvedWidth(): number {
    return this.width ?? this.size ?? 520;
  }

  get resolvedHeight(): number {
    return this.height ?? 300;
  }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
  }

  get hostClass(): string {
    return classNames("st-anomalySwimLaneChart", `st-anomalySwimLaneChart--${this.resolvedScale}`, this.classInput);
  }

  get plotWidth(): number {
    return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
  }

  get validData(): AnomalySwimLaneSeries[] {
    return (this.data ?? [])
      .filter((datum) => typeof datum.job === "string" && datum.job.length > 0)
      .map((datum) => ({
        job: datum.job,
        buckets: (datum.buckets ?? [])
          .filter((bucket) => Number.isFinite(bucket.at))
          .map((bucket) => ({ at: bucket.at, score: bucket.score })),
      }));
  }

  get columnOrder(): number[] {
    const order: number[] = [];
    for (const datum of this.validData) {
      for (const bucket of datum.buckets) {
        if (!order.includes(bucket.at)) order.push(bucket.at);
      }
    }
    order.sort((a, b) => a - b);
    return order;
  }

  get scoreMax(): number {
    if (typeof this.max === "number" && Number.isFinite(this.max) && this.max > 0) return this.max;
    const scores = this.validData.flatMap((datum) => datum.buckets.map((bucket) => bucket.score)).filter(Number.isFinite);
    return scores.length > 0 ? Math.max(...scores) : 1;
  }

  get rows(): AnomalyRow[] {
    const validData = this.validData;
    const columnOrder = this.columnOrder;
    if (validData.length === 0 || columnOrder.length === 0) return [];

    const band = this.plotHeight / validData.length;
    const rowHeight = Math.min(band * 0.78, 34);
    const colWidth = this.plotWidth / columnOrder.length;

    return validData.map((datum, rowIndex) => {
      const y = MARGIN.top + band * rowIndex + (band - rowHeight) / 2;
      const cells = datum.buckets.map((bucket, cellIndex) => {
        const columnIndex = Math.max(0, columnOrder.indexOf(bucket.at));
        const x = MARGIN.left + columnIndex * colWidth;
        const width = Math.max(colWidth - 2, 1);
        return {
          key: `${rowIndex}-${cellIndex}`,
          datum: bucket,
          x,
          width,
          cx: x + width / 2,
          tone: toneForScore(bucket.score, this.scoreMax),
        };
      });

      return {
        datum,
        index: rowIndex,
        y,
        height: rowHeight,
        rowCenterY: MARGIN.top + band * (rowIndex + 0.5),
        cells,
      };
    });
  }

  get columns(): Array<{ at: number; cx: number }> {
    const columnOrder = this.columnOrder;
    if (columnOrder.length === 0) return [];
    const colWidth = this.plotWidth / columnOrder.length;
    return columnOrder.map((at, index) => ({
      at,
      cx: MARGIN.left + (index + 0.5) * colWidth,
    }));
  }

  get dataValueItems(): string[] {
    return this.validData.map((datum) => `${datum.job}: ${datum.buckets.map((bucket) => `${bucket.at} = ${bucket.score}`).join(", ")}`);
  }

  get hasLegend(): boolean {
    return this.validData.length > 0 && this.columnOrder.length > 0;
  }

  get hoveredCell(): { row: AnomalyRow; cell: AnomalyRowCell } | null {
    if (this.hoveredKey === null) return null;
    for (const row of this.rows) {
      for (const cell of row.cells) {
        if (cell.key === this.hoveredKey) return { row, cell };
      }
    }
    return null;
  }

  ellipsize(text: string, maxChars: number): string {
    return ellipsizeLabel(text, maxChars);
  }

  formatTick(value: number): string {
    return formatTickLabel(value);
  }

  cellClass(key: string, tone: AnomalySwimLaneTone): string {
    return classNames(
      "st-anomalySwimLaneChart__cell",
      `st-anomalySwimLaneChart__cell--${tone}`,
      this.hoveredKey !== null && this.hoveredKey !== key ? "st-anomalySwimLaneChart__cell--dim" : undefined,
    );
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredKey = null;
      return;
    }
    this.hoveredKey = target.getAttribute("data-chart-key");
  }

  handleLeave(): void {
    this.hoveredKey = null;
  }
}
