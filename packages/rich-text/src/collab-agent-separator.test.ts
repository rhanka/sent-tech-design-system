/**
 * CL-4a fix 1 — separator-boundary attribution, preserved zero-width refusals
 * and slice-exact delete records (spec R-ANCH-3, R-ANCH-4, B-BRIDGE-1, §5.7).
 *
 * Every patch body runs parameterised against (a) the in-memory double source
 * and (b) the CL-3c Hocuspocus-backed source, with the provider label asserted
 * in the run. The bridge double stays headless throughout patching.
 *
 * RED basis: `containingParagraph` attributes a position exactly on a
 * separator to the following paragraph, so endAnchor receipts, whole-block
 * detection and preserved boundary scope are wrong on non-last paragraphs.
 */
import { describe, expect, it } from "vitest";
import type {
  AgentParagraphState,
  AgentDocumentState,
  RelativeAnchor,
} from "./collaboration.js";
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
import {
  captureDocumentFromField,
  seedFieldFromDocument,
} from "./collab-codec.js";
import { P0 } from "./collab-agent-witness.test-support.js";

const DOCUMENT_ID = "canvas:cl4a-separator";
const SESSION_ID = "session:cl4a-separator";
const ACTOR = "actor:agent-1";
const EPOCH = "epoch:1";

const PARA_A = "paragraph:a";
const PARA_B = "paragraph:b";
const PARA_C = "paragraph:c";
const PARA_V = "paragraph:v";

function paraById(read: AgentDocumentState, paragraphId: string): AgentParagraphState {
  const field = read.fields[0];
  if (field === undefined) throw new Error("separator witness: read has no field");
  const found = field.paragraphs.find((entry) => entry.paragraphId === paragraphId);
  if (found === undefined) throw new Error(`separator witness: unknown paragraph ${paragraphId}`);
  return found;
}

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

function seedBlocks(
  driver: AgentWitnessDriver,
  blocks: ReturnType<typeof p0Doc>["blocks"],
): void {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc(blocks));
}

function preservedBlock(): never {
  return {
    paragraphId: PARA_V,
    kind: "preserved",
    preservedKind: "verbatim",
    raw: "<x/>",
  } as never;
}

// ── (b) insert at the middle paragraph endAnchor ──

async function witnessInsertMiddleEndAnchor(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), p0Para(PARA_B, "cd"), p0Para(PARA_C, "ef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const middle = paraById(read, PARA_B);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: PARA_B, at: middle.endAnchor, text: "!" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_B]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "cd!", "ef"]);
  expect(svHex(authDoc)).not.toBe(vectorBefore);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([
    ["ab", "cd!", "ef"],
    ["ab", "cd!", "ef"],
  ]);
}

async function witnessHardBreakMiddleEndAnchor(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), p0Para(PARA_B, "cd"), p0Para(PARA_C, "ef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const middle = paraById(read, PARA_B);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insertHardBreak", fieldKey: "description", paragraphId: PARA_B, at: middle.endAnchor },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_B]);
  // The hard break lands in the middle paragraph: three paragraphs remain and
  // the middle paragraph keeps its identity and its text prefix.
  const after = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  expect(after.fields[0]?.paragraphs.map((entry) => entry.paragraphId)).toEqual([PARA_A, PARA_B, PARA_C]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "cd\n", "ef"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([
    ["ab", "cd\n", "ef"],
    ["ab", "cd\n", "ef"],
  ]);
}

// ── (b) insert inside an empty middle paragraph ──

async function witnessInsertEmptyMiddle(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), p0Para(PARA_B, ""), p0Para(PARA_C, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const middle = paraById(read, PARA_B);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: PARA_B, at: middle.startAnchor, text: "X" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_B]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "X", "cd"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([
    ["ab", "X", "cd"],
    ["ab", "X", "cd"],
  ]);
}

async function witnessHardBreakEmptyMiddle(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), p0Para(PARA_B, ""), p0Para(PARA_C, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const middle = paraById(read, PARA_B);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insertHardBreak", fieldKey: "description", paragraphId: PARA_B, at: middle.endAnchor },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_B]);
  const after = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  expect(after.fields[0]?.paragraphs.map((entry) => entry.paragraphId)).toEqual([PARA_A, PARA_B, PARA_C]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "\n", "cd"]);
}

// ── (b) split at a non-last paragraph endAnchor ──

async function witnessSplitNonLastEndAnchor(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), p0Para(PARA_B, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const head = paraById(read, PARA_A);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "splitParagraph",
      fieldKey: "description",
      paragraphId: PARA_A,
      at: head.endAnchor,
      newParagraphId: "paragraph:ax",
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults).toEqual([
    { operationIndex: 0, kind: "splitParagraph", resultParagraphIds: [PARA_A, "paragraph:ax"] },
  ]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "", "cd"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([
    ["ab", "", "cd"],
    ["ab", "", "cd"],
  ]);
}

// ── (a) whole-block replacement of a non-last paragraph ──

async function witnessWholeBlockNonLastRefused(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "abcdef"), p0Para(PARA_B, "uvwxyz")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const first = paraById(read, PARA_A);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: PARA_A,
      range: { start: first.startAnchor, end: first.endAnchor },
    },
    { type: "insert", fieldKey: "description", paragraphId: PARA_A, at: first.startAnchor, text: "XYZ" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("structural-conflict");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef", "uvwxyz"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

// ── (c) preserved boundary scope ──

async function witnessPreservedEndAnchorRefused(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), preservedBlock(), p0Para(PARA_B, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const preserved = paraById(read, PARA_V);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  const before = captureDocumentFromField(binding.text, binding.fieldMeta, P0).document.blocks.map(
    (block) => `${block.paragraphId}:${block.kind}`,
  );
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: PARA_V, at: preserved.endAnchor, text: "!" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("scope-denied");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
  const after = captureDocumentFromField(binding.text, binding.fieldMeta, P0).document.blocks.map(
    (block) => `${block.paragraphId}:${block.kind}`,
  );
  expect(after).toEqual(before);
}

async function witnessEditableEndAnchorBeforePreservedApplies(
  driver: AgentWitnessDriver,
): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), preservedBlock(), p0Para(PARA_B, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const editable = paraById(read, PARA_A);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: PARA_A, at: editable.endAnchor, text: "!" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_A]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab!", "<preserved>", "cd"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([
    ["ab!", "<preserved>", "cd"],
    ["ab!", "<preserved>", "cd"],
  ]);
}

// ── zero-width text operations inside a preserved block ──

async function witnessZeroWidthDeletePreservedRefused(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), preservedBlock(), p0Para(PARA_B, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const preserved = paraById(read, PARA_V);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: PARA_V,
      range: { start: preserved.startAnchor, end: preserved.startAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("scope-denied");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual([
    "ab",
    "<preserved>",
    "cd",
  ]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessZeroWidthMarkPreservedRefused(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "ab"), preservedBlock(), p0Para(PARA_B, "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const preserved = paraById(read, PARA_V);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "mark",
      fieldKey: "description",
      paragraphId: PARA_V,
      range: { start: preserved.startAnchor, end: preserved.startAnchor },
      mark: "bold",
      applied: true,
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("scope-denied");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual([
    "ab",
    "<preserved>",
    "cd",
  ]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

// ── slice-exact delete record ──

async function witnessPartialDeleteRecord(driver: AgentWitnessDriver): Promise<void> {
  seedBlocks(driver, [p0Para(PARA_A, "abcdef")]);
  const { bridge, store } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [
    "description",
    "notes",
  ]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: PARA_A, paragraphOffset: 2 },
      { paragraphId: PARA_A, paragraphOffset: 4 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: PARA_A,
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([PARA_A]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abef"]);
  const record = store.records[JSON.stringify([DOCUMENT_ID, ACTOR, EPOCH, patch.patchId])];
  if (record === undefined) throw new Error("separator witness: missing affected-items record");
  const deleted = record.operations[0]?.deletedItems ?? [];
  expect(deleted).toHaveLength(1);
  expect(deleted[0]?.text).toBe("cd");
  // The record carries the deleted slice, not the full host item.
  expect(deleted[0]?.length).toBe(2);
  expect(deleted[0]?.offset).toBe(2);
}

describe("CL-4a fix 1 — separator boundaries, preserved zero-width, slice records", () => {
  describe("run (a) in-memory double", () => {
    it("attributes a middle endAnchor insert to the middle paragraph", async () => {
      await withDriver("in-memory-double", witnessInsertMiddleEndAnchor);
    });
    it("attributes a middle endAnchor hard break to the middle paragraph", async () => {
      await withDriver("in-memory-double", witnessHardBreakMiddleEndAnchor);
    });
    it("attributes an insert into an empty middle paragraph", async () => {
      await withDriver("in-memory-double", witnessInsertEmptyMiddle);
    });
    it("attributes a hard break into an empty middle paragraph", async () => {
      await withDriver("in-memory-double", witnessHardBreakEmptyMiddle);
    });
    it("reports [head, tail] for a split at a non-last endAnchor", async () => {
      await withDriver("in-memory-double", witnessSplitNonLastEndAnchor);
    });
    it("refuses whole-block replacement of a non-last paragraph", async () => {
      await withDriver("in-memory-double", witnessWholeBlockNonLastRefused);
    });
    it("refuses an insert at preserved.endAnchor before an editable paragraph", async () => {
      await withDriver("in-memory-double", witnessPreservedEndAnchorRefused);
    });
    it("applies an insert at editable.endAnchor before a preserved block", async () => {
      await withDriver("in-memory-double", witnessEditableEndAnchorBeforePreservedApplies);
    });
    it("refuses a zero-width delete inside a preserved block", async () => {
      await withDriver("in-memory-double", witnessZeroWidthDeletePreservedRefused);
    });
    it("refuses a zero-width mark inside a preserved block", async () => {
      await withDriver("in-memory-double", witnessZeroWidthMarkPreservedRefused);
    });
    it("records the deleted slice length and offset on a partial delete", async () => {
      await withDriver("in-memory-double", witnessPartialDeleteRecord);
    });
  });

  describe("run (b) Hocuspocus-backed source", () => {
    it("attributes a middle endAnchor insert to the middle paragraph", async () => {
      await withDriver("hocuspocus", witnessInsertMiddleEndAnchor);
    });
    it("attributes a middle endAnchor hard break to the middle paragraph", async () => {
      await withDriver("hocuspocus", witnessHardBreakMiddleEndAnchor);
    });
    it("attributes an insert into an empty middle paragraph", async () => {
      await withDriver("hocuspocus", witnessInsertEmptyMiddle);
    });
    it("attributes a hard break into an empty middle paragraph", async () => {
      await withDriver("hocuspocus", witnessHardBreakEmptyMiddle);
    });
    it("reports [head, tail] for a split at a non-last endAnchor", async () => {
      await withDriver("hocuspocus", witnessSplitNonLastEndAnchor);
    });
    it("refuses whole-block replacement of a non-last paragraph", async () => {
      await withDriver("hocuspocus", witnessWholeBlockNonLastRefused);
    });
    it("refuses an insert at preserved.endAnchor before an editable paragraph", async () => {
      await withDriver("hocuspocus", witnessPreservedEndAnchorRefused);
    });
    it("applies an insert at editable.endAnchor before a preserved block", async () => {
      await withDriver("hocuspocus", witnessEditableEndAnchorBeforePreservedApplies);
    });
    it("refuses a zero-width delete inside a preserved block", async () => {
      await withDriver("hocuspocus", witnessZeroWidthDeletePreservedRefused);
    });
    it("refuses a zero-width mark inside a preserved block", async () => {
      await withDriver("hocuspocus", witnessZeroWidthMarkPreservedRefused);
    });
    it("records the deleted slice length and offset on a partial delete", async () => {
      await withDriver("hocuspocus", witnessPartialDeleteRecord);
    });
  });
});
