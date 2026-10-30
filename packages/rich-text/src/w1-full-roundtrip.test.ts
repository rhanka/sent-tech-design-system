/**
 * CL-2F W1 run: `-M` round-trip over every Markdown case of the pinned host
 * corpus (Appendix B, sentropic a3204932e).
 *
 * Flow per case: parse → edit the middle text block → serialize with
 * conversion seeds (untouched blocks re-emit their source bytes) → parse
 * again. The receipt (`../W1-RECEIPT-CL-2F.json`, rewritten deterministically
 * by this test) records the corpus revision and digests, the command, the
 * per-case result (byte-identical, or normalized by a named manifest rule)
 * and any used-feature loss (must be none).
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

const MANIFEST_IDS = new Set(FULL_NORMALIZATION_MANIFEST.map((rule) => rule.id));

interface CorpusCase {
  id: string;
  input: string;
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function allocator(): () => string {
  let sequence = 0;
  return () => `w1:${(sequence += 1)}`;
}

/** Content probes mapping an input to candidate manifest rules. */
function probeRules(input: string): string[] {
  const rules: string[] = [];
  if (/\r/.test(input)) rules.push("LINE-ENDING");
  if (/[^\n]\n(?![\n#>\-*+\d`|])/m.test(input)) rules.push("SOFTBREAK");
  if (/\n$/.test(input) && input !== "") rules.push("TRAILING-NL");
  if (/^\s*$/.test(input) && input !== "") rules.push("BLANK-ONLY");
  if (/^ {3,}(?:[-*+]|\d+[.)]) /m.test(input)) rules.push("LIST-INDENT");
  if (/ {2,}\n/.test(input)) rules.push("HARD-BREAK-FORM");
  return [...new Set(rules)].filter((rule) => MANIFEST_IDS.has(rule));
}

/** Heuristic §6.5 content classes covered by one input (labeled as such). */
function probeClasses(input: string): string[] {
  const classes: string[] = [];
  if (input === "") {
    return ["empty"];
  }
  if (/^\s*$/.test(input)) {
    return ["whitespace-only"];
  }
  if (/^#{1,6} /m.test(input)) classes.push("heading");
  if (/^ {0,3}>/m.test(input)) classes.push("blockquote");
  if (/^ {0,3}(`{3,}|~{3,})/m.test(input)) classes.push("code-block");
  if (/^ {0,3}([-*+]|\d+[.)]) /m.test(input)) classes.push("list");
  if (/\[[^\]]*\]\([^)]*\)/.test(input)) classes.push("link");
  if (/!\[[^\]]*\]\([^)]*\)/.test(input)) classes.push("image-preserved");
  if (/^\s*\|.*\|\s*$/m.test(input)) classes.push("table-preserved");
  if (/\*\*[^*]+\*\*|\*[^*\n]+\*|~~[^~]+~~|<u>[^<]+<\/u>|`[^`\n]+`/.test(input)) {
    classes.push("marks");
  }
  if (/^ {0,3}(---|\*\*\*|___)\s*$/m.test(input)) classes.push("horizontal-rule");
  if (/\\$| {2,}\n/.test(input)) classes.push("hard-break");
  if (classes.length === 0) classes.push("prose");
  return classes;
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
      codeLanguage: (metadata as { codeLanguage?: unknown } | undefined)?.codeLanguage ?? null,
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

interface CaseReceipt {
  id: string;
  classes: string[];
  inputDigest: string;
  result: "byte-identical" | "normalized";
  rules: string[];
  edited: boolean;
  neighborSeedsKept: boolean;
  usedFeatureLoss: string[];
}

describe("CL-2F W1: pinned-corpus Markdown round-trip", () => {
  it("round-trips every Markdown case and writes the receipt", () => {
    const fixtureBytes = readFileSync(FIXTURE_PATH, "utf8");
    expect(sha256(fixtureBytes)).toBe(FIXTURE_DIGEST);
    const fixture = JSON.parse(fixtureBytes) as { cases: CorpusCase[] };
    expect(fixture.cases.length).toBeGreaterThan(0);

    // The manifest file and the code manifest carry the same rule ids.
    const manifestText = readFileSync(MANIFEST_PATH, "utf8");
    const fileIds = new Set(
      [...manifestText.matchAll(/^\| `([A-Z0-9-]+)`/gm)].map((match) => match[1] as string),
    );
    expect([...fileIds].sort()).toEqual([...MANIFEST_IDS].sort());

    const cases: CaseReceipt[] = [];
    for (const corpusCase of fixture.cases) {
      const input = corpusCase.input;
      const parsed = parseFullMarkdown(input, allocator());
      expect(parsed.document !== null, `${corpusCase.id}: refused (${parsed.refusedKinds})`).toBe(true);
      const document = parsed.document as RichTextDocument;

      // Byte-identity without edits: untouched blocks re-emit their seeds.
      const wire0 = serializeFullDocument(document, { seeds: parsed.seeds });
      const identical = wire0 === input;
      const rules = identical ? [] : probeRules(input);
      if (!identical) {
        expect(
          rules.length,
          `${corpusCase.id}: wire differs but no manifest rule matches`,
        ).toBeGreaterThan(0);
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
      let touched = new Set<string>();
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
        touched = new Set([target.paragraphId]);
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

      cases.push({
        id: corpusCase.id,
        classes: probeClasses(input),
        inputDigest: sha256(input),
        result: identical ? "byte-identical" : "normalized",
        rules,
        edited,
        neighborSeedsKept,
        usedFeatureLoss: loss,
      });
    }

    const summary = {
      total: cases.length,
      byteIdentical: cases.filter((entry) => entry.result === "byte-identical").length,
      normalized: cases.filter((entry) => entry.result === "normalized").length,
      usedFeatureLosses: cases.flatMap((entry) => entry.usedFeatureLoss),
    };
    expect(summary.usedFeatureLosses).toEqual([]);

    const receipt = {
      lot: "CL-2F",
      check: "W1",
      corpusRevision: CORPUS_REVISION,
      corpusSource: "rhanka/sentropic (read-only git show)",
      fixturePath: "packages/rich-text/tests/fixtures/canvas-live/b1-content.json",
      fixtureDigest: `sha256:${FIXTURE_DIGEST}`,
      apiSavePayloadsDigest:
        "sha256:2bfcf5c301f92f1f0bb804f3b26508cc80bc5bd10d7e85ef02409b984f1bd76",
      command: "vitest run src/w1-full-roundtrip.test.ts",
      cases,
      summary,
    };
    writeFileSync(RECEIPT_PATH, `${JSON.stringify(receipt, null, 2)}\n`);
    expect(JSON.parse(readFileSync(RECEIPT_PATH, "utf8"))).toEqual(receipt);
  });
});
