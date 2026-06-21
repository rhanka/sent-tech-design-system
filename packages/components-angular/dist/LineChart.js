import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, CHART_MARGIN, chartDataList, clampFraction, extendValueDomain, fixedLogTicks, fixedTicks, forecastRuns, formatTick, isNumeric, linearRegression, logTicks, niceTicks, overlayDataListItems, overlayToneClass, scaleLinear, smallestPositive, validLinearDomain, validLogDomain, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
export class LineChart {
    static stComponentName = "LineChart";
    componentName = "LineChart";
    MARGIN = MARGIN;
    hoveredIndex = null;
    focusedIndex = -1;
    data;
    width;
    height;
    tone;
    smooth;
    area;
    label;
    referenceLines;
    bands;
    goalLine;
    trend;
    annotations;
    dataLabels;
    domain;
    scale;
    invertAxis;
    showLegend;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return classNames("st-lineChart", `st-lineChart--${this.tone ?? "category1"}`, this.classInput);
    }
    get widthValue() { return this.width ?? 480; }
    get heightValue() { return this.height ?? 240; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get plotWidth() { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
    get plotHeight() { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }
    get safeData() { return this.data ?? []; }
    get isLog() { return this.scale === "log"; }
    get validDomain() {
        return this.isLog ? validLogDomain(this.domain) : validLinearDomain(this.domain);
    }
    get goal() {
        return this.goalLine && Number.isFinite(this.goalLine.value) ? this.goalLine : null;
    }
    get xIsNumeric() {
        return this.safeData.length > 0 && this.safeData.every((d) => isNumeric(d.x));
    }
    get xDomainMin() {
        if (!this.xIsNumeric)
            return 0;
        return Math.min(...this.safeData.map((d) => d.x));
    }
    get xDomainMax() {
        if (!this.xIsNumeric)
            return Math.max(this.safeData.length - 1, 1);
        return Math.max(...this.safeData.map((d) => d.x));
    }
    get yValues() {
        return this.safeData.map((d) => d.y).filter(Number.isFinite);
    }
    get yTicks() {
        const ys = this.yValues;
        if (this.isLog) {
            const posOverlays = [
                ...(this.referenceLines ?? []).filter((r) => (r.axis ?? "y") === "y").map((r) => r.value),
                ...(this.bands ?? []).flatMap((b) => [b.from, b.to]),
                ...(this.goal ? [this.goal.value] : []),
            ];
            let lo;
            let hi;
            if (this.validDomain) {
                lo = this.validDomain[0];
                hi = this.validDomain[1];
            }
            else {
                lo = smallestPositive(...ys, ...posOverlays);
                hi = Math.max(lo, ...ys.filter((y) => y > 0), ...posOverlays.filter((v) => v > 0));
            }
            return this.validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
        }
        if (this.validDomain)
            return fixedTicks(this.validDomain[0], this.validDomain[1], 5);
        if (ys.length === 0)
            return [0];
        let minRaw = Math.min(...ys);
        let maxRaw = Math.max(...ys);
        const [extMin, extMax] = extendValueDomain(minRaw, maxRaw, {
            referenceLines: this.referenceLines,
            referenceAxis: "y",
            bands: this.bands,
            goalLine: this.goal,
        });
        minRaw = extMin;
        maxRaw = extMax;
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        return niceTicks(minRaw - padded, maxRaw + padded, 5);
    }
    get yDomain() {
        const t = this.yTicks;
        return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
    }
    valueFraction(v) {
        let f;
        if (this.isLog) {
            const lo = Math.log10(this.yDomain.min);
            const hi = Math.log10(this.yDomain.max);
            const clamped = v > 0 ? v : this.yDomain.min;
            f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
        }
        else {
            f = this.yDomain.max === this.yDomain.min ? 0 : (v - this.yDomain.min) / (this.yDomain.max - this.yDomain.min);
        }
        return clampFraction(this.invertAxis ? 1 - f : f);
    }
    yPixel(v) {
        return MARGIN.top + this.plotHeight * (1 - this.valueFraction(v));
    }
    xPixel(datum, index) {
        if (this.xIsNumeric) {
            return MARGIN.left + scaleLinear(datum.x, this.xDomainMin, this.xDomainMax, 0, this.plotWidth);
        }
        const denom = Math.max(this.safeData.length - 1, 1);
        const x = this.safeData.length === 1 ? this.plotWidth / 2 : (index / denom) * this.plotWidth;
        return MARGIN.left + x;
    }
    get points() {
        return this.safeData.map((datum, index) => ({
            x: this.xPixel(datum, index),
            y: this.yPixel(datum.y),
            datum,
            index,
        }));
    }
    get forecastFlags() {
        return this.safeData.map((d) => d.forecast === true);
    }
    get hasForecast() {
        return this.forecastFlags.some(Boolean);
    }
    get fullLinePath() {
        if (this.points.length === 0)
            return "";
        return this.smooth ? buildSmoothPath(this.points) : buildLinearPath(this.points);
    }
    get computedForecastRuns() {
        return this.hasForecast ? forecastRuns(this.forecastFlags) : [];
    }
    get solidPaths() {
        if (!this.hasForecast)
            return this.fullLinePath ? [this.fullLinePath] : [];
        return this.computedForecastRuns
            .filter((r) => !r.forecast)
            .map((r) => {
            const seg = this.points.slice(r.start, r.end + 1);
            return this.smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
        });
    }
    get forecastPaths() {
        return this.computedForecastRuns
            .filter((r) => r.forecast)
            .map((r) => {
            const seg = this.points.slice(r.start, r.end + 1);
            return this.smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
        });
    }
    get areaPath() {
        if (!this.area || this.points.length === 0)
            return "";
        const base = MARGIN.top + this.plotHeight;
        const first = this.points[0];
        const last = this.points[this.points.length - 1];
        return `${this.fullLinePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
    }
    get gridLines() {
        return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
    }
    get xTickEntries() {
        if (this.safeData.length === 0)
            return [];
        if (!this.xIsNumeric) {
            return this.points.map((p, i) => ({
                key: String(i),
                x: p.x,
                label: String(this.safeData[i].x),
            }));
        }
        const target = Math.min(5, this.safeData.length);
        const stride = Math.max(1, Math.round((this.safeData.length - 1) / (target - 1 || 1)));
        const entries = [];
        for (let i = 0; i < this.safeData.length; i += stride) {
            entries.push({ key: String(i), x: this.points[i].x, label: String(this.safeData[i].x) });
        }
        const lastIdx = this.safeData.length - 1;
        if (entries[entries.length - 1]?.label !== String(this.safeData[lastIdx].x)) {
            entries.push({ key: String(lastIdx), x: this.points[lastIdx].x, label: String(this.safeData[lastIdx].x) });
        }
        return entries;
    }
    get bandRects() {
        return (this.bands ?? [])
            .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
            .map((b, key) => {
            const y1 = this.yPixel(b.from);
            const y2 = this.yPixel(b.to);
            return {
                key,
                x: MARGIN.left,
                y: Math.min(y1, y2),
                width: this.plotWidth,
                height: Math.max(Math.abs(y2 - y1), 0.5),
                label: b.label,
                tone: b.tone,
            };
        });
    }
    bandClass(band) {
        return classNames("st-lineChart__band", overlayToneClass("st-lineChart__band", band.tone));
    }
    get refLines() {
        return (this.referenceLines ?? [])
            .filter((r) => Number.isFinite(r.value))
            .map((r, key) => {
            const axis = r.axis ?? "y";
            if (axis === "x") {
                if (!this.xIsNumeric)
                    return null;
                const x = MARGIN.left + scaleLinear(r.value, this.xDomainMin, this.xDomainMax, 0, this.plotWidth);
                return { key, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + this.plotHeight, label: r.label, tone: r.tone };
            }
            const y = this.yPixel(r.value);
            return { key, axis, x1: MARGIN.left, x2: MARGIN.left + this.plotWidth, y1: y, y2: y, label: r.label, tone: r.tone };
        })
            .filter((r) => r !== null);
    }
    refLineClass(line) {
        return classNames("st-lineChart__refLine", overlayToneClass("st-lineChart__refLine", line.tone));
    }
    get trendLine() {
        if (!this.trend || !this.xIsNumeric)
            return null;
        const model = linearRegression(this.safeData.map((d) => ({ x: d.x, y: d.y })));
        if (!model)
            return null;
        return {
            x1: MARGIN.left + scaleLinear(model.minX, this.xDomainMin, this.xDomainMax, 0, this.plotWidth),
            y1: this.yPixel(model.slope * model.minX + model.intercept),
            x2: MARGIN.left + scaleLinear(model.maxX, this.xDomainMin, this.xDomainMax, 0, this.plotWidth),
            y2: this.yPixel(model.slope * model.maxX + model.intercept),
        };
    }
    get goalGeom() {
        return this.goal ? { y: this.yPixel(this.goal.value), label: this.goal.label, value: this.goal.value } : null;
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
                const i = self.safeData.findIndex((d) => d.x === value);
                if (i < 0)
                    return null;
                const denom = Math.max(self.safeData.length - 1, 1);
                return self.safeData.length === 1 ? self.plotWidth / 2 : (i / denom) * self.plotWidth;
            },
            yScale: (value) => {
                if (!Number.isFinite(value))
                    return null;
                return self.plotHeight * (1 - self.valueFraction(value));
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
    dotClass(index) {
        return this.forecastFlags[index]
            ? "st-lineChart__dot st-lineChart__dot--forecast"
            : "st-lineChart__dot";
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
            ...this.safeData.map((d, i) => (this.forecastFlags[i] ? `${d.x}: ${d.y} (prévision)` : `${d.x}: ${d.y}`)),
            ...overlayDataListItems({
                referenceLines: this.referenceLines,
                bands: this.bands,
                goalLine: this.goal,
                trend: this.trendLine ? { slope: 0 } : null,
            }),
            ...annotationDataListItems(this.annotations),
        ];
    }
    get hoverKeys() {
        return this.safeData.map((d) => keyForX(d.x));
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LineChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LineChart, isStandalone: true, selector: "st-line-chart", inputs: { data: "data", width: "width", height: "height", tone: "tone", smooth: "smooth", area: "area", label: "label", referenceLines: "referenceLines", bands: "bands", goalLine: "goalLine", trend: "trend", annotations: "annotations", dataLabels: "dataLabels", domain: "domain", scale: "scale", invertAxis: "invertAxis", showLegend: "showLegend", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lineChart__visual"
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
          @for (g of gridLines; track g.value) {
            <line class="st-lineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-lineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-lineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (b of bandRects; track b.key) {
            <rect [class]="bandClass(b)" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.width" [attr.height]="b.height"></rect>
            @if (b.label) {
              <text class="st-lineChart__overlayLabel" [attr.x]="b.x + 4" [attr.y]="b.y + 11">{{ b.label }}</text>
            }
          }

          @for (r of refLines; track r.key) {
            <line [class]="refLineClass(r)" [attr.x1]="r.x1" [attr.x2]="r.x2" [attr.y1]="r.y1" [attr.y2]="r.y2"></line>
            @if (r.label) {
              <text
                class="st-lineChart__overlayLabel"
                [attr.x]="r.axis === 'x' ? r.x1 + 4 : MARGIN.left + plotWidth - 4"
                [attr.y]="r.axis === 'x' ? MARGIN.top + 11 : r.y1 - 4"
                [attr.text-anchor]="r.axis === 'x' ? 'start' : 'end'"
              >{{ r.label }}</text>
            }
          }

          @if (trendLine) {
            <line class="st-lineChart__trend" [attr.x1]="trendLine.x1" [attr.y1]="trendLine.y1" [attr.x2]="trendLine.x2" [attr.y2]="trendLine.y2"></line>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-lineChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-lineChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @if (area && areaPath) {
            <path class="st-lineChart__area" [attr.d]="areaPath" fill-opacity="0.18"></path>
          }

          @for (path of solidPaths; track $index) {
            <path class="st-lineChart__line" [attr.d]="path" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }
          @for (path of forecastPaths; track $index) {
            <path class="st-lineChart__line st-lineChart__line--forecast" [attr.d]="path" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (p of points; track p.index) {
            <circle
              [class]="dotClass(p.index)"
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              r="4"
              [attr.data-chart-index]="p.index"
            ></circle>
          }

          @if (goalGeom) {
            <line class="st-lineChart__goalLine" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left + plotWidth" [attr.y1]="goalGeom.y" [attr.y2]="goalGeom.y"></line>
            <text class="st-lineChart__goalLabel" [attr.x]="MARGIN.left + plotWidth - 4" [attr.y]="goalGeom.y - 4" text-anchor="end">{{ goalGeom.label ?? 'Objectif ' + goalGeom.value }}</text>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-lineChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-lineChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-lineChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-lineChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-lineChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-lineChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-lineChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-lineChart__crosshair" aria-hidden="true">
              <line class="st-lineChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-lineChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-lineChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-lineChart__navDatum"
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
          class="st-lineChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-lineChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-lineChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LineChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-line-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lineChart__visual"
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
          @for (g of gridLines; track g.value) {
            <line class="st-lineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-lineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-lineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (b of bandRects; track b.key) {
            <rect [class]="bandClass(b)" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.width" [attr.height]="b.height"></rect>
            @if (b.label) {
              <text class="st-lineChart__overlayLabel" [attr.x]="b.x + 4" [attr.y]="b.y + 11">{{ b.label }}</text>
            }
          }

          @for (r of refLines; track r.key) {
            <line [class]="refLineClass(r)" [attr.x1]="r.x1" [attr.x2]="r.x2" [attr.y1]="r.y1" [attr.y2]="r.y2"></line>
            @if (r.label) {
              <text
                class="st-lineChart__overlayLabel"
                [attr.x]="r.axis === 'x' ? r.x1 + 4 : MARGIN.left + plotWidth - 4"
                [attr.y]="r.axis === 'x' ? MARGIN.top + 11 : r.y1 - 4"
                [attr.text-anchor]="r.axis === 'x' ? 'start' : 'end'"
              >{{ r.label }}</text>
            }
          }

          @if (trendLine) {
            <line class="st-lineChart__trend" [attr.x1]="trendLine.x1" [attr.y1]="trendLine.y1" [attr.x2]="trendLine.x2" [attr.y2]="trendLine.y2"></line>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-lineChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-lineChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @if (area && areaPath) {
            <path class="st-lineChart__area" [attr.d]="areaPath" fill-opacity="0.18"></path>
          }

          @for (path of solidPaths; track $index) {
            <path class="st-lineChart__line" [attr.d]="path" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }
          @for (path of forecastPaths; track $index) {
            <path class="st-lineChart__line st-lineChart__line--forecast" [attr.d]="path" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (p of points; track p.index) {
            <circle
              [class]="dotClass(p.index)"
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              r="4"
              [attr.data-chart-index]="p.index"
            ></circle>
          }

          @if (goalGeom) {
            <line class="st-lineChart__goalLine" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left + plotWidth" [attr.y1]="goalGeom.y" [attr.y2]="goalGeom.y"></line>
            <text class="st-lineChart__goalLabel" [attr.x]="MARGIN.left + plotWidth - 4" [attr.y]="goalGeom.y - 4" text-anchor="end">{{ goalGeom.label ?? 'Objectif ' + goalGeom.value }}</text>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-lineChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-lineChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-lineChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-lineChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-lineChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-lineChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-lineChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-lineChart__crosshair" aria-hidden="true">
              <line class="st-lineChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-lineChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-lineChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-lineChart__navDatum"
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
          class="st-lineChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-lineChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-lineChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
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
            }], area: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], referenceLines: [{
                type: NgInput
            }], bands: [{
                type: NgInput
            }], goalLine: [{
                type: NgInput
            }], trend: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
                type: NgInput
            }], domain: [{
                type: NgInput
            }], scale: [{
                type: NgInput
            }], invertAxis: [{
                type: NgInput
            }], showLegend: [{
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
//# sourceMappingURL=LineChart.js.map