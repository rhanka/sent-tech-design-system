import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type RadarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RadarChartSeries = {
  label: string;
  values: number[];
  tone?: RadarChartTone;
};

export type RadarChartProps = {
  axes: string[];
  series: RadarChartSeries[];
  maxValue?: number;
  levels?: number;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const TONES: RadarChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

type AxisEntry = {
  axis: string;
  index: number;
  angle: number;
  endX: number;
  endY: number;
  labelX: number;
  labelY: number;
};

type RadarPolygon = {
  entry: RadarChartSeries;
  tone: RadarChartTone;
  points: Array<{ x: number; y: number }>;
  pointString: string;
};

@Component({
  selector: "st-radar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-radarChart__visual"
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
          @for (ring of rings; track $index) {
            <polygon class="st-radarChart__ring" [attr.points]="ring"></polygon>
          }

          @for (axis of axisEntries; track axis.axis) {
            <line class="st-radarChart__axis" [attr.x1]="centerX" [attr.x2]="axis.endX" [attr.y1]="centerY" [attr.y2]="axis.endY"></line>
            <text
              class="st-radarChart__axisLabel"
              [attr.x]="axis.labelX"
              [attr.y]="axis.labelY"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ axis.axis }}</text>
          }

          @for (polygon of polygons; track polygon.entry.label; let i = $index) {
            <polygon
              [class]="polygonClass(polygon, i)"
              [attr.points]="polygon.pointString"
              [attr.data-chart-index]="i"
            ></polygon>
            @for (point of polygon.points; track $index) {
              <circle
                [class]="\'st-radarChart__point st-radarChart__point--\' + polygon.tone"
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r="3"
                [attr.data-chart-index]="i"
              ></circle>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && polygons[hoveredIndex]) {
        <div class="st-radarChart__tooltip" role="presentation">
          <span class="st-radarChart__tooltipLabel">{{ polygons[hoveredIndex].entry.label }}</span>
        </div>
      }

      @if (legend && legendItems.length > 0) {
        <ul class="st-radarChart__legend" aria-hidden="true">
          @for (item of legendItems; track item.label) {
            <li class="st-radarChart__legendItem">
              <span [class]="\'st-radarChart__legendSwatch st-radarChart__legendSwatch--\' + item.tone"></span>
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class RadarChart {
  static readonly stComponentName = "RadarChart";
  readonly componentName = "RadarChart";

  hoveredIndex: number | null = null;

  @NgInput() axes: string[] = [];
  @NgInput() series: RadarChartSeries[] = [];
  @NgInput() maxValue?: number;
  @NgInput() levels?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() legend?: boolean;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-radarChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 360; }
  get heightValue(): number { return this.height ?? 320; }
  get levelCount(): number { return Math.max(1, Math.floor(this.levels ?? 4)); }
  get centerX(): number { return this.widthValue / 2; }
  get centerY(): number { return this.heightValue / 2; }
  get radius(): number { return Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 42, 1); }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get domainMax(): number {
    if (Number.isFinite(this.maxValue) && (this.maxValue ?? 0) > 0) return this.maxValue as number;
    const values = this.series.flatMap((s) => s.values).filter(Number.isFinite);
    return Math.max(1, ...values);
  }

  pointAt(radius: number, angle: number): { x: number; y: number } {
    return {
      x: this.centerX + radius * Math.cos(angle),
      y: this.centerY + radius * Math.sin(angle),
    };
  }

  get axisEntries(): AxisEntry[] {
    const numAxes = Math.max(this.axes.length, 1);
    return this.axes.map((axis, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / numAxes;
      const end = this.pointAt(this.radius, angle);
      const label = this.pointAt(this.radius + 22, angle);
      return { axis, index, angle, endX: end.x, endY: end.y, labelX: label.x, labelY: label.y };
    });
  }

  get rings(): string[] {
    return Array.from({ length: this.levelCount }, (_, index) => {
      const ringRadius = (this.radius * (index + 1)) / this.levelCount;
      return this.axisEntries
        .map((axis) => this.pointAt(ringRadius, axis.angle))
        .map((p) => `${p.x},${p.y}`)
        .join(" ");
    });
  }

  get polygons(): RadarPolygon[] {
    const numAxes = Math.max(this.axes.length, 1);
    return this.series.map((entry, seriesIndex) => {
      const tone = entry.tone ?? TONES[seriesIndex % TONES.length];
      const points = this.axes.map((_, axisIndex) => {
        const value = Math.max(0, entry.values[axisIndex] ?? 0);
        const scaled = Math.min(value / this.domainMax, 1) * this.radius;
        const angle = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / numAxes;
        return this.pointAt(scaled, angle);
      });
      return {
        entry,
        tone,
        points,
        pointString: points.map((p) => `${p.x},${p.y}`).join(" "),
      };
    });
  }

  get legendItems(): Array<{ label: string; tone: RadarChartTone }> {
    return this.series.map((s, i) => ({ label: s.label, tone: s.tone ?? TONES[i % TONES.length] }));
  }

  get dataValueItems(): string[] {
    return this.series.flatMap((s) =>
      this.axes.map((axis, axisIndex) => `${s.label}, ${axis}: ${s.values[axisIndex] ?? 0}`),
    );
  }

  polygonClass(polygon: RadarPolygon, i: number): string {
    return classNames(
      "st-radarChart__polygon",
      `st-radarChart__polygon--${polygon.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-radarChart__polygon--dim",
    );
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
