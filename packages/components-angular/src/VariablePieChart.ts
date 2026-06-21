import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";

export type VariablePieChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VariablePieChartDatum = {
  label: string;
  value: number;
  z: number;
  tone?: VariablePieChartTone;
};

export type VariablePieChartProps = {
  data: VariablePieChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: VariablePieChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

type Sector = {
  datum: VariablePieChartDatum;
  value: number;
  z: number;
  tone: VariablePieChartTone;
  radius: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
  showLabel: boolean;
};

function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function safeZ(z: number): number {
  return Number.isFinite(z) ? z : 0;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function point(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const outerStart = point(cx, cy, radius, start);
  const outerEnd = point(cx, cy, radius, safeEnd);
  return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
}

function computeSectors(data: VariablePieChartDatum[], width: number, height: number): Sector[] {
  const cx = width / 2;
  const cy = height / 2;
  const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
  const rMin = outerLimit * 0.35;
  const rMax = outerLimit;

  const visible = data.filter((datum) => safeValue(datum.value) > 0);
  if (visible.length === 0) return [];

  const total = visible.reduce((sum, datum) => sum + safeValue(datum.value), 0);
  if (total <= 0) return [];

  const zValues = visible.map((datum) => safeZ(datum.z));
  const zMin = Math.min(...zValues);
  const zMax = Math.max(...zValues);
  const zSpan = zMax - zMin;

  const TWO_PI = Math.PI * 2;
  let angle = -Math.PI / 2;

  return visible.map((datum, index) => {
    const value = safeValue(datum.value);
    const z = safeZ(datum.z);
    const radius = zSpan > 0 ? rMin + ((z - zMin) / zSpan) * (rMax - rMin) : rMax;
    const span = Math.min((value / total) * TWO_PI, TWO_PI - 0.0001);
    const start = angle;
    const end = angle + span;
    angle = end;
    const midAngle = (start + end) / 2;
    const labelPoint = point(cx, cy, radius * 0.62, midAngle);
    return {
      datum,
      value,
      z,
      tone: datum.tone ?? TONES[index % TONES.length],
      radius,
      start,
      end,
      path: sectorPath(cx, cy, radius, start, end),
      labelX: labelPoint.x,
      labelY: labelPoint.y,
      showLabel: span > 0.25 && radius > outerLimit * 0.4,
    };
  });
}

@Component({
  selector: "st-variable-pie-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-variablePieChart__visual"
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
          @for (sector of sectors; track sector.datum.label; let i = $index) {
            <path
              [class]="sectorClass(i)"
              [attr.d]="sector.path"
              [attr.data-chart-index]="i"
            ></path>
          }

          @for (sector of sectors; track sector.datum.label) {
            @if (sector.showLabel) {
              <text
                class="st-variablePieChart__label"
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

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && sectors[hoveredIndex]) {
        <div
          class="st-variablePieChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-variablePieChart__tooltipLabel">{{ sectors[hoveredIndex].datum.label }}</span>
          <span class="st-variablePieChart__tooltipValue">{{ formatNumber(sectors[hoveredIndex].value) }} · {{ formatNumber(sectors[hoveredIndex].z) }}</span>
        </div>
      }
    </div>
  `,
})
export class VariablePieChart {
  static readonly stComponentName = "VariablePieChart";
  readonly componentName = "VariablePieChart";

  hoveredIndex: number | null = null;

  @NgInput() data: VariablePieChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-variablePieChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 360; }
  get heightValue(): number { return this.height ?? 360; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }

  get sectors(): Sector[] {
    return computeSectors(this.data, this.widthValue, this.heightValue);
  }

  get dataValueItems(): string[] {
    return this.data
      .filter((datum) => safeValue(datum.value) > 0)
      .map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`);
  }

  sectorClass(i: number): string {
    const sector = this.sectors[i];
    return classNames(
      "st-variablePieChart__sector",
      sector ? `st-variablePieChart__sector--${sector.tone}` : "",
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-variablePieChart__sector--dim",
    );
  }

  contrastText(tone: VariablePieChartTone): string {
    return contrastTextForTone(tone);
  }

  formatNumber(value: number): string {
    return formatNumber(value);
  }

  get tooltipLeft(): number {
    const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : undefined;
    return s ? (s.labelX / this.widthValue) * 100 : 0;
  }

  get tooltipTop(): number {
    const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : undefined;
    return s ? (s.labelY / this.heightValue) * 100 : 0;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
