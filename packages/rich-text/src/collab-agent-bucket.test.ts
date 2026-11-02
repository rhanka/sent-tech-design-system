/**
 * CL-4c witness 5 — bounds, atomicity and rate (spec §5.3.1, both sources,
 * headless, fake clock). Patches address anchors only (assertNoOffsetKeys
 * discipline via agentPatchFromRead); the fake clock drives bucket,
 * retention and expiry coherently; bucket state starts full per instance.
 *
 * RED on the CL-4b base: no bucket, no payload hash and no revert exist, so
 * the rate-limited, hash-vector and durable-refusal assertions fail at
 * setup or first assertion.
 */
import { describe, expect, it } from "vitest";
import {
  agentPatchFromRead,
  authDocOf,
  authTexts,
  dsHex,
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
import {
  canonicalizeJson,
  computePayloadHash,
} from "./collab-agent-bridge.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import type { AgentEditOperation, RelativeAnchor } from "./collaboration.js";

const DOCUMENT_ID = "canvas:cl4c-bucket";
const SESSION_ID = "session:cl4c-bucket";
const ACTOR_A = "actor:agent-a";
const ACTOR_B = "actor:agent-b";
const EPOCH = "epoch:1";
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

function fiftyInserts(read: import("./collaboration.js").AgentDocumentState): AgentEditOperation[] {
  const field = read.fields[0];
  if (field === undefined) throw new Error("bucket witness: no field");
  const anchors = field.requestedAnchors ?? [];
  const at = (field.paragraphs[0]?.endAnchor ?? field.paragraphs[0]?.startAnchor) as RelativeAnchor;
  if (at === undefined) throw new Error("bucket witness: no end anchor");
  void anchors;
  const operations: AgentEditOperation[] = [];
  for (let index = 0; index < 50; index += 1) {
    operations.push({ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x" });
  }
  return operations;
}

describe("canonical payload hashing (section 5.4.1, AMB-C1)", () => {
  it("is key-order stable and text/anchor/revision/order sensitive", () => {
    const base = {
      patchId: "patch:hash-1",
      binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
      actorId: ACTOR_A,
      sessionEpoch: EPOCH,
      baseRevision: { documentId: DOCUMENT_ID, stateVector: "AAA=", schemaEpoch: "epoch:schema-1" },
      operations: [{ type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "hello" }],
    } as unknown as import("./collaboration.js").AgentPatch;
    const reordered = {
      patchId: "patch:hash-1",
      actorId: ACTOR_A,
      sessionEpoch: EPOCH,
      operations: [{ text: "hello", type: "insert", paragraphId: P1, fieldKey: "description", at: "anchor:a" }],
      binding: { fieldKey: "description", sessionId: SESSION_ID, documentId: DOCUMENT_ID },
      baseRevision: { schemaEpoch: "epoch:schema-1", stateVector: "AAA=", documentId: DOCUMENT_ID },
    } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(reordered)).toBe(computePayloadHash(base));
    const changedText = { ...base, operations: [{ type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "hellp" }] } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(changedText)).not.toBe(computePayloadHash(base));
    const changedAnchor = { ...base, operations: [{ type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:b", text: "hello" }] } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(changedAnchor)).not.toBe(computePayloadHash(base));
    const changedRevision = { ...base, baseRevision: { documentId: DOCUMENT_ID, stateVector: "AAB=", schemaEpoch: "epoch:schema-1" } } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(changedRevision)).not.toBe(computePayloadHash(base));
    const twoOps = {
      ...base,
      operations: [
        { type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "a" },
        { type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "b" },
      ],
    } as unknown as import("./collaboration.js").AgentPatch;
    const twoOpsSwapped = {
      ...base,
      operations: [
        { type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "b" },
        { type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "a" },
      ],
    } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(twoOpsSwapped)).not.toBe(computePayloadHash(twoOps));
    const unicode = { ...base, operations: [{ type: "insert", fieldKey: "description", paragraphId: P1, at: "anchor:a", text: "héllo 🌍" }] } as unknown as import("./collaboration.js").AgentPatch;
    expect(computePayloadHash(unicode)).toBe(computePayloadHash(structuredClone(unicode)));
    expect(canonicalizeJson({ b: 1, a: [3, 2] })).toBe('{"a":[3,2],"b":1}');
  });
});

describe.each([["in-memory-double"], ["hocuspocus"]] as const)("witness 5 bounds and rate (%s)", (kind) => {
  it("admits a 50-operation patch whole", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      let nowMs = 1_000_000;
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"], undefined, {
        now: () => nowMs,
      });
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, fiftyInserts(read));
      const receipt = await bridge.applyPatch(patch);
      expect(receipt.status).toBe("applied");
      expect(receipt.operationResults).toHaveLength(50);
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0]?.length).toBe(6 + 50);
      const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
      syncAgentReplicas(authDoc, replicas);
      expect(replicaTexts(replicas, "description")).toEqual([
        [authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string],
        [authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")[0] as string],
      ]);
      const keyString = JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, patch.patchId]);
      expect(store.receipts[keyString]?.status).toBe("applied");
      expect(typeof store.payloadHashes[keyString]).toBe("string");
      expect(store.records[keyString]?.operations).toHaveLength(50);
      void nowMs;
    });
  });

  it("refuses transiently when drained and admits after retryAfterMs", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      let nowMs = 2_000_000;
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"], undefined, {
        now: () => nowMs,
      });
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const first = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, fiftyInserts(read));
      expect((await bridge.applyPatch(first)).status).toBe("applied");
      const second = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at: read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor, text: "y" },
      ]);
      const refused = await bridge.applyPatch(second);
      expect(refused.status).toBe("refused");
      expect(refused.reason).toBe("rate-limited");
      expect(refused.transient).toBe(true);
      expect(typeof refused.retryAfterMs).toBe("number");
      const retryAfter = refused.retryAfterMs as number;
      expect(retryAfter).toBeGreaterThan(0);
      const secondKey = JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, second.patchId]);
      expect(store.receipts[secondKey]).toBeUndefined();
      expect(store.payloadHashes[secondKey]).toBeUndefined();
      expect(store.records[secondKey]).toBeUndefined();
      expect(bridge.getReceipt({ documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: second.patchId })).toBeNull();
      nowMs += Math.floor(retryAfter / 2);
      const third = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at: read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor, text: "z" },
      ]);
      const refusedAgain = await bridge.applyPatch(third);
      expect(refusedAgain.reason).toBe("rate-limited");
      const retryAfter2 = refusedAgain.retryAfterMs as number;
      expect(retryAfter2).toBeGreaterThan(0);
      expect(retryAfter2).toBeLessThan(retryAfter);
      const thirdKey = JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, third.patchId]);
      expect(store.receipts[thirdKey]).toBeUndefined();
      nowMs += retryAfter;
      const retry = await bridge.applyPatch(second);
      expect(retry.status).toBe("applied");
      const texts = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      expect(texts[0]?.length).toBe(6 + 50 + 1);
      expect(texts[0]?.split("").filter((char) => char === "y")).toHaveLength(1);
      const replay = await bridge.applyPatch(second);
      expect(replay.duplicate).toBe(true);
      expect(replay.status).toBe("applied");
      expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(texts);
    });
  });

  it("leaves the doc byte-identical on an invalid 50th operation and stores the refusal", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      let nowMs = 3_000_000;
      const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"], undefined, {
        now: () => nowMs,
      });
      void nowMs;
      const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
      const beforeSV = svHex(authDoc);
      const beforeDS = dsHex(authDoc);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const operations = fiftyInserts(read);
      operations[49] = {
        type: "mergeWithPrevious",
        fieldKey: "description",
        paragraphId: "paragraph:gone",
      };
      const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, operations);
      const receipt = await bridge.applyPatch(patch);
      expect(receipt.status).toBe("refused");
      expect(receipt.reason).toBe("target-gone");
      expect(svHex(authDoc)).toBe(beforeSV);
      expect(dsHex(authDoc)).toBe(beforeDS);
      const replay = await bridge.applyPatch(patch);
      expect(replay.duplicate).toBe(true);
      expect(replay.reason).toBe("target-gone");
      expect(svHex(authDoc)).toBe(beforeSV);
      const keyString = JSON.stringify([DOCUMENT_ID, ACTOR_A, EPOCH, patch.patchId]);
      expect(store.receipts[keyString]?.status).toBe("refused");
    });
  });

  it("refuses terminal too-large shapes", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const tooMany: AgentEditOperation[] = [];
      for (let index = 0; index < 51; index += 1) {
        tooMany.push({ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x" });
      }
      const overCount = await bridge.applyPatch(
        agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, tooMany),
      );
      expect(overCount.status).toBe("refused");
      expect(overCount.reason).toBe("too-large");
      const units: AgentEditOperation[] = [];
      for (let index = 0; index < 11; index += 1) {
        units.push({ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x".repeat(2000) });
      }
      units[10] = { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x".repeat(1) };
      const overUnits = await bridge.applyPatch(
        agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, units),
      );
      expect(overUnits.status).toBe("refused");
      expect(overUnits.reason).toBe("too-large");
    });
  });

  it("refuses scope-denied fields and revoked actors without debit", async () => {
    await withDriver(kind, async (driver) => {
      seedAbcdef(driver);
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description"]);
      const read = bridge.readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } });
      const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
      const outOfScope = agentPatchFromRead(
        { ...read, revision: { ...read.revision, documentId: DOCUMENT_ID } },
        "description",
        DOCUMENT_ID,
        SESSION_ID,
        ACTOR_A,
        EPOCH,
        [{ type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x" }],
      );
      outOfScope.binding = { documentId: "canvas:other", sessionId: SESSION_ID, fieldKey: "description" };
      const scoped = await bridge.applyPatch(outOfScope);
      expect(scoped.status).toBe("refused");
      expect(scoped.reason).toBe("target-gone");
      bridge.admitAgentActor({ actorId: ACTOR_B, displayLabel: "Agent B", color: "#112233" });
      driver.source.revokeActor?.(ACTOR_B);
      const revokedPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
        { type: "insert", fieldKey: "description", paragraphId: P1, at, text: "x" },
      ]);
      const revoked = await bridge.applyPatch(revokedPatch);
      expect(revoked.status).toBe("refused");
      expect(revoked.reason).toBe("revoked");
    });
  });
});
