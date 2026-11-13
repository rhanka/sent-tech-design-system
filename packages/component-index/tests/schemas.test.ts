import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020, { type AnySchema } from "ajv/dist/2020.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const entrySchemaPath = join(packageDir, "schemas", "component-entry.v1.json");
const indexSchemaPath = join(packageDir, "schemas", "component-index.v1.json");

// Frozen section 4.3 worked example (exact field values; the entry digest is
// the frozen recomputed value a9d17f93...).
const buttonEntry = {
  format: "component-entry/v1",
  producerId: "sentropic-ds",
  componentId: "button",
  displayName: "Button",
  description: {
    fr: "Action primaire, secondaire, fantôme ou destructive.",
    en: "Primary, secondary, ghost, or destructive action.",
  },
  category: "action",
  status: "documented",
  groupSlug: "button",
  frameworks: ["svelte", "react", "vue", "angular"],
  renderable: "doc-only",
  scope: "generic",
  visibility: "public",
  parity: { svelte: "source-of-truth", react: "match", vue: "match", angular: "match" },
  dataClass: "public-safe",
  delivery: [
    {
      channel: "source",
      framework: "svelte",
      package: "@sentropic/design-system-svelte",
      version: "0.36.0",
      path: "packages/components-svelte/src/lib/Button.svelte",
      digest: "sha256:2d80b826faa918933d28a3714376c8d123f8f812eee7c148c8274682dabfab61",
    },
    {
      channel: "source",
      framework: "react",
      package: "@sentropic/design-system-react",
      version: "0.38.0",
      path: "packages/components-react/src/Button.tsx",
      digest: "sha256:97f2b6bfdb0f08553eb2c309afe79d168b36445d5da2cfd2214bce2c356ecc43",
    },
    {
      channel: "source",
      framework: "vue",
      package: "@sentropic/design-system-vue",
      version: "0.38.0",
      path: "packages/components-vue/src/Button.vue",
      digest: "sha256:797718abefe5fb0a74015e1422138bec508ef2b2a95009d71c8c3102f76491e0",
    },
    {
      channel: "source",
      framework: "angular",
      package: "@sentropic/design-system-angular",
      version: "0.38.0",
      path: "packages/components-angular/src/Button.ts",
      digest: "sha256:760d8e14b0f16aa125fca5d9e975e77e4dfcee6d20e9ca4a81572a3887491bd4",
    },
  ],
  digest: "sha256:a9d17f9366c7a0eb42f09f01bd7a9592dd30383b0a0c6913453fa10425da45a3",
};

function loadSchemas(): { entry: AnySchema; index: AnySchema } {
  const entry = JSON.parse(readFileSync(entrySchemaPath, "utf8")) as AnySchema;
  const index = JSON.parse(readFileSync(indexSchemaPath, "utf8")) as AnySchema;
  return { entry, index };
}

function validateEntry(value: unknown): boolean {
  const { entry } = loadSchemas();
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  return ajv.compile(entry)(value);
}

describe("component schemas exist and compile", () => {
  it("both v1 schema files exist", () => {
    expect(existsSync(entrySchemaPath), `missing ${entrySchemaPath}`).toBe(true);
    expect(existsSync(indexSchemaPath), `missing ${indexSchemaPath}`).toBe(true);
  });

  it("both schemas compile under Ajv 2020-12", () => {
    const { entry, index } = loadSchemas();
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    expect(() => ajv.compile(entry)).not.toThrow();
    expect(() => ajv.compile(index)).not.toThrow();
  });

  it("the frozen section 4.3 Button object validates", () => {
    expect(validateEntry(buttonEntry)).toBe(true);
  });

  it("a synthetic producer/tenant entry with scopePolicyRef validates at schema level", () => {
    const synthetic = {
      ...buttonEntry,
      scope: "producer",
      visibility: "tenant",
      scopePolicyRef: "storage-scope-1",
    };
    expect(validateEntry(synthetic)).toBe(true);
  });
});

describe("entry schema negatives", () => {
  it("rejects the retired kind field", () => {
    expect(validateEntry({ ...buttonEntry, kind: "reference-source" })).toBe(false);
  });

  it("rejects a malformed digest", () => {
    expect(validateEntry({ ...buttonEntry, digest: "sha256:not-hex" })).toBe(false);
  });

  it("rejects scope approved (retired predecessor value)", () => {
    expect(validateEntry({ ...buttonEntry, scope: "approved" })).toBe(false);
  });

  it("rejects scope tenant-scoped (retired predecessor value)", () => {
    expect(validateEntry({ ...buttonEntry, scope: "tenant-scoped" })).toBe(false);
  });

  it("rejects any tenant field", () => {
    expect(validateEntry({ ...buttonEntry, tenant: "immo" })).toBe(false);
  });

  it("rejects visibility tenant without scopePolicyRef", () => {
    const { visibility: _drop, ...rest } = buttonEntry;
    void _drop;
    expect(validateEntry({ ...rest, visibility: "tenant" })).toBe(false);
  });

  it("rejects visibility public with scopePolicyRef", () => {
    expect(validateEntry({ ...buttonEntry, scopePolicyRef: "storage-scope-1" })).toBe(false);
  });

  it("rejects string parity", () => {
    expect(validateEntry({ ...buttonEntry, parity: "complete" })).toBe(false);
  });

  it("rejects parity value dataviz", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        parity: { svelte: "source-of-truth", react: "match", vue: "match", angular: "dataviz" },
      }),
    ).toBe(false);
  });

  it("rejects parity missing a framework key", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        parity: { svelte: "source-of-truth", react: "match", vue: "match" },
      }),
    ).toBe(false);
  });

  it("rejects parity value mismatch", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        parity: { svelte: "mismatch", react: "match", vue: "match", angular: "match" },
      }),
    ).toBe(false);
  });

  it("rejects dataClass none (retired predecessor value)", () => {
    expect(validateEntry({ ...buttonEntry, dataClass: "none" })).toBe(false);
  });

  it("rejects dataClass personal (retired predecessor value)", () => {
    expect(validateEntry({ ...buttonEntry, dataClass: "personal" })).toBe(false);
  });

  it("rejects frameworks containing js", () => {
    expect(
      validateEntry({ ...buttonEntry, frameworks: ["svelte", "react", "vue", "angular", "js"] }),
    ).toBe(false);
  });

  it("rejects a 281-char fr description", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        description: { fr: "x".repeat(281), en: buttonEntry.description.en },
      }),
    ).toBe(false);
  });

  it("rejects a 281-char en description", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        description: { fr: buttonEntry.description.fr, en: "y".repeat(281) },
      }),
    ).toBe(false);
  });

  it("rejects a range version in a delivery", () => {
    expect(
      validateEntry({
        ...buttonEntry,
        delivery: [{ ...buttonEntry.delivery[0], version: "^0.38.0" }],
      }),
    ).toBe(false);
  });
});
