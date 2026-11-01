/**
 * CL-4b Task 3 — chunk-vector fixture conformance (E2, host condition
 * C-D7-2). Loads the canonical fixture
 * `fixtures/canvas-live-raw-chunk-vectors.v1.json` by path (never through a
 * host import), rebuilds and digest-checks each `raw` (including the
 * `f4-scale` construction), runs the double's isolated slicer at each
 * `slicing.chunkBudgetBytes` and asserts E2 equality chunk for chunk:
 * same offsets, same UTF-16 lengths, same `rawComplete` placement.
 *
 * The slicer is source-independent; both sources still open a driver each
 * so the provider label is asserted in the run. Page-level E1 over the
 * `f4-scale` and `retained-slicing` contents lives in
 * `collab-agent-reads.test.ts`.
 *
 * RED on the CL-4a base: the fixture file and `slicePreservedRawForTest`
 * do not exist, so this file fails at import/read time.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { slicePreservedRawForTest } from "./collab-agent-bridge.test-support.js";
import { openAgentDriver } from "./collab-agent-witness.test-support.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(SRC_DIR, "..", "fixtures", "canvas-live-raw-chunk-vectors.v1.json");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

interface ExpectedChunk {
  rawOffset: number;
  rawLengthUtf16: number;
  rawSha256: string;
  rawComplete: boolean;
}

interface FixtureCase {
  id: string;
  description: string;
  paragraphId: string;
  preservedKind: string;
  raw?: string;
  rawConstruction?: { pattern: string; repeat: number; prefix: string; suffix: string };
  rawUtf16Length: number;
  rawSha256: string;
  liveRaw?: string;
  liveRawSha256?: string;
  slicing: { chunkBudgetBytes: number; expectedChunks: ExpectedChunk[] };
}

interface Fixture {
  id: string;
  version: number;
  budgetReferenceBytes: number;
  estimator: string;
  cases: FixtureCase[];
}

function loadFixture(): Fixture {
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as Fixture;
}

function rebuildRaw(entry: FixtureCase): string {
  if (entry.raw !== undefined) return entry.raw;
  const construction = entry.rawConstruction;
  if (construction === undefined) throw new Error(`fixture case has neither raw nor rawConstruction: ${entry.id}`);
  return `${construction.prefix}${construction.pattern.repeat(construction.repeat)}${construction.suffix}`;
}

/** A chunk boundary inside a surrogate pair (a trailing high surrogate
    without its low half, or a leading low surrogate without its high half). */
function hasLoneSurrogate(chunk: string, atStart: boolean): boolean {
  if (chunk.length === 0) return false;
  if (atStart) {
    const first = chunk.charCodeAt(0) as number;
    return first >= 0xdc00 && first <= 0xdfff;
  }
  const last = chunk.charCodeAt(chunk.length - 1) as number;
  return last >= 0xd800 && last <= 0xdbff;
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4b fixture conformance E2 (%s)",
  (kind) => {
    it("every case rebuilds to its recorded length and digest", async () => {
      const driver = await openAgentDriver(kind, "canvas:cl4b-fixture", "session:cl4b-fixture", ["description"]);
      expect(driver.label).toBe(kind);
      try {
        const fixture = loadFixture();
        expect(fixture.id).toBe("sentropic.rich-text.canvas-live-raw-chunk-vectors");
        expect(fixture.version).toBe(1);
        expect(fixture.budgetReferenceBytes).toBe(262144);
        for (const entry of fixture.cases) {
          const raw = rebuildRaw(entry);
          expect(raw.length, `${entry.id}: UTF-16 length`).toBe(entry.rawUtf16Length);
          expect(sha256Hex(raw), `${entry.id}: UTF-8 digest`).toBe(entry.rawSha256);
          if (entry.liveRaw !== undefined) {
            expect(sha256Hex(entry.liveRaw), `${entry.id}: live digest`).toBe(entry.liveRawSha256);
          }
        }
      } finally {
        await driver.close();
      }
    });

    it("the slicer output equals expectedChunks chunk for chunk", async () => {
      const driver = await openAgentDriver(kind, "canvas:cl4b-fixture", "session:cl4b-fixture", ["description"]);
      expect(driver.label).toBe(kind);
      try {
        const fixture = loadFixture();
        for (const entry of fixture.cases) {
          const raw = rebuildRaw(entry);
          const budget = entry.slicing.chunkBudgetBytes;
          const sliced = slicePreservedRawForTest(raw, budget);
          const actual = sliced.map((chunk) => ({
            rawOffset: chunk.rawOffset,
            rawLengthUtf16: chunk.chunk.length,
            rawSha256: sha256Hex(chunk.chunk),
            rawComplete: chunk.rawComplete,
          }));
          expect(actual, `${entry.id}: E2 chunk equality`).toEqual(entry.slicing.expectedChunks);
        }
      } finally {
        await driver.close();
      }
    });

    it("slicer chunks are contiguous, maximal, pair-safe and never empty", async () => {
      const driver = await openAgentDriver(kind, "canvas:cl4b-fixture", "session:cl4b-fixture", ["description"]);
      expect(driver.label).toBe(kind);
      try {
        const fixture = loadFixture();
        for (const entry of fixture.cases) {
          const raw = rebuildRaw(entry);
          const budget = entry.slicing.chunkBudgetBytes;
          const sliced = slicePreservedRawForTest(raw, budget);
          expect(sliced.length, `${entry.id}: at least one chunk`).toBeGreaterThan(0);
          let offset = 0;
          for (const [index, chunk] of sliced.entries()) {
            const last = index === sliced.length - 1;
            expect(chunk.rawOffset, `${entry.id}: contiguous from 0`).toBe(offset);
            expect(chunk.chunk.length, `${entry.id}: no empty chunk`).toBeGreaterThan(0);
            expect(chunk.rawComplete, `${entry.id}: completion only on the last chunk`).toBe(last);
            expect(raw.slice(offset, offset + chunk.chunk.length), `${entry.id}: chunk slices raw`).toBe(chunk.chunk);
            expect(hasLoneSurrogate(chunk.chunk, false), `${entry.id}: no trailing lone surrogate`).toBe(false);
            expect(hasLoneSurrogate(chunk.chunk, true), `${entry.id}: no leading lone surrogate`).toBe(false);
            const fitted = Buffer.byteLength(JSON.stringify(chunk.chunk), "utf8");
            expect(fitted, `${entry.id}: chunk fits its budget`).toBeLessThanOrEqual(budget);
            if (!last) {
              // Maximality: extending by the next full code point overflows.
              const nextUnits = raw.codePointAt(offset + chunk.chunk.length) as number > 0xffff ? 2 : 1;
              const extended = raw.slice(offset, offset + chunk.chunk.length + nextUnits);
              expect(
                Buffer.byteLength(JSON.stringify(extended), "utf8"),
                `${entry.id}: greedy largest prefix`,
              ).toBeGreaterThan(budget);
            }
            offset += chunk.chunk.length;
          }
          expect(offset, `${entry.id}: chunks cover the whole raw`).toBe(raw.length);
        }
      } finally {
        await driver.close();
      }
    });
  },
);
