import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type RibbonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RibbonChartDatum = {
  category: string;
  period: string | number;
  value: number;
  tone?: RibbonChartTone;
};

export type RibbonChartProps = {
  data: RibbonChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const TONES: RibbonChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 16, right: 16, bottom: 32, left: 16 };
const RIBBON_SMOOTH = 0.4;

type Segment = {
  key: string;
  category: string;
  value: number;
  tone: RibbonChartTone;
  x: number;
  segWidth: number;
  yTop: number;
  yBottom: number;
  cx: number;
  cy: number;
};

type Column = {
  period: string | number;
  index: number;
  cx: number;
  segments: Segment[];
};

type Ribbon = {
  key: string;
  category: string;
  tone: RibbonChartTone;
  d: string;
};

type LegendItem = {
  category: string;
  tone: RibbonChartTone;
};

@Component({
  selector: "st-ribbon-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-ribbonChart__visual"
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
          @for (ribbon of ribbons; track ribbon.key) {
            <path
              [class]="ribbonClass(ribbon)"
              [attr.d]="ribbon.d"
            ></path>
          }

          @for (col of columns; track col.index) {
            <text class="st-ribbonChart__periodLabel" [attr.x]="col.cx" [attr.y]="periodLabelY" text-anchor="middle">{{ col.period }}</text>
            @for (seg of col.segments; track seg.key) {
              <rect
                [class]="segClass(seg)"
                [attr.x]="seg.x"
                [attr.y]="seg.yTop"
                [attr.width]="seg.segWidth"
                [attr.height]="segHeight(seg)"
                rx="2"
                [attr.data-chart-key]="seg.key"
              ></rect>
            }
          }
        </svg>
      </div>

      @if (hasLegend) {
        <ul class="st-ribbonChart__legend" [attr.aria-label]="\'Catégories de \' + (label ?? \'ribbon\')">
          @for (item of legendItems; track item.category) {
            <li class="st-ribbonChart__legendItem">
              <span [class]="\'st-ribbonChart__legendSwatch st-ribbonChart__legendSwatch--\' + item.tone" aria-hidden="true"></span>
              {{ item.category }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="\'Data values for \' + (label ?? \'ribbon\')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredSegment) {
        <div
          class="st-ribbonChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + \'%\'"
          [style.top]="tooltipTop + \'%\'"
        >
          <span class="st-ribbonChart__tooltipLabel">{{ hoveredSegment.category }}</span>
          <span class="st-ribbonChart__tooltipValue">{{ hoveredSegment.value }}</span>
        </div>
      }
    </div>
  `,
})
export class RibbonChart {
  static readonly stComponentName = "RibbonChart";
  readonly componentName = "RibbonChart";

  hoveredKey: string | null = null;

  @NgInput() data: RibbonChartDatum[] = [];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-ribbonChart", this.classInput);
  }

  get resolvedWidth(): number { return this.width ?? this.size ?? 520; }
  get heightValue(): number { return this.height ?? 300; }
  get periodLabelY(): number { return this.heightValue - MARGIN.bottom + 16; }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.heightValue}`;
  }

  get plotWidth(): number { return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get validData(): RibbonChartDatum[] {
    return this.data.filter(
      (d) =>
        typeof d.category === "string" &&
        d.category.length > 0 &&
        Number.isFinite(d.value) &&
        d.value >= 0,
    );
  }

  get periodOrder(): (string | number)[] {
    const seen: (string | number)[] = [];
    for (const d of this.validData) {
      if (!seen.includes(d.period)) seen.push(d.period);
    }
    return seen;
  }

  get categoryOrder(): string[] {
    const seen: string[] = [];
    for (const d of this.validData) {
      if (!seen.includes(d.category)) seen.push(d.category);
    }
    return seen;
  }

  get explicitToneByCategory(): Map<string, RibbonChartTone> {
    const map = new Map<string, RibbonChartTone>();
    for (const d of this.validData) {
      if (d.tone) map.set(d.category, d.tone);
    }
    return map;
  }

  toneOf(category: string): RibbonChartTone {
    const explicit = this.explicitToneByCategory.get(category);
    if (explicit) return explicit;
    const idx = this.categoryOrder.indexOf(category);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as RibbonChartTone;
  }

  get columns(): Column[] {
    if (this.validData.length === 0 || this.periodOrder.length === 0) return [];
    const band = this.plotWidth / this.periodOrder.length;
    const barWidth = Math.min(band * 0.5, 72);
    const totals = this.periodOrder.map((p) =>
      this.validData.filter((d) => d.period === p).reduce((s, d) => s + Math.max(d.value, 0), 0),
    );
    const domainMax = Math.max(1, ...totals);
    return this.periodOrder.map((period, pi) => {
      const x = MARGIN.left + band * pi + (band - barWidth) / 2;
      const rows = this.validData
        .filter((d) => d.period === period)
        .map((d) => ({ category: d.category, value: Math.max(d.value, 0) }))
        .sort((a, b) => b.value - a.value);
      let acc = 0;
      const segments = rows.map((row, ri) => {
        const h = (row.value / domainMax) * this.plotHeight;
        const yBottom = MARGIN.top + this.plotHeight - acc;
        const yTop = yBottom - h;
        acc += h;
        return {
          key: `${pi}-${ri}-${row.category}`,
          category: row.category,
          value: row.value,
          tone: this.toneOf(row.category),
          x,
          segWidth: barWidth,
          yTop,
          yBottom,
          cx: x + barWidth / 2,
          cy: yTop + (yBottom - yTop) / 2,
        } satisfies Segment;
      });
      return { period, index: pi, cx: MARGIN.left + band * (pi + 0.5), segments };
    });
  }

  get ribbons(): Ribbon[] {
    const out: Ribbon[] = [];
    for (let ci = 0; ci < this.columns.length - 1; ci++) {
      const left = this.columns[ci];
      const right = this.columns[ci + 1];
      for (const ls of left.segments) {
        const rs = right.segments.find((s) => s.category === ls.category);
        if (!rs) continue;
        const x0 = ls.x + ls.segWidth;
        const x1 = rs.x;
        const mid = x0 + (x1 - x0) * RIBBON_SMOOTH;
        const mid2 = x1 - (x1 - x0) * RIBBON_SMOOTH;
        const d =
          `M${x0.toFixed(2)},${ls.yTop.toFixed(2)} ` +
          `C${mid.toFixed(2)},${ls.yTop.toFixed(2)} ${mid2.toFixed(2)},${rs.yTop.toFixed(2)} ${x1.toFixed(2)},${rs.yTop.toFixed(2)} ` +
          `L${x1.toFixed(2)},${rs.yBottom.toFixed(2)} ` +
          `C${mid2.toFixed(2)},${rs.yBottom.toFixed(2)} ${mid.toFixed(2)},${ls.yBottom.toFixed(2)} ${x0.toFixed(2)},${ls.yBottom.toFixed(2)} Z`;
        out.push({ key: `${ci}-${ls.category}`, category: ls.category, tone: ls.tone, d });
      }
    }
    return out;
  }

  get legendItems(): LegendItem[] {
    return this.categoryOrder.map((category) => ({ category, tone: this.toneOf(category) }));
  }

  get hasLegend(): boolean {
    return this.categoryOrder.length > 0;
  }

  get dataValueItems(): string[] {
    return this.categoryOrder.map(
      (category) =>
        `${category}: ${this.periodOrder
          .map((p) => {
            const found = this.validData.find((d) => d.category === category && d.period === p);
            return `${p} = ${found ? found.value : 0}`;
          })
          .join(", ")}`,
    );
  }

  get hoveredSegment(): Segment | null {
    if (this.hoveredKey === null) return null;
    for (const col of this.columns) {
      for (const seg of col.segments) {
        if (seg.key === this.hoveredKey) return seg;
      }
    }
    return null;
  }

  get tooltipLeft(): number {
    const seg = this.hoveredSegment;
    return seg ? (seg.cx / this.resolvedWidth) * 100 : 0;
  }

  get tooltipTop(): number {
    const seg = this.hoveredSegment;
    return seg ? (seg.cy / this.heightValue) * 100 : 0;
  }

  ribbonClass(ribbon: Ribbon): string {
    return classNames(
      "st-ribbonChart__ribbon",
      `st-ribbonChart__ribbon--${ribbon.tone}`,
      this.hoveredSegment !== null && this.hoveredSegment.category !== ribbon.category && "st-ribbonChart__ribbon--dim",
    );
  }

  segClass(seg: Segment): string {
    return classNames(
      "st-ribbonChart__seg",
      `st-ribbonChart__seg--${seg.tone}`,
      this.hoveredSegment !== null && this.hoveredSegment.category !== seg.category && "st-ribbonChart__seg--dim",
    );
  }

  segHeight(seg: Segment): number {
    return Math.max(seg.yBottom - seg.yTop, 0);
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const key = target?.getAttribute?.("data-chart-key") ?? null;
    this.hoveredKey = key;
  }

  handleLeave(): void {
    this.hoveredKey = null;
  }
}
