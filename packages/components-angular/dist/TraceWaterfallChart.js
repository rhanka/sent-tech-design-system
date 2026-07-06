import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { niceTicks, scaleLinear, formatTick } from "./chartScale.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 16, bottom: 32, left: 152 };
const INDENT = 10;
function ellipsize(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    if (maxChars <= 1)
        return "…";
    return `${text.slice(0, maxChars - 1)}…`;
}
export class TraceWaterfallChart {
    static stComponentName = "TraceWaterfallChart";
    componentName = "TraceWaterfallChart";
    MARGIN = MARGIN;
    hoveredIndex = null;
    data = { spans: [] };
    label;
    width;
    height;
    size;
    classInput;
    get hostClass() {
        return classNames("st-traceWaterfallChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? this.size ?? 640;
    }
    get heightValue() {
        return this.height ?? 320;
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
    get validSpans() {
        return (this.data?.spans ?? []).filter((s) => s &&
            typeof s.spanId === "string" &&
            s.spanId.length > 0 &&
            typeof s.service === "string" &&
            s.service.length > 0 &&
            Number.isFinite(s.start) &&
            Number.isFinite(s.duration));
    }
    get ordered() {
        if (this.validSpans.length === 0)
            return [];
        const byId = new Map();
        for (const s of this.validSpans)
            if (!byId.has(s.spanId))
                byId.set(s.spanId, s);
        const childrenOf = new Map();
        const roots = [];
        for (const s of this.validSpans) {
            const p = s.parentSpanId;
            if (p == null || !byId.has(p) || p === s.spanId) {
                roots.push(s);
            }
            else {
                const list = childrenOf.get(p) ?? [];
                list.push(s);
                childrenOf.set(p, list);
            }
        }
        const out = [];
        const seen = new Set();
        const visit = (s, depth) => {
            if (seen.has(s.spanId))
                return;
            seen.add(s.spanId);
            out.push({ span: s, depth });
            for (const k of childrenOf.get(s.spanId) ?? [])
                visit(k, depth + 1);
        };
        for (const r of roots)
            visit(r, 0);
        for (const s of this.validSpans)
            if (!seen.has(s.spanId))
                visit(s, 0);
        return out;
    }
    get serviceOrder() {
        const seen = [];
        for (const o of this.ordered) {
            if (!seen.includes(o.span.service))
                seen.push(o.span.service);
        }
        return seen;
    }
    toneOf(service) {
        const idx = this.serviceOrder.indexOf(service);
        return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
    }
    get legendItems() {
        return this.serviceOrder.map((service) => ({ service, tone: this.toneOf(service) }));
    }
    get domainBounds() {
        const vals = [];
        for (const o of this.ordered) {
            vals.push(o.span.start, o.span.start + Math.max(o.span.duration, 0));
        }
        if (vals.length === 0)
            return { rawMin: 0, rawMax: 1 };
        const rawMin = Math.min(...vals);
        const rawMax = Math.max(...vals);
        return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
    }
    get ticks() {
        return niceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
    }
    get domainMin() {
        return this.ticks[0] ?? 0;
    }
    get domainMax() {
        return this.ticks[this.ticks.length - 1] ?? 1;
    }
    xOf(v) {
        return MARGIN.left + scaleLinear(v, this.domainMin, this.domainMax, 0, this.plotWidth);
    }
    get tickItems() {
        return this.ticks.map((value) => ({ value, x: this.xOf(value) }));
    }
    get bars() {
        if (this.ordered.length === 0)
            return [];
        const band = this.plotHeight / this.ordered.length;
        const barHeight = Math.min(band * 0.62, 24);
        return this.ordered.map((o, i) => {
            const x0 = this.xOf(o.span.start);
            const x1 = this.xOf(o.span.start + Math.max(o.span.duration, 0));
            const x = Math.min(x0, x1);
            const w = Math.max(Math.abs(x1 - x0), 1);
            const y = MARGIN.top + band * i + (band - barHeight) / 2;
            const indentX = x + o.depth * INDENT;
            const indentWidth = Math.max(w - o.depth * INDENT, 1);
            return {
                span: o.span,
                depth: o.depth,
                index: i,
                x,
                y,
                width: w,
                height: barHeight,
                rowCenterY: MARGIN.top + band * (i + 0.5),
                cx: x + w / 2,
                tone: this.toneOf(o.span.service),
                indentX,
                indentWidth,
            };
        });
    }
    get hoveredBar() {
        if (this.hoveredIndex == null)
            return null;
        return this.bars[this.hoveredIndex] ?? null;
    }
    get dataValueItems() {
        return this.ordered.map((o) => `${"·".repeat(o.depth)}${o.span.service}: ${o.span.start} → ${o.span.start + Math.max(o.span.duration, 0)}`);
    }
    formatTickLabel(value) {
        return formatTick(value);
    }
    ellipsizeLabel(text, depth) {
        return ellipsize(text, Math.max(2, 16 - depth));
    }
    barClass(bar) {
        const dim = this.hoveredIndex !== null && this.hoveredIndex !== bar.index;
        return classNames("st-traceWaterfallChart__bar", `st-traceWaterfallChart__bar--${bar.tone}`, dim && "st-traceWaterfallChart__bar--dim");
    }
    tooltipLeft(bar) {
        return (bar.cx / this.widthValue) * 100;
    }
    tooltipTop(bar) {
        return (bar.rowCenterY / this.heightValue) * 100;
    }
    spanEnd(bar) {
        return bar.span.start + Math.max(bar.span.duration, 0);
    }
    handlePointerMove(e) {
        const target = e.target;
        const attr = target?.getAttribute("data-chart-index");
        if (attr != null) {
            const idx = Number(attr);
            if (Number.isInteger(idx))
                this.hoveredIndex = idx;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TraceWaterfallChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TraceWaterfallChart, isStandalone: true, selector: "st-trace-waterfall-chart", inputs: { data: "data", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-traceWaterfallChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (tick of tickItems; track tick.value) {
            <line class="st-traceWaterfallChart__grid"
              [attr.x1]="tick.x" [attr.x2]="tick.x"
              [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
            ></line>
            <text class="st-traceWaterfallChart__tickLabel"
              [attr.x]="tick.x"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line class="st-traceWaterfallChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line class="st-traceWaterfallChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.index) {
            <text class="st-traceWaterfallChart__spanLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="bar.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsizeLabel(bar.span.service, bar.depth) }}</text>
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.indentX"
              [attr.y]="bar.y"
              [attr.width]="bar.indentWidth"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
            ></rect>
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-traceWaterfallChart__legend" [attr.aria-label]="'Services de ' + (label ?? 'trace')">
          @for (item of legendItems; track item.service) {
            <li class="st-traceWaterfallChart__legendItem">
              <span [class]="'st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.service }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'trace waterfall')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div
          class="st-traceWaterfallChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bar)"
          [style.top.%]="tooltipTop(bar)"
        >
          <span class="st-traceWaterfallChart__tooltipLabel">{{ bar.span.service }}</span>
          <span class="st-traceWaterfallChart__tooltipValue">{{ bar.span.start }} → {{ spanEnd(bar) }}</span>
        </div>
      }
    </div>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TraceWaterfallChart, decorators: [{
            type: Component,
            args: [{ selector: "st-trace-waterfall-chart", standalone: true, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-traceWaterfallChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (tick of tickItems; track tick.value) {
            <line class="st-traceWaterfallChart__grid"
              [attr.x1]="tick.x" [attr.x2]="tick.x"
              [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
            ></line>
            <text class="st-traceWaterfallChart__tickLabel"
              [attr.x]="tick.x"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line class="st-traceWaterfallChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line class="st-traceWaterfallChart__axis"
            [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.index) {
            <text class="st-traceWaterfallChart__spanLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="bar.rowCenterY"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ ellipsizeLabel(bar.span.service, bar.depth) }}</text>
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.indentX"
              [attr.y]="bar.y"
              [attr.width]="bar.indentWidth"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
            ></rect>
          }
        </svg>
      </div>

      @if (legendItems.length > 0) {
        <ul class="st-traceWaterfallChart__legend" [attr.aria-label]="'Services de ' + (label ?? 'trace')">
          @for (item of legendItems; track item.service) {
            <li class="st-traceWaterfallChart__legendItem">
              <span [class]="'st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--' + item.tone" aria-hidden="true"></span>
              {{ item.service }}
            </li>
          }
        </ul>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'trace waterfall')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div
          class="st-traceWaterfallChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bar)"
          [style.top.%]="tooltipTop(bar)"
        >
          <span class="st-traceWaterfallChart__tooltipLabel">{{ bar.span.service }}</span>
          <span class="st-traceWaterfallChart__tooltipValue">{{ bar.span.start }} → {{ spanEnd(bar) }}</span>
        </div>
      }
    </div>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=TraceWaterfallChart.js.map