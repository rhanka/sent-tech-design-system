import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020, { type AnySchema } from "ajv/dist/2020.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const contractSchemaPath = join(packageDir, "schemas", "component-contract.v1.json");
const contractIndexSchemaPath = join(packageDir, "schemas", "component-contract-index.v1.json");

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function minimalFrameworkContract(): Record<string, unknown> {
  return {
    status: "none",
    reason: "absent",
    source: {
      package: "@sentropic/design-system-svelte",
      version: "0.36.0",
      declarationPath: "packages/components-svelte/dist/Button.svelte.d.ts",
      declarationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      propsType: "ButtonProps",
    },
    slots: [],
    events: [],
    bindable: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    limitations: [],
    warnings: [],
  };
}

function minimalContract(): Record<string, unknown> {
  return {
    format: "component-contract/v1",
    producerId: "sentropic-ds",
    componentId: "button",
    entryDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    contractSource: "derived",
    frameworks: {
      svelte: minimalFrameworkContract(),
      react: minimalFrameworkContract(),
      vue: minimalFrameworkContract(),
      angular: minimalFrameworkContract(),
    },
    digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  };
}

function minimalContractIndex(): Record<string, unknown> {
  return {
    format: "component-contract-index/v1",
    producerId: "sentropic-ds",
    contractsRevision: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    sourceCommit: "6e6e66cfe42657e31a698fe4887d4e7381df2c73".slice(0, 40),
    generatedBy: { generator: "@sentropic/design-system-component-index", version: "0.2.0" },
    counts: {
      contracts: 1,
      byFramework: {
        svelte: { complete: 0, partial: 0, none: 1 },
        react: { complete: 0, partial: 0, none: 1 },
        vue: { complete: 0, partial: 0, none: 1 },
        angular: { complete: 0, partial: 0, none: 1 },
      },
    },
    entries: [
      {
        producerId: "sentropic-ds",
        componentId: "button",
        entryDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        contractDigest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        completeness: { svelte: "none", react: "none", vue: "none", angular: "none" },
        path: "contracts/button.json",
      },
    ],
    excluded: [{ componentId: "bar-chart", reason: "published" }],
  };
}

describe("K1b schemas exist and compile", () => {
  it("both schema files exist", () => {
    expect(existsSync(contractSchemaPath)).toBe(true);
    expect(existsSync(contractIndexSchemaPath)).toBe(true);
  });

  it("both schemas compile under Ajv 2020-12", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const contractSchema = loadJson(contractSchemaPath) as AnySchema;
    const indexSchema = loadJson(contractIndexSchemaPath) as AnySchema;
    expect(() => ajv.compile(contractSchema)).not.toThrow();
    expect(() => ajv.compile(indexSchema)).not.toThrow();
  });
});

describe("K1b minimal documents validate", () => {
  it("a minimal valid contract document validates", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(loadJson(contractSchemaPath) as AnySchema);
    const valid = validate(minimalContract());
    expect(JSON.stringify(validate.errors)).toBe("null");
    expect(valid).toBe(true);
  });

  it("a minimal valid contract index validates", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(loadJson(contractIndexSchemaPath) as AnySchema);
    const valid = validate(minimalContractIndex());
    expect(JSON.stringify(validate.errors)).toBe("null");
    expect(valid).toBe(true);
  });
});

describe("K1b schema negatives", () => {
  function validateContract(value: unknown): boolean {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    return ajv.compile(loadJson(contractSchemaPath) as AnySchema)(value) as boolean;
  }

  function validateIndex(value: unknown): boolean {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    return ajv.compile(loadJson(contractIndexSchemaPath) as AnySchema)(value) as boolean;
  }

  it("schema allows contractSource published; the GENERATOR never emits it (split recorded)", () => {
    // The schema enum keeps both vocabulary values (converged section 3);
    // the K1b generator profile emits only "derived" (spec GEN-C4). The
    // generator-side refusal is asserted in tests/contracts/emit.test.ts.
    const withPublished = { ...minimalContract(), contractSource: "published" };
    expect(validateContract(withPublished)).toBe(true);
  });

  it("an extra top-level field is rejected", () => {
    const extra = { ...minimalContract(), contract: { contractSource: "derived" } };
    expect(validateContract(extra)).toBe(false);
  });

  it("status partiel is rejected (the marker is partial, never a status string)", () => {
    const contract = minimalContract();
    const frameworks = contract["frameworks"] as Record<string, Record<string, unknown>>;
    frameworks["svelte"] = { ...minimalFrameworkContract(), status: "partiel" };
    expect(validateContract(contract)).toBe(false);
  });

  it("parity-style single-string completeness is rejected on index rows", () => {
    const index = minimalContractIndex();
    const entries = index["entries"] as Record<string, unknown>[];
    entries[0] = { ...entries[0], completeness: "partial" };
    expect(validateIndex(index)).toBe(false);
  });

  it("a malformed entryDigest is rejected", () => {
    const malformed = { ...minimalContract(), entryDigest: "sha256:xyz" };
    expect(validateContract(malformed)).toBe(false);
  });

  it("a row completeness missing a framework key is rejected", () => {
    const index = minimalContractIndex();
    const entries = index["entries"] as Record<string, unknown>[];
    entries[0] = {
      ...entries[0],
      completeness: { svelte: "none", react: "none", vue: "none" },
    };
    expect(validateIndex(index)).toBe(false);
  });
});
