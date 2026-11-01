/**
 * CL-4a witnesses 4 and 9 (P0 half) — whole-block refusal and bridge preflight
 * validation (spec §5.3 B-BRIDGE-1, §5.3.1, §4.11 P0 admitted table, §8 CL-4
 * (4)/(9)), plus the bridge-double core seam (scope, read bounds, receipts).
 *
 * Every patch body runs parameterised against (a) the in-memory double source
 * and (b) the CL-3c Hocuspocus-backed source, with the provider label asserted
 * in the run. The bridge double stays headless; refusals assert unchanged
 * authoritative content, state vector and delete set, and no partial
 * application when the invalid operation is the last of several (index 2 of 3,
 * with valid operations before it).
 *
 * §4.11 rows the patch vocabulary cannot reach (a separator payload with an
 * unadmitted boundary kind or an extra payload key; an inline embed of
 * unlisted shape such as an image) are raw-wire updates only: they stay CL-5
 * ingress work. What the vocabulary reaches is refused whole below; the
 * resulting-state half of preflight is additionally witnessed through a split
 * carrying a duplicate paragraph id.
 *
 * RED on the CL-4a base: `./collab-agent-bridge.test-support.js` does not
 * exist, so every suite below fails at setup/import.
 */
import { describe, expect, it } from "vitest";
import type {
  AgentDocumentState,
  AgentEditOperation,
  AgentParagraphState,
  RelativeAnchor,
} from "./collaboration.js";
import {
  agentPatchFromRead,
  authDocOf,
  authTexts,
  dsHex,
  openAgentDriver,
  p0Doc,
  p0Para,
  setupAgentBridge,
  svHex,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import { AgentBridgeReadRefusal } from "./collab-agent-bridge.test-support.js";

const DOCUMENT_ID = "canvas:cl4a-preflight";
const SESSION_ID = "session:cl4a-preflight";
const ACTOR = "actor:agent-1";
const EPOCH = "epoch:1";
const P1 = "paragraph:1";

function paraById(read: AgentDocumentState, paragraphId: string): AgentParagraphState {
  const field = read.fields[0];
  if (field === undefined) throw new Error("preflight witness: read has no field");
  const found = field.paragraphs.find((entry) => entry.paragraphId === paragraphId);
  if (found === undefined) throw new Error(`preflight witness: unknown paragraph ${paragraphId}`);
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

function seedDescription(
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

/** Two valid inserts (positions from the same read) plus the invalid operation. */
function patchWithTwoValidFirst(
  read: AgentDocumentState,
  invalid: AgentEditOperation,
): ReturnType<typeof agentPatchFromRead> {
  const paragraph = paraById(read, P1);
  return agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: P1, at: paragraph.startAnchor, text: "Q" },
    { type: "insert", fieldKey: "description", paragraphId: P1, at: paragraph.endAnchor, text: "Z" },
    invalid,
  ]);
}

async function witnessWholeBlockRefused(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const paragraph = paraById(read, P1);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // A patch whose effect deletes the paragraph's entire text and inserts
  // different text in the same patch refuses `structural-conflict` (B-BRIDGE-1).
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: paragraph.startAnchor, end: paragraph.endAnchor },
    },
    { type: "insert", fieldKey: "description", paragraphId: P1, at: paragraph.startAnchor, text: "XYZ" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("structural-conflict");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessDeleteWithoutInsertApplies(driver: AgentWitnessDriver): Promise<void> {
  // The refusal targets the replacement effect, not large deletes.
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const paragraph = paraById(read, P1);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: paragraph.startAnchor, end: paragraph.endAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual([""]);
}

async function witnessRawLfRefused(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = patchWithTwoValidFirst(read, {
    type: "insert",
    fieldKey: "description",
    paragraphId: P1,
    at: paraById(read, P1).startAnchor,
    text: "a\nb",
  });
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("incompatible-schema");
  expect(receipt.detail).toContain("operation 2");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessUnadmittedMarkRefused(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: P1, paragraphOffset: 1 },
      { paragraphId: P1, paragraphOffset: 3 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // `underline` is unadmitted under P0 (§4.11; supported-mark witness (v)).
  const patch = patchWithTwoValidFirst(read, {
    type: "mark",
    fieldKey: "description",
    paragraphId: P1,
    range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    mark: "underline",
    applied: true,
  } as unknown as AgentEditOperation);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("incompatible-schema");
  expect(receipt.detail).toContain("operation 2");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessDuplicateSplitIdRefused(driver: AgentWitnessDriver): Promise<void> {
  // Resulting-state half of preflight (§5.3.1 step (v)): a split reusing a live
  // paragraph id leaves a field with duplicate ids, refused whole as
  // `incompatible-schema` with nothing applied.
  seedDescription(driver, [p0Para("paragraph:a", "ab"), p0Para("paragraph:b", "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "splitParagraph",
      fieldKey: "description",
      paragraphId: "paragraph:a",
      at: paraById(read, "paragraph:a").endAnchor,
      newParagraphId: "paragraph:b",
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("incompatible-schema");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "cd"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessUnadmittedEmbedShapeRefused(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // An embed of unadmitted shape through the patch vocabulary: the operation
  // carries a closed-key violation, refused whole at shape level (§4.11).
  const patch = patchWithTwoValidFirst(read, {
    type: "insert",
    fieldKey: "description",
    paragraphId: P1,
    at: paraById(read, P1).startAnchor,
    text: "x",
    embed: { image: { src: "https://example.com/x.png" } },
  } as unknown as AgentEditOperation);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("incompatible-schema");
  expect(receipt.detail).toContain("operation 2");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef"]);
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
}

async function witnessCoreSeam(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, [p0Para(P1, "abcdef")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  // Read helper: one page within caps, revision plus retained token.
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  expect(read.fields).toHaveLength(1);
  expect(read.fields[0]?.paragraphs.map((entry) => entry.paragraphId)).toEqual([P1]);
  expect(typeof read.revision.stateVector).toBe("string");
  expect(typeof read.readToken).toBe("string");
  // Over-cap request refuses whole with no page and no anchors minted.
  let refusal: unknown = null;
  try {
    bridge.readState({
      binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
      maxParagraphs: 101,
    });
  } catch (error) {
    refusal = error;
  }
  expect(refusal instanceof AgentBridgeReadRefusal).toBe(true);
  expect((refusal as AgentBridgeReadRefusal).reason).toBe("too-large");
  // Unknown receipt key reads null (R-REV-1: full key only).
  expect(
    bridge.getReceipt({ documentId: DOCUMENT_ID, actorId: ACTOR, sessionEpoch: EPOCH, patchId: "patch:unknown" }),
  ).toBeNull();
  // Applied receipt is retrievable by its full key.
  const paragraph = paraById(read, P1);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: P1, at: paragraph.endAnchor, text: "!" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(bridge.getReceipt(receipt.key)).toEqual(receipt);
  // A full-profile family is refused at patch-application level in CL-4a.
  const fullPatch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "setBlockMetadata",
      fieldKey: "description",
      paragraphId: P1,
      metadata: { blockKind: "paragraph", listKind: "none", listDepth: 0, blockquoteDepth: 0, containerOrder: [] },
    },
  ]);
  const fullReceipt = await bridge.applyPatch(fullPatch);
  expect(fullReceipt.status).toBe("refused");
  expect(fullReceipt.reason).toBe("incompatible-schema");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef!"]);
}

async function witnessNarrowedAdmission(driver: AgentWitnessDriver): Promise<void> {
  // The double's admitted set refuses a valid P0 shape outside it with
  // `scope-denied` (B-BRIDGE-3 second layer).
  seedDescription(driver, [p0Para("paragraph:a", "ab"), p0Para("paragraph:b", "cd")]);
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"], [
    "insert",
    "insertHardBreak",
    "delete",
    "mark",
    "splitParagraph",
  ]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "mergeWithPrevious", fieldKey: "description", paragraphId: "paragraph:b" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("scope-denied");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "cd"]);
}

describe("CL-4a witnesses 4 and 9 (P0 half) — whole-block refusal and preflight", () => {
  describe("run (a) in-memory double", () => {
    it("refuses whole-block replacement", async () => {
      await withDriver("in-memory-double", witnessWholeBlockRefused);
    });
    it("applies a delete without the replacement insert", async () => {
      await withDriver("in-memory-double", witnessDeleteWithoutInsertApplies);
    });
    it("refuses insert text carrying U+000A", async () => {
      await withDriver("in-memory-double", witnessRawLfRefused);
    });
    it("refuses an unadmitted mark for the profile", async () => {
      await withDriver("in-memory-double", witnessUnadmittedMarkRefused);
    });
    it("refuses a split reusing a live paragraph id", async () => {
      await withDriver("in-memory-double", witnessDuplicateSplitIdRefused);
    });
    it("refuses an embed of unadmitted shape", async () => {
      await withDriver("in-memory-double", witnessUnadmittedEmbedShapeRefused);
    });
    it("covers the core read/scope/receipt seam", async () => {
      await withDriver("in-memory-double", witnessCoreSeam);
    });
    it("refuses a valid shape outside the admitted families", async () => {
      await withDriver("in-memory-double", witnessNarrowedAdmission);
    });
  });

  describe("run (b) Hocuspocus-backed source", () => {
    it("refuses whole-block replacement", async () => {
      await withDriver("hocuspocus", witnessWholeBlockRefused);
    });
    it("applies a delete without the replacement insert", async () => {
      await withDriver("hocuspocus", witnessDeleteWithoutInsertApplies);
    });
    it("refuses insert text carrying U+000A", async () => {
      await withDriver("hocuspocus", witnessRawLfRefused);
    });
    it("refuses an unadmitted mark for the profile", async () => {
      await withDriver("hocuspocus", witnessUnadmittedMarkRefused);
    });
    it("refuses a split reusing a live paragraph id", async () => {
      await withDriver("hocuspocus", witnessDuplicateSplitIdRefused);
    });
    it("refuses an embed of unadmitted shape", async () => {
      await withDriver("hocuspocus", witnessUnadmittedEmbedShapeRefused);
    });
    it("covers the core read/scope/receipt seam", async () => {
      await withDriver("hocuspocus", witnessCoreSeam);
    });
    it("refuses a valid shape outside the admitted families", async () => {
      await withDriver("hocuspocus", witnessNarrowedAdmission);
    });
  });
});
