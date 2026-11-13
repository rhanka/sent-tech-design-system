import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseBarrelFile } from "../src/generator/barrels.js";
import { parseCatalogueFile, stripDatavizMarker } from "../src/generator/catalog.js";
import { FRAMEWORK_ORDER } from "../src/generator/constants.js";
import { entryDigest, fileDigestHex } from "../src/generator/digest.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(packageDir, "..", "..");

function readEntry(componentId: string): Record<string, unknown> {
  const path = join(packageDir, "generated", "entries", `${componentId}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function fileDigest(repoPath: string): string {
  return fileDigestHex(readFileSync(join(repoRoot, repoPath)));
}

function manifest(dir: string): { name: string; version: string } {
  return JSON.parse(readFileSync(join(repoRoot, dir, "package.json"), "utf8")) as {
    name: string;
    version: string;
  };
}

describe("witness projections (no field loss)", () => {
  it("button projects field-by-field from catalogue, barrels and bytes", () => {
    const rows = parseCatalogueFile(join(repoRoot, "apps/docs/src/lib/components-catalog.ts"));
    const row = rows.find((candidate) => candidate.slug === "button");
    expect(row).toBeDefined();
    const entry = readEntry("button");

    // Editorial fields verbatim from the catalogue row.
    expect(entry.displayName).toBe(row?.name);
    expect(entry.description).toEqual(row?.description);
    expect(entry.category).toBe(row?.category);
    expect(entry.status).toBe(row?.status);
    expect(entry.groupSlug).toBe(row?.groupSlug);

    // Frameworks from barrel presence, in fixed order.
    const identifier = stripDatavizMarker(row?.name ?? "");
    const seen = FRAMEWORK_ORDER.map((framework) => {
      const barrel =
        framework === "svelte"
          ? "packages/components-svelte/src/lib/index.ts"
          : `packages/components-${framework}/src/index.ts`;
      return parseBarrelFile(join(repoRoot, barrel)).values.has(identifier);
    });
    expect(seen).toEqual([true, true, true, true]);
    expect(entry.producerId).toBe("sentropic-ds");
    expect(entry.scope).toBe("generic");
    expect(entry.visibility).toBe("public");
    expect(entry.scopePolicyRef).toBeUndefined();
    expect(entry.dataClass).toBe("public-safe");
    expect(entry.frameworks).toEqual(["svelte", "react", "vue", "angular"]);
    expect(entry.parity).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "match",
      angular: "match",
    });

    // Deliveries pin exact manifests and recomputed file bytes.
    const deliveries = entry.delivery as {
      framework: string;
      package: string;
      version: string;
      path: string;
      digest: string;
    }[];
    expect(deliveries).toHaveLength(4);
    const pins: Record<string, { dir: string; path: string }> = {
      svelte: { dir: "packages/components-svelte", path: "packages/components-svelte/src/lib/Button.svelte" },
      react: { dir: "packages/components-react", path: "packages/components-react/src/Button.tsx" },
      vue: { dir: "packages/components-vue", path: "packages/components-vue/src/Button.vue" },
      angular: { dir: "packages/components-angular", path: "packages/components-angular/src/Button.ts" },
    };
    for (const delivery of deliveries) {
      const pin = pins[delivery.framework];
      expect(pin).toBeDefined();
      expect(delivery.package).toBe(manifest(pin.dir).name);
      expect(delivery.version).toBe(manifest(pin.dir).version);
      expect(delivery.path).toBe(pin.path);
      expect(delivery.digest).toBe(fileDigest(pin.path));
    }

    // Entry digest recomputes (never trusted, never hard-coded here).
    const { digest, ...digestless } = entry;
    expect(entryDigest(digestless)).toBe(digest);
  });

  it("button re-digests to its committed value from working-tree bytes", () => {
    // Spec 4.3 acceptance in T6 terms: the committed entry must equal a
    // fresh digest over working-tree bytes. No design-session digest is
    // hard-coded; the assertions recompute everything they compare.
    const entry = readEntry("button") as { digest: string; delivery: { path: string; digest: string }[] };
    for (const delivery of entry.delivery) {
      expect(delivery.digest).toBe(fileDigest(delivery.path));
    }
    const { digest, ...digestless } = entry;
    expect(entryDigest(digestless)).toBe(digest);
    expect(entry.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("bar-chart merges the published Elements contract without losing catalogue fields", () => {
    const rows = parseCatalogueFile(join(repoRoot, "apps/docs/src/lib/components-catalog.ts"));
    const row = rows.find((candidate) => candidate.slug === "bar-chart");
    const entry = readEntry("bar-chart") as {
      displayName: unknown;
      description: unknown;
      category: unknown;
      status: unknown;
      frameworks: unknown;
      parity: unknown;
      delivery: { channel: string; element?: string; package: string; version: string; path: string; digest: string }[];
      contract: { contractId: string; version: string; contractSource: string; schemaDigest: string };
    };
    expect(entry.displayName).toBe(row?.name);
    expect(entry.description).toEqual(row?.description);
    expect(entry.category).toBe(row?.category);
    expect(entry.producerId).toBe("sentropic-ds");
    expect(entry.scope).toBe("generic");
    expect(entry.visibility).toBe("public");
    expect(entry.dataClass).toBe("public-safe");
    expect(entry.parity).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "match",
      angular: "match",
    });

    const catalog = JSON.parse(readFileSync(join(repoRoot, "packages/elements/catalog.json"), "utf8")) as {
      components: Record<string, { "x-sentropic": { contract: string; element: string } }>;
    };
    const meta = catalog.components["BarChart"]?.["x-sentropic"];
    expect(entry.contract.contractSource).toBe("published");
    expect(entry.contract.version).toBe(meta.contract);
    const schema = JSON.parse(
      readFileSync(join(repoRoot, "packages/elements/schemas/BarChart.v1.json"), "utf8"),
    ) as { $id: string };
    expect(entry.contract.contractId).toBe(schema.$id);
    expect(entry.contract.schemaDigest).toBe(fileDigest("packages/elements/schemas/BarChart.v1.json"));
    const elementsManifest = manifest("packages/elements");
    const elementDelivery = entry.delivery.find((delivery) => delivery.channel === "element");
    expect(elementDelivery?.element).toBe(meta.element);
    expect(elementDelivery?.package).toBe(elementsManifest.name);
    expect(elementDelivery?.version).toBe(elementsManifest.version);
    expect(entry.delivery.filter((delivery) => delivery.channel === "source")).toHaveLength(4);
  });

  it("design-tokens pins the three token sources plus the three house theme CSS files", () => {
    // Frozen §9.3: one tokens-channel delivery per committed source, with
    // exact manifest pins and recomputed file digests. Measured-clone
    // theme packages are never enumerated.
    const entry = readEntry("design-tokens") as {
      producerId: unknown;
      displayName: unknown;
      scope: unknown;
      visibility: unknown;
      dataClass: unknown;
      parity: unknown;
      frameworks: unknown;
      renderable: unknown;
      delivery: { channel: string; package: string; version: string; path: string; digest: string }[];
    };
    expect(entry.producerId).toBe("sentropic-ds");
    expect(entry.displayName).toBe("DesignTokens");
    expect(entry.scope).toBe("generic");
    expect(entry.visibility).toBe("public");
    expect(entry.dataClass).toBe("public-safe");
    expect(entry.renderable).toBe("doc-only");
    expect(entry.parity).toEqual({
      svelte: "no-counterpart",
      react: "no-counterpart",
      vue: "no-counterpart",
      angular: "no-counterpart",
    });
    expect(entry.frameworks).toEqual([]);

    const tokensManifest = manifest("packages/tokens");
    const themesManifest = manifest("packages/themes");
    const expected: { path: string; package: string; version: string }[] = [
      { path: "packages/tokens/src/foundation.ts", package: tokensManifest.name, version: tokensManifest.version },
      { path: "packages/tokens/src/semantic.ts", package: tokensManifest.name, version: tokensManifest.version },
      { path: "packages/tokens/src/component.ts", package: tokensManifest.name, version: tokensManifest.version },
      { path: "packages/themes/css/sent-tech.css", package: themesManifest.name, version: themesManifest.version },
      { path: "packages/themes/css/forge.css", package: themesManifest.name, version: themesManifest.version },
      { path: "packages/themes/css/entropic.css", package: themesManifest.name, version: themesManifest.version },
    ];
    expect(entry.delivery).toHaveLength(6);
    for (const [index, delivery] of entry.delivery.entries()) {
      const pin = expected[index];
      expect(pin).toBeDefined();
      expect(delivery.channel).toBe("tokens");
      expect(delivery.path).toBe(pin?.path);
      expect(delivery.package).toBe(pin?.package);
      expect(delivery.version).toBe(pin?.version);
      expect(delivery.digest).toBe(fileDigest(pin?.path ?? ""));
    }
    const { digest, ...digestless } = entry as unknown as { digest: string };
    expect(entryDigest(digestless)).toBe(digest);
  });

  it("geo-chart is the documented static map; no geo-map alias is indexed", () => {
    // Catalogue GeoChart: ds-native prose only — no code asserts an origin field.
    const entry = readEntry("geo-chart") as {
      displayName: unknown;
      parity: unknown;
      frameworks: unknown;
      scope: unknown;
      visibility: unknown;
      dataClass: unknown;
    };
    expect(entry.displayName).toBe("GeoChart");
    expect(entry.parity).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "match",
      angular: "match",
    });
    expect(entry.frameworks).toEqual(["svelte", "react", "vue", "angular"]);
    expect(entry.scope).toBe("generic");
    expect(entry.visibility).toBe("public");
    expect(entry.dataClass).toBe("public-safe");
    // The kept stylesheet class `.st-geoMap` is an internal name, not an
    // identity: it creates no alias entry.
    expect(existsSync(join(packageDir, "generated", "entries", "geo-map.json"))).toBe(false);
  });
});
