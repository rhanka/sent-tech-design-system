import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildArtifacts } from "../src/generator/emit.js";
import { assertEntryInvariants } from "../src/generator/emit.js";

const here = dirname(fileURLToPath(import.meta.url));
const realPackageDir = join(here, "..");

const MANIFESTS: Record<string, string> = {
  "packages/components-svelte": "@mini/svelte",
  "packages/components-react": "@mini/react",
  "packages/components-vue": "@mini/vue",
  "packages/components-angular": "@mini/angular",
  "packages/dataviz-svelte": "@mini/dataviz-svelte",
  "packages/dataviz-react": "@mini/dataviz-react",
  "packages/dataviz-vue": "@mini/dataviz-vue",
  "packages/dataviz-angular": "@mini/dataviz-angular",
  "packages/elements": "@mini/elements",
  "packages/tokens": "@mini/tokens",
  "packages/themes": "@mini/themes",
};

const CATALOGUE = `export const COMPONENTS = [
  {
    name: "Widget",
    slug: "widget",
    status: "documented",
    category: "action",
    groupSlug: "widget",
    description: { fr: "Bidule.", en: "Widget." }
  },
  {
    name: "Gadget",
    slug: "gadget",
    status: "documented",
    category: "data",
    description: { fr: "Gadget.", en: "Gadget." }
  }
];
`;

interface MiniTree {
  root: string;
  pkg: string;
}

function writeFile(root: string, relative: string, text: string): void {
  const path = join(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, "utf8");
}

/** Minimal fixture repo tree: 2 catalogue rows, 8 barrels, 11 manifests. */
function scaffold(): MiniTree {
  const root = mkdtempSync(join(tmpdir(), "k1a-mini-root-"));
  const pkg = mkdtempSync(join(tmpdir(), "k1a-mini-pkg-"));
  writeFile(root, "apps/docs/src/lib/components-catalog.ts", CATALOGUE);
  writeFile(root, "packages/components-svelte/src/lib/index.ts", 'export { default as Widget } from "./Widget.svelte";\n');
  writeFile(root, "packages/components-svelte/src/lib/Widget.svelte", "<div>w</div>\n");
  writeFile(root, "packages/components-react/src/index.ts", 'export { Widget } from "./Widget.js";\n');
  writeFile(root, "packages/components-react/src/Widget.tsx", "export const Widget = 1;\n");
  writeFile(root, "packages/components-vue/src/index.ts", 'export { Widget } from "./Widget.js";\n');
  writeFile(root, "packages/components-vue/src/Widget.ts", "export const Widget = 1;\n");
  writeFile(root, "packages/components-angular/src/index.ts", 'export { Widget } from "./Widget.js";\n');
  writeFile(root, "packages/components-angular/src/Widget.ts", "export const Widget = 1;\n");
  writeFile(root, "packages/dataviz-svelte/src/index.ts", 'export { default as Gadget } from "./lib/Gadget.svelte";\n');
  writeFile(root, "packages/dataviz-svelte/src/lib/Gadget.svelte", "<div>g</div>\n");
  for (const framework of ["react", "vue", "angular"]) {
    writeFile(root, `packages/dataviz-${framework}/src/index.ts`, "export {};\n");
  }
  for (const [dir, name] of Object.entries(MANIFESTS)) {
    writeFile(root, `${dir}/package.json`, JSON.stringify({ name, version: "0.1.0" }));
  }
  writeFile(root, "packages/elements/catalog.json", JSON.stringify({ components: {} }));
  writeFile(
    pkg,
    "package.json",
    JSON.stringify({ name: "@mini/component-index", version: "0.1.0" }),
  );
  for (const schema of ["component-entry.v1.json", "component-index.v1.json"]) {
    writeFile(pkg, `schemas/${schema}`, readFileSync(join(realPackageDir, "schemas", schema), "utf8"));
  }
  writeFile(
    pkg,
    "catalog-overlay.json",
    JSON.stringify({ version: 1, entries: [], excluded: [] }),
  );
  writeFile(
    pkg,
    "parity-baseline.json",
    JSON.stringify({
      version: 2,
      expectedParity: {
        widget: { svelte: "source-of-truth", react: "match", vue: "match", angular: "match" },
        gadget: { svelte: "missing", react: "missing", vue: "missing", angular: "missing" },
      },
      gaps: [
        {
          componentId: "gadget",
          parity: { svelte: "missing", react: "missing", vue: "missing", angular: "missing" },
          reason: "mini-tree fixture: dataviz-only",
        },
      ],
      barrelOnly: {
        svelte: [],
        react: [],
        vue: [],
        angular: [],
        "dataviz-svelte": [],
        "dataviz-react": [],
        "dataviz-vue": [],
        "dataviz-angular": [],
      },
      unresolvedStars: {
        svelte: [],
        react: [],
        vue: [],
        angular: [],
        "dataviz-svelte": [],
        "dataviz-react": [],
        "dataviz-vue": [],
        "dataviz-angular": [],
      },
    }),
  );
  return { root, pkg };
}

function mutate(tree: MiniTree, relative: string, text: string): void {
  writeFile(tree.root, relative, text);
}

function mutatePkg(tree: MiniTree, relative: string, text: string): void {
  writeFile(tree.pkg, relative, text);
}

describe("emit on a miniature tree", () => {
  it("emits two entries with exact-version pins and sums counts", () => {
    const tree = scaffold();
    const { files, log } = buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) });
    expect(files).toHaveLength(3);
    expect(files[0]?.path).toBe("generated/component-index.json");
    const index = JSON.parse(files[0]?.text ?? "{}");
    expect(index.counts).toEqual({ entries: 2, byRenderable: { mcp: 0, https: 0, "doc-only": 2 } });
    expect(index.entries.map((row: { componentId: string }) => row.componentId)).toEqual([
      "gadget",
      "widget",
    ]);
    const widget = JSON.parse(files.find((f) => f.path.endsWith("widget.json"))?.text ?? "{}");
    expect(widget.producerId).toBe("sentropic-ds");
    expect(widget.scope).toBe("generic");
    expect(widget.visibility).toBe("public");
    expect(widget.scopePolicyRef).toBeUndefined();
    expect(widget.dataClass).toBe("public-safe");
    expect(widget.parity).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "match",
      angular: "match",
    });
    expect(widget.frameworks).toEqual(["svelte", "react", "vue", "angular"]);
    expect(widget.delivery).toHaveLength(4);
    expect(log.exclusions.join("\n")).toMatch(/geo-map/);
  });

  it("is byte-deterministic across two builds", () => {
    const tree = scaffold();
    const first = buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) });
    const second = buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) });
    expect(second.files.map((f) => f.text)).toEqual(first.files.map((f) => f.text));
  });

  it("fails on a version-1 baseline (frozen maps need version 2)", () => {
    const tree = scaffold();
    mutatePkg(
      tree,
      "parity-baseline.json",
      JSON.stringify({
        version: 1,
        expectedParity: { widget: "complete", gadget: "dataviz" },
        gaps: [{ componentId: "gadget", parity: "dataviz", reason: "stale shape" }],
        barrelOnly: {
          svelte: [],
          react: [],
          vue: [],
          angular: [],
          "dataviz-svelte": [],
          "dataviz-react": [],
          "dataviz-vue": [],
          "dataviz-angular": [],
        },
        unresolvedStars: {
          svelte: [],
          react: [],
          vue: [],
          angular: [],
          "dataviz-svelte": [],
          "dataviz-react": [],
          "dataviz-vue": [],
          "dataviz-angular": [],
        },
      }),
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /version must be 2/,
    );
  });

  it("fails on a baseline map mismatch and repairs nothing", () => {
    const tree = scaffold();
    mutatePkg(
      tree,
      "parity-baseline.json",
      JSON.stringify({
        version: 2,
        expectedParity: {
          widget: { svelte: "source-of-truth", react: "match", vue: "missing", angular: "match" },
          gadget: { svelte: "missing", react: "missing", vue: "missing", angular: "missing" },
        },
        gaps: [
          {
            componentId: "widget",
            parity: { svelte: "source-of-truth", react: "match", vue: "missing", angular: "match" },
            reason: "stale",
          },
          {
            componentId: "gadget",
            parity: { svelte: "missing", react: "missing", vue: "missing", angular: "missing" },
            reason: "mini-tree fixture: dataviz-only",
          },
        ],
        barrelOnly: {
          svelte: [],
          react: [],
          vue: [],
          angular: [],
          "dataviz-svelte": [],
          "dataviz-react": [],
          "dataviz-vue": [],
          "dataviz-angular": [],
        },
        unresolvedStars: {
          svelte: [],
          react: [],
          vue: [],
          angular: [],
          "dataviz-svelte": [],
          "dataviz-react": [],
          "dataviz-vue": [],
          "dataviz-angular": [],
        },
      }),
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /baseline mismatch.*widget/,
    );
  });

  it("fails on an exported-nowhere row (all missing with no dataviz delivery)", () => {
    const tree = scaffold();
    mutate(
      tree,
      "apps/docs/src/lib/components-catalog.ts",
      `${CATALOGUE.slice(0, -3)},
  {
    name: "Ghost",
    slug: "ghost",
    status: "documented",
    category: "other",
    description: { fr: "Fantome.", en: "Ghost." }
  }
];
`,
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /exported nowhere/,
    );
  });

  it("fails on a missing delivery file (never a guessed path)", () => {
    const tree = scaffold();
    mutate(
      tree,
      "packages/components-react/src/index.ts",
      'export { Widget } from "./Absent.js";\n',
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /no committed file/,
    );
  });

  it("fails on a range version in a manifest", () => {
    const tree = scaffold();
    mutate(
      tree,
      "packages/components-react/package.json",
      JSON.stringify({ name: "@mini/react", version: "^0.1.0" }),
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /exact semver/,
    );
  });

  it("fails on an overlay row colliding with a catalogue slug", () => {
    const tree = scaffold();
    mutatePkg(
      tree,
      "catalog-overlay.json",
      JSON.stringify({
        version: 1,
        entries: [
          {
            componentId: "widget",
            displayName: "Widget",
            description: { fr: "Bidule.", en: "Widget." },
          },
        ],
        excluded: [],
      }),
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /collides/,
    );
  });

  it("fails on an overlay row missing a language (missing source)", () => {
    const tree = scaffold();
    mutatePkg(
      tree,
      "catalog-overlay.json",
      JSON.stringify({
        version: 1,
        entries: [
          {
            componentId: "design-tokens",
            displayName: "DesignTokens",
            description: { en: "Tokens." },
          },
        ],
        excluded: [],
      }),
    );
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /missing source/,
    );
  });

  it("fails when the geo package is present (conductor Q8 OUT)", () => {
    const tree = scaffold();
    mkdirSync(join(tree.root, "packages/components-geo-svelte"), { recursive: true });
    expect(() => buildArtifacts(tree.root, tree.pkg, { sourceCommit: "0".repeat(40) })).toThrow(
      /Q8/,
    );
  });
});

describe("entry invariants", () => {
  const parity = {
    svelte: "source-of-truth",
    react: "match",
    vue: "match",
    angular: "match",
  } as const;
  const base = {
    componentId: "widget",
    renderable: "doc-only",
    scope: "generic",
    visibility: "public",
    parity,
    dataClass: "public-safe",
    frameworks: ["svelte", "react", "vue", "angular"],
    delivery: [
      {
        channel: "source",
        framework: "svelte",
        package: "@mini/svelte",
        version: "0.1.0",
        path: "packages/components-svelte/src/lib/Widget.svelte",
        digest: `sha256:${"0".repeat(64)}`,
      },
    ],
  };

  it("rejects an entry carrying a url", () => {
    expect(() =>
      assertEntryInvariants({
        ...base,
        delivery: [{ ...base.delivery[0], url: "https://example.com/x.js" } as never],
      }),
    ).toThrow(/url/);
  });

  it("rejects a derived contract", () => {
    // Cast: the point of the test is the runtime rejection of a contract
    // shape the types would otherwise forbid at the call site.
    const derived = { contractId: "x", version: "1.0", contractSource: "derived" } as {
      contractSource: string;
    };
    expect(() => assertEntryInvariants({ ...base, contract: derived })).toThrow(/derived/);
  });

  it("rejects a non-doc-only renderable", () => {
    expect(() => assertEntryInvariants({ ...base, renderable: "https" })).toThrow(/doc-only/);
  });

  it("rejects a non-generic scope in K1a", () => {
    expect(() => assertEntryInvariants({ ...base, scope: "producer" })).toThrow(/generic/);
  });

  it("rejects a non-public visibility in K1a", () => {
    expect(() => assertEntryInvariants({ ...base, visibility: "tenant" })).toThrow(/public/);
  });

  it("rejects a public entry carrying scopePolicyRef", () => {
    expect(() =>
      assertEntryInvariants({ ...base, scopePolicyRef: "storage-scope-1" }),
    ).toThrow(/scopePolicyRef/);
  });

  it("rejects a retired tenant field", () => {
    expect(() =>
      assertEntryInvariants({ ...base, tenant: "immo" } as never),
    ).toThrow(/tenant/);
  });

  it("rejects a non-public-safe dataClass in K1a", () => {
    expect(() => assertEntryInvariants({ ...base, dataClass: "tenant-private" })).toThrow(
      /public-safe/,
    );
  });

  it("rejects a string parity", () => {
    expect(() => assertEntryInvariants({ ...base, parity: "complete" })).toThrow(/four-key/);
  });

  it("rejects frameworks that do not project the parity map", () => {
    expect(() => assertEntryInvariants({ ...base, frameworks: ["svelte"] })).toThrow(
      /project the parity map/,
    );
  });

  it("rejects an over-280 description", () => {
    expect(() =>
      assertEntryInvariants({
        ...base,
        description: { fr: "x".repeat(281), en: "Widget." },
      }),
    ).toThrow(/280/);
  });
});
