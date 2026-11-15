import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings,
  type DiagramPresentation, type Entity, type OccurrenceRef, type Relation, type RelationOccurrence, type SemanticDocument, type ViewDocument } from "@sentropic/diagram-core";

/**
 * An ontology drawn as an entity-relationship view: a system zone holds an
 * ontology zone, the ontology zone holds the class cards, and every relation
 * joins two classes INSIDE those two nested zones. It is the shape a consumer
 * reported with relation labels and no connector line: each route runs under
 * the opaque surface of both zones for its whole length.
 *
 * The document is `generic@2`, as that consumer's views are: a pure `erd@1`
 * document has no zone (`layoutErd` packs entity cards flat), so an ontology
 * grouped in zones is always a `generic@2` container tree.
 *
 * `outside` adds one card beside the ontology zone, joined to a class, so a
 * route also has to leave the nested zone.
 */
export const NESTED_ZONE_CLASSES = ["session", "reading", "query", "pack", "turn", "reply", "call", "verdict", "result", "sweep"] as const;

/** `[source, target, label]`, by class name. */
export const NESTED_ZONE_LINKS: readonly (readonly [string, string, string])[] = [
  ["session", "reading", "reads"],
  ["session", "query", "opens"],
  ["query", "pack", "yields"],
  ["session", "turn", "records"],
  ["turn", "reply", "follows"],
  ["reply", "call", "invokes"],
  ["call", "result", "returns"],
  ["turn", "verdict", "issues"],
  ["result", "sweep", "starts"],
];

export interface NestedZoneRelation {
  /** Relation occurrence id, as the connector carries it. */
  readonly occurrence: OccurrenceRef;
  /** The two cards the connector joins, source first. */
  readonly ends: readonly [OccurrenceRef, OccurrenceRef];
  readonly label: string;
}

export function nestedZoneFixture(config: { outside?: boolean } = {}) {
  const entity = (id: string) => ("entity:" + id) as Entity["id"];
  const occurrence = (id: string) => ("occurrence:" + id) as OccurrenceRef;
  const classes = NESTED_ZONE_CLASSES.map((name) => "cls-" + name);
  const outside = config.outside === true ? ["ext-registry"] : [];
  const parents: Record<string, string> = { "ont-session": "sys-memory",
    ...Object.fromEntries(classes.map((id) => [id, "ont-session"])),
    ...Object.fromEntries(outside.map((id) => [id, "sys-memory"])) };
  const containers = ["sys-memory", "ont-session"];
  const links = [...NESTED_ZONE_LINKS.map(([from, to, label]) => ["cls-" + from, "cls-" + to, label] as const),
    ...outside.map((id) => ["cls-session", id, "registers"] as const)];

  const entities: Record<string, Entity> = {};
  for (const id of [...containers, ...classes, ...outside]) {
    entities[entity(id)] = { id: entity(id), profile: "generic@2", type: containers.includes(id) ? "container" : "node",
      attributes: { name: { kind: "text", value: id } } };
  }
  const relations: Record<string, Relation> = {};
  for (const [child, parent] of Object.entries(parents)) {
    const id = ("relation:contains-" + child) as Relation["id"];
    relations[id] = { id, profile: "generic@2", type: "contains", attributes: {},
      endpoints: [{ role: "parent", target: entity(parent) }, { role: "child", target: entity(child) }] };
  }
  const expected: NestedZoneRelation[] = [];
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  links.forEach(([source, target, label], index) => {
    const local = "lnk-" + String(index + 1).padStart(2, "0");
    const id = ("relation:" + local) as Relation["id"];
    relations[id] = { id, profile: "generic@2", type: "link",
      endpoints: [{ role: "source", target: entity(source) }, { role: "target", target: entity(target) }],
      attributes: { label: { kind: "text", value: label }, weight: { kind: "quantity", unit: "unit", value: 1 } } };
    relationOccurrences[occurrence(local)] = { id: occurrence(local), relation: id,
      endpoints: [{ role: "source", occurrence: occurrence(source) }, { role: "target", occurrence: occurrence(target) }] };
    expected.push({ occurrence: occurrence(local), ends: [occurrence(source), occurrence(target)], label });
  });
  const document: SemanticDocument = { documentId: "document:nested-zones" as SemanticDocument["documentId"],
    schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, profileRefs: ["generic@2"], typeDefinitions: {},
    entities, relations, ports: {}, resources: {}, extensions: [] };

  const text = (id: string) => id === "sys-memory"
    ? { kicker: "SYSTEM", title: "memory", subtitle: "Sessions and context", footer: "repo: memory" }
    : id === "ont-session"
      ? { kicker: "ONTOLOGY · MEMORY", title: "session@1", subtitle: `${classes.length} classes`, footer: "repo: memory" }
      : { kicker: id.startsWith("ext-") ? "SERVICE" : "CLASS · SESSION@1", title: id.replace(/^(cls|ext)-/, ""),
        body: "id, sessionId, index", detail: "kind, state · +2", footer: "repo: memory" };
  const presentation: DiagramPresentation = { contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN }, legends: {}, categoryTokens: [],
    entities: Object.fromEntries([...containers, ...classes, ...outside].map((id) => [occurrence(id),
      { form: containers.includes(id) ? "container" as const : "card" as const,
        icon: id === "sys-memory" ? "db" : id === "ont-session" ? "graph" : "document", text: text(id) }])) };

  const view: ViewDocument = {
    viewId: "view:nested-zones" as ViewDocument["viewId"], semanticDocumentId: document.documentId, revision: 1,
    entityOccurrences: Object.fromEntries([...containers, ...classes, ...outside].map((id) => [occurrence(id), {
      id: occurrence(id), entity: entity(id), geometry: { x: 0, y: 0, width: 460, height: 200 }, z: 0,
      ...(parents[id] === undefined ? {} : { group: "grp." + parents[id] }) }])),
    relationOccurrences, portOccurrences: {},
    groups: Object.fromEntries(containers.map((id) => ["grp." + id, { id: "grp." + id, label: text(id).title, collapsed: false,
      occurrence: occurrence(id), ...(parents[id] === undefined ? {} : { parent: "grp." + parents[id] }) }])),
    filters: [], presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram: presentation },
  };
  return { document, view, presentation, registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
    zones: containers.map(occurrence), cards: [...classes, ...outside].map(occurrence), relations: expected };
}
