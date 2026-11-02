/**
 * CL-4d1 witness 11 inverse half — durable inverses for the full families and
 * per-key R-FULL-OP-2 revert (R-REV-6 extension; test-only execution, shipped
 * port unchanged).
 *
 * Every body runs parameterised against (a) the in-memory double source and
 * (b) the CL-3c Hocuspocus-backed source, bridge headless. Agent marks arrive
 * through `applyPatch`; human marks/metadata arrive through driver
 * transactions recorded via the double's store sink — never hand-written log
 * entries except the missing-provenance construction, which is named where
 * it is built. Each case applies through the bridge, interleaves a later
 * human edit, restarts the bridge over the same store, reverts by full key,
 * and asserts: later human text/atoms survive byte-identical, metadata
 * restores only while still effective (later winner kept), the HR inverse
 * touches only its identified pair, every replica converges, and no snapshot
 * replacement occurred.
 *
 * RED on the CL-4c base: no full inverse exists — full patches are refused
 * whole at the shape step, so no record, no revert.
 */
import { describe, expect, it } from "vitest";
import {
  agentPatchFromRead,
  authDocOf,
  captureFullDoc,
  dsHex,
  FULL_FAMILIES,
  fullBlockById,
  fullDoc,
  fullHr,
  fullPara,
  ftext,
  makeAgentReplica,
  openAgentDriver,
  recordHumanMark,
  reopenBridge,
  replicaFullDocs,
  seedAgentField,
  setupAgentBridge,
  storeMarkOperationOf,
  svHex,
  syncAgentReplicas,
  writeHumanMetadata,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import type {
  AgentParagraphState,
  AgentPatchKey,
  FullBlockMetadata,
  RelativeAnchor,
  RichTextInlineMarks,
} from "./collaboration.js";
import type { RichTextDocument } from "./model.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const DOCUMENT_ID = "canvas:cl4d1-full-revert";
const SESSION_ID = "session:cl4d1-full-revert";
const FIELD = "description";
const EPOCH = "epoch:1";
const HUMAN = "actor:human-1";

const BODY = "r:body";
const SRC = "r:src";
const M1 = "r:m1";
const CODE = "r:code";
const BEFORE = "r:before";
const HR1 = "r:hr1";
const AFTER = "r:after";
const LINKP = "r:linkp";

const HREF_A = "https://a.example/x";
const HREF_B = "https://b.example/y";
const HREF_C = "https://c.example/z";

let actorSeq = 100;
function freshActor(): string {
  actorSeq += 1;
  return `actor:full-revert-${actorSeq}`;
}

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, [FIELD]);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function plainMeta(): FullBlockMetadata {
  return canonicalPlainMetadata() as FullBlockMetadata;
}

function orderedSourceMeta(start: number): FullBlockMetadata {
  return {
    ...canonicalPlainMetadata(),
    listKind: "ordered",
    listDepth: 0,
    listItemId: SRC,
    listRunId: SRC,
    orderedStart: start,
    orderedType: "1",
    listTight: true,
    containerOrder: ["list"],
  } as unknown as FullBlockMetadata;
}

function orderedMemberMeta(itemId: string): FullBlockMetadata {
  return {
    ...canonicalPlainMetadata(),
    listKind: "ordered",
    listDepth: 0,
    listItemId: itemId,
    listRunId: SRC,
    containerOrder: ["list"],
  } as unknown as FullBlockMetadata;
}

function codeMeta(language: string): FullBlockMetadata {
  return { ...plainMeta(), blockKind: "codeBlock", codeLanguage: language } as FullBlockMetadata;
}

function revertStandardDoc(): RichTextDocument {
  return fullDoc([
    fullPara(BODY, [ftext("hello world")], plainMeta()),
    fullPara(SRC, [ftext("item one")], orderedSourceMeta(1)),
    fullPara(M1, [ftext("item two")], orderedMemberMeta(M1)),
    fullPara(CODE, [ftext("const a = 1;"), { type: "hardBreak" }, ftext("const b = 2;")], codeMeta("ts")),
    fullPara(BEFORE, [ftext("before hr")], plainMeta()),
    fullHr(HR1),
    fullPara(AFTER, [ftext("after hr")], plainMeta()),
    fullPara(LINKP, [ftext("click "), ftext("here", { link: HREF_A, linkTitle: "Title A" }), ftext(" now")], plainMeta()),
  ]);
}

function seedStandard(driver: AgentWitnessDriver): void {
  seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, revertStandardDoc());
}

function paraOf(read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> }, id: string): AgentParagraphState {
  const found = read.fields[0]?.paragraphs.find((entry) => entry.paragraphId === id);
  if (found === undefined) throw new Error(`witness: no paragraph ${id} in read`);
  return found;
}

function requestedOf(
  read: { fields: Array<{ requestedAnchors?: readonly RelativeAnchor[] }> },
  index: number,
): RelativeAnchor {
  const anchor = read.fields[0]?.requestedAnchors?.[index];
  if (anchor === undefined) throw new Error(`witness: no requested anchor ${index}`);
  return anchor;
}

function keptLaterOf(receipt: { detail?: string }): number {
  const match = /kept-later (\d+)/.exec(receipt.detail ?? "");
  return match === null ? -1 : Number(match[1]);
}

function restoredItemsOf(receipt: { detail?: string }): number {
  const match = /restored items (\d+)/.exec(receipt.detail ?? "");
  return match === null ? -1 : Number(match[1]);
}

function humanType(driver: AgentWitnessDriver, paragraphOffset: number, text: string): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
  const doc = binding.text.doc;
  if (doc === null) throw new Error("witness: field has no doc");
  doc.transact(() => {
    binding.text.insert(paragraphOffset, text);
  });
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 revert: metadata inverses R-FULL-OP-2 (%s)",
  (kind) => {
    it("restores a heading change after restart while later human text survives", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: BODY,
            metadata: { ...plainMeta(), blockKind: "heading", headingLevel: 2 },
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        humanType(driver, 1, "H");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const key: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId };
        const revert = await restarted.revertPatch({ key, requestedBy: HUMAN });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(fullBlockById(captured, BODY)?.metadata).toEqual(plainMeta());
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([BODY, SRC, M1, CODE, BEFORE, HR1, AFTER, LINKP]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("keeps a later human metadata winner byte-unchanged", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: BODY,
            metadata: { ...plainMeta(), blockKind: "heading", headingLevel: 2 },
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        writeHumanMetadata(driver, DOCUMENT_ID, SESSION_ID, FIELD, BODY, { ...plainMeta(), blockKind: "heading", headingLevel: 3 });
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const key: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId };
        const revert = await restarted.revertPatch({ key, requestedBy: HUMAN });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(1);
        expect(fullBlockById(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), BODY)?.metadata).toEqual({
          ...plainMeta(),
          blockKind: "heading",
          headingLevel: 3,
        });
      });
    });

    it("restores a language change and a member depth change after restart", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: CODE, metadata: codeMeta("js") },
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: M1,
            metadata: { ...orderedMemberMeta(M1), listDepth: 1, containerOrder: ["list", "list"] } as FullBlockMetadata,
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        humanType(driver, 1, "H");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const key: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId };
        const revert = await restarted.revertPatch({ key, requestedBy: HUMAN });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(fullBlockById(captured, CODE)?.metadata).toEqual(codeMeta("ts"));
        expect(fullBlockById(captured, M1)?.metadata).toEqual(orderedMemberMeta(M1));
      });
    });

    it("keeps a later human run write on the source", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: SRC, metadata: orderedSourceMeta(5) },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        writeHumanMetadata(driver, DOCUMENT_ID, SESSION_ID, FIELD, SRC, orderedSourceMeta(7));
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const key: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId };
        const revert = await restarted.revertPatch({ key, requestedBy: HUMAN });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(1);
        expect(fullBlockById(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), SRC)?.metadata).toEqual(
          orderedSourceMeta(7),
        );
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 revert: horizontal-rule inverses R-FULL-OP-2 (%s)",
  (kind) => {
    it("removes only its identified insert pair, keeping later human text", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read, BEFORE).endAnchor, newParagraphId: "r:hr-new" },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        humanType(driver, 1, "H");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const key: AgentPatchKey = { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId };
        const revert = await restarted.revertPatch({ key, requestedBy: HUMAN });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([
          BODY, SRC, M1, CODE, BEFORE, HR1, AFTER, LINKP,
        ]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("keeps a later actor's atom when reverting an earlier insert", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actorA = freshActor();
        const actorB = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const first = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actorA, EPOCH, [
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read, BEFORE).endAnchor, newParagraphId: "r:hr-a" },
        ]);
        expect((await setup.bridge.applyPatch(first)).status).toBe("applied");
        const read2 = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const second = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, actorB, EPOCH, [
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read2, AFTER).endAnchor, newParagraphId: "r:hr-b" },
        ]);
        expect((await setup.bridge.applyPatch(second)).status).toBe("applied");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actorA, sessionEpoch: EPOCH, patchId: first.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).not.toContain("r:hr-a");
        expect(captured.blocks.map((block) => block.paragraphId)).toContain("r:hr-b");
        expect(fullBlockById(captured, "r:hr-b")?.kind).toBe("horizontalRule");
      });
    });

    it("treats an already-deleted pair as satisfied on insert revert", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const first = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read, BEFORE).endAnchor, newParagraphId: "r:hr-tmp" },
        ]);
        expect((await setup.bridge.applyPatch(first)).status).toBe("applied");
        const read2 = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const second = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "r:hr-tmp" },
        ]);
        expect((await setup.bridge.applyPatch(second)).status).toBe("applied");
        const before = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: first.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(before);
      });
    });

    it("reinserts a deleted pair at its junction, keeping later human text", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: HR1 },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        expect(
          captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD).blocks.map((block) => block.paragraphId),
        ).toEqual([BODY, SRC, M1, CODE, BEFORE, AFTER, LINKP]);
        humanType(driver, 1, "H");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([
          BODY, SRC, M1, CODE, BEFORE, HR1, AFTER, LINKP,
        ]);
        expect(fullBlockById(captured, HR1)?.kind).toBe("horizontalRule");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("retains a typed-into replacement and restores the HR beside it", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullHr("r:only")]));
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "r:only", replacementParagraphId: "r:fresh" },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        // Later human types into the replacement paragraph (linear 1, after its separator).
        humanType(driver, 1, "typed");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual(["r:only", "r:fresh"]);
        expect(fullBlockById(captured, "r:only")?.kind).toBe("horizontalRule");
        const fresh = fullBlockById(captured, "r:fresh");
        expect(fresh?.kind).toBe("paragraph");
        const texts = (fresh?.segments ?? [])
          .filter((segment): segment is { type: "text"; text: string; marks: RichTextInlineMarks } => segment.type === "text")
          .map((segment) => segment.text)
          .join("");
        expect(texts).toBe("typed");
      });
    });

    it("removes an untouched replacement on sole-block revert", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullHr("r:only")]));
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "r:only", replacementParagraphId: "r:fresh" },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual(["r:only"]);
        expect(fullBlockById(captured, "r:only")?.kind).toBe("horizontalRule");
      });
    });
  },
);

const BOOL_KEYS = ["bold", "italic", "code", "strike", "underline"] as const;

function charMarksOf(doc: RichTextDocument, paraId: string): Array<{ ch: string; marks: RichTextInlineMarks }> {
  const block = fullBlockById(doc, paraId);
  if (block?.kind !== "paragraph") throw new Error(`witness: no paragraph ${paraId}`);
  const out: Array<{ ch: string; marks: RichTextInlineMarks }> = [];
  for (const segment of block.segments ?? []) {
    if (segment.type !== "text") continue;
    for (const ch of segment.text) out.push({ ch, marks: { ...segment.marks } });
  }
  return out;
}

function expectedChars(text: string, marksAt: (index: number) => RichTextInlineMarks): Array<{ ch: string; marks: RichTextInlineMarks }> {
  return [...text].map((ch, index) => ({ ch, marks: marksAt(index) }));
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 revert: per-key R-FULL-OP-2 boolean marks (%s)",
  (kind) => {
    for (const key of BOOL_KEYS) {
      it(`${key} (a): later wider assertion leaves the covered subset marked`, async () => {
        await withDriver(kind, async (driver) => {
          seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullPara("m:para", [ftext("abcdef")], plainMeta())]));
          const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
          const actor = freshActor();
          const read = setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:para", paragraphOffset })),
          });
          const at = (index: number): RelativeAnchor => requestedOf(read, index);
          const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            { type: "mark", fieldKey: FIELD, paragraphId: "m:para", range: { start: at(1), end: at(3) }, mark: key, applied: true },
          ]);
          expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
          recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
            fieldKey: FIELD,
            mark: key,
            value: true,
            startAnchor: at(0),
            endAnchor: at(4),
            actorId: HUMAN,
            transactionId: `txn:bool-a-${key}`,
          });
          const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
          const revert = await restarted.revertPatch({
            key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
            requestedBy: HUMAN,
          });
          expect(revert.status).toBe("applied");
          expect(keptLaterOf(revert)).toBe(3);
          expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:para")).toEqual(
            expectedChars("abcdef", (index) => (index < 5 ? { [key]: true } as RichTextInlineMarks : {})),
          );
        });
      });

      it(`${key} (b): later removal keeps the removed subset, restores the remainder`, async () => {
        await withDriver(kind, async (driver) => {
          seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullPara("m:para", [ftext("abcdef")], plainMeta())]));
          const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
          const actor = freshActor();
          const read = setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:para", paragraphOffset })),
          });
          const at = (index: number): RelativeAnchor => requestedOf(read, index);
          const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            { type: "mark", fieldKey: FIELD, paragraphId: "m:para", range: { start: at(1), end: at(3) }, mark: key, applied: true },
          ]);
          expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
          recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
            fieldKey: FIELD,
            mark: key,
            value: null,
            startAnchor: at(2),
            endAnchor: at(4),
            actorId: HUMAN,
            transactionId: `txn:bool-b-${key}`,
          });
          const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
          const revert = await restarted.revertPatch({
            key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
            requestedBy: HUMAN,
          });
          expect(revert.status).toBe("applied");
          expect(keptLaterOf(revert)).toBe(2);
          expect(restoredItemsOf(revert)).toBe(1);
        });
      });

      it(`${key} (c): plain inverse restores the preceding value`, async () => {
        await withDriver(kind, async (driver) => {
          seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullPara("m:para", [ftext("abcdef")], plainMeta())]));
          const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
          const actor = freshActor();
          const read = setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:para", paragraphOffset })),
          });
          const at = (index: number): RelativeAnchor => requestedOf(read, index);
          const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            { type: "mark", fieldKey: FIELD, paragraphId: "m:para", range: { start: at(0), end: at(1) }, mark: key, applied: true },
          ]);
          expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
          const logBefore = setup.store.provenanceLog.length;
          const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
          const revert = await restarted.revertPatch({
            key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
            requestedBy: HUMAN,
          });
          expect(revert.status).toBe("applied");
          expect(restoredItemsOf(revert)).toBe(3);
          expect(setup.store.provenanceLog.length).toBeGreaterThan(logBefore);
          expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:para")).toEqual(
            expectedChars("abcdef", () => ({})),
          );
        });
      });

      it(`${key} (d): missing provenance refuses whole with mark-provenance-conflict`, async () => {
        await withDriver(kind, async (driver) => {
          seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullPara("m:para", [ftext("abcdef")], plainMeta())]));
          const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
          const actor = freshActor();
          const read = setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:para", paragraphOffset })),
          });
          const at = (index: number): RelativeAnchor => requestedOf(read, index);
          const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            { type: "mark", fieldKey: FIELD, paragraphId: "m:para", range: { start: at(0), end: at(1) }, mark: key, applied: true },
          ]);
          expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
          const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
          const beforeSv = svHex(authDoc);
          const beforeDs = dsHex(authDoc);
          const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
          // Named defect-under-witness construction: the covering intent is
          // lost, so the revert must refuse whole instead of value-matching.
          const record = storeMarkOperationOf(setup.store, {
            documentId: DOCUMENT_ID,
            actorId: actor,
            sessionEpoch: EPOCH,
            patchId: patch.patchId,
          });
          const doomed = new Set(record?.markIntentIds ?? []);
          setup.store.provenanceLog = setup.store.provenanceLog.filter((entry) => !doomed.has(entry.intentId));
          const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
          const revert = await restarted.revertPatch({
            key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
            requestedBy: HUMAN,
          });
          expect(revert.status).toBe("refused");
          expect(revert.reason).toBe("mark-provenance-conflict");
          expect(svHex(authDoc)).toBe(beforeSv);
          expect(dsHex(authDoc)).toBe(beforeDs);
          expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        });
      });
    }
  },
);

function linkSeed(): RichTextDocument {
  return fullDoc([
    fullPara("m:link", [ftext("a"), ftext("bcd", { link: HREF_A, linkTitle: "Title A" }), ftext("ef")], plainMeta()),
  ]);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 revert: per-key R-FULL-OP-2 link and linkTitle (%s)",
  (kind) => {
    it("link (a): wider same-value reassertion keeps later (discriminating control)", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(1), end: at(3) }, mark: "link", href: HREF_B, title: "Title B",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        // Current href already equals the patch after-href, but a later
        // intent owns the items: kept-later, never restored.
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_B,
          startAnchor: at(0), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:link-a",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title B",
          startAnchor: at(0), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:link-a",
        });
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index < 5 ? { link: HREF_B, linkTitle: "Title B" } : {},
          ),
        );
      });
    });

    it("link (b): later replacement keeps the replaced subset, restores A on the remainder", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        // Human baseline: the preceding A/T the revert must restore live in
        // the log (R-REV-4 restores the preceding effective value, or null).
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-b",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-b",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(1), end: at(3) }, mark: "link", href: HREF_B, title: "Title B",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_C,
          startAnchor: at(2), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:link-b",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title C",
          startAnchor: at(2), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:link-b",
        });
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(4);
        expect(restoredItemsOf(revert)).toBe(2);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) => {
            if (index < 1 || index >= 5) return {};
            if (index < 2) return { link: HREF_A, linkTitle: "Title A" };
            return { link: HREF_C, linkTitle: "Title C" };
          }),
        );
      });
    });

    it("link (c): plain A-to-B replacement restores href A", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-c",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-c",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: HREF_B, title: "Title B",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(restoredItemsOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index >= 1 && index < 4 ? { link: HREF_A, linkTitle: "Title A" } : {},
          ),
        );
      });
    });

    it("link (d): missing provenance refuses whole with mark-provenance-conflict", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: HREF_B, title: "Title B",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const beforeSv = svHex(authDoc);
        const beforeDs = dsHex(authDoc);
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const record = storeMarkOperationOf(setup.store, {
          documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId,
        });
        const doomed = new Set(record?.markIntentIds ?? []);
        setup.store.provenanceLog = setup.store.provenanceLog.filter((entry) => !doomed.has(entry.intentId));
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("refused");
        expect(revert.reason).toBe("mark-provenance-conflict");
        expect(svHex(authDoc)).toBe(beforeSv);
        expect(dsHex(authDoc)).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
      });
    });

    it("link (e): null removal restores href A and title on revert", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-e",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:link-base-e",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: null,
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", () => ({})),
        );
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(restoredItemsOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index >= 1 && index < 4 ? { link: HREF_A, linkTitle: "Title A" } : {},
          ),
        );
      });
    });

    it("linkTitle (a): wider same-value reassertion keeps later", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(1), end: at(3) }, mark: "link", href: HREF_A, title: "Title A2",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: at(0), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:title-a",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A2",
          startAnchor: at(0), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:title-a",
        });
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index < 5 ? { link: HREF_A, linkTitle: "Title A2" } : {},
          ),
        );
      });
    });

    it("linkTitle (b): later title replacement keeps the subset, restores T on the remainder", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-b",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-b",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [0, 1, 2, 4, 5].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(1), end: at(3) }, mark: "link", href: HREF_A, title: "Title A2",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: at(2), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:title-b",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A3",
          startAnchor: at(2), endAnchor: at(4), actorId: HUMAN, transactionId: "txn:title-b",
        });
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(keptLaterOf(revert)).toBe(4);
        expect(restoredItemsOf(revert)).toBe(2);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) => {
            if (index < 1 || index >= 5) return {};
            if (index < 2) return { link: HREF_A, linkTitle: "Title A" };
            return { link: HREF_A, linkTitle: "Title A3" };
          }),
        );
      });
    });

    it("linkTitle (c): plain inverse restores title T with href intact", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-c",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-c",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: HREF_A, title: "Title A2",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(restoredItemsOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index >= 1 && index < 4 ? { link: HREF_A, linkTitle: "Title A" } : {},
          ),
        );
      });
    });

    it("linkTitle (d): missing provenance refuses whole with mark-provenance-conflict", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: HREF_A, title: "Title A2",
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const beforeSv = svHex(authDoc);
        const beforeDs = dsHex(authDoc);
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const record = storeMarkOperationOf(setup.store, {
          documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId,
        });
        const doomed = new Set(record?.markIntentIds ?? []);
        setup.store.provenanceLog = setup.store.provenanceLog.filter((entry) => !doomed.has(entry.intentId));
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("refused");
        expect(revert.reason).toBe("mark-provenance-conflict");
        expect(svHex(authDoc)).toBe(beforeSv);
        expect(dsHex(authDoc)).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
      });
    });

    it("linkTitle (e): null removal restores title T on revert", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, linkSeed());
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "link", value: HREF_A,
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-e",
        });
        recordHumanMark(driver, setup.store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD, mark: "linkTitle", value: "Title A",
          startAnchor: requestedOf(prime, 0), endAnchor: requestedOf(prime, 1),
          actorId: HUMAN, transactionId: "txn:title-base-e",
        });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: [1, 4].map((paragraphOffset) => ({ paragraphId: "m:link", paragraphOffset })),
        });
        const at = (index: number): RelativeAnchor => requestedOf(read, index);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark", fieldKey: FIELD, paragraphId: "m:link",
            range: { start: at(0), end: at(1) }, mark: "link", href: HREF_A, title: null,
          },
        ]);
        expect((await setup.bridge.applyPatch(patch)).status).toBe("applied");
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index >= 1 && index < 4 ? { link: HREF_A } : {},
          ),
        );
        const restarted = reopenBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], setup.store, FULL_FAMILIES, "full");
        const revert = await restarted.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: actor, sessionEpoch: EPOCH, patchId: patch.patchId },
          requestedBy: HUMAN,
        });
        expect(revert.status).toBe("applied");
        expect(restoredItemsOf(revert)).toBe(6);
        expect(charMarksOf(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD), "m:link")).toEqual(
          expectedChars("abcdef", (index) =>
            index >= 1 && index < 4 ? { link: HREF_A, linkTitle: "Title A" } : {},
          ),
        );
      });
    });
  },
);
