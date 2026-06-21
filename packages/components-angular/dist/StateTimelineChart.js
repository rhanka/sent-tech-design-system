import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };
const CATEGORY_TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
function scaleLinearLocal(value, d0, d1, r0, r1) {
    if (d1 === d0)
        return r0;
    return r0 + ((value - d0) * (r1 - r0)) / (d1 - d0);
}
function ellipsizeLocal(text, maxLen) {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}
export class StateTimelineChart {
    static stComponentName = "StateTimelineChart";
    componentName = "StateTimelineChart";
    MARGIN = MARGIN;
    hoveredKey = null;
    data;
    label;
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-stateTimelineChart", this.classInput);
    }
    get widthValue() { return this.width ?? 640; }
    get heightValue() {
        const n = (this.data ?? []).length;
        return this.height ?? Math.max(120, 48 * n + MARGIN.top + MARGIN.bottom);
    }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get safeData() { return this.data ?? []; }
    get xDomain() {
        if (this.safeData.length === 0)
            return { min: 0, max: 1 };
        let min = Infinity, max = -Infinity;
        for (const series of this.safeData) {
            for (const seg of series.segments) {
                if (seg.start < min)
                    min = seg.start;
                if (seg.end > max)
                    max = seg.end;
            }
        }
        return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 1 };
    }
    xOf(value) {
        return MARGIN.left + scaleLinearLocal(value, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
    }
    get stateOrderMap() {
        const map = new Map();
        let order = 0;
        for (const series of this.safeData) {
            for (const seg of series.segments) {
                const key = String(seg.state);
                if (!map.has(key)) {
                    map.set(key, order++);
                }
            }
        }
        return map;
    }
    toneForSegment(seg) {
        if (seg.tone)
            return seg.tone;
        const order = this.stateOrderMap.get(String(seg.state)) ?? 0;
        return CATEGORY_TONES[order % CATEGORY_TONES.length] ?? "category1";
    }
    get lanes() {
        const n = this.safeData.length;
        if (n === 0)
            return [];
        const band = this.plotHeight / n;
        const barHeight = band * 0.7;
        return this.safeData.map((series, laneIdx) => {
            const centerY = MARGIN.top + band * laneIdx + band / 2;
            const y = centerY - barHeight / 2;
            const rects = series.segments.map((seg, segIdx) => {
                const x = this.xOf(seg.start);
                const endX = this.xOf(seg.end);
                return {
                    key: `${laneIdx}-${segIdx}`,
                    x,
                    y,
                    width: Math.max(endX - x, 1),
                    height: barHeight,
                    tone: this.toneForSegment(seg),
                    state: String(seg.state),
                    start: seg.start,
                    end: seg.end,
                    seriesLabel: series.series,
                };
            });
            return { seriesLabel: series.series, centerY, rects };
        });
    }
    get allRects() {
        return this.lanes.flatMap((lane) => lane.rects);
    }
    get hoveredRect() {
        if (!this.hoveredKey)
            return null;
        return this.allRects.find((r) => r.key === this.hoveredKey) ?? null;
    }
    get legendItems() {
        const seen = new Map();
        for (const series of this.safeData) {
            for (const seg of series.segments) {
                const key = String(seg.state);
                if (!seen.has(key)) {
                    seen.set(key, this.toneForSegment(seg));
                }
            }
        }
        return Array.from(seen.entries()).map(([state, tone]) => ({ state, tone }));
    }
    get dataValueItems() {
        return this.safeData.flatMap((series) => series.segments.map((seg) => `${series.series} / ${seg.state}: ${seg.start} → ${seg.end}`));
    }
    ellipsize(text, n) { return ellipsizeLocal(text, n); }
    handlePointerMove(e) {
        const target = e.target;
        const key = target?.getAttribute("data-chart-key");
        if (key != null) {
            this.hoveredKey = key;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StateTimelineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StateTimelineChart, isStandalone: true, selector: "st-state-timeline-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-stateTimelineChart__visual" role="img" [attr.aria-label]="label ?? 'State timeline'"
           (pointermove)="handlePointerMove($event)" (pointerleave)="hoveredKey = null">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          <line class="st-stateTimelineChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (lane of lanes; track lane.seriesLabel) {
            <text class="st-stateTimelineChart__seriesLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="lane.centerY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsize(lane.seriesLabel, 18) }}</text>

            @for (seg of lane.rects; track seg.key) {
              <rect
                [class]="'st-stateTimelineChart__segment st-stateTimelineChart__segment--' + seg.tone"
                [attr.x]="seg.x"
                [attr.y]="seg.y"
                [attr.width]="seg.width"
                [attr.height]="seg.height"
                [attr.data-chart-key]="seg.key"
              ></rect>
            }
          }

          @if (hoveredRect) {
            <rect class="st-stateTimelineChart__hover"
              [attr.x]="hoveredRect.x - 1"
              [attr.y]="hoveredRect.y - 1"
              [attr.width]="hoveredRect.width + 2"
              [attr.height]="hoveredRect.height + 2"
              fill="none"
              stroke-width="2"
            ></rect>
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-stateTimelineChart__legend" [attr.aria-label]="'Légende états'">
          @for (item of legendItems; track item.state) {
            <li class="st-stateTimelineChart__legendItem">
              <span [class]="'st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.state }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'state timeline')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRect) {
        <div class="st-stateTimelineChart__tooltip" role="presentation">
          <span class="st-stateTimelineChart__tooltipSeries">{{ hoveredRect.seriesLabel }}</span>
          <span class="st-stateTimelineChart__tooltipState">{{ hoveredRect.state }}</span>
          <span class="st-stateTimelineChart__tooltipRange">{{ hoveredRect.start }} → {{ hoveredRect.end }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StateTimelineChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-state-timeline-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-stateTimelineChart__visual" role="img" [attr.aria-label]="label ?? 'State timeline'"
           (pointermove)="handlePointerMove($event)" (pointerleave)="hoveredKey = null">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          <line class="st-stateTimelineChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (lane of lanes; track lane.seriesLabel) {
            <text class="st-stateTimelineChart__seriesLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="lane.centerY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsize(lane.seriesLabel, 18) }}</text>

            @for (seg of lane.rects; track seg.key) {
              <rect
                [class]="'st-stateTimelineChart__segment st-stateTimelineChart__segment--' + seg.tone"
                [attr.x]="seg.x"
                [attr.y]="seg.y"
                [attr.width]="seg.width"
                [attr.height]="seg.height"
                [attr.data-chart-key]="seg.key"
              ></rect>
            }
          }

          @if (hoveredRect) {
            <rect class="st-stateTimelineChart__hover"
              [attr.x]="hoveredRect.x - 1"
              [attr.y]="hoveredRect.y - 1"
              [attr.width]="hoveredRect.width + 2"
              [attr.height]="hoveredRect.height + 2"
              fill="none"
              stroke-width="2"
            ></rect>
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-stateTimelineChart__legend" [attr.aria-label]="'Légende états'">
          @for (item of legendItems; track item.state) {
            <li class="st-stateTimelineChart__legendItem">
              <span [class]="'st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.state }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'state timeline')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRect) {
        <div class="st-stateTimelineChart__tooltip" role="presentation">
          <span class="st-stateTimelineChart__tooltipSeries">{{ hoveredRect.seriesLabel }}</span>
          <span class="st-stateTimelineChart__tooltipState">{{ hoveredRect.state }}</span>
          <span class="st-stateTimelineChart__tooltipRange">{{ hoveredRect.start }} → {{ hoveredRect.end }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StateTimelineChart.js.map