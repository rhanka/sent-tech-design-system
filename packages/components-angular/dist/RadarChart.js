import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
export class RadarChart {
    static stComponentName = "RadarChart";
    componentName = "RadarChart";
    hoveredIndex = null;
    axes = [];
    series = [];
    maxValue;
    levels;
    width;
    height;
    legend;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-radarChart", this.classInput);
    }
    get widthValue() { return this.width ?? 360; }
    get heightValue() { return this.height ?? 320; }
    get levelCount() { return Math.max(1, Math.floor(this.levels ?? 4)); }
    get centerX() { return this.widthValue / 2; }
    get centerY() { return this.heightValue / 2; }
    get radius() { return Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 42, 1); }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get domainMax() {
        if (Number.isFinite(this.maxValue) && (this.maxValue ?? 0) > 0)
            return this.maxValue;
        const values = this.series.flatMap((s) => s.values).filter(Number.isFinite);
        return Math.max(1, ...values);
    }
    pointAt(radius, angle) {
        return {
            x: this.centerX + radius * Math.cos(angle),
            y: this.centerY + radius * Math.sin(angle),
        };
    }
    get axisEntries() {
        const numAxes = Math.max(this.axes.length, 1);
        return this.axes.map((axis, index) => {
            const angle = -Math.PI / 2 + (Math.PI * 2 * index) / numAxes;
            const end = this.pointAt(this.radius, angle);
            const label = this.pointAt(this.radius + 22, angle);
            return { axis, index, angle, endX: end.x, endY: end.y, labelX: label.x, labelY: label.y };
        });
    }
    get rings() {
        return Array.from({ length: this.levelCount }, (_, index) => {
            const ringRadius = (this.radius * (index + 1)) / this.levelCount;
            return this.axisEntries
                .map((axis) => this.pointAt(ringRadius, axis.angle))
                .map((p) => `${p.x},${p.y}`)
                .join(" ");
        });
    }
    get polygons() {
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
    get legendItems() {
        return this.series.map((s, i) => ({ label: s.label, tone: s.tone ?? TONES[i % TONES.length] }));
    }
    get dataValueItems() {
        return this.series.flatMap((s) => this.axes.map((axis, axisIndex) => `${s.label}, ${axis}: ${s.values[axisIndex] ?? 0}`));
    }
    polygonClass(polygon, i) {
        return classNames("st-radarChart__polygon", `st-radarChart__polygon--${polygon.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== i && "st-radarChart__polygon--dim");
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: RadarChart, isStandalone: true, selector: "st-radar-chart", inputs: { axes: "axes", series: "series", maxValue: "maxValue", levels: "levels", width: "width", height: "height", legend: "legend", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadarChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { axes: [{
                type: NgInput
            }], series: [{
                type: NgInput
            }], maxValue: [{
                type: NgInput
            }], levels: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=RadarChart.js.map