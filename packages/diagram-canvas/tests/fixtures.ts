/**
 * One small diagram, built literally so every coordinate in the assertions is
 * readable, and VALIDATED by `diagram-core` in `tests/fixtures.test.ts`. That
 * validation is the point: a scene asserted over a state the model itself would
 * refuse proves nothing about the scene.
 *
 *   occurrence:oc   container C, z = -1, rect (0,0) 200x100   - below everything
 *   occurrence:oa   node A,      z =  1, rect (0,0)  40x20
 *   occurrence:ob   node B,      z =  0, rect (100,0) 40x20
 *   occurrence:pa   port on A, east, anchor 0.5  -> anchorPoint (40,10)
 *   occurrence:pb   port on B, west, anchor 0.5  -> anchorPoint (100,10)
 *   occurrence:e1   link r1, port pa -> port pb  (no waypoint)
 *   occurrence:e2   link r2, A -> B, one waypoint (70,-40)
 */
import {
  CURRENT_SCHEMA_VERSION,
  GENERIC_PROFILE_ID,
  createState,
  documentRef,
  entityRef,
  occurrenceRef,
  portRef,
  relationRef,
  viewRef,
  type DiagramState,
  type SemanticDocument,
  type ViewDocument,
  type ViewFilter,
} from "@sentropic/diagram-core";

export const DOC = documentRef("d1");
export const VIEW = viewRef("main");

export const ENTITY_A = entityRef("a");
export const ENTITY_B = entityRef("b");
export const ENTITY_C = entityRef("c");
export const PORT_A = portRef("pa");
export const PORT_B = portRef("pb");
export const REL_1 = relationRef("r1");
export const REL_2 = relationRef("r2");

export const OCC_A = occurrenceRef("oa");
export const OCC_B = occurrenceRef("ob");
export const OCC_C = occurrenceRef("oc");
export const OCC_PA = occurrenceRef("pa");
export const OCC_PB = occurrenceRef("pb");
export const OCC_E1 = occurrenceRef("e1");
export const OCC_E2 = occurrenceRef("e2");

export function sampleDocument(): SemanticDocument {
  return {
    documentId: DOC,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 3,
    profileRefs: [GENERIC_PROFILE_ID],
    typeDefinitions: {},
    entities: {
      [ENTITY_A]: {
        id: ENTITY_A,
        profile: GENERIC_PROFILE_ID,
        type: "node",
        attributes: { name: { kind: "text", value: "A" }, state: { kind: "enum", value: "active" } },
      },
      [ENTITY_B]: {
        id: ENTITY_B,
        profile: GENERIC_PROFILE_ID,
        type: "node",
        attributes: {
          name: { kind: "text", value: "B" },
          state: { kind: "enum", value: "draft" },
          tags: { kind: "collection", items: [{ kind: "text", value: "blue" }, { kind: "text", value: "green" }] },
        },
      },
      [ENTITY_C]: {
        id: ENTITY_C,
        profile: GENERIC_PROFILE_ID,
        type: "container",
        attributes: { name: { kind: "text", value: "C" } },
      },
    },
    relations: {
      [REL_1]: {
        id: REL_1,
        profile: GENERIC_PROFILE_ID,
        type: "link",
        endpoints: [
          { role: "source", target: PORT_A },
          { role: "target", target: PORT_B },
        ],
        attributes: {},
      },
      [REL_2]: {
        id: REL_2,
        profile: GENERIC_PROFILE_ID,
        type: "link",
        endpoints: [
          { role: "source", target: ENTITY_A },
          { role: "target", target: ENTITY_B },
        ],
        attributes: {},
      },
    },
    ports: {
      [PORT_A]: {
        id: PORT_A,
        profile: GENERIC_PROFILE_ID,
        type: "port",
        owner: ENTITY_A,
        name: "out",
        direction: "out",
        attributes: {},
      },
      [PORT_B]: {
        id: PORT_B,
        profile: GENERIC_PROFILE_ID,
        type: "port",
        owner: ENTITY_B,
        name: "in",
        direction: "in",
        attributes: {},
      },
    },
    resources: {},
    extensions: [],
  };
}

export interface SampleViewOverrides {
  readonly filters?: readonly ViewFilter[];
  readonly collapseGroup?: boolean;
}

export function sampleView(overrides: SampleViewOverrides = {}): ViewDocument {
  return {
    viewId: VIEW,
    semanticDocumentId: DOC,
    revision: 3,
    entityOccurrences: {
      [OCC_A]: { id: OCC_A, entity: ENTITY_A, geometry: { x: 0, y: 0, width: 40, height: 20 }, z: 1, group: "g1" },
      [OCC_B]: { id: OCC_B, entity: ENTITY_B, geometry: { x: 100, y: 0, width: 40, height: 20 }, z: 0 },
      [OCC_C]: { id: OCC_C, entity: ENTITY_C, geometry: { x: 0, y: 0, width: 200, height: 100 }, z: -1 },
    },
    relationOccurrences: {
      [OCC_E1]: {
        id: OCC_E1,
        relation: REL_1,
        endpoints: [
          { role: "source", occurrence: OCC_PA },
          { role: "target", occurrence: OCC_PB },
        ],
      },
      [OCC_E2]: {
        id: OCC_E2,
        relation: REL_2,
        endpoints: [
          { role: "source", occurrence: OCC_A },
          { role: "target", occurrence: OCC_B },
        ],
        waypoints: [{ x: 70, y: -40 }],
      },
    },
    portOccurrences: {
      [OCC_PA]: { id: OCC_PA, port: PORT_A, ownerOccurrence: OCC_A, side: "east", order: 0, anchor: 0.5 },
      [OCC_PB]: { id: OCC_PB, port: PORT_B, ownerOccurrence: OCC_B, side: "west", order: 0, anchor: 0.5 },
    },
    groups: { g1: { id: "g1", label: "Group one", ...(overrides.collapseGroup === true ? { collapsed: true } : {}) } },
    filters: overrides.filters ?? [],
    presentation: { camera: { x: 0, y: 0, zoom: 1 } },
  };
}

export function sampleState(overrides: SampleViewOverrides = {}): DiagramState {
  return createState(sampleDocument(), [sampleView(overrides)]);
}

/** How many occurrences the view holds, all three maps together. The conservation reference. */
export function occurrenceCount(view: ViewDocument): number {
  return (
    Object.keys(view.entityOccurrences).length +
    Object.keys(view.relationOccurrences).length +
    Object.keys(view.portOccurrences).length
  );
}
