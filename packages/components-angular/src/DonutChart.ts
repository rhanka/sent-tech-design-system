import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type DonutChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DonutChartDatum = {
  label: string;
  value: number;
  tone?: DonutChartTone;
};

export type DonutChartProps = {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  /**
   * Per-slice value labels. `false`/absent (default) → none. `true` → each slice's
   * value with the default formatter. Object → `format(value)` and/or a `position`
   * override (default `center` of the arc). Slices too thin to fit a legible label
   * are skipped. Labels are `aria-hidden` — the values already live in the
   * accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  label: string;
  class?: string;
};

const DONUT_TONES: DonutChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const DATA_LABEL_MIN_DEG = 18;

type SliceItem = {
  datum: DonutChartDatum;
  path: string;
  tone: DonutChartTone;
  pct: number;
  spanDeg: number;
  labelX: number;
  labelY: number;
};

@Component({
  selector: "st-donut-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-donutChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @if (slices.total > 0) {
            @for (slice of slices.items; track slice.datum.label; let i = $index) {
              <path
                [class]="sliceClass(slice, i)"
                [attr.d]="slice.path"
                [attr.data-chart-index]="i"
              ></path>
            }
            @if (centerLabel !== null) {
              <text
                class="st-donutChart__center"
                [attr.x]="sizeValue / 2"
                [attr.y]="sizeValue / 2"
                text-anchor="middle"
                dominant-baseline="central"
              >{{ centerLabel !== undefined ? centerLabel : slices.total }}</text>
            }
            @if (dataLabelItems.length > 0) {
              <g class="st-donutChart__dataLabels" aria-hidden="true">
                @for (d of dataLabelItems; track d.key) {
                  <text
                    class="st-donutChart__dataLabel"
                    [attr.x]="d.x"
                    [attr.y]="d.y"
                    text-anchor="middle"
                    dominant-baseline="central"
                  >{{ d.text }}</text>
                }
              </g>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && slices.items[hoveredIndex!]) {
        <div class="st-donutChart__tooltip" role="presentation">
          <span class="st-donutChart__tooltipLabel">{{ slices.items[hoveredIndex!]!.datum.label }}</span>
          <span class="st-donutChart__tooltipValue">{{ slices.items[hoveredIndex!]!.datum.value }} · {{ fmtPct(slices.items[hoveredIndex!]!.pct) }}</span>
        </div>
      }
    </div>
  `,
})
export class DonutChart {
  static readonly stComponentName = "DonutChart";
  readonly componentName = "DonutChart";

  @NgInput() data: DonutChartDatum[] = [];
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() centerLabel?: string | null;
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  hoveredIndex: number | null = null;

  get hostClass(): string {
    return classNames("st-donutChart", this.classInput);
  }

  get sizeValue(): number {
    return this.size ?? 220;
  }

  get thicknessValue(): number {
    return this.thickness ?? 34;
  }

  get viewBox(): string {
    return `0 0 ${this.sizeValue} ${this.sizeValue}`;
  }

  get slices(): { total: number; items: SliceItem[] } {
    const data = this.data;
    const size = this.sizeValue;
    const thickness = this.thicknessValue;
    const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
    if (total <= 0) return { total: 0, items: [] };
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 2;
    const rInner = Math.max(rOuter - thickness, 1);
    const TWO_PI = Math.PI * 2;
    let angle = -Math.PI / 2;
    const polar = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const items: SliceItem[] = data.map((d, i) => {
      const frac = Math.max(d.value, 0) / total;
      const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
      const a0 = angle;
      const a1 = angle + span;
      angle = a1;
      const large = span > Math.PI ? 1 : 0;
      const [x0o, y0o] = polar(rOuter, a0);
      const [x1o, y1o] = polar(rOuter, a1);
      const [x1i, y1i] = polar(rInner, a1);
      const [x0i, y0i] = polar(rInner, a0);
      const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
      const aMid = (a0 + a1) / 2;
      const rMid = (rOuter + rInner) / 2;
      const [labelX, labelY] = polar(rMid, aMid);
      return {
        datum: d,
        path,
        tone: d.tone ?? DONUT_TONES[i % DONUT_TONES.length],
        pct: frac * 100,
        spanDeg: (span * 180) / Math.PI,
        labelX,
        labelY,
      };
    });
    return { total, items };
  }

  sliceClass(slice: SliceItem, i: number): string {
    const isDim = this.hoveredIndex !== null && this.hoveredIndex !== i;
    return classNames(
      "st-donutChart__slice",
      `st-donutChart__slice--${slice.tone}`,
      isDim ? "st-donutChart__slice--dim" : undefined,
    );
  }

  fmtPct(p: number): string {
    return `${p.toFixed(p < 10 ? 1 : 0)}%`;
  }

  get dataValueItems(): string[] {
    return this.slices.items.map((slice) => `${slice.datum.label}: ${slice.datum.value} (${this.fmtPct(slice.pct)})`);
  }

  get dataLabelItems(): Array<{ key: string; x: number; y: number; text: string }> {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.slices.items
      .filter((slice) => slice.spanDeg >= DATA_LABEL_MIN_DEG)
      .map((slice) => ({
        key: slice.datum.label,
        x: slice.labelX,
        y: slice.labelY,
        text: formatDataLabel(slice.datum.value, opts, (v) => String(v)),
      }));
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredIndex = null;
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
