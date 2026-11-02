/**
 * Shared headless-witness harness for the CL-4a agent-bridge witnesses (spec
 * §8 CL-4 witnesses 2/4/9 and the §4.10 receipt-identity witness).
 *
 * Test-only: every patch body runs against (a) the in-memory double source
 * and (b) the CL-3c Hocuspocus-backed source with the provider label asserted
 * in the run. The bridge double stays headless (no bound editor mounted while
 * patching); authoritative outcomes are asserted on the source's document
 * (content via `captureDocumentFromField`, state vector, delete set) and, for
 * "every replica" witnesses, on at least two replica docs synced from it.
 */
import * as Y from "yjs";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type {
  FullInlineSegment,
  RichTextBlock,
  RichTextDocument,
  RichTextFormat,
} from "./model.js";
import type {
  AgentAffectedOperation,
  AgentDocumentState,
  AgentEditOperation,
  AgentPatch,
  AgentPatchKey,
  AgentPatchProfile,
  FullBlockMetadata,
  InlineMarkKey,
  RelativeAnchor,
  RichTextInlineMarks,
} from "./collaboration.js";
import type { FormattingIntentDraft } from "./editor-collaboration.js";
import {
  appendProvenanceDraft,
  createAgentBridgeDouble,
  createAgentBridgeReceiptStore,
  type AgentBridgeDouble,
  type AgentBridgeReceiptStore,
} from "./collab-agent-bridge.test-support.js";
import {
  coveredItemIdentities,
  tryResolveAnchorToLinear,
} from "./collab-selection.js";
import {
  openHocuspocusTestSession,
  type HocuspocusTestDriver,
} from "./collab-hocuspocus-source.test-support.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

export const P0 = "focus.markdown.p0@1" as const;

/** Full-profile format constant for the CL-4d1 witnesses. */
export const FULL: RichTextFormat = "ds.markdown.full@1";

/** Every operation family of the full profile (scope mechanism stays B-BRIDGE-3). */
export const FULL_FAMILIES: readonly AgentEditOperation["type"][] = [
  "insert",
  "insertHardBreak",
  "delete",
  "mark",
  "splitParagraph",
  "mergeWithPrevious",
  "setBlockMetadata",
  "insertHorizontalRule",
  "deleteHorizontalRule",
];

/** One full text run (marks carried directly, never re-serialised). */
export function ftext(text: string, marks?: RichTextInlineMarks): FullInlineSegment {
  return { type: "text", text, marks: marks ?? {} };
}

/** One full text-like paragraph with its complete metadata record. */
export function fullPara(
  id: string,
  segments: readonly FullInlineSegment[] = [],
  metadata?: FullBlockMetadata,
): RichTextBlock {
  return {
    paragraphId: id,
    kind: "paragraph",
    metadata: metadata ?? (canonicalPlainMetadata() as FullBlockMetadata),
    segments,
  } as RichTextBlock;
}

/** One horizontal-rule block (wrapper metadata only, never blockKind family). */
export function fullHr(id: string, hrMetadata?: FullBlockMetadata): RichTextBlock {
  const block: RichTextBlock = { paragraphId: id, kind: "horizontalRule" };
  if (hrMetadata !== undefined) block.hrMetadata = hrMetadata;
  return block;
}

/** One full document for seeding (retained run sources restored verbatim). */
export function fullDoc(
  blocks: readonly RichTextBlock[],
  retainedRunMetadata?: RichTextDocument["retainedRunMetadata"],
): RichTextDocument {
  return {
    format: FULL,
    blocks,
    ...(retainedRunMetadata === undefined ? {} : { retainedRunMetadata }),
  };
}

/** Authoritative full capture of one field (metadata and mark runs included). */
export function captureFullDoc(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKey: string,
): RichTextDocument {
  const binding = source.resolveBinding({ documentId, sessionId, fieldKey });
  return captureDocumentFromField(binding.text, binding.fieldMeta, FULL).document;
}

/** One captured block by paragraph id (undefined when absent). */
export function fullBlockById(doc: RichTextDocument, paragraphId: string): RichTextBlock | undefined {
  return doc.blocks.find((block) => block.paragraphId === paragraphId);
}

/** Full captures of replica docs (converged or not — the caller compares). */
export function replicaFullDocs(replicas: readonly Y.Doc[], fieldKey: string): RichTextDocument[] {
  return replicas.map((replica) => {
    const text = replica.getText(fieldTextName(fieldKey));
    const meta = replica.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>;
    return captureDocumentFromField(text, meta, FULL).document;
  });
}

/** R-REV-2 affected-items record of one patch by its complete key. */
export function storeRecordOf(
  store: AgentBridgeReceiptStore,
  key: AgentPatchKey,
): AgentBridgeReceiptStore["records"][string] | undefined {
  const keyString = JSON.stringify([key.documentId, key.actorId, key.sessionEpoch, key.patchId]);
  return store.records[keyString];
}

/** The mark operation entry of a stored patch record (undefined when absent). */
export function storeMarkOperationOf(
  store: AgentBridgeReceiptStore,
  key: AgentPatchKey,
): AgentAffectedOperation | undefined {
  return storeRecordOf(store, key)?.operations.find((entry) => entry.kind === "mark");
}

/** Reopen the bridge over an existing store (restart; durable semantics stay CL-4c). */
export function reopenBridge(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKeys: readonly string[],
  store: AgentBridgeReceiptStore,
  families: readonly AgentEditOperation["type"][] = FULL_FAMILIES,
  profile: AgentPatchProfile = "full",
): AgentBridgeDouble {
  return createAgentBridgeDouble({
    source,
    documentId,
    sessionId,
    fieldKeys,
    families,
    store,
    profile,
  });
}

function resolveHumanAnchor(ytext: Y.Text, fieldKey: string, anchor: RelativeAnchor, what: string): number {
  const resolved = tryResolveAnchorToLinear(ytext, anchor);
  if (resolved === null) {
    throw new Error(`rich-text.full-witness-human: ${what} anchor does not resolve on ${fieldKey}`);
  }
  return resolved;
}

/** Human mark through the real paths: driver transaction plus the store sink. */
export function recordHumanMark(
  driver: AgentWitnessDriver,
  store: AgentBridgeReceiptStore,
  documentId: string,
  sessionId: string,
  input: {
    fieldKey: string;
    mark: InlineMarkKey;
    value: true | string | null;
    startAnchor: RelativeAnchor;
    endAnchor: RelativeAnchor;
    actorId: string;
    transactionId: string;
  },
): void {
  const binding = driver.source.resolveBinding({
    documentId,
    sessionId,
    fieldKey: input.fieldKey,
  });
  const ytext = binding.text;
  const low = Math.min(
    resolveHumanAnchor(ytext, input.fieldKey, input.startAnchor, "human mark start"),
    resolveHumanAnchor(ytext, input.fieldKey, input.endAnchor, "human mark end"),
  );
  const high = Math.max(
    resolveHumanAnchor(ytext, input.fieldKey, input.startAnchor, "human mark start"),
    resolveHumanAnchor(ytext, input.fieldKey, input.endAnchor, "human mark end"),
  );
  ytext.doc?.transact(() => {
    if (high > low) {
      ytext.format(low, high - low, { [input.mark]: input.value } as Record<string, unknown>);
    }
  });
  const draft: FormattingIntentDraft = {
    intentId: `${input.transactionId}:${input.mark}`,
    actorId: input.actorId,
    source: { kind: "human-transaction", transactionId: input.transactionId },
    fieldKey: input.fieldKey,
    mark: input.mark,
    value: input.value,
    range: { start: input.startAnchor, end: input.endAnchor },
    items: coveredItemIdentities(ytext, low, high),
  };
  appendProvenanceDraft(store, draft);
}

/** Human metadata write through a driver transaction (no provenance intent: metadata carries none). */
export function writeHumanMetadata(
  driver: AgentWitnessDriver,
  documentId: string,
  sessionId: string,
  fieldKey: string,
  paragraphId: string,
  record: FullBlockMetadata,
): void {
  const binding = driver.source.resolveBinding({ documentId, sessionId, fieldKey });
  const doc = binding.text.doc;
  if (doc === null) throw new Error("rich-text.full-witness-human: field has no doc");
  doc.transact(() => {
    binding.fieldMeta.set(paragraphId, structuredClone(record) as unknown);
  });
}

export function p0Para(paragraphId: string, text: string): RichTextDocument["blocks"][number] {
  return { paragraphId, kind: "paragraph", text } as never;
}

export function p0Doc(blocks: RichTextDocument["blocks"]): RichTextDocument {
  return { format: P0, blocks };
}

/** Concatenated paragraph texts of a captured document (P0). */
export function capturedTexts(captured: { document: RichTextDocument }): string[] {
  return captured.document.blocks.map((block) =>
    block.kind === "paragraph" ? ((block as { text?: string }).text ?? "") : `<${block.kind}>`,
  );
}

/** The identical driver surface for both provider runs. */
export interface AgentWitnessDriver {
  readonly label: "in-memory-double" | "hocuspocus";
  readonly source: LiveSessionBindingSource;
  /** Observed human edit on the authoritative document (seen by the bridge). */
  remoteTransact(
    fieldKey: string,
    fn: (text: Y.Text, fieldMeta: Y.Map<unknown>) => void,
  ): Promise<void>;
  close(): Promise<void>;
}

export async function openInMemoryAgentDriver(
  documentId: string,
  sessionId: string,
  fields: readonly string[],
): Promise<AgentWitnessDriver> {
  const provider = createInMemoryTestDoubleProvider();
  const source = provider.openSession(documentId, sessionId, fields);
  return {
    label: "in-memory-double",
    source,
    remoteTransact: async (fieldKey, fn) => {
      const binding = source.resolveBinding({ documentId, sessionId, fieldKey });
      binding.text.doc?.transact(() => {
        fn(binding.text, binding.fieldMeta);
      });
    },
    close: async () => {},
  };
}

export async function openAgentDriver(
  kind: "in-memory-double" | "hocuspocus",
  documentId: string,
  sessionId: string,
  fields: readonly string[],
): Promise<AgentWitnessDriver> {
  if (kind === "in-memory-double") {
    return openInMemoryAgentDriver(documentId, sessionId, fields);
  }
  const driver: HocuspocusTestDriver = await openHocuspocusTestSession({
    documentId,
    sessionId,
    fields: [...fields],
  });
  return {
    label: "hocuspocus",
    source: driver.source,
    remoteTransact: driver.remoteTransact,
    close: driver.close,
  };
}

export function seedAgentField(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKey: string,
  document: RichTextDocument,
): void {
  const binding = source.resolveBinding({ documentId, sessionId, fieldKey });
  seedFieldFromDocument(binding.text, binding.fieldMeta, fieldKey, document);
}

export function authDocOf(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKey: string,
): Y.Doc {
  const binding = source.resolveBinding({ documentId, sessionId, fieldKey });
  const doc = binding.text.doc;
  if (doc === null) throw new Error("agent witness: field text has no doc");
  return doc;
}

export interface AgentBridgeSetup {
  bridge: AgentBridgeDouble;
  store: AgentBridgeReceiptStore;
}

export function setupAgentBridge(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKeys: readonly string[],
  families?: readonly AgentEditOperation["type"][],
  clock?: { now?: () => number; retentionTtlMs?: number },
  profile: AgentPatchProfile = "p0",
): AgentBridgeSetup {
  const store = createAgentBridgeReceiptStore();
  const bridge = createAgentBridgeDouble({
    source,
    documentId,
    sessionId,
    fieldKeys,
    families: families ?? [
      "insert",
      "insertHardBreak",
      "delete",
      "mark",
      "splitParagraph",
      "mergeWithPrevious",
    ],
    store,
    profile,
    ...(clock?.now !== undefined ? { now: clock.now } : {}),
    ...(clock?.retentionTtlMs !== undefined ? { retentionTtlMs: clock.retentionTtlMs } : {}),
  });
  return { bridge, store };
}

/** A replica doc synced from the authoritative doc (convergence observation). */
export function makeAgentReplica(authDoc: Y.Doc): Y.Doc {
  const replica = new Y.Doc();
  Y.applyUpdate(replica, Y.encodeStateAsUpdate(authDoc));
  return replica;
}

/** Exchange all updates between the authoritative doc and every replica. */
export function syncAgentReplicas(authDoc: Y.Doc, replicas: readonly Y.Doc[]): void {
  for (const replica of replicas) {
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(authDoc));
  }
  for (const replica of replicas) {
    Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(replica));
  }
  for (const replica of replicas) {
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(authDoc));
  }
}

export function replicaTexts(
  replicas: readonly Y.Doc[],
  fieldKey: string,
): string[][] {
  return replicas.map((replica) => {
    const text = replica.getText(fieldTextName(fieldKey));
    const meta = replica.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>;
    return capturedTexts(captureDocumentFromField(text, meta, P0));
  });
}

export function authTexts(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKey: string,
): string[] {
  const binding = source.resolveBinding({ documentId, sessionId, fieldKey });
  return capturedTexts(captureDocumentFromField(binding.text, binding.fieldMeta, P0));
}

export function svHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateVector(doc)).toString("hex");
}

/** Delete-set bytes (with the state vector): equality proves a refusal created
    no tombstone (§4.11 step 5, §5.3.1). */
export function dsHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeSnapshot(Y.snapshot(doc))).toString("hex");
}

/** Fail when any patch operation carries a numeric-offset-style key (§5.2: no
    patch operation carries an offset of either kind). */
export function assertNoOffsetKeys(operation: AgentEditOperation): void {
  const keys: string[] = [];
  const visit = (value: unknown): void => {
    if (typeof value !== "object" || value === null) return;
    for (const [key, entry] of Object.entries(value)) {
      keys.push(key);
      visit(entry);
    }
  };
  visit(operation);
  for (const key of keys) {
    if (/^(offset|position|index|paragraphoffset|linearindex)$/i.test(key)) {
      throw new Error(`agent witness: patch operation carries offset key "${key}"`);
    }
  }
}

let agentPatchSeq = 0;

export function agentPatchFromRead(
  read: AgentDocumentState,
  fieldKey: string,
  documentId: string,
  sessionId: string,
  actorId: string,
  sessionEpoch: string,
  operations: readonly AgentEditOperation[],
): AgentPatch {
  for (const operation of operations) assertNoOffsetKeys(operation);
  agentPatchSeq += 1;
  return {
    patchId: `patch:cl4a-${agentPatchSeq}`,
    binding: { documentId, sessionId, fieldKey },
    actorId,
    sessionEpoch,
    baseRevision: read.revision,
    operations,
  };
}
