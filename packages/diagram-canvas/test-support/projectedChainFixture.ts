import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  m3ProfileRegistry,
  shippedExecutorBindings,
  type DiagramPresentation,
  type Entity,
  type EntityRef,
  type OccurrenceRef,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import type { LineMeasurer } from "@sentropic/diagram-canvas";

/**
 * E1 projected-model fixture (REQ-R7-19): a static generic scene in the
 * projected-model shape a `projectArchiCards`-style projection emits —
 * a `generic@2` semantic document, a typed presentation (compact `v2`
 * anatomy, `icon: "none"`), DE-2 link-style words, and a declaration
 * ordering — with no dependency on any upstream model owner.
 *
 * Shape: outer zone `project` holds inner zone `workstream` beside card
 * `handoff`; inner zone holds cards `parser`, `planner`, `renderer`.
 * Three distinct link styles drive the automatic right-anchored legend.
 * Names are generic; nothing here describes a client.
 */
export const PROJECTED_CHAIN_ZONES = ["project", "workstream"] as const;
export const PROJECTED_CHAIN_CARDS = ["parser", "planner", "renderer", "handoff"] as const;
export const PROJECTED_CHAIN_IDS = ["project", "workstream", ...PROJECTED_CHAIN_CARDS] as const;

/**
 * Pinned fixture measurer: fixed advance per character, no font metrics.
 * Every E1 chain pass and every host shares this one reference, so the
 * parity pins compare the same numbers. The package import above keeps
 * this file (imported by the Svelte and Vue suites) from dragging
 * `diagram-canvas/src` into another package's `rootDir`.
 */
export const projectedChainMeasure: LineMeasurer = Object.assign(
  (request: Parameters<LineMeasurer>[0]) => ({
    lines: [request.text],
    width: request.text.length * 8,
    height: request.role === "flow-badge" ? 20 : 24,
    overflow: false,
  }),
  { version: "projected-chain-fixture-v1" },
);

const entityId = (id: string) => (`entity:${id}`) as Entity["id"];
const occurrenceId = (id: string) => (`occurrence:e.${id}`) as OccurrenceRef;
const relationId = (id: string) => (`relation:${id}`) as Relation["id"];

export interface ProjectedChainFixture {
  readonly document: SemanticDocument;
  readonly presentation: DiagramPresentation;
  readonly registry: typeof m3ProfileRegistry;
  readonly bindings: typeof shippedExecutorBindings;
  readonly measureLines: LineMeasurer;
  /** Root declaration order: outer zone first, then the beside card. */
  readonly rootOrder: readonly EntityRef[];
  /** Per-zone child declaration order, keyed by zone entity id. */
  readonly ordering: Readonly<Record<EntityRef, readonly EntityRef[]>>;
  /** The foldable inner zone occurrence. */
  readonly foldOccurrence: string;
}

export function projectedChainFixture(): ProjectedChainFixture {
  const containers = new Set<string>(["project", "workstream"]);
  const parentOf: Readonly<Record<string, string>> = {
    workstream: "project",
    parser: "workstream",
    planner: "workstream",
    renderer: "workstream",
    handoff: "project",
  };
  const titleOf = (id: string): string =>
    ({
      project: "Project",
      workstream: "Workstream",
      parser: "Parser",
      planner: "Planner",
      renderer: "Renderer",
      handoff: "Handoff",
    })[id] ?? id;

  const entities: Record<string, Entity> = {};
  for (const id of PROJECTED_CHAIN_IDS) {
    entities[entityId(id)] = {
      id: entityId(id),
      profile: "generic@2",
      type: containers.has(id) ? "container" : "node",
      attributes: { name: { kind: "text", value: titleOf(id) } },
    };
  }

  const relations: Record<string, Relation> = {};
  for (const [child, parent] of Object.entries(parentOf)) {
    const id = relationId(`contains.${child}`);
    relations[id] = {
      id,
      profile: "generic@2",
      type: "contains",
      attributes: {},
      endpoints: [
        { role: "parent", target: entityId(parent) },
        { role: "child", target: entityId(child) },
      ],
    };
  }
  const links: readonly (readonly [string, string, string, string])[] = [
    ["lnk-feed", "parser", "planner", "feeds"],
    ["lnk-drive", "planner", "renderer", "drives"],
    ["lnk-handoff", "parser", "handoff", "hands off"],
  ];
  for (const [id, source, target, label] of links) {
    const rid = relationId(id);
    relations[rid] = {
      id: rid,
      profile: "generic@2",
      type: "link",
      attributes: { label: { kind: "text", value: label } },
      endpoints: [
        { role: "source", target: entityId(source) },
        { role: "target", target: entityId(target) },
      ],
    };
  }

  const document: SemanticDocument = {
    documentId: "document:projected-chain" as SemanticDocument["documentId"],
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

  const textOf = (id: string) => {
    if (id === "project") return { kicker: "PROJECT", title: "Project", subtitle: "Two levels deep" };
    if (id === "workstream") return { kicker: "WORKSTREAM", title: "Workstream", subtitle: "Inner zone" };
    if (id === "parser") return { title: "Parser", body: "Reads the note" };
    if (id === "planner") return { title: "Planner", body: "Orders the work" };
    if (id === "renderer") return { title: "Renderer", body: "Draws the scene" };
    return { title: "Handoff", body: "Passes it on" };
  };

  const presentation: DiagramPresentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    legends: {},
    categoryTokens: [],
    entities: Object.fromEntries(
      PROJECTED_CHAIN_IDS.map((id) => [
        occurrenceId(id),
        {
          form: containers.has(id) ? ("container" as const) : ("card" as const),
          icon: "none" as const,
          anatomy: "v2" as const,
          text: textOf(id),
        },
      ]),
    ),
    // DE-2 link words: three distinct styles for the automatic legend.
    relations: {
      [relationId("lnk-feed")]: { strokeStyle: "solid", arrowhead: "arrow" },
      [relationId("lnk-drive")]: {
        strokeStyle: "dashed",
        arrowhead: "filled-triangle",
        emphasis: "emphasis",
      },
      [relationId("lnk-handoff")]: { strokeStyle: "dotted", arrowhead: "open-triangle" },
    },
  } as unknown as DiagramPresentation;

  return {
    document,
    presentation,
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureLines: projectedChainMeasure,
    rootOrder: ["entity:project"] as EntityRef[],
    ordering: {
      "entity:project": ["entity:workstream", "entity:handoff"],
      "entity:workstream": ["entity:parser", "entity:planner", "entity:renderer"],
    } as Record<EntityRef, EntityRef[]>,
    foldOccurrence: "occurrence:e.workstream",
  };
}
