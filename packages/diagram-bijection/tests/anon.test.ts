/**
 * §2.9 witnesses of the S2-target-anon generator: W-DL0.8 (determinism, count
 * preservation, fail-closed field handling, canary containment, CI refusal of
 * the CLI) on the synthetic hrpn-shaped fixture with invented labels, and the
 * CI half of W-DL0.12 (committed structure == provenance counts and digest).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalBytes } from "@sentropic/diagram-core";
import { anonymiseHrpnFixture, type AnonymiseInput } from "../src/anon/hrpn-fixture.js";
import { countStructure } from "../src/structure/types.js";
import { main as anonMain } from "../src/anon/cli.js";
import type { FixturePin } from "../src/pins/fixture-pins.js";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = execFileSync("git", ["-C", pkgRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

function pinFor(relPath: string): { pin: FixturePin; bytes: Uint8Array } {
  const bytes = new Uint8Array(readFileSync(join(repoRoot, relPath)));
  return {
    bytes,
    pin: {
      id: relPath,
      root: { kind: "repo" },
      path: relPath,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      confidentiality: "public",
    },
  };
}

const RAW = "packages/diagram-bijection/fixtures/synthetic/hrpn-shaped.raw.json";
const FOLDS = "packages/diagram-bijection/fixtures/synthetic/hrpn-shaped.defaults.txt";

function synthInput(override?: (raw: Record<string, unknown>) => Record<string, unknown>): AnonymiseInput {
  const raw = pinFor(RAW);
  const folds = pinFor(FOLDS);
  const parsed = JSON.parse(new TextDecoder().decode(raw.bytes)) as Record<string, unknown>;
  return {
    sceneId: "s2-target-anon",
    language: "fr",
    fixture: { pin: raw.pin, bytes: new Uint8Array(readFileSync(join(repoRoot, RAW))) },
    folds: { pin: folds.pin, bytes: new Uint8Array(readFileSync(join(repoRoot, FOLDS))) },
  };
}

describe("W-DL0.8 generator on the synthetic hrpn-shaped fixture", () => {
  it("two runs give identical structure, provenance and mapping bytes", () => {
    const a = anonymiseHrpnFixture(synthInput());
    const b = anonymiseHrpnFixture(synthInput());
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(canonicalBytes(a.value.structure)).toBe(canonicalBytes(b.value.structure));
    expect(canonicalBytes(a.value.provenance)).toBe(canonicalBytes(b.value.provenance));
    expect(canonicalBytes(a.value.mapping)).toBe(canonicalBytes(b.value.mapping));
  });

  it("preserves every structural count of the raw input", () => {
    const result = anonymiseHrpnFixture(synthInput());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const c = countStructure(result.value.structure);
    // Raw: 3 zones, 4 cards, 3 relations; depths zone 1/2/2, card 2/3/3/3.
    expect([c.zones, c.cards, c.relations]).toEqual([3, 4, 3]);
    expect(c.zonesByDepth).toEqual([0, 1, 2]);
    expect(c.cardsByDepth).toEqual([0, 0, 1, 3]);
    expect(c.zoneContent).toEqual({ cardsOnly: 2, zonesOnly: 0, both: 1, empty: 0 });
    expect(c.maxChildren).toBe(3);
    // Tints: two categories in order of first appearance, five tinted entities.
    expect(c.categories).toBe(2);
    expect(c.categorised).toBe(5);
    // Folds: one resolved (ZONE_BETA), one unresolved (ZONE_INCONNUE).
    expect(result.value.provenance.folds).toEqual({ sourceIds: 2, resolved: 1, unresolved: 1 });
    expect(c.collapsed).toBe(1);
    expect(c.expanded).toBe(2);
    expect(result.value.unresolvedFoldIds).toEqual(["ZONE_INCONNUE"]);
    // Anonymised ids and labels only.
    expect(result.value.structure.zones.map((z) => z.id)).toEqual(["z01", "z02", "z03"]);
    expect(result.value.structure.cards.map((c2) => c2.id)).toEqual(["c01", "c02", "c03", "c04"]);
    expect(result.value.structure.relations.map((r) => r.id)).toEqual(["r01", "r02", "r03"]);
  });

  it("an unknown raw key gives anon-field-unknown, fail closed", () => {
    const input = synthInput();
    const raw = JSON.parse(new TextDecoder().decode(input.fixture.bytes)) as Record<string, unknown>;
    (raw.entities as Record<string, unknown>[])[0]!.mystery = "x";
    const bytes = new TextEncoder().encode(JSON.stringify(raw));
    const result = anonymiseHrpnFixture({
      ...input,
      fixture: { pin: { ...input.fixture.pin, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length }, bytes },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal).toBe("anon-field-unknown");
  });

  it("a pin mismatch gives anon-pin-mismatch before any field is read", () => {
    const input = synthInput();
    const result = anonymiseHrpnFixture({
      ...input,
      fixture: { pin: { ...input.fixture.pin, sha256: "0".repeat(64) }, bytes: input.fixture.bytes },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal).toBe("anon-pin-mismatch");
  });

  it("a planted canary label never appears in a refusal message or in the outputs", () => {
    const CANARY = "CANARY-PLUME-9182";
    const input = synthInput();
    const raw = JSON.parse(new TextDecoder().decode(input.fixture.bytes)) as Record<string, unknown>;
    (raw.entities as Record<string, unknown>[])[0]!.label = CANARY;
    (raw.entities as Record<string, unknown>[])[0]!.mystery = 1; // force a refusal
    const bytes = new TextEncoder().encode(JSON.stringify(raw));
    const refused = anonymiseHrpnFixture({
      ...input,
      fixture: { pin: { ...input.fixture.pin, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length }, bytes },
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.message).not.toContain(CANARY);

    const okRun = anonymiseHrpnFixture(synthInput());
    expect(okRun.ok).toBe(true);
    if (!okRun.ok) return;
    const raw2 = JSON.parse(new TextDecoder().decode(input.fixture.bytes)) as Record<string, unknown>;
    (raw2.entities as Record<string, unknown>[])[0]!.label = CANARY;
    const bytes2 = new TextEncoder().encode(JSON.stringify(raw2));
    const run2 = anonymiseHrpnFixture({
      ...input,
      fixture: { pin: { ...input.fixture.pin, sha256: createHash("sha256").update(bytes2).digest("hex"), bytes: bytes2.length }, bytes: bytes2 },
    });
    expect(run2.ok).toBe(true);
    if (!run2.ok) return;
    expect(canonicalBytes(run2.value.structure)).not.toContain(CANARY);
    expect(JSON.stringify(run2.value.provenance)).not.toContain(CANARY);
    // The mapping is the only output that may hold it, and it stays out of the repo.
    expect(run2.value.mapping.entries.some((e) => e.raw === CANARY)).toBe(true);
  });

  it("the pure core never reads the environment: it processes the bytes with CI=true set", () => {
    const prev = process.env.CI;
    process.env.CI = "true";
    try {
      const result = anonymiseHrpnFixture(synthInput());
      expect(result.ok).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });

  it("the CLI generate refuses with anon-ci-refused when CI=true", async () => {
    const errors: string[] = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = ((chunk: unknown) => {
      errors.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
    try {
      const code = await anonMain(["node", "dl-anon.mjs", "generate", "--fixture-pin", "s2-target-raw", "--folds-pin", "s2-target-folds-raw"], { CI: "true" });
      expect(code).toBe(1);
    } finally {
      process.stderr.write = orig;
    }
    expect(errors.join("")).toContain("anon-ci-refused");
  });
});

describe("W-DL0.12 CI half: committed structure matches its provenance", () => {
  it("counts of the committed structure equal the provenance counts, and the sha256 matches", () => {
    const structureBytes = new Uint8Array(readFileSync(join(repoRoot, "packages/diagram-bijection/fixtures/structures/s2-target-anon.structure.json")));
    const provenance = JSON.parse(
      readFileSync(join(repoRoot, "packages/diagram-bijection/fixtures/structures/s2-target-anon.provenance.json"), "utf8"),
    ) as { structure: { sha256: string }; counts: unknown; folds: unknown };
    const structure = JSON.parse(new TextDecoder().decode(structureBytes)) as Parameters<typeof countStructure>[0];
    expect(createHash("sha256").update(structureBytes).digest("hex")).toBe(provenance.structure.sha256);
    expect(countStructure(structure)).toEqual(provenance.counts);
    // §2.5 table: 22/51/54, depths 4/4/14 and 5/6/40, 17/3/2/0, maxChildren 9,
    // 42 tinted cards, 3 categories, collapsed 5 / expanded 17, folds 5/2.
    const c = countStructure(structure) as unknown as Record<string, unknown>;
    expect([c.zones, c.cards, c.relations]).toEqual([22, 51, 54]);
    expect(c.zonesByDepth).toEqual([0, 4, 4, 14]);
    expect(c.cardsByDepth).toEqual([0, 0, 5, 6, 40]);
    expect(c.zoneContent).toEqual({ cardsOnly: 17, zonesOnly: 3, both: 2, empty: 0 });
    expect(c.maxChildren).toBe(9);
    expect(c.categorised).toBe(42);
    expect(c.categories).toBe(3);
    expect(c.expanded).toBe(17);
    expect(c.collapsed).toBe(5);
    expect(provenance.folds).toEqual({ sourceIds: 7, resolved: 5, unresolved: 2 });
  });
});
