import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 };
const RANGE_OPACITIES = [0.18, 0.30, 0.44];
export class BulletChart {
    static stComponentName = "BulletChart";
    componentName = "BulletChart";
    MARGIN_LEFT = MARGIN.left;
    MARGIN_RIGHT = MARGIN.right;
    MARGIN_TOP = MARGIN.top;
    MARGIN_BOTTOM = MARGIN.bottom;
    hoveredIndex = null;
    data = [];
    label = "";
    orientation;
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-bulletChart", this.classInput);
    }
    get orientationValue() {
        return this.orientation ?? "horizontal";
    }
    get isHorizontal() {
        return this.orientationValue === "horizontal";
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 240;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() {
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    get validData() {
        return this.data.filter((d) => Number.isFinite(d.value) && Number.isFinite(d.target));
    }
    get domainBounds() {
        const allValues = [0];
        for (const d of this.validData) {
            allValues.push(d.value, d.target);
            for (const r of d.ranges ?? []) {
                if (Number.isFinite(r))
                    allValues.push(r);
            }
        }
        const rawMin = Math.min(...allValues);
        const rawMax = Math.max(...allValues);
        return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
    }
    get ticks() {
        return niceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
    }
    get tickDomainMin() {
        return this.ticks[0] ?? this.domainBounds.rawMin;
    }
    get tickDomainMax() {
        return this.ticks[this.ticks.length - 1] ?? this.domainBounds.rawMax;
    }
    get baselineX() {
        return MARGIN.left + scaleLinear(0, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);
    }
    get baselineY() {
        return MARGIN.top + scaleLinear(0, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);
    }
    tickX(tick) {
        return MARGIN.left + scaleLinear(tick, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth);
    }
    tickY(tick) {
        return MARGIN.top + scaleLinear(tick, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0);
    }
    formatTickLabel(v) {
        return formatTick(v);
    }
    get bullets() {
        const bandCount = this.validData.length;
        if (bandCount === 0)
            return [];
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
                const rangeBands = sortedRanges.map((r, ri) => {
                    const prevR = ri === 0 ? this.tickDomainMin : sortedRanges[ri - 1];
                    return {
                        x: MARGIN.left + scaleLinear(prevR, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth),
                        width: scaleLinear(r, this.tickDomainMin, this.tickDomainMax, 0, this.plotWidth) -
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
            const rangeBands = sortedRanges.map((r, ri) => {
                const prevR = ri === 0 ? this.tickDomainMin : sortedRanges[ri - 1];
                return {
                    y: MARGIN.top + scaleLinear(r, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0),
                    height: Math.abs(scaleLinear(r, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0) -
                        scaleLinear(prevR, this.tickDomainMin, this.tickDomainMax, this.plotHeight, 0)),
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
    get dataValueItems() {
        return this.validData.map((d) => `${d.label}: value ${d.value}, target ${d.target}`);
    }
    get hoveredBullet() {
        return this.hoveredIndex !== null ? (this.bullets[this.hoveredIndex] ?? null) : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    handlePointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BulletChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: BulletChart, isStandalone: true, selector: "st-bullet-chart", inputs: { data: "data", label: "label", orientation: "orientation", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BulletChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=BulletChart.js.map