/**
 * CL-4d2 witness 10 — revocation in flight (spec section 5.5, B-BRIDGE-5;
 * both sources, headless, P0 and full profiles).
 *
 * "In flight" is witnessed in its DS-half sense (register AMB-E8): patches
 * evaluated by the double after the revocation has landed, including a patch
 * fully minted before revocation and presented after it. The production
 * queue/socket sense stays host-side and is named as such in the report.
 * A patch straddling revocation inside its single transaction cannot be
 * expressed against the synchronous double and is `not covered` here.
 *
 * Every body runs parameterised against (a) the in-memory double source and
 * (b) the CL-3c Hocuspocus-backed source, with the provider label asserted
 * in the run, bridge headless (no bound editor mounted). Patches address
 * anchors only (assertNoOffsetKeys discipline via agentPatchFromRead).
 * Authoritative outcomes are asserted on the source document (content via
 * capture at the relevant format including metadata and mark runs, state
 * vector via svHex, delete set via dsHex) and, where stated, on two replica
 * docs synced from it.
 *
 * RED on the CL-4d1 base: this file does not exist, so the run fails at
 * setup with "No test files found".
 */
import { describe, expect, it } from "vitest";
import {
  agentPatchFromRead,
  authDocOf,
  authTexts,
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
  p0Doc,
  p0Para,
  replicaFullDocs,
  replicaTexts,
  seedAgentField,
  setupAgentBridge,
  svHex,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import type {
  AgentEditOperation,
  AgentParagraphState,
  FullBlockMetadata,
  RelativeAnchor,
} from "./collaboration.js";
import type { RichTextDocument } from "./model.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const DOCUMENT_ID = "canvas:cl4d2-revocation";
const SESSION_ID = "session:cl4d2-revocation";
const FIELD = "description";
const P1 = "paragraph:1";
const BODY = "h:body";
const HR1 = "h:hr1";
const HR_NEW = "h:hr-new";
const HR_NEW2 = "h:hr-new-2";
const LINKP = "h:linkp";
const ACTOR_A = "actor:rev-a";
const ACTOR_B = "actor:rev-b";
const EPOCH_1 = "epoch:1";
const EPOCH_2 = "epoch:2";
const EPOCH_3 = "epoch:3";
const HREF_A = "https://a.example/x";
const HREF_B = "https://b.example/y";

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

function seedAbcdef(driver: AgentWitnessDriver): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
  seedFieldFromDocument(binding.text, binding.fieldMeta, FIELD, p0Doc([p0Para(P1, "abcdef")]));
}

function plainMeta(): FullBlockMetadata {
  return canonicalPlainMetadata() as FullBlockMetadata;
}

function smallFullDoc(): RichTextDocument {
  return fullDoc([
    fullPara(BODY, [ftext("hello world")], plainMeta()),
    fullHr(HR1),
    fullPara(LINKP, [ftext("click "), ftext("here", { link: HREF_A, linkTitle: "Title A" }), ftext(" now")], plainMeta()),
  ]);
}

function seedFull(driver: AgentWitnessDriver): void {
  seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, smallFullDoc());
}

function paraOf(read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> }, id: string): AgentParagraphState {
  const found = read.fields[0]?.paragraphs.find((entry) => entry.paragraphId === id);
  if (found === undefined) throw new Error(`revocation witness: no paragraph ${id} in read`);
  return found;
}

function segmentAnchorsFor(
  read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> },
  paragraphId: string,
  text: string,
): { start: RelativeAnchor; end: RelativeAnchor } {
  const para = paraOf(read, paragraphId);
  for (const segment of para.segments ?? []) {
    if (segment.type === "text" && segment.text === text) {
      return { start: segment.startAnchor, end: segment.endAnchor };
    }
  }
  throw new Error(`revocation witness: no segment "${text}" in ${paragraphId}`);
}

function rotatingInserts(
  read: { fields: Array<{ requestedAnchors?: readonly RelativeAnchor[] }> },
  paragraphId: string,
  texts: readonly string[],
): AgentEditOperation[] {
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const fallback = paraOf(read, paragraphId).endAnchor;
  const anchors = requested.length > 0 ? requested : [fallback];
  return texts.map((text, index) => ({
    type: "insert",
    fieldKey: FIELD,
    paragraphId,
    at: anchors[index % anchors.length] as RelativeAnchor,
    text,
  }));
}

function anchorRequestsFor(count: number): Array<{ paragraphId: string; paragraphOffset: number }> {
  return Array.from({ length: count }, (_, offset) => ({ paragraphId: P1, paragraphOffset: offset }));
}

function fiftyInsertsP1(read: { fields: Array<{ requestedAnchors?: readonly RelativeAnchor[] }> }): AgentEditOperation[] {
  return rotatingInserts(read, P1, Array.from({ length: 50 }, () => "x"));
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "witness 10 next patch refused whole, merged text unchanged (%s)",
  (kind) => {
    it("P0: revoked actor's multi-operation patch refuses revoked; history untouched; second actor still admitted", async () => {
      await withDriver(kind, async (driver) => {
        seedAbcdef(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const first = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_1, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(read, P1).endAnchor, text: "AGENT" },
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: P1,
            range: { start: paraOf(read, P1).startAnchor, end: paraOf(read, P1).endAnchor },
            mark: "bold",
            applied: true,
          },
        ]);
        expect((await bridge.applyPatch(first)).status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const mergedTexts = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(mergedTexts).toEqual(["**abcdef**AGENT"]);
        // Revoke, then present a new multi-operation patch under a new full key.
        driver.source.revokeActor?.(ACTOR_A);
        const snapshotTexts = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const snapshotSv = svHex(authDoc);
        const snapshotDs = dsHex(authDoc);
        const read2 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const second = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_2, [
          ...rotatingInserts(read2, P1, ["n1", "n2", "n3"]),
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: P1,
            range: { start: paraOf(read2, P1).startAnchor, end: paraOf(read2, P1).endAnchor },
            mark: "italic",
            applied: true,
          },
        ]);
        const refused = await bridge.applyPatch(second);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("revoked");
        expect(refused.transient).toBeUndefined();
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(snapshotTexts);
        expect(svHex(authDoc)).toBe(snapshotSv);
        expect(dsHex(authDoc)).toBe(snapshotDs);
        // Terminal refusals replay verbatim with duplicate:true (CL-4c pipeline behaviour).
        const replay = await bridge.applyPatch(second);
        expect(replay.status).toBe("refused");
        expect(replay.reason).toBe("revoked");
        expect(replay.duplicate).toBe(true);
        expect(svHex(authDoc)).toBe(snapshotSv);
        expect(dsHex(authDoc)).toBe(snapshotDs);
        // Every replica keeps the merged first-patch text, byte-identical.
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replica of replicaTexts(replicas, FIELD)) {
          expect(replica).toEqual(snapshotTexts);
        }
        // No bucket debit: a second, still-admitted actor admits a full-bucket patch.
        bridge.admitAgentActor({ actorId: ACTOR_B, displayLabel: "Agent B", color: "#445566" });
        const readB = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const full = agentPatchFromRead(readB, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH_1, fiftyInsertsP1(readB));
        const fullReceipt = await bridge.applyPatch(full);
        expect(fullReceipt.status).toBe("applied");
        expect(fullReceipt.operationResults).toHaveLength(50);
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "witness 10 patch minted before revocation presented after (%s)",
  (kind) => {
    it("refuses revoked whole with the document unchanged", async () => {
      await withDriver(kind, async (driver) => {
        seedAbcdef(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        // Mint the full patch value before revocation lands.
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const minted = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_1, rotatingInserts(read, P1, ["q1", "q2"]));
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const beforeSv = svHex(authDoc);
        const beforeDs = dsHex(authDoc);
        driver.source.revokeActor?.(ACTOR_A);
        const refused = await bridge.applyPatch(minted);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("revoked");
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(["abcdef"]);
        expect(svHex(authDoc)).toBe(beforeSv);
        expect(dsHex(authDoc)).toBe(beforeDs);
        const replay = await bridge.applyPatch(minted);
        expect(replay.reason).toBe("revoked");
        expect(replay.duplicate).toBe(true);
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "witness 10 already-merged text unchanged, later human edit merges beside (%s)",
  (kind) => {
    it("revocation stops future operations and rewrites no history", async () => {
      await withDriver(kind, async (driver) => {
        seedAbcdef(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const first = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_1, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(read, P1).endAnchor, text: "AGENT" },
        ]);
        expect((await bridge.applyPatch(first)).status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        driver.source.revokeActor?.(ACTOR_A);
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(["abcdefAGENT"]);
        const revokedSv = svHex(authDoc);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replica of replicaTexts(replicas, FIELD)) {
          expect(replica).toEqual(["abcdefAGENT"]);
        }
        // A later human edit still merges beside the revoked actor's text.
        await driver.remoteTransact(FIELD, (text) => {
          text.insert(text.length, "H");
        });
        const after = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(after).toEqual(["abcdefAGENTH"]);
        expect(svHex(authDoc)).not.toBe(revokedSv);
        syncAgentReplicas(authDoc, replicas);
        for (const replica of replicaTexts(replicas, FIELD)) {
          expect(replica).toEqual(["abcdefAGENTH"]);
        }
        // dsHex folds the snapshot's state vector, so it moves with the human
        // edit; the refusal cases above are the delete-set stability proof.
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "witness 10 refusal scope and re-admission (%s)",
  (kind) => {
    it("revoking one actor refuses only it; a human and another agent still merge; re-admission restores evaluation", async () => {
      await withDriver(kind, async (driver) => {
        seedAbcdef(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        bridge.admitAgentActor({ actorId: ACTOR_B, displayLabel: "Agent B", color: "#445566" });
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const fromA = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_1, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(read, P1).endAnchor, text: "A" },
        ]);
        expect((await bridge.applyPatch(fromA)).status).toBe("applied");
        driver.source.revokeActor?.(ACTOR_A);
        const readAfter = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const refusedA = agentPatchFromRead(readAfter, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_2, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(readAfter, P1).endAnchor, text: "A2" },
        ]);
        expect((await bridge.applyPatch(refusedA)).status).toBe("refused");
        expect((await bridge.applyPatch(refusedA)).reason).toBe("revoked");
        // The still-admitted agent and a human driver transaction merge beside it.
        const fromB = agentPatchFromRead(readAfter, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH_1, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(readAfter, P1).endAnchor, text: "B" },
        ]);
        expect((await bridge.applyPatch(fromB)).status).toBe("applied");
        await driver.remoteTransact(FIELD, (text) => {
          text.insert(text.length, "H");
        });
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(["abcdefABH"]);
        // Re-admitting the same actorId afresh makes its next patch evaluable
        // again under its presented epoch: the double exhibits a
        // membership-only epoch discipline (register AMB-D8) — any presented
        // epoch evaluates once the actor is admitted; epoch continuity is
        // not checked DS-side and production minting stays unverified.
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        const readRe = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          anchorRequests: anchorRequestsFor(7),
        });
        const fromARe = agentPatchFromRead(readRe, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_3, [
          { type: "insert", fieldKey: FIELD, paragraphId: P1, at: paraOf(readRe, P1).endAnchor, text: "A3" },
        ]);
        expect((await bridge.applyPatch(fromARe)).status).toBe("applied");
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(["abcdefABHA3"]);
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "witness 10 full-family revocation (%s)",
  (kind) => {
    it("a revoked full actor's metadata+HR+link patch refuses whole with metadata, atoms and marks unchanged", async () => {
      await withDriver(kind, async (driver) => {
        seedFull(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        bridge.admitAgentActor({ actorId: ACTOR_A, displayLabel: "Agent A", color: "#112233" });
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here = segmentAnchorsFor(read, LINKP, "here");
        const pre = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_1, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: BODY, metadata: { ...plainMeta(), blockKind: "heading", headingLevel: 2 } },
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read, BODY).endAnchor, newParagraphId: HR_NEW },
          { type: "mark", fieldKey: FIELD, paragraphId: LINKP, range: { start: here.start, end: here.end }, mark: "link", href: HREF_B, title: "Title B" },
        ]);
        expect((await bridge.applyPatch(pre)).status).toBe("applied");
        const snapshot = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const snapshotSv = svHex(authDoc);
        const snapshotDs = dsHex(authDoc);
        // Mint the refused full patch before revocation, present it after.
        const read2 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here2 = segmentAnchorsFor(read2, LINKP, "here");
        const refusedPatch = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH_2, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: BODY, metadata: { ...plainMeta(), blockKind: "heading", headingLevel: 3 } },
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read2, LINKP).startAnchor, newParagraphId: HR_NEW2 },
          { type: "mark", fieldKey: FIELD, paragraphId: BODY, range: { start: paraOf(read2, BODY).startAnchor, end: paraOf(read2, BODY).endAnchor }, mark: "bold", applied: true },
          { type: "mark", fieldKey: FIELD, paragraphId: LINKP, range: { start: here2.start, end: here2.end }, mark: "link", href: HREF_A },
        ]);
        driver.source.revokeActor?.(ACTOR_A);
        const refused = await bridge.applyPatch(refusedPatch);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("revoked");
        // Revocation is checked before any family is applied: metadata, HR
        // atoms and link marks are all unchanged.
        const after = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(after).toEqual(snapshot);
        expect(svHex(authDoc)).toBe(snapshotSv);
        expect(dsHex(authDoc)).toBe(snapshotDs);
        expect(fullBlockById(after, HR_NEW2)).toBeUndefined();
        expect(fullBlockById(after, BODY)?.metadata).toEqual({ ...plainMeta(), blockKind: "heading", headingLevel: 2 });
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(snapshot);
        }
        // The pre-revocation effects survive revocation untouched, and a
        // later human edit still merges beside them.
        await driver.remoteTransact(FIELD, (text) => {
          text.insert(text.length, "H");
        });
        const survived = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(fullBlockById(survived, BODY)?.metadata).toEqual({ ...plainMeta(), blockKind: "heading", headingLevel: 2 });
        expect(fullBlockById(survived, HR_NEW)?.kind).toBe("horizontalRule");
        const linkBlock = fullBlockById(survived, LINKP);
        expect(linkBlock).toBeDefined();
        const hereMarks = (linkBlock?.segments ?? []).find((segment) => segment.type === "text" && segment.text === "here")?.marks;
        expect(hereMarks).toEqual({ link: HREF_B, linkTitle: "Title B" });
      });
    });
  },
);
