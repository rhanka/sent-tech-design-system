/**
 * CL-2F W1 run: `-M` round-trip over every Markdown case of the pinned host
 * corpus (Appendix B, sentropic a3204932e), review 1 item 13.
 *
 * Flow per case: parse → edit the middle text block → serialize with
 * conversion seeds (untouched blocks re-emit their source bytes) → parse
 * again. The receipt (`../W1-RECEIPT-CL-2F.json`, rewritten deterministically
 * by this test) records the corpus revision and digests, the command, the
 * per-case result (byte-identical, or normalized by an exactly cited
 * manifest rule) and any used-feature loss (must be none).
 *
 * Independent expectations (no heuristics): every fixture case has a
 * hand-authored EXPECTED entry — the exact wire bytes, the exact manifest
 * rules that explain the input/wire difference, and the content classes.
 * The wire equality against the authored bytes is the load-bearing check;
 * each cited rule is then verified by an exact predicate on
 * (input, wire, parsed document), and unknown case ids fail. The old
 * regex-guessing probes are gone.
 *
 * Fixture: `../tests/fixtures/canvas-live/b1-content.json` (copied read-only
 * from the pinned revision; digest asserted below; no host implementation
 * code is copied).
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FULL_NORMALIZATION_MANIFEST,
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
import type { RichTextBlock, RichTextDocument } from "./model.js";

const CORPUS_REVISION = "a3204932e420efe6eeafa3428459fadb7f215aa7";
const FIXTURE_PATH = join(
  import.meta.dirname,
  "../tests/fixtures/canvas-live/b1-content.json",
);
const FIXTURE_DIGEST =
  "35bbb994e22ab63b72059d139c1e447d18b44c3b3b8fb05498f9dbde28f239a1";
const RECEIPT_PATH = join(import.meta.dirname, "../W1-RECEIPT-CL-2F.json");
const MANIFEST_PATH = join(import.meta.dirname, "../FULL-NORMALIZATIONS.md");
// Review 1 to-fix: the full 64-hex-digit API digest (rev1.out), not the
// truncated 63-digit value.
const API_DIGEST =
  "sha256:2bfcf5c301f92f1f0bb804f3b26508cc80bc5bd10d7e85ef02409b984f1fbd76";
// Review 1 item 13: host acceptance of the F10-M/F16-M manifest entries is
// still pending on sentropic.
const HOST_ACCEPTANCE = "pending-host";

const MANIFEST_IDS = new Set(FULL_NORMALIZATION_MANIFEST.map((rule) => rule.id));

interface CorpusCase {
  id: string;
  input: string;
}

interface CaseExpectation {
  /** Exact expected wire bytes; null means byte-identical to the input. */
  wire: string | null;
  /** Exact manifest rules explaining the input/wire difference. */
  rules: string[];
  /** Content classes covered by the input. */
  classes: string[];
}

/**
 * Hand-authored independent expectations for all 29 fixture cases, derived
 * from each input and the manifest (never from parser output):
 *
 * - 24 cases are byte-identical: the input already uses the canonical
 *   spellings, so the wire must equal the input with no cited rule.
 * - `unicode-bullets` / `unicode-list-array`: the CRLF source newlines
 *   normalize to LF (LINE-ENDING) while the three source lines join into
 *   one paragraph with spaces (SOFTBREAK); the wire keeps the source
 *   newlines verbatim through the conversion seeds.
 * - `ordered-nested-list`: the trailing blank line of the source elides on
 *   the wire (TRAILING-NL); nesting and indentation are untouched.
 * - `line-endings`: mixed CR/CRLF/LF endings normalize to LF
 *   (LINE-ENDING) while the four source lines join into one paragraph with
 *   spaces (SOFTBREAK); the wire keeps the source newlines via seeds.
 * - `whitespace`: the leading two spaces trim (TRAILING-SPACE — no text
 *   precedes them, so no hard break forms) and the whitespace-only input
 *   re-emits the canonical blank wire for its two empty blocks
 *   (BLANK-ONLY).
 */
const EXPECTED: Record<string, CaseExpectation> = {
  "prose-export": { wire: null, rules: [], classes: ["prose"] },
  "prose-link": { wire: null, rules: [], classes: ["link", "marks"] },
  "folder-context": { wire: null, rules: [], classes: ["prose"] },
  "benefit-list": { wire: null, rules: [], classes: ["list"] },
  "unicode-bullets": {
    wire: "• First item\n• Second item\nSingle line",
    rules: ["LINE-ENDING", "SOFTBREAK"],
    classes: ["prose"],
  },
  "unicode-list-array": {
    wire: "• First item\n• Second item\nSingle line",
    rules: ["LINE-ENDING", "SOFTBREAK"],
    classes: ["prose"],
  },
  "matrix-value-name": { wire: null, rules: [], classes: ["prose"] },
  "matrix-complexity-name": { wire: null, rules: [], classes: ["prose"] },
  "matrix-level": { wire: null, rules: [], classes: ["prose"] },
  "citation-wire": { wire: null, rules: [], classes: ["prose"] },
  "comment-draft": { wire: null, rules: [], classes: ["prose"] },
  "message-edit": { wire: null, rules: [], classes: ["prose"] },
  "ai-draft": { wire: null, rules: [], classes: ["marks"] },
  "folder-name": { wire: null, rules: [], classes: ["prose"] },
  "organization-name": { wire: null, rules: [], classes: ["prose"] },
  "initiative-name": { wire: null, rules: [], classes: ["prose"] },
  "plain-singleline": { wire: null, rules: [], classes: ["prose"] },
  "score-marks": { wire: null, rules: [], classes: ["marks"] },
  "matrix-formatted-name": { wire: null, rules: [], classes: ["marks"] },
  "heading-link": { wire: null, rules: [], classes: ["heading", "link"] },
  "ordered-nested-list": {
    wire: "1. First\n   - Nested\n2. Second",
    rules: ["TRAILING-NL"],
    classes: ["list"],
  },
  "preserved-constructs": {
    wire: null,
    rules: [],
    classes: [
      "blockquote",
      "code-block",
      "marks",
      "horizontal-rule",
      "hard-break",
      "table-preserved",
      "image-preserved",
    ],
  },
  "break-twins": { wire: null, rules: [], classes: ["hard-break"] },
  "line-endings": {
    wire: "line1\nline2\nline3\nline4",
    rules: ["LINE-ENDING", "SOFTBREAK"],
    classes: ["prose"],
  },
  "empty": { wire: null, rules: [], classes: ["empty"] },
  "whitespace": {
    wire: "\n\n",
    rules: ["TRAILING-SPACE", "BLANK-ONLY"],
    classes: ["whitespace-only"],
  },
  "ime": { wire: null, rules: [], classes: ["prose"] },
  "hostile-paste": { wire: null, rules: [], classes: ["link"] },
  "heading-paste": { wire: null, rules: [], classes: ["marks"] },
};

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function allocator(): () => string {
  let sequence = 0;
  return () => `w1:${(sequence += 1)}`;
}

function blockText(block: RichTextBlock): string {
  if (block.kind !== "paragraph") return "";
  return ((block.segments ?? []) as { type?: string; text?: string }[])
    .map((segment) =>
      segment.type === "hardBreak" ? "\n" : (segment.text ?? ""),
    )
    .join("");
}

/**
 * Exact rule verification on (input, wire, parsed document): each cited
 * rule must demonstrably fire. Unknown rule ids never verify.
 */
function ruleApplies(
  rule: string,
  input: string,
  wire: string,
  document: RichTextDocument,
  seeds: ReadonlyMap<string, string>,
): boolean {
  switch (rule) {
    case "LINE-ENDING":
      return (
        input.includes("\r") &&
        !wire.includes("\r") &&
        wire === input.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
      );
    case "TRAILING-NL":
      return /\n$/.test(input) && wire === input.replace(/\n+$/, "");
    case "TRAILING-SPACE":
      return /[ \t]+$/m.test(input) && !/[ \t]+$/m.test(wire);
    case "BLANK-ONLY":
      return /^\s+$/.test(input) && /^\s*$/.test(wire);
    case "SOFTBREAK": {
      // A paragraph-internal single newline of the source joins its lines
      // with a space in the parsed content: some block re-emits its seed
      // newlines verbatim while its text joins them with spaces.
      return document.blocks.some((block) => {
        if (block.kind !== "paragraph") return false;
        const seed = seeds.get(block.paragraphId);
        if (seed === undefined || !seed.includes("\n")) return false;
        return blockText(block) === seed.replace(/\n/g, " ");
      });
    }
    default:
      return false;
  }
}

function stripIds(document: RichTextDocument): unknown {
  const order = new Map<string, string>();
  let sequence = 0;
  const token = (id: string | undefined): string | undefined => {
    if (id === undefined) return undefined;
    let mapped = order.get(id);
    if (mapped === undefined) {
      mapped = `n${(sequence += 1)}`;
      order.set(id, mapped);
    }
    return mapped;
  };
  return document.blocks.map((block: RichTextBlock) => {
    if (block.kind === "horizontalRule") {
      const hr = block.hrMetadata;
      return {
        kind: "horizontalRule",
        listKind: hr?.listKind ?? "none",
        listDepth: hr?.listDepth ?? 0,
        listItemId: token(hr?.listItemId),
        listRunId: token(hr?.listRunId),
        blockquoteDepth: hr?.blockquoteDepth ?? 0,
        containerOrder: hr?.containerOrder ?? [],
      };
    }
    if (block.kind === "preserved") {
      return { kind: "preserved", raw: block.raw ?? "", preservedKind: block.preservedKind ?? "" };
    }
    const metadata = block.metadata;
    return {
      kind: "paragraph",
      paragraphId: token(block.paragraphId),
      blockKind: metadata?.blockKind ?? "paragraph",
      headingLevel: (metadata as { headingLevel?: unknown } | undefined)?.headingLevel ?? null,
      codeLanguage: (metadata as { codeLanguage?: string | null } | undefined)?.codeLanguage ?? null,
      listKind: metadata?.listKind ?? "none",
      listDepth: metadata?.listDepth ?? 0,
      listItemId: token(metadata?.listItemId),
      listRunId: token(metadata?.listRunId),
      orderedStart: metadata?.orderedStart ?? null,
      orderedType: metadata?.orderedType ?? null,
      listTight: metadata?.listTight ?? null,
      blockquoteDepth: metadata?.blockquoteDepth ?? 0,
      containerOrder: metadata?.containerOrder ?? [],
      segments: (block.segments ?? []).map((segment) =>
        segment.type === "hardBreak"
          ? { type: "hardBreak" }
          : { type: "text", text: segment.text, marks: segment.marks },
      ),
    };
  });
}

/** Used-feature multiset: every feature the input exercises must survive. */
function usedFeatures(document: RichTextDocument): Record<string, number | string[]> {
  const counts: Record<string, number> = {};
  const values: Record<string, string[]> = {};
  const bump = (key: string): void => {
    counts[key] = (counts[key] ?? 0) + 1;
  };
  const push = (key: string, value: string): void => {
    values[key] = [...(values[key] ?? []), value];
  };
  for (const block of document.blocks) {
    if (block.kind === "horizontalRule") {
      bump("hr");
      continue;
    }
    if (block.kind === "preserved") {
      bump(`preserved:${block.preservedKind ?? "?"}`);
      push("preserved-raw", block.raw ?? "");
      continue;
    }
    const metadata = block.metadata;
    if (metadata?.blockKind === "heading") {
      bump(`heading:${(metadata as { headingLevel?: number }).headingLevel ?? 1}`);
    }
    if (metadata?.blockKind === "codeBlock") {
      bump("code-block");
      push(
        "code-language",
        String((metadata as { codeLanguage?: string | null }).codeLanguage ?? "null"),
      );
    }
    if (metadata?.listKind === "bullet") bump("list:bullet");
    if (metadata?.listKind === "ordered") {
      bump("list:ordered");
      push("ordered-start", String(metadata.orderedStart ?? 1));
    }
    if ((metadata?.blockquoteDepth ?? 0) > 0) bump("quote");
    for (const segment of block.segments ?? []) {
      if (segment.type === "hardBreak") {
        bump("hard-break");
        continue;
      }
      if (segment.marks.bold === true) bump("mark:bold");
      if (segment.marks.italic === true) bump("mark:italic");
      if (segment.marks.code === true) bump("mark:code");
      if (segment.marks.strike === true) bump("mark:strike");
      if (segment.marks.underline === true) bump("mark:underline");
      if (typeof segment.marks.link === "string") {
        bump("mark:link");
        push("link-href", segment.marks.link);
        if (typeof segment.marks.linkTitle === "string") {
          push("link-title", segment.marks.linkTitle);
        }
      }
    }
  }
  const out: Record<string, number | string[]> = { ...counts };
  for (const [key, value] of Object.entries(values)) {
    out[`values:${key}`] = [...value].sort();
  }
  return out;
}

/**
 * Exact class coverage on (input, parsed document): every cited content
 * class must demonstrably occur. Unknown class names never verify.
 */
function classCovered(
  className: string,
  input: string,
  document: RichTextDocument,
): boolean {
  switch (className) {
    case "prose":
      return document.blocks.some((block) => block.kind === "paragraph");
    case "empty":
      return input === "";
    case "whitespace-only":
      return /^\s+$/.test(input);
    case "marks":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          (block.segments ?? []).some(
            (segment) =>
              segment.type === "text" &&
              Object.values(segment.marks).some((mark) => mark === true),
          ),
      );
    case "link":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          (block.segments ?? []).some(
            (segment) =>
              segment.type === "text" && typeof segment.marks.link === "string",
          ),
      );
    case "heading":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          block.metadata?.blockKind === "heading",
      );
    case "list":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          (block.metadata?.listKind ?? "none") !== "none",
      );
    case "blockquote":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          (block.metadata?.blockquoteDepth ?? 0) > 0,
      );
    case "code-block":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          block.metadata?.blockKind === "codeBlock",
      );
    case "horizontal-rule":
      return document.blocks.some((block) => block.kind === "horizontalRule");
    case "hard-break":
      return document.blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          (block.segments ?? []).some(
            (segment) => segment.type === "hardBreak",
          ),
      );
    case "table-preserved":
      return document.blocks.some(
        (block) => block.kind === "preserved" && block.preservedKind === "table",
      );
    case "image-preserved":
      return document.blocks.some(
        (block) => block.kind === "preserved" && block.preservedKind === "image",
      );
    default:
      return false;
  }
}

/** F16 (§2.8): trailing hard-break runs of prose text blocks. */
function terminalBreaks(document: RichTextDocument): number {
  let count = 0;
  for (const block of document.blocks) {
    if (block.kind !== "paragraph") continue;
    if ((block.metadata?.blockKind ?? "paragraph") === "codeBlock") continue;
    const segments = block.segments ?? [];
    for (let index = segments.length - 1; index >= 0; index -= 1) {
      if (segments[index]?.type !== "hardBreak") break;
      count += 1;
    }
  }
  return count;
}

/** F10 (§2.8): trailing line feeds of code-block text. */
function trailingCodeLf(document: RichTextDocument): number {
  let count = 0;
  for (const block of document.blocks) {
    if (block.kind !== "paragraph") continue;
    if ((block.metadata?.blockKind ?? "paragraph") !== "codeBlock") continue;
    const text = blockText(block);
    const trailing = /\n+$/.exec(text);
    if (trailing !== null) count += trailing[0].length;
  }
  return count;
}

interface CaseReceipt {
  id: string;
  classes: string[];
  inputDigest: string;
  result: "byte-identical" | "normalized";
  rules: string[];
  edited: boolean;
  neighborSeedsKept: boolean;
  usedFeatureLoss: string[];
  /** Actual source bytes (normalized cases only). */
  beforeBytes?: string;
  /** Actual emitted bytes (normalized cases only). */
  afterBytes?: string;
  /** F16: trailing hard-break runs of prose blocks in the parsed document. */
  f16TerminalBreaks: number;
  /** F10: trailing line feeds of code-block text in the parsed document. */
  f10TrailingCodeLf: number;
}

describe("CL-2F W1: pinned-corpus Markdown round-trip", () => {
  it("round-trips every Markdown case and writes the receipt", () => {
    const fixtureBytes = readFileSync(FIXTURE_PATH, "utf8");
    expect(sha256(fixtureBytes)).toBe(FIXTURE_DIGEST);
    const fixture = JSON.parse(fixtureBytes) as {
      cases: CorpusCase[];
      sourceCommit?: string;
      sources?: Record<string, string>;
    };
    expect(fixture.cases.length).toBeGreaterThan(0);

    // The manifest file and the code manifest carry the same rule ids.
    const manifestText = readFileSync(MANIFEST_PATH, "utf8");
    const fileIds = new Set(
      [...manifestText.matchAll(/^\| `([A-Z0-9-]+)`/gm)].map((match) => match[1] as string),
    );
    expect([...fileIds].sort()).toEqual([...MANIFEST_IDS].sort());

    // Every fixture case needs a hand-authored expectation: no silent
    // heuristic fallback for new corpus cases.
    for (const corpusCase of fixture.cases) {
      expect(
        EXPECTED[corpusCase.id] !== undefined,
        `${corpusCase.id}: no hand-authored W1 expectation`,
      ).toBe(true);
    }

    const cases: CaseReceipt[] = [];
    for (const corpusCase of fixture.cases) {
      const input = corpusCase.input;
      const expected = EXPECTED[corpusCase.id] as CaseExpectation;
      const parsed = parseFullMarkdown(input, allocator());
      expect(parsed.document !== null, `${corpusCase.id}: refused (${parsed.refusedKinds})`).toBe(true);
      const document = parsed.document as RichTextDocument;

      // Byte-identity without edits against the independent expectation:
      // untouched blocks re-emit their seeds.
      const wire0 = serializeFullDocument(document, { seeds: parsed.seeds });
      const expectedWire = expected.wire ?? input;
      expect(wire0, `${corpusCase.id}: wire differs from the expectation`).toBe(expectedWire);
      const identical = wire0 === input;
      expect(
        identical === (expected.wire === null),
        `${corpusCase.id}: byte-identity disagrees with the expectation`,
      ).toBe(true);

      // Exact rule matches: a byte-identical case cites no rule; every
      // cited rule of a normalized case must demonstrably fire.
      if (identical) {
        expect(expected.rules, `${corpusCase.id}: identical wire cites rules`).toEqual([]);
      } else {
        expect(
          expected.rules.length,
          `${corpusCase.id}: normalized wire cites no rule`,
        ).toBeGreaterThan(0);
        for (const rule of expected.rules) {
          expect(
            ruleApplies(rule, input, wire0, document, parsed.seeds),
            `${corpusCase.id}: cited rule did not fire (${rule})`,
          ).toBe(true);
        }
      }
      // Content classes follow the authored expectation: every cited class
      // must be covered by the parsed document or the input (no guessing).
      expect(new Set(expected.classes).size).toBe(expected.classes.length);
      for (const className of expected.classes) {
        expect(
          classCovered(className, input, document),
          `${corpusCase.id}: cited class not covered (${className})`,
        ).toBe(true);
      }

      // Edit the middle text block, keep every neighbor on its seed.
      const textIndexes = document.blocks
        .map((block, index) => ({ block, index }))
        .filter(
          ({ block }) =>
            block.kind === "paragraph" && (block.segments ?? []).length > 0,
        )
        .map(({ index }) => index);
      let editedDoc = document;
      const touched = new Set<string>();
      const edited = textIndexes.length > 0;
      if (edited) {
        const target = document.blocks[
          textIndexes[Math.floor(textIndexes.length / 2)] as number
        ] as RichTextBlock & { kind: "paragraph" };
        const segments = [...(target.segments ?? [])];
        const last = segments[segments.length - 1];
        if (last !== undefined && last.type === "text") {
          segments[segments.length - 1] = { ...last, text: `${last.text}!` };
        } else {
          segments.push({ type: "text", text: "!", marks: {} });
        }
        editedDoc = {
          format: "ds.markdown.full@1",
          blocks: document.blocks.map((block) =>
            block.paragraphId === target.paragraphId
              ? { ...target, segments }
              : block,
          ),
        };
        touched.add(target.paragraphId);
      }

      const wire1 = serializeFullDocument(editedDoc, {
        seeds: parsed.seeds,
        touched,
      });
      const reparsed = parseFullMarkdown(wire1, allocator());
      expect(reparsed.document !== null, `${corpusCase.id}: re-parse refused`).toBe(true);
      const document2 = reparsed.document as RichTextDocument;

      // Structural equality modulo fresh identities (relations preserved).
      expect(
        stripIds(document2),
        `${corpusCase.id}: edit round-trip changed the structure`,
      ).toEqual(stripIds(editedDoc));

      // Used-feature loss must be none.
      const before = usedFeatures(editedDoc);
      const afterFeatures = usedFeatures(document2);
      const loss: string[] = [];
      for (const key of Object.keys(before)) {
        if (JSON.stringify(afterFeatures[key] ?? null) !== JSON.stringify(before[key])) {
          loss.push(key);
        }
      }
      expect(loss, `${corpusCase.id}: used-feature loss`).toEqual([]);

      // Untouched neighbors keep their source bytes.
      let neighborSeedsKept = true;
      for (const block of document.blocks) {
        if (touched.has(block.paragraphId)) continue;
        const seed = parsed.seeds.get(block.paragraphId);
        if (seed === undefined || seed === "") continue;
        if (!wire1.includes(seed)) {
          neighborSeedsKept = false;
        }
      }
      expect(neighborSeedsKept, `${corpusCase.id}: neighbor seed lost`).toBe(true);

      // F10/F16 counts the spec asks for (§2.8 table rows).
      const f16 = terminalBreaks(document);
      const f10 = trailingCodeLf(document);

      cases.push({
        id: corpusCase.id,
        classes: [...expected.classes],
        inputDigest: sha256(input),
        result: identical ? "byte-identical" : "normalized",
        rules: [...expected.rules],
        edited,
        neighborSeedsKept,
        usedFeatureLoss: loss,
        ...(identical
          ? {}
          : { beforeBytes: input, afterBytes: wire0 }),
        f16TerminalBreaks: f16,
        f10TrailingCodeLf: f10,
      });
    }

    const summary = {
      total: cases.length,
      byteIdentical: cases.filter((entry) => entry.result === "byte-identical").length,
      normalized: cases.filter((entry) => entry.result === "normalized").length,
      usedFeatureLosses: cases.flatMap((entry) => entry.usedFeatureLoss),
      f16TerminalBreaks: cases.reduce((sum, entry) => sum + entry.f16TerminalBreaks, 0),
      f10TrailingCodeLf: cases.reduce((sum, entry) => sum + entry.f10TrailingCodeLf, 0),
    };
    expect(summary.usedFeatureLosses).toEqual([]);

    const receipt = {
      lot: "CL-2F",
      check: "W1",
      corpusRevision: CORPUS_REVISION,
      corpusSource: "rhanka/sentropic (read-only git show)",
      fixturePath: "packages/rich-text/tests/fixtures/canvas-live/b1-content.json",
      fixtureDigest: `sha256:${FIXTURE_DIGEST}`,
      fixtureSources: {
        sourceCommit: fixture.sourceCommit ?? "",
        sources: { ...(fixture.sources ?? {}) },
      },
      apiSavePayloadsDigest: API_DIGEST,
      hostAcceptance: HOST_ACCEPTANCE,
      command: "vitest run src/w1-full-roundtrip.test.ts",
      cases,
      summary,
    };
    writeFileSync(RECEIPT_PATH, `${JSON.stringify(receipt, null, 2)}\n`);
    expect(JSON.parse(readFileSync(RECEIPT_PATH, "utf8"))).toEqual(receipt);
  });
});
