import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";
import { classNames } from "./classNames.js";
import { annotationDataListItems, polygonPoints, resolveAnnotations, } from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";
import * as i0 from "@angular/core";
const OHLC_MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };
function ohlcScaleLinear(v, d0, d1, r0, r1) {
    if (d1 === d0)
        return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}
function ohlcNiceTicks(min, max, target = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        const base = Number.isFinite(max) ? max : 0;
        return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step;
    if (norm < 1.5)
        step = 1 * pow;
    else if (norm < 3)
        step = 2 * pow;
    else if (norm < 7)
        step = 5 * pow;
    else
        step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = start; v <= end + step / 2; v += step) {
        ticks.push(Number(v.toFixed(10)));
    }
    return ticks;
}
function ohlcFormatTick(v) {
    if (Math.abs(v) >= 1000)
        return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v))
        return String(v);
    return v.toFixed(1);
}
export class OHLCChart {
    static stComponentName = "OHLCChart";
    componentName = "OHLCChart";
    margin = OHLC_MARGIN;
    navDatumElements;
    hoveredIndex = null;
    focusedIndex = -1;
    data = [];
    label = "";
    width;
    height;
    annotations;
    dataLabels;
    hoverKey;
    onHoverKeyChange;
    keyboardNav;
    onSelectKey;
    classInput;
    get hostClass() {
        return classNames("st-ohlcChart", this.classInput);
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
        return Math.max(this.widthValue - OHLC_MARGIN.left - OHLC_MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - OHLC_MARGIN.top - OHLC_MARGIN.bottom, 1);
    }
    get validData() {
        return (this.data ?? []).filter((d) => Number.isFinite(d.open) && Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close));
    }
    get domainBounds() {
        const allVals = [];
        for (const d of this.validData) {
            allVals.push(d.open, d.high, d.low, d.close);
        }
        if (allVals.length === 0)
            return { rawMin: 0, rawMax: 1 };
        const rawMin = Math.min(...allVals);
        const rawMax = Math.max(...allVals);
        return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
    }
    get ticks() {
        return ohlcNiceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? this.domainMin;
    }
    get bars() {
        if (this.validData.length === 0)
            return [];
        const band = this.plotWidth / this.validData.length;
        const tickW = Math.min(band * 0.3, 12);
        return this.validData.map((d, i) => {
            const clampedHigh = Math.max(d.high, d.open, d.close);
            const clampedLow = Math.min(d.low, d.open, d.close);
            const bullish = d.close >= d.open;
            const centerX = OHLC_MARGIN.left + band * i + band / 2;
            const highY = OHLC_MARGIN.top + ohlcScaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
            const lowY = OHLC_MARGIN.top + ohlcScaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);
            const openY = OHLC_MARGIN.top + ohlcScaleLinear(d.open, this.domainMin, this.domainMax, this.plotHeight, 0);
            const closeY = OHLC_MARGIN.top + ohlcScaleLinear(d.close, this.domainMin, this.domainMax, this.plotHeight, 0);
            return {
                datum: d,
                index: i,
                bullish,
                centerX,
                band,
                barHighY: highY,
                barLowY: lowY,
                openY,
                closeY,
                openX: centerX - tickW,
                closeX: centerX + tickW,
                tooltipY: Math.min(highY, openY, closeY),
            };
        });
    }
    get hoverKeys() {
        return this.bars.map((b) => b.datum.label);
    }
    get activeIndex() {
        return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
    }
    get activeBar() {
        return this.activeIndex >= 0 ? (this.bars[this.activeIndex] ?? null) : null;
    }
    get navEnabled() {
        return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.bars.length > 0;
    }
    get resolvedAnnotations() {
        const categoryPixel = (v) => {
            const bar = this.bars.find((b) => b.datum.label === String(v));
            if (!bar)
                return null;
            return bar.centerX - OHLC_MARGIN.left;
        };
        const priceY = (v) => {
            if (!Number.isFinite(v))
                return null;
            return ohlcScaleLinear(v, this.domainMin, this.domainMax, this.plotHeight, 0);
        };
        return resolveAnnotations(this.annotations, {
            xScale: categoryPixel,
            yScale: priceY,
            plotLeft: OHLC_MARGIN.left,
            plotTop: OHLC_MARGIN.top,
            plotWidth: this.plotWidth,
            plotHeight: this.plotHeight,
        });
    }
    get annotationRegions() {
        return this.resolvedAnnotations.filter((a) => a.kind === "region");
    }
    get annotationAbove() {
        return this.resolvedAnnotations.filter((a) => a.kind !== "region");
    }
    get dataLabelItems() {
        const opts = normalizeDataLabels(this.dataLabels);
        if (!opts.enabled)
            return [];
        return this.bars.map((b) => ({
            key: b.datum.label,
            x: b.centerX,
            y: b.barHighY - 6,
            text: formatDataLabel(b.datum.close, opts, ohlcFormatTick) ?? "",
        }));
    }
    get dataValueItems() {
        return [
            ...this.validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
            ...annotationDataListItems(this.annotations),
        ];
    }
    tickY(tick) {
        return OHLC_MARGIN.top + ohlcScaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0);
    }
    formatTickLabel(tick) {
        return ohlcFormatTick(tick);
    }
    barGroupClass(b) {
        const dim = this.hoveredIndex !== null && this.hoveredIndex !== b.index;
        return classNames("st-ohlcChart__bar", `st-ohlcChart__bar--${b.bullish ? "up" : "down"}`, dim && "st-ohlcChart__bar--dim");
    }
    polygonPointsFor(a) {
        return polygonPoints(a.points);
    }
    tooltipLeft(b) {
        return (b.centerX / this.widthValue) * 100;
    }
    tooltipTop(b) {
        return (b.tooltipY / this.heightValue) * 100;
    }
    rovingTabIndexFor(index) {
        return rovingTabIndex(index, this.focusedIndex, this.bars.length);
    }
    ohlcAriaLabel(d) {
        return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
    }
    emitHoverKey(index) {
        this.onHoverKeyChange?.(index == null ? null : (this.hoverKeys[index] ?? null));
    }
    handleLeave() {
        this.hoveredIndex = null;
        this.emitHoverKey(null);
    }
    handlePointerMove(event) {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OHLCChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: OHLCChart, isStandalone: true, selector: "st-ohlc-chart", inputs: { data: "data", label: "label", width: "width", height: "height", annotations: "annotations", dataLabels: "dataLabels", hoverKey: "hoverKey", onHoverKeyChange: "onHoverKeyChange", keyboardNav: "keyboardNav", onSelectKey: "onSelectKey", classInput: ["class", "classInput"] }, viewQueries: [{ propertyName: "navDatumElements", predicate: ["navDatum"], descendants: true }], ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-ohlcChart__visual"
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
          @for (tick of ticks; track tick) {
            <line
              class="st-ohlcChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="widthValue - margin.right"
              [attr.y1]="tickY(tick)"
              [attr.y2]="tickY(tick)"
            ></line>
            <text
              class="st-ohlcChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tickY(tick)"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ formatTickLabel(tick) }}
            </text>
          }

          <line class="st-ohlcChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-ohlcChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @if (annotationRegions.length > 0) {
            <g class="st-ohlcChart__annotations st-ohlcChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-ohlcChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-ohlcChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (b of bars; track b.datum.label) {
            <g [class]="barGroupClass(b)" [attr.data-chart-index]="b.index">
              <line
                class="st-ohlcChart__range"
                [attr.x1]="b.centerX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.barHighY"
                [attr.y2]="b.barLowY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-ohlcChart__open"
                [attr.x1]="b.openX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.openY"
                [attr.y2]="b.openY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-ohlcChart__close"
                [attr.x1]="b.centerX"
                [attr.x2]="b.closeX"
                [attr.y1]="b.closeY"
                [attr.y2]="b.closeY"
                [attr.data-chart-index]="b.index"
              ></line>
            </g>
            <text
              class="st-ohlcChart__categoryLabel"
              [attr.x]="b.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >
              {{ b.datum.label }}
            </text>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-ohlcChart__annotations st-ohlcChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-ohlcChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-ohlcChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : margin.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? margin.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-ohlcChart__annotationShape" [attr.points]="polygonPointsFor(a)"></polygon>
                    @if (a.label) {
                      <text class="st-ohlcChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-ohlcChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-ohlcChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-ohlcChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-ohlcChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-ohlcChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" dominant-baseline="auto">{{ d.text }}</text>
              }
            </g>
          }

          @if (activeBar) {
            <g class="st-ohlcChart__crosshair" aria-hidden="true">
              <line class="st-ohlcChart__crosshairLine" [attr.x1]="activeBar.centerX" [attr.x2]="activeBar.centerX" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-ohlcChart__navLayer"
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
                class="st-ohlcChart__navDatum"
                [attr.x]="bar.centerX - bar.band / 2"
                [attr.y]="margin.top"
                [attr.width]="bar.band"
                [attr.height]="plotHeight"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(bar.index)"
                [attr.aria-label]="ohlcAriaLabel(bar.datum)"
                (keydown)="handleDatapointKeyDown($event, bar.index)"
                (focus)="handleDatapointFocus(bar.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (activeBar) {
        <div
          class="st-ohlcChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(activeBar) + '%'"
          [style.top]="tooltipTop(activeBar) + '%'"
        >
          <span class="st-ohlcChart__tooltipLabel">{{ activeBar.datum.label }}</span>
          <span class="st-ohlcChart__tooltipValue">O {{ activeBar.datum.open }} H {{ activeBar.datum.high }} L {{ activeBar.datum.low }} C {{ activeBar.datum.close }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OHLCChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-ohlc-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-ohlcChart__visual"
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
          @for (tick of ticks; track tick) {
            <line
              class="st-ohlcChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="widthValue - margin.right"
              [attr.y1]="tickY(tick)"
              [attr.y2]="tickY(tick)"
            ></line>
            <text
              class="st-ohlcChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tickY(tick)"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ formatTickLabel(tick) }}
            </text>
          }

          <line class="st-ohlcChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-ohlcChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @if (annotationRegions.length > 0) {
            <g class="st-ohlcChart__annotations st-ohlcChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-ohlcChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-ohlcChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (b of bars; track b.datum.label) {
            <g [class]="barGroupClass(b)" [attr.data-chart-index]="b.index">
              <line
                class="st-ohlcChart__range"
                [attr.x1]="b.centerX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.barHighY"
                [attr.y2]="b.barLowY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-ohlcChart__open"
                [attr.x1]="b.openX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.openY"
                [attr.y2]="b.openY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-ohlcChart__close"
                [attr.x1]="b.centerX"
                [attr.x2]="b.closeX"
                [attr.y1]="b.closeY"
                [attr.y2]="b.closeY"
                [attr.data-chart-index]="b.index"
              ></line>
            </g>
            <text
              class="st-ohlcChart__categoryLabel"
              [attr.x]="b.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >
              {{ b.datum.label }}
            </text>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-ohlcChart__annotations st-ohlcChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-ohlcChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-ohlcChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : margin.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? margin.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-ohlcChart__annotationShape" [attr.points]="polygonPointsFor(a)"></polygon>
                    @if (a.label) {
                      <text class="st-ohlcChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-ohlcChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-ohlcChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-ohlcChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-ohlcChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-ohlcChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" dominant-baseline="auto">{{ d.text }}</text>
              }
            </g>
          }

          @if (activeBar) {
            <g class="st-ohlcChart__crosshair" aria-hidden="true">
              <line class="st-ohlcChart__crosshairLine" [attr.x1]="activeBar.centerX" [attr.x2]="activeBar.centerX" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-ohlcChart__navLayer"
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
                class="st-ohlcChart__navDatum"
                [attr.x]="bar.centerX - bar.band / 2"
                [attr.y]="margin.top"
                [attr.width]="bar.band"
                [attr.height]="plotHeight"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(bar.index)"
                [attr.aria-label]="ohlcAriaLabel(bar.datum)"
                (keydown)="handleDatapointKeyDown($event, bar.index)"
                (focus)="handleDatapointFocus(bar.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (activeBar) {
        <div
          class="st-ohlcChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(activeBar) + '%'"
          [style.top]="tooltipTop(activeBar) + '%'"
        >
          <span class="st-ohlcChart__tooltipLabel">{{ activeBar.datum.label }}</span>
          <span class="st-ohlcChart__tooltipValue">O {{ activeBar.datum.open }} H {{ activeBar.datum.high }} L {{ activeBar.datum.low }} C {{ activeBar.datum.close }}</span>
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
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
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
//# sourceMappingURL=OHLCChart.js.map