/**
 * Contract module for `BarChart` (§5.1, §5.4 — the plain-data pilot).
 *
 * SOURCE OF TRUTH: `BarChartProps` — the props type of the Svelte component
 * `BarChart.svelte` in `@sentropic/design-system-svelte` (workspace package
 * `packages/components-svelte`, file `src/lib/BarChart.svelte`). There it is
 * declared inline in the instance script (`type BarChartProps = { ... }`) and
 * not exported by name; the shared chart types it references
 * (`BarChartDatum`, `ChartAnnotation`, `DataLabelsProp`) are exported from the
 * package index. The interface below is its JSON form, re-declared here so
 * this package generates from its own self-contained module (the `.svelte`
 * file is not TypeScript-sourceable by ts-json-schema-generator, and the
 * catalogue must not depend on another workspace's build output).
 *
 * Exclusions (§5.1, explicit): the three callbacks and the style hook. The
 * narrowing: `dataLabels` drops its `format` function member. No prop needed
 * a replacement type beyond that narrowing.
 */

import type { ContractModule } from "./types.js";

// --- JSON form of the shared chart types (mirrored from the Svelte source) ---

/** Categorical tone of one bar (8-slot category palette). */
export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

/** One bar: its label is also its selection key. */
export interface BarChartDatum {
  /** The bar's category label; also its key for selection and hover. */
  label: string;
  /** The bar's value (value-axis units). */
  value: number;
  /** Explicit categorical tone; the palette default when absent. */
  tone?: BarChartTone;
  /** Lower error-bar extent (value-axis units). Drawn only when finite. */
  errorLow?: number;
  /** Upper error-bar extent (value-axis units). Drawn only when finite. */
  errorHigh?: number;
}

/** Semantic tone for an analytical overlay (reference line / band / goal). */
export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";

/** A reference line on one axis (default axis: "y"). */
export interface ChartReferenceLine {
  /** Position of the line in value-axis units. */
  value: number;
  /** Human-readable line label. */
  label?: string;
  /** Feedback-token tone for the line. */
  tone?: ChartOverlayTone;
  /** Which axis the line spans; "y" by default. */
  axis?: "x" | "y";
}

/** A shaded band between two value-axis positions. */
export interface ChartBand {
  /** Band start in value-axis units. */
  from: number;
  /** Band end in value-axis units. */
  to: number;
  /** Human-readable band label. */
  label?: string;
  /** Feedback-token tone for the band. */
  tone?: ChartOverlayTone;
}

/** A single goal line, emphasised above the bars. */
export interface ChartGoalLine {
  /** Position of the goal line in value-axis units. */
  value: number;
  /** Human-readable goal label. */
  label?: string;
}

/** Marker glyph for a point annotation. */
export type ChartAnnotationMarker = "circle" | "square" | "diamond";

/**
 * Annotation overlay in data space, discriminated on `kind`. The `x`
 * coordinate is categorical for this chart: it matches a bar by its `label`
 * and is ignored otherwise; `y` and every value-axis number are numeric.
 */
export type ChartAnnotation =
  | {
      kind: "point";
      x: number | string;
      y: number;
      label?: string;
      marker?: ChartAnnotationMarker;
    }
  | {
      kind: "label";
      x: number | string;
      y: number;
      text: string;
      anchor?: "start" | "middle" | "end";
    }
  | { kind: "line"; axis: "x" | "y"; value: number; label?: string }
  | { kind: "region"; axis: "x" | "y"; from: number; to: number; label?: string }
  | { kind: "shape"; points: { x: number | string; y: number }[]; label?: string };

/**
 * JSON form of `DataLabelsProp` (§5.1 narrowing): the `format` function member
 * is dropped — the element renders values with its own numeric formatter.
 */
export type DataLabelsJson =
  | boolean
  | {
      /** Placement hint; the chart's default when absent. */
      position?: "auto" | "inside" | "outside" | "top" | "center";
    };

/** Value-axis scale type. `log` requires strictly positive values. */
export type ChartScale = "linear" | "log";

/**
 * The JSON subset of the Svelte `BarChartProps` (§4.1: data only — no
 * callbacks, no style hook). Member-for-member identical to the four
 * frameworks' `BarChartProps` minus the excluded props; the parity guard
 * proves it mechanically against React, Vue and Angular at generation time.
 */
export interface BarChartProps {
  /** The bars, in draw order. Required. */
  data: BarChartDatum[];
  /** Human-readable chart label (also the accessible name). Required. */
  label: string;
  /** Fixed pixel width; the container's when absent. */
  width?: number;
  /** Fixed pixel height; the component's default when absent. */
  height?: number;
  /** Bar direction; "vertical" by default. */
  orientation?: "vertical" | "horizontal";
  /** Fixed value-axis domain [min, max]; the auto data range when absent. */
  domain?: [number, number];
  /** Keys of the currently selected bars (a bar's key is its label). Controlled. */
  selectedKeys?: string[];
  /** Reference lines on the value axis. */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the bars. */
  goalLine?: ChartGoalLine;
  /** Annotation overlay in data space (see ChartAnnotation). */
  annotations?: ChartAnnotation[];
  /** Per-bar value labels; absent or false renders none. */
  dataLabels?: DataLabelsJson;
  /** Value-axis scale; "linear" by default, "log" needs positive values. */
  scale?: ChartScale;
  /** Inverts the value axis (high values toward the origin). Default false. */
  invertAxis?: boolean;
  /** Accepted for cross-chart parity; BarChart has no separate legend surface. */
  showLegend?: boolean;
  /** Controlled synchronised hover key (a bar's label, or null for none). */
  hoverKey?: string | null;
  /** Keyboard navigation of the data points (roving tabindex). */
  keyboardNav?: boolean;
}

/** The declared contract of `BarChart` (§5.1). */
export const barChartContract: ContractModule = {
  component: "BarChart",
  propsTypeName: "BarChartProps",
  source: {
    packageName: "@sentropic/design-system-svelte",
    file: "packages/components-svelte/src/lib/BarChart.svelte",
    typeName: "BarChartProps",
    note:
      "Declared inline in the Svelte instance script (not exported by name); " +
      "reduced here to its JSON subset, excluding the callbacks and the class hook.",
  },
  excluded: [
    {
      prop: "onSelect",
      kind: "function",
      reason: "Callback (§4.1 data only). Its select intent is re-emitted by the element as the §4.6 intent event.",
    },
    {
      prop: "onHoverKeyChange",
      kind: "function",
      reason: "Callback (§4.1 data only). Hover stays local; no intent is emitted for it (§4.6).",
    },
    {
      prop: "onSelectKey",
      kind: "function",
      reason: "Callback (§4.1 data only). Same select intent as onSelect, from the keyboard surface.",
    },
    {
      prop: "class",
      kind: "style-hook",
      reason:
        "Style hook (§4.1): the envelope never carries styling. React names the same hook className; " +
        "the parity guard applies that alias when comparing React's props.",
    },
  ],
  replacedTypes: [],
  narrowedUnions: [
    {
      prop: "dataLabels",
      sourceForm: "DataLabelsProp = boolean | { format?: (value: number) => string; position?: DataLabelPosition }",
      jsonForm: "DataLabelsJson = boolean | { position?: \"auto\" | \"inside\" | \"outside\" | \"top\" | \"center\" }",
      dropped: ["format"],
      reason: "The format member is a function (§4.1); the element formats values itself.",
    },
  ],
  callbacks: [
    {
      callback: "onSelect",
      signature: "(key: string) => void",
      intent: "select",
      targetFrom: "key (the bar's label)",
      note: "Pointer/accessible chip selection; the element emits intent select with target = key.",
    },
    {
      callback: "onSelectKey",
      signature: "(key: string | null) => void",
      intent: "select",
      targetFrom: "key (the bar's label)",
      note: "Keyboard selection (Enter/Space on the roving-tabindex surface); null (Escape) emits no event.",
    },
    {
      callback: "onHoverKeyChange",
      signature: "(key: string | null) => void",
      intent: null,
      note: "Hover is transient and stays local (§4.6); no intent is emitted.",
    },
  ],
  frameworks: [
    {
      framework: "svelte",
      file: "packages/components-svelte/src/lib/BarChart.svelte",
      typeName: "BarChartProps",
      role: "source-of-truth",
      note: "Reference pilot (§3.1); not mechanically generatable (Svelte file), mirrored here member for member.",
    },
    { framework: "react", file: "packages/components-react/src/BarChart.tsx", typeName: "BarChartProps", role: "compared" },
    { framework: "vue", file: "packages/components-vue/src/BarChart.ts", typeName: "BarChartProps", role: "compared" },
    { framework: "angular", file: "packages/components-angular/src/BarChart.ts", typeName: "BarChartProps", role: "compared" },
  ],
  metadata: {
    contract: "1.0",
    element: "st-bar-chart",
    engine: "core",
    events: ["select"],
    fallback: "svg",
  },
  example: {
    id: "root",
    component: "BarChart",
    data: [
      { label: "Q1", value: 12 },
      { label: "Q2", value: 18 },
      { label: "Q3", value: 9 },
    ],
    label: "Revenue (M€)",
    referenceLines: [{ value: 15, label: "Target" }],
    dataLabels: true,
  },
};
