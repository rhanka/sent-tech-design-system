// Generic sample content only: no organisation, product or person names.
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,
  occurrenceRef,
  relationRef,
  text,
  type SemanticDocument,
} from "@sentropic/diagram-core";

// generic@2 is the profile whose containers bind a fold group: under generic@1
// a folded container is drawn as a card while its members stay on the drawing.
const PROFILE = "generic@2";

/** [id, title, parent container id or null]. One root, so that the scene folds down to one card. */
const containers = [
  ["path", "Request path", null],
  ["ingestion", "Ingestion", "path"],
  ["processing", "Processing", "path"],
  ["storage", "Storage", "path"],
] as const;

/** [id, title, body, parent container id] */
const nodes = [
  ["client", "Client app", "Sends requests", "path"],
  ["gateway", "Gateway", "Receives requests", "ingestion"],
  ["validator", "Validator", "Checks the payload", "ingestion"],
  ["queue", "Queue", "Buffers the work", "processing"],
  ["worker", "Worker", "Runs each task", "processing"],
  ["database", "Database", "Keeps current records", "storage"],
  ["archive", "Archive", "Keeps old records", "storage"],
] as const;

const links = [
  ["client", "gateway", "sends request"],
  ["gateway", "validator", "forwards"],
  ["validator", "queue", "enqueues"],
  ["queue", "worker", "delivers"],
  ["worker", "database", "writes"],
  ["database", "archive", "archives"],
] as const;

const entity = (id: string, type: "node" | "container", name: string) =>
  [entityRef(id), { id: entityRef(id), profile: PROFILE, type, attributes: { name: text(name) } }] as const;

const contains = (parent: string, child: string) => {
  const id = relationRef(`contains.${child}`);
  return [id, {
    id, profile: PROFILE, type: "contains", attributes: {},
    endpoints: [{ role: "parent", target: entityRef(parent) }, { role: "child", target: entityRef(child) }],
  }] as const;
};

export const diagramDocument = {
  documentId: documentRef("apps-script-demo"),
  schemaVersion: CURRENT_SCHEMA_VERSION,
  revision: 1,
  profileRefs: [PROFILE],
  typeDefinitions: {},
  ports: {},
  resources: {},
  extensions: [],
  entities: Object.fromEntries([
    ...containers.map(([id, name]) => entity(id, "container", name)),
    ...nodes.map(([id, name]) => entity(id, "node", name)),
  ]),
  relations: Object.fromEntries([
    ...containers.flatMap(([id, , parent]) => (parent === null ? [] : [contains(parent, id)])),
    ...nodes.map(([id, , , parent]) => contains(parent, id)),
    ...links.map(([source, target, label], index) => {
      const id = relationRef(`link.${index + 1}`);
      return [id, {
        id, profile: PROFILE, type: "link", attributes: { label: text(label) },
        endpoints: [{ role: "source", target: entityRef(source) }, { role: "target", target: entityRef(target) }],
      }] as const;
    }),
  ]),
} satisfies SemanticDocument;

export const diagramPresentation = {
  contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
  legends: {},
  categoryTokens: [],
  entities: Object.fromEntries([
    ...containers.map(([id, name]) => [occurrenceRef(`e.${id}`), { form: "container" as const, text: { title: name } }]),
    ...nodes.map(([id, name, body]) => [occurrenceRef(`e.${id}`), { form: "card" as const, text: { title: name, body } }]),
  ]),
};

const folded = (...ids: (typeof containers)[number][0][]) => ids.map((id) => occurrenceRef(`e.${id}`));

/**
 * Fold states of the diagram, from the most detailed to a single card. The
 * page opens the first one that the figure can frame at its width (see
 * src/diagram-fit.ts): the component never draws below its readable scale,
 * it scrolls instead, so a narrow page starts with more containers folded.
 */
export const diagramFoldLevels = [
  folded(),
  folded("storage"),
  folded("ingestion", "processing", "storage"),
  folded("path", "ingestion", "processing", "storage"),
] as const;

export interface DecisionOption {
  id: string;
  title: string;
  summary: string;
  strengths: string[];
  limits: string[];
  effort: string;
  recommended: boolean;
}

export const options: DecisionOption[] = [
  {
    id: "a",
    title: "Option A — Direct calls",
    summary: "Each component calls the next one and waits for the answer.",
    strengths: ["Smallest number of parts", "Easy to trace a single request"],
    limits: ["A slow step slows every caller", "Peaks are not absorbed"],
    effort: "Low effort",
    recommended: false,
  },
  {
    id: "b",
    title: "Option B — Queue between steps",
    summary: "Work is placed in a queue and processed at the pace of the workers.",
    strengths: ["Absorbs peaks", "Steps can be scaled separately", "A failed task can be retried"],
    limits: ["One more part to operate", "Results arrive with a short delay"],
    effort: "Medium effort",
    recommended: true,
  },
  {
    id: "c",
    title: "Option C — Scheduled batches",
    summary: "Requests are collected and processed together at fixed times.",
    strengths: ["Predictable load", "Simple capacity planning"],
    limits: ["Results wait for the next run", "Large runs are hard to resume"],
    effort: "Medium effort",
    recommended: false,
  },
];

/** Sample scores out of 10, for illustration. */
export const criteriaScores = [
  { label: "Option A", value: 5.5, tone: "category1" as const },
  { label: "Option B", value: 8.2, tone: "category2" as const },
  { label: "Option C", value: 6.4, tone: "category3" as const },
];

export const criteria = [
  { name: "Resilience to peaks", a: 3, b: 9, c: 7 },
  { name: "Time to result", a: 9, b: 7, c: 3 },
  { name: "Ease of operation", a: 8, b: 6, c: 7 },
  { name: "Ability to scale", a: 4, b: 9, c: 6 },
];

/** Sample weekly volume, for illustration. */
export const weeklyVolume = [
  { x: "W1", y: 120 }, { x: "W2", y: 180 }, { x: "W3", y: 150 }, { x: "W4", y: 260 },
  { x: "W5", y: 240 }, { x: "W6", y: 320 }, { x: "W7", y: 300 }, { x: "W8", y: 410 },
];
