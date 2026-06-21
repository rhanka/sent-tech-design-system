import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 24, bottom: 32, left: 24 };
const TONES = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"];
export class TimelineChart {
    static stComponentName = "TimelineChart";
    componentName = "TimelineChart";
    MARGIN = MARGIN;
    hoveredIndex = null;
    data;
    label;
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-timelineChart", this.classInput);
    }
    get widthValue() { return this.width ?? 640; }
    get heightValue() { return this.height ?? 240; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get safeData() { return this.data ?? []; }
    get axisY() {
        return MARGIN.top + this.plotHeight / 2;
    }
    get xDomain() {
        if (this.safeData.length === 0)
            return { min: 0, max: 1 };
        const positions = this.safeData.map((e) => e.position);
        return { min: Math.min(...positions), max: Math.max(...positions) };
    }
    xOf(position) {
        const { min, max } = this.xDomain;
        if (min === max)
            return MARGIN.left + this.plotWidth / 2;
        return MARGIN.left + scaleLinear(position, min, max, 0, this.plotWidth);
    }
    toneForIndex(event, index) {
        return event.tone ?? TONES[index % TONES.length] ?? "category1";
    }
    get markers() {
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
    get hoveredMarker() {
        if (this.hoveredIndex == null)
            return null;
        return this.markers[this.hoveredIndex] ?? null;
    }
    get dataValueItems() {
        return this.safeData.map((e) => e.description ? `${e.label}: ${e.description}` : e.label);
    }
    tooltipLeft(marker) {
        return ((marker.x - MARGIN.left) / this.plotWidth) * 100;
    }
    handlePointerMove(e) {
        const target = e.target;
        const attr = target?.getAttribute("data-chart-index");
        if (attr != null) {
            const idx = Number(attr);
            if (Number.isFinite(idx))
                this.hoveredIndex = idx;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimelineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TimelineChart, isStandalone: true, selector: "st-timeline-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimelineChart, decorators: [{
            type: Component,
            args: [{
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
//# sourceMappingURL=TimelineChart.js.map