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

function synthInput(): AnonymiseInput {
  return {
    sceneId: "s2-target-anon",
    language: "fr",
    fixture: pinFor(RAW),
    folds: pinFor(FOLDS),
  };
}

/** Re-pin the synthetic fixture after a mutation of its parsed JSON. */
function mutatedInput(mutate: (raw: Record<string, unknown>) => void): AnonymiseInput {
  const input = synthInput();
  const raw = JSON.parse(new TextDecoder().decode(input.fixture.bytes)) as Record<string, unknown>;
  mutate(raw);
  const bytes = new TextEncoder().encode(JSON.stringify(raw));
  return {
    ...input,
    fixture: { pin: { ...input.fixture.pin, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length }, bytes },
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

  it("the CLI verify also refuses with anon-ci-refused when CI=true (exit 1)", async () => {
    const errors: string[] = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = ((chunk: unknown) => {
      errors.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
    try {
      const code = await anonMain(["node", "dl-anon.mjs", "verify"], { CI: "true" });
      expect(code).toBe(1);
    } finally {
      process.stderr.write = orig;
    }
    expect(errors.join("")).toContain("anon-ci-refused");
  });

  it("dropped raw fields are still type-checked, fail closed (anon-value-invalid)", () => {
    const cases: { name: string; mutate: (raw: Record<string, unknown>) => void }[] = [
      { name: "scene.title", mutate: (raw) => ((raw.scene as Record<string, unknown>).title = 123) },
      { name: "scene.caption", mutate: (raw) => ((raw.scene as Record<string, unknown>).caption = 5) },
      { name: "scene.legendPassages", mutate: (raw) => ((raw.scene as Record<string, unknown>).legendPassages = "x") },
      { name: "zone detail", mutate: (raw) => ((raw.entities as Record<string, unknown>[])[0]!.detail = 1) },
      { name: "zone footer", mutate: (raw) => ((raw.entities as Record<string, unknown>[])[0]!.footer = []) },
      { name: "card name", mutate: (raw) => ((raw.entities as Record<string, unknown>[])[3]!.name = 7) },
      { name: "card role", mutate: (raw) => ((raw.entities as Record<string, unknown>[])[3]!.role = 5) },
      { name: "card store", mutate: (raw) => ((raw.entities as Record<string, unknown>[])[3]!.store = null) },
      {
        name: "zoneHierarchy node label",
        mutate: (raw) => {
          const zh = raw.zoneHierarchy as Record<string, unknown>;
          ((zh.zones as Record<string, unknown>[])[0] as Record<string, unknown>).label = 7;
        },
      },
    ];
    for (const c of cases) {
      const result = anonymiseHrpnFixture(mutatedInput(c.mutate));
      expect(result.ok, c.name).toBe(false);
      if (!result.ok) expect(result.refusal, c.name).toBe("anon-value-invalid");
    }
  });

  it("a dangling entity parent is refused (anon-structure-invalid), not silently re-rooted", () => {
    const result = anonymiseHrpnFixture(mutatedInput((raw) => ((raw.entities as Record<string, unknown>[])[1]!.parent = "ZONE_NOPE")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal).toBe("anon-structure-invalid");
  });

  it("an entity parent cycle is refused (anon-structure-invalid)", () => {
    const result = anonymiseHrpnFixture(
      mutatedInput((raw) => {
        const entities = raw.entities as Record<string, unknown>[];
        entities[0]!.parent = "ZONE_BETA";
        entities[1]!.parent = "ZONE_ALPHA";
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.refusal).toBe("anon-structure-invalid");
  });

  it("provenance counts are the raw-measured counts and match the committed structure", () => {
    const result = anonymiseHrpnFixture(synthInput());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.provenance.counts).toEqual(countStructure(result.value.structure));
    expect(result.value.provenance.counts.zones).toBe(3);
    expect(result.value.provenance.counts.cards).toBe(4);
    expect(result.value.provenance.counts.relations).toBe(3);
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
