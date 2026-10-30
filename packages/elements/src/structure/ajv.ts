/**
 * The default structure seam (§4.3): ajv 8 (dist/2020) validating the
 * envelope and each catalogue entry against JSON Schema 2020-12.
 *
 * This module is the Node/browser bridge OUTSIDE the pure half
 * (src/{contracts,generated,ports,validate} import nothing but relative
 * modules — that is pinned by tests/purity.test.ts): the validator core
 * receives the compiled schemas through the StructureValidator interface,
 * and the barrel (src/validate/index.ts) injects this implementation as the
 * default. A host can substitute its own through the `structure` option.
 *
 * Registration set (all under their `$id`s, so every reference resolves
 * without network or file access):
 * - the vendored A2UI common types under the v0.9.1 URI the entries
 *   reference `ComponentCommon` by;
 * - the vendored A2UI basic-catalogue schema under its sibling
 *   `catalog.json` URI — common-types' reachable graph ends at its
 *   `anyFunction` definition;
 * - clones of both under their original v0_9 URIs, because the SDK's
 *   catalogue schema references common-types by ABSOLUTE v0_9 URI;
 * - the catalogue itself, so each entry compiles through
 *   `<catalogId>#/components/<Name>`.
 */

import Ajv2020 from "ajv/dist/2020";

import { CATALOG_ID } from "../contracts/index.js";
import { a2uiSdkCatalogSchema } from "../generated/a2ui-common-types.js";
import type { CatalogDocument } from "../validate/envelope.js";
import type { StructureIssue, StructureValidator } from "../validate/structure.js";

/** The SDK's own absolute references (kept working through the clones). */
const A2UI_V0_9_COMMON_TYPES_ID = "https://a2ui.org/specification/v0_9/common_types.json";
const A2UI_V0_9_CATALOG_ID = "https://a2ui.org/specification/v0_9/catalog.json";

type AjvInstance = InstanceType<typeof Ajv2020>;
type CompiledSchema = ReturnType<AjvInstance["compile"]>;

interface AjvError {
  readonly instancePath: string;
  readonly keyword: string;
  readonly message?: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

export interface AjvStructureOptions {
  readonly catalog: CatalogDocument;
  readonly envelopeSchema: Record<string, unknown>;
  /** The vendored A2UI common types (src/generated). */
  readonly commonTypes: Record<string, unknown>;
}

/** Deep clone with a `$id` override (the v0_9 clones). */
function withId(schema: Record<string, unknown>, id: string): Record<string, unknown> {
  return { ...(JSON.parse(JSON.stringify(schema)) as Record<string, unknown>), $id: id };
}

/** ajv errors become StructureIssues; the suffix params become token hints. */
function toIssues(compiled: CompiledSchema): readonly StructureIssue[] {
  const issues: StructureIssue[] = [];
  for (const error of (compiled.errors ?? []) as readonly AjvError[]) {
    const params = error.params ?? {};
    issues.push({
      pointer: error.instancePath,
      message: error.message ?? "the value does not satisfy the schema",
      keyword: error.keyword,
      ...(typeof params.missingProperty === "string" ? { missingProperty: params.missingProperty } : {}),
      ...(typeof params.additionalProperty === "string" ? { additionalProperty: params.additionalProperty } : {}),
      ...(typeof params.unevaluatedProperty === "string" ? { additionalProperty: params.unevaluatedProperty } : {}),
    });
  }
  return issues;
}

/**
 * Builds the 2020-12 structure validator for one catalogue. The options are
 * strict-mode-agnostic on purpose: the A2UI documents carry vendor keywords
 * (`components`, `functions`, `catalogId`, `x-sentropic`) outside ajv's known
 * set, and their freshness is guarded by the generator's `--check`, so
 * `strict: false` trades nothing away here. The vendored SDK schema uses
 * `format: "uri"` (theme `iconUrl`); ajv ships no formats, so the name is
 * declared known-and-always-valid instead of warned-about on every compile.
 */
export function createAjvStructure(options: AjvStructureOptions): StructureValidator {
  const catalogId = options.catalog.$id;
  if (typeof catalogId !== "string" || catalogId.length === 0) {
    throw new Error("the catalogue document must carry its $id (§5.2: $id = catalogId)");
  }
  if (catalogId !== CATALOG_ID && catalogId !== options.catalog.catalogId) {
    // The committed catalogue satisfies $id === catalogId; a hand-built one
    // may differ only if it is coherent (its entries' refs resolve through
    // this base), which is what the guard below enforces.
    if (typeof options.catalog.catalogId !== "string" || options.catalog.catalogId !== catalogId) {
      throw new Error("the catalogue document's $id and catalogId disagree (§5.2)");
    }
  }

  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { uri: true } });
  ajv.addSchema(options.commonTypes);
  ajv.addSchema(a2uiSdkCatalogSchema);
  ajv.addSchema(withId(options.commonTypes, A2UI_V0_9_COMMON_TYPES_ID));
  ajv.addSchema(withId(a2uiSdkCatalogSchema, A2UI_V0_9_CATALOG_ID));
  ajv.addSchema(options.catalog);

  const envelopeValidate = ajv.compile(options.envelopeSchema);
  const entries = new Map<string, CompiledSchema>();

  /** Compiles (and caches) one entry; undefined when it cannot compile. */
  function entryOf(component: string): { compiled: CompiledSchema } | { error: string } {
    const cached = entries.get(component);
    if (cached !== undefined) return { compiled: cached };
    try {
      const compiled = ajv.compile({ $ref: `${catalogId}#/components/${component}` });
      entries.set(component, compiled);
      return { compiled };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return {
    validateEnvelope(value: unknown): readonly StructureIssue[] {
      return envelopeValidate(value) ? [] : toIssues(envelopeValidate);
    },

    validateComponent(component: string, root: unknown): readonly StructureIssue[] {
      const entry = entryOf(component);
      if ("error" in entry) {
        // Not a data pointer: it names the entry that failed to compile.
        return [
          {
            pointer: "/component",
            message: `the catalogued schema for ${component} could not be compiled: ${entry.error}`,
            keyword: "$compile",
          },
        ];
      }
      return entry.compiled(root) ? [] : toIssues(entry.compiled);
    },
  };
}
