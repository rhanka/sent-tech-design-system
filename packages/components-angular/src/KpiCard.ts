import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Sparkline, type SparklineTone } from "./Sparkline.js";

import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationLabel,
  cellDecorationIconNodes,
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
  imports: [Sparkline],
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

      @if (formattedDelta || (sparkline && sparkline.length > 0)) {
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
            <st-sparkline
              class="st-kpiCard__sparkline"
              [data]="sparkline"
              [tone]="sparklineTone"
              [area]="true"
            ></st-sparkline>
          }
        </div>
      }
    </article>
  `,
})
export class KpiCard {
  static readonly stComponentName = "KpiCard";
  readonly componentName = "KpiCard";
  @NgInput() value!: number | string;
  @NgInput() label!: string;
  @NgInput() delta?: number;
  @NgInput() deltaFormat: KpiCardDeltaFormat = "percent";
  @NgInput() trend?: KpiCardTrend;
  @NgInput() format: KpiCardFormat = "number";
  @NgInput() unit?: string;
  @NgInput() currency = "EUR";
  @NgInput() locale?: string;
  @NgInput() sparkline?: number[];
  @NgInput() size: KpiCardSize = "md";
  @NgInput() tone?: KpiCardTone;
  @NgInput() decoration?: CellDecoration;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-kpiCard",
      `st-kpiCard--${this.size}`,
      this.tone && `st-kpiCard--${this.tone}`,
      this.tone && "st-kpiCard--toned",
      this.decoration && "st-cell",
      this.decoration && cellDecorationClass(this.decoration.intent),
      this.classInput,
    );
  }

  get formattedValue(): string {
    if (typeof this.value === "string") return this.value;
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

  get formattedDelta(): string | undefined {
    if (this.delta == null) return undefined;
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

  get resolvedTrend(): KpiCardTrend {
    if (this.trend) return this.trend;
    if (this.delta == null) return "flat";
    if (this.delta > 0) return "up";
    if (this.delta < 0) return "down";
    return "flat";
  }

  get sparklineTone(): SparklineTone {
    return this.resolvedTrend === "up"
      ? "success"
      : this.resolvedTrend === "down"
        ? "error"
        : "neutral";
  }

  get arrow(): string {
    return this.resolvedTrend === "up"
      ? "M3 8.5 7 4l4 4.5"
      : this.resolvedTrend === "down"
        ? "M3 5.5 7 10l4-4.5"
        : "M3 7h8";
  }

  private get trendLabel(): string | undefined {
    return this.resolvedTrend === "up"
      ? "en hausse"
      : this.resolvedTrend === "down"
        ? "en baisse"
        : "stable";
  }

  get ariaLabel(): string {
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

  get deltaClass(): string {
    return classNames("st-kpiCard__delta", `st-kpiCard__delta--${this.resolvedTrend}`);
  }

  get decorationIconNodes(): Array<[string, Record<string, string | number>]> | null {
    const icon = this.decoration?.icon;
    if (icon == null) return null;
    return cellDecorationIconNodes[icon] ?? null;
  }
}
