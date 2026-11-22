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

import type { LayoutHints, LineMeasurer } from "../../../../src/index.js";
import type { AnatomyPinned, AlignPinned, DepthPinned } from "../../../../src/presentation/diagramCardModel.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../../../src/presentation/diagramCardModel.js";
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

export function buildExampleA(): H2ReferenceScene {
  const fixture = loadCoreFixture("schema-13");
  return buildGenericScene({
    id: "schema-13",
    carries: fixture.carries,
    hintsV2: fixture.hints,
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
  });
}

export function buildExampleB(): H2ReferenceScene {
  const fixture = loadCoreFixture("schema-3");
  return buildGenericScene({
    id: "schema-3",
    carries: fixture.carries,
    hintsV2: fixture.hints,
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
  });
}

export function buildFigkitTwins(): readonly H2ReferenceScene[] {
  const metier = loadCoreFixture("archi-metier");
  const applicative = loadCoreFixture("archi-applicative");
  const techno = loadCoreFixture("archi-technologique");
  const retroA = loadCoreFixture("retro-a");
  const retroB = loadCoreFixture("retro-b");
  const retroC = loadCoreFixture("retro-c");

  return [
    buildGenericScene({
      id: "archi-metier",
      carries: metier.carries,
      hintsV2: metier.hints,
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
    }),
    buildGenericScene({
      id: "archi-applicative",
      carries: applicative.carries,
      hintsV2: applicative.hints,
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
    }),
    buildGenericScene({
      id: "archi-technologique",
      carries: techno.carries,
      hintsV2: techno.hints,
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
    }),
    buildGenericScene({
      id: "retro-a",
      carries: retroA.carries,
      hintsV2: retroA.hints,
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
    }),
    buildGenericScene({
      id: "retro-b",
      carries: retroB.carries,
      hintsV2: retroB.hints,
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
    }),
    buildGenericScene({
      id: "retro-c",
      carries: retroC.carries,
      hintsV2: retroC.hints,
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
    }),
  ];
}

export function buildStructureOnlyScenes(): readonly H2ReferenceScene[] {
  const schema1 = loadCoreFixture("schema-1");
  const schema6 = loadCoreFixture("schema-6");
  const ref1 = loadCoreFixture("ref-1");
  const ref2 = loadCoreFixture("ref-2");
  const ref3 = loadCoreFixture("ref-3");

  return [
    buildGenericScene({
      id: "schema-1",
      carries: schema1.carries,
      hintsV2: schema1.hints,
      entities: [
        { id: "before", container: true, title: "Before" },
        { id: "before-a", parent: "before", title: "Step 1" },
        { id: "before-b", parent: "before", title: "Step 2" },
        { id: "before-c", parent: "before", title: "Side Check" },
        { id: "before-d", parent: "before", title: "Step 3" },
        { id: "after", container: true, title: "After" },
        { id: "after-a", parent: "after", title: "Step 1" },
        { id: "after-b", parent: "after", title: "Guard 1" },
        { id: "after-c", parent: "after", title: "Guard 2" },
        { id: "after-d", parent: "after", title: "Step 3" },
        { id: "after-e", parent: "after", title: "Guard 3" },
      ],
      relations: [
        { id: "s1-1", source: "before-a", target: "before-b", label: "next" },
        { id: "s1-2", source: "before-b", target: "before-d", label: "next" },
        { id: "s1-3", source: "after-b", target: "after-c", label: "checks" },
        { id: "s1-4", source: "after-c", target: "after-e", label: "checks" },
      ],
    }),
    buildGenericScene({
      id: "schema-6",
      carries: schema6.carries,
      hintsV2: schema6.hints,
      entities: [
        { id: "notch-1", title: "Level 1" },
        { id: "notch-2", title: "Level 2" },
        { id: "notch-3", title: "Level 3" },
        { id: "notch-4", title: "Level 4" },
        { id: "notch-5", title: "Level 5" },
        { id: "notch-6", title: "Level 6" },
        { id: "notch-7", title: "Level 7" },
        { id: "tool-1", title: "Tool 1" },
        { id: "tool-2", title: "Tool 2" },
        { id: "tool-3", title: "Tool 3" },
        { id: "tool-4", title: "Tool 4" },
        { id: "tool-5", title: "Tool 5" },
        { id: "tool-6", title: "Tool 6" },
        { id: "tool-7", title: "Tool 7" },
        { id: "tool-8", title: "Tool 8" },
        { id: "target-a", title: "Target Alpha" },
        { id: "target-b", title: "Target Beta" },
      ],
      relations: [
        { id: "s6-1", source: "tool-3", target: "target-a", label: "delivers" },
        { id: "s6-2", source: "tool-4", target: "target-a", label: "delivers" },
        { id: "s6-3", source: "tool-5", target: "target-a", label: "delivers" },
        { id: "s6-4", source: "tool-6", target: "target-b", label: "feeds", strokeStyle: "dashed" },
      ],
    }),
    buildGenericScene({
      id: "ref-1",
      carries: ref1.carries,
      hintsV2: ref1.hints,
      entities: [
        { id: "source-a", title: "Source A" },
        { id: "source-b", title: "Source B" },
        { id: "source-c", title: "Source C" },
        { id: "source-d", title: "Source D" },
        { id: "host", container: true, title: "Pipeline Host" },
        { id: "trigger-a", parent: "host", title: "Trigger A" },
        { id: "trigger-b", parent: "host", title: "Trigger B" },
        { id: "trigger-c", parent: "host", title: "Trigger C" },
        { id: "trigger-d", parent: "host", title: "Trigger D" },
        { id: "trigger-e", parent: "host", title: "Trigger E" },
        { id: "engine", container: true, parent: "host", title: "Engine" },
        { id: "step-1", parent: "engine", title: "Step 1" },
        { id: "step-2", parent: "engine", title: "Step 2" },
        { id: "step-3", parent: "engine", title: "Step 3" },
        { id: "storage", container: true, parent: "host", title: "Storage" },
        { id: "store-a", parent: "storage", title: "Primary" },
        { id: "store-b", parent: "storage", title: "Index" },
        { id: "store-c", parent: "storage", title: "Shard 1" },
        { id: "store-d", parent: "storage", title: "Shard 2" },
        { id: "exposure", parent: "host", title: "Exposure" },
        { id: "transverse", parent: "host", title: "Governance" },
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
    }),
    buildGenericScene({
      id: "ref-2",
      carries: ref2.carries,
      hintsV2: ref2.hints,
      entities: [
        { id: "t1-s1", title: "Tier 1 Col 1" },
        { id: "t1-s2", title: "Tier 1 Col 2" },
        { id: "t1-s3", title: "Tier 1 Col 3" },
        { id: "t1-s4", title: "Tier 1 Col 4" },
        { id: "t2-s1", title: "Tier 2 Col 1" },
        { id: "t2-s2", title: "Tier 2 Col 2" },
        { id: "t2-s3", title: "Tier 2 Col 3" },
        { id: "t2-s4", title: "Tier 2 Col 4" },
        { id: "t3-s1", title: "Tier 3 Col 1" },
        { id: "t3-s2", title: "Tier 3 Col 2" },
        { id: "t3-s3", title: "Tier 3 Col 3" },
        { id: "t3-s4", title: "Tier 3 Col 4" },
        { id: "transverse", title: "Shared Foundation" },
      ],
      relations: [
        { id: "rf2-1", source: "t1-s1", target: "t1-s2", label: "calls" },
        { id: "rf2-2", source: "t2-s1", target: "t2-s2", label: "uses" },
        { id: "rf2-3", source: "t3-s1", target: "t3-s2", label: "reads", strokeStyle: "dashed" },
      ],
    }),
    buildGenericScene({
      id: "ref-3",
      carries: ref3.carries,
      hintsV2: ref3.hints,
      entities: [
        { id: "source-l1", title: "Source 1" },
        { id: "source-l2", title: "Source 2" },
        { id: "source-l3", title: "Source 3" },
        { id: "source-l4", title: "Source 4" },
        { id: "source-l5", title: "Source 5" },
        { id: "source-l6", title: "Source 6" },
        { id: "path-s2", title: "Queue" },
        { id: "path-s3", title: "Filter" },
        { id: "path-s4", title: "Router" },
        { id: "path-s5", title: "Dispatcher" },
        { id: "sink", title: "Dead Letter" },
        { id: "note", title: "Flow Notes" },
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
    }),
  ];
}

export function buildAppctxArchitecture16x9(): H2ReferenceScene {
  const base = hCondInput("architecture", false);
  const hintsV2: DsLayoutHintsV2 = {
    vocabulary: "ds-layout-hints@2",
    mode: "stage-columns",
    aspect: "16:9",
    fanIn: "comb",
    grids: {
      root: {
        stage_columns: ["s-engram", "s-mesh"],
        transverse_bands: [
          { id: "main", items: [entityRef("zone-engram"), entityRef("zone-cluster-mesh")] },
        ],
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
    sourceView: base.view,
    presentation: base.presentation as H2Presentation,
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
