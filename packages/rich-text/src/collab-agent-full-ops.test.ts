/**
 * CL-4d1 witnesses 11 + 9-bridge — full operations through the bridge double
 * (spec §8 CL-4 witnesses `CL-4-11-full-operations` and the bridge half of
 * `CL-4-9-full-validation`; R-FULL-OP-1, §4.11 full admitted table).
 *
 * Every patch/read body runs parameterised against (a) the in-memory double
 * source and (b) the CL-3c Hocuspocus-backed source, with the provider label
 * asserted in the run, bridge headless (no bound editor mounted).
 * Authoritative outcomes are asserted on the source document (capture at the
 * full format including metadata and mark runs, state vector, delete set)
 * and, where stated, on at least two replica docs synced from it.
 *
 * Sections (kept separate so coverages never merge):
 *   A. profile seam of the double (Task 2);
 *   B. full application: setBlockMetadata, HR insert/delete, full mark keys
 *      (Task 3, R-FULL-OP-1);
 *   C. full read-back fidelity + provenance linkage (Task 4, R-READ-3 half);
 *   D. CL-4-9-full-validation bridge-preflight half (Task 6).
 * Inverses live in `collab-agent-full-revert.test.ts`; the href race in
 * `collab-agent-full-race.test.ts`.
 *
 * RED on the CL-4c base: no profile seam exists — a `"full"` construction is
 * silently P0, so every full patch is refused whole at the shape step and
 * full reads throw on the full mark runs.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
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
  seedAgentField,
  setupAgentBridge,
  storeMarkOperationOf,
  svHex,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import type {
  AgentEditOperation,
  AgentParagraphState,
  FullBlockMetadata,
  RelativeAnchor,
  RichTextInlineMarks,
} from "./collaboration.js";
import type { RichTextDocument } from "./model.js";
import { canonicalHrDefaults, canonicalPlainMetadata } from "./editor-full-markdown.js";

const DOCUMENT_ID = "canvas:cl4d1-full-ops";
const SESSION_ID = "session:cl4d1-full-ops";
const FIELD = "description";
const EPOCH = "epoch:1";

const HEAD = "h:title";
const BODY = "h:body";
const SRC = "h:src";
const M1 = "h:m1";
const M2 = "h:m2";
const CONT = "h:cont";
const CODE = "h:code";
const BEFORE = "h:before";
const HR1 = "h:hr1";
const AFTER = "h:after";
const LINKP = "h:linkp";

const HREF_A = "https://a.example/x";
const HREF_B = "https://b.example/y";

let actorSeq = 0;
function freshActor(): string {
  actorSeq += 1;
  return `actor:full-ops-${actorSeq}`;
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

function headingMeta(level: 1 | 2 | 3 | 4 | 5 | 6): FullBlockMetadata {
  return { ...canonicalPlainMetadata(), blockKind: "heading", headingLevel: level } as FullBlockMetadata;
}

function codeMeta(language: string): FullBlockMetadata {
  return { ...canonicalPlainMetadata(), blockKind: "codeBlock", codeLanguage: language } as FullBlockMetadata;
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

/** Standard full witness field: heading, body, ordered run (source + two
    members + continuation), code block, HR between paragraphs, link run. */
function standardFullDoc(): RichTextDocument {
  return fullDoc([
    fullPara(HEAD, [ftext("Title")], headingMeta(1)),
    fullPara(BODY, [ftext("hello world")], plainMeta()),
    fullPara(SRC, [ftext("item one")], orderedSourceMeta(1)),
    fullPara(M1, [ftext("item two")], orderedMemberMeta(M1)),
    fullPara(M2, [ftext("item three")], orderedMemberMeta(M2)),
    fullPara(CONT, [ftext("continued")], {
      ...orderedMemberMeta(M2),
      listItemId: M2,
    } as FullBlockMetadata),
    fullPara(CODE, [ftext("const a = 1;"), { type: "hardBreak" }, ftext("const b = 2;")], codeMeta("ts")),
    fullPara(BEFORE, [ftext("before hr")], plainMeta()),
    fullHr(HR1),
    fullPara(AFTER, [ftext("after hr")], plainMeta()),
    fullPara(LINKP, [
      ftext("click "),
      ftext("here", { link: HREF_A, linkTitle: "Title A" }),
      ftext(" now"),
    ], plainMeta()),
  ]);
}

function seedStandard(driver: AgentWitnessDriver): void {
  seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, standardFullDoc());
}

function paraOf(read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> }, id: string): AgentParagraphState {
  const found = read.fields[0]?.paragraphs.find((entry) => entry.paragraphId === id);
  if (found === undefined) throw new Error(`witness: no paragraph ${id} in read`);
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
  throw new Error(`witness: no segment "${text}" in ${paragraphId}`);
}

function marksOf(block: RichTextDocument["blocks"][number], text: string): RichTextInlineMarks | null {
  if (block.kind !== "paragraph" || block.segments === undefined) return null;
  for (const segment of block.segments) {
    if (segment.type === "text" && segment.text === text) return segment.marks;
  }
  return null;
}

function marksContaining(block: RichTextDocument["blocks"][number], part: string): RichTextInlineMarks | null {
  if (block.kind !== "paragraph" || block.segments === undefined) return null;
  for (const segment of block.segments) {
    if (segment.type === "text" && segment.text.includes(part)) return segment.marks;
  }
  return null;
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 section A: profile seam (%s)",
  (kind) => {
    it("a p0 double still refuses a setBlockMetadata patch whole", async () => {
      await withDriver(kind, async (driver) => {
        // P0 seed: a p0 double cannot read a full field (full marks sit
        // outside its admitted table, by design).
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, p0Doc([p0Para("paragraph:1", "ab")]));
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: BODY,
            metadata: headingMeta(2),
          },
        ]);
        const receipt = await bridge.applyPatch(patch);
        expect(receipt.status).toBe("refused");
        expect(receipt.reason).toBe("incompatible-schema");
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
      });
    });

    it("a full double admits constructed families and refuses scope-denied outside them", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        // Full construction without setBlockMetadata in the admitted set.
        const { bridge } = setupAgentBridge(
          driver.source,
          DOCUMENT_ID,
          SESSION_ID,
          [FIELD],
          FULL_FAMILIES.filter((family) => family !== "setBlockMetadata"),
          undefined,
          "full",
        );
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: BODY,
            metadata: headingMeta(2),
          },
        ]);
        const refused = await bridge.applyPatch(patch);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("scope-denied");

        // Full construction with the family admitted applies it.
        const full = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read2 = full.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const apply = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: BODY,
            metadata: headingMeta(2),
          },
        ]);
        const receipt = await full.bridge.applyPatch(apply);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual([BODY]);
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(fullBlockById(captured, BODY)?.metadata).toEqual(headingMeta(2));
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 section B: full application R-FULL-OP-1 (%s)",
  (kind) => {
    it("applies setBlockMetadata heading, language, member-depth and run-start changes", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: BODY, metadata: headingMeta(2) },
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: CODE, metadata: codeMeta("js") },
          {
            type: "setBlockMetadata",
            fieldKey: FIELD,
            paragraphId: M1,
            metadata: { ...orderedMemberMeta(M1), listDepth: 1, containerOrder: ["list", "list"] } as FullBlockMetadata,
          },
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: SRC, metadata: orderedSourceMeta(5) },
        ]);
        const receipt = await bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.map((entry) => entry.resultParagraphIds)).toEqual([
          [BODY],
          [CODE],
          [M1],
          [SRC],
        ]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(fullBlockById(captured, BODY)?.metadata).toEqual(headingMeta(2));
        expect(fullBlockById(captured, CODE)?.metadata).toEqual(codeMeta("js"));
        expect(fullBlockById(captured, M1)?.metadata).toEqual({
          ...orderedMemberMeta(M1),
          listDepth: 1,
          containerOrder: ["list", "list"],
        });
        expect(fullBlockById(captured, SRC)?.metadata).toEqual(orderedSourceMeta(5));
        // Full capture round-trips the marks of the untouched link run.
        expect(marksOf(fullBlockById(captured, LINKP)!, "here")).toEqual({ link: HREF_A, linkTitle: "Title A" });
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("applies link/title replacement and null removals per key", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here = segmentAnchorsFor(read, LINKP, "here");
        const setTitle = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: here.start, end: here.end },
            mark: "link",
            href: HREF_B,
            title: "Title B",
          },
        ]);
        expect((await bridge.applyPatch(setTitle)).status).toBe("applied");
        let captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(marksOf(fullBlockById(captured, LINKP)!, "here")).toEqual({ link: HREF_B, linkTitle: "Title B" });

        const read2 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here2 = segmentAnchorsFor(read2, LINKP, "here");
        const clearTitle = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: here2.start, end: here2.end },
            mark: "link",
            href: HREF_B,
            title: null,
          },
        ]);
        expect((await bridge.applyPatch(clearTitle)).status).toBe("applied");
        captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(marksOf(fullBlockById(captured, LINKP)!, "here")).toEqual({ link: HREF_B });

        const read3 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here3 = segmentAnchorsFor(read3, LINKP, "here");
        const clearLink = agentPatchFromRead(read3, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: here3.start, end: here3.end },
            mark: "link",
            href: null,
          },
        ]);
        expect((await bridge.applyPatch(clearLink)).status).toBe("applied");
        captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(marksContaining(fullBlockById(captured, LINKP)!, "here")).toEqual({});
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("applies strike and underline marks", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const body = paraOf(read, BODY);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: BODY,
            range: { start: body.startAnchor, end: body.endAnchor },
            mark: "strike",
            applied: true,
          },
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: paraOf(read, LINKP).startAnchor, end: paraOf(read, LINKP).endAnchor },
            mark: "underline",
            applied: true,
          },
        ]);
        expect((await bridge.applyPatch(patch)).status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(marksOf(fullBlockById(captured, BODY)!, "hello world")).toEqual({ strike: true });
        expect(marksOf(fullBlockById(captured, LINKP)!, "click ")).toEqual({ underline: true });
        expect(marksOf(fullBlockById(captured, LINKP)!, "here")).toEqual({
          underline: true,
          link: HREF_A,
          linkTitle: "Title A",
        });
      });
    });

    it("inserts and deletes a horizontal rule, sole block with replacement", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const insert = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "insertHorizontalRule", fieldKey: FIELD, at: paraOf(read, BEFORE).endAnchor, newParagraphId: "h:hr-new" },
        ]);
        const inserted = await bridge.applyPatch(insert);
        expect(inserted.status).toBe("applied");
        expect(inserted.operationResults?.[0]?.resultParagraphIds).toEqual(["h:hr-new"]);
        let captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const order = captured.blocks.map((block) => block.paragraphId);
        expect(order).toEqual([HEAD, BODY, SRC, M1, M2, CONT, CODE, BEFORE, "h:hr-new", HR1, AFTER, LINKP]);
        expect(fullBlockById(captured, "h:hr-new")?.kind).toBe("horizontalRule");
        expect(fullBlockById(captured, "h:hr-new")?.hrMetadata).toEqual(canonicalHrDefaults());

        const read2 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const del = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "h:hr-new" },
        ]);
        const deleted = await bridge.applyPatch(del);
        expect(deleted.status).toBe("applied");
        expect(deleted.operationResults?.[0]?.resultParagraphIds).toEqual([]);
        captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([
          HEAD, BODY, SRC, M1, M2, CONT, CODE, BEFORE, HR1, AFTER, LINKP,
        ]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("ignores a supplied replacement on a non-sole horizontal-rule deletion", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: HR1, replacementParagraphId: "h:unused" },
        ]);
        const receipt = await bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([
          HEAD, BODY, SRC, M1, M2, CONT, CODE, BEFORE, AFTER, LINKP,
        ]);
        expect(fullBlockById(captured, "h:unused")).toBeUndefined();
      });
    });

    it("deletes a sole horizontal-rule block only with a replacement id", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc([fullHr("h:only")]));
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const bare = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "h:only" },
        ]);
        const refused = await bridge.applyPatch(bare);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("incompatible-schema");
        const withReplacement = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "deleteHorizontalRule", fieldKey: FIELD, paragraphId: "h:only", replacementParagraphId: "h:fresh" },
        ]);
        const receipt = await bridge.applyPatch(withReplacement);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["h:fresh"]);
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.blocks).toHaveLength(1);
        expect(captured.blocks[0]?.paragraphId).toBe("h:fresh");
        expect(captured.blocks[0]?.kind).toBe("paragraph");
        expect(authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual([""]);
      });
    });

    it("refuses over-budget metadata and unsafe href whole with byte-identical doc", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const heavy = {
          ...plainMeta(),
          listKind: "bullet",
          listDepth: 1999,
          blockquoteDepth: 1999,
          containerOrder: [...Array<string>(1999).fill("quote"), ...Array<string>(2000).fill("list")],
        } as unknown as FullBlockMetadata;
        const tooLarge = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: BODY, metadata: heavy },
        ]);
        const refusedLarge = await bridge.applyPatch(tooLarge);
        expect(refusedLarge.status).toBe("refused");
        expect(refusedLarge.reason).toBe("too-large");
        const body = paraOf(read, BODY);
        const unsafe = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: BODY,
            range: { start: body.startAnchor, end: body.endAnchor },
            mark: "link",
            href: "javascript:alert(1)",
          },
        ]);
        const refusedHref = await bridge.applyPatch(unsafe);
        expect(refusedHref.status).toBe("refused");
        expect(refusedHref.reason).toBe("incompatible-schema");
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
      });
    });

    it("refuses delete and mark ranges crossing a horizontal-rule atom", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const crossing = {
          start: paraOf(read, BEFORE).startAnchor,
          end: paraOf(read, AFTER).endAnchor,
        };
        const del = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          { type: "delete", fieldKey: FIELD, paragraphId: BEFORE, range: crossing },
        ]);
        const refusedDel = await bridge.applyPatch(del);
        expect(refusedDel.status).toBe("refused");
        expect(refusedDel.reason).toBe("structural-conflict");
        const mark = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, freshActor(), EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: BEFORE,
            range: crossing,
            mark: "strike",
            applied: true,
          },
        ]);
        const refusedMark = await bridge.applyPatch(mark);
        expect(refusedMark.status).toBe("refused");
        expect(refusedMark.reason).toBe("structural-conflict");
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 section C: full read-back and provenance linkage (%s)",
  (kind) => {
    it("reads a seeded full field end to end with metadata, runs and HR atoms", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(read.fields[0]?.nextPageToken).toBeUndefined();
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const paragraphs = read.fields[0]?.paragraphs ?? [];
        expect(paragraphs.map((entry) => entry.paragraphId)).toEqual(
          captured.blocks.map((block) => block.paragraphId),
        );
        for (const block of captured.blocks) {
          const entry = paraOf(read, block.paragraphId);
          if (block.kind === "horizontalRule") {
            expect(entry.kind).toBe("horizontalRule");
            expect(entry.text).toBeUndefined();
            expect(entry.segments).toBeUndefined();
            continue;
          }
          expect(entry.kind).toBe("paragraph");
          expect(entry.metadata).toEqual(block.metadata);
          const capturedRuns = (block.segments ?? []).filter(
            (segment): segment is { type: "text"; text: string; marks: RichTextInlineMarks } =>
              segment.type === "text",
          );
          const readRuns = (entry.segments ?? []).filter(
            (segment): segment is { type: "text"; text: string; marks: RichTextInlineMarks; startAnchor: RelativeAnchor; endAnchor: RelativeAnchor } =>
              segment.type === "text",
          );
          expect(readRuns.map((segment) => ({ text: segment.text, marks: segment.marks }))).toEqual(
            capturedRuns.map((segment) => ({ text: segment.text, marks: segment.marks })),
          );
        }
        // Link run with title reads back whole.
        const linkEntry = paraOf(read, LINKP);
        const here = (linkEntry.segments ?? []).find(
          (segment) => segment.type === "text" && segment.text === "here",
        );
        expect(here?.type).toBe("text");
        if (here?.type === "text") {
          expect(here.marks).toEqual({ link: HREF_A, linkTitle: "Title A" });
        }
        // Code lines read back as hard-break segments.
        const codeEntry = paraOf(read, CODE);
        expect(codeEntry.segments?.map((segment) => segment.type)).toEqual(["text", "hardBreak", "text"]);
        // No deleted opener here, so no runMetadata beyond live sources.
        expect(read.fields[0]?.runMetadata ?? {}).toEqual({});
      });
    });

    it("returns a still-referenced deleted opener in runMetadata", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        // Merge the run source away: SRC content joins BODY, its metadata
        // entry becomes a still-referenced deleted opener (R-FULL-META-2).
        const merge = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "mergeWithPrevious", fieldKey: FIELD, paragraphId: SRC },
        ]);
        expect((await bridge.applyPatch(merge)).status).toBe("applied");
        const after = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(after.fields[0]?.paragraphs.map((entry) => entry.paragraphId)).not.toContain(SRC);
        expect(after.fields[0]?.runMetadata?.[SRC]).toEqual(orderedSourceMeta(1));
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        expect(captured.retainedRunMetadata?.[SRC]).toEqual(orderedSourceMeta(1));
        // Run-value-only write on the deleted source is admitted; a
        // block-local change on the retired id refuses target-gone (R-STR-5).
        const read2 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const runOnly = agentPatchFromRead(read2, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: SRC, metadata: orderedSourceMeta(9) },
        ]);
        expect((await bridge.applyPatch(runOnly)).status).toBe("applied");
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD).retainedRunMetadata?.[SRC]).toEqual(
          orderedSourceMeta(9),
        );
        const read3 = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const retired = agentPatchFromRead(read3, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: SRC, metadata: headingMeta(3) },
        ]);
        const refused = await bridge.applyPatch(retired);
        expect(refused.status).toBe("refused");
        expect(refused.reason).toBe("target-gone");
      });
    });

    it("keeps a metadata-heavy page inside every R-READ-1 cap", async () => {
      await withDriver(kind, async (driver) => {
        const heavyMeta = (seed: number): FullBlockMetadata =>
          ({
            ...canonicalPlainMetadata(),
            listKind: "bullet",
            listDepth: 350,
            blockquoteDepth: 350,
            listItemId: `h:heavy-${seed}`,
            listRunId: `h:heavy-${seed}`,
            containerOrder: [...Array<string>(350).fill("quote"), ...Array<string>(351).fill("list")],
          }) as unknown as FullBlockMetadata;
        const blocks = [];
        for (let index = 0; index < 10; index += 1) {
          blocks.push(fullPara(`h:heavy-${index}`, [ftext(`heavy ${index}`)], heavyMeta(index)));
        }
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, fullDoc(blocks));
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(read.fields[0]?.paragraphs).toHaveLength(10);
        expect(read.fields[0]?.nextPageToken).toBeUndefined();
        const bytes = Buffer.byteLength(JSON.stringify(read), "utf8");
        expect(bytes).toBeLessThanOrEqual(256 * 1024);
        let units = 0;
        let anchors = 0;
        for (const entry of read.fields[0]?.paragraphs ?? []) {
          units += entry.text?.length ?? 0;
          anchors += 2 + 2 * (entry.segments?.length ?? 0);
        }
        expect(units).toBeLessThanOrEqual(20000);
        expect(anchors).toBeLessThanOrEqual(512);
      });
    });

    it("records one provenance intent per asserted mark key at terminal application", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge, store } = setupAgentBridge(
          driver.source,
          DOCUMENT_ID,
          SESSION_ID,
          [FIELD],
          FULL_FAMILIES,
          undefined,
          "full",
        );
        const actor = freshActor();
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const here = segmentAnchorsFor(read, LINKP, "here");
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
          {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: here.start, end: here.end },
            mark: "link",
            href: HREF_B,
            title: "Title B",
          },
        ]);
        const receipt = await bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        const readBack = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const hereBack = (paraOf(readBack, LINKP).segments ?? []).find(
          (segment) => segment.type === "text" && segment.text === "here",
        );
        if (hereBack?.type !== "text") throw new Error("witness: link run missing after patch");
        expect(hereBack.marks).toEqual({ link: HREF_B, linkTitle: "Title B" });
        const intents = store.provenanceLog.filter((entry) => entry.actorId === actor);
        expect(intents).toHaveLength(2);
        expect(intents[0]?.mark).toBe("link");
        expect(intents[0]?.value).toBe(HREF_B);
        expect(intents[1]?.mark).toBe("linkTitle");
        expect(intents[1]?.value).toBe("Title B");
        expect((intents[1]?.seq ?? 0)).toBeGreaterThan(intents[0]?.seq ?? 0);
        const record = storeMarkOperationOf(store, receipt.key);
        expect(record?.markIntentIds).toEqual([intents[0]?.intentId, intents[1]?.intentId]);
      });
    });

    it("keeps p0 reads free of metadata and runMetadata", async () => {
      await withDriver(kind, async (driver) => {
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
        const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
        const { seedFieldFromDocument } = await import("./collab-codec.js");
        seedFieldFromDocument(binding.text, binding.fieldMeta, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "plain" }],
        });
        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(read.fields[0]?.runMetadata).toBeUndefined();
        for (const entry of read.fields[0]?.paragraphs ?? []) {
          expect("metadata" in entry).toBe(false);
        }
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 section D: CL-4-9-full-validation bridge half (%s)",
  (kind) => {
    it("admits link-null, title-null and combined removals, alone and with an insert", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const prime = async (): Promise<void> => {
          const primed = bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          });
          const patch = agentPatchFromRead(primed, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            {
              type: "mark",
              fieldKey: FIELD,
              paragraphId: LINKP,
              range: { start: paraOf(primed, LINKP).startAnchor, end: paraOf(primed, LINKP).endAnchor },
              mark: "bold",
              applied: true,
            },
            {
              type: "mark",
              fieldKey: FIELD,
              paragraphId: BODY,
              range: { start: paraOf(primed, BODY).startAnchor, end: paraOf(primed, BODY).endAnchor },
              mark: "code",
              applied: true,
            },
          ]);
          expect((await bridge.applyPatch(patch)).status).toBe("applied");
        };
        const removalOp = (
          read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> },
          shape: "link-null" | "title-null" | "combined",
        ): AgentEditOperation => {
          const here = segmentAnchorsFor(read, LINKP, "here");
          const base = {
            type: "mark",
            fieldKey: FIELD,
            paragraphId: LINKP,
            range: { start: here.start, end: here.end },
            mark: "link",
          } as const;
          if (shape === "link-null") return { ...base, href: null } as AgentEditOperation;
          if (shape === "title-null") return { ...base, href: HREF_A, title: null } as AgentEditOperation;
          return { ...base, href: null, title: null } as AgentEditOperation;
        };
        const expectedAfter = (shape: "link-null" | "title-null" | "combined"): RichTextInlineMarks => {
          if (shape === "link-null") return { bold: true };
          if (shape === "title-null") return { bold: true, link: HREF_A };
          return { bold: true };
        };
        // Each removal shape alone first, then combined with a valid text
        // insert — each patch from a freshly seeded and primed state, so the
        // "here" run still exists as its own segment for anchor minting.
        for (const shape of ["link-null", "title-null", "combined"] as const) {
          const primeFresh = async (): Promise<void> => {
            seedStandard(driver);
            await prime();
          };
          await primeFresh();
          const aloneRead = bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          });
          const alone = agentPatchFromRead(aloneRead, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            removalOp(aloneRead, shape),
          ]);
          const aloneReceipt = await bridge.applyPatch(alone);
          expect(aloneReceipt.status).toBe("applied");
          expect(aloneReceipt.operationResults).toHaveLength(1);
          let captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
          expect(marksContaining(fullBlockById(captured, LINKP)!, "here")).toEqual(expectedAfter(shape));
          expect(marksContaining(fullBlockById(captured, BODY)!, "hello world")).toEqual({ code: true });

          await primeFresh();
          const mixedRead = bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          });
          const mixed = agentPatchFromRead(mixedRead, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            removalOp(mixedRead, shape),
            { type: "insert", fieldKey: FIELD, paragraphId: BODY, at: paraOf(mixedRead, BODY).endAnchor, text: "!" },
          ]);
          const mixedReceipt = await bridge.applyPatch(mixed);
          expect(mixedReceipt.status).toBe("applied");
          expect(mixedReceipt.operationResults).toHaveLength(2);
          captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
          expect(marksContaining(fullBlockById(captured, LINKP)!, "here")).toEqual(expectedAfter(shape));
          expect(marksContaining(fullBlockById(captured, BODY)!, "hello world")).toEqual({ code: true });
        }
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        for (const replicaDoc of replicaFullDocs(replicas, FIELD)) {
          expect(replicaDoc).toEqual(captured);
        }
      });
    });

    it("refuses blockKind, headingLevel and codeLanguage on an HR id whole", async () => {
      await withDriver(kind, async (driver) => {
        seedStandard(driver);
        const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const actor = freshActor();
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        const beforeSv = svHex(authDoc);
        const beforeDs = dsHex(authDoc);
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicaBefore = replicaFullDocs(replicas, FIELD);
        const variants: Array<{ name: string; metadata: FullBlockMetadata }> = [
          { name: "blockKind", metadata: { ...plainMeta(), blockKind: "paragraph" } },
          { name: "headingLevel", metadata: { ...plainMeta(), blockKind: "heading", headingLevel: 2 } },
          { name: "codeLanguage", metadata: { ...plainMeta(), blockKind: "codeBlock", codeLanguage: "ts" } },
        ];
        for (const variant of variants) {
          const read = bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          });
          const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, EPOCH, [
            { type: "setBlockMetadata", fieldKey: FIELD, paragraphId: HR1, metadata: variant.metadata },
            {
              type: "insert",
              fieldKey: FIELD,
              paragraphId: BODY,
              at: paraOf(read, BODY).endAnchor,
              text: "!",
            },
          ]);
          const receipt = await bridge.applyPatch(patch);
          expect(receipt.status, `HR-target ${variant.name} refuses`).toBe("refused");
          expect(receipt.reason).toBe("incompatible-schema");
          // Decided at scratch preflight resulting-state validation (AMB-E3):
          // the pure validator cannot know the target is an HR id.
          expect(receipt.detail ?? "").toContain("HR admits wrapper keys only");
          expect(svHex(authDoc)).toBe(beforeSv);
          expect(dsHex(authDoc)).toBe(beforeDs);
          expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        }
        // No broadcast-equivalent change on replicas: pre-synced replicas are untouched.
        expect(replicaFullDocs(replicas, FIELD)).toEqual(replicaBefore);
      });
    });
  },
);
