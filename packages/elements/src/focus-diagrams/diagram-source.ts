import type { DiagramNode } from "@sentropic/focus";
import { validateSceneDocument, type SceneDocument } from "@sentropic/diagram-canvas/diagramSceneModel";
import { focusSceneBindings, focusSceneRegistry } from "./diagram-layout.js";
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

function isClosedScalarValue(value: unknown): boolean {
  if (!isRecord(value) || typeof value.kind !== "string") return false;
  switch (value.kind) {
    case "text":
    case "date":
    case "enum":
    case "reference":
      return closed(value, ["kind", "value"]) && typeof value.value === "string";
    case "boolean":
      return closed(value, ["kind", "value"]) && typeof value.value === "boolean";
    case "quantity":
      return closed(value, ["kind", "value", "unit"]) && typeof value.value === "number" && typeof value.unit === "string";
    default:
      return false;
  }
}

function isClosedAttributeValue(value: unknown): boolean {
  if (isClosedScalarValue(value)) return true;
  return closed(value, ["kind", "items"]) && value.kind === "collection" &&
    Array.isArray(value.items) && value.items.every(isClosedScalarValue);
}

function isClosedAttributes(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isClosedAttributeValue);
}

type Refuse = (message: string) => never;

const ALLOWED_FOCUS_PROFILES = new Set(["generic@1", "process@1"]);
const PROCESS_FLOW_EXTENSION_NAMESPACE = "sentropic:process-flow";

function fnv1a64(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let hash = 0xcbf2_9ce4_8422_2325n;
  const prime = 0x0000_0100_0000_01b3n;
  const mask = 0xffff_ffff_ffff_ffffn;
  for (const byte of bytes) {
    hash = ((hash ^ BigInt(byte)) * prime) & mask;
  }
  return `fnv1a64:${hash.toString(16).padStart(16, "0")}`;
}

function createProcessDirectionExtension(direction: "TB"): Record<string, unknown> {
  const source = JSON.stringify({ direction });
  return {
    namespace: PROCESS_FLOW_EXTENSION_NAMESPACE,
    schemaVersion: "1",
    scope: { kind: "document" },
    validation: "validated",
    contentHash: fnv1a64(source),
    source,
  };
}

/** Validate a Focus diagram scene against the allowlisted profiles via the diagram-canvas bridge. */
function checkScene(scene: Record<string, unknown>, refuse: Refuse): void {
  const fail = (reason?: string): never =>
    refuse(reason ?? "Unsupported diagram-core document: expected generic@1 or process@1 without views, geometry or layout hints");
  const { documentId, schemaVersion, revision, profileRefs, typeDefinitions, entities, relations, ports, resources, extensions } = scene;
  if (!closed(scene, ["documentId", "schemaVersion", "revision", "profileRefs", "typeDefinitions", "entities", "relations", "ports", "resources", "extensions"]) ||
      typeof documentId !== "string" || !documentId.startsWith("document:") ||
      !closed(schemaVersion, ["major", "minor"]) || schemaVersion.major !== 1 || schemaVersion.minor !== 1 ||
      typeof revision !== "number" || !Number.isInteger(revision) || revision < 0 ||
      !Array.isArray(profileRefs) || profileRefs.length !== 1 || typeof profileRefs[0] !== "string" || !ALLOWED_FOCUS_PROFILES.has(profileRefs[0]) ||
      !closed(typeDefinitions, []) || !closed(ports, []) || !closed(resources, []) ||
      !Array.isArray(extensions)) return fail();

  const profileId = profileRefs[0];
  if (profileId === "generic@1" && extensions.length !== 0) return fail();
  if (profileId === "process@1") {
    if (extensions.length > 1) return fail("Unsupported extension on process@1 scene");
    for (const ext of extensions) {
      if (!closed(ext, ["namespace", "schemaVersion", "scope", "validation", "contentHash", "source"]) ||
          ext.namespace !== PROCESS_FLOW_EXTENSION_NAMESPACE ||
          typeof ext.schemaVersion !== "string" ||
          !closed(ext.scope, ["kind"]) || ext.scope.kind !== "document" ||
          typeof ext.validation !== "string" ||
          typeof ext.contentHash !== "string" ||
          (ext.source !== undefined && typeof ext.source !== "string")) {
        return fail("Unsupported extension on process@1 scene");
      }
    }
  }
  if (!isRecord(entities) || !isRecord(relations)) return fail();
  const nodes = Object.entries(entities);
  const edges = Object.entries(relations);
  if (nodes.length === 0 || nodes.length > 80 || edges.length > 240) return fail();
  for (const [id, entity] of nodes) {
    if (!id.startsWith("entity:") || !closed(entity, ["id", "profile", "type", "attributes"]) ||
        typeof entity.id !== "string" || typeof entity.profile !== "string" || typeof entity.type !== "string" ||
        !isClosedAttributes(entity.attributes)) {
      return fail();
    }
  }
  for (const [id, relation] of edges) {
    if (!id.startsWith("relation:") || !closed(relation, ["id", "profile", "type", "endpoints", "attributes"]) ||
        typeof relation.id !== "string" || typeof relation.profile !== "string" || typeof relation.type !== "string" ||
        !Array.isArray(relation.endpoints) ||
        !relation.endpoints.every((endpoint: unknown) =>
          closed(endpoint, ["role", "target"]) && typeof endpoint.role === "string" && typeof endpoint.target === "string") ||
        !isClosedAttributes(relation.attributes)) {
      return fail();
    }
  }

  const diagnostics = validateSceneDocument(scene as unknown as SceneDocument, {
    registry: focusSceneRegistry,
    bindings: focusSceneBindings,
  });
  const errors = diagnostics.filter((item) => item.severity === "error");
  if (errors.length > 0) {
    throw new DossierDiagramError("", "diagram-source-unsupported", errors.map((d) => d.message).join("; "), errors);
  }
}

/** Accept the same declaration and labelled-edge grammar as the portable h2a builder. */
function parseFlowchart(source: string, id: string, refuse: Refuse): Record<string, unknown> {
  const lines = source.trim().split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("%%"));
  const header = /^flowchart (LR|TB|TD)$/.exec(lines.shift() ?? "");
  if (header === null) {
    refuse("Unsupported diagram: use ecosystem:<scene> or the documented Mermaid flowchart profile");
  }
  const direction = header[1];
  const entities: Record<string, unknown> = {};
  const relations: Record<string, unknown> = {};
  const pairCounts = new Map<string, number>();
  let edgeCount = 0;
  for (const line of lines) {
    const node = /^([a-z][a-z0-9_-]*)\["([^"<>\n]+)"\]$/.exec(line);
    const edge = /^([a-z][a-z0-9_-]*) -->\|([^|<>\n]+)\| ([a-z][a-z0-9_-]*)$/.exec(line);
    if (node !== null) {
      const entityId = `entity:${node[1]}`;
      if (Object.hasOwn(entities, entityId)) refuse(`Duplicate diagram node: ${node[1]}`);
      entities[entityId] = { id: entityId, profile: "process@1", type: "step", attributes: { name: { kind: "text", value: node[2] } } };
    } else if (edge !== null) {
      edgeCount += 1;
      const pairKey = `${edge[1]}.${edge[3]}`;
      const ordinal = (pairCounts.get(pairKey) ?? 0) + 1;
      pairCounts.set(pairKey, ordinal);
      const relationId = ordinal === 1 ? `relation:${pairKey}` : `relation:${pairKey}.${ordinal}`;
      relations[relationId] = {
        id: relationId, profile: "process@1", type: "transition",
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
    documentId: `document:${id}`,
    schemaVersion: { major: 1, minor: 1 },
    revision: 0,
    profileRefs: ["process@1"],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: direction === "TB" || direction === "TD" ? [createProcessDirectionExtension("TB")] : [],
  };
}

function validateCheckedScene(sectionId: string, scene: Record<string, unknown>, refuse: Refuse): void {
  try {
    checkScene(scene, refuse);
  } catch (error) {
    if (error instanceof DossierDiagramError && error.sectionId === "") {
      throw new DossierDiagramError(sectionId, error.code, error.message.replace(/^Diagram "": /, ""), error.diagnostics);
    }
    throw error;
  }
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
  validateCheckedScene(section.id, scene, refuse);
  return scene;
}

export function readDossierScene(sectionId: string, scene: unknown): SceneDocument {
  const refuse: Refuse = (message) => { throw new DossierDiagramError(sectionId, "diagram-source-unsupported", message); };
  if (!isRecord(scene)) return refuse("Expected a semantic scene object");
  validateCheckedScene(sectionId, scene, refuse);
  return scene as unknown as SceneDocument;
}
