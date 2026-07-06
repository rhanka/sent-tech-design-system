import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import {} from "./Sparkline.js";
import { cellDecorationClass, cellDecorationLabel, cellDecorationIconNodes, } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export class KpiCard {
    static stComponentName = "KpiCard";
    componentName = "KpiCard";
    value;
    label;
    delta;
    deltaFormat = "percent";
    trend;
    format = "number";
    unit;
    currency = "EUR";
    locale;
    sparkline;
    size = "md";
    tone;
    decoration;
    classInput;
    get hostClass() {
        return classNames("st-kpiCard", `st-kpiCard--${this.size}`, this.tone && `st-kpiCard--${this.tone}`, this.tone && "st-kpiCard--toned", this.decoration && "st-cell", this.decoration && cellDecorationClass(this.decoration.intent), this.classInput);
    }
    get formattedValue() {
        if (typeof this.value === "string")
            return this.value;
        if (this.format === "currency") {
            return new Intl.NumberFormat(this.locale, {
                style: "currency",
                currency: this.currency,
            }).format(this.value);
        }
        if (this.format === "percent") {
            return new Intl.NumberFormat(this.locale, {
                style: "percent",
                maximumFractionDigits: 2,
            }).format(this.value);
        }
        return new Intl.NumberFormat(this.locale).format(this.value);
    }
    get formattedDelta() {
        if (this.delta == null)
            return undefined;
        const sign = this.delta > 0 ? "+" : "";
        if (this.deltaFormat === "percent") {
            const pct = new Intl.NumberFormat(this.locale, {
                style: "percent",
                maximumFractionDigits: 1,
            }).format(this.delta);
            return `${sign}${pct}`;
        }
        return `${sign}${new Intl.NumberFormat(this.locale).format(this.delta)}`;
    }
    get resolvedTrend() {
        if (this.trend)
            return this.trend;
        if (this.delta == null)
            return "flat";
        if (this.delta > 0)
            return "up";
        if (this.delta < 0)
            return "down";
        return "flat";
    }
    get sparklineTone() {
        return this.resolvedTrend === "up"
            ? "success"
            : this.resolvedTrend === "down"
                ? "error"
                : "neutral";
    }
    sparklineWidth = 120;
    sparklineHeight = 28;
    sparklineStrokeWidth = 1.5;
    get sparklineViewBox() {
        return `0 0 ${this.sparklineWidth} ${this.sparklineHeight}`;
    }
    get sparklineSpanClass() {
        return classNames("st-kpiCard__sparkline", "st-sparkline", `st-sparkline--${this.sparklineTone}`);
    }
    get sparklineGeometry() {
        const data = this.sparkline;
        if (!data || data.length === 0)
            return { line: "", area: "" };
        const PADDING = 2;
        const width = this.sparklineWidth;
        const height = this.sparklineHeight;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const span = max - min || 1;
        const innerWidth = Math.max(width - PADDING * 2, 1);
        const innerHeight = Math.max(height - PADDING * 2, 1);
        const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
        const points = data.map((value, index) => {
            const x = PADDING + step * index;
            const normalised = (value - min) / span;
            const y = PADDING + (1 - normalised) * innerHeight;
            return { x, y };
        });
        const line = points
            .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
            .join(" ");
        const baseline = height - PADDING;
        const first = points[0];
        const last = points[points.length - 1];
        const area = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
        return { line, area };
    }
    get sparklineLine() {
        return this.sparklineGeometry.line;
    }
    get sparklineArea() {
        return this.sparklineGeometry.area;
    }
    get arrow() {
        return this.resolvedTrend === "up"
            ? "M3 8.5 7 4l4 4.5"
            : this.resolvedTrend === "down"
                ? "M3 5.5 7 10l4-4.5"
                : "M3 7h8";
    }
    get trendLabel() {
        return this.resolvedTrend === "up"
            ? "en hausse"
            : this.resolvedTrend === "down"
                ? "en baisse"
                : "stable";
    }
    get ariaLabel() {
        return [
            this.label,
            this.formattedValue,
            this.unit,
            this.formattedDelta && `${this.formattedDelta} ${this.trendLabel ?? ""}`.trim(),
            this.decoration && cellDecorationLabel[this.decoration.intent],
        ]
            .filter(Boolean)
            .join(", ");
    }
    get deltaClass() {
        return classNames("st-kpiCard__delta", `st-kpiCard__delta--${this.resolvedTrend}`);
    }
    get decorationIconNodes() {
        const icon = this.decoration?.icon;
        if (icon == null)
            return null;
        return cellDecorationIconNodes[icon] ?? null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: KpiCard, isStandalone: true, selector: "st-kpi-card", inputs: { value: "value", label: "label", delta: "delta", deltaFormat: "deltaFormat", trend: "trend", format: "format", unit: "unit", currency: "currency", locale: "locale", sparkline: "sparkline", size: "size", tone: "tone", decoration: "decoration", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="ariaLabel"
    >
      <p class="st-kpiCard__label">{{ label }}</p>

      <p class="st-kpiCard__value">
        @if (decoration && decorationIconNodes) {
          <svg
            class="st-cell__icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            @for (node of decorationIconNodes; track $index) {
              @switch (node[0]) {
                @case ('path') { <path [attr.d]="$any(node[1]).d" /> }
                @case ('circle') {
                  <circle [attr.cx]="$any(node[1]).cx" [attr.cy]="$any(node[1]).cy" [attr.r]="$any(node[1]).r" />
                }
                @case ('line') {
                  <line [attr.x1]="$any(node[1]).x1" [attr.y1]="$any(node[1]).y1" [attr.x2]="$any(node[1]).x2" [attr.y2]="$any(node[1]).y2" />
                }
              }
            }
          </svg>
        }
        <span class="st-kpiCard__number">{{ formattedValue }}</span>
        @if (unit) {
          <span class="st-kpiCard__unit">{{ unit }}</span>
        }
      </p>

      @if (formattedDelta || sparkline) {
        <div class="st-kpiCard__footer">
          @if (formattedDelta) {
            <span [class]="deltaClass" aria-hidden="true">
              <svg
                class="st-kpiCard__arrow"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  [attr.d]="arrow"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="st-kpiCard__deltaValue">{{ formattedDelta }}</span>
            </span>
          }

          @if (sparkline && sparkline.length > 0) {
            <span [class]="sparklineSpanClass" role="img">
              <svg
                [attr.width]="sparklineWidth"
                [attr.height]="sparklineHeight"
                [attr.viewBox]="sparklineViewBox"
                preserveAspectRatio="none"
                focusable="false"
              >
                @if (sparklineArea) {
                  <path [attr.d]="sparklineArea" class="st-sparkline__area" />
                }
                @if (sparklineLine) {
                  <path
                    [attr.d]="sparklineLine"
                    class="st-sparkline__line"
                    fill="none"
                    [attr.stroke-width]="sparklineStrokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                }
              </svg>
            </span>
          }
        </div>
      }
    </article>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-kpi-card",
                    standalone: true,
                    template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="ariaLabel"
    >
      <p class="st-kpiCard__label">{{ label }}</p>

      <p class="st-kpiCard__value">
        @if (decoration && decorationIconNodes) {
          <svg
            class="st-cell__icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            @for (node of decorationIconNodes; track $index) {
              @switch (node[0]) {
                @case ('path') { <path [attr.d]="$any(node[1]).d" /> }
                @case ('circle') {
                  <circle [attr.cx]="$any(node[1]).cx" [attr.cy]="$any(node[1]).cy" [attr.r]="$any(node[1]).r" />
                }
                @case ('line') {
                  <line [attr.x1]="$any(node[1]).x1" [attr.y1]="$any(node[1]).y1" [attr.x2]="$any(node[1]).x2" [attr.y2]="$any(node[1]).y2" />
                }
              }
            }
          </svg>
        }
        <span class="st-kpiCard__number">{{ formattedValue }}</span>
        @if (unit) {
          <span class="st-kpiCard__unit">{{ unit }}</span>
        }
      </p>

      @if (formattedDelta || sparkline) {
        <div class="st-kpiCard__footer">
          @if (formattedDelta) {
            <span [class]="deltaClass" aria-hidden="true">
              <svg
                class="st-kpiCard__arrow"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  [attr.d]="arrow"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="st-kpiCard__deltaValue">{{ formattedDelta }}</span>
            </span>
          }

          @if (sparkline && sparkline.length > 0) {
            <span [class]="sparklineSpanClass" role="img">
              <svg
                [attr.width]="sparklineWidth"
                [attr.height]="sparklineHeight"
                [attr.viewBox]="sparklineViewBox"
                preserveAspectRatio="none"
                focusable="false"
              >
                @if (sparklineArea) {
                  <path [attr.d]="sparklineArea" class="st-sparkline__area" />
                }
                @if (sparklineLine) {
                  <path
                    [attr.d]="sparklineLine"
                    class="st-sparkline__line"
                    fill="none"
                    [attr.stroke-width]="sparklineStrokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                }
              </svg>
            </span>
          }
        </div>
      }
    </article>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], delta: [{
                type: NgInput
            }], deltaFormat: [{
                type: NgInput
            }], trend: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], unit: [{
                type: NgInput
            }], currency: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], sparkline: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], decoration: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=KpiCard.js.map