/**
 * CL-4a §4.10 witness — receipt identities for splits (`operationResults`).
 *
 * Every patch body runs parameterised against (a) the in-memory double source
 * and (b) the CL-3c Hocuspocus-backed source, with the provider label asserted
 * in the run. The bridge double stays headless; identities are projected on
 * the authoritative doc at commit time (§5.7, §4.10 R-STR-1/2).
 *
 * RED on the CL-4a base: `./collab-agent-bridge.test-support.js` does not
 * exist, so every suite below fails at setup/import.
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
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";

const DOCUMENT_ID = "canvas:cl4a-receipts";
const SESSION_ID = "session:cl4a-receipts";
const ACTOR_A = "actor:agent-a";
const ACTOR_B = "actor:agent-b";
const EPOCH = "epoch:1";
const P1 = "paragraph:1";

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function seedAbcdef(driver: AgentWitnessDriver): void {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc([p0Para(P1, "abcdef")]));
}

async function witnessSplitReceipt(driver: AgentWitnessDriver): Promise<void> {
  seedAbcdef(driver);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [{ paragraphId: P1, paragraphOffset: 3 }],
  });
  const at = read.fields[0]?.requestedAnchors?.[0];
  if (at === undefined) throw new Error("receipt witness: no requested anchor");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
    {
      type: "splitParagraph",
      fieldKey: "description",
      paragraphId: P1,
      at,
      newParagraphId: "paragraph:2",
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  // Exactly `[headParagraphId, tailParagraphId]` as projected at commit time.
  expect(receipt.operationResults).toEqual([
    { operationIndex: 0, kind: "splitParagraph", resultParagraphIds: [P1, "paragraph:2"] },
  ]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abc", "def"]);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  expect(replicaTexts([makeAgentReplica(authDoc), makeAgentReplica(authDoc)], "description")).toEqual([
    ["abc", "def"],
    ["abc", "def"],
  ]);
}

async function witnessConcurrentSplits(
  driver: AgentWitnessDriver,
  order: "a-first" | "b-first",
): Promise<void> {
  seedAbcdef(driver);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  // Both splits address the same anchor from the same read revision.
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [{ paragraphId: P1, paragraphOffset: 3 }],
  });
  const at = read.fields[0]?.requestedAnchors?.[0];
  if (at === undefined) throw new Error("receipt witness: no requested anchor");
  const patchA = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
    { type: "splitParagraph", fieldKey: "description", paragraphId: P1, at, newParagraphId: "paragraph:a" },
  ]);
  const patchB = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
    { type: "splitParagraph", fieldKey: "description", paragraphId: P1, at, newParagraphId: "paragraph:b" },
  ]);
  const first = order === "a-first" ? patchA : patchB;
  const second = order === "a-first" ? patchB : patchA;
  const firstTail = order === "a-first" ? "paragraph:a" : "paragraph:b";
  const secondTail = order === "a-first" ? "paragraph:b" : "paragraph:a";
  const receiptFirst = await bridge.applyPatch(first);
  const receiptSecond = await bridge.applyPatch(second);
  expect(receiptFirst.status).toBe("applied");
  expect(receiptSecond.status).toBe("applied");
  // Each receipt names its own tail; the first committer's tail opens the
  // empty middle paragraph, the second committer's tail opens the tail
  // (R-STR-2: identity follows the resolved position, not arrival order —
  // here the commits are sequential, so Yjs order is commit order).
  expect(receiptFirst.operationResults?.[0]?.resultParagraphIds?.[1]).toBe(firstTail);
  expect(receiptSecond.operationResults?.[0]?.resultParagraphIds?.[1]).toBe(secondTail);
  expect(receiptFirst.operationResults?.[0]?.resultParagraphIds?.[0]).toBe(P1);
  // The second split resolves after the first separator: its head is the
  // middle paragraph the first split opened.
  expect(receiptSecond.operationResults?.[0]?.resultParagraphIds?.[0]).toBe(firstTail);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abc", "", "def"]);
  expect(replicaTexts([makeAgentReplica(authDoc), makeAgentReplica(authDoc)], "description")).toEqual([
    ["abc", "", "def"],
    ["abc", "", "def"],
  ]);
  // Paragraph identities on the authoritative doc: head, empty middle (first
  // tail), tail (second tail) — no character lost.
  const paragraphs = bridge
    .readState({ binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" } })
    .fields[0]?.paragraphs.map((entry) => entry.paragraphId);
  expect(paragraphs).toEqual([P1, firstTail, secondTail]);
}

async function witnessSplitRetry(driver: AgentWitnessDriver): Promise<void> {
  seedAbcdef(driver);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [{ paragraphId: P1, paragraphOffset: 3 }],
  });
  const at = read.fields[0]?.requestedAnchors?.[0];
  if (at === undefined) throw new Error("receipt witness: no requested anchor");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
    {
      type: "splitParagraph",
      fieldKey: "description",
      paragraphId: P1,
      at,
      newParagraphId: "paragraph:2",
    },
  ]);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  const vectorAfterApply = svHex(authDoc);
  const deleteSetAfterApply = dsHex(authDoc);
  // Idempotent retry of the same full key with the identical payload returns
  // the original receipt with `duplicate: true` and inserts no third separator.
  const retry = await bridge.applyPatch(structuredClone(patch));
  expect(retry.status).toBe("applied");
  expect(retry.duplicate).toBe(true);
  expect(retry.operationResults).toEqual(receipt.operationResults);
  expect(retry.stateVectorAfter).toBe(receipt.stateVectorAfter);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abc", "def"]);
  expect(svHex(authDoc)).toBe(vectorAfterApply);
  expect(dsHex(authDoc)).toBe(deleteSetAfterApply);
  // Lookup by the full key returns the original (non-duplicate) receipt.
  const lookedUp = bridge.getReceipt(receipt.key);
  expect(lookedUp?.duplicate).toBeUndefined();
  expect(lookedUp?.operationResults).toEqual(receipt.operationResults);
}

describe("CL-4a §4.10 witness — receipt identities for splits", () => {
  describe("run (a) in-memory double", () => {
    it("reports exactly [head, tail] for a split", async () => {
      await withDriver("in-memory-double", witnessSplitReceipt);
    });
    it("returns the two distinct tail ids, a-first", async () => {
      await withDriver("in-memory-double", (driver) => witnessConcurrentSplits(driver, "a-first"));
    });
    it("returns the two distinct tail ids, b-first", async () => {
      await withDriver("in-memory-double", (driver) => witnessConcurrentSplits(driver, "b-first"));
    });
    it("replays a split retry with duplicate:true and no third separator", async () => {
      await withDriver("in-memory-double", witnessSplitRetry);
    });
  });

  describe("run (b) Hocuspocus-backed source", () => {
    it("reports exactly [head, tail] for a split", async () => {
      await withDriver("hocuspocus", witnessSplitReceipt);
    });
    it("returns the two distinct tail ids, a-first", async () => {
      await withDriver("hocuspocus", (driver) => witnessConcurrentSplits(driver, "a-first"));
    });
    it("returns the two distinct tail ids, b-first", async () => {
      await withDriver("hocuspocus", (driver) => witnessConcurrentSplits(driver, "b-first"));
    });
    it("replays a split retry with duplicate:true and no third separator", async () => {
      await withDriver("hocuspocus", witnessSplitRetry);
    });
  });
});
