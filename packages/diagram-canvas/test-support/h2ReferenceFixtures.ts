/**
 * Browser-safe H2.9 labelled reference scene fixtures, residual catalog
 * (T-01..T-61, NE-1..NE-9), and quantitative residual measurement helpers
 * (T-09, T-49/T-50, T-37, T-45).
 *
 * Pure data and geometry: zero `node:fs`, zero DOM, safe for Vite browser
 * bundles (`tools/diagram-first-paint/`) and Vitest suites alike.
 */
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  documentRef,
  entityRef,
  lowerLayoutHintsV2,
  occurrenceRef,
  relationRef,
  type DiagramPresentation,
  type DsLayoutHintsV2,
  type Entity,
  type EntityRef,
  type LinkEmphasis,
  type Relation,
  type RelationPresentation,
  type SemanticDocument,
  type StrokeStyle,
  type ViewDocument,
} from "@sentropic/diagram-core";

import type { LayoutHints, LayoutResult, Rect } from "../src/index.js";
import type { AnatomyPinned } from "../src/presentation/diagramCardModel.js";

export interface H2ResidualTag {
  readonly rows: readonly string[];
  readonly ne: string;
  readonly summary: string;
  readonly restoredIn: string;
  readonly trackItem: string;
}

export interface H2OverlaySceneMeta {
  readonly id: string;
  readonly title: string;
  readonly figureLabel: string;
  readonly capturePx: { readonly width: number; readonly height: number } | null;
  readonly carries: readonly string[];
  readonly residuals: readonly H2ResidualTag[];
  readonly firstPaintCase?: string;
}

export interface RawH2Entity {
  readonly id: string;
  readonly container?: boolean;
  readonly parent?: string;
  readonly title: string;
  readonly kicker?: string;
  readonly body?: string;
}

export interface RawH2Relation {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly strokeStyle?: StrokeStyle;
  readonly arrowhead?: "arrow" | "none";
  readonly emphasis?: LinkEmphasis;
}

export interface BrowserSafeH2Scene {
  readonly id: string;
  readonly document: SemanticDocument;
  readonly presentation: DiagramPresentation & {
    readonly entities: Readonly<Record<string, DiagramPresentation["entities"][string] & AnatomyPinned>>;
    readonly relations?: Readonly<Record<string, RelationPresentation>>;
  };
  readonly view?: ViewDocument;
  readonly hintsV2: DsLayoutHintsV2;
  readonly hints: LayoutHints;
  readonly containers: readonly EntityRef[];
}

const ISO_TRACK = "01M7WJN8595HFTM982VRNHJVYB";
const H2_TRACK = "01M7X7GEC8RNXYY8V0YZK9B1GP";
const ASPECT_TRACK = "01M7X7GEMTW01K6GES6P3WFFKD";

/** Complete 14-scene H2.9 overlay and residual catalog (H2-STEP0 §2–§3, §5.2 H2.9). */
export const H2_OVERLAY_CATALOG: readonly H2OverlaySceneMeta[] = Object.freeze([
  {
    id: "schema-13",
    title: "Example A — Bands, stages, start peripheral stack, free-cell legend & fan-out comb",
    figureLabel: "r7 schema 13",
    capturePx: { width: 2000, height: 1020 },
    carries: ["T-25", "T-26", "T-27", "T-28", "T-29", "T-31 (P)", "T-32", "T-33"],
    firstPaintCase: "h2-example-a",
    residuals: [
      {
        rows: ["T-30"],
        ne: "NE-4",
        summary: "First child card inside peripheral zone sits one zone header height below mid band cards",
        restoredIn: "None planned (by design)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-31"],
        ne: "P",
        summary: "DE-2 legend anatomy carries heading and minimum width 240 inside free cell (top, tools)",
        restoredIn: "None planned (DE-2 legend anatomy)",
        trackItem: H2_TRACK,
      },
      {
        rows: ["T-34"],
        ne: "NE-5",
        summary: "Stage spacing uses DS gap tokens + BF-6 label widening instead of authored 710 pitch",
        restoredIn: "None planned (no authored geometry)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-32", "T-33"],
        ne: "NE-6",
        summary: "Comb trunk track and route elbows are engine-routed rather than authored waypoints",
        restoredIn: "None planned (routed in every scenario)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "schema-3",
    title: "Example B — Two inherited 5-stage layer zones, spanning card & 4->1 fan-in comb",
    figureLabel: "r7 schema 3",
    capturePx: { width: 2000, height: 884 },
    carries: ["T-07", "T-08", "T-09", "T-10", "T-11", "T-12", "T-13", "T-14"],
    firstPaintCase: "h2-example-b",
    residuals: [
      {
        rows: ["T-09"],
        ne: "Measured",
        summary: "Upper card ax centred at exact s1..s2 midpoint (offset measured vs capture ≈ +0.8%)",
        restoredIn: "Verified in H2.9",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-15"],
        ne: "NE-5",
        summary: "Inter-layer zone gutter fixed at zoneGutter token 96 (REQ-R7-14) instead of authored 120",
        restoredIn: "None planned (REQ-R7-14 token)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-12", "T-13"],
        ne: "NE-6",
        summary: "Routes and comb label positions are computed by DE-2 + H2.7 router",
        restoredIn: "None planned (routed in every scenario)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "appctx-architecture",
    title: "16:9 Reference Scene — Composed architecture with peripheral columns & aspect: '16:9'",
    figureLabel: "16:9 slide reference (R-7)",
    capturePx: null,
    carries: ["REQ-R7-22", "REQ-R7-21", "REQ-R7-05", "REQ-R7-13", "REQ-R7-14"],
    firstPaintCase: "h2-aspect-16-9",
    residuals: [
      {
        rows: ["NE-9"],
        ne: "NE-9",
        summary: "External v10 architecture structure (Action A-1) not delivered; DS-owned appctx-architecture 16:9 composition validates REQ-R7-22 (R-7)",
        restoredIn: "Upon A-1 structure delivery",
        trackItem: ASPECT_TRACK,
      },
      {
        rows: ["F-6"],
        ne: "L-sigma",
        summary: "Folded containers in sigma-widened root tracks show painted gap = zoneGutter + slot slack (reported in composition report)",
        restoredIn: "Owner decision L-sigma",
        trackItem: ASPECT_TRACK,
      },
    ],
  },
  {
    id: "schema-1",
    title: "Before / After panels — Equal-height panels with inner staged grids & hole",
    figureLabel: "r7 schema 1",
    capturePx: { width: 2000, height: 854 },
    carries: ["T-01", "T-02", "T-03", "T-04", "T-06"],
    residuals: [
      {
        rows: ["T-05"],
        ne: "NE-1",
        summary: "Cross-panel lane baseline sync and header equalisation require transverse_bands: 'inherit' / compared_panels",
        restoredIn: "N2 (ds-layout-hints@3)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "schema-6",
    title: "Graduated scale — 7 notches, 8 tool lanes, 2 targets & 3->1 fan-in comb",
    figureLabel: "r7 schema 6",
    capturePx: { width: 2000, height: 1071 },
    carries: ["T-16", "T-17", "T-18 (P)", "T-19", "T-20", "T-21"],
    residuals: [
      {
        rows: ["T-18"],
        ne: "NE-2",
        summary: "Fixed-footprint notch cards spanning 2 lanes centre on the span instead of stretching",
        restoredIn: "Anatomy lot (DC-2d / N2)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-22", "T-23"],
        ne: "NE-7",
        summary: "Graduated ruler and nested braces are presentation annotations outside layout hints",
        restoredIn: "N2 (bracePath / rulerPath)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-24"],
        ne: "N-A",
        summary: "Compact iconless half-height boxes belong to flow-node anatomy",
        restoredIn: "Anatomy lot (DC-2d)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "ref-1",
    title: "Pipeline layers — 5 stages, empty spanned band r3 (I-13), inherited host frame & 5->1 comb",
    figureLabel: "ref 1",
    capturePx: { width: 1899, height: 898 },
    carries: ["T-35", "T-38 (P)", "T-39", "T-40", "T-41", "T-42"],
    residuals: [
      {
        rows: ["T-36"],
        ne: "NE-3",
        summary: "Shared baseline column title headers carry text outside layout hints",
        restoredIn: "Presentation time 2",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-37", "T-38"],
        ne: "NE-1",
        summary: "Root source lanes and host local trigger lanes drift vertically (measured per lane in H2.9)",
        restoredIn: "N2 (transverse_bands: 'inherit' @3)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-38", "T-43"],
        ne: "NE-2",
        summary: "Spanning leaf cards (source-b, exposure, transverse) stay at fixed card footprint",
        restoredIn: "Anatomy lot (DC-2d / N2)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "ref-2",
    title: "Domain grid — 4 stages x 3 tiers plus transverse foundation band",
    figureLabel: "ref 2",
    capturePx: { width: 1813, height: 873 },
    carries: ["T-44", "T-45 (P)"],
    residuals: [
      {
        rows: ["T-45"],
        ne: "NE-4",
        summary: "Column 4 pair aligns to tier 1 and tier 2 rhythm rather than an independent sub-rhythm (measured in H2.9)",
        restoredIn: "None planned",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-46"],
        ne: "NE-2",
        summary: "Transverse foundation box stays centred at fixed footprint across s1..s4",
        restoredIn: "Anatomy lot (DC-2d / N2)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-47"],
        ne: "N-A",
        summary: "Self-loop corridor and diagonal connectors are outside orthogonal @2 routing",
        restoredIn: "ds-layout-hints@3 (loop_corridor)",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "ref-3",
    title: "State flow — 6-source stack, centred 4-box main path (l3..l4), sink (l5..l6) & 6->1 comb",
    figureLabel: "ref 3",
    capturePx: { width: 1778, height: 734 },
    carries: ["T-48", "T-49", "T-50", "T-51"],
    residuals: [
      {
        rows: ["T-49", "T-50"],
        ne: "Measured",
        summary: "Main path stays centred on 6-source stack (T-49); sink offset in (l5..l6, s5) measured standalone in H2.9",
        restoredIn: "Verified in H2.9",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-52"],
        ne: "NE-2",
        summary: "Note box under path stays fixed-footprint centred across s2..s5",
        restoredIn: "Anatomy lot (DC-2d / N2)",
        trackItem: ISO_TRACK,
      },
      {
        rows: ["T-53"],
        ne: "N-A",
        summary: "Decision diamond and feedback loop corridor belong to DC-2d / @3",
        restoredIn: "DC-2d / @3",
        trackItem: ISO_TRACK,
      },
    ],
  },
  {
    id: "archi-metier",
    title: "Figkit twin — Business domain 3x3 staged zone with holes",
    figureLabel: "figkit archi-metier",
    capturePx: null,
    carries: ["T-54"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
  {
    id: "archi-applicative",
    title: "Figkit twin — Inherited 4x3 application suite + middle-stage root card",
    figureLabel: "figkit archi-applicative",
    capturePx: null,
    carries: ["T-55"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
  {
    id: "archi-technologique",
    title: "Figkit twin — Inherited 3x3 runtime platform + third-stage root card",
    figureLabel: "figkit archi-technologique",
    capturePx: null,
    carries: ["T-56"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
  {
    id: "retro-a",
    title: "Figkit twin — Unstaged root band with column stack + nested row stack",
    figureLabel: "figkit retro-a",
    capturePx: null,
    carries: ["T-57"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
  {
    id: "retro-b",
    title: "Figkit twin — Shared inherited middle hole across stacked zones P and Q",
    figureLabel: "figkit retro-b",
    capturePx: null,
    carries: ["T-58"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
  {
    id: "retro-c",
    title: "Figkit twin — Chained multi-level inheritance with shifted worker stack",
    figureLabel: "figkit retro-c",
    capturePx: null,
    carries: ["T-59"],
    residuals: [
      { rows: ["T-60"], ne: "NE-8", summary: "Single layout fitted by zoom + pan on narrow viewports (no phone reflow)", restoredIn: "None planned", trackItem: ISO_TRACK },
    ],
  },
]);

export function buildBrowserSafeGenericScene(spec: {
  readonly id: string;
  readonly entities: readonly RawH2Entity[];
  readonly relations: readonly RawH2Relation[];
  readonly hintsV2: DsLayoutHintsV2;
  readonly anatomy?: "v1" | "v2";
}): BrowserSafeH2Scene {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const entityPresentations: Record<string, DiagramPresentation["entities"][string] & AnatomyPinned> = {};
  const relationPresentations: Record<string, RelationPresentation> = {};
  const containers: EntityRef[] = [];
  const anatomy = spec.anatomy ?? "v2";

  for (const item of spec.entities) {
    const ref = entityRef(item.id);
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type: item.container ? "container" : "node",
      attributes: { name: { kind: "text", value: item.title } },
    };
    if (item.container) containers.push(ref);
    const occ = occurrenceRef(`e.${item.id}`);
    entityPresentations[occ] = {
      form: item.container ? "container" : "card",
      anatomy,
      text: {
        title: item.title,
        ...(item.kicker === undefined ? {} : { kicker: item.kicker }),
        ...(item.body === undefined ? {} : { body: item.body }),
      },
    };
    if (item.parent !== undefined) {
      const relId = relationRef(`contains.${item.parent}.${item.id}`);
      relations[relId] = {
        id: relId,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(item.parent) },
          { role: "child", target: ref },
        ],
        attributes: {},
      };
    }
  }

  for (const edge of spec.relations) {
    const relId = relationRef(edge.id);
    relations[relId] = {
      id: relId,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef(edge.source) },
        { role: "target", target: entityRef(edge.target) },
      ],
      attributes: edge.label === undefined ? {} : { label: { kind: "text", value: edge.label } },
    };
    if (edge.strokeStyle !== undefined || edge.arrowhead !== undefined || edge.emphasis !== undefined) {
      relationPresentations[relId] = {
        ...(edge.strokeStyle === undefined ? {} : { strokeStyle: edge.strokeStyle }),
        ...(edge.arrowhead === undefined ? {} : { arrowhead: edge.arrowhead }),
        ...(edge.emphasis === undefined ? {} : { emphasis: edge.emphasis }),
      };
    }
  }

  const document: SemanticDocument = {
    documentId: documentRef(`h2-${spec.id}`),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };

  return {
    id: spec.id,
    document,
    presentation: {
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      entities: entityPresentations,
      legends: {},
      categoryTokens: [],
      ...(Object.keys(relationPresentations).length === 0 ? {} : { relations: relationPresentations }),
    },
    hintsV2: spec.hintsV2,
    hints: lowerLayoutHintsV2(spec.hintsV2),
    containers: containers.sort(),
  };
}

/** Labelled generic definitions (no client content) for all 13 §2.1 whole-figure scenes. */
export const H2_GENERIC_SCENE_SPECS: Readonly<
  Record<string, { readonly entities: readonly RawH2Entity[]; readonly relations: readonly RawH2Relation[] }>
> = Object.freeze({
  "schema-13": {
    entities: [
      { id: "p1", title: "Policy One", kicker: "Stage 1" },
      { id: "p2", title: "Policy Two", kicker: "Stage 2" },
      { id: "p3", title: "Policy Three", kicker: "Stage 3" },
      { id: "j1", title: "Job Alpha", kicker: "Core" },
      { id: "j2", title: "Job Beta", kicker: "Core" },
      { id: "j3", title: "Job Gamma", kicker: "Core" },
      { id: "m1", title: "Metric Store", kicker: "Data" },
      { id: "m2", title: "Audit Trail", kicker: "Data" },
      { id: "tools", container: true, title: "Agent Tools", kicker: "Peripheral" },
      { id: "tool-1", parent: "tools", title: "Command CLI" },
      { id: "tool-2", parent: "tools", title: "Agent One" },
      { id: "tool-3", parent: "tools", title: "Agent Two" },
      { id: "tool-4", parent: "tools", title: "Agent Three" },
    ],
    relations: [
      { id: "e1", source: "tool-1", target: "j1", label: "dispatch" },
      { id: "e2", source: "j1", target: "j2", label: "route" },
      { id: "e3", source: "j2", target: "j3", label: "mesh" },
      { id: "e4", source: "p1", target: "j1", label: "policy", strokeStyle: "dashed" },
      { id: "e5", source: "p2", target: "j2", label: "policy", strokeStyle: "dashed" },
      { id: "e6", source: "p3", target: "j3", label: "policy", strokeStyle: "dashed" },
      { id: "e7", source: "j1", target: "m1", label: "records" },
      { id: "e8", source: "j2", target: "m2", label: "traces" },
      { id: "e9", source: "j3", target: "tool-2", label: "accounts", strokeStyle: "solid", emphasis: "emphasis" },
      { id: "e10", source: "j3", target: "tool-3", label: "accounts", strokeStyle: "solid", emphasis: "emphasis" },
      { id: "e11", source: "j3", target: "tool-4", label: "accounts", strokeStyle: "solid", emphasis: "emphasis" },
    ],
  },
  "schema-3": {
    entities: [
      { id: "layer-a", container: true, title: "Upper Layer", kicker: "Control" },
      { id: "ax", parent: "layer-a", title: "Coordinator" },
      { id: "ay", parent: "layer-a", title: "Observer" },
      { id: "layer-b", container: true, title: "Lower Layer", kicker: "Execution" },
      { id: "b1", parent: "layer-b", title: "Stage One" },
      { id: "b2", parent: "layer-b", title: "Stage Two" },
      { id: "b3", parent: "layer-b", title: "Stage Three" },
      { id: "b4", parent: "layer-b", title: "Stage Four" },
      { id: "b5", parent: "layer-b", title: "Stage Five" },
      { id: "c1", parent: "layer-b", title: "Step One" },
      { id: "c2", parent: "layer-b", title: "Step Two" },
      { id: "c3", parent: "layer-b", title: "Step Three" },
      { id: "c4", parent: "layer-b", title: "Step Four" },
    ],
    relations: [
      { id: "r1", source: "ax", target: "b1", label: "governs", strokeStyle: "dashed" },
      { id: "r2", source: "ax", target: "b2", label: "governs", strokeStyle: "dashed" },
      { id: "r3", source: "ay", target: "b5", label: "monitors", strokeStyle: "dashed" },
      { id: "r4", source: "b1", target: "c1", label: "feeds" },
      { id: "r5", source: "b2", target: "c1", label: "feeds" },
      { id: "r6", source: "b3", target: "c1", label: "feeds" },
      { id: "r7", source: "b4", target: "c1", label: "feeds" },
      { id: "r8", source: "c1", target: "c2", label: "next" },
      { id: "r9", source: "c2", target: "c3", label: "next" },
      { id: "r10", source: "c3", target: "c4", label: "next" },
    ],
  },
  "schema-1": {
    entities: [
      { id: "before", container: true, title: "Before", kicker: "Baseline" },
      { id: "before-a", parent: "before", title: "Intake Step", kicker: "Lane 1" },
      { id: "before-b", parent: "before", title: "Process Step", kicker: "Lane 2" },
      { id: "before-c", parent: "before", title: "Manual Audit", kicker: "Side" },
      { id: "before-d", parent: "before", title: "Delivery Step", kicker: "Lane 3" },
      { id: "after", container: true, title: "After", kicker: "Target" },
      { id: "after-a", parent: "after", title: "Intake Step", kicker: "Lane 1" },
      { id: "after-b", parent: "after", title: "Policy Guard", kicker: "Lane 1" },
      { id: "after-c", parent: "after", title: "Auto Verify", kicker: "Lane 2" },
      { id: "after-d", parent: "after", title: "Delivery Step", kicker: "Lane 3" },
      { id: "after-e", parent: "after", title: "Audit Ledger", kicker: "Lane 3" },
    ],
    relations: [
      { id: "s1-1", source: "before-a", target: "before-b", label: "next" },
      { id: "s1-2", source: "before-b", target: "before-d", label: "next" },
      { id: "s1-3", source: "after-b", target: "after-c", label: "checks" },
      { id: "s1-4", source: "after-c", target: "after-e", label: "records", strokeStyle: "dashed" },
    ],
  },
  "schema-6": {
    entities: [
      { id: "notch-1", title: "Level 1", kicker: "Scale" },
      { id: "notch-2", title: "Level 2", kicker: "Scale" },
      { id: "notch-3", title: "Level 3", kicker: "Scale" },
      { id: "notch-4", title: "Level 4", kicker: "Scale" },
      { id: "notch-5", title: "Level 5", kicker: "Scale" },
      { id: "notch-6", title: "Level 6", kicker: "Scale" },
      { id: "notch-7", title: "Level 7", kicker: "Scale" },
      { id: "tool-1", title: "Tool 1", kicker: "Adapter" },
      { id: "tool-2", title: "Tool 2", kicker: "Adapter" },
      { id: "tool-3", title: "Tool 3", kicker: "Adapter" },
      { id: "tool-4", title: "Tool 4", kicker: "Adapter" },
      { id: "tool-5", title: "Tool 5", kicker: "Adapter" },
      { id: "tool-6", title: "Tool 6", kicker: "Adapter" },
      { id: "tool-7", title: "Tool 7", kicker: "Adapter" },
      { id: "tool-8", title: "Tool 8", kicker: "Adapter" },
      { id: "target-a", title: "Target Alpha", kicker: "Outcome" },
      { id: "target-b", title: "Target Beta", kicker: "Outcome" },
    ],
    relations: [
      { id: "s6-1", source: "tool-3", target: "target-a", label: "delivers" },
      { id: "s6-2", source: "tool-4", target: "target-a", label: "delivers" },
      { id: "s6-3", source: "tool-5", target: "target-a", label: "delivers" },
      { id: "s6-4", source: "tool-6", target: "target-b", label: "feeds", strokeStyle: "dashed" },
    ],
  },
  "ref-1": {
    entities: [
      { id: "source-a", title: "Source A", kicker: "Input" },
      { id: "source-b", title: "Source B", kicker: "Span r2..r3" },
      { id: "source-c", title: "Source C", kicker: "Input" },
      { id: "source-d", title: "Source D", kicker: "Input" },
      { id: "host", container: true, title: "Pipeline Host", kicker: "Runtime" },
      { id: "trigger-a", parent: "host", title: "Trigger A" },
      { id: "trigger-b", parent: "host", title: "Trigger B" },
      { id: "trigger-c", parent: "host", title: "Trigger C" },
      { id: "trigger-d", parent: "host", title: "Trigger D" },
      { id: "trigger-e", parent: "host", title: "Trigger E" },
      { id: "engine", container: true, parent: "host", title: "Engine", kicker: "Stack" },
      { id: "step-1", parent: "engine", title: "Parse" },
      { id: "step-2", parent: "engine", title: "Evaluate" },
      { id: "step-3", parent: "engine", title: "Commit" },
      { id: "storage", container: true, parent: "host", title: "Storage", kicker: "Grid" },
      { id: "store-a", parent: "storage", title: "Primary" },
      { id: "store-b", parent: "storage", title: "Index" },
      { id: "store-c", parent: "storage", title: "Shard 1" },
      { id: "store-d", parent: "storage", title: "Shard 2" },
      { id: "exposure", parent: "host", title: "Exposure", kicker: "API" },
      { id: "transverse", parent: "host", title: "Governance", kicker: "Transverse" },
    ],
    relations: [
      { id: "rf1-1", source: "trigger-a", target: "engine", label: "invokes" },
      { id: "rf1-2", source: "trigger-b", target: "engine", label: "invokes" },
      { id: "rf1-3", source: "trigger-c", target: "engine", label: "invokes" },
      { id: "rf1-4", source: "trigger-d", target: "engine", label: "invokes" },
      { id: "rf1-5", source: "trigger-e", target: "engine", label: "invokes" },
      { id: "rf1-6", source: "engine", target: "storage", label: "persists", strokeStyle: "dashed" },
      { id: "rf1-7", source: "storage", target: "exposure", label: "serves" },
    ],
  },
  "ref-2": {
    entities: [
      { id: "t1-s1", title: "Tier 1 Col 1", kicker: "Tier 1" },
      { id: "t1-s2", title: "Tier 1 Col 2", kicker: "Tier 1" },
      { id: "t1-s3", title: "Tier 1 Col 3", kicker: "Tier 1" },
      { id: "t1-s4", title: "Tier 1 Col 4", kicker: "Pair A" },
      { id: "t2-s1", title: "Tier 2 Col 1", kicker: "Tier 2" },
      { id: "t2-s2", title: "Tier 2 Col 2", kicker: "Tier 2" },
      { id: "t2-s3", title: "Tier 2 Col 3", kicker: "Tier 2" },
      { id: "t2-s4", title: "Tier 2 Col 4", kicker: "Pair B" },
      { id: "t3-s1", title: "Tier 3 Col 1", kicker: "Tier 3" },
      { id: "t3-s2", title: "Tier 3 Col 2", kicker: "Tier 3" },
      { id: "t3-s3", title: "Tier 3 Col 3", kicker: "Tier 3" },
      { id: "t3-s4", title: "Tier 3 Col 4", kicker: "Tier 3" },
      { id: "transverse", title: "Shared Foundation", kicker: "Foot" },
    ],
    relations: [
      { id: "rf2-1", source: "t1-s1", target: "t1-s2", label: "calls" },
      { id: "rf2-2", source: "t2-s1", target: "t2-s2", label: "uses" },
      { id: "rf2-3", source: "t3-s1", target: "t3-s2", label: "reads", strokeStyle: "dashed" },
    ],
  },
  "ref-3": {
    entities: [
      { id: "source-l1", title: "Source 1", kicker: "Lane 1" },
      { id: "source-l2", title: "Source 2", kicker: "Lane 2" },
      { id: "source-l3", title: "Source 3", kicker: "Lane 3" },
      { id: "source-l4", title: "Source 4", kicker: "Lane 4" },
      { id: "source-l5", title: "Source 5", kicker: "Lane 5" },
      { id: "source-l6", title: "Source 6", kicker: "Lane 6" },
      { id: "path-s2", title: "Queue", kicker: "Main path" },
      { id: "path-s3", title: "Filter", kicker: "Main path" },
      { id: "path-s4", title: "Router", kicker: "Main path" },
      { id: "path-s5", title: "Dispatcher", kicker: "Main path" },
      { id: "sink", title: "Dead Letter", kicker: "Sink l5..l6" },
      { id: "note", title: "Flow Notes", kicker: "Foot" },
    ],
    relations: [
      { id: "rf3-1", source: "source-l1", target: "path-s2", label: "events" },
      { id: "rf3-2", source: "source-l2", target: "path-s2", label: "events" },
      { id: "rf3-3", source: "source-l3", target: "path-s2", label: "events" },
      { id: "rf3-4", source: "source-l4", target: "path-s2", label: "events" },
      { id: "rf3-5", source: "source-l5", target: "path-s2", label: "events" },
      { id: "rf3-6", source: "source-l6", target: "path-s2", label: "events" },
      { id: "rf3-7", source: "path-s2", target: "path-s3", label: "next" },
      { id: "rf3-8", source: "path-s3", target: "path-s4", label: "next" },
      { id: "rf3-9", source: "path-s4", target: "path-s5", label: "next" },
      { id: "rf3-10", source: "path-s5", target: "sink", label: "rejects", strokeStyle: "dashed" },
    ],
  },
  "archi-metier": {
    entities: [
      { id: "zone", container: true, title: "Business Domain" },
      { id: "a-1-c1", parent: "zone", title: "Intake" },
      { id: "a-1-c2", parent: "zone", title: "Review" },
      { id: "a-1-c3", parent: "zone", title: "Approval" },
      { id: "a-2-c1", parent: "zone", title: "Catalogue" },
      { id: "a-2-c3", parent: "zone", title: "Dispatch" },
      { id: "a-3-c1", parent: "zone", title: "Archive" },
      { id: "a-3-c2", parent: "zone", title: "Reporting" },
    ],
    relations: [
      { id: "m1", source: "a-1-c1", target: "a-1-c2", label: "submits" },
      { id: "m2", source: "a-1-c2", target: "a-1-c3", label: "validates" },
      { id: "m3", source: "a-2-c1", target: "a-2-c3", label: "publishes", strokeStyle: "dashed" },
      { id: "m4", source: "a-3-c1", target: "a-3-c2", label: "exports" },
    ],
  },
  "archi-applicative": {
    entities: [
      { id: "zone", container: true, title: "Application Suite" },
      { id: "a-1-s1", parent: "zone", title: "Portal" },
      { id: "a-1-s2", parent: "zone", title: "Gateway" },
      { id: "a-1-s3", parent: "zone", title: "Broker" },
      { id: "a-2-s1", parent: "zone", title: "Directory" },
      { id: "a-2-s3", parent: "zone", title: "Worker" },
      { id: "a-3-s2", parent: "zone", title: "Registry" },
      { id: "a-3-s3", parent: "zone", title: "Queue" },
      { id: "a-4-s2", parent: "zone", title: "Ledger" },
      { id: "card", title: "External Store" },
    ],
    relations: [
      { id: "ap1", source: "a-1-s1", target: "a-1-s2", label: "calls" },
      { id: "ap2", source: "a-1-s2", target: "a-1-s3", label: "routes" },
      { id: "ap3", source: "a-3-s2", target: "a-4-s2", label: "writes" },
      { id: "ap4", source: "a-4-s2", target: "card", label: "syncs", strokeStyle: "dashed" },
    ],
  },
  "archi-technologique": {
    entities: [
      { id: "zone", container: true, title: "Runtime Platform" },
      { id: "a-1-s1", parent: "zone", title: "Ingress" },
      { id: "a-1-s2", parent: "zone", title: "Cluster" },
      { id: "a-1-s3", parent: "zone", title: "Vault" },
      { id: "a-2-s1", parent: "zone", title: "Proxy" },
      { id: "a-2-s3", parent: "zone", title: "Signer" },
      { id: "a-3-s2", parent: "zone", title: "Telemetry" },
      { id: "card", title: "Object Storage" },
    ],
    relations: [
      { id: "t1", source: "a-1-s1", target: "a-1-s2", label: "forwards" },
      { id: "t2", source: "a-1-s2", target: "a-1-s3", label: "reads" },
      { id: "t3", source: "a-2-s3", target: "card", label: "backs up", strokeStyle: "dashed" },
    ],
  },
  "retro-a": {
    entities: [
      { id: "stack", container: true, title: "Side Controls" },
      { id: "stack-1", parent: "stack", title: "Input A" },
      { id: "stack-2", parent: "stack", title: "Input B" },
      { id: "zone", container: true, title: "Main Pipeline" },
      { id: "a", parent: "zone", title: "Parser" },
      { id: "b", parent: "zone", title: "Planner" },
      { id: "nested", container: true, parent: "zone", title: "Executors" },
      { id: "nested-1", parent: "nested", title: "Runner One" },
      { id: "nested-2", parent: "nested", title: "Runner Two" },
      { id: "c", parent: "zone", title: "Validator" },
      { id: "d", parent: "zone", title: "Publisher" },
      { id: "e", parent: "zone", title: "Auditor" },
    ],
    relations: [
      { id: "ra1", source: "stack-1", target: "a", label: "feeds" },
      { id: "ra2", source: "a", target: "b", label: "plans" },
      { id: "ra3", source: "nested-1", target: "nested-2", label: "chains" },
      { id: "ra4", source: "d", target: "e", label: "logs", strokeStyle: "dashed" },
    ],
  },
  "retro-b": {
    entities: [
      { id: "stack", container: true, title: "Triggers" },
      { id: "st-1", parent: "stack", title: "Event A" },
      { id: "st-2", parent: "stack", title: "Event B" },
      { id: "zone-p", container: true, title: "Upper Band" },
      { id: "p-1-t1", parent: "zone-p", title: "Ingest" },
      { id: "p-1-t2", parent: "zone-p", title: "Transform" },
      { id: "p-1-t3", parent: "zone-p", title: "Emit" },
      { id: "zone-q", container: true, title: "Lower Band" },
      { id: "q-1-t1", parent: "zone-q", title: "Cache" },
      { id: "q-1-t3", parent: "zone-q", title: "Archive" },
    ],
    relations: [
      { id: "rb1", source: "st-1", target: "p-1-t1", label: "starts" },
      { id: "rb2", source: "p-1-t1", target: "p-1-t2", label: "maps" },
      { id: "rb3", source: "p-1-t2", target: "p-1-t3", label: "sends" },
      { id: "rb4", source: "p-1-t1", target: "q-1-t1", label: "caches", strokeStyle: "dashed" },
      { id: "rb5", source: "p-1-t3", target: "q-1-t3", label: "stores", strokeStyle: "dashed" },
    ],
  },
  "retro-c": {
    entities: [
      { id: "zone-k", container: true, title: "Workspace Core" },
      { id: "a", parent: "zone-k", title: "Router" },
      { id: "nested-a", container: true, parent: "zone-k", title: "Upper Cluster" },
      { id: "a-1-s3", parent: "nested-a", title: "Node C" },
      { id: "a-1-s4", parent: "nested-a", title: "Node D" },
      { id: "nested-b", container: true, parent: "zone-k", title: "Lower Cluster" },
      { id: "b-1-s1", parent: "nested-b", title: "Store A" },
      { id: "b-1-s2", parent: "nested-b", title: "Store B" },
      { id: "b-2-s1", parent: "nested-b", title: "Replica A" },
      { id: "stack", container: true, parent: "zone-k", title: "Workers" },
      { id: "w-1", parent: "stack", title: "Worker One" },
      { id: "w-2", parent: "stack", title: "Worker Two" },
      { id: "zone-s", container: true, title: "Shared Services" },
      { id: "s-1-s2", parent: "zone-s", title: "Auth" },
      { id: "s-1-s3", parent: "zone-s", title: "Metrics" },
      { id: "s-1-s4", parent: "zone-s", title: "Billing" },
    ],
    relations: [
      { id: "rc1", source: "a", target: "a-1-s3", label: "routes" },
      { id: "rc2", source: "a-1-s3", target: "a-1-s4", label: "forwards" },
      { id: "rc3", source: "b-1-s1", target: "b-1-s2", label: "syncs" },
      { id: "rc4", source: "b-1-s2", target: "s-1-s2", label: "checks", strokeStyle: "dashed" },
      { id: "rc5", source: "w-2", target: "s-1-s4", label: "reports", strokeStyle: "dashed" },
    ],
  },
});

/** H2.9 final 16:9 reference hints for appctx-architecture (R-7). */
const H2_APPCTX_16_9_HINTS_V2_RAW: DsLayoutHintsV2 = {
  vocabulary: "ds-layout-hints@2",
  mode: "stage-columns",
  aspect: "16:9",
  fanIn: "comb",
  grids: {
    root: {
      stage_columns: ["s-engram", "s-mesh"],
      transverse_bands: [{ id: "main", items: [entityRef("zone-engram"), entityRef("zone-cluster-mesh")] }],
      peripheral_columns: [
        { id: "sources", side: "start", items: [entityRef("zone-immo")] },
        { id: "clients", side: "end", items: [entityRef("actor-claude")] },
      ],
      cells: {
        [entityRef("zone-engram")]: { column: "s-engram" },
        [entityRef("zone-cluster-mesh")]: { column: "s-mesh" },
      },
    },
    [entityRef("zone-engram")]: {
      stage_columns: ["c-extract", "c-serve"],
      transverse_bands: [
        { id: "upper", items: [entityRef("zone-extractors"), entityRef("zone-assembly")] },
        { id: "lower", items: [entityRef("zone-mcp-server")] },
      ],
      cells: {
        [entityRef("zone-extractors")]: { column: "c-extract", to_band: "lower" },
        [entityRef("zone-assembly")]: { column: "c-serve" },
        [entityRef("zone-mcp-server")]: { column: "c-serve" },
      },
    },
  },
  stacks: {
    [entityRef("zone-immo")]: { axis: "column" },
    [entityRef("zone-extractors")]: { axis: "column" },
    [entityRef("zone-assembly")]: { axis: "column" },
    [entityRef("zone-mcp-server")]: { axis: "column" },
    [entityRef("zone-cluster-mesh")]: { axis: "column" },
  },
};
export const H2_APPCTX_16_9_HINTS_V2: DsLayoutHintsV2 = Object.freeze(H2_APPCTX_16_9_HINTS_V2_RAW);

export function buildH2Appctx16x9Fixture(
  architectureDocument: SemanticDocument,
  architectureView: ViewDocument,
): BrowserSafeH2Scene {
  const containers = Object.values(architectureDocument.entities)
    .filter((entity) => entity.type === "container")
    .map((entity) => entity.id)
    .sort();
  return {
    id: "appctx-architecture",
    document: architectureDocument,
    view: architectureView,
    presentation: architectureView.presentation.diagram as BrowserSafeH2Scene["presentation"],
    hintsV2: H2_APPCTX_16_9_HINTS_V2,
    hints: lowerLayoutHintsV2(H2_APPCTX_16_9_HINTS_V2),
    containers,
  };
}

export interface H2ResidualMeasurements {
  readonly sceneId: string;
  readonly paintedWidth: number;
  readonly paintedHeight: number;
  readonly aspectRatio: number;
  readonly deltaFrom16x9Pct: number;
  readonly conflictCount: number;
  readonly unplacedLabelCount: number;
  readonly obstructedCount: number;
  readonly combCount: number;
  readonly combFallbackCount: number;
  readonly paintedGapsAboveToken: number;
  readonly t09?: {
    readonly axCenterX: number;
    readonly spanMidpointX: number;
    readonly deltaX: number;
    readonly spanWidth: number;
    readonly r7CaptureOffsetPct: number;
  };
  readonly t49AndT50?: {
    readonly stackCenterY: number;
    readonly pathCenterY: number;
    readonly t49DeltaY: number;
    readonly sinkCenterX: number;
    readonly pathS5CenterX: number;
    readonly t50DeltaX: number;
    readonly sinkTopGapBelowPath: number;
    readonly sinkBottomInsideStack: boolean;
    readonly sinkBottomDeltaFromL6: number;
    readonly sinkCenterY: number;
    readonly l5l6CenterY: number;
    readonly t50DeltaFromL5L6CenterY: number;
  };
  readonly t37?: readonly {
    readonly sourceId: string;
    readonly triggerId: string;
    readonly sourceCenterY: number;
    readonly triggerCenterY: number;
    readonly deltaY: number;
  }[];
  readonly t45?: {
    readonly tierDeltaTop: number;
    readonly tierDeltaMid: number;
    readonly tierDeltaThird: number;
  };
}

function paintedBoundsOf(laidOut: Extract<LayoutResult, { status: "laid-out" }>): { width: number; height: number } {
  let xmin = Number.POSITIVE_INFINITY;
  let xmax = Number.NEGATIVE_INFINITY;
  let ymin = Number.POSITIVE_INFINITY;
  let ymax = Number.NEGATIVE_INFINITY;
  const addRect = (r: Rect) => {
    xmin = Math.min(xmin, r.x);
    xmax = Math.max(xmax, r.x + r.width);
    ymin = Math.min(ymin, r.y);
    ymax = Math.max(ymax, r.y + r.height);
  };
  for (const occ of Object.values(laidOut.view.entityOccurrences)) {
    if (occ.geometry.width > 0 || occ.geometry.height > 0) addRect(occ.geometry);
  }
  for (const rel of Object.values(laidOut.view.relationOccurrences)) {
    for (const pt of rel.waypoints ?? []) {
      xmin = Math.min(xmin, pt.x);
      xmax = Math.max(xmax, pt.x);
      ymin = Math.min(ymin, pt.y);
      ymax = Math.max(ymax, pt.y);
    }
  }
  for (const box of Object.values(laidOut.labelBoxes ?? {})) addRect(box);
  if (laidOut.linkLegend !== undefined) addRect(laidOut.linkLegend.rect);
  if (!Number.isFinite(xmin)) return { width: 0, height: 0 };
  return { width: xmax - xmin, height: ymax - ymin };
}

/**
 * Measure live geometry residuals for an H2 reference scene, including T-09
 * (schema-3), T-49 & T-50 (ref-3), T-37 (ref-1), and T-45 (ref-2).
 */
export function measureH2SceneResiduals(
  sceneId: string,
  laidOut: Extract<LayoutResult, { status: "laid-out" }>,
): H2ResidualMeasurements {
  const { width: paintedWidth, height: paintedHeight } = paintedBoundsOf(laidOut);
  const aspectRatio = paintedHeight > 0 ? paintedWidth / paintedHeight : 0;
  const target16x9 = 16 / 9;
  const deltaFrom16x9Pct = aspectRatio > 0 ? ((aspectRatio / target16x9) - 1) * 100 : 0;
  const geomOf = (local: string): Rect | undefined =>
    laidOut.view.entityOccurrences[occurrenceRef(`e.${local}`)]?.geometry;

  let t09: H2ResidualMeasurements["t09"];
  if (sceneId === "schema-3") {
    const rootGrid = laidOut.composition?.grids["root"];
    const s1 = rootGrid?.columns.find((c) => c.id === "s1");
    const s2 = rootGrid?.columns.find((c) => c.id === "s2");
    const ax = geomOf("ax");
    if (s1 !== undefined && s2 !== undefined && ax !== undefined) {
      const spanWidth = s2.start + s2.size - s1.start;
      const spanMidpointX = s1.start + spanWidth / 2;
      const axCenterX = ax.x + ax.width / 2;
      t09 = {
        axCenterX,
        spanMidpointX,
        deltaX: axCenterX - spanMidpointX,
        spanWidth,
        // Capture ref (H2-STEP0 T-09): ax 240..597 (mid 418.5) vs s1 40..395 & s2 430..785 (mid 412.5) -> +6/745 = +0.805%
        r7CaptureOffsetPct: ((418.5 - 412.5) / (785 - 40)) * 100,
      };
    }
  }

  let t49AndT50: H2ResidualMeasurements["t49AndT50"];
  if (sceneId === "ref-3") {
    const rootGrid = laidOut.composition?.grids["root"];
    const l1 = rootGrid?.bands.find((b) => b.id === "l1");
    const l5 = rootGrid?.bands.find((b) => b.id === "l5");
    const l6 = rootGrid?.bands.find((b) => b.id === "l6");
    const pathS5 = geomOf("path-s5");
    const sink = geomOf("sink");
    if (l1 !== undefined && l5 !== undefined && l6 !== undefined && pathS5 !== undefined && sink !== undefined) {
      const stackTop = l1.start;
      const stackBottom = l6.start + l6.size;
      const stackCenterY = (stackTop + stackBottom) / 2;
      const pathCenterY = pathS5.y + pathS5.height / 2;
      const sinkCenterX = sink.x + sink.width / 2;
      const pathS5CenterX = pathS5.x + pathS5.width / 2;
      const sinkCenterY = sink.y + sink.height / 2;
      const l5l6CenterY = (l5.start + (l6.start + l6.size)) / 2;
      const sinkBottomDeltaFromL6 = stackBottom - (sink.y + sink.height);
      t49AndT50 = {
        stackCenterY,
        pathCenterY,
        t49DeltaY: pathCenterY - stackCenterY,
        sinkCenterX,
        pathS5CenterX,
        t50DeltaX: sinkCenterX - pathS5CenterX,
        sinkTopGapBelowPath: sink.y - (pathS5.y + pathS5.height),
        sinkBottomInsideStack: sinkBottomDeltaFromL6 >= -1 / 64,
        sinkBottomDeltaFromL6,
        sinkCenterY,
        l5l6CenterY,
        t50DeltaFromL5L6CenterY: sinkCenterY - l5l6CenterY,
      };
    }
  }

  let t37: H2ResidualMeasurements["t37"];
  if (sceneId === "ref-1") {
    const pairs: readonly (readonly [string, string])[] = [
      ["source-a", "trigger-a"],
      ["source-b", "trigger-b"],
      ["source-c", "trigger-d"],
      ["source-d", "trigger-e"],
    ];
    const drifts: {
      readonly sourceId: string;
      readonly triggerId: string;
      readonly sourceCenterY: number;
      readonly triggerCenterY: number;
      readonly deltaY: number;
    }[] = [];
    for (const [sourceId, triggerId] of pairs) {
      const src = geomOf(sourceId);
      const trg = geomOf(triggerId);
      if (src !== undefined && trg !== undefined) {
        const sourceCenterY = src.y + src.height / 2;
        const triggerCenterY = trg.y + trg.height / 2;
        drifts.push({ sourceId, triggerId, sourceCenterY, triggerCenterY, deltaY: sourceCenterY - triggerCenterY });
      }
    }
    if (drifts.length > 0) t37 = drifts;
  }

  let t45: H2ResidualMeasurements["t45"];
  if (sceneId === "ref-2") {
    const t1s1 = geomOf("t1-s1");
    const t1s4 = geomOf("t1-s4");
    const t2s1 = geomOf("t2-s1");
    const t2s4 = geomOf("t2-s4");
    const t3s1 = geomOf("t3-s1");
    const t3s4 = geomOf("t3-s4");
    if (t1s1 && t1s4 && t2s1 && t2s4 && t3s1 && t3s4) {
      const cy = (r: Rect) => r.y + r.height / 2;
      t45 = {
        tierDeltaTop: cy(t1s4) - cy(t1s1),
        tierDeltaMid: cy(t2s4) - cy(t2s1),
        tierDeltaThird: cy(t3s4) - cy(t3s1),
      };
    }
  }

  return {
    sceneId,
    paintedWidth,
    paintedHeight,
    aspectRatio,
    deltaFrom16x9Pct,
    conflictCount: laidOut.routeSpacing?.conflictCount ?? 0,
    unplacedLabelCount: laidOut.warnings.filter((w) => w.code === "label-unplaced").length,
    obstructedCount: laidOut.warnings.filter((w) => w.code === "route-obstructed").length,
    combCount: laidOut.combGroups?.length ?? 0,
    combFallbackCount: laidOut.composition?.combFallbacks?.length ?? 0,
    paintedGapsAboveToken: laidOut.composition?.paintedGapsAboveToken?.length ?? 0,
    ...(t09 === undefined ? {} : { t09 }),
    ...(t49AndT50 === undefined ? {} : { t49AndT50 }),
    ...(t37 === undefined ? {} : { t37 }),
    ...(t45 === undefined ? {} : { t45 }),
  };
}
