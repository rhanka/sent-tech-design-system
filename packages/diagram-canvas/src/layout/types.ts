/**
 * The layout engine's contract: what it takes, what it returns, and the few
 * numbers it is tuned by. No diagram model is declared here. The input is a
 * `diagram-core` `SemanticDocument` and the output is a `diagram-core`
 * `ViewDocument`; everything below is either a call option or the outcome of
 * one call (direction chosen, zoom, warnings), never persisted content.
 */

import type {
  Diagnostic,
  DiagramPresentation,
  OccurrenceRef,
  ProfileRegistry,
  ViewDocument,
  ViewRef,
} from "@sentropic/diagram-core";

import type { LayoutHints } from "./hints.js";
import type { LineMeasurer } from "./measure.js";

/** L-R5: the only two flows the engine draws. */
export type FlowDirection = "left-to-right" | "top-to-bottom";

/**
 * What a piece of text is for the shared measurement API (M3 §4.6.2): the
 * eight exact roles. The compatibility path keeps its own role names through
 * {@link LegacyTextRole}; `TextMeasurer` accepts both so views without
 * `presentation.diagram` keep their pinned byte-identical behaviour (§4.8).
 */
export type TextRole =
  | "kicker"
  | "title"
  | "body"
  | "detail"
  | "footer"
  | "subtitle"
  | "legend-label"
  | "edge-label";

/** Role names of the pre-M1-d compatibility measurer, kept verbatim. */
export type LegacyTextRole = "node" | "container-title" | "edge-label";

export interface TextSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Text measurement is INJECTED. The engine has no font metric source and no DOM
 * (`tsconfig.json` makes both unresolvable), so the host hands one in; tests use
 * a fixed-width measurer. The same measurer must be used to draw the labels, or
 * the space the engine reserved will not match the text that is drawn.
 *
 * Kept only as the compatibility path for views with no
 * `presentation.diagram` (§4.8). Measured diagram views use `LineMeasurer`.
 */
export type TextMeasurer = (text: string, role: TextRole | LegacyTextRole) => TextSize;

/** World units (CSS px at zoom 1). Every field has a default; see {@link DEFAULT_LAYOUT_METRICS}. */
export interface LayoutMetrics {
  readonly nodePaddingX: number;
  readonly nodePaddingY: number;
  readonly nodeMinWidth: number;
  readonly nodeMinHeight: number;
  /** Space between a container's border and its content, on all four sides. */
  readonly containerPadding: number;
  /** Space above and below a container title, inside the title band. */
  readonly titlePaddingY: number;
  /** Base distance between two consecutive ranks, along the flow. L-R10 may lengthen one. */
  readonly rankGap: number;
  /** Distance between two neighbours of one rank, across the flow. */
  readonly nodeGap: number;
  /** Distance between two docking slots on one side (L-R2), when the side is long enough. */
  readonly slotSpacing: number;
  /** How far a route keeps from any shape it does not belong to. */
  readonly clearance: number;
  /** Free space kept around an edge label (L-R10). */
  readonly labelMargin: number;
}

export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  nodePaddingX: 12,
  nodePaddingY: 8,
  nodeMinWidth: 64,
  nodeMinHeight: 32,
  containerPadding: 16,
  titlePaddingY: 6,
  rankGap: 56,
  nodeGap: 24,
  slotSpacing: 12,
  clearance: 8,
  labelMargin: 4,
};

/** L-R7: the phone range, in CSS px. It no longer forces a direction — L-R5 chooses at every width — but `fit.phone` still reports it. */
export const PHONE_MIN_WIDTH = 320;
export const PHONE_MAX_WIDTH = 390;
/** L-R7: the drawing scales down to this at most, then pans inside the canvas. */
export const MIN_ZOOM = 0.75;

export interface LayoutOptions {
  /** The registry `validateDocument` reads. The engine itself only lays out `generic@1`. */
  readonly registry: ProfileRegistry;
  readonly measureText: TextMeasurer;
  /**
   * Typed synthesis presentation (M3 §3.2/§5.6). Absent means the
   * compatibility path: the pinned existing behaviour, byte-identical (§4.8).
   * Present selects the card/container/legend/legend-key synthesis forms and
   * the fixed-footprint measurement rules of §4.6.
   */
  readonly presentation?: DiagramPresentation;
  /** Injected shared line measurer for measured views (M3 §4.6.2/§5.6). */
  readonly measureLines?: LineMeasurer;
  /** Collapsed occurrence ids (fold state) for measured views (M3 §5.6). */
  readonly collapsed?: readonly OccurrenceRef[];
  /** Authored recursive layout hints for measured views (M3 §4.7). */
  readonly hints?: LayoutHints;
  /**
   * L-R7: the effective viewport inner width, in CSS px — the content-box
   * width of the viewport box the drawing is rendered into, measured by the
   * renderer (or the host acting for it) at layout time, never a wider
   * nominal host width. The renderer sets that box's content width to
   * exactly this value and re-lays out when it changes.
   */
  readonly targetWidth: number;
  /** The view reference of the produced view. Defaults to `view:layout`. */
  readonly viewId?: ViewRef;
  readonly metrics?: Partial<LayoutMetrics>;
}

/** The outcome of the L-R5 / L-R7 decision for one call. Derived, never persisted. */
export interface LayoutFit {
  readonly direction: FlowDirection;
  /** Finalized width `B` at scale 1, world units: the union width, not the placement width. */
  readonly width: number;
  readonly height: number;
  /** `presentation.camera.zoom` of the produced view: 1, or down to {@link MIN_ZOOM}. */
  readonly zoom: number;
  /** True when the drawing is still wider than the target at {@link MIN_ZOOM}: the host pans inside the canvas. */
  readonly pans: boolean;
  /** True when the target width is at most {@link PHONE_MAX_WIDTH}. */
  readonly phone: boolean;
}

/** A rule the engine could not fully satisfy on this input, reported instead of dropped. */
export type LayoutWarningCode =
  | "label-unplaced"
  | "label-budget-exhausted"
  | "route-obstructed"
  | "row-fill-partial"
  | "card-overflow"
  | "zone-overflow"
  | "docking-overflow";

export interface LayoutWarning {
  readonly code: LayoutWarningCode;
  readonly refs: readonly string[];
  readonly message: string;
  /** Structured overflow detail (needed/allocated sizes, side, required/fitted slots). */
  readonly details?: Readonly<Record<string, string | number>>;
}

/** Why a document was not laid out. `document-invalid` carries `diagram-core`'s own diagnostics. */
export type LayoutRefusalCode =
  | "document-invalid"
  | "target-width-invalid"
  | "entity-profile-unsupported"
  | "entity-type-unsupported"
  | "relation-type-unsupported"
  | "layout-hint-invalid";

export interface LayoutRefusal {
  readonly code: LayoutRefusalCode;
  readonly path: string;
  readonly message: string;
  readonly refs?: readonly string[];
}

export type LayoutResult =
  | {
      readonly status: "laid-out";
      readonly view: ViewDocument;
      readonly fit: LayoutFit;
      readonly warnings: readonly LayoutWarning[];
      /**
       * Shared line-layout output (M3 §4.6.3/§5.6). Present on measured
       * views only; the compatibility path carries no `measurements` key.
       */
      readonly measurements?: import("./measure.js").LayoutMeasurements;
    }
  | {
      readonly status: "refused";
      readonly refusals: readonly LayoutRefusal[];
      /** `validateDocument`'s diagnostics, verbatim, when the refusal is `document-invalid`. */
      readonly diagnostics: readonly Diagnostic[];
    };
