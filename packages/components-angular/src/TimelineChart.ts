import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type TimelineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TimelineChartEvent = {
  /** Point on the axis (year, day index, ordinal step…). */
  position: number;
  /** Required short label, shown above/below the marker (alternated). */
  label: string;
  /** Optional longer description, surfaced in the accessible list + tooltip. */
  description?: string;
  /** Optional explicit categorical tone; otherwise cycles category1..8. */
  tone?: TimelineChartTone;
};

export type TimelineChartProps = {
  data: TimelineChartEvent[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 32, left: 24 };
const TONES: TimelineChartTone[] = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];

type Marker = {
  index: number;
  event: TimelineChartEvent;
  x: number;
  labelY: number;
  above: boolean;
  tone: TimelineChartTone;
};

@Component({
  selector: "st-timeline-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-timelineChart__visual" role="img" [attr.aria-label]="label"
           (pointermove)="handlePointerMove($event)" (pointerleave)="hoveredIndex = null">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          <!-- Central axis line -->
          <line class="st-timelineChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="axisY"
            [attr.y2]="axisY"
          ></line>

          @for (m of markers; track m.index) {
            <!-- Connector from axis to label -->
            <line class="st-timelineChart__connector"
              [attr.x1]="m.x" [attr.x2]="m.x"
              [attr.y1]="axisY" [attr.y2]="m.labelY"
            ></line>

            <!-- Circle on axis -->
            <circle
              [class]="'st-timelineChart__marker st-timelineChart__marker--' + m.tone"
              [attr.cx]="m.x"
              [attr.cy]="axisY"
              r="5"
              [attr.data-chart-index]="m.index"
            ></circle>

            <!-- Label -->
            <text class="st-timelineChart__label"
              [attr.x]="m.x"
              [attr.y]="m.above ? m.labelY - 6 : m.labelY + 6"
              text-anchor="middle"
              [attr.dominant-baseline]="m.above ? 'auto' : 'hanging'"
            >{{ m.event.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredMarker) {
        <div class="st-timelineChart__tooltip" role="presentation" [style.left.%]="tooltipLeft(hoveredMarker)" [style.top.%]="50">
          <span class="st-timelineChart__tooltipLabel">{{ hoveredMarker.event.label }}</span>
          @if (hoveredMarker.event.description) {
            <span class="st-timelineChart__tooltipValue">{{ hoveredMarker.event.description }}</span>
          }
        </div>
      }
    </div>
  `,
})
export class TimelineChart {
  static readonly stComponentName = "TimelineChart";
  readonly componentName = "TimelineChart";
  readonly MARGIN = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data!: TimelineChartEvent[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-timelineChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 640; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get safeData(): TimelineChartEvent[] { return this.data ?? []; }

  get axisY(): number {
    return MARGIN.top + this.plotHeight / 2;
  }

  get xDomain(): { min: number; max: number } {
    if (this.safeData.length === 0) return { min: 0, max: 1 };
    const positions = this.safeData.map((e) => e.position);
    return { min: Math.min(...positions), max: Math.max(...positions) };
  }

  xOf(position: number): number {
    const { min, max } = this.xDomain;
    if (min === max) return MARGIN.left + this.plotWidth / 2;
    return MARGIN.left + scaleLinear(position, min, max, 0, this.plotWidth);
  }

  toneForIndex(event: TimelineChartEvent, index: number): TimelineChartTone {
    return event.tone ?? TONES[index % TONES.length] ?? "category1";
  }

  get markers(): Marker[] {
    const armLength = this.plotHeight * 0.35;
    return this.safeData.map((event, index) => {
      const above = index % 2 === 0;
      const labelY = above ? this.axisY - armLength : this.axisY + armLength;
      return {
        index,
        event,
        x: this.xOf(event.position),
        labelY,
        above,
        tone: this.toneForIndex(event, index),
      };
    });
  }

  get hoveredMarker(): Marker | null {
    if (this.hoveredIndex == null) return null;
    return this.markers[this.hoveredIndex] ?? null;
  }

  get dataValueItems(): string[] {
    return this.safeData.map((e) => e.description ? `${e.label}: ${e.description}` : e.label);
  }

  tooltipLeft(marker: Marker): number {
    return ((marker.x - MARGIN.left) / this.plotWidth) * 100;
  }

  handlePointerMove(e: PointerEvent): void {
    const target = e.target as Element | null;
    const attr = target?.getAttribute("data-chart-index");
    if (attr != null) {
      const idx = Number(attr);
      if (Number.isFinite(idx)) this.hoveredIndex = idx;
    }
  }
}
