import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  documentRef,
  entityRef,
  lowerLayoutHintsV2,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  validateLayoutHintsV2,
  type DiagramPresentation,
  type DsLayoutHintsV2,
  type Entity,
  type EntityRef,
  type ExecutorProfileBindings,
  type LinkEmphasis,
  type OccurrenceRef,
  type ProfileRegistry,
  type Relation,
  type RelationPresentation,
  type SemanticDocument,
  type StrokeStyle,
  type ViewDocument,
} from "@sentropic/diagram-core";

import {
  createLayoutCache,
  type LayoutHints,
  type LayoutOptions,
  type LineMeasurer,
} from "../../../../src/index.js";
import type { AnatomyPinned, AlignPinned, DepthPinned } from "../../../../src/presentation/diagramCardModel.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../../../src/presentation/diagramCardModel.js";
import { H2_APPCTX_16_9_HINTS_V2, H2_GENERIC_SCENE_SPECS } from "../../../../test-support/h2ReferenceFixtures.js";
import { hCondInput } from "../../dc2a/h-cond.js";

export type H2Presentation = DiagramPresentation & {
  readonly entities: Readonly<Record<string, DiagramPresentation["entities"][string] & AnatomyPinned & AlignPinned & DepthPinned>>;
  readonly relations?: Readonly<Record<string, RelationPresentation>>;
};

export interface H2ReferenceScene {
  readonly id: string;
  readonly document: SemanticDocument;
  readonly presentation: H2Presentation;
  readonly sourceView?: ViewDocument;
  readonly hintsV2: DsLayoutHintsV2;
  readonly hints: LayoutHints;
  readonly registry: ProfileRegistry;
  readonly bindings: ExecutorProfileBindings;
  readonly measureLines: LineMeasurer;
  readonly containers: readonly EntityRef[];
  readonly carries: readonly string[];
}

export interface RawEntitySpec {
  readonly id: string;
  readonly container?: boolean;
  readonly parent?: string;
  readonly title?: string;
  readonly kicker?: string;
  readonly body?: string;
}

export interface RawRelationSpec {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly strokeStyle?: StrokeStyle;
  readonly arrowhead?: "arrow" | "none";
  readonly emphasis?: LinkEmphasis;
}

function resolveThisDir(): string {
  const url = import.meta.url;
  if (url.startsWith("file://")) {
    return dirname(fileURLToPath(url).replace(/^\/@fs(?=\/)/, ""));
  }
  const parsed = new URL(url);
  return dirname(parsed.pathname.replace(/^\/@fs(?=\/)/, ""));
}

const FIXTURE_DIR = resolve(resolveThisDir(), "../../../../../diagram-core/tests/fixtures/layout-hints-2");

export function loadCoreFixture(name: string): { carries: string[]; hints: DsLayoutHintsV2 } {
  const path = resolve(FIXTURE_DIR, `${name}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as { carries: string[]; hints: DsLayoutHintsV2 };
}

export function h2Measurer(): LineMeasurer {
  return cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));
}

export function buildGenericScene(spec: {
  readonly id: string;
  readonly entities: readonly RawEntitySpec[];
  readonly relations: readonly RawRelationSpec[];
  readonly hintsV2: DsLayoutHintsV2;
  readonly carries: readonly string[];
  readonly anatomy?: "v1" | "v2";
}): H2ReferenceScene {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const entityPresentations: Record<string, DiagramPresentation["entities"][string] & AnatomyPinned> = {};
  const relationPresentations: Record<string, RelationPresentation> = {};
  const containers: EntityRef[] = [];
  const anatomy = spec.anatomy ?? "v2";

  for (const item of spec.entities) {
    const ref = entityRef(item.id);
    const title = item.title ?? item.id.replaceAll("-", " ");
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type: item.container ? "container" : "node",
      attributes: { name: { kind: "text", value: title } },
    };
    if (item.container) containers.push(ref);
    const occ = occurrenceRef(`e.${item.id}`);
    entityPresentations[occ] = {
      form: item.container ? "container" : "card",
      anatomy,
      text: {
        title,
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

  const presentation: H2Presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: entityPresentations,
    legends: {},
    categoryTokens: [],
    ...(Object.keys(relationPresentations).length === 0 ? {} : { relations: relationPresentations }),
  };

  const diagnostics = validateLayoutHintsV2(spec.hintsV2);
  if (diagnostics.length > 0) {
    throw new Error(`Invalid H2 fixture hints for ${spec.id}: ${JSON.stringify(diagnostics)}`);
  }

  return {
    id: spec.id,
    document,
    presentation,
    hintsV2: spec.hintsV2,
    hints: lowerLayoutHintsV2(spec.hintsV2),
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureLines: h2Measurer(),
    containers: containers.sort(),
    carries: spec.carries,
  };
}

/** Enumerate all visible fold states (identical to figkit `foldStatesOf`). */
export function enumerateVisibleFoldStates(
  document: SemanticDocument,
  containers: readonly EntityRef[],
  sourceView?: ViewDocument,
): readonly (readonly OccurrenceRef[])[] {
  const parentOf = new Map<EntityRef, EntityRef>();
  for (const relation of Object.values(document.relations)) {
    if (relation.type !== "contains") continue;
    const parent = relation.endpoints.find((e) => e.role === "parent")?.target as EntityRef | undefined;
    const child = relation.endpoints.find((e) => e.role === "child")?.target as EntityRef | undefined;
    if (parent !== undefined && child !== undefined) parentOf.set(child, parent);
  }
  const occOf = (entity: EntityRef): OccurrenceRef => {
    if (sourceView !== undefined) {
      const found = Object.values(sourceView.entityOccurrences).find((occ) => occ.entity === entity);
      if (found !== undefined) return found.id;
    }
    const local = String(entity).replace(/^entity:/, "");
    return occurrenceRef(`e.${local}`);
  };
  const sorted = [...containers].sort();
  const childrenOf = new Map<EntityRef | undefined, EntityRef[]>();
  for (const entity of sorted) {
    let cursor = parentOf.get(entity);
    while (cursor !== undefined && !sorted.includes(cursor)) cursor = parentOf.get(cursor);
    const list = childrenOf.get(cursor) ?? [];
    list.push(entity);
    childrenOf.set(cursor, list);
  }
  const combine = (nodes: readonly EntityRef[]): OccurrenceRef[][] => {
    let states: OccurrenceRef[][] = [[]];
    for (const node of nodes) {
      const occ = occOf(node);
      const foldedChoice: OccurrenceRef[][] = [[occ]];
      const expandedChoices = combine(childrenOf.get(node) ?? []);
      const nodeChoices = [...expandedChoices, ...foldedChoice];
      const next: OccurrenceRef[][] = [];
      for (const prefix of states) {
        for (const suffix of nodeChoices) {
          next.push([...prefix, ...suffix].sort());
        }
      }
      states = next;
    }
    return states;
  };
  return combine(childrenOf.get(undefined) ?? []);
}

function buildSceneFromSpec(id: string): H2ReferenceScene {
  const fixture = loadCoreFixture(id);
  const spec = H2_GENERIC_SCENE_SPECS[id]!;
  return buildGenericScene({
    id,
    carries: fixture.carries,
    hintsV2: fixture.hints,
    entities: spec.entities,
    relations: spec.relations,
  });
}

export function buildExampleA(): H2ReferenceScene {
  return buildSceneFromSpec("schema-13");
}

export function buildExampleB(): H2ReferenceScene {
  return buildSceneFromSpec("schema-3");
}

export function buildFigkitTwins(): readonly H2ReferenceScene[] {
  return (
    ["archi-metier", "archi-applicative", "archi-technologique", "retro-a", "retro-b", "retro-c"] as const
  ).map(buildSceneFromSpec);
}

export function buildStructureOnlyScenes(): readonly H2ReferenceScene[] {
  return (["schema-1", "schema-6", "ref-1", "ref-2", "ref-3"] as const).map(buildSceneFromSpec);
}

export function buildAppctxArchitecture16x9(): H2ReferenceScene {
  const base = hCondInput("architecture", false);
  const r7View: ViewDocument = {
    ...base.view,
    presentation: {
      ...base.view.presentation,
      anatomy: "v2",
    },
  };
  const hintsV2 = H2_APPCTX_16_9_HINTS_V2;
  const diagnostics = validateLayoutHintsV2(hintsV2);
  if (diagnostics.length > 0) {
    throw new Error(`Invalid appctx-architecture H2 hints: ${JSON.stringify(diagnostics)}`);
  }
  const containers = Object.values(base.document.entities)
    .filter((entity) => entity.type === "container")
    .map((entity) => entity.id)
    .sort();
  return {
    id: "appctx-architecture",
    document: base.document,
    sourceView: r7View,
    presentation: r7View.presentation.diagram as H2Presentation,
    hintsV2,
    hints: lowerLayoutHintsV2(hintsV2),
    registry: base.registry,
    bindings: base.bindings,
    measureLines: base.measureLines,
    containers,
    carries: ["REQ-R7-22"],
  };
}

/** All 13 whole-figure §2.1 scenes in deterministic order. */
export function buildAll13ReferenceScenes(): readonly H2ReferenceScene[] {
  return [
    buildExampleA(),
    buildExampleB(),
    ...buildFigkitTwins(),
    ...buildStructureOnlyScenes(),
  ];
}

/** The H2.5/H2.7 fold-gated reference corpus: Examples A, B, 6 figkit twins (38 states), composed appctx-architecture. */
export function buildGatedReferenceCorpus(): readonly H2ReferenceScene[] {
  return [
    buildExampleA(),
    buildExampleB(),
    ...buildFigkitTwins(),
    buildAppctxArchitecture16x9(),
  ];
}

export interface ZeroConflictGateReport {
  readonly totalStates: number;
  readonly composedStates: number;
  readonly auditedStates: number;
  readonly combStates: number;
  readonly failures: readonly string[];
}

/**
 * Evaluate the blocking zero-conflict gate across every visible fold state of `scenes`.
 * Every state MUST run on the `@2` composition path (`composition` defined) AND the DE-2
 * route-spacing audit (`routeSpacing` defined, zero `v1-path` comb fallbacks) with
 * `conflicts === 0`, `label-unplaced === 0`, and `route-obstructed === 0`.
 */
export function runZeroConflictGate(
  scenes: readonly H2ReferenceScene[],
  extraOptions?: Partial<LayoutOptions>,
): ZeroConflictGateReport {
  let totalStates = 0;
  let composedStates = 0;
  let auditedStates = 0;
  let combStates = 0;
  const failures: string[] = [];

  for (const scene of scenes) {
    const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
    const cache = createLayoutCache({ maxEntries: 128 });
    for (const collapsed of states) {
      totalStates += 1;
      const key = collapsed.join(",");
      const res = cache.layout(
        scene.document,
        {
          registry: scene.registry,
          bindings: scene.bindings,
          presentation: scene.presentation,
          measureLines: scene.measureLines,
          measureText: () => ({ width: 80, height: 20 }),
          targetWidth: 1440,
          hints: scene.hints,
          collapsed,
          ...extraOptions,
        },
        scene.sourceView,
      );
      if (res.status !== "laid-out") {
        failures.push(`${scene.id}[${key}]: refused (${JSON.stringify(res.refusals)})`);
        continue;
      }
      if (res.composition === undefined) {
        failures.push(`${scene.id}[${key}]: composition-missing (not on @2 composition path)`);
      } else {
        composedStates += 1;
      }
      if (res.routeSpacing === undefined) {
        failures.push(`${scene.id}[${key}]: routeSpacing-missing (v1 path — route-spacing audit did not run)`);
      } else {
        auditedStates += 1;
      }
      if ((res.combGroups?.length ?? 0) > 0) {
        combStates += 1;
      }
      const v1CombFallbacks = res.warnings.filter(
        (w) => w.code === "comb-fallback" && w.details?.reason === "v1-path",
      );
      if (v1CombFallbacks.length > 0) {
        failures.push(`${scene.id}[${key}]: comb-v1-fallback=${v1CombFallbacks.length}`);
      }
      const conflicts = res.routeSpacing?.conflictCount ?? 0;
      const unplaced = res.warnings.filter((w) => w.code === "label-unplaced").length;
      const obstructed = res.warnings.filter((w) => w.code === "route-obstructed").length;
      if (conflicts > 0 || unplaced > 0 || obstructed > 0) {
        failures.push(
          `${scene.id}[${key}]: conflicts=${conflicts} (${res.routeSpacing?.conflicts.map((c) => `${c.kind}:${c.routes.join("+")}`).join("; ") ?? ""}) label-unplaced=${unplaced} obstructed=${obstructed}`,
        );
      }
    }
  }

  return { totalStates, composedStates, auditedStates, combStates, failures };
}

/**
 * Deliberately conflicting `@2` + r7 fixture used to prove the zero-conflict gate
 * is non-vacuous: 6 distinct-style links cross a fixed 96px zone gutter whose
 * capacity is 1 under tight `routeSpacing`/`routeBorderClearance`, producing
 * deterministic `channel-capacity-exceeded` conflicts in `res.routeSpacing`.
 */
export function buildDeliberatelyConflictingComposedScene(): {
  readonly scene: H2ReferenceScene;
  readonly extraOptions: Partial<LayoutOptions>;
} {
  const hintsV2: DsLayoutHintsV2 = {
    vocabulary: "ds-layout-hints@2",
    mode: "stage-columns",
    grids: {
      root: {
        stage_columns: ["s1", "s2"],
        transverse_bands: [{ id: "r1", items: [entityRef("left-zone"), entityRef("right-zone")] }],
        cells: {
          [entityRef("left-zone")]: { column: "s1" },
          [entityRef("right-zone")]: { column: "s2" },
        },
      },
    },
    stacks: {
      [entityRef("left-zone")]: { axis: "column" },
      [entityRef("right-zone")]: { axis: "column" },
    },
  };
  const scene = buildGenericScene({
    id: "deliberate-conflict-probe",
    carries: ["REQ-R7-13"],
    hintsV2,
    entities: [
      { id: "left-zone", container: true, title: "Left Zone" },
      { id: "l1", parent: "left-zone", title: "L1" },
      { id: "l2", parent: "left-zone", title: "L2" },
      { id: "right-zone", container: true, title: "Right Zone" },
      { id: "r1", parent: "right-zone", title: "R1" },
      { id: "r2", parent: "right-zone", title: "R2" },
    ],
    relations: [
      { id: "c1", source: "l1", target: "r2", strokeStyle: "solid" },
      { id: "c2", source: "l1", target: "r2", strokeStyle: "dashed" },
      { id: "c3", source: "l1", target: "r2", strokeStyle: "dotted" },
      { id: "c4", source: "l2", target: "r1", strokeStyle: "solid", emphasis: "emphasis" },
      { id: "c5", source: "l2", target: "r1", strokeStyle: "dashed", emphasis: "emphasis" },
      { id: "c6", source: "l2", target: "r1", arrowhead: "none" },
    ],
  });
  return {
    scene,
    extraOptions: { metrics: { routeSpacing: 36, routeBorderClearance: 36 } },
  };
}
