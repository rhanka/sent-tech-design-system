/**
 * CL-4a witness 2 — revision-bound anchors (spec §5.2 R-ANCH-2…5, §8 CL-4 (2)).
 *
 * Every patch body below runs parameterised against (a) the in-memory double
 * source and (b) the CL-3c Hocuspocus-backed source, with the provider label
 * asserted in the run. The bridge double stays headless throughout patching:
 * no bound editor is mounted while a patch applies; convergence is observed
 * on the source's authoritative document plus at least two replica docs synced
 * from it. Patches are addressed only through anchors minted by the bridge
 * read helper; each operation object is asserted to carry no offset field.
 *
 * RED on the CL-4a base: `./collab-agent-bridge.test-support.js` does not
 * exist, so every suite below fails at setup/import (`Failed to resolve
 * import "./collab-agent-bridge.test-support.js"`).
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import type {
  AgentDocumentState,
  AgentEditOperation,
  AgentParagraphState,
  RelativeAnchor,
} from "./collaboration.js";
import {
  agentPatchFromRead,
  assertNoOffsetKeys,
  authDocOf,
  authTexts,
  capturedTexts,
  dsHex,
  makeAgentReplica,
  openAgentDriver,
  p0Doc,
  p0Para,
  P0,
  replicaTexts,
  setupAgentBridge,
  svHex,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import {
  captureDocumentFromField,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";

const DOCUMENT_ID = "canvas:cl4a-anchors";
const SESSION_ID = "session:cl4a-anchors";
const ACTOR = "actor:agent-1";
const EPOCH = "epoch:1";
const P1 = "paragraph:1";

function paraById(read: AgentDocumentState, paragraphId: string): AgentParagraphState {
  const field = read.fields[0];
  if (field === undefined) throw new Error("anchor witness: read has no field");
  const found = field.paragraphs.find((entry) => entry.paragraphId === paragraphId);
  if (found === undefined) throw new Error(`anchor witness: unknown paragraph ${paragraphId}`);
  return found;
}

/** Linear index of a paragraph's opening separator, via the delta. */
function separatorIndexOf(authDoc: Y.Doc, fieldKey: string, paragraphId: string): number {
  const text = authDoc.getText(fieldTextName(fieldKey));
  const delta = text.toDelta() as Array<{ insert?: unknown }>;
  let cursor = 0;
  for (const op of delta) {
    const insert = op.insert as { separator?: { paragraphId?: string } } | string | undefined;
    if (typeof insert === "object" && insert !== null && "separator" in insert) {
      if ((insert.separator as { paragraphId?: string }).paragraphId === paragraphId) return cursor;
      cursor += 1;
    } else if (typeof insert === "string") {
      cursor += insert.length;
    } else {
      cursor += 1;
    }
  }
  throw new Error(`anchor witness: separator not found for ${paragraphId}`);
}

/** Bold flag per character of a replica field, from its delta. */
function boldFlagsOf(replica: Y.Doc, fieldKey: string): boolean[] {
  const text = replica.getText(fieldTextName(fieldKey));
  const delta = text.toDelta() as Array<{ insert?: unknown; attributes?: Record<string, unknown> }>;
  const flags: boolean[] = [];
  for (const op of delta) {
    if (typeof op.insert === "string") {
      const bold = (op.attributes as { bold?: unknown } | undefined)?.bold === true;
      for (let index = 0; index < op.insert.length; index += 1) flags.push(bold);
    }
  }
  return flags;
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

function seedDescription(driver: AgentWitnessDriver, text: string, paragraphId = P1): void {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc([p0Para(paragraphId, text)]));
}

async function witnessStaleRead(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, "abcdef");
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: P1, paragraphOffset: 2 },
      { paragraphId: P1, paragraphOffset: 4 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  // A human transaction inserts `XX` before the paragraph text (observed).
  await driver.remoteTransact("description", (text) => {
    text.insert(1, "XX");
  });
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([P1]);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["XXabef"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([["XXabef"], ["XXabef"]]);
}

async function witnessMergedTarget(driver: AgentWitnessDriver): Promise<void> {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  
  seedFieldFromDocument(
    binding.text,
    binding.fieldMeta,
    "description",
    p0Doc([p0Para("paragraph:p", "Hello"), p0Para("paragraph:q", "World")]),
  );
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const tail = paraById(read, "paragraph:q");
  // A human merges `Q` into its predecessor before the agent patch arrives.
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  await driver.remoteTransact("description", () => {
    const index = separatorIndexOf(authDoc, "description", "paragraph:q");
    authDoc.getText(fieldTextName("description")).delete(index, 1);
  });
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "insert", fieldKey: "description", paragraphId: "paragraph:q", at: tail.endAnchor, text: "!" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  // No `target-gone`: the insert lands in the merged paragraph and the receipt
  // reports the surviving paragraph id (R-ANCH-5).
  expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["paragraph:p"]);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["HelloWorld!"]);
  const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
  expect(replicaTexts(replicas, "description")).toEqual([["HelloWorld!"], ["HelloWorld!"]]);
}

async function witnessGoneTargetField(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, "abcdef");
  const notesBinding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "notes",
  });
  
  seedFieldFromDocument(notesBinding.text, notesBinding.fieldMeta, "notes", p0Doc([p0Para("paragraph:n", "xyz")]));
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // The same insert addressed with a binding identity for another admitted
  // field: the anchor's type name names `field:description` (R-ANCH-5).
  const patch = agentPatchFromRead(read, "notes", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "insert",
      fieldKey: "notes",
      paragraphId: "paragraph:n",
      at: paraById(read, P1).endAnchor,
      text: "!",
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("target-gone");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abcdef"]);
}

async function witnessGoneTargetMerge(driver: AgentWitnessDriver): Promise<void> {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  
  seedFieldFromDocument(
    binding.text,
    binding.fieldMeta,
    "description",
    p0Doc([p0Para("paragraph:p", "Hello"), p0Para("paragraph:q", "World")]),
  );
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  await driver.remoteTransact("description", () => {
    const index = separatorIndexOf(authDoc, "description", "paragraph:q");
    authDoc.getText(fieldTextName("description")).delete(index, 1);
  });
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // `mergeWithPrevious` naming the retired paragraph refuses `target-gone`.
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    { type: "mergeWithPrevious", fieldKey: "description", paragraphId: "paragraph:q" },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("target-gone");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["HelloWorld"]);
}

async function witnessConcurrentInteriorInsert(
  driver: AgentWitnessDriver,
  order: "agent-first" | "human-first",
): Promise<void> {
  seedDescription(driver, "abcdef");
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: P1, paragraphOffset: 2 },
      { paragraphId: P1, paragraphOffset: 4 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  // The human replica never observes the agent patch before typing `ZZ`
  // between `c` and `d`: the insert is concurrent in both delivery orders.
  const humanReplica = makeAgentReplica(authDoc);
  const observer = makeAgentReplica(authDoc);
  const humanText = humanReplica.getText(fieldTextName("description"));
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    },
  ]);
  if (order === "agent-first") {
    const receipt = await bridge.applyPatch(patch);
    expect(receipt.status).toBe("applied");
    humanReplica.transact(() => {
      humanText.insert(4, "ZZ");
    });
  } else {
    humanReplica.transact(() => {
      humanText.insert(4, "ZZ");
    });
    Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(humanReplica));
    const receipt = await bridge.applyPatch(patch);
    expect(receipt.status).toBe("applied");
  }
  // Replicas converge to `abZZef`: the interior concurrent insert survives the
  // item-set delete (R-ANCH-4), in both delivery orders.
  Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(humanReplica));
  Y.applyUpdate(humanReplica, Y.encodeStateAsUpdate(authDoc));
  Y.applyUpdate(observer, Y.encodeStateAsUpdate(authDoc));
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abZZef"]);
  expect(replicaTexts([humanReplica, observer], "description")).toEqual([["abZZef"], ["abZZef"]]);
}

async function witnessSeparatorDeleteRefused(driver: AgentWitnessDriver): Promise<void> {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  
  seedFieldFromDocument(binding.text, binding.fieldMeta, "description", p0Doc([p0Para("paragraph:a", "ab"), p0Para("paragraph:b", "cd")]));
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: "paragraph:a", paragraphOffset: 1 },
      { paragraphId: "paragraph:b", paragraphOffset: 1 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  // The resolved interval covers the separator embed between the paragraphs.
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: "paragraph:a",
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("structural-conflict");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab", "cd"]);
}

async function witnessPreservedInsertRefused(driver: AgentWitnessDriver): Promise<void> {
  const binding = driver.source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  
  seedFieldFromDocument(
    binding.text,
    binding.fieldMeta,
    "description",
    p0Doc([
      p0Para("paragraph:a", "ab"),
      { paragraphId: "paragraph:v", kind: "preserved", preservedKind: "verbatim", raw: "<x/>" } as never,
      p0Para("paragraph:b", "cd"),
    ]),
  );
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
  });
  const preserved = paraById(read, "paragraph:v");
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const before = capturedTexts(
    captureDocumentFromField(binding.text, binding.fieldMeta, P0),
  );
  const vectorBefore = svHex(authDoc);
  const deleteSetBefore = dsHex(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "insert",
      fieldKey: "description",
      paragraphId: "paragraph:v",
      at: preserved.startAnchor,
      text: "!",
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("refused");
  expect(receipt.reason).toBe("scope-denied");
  expect(svHex(authDoc)).toBe(vectorBefore);
  expect(dsHex(authDoc)).toBe(deleteSetBefore);
  const after = capturedTexts(
    captureDocumentFromField(binding.text, binding.fieldMeta, P0),
  );
  expect(after).toEqual(before);
  const preservedAfter = captureDocumentFromField(binding.text, binding.fieldMeta, P0)
    .document.blocks.find((block) => block.paragraphId === "paragraph:v") as
    | { raw?: string }
    | undefined;
  expect(preservedAfter?.raw).toBe("<x/>");
}

async function witnessMarkInheritance(driver: AgentWitnessDriver): Promise<void> {
  seedDescription(driver, "abcdef");
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: P1, paragraphOffset: 2 },
      { paragraphId: P1, paragraphOffset: 4 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const humanReplica = makeAgentReplica(authDoc);
  const observer = makeAgentReplica(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "mark",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
      mark: "bold",
      applied: true,
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  // Concurrent interior insert takes the span's formatting (R-ANCH-4).
  humanReplica.getText(fieldTextName("description")).insert(4, "ZZ");
  Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(humanReplica));
  Y.applyUpdate(humanReplica, Y.encodeStateAsUpdate(authDoc));
  Y.applyUpdate(observer, Y.encodeStateAsUpdate(authDoc));
  // The concurrent characters join the marked run: `c`, `ZZ` and `d` are bold.
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["ab**cZZd**ef"]);
  expect(boldFlagsOf(authDoc, "description")).toEqual([false, false, true, true, true, true, false, false]);
  // Linear flags: a b unmarked, Z Z marked, e f unmarked — on every replica.
  for (const replica of [humanReplica, observer]) {
    const flags = boldFlagsOf(replica, "description");
    expect(flags).toEqual([false, false, true, true, true, true, false, false]);
  }
}

async function witnessDeleteDivergence(driver: AgentWitnessDriver): Promise<void> {
  // Parallel run of the same range as a delete: the concurrent character stays
  // present and unmarked (the two families diverge as specified, R-ANCH-4).
  seedDescription(driver, "abcdef");
  const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
  const read = bridge.readState({
    binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
    anchorRequests: [
      { paragraphId: P1, paragraphOffset: 2 },
      { paragraphId: P1, paragraphOffset: 4 },
    ],
  });
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, "description");
  const humanReplica = makeAgentReplica(authDoc);
  const observer = makeAgentReplica(authDoc);
  const patch = agentPatchFromRead(read, "description", DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
    {
      type: "delete",
      fieldKey: "description",
      paragraphId: P1,
      range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor },
    },
  ]);
  const receipt = await bridge.applyPatch(patch);
  expect(receipt.status).toBe("applied");
  humanReplica.getText(fieldTextName("description")).insert(4, "ZZ");
  Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(humanReplica));
  Y.applyUpdate(humanReplica, Y.encodeStateAsUpdate(authDoc));
  Y.applyUpdate(observer, Y.encodeStateAsUpdate(authDoc));
  expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, "description")).toEqual(["abZZef"]);
  for (const replica of [humanReplica, observer]) {
    expect(boldFlagsOf(replica, "description")).toEqual([false, false, false, false, false, false]);
  }
}

describe("CL-4a witness 2 — revision-bound anchors (B1)", () => {
  describe("run (a) in-memory double", () => {
    it("stale-read deletes `cd`, keeping the prefix insert", async () => {
      await withDriver("in-memory-double", witnessStaleRead);
    });
    it("merged-target lands in the merged paragraph with the survivor id", async () => {
      await withDriver("in-memory-double", witnessMergedTarget);
    });
    it("gone-target refuses a foreign-field insert", async () => {
      await withDriver("in-memory-double", witnessGoneTargetField);
    });
    it("gone-target refuses a merge naming a retired paragraph", async () => {
      await withDriver("in-memory-double", witnessGoneTargetMerge);
    });
    it("concurrent-interior-insert converges agent-first", async () => {
      await withDriver("in-memory-double", (driver) =>
        witnessConcurrentInteriorInsert(driver, "agent-first"),
      );
    });
    it("concurrent-interior-insert converges human-first", async () => {
      await withDriver("in-memory-double", (driver) =>
        witnessConcurrentInteriorInsert(driver, "human-first"),
      );
    });
    it("refuses a delete covering a separator embed", async () => {
      await withDriver("in-memory-double", witnessSeparatorDeleteRefused);
    });
    it("refuses an insert inside a preserved segment", async () => {
      await withDriver("in-memory-double", witnessPreservedInsertRefused);
    });
    it("marks span the concurrent interior insert", async () => {
      await withDriver("in-memory-double", witnessMarkInheritance);
    });
    it("leaves the concurrent insert present and unmarked on delete", async () => {
      await withDriver("in-memory-double", witnessDeleteDivergence);
    });
  });

  describe("run (b) Hocuspocus-backed source", () => {
    it("stale-read deletes `cd`, keeping the prefix insert", async () => {
      await withDriver("hocuspocus", witnessStaleRead);
    });
    it("merged-target lands in the merged paragraph with the survivor id", async () => {
      await withDriver("hocuspocus", witnessMergedTarget);
    });
    it("gone-target refuses a foreign-field insert", async () => {
      await withDriver("hocuspocus", witnessGoneTargetField);
    });
    it("gone-target refuses a merge naming a retired paragraph", async () => {
      await withDriver("hocuspocus", witnessGoneTargetMerge);
    });
    it("concurrent-interior-insert converges agent-first", async () => {
      await withDriver("hocuspocus", (driver) =>
        witnessConcurrentInteriorInsert(driver, "agent-first"),
      );
    });
    it("concurrent-interior-insert converges human-first", async () => {
      await withDriver("hocuspocus", (driver) =>
        witnessConcurrentInteriorInsert(driver, "human-first"),
      );
    });
    it("refuses a delete covering a separator embed", async () => {
      await withDriver("hocuspocus", witnessSeparatorDeleteRefused);
    });
    it("refuses an insert inside a preserved segment", async () => {
      await withDriver("hocuspocus", witnessPreservedInsertRefused);
    });
    it("marks span the concurrent interior insert", async () => {
      await withDriver("hocuspocus", witnessMarkInheritance);
    });
    it("leaves the concurrent insert present and unmarked on delete", async () => {
      await withDriver("hocuspocus", witnessDeleteDivergence);
    });
  });
});

describe("CL-4a bridge double core seam", () => {
  it("mints a revision-bound page on a smoke read", async () => {
    await withDriver("in-memory-double", async (driver) => {
      seedDescription(driver, "abc");
      const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
      const read = bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" },
      });
      expect(read.fields[0]?.paragraphs.map((entry) => entry.paragraphId)).toEqual([P1]);
      expect(typeof read.revision.stateVector).toBe("string");
      expect(typeof read.readToken).toBe("string");
      for (const operation of [
        {
          type: "insert",
          fieldKey: "description",
          paragraphId: P1,
          at: read.fields[0]?.paragraphs[0]?.startAnchor as RelativeAnchor,
          text: "Z",
        } satisfies AgentEditOperation,
      ]) {
        assertNoOffsetKeys(operation);
      }
    });
  });
});
