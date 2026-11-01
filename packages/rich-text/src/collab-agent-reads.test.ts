/**
 * CL-4b Task 5 — witness 8: bounded reads and inline structure, plus §13
 * F4 (spec §5.6, §13 F4). Reads are addressed only through the Task 4
 * `readState` (no numeric offset in any request except the admitted
 * `anchorRequests` paragraph offsets and `maxParagraphs`); every body runs
 * parameterised on both sources with the provider label asserted, the
 * bridge headless.
 *
 * Sections: maximum-size paginated read (2 000 paragraphs, seeded by
 * generated construction); oversized refusals and retained-token refusals
 * (eviction, TTL expiry, restarted double); character-boundary
 * continuation of one over-long text run; N1 inline structure
 * (edit-after-hard-break, concurrent Shift+Enter, initially-empty
 * paragraph, capture/remount equality); F4 oversized preserved read;
 * read-before-patch (B5 state half).
 *
 * RED on the CL-4a base: the seam mints one live page per call (fresh
 * token, no `nextPageToken`, whole refusal over 100 paragraphs), so the
 * pagination, retention and chunk assertions below fail at first
 * assertion; the F4 section additionally fails loading its fixture.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AgentDocumentState,
  AgentFieldState,
  AgentParagraphState,
} from "./collaboration.js";
import { AgentBridgeReadRefusal } from "./collab-agent-bridge.test-support.js";
import {
  agentPatchFromRead,
  authDocOf,
  capturedTexts,
  dsHex,
  makeAgentReplica,
  openAgentDriver,
  p0Doc,
  p0Para,
  replicaTexts,
  setupAgentBridge,
  svHex,
  syncAgentReplicas,
  type AgentBridgeSetup,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { RichTextDocument } from "./model.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(SRC_DIR, "..", "fixtures", "canvas-live-raw-chunk-vectors.v1.json");

const DOCUMENT_ID = "canvas:cl4b-reads";
const SESSION_ID = "session:cl4b-reads";
const FIELD = "description";
const ACTOR = "actor:agent-reader";
const EPOCH = "epoch:reads-1";

const MAX_PARAGRAPHS = 100;
const MAX_UNITS = 20000;
const MAX_ANCHORS = 512;
const MAX_BYTES = 256 * 1024;

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  fields: readonly string[],
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, fields);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function seedField(driver: AgentWitnessDriver, fieldKey: string, document: RichTextDocument): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey });
  seedFieldFromDocument(binding.text, binding.fieldMeta, fieldKey, document);
}

function bridgeFor(
  driver: AgentWitnessDriver,
  fieldKeys: readonly string[],
  extra?: { now?: () => number; retentionTtlMs?: number },
): AgentBridgeSetup {
  return setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, fieldKeys, undefined, extra);
}

/** Independent cap accounting over one returned page (R-READ-1). */
function pageCaps(state: AgentDocumentState): { entries: number; units: number; anchors: number; bytes: number } {
  const field = state.fields[0] as AgentFieldState;
  let units = 0;
  let anchors = field.requestedAnchors?.length ?? 0;
  for (const entry of field.paragraphs) {
    units += entry.text?.length ?? 0;
    units += entry.raw?.length ?? 0;
    anchors += 2;
    for (const segment of entry.segments ?? []) anchors += 2;
  }
  return {
    entries: field.paragraphs.length,
    units,
    anchors,
    bytes: Buffer.byteLength(JSON.stringify(state), "utf8"),
  };
}

function expectCaps(state: AgentDocumentState, maxParagraphs = MAX_PARAGRAPHS): void {
  const caps = pageCaps(state);
  expect(caps.entries, "at most 100 paragraph entries").toBeLessThanOrEqual(Math.min(MAX_PARAGRAPHS, maxParagraphs));
  expect(caps.units, "at most 20 000 paragraph-offset units").toBeLessThanOrEqual(MAX_UNITS);
  expect(caps.anchors, "at most 512 anchors").toBeLessThanOrEqual(MAX_ANCHORS);
  expect(caps.bytes, "at most 256 KiB serialised").toBeLessThanOrEqual(MAX_BYTES);
}

/** Read every page from the field start under one retained token. */
async function readAllPages(
  setup: AgentBridgeSetup,
  first: AgentDocumentState,
  mutateBetween?: (pageIndex: number, state: AgentDocumentState) => void | Promise<void>,
): Promise<AgentDocumentState[]> {
  const pages = [first];
  let index = 0;
  for (;;) {
    const current = pages[pages.length - 1] as AgentDocumentState;
    if (mutateBetween !== undefined) await mutateBetween(index, current);
    const token = (current.fields[0] as AgentFieldState).nextPageToken;
    if (token === undefined) break;
    const next = setup.bridge.readState({
      binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
      pageToken: token,
      readToken: current.readToken,
    });
    expect(next.readToken, "one retained token across pages").toBe(first.readToken);
    expect(next.revision.stateVector, "retained revision across pages").toBe(first.revision.stateVector);
    expectCaps(next);
    pages.push(next);
    index += 1;
  }
  return pages;
}

function strippedSegments(entry: AgentParagraphState): unknown[] {
  return (entry.segments ?? []).map((segment) =>
    segment.type === "text"
      ? { type: "text", text: segment.text, marks: segment.marks }
      : { type: "hardBreak" },
  );
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
  throw new Error(`reads witness: separator not found for ${paragraphId}`);
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

interface FixtureCase {
  id: string;
  raw?: string;
  rawConstruction?: { pattern: string; repeat: number; prefix: string; suffix: string };
  rawUtf16Length: number;
  rawSha256: string;
  liveRaw?: string;
  liveRawSha256?: string;
  slicing: { chunkBudgetBytes: number; expectedChunks: unknown[] };
}

function fixtureCase(id: string): FixtureCase {
  const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as { cases: FixtureCase[] };
  const found = fixture.cases.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`reads witness: fixture case missing: ${id}`);
  return found;
}

function fixtureRaw(entry: FixtureCase): string {
  if (entry.raw !== undefined) return entry.raw;
  const construction = entry.rawConstruction;
  if (construction === undefined) throw new Error("reads witness: case has no raw material");
  return `${construction.prefix}${construction.pattern.repeat(construction.repeat)}${construction.suffix}`;
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 witness 8 — bounded reads (%s)",
  (kind) => {
    it("reads a 2 000-paragraph field end to end under one token, surviving a concurrent edit", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        const blocks = Array.from({ length: 2000 }, (_, index) => {
          const line = `l${index}-` + "x".repeat(110);
          return p0Para(`p:${index}`, line);
        });
        seedField(driver, FIELD, p0Doc(blocks));
        const setup = bridgeFor(driver, [FIELD]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const first = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(first.readToken).toMatch(/^read-token:/);
        expectCaps(first);
        // Retained reference captured from a clone at first-page time.
        const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
        const expected = captureDocumentFromField(binding.text, binding.fieldMeta, "focus.markdown.p0@1");
        const expectedBlocks = expected.document.blocks;
        let edited = false;
        const pages = await readAllPages(setup, first, async (pageIndex) => {
          if (pageIndex === 0 && !edited) {
            edited = true;
            // Concurrent human edit: one insert in an already-returned
            // paragraph and one in a not-yet-returned paragraph.
            await driver.remoteTransact(FIELD, (text) => {
              text.insert(separatorIndexOf(authDoc, FIELD, "p:0") + 2, "XX");
            });
            await driver.remoteTransact(FIELD, (text) => {
              text.insert(separatorIndexOf(authDoc, FIELD, "p:1500") + 2, "YY");
            });
          }
        });
        expect(pages.length, "2 000 paragraphs paginate").toBeGreaterThan(1);
        const ids: string[] = [];
        const texts: string[] = [];
        for (const page of pages) {
          for (const entry of (page.fields[0] as AgentFieldState).paragraphs) {
            ids.push(entry.paragraphId);
            texts.push(entry.text ?? "");
          }
        }
        expect(ids).toEqual(expectedBlocks.map((block) => block.paragraphId));
        expect(texts).toEqual(
          expectedBlocks.map((block) => (block.kind === "paragraph" ? ((block as { text?: string }).text ?? "") : "")),
        );
        // A fresh read after the edit sees the edited state under a new token.
        const fresh = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(fresh.readToken).not.toBe(first.readToken);
        expect(fresh.fields[0]?.paragraphs[0]?.text).toContain("XX");
      });
    }, 120000);

    it("refuses oversized and evicted reads whole with the document unchanged", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        seedField(driver, FIELD, p0Doc([p0Para("p:1", "abcdef".repeat(60)), p0Para("p:2", "tail")]));
        const setup = bridgeFor(driver, [FIELD]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const beforeTexts = capturedTexts({ document: captureDocumentFromField(
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).text,
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).fieldMeta,
          "focus.markdown.p0@1",
        ).document });
        const beforeSv = svHex(authDoc);
        const beforeDs = dsHex(authDoc);
        const overCap: Array<() => void> = [
          () =>
            setup.bridge.readState({
              binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
              maxParagraphs: 101,
            }),
          () =>
            setup.bridge.readState({
              binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
              anchorRequests: Array.from({ length: 300 }, (_, offset) => ({
                paragraphId: "p:1",
                paragraphOffset: offset,
              })),
            }),
        ];
        for (const run of overCap) {
          let refusal: unknown = null;
          try {
            run();
          } catch (error) {
            refusal = error;
          }
          expect(refusal).toBeInstanceOf(AgentBridgeReadRefusal);
          expect((refusal as AgentBridgeReadRefusal).reason).toBe("too-large");
        }
        expect(
          capturedTexts({ document: captureDocumentFromField(
            driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).text,
            driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).fieldMeta,
            "focus.markdown.p0@1",
          ).document }),
        ).toEqual(beforeTexts);
        expect(svHex(authDoc)).toBe(beforeSv);
        expect(dsHex(authDoc)).toBe(beforeDs);
        // Eviction: 9 retained reads for the same (document, session) drop
        // the oldest; its token then refuses target-gone for the whole read.
        const tokens: string[] = [];
        for (let index = 0; index < 9; index += 1) {
          tokens.push(
            setup.bridge.readState({
              binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            }).readToken,
          );
        }
        let evicted: unknown = null;
        try {
          setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            readToken: tokens[0],
          });
        } catch (error) {
          evicted = error;
        }
        expect(evicted).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((evicted as AgentBridgeReadRefusal).reason).toBe("target-gone");
        // A live token presented without a page reads from the start.
        const resumed = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
          readToken: tokens[tokens.length - 1],
        });
        expect(resumed.readToken).toBe(tokens[tokens.length - 1]);
        expect(resumed.fields[0]?.paragraphs[0]?.paragraphId).toBe("p:1");
        // TTL expiry: the injected clock passes the retention window.
        let now = 1_000_000;
        const clocked = bridgeFor(driver, [FIELD], { now: () => now, retentionTtlMs: 5 * 60 * 1000 });
        const leased = clocked.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        now += 5 * 60 * 1000 + 1;
        let expired: unknown = null;
        try {
          clocked.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            readToken: leased.readToken,
          });
        } catch (error) {
          expired = error;
        }
        expect(expired).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((expired as AgentBridgeReadRefusal).reason).toBe("target-gone");
        // Restart: a new bridge instance over the same source retains
        // nothing; a presented token refuses target-gone.
        const restarted = bridgeFor(driver, [FIELD]);
        let gone: unknown = null;
        try {
          restarted.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            readToken: leased.readToken,
          });
        } catch (error) {
          gone = error;
        }
        expect(gone).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((gone as AgentBridgeReadRefusal).reason).toBe("target-gone");
      });
    }, 120000);

    it("splits one over-long text run at character boundaries without splitting surrogate pairs", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        const run = `a${"😀".repeat(20000)}${"z".repeat(280000)}`;
        seedField(driver, FIELD, p0Doc([p0Para("p:1", run)]));
        const setup = bridgeFor(driver, [FIELD]);
        const first = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expectCaps(first);
        const pages = await readAllPages(setup, first);
        expect(pages.length, "one over-long run paginates").toBeGreaterThan(1);
        let text = "";
        for (const page of pages) {
          const entries = (page.fields[0] as AgentFieldState).paragraphs;
          expect(entries.map((entry) => entry.paragraphId)).toEqual(["p:1"]);
          for (const entry of entries) {
            for (const segment of entry.segments ?? []) {
              expect(segment.type).toBe("text");
              if (segment.type === "text") text += segment.text;
            }
          }
        }
        expect(text).toBe(run);
      });
    }, 120000);
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 witness 8 — inline structure N1 (%s)",
  (kind) => {
    it("edits after a hard break through anchorAfter with the break intact", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        seedField(driver, FIELD, p0Doc([p0Para("p:1", "a\nb")]));
        const setup = bridgeFor(driver, [FIELD]);
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const paragraph = (read.fields[0] as AgentFieldState).paragraphs[0] as AgentParagraphState;
        expect(paragraph.segments?.map((segment) => segment.type)).toEqual(["text", "hardBreak", "text"]);
        const hardBreak = (paragraph.segments as Array<{ type: string }>)[1];
        expect(hardBreak).toMatchObject({ type: "hardBreak" });
        const after = (hardBreak as { anchorAfter: unknown }).anchorAfter;
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
          { type: "insert", fieldKey: FIELD, paragraphId: "p:1", at: after as never, text: "X" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const texts of [capturedTexts({ document: captureDocumentFromField(
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).text,
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).fieldMeta,
          "focus.markdown.p0@1",
        ).document }), ...replicaTexts(replicas, FIELD)]) {
          expect(texts).toEqual(["a\nXb"]);
        }
      });
    });

    it("merges a concurrent Shift+Enter with an agent insert in one paragraph", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        seedField(driver, FIELD, p0Doc([p0Para("p:1", "hello")]));
        const setup = bridgeFor(driver, [FIELD]);
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const paragraph = (read.fields[0] as AgentFieldState).paragraphs[0] as AgentParagraphState;
        await driver.remoteTransact(FIELD, (text) => {
          text.insertEmbed(3, { hardBreak: true });
        });
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
          { type: "insert", fieldKey: FIELD, paragraphId: "p:1", at: paragraph.startAnchor, text: "X" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        const expected = ["Xhe\nllo"];
        expect(
          capturedTexts({ document: captureDocumentFromField(
            driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).text,
            driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).fieldMeta,
            "focus.markdown.p0@1",
          ).document }),
        ).toEqual(expected);
        for (const texts of replicaTexts(replicas, FIELD)) expect(texts).toEqual(expected);
      });
    });

    it("inserts through the startAnchor of an initially empty paragraph", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        seedField(driver, FIELD, p0Doc([p0Para("p:1", "")]));
        const setup = bridgeFor(driver, [FIELD]);
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const paragraph = (read.fields[0] as AgentFieldState).paragraphs[0] as AgentParagraphState;
        expect(paragraph.text).toBe("");
        expect(paragraph.segments ?? []).toEqual([]);
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
          { type: "insert", fieldKey: FIELD, paragraphId: "p:1", at: paragraph.startAnchor, text: "hi" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["p:1"]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const texts of replicaTexts(replicas, FIELD)) expect(texts).toEqual(["hi"]);
      });
    });

    it("reseeds a mixed field into a fresh text with identical documents, ids, marks and raw", async () => {
      await withDriver(kind, [FIELD, "remount"], async (driver) => {
        const preservedRaw = "<table><tr><td>verbatim</td></tr></table>";
        seedField(driver, FIELD, p0Doc([
          p0Para("p:mix", "a**b**c*d*e`f`g"),
          p0Para("p:break", "x\ny"),
          p0Para("p:empty", ""),
          { paragraphId: "p:raw", kind: "preserved", raw: preservedRaw, preservedKind: "example/preserved" } as never,
        ]));
        const setup = bridgeFor(driver, [FIELD, "remount"]);
        const captured = captureDocumentFromField(
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).text,
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD }).fieldMeta,
          "focus.markdown.p0@1",
        );
        // Remount into a fresh field text.
        const target = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "remount" });
        seedFieldFromDocument(target.text, target.fieldMeta, "remount", captured.document);
        const readField = (fieldKey: string): AgentFieldState =>
          setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey },
          }).fields[0] as AgentFieldState;
        const before = readField(FIELD);
        const after = readField("remount");
        expect(after.paragraphs.map((entry) => entry.paragraphId)).toEqual(
          before.paragraphs.map((entry) => entry.paragraphId),
        );
        expect(after.paragraphs.map((entry) => entry.kind)).toEqual(
          before.paragraphs.map((entry) => entry.kind),
        );
        expect(after.paragraphs.map((entry) => entry.text)).toEqual(
          before.paragraphs.map((entry) => entry.text),
        );
        expect(after.paragraphs.map(strippedSegments)).toEqual(before.paragraphs.map(strippedSegments));
        const rawBefore = before.paragraphs.find((entry) => entry.kind === "preserved");
        const rawAfter = after.paragraphs.find((entry) => entry.kind === "preserved");
        expect(rawAfter?.raw).toBe(rawBefore?.raw);
        expect(rawAfter?.raw).toBe(preservedRaw);
        expect(sha256Hex(rawAfter?.raw ?? "")).toBe(sha256Hex(preservedRaw));
      });
    });

    it("reads bounded state and patches by its anchors with convergence on every replica", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        seedField(driver, FIELD, p0Doc([p0Para("p:1", "abcdef")]));
        const setup = bridgeFor(driver, [FIELD]);
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expectCaps(read);
        const paragraph = (read.fields[0] as AgentFieldState).paragraphs[0] as AgentParagraphState;
        const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR, EPOCH, [
          { type: "insert", fieldKey: FIELD, paragraphId: "p:1", at: paragraph.endAnchor, text: "X" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["p:1"]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const texts of replicaTexts(replicas, FIELD)) expect(texts).toEqual(["abcdefX"]);
      });
    });
  },
);

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 §13 F4 — oversized preserved read (%s)",
  (kind) => {
    it("pages one preserved block over 256 KiB with exact byte reassembly under a retained revision", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        const entry = fixtureCase("f4-scale");
        const raw = fixtureRaw(entry);
        expect(raw.length, "fixture names the exact UTF-16 length").toBe(entry.rawUtf16Length);
        expect(sha256Hex(raw), "fixture names the exact SHA-256").toBe(entry.rawSha256);
        expect(raw.length, "raw exceeds 256 KiB").toBeGreaterThan(256 * 1024);
        seedField(driver, FIELD, p0Doc([
          p0Para("p:lead", "lead editable text"),
          { paragraphId: "p:raw", kind: "preserved", raw, preservedKind: "example/scale" } as never,
          p0Para("p:tail", "tail editable text"),
        ]));
        const setup = bridgeFor(driver, [FIELD]);
        const first = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expectCaps(first);
        let edited = false;
        const pages = await readAllPages(setup, first, async (pageIndex) => {
          if (pageIndex === 0 && !edited) {
            edited = true;
            await driver.remoteTransact(FIELD, (text) => {
              const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
              text.insert(separatorIndexOf(authDoc, FIELD, "p:tail") + 2, "HUMAN");
            });
          }
        });
        const preserved = pages.flatMap((page) =>
          (page.fields[0] as AgentFieldState).paragraphs.filter((para) => para.paragraphId === "p:raw"),
        );
        expect(preserved.length, "preserved block paginates").toBeGreaterThan(1);
        let offset = 0;
        let startAnchor: unknown = null;
        let endAnchor: unknown = null;
        let reassembled = "";
        for (const [index, chunk] of preserved.entries()) {
          const last = index === preserved.length - 1;
          expect(chunk.kind).toBe("preserved");
          expect(chunk.text, "no text on any preserved entry").toBeUndefined();
          expect(chunk.segments, "no segments on any preserved entry").toBeUndefined();
          expect(typeof chunk.raw, "every preserved entry carries raw bytes").toBe("string");
          expect((chunk.raw as string).length, "no metadata-only entry").toBeGreaterThan(0);
          expect(chunk.rawOffset, "contiguous offsets from 0").toBe(offset);
          expect(chunk.rawComplete, "completion only on the last chunk").toBe(last);
          if (startAnchor === null) {
            startAnchor = chunk.startAnchor;
            endAnchor = chunk.endAnchor;
          } else {
            expect(chunk.startAnchor, "identical boundary anchors").toBe(startAnchor);
            expect(chunk.endAnchor, "identical boundary anchors").toBe(endAnchor);
          }
          reassembled += chunk.raw as string;
          offset += (chunk.raw as string).length;
        }
        expect(offset).toBe(raw.length);
        expect(reassembled).toBe(raw);
        expect(sha256Hex(reassembled), "UTF-8 byte equality against the fixture digest").toBe(entry.rawSha256);
        // Neighbouring paragraphs read whole and unaffected (retained slice).
        const lead = pages.flatMap((page) => (page.fields[0] as AgentFieldState).paragraphs)
          .find((para) => para.paragraphId === "p:lead");
        const tail = pages.flatMap((page) => (page.fields[0] as AgentFieldState).paragraphs)
          .find((para) => para.paragraphId === "p:tail");
        expect(lead?.text).toBe("lead editable text");
        expect(tail?.text).toBe("tail editable text");
        // A fresh read after the neighbour edit sees the edited neighbour.
        const freshFirst = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expect(freshFirst.readToken).not.toBe(first.readToken);
        const freshPages = await readAllPages(setup, freshFirst);
        const freshTail = freshPages
          .flatMap((page) => (page.fields[0] as AgentFieldState).paragraphs)
          .find((para) => para.paragraphId === "p:tail");
        expect(freshTail?.text).toContain("HUMAN");
        // A single-page request that itself exceeds a cap is still refused
        // too-large with no anchors minted.
        let refusal: unknown = null;
        try {
          setup.bridge.readState({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
            maxParagraphs: 101,
          });
        } catch (error) {
          refusal = error;
        }
        expect(refusal).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((refusal as AgentBridgeReadRefusal).reason).toBe("too-large");
      });
    }, 120000);

    it("slices the retained revision after the live preserved bytes move", async () => {
      await withDriver(kind, [FIELD], async (driver) => {
        const entry = fixtureCase("retained-slicing");
        const raw = fixtureRaw(entry);
        expect(sha256Hex(raw)).toBe(entry.rawSha256);
        const liveRaw = entry.liveRaw as string;
        expect(sha256Hex(liveRaw)).toBe(entry.liveRawSha256);
        seedField(driver, FIELD, p0Doc([
          p0Para("p:lead", "lead"),
          { paragraphId: "p:raw", kind: "preserved", raw, preservedKind: "example/retained" } as never,
          p0Para("p:tail", "tail"),
        ]));
        const setup = bridgeFor(driver, [FIELD]);
        const first = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        expectCaps(first);
        // Concurrent live divergence of the preserved bytes themselves.
        await driver.remoteTransact(FIELD, (text) => {
          const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
          const at = separatorIndexOf(authDoc, FIELD, "p:raw") + 1;
          text.delete(at, 1);
          text.insertEmbed(at, { preserved: { raw: liveRaw } });
        });
        const pages = await readAllPages(setup, first);
        const chunks = pages.flatMap((page) =>
          (page.fields[0] as AgentFieldState).paragraphs.filter((para) => para.paragraphId === "p:raw"),
        );
        let reassembled = "";
        for (const chunk of chunks) reassembled += chunk.raw as string;
        expect(reassembled, "chunks slice the retained revision").toBe(raw);
        expect(sha256Hex(reassembled), "no live bytes in the retained read").toBe(entry.rawSha256);
        expect(sha256Hex(reassembled)).not.toBe(entry.liveRawSha256);
      });
    }, 120000);
  },
);
