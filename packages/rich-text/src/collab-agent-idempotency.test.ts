/**
 * CL-4c witness 6 — durable idempotency family (spec §5.4.1, both sources,
 * headless, restart over the same store). Restart means a new bridge
 * instance over the same source and the same store object, with the provider
 * label asserted.
 *
 * RED on the CL-4b base: string-equality retry, no hash, no log, no revert.
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
  replicaTexts,
  setupAgentBridge,
  svHex,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { createAgentBridgeDouble } from "./collab-agent-bridge.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import type { RelativeAnchor } from "./collaboration.js";

const DOCUMENT_ID = "canvas:cl4c-idem";
const SESSION_ID = "session:cl4c-idem";
const ACTOR_A = "actor:agent-a";
const ACTOR_B = "actor:agent-b";
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

function seedAbcdef(driver: AgentWitnessDriver): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" });
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc([p0Para(P1, "abcdef")]));
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)("witness 6 durable idempotency (%s)", (kind) => {
  it("applies a lost response exactly once", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const range = read.fields[0]?.paragraphs[0];
      if (range === undefined) throw new Error("idempotency witness: no paragraph");
      const startAnchor = range.startAnchor;
      const all = await bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        anchorRequests: [{ paragraphId: P1, paragraphOffset: 2 }, { paragraphId: P1, paragraphOffset: 4 }],
      });
      const requested = all.fields[0]?.requestedAnchors as RelativeAnchor[];
      if (requested === undefined || requested.length < 2) throw new Error("idempotency witness: no requested anchors");
      void startAnchor;
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "delete", fieldKey: "description", paragraphId: P1, range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor } },
      ]);
      const first = await bridge.applyPatch(patch);
      expect(first.status).toBe("applied");
      const afterFirst = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      expect(afterFirst).toEqual(["abef"]);
      const markCountBefore = store.provenanceLog.length;
      void markCountBefore;
      const retry = await bridge.applyPatch(patch);
      expect(retry.duplicate).toBe(true);
      expect(retry.status).toBe("applied");
      expect(retry.stateVectorAfter).toBe(first.stateVectorAfter);
      expect(retry.operationResults).toEqual(first.operationResults);
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abef"]);
    });
  });

  it("reads receipts after restart and retries without a second transaction", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "splitParagraph", fieldKey: "description", paragraphId: P1, at, newParagraphId: "paragraph:2" },
      ]);
      const first = await bridge.applyPatch(patch);
      expect(first.status).toBe("applied");
      expect(first.operationResults).toEqual([
        { operationIndex: 0, kind: "splitParagraph", resultParagraphIds: [P1, "paragraph:2"] },
      ]);
      const svAfterFirst = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"));
      const restarted = createAgentBridgeDouble({
        source: driver.source,
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fieldKeys: ["description"],
        families: ["insert", "insertHardBreak", "delete", "mark", "splitParagraph", "mergeWithPrevious"],
        store,
      });
      const lookedUp = restarted.getReceipt({ documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patch.patchId });
      expect(lookedUp?.status).toBe("applied");
      expect(lookedUp?.operationResults).toEqual([
        { operationIndex: 0, kind: "splitParagraph", resultParagraphIds: [P1, "paragraph:2"] },
      ]);
      const retry = await restarted.applyPatch(patch);
      expect(retry.duplicate).toBe(true);
      expect(retry.operationResults).toEqual(first.operationResults);
      expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"))).toBe(svAfterFirst);
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef", ""]);
      expect(store.records[JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, patch.patchId])]).toBeDefined();
    });
  });

  it("refuses reuse with a different payload and applies independent full keys", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "X" },
      ]);
      const first = await bridge.applyPatch(patch);
      expect(first.status).toBe("applied");
      const svAfter = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"));
      const changed = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "Y" },
      ]);
      changed.patchId = patch.patchId;
      const reuse = await bridge.applyPatch(changed);
      expect(reuse.status).toBe("refused");
      expect(reuse.reason).toBe("idempotency-key-reuse");
      expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"))).toBe(svAfter);
      const lookedUp = bridge.getReceipt({ documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patch.patchId });
      expect(lookedUp?.status).toBe("applied");
      const movedAnchor = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at: read.fields[0]?.paragraphs[0]?.startAnchor as RelativeAnchor, text: "X" },
      ]);
      movedAnchor.patchId = patch.patchId;
      const reuseAnchor = await bridge.applyPatch(movedAnchor);
      expect(reuseAnchor.reason).toBe("idempotency-key-reuse");
      const otherActor = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "X" },
      ]);
      otherActor.patchId = patch.patchId;
      const independent = await bridge.applyPatch(otherActor);
      expect(independent.status).toBe("applied");
    });
  });

  it("treats a transient-only key as a first submission once tokens refill", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      let nowMs = 5_000_000;
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"], undefined, {
        now: () => nowMs,
      });
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const drain: import("./collaboration.js").AgentEditOperation[] = [];
      for (let index = 0; index < 50; index += 1) {
        drain.push({ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "d" });
      }
      expect((await bridge.applyPatch(agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, drain))).status).toBe("applied");
      const key = { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: "patch:transient-1" };
      const pending = {
        patchId: key.patchId,
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
        actorId: ACTOR_A,
        sessionEpoch: EPOCH,
        baseRevision: read.revision,
        operations: [{ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "t" }],
      } as unknown as import("./collaboration.js").AgentPatch;
      const refused = await bridge.applyPatch(pending);
      expect(refused.reason).toBe("rate-limited");
      expect(bridge.getReceipt(key)).toBeNull();
      expect(store.receipts[JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, key.patchId])]).toBeUndefined();
      nowMs += (refused.retryAfterMs as number) + 10;
      const admitted = await bridge.applyPatch(pending);
      expect(admitted.status).toBe("applied");
      expect(store.receipts[JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, key.patchId])]?.status).toBe("applied");
      const replay = await bridge.applyPatch(pending);
      expect(replay.duplicate).toBe(true);
    });
  });

  it("replays terminal refusals durably across restart", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mergeWithPrevious", fieldKey: "description", paragraphId: "paragraph:gone" },
      ]);
      const first = await bridge.applyPatch(patch);
      expect(first.reason).toBe("target-gone");
      const svAfter = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"));
      const restarted = createAgentBridgeDouble({
        source: driver.source,
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fieldKeys: ["description"],
        families: ["insert", "insertHardBreak", "delete", "mark", "splitParagraph", "mergeWithPrevious"],
        store,
      });
      const replay = await restarted.applyPatch(patch);
      expect(replay.duplicate).toBe(true);
      expect(replay.reason).toBe("target-gone");
      expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description"))).toBe(svAfter);
      const changed = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "mergeWithPrevious", fieldKey: "description", paragraphId: "paragraph:other-gone" },
      ]);
      changed.patchId = patch.patchId;
      const reuse = await restarted.applyPatch(changed);
      expect(reuse.reason).toBe("idempotency-key-reuse");
      const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
      syncAgentReplicas(authDoc, replicas);
      expect(replicaTexts(replicas, "description")).toEqual([["abcdef"], ["abcdef"]]);
    });
  });
});
