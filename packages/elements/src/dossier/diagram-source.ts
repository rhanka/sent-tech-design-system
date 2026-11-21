import type { DiagramNode } from "@sentropic/focus";
import type { SemanticDocument } from "@sentropic/diagram-core";
import ecosystem from "./ecosystem.json" with { type: "json" };

export class DossierDiagramError extends Error {
  constructor(
    readonly sectionId: string,
    readonly code: "diagram-source-unsupported" | "diagram-layout-refused" | "diagram-views-invalid",
    message: string,
    readonly diagnostics: readonly unknown[] = [],
  ) {
    super(`Diagram "${sectionId}": ${message}`);
    this.name = "DossierDiagramError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function closed(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).every((key) => keys.includes(key));
}

function isText(value: unknown): value is { kind: "text"; value: string } {
  return closed(value, ["kind", "value"]) && value.kind === "text" && typeof value.value === "string";
}

type Refuse = (message: string) => never;

/** The portable Focus profile, bounded independently of diagram-core's full vocabulary. */
function checkScene(scene: Record<string, unknown>, refuse: Refuse): void {
  const fail = () => refuse("Unsupported diagram-core document: expected generic@1 nodes/containers, links and a containment tree without views, geometry or layout hints");
  const { schemaVersion, documentId, revision, profileRefs, typeDefinitions, entities, relations, ports, resources, extensions } = scene;
  if (!closed(scene, ["documentId", "schemaVersion", "revision", "profileRefs", "typeDefinitions", "entities", "relations", "ports", "resources", "extensions"]) ||
      typeof documentId !== "string" || !documentId.startsWith("document:") ||
      !closed(schemaVersion, ["major", "minor"]) || schemaVersion.major !== 1 || schemaVersion.minor !== 1 ||
      typeof revision !== "number" || !Number.isInteger(revision) || revision < 0 ||
      !Array.isArray(profileRefs) || profileRefs.length !== 1 || profileRefs[0] !== "generic@1" ||
      !closed(typeDefinitions, []) || !closed(ports, []) || !closed(resources, []) ||
      !Array.isArray(extensions) || extensions.length !== 0) fail();
  if (!isRecord(entities) || !isRecord(relations)) return fail();
  const nodes = Object.entries(entities);
  const edges = Object.entries(relations);
  if (nodes.length === 0 || nodes.length > 80 || edges.length > 240) fail();
  const containers = new Set<string>();
  for (const [id, entity] of nodes) {
    if (!id.startsWith("entity:") || !closed(entity, ["id", "profile", "type", "attributes"]) ||
        entity.id !== id || entity.profile !== "generic@1" || (entity.type !== "node" && entity.type !== "container") ||
        !closed(entity.attributes, ["name"]) || !isText(entity.attributes.name)) return fail();
    if (entity.type === "container") containers.add(id);
  }

  const parents = new Map<string, string>();
  for (const [id, relation] of edges) {
    if (!id.startsWith("relation:") || !closed(relation, ["id", "profile", "type", "endpoints", "attributes"]) ||
        relation.id !== id || relation.profile !== "generic@1" || (relation.type !== "link" && relation.type !== "contains") ||
        !Array.isArray(relation.endpoints) || relation.endpoints.length !== 2 ||
        !relation.endpoints.every((endpoint: unknown) => closed(endpoint, ["role", "target"])) ||
        !closed(relation.attributes, relation.type === "link" ? ["label"] : [])) return fail();
    const { endpoints, type, attributes } = relation;
    const first: unknown = endpoints.find((endpoint) => endpoint.role === (type === "link" ? "source" : "parent"))?.target;
    const second: unknown = endpoints.find((endpoint) => endpoint.role === (type === "link" ? "target" : "child"))?.target;
    if (typeof first !== "string" || typeof second !== "string" || !Object.hasOwn(entities, first) || !Object.hasOwn(entities, second)) return fail();
    if (type === "contains") {
      if (!containers.has(first) || parents.has(second)) fail();
      parents.set(second, first);
    } else if (attributes.label !== undefined && !isText(attributes.label)) fail();
  }
  for (const id of parents.keys()) {
    const visited = new Set<string>();
    for (let current: string | undefined = id; current !== undefined; current = parents.get(current)) {
      if (visited.has(current)) fail();
      visited.add(current);
    }
  }
}

/** Accept the same declaration and labelled-edge grammar as the portable h2a builder. */
function parseFlowchart(source: string, id: string, refuse: Refuse): Record<string, unknown> {
  const lines = source.trim().split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("%%"));
  if (!/^flowchart (LR|TB|TD)$/.test(lines.shift() ?? "")) {
    refuse("Unsupported diagram: use ecosystem:<scene> or the documented Mermaid flowchart profile");
  }
  const entities: Record<string, unknown> = {};
  const relations: Record<string, unknown> = {};
  let edgeCount = 0;
  for (const line of lines) {
    const node = /^([a-z][a-z0-9_-]*)\["([^"<>\n]+)"\]$/.exec(line);
    const edge = /^([a-z][a-z0-9_-]*) -->\|([^|<>\n]+)\| ([a-z][a-z0-9_-]*)$/.exec(line);
    if (node !== null) {
      const entityId = `entity:${node[1]}`;
      if (Object.hasOwn(entities, entityId)) refuse(`Duplicate diagram node: ${node[1]}`);
      entities[entityId] = { id: entityId, profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: node[2] } } };
    } else if (edge !== null) {
      const relationId = `relation:${edgeCount++}`;
      relations[relationId] = {
        id: relationId, profile: "generic@1", type: "link",
        endpoints: [{ role: "source", target: `entity:${edge[1]}` }, { role: "target", target: `entity:${edge[3]}` }],
        attributes: { label: { kind: "text", value: edge[2] } },
      };
    } else {
      refuse(`Unsupported flowchart line: ${line}`);
    }
  }
  if (Object.keys(entities).length === 0 || Object.keys(entities).length > 80 || edgeCount > 160) {
    refuse("Diagram needs 1–80 nodes and at most 160 edges");
  }
  return {
    documentId: `document:${id}`, schemaVersion: { major: 1, minor: 1 }, revision: 0,
    profileRefs: ["generic@1"], typeDefinitions: {}, entities, relations, ports: {}, resources: {}, extensions: [],
  };
}

export function resolveDossierScene(section: DiagramNode): Record<string, unknown> {
  const refuse: Refuse = (message) => { throw new DossierDiagramError(section.id, "diagram-source-unsupported", message); };
  if (section.sourceRef !== undefined) {
    return refuse(`Reference ${section.renderComponent} -> ${section.sourceRef} requires a host diagram resolver`);
  }
  let scene = section.scene;
  if (scene === undefined) {
    if (section.syntax !== "mermaid") return refuse("Unsupported diagram syntax: use Mermaid flowcharts or ecosystem references");
    if (section.source.startsWith("ecosystem:")) {
      const name = section.source.slice("ecosystem:".length);
      if (!Object.hasOwn(ecosystem.scenes, name)) return refuse(`Unknown ecosystem scene: ${name}`);
      scene = ecosystem.scenes[name as keyof typeof ecosystem.scenes].document;
    } else {
      scene = parseFlowchart(section.source, section.id, refuse);
    }
  }
  checkScene(scene, refuse);
  return scene;
}

export function readDossierScene(sectionId: string, scene: unknown): SemanticDocument {
  const refuse: Refuse = (message) => { throw new DossierDiagramError(sectionId, "diagram-source-unsupported", message); };
  if (!isRecord(scene)) return refuse("Expected a semantic scene object");
  checkScene(scene, refuse);
  return scene as unknown as SemanticDocument;
}
