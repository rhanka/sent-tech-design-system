import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Sparkline } from "./Sparkline.js";

import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationLabel,
  renderCellDecorationIcon,
} from "./cellDecoration.js";

export type KpiCardSize = "sm" | "md" | "lg";

export type KpiCardTrend = "up" | "down" | "flat";

export type KpiCardFormat = "number" | "currency" | "percent";

export type KpiCardDeltaFormat = "percent" | "absolute";

export type KpiCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type KpiCardProps = {
  /**
   * Valeur principale. Si `format="percent"`, `value` est une FRACTION (0–1) :
   * passer `0.42` affiche « 42 % » (Intl multiplie par 100). Le formatage ne
   * s'applique qu'aux `number` ; une `string` est rendue telle quelle.
   */
  value: number | string;
  label: string;
  /**
   * Variation. En `deltaFormat="percent"` (défaut), `delta` est une FRACTION :
   * `0.12` → « +12 % ». NaN/Infinity sont rendus inertes.
   */
  delta?: number;
  deltaFormat?: KpiCardDeltaFormat;
  trend?: KpiCardTrend;
  format?: KpiCardFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  sparkline?: number[];
  size?: KpiCardSize;
  tone?: KpiCardTone;
  /**
   * Conditional formatting : décoration sémantique de la carte (intent → token
   * feedback en fond teinté accessible + icône lucide optionnelle).
   */
  decoration?: CellDecoration;
  class?: string;
};

@Component({
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
})
export class KpiCard {
  static readonly stComponentName = "KpiCard";
  readonly componentName = "KpiCard";
  @NgInput() value!: number | string;
  @NgInput() label!: string;
  @NgInput() delta?: number;
  @NgInput() deltaFormat?: KpiCardDeltaFormat;
  @NgInput() trend?: KpiCardTrend;
  @NgInput() format?: KpiCardFormat;
  @NgInput() unit?: string;
  @NgInput() currency?: string;
  @NgInput() locale?: string;
  @NgInput() sparkline?: number[];
  @NgInput() size?: KpiCardSize;
  @NgInput() tone?: KpiCardTone;
  @NgInput() decoration?: CellDecoration;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-kpiCard",
      `st-kpiCard--${this.size ?? "md"}`,
      this.tone && `st-kpiCard--${this.tone}`,
      this.tone && "st-kpiCard--toned",
      this.classInput,
    );
  }

  get resolvedLocale(): string {
    return this.locale ?? "fr-FR";
  }

  get formattedValue(): string {
    if (typeof this.value !== "number") return String(this.value ?? "");
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

  get isFiniteDelta(): boolean {
    return this.delta !== undefined && Number.isFinite(this.delta);
  }

  get formattedDelta(): string {
    if (!this.isFiniteDelta || this.delta === undefined) return "";
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

  get resolvedTrend(): KpiCardTrend {
    if (this.trend) return this.trend;
    if (this.isFiniteDelta && this.delta !== undefined) {
      if (this.delta > 0) return "up";
      if (this.delta < 0) return "down";
    }
    return "flat";
  }

  get deltaClass(): string {
    return classNames("st-kpiCard__delta", `st-kpiCard__delta--${this.resolvedTrend}`);
  }
}
