/**
 * The catalogue emitter (§5.1, §5.2): generates every committed artifact in
 * memory from the contract modules.
 *
 * Pipeline per component: ts-json-schema-generator turns the contract's
 * props interface into an inlined fragment (functions "fail" — no function
 * type may slip through, §4.1); the fragment is reduced to the A2UI basic
 * catalogue entry form (`allOf` the two references, `unevaluatedProperties:
 * false`, the local object with the `component` const); the parity guard
 * compares the result against React, Vue and Angular; the `x-sentropic`
 * block is assembled. The catalogue, the envelope schema and the standalone
 * schemas are then assembled and canonically ordered (§5.1), so a
 * regeneration without a type change produces no diff.
 *
 * The A2UI v0.9.1 common-types document (and the SDK catalogue schema its
 * `anyFunction` references live in) are vendored as a generated TypeScript
 * module (src/generated) — the installed SDK ships no v0_9_1 schema set, and
 * the validator needs the `ComponentCommon` graph registered under the v0.9.1
 * URI without reading files.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createGenerator, type Config } from "ts-json-schema-generator";

import {
  A2UI_COMMON_TYPES_ID,
  CATALOG_ID,
  ENVELOPE_ID,
  contracts,
  standaloneId,
  type ContractModule,
} from "../contracts/index.js";
import { canonicalize, stableStringify, type Json } from "./canonical.js";
import { runParityGuard, type ParityRow } from "./parity.js";

const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";
const COMPONENT_COMMON_REF = `${A2UI_COMMON_TYPES_ID}#/$defs/ComponentCommon`;

const CATALOG_TITLE = "Sentropic design system elements catalogue";
const CATALOG_DESCRIPTION =
  "A2UI v0.9.1 basic catalogue of the Sentropic design system elements (JSON render standard, " +
  "spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md §5.2). Each component carries its x-sentropic contract version, " +
  "element name, engine, events, fallback and standalone schema id; semantic documents are validated by their " +
  "owning runtimes (§4.3).";

const ENVELOPE_TITLE = "Sentropic render envelope";
const ENVELOPE_DESCRIPTION =
  "The render envelope of the JSON render standard (§4.2): one A2UI v0.9.1 component object under `root`, " +
  "with the targeted component's contract version and an optional mode. The root interior is validated by the " +
  "targeted component's catalogue entry, not by this schema.";

const CATALOG_COMPONENT_COMMON_DESCRIPTION =
  "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' " +
  "property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.";

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** ts-json-schema-generator on one contract module (functions "fail": §4.1 enforced mechanically). */
export function generateFragment(packageDir: string, contract: ContractModule): Json {
  const config: Config = {
    path: join(packageDir, "src", "contracts", `${kebab(contract.component)}.ts`),
    type: contract.propsTypeName,
    tsconfig: join(packageDir, "tsconfig.json"),
    expose: "none",
    topRef: false,
    jsDoc: "extended",
    skipTypeCheck: false,
    functions: "fail",
  };
  return createGenerator(config).createSchema(contract.propsTypeName) as unknown as Json;
}

/** Marker property key for embedded owner schemas (see DecisionDossierDocumentRef). */
const EMBEDDED_MARKER = "$sentropic.embedded";

interface EmbeddedDef {
  readonly name: string;
  readonly schema: Json;
}

/**
 * Embeds an owner schema under `$defs.<name>` of a host document.
 *
 * The sha256-verified FILE is the pinned source; the EMBEDDED COPY is a
 * documented transform of it, because both consumers of the catalogue
 * resolve a `#/...` fragment against the HOST document, not against the
 * embedded schema's own base:
 * - the A2UI SDK's zod converter resolves every local ref against the entry's
 *   root document (measured: `Unresolvable schema reference: '#/$defs/...'`,
 *   and the affected entry is rebuilt from the SDK's model, losing
 *   `x-sentropic` in `toJson`);
 * - ajv would re-base the refs on the embedded `$id`, which would break the
 *   rewritten pointers.
 *
 * So every internal `#/$defs/X` becomes `#/$defs/<name>/$defs/X` (valid in the
 * catalogue AND in the standalone schema, which both carry the def at the
 * same pointer), and the source `$id` is dropped — the schema identity stays
 * recorded in the entry's `x-sentropic.semantic` block (schemaId + sha256).
 */
function embedOwnerSchema(name: string, schema: Json): EmbeddedDef {
  const prefix = `#/$defs/${name}/$defs/`;
  const rewrite = (node: Json): Json => {
    if (Array.isArray(node)) return node.map((child) => rewrite(child));
    if (node !== null && typeof node === "object") {
      const copy: { [key: string]: Json } = {};
      for (const [key, value] of Object.entries(node)) {
        if (key === "$ref" && typeof value === "string" && value.startsWith("#/$defs/")) {
          copy[key] = `${prefix}${value.slice("#/$defs/".length)}`;
          continue;
        }
        copy[key] = rewrite(value as Json);
      }
      return copy;
    }
    return node;
  };
  const rewritten = rewrite(schema);
  // Only the ROOT $id is dropped: it names the source asset (kept in
  // x-sentropic.semantic.schemaId); nested $ids, if any, stay untouched.
  if (rewritten !== null && typeof rewritten === "object" && !Array.isArray(rewritten) && "$id" in rewritten) {
    const copy = { ...(rewritten as { [key: string]: Json }) };
    delete copy.$id;
    return { name, schema: copy };
  }
  return { name, schema: rewritten };
}

/** The pinned focus v1 schema, sha256-verified against the contract's pin. */
function loadEmbeddedDossierSchema(repoRoot: string, contract: ContractModule): EmbeddedDef {
  if (contract.semantic?.sha256 === undefined) {
    throw new Error(`${contract.component}: no semantic sha256 pin to verify the embedded schema against`);
  }
  const path = join(repoRoot, "node_modules", "@sentropic", "focus", "schemas", "decision-dossier-document.v1.schema.json");
  const bytes = readFileSync(path);
  const actual = sha256(bytes);
  if (actual !== contract.semantic.sha256) {
    throw new Error(
      `${contract.component}: the installed focus schema ${path} has sha256 ${actual}, ` +
        `but the contract pins ${contract.semantic.sha256} — the pin or the dependency must be updated deliberately.`,
    );
  }
  return embedOwnerSchema("DecisionDossierDocument", JSON.parse(bytes.toString("utf8")) as Json);
}

interface ContractFragment {
  readonly contract: ContractModule;
  /** The local object's `properties` (component const + props). */
  readonly properties: Record<string, Json>;
  /** The local object's `required` (component + required props). */
  readonly required: readonly string[];
  readonly parity: Record<string, ParityRow>;
  readonly embedded?: EmbeddedDef;
}

/** Reduce one fragment to the local object of the basic-catalogue entry form. */
function reduceFragment(contract: ContractModule, fragment: Json, embedded: EmbeddedDef | undefined, repoRoot: string): ContractFragment {
  if (fragment === null || typeof fragment !== "object" || Array.isArray(fragment)) {
    throw new Error(`${contract.component}: the generated fragment is not an object schema`);
  }
  const record = fragment as { [key: string]: Json };
  const fragmentProperties = record.properties;
  if (fragmentProperties === null || typeof fragmentProperties !== "object" || Array.isArray(fragmentProperties)) {
    throw new Error(`${contract.component}: the generated fragment has no properties`);
  }
  const properties: Record<string, Json> = {
    component: { const: contract.component },
    ...(fragmentProperties as { [key: string]: Json }),
  };
  const requiredProps = Array.isArray(record.required)
    ? (record.required as Json[]).filter((name): name is string => typeof name === "string")
    : [];

  // The DecisionDossier marker property is replaced by the embedded owner schema ref.
  if (embedded !== undefined) {
    const document = properties.document;
    const marker =
      document !== null && typeof document === "object" && !Array.isArray(document)
        ? ((document as { properties?: Json }).properties as Record<string, Json> | undefined)?.[EMBEDDED_MARKER]
        : undefined;
    if (marker === undefined) {
      throw new Error(`${contract.component}: expected the ${EMBEDDED_MARKER} marker on the document property`);
    }
    properties.document = { $ref: `#/$defs/${embedded.name}` };
  }

  const parity = runParityGuard(contract, fragmentProperties as Record<string, Json>, repoRoot);

  return {
    contract,
    properties,
    required: ["component", ...requiredProps],
    parity,
    ...(embedded !== undefined ? { embedded } : {}),
  };
}

/** The basic-catalogue entry (§5.2) with its x-sentropic block. */
function buildEntry(fragment: ContractFragment): Json {
  const { contract } = fragment;
  const xSentropic: Record<string, Json> = {
    contract: contract.metadata.contract,
    element: contract.metadata.element,
    engine: contract.metadata.engine,
    events: [...contract.metadata.events],
    fallback: contract.metadata.fallback,
    parity: fragment.parity as unknown as Json,
    schema: standaloneId(contract.component),
    example: contract.example as unknown as Json,
  };
  if (contract.status !== undefined) xSentropic.status = contract.status;
  if (contract.semantic !== undefined) {
    xSentropic.semantic = {
      source: contract.semantic.source,
      runtimePackage: contract.semantic.runtimePackage,
      ...(contract.semantic.schemaSubpath !== undefined ? { schemaSubpath: contract.semantic.schemaSubpath } : {}),
      ...(contract.semantic.schemaId !== undefined ? { schemaId: contract.semantic.schemaId } : {}),
      ...(contract.semantic.sha256 !== undefined ? { sha256: contract.semantic.sha256 } : {}),
    } as Json;
  }
  return {
    type: "object",
    allOf: [
      { $ref: COMPONENT_COMMON_REF },
      { $ref: "#/$defs/CatalogComponentCommon" },
      { type: "object", properties: fragment.properties, required: [...fragment.required] },
    ],
    unevaluatedProperties: false,
    "x-sentropic": xSentropic,
  };
}

export interface VendoredA2uiSchemas {
  /** The vendored common-types document, `$id` rewritten to the v0.9.1 URI. */
  readonly commonTypes: Json;
  /**
   * The SDK's basic-catalogue schema, `$id` rewritten to the sibling URI the
   * common-types' `catalog.json#/$defs/anyFunction` reference expects.
   */
  readonly sdkCatalog: Json;
  readonly moduleText: string;
}

/**
 * Vendor the SDK's v0_9 common-types and basic-catalogue schemas as the
 * generated module under src/generated (§5.1: the generator is the single
 * source of the committed artifacts).
 *
 * Both documents are needed: the catalogue's entries reference
 * `ComponentCommon`, whose reachable graph (accessibility, dynamic values,
 * function calls) ends at `anyFunction` — which lives in the SDK's catalogue
 * schema, not in common-types. The installed SDK ships no v0_9_1 schema set
 * (only v0_8, v0_9 and v1_0 — measured), so both are vendored with their
 * `$id`s rewritten to the v0.9.1 specification URIs: common-types to
 * `A2UI_COMMON_TYPES_ID`, and the basic-catalogue schema to its sibling name
 * `catalog.json`, the exact relative name common-types references it by.
 */
function vendorA2uiSchemas(repoRoot: string): VendoredA2uiSchemas {
  const sdkPackage = JSON.parse(
    readFileSync(join(repoRoot, "node_modules", "@a2ui", "web_core", "package.json"), "utf8"),
  ) as { version: string };
  const sdkSchemasDir = join(repoRoot, "node_modules", "@a2ui", "web_core", "src", "v0_9", "schemas");
  const commonTypesBytes = readFileSync(join(sdkSchemasDir, "common_types.json"));
  const sdkCatalogBytes = readFileSync(join(sdkSchemasDir, "catalogs", "basic", "catalog.json"));

  const commonTypesOriginal = JSON.parse(commonTypesBytes.toString("utf8")) as { [key: string]: Json };
  const commonTypesOriginalId = commonTypesOriginal.$id;
  if (typeof commonTypesOriginalId !== "string") {
    throw new Error(`common_types.json from @a2ui/web_core has no $id to record`);
  }
  const commonTypesSha = sha256(commonTypesBytes);
  const commonTypes = canonicalize({ ...commonTypesOriginal, $id: A2UI_COMMON_TYPES_ID });

  const sdkCatalogOriginal = JSON.parse(sdkCatalogBytes.toString("utf8")) as { [key: string]: Json };
  const sdkCatalogOriginalId = sdkCatalogOriginal.$id;
  if (typeof sdkCatalogOriginalId !== "string") {
    throw new Error(`catalogs/basic/catalog.json from @a2ui/web_core has no $id to record`);
  }
  const sdkCatalogSha = sha256(sdkCatalogBytes);
  const sdkCatalogId = `${A2UI_COMMON_TYPES_ID.slice(0, A2UI_COMMON_TYPES_ID.lastIndexOf("/"))}/catalog.json`;
  const sdkCatalog = canonicalize({ ...sdkCatalogOriginal, $id: sdkCatalogId });

  const header = [
    "/**",
    " * GENERATED FILE — do not edit. Regenerate with `npm run catalog:generate` in",
    " * packages/elements (the generator is the single source, §5.1).",
    " *",
    " * Two A2UI schema documents, vendored from @a2ui/web_core@" + sdkPackage.version,
    " * (src/v0_9/schemas — the installed SDK ships no v0_9_1 set; only v0_8,",
    " * v0_9 and v1_0 exist, measured):",
    " *",
    " * 1. common_types.json (original $id " + commonTypesOriginalId + ",",
    " *    sha256 " + commonTypesSha + "), $id rewritten to",
    " *    " + A2UI_COMMON_TYPES_ID + " — the URI the catalogue's entries",
    " *    reference ComponentCommon by (§5.2).",
    " * 2. catalogs/basic/catalog.json (original $id " + sdkCatalogOriginalId + ",",
    " *    sha256 " + sdkCatalogSha + "), $id rewritten to",
    " *    " + sdkCatalogId + " — the sibling name common_types",
    " *    references anyFunction by; compiling an entry's ComponentCommon",
    " *    graph needs it (accessibility -> dynamic values -> function calls).",
    " *",
    " * The validator registers both under their rewritten $ids (plus v0_9-URI",
    " * clones for the SDK's own absolute v0_9 references) so every entry",
    " * reference resolves without network or file access.",
    " */",
    "export const a2uiCommonTypes: Record<string, unknown> = ",
  ].join("\n");
  const moduleText =
    `${header}${stableStringify(commonTypes).trimEnd()};\n\n` +
    `export const a2uiSdkCatalogSchema: Record<string, unknown> = ${stableStringify(sdkCatalog).trimEnd()};\n`;
  return { commonTypes, sdkCatalog, moduleText };
}

export interface Artifacts {
  /** Committed file path (relative to the package) → canonical text. */
  readonly files: readonly { readonly path: string; readonly text: string }[];
}

/** Generate every artifact in memory (the `--check` mode diffs these against the committed files). */
export function buildArtifacts(repoRoot: string, packageDir: string): Artifacts {
  const dossierContract = contracts.find((contract) => contract.component === "DecisionDossier");
  if (dossierContract === undefined) throw new Error("the DecisionDossier contract module is missing from the registry");
  const embedded = loadEmbeddedDossierSchema(repoRoot, dossierContract);

  const fragments = contracts.map((contract) =>
    reduceFragment(contract, generateFragment(packageDir, contract), contract === dossierContract ? embedded : undefined, repoRoot),
  );

  const components: Record<string, Json> = {};
  for (const fragment of fragments) components[fragment.contract.component] = buildEntry(fragment);

  const defs: Record<string, Json> = {
    CatalogComponentCommon: {
      type: "object",
      properties: { weight: { type: "number", description: CATALOG_COMPONENT_COMMON_DESCRIPTION } },
    },
    anyComponent: { oneOf: contracts.map((contract) => ({ $ref: `#/components/${contract.component}` })) },
    theme: { type: "object", properties: { themeId: { type: "string" } } },
    DecisionDossierDocument: embedded.schema,
  };

  const catalog: Json = {
    $schema: JSON_SCHEMA_2020_12,
    $id: CATALOG_ID,
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    catalogId: CATALOG_ID,
    components,
    functions: {},
    $defs: defs,
  };

  const envelope: Json = {
    $schema: JSON_SCHEMA_2020_12,
    $id: ENVELOPE_ID,
    title: ENVELOPE_TITLE,
    description: ENVELOPE_DESCRIPTION,
    type: "object",
    properties: {
      catalogId: { type: "string" },
      contract: { type: "string", pattern: "^[0-9]+\\.[0-9]+$" },
      mode: { type: "string", enum: ["snapshot", "preview"] },
      root: {
        type: "object",
        required: ["id", "component"],
        properties: { id: { const: "root" }, component: { type: "string" } },
      },
    },
    required: ["contract", "root"],
    unevaluatedProperties: false,
  };

  const files: { path: string; text: string }[] = [
    { path: "catalog.json", text: stableStringify(catalog) },
    { path: "envelope.json", text: stableStringify(envelope) },
  ];

  for (const fragment of fragments) {
    const { contract } = fragment;
    const catalogComponentCommon = defs.CatalogComponentCommon;
    const componentSchema = components[contract.component];
    if (catalogComponentCommon === undefined || componentSchema === undefined) {
      throw new Error(`${contract.component}: cannot assemble its standalone schema (missing shared definitions)`);
    }
    const standaloneDefs: Record<string, Json> = {
      CatalogComponentCommon: catalogComponentCommon,
      component: componentSchema,
    };
    if (fragment.embedded !== undefined) standaloneDefs[fragment.embedded.name] = fragment.embedded.schema;
    const standalone: Json = {
      $schema: JSON_SCHEMA_2020_12,
      $id: standaloneId(contract.component),
      title: `${contract.component} component schema`,
      description:
        `The envelope schema specialised to one component (§5.2): it validates the envelope's root component ` +
        `object for ${contract.component}, and its component part is equivalent (after canonical sorting) to the ` +
        `catalogue entry. Requires the A2UI common types under ${A2UI_COMMON_TYPES_ID}.`,
      $defs: standaloneDefs,
      $ref: "#/$defs/component",
    };
    files.push({ path: `schemas/${contract.component}.v1.json`, text: stableStringify(standalone) });
  }

  const vendored = vendorA2uiSchemas(repoRoot);
  files.push({ path: "src/generated/a2ui-common-types.ts", text: vendored.moduleText });

  return { files };
}
