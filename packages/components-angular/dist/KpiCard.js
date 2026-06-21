import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Sparkline } from "./Sparkline.js";
import { cellDecorationClass, cellDecorationLabel, renderCellDecorationIcon, } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export class KpiCard {
    static stComponentName = "KpiCard";
    componentName = "KpiCard";
    value;
    label;
    delta;
    deltaFormat;
    trend;
    format;
    unit;
    currency;
    locale;
    sparkline;
    size;
    tone;
    decoration;
    classInput;
    get hostClass() {
        return classNames("st-kpiCard", `st-kpiCard--${this.size ?? "md"}`, this.tone && `st-kpiCard--${this.tone}`, this.tone && "st-kpiCard--toned", this.classInput);
    }
    get resolvedLocale() {
        return this.locale ?? "fr-FR";
    }
    get formattedValue() {
        if (typeof this.value !== "number")
            return String(this.value ?? "");
        if (this.format === "currency") {
            return new Intl.NumberFormat(this.resolvedLocale, {
                style: "currency",
                currency: this.currency ?? "CAD",
            }).format(this.value);
        }
        if (this.format === "percent") {
            return new Intl.NumberFormat(this.resolvedLocale, {
                style: "percent",
                maximumFractionDigits: 1,
            }).format(this.value);
        }
        return new Intl.NumberFormat(this.resolvedLocale).format(this.value);
    }
    get isFiniteDelta() {
        return this.delta !== undefined && Number.isFinite(this.delta);
    }
    get formattedDelta() {
        if (!this.isFiniteDelta || this.delta === undefined)
            return "";
        if (this.deltaFormat === "absolute") {
            const sign = this.delta >= 0 ? "+" : "";
            return sign + new Intl.NumberFormat(this.resolvedLocale).format(this.delta);
        }
        const sign = this.delta >= 0 ? "+" : "";
        return sign + new Intl.NumberFormat(this.resolvedLocale, {
            style: "percent",
            maximumFractionDigits: 1,
        }).format(this.delta);
    }
    get resolvedTrend() {
        if (this.trend)
            return this.trend;
        if (this.isFiniteDelta && this.delta !== undefined) {
            if (this.delta > 0)
                return "up";
            if (this.delta < 0)
                return "down";
        }
        return "flat";
    }
    get deltaClass() {
        return classNames("st-kpiCard__delta", `st-kpiCard__delta--${this.resolvedTrend}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: KpiCard, isStandalone: true, selector: "st-kpi-card", inputs: { value: "value", label: "label", delta: "delta", deltaFormat: "deltaFormat", trend: "trend", format: "format", unit: "unit", currency: "currency", locale: "locale", sparkline: "sparkline", size: "size", tone: "tone", decoration: "decoration", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-kpiCard__header">
        <span class="st-kpiCard__label">{{ label }}</span>
      </div>
      <div class="st-kpiCard__body">
        <span class="st-kpiCard__value">{{ formattedValue }}</span>
        @if (unit) {
          <span class="st-kpiCard__unit">{{ unit }}</span>
        }
      </div>
      @if (delta !== undefined && isFiniteDelta) {
        <div [class]="deltaClass">
          <span class="st-kpiCard__deltaValue">{{ formattedDelta }}</span>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-kpi-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-kpiCard__header">
        <span class="st-kpiCard__label">{{ label }}</span>
      </div>
      <div class="st-kpiCard__body">
        <span class="st-kpiCard__value">{{ formattedValue }}</span>
        @if (unit) {
          <span class="st-kpiCard__unit">{{ unit }}</span>
        }
      </div>
      @if (delta !== undefined && isFiniteDelta) {
        <div [class]="deltaClass">
          <span class="st-kpiCard__deltaValue">{{ formattedDelta }}</span>
        </div>
      }
      <ng-content></ng-content>
    </div>
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