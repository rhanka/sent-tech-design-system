import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";

export type RoseChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RoseChartDatum = {
  label: string;
  value: number;
  tone?: RoseChartTone;
};

export type RoseChartProps = {
  data: RoseChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: RoseChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

type Sector = {
  datum: RoseChartDatum;
  value: number;
  tone: RoseChartTone;
  radius: number;
  path: string;
  labelX: number;
  labelY: number;
  showLabel: boolean;
};

@Component({
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
})
export class RoseChart {
  static readonly stComponentName = "RoseChart";
  readonly componentName = "RoseChart";

  hoveredIndex: number | null = null;

  @NgInput() data: RoseChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-roseChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 320; }
  get heightValue(): number { return this.height ?? 320; }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  private safeValue(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  private point(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  private sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
    const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
    const large = safeEnd - start > Math.PI ? 1 : 0;
    const outerStart = this.point(cx, cy, radius, start);
    const outerEnd = this.point(cx, cy, radius, safeEnd);
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  get sectors(): Sector[] {
    const cx = this.widthValue / 2;
    const cy = this.heightValue / 2;
    const outerLimit = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 6, 1);
    const count = this.data.length;
    if (count === 0) return [];

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

  get dataValueItems(): string[] {
    return this.data.map((d) => `${d.label}: ${this.formatNumber(this.safeValue(d.value))}`);
  }

  get tooltipLeft(): number {
    const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : null;
    return s ? (s.labelX / this.widthValue) * 100 : 0;
  }

  get tooltipTop(): number {
    const s = this.hoveredIndex !== null ? this.sectors[this.hoveredIndex] : null;
    return s ? (s.labelY / this.heightValue) * 100 : 0;
  }

  sectorClass(sector: Sector, i: number): string {
    return classNames(
      "st-roseChart__sector",
      `st-roseChart__sector--${sector.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-roseChart__sector--dim",
    );
  }

  contrastText(tone: RoseChartTone): string {
    return contrastTextForTone(tone);
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
