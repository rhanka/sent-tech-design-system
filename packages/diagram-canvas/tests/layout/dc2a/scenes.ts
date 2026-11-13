/**
 * DC-2a acceptance scenes (SPEC_EVOL_DC2A §1.3, §9.2): loader and layout call.
 *
 * Each case folder under `fixtures/` holds the exported `<case>.semantic.json`
 * (`archi@1`, kept as the retained source of record) and `<case>.views.json`.
 * The layout engine lays out `generic@1`/`generic@2` documents only, so the
 * harness acts as the host adapter: for one view it builds a `generic@2`
 * document from the view's `cards[]` (containment from `parentId`, forms from
 * `container`, texts from the card slots), its links from `edges[]` (endpoints
 * read from the exported relation occurrences), the fold state from
 * `cards[].folded` and the reading order from the `cards[]` array order (§6.4).
 * Legends are not part of `cards[]` and are not drawn by this harness. Copied
 * grid geometry is input documentation, never pinned output.
 */
import { readFileSync } from "node:fs";

import {
  CURRENT_SCHEMA_VERSION,
  m3ProfileRegistry,
  shippedExecutorBindings,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,

  occurrenceRef,
  relationRef,
  type DiagramForm,
  type DiagramPresentation,
  type Entity,
  type EntityRef,
  type OccurrenceRef,
  type PresentationText,
  type Relation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import {
  layoutDocument,
  relationRoute,
  type LayoutHints,
  type LayoutOptions,
  type LayoutWarning,
  type LineLayout,
  type LineMeasurer,
  type MeasureRequest,
  type Rect,
  type TextRole,
  type Vec2,
} from "../../../src/index.js";
import { measure } from "../fixtures.js";

/** The ten cleared, non-confidential cases (fixtures/README.md). Nothing else is ever copied. */
export const CASE_IDS = [
  "vue-globale",
  "ajout-preprod",
  "migration-cluster-mesh",
  "case-a",
  "case-b",
  "case-c",
  "case-d",
  "case-skills-r9",
  "case-integration-r9",
  "case-trackfocus-r9",
] as const;
export type CaseId = (typeof CASE_IDS)[number];

interface CaseCard {
  readonly id: string;
  readonly container: boolean;
  readonly folded: boolean;
  readonly parentId: string | null;
  readonly kicker: string | null;
  readonly title: string | null;
  readonly purpose: string | null;
  readonly detail: string | null;
  readonly footer: string | null;
}
interface CaseEdge {
  readonly id: string;
  readonly source: unknown;
  readonly target: unknown;
  readonly label: string | null;
}
interface CaseView {
  readonly cards: readonly CaseCard[];
  readonly edges: readonly CaseEdge[];
  readonly view: {
    readonly relationOccurrences: Readonly<
      Record<string, { readonly endpoints: readonly { readonly role: string; readonly occurrence: string }[] }>
    >;
  };
}
interface CaseFile {
  readonly caseId: string;
  readonly views: Readonly<Record<string, CaseView>>;
}

/** Folding hides members on the `generic@2` container family (M1-c projection). */
const GENERIC2 = "generic@2" as const;

const FIXTURES = new URL("./fixtures/", import.meta.url);
const files = new Map<string, CaseFile>();

export function loadCase(caseId: CaseId): CaseFile {
  let file = files.get(caseId);
  if (file === undefined) {
    file = JSON.parse(readFileSync(new URL(`${caseId}/${caseId}.views.json`, FIXTURES), "utf8")) as CaseFile;
    files.set(caseId, file);
  }
  return file;
}

export const viewNamesOf = (caseId: CaseId): string[] => Object.keys(loadCase(caseId).views);

/**
 * Pinned test `LineMeasurer` (§7.5): fixed advances and line heights per role,
 * word wrapping on spaces. Advances approximate the DS card typography
 * (kicker 22 px, title 32 px, body/detail/footer 24 px, edge label 18 px).
 *
 * The edge-label line box is the shipped one: token
 * `diagramScene.edgeLabelLineHeight` (22 px), which the Svelte
 * `cardLineMeasurer` returns for the `edge-label` role. `tokens.test.ts` pins
 * this table against the token, so the harness cannot measure a label
 * thinner than production does.
 */
export const PINNED_ADVANCE: Readonly<Record<TextRole, number>> = {
  kicker: 12,
  title: 17,
  body: 13,
  detail: 13,
  footer: 13,
  subtitle: 13,
  "legend-label": 13,
  "edge-label": 10,
};
export const PINNED_LINE_HEIGHT: Readonly<Record<TextRole, number>> = {
  kicker: 29,
  title: 42,
  body: 31,
  detail: 31,
  footer: 31,
  subtitle: 31,
  "legend-label": 31,
  "edge-label": 22,
};

export const pinnedMeasurer: LineMeasurer = (request: MeasureRequest): LineLayout => {
  const advance = PINNED_ADVANCE[request.role];
  const capacity = Math.max(1, Math.floor(request.availableWidth / advance));
  const lines: string[] = [];
  let current = "";
  for (const word of request.text.split(" ").filter((part) => part.length > 0)) {
    const next = current === "" ? word : `${current} ${word}`;
    if (next.length <= capacity || current === "") current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== "" || lines.length === 0) lines.push(current);
  return {
    lines,
    width: Math.max(...lines.map((line) => line.length * advance)),
    height: lines.length * PINNED_LINE_HEIGHT[request.role],
    overflow: lines.length > request.allocatedLines,
  };
};

export const occurrenceOf = (local: string): OccurrenceRef => occurrenceRef(`e.${local}`);

export interface SceneInput {
  readonly caseId: CaseId;
  readonly viewName: string;
  readonly document: SemanticDocument;
  readonly presentation: DiagramPresentation;
  readonly collapsed: readonly OccurrenceRef[];
  /** `ordering` per expanded parent and the root order, both from `cards[]` array order. */
  readonly ordering: Readonly<Record<EntityRef, readonly EntityRef[]>>;
  readonly rootOrder: readonly EntityRef[];
  readonly cards: readonly CaseCard[];
  /** Card ids not hidden by a collapsed ancestor, in `cards[]` order. */
  readonly visible: readonly string[];
  /** Visible leaf cards and visible collapsed containers (DEC-7). */
  readonly leaves: readonly string[];
  readonly links: readonly { readonly id: string; readonly source: string; readonly target: string; readonly label?: string }[];
}

const localOfOccurrence = (occurrence: string): string => occurrence.replace(/^occurrence:o-/, "");

/**
 * The layout input of one view. `alsoFolded` folds more containers of that
 * view than its export does, keeping its edges: the engine then has to hide
 * the relations internal to a folded container and project the others (#203).
 */
export function sceneInput(caseId: CaseId, viewName: string, alsoFolded: readonly string[] = []): SceneInput {
  const view = loadCase(caseId).views[viewName];
  if (view === undefined) throw new Error(`unknown view ${caseId}/${viewName}`);
  // A fold collapses the container and every container under it, as the
  // exported folded views do: the projection hides the members of a collapsed group.
  const under = (card: CaseCard): boolean => {
    for (let current: CaseCard | undefined = card; current !== undefined; current = view.cards.find((other) => other.id === current!.parentId)) {
      if (alsoFolded.includes(current.id)) return true;
    }
    return false;
  };
  const cards = view.cards.map((card) => (card.container && under(card) ? { ...card, folded: true } : card));
  const byId = new Map(cards.map((card) => [card.id, card] as const));
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const forms: Record<string, { form: DiagramForm; text: PresentationText }> = {};
  const ordering: Record<string, EntityRef[]> = {};
  const rootOrder: EntityRef[] = [];
  for (const card of cards) {
    const ref = entityRef(card.id);
    entities[ref] = {
      id: ref,
      profile: GENERIC2,
      type: card.container ? "container" : "node",
      attributes: { name: { kind: "text", value: card.title ?? card.id } },
    };
    const text: Record<string, string> = {};
    if (card.kicker !== null) text["kicker"] = card.kicker;
    if (card.title !== null) text["title"] = card.title;
    if (card.purpose !== null) text[card.container ? "subtitle" : "body"] = card.purpose;
    if (card.detail !== null) text["detail"] = card.detail;
    if (card.footer !== null) text["footer"] = card.footer;
    forms[occurrenceOf(card.id)] = { form: card.container ? "container" : "card", text: text as PresentationText };
    if (card.parentId === null) {
      rootOrder.push(ref);
      continue;
    }
    if (!byId.has(card.parentId)) throw new Error(`${caseId}/${viewName}: ${card.id} has no parent card ${card.parentId}`);
    const parent = entityRef(card.parentId);
    (ordering[parent] ??= []).push(ref);
    const relation = relationRef(`contains.${card.id}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC2,
      type: "contains",
      endpoints: [
        { role: "parent", target: parent },
        { role: "child", target: ref },
      ],
      attributes: {},
    };
  }
  const links: { id: string; source: string; target: string; label?: string }[] = [];
  for (const edge of view.edges) {
    const occurrence = view.view.relationOccurrences[`occurrence:e-${edge.id}`];
    const end = (role: "source" | "target"): string | undefined => {
      const exported = occurrence?.endpoints.find((endpoint) => endpoint.role === role)?.occurrence;
      if (exported !== undefined) return localOfOccurrence(exported);
      const raw = edge[role];
      return typeof raw === "string" ? raw : undefined;
    };
    const source = end("source");
    const target = end("target");
    if (source === undefined || target === undefined || !byId.has(source) || !byId.has(target)) {
      throw new Error(`${caseId}/${viewName}: edge ${edge.id} has an unresolved endpoint`);
    }
    const relation = relationRef(`link.${edge.id}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC2,
      type: "link",
      endpoints: [
        { role: "source", target: entityRef(source) },
        { role: "target", target: entityRef(target) },
      ],
      attributes: edge.label === null ? {} : { label: { kind: "text", value: edge.label } },
    };
    links.push({ id: edge.id, source, target, ...(edge.label === null ? {} : { label: edge.label }) });
  }
  const hidden = (card: CaseCard): boolean => {
    for (let parent = card.parentId; parent !== null; parent = byId.get(parent)?.parentId ?? null) {
      if (byId.get(parent)?.folded === true) return true;
    }
    return false;
  };
  const visible = cards.filter((card) => !hidden(card)).map((card) => card.id);
  const leaves = visible.filter((id) => {
    const card = byId.get(id)!;
    return !card.container || card.folded;
  });
  return {
    caseId,
    viewName,
    document: {
      documentId: documentRef(`dc2a-${caseId}-${viewName}`),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC2],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    },
    presentation: {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: forms,
      legends: {},
      categoryTokens: [],
    },
    // Every folded container is a collapsed occurrence, nested ones included,
    // exactly as the exported view marks its groups: the projection then hides
    // the whole subtree of a folded container.
    collapsed: cards
      .filter((card) => card.container && card.folded)
      .map((card) => occurrenceOf(card.id)),
    ordering,
    rootOrder,
    cards,
    visible,
    leaves,
    links,
  };
}

export interface SceneLayout {
  readonly input: SceneInput;
  readonly view: ViewDocument;
  readonly warnings: readonly LayoutWarning[];
  readonly channels?: readonly import("../../../src/layout/channels.js").LayoutChannel[];
  readonly bundles?: Readonly<Record<string, { readonly members: readonly string[] }>>;
  /** Emitted rectangles of the visible cards, keyed by card id. */
  readonly rects: ReadonlyMap<string, Rect>;
  /** Placement parent (nearest expanded visible ancestor) of each visible card. */
  readonly parentOf: ReadonlyMap<string, string | undefined>;
  readonly routes: readonly { readonly id: string; readonly source: string; readonly target: string; readonly points: readonly Vec2[] }[];
  /** Label boxes emitted by the engine, keyed by relation occurrence id. */
  readonly labelBoxes: ReadonlyMap<string, Rect>;
  /** Text of every labelled route, placed or not, keyed like `labelBoxes`. */
  readonly labelTexts: ReadonlyMap<string, string>;
  /** Title band of every expanded container (inset 16, measured header height), keyed by card id. */
  readonly titleBands: ReadonlyMap<string, Rect>;
  readonly orientations: Readonly<Record<string, "rows" | "columns">>;
}

/** The pinned viewport of the DC-2a harness: 1440 × 810 CSS px (16:9). */
export const FRAME = { width: 1440, height: 810 } as const;

export function layScene(input: SceneInput, extra: Partial<LayoutOptions> = {}, hints: LayoutHints = {}): SceneLayout {
  const result = layoutDocument(input.document, {
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureText: measure,
    targetWidth: FRAME.width,
    presentation: input.presentation,
    measureLines: pinnedMeasurer,
    collapsed: input.collapsed,
    hints: { ordering: input.ordering, ...hints },
    ...extra,
  });
  if (result.status !== "laid-out") throw new Error(`${input.caseId}/${input.viewName} refused: ${JSON.stringify(result.refusals)}`);
  const view = result.view;
  const byId = new Map(input.cards.map((card) => [card.id, card] as const));
  const rects = new Map<string, Rect>();
  const parentOf = new Map<string, string | undefined>();
  // The engine stamps `z` on every occurrence it places: its visible set must
  // be exactly the harness's (cards not hidden by a collapsed ancestor).
  const placed = Object.values(view.entityOccurrences)
    .filter((occurrence) => occurrence.z !== undefined)
    .map((occurrence) => occurrence.id as string)
    .sort();
  const expected = input.visible.map((id) => occurrenceOf(id) as string).sort();
  if (JSON.stringify(placed) !== JSON.stringify(expected)) {
    throw new Error(`${input.caseId}/${input.viewName}: engine placed ${placed.length} occurrences, harness expects ${expected.length}`);
  }
  for (const id of input.visible) {
    const occurrence = view.entityOccurrences[occurrenceOf(id)];
    if (occurrence === undefined) throw new Error(`${input.caseId}/${input.viewName}: no occurrence for ${id}`);
    rects.set(id, { ...occurrence.geometry });
    parentOf.set(id, byId.get(id)!.parentId ?? undefined);
  }
  const localOf = (occurrence: string): string => occurrence.replace(/^occurrence:e\./, "");
  const routes: { id: string; source: string; target: string; points: readonly Vec2[] }[] = [];
  const labelTexts = new Map<string, string>();
  const titleBands = new Map<string, Rect>();
  for (const id of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[id]!;
    if (occurrence.waypoints === undefined) continue;
    const points = relationRoute(view, id as OccurrenceRef) ?? [];
    const end = (role: string): string =>
      localOf(occurrence.endpoints.find((endpoint) => endpoint.role === role)?.occurrence ?? "");
    routes.push({ id, source: end("source"), target: end("target"), points });
    const label = (input.document.relations[occurrence.relation]?.attributes as Record<string, { value?: unknown }>)["label"]?.value;
    if (typeof label === "string") labelTexts.set(id, label);
  }
  // Title band of each expanded container: inset 16, measured header height.
  for (const header of result.measurements?.headers ?? []) {
    const id = localOf(header.occurrence);
    const card = byId.get(id);
    const rect = rects.get(id);
    if (card === undefined || rect === undefined || !card.container || card.folded) continue;
    titleBands.set(id, { x: rect.x, y: rect.y, width: rect.width, height: 16 + header.height });
  }
  // Label boxes are the ones the engine emits (`LayoutResult.labelBoxes`).
  const labelBoxes = new Map<string, Rect>(Object.entries(result.labelBoxes ?? {}).map(([id, box]) => [id, { ...box }] as const));
  return {
    input,
    view,
    warnings: result.warnings,
    channels: result.channels ?? [],
    ...(result.edgeBundles === undefined ? {} : { bundles: result.edgeBundles }),
    rects,
    parentOf,
    routes,
    labelBoxes,
    labelTexts,
    titleBands,
    orientations: result.orientations ?? {},
  };
}
