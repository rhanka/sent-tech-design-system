import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type BulletChartDatum = {
  label: string;
  value: number;
  target: number;
  ranges?: number[];
};

export type BulletChartProps = {
  data: BulletChartDatum[];
  label: string;
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 } as const;
const RANGE_OPACITIES = [0.18, 0.30, 0.44] as const;

type RangeBand = { x: number; y: number; width: number; height: number; opacity: number };
type Bullet = {
  datum: BulletChartDatum;
  index: number;
  barX: number;
  barY: number;
  barW: number;
  barH: number;
  targetX: number;
  targetY: number;
  targetH: number;
  labelX: number;
  labelY: number;
  rangeBands: RangeBand[];
  tooltipX: number;
  tooltipY: number;
};

@Component({
  selector: "st-bullet-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-bulletChart__visual"
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
          @if (isHorizontal) {
            <line class="st-bulletChart__baseline" [attr.x1]="baselineX" [attr.x2]="baselineX" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          } @else {
            <line class="st-bulletChart__baseline" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="baselineY" [attr.y2]="baselineY"></line>
          }

          <line class="st-bulletChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="isHorizontal ? widthValue - MARGIN_RIGHT : MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-bulletChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="isHorizontal ? MARGIN_LEFT : widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (tick of ticks; track tick) {
            @if (isHorizontal) {
              <line class="st-bulletChart__grid" [attr.x1]="tickX(tick)" [attr.x2]="tickX(tick)" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
              <text class="st-bulletChart__tickLabel" [attr.x]="tickX(tick)" [attr.y]="heightValue - MARGIN_BOTTOM + 14" text-anchor="middle">{{ formatTickLabel(tick) }}</text>
            } @else {
              <line class="st-bulletChart__grid" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="tickY(tick)" [attr.y2]="tickY(tick)"></line>
              <text class="st-bulletChart__tickLabel" [attr.x]="MARGIN_LEFT - 6" [attr.y]="tickY(tick)" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(tick) }}</text>
            }
          }

          @for (b of bullets; track b.index) {
            @for (rb of b.rangeBands; track $index) {
              <rect class="st-bulletChart__range" [attr.x]="rb.x" [attr.y]="rb.y" [attr.width]="rb.width" [attr.height]="rb.height" [style.opacity]="rb.opacity"></rect>
            }
            <rect class="st-bulletChart__bar" [attr.x]="b.barX" [attr.y]="b.barY" [attr.width]="b.barW" [attr.height]="b.barH" rx="1" [attr.data-chart-index]="b.index"></rect>
            @if (isHorizontal) {
              <line class="st-bulletChart__target" [attr.x1]="b.targetX" [attr.x2]="b.targetX" [attr.y1]="b.targetY" [attr.y2]="b.targetY + b.targetH"></line>
              <text class="st-bulletChart__categoryLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="b.labelY" text-anchor="end" dominant-baseline="middle">{{ b.datum.label }}</text>
            } @else {
              <line class="st-bulletChart__target" [attr.x1]="b.targetX" [attr.x2]="b.targetX + b.targetH" [attr.y1]="b.targetY" [attr.y2]="b.targetY"></line>
              <text class="st-bulletChart__categoryLabel" [attr.x]="b.labelX" [attr.y]="b.labelY" text-anchor="middle">{{ b.datum.label }}</text>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBullet; as b) {
        <div
          class="st-bulletChart__tooltip"
          role="presentation"
          [style.left]="(b.tooltipX / widthValue * 100) + '%'"
          [style.top]="(b.tooltipY / heightValue * 100) + '%'"
        >
          <span class="st-bulletChart__tooltipLabel">{{ b.datum.label }}</span>
          <span class="st-bulletChart__tooltipValue">value: {{ b.datum.value }} / target: {{ b.datum.target }}</span>
        </div>
      }
    </div>
  `,
})
export class BulletChart {
  static readonly stComponentName = "BulletChart";
  readonly componentName = "BulletChart";

  readonly MARGIN_LEFT = MARGIN.left;
  readonly MARGIN_RIGHT = MARGIN.right;
  readonly MARGIN_TOP = MARGIN.top;
  readonly MARGIN_BOTTOM = MARGIN.bottom;

  hoveredIndex: number | null = null;

  @NgInput() data: BulletChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() orientation?: "horizontal" | "vertical";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-bulletChart", this.classInput);
  }

  get orientationValue(): "horizontal" | "vertical" {
    return this.orientation ?? "horizontal";
  }

  get isHorizontal(): boolean {
    return this.orientationValue === "horizontal";
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 240;
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

  get validData(): BulletChartDatum[] {
    return this.data.filter((d) => Number.isFinite(d.value) && Number.isFinite(d.target));
  }

  get domainBounds(): { rawMin: number; rawMax: number } {
    const allValues: number[] = [0];
    for (const d of this.validData) {
      allValues.push(d.value, d.target);
      for (const r of d.ranges ?? []) {
        if (Number.isFinite(r)) allValues.push(r);
      }
    }
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  }

  get ticks(): number[] {
    return niceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
  }

  get tickDomainMin(): number {
    return this.ticks[0] ?? this.domainBounds.rawMin;
  }

  get tickDomainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? this.domainBounds.rawMax;
  }

  get baselineX(): number {
    return MARGIN.left + scaleLinear(0, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);
  }

  get baselineY(): number {
    return MARGIN.top + scaleLinear(0, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);
  }

  tickX(tick: number): number {
    return MARGIN.left + scaleLinear(tick, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);
  }

  tickY(tick: number): number {
    return MARGIN.top + scaleLinear(tick, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);
  }

  formatTickLabel(v: number): string {
    return formatTick(v);
  }

  get bullets(): Bullet[] {
    const bandCount = this.validData.length;
    if (bandCount === 0) return [];

    if (this.isHorizontal) {
      const bandH = this.plotHeight / bandCount;
      const barH = bandH * 0.35;
      const rangeH = bandH * 0.65;

      return this.validData.map((d, i) => {
        const ranges = (d.ranges ?? [this.tickDomainMax]).filter(Number.isFinite).slice(0, 3);
        const sortedRanges = [...ranges].sort((a, b) => a - b);

        const bandY = MARGIN.top + i * bandH;
        const cx = MARGIN.left + scaleLinear(d.value, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);
        const targetX = MARGIN.left + scaleLinear(d.target, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);

        const rangeBands: RangeBand[] = sortedRanges.map((r, ri) => {
          const prevR = ri === 0 ? this.tickDomainMin : sortedRanges[ri - 1];
          return {
            x: MARGIN.left + scaleLinear(prevR, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth),
            width:
              scaleLinear(r, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth) -
              scaleLinear(prevR, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth),
            opacity: RANGE_OPACITIES[ri] ?? 0.44,
            y: bandY + (bandH - rangeH) / 2,
            height: rangeH,
          };
        });

        const zeroX = this.baselineX;
        const barLeft = Math.min(zeroX, cx);
        const barRight = Math.max(zeroX, cx);

        return {
          datum: d,
          index: i,
          barX: barLeft,
          barY: bandY + (bandH - barH) / 2,
          barW: Math.max(barRight - barLeft, 0.5),
          barH,
          targetX,
          targetY: bandY + (bandH - rangeH) / 2,
          targetH: rangeH,
          labelY: bandY + bandH / 2,
          labelX: 0,
          rangeBands,
          tooltipX: cx,
          tooltipY: bandY + bandH / 2,
        };
      });
    }

    // vertical
    const bandW = this.plotWidth / bandCount;
    const barW = bandW * 0.35;
    const rangeW = bandW * 0.65;

    return this.validData.map((d, i) => {
      const ranges = (d.ranges ?? [this.tickDomainMax]).filter(Number.isFinite).slice(0, 3);
      const sortedRanges = [...ranges].sort((a, b) => a - b);

      const bandX = MARGIN.left + i * bandW;
      const cy = MARGIN.top + scaleLinear(d.value, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);
      const targetY = MARGIN.top + scaleLinear(d.target, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);

      const rangeBands: RangeBand[] = sortedRanges.map((r, ri) => {
        const prevR = ri === 0 ? this.tickDomainMin : sortedRanges[ri - 1];
        return {
          y: MARGIN.top + scaleLinear(r, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0),
          height: Math.abs(
            scaleLinear(r, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0) -
              scaleLinear(prevR, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0),
          ),
          opacity: RANGE_OPACITIES[ri] ?? 0.44,
          x: bandX + (bandW - rangeW) / 2,
          width: rangeW,
        };
      });

      const zeroY = this.baselineY;
      const barTop = Math.min(zeroY, cy);
      const barBot = Math.max(zeroY, cy);

      return {
        datum: d,
        index: i,
        barX: bandX + (bandW - barW) / 2,
        barY: barTop,
        barW: barW,
        barH: Math.max(barBot - barTop, 0.5),
        targetY,
        targetX: bandX + (bandW - rangeW) / 2,
        targetH: rangeW,
        labelY: MARGIN.top + this.plotHeight + 18,
        labelX: bandX + bandW / 2,
        rangeBands,
        tooltipX: bandX + bandW / 2,
        tooltipY: cy,
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => `${d.label}: value ${d.value}, target ${d.target}`);
  }

  get hoveredBullet(): Bullet | null {
    return this.hoveredIndex !== null ? (this.bullets[this.hoveredIndex] ?? null) : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
