import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, CHART_MARGIN, chartDataList, formatTick, isNumeric, niceTicks, scaleLinear, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
export class AreaChart {
    static stComponentName = "AreaChart";
    componentName = "AreaChart";
    MARGIN = MARGIN;
    gradientId = "areaGrad-" + Math.random().toString(36).substring(2, 9);
    hoveredIndex = null;
    focusedIndex = -1;
    data;
    width;
    height;
    tone;
    smooth;
    label;
    annotations;
    dataLabels;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return classNames("st-areaChart", `st-areaChart--${this.tone ?? "category1"}`, this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 240; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get normalizedData() {
        return (this.data ?? []).map((d, i) => typeof d === "number" ? { x: i, y: d } : d);
    }
    get yValues() {
        return this.normalizedData.map((d) => d.y).filter(Number.isFinite);
    }
    get yTicks() {
        if (this.yValues.length === 0)
            return [0];
        const minRaw = Math.min(...this.yValues);
        const maxRaw = Math.max(...this.yValues);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        const minTickVal = Math.min(0, minRaw - padded);
        return niceTicks(minTickVal, maxRaw + padded, 5);
    }
    get yDomain() {
        const t = this.yTicks;
        return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
    }
    get xIsNumeric() {
        return this.normalizedData.length > 0 && this.normalizedData.every((d) => isNumeric(d.x));
    }
    get xDomainMin() {
        if (!this.xIsNumeric)
            return 0;
        return Math.min(...this.normalizedData.map((d) => d.x));
    }
    get xDomainMax() {
        if (!this.xIsNumeric)
            return Math.max(this.normalizedData.length - 1, 1);
        return Math.max(...this.normalizedData.map((d) => d.x));
    }
    xPixel(datum, index) {
        if (this.xIsNumeric) {
            return MARGIN.left + scaleLinear(datum.x, this.xDomainMin, this.xDomainMax, 0, this.plotWidth);
        }
        const denom = Math.max(this.normalizedData.length - 1, 1);
        const x = this.normalizedData.length === 1 ? this.plotWidth / 2 : (index / denom) * this.plotWidth;
        return MARGIN.left + x;
    }
    yPixel(y) {
        return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
    }
    get points() {
        return this.normalizedData.map((datum, index) => ({
            x: this.xPixel(datum, index),
            y: this.yPixel(datum.y),
            datum,
            index,
        }));
    }
    get linePath() {
        if (this.points.length === 0)
            return "";
        return this.smooth ? buildSmoothPath(this.points) : buildLinearPath(this.points);
    }
    get areaPath() {
        if (this.points.length === 0)
            return "";
        const base = MARGIN.top + scaleLinear(Math.max(0, this.yDomain.min), this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
        const first = this.points[0];
        const last = this.points[this.points.length - 1];
        return `${this.linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
    }
    get gridLines() {
        return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
    }
    get xTickEntries() {
        if (this.normalizedData.length === 0)
            return [];
        if (!this.xIsNumeric) {
            return this.points.map((p, i) => ({
                key: String(this.normalizedData[i].x),
                x: p.x,
                label: String(this.normalizedData[i].x),
            }));
        }
        const target = Math.min(5, this.normalizedData.length);
        const stride = Math.max(1, Math.round((this.normalizedData.length - 1) / (target - 1 || 1)));
        const entries = [];
        for (let i = 0; i < this.normalizedData.length; i += stride) {
            entries.push({ key: String(i), x: this.points[i].x, label: String(this.normalizedData[i].x) });
        }
        const lastIdx = this.normalizedData.length - 1;
        if (entries[entries.length - 1]?.label !== String(this.normalizedData[lastIdx].x)) {
            entries.push({ key: String(lastIdx), x: this.points[lastIdx].x, label: String(this.normalizedData[lastIdx].x) });
        }
        return entries;
    }
    get annotationContext() {
        const self = this;
        return {
            xScale: (value) => {
                if (self.xIsNumeric) {
                    if (typeof value !== "number" || !Number.isFinite(value))
                        return null;
                    if (value < self.xDomainMin || value > self.xDomainMax)
                        return null;
                    return scaleLinear(value, self.xDomainMin, self.xDomainMax, 0, self.plotWidth);
                }
                const i = self.normalizedData.findIndex((d) => d.x === value);
                if (i < 0)
                    return null;
                const denom = Math.max(self.normalizedData.length - 1, 1);
                return self.normalizedData.length === 1 ? self.plotWidth / 2 : (i / denom) * self.plotWidth;
            },
            yScale: (value) => {
                if (!Number.isFinite(value) || value < self.yDomain.min || value > self.yDomain.max)
                    return null;
                return scaleLinear(value, self.yDomain.min, self.yDomain.max, self.plotHeight, 0);
            },
            plotLeft: MARGIN.left,
            plotTop: MARGIN.top,
            plotWidth: self.plotWidth,
            plotHeight: self.plotHeight,
        };
    }
    get resolvedAnnotations() {
        return resolveAnnotations(this.annotations, this.annotationContext);
    }
    get annotationRegions() {
        return this.resolvedAnnotations.filter((a) => a.kind === "region");
    }
    get annotationAbove() {
        return this.resolvedAnnotations.filter((a) => a.kind !== "region");
    }
    annotationShapePoints(annotation) {
        return polygonPoints(annotation.points);
    }
    get dataLabelItems() {
        const opts = normalizeDataLabels(this.dataLabels);
        if (!opts.enabled)
            return [];
        return this.points.map((p) => {
            const text = formatDataLabel(p.datum.y, opts, formatTick);
            const center = opts.position === "center" || opts.position === "inside";
            return { key: String(p.index), x: p.x, y: center ? p.y : p.y - 8, text: text ?? "", baseline: center ? "middle" : "auto" };
        });
    }
    get dataValueItems() {
        return [
            ...this.normalizedData.map((d) => `${d.x}: ${d.y}`),
            ...annotationDataListItems(this.annotations),
        ];
    }
    get hoverKeys() {
        return this.normalizedData.map((d) => keyForX(d.x));
    }
    get activeIndex() {
        return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
    }
    get hoveredPoint() {
        const idx = this.activeIndex;
        return idx >= 0 ? (this.points[idx] ?? null) : null;
    }
    get navEnabled() {
        return (this.keyboardNav === true || typeof this.onSelectKey === "function") && this.points.length > 0;
    }
    formatTickLabel(v) { return formatTick(v); }
    datapointLabel(pt) {
        return datapointAriaLabel(String(pt.datum.x), pt.datum.y);
    }
    rovingTabIndexFor(index) {
        return rovingTabIndex(index, this.focusedIndex, this.points.length);
    }
    tooltipLeft(pt) {
        return (pt.x / this.widthValue) * 100;
    }
    tooltipTop(pt) {
        return (pt.y / this.heightValue) * 100;
    }
    handleLeave() {
        this.hoveredIndex = null;
        this.onHoverKeyChange?.(null);
    }
    handleVisualPointerMove(e) {
        const target = e.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        const index = Number.isInteger(raw) ? raw : null;
        this.hoveredIndex = index;
        this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
    }
    handleDatapointFocus(index) {
        this.focusedIndex = index;
        this.hoveredIndex = index;
        this.onHoverKeyChange?.(this.hoverKeys[index] ?? null);
    }
    handleDatapointKeyDown(e, index) {
        const action = datapointNavAction(e.key, index, this.points.length);
        if (!action)
            return;
        e.preventDefault();
        if (action.kind === "move") {
            this.focusedIndex = action.index;
            this.hoveredIndex = action.index;
            this.onHoverKeyChange?.(this.hoverKeys[action.index] ?? null);
        }
        else if (action.kind === "select") {
            this.onSelectKey?.(this.hoverKeys[index] ?? null);
        }
        else {
            this.focusedIndex = -1;
            this.hoveredIndex = null;
            this.onSelectKey?.(null);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: AreaChart, isStandalone: true, selector: "st-area-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", smooth: "smooth", label: "label", annotations: "annotations", dataLabels: "dataLabels", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-areaChart__visual"
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
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="currentColor" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>

          @for (g of gridLines; track g.value) {
            <line class="st-areaChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-areaChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-areaChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-areaChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-areaChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @if (areaPath) {
            <path class="st-areaChart__area" [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'"></path>
          }
          @if (linePath) {
            <path class="st-areaChart__line" [attr.d]="linePath" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (p of points; track p.index) {
            <circle class="st-areaChart__dot" [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.data-chart-index]="p.index"></circle>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-areaChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-areaChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-areaChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-areaChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-areaChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-areaChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-areaChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-areaChart__crosshair" aria-hidden="true">
              <line class="st-areaChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-areaChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-areaChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-areaChart__navDatum"
                [attr.x]="p.x - 9"
                [attr.y]="p.y - 9"
                width="18"
                height="18"
                rx="3"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(p.index)"
                [attr.aria-label]="datapointLabel(p)"
                (keydown)="handleDatapointKeyDown($event, p.index)"
                (focus)="handleDatapointFocus(p.index)"
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

      @if (hoveredPoint) {
        <div
          class="st-areaChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-areaChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-areaChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AreaChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-area-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-areaChart__visual"
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
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="currentColor" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>

          @for (g of gridLines; track g.value) {
            <line class="st-areaChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-areaChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-areaChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-areaChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-areaChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @if (areaPath) {
            <path class="st-areaChart__area" [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'"></path>
          }
          @if (linePath) {
            <path class="st-areaChart__line" [attr.d]="linePath" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (p of points; track p.index) {
            <circle class="st-areaChart__dot" [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.data-chart-index]="p.index"></circle>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-areaChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-areaChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-areaChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-areaChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-areaChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-areaChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-areaChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-areaChart__crosshair" aria-hidden="true">
              <line class="st-areaChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-areaChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-areaChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-areaChart__navDatum"
                [attr.x]="p.x - 9"
                [attr.y]="p.y - 9"
                width="18"
                height="18"
                rx="3"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(p.index)"
                [attr.aria-label]="datapointLabel(p)"
                (keydown)="handleDatapointKeyDown($event, p.index)"
                (focus)="handleDatapointFocus(p.index)"
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

      @if (hoveredPoint) {
        <div
          class="st-areaChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-areaChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-areaChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], smooth: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], hoverKey: [{
                type: NgInput
            }], onHoverKeyChange: [{
                type: NgInput
            }], keyboardNav: [{
                type: NgInput
            }], onSelectKey: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AreaChart.js.map