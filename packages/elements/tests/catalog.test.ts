/**
 * AC-L1 witnesses on the committed catalogue artifacts (§5.2, §15).
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30): every
 * test in this file failed at that point — `catalog.json`,
 * `schemas/*.v1.json` and `src/generated/a2ui-common-types.ts` did not exist
 * (ENOENT), and `src/validate/index.js` was not resolvable. The suite is the
 * RED witness for the AC-L1 items "$id equal to catalogId and three
 * components", "standalone schema agrees with its catalogue entry", "no
 * implicit any in the generated schemas, or an inventory of each replacement
 * type" and "each component's example validates and a mutated example fails
 * with the expected path".
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { contracts, CATALOG_ID } from "../src/contracts/index.js";
import { canonicalize, type Json } from "../src/generator/canonical.js";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import { createFocusPort, createEnvelopeValidator, type CatalogDocument, type Diagnostic } from "../src/validate/index.js";
import { validateDecisionDossierDocument as realFocusValidate } from "@sentropic/focus/validate";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(packageDir, relativePath), "utf8")) as Record<string, unknown>;
}

const catalog = readJson("catalog.json") as CatalogDocument;
const envelopeSchema = readJson("envelope.json");
const commonTypes = a2uiCommonTypes as unknown as Record<string, unknown>;

const envelopeOf = (root: Record<string, unknown>): Record<string, unknown> => ({
  catalogId: CATALOG_ID,
  contract: "1.0",
  mode: "snapshot",
  root,
});

function validate(root: Record<string, unknown>, ports?: Parameters<typeof createEnvelopeValidator>[0]["ports"]): readonly Diagnostic[] {
  // Semantic ports are injected (§4.3 item 2): the REAL focus validator for
  // DecisionDossier, and an accept-everything stub for BpmnCanvas — no BPMN
  // engine is installed in this workspace, so the workspace-side witness
  // cannot exercise the engine's hydrate (the L6 host injects the real one).
  const injected = ports ?? {
    focus: createFocusPort(realFocusValidate),
    "bpmn-canvas": { source: "bpmn-canvas" as const, validate: () => [] },
  };
  const validator = createEnvelopeValidator({
    catalog: JSON.parse(JSON.stringify(catalog)) as CatalogDocument,
    envelopeSchema,
    commonTypes,
    ports: injected,
  });
  return validator.validate(envelopeOf(root));
}

describe("AC-L1: catalog.json has $id equal to catalogId and three components", () => {
  it("$schema is draft 2020-12", () => {
    expect(catalog.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
  });

  it("$id equals catalogId, with the spec's exact value", () => {
    expect(catalog.$id).toBe(CATALOG_ID);
    expect(catalog.catalogId).toBe(CATALOG_ID);
    expect(CATALOG_ID).toBe("https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json");
  });

  it("has exactly the three components of §5.4", () => {
    expect(Object.keys(catalog.components).sort()).toEqual(["BarChart", "BpmnCanvas", "DecisionDossier"]);
  });

  it("functions is empty and $defs carries anyComponent and theme (§5.2)", () => {
    expect(catalog.functions).toEqual({});
    const defs = catalog.$defs as Record<string, unknown>;
    expect(Object.keys(defs).sort()).toContain("anyComponent");
    expect(Object.keys(defs).sort()).toContain("theme");
    expect(defs["theme"]).toEqual({
      type: "object",
      properties: { themeId: { type: "string" } },
    });
    const anyComponent = defs["anyComponent"] as { oneOf: { $ref: string }[] };
    expect(anyComponent.oneOf.map((entry) => entry.$ref).sort()).toEqual([
      "#/components/BarChart",
      "#/components/BpmnCanvas",
      "#/components/DecisionDossier",
    ]);
  });

  it("every entry is in the basic-catalogue form of §5.2", () => {
    for (const contract of contracts) {
      const entry = catalog.components[contract.component] as Record<string, unknown>;
      expect(entry.type, contract.component).toBe("object");
      const allOf = entry.allOf as Record<string, unknown>[];
      expect(allOf.length, contract.component).toBeGreaterThanOrEqual(3);
      expect(allOf[0], `${contract.component} ComponentCommon ref`).toEqual({
        $ref: "https://a2ui.org/specification/v0_9_1/common_types.json#/$defs/ComponentCommon",
      });
      expect(allOf[1], `${contract.component} CatalogComponentCommon ref`).toEqual({ $ref: "#/$defs/CatalogComponentCommon" });
      const local = allOf[2] as { properties: Record<string, unknown>; required: string[] };
      expect(local.properties.component, contract.component).toEqual({ const: contract.component });
      expect(local.required, contract.component).toContain("component");
      expect(entry.unevaluatedProperties, contract.component).toBe(false);
      const x = entry["x-sentropic"] as Record<string, unknown>;
      expect(x.contract, contract.component).toBe(contract.metadata.contract);
      expect(x.element, contract.component).toBe(contract.metadata.element);
      expect(x.engine, contract.component).toBe(contract.metadata.engine);
      expect(x.events, contract.component).toEqual(contract.metadata.events);
      expect(x.fallback, contract.component).toBe(contract.metadata.fallback);
      expect(x.schema, contract.component).toBe(
        `https://design-system.sent-tech.ca/catalogs/elements/v1/components/${contract.component}.json`,
      );
      expect(x.example, contract.component).toEqual(contract.example);
      expect(x.parity, contract.component).toBeDefined();
    }
  });
});

describe("AC-L1: each standalone schema agrees with its catalogue entry", () => {
  for (const contract of contracts) {
    it(`${contract.component}: the component part equals the catalogue entry after canonical sorting`, () => {
      const standalone = readJson(`schemas/${contract.component}.v1.json`) as {
        $id: string;
        $schema: string;
        $defs: Record<string, unknown>;
      };
      expect(standalone.$id).toBe(
        `https://design-system.sent-tech.ca/catalogs/elements/v1/components/${contract.component}.json`,
      );
      expect(standalone.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
      expect(standalone.$defs["component"], "standalone must carry the entry under $defs.component").toBeDefined();
      expect(canonicalize(standalone.$defs["component"] as Json)).toEqual(
        canonicalize(catalog.components[contract.component]! as unknown as Json),
      );
    });
  }
});

describe("AC-L1: no implicit any in the generated schemas, or an inventory of each replacement type", () => {
  /**
   * A schema node that accepts ANY JSON value without declaring anything is an
   * implicit `any`: the empty object `{}` or the boolean `true` (§5.1 forbids
   * emitting one silently). The walk covers every artifact the generator
   * commits; each hit must be explained by a contract's declared replacement
   * (the inventory), and each inventory entry that promises an emitted node
   * must have one.
   */
  function anyNodes(node: unknown, path: string, file: string, found: { file: string; path: string }[]): void {
    if (node === null || typeof node !== "object") {
      if (node === true) found.push({ file, path });
      return;
    }
    if (Array.isArray(node)) {
      if (node.length === 0) return;
      if (Object.keys(node[0] as object).length === 0 && typeof node[0] === "object") {
        found.push({ file, path: `${path}/0` });
      }
      node.forEach((child, index) => anyNodes(child, `${path}/${index}`, file, found));
      return;
    }
    const record = node as Record<string, unknown>;
    if (Object.keys(record).length === 0) {
      found.push({ file, path });
      return;
    }
    for (const [key, value] of Object.entries(record)) {
      // `x-sentropic` is the 2020-12 annotation block (§5.2): its `example`
      // is a PAYLOAD (data values like `dataLabels: true`), its `parity` a
      // provenance record — neither is schema surface, and a `true` or `{}`
      // in a payload is not an implicit `any` the generator emitted.
      if (key === "x-sentropic") continue;
      anyNodes(value, `${path}/${key}`, file, found);
    }
  }

  it("the only any-nodes are the declared replacements, and each declared replacement explains them", () => {
    const found: { file: string; path: string }[] = [];
    // `functions` is the A2UI MAP of function schemas, not itself a schema
    // node: §5.2 requires the empty map `{}` in a basic catalogue, and an
    // empty map is not an implicit `any` — the walk skips it as a container.
    const catalogDocument = { ...(catalog as unknown as Record<string, unknown>) };
    delete catalogDocument.functions;
    anyNodes(catalogDocument, "", "catalog.json", found);
    for (const contract of contracts) {
      anyNodes(readJson(`schemas/${contract.component}.v1.json`), "", `schemas/${contract.component}.v1.json`, found);
    }

    // The inventory: contract modules that declare a replacement which the
    // generator emits as an accept-anything node. BpmnCanvas's structural
    // envelope keeps unknown F1 extension fields; its declared replacement
    // says so, and it is the ONLY allowed occurrence, in the two copies of
    // the entry (catalogue + standalone).
    const expected = [
      { file: "catalog.json", path: "/components/BpmnCanvas/allOf/2/properties/document/additionalProperties" },
      { file: "schemas/BpmnCanvas.v1.json", path: "/$defs/component/allOf/2/properties/document/additionalProperties" },
    ];
    expect(found.sort((a, b) => a.file.localeCompare(b.file) || a.path.localeCompare(b.path))).toEqual(
      expected.sort((a, b) => a.file.localeCompare(b.file) || a.path.localeCompare(b.path)),
    );

    const bpmn = contracts.find((contract) => contract.component === "BpmnCanvas");
    expect(bpmn?.replacedTypes.map((entry) => entry.prop)).toEqual(["document"]);
    expect(bpmn?.replacedTypes[0]?.replacement).toContain("additionalProperties: {}");
  });

  it("the DecisionDossier document is the pinned focus schema, never an any", () => {
    const defs = catalog.$defs as Record<string, unknown>;
    const dossier = defs["DecisionDossierDocument"] as Record<string, unknown>;
    // The embedded copy is scoped to its host document: its root $id is
    // dropped (the SDK's zod converter resolves #/ refs against the host
    // root) and its internal refs are rewritten to the def's own path.
    expect(dossier.$id, "the embedded def must not carry the source $id").toBeUndefined();
    const refs: string[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node !== null && typeof node === "object") {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          if (key === "$ref" && typeof value === "string") refs.push(value);
          walk(value);
        }
      }
    };
    walk(dossier);
    expect(refs.length, "the focus v1 schema is expected to carry internal refs").toBeGreaterThan(0);
    expect(refs.filter((ref) => !ref.startsWith("#/$defs/DecisionDossierDocument/$defs/"))).toEqual([]);
    expect(refs).toContain("#/$defs/DecisionDossierDocument/$defs/provenance");
    const dd = catalog.components.DecisionDossier as Record<string, unknown>;
    const local = (dd.allOf as Record<string, unknown>[])[2] as { properties: Record<string, unknown> };
    expect(local.properties.document).toEqual({ $ref: "#/$defs/DecisionDossierDocument" });
    // The urn identity and the sha256 pin are recorded in x-sentropic.semantic
    // and verified by the generator against the installed package file.
    const xSentropic = (dd["x-sentropic"] as { semantic?: { schemaId?: string } }).semantic;
    expect(xSentropic?.schemaId).toBe("urn:sentropic:focus:DecisionDossierDocument:1.0.0");
    const pinned = contracts.find((contract) => contract.component === "DecisionDossier");
    expect(pinned?.semantic?.sha256).toBe("725bc07e7c6b6ad51a1f720cc9fb02649d8f31bc54e71c61c350fd20058c8852");
  });
});

describe("AC-L1: each component's example validates, a mutated example fails with the expected path", () => {
  it("every example validates as a full envelope (structure + semantics)", () => {
    for (const contract of contracts) {
      const diagnostics = validate(contract.example);
      expect(diagnostics, `${contract.component}: ${JSON.stringify(diagnostics)}`).toEqual([]);
    }
  });

  it("BarChart: a mutated example fails with /root/data/1/value", () => {
    const example = JSON.parse(JSON.stringify(contracts[0]!.example)) as {
      data: { label: string; value: number | string }[];
    };
    example.data[1]!.value = "eighteen";
    const diagnostics = validate(example);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0]!.code).toBe("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/data/1/value")).toBe(true);
  });

  it("BpmnCanvas: dropping $type fails with /root/document/$type", () => {
    const example = JSON.parse(JSON.stringify(contracts[1]!.example)) as { document: Record<string, unknown> };
    delete example.document.$type;
    const diagnostics = validate(example);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0]!.code).toBe("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/document/$type")).toBe(true);
  });

  it("DecisionDossier: dropping document.title fails with /root/document/title", () => {
    const example = JSON.parse(JSON.stringify(contracts[2]!.example)) as { document: Record<string, unknown> };
    delete example.document.title;
    const diagnostics = validate(example);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0]!.code).toBe("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/document/title")).toBe(true);
  });

  it("DecisionDossier: the example also passes the REAL pinned focus validator", () => {
    const result = realFocusValidate(contracts[2]!.example.document);
    expect(result.ok).toBe(true);
    // And through an explicitly injected focus port, the envelope stays clean.
    const diagnostics = validate(contracts[2]!.example, { focus: createFocusPort(realFocusValidate) });
    expect(diagnostics).toEqual([]);
  });
});
