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
import type { RichTextDocument } from "./model.js";
import type {
  AgentDocumentState,
  AgentEditOperation,
  AgentPatch,
} from "./collaboration.js";
import {
  createAgentBridgeDouble,
  createAgentBridgeReceiptStore,
  type AgentBridgeDouble,
  type AgentBridgeReceiptStore,
} from "./collab-agent-bridge.test-support.js";
import {
  openHocuspocusTestSession,
  type HocuspocusTestDriver,
} from "./collab-hocuspocus-source.test-support.js";

export const P0 = "focus.markdown.p0@1" as const;

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
