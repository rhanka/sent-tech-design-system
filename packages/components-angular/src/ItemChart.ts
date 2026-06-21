import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ItemChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ItemChartDatum = {
  label: string;
  value: number;
  tone?: ItemChartTone;
};

export type ItemChartSeat = {
  x: number;
  y: number;
  r: number;
  tone: ItemChartTone;
  groupIndex: number;
};

export type ItemChartProps = {
  data: ItemChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ItemChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function seatCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

export function buildSeats(
  counts: number[],
  width: number,
  height: number,
): { seats: ItemChartSeat[]; cx: number; cy: number } {
  const total = counts.reduce((sum, c) => sum + c, 0);
  const cx = width / 2;
  const cy = height - 8;
  if (total <= 0) return { seats: [], cx, cy };

  const rows = Math.max(1, Math.min(5, Math.round(Math.sqrt(total / 12)) || 1));
  const outerR = Math.max(Math.min(cx, cy) - 14, 1);
  const innerR = outerR * 0.42;
  const rowGap = rows > 1 ? (outerR - innerR) / (rows - 1) : 0;

  const radii: number[] = [];
  let weightSum = 0;
  for (let r = 0; r < rows; r++) {
    const radius = rows > 1 ? innerR + rowGap * r : (innerR + outerR) / 2;
    radii.push(radius);
    weightSum += radius;
  }

  const perRowFloat = radii.map((radius) => (total * radius) / weightSum);
  const perRow = perRowFloat.map((v) => Math.floor(v));
  let assigned = perRow.reduce((sum, c) => sum + c, 0);
  const residuals = perRowFloat
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  let ri = 0;
  while (assigned < total) {
    perRow[residuals[ri % residuals.length].i] += 1;
    assigned += 1;
    ri += 1;
  }

  const seatR = Math.max(2, Math.min(rowGap > 0 ? rowGap * 0.34 : outerR * 0.12, outerR * 0.12));

  const ordered: { x: number; y: number; r: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const radius = radii[r];
    const n = perRow[r];
    if (n <= 0) continue;
    for (let s = 0; s < n; s++) {
      const t = n === 1 ? 0.5 : s / (n - 1);
      const angle = Math.PI - t * Math.PI;
      ordered.push({
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle),
        r: seatR,
      });
    }
  }

  const seats: ItemChartSeat[] = [];
  let cursor = 0;
  for (let g = 0; g < counts.length; g++) {
    const tone = TONES[g % TONES.length];
    for (let k = 0; k < counts[g] && cursor < ordered.length; k++) {
      const seat = ordered[cursor++];
      seats.push({ x: seat.x, y: seat.y, r: seat.r, tone, groupIndex: g });
    }
  }
  return { seats, cx, cy };
}

type Group = {
  datum: ItemChartDatum;
  count: number;
  tone: ItemChartTone;
};

@Component({
  selector: "st-item-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-itemChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (seat of seats; track $index) {
            <circle
              [class]="seatClass(seat)"
              [attr.cx]="seat.x"
              [attr.cy]="seat.y"
              [attr.r]="seat.r"
              [attr.data-chart-index]="seat.groupIndex"
            ></circle>
          }
          @if (total > 0) {
            <text
              class="st-itemChart__total"
              [attr.x]="layout.cx"
              [attr.y]="layout.cy - 6"
              text-anchor="middle"
            >{{ total }}</text>
          }
        </svg>
      </div>

      <ul class="st-itemChart__legend" aria-hidden="true">
        @for (group of groups; track group.datum.label; let i = $index) {
          <li [class]="legendItemClass(i)">
            <span [class]="'st-itemChart__swatch st-itemChart__swatch--' + group.tone"></span>
            <span class="st-itemChart__legendLabel">{{ group.datum.label }}</span>
            <span class="st-itemChart__legendValue">{{ group.count }}</span>
          </li>
        }
      </ul>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredGroup; as group) {
        <div class="st-itemChart__tooltip" role="presentation">
          <span class="st-itemChart__tooltipLabel">{{ group.datum.label }}</span>
          <span class="st-itemChart__tooltipValue">{{ group.count }}</span>
        </div>
      }
    </div>
  `,
})
export class ItemChart {
  static readonly stComponentName = "ItemChart";
  readonly componentName = "ItemChart";

  hoveredIndex: number | null = null;

  @NgInput() data: ItemChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-itemChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 280;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get groups(): Group[] {
    return (this.data ?? []).map((datum, index) => ({
      datum,
      count: seatCount(datum.value),
      tone: datum.tone ?? TONES[index % TONES.length],
    }));
  }

  get layout(): { seats: ItemChartSeat[]; cx: number; cy: number } {
    return buildSeats(
      this.groups.map((g) => g.count),
      this.widthValue,
      this.heightValue,
    );
  }

  get seats(): ItemChartSeat[] {
    return this.layout.seats.map((seat) => ({
      ...seat,
      tone: this.groups[seat.groupIndex]?.tone ?? seat.tone,
    }));
  }

  get total(): number {
    return this.groups.reduce((sum, g) => sum + g.count, 0);
  }

  get dataValueItems(): string[] {
    return this.groups.map((g) => `${g.datum.label}: ${g.count}`);
  }

  get hoveredGroup(): Group | null {
    if (this.hoveredIndex === null) return null;
    return this.groups[this.hoveredIndex] ?? null;
  }

  seatClass(seat: ItemChartSeat): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== seat.groupIndex;
    return classNames(
      "st-itemChart__seat",
      `st-itemChart__seat--${seat.tone}`,
      dim && "st-itemChart__seat--dim",
    );
  }

  legendItemClass(index: number): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== index;
    return classNames("st-itemChart__legendItem", dim && "st-itemChart__legendItem--dim");
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as Element | null;
    const attr = target?.getAttribute("data-chart-index");
    if (attr != null) {
      const idx = Number(attr);
      if (Number.isInteger(idx)) {
        this.hoveredIndex = idx;
        return;
      }
    }
    this.hoveredIndex = null;
  }
}
