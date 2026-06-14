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
    return ["st-kpiCard", this.classInput].filter(Boolean).join(" ");
  }
}
