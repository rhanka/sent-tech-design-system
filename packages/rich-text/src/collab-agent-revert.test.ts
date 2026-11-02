/**
 * CL-4c witness 7 — double halves: revert and provenance (spec §5.6
 * R-REV-1…7; shipped port unchanged). Runs parameterised on both sources
 * headless. Human intents arrive through driver transactions recorded via
 * the double's store sink (named per run); agent intents arrive through
 * applyPatch. P0 mark keys only (bold primary); full keys stay CL-4d.
 *
 * RED on the CL-4b base: no revert method exists.
 */
import { describe, expect, it } from "vitest";
import {
  agentPatchFromRead,
  authDocOf,
  authTexts,
  makeAgentReplica,
  openAgentDriver,
  p0Doc,
  p0Para,
  setupAgentBridge,
  svHex,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { createAgentBridgeDouble } from "./collab-agent-bridge.test-support.js";
import { coveredItemIdentities, mintAnchorAt, mintEndOfFieldAnchor, tryResolveAnchorToLinear } from "./collab-selection.js";
import { captureDocumentFromField, fieldMetaName, fieldTextName, seedFieldFromDocument } from "./collab-codec.js";
import type { AgentPatchKey, RelativeAnchor } from "./collaboration.js";
import * as Y from "yjs";

const DOCUMENT_ID = "canvas:cl4c-revert";
const SESSION_ID = "session:cl4c-revert";
const ACTOR_A = "actor:agent-a";
const ACTOR_B = "actor:agent-b";
const HUMAN = "actor:human-1";
const EPOCH = "epoch:1";
const EPOCH_2 = "epoch:2";
const P1 = "paragraph:1";

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, ["description"]);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function seedAb(driver: AgentWitnessDriver, text = "ab"): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" });
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc([p0Para(P1, text)]));
}

function markRange(
  driver: AgentWitnessDriver,
  store: { recordFormattingIntent(intent: never): void },
  actorId: string,
  transactionId: string,
  mark: "bold",
  value: true | null,
  startOffset: number,
  endOffset: number,
): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" });
  const ytext = binding.text;
  // Single-paragraph seeds carry a leading paragraph separator at linear 0,
  // so paragraph offsets shift by one linear unit.
  const low = Math.min(startOffset, endOffset) + 1;
  const high = Math.max(startOffset, endOffset) + 1;
  const start = low >= ytext.length ? mintEndOfFieldAnchor(ytext, ytext.length) : mintAnchorAt(ytext, low, 0);
  const end = high >= ytext.length ? mintEndOfFieldAnchor(ytext, ytext.length) : mintAnchorAt(ytext, high, 0);
  ytext.doc?.transact(() => {
    ytext.format(low, high - low, { [mark]: value });
  });
  store.recordFormattingIntent({
    intentId: `${transactionId}:${mark}`,
    actorId,
    source: { kind: "human-transaction", transactionId },
    fieldKey: "description",
    mark,
    value,
    range: { start, end },
    items: coveredItemIdentities(ytext, low, high),
  } as never);
}

function deltaMarks(driver: AgentWitnessDriver): string {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" });
  const delta = binding.text.toDelta() as Array<{ insert?: unknown; attributes?: Record<string, unknown> }>;
  return JSON.stringify(delta);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)("witness 7 double revert (%s)", (kind) => {
  it("reverts multi-agent patches by full key only", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "abcdef");
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patchA = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "A" },
      ]);
      const patchB = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "B" },
      ]);
      expect((await bridge.applyPatch(patchA)).status).toBe("applied");
      expect((await bridge.applyPatch(patchB)).status).toBe("applied");
      await driver.remoteTransact("description", (text) => {
        text.insert(1, "H");
      });
      const before = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string;
      expect(before).toContain("H");
      expect(before).toContain("A");
      expect(before).toContain("B");
      const revert = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patchA.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("applied");
      const after = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string;
      expect(after).toContain("H");
      expect(after).toContain("B");
      expect(after).not.toContain("A");
      const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
      syncAgentReplicas(authDoc, replicas);
      expect(replicas.map((replica) => {
        const text = replica.getText(fieldTextName("description"));
        const meta = replica.getMap(fieldMetaName("description")) as Y.Map<unknown>;
        return captureDocumentFromField(text, meta, "focus.markdown.p0@1").document.blocks.map((block) => (block as { text?: string }).text ?? "");
      })).toEqual([[after], [after]]);
      const confused = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_B, sessionEpoch: EPOCH, patchId: patchA.patchId }, requestedBy: HUMAN });
      expect(confused.reason).toBe("target-gone");
    });
  });

  it("keeps identical patch ids independent across actors and epochs", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "base");
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patchA = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "A" },
      ]);
      patchA.patchId = "patch:same";
      const patchB = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "B" },
      ]);
      patchB.patchId = "patch:same";
      expect((await bridge.applyPatch(patchA)).status).toBe("applied");
      expect((await bridge.applyPatch(patchB)).status).toBe("applied");
      const keyA: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: "patch:same" };
      const keyB: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: ACTOR_B, sessionEpoch: EPOCH, patchId: "patch:same" };
      expect(bridge.getReceipt(keyA)?.status).toBe("applied");
      expect(bridge.getReceipt(keyB)?.status).toBe("applied");
      const revertA = await bridge.revertPatch({ key: keyA, requestedBy: HUMAN });
      expect(revertA.status).toBe("applied");
      const after = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string;
      expect(after).toContain("B");
      expect(after).not.toContain("A");
      const short = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: "", patchId: "" } as unknown as AgentPatchKey, requestedBy: HUMAN });
      expect(short.reason).toBe("target-gone");
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0]).toBe(after);
    });
  });

  it("reverts identical patch ids across epochs", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "base");
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patch1 = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "1" },
      ]);
      patch1.patchId = "patch:epoch-same";
      const patch2 = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_2, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "2" },
      ]);
      patch2.patchId = "patch:epoch-same";
      expect((await bridge.applyPatch(patch1)).status).toBe("applied");
      expect((await bridge.applyPatch(patch2)).status).toBe("applied");
      const revert1 = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: "patch:epoch-same" }, requestedBy: HUMAN });
      expect(revert1.status).toBe("applied");
      const after = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string;
      expect(after).toContain("2");
      expect(after).not.toContain("1");
    });
  });

  it("reverts after restart with interleaved human text", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "abcdef");
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const anchors = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 2 }, { paragraphId: P1, paragraphOffset: 4 }],
      });
      const requested = anchors.fields[0]?.requestedAnchors as RelativeAnchor[];
      const atEnd = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "delete", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor } },
        { type: "insert", fieldKey: "description", paragraphId: P1, at: atEnd, text: "Z" },
      ]);
      expect((await bridge.applyPatch(patch)).status).toBe("applied");
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abefZ"]);
      await driver.remoteTransact("description", (text) => {
        text.insert(2, "HH");
      });
      const restarted = createAgentBridgeDouble({
        source: driver.source,
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fieldKeys: ["description"],
        families: ["insert", "insertHardBreak", "delete", "mark", "splitParagraph", "mergeWithPrevious"],
        store,
      });
      const revert = await restarted.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patch.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("applied");
      const after = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string;
      expect(after).toContain("HH");
      expect(after).toContain("cd");
      expect(after).not.toContain("Z");
      const replay = await restarted.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patch.patchId }, requestedBy: HUMAN });
      expect(replay.duplicate).toBe(true);
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0]).toBe(after);
    });
  });

  it("mark (a): later wider assertion leaves the covered subset marked", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "abcd");
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 0 }, { paragraphId: P1, paragraphOffset: 2 }],
      });
      const requested = read.fields[0]?.requestedAnchors as RelativeAnchor[];
      const agentPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mark", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor }, mark: "bold", applied: true },
      ]);
      expect((await bridge.applyPatch(agentPatch)).status).toBe("applied");
      markRange(driver, bridge.sink, HUMAN, "txn:human-1", "bold", true, 0, 4);
      const before = deltaMarks(driver);
      expect(before).toContain("bold");
      const restarted = createAgentBridgeDouble({
        source: driver.source,
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fieldKeys: ["description"],
        families: ["insert", "insertHardBreak", "delete", "mark", "splitParagraph", "mergeWithPrevious"],
        store,
      });
      const revert = await restarted.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: agentPatch.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("applied");
      expect(deltaMarks(driver)).toBe(before);
      expect(revert.detail).toContain("kept-later 2");
    });
  });

  it("mark (b): later removal leaves the removed subset unmarked", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "ab");
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 0 }, { paragraphId: P1, paragraphOffset: 2 }],
      });
      const requested = read.fields[0]?.requestedAnchors as RelativeAnchor[];
      const agentPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mark", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor }, mark: "bold", applied: true },
      ]);
      expect((await bridge.applyPatch(agentPatch)).status).toBe("applied");
      markRange(driver, bridge.sink, HUMAN, "txn:human-2", "bold", null, 0, 1);
      const revert = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: agentPatch.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("applied");
      expect(revert.detail).toContain("kept-later 1");
      expect(revert.detail).toContain("restored items 1");
    });
  });

  it("mark (c): plain inverse restores and records a revert intent", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "ab");
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 0 }, { paragraphId: P1, paragraphOffset: 2 }],
      });
      const requested = read.fields[0]?.requestedAnchors as RelativeAnchor[];
      const agentPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mark", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor }, mark: "bold", applied: true },
      ]);
      expect((await bridge.applyPatch(agentPatch)).status).toBe("applied");
      const logBefore = store.provenanceLog.length;
      const revert = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: agentPatch.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("applied");
      expect(store.provenanceLog.length).toBeGreaterThan(logBefore);
      const { planMarkRevert } = await import("./collaboration.js");
      const record = store.records[JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, agentPatch.patchId])];
      const operation = record?.operations.find((entry) => entry.kind === "mark");
      const live = store.provenanceLog.flatMap((entry) => entry.items.map((item) => ({ client: item.client, clock: item.clock })));
      const plan = planMarkRevert(store.provenanceLog, {
        key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: agentPatch.patchId },
        fieldKey: "description",
        mark: "bold",
        intentIds: [...(operation?.markIntentIds ?? [])],
        liveItems: live,
      });
      expect(plan.ok).toBe(true);
    });
  });

  it("mark (d): undeterminable refuses whole with mark-provenance-conflict", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "ab");
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 0 }, { paragraphId: P1, paragraphOffset: 2 }],
      });
      const requested = read.fields[0]?.requestedAnchors as RelativeAnchor[];
      const agentPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mark", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor }, mark: "bold", applied: true },
      ]);
      expect((await bridge.applyPatch(agentPatch)).status).toBe("applied");
      const svBefore = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"));
      const record = store.records[JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, agentPatch.patchId])];
      const intentId = record?.operations.find((entry) => entry.kind === "mark")?.markIntentIds[0];
      store.provenanceLog = store.provenanceLog.filter((entry) => entry.intentId !== intentId);
      const revert = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: agentPatch.patchId }, requestedBy: HUMAN });
      expect(revert.status).toBe("refused");
      expect(revert.reason).toBe("mark-provenance-conflict");
      expect(revert.conflict?.kind).toBe("mark-provenance-conflict");
      expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"))).toBe(svBefore);
    });
  });

  it("refuses unknown and incomplete keys without touching either patch", async () => {
    await withDriver(kind, async (driver) => {
      seedAb(driver, "base");
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = await bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patchA = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "A" },
      ]);
      patchA.patchId = "patch:untouched-a";
      const patchB = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "B" },
      ]);
      patchB.patchId = "patch:untouched-b";
      expect((await bridge.applyPatch(patchA)).status).toBe("applied");
      expect((await bridge.applyPatch(patchB)).status).toBe("applied");
      const before = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0];
      const unknown = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: "patch:nope" }, requestedBy: HUMAN });
      expect(unknown.reason).toBe("target-gone");
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0]).toBe(before);
      const incomplete = await bridge.revertPatch({ key: { documentId: DOCUMENT_ID, actorId: "", sessionEpoch: "", patchId: "" } as unknown as AgentPatchKey, requestedBy: HUMAN });
      expect(incomplete.reason).toBe("target-gone");
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0]).toBe(before);
    });
  });
});
