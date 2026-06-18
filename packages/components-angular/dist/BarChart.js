import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, clampFraction, extendValueDomain, fixedLogTicks, fixedTicks, formatTick, logTicks, niceTicks, overlayDataListItems, overlayToneClass, smallestPositive, validLinearDomain, validLogDomain, } from "./chartScale.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
export class BarChart {
    static stComponentName = "BarChart";
    componentName = "BarChart";
    margin = CHART_MARGIN;
    navDatumElements;
    hoveredIndex = null;
    focusedIndex = -1;
    data = [];
    width;
    height;
    orientation;
    label = "";
    domain;
    selectedKeys;
    onSelect;
    referenceLines;
    bands;
    goalLine;
    annotations;
    dataLabels;
    scale;
    invertAxis;
    showLegend;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return classNames("st-barChart", this.classInput);
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
    get orientationValue() {
        return this.orientation ?? "vertical";
    }
    get isVertical() {
        return this.orientationValue === "vertical";
    }
    get plotWidth() {
        return Math.max(this.widthValue - CHART_MARGIN.left - CHART_MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - CHART_MARGIN.top - CHART_MARGIN.bottom, 1);
    }
    get selectedSet() {
        return new Set(this.selectedKeys ?? []);
    }
    get hasSelection() {
        return this.selectedSet.size > 0;
    }
    get interactive() {
        return typeof this.onSelect === "function";
    }
    get goal() {
        return this.goalLine && Number.isFinite(this.goalLine.value) ? this.goalLine : null;
    }
    get valueAxis() {
        return this.isVertical ? "y" : "x";
    }
    get errorExtents() {
        return this.data.flatMap((datum) => [datum.errorLow, datum.errorHigh].filter((value) => value !== undefined && Number.isFinite(value)));
    }
    get ticks() {
        const isLog = this.scale === "log";
        const validDomain = isLog ? validLogDomain(this.domain) : validLinearDomain(this.domain);
        const valueReferenceLines = (this.referenceLines ?? []).filter((line) => (line.axis ?? "y") === this.valueAxis);
        const values = this.data.map((datum) => datum.value);
        if (isLog) {
            const posOverlays = [
                ...valueReferenceLines.map((line) => line.value),
                ...(this.bands ?? []).flatMap((band) => [band.from, band.to]),
                ...(this.goal ? [this.goal.value] : []),
                ...this.errorExtents,
            ];
            let lo;
            let hi;
            if (validDomain) {
                lo = validDomain[0];
                hi = validDomain[1];
            }
            else {
                lo = smallestPositive(...values, ...posOverlays);
                hi = Math.max(lo, ...values.filter((value) => value > 0), ...posOverlays.filter((value) => value > 0));
            }
            return validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
        }
        let minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
        let maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
        if (!validDomain) {
            [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
                referenceLines: this.referenceLines,
                referenceAxis: this.valueAxis,
                bands: this.bands,
                goalLine: this.goal,
                extraValues: this.errorExtents,
            });
        }
        return validDomain ? fixedTicks(minRaw, maxRaw, 5) : niceTicks(minRaw, maxRaw, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? this.domainMin;
    }
    get baselineValue() {
        return this.scale === "log" ? this.domainMin : Math.min(this.domainMax, Math.max(this.domainMin, 0));
    }
    valueFraction(value) {
        let fraction;
        if (this.scale === "log") {
            const lo = Math.log10(this.domainMin);
            const hi = Math.log10(this.domainMax);
            const clamped = value > 0 ? value : this.domainMin;
            fraction = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
        }
        else {
            fraction = this.domainMax === this.domainMin ? 0 : (value - this.domainMin) / (this.domainMax - this.domainMin);
        }
        return clampFraction(this.invertAxis ? 1 - fraction : fraction);
    }
    valuePos(value) {
        return this.isVertical
            ? CHART_MARGIN.top + this.plotHeight * (1 - this.valueFraction(value))
            : CHART_MARGIN.left + this.plotWidth * this.valueFraction(value);
    }
    get bars() {
        if (this.data.length === 0)
            return [];
        if (this.isVertical) {
            const band = this.plotWidth / this.data.length;
            const barWidth = band * 0.62;
            const zeroY = this.plotHeight * (1 - this.valueFraction(this.baselineValue));
            return this.data.map((datum, index) => {
                const valueY = this.plotHeight * (1 - this.valueFraction(datum.value));
                const y = Math.min(valueY, zeroY);
                const height = Math.abs(zeroY - valueY);
                const x = CHART_MARGIN.left + band * index + (band - barWidth) / 2;
                return {
                    index,
                    x,
                    y: CHART_MARGIN.top + y,
                    width: barWidth,
                    height: Math.max(height, 0.5),
                    cx: CHART_MARGIN.left + band * (index + 0.5),
                    cy: CHART_MARGIN.top + valueY,
                    datum,
                    tone: (datum.tone ?? "category1"),
                };
            });
        }
        const band = this.plotHeight / this.data.length;
        const barHeight = band * 0.62;
        const zeroX = this.plotWidth * this.valueFraction(this.baselineValue);
        return this.data.map((datum, index) => {
            const valueX = this.plotWidth * this.valueFraction(datum.value);
            const x = Math.min(valueX, zeroX);
            const width = Math.abs(valueX - zeroX);
            const y = CHART_MARGIN.top + band * index + (band - barHeight) / 2;
            return {
                index,
                x: CHART_MARGIN.left + x,
                y,
                width: Math.max(width, 0.5),
                height: barHeight,
                cx: CHART_MARGIN.left + valueX,
                cy: CHART_MARGIN.top + band * (index + 0.5),
                datum,
                tone: (datum.tone ?? "category1"),
            };
        });
    }
    get gridItems() {
        return this.ticks.map((tick) => {
            if (this.isVertical) {
                const y = CHART_MARGIN.top + this.plotHeight * (1 - this.valueFraction(tick));
                return {
                    key: `y-${tick}`,
                    value: tick,
                    x1: CHART_MARGIN.left,
                    x2: CHART_MARGIN.left + this.plotWidth,
                    y1: y,
                    y2: y,
                    labelX: CHART_MARGIN.left - 6,
                    labelY: y,
                    textAnchor: "end",
                    dominantBaseline: "middle",
                };
            }
            const x = CHART_MARGIN.left + this.plotWidth * this.valueFraction(tick);
            return {
                key: `x-${tick}`,
                value: tick,
                x1: x,
                x2: x,
                y1: CHART_MARGIN.top,
                y2: CHART_MARGIN.top + this.plotHeight,
                labelX: x,
                labelY: this.heightValue - CHART_MARGIN.bottom + 16,
                textAnchor: "middle",
            };
        });
    }
    get categoryLabels() {
        return this.bars.map((bar) => this.isVertical
            ? {
                key: bar.datum.label,
                x: bar.x + bar.width / 2,
                y: this.heightValue - CHART_MARGIN.bottom + 16,
                text: bar.datum.label,
                textAnchor: "middle",
            }
            : {
                key: bar.datum.label,
                x: CHART_MARGIN.left - 6,
                y: bar.y + bar.height / 2,
                text: bar.datum.label,
                textAnchor: "end",
                dominantBaseline: "middle",
            });
    }
    get bandRects() {
        return (this.bands ?? [])
            .filter((band) => Number.isFinite(band.from) && Number.isFinite(band.to))
            .map((band, key) => {
            const p1 = this.valuePos(band.from);
            const p2 = this.valuePos(band.to);
            return this.isVertical
                ? {
                    key,
                    x: CHART_MARGIN.left,
                    y: Math.min(p1, p2),
                    width: this.plotWidth,
                    height: Math.max(Math.abs(p2 - p1), 0.5),
                    label: band.label,
                    tone: band.tone,
                }
                : {
                    key,
                    x: Math.min(p1, p2),
                    y: CHART_MARGIN.top,
                    width: Math.max(Math.abs(p2 - p1), 0.5),
                    height: this.plotHeight,
                    label: band.label,
                    tone: band.tone,
                };
        });
    }
    get refLines() {
        return (this.referenceLines ?? [])
            .filter((line) => Number.isFinite(line.value))
            .map((line, key) => {
            const p = this.valuePos(line.value);
            return this.isVertical
                ? { key, x1: CHART_MARGIN.left, x2: CHART_MARGIN.left + this.plotWidth, y1: p, y2: p, label: line.label, tone: line.tone }
                : { key, x1: p, x2: p, y1: CHART_MARGIN.top, y2: CHART_MARGIN.top + this.plotHeight, label: line.label, tone: line.tone };
        });
    }
    categoryPixel(value) {
        const bar = this.bars.find((item) => item.datum.label === String(value));
        if (!bar)
            return null;
        return this.isVertical ? bar.cx - CHART_MARGIN.left : bar.cy - CHART_MARGIN.top;
    }
    valuePixelRel(value) {
        if (!Number.isFinite(value))
            return null;
        return this.valuePos(value) - (this.isVertical ? CHART_MARGIN.top : CHART_MARGIN.left);
    }
    transposeAnnotations(list) {
        if (!list || this.isVertical)
            return list;
        return list.map((annotation) => {
            switch (annotation.kind) {
                case "line":
                    return { ...annotation, axis: annotation.axis === "x" ? "y" : "x" };
                case "region":
                    return { ...annotation, axis: annotation.axis === "x" ? "y" : "x" };
                case "point":
                    return { ...annotation, x: annotation.y, y: typeof annotation.x === "number" ? annotation.x : Number.NaN };
                case "label":
                    return { ...annotation, x: annotation.y, y: typeof annotation.x === "number" ? annotation.x : Number.NaN };
                case "shape":
                    return {
                        ...annotation,
                        points: annotation.points.map((point) => ({
                            x: point.y,
                            y: typeof point.x === "number" ? point.x : Number.NaN,
                        })),
                    };
            }
        });
    }
    get resolvedAnnotations() {
        const annXScale = (value) => this.isVertical ? this.categoryPixel(value) : typeof value === "number" ? this.valuePixelRel(value) : null;
        const annYScale = (value) => (this.isVertical ? this.valuePixelRel(value) : this.categoryPixel(value));
        return resolveAnnotations(this.transposeAnnotations(this.annotations), {
            xScale: annXScale,
            yScale: annYScale,
            plotLeft: CHART_MARGIN.left,
            plotTop: CHART_MARGIN.top,
            plotWidth: this.plotWidth,
            plotHeight: this.plotHeight,
        });
    }
    get annotationRegions() {
        return this.resolvedAnnotations.filter((annotation) => annotation.kind === "region");
    }
    get annotationAbove() {
        return this.resolvedAnnotations.filter((annotation) => annotation.kind !== "region");
    }
    get goalGeom() {
        return this.goal ? { p: this.valuePos(this.goal.value), label: this.goal.label, value: this.goal.value } : null;
    }
    get errorBarGeom() {
        const out = [];
        for (const bar of this.bars) {
            const { errorLow, errorHigh } = bar.datum;
            const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
            const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
            if (!hasLow && !hasHigh)
                continue;
            const low = this.valuePos(hasLow ? errorLow : bar.datum.value);
            const high = this.valuePos(hasHigh ? errorHigh : bar.datum.value);
            const cap = 4;
            if (this.isVertical) {
                const cx = bar.x + bar.width / 2;
                out.push({
                    key: bar.datum.label,
                    stem: { x1: cx, y1: low, x2: cx, y2: high },
                    capLow: { x1: cx - cap, y1: low, x2: cx + cap, y2: low },
                    capHigh: { x1: cx - cap, y1: high, x2: cx + cap, y2: high },
                });
            }
            else {
                const cy = bar.y + bar.height / 2;
                out.push({
                    key: bar.datum.label,
                    stem: { x1: low, y1: cy, x2: high, y2: cy },
                    capLow: { x1: low, y1: cy - cap, x2: low, y2: cy + cap },
                    capHigh: { x1: high, y1: cy - cap, x2: high, y2: cy + cap },
                });
            }
        }
        return out;
    }
    get dataLabelItems() {
        const options = normalizeDataLabels(this.dataLabels);
        if (!options.enabled)
            return [];
        const items = [];
        for (const bar of this.bars) {
            const text = formatDataLabel(bar.datum.value, options, formatTick);
            const position = options.position ?? "outside";
            const inside = position === "inside" || position === "center";
            if (!text)
                continue;
            if (this.isVertical) {
                items.push({
                    key: bar.datum.label,
                    x: bar.cx,
                    y: inside ? bar.y + bar.height / 2 : bar.cy - 6,
                    text,
                    anchor: "middle",
                    baseline: inside ? "middle" : "auto",
                });
            }
            else {
                items.push({
                    key: bar.datum.label,
                    x: inside ? bar.x + bar.width / 2 : bar.cx + 4,
                    y: bar.cy,
                    text,
                    anchor: inside ? "middle" : "start",
                    baseline: "middle",
                });
            }
        }
        return items;
    }
    get dataValueItems() {
        return [
            ...this.data.map((datum) => `${datum.label}: ${datum.value}`),
            ...overlayDataListItems({
                referenceLines: this.referenceLines,
                bands: this.bands,
                goalLine: this.goal,
                trend: null,
            }),
            ...annotationDataListItems(this.annotations),
        ];
    }
    get hoverKeys() {
        return this.bars.map((bar) => bar.datum.label);
    }
    get activeIndex() {
        return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
    }
    get hoveredBar() {
        return this.activeIndex >= 0 ? this.bars[this.activeIndex] ?? null : null;
    }
    get navEnabled() {
        return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.bars.length > 0;
    }
    formatTickLabel(value) {
        return formatTick(value);
    }
    bandClass(band) {
        return classNames("st-barChart__band", overlayToneClass("st-barChart__band", band.tone));
    }
    refLineClass(line) {
        return classNames("st-barChart__refLine", overlayToneClass("st-barChart__refLine", line.tone));
    }
    refLineLabelX(line) {
        return this.isVertical ? CHART_MARGIN.left + this.plotWidth - 4 : line.x1 + 4;
    }
    refLineLabelY(line) {
        return this.isVertical ? line.y1 - 4 : CHART_MARGIN.top + 11;
    }
    annotationLineLabelX(annotation) {
        return annotation.axis === "x" ? annotation.x1 + 4 : CHART_MARGIN.left + this.plotWidth - 4;
    }
    annotationLineLabelY(annotation) {
        return annotation.axis === "x" ? CHART_MARGIN.top + 11 : annotation.y1 - 4;
    }
    annotationLineTextAnchor(annotation) {
        return annotation.axis === "x" ? "start" : "end";
    }
    annotationShapePoints(annotation) {
        return polygonPoints(annotation.points);
    }
    barClass(bar) {
        const selected = this.selectedSet.has(bar.datum.label);
        return classNames("st-barChart__bar", `st-barChart__bar--${bar.tone}`, selected && "st-barChart__bar--selected", this.hasSelection && !selected && "st-barChart__bar--dim", this.interactive && "st-barChart__bar--interactive");
    }
    filterChipClass(bar) {
        return classNames("st-barChart__filterChip", `st-barChart__filterChip--${bar.tone}`, this.selectedSet.has(bar.datum.label) && "st-barChart__filterChip--selected");
    }
    selectBar(key) {
        if (!this.interactive)
            return;
        this.onSelect?.(key);
    }
    tooltipLeft(bar) {
        return (bar.cx / this.widthValue) * 100;
    }
    tooltipTop(bar) {
        return (bar.cy / this.heightValue) * 100;
    }
    rovingTabIndexFor(index) {
        return rovingTabIndex(index, this.focusedIndex, this.bars.length);
    }
    datapointLabel(bar) {
        return datapointAriaLabel(bar.datum.label, bar.datum.value);
    }
    emitHoverKey(index) {
        this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
    }
    handleLeave() {
        this.hoveredIndex = null;
        this.emitHoverKey(null);
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        const index = Number.isInteger(raw) ? raw : null;
        this.hoveredIndex = index;
        this.emitHoverKey(index);
    }
    handleDatapointFocus(index) {
        this.focusedIndex = index;
        this.emitHoverKey(index);
    }
    focusDatum(index) {
        this.focusedIndex = index;
        this.navDatumElements?.get(index)?.nativeElement.focus();
        this.emitHoverKey(index);
    }
    handleDatapointKeyDown(event, index) {
        const action = datapointNavAction(event.key, index, this.bars.length);
        if (!action)
            return;
        event.preventDefault();
        if (action.kind === "move") {
            this.focusDatum(action.index);
        }
        else if (action.kind === "select") {
            this.onSelectKey?.(this.bars[index]?.datum.label ?? null);
        }
        else {
            this.focusedIndex = -1;
            this.emitHoverKey(null);
            this.onSelectKey?.(null);
            event.currentTarget?.blur?.();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BarChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: BarChart, isStandalone: true, selector: "st-bar-chart", inputs: { data: "data", width: "width", height: "height", orientation: "orientation", label: "label", domain: "domain", selectedKeys: "selectedKeys", onSelect: "onSelect", referenceLines: "referenceLines", bands: "bands", goalLine: "goalLine", annotations: "annotations", dataLabels: "dataLabels", scale: "scale", invertAxis: "invertAxis", showLegend: "showLegend", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, viewQueries: [{ propertyName: "navDatumElements", predicate: ["navDatum"], descendants: true }], ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-barChart__visual"
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
          @for (grid of gridItems; track grid.key) {
            <line class="st-barChart__grid" [attr.x1]="grid.x1" [attr.x2]="grid.x2" [attr.y1]="grid.y1" [attr.y2]="grid.y2"></line>
            <text
              class="st-barChart__tickLabel"
              [attr.x]="grid.labelX"
              [attr.y]="grid.labelY"
              [attr.text-anchor]="grid.textAnchor"
              [attr.dominant-baseline]="grid.dominantBaseline"
            >
              {{ formatTickLabel(grid.value) }}
            </text>
          }
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (category of categoryLabels; track category.key) {
            <text
              class="st-barChart__categoryLabel"
              [attr.x]="category.x"
              [attr.y]="category.y"
              [attr.text-anchor]="category.textAnchor"
              [attr.dominant-baseline]="category.dominantBaseline"
            >
              {{ category.text }}
            </text>
          }

          @for (band of bandRects; track band.key) {
            <rect [class]="bandClass(band)" [attr.x]="band.x" [attr.y]="band.y" [attr.width]="band.width" [attr.height]="band.height"></rect>
            @if (band.label) {
              <text class="st-barChart__overlayLabel" [attr.x]="band.x + 4" [attr.y]="band.y + 11">{{ band.label }}</text>
            }
          }
          @for (line of refLines; track line.key) {
            <line [class]="refLineClass(line)" [attr.x1]="line.x1" [attr.x2]="line.x2" [attr.y1]="line.y1" [attr.y2]="line.y2"></line>
            @if (line.label) {
              <text
                class="st-barChart__overlayLabel"
                [attr.x]="refLineLabelX(line)"
                [attr.y]="refLineLabelY(line)"
                [attr.text-anchor]="isVertical ? 'end' : 'start'"
              >
                {{ line.label }}
              </text>
            }
          }

          @if (annotationRegions.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--behind">
              @for (annotation of annotationRegions; track annotation.key) {
                <rect class="st-barChart__annotationRegion" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.width]="annotation.width" [attr.height]="annotation.height"></rect>
                @if (annotation.label) {
                  <text class="st-barChart__annotationLabel" [attr.x]="annotation.x + 4" [attr.y]="annotation.y + 11">{{ annotation.label }}</text>
                }
              }
            </g>
          }

          @for (bar of bars; track bar.datum.label) {
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
              (click)="selectBar(bar.datum.label)"
            ></rect>
          }

          @for (error of errorBarGeom; track error.key) {
            <g class="st-barChart__errorBar">
              <line class="st-barChart__errorStem" [attr.x1]="error.stem.x1" [attr.y1]="error.stem.y1" [attr.x2]="error.stem.x2" [attr.y2]="error.stem.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capLow.x1" [attr.y1]="error.capLow.y1" [attr.x2]="error.capLow.x2" [attr.y2]="error.capLow.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capHigh.x1" [attr.y1]="error.capHigh.y1" [attr.x2]="error.capHigh.x2" [attr.y2]="error.capHigh.y2"></line>
            </g>
          }

          @if (goalGeom; as goal) {
            @if (isVertical) {
              <line class="st-barChart__goalLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="goal.p" [attr.y2]="goal.p"></line>
              <text class="st-barChart__goalLabel" [attr.x]="margin.left + plotWidth - 4" [attr.y]="goal.p - 4" text-anchor="end">{{ goal.label ?? "Objectif " + goal.value }}</text>
            } @else {
              <line class="st-barChart__goalLine" [attr.x1]="goal.p" [attr.x2]="goal.p" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              <text class="st-barChart__goalLabel" [attr.x]="goal.p + 4" [attr.y]="margin.top + 11" text-anchor="start">{{ goal.label ?? "Objectif " + goal.value }}</text>
            }
          }

          @if (annotationAbove.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--above">
              @for (annotation of annotationAbove; track annotation.key) {
                @switch (annotation.kind) {
                  @case ("line") {
                    <line class="st-barChart__annotationLine" [attr.x1]="annotation.x1" [attr.y1]="annotation.y1" [attr.x2]="annotation.x2" [attr.y2]="annotation.y2"></line>
                    @if (annotation.label) {
                      <text
                        class="st-barChart__annotationLabel"
                        [attr.x]="annotationLineLabelX(annotation)"
                        [attr.y]="annotationLineLabelY(annotation)"
                        [attr.text-anchor]="annotationLineTextAnchor(annotation)"
                      >
                        {{ annotation.label }}
                      </text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-barChart__annotationShape" [attr.points]="annotationShapePoints(annotation)"></polygon>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.labelX" [attr.y]="annotation.labelY" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-barChart__annotationPoint" [attr.cx]="annotation.x" [attr.cy]="annotation.y" r="4.5"></circle>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.x" [attr.y]="annotation.y - 8" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-barChart__annotationText" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.text-anchor]="annotation.anchor">{{ annotation.text }}</text>
                  }
                }
              }
            </g>
          }

          @for (label of dataLabelItems; track label.key) {
            <text
              class="st-barChart__dataLabel"
              aria-hidden="true"
              [attr.x]="label.x"
              [attr.y]="label.y"
              [attr.text-anchor]="label.anchor"
              [attr.dominant-baseline]="label.baseline"
            >
              {{ label.text }}
            </text>
          }

          @if (hoveredBar; as bar) {
            <g class="st-barChart__crosshair" aria-hidden="true">
              @if (isVertical) {
                <line class="st-barChart__crosshairLine" [attr.x1]="bar.cx" [attr.x2]="bar.cx" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              } @else {
                <line class="st-barChart__crosshairLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="bar.cy" [attr.y2]="bar.cy"></line>
              }
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-barChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (bar of bars; track bar.datum.label) {
              <rect
                #navDatum
                class="st-barChart__navDatum"
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.height"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(bar.index)"
                [attr.aria-label]="datapointLabel(bar)"
                (keydown)="handleDatapointKeyDown($event, bar.index)"
                (focus)="handleDatapointFocus(bar.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      @if (interactive) {
        <div class="st-barChart__filters" role="group" [attr.aria-label]="'Filtrer par ' + label">
          @for (bar of bars; track bar.datum.label) {
            <button
              type="button"
              [class]="filterChipClass(bar)"
              [attr.aria-pressed]="selectedSet.has(bar.datum.label) ? 'true' : 'false'"
              (click)="selectBar(bar.datum.label)"
            >
              <span class="st-barChart__filterSwatch" aria-hidden="true"></span>
              {{ bar.datum.label }}: {{ bar.datum.value }}
            </button>
          }
        </div>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div
          class="st-barChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bar)"
          [style.top.%]="tooltipTop(bar)"
        >
          <span class="st-barChart__tooltipLabel">{{ bar.datum.label }}</span>
          <span class="st-barChart__tooltipValue">{{ bar.datum.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BarChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-bar-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-barChart__visual"
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
          @for (grid of gridItems; track grid.key) {
            <line class="st-barChart__grid" [attr.x1]="grid.x1" [attr.x2]="grid.x2" [attr.y1]="grid.y1" [attr.y2]="grid.y2"></line>
            <text
              class="st-barChart__tickLabel"
              [attr.x]="grid.labelX"
              [attr.y]="grid.labelY"
              [attr.text-anchor]="grid.textAnchor"
              [attr.dominant-baseline]="grid.dominantBaseline"
            >
              {{ formatTickLabel(grid.value) }}
            </text>
          }
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (category of categoryLabels; track category.key) {
            <text
              class="st-barChart__categoryLabel"
              [attr.x]="category.x"
              [attr.y]="category.y"
              [attr.text-anchor]="category.textAnchor"
              [attr.dominant-baseline]="category.dominantBaseline"
            >
              {{ category.text }}
            </text>
          }

          @for (band of bandRects; track band.key) {
            <rect [class]="bandClass(band)" [attr.x]="band.x" [attr.y]="band.y" [attr.width]="band.width" [attr.height]="band.height"></rect>
            @if (band.label) {
              <text class="st-barChart__overlayLabel" [attr.x]="band.x + 4" [attr.y]="band.y + 11">{{ band.label }}</text>
            }
          }
          @for (line of refLines; track line.key) {
            <line [class]="refLineClass(line)" [attr.x1]="line.x1" [attr.x2]="line.x2" [attr.y1]="line.y1" [attr.y2]="line.y2"></line>
            @if (line.label) {
              <text
                class="st-barChart__overlayLabel"
                [attr.x]="refLineLabelX(line)"
                [attr.y]="refLineLabelY(line)"
                [attr.text-anchor]="isVertical ? 'end' : 'start'"
              >
                {{ line.label }}
              </text>
            }
          }

          @if (annotationRegions.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--behind">
              @for (annotation of annotationRegions; track annotation.key) {
                <rect class="st-barChart__annotationRegion" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.width]="annotation.width" [attr.height]="annotation.height"></rect>
                @if (annotation.label) {
                  <text class="st-barChart__annotationLabel" [attr.x]="annotation.x + 4" [attr.y]="annotation.y + 11">{{ annotation.label }}</text>
                }
              }
            </g>
          }

          @for (bar of bars; track bar.datum.label) {
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
              (click)="selectBar(bar.datum.label)"
            ></rect>
          }

          @for (error of errorBarGeom; track error.key) {
            <g class="st-barChart__errorBar">
              <line class="st-barChart__errorStem" [attr.x1]="error.stem.x1" [attr.y1]="error.stem.y1" [attr.x2]="error.stem.x2" [attr.y2]="error.stem.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capLow.x1" [attr.y1]="error.capLow.y1" [attr.x2]="error.capLow.x2" [attr.y2]="error.capLow.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capHigh.x1" [attr.y1]="error.capHigh.y1" [attr.x2]="error.capHigh.x2" [attr.y2]="error.capHigh.y2"></line>
            </g>
          }

          @if (goalGeom; as goal) {
            @if (isVertical) {
              <line class="st-barChart__goalLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="goal.p" [attr.y2]="goal.p"></line>
              <text class="st-barChart__goalLabel" [attr.x]="margin.left + plotWidth - 4" [attr.y]="goal.p - 4" text-anchor="end">{{ goal.label ?? "Objectif " + goal.value }}</text>
            } @else {
              <line class="st-barChart__goalLine" [attr.x1]="goal.p" [attr.x2]="goal.p" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              <text class="st-barChart__goalLabel" [attr.x]="goal.p + 4" [attr.y]="margin.top + 11" text-anchor="start">{{ goal.label ?? "Objectif " + goal.value }}</text>
            }
          }

          @if (annotationAbove.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--above">
              @for (annotation of annotationAbove; track annotation.key) {
                @switch (annotation.kind) {
                  @case ("line") {
                    <line class="st-barChart__annotationLine" [attr.x1]="annotation.x1" [attr.y1]="annotation.y1" [attr.x2]="annotation.x2" [attr.y2]="annotation.y2"></line>
                    @if (annotation.label) {
                      <text
                        class="st-barChart__annotationLabel"
                        [attr.x]="annotationLineLabelX(annotation)"
                        [attr.y]="annotationLineLabelY(annotation)"
                        [attr.text-anchor]="annotationLineTextAnchor(annotation)"
                      >
                        {{ annotation.label }}
                      </text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-barChart__annotationShape" [attr.points]="annotationShapePoints(annotation)"></polygon>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.labelX" [attr.y]="annotation.labelY" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-barChart__annotationPoint" [attr.cx]="annotation.x" [attr.cy]="annotation.y" r="4.5"></circle>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.x" [attr.y]="annotation.y - 8" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-barChart__annotationText" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.text-anchor]="annotation.anchor">{{ annotation.text }}</text>
                  }
                }
              }
            </g>
          }

          @for (label of dataLabelItems; track label.key) {
            <text
              class="st-barChart__dataLabel"
              aria-hidden="true"
              [attr.x]="label.x"
              [attr.y]="label.y"
              [attr.text-anchor]="label.anchor"
              [attr.dominant-baseline]="label.baseline"
            >
              {{ label.text }}
            </text>
          }

          @if (hoveredBar; as bar) {
            <g class="st-barChart__crosshair" aria-hidden="true">
              @if (isVertical) {
                <line class="st-barChart__crosshairLine" [attr.x1]="bar.cx" [attr.x2]="bar.cx" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              } @else {
                <line class="st-barChart__crosshairLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="bar.cy" [attr.y2]="bar.cy"></line>
              }
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-barChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (bar of bars; track bar.datum.label) {
              <rect
                #navDatum
                class="st-barChart__navDatum"
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.height"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(bar.index)"
                [attr.aria-label]="datapointLabel(bar)"
                (keydown)="handleDatapointKeyDown($event, bar.index)"
                (focus)="handleDatapointFocus(bar.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      @if (interactive) {
        <div class="st-barChart__filters" role="group" [attr.aria-label]="'Filtrer par ' + label">
          @for (bar of bars; track bar.datum.label) {
            <button
              type="button"
              [class]="filterChipClass(bar)"
              [attr.aria-pressed]="selectedSet.has(bar.datum.label) ? 'true' : 'false'"
              (click)="selectBar(bar.datum.label)"
            >
              <span class="st-barChart__filterSwatch" aria-hidden="true"></span>
              {{ bar.datum.label }}: {{ bar.datum.value }}
            </button>
          }
        </div>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div
          class="st-barChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bar)"
          [style.top.%]="tooltipTop(bar)"
        >
          <span class="st-barChart__tooltipLabel">{{ bar.datum.label }}</span>
          <span class="st-barChart__tooltipValue">{{ bar.datum.value }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { navDatumElements: [{
                type: ViewChildren,
                args: ["navDatum"]
            }], data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], domain: [{
                type: NgInput
            }], selectedKeys: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], referenceLines: [{
                type: NgInput
            }], bands: [{
                type: NgInput
            }], goalLine: [{
                type: NgInput
            }], annotations: [{
                type: NgInput
            }], dataLabels: [{
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
//# sourceMappingURL=BarChart.js.map