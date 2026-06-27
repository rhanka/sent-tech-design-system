import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type StateTimelineTone =
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

export type StateTimelineSegment = {
  start: number;
  end: number;
  state: string | number;
  tone?: StateTimelineTone;
};

export type StateTimelineSeries = {
  series: string;
  segments: StateTimelineSegment[];
};

export type StateTimelineChartProps = {
  data: StateTimelineSeries[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsizeLocal(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

type ValidSegment = {
  start: number;
  end: number;
  state: string | number;
  tone?: StateTimelineTone;
};

type ValidSeries = {
  series: string;
  segments: ValidSegment[];
};

type LaneSegment = {
  key: string;
  datum: ValidSegment;
  x: number;
  width: number;
  cx: number;
  tone: StateTimelineTone;
};

type Lane = {
  datum: ValidSeries;
  index: number;
  y: number;
  height: number;
  rowCenterY: number;
  segments: LaneSegment[];
};

@Component({
  selector: "st-state-timeline-chart",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-stateTimelineChart__visual"
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
          <!-- gridlines + tick labels (time axis) -->
          @for (tick of ticks; track tick) {
            <line
              class="st-stateTimelineChart__grid"
              [attr.x1]="xOf(tick)"
              [attr.x2]="xOf(tick)"
              [attr.y1]="MARGIN.top"
              [attr.y2]="heightValue - MARGIN.bottom"
            ></line>
            <text
              class="st-stateTimelineChart__tickLabel"
              [attr.x]="xOf(tick)"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatTick(tick) }}</text>
          }

          <!-- axes -->
          <line
            class="st-stateTimelineChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-stateTimelineChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          <!-- one lane per series: left label + contiguous state segments -->
          @for (lane of lanes; track lane.index) {
            <text
              class="st-stateTimelineChart__seriesLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="lane.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsize(lane.datum.series, 18) }}</text>

            @for (seg of lane.segments; track seg.key) {
              <rect
                [attr.class]="segmentClass(seg)"
                [attr.x]="seg.x"
                [attr.y]="lane.y"
                [attr.width]="seg.width"
                [attr.height]="lane.height"
                rx="2"
                [attr.data-chart-key]="seg.key"
              ></rect>
            }
          }
        </svg>
      </div>

      @if (hasLegend) {
        <ul class="st-stateTimelineChart__legend" [attr.aria-label]="'États de ' + (label ?? 'timeline')">
          @for (item of legendItems; track item.state) {
            <li class="st-stateTimelineChart__legendItem">
              <span
                [attr.class]="'st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--' + item.tone"
                aria-hidden="true"
              ></span>
              {{ item.state }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'state timeline')">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredSegment; as hovered) {
        <div
          class="st-stateTimelineChart__tooltip"
          role="presentation"
          [style.left]="(hovered.seg.cx / widthValue) * 100 + '%'"
          [style.top]="(hovered.lane.rowCenterY / heightValue) * 100 + '%'"
        >
          <span class="st-stateTimelineChart__tooltipLabel">{{ hovered.lane.datum.series }} · {{ hovered.seg.datum.state }}</span>
          <span class="st-stateTimelineChart__tooltipValue">{{ hovered.seg.datum.start }} → {{ hovered.seg.datum.end }}</span>
        </div>
      }
    </div>
  `,
})
export class StateTimelineChart {
  static readonly stComponentName = "StateTimelineChart";
  readonly componentName = "StateTimelineChart";
  readonly MARGIN = MARGIN;

  hoveredKey: string | null = null;

  @NgInput() data: StateTimelineSeries[] = [];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-stateTimelineChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 640;
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

  // Normalise start ≤ end, drop non-finite segments and unlabeled lanes.
  get validData(): ValidSeries[] {
    return (this.data ?? [])
      .filter((d) => typeof d.series === "string" && d.series.length > 0)
      .map((d) => ({
        series: d.series,
        segments: (d.segments ?? [])
          .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
          .map((s) => ({
            start: Math.min(s.start, s.end),
            end: Math.max(s.start, s.end),
            state: s.state,
            tone: s.tone,
          })),
      }));
  }

  // Distinct states (first-seen order) + explicit tones, mirrored from the ref.
  private get stateMaps(): { order: string[]; explicit: Map<string, StateTimelineTone> } {
    const order: string[] = [];
    const explicit = new Map<string, StateTimelineTone>();
    for (const d of this.validData) {
      for (const s of d.segments) {
        const key = String(s.state);
        if (!order.includes(key)) order.push(key);
        if (s.tone) explicit.set(key, s.tone);
      }
    }
    return { order, explicit };
  }

  toneOf(segment: { state: string | number; tone?: StateTimelineTone }): StateTimelineTone {
    if (segment.tone) return segment.tone;
    const key = String(segment.state);
    const { order, explicit } = this.stateMaps;
    const fromExplicit = explicit.get(key);
    if (fromExplicit) return fromExplicit;
    const idx = order.indexOf(key);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StateTimelineTone;
  }

  get legendItems(): Array<{ state: string; tone: StateTimelineTone }> {
    return this.stateMaps.order.map((state) => ({ state, tone: this.toneOf({ state }) }));
  }

  get hasLegend(): boolean {
    return this.stateMaps.order.length > 0;
  }

  private get domain(): { min: number; max: number } {
    const vals: number[] = [];
    for (const d of this.validData) {
      for (const s of d.segments) vals.push(s.start, s.end);
    }
    const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
    const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
    const ticks = niceTicks(rawMin, rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase, 5);
    return { min: ticks[0] ?? rawMin, max: ticks[ticks.length - 1] ?? rawMaxBase };
  }

  get ticks(): number[] {
    const vals: number[] = [];
    for (const d of this.validData) {
      for (const s of d.segments) vals.push(s.start, s.end);
    }
    const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
    const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
    return niceTicks(rawMin, rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase, 5);
  }

  xOf(value: number): number {
    const { min, max } = this.domain;
    return MARGIN.left + scaleLinear(value, min, max, 0, this.plotWidth);
  }

  get lanes(): Lane[] {
    const validData = this.validData;
    if (validData.length === 0) return [];
    const band = this.plotHeight / validData.length;
    const laneHeight = Math.min(band * 0.62, 28);
    return validData.map((d, i) => {
      const y = MARGIN.top + band * i + (band - laneHeight) / 2;
      const segments = d.segments.map((s, j) => {
        const x0 = this.xOf(s.start);
        const x1 = this.xOf(s.end);
        const x = Math.min(x0, x1);
        const w = Math.max(Math.abs(x1 - x0), 1);
        return {
          key: `${i}-${j}`,
          datum: s,
          x,
          width: w,
          cx: x + w / 2,
          tone: this.toneOf(s),
        };
      });
      return {
        datum: d,
        index: i,
        y,
        height: laneHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        segments,
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map(
      (d) => `${d.series}: ${d.segments.map((s) => `${s.state} [${s.start} → ${s.end}]`).join(", ")}`,
    );
  }

  get hoveredSegment(): { lane: Lane; seg: LaneSegment } | null {
    if (this.hoveredKey === null) return null;
    for (const lane of this.lanes) {
      for (const seg of lane.segments) {
        if (seg.key === this.hoveredKey) return { lane, seg };
      }
    }
    return null;
  }

  segmentClass(seg: LaneSegment): string {
    return classNames(
      "st-stateTimelineChart__segment",
      `st-stateTimelineChart__segment--${seg.tone}`,
      this.hoveredKey !== null && this.hoveredKey !== seg.key
        ? "st-stateTimelineChart__segment--dim"
        : undefined,
    );
  }

  ellipsize(text: string, n: number): string {
    return ellipsizeLocal(text, n);
  }

  formatTick(value: number): string {
    return formatTick(value);
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredKey = null;
      return;
    }
    this.hoveredKey = target.getAttribute("data-chart-key");
  }
}
