import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

import { resolveActiveIndex } from "./chartCrosshair.js";

import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type ScatterPlotTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
  /**
   * Per-datum radius, clamped to a sane maximum (32). Non-finite or
   * negative ⇒ falls back to the global `radius`.
   */
  r?: number;
};

/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
  x: number;
  y: number;
  tone?: ScatterPlotTone;
  label?: string;
};

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  /**
   * Cluster centroid markers (ring + cross), drawn above the points. Their
   * coordinates are folded into the axis domain. Non-finite x/y are skipped.
   */
  centroids?: ScatterPlotCentroid[];
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value (the datum `label` wins when present). Object → `format` /
   * `position`. Default position is `top`. Labels are `aria-hidden`.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
   * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
   * behaviour.
   */
  hoverKey?: string | null;
  /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
  onHoverKeyChange?: (key: string | null) => void;
  /** FR-5 — roving-tabindex keyboard navigation of the data points. */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
  onSelectKey?: (key: string | null) => void;
  label: string;
  class?: string;
};

@Component({
  selector: "st-scatter-plot",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ScatterPlot {
  static readonly stComponentName = "ScatterPlot";
  readonly componentName = "ScatterPlot";
  @NgInput() data!: ScatterPlotDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() xLabel?: string;
  @NgInput() yLabel?: string;
  @NgInput() radius?: number;
  @NgInput() centroids?: ScatterPlotCentroid[];
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-scatterPlot", this.classInput].filter(Boolean).join(" ");
  }
}
