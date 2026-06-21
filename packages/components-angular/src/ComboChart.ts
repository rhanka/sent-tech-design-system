import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";

import { classNames } from "./classNames.js";

import { buildLinearPath, buildSmoothPath, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
  type ResolvedAnnotation,
} from "./chartAnnotations.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";

import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type ComboChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ComboChartBarSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
};

export type ComboChartLineSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
  smooth?: boolean;
};

export type ComboChartProps = {
  categories: string[];
  bars?: ComboChartBarSeries[];
  lines?: ComboChartLineSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  /**
   * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
   * render (controlled by the parent; default = all visible). Hidden series
   * are omitted and their legend item is shown "off" (`aria-pressed`).
   * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a category by equality (band centre); the y coordinate (and
   * `value`/`from`/`to`) are LEFT (bar) value-axis numbers. Regions render
   * behind the bars, every other kind above. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-datum value labels on BOTH the bars and the line points. `false`/absent
   * (default) → none. `true` → each value with the chart's numeric formatter.
   * Object → `format(value)` and/or a `position` override. Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). The key is the CATEGORY string.
   * When provided (string or null), the crosshair tracks this key instead of the
   * chart's internal pointer hover (null ⇒ nothing shown). Absent keeps the
   * legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /** Emitted when the user hovers a bar/point (its CATEGORY) or leaves (`null`). */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the categories (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a focusable overlay of one column per
   * category is rendered: one tab stop, arrows move, Home/End jump, Enter/Space
   * select, Escape leaves. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space (category) or `null` on Escape. */
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 52, bottom: 32, left: 52 } as const;

const TONES: ComboChartTone[] = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];

type BarSegment = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  value: number;
  seriesLabel: string;
  category: string;
  si: number;
  gi: number;
  tone: string;
};

type LineSeriesGeom = {
  path: string;
  points: Array<{ x: number; y: number; value: number; category: string; pi: number }>;
  seriesLabel: string;
  hidden: boolean;
  tone: string;
  li: number;
};

type LegendItem = { key: string; label: string; tone: string; kind: "bar" | "line" };

type DataLabelItem = { key: string; x: number; y: number; text: string; baseline: "middle" | "auto" };

type AnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type AnnotationLine = Extract<ResolvedAnnotation, { kind: "line" }>;
type AnnotationShape = Extract<ResolvedAnnotation, { kind: "shape" }>;
type AnnotationPoint = Extract<ResolvedAnnotation, { kind: "point" }>;
type AnnotationLabel = Extract<ResolvedAnnotation, { kind: "label" }>;
type AnnotationAbove = AnnotationLine | AnnotationShape | AnnotationPoint | AnnotationLabel;

type Hover =
  | { kind: "bar"; gi: number; si: number }
  | { kind: "line"; li: number; pi: number }
  | null;

@Component({
  selector: "st-combo-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-comboChart__visual"
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
          @for (g of leftGridLines; track g.value) {
            <line class="st-comboChart__grid" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text
              class="st-comboChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="g.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(g.value) }}</text>
          }

          @for (g of rightTickEntries; track g.value) {
            <text
              class="st-comboChart__tickLabel"
              [attr.x]="margin.left + plotWidth + 6"
              [attr.y]="g.y"
              text-anchor="start"
              dominant-baseline="middle"
            >{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-comboChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-comboChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>
          @if ((lines ?? []).length > 0) {
            <line class="st-comboChart__axis" [attr.x1]="margin.left + plotWidth" [attr.x2]="margin.left + plotWidth" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          }

          @if (leftAxisLabel) {
            <text
              class="st-comboChart__axisLabel"
              text-anchor="middle"
              [attr.transform]="'translate(' + (margin.left - 40) + ', ' + (margin.top + plotHeight / 2) + ') rotate(-90)'"
            >{{ leftAxisLabel }}</text>
          }
          @if (rightAxisLabel) {
            <text
              class="st-comboChart__axisLabel"
              text-anchor="middle"
              [attr.transform]="'translate(' + (margin.left + plotWidth + 40) + ', ' + (margin.top + plotHeight / 2) + ') rotate(90)'"
            >{{ rightAxisLabel }}</text>
          }

          @for (cat of safeCategories; track $index; let ci = $index) {
            <text
              class="st-comboChart__categoryLabel"
              [attr.x]="bandCenter(ci)"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ cat }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-comboChart__annotations st-comboChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-comboChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-comboChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (group of barGroups; track $index; let gi = $index) {
            @for (seg of group; track $index) {
              <rect
                [class]="'st-comboChart__bar st-comboChart__bar--' + seg.tone"
                [attr.x]="seg.x"
                [attr.y]="seg.y"
                [attr.width]="seg.width"
                [attr.height]="seg.height"
                rx="2"
                [attr.data-chart-kind]="'bar'"
                [attr.data-chart-a]="gi"
                [attr.data-chart-b]="seg.si"
              ></rect>
            }
          }

          @for (series of lineSeriesGeom; track series.li) {
            @if (!series.hidden) {
              <path
                [class]="'st-comboChart__line st-comboChart__line--' + series.tone"
                [attr.d]="series.path"
                fill="none"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              @for (p of series.points; track p.pi) {
                <circle
                  [class]="'st-comboChart__dot st-comboChart__dot--' + series.tone"
                  [attr.cx]="p.x"
                  [attr.cy]="p.y"
                  r="4"
                  [attr.data-chart-kind]="'line'"
                  [attr.data-chart-a]="series.li"
                  [attr.data-chart-b]="p.pi"
                ></circle>
              }
            }
          }

          @if (annotationAbove.length > 0) {
            <g class="st-comboChart__annotations st-comboChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-comboChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-comboChart__annotationLabel"
                        [attr.x]="annotationLineLabelX(a)"
                        [attr.y]="annotationLineLabelY(a)"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-comboChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-comboChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-comboChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-comboChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-comboChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (barDataLabelItems.length + lineDataLabelItems.length > 0) {
            <g class="st-comboChart__dataLabels" aria-hidden="true">
              @for (d of barDataLabelItems; track d.key) {
                <text class="st-comboChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
              @for (d of lineDataLabelItems; track d.key) {
                <text class="st-comboChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (crosshairX !== null) {
            <g class="st-comboChart__crosshair" aria-hidden="true">
              <line class="st-comboChart__crosshairLine" [attr.x1]="crosshairX" [attr.x2]="crosshairX" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-comboChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (cat of safeCategories; track $index; let ci = $index) {
              <rect
                #navDatum
                class="st-comboChart__navDatum"
                [attr.x]="margin.left + (plotWidth / safeCategories.length) * ci"
                [attr.y]="margin.top"
                [attr.width]="plotWidth / safeCategories.length"
                [attr.height]="plotHeight"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(ci)"
                [attr.aria-label]="datapointAriaLabelFor(ci)"
                (keydown)="handleDatapointKeyDown($event, ci)"
                (focus)="handleDatapointFocus(ci)"
              ></rect>
            }
          </svg>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (showLegend && legendItems.length > 0) {
        <ul class="st-comboChart__legend" [attr.aria-hidden]="legendInteractive ? null : 'true'">
          @for (item of legendItems; track item.key) {
            <li [class]="legendItemClass(item)">
              @if (legendInteractive) {
                <button
                  type="button"
                  class="st-comboChart__legendButton"
                  [attr.aria-pressed]="hiddenSet.has(item.label) ? 'true' : 'false'"
                  (click)="onToggleSeries?.(item.label)"
                >
                  <span [class]="'st-comboChart__legendSwatch st-comboChart__legendSwatch--' + item.kind + ' st-comboChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                  {{ item.label }}
                </button>
              } @else {
                <span [class]="'st-comboChart__legendSwatch st-comboChart__legendSwatch--' + item.kind + ' st-comboChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
                {{ item.label }}
              }
            </li>
          }
        </ul>
      }

      @if (tooltip) {
        <div
          class="st-comboChart__tooltip"
          role="presentation"
          [style.left]="(tooltip.cx / widthValue) * 100 + '%'"
          [style.top]="(tooltip.cy / heightValue) * 100 + '%'"
        >
          <span class="st-comboChart__tooltipLabel">{{ tooltip.label }}</span>
          <span class="st-comboChart__tooltipValue">{{ tooltip.value }}</span>
        </div>
      }
    </div>
  `,
})
export class ComboChart {
  static readonly stComponentName = "ComboChart";
  readonly componentName = "ComboChart";
  readonly margin = MARGIN;

  @ViewChildren("navDatum") private navDatumElements?: QueryList<ElementRef<SVGElement>>;

  private hovered: Hover = null;
  private focusedIndex = -1;

  @NgInput() categories: string[] = [];
  @NgInput() bars?: ComboChartBarSeries[];
  @NgInput() lines?: ComboChartLineSeries[];
  @NgInput() leftAxisLabel?: string;
  @NgInput() rightAxisLabel?: string;
  @NgInput() legend?: boolean;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-comboChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get safeCategories(): string[] { return this.categories ?? []; }

  get hiddenSet(): Set<string> { return new Set(this.hiddenSeries ?? []); }

  get legendInteractive(): boolean {
    return this.onToggleSeries !== undefined || this.hiddenSeries !== undefined;
  }

  get showLegend(): boolean {
    return this.legend !== false;
  }

  // ── Axe gauche (barres) ────────────────────────────────────────────────────

  get leftScale(): { ticks: number[]; domainMin: number; domainMax: number } {
    const values = (this.bars ?? []).filter((s) => !this.hiddenSet.has(s.label)).flatMap((s) => s.data);
    const minRaw = Math.min(0, ...(values.length ? values : [0]));
    const maxRaw = Math.max(0, ...(values.length ? values : [0]));
    const ticks = niceTicks(minRaw, maxRaw, 5);
    return { ticks, domainMin: ticks[0]!, domainMax: ticks[ticks.length - 1]! };
  }

  // ── Axe droit (lignes) ────────────────────────────────────────────────────

  get rightScale(): { ticks: number[]; domainMin: number; domainMax: number } {
    const values = (this.lines ?? []).filter((s) => !this.hiddenSet.has(s.label)).flatMap((s) => s.data);
    if (values.length === 0) {
      const ticks = niceTicks(0, 1, 5);
      return { ticks, domainMin: ticks[0]!, domainMax: ticks[ticks.length - 1]! };
    }
    const minRaw = Math.min(...values);
    const maxRaw = Math.max(...values);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const ticks = niceTicks(minRaw - padded, maxRaw + padded, 5);
    return { ticks, domainMin: ticks[0]!, domainMax: ticks[ticks.length - 1]! };
  }

  bandCenter(i: number): number {
    const band = this.plotWidth / Math.max(this.safeCategories.length, 1);
    return MARGIN.left + band * (i + 0.5);
  }

  private isPresent(v: number | undefined): v is number {
    return typeof v === "number" && Number.isFinite(v);
  }

  // ── Groupes de barres ─────────────────────────────────────────────────────

  get barGroups(): BarSegment[][] {
    if (this.safeCategories.length === 0 || (this.bars ?? []).length === 0) return [];
    const { domainMin, domainMax } = this.leftScale;
    const band = this.plotWidth / this.safeCategories.length;
    const visibleBars = (this.bars ?? []).filter((s) => !this.hiddenSet.has(s.label));
    const groupWidth = band * 0.62;
    const barWidth = groupWidth / Math.max(visibleBars.length, 1);
    const zeroY = scaleLinear(0, domainMin, domainMax, this.plotHeight, 0);
    return this.safeCategories.map((_, ci) => {
      const groupX = MARGIN.left + band * ci + (band - groupWidth) / 2;
      const segments: BarSegment[] = [];
      visibleBars.forEach((series, si) => {
        const raw = series.data[ci];
        if (!this.isPresent(raw)) return;
        const value = raw;
        const valueY = scaleLinear(value, domainMin, domainMax, this.plotHeight, 0);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        segments.push({
          x: groupX + barWidth * si,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: groupX + barWidth * (si + 0.5),
          cy: MARGIN.top + valueY,
          value,
          seriesLabel: series.label,
          category: this.safeCategories[ci]!,
          si,
          gi: ci,
          tone: series.tone ?? `category${(si % 8) + 1}`,
        });
      });
      return segments;
    });
  }

  // ── Séries de lignes ──────────────────────────────────────────────────────

  get lineSeriesGeom(): LineSeriesGeom[] {
    if (this.safeCategories.length === 0 || (this.lines ?? []).length === 0) return [];
    const { domainMin, domainMax } = this.rightScale;
    const visibleBarCount = (this.bars ?? []).filter((s) => !this.hiddenSet.has(s.label)).length;
    return (this.lines ?? []).map((series, li) => {
      const hidden = this.hiddenSet.has(series.label);
      const points = this.safeCategories.map((cat, ci) => {
        const value = series.data[ci] ?? 0;
        return {
          x: this.bandCenter(ci),
          y: MARGIN.top + scaleLinear(value, domainMin, domainMax, this.plotHeight, 0),
          value,
          category: cat,
          pi: ci,
        };
      });
      const path = series.smooth ? buildSmoothPath(points) : buildLinearPath(points);
      const tone = series.tone ?? TONES[(visibleBarCount + li) % 8] ?? "category1";
      return { path, points, seriesLabel: series.label, hidden, tone, li };
    });
  }

  // ── Grilles ───────────────────────────────────────────────────────────────

  get leftGridLines(): Array<{ value: number; y: number }> {
    return this.leftScale.ticks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, this.leftScale.domainMin, this.leftScale.domainMax, this.plotHeight, 0),
    }));
  }

  get rightTickEntries(): Array<{ value: number; y: number }> {
    if ((this.lines ?? []).length === 0) return [];
    return this.rightScale.ticks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, this.rightScale.domainMin, this.rightScale.domainMax, this.plotHeight, 0),
    }));
  }

  // ── Légende ───────────────────────────────────────────────────────────────

  get legendItems(): LegendItem[] {
    const visibleBarCount = (this.bars ?? []).filter((s) => !this.hiddenSet.has(s.label)).length;
    return [
      ...(this.bars ?? []).map((s, i) => ({
        key: `bar-${i}`,
        label: s.label,
        tone: s.tone ?? `category${(i % 8) + 1}`,
        kind: "bar" as const,
      })),
      ...(this.lines ?? []).map((s, i) => ({
        key: `line-${i}`,
        label: s.label,
        tone: s.tone ?? TONES[(visibleBarCount + i) % 8] ?? "category1",
        kind: "line" as const,
      })),
    ];
  }

  legendItemClass(item: LegendItem): string {
    const off = this.legendInteractive && this.hiddenSet.has(item.label);
    return classNames("st-comboChart__legendItem", off && "st-comboChart__legendItem--off");
  }

  // ── Annotations ───────────────────────────────────────────────────────────

  get resolvedAnnotations(): ResolvedAnnotation[] {
    return resolveAnnotations(this.annotations, {
      xScale: (v: number | string) => {
        const i = this.safeCategories.indexOf(String(v));
        return i < 0 ? null : this.bandCenter(i) - MARGIN.left;
      },
      yScale: (v: number) =>
        Number.isFinite(v)
          ? scaleLinear(v, this.leftScale.domainMin, this.leftScale.domainMax, this.plotHeight, 0)
          : null,
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth: this.plotWidth,
      plotHeight: this.plotHeight,
    });
  }

  get annotationRegions(): AnnotationRegion[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationRegion => a.kind === "region");
  }

  get annotationAbove(): AnnotationAbove[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationAbove => a.kind !== "region");
  }

  annotationLineLabelX(a: AnnotationLine): number {
    return a.axis === "x" ? a.x1 + 4 : MARGIN.left + this.plotWidth - 4;
  }

  annotationLineLabelY(a: AnnotationLine): number {
    return a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4;
  }

  annotationShapePoints(a: AnnotationShape): string {
    return polygonPoints(a.points);
  }

  // ── Data labels ───────────────────────────────────────────────────────────

  get dataLabelOpts() {
    return normalizeDataLabels(this.dataLabels);
  }

  get barDataLabelItems(): DataLabelItem[] {
    if (!this.dataLabelOpts.enabled) return [];
    return this.barGroups.flatMap((group, gi) =>
      group.map((seg, si) => {
        const inside = this.dataLabelOpts.position === "inside" || this.dataLabelOpts.position === "center";
        return {
          key: `bar-${gi}-${si}`,
          x: seg.cx,
          y: inside ? seg.y + seg.height / 2 : seg.cy - 6,
          text: formatDataLabel(seg.value, this.dataLabelOpts, formatTick) ?? "",
          baseline: (inside ? "middle" : "auto") as "middle" | "auto",
        };
      })
    );
  }

  get lineDataLabelItems(): DataLabelItem[] {
    if (!this.dataLabelOpts.enabled) return [];
    return this.lineSeriesGeom.flatMap((series, li) =>
      series.hidden
        ? []
        : series.points.map((p, pi) => {
            const center = this.dataLabelOpts.position === "center" || this.dataLabelOpts.position === "inside";
            return {
              key: `line-${li}-${pi}`,
              x: p.x,
              y: center ? p.y : p.y - 8,
              text: formatDataLabel(p.value, this.dataLabelOpts, formatTick) ?? "",
              baseline: (center ? "middle" : "auto") as "middle" | "auto",
            };
          })
    );
  }

  // ── Données accessibles ───────────────────────────────────────────────────

  get dataValueItems(): string[] {
    return [
      ...(this.bars ?? [])
        .filter((s) => !this.hiddenSet.has(s.label))
        .flatMap((s) => this.safeCategories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
      ...(this.lines ?? [])
        .filter((s) => !this.hiddenSet.has(s.label))
        .flatMap((s) => this.safeCategories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
      ...annotationDataListItems(this.annotations),
    ];
  }

  // ── Crosshair FR-3 ────────────────────────────────────────────────────────

  get hoverKeys(): string[] {
    return this.safeCategories.map((c) => keyForX(c));
  }

  get internalCategoryIndex(): number | null {
    if (this.hovered == null) return null;
    return this.hovered.kind === "bar" ? this.hovered.gi : this.hovered.pi;
  }

  get activeCategoryIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.internalCategoryIndex, this.hoverKeys);
  }

  get crosshairX(): number | null {
    return this.activeCategoryIndex >= 0 ? this.bandCenter(this.activeCategoryIndex) : null;
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────

  get tooltip(): { cx: number; cy: number; label: string; value: number } | null {
    if (!this.hovered) return null;
    if (this.hovered.kind === "bar") {
      const seg = this.barGroups[this.hovered.gi]?.[this.hovered.si];
      if (!seg) return null;
      return { cx: seg.cx, cy: seg.cy, label: `${seg.seriesLabel} · ${seg.category}`, value: seg.value };
    }
    const series = this.lineSeriesGeom[this.hovered.li];
    const p = series?.points[this.hovered.pi];
    if (!series || !p) return null;
    return { cx: p.x, cy: p.y, label: `${series.seriesLabel} · ${p.category}`, value: p.value };
  }

  // ── Navigation clavier FR-5 ───────────────────────────────────────────────

  get navEnabled(): boolean {
    return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.safeCategories.length > 0;
  }

  private categorySummary(ci: number): string {
    return [
      ...(this.bars ?? []).filter((s) => !this.hiddenSet.has(s.label)),
      ...(this.lines ?? []).filter((s) => !this.hiddenSet.has(s.label)),
    ]
      .map((s) => {
        const raw = s.data[ci];
        return raw == null || !Number.isFinite(raw) ? null : `${s.label}: ${raw}`;
      })
      .filter((v): v is string => v !== null)
      .join(", ");
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.safeCategories.length);
  }

  datapointAriaLabelFor(ci: number): string {
    return datapointAriaLabel(this.safeCategories[ci] ?? "", this.categorySummary(ci));
  }

  private emitHoverKey(index: number | null): void {
    this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
  }

  handleLeave(): void {
    this.hovered = null;
    this.emitHoverKey(null);
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as Element | null;
    if (!target) {
      this.hovered = null;
      this.emitHoverKey(null);
      return;
    }
    const kind = target.getAttribute("data-chart-kind");
    const a = Number(target.getAttribute("data-chart-a"));
    const b = Number(target.getAttribute("data-chart-b"));
    if (kind === "bar" && Number.isInteger(a) && Number.isInteger(b)) {
      this.hovered = { kind: "bar", gi: a, si: b };
      this.emitHoverKey(a);
    } else if (kind === "line" && Number.isInteger(a) && Number.isInteger(b)) {
      this.hovered = { kind: "line", li: a, pi: b };
      this.emitHoverKey(b);
    } else {
      this.hovered = null;
      this.emitHoverKey(null);
    }
  }

  handleDatapointFocus(index: number): void {
    this.focusedIndex = index;
    this.emitHoverKey(index);
  }

  private focusDatum(index: number): void {
    this.focusedIndex = index;
    this.navDatumElements?.get(index)?.nativeElement.focus();
    this.emitHoverKey(index);
  }

  handleDatapointKeyDown(event: KeyboardEvent, index: number): void {
    const action = datapointNavAction(event.key, index, this.safeCategories.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.focusDatum(action.index);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.hoverKeys[index] ?? null);
    } else {
      this.focusedIndex = -1;
      this.emitHoverKey(null);
      this.onSelectKey?.(null);
      (event.currentTarget as { blur?: () => void } | null)?.blur?.();
    }
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }
}
