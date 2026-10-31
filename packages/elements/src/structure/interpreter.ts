/**
 * The eval-free structure seam (§4.3, §6.4): a JSON Schema 2020-12
 * interpreter over the same registered documents as the ajv bridge
 * (`src/structure/ajv.ts`), for hosts whose CSP forbids `eval` and the
 * `Function` constructor — the browser core chunk (§6.2, §6.4).
 *
 * ajv materialises every compiled validator through `new Function`, so the
 * DEFAULT seam cannot run under the pilot and strict CSP rows of §6.4: the
 * compiled meta-schema itself trips the policy at validator creation, before
 * any envelope is seen. This module validates the SAME documents — the
 * committed catalogue, the envelope schema, the vendored A2UI common types
 * and the built `catalog.json` stub (§5.2) — with a plain recursive
 * interpreter: no code generation, no host-global trick, nothing the CSP can
 * refuse. It implements exactly the keyword surface the committed documents
 * use (measured: `$ref`, `type`, `enum`, `const`, `pattern`, `properties`,
 * `required`, `additionalProperties`, `unevaluatedProperties`, `items`,
 * `minItems`, `maxItems`, `allOf`, `anyOf`, `oneOf`, `not`) and REFUSES
 * CONSTRUCTION when a registered document grows a standard 2020-12 keyword
 * outside that set, so a catalogue change cannot silently weaken the
 * browser validation. Non-standard keywords are annotations and are
 * ignored, exactly as ajv with `strict: false` treats them.
 *
 * Equivalence with the ajv bridge is pinned by `tests/structure-interpreter
 * .test.ts`: the two seams must accept and refuse the same corpus with the
 * same (pointer, keyword, param) issue sets.
 */

import { a2uiSdkCatalogSchema } from "../generated/a2ui-common-types.js";
import type { CatalogDocument } from "../validate/envelope.js";
import type { StructureIssue, StructureValidator } from "../validate/structure.js";

/** A JSON Schema node: `true`, `false` or a plain object. */
type SchemaNode = unknown;

export interface InterpreterStructureOptions {
  readonly catalog: CatalogDocument;
  readonly envelopeSchema: Record<string, unknown>;
  /** The vendored A2UI common types (src/generated). */
  readonly commonTypes: Record<string, unknown>;
}

/** The keywords this interpreter implements (the committed documents' surface). */
const IMPLEMENTED_KEYWORDS = new Set([
  "$ref",
  "type",
  "enum",
  "const",
  "pattern",
  "properties",
  "required",
  "additionalProperties",
  "unevaluatedProperties",
  "items",
  "minItems",
  "maxItems",
  "allOf",
  "anyOf",
  "oneOf",
  "not",
]);

/** Keys that never affect validation (identifiers and annotations). */
const ANNOTATION_KEYWORDS = new Set([
  "$schema",
  "$id",
  "$defs",
  "$anchor",
  "$dynamicAnchor",
  "$comment",
  "$vocabulary",
  "title",
  "description",
  "default",
  "examples",
  "example",
  "note",
  "deprecated",
  "readOnly",
  "writeOnly",
]);

/** Standard 2020-12 VALIDATION keywords this interpreter does not implement. */
const UNSUPPORTED_STANDARD_KEYWORDS = new Set([
  "multipleOf",
  "maximum",
  "exclusiveMaximum",
  "minimum",
  "exclusiveMinimum",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "uniqueItems",
  "contains",
  "maxContains",
  "minContains",
  "patternProperties",
  "dependentRequired",
  "dependentSchemas",
  "propertyNames",
  "prefixItems",
  "unevaluatedItems",
  "if",
  "then",
  "else",
  "definitions",
  "$dynamicRef",
  "$recursiveRef",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** One RFC 6901 token, escaped (~ before /). */
function escapeToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

/** Deep equality over JSON values (enum and const payloads). */
function jsonEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (!isPlainObject(left) && !Array.isArray(left)) return false;
  if (Array.isArray(left)) {
    if (!Array.isArray(right) || left.length !== right.length) return false;
    return left.every((item, index) => jsonEqual(item, right[index]));
  }
  if (!isPlainObject(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key]));
}

/** Whether `data` matches one declared `type` name (2020-12 semantics). */
function typeMatches(declared: string, data: unknown): boolean {
  switch (declared) {
    case "object":
      return isPlainObject(data);
    case "array":
      return Array.isArray(data);
    case "string":
      return typeof data === "string";
    case "number":
      return typeof data === "number";
    case "integer":
      return typeof data === "number" && Number.isInteger(data);
    case "boolean":
      return typeof data === "boolean";
    case "null":
      return data === null;
    default:
      return true;
  }
}

/**
 * The registered documents, each under its `$id` — the same registration
 * set as the ajv bridge: common types, the built `catalog.json` stub
 * (whose single `anyFunction` definition is the empty function set,
 * `{ "not": {} }`), the catalogue, and the envelope schema.
 */
class DocumentRegistry {
  readonly #documents = new Map<string, unknown>();

  register(schema: unknown, label: string): string {
    if (!isPlainObject(schema) || typeof schema.$id !== "string" || schema.$id.length === 0) {
      throw new Error(`the ${label} must carry its $id so every $ref resolves without network access`);
    }
    this.#documents.set(schema.$id, schema);
    return schema.$id;
  }

  /** Resolves one `$ref` against the base document it appears in. */
  resolve(ref: string, baseId: string): { readonly schema: SchemaNode; readonly baseId: string } {
    const hashIndex = ref.indexOf("#");
    const documentPart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    const pointerPart = hashIndex === -1 ? "" : ref.slice(hashIndex + 1);
    let documentId = baseId;
    if (documentPart.length > 0) {
      documentId = /^[a-z][a-z0-9+.-]*:/i.test(documentPart)
        ? documentPart
        : joinSibling(baseId, documentPart);
    }
    const document = this.#documents.get(documentId);
    if (document === undefined) {
      throw new Error(`the $ref "${ref}" does not name a registered document (from ${baseId})`);
    }
    const schema = pointerPart.length === 0 ? document : pointerLookup(document, pointerPart, ref);
    return { schema, baseId: documentId };
  }
}

/** RFC 3986 same-directory join: the sibling of the base document's last segment. */
function joinSibling(baseId: string, relative: string): string {
  const slash = baseId.lastIndexOf("/");
  if (slash === -1) return relative;
  return `${baseId.slice(0, slash + 1)}${relative}`;
}

/** Walks one unescaped JSON pointer into a registered document. */
function pointerLookup(document: unknown, pointer: string, ref: string): unknown {
  if (!pointer.startsWith("/")) {
    throw new Error(`the $ref "${ref}" must use a JSON pointer (URI fragments are not used by the registered documents)`);
  }
  let node: unknown = document;
  for (const rawToken of pointer.slice(1).split("/")) {
    const token = rawToken.replace(/~1/g, "/").replace(/~0/g, "~");
    if (Array.isArray(node)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= node.length) {
        throw new Error(`the $ref "${ref}" does not resolve: no array item ${token}`);
      }
      node = node[index];
      continue;
    }
    if (!isPlainObject(node) || !Object.hasOwn(node, token)) {
      throw new Error(`the $ref "${ref}" does not resolve: no property "${token}"`);
    }
    node = node[token];
  }
  return node;
}

/**
 * The drift gate: walks one registered document and throws when a schema
 * node carries a standard 2020-12 validation keyword outside the
 * implemented surface, or `items` in its legacy tuple form. Unknown
 * keywords stay annotations (JSON Schema semantics; ajv `strict: false`).
 */
function auditDocument(schema: unknown, label: string): void {
  if (typeof schema === "boolean") return;
  if (!isPlainObject(schema)) {
    throw new Error(`the ${label} contains a schema that is neither a boolean nor an object`);
  }
  for (const key of Object.keys(schema)) {
    if (key.startsWith("x-") || ANNOTATION_KEYWORDS.has(key) || IMPLEMENTED_KEYWORDS.has(key)) continue;
    if (UNSUPPORTED_STANDARD_KEYWORDS.has(key)) {
      throw new Error(
        `the ${label} uses "${key}", outside the browser structure interpreter's keyword set (§6.4): extend src/structure/interpreter.ts and its oracle test`,
      );
    }
  }
  const items = schema.items;
  if (Array.isArray(items)) {
    throw new Error(`the ${label} uses "items" in its legacy tuple form, which the browser structure interpreter does not implement`);
  }
  const subschemas: Array<[string, unknown]> = [];
  for (const container of ["$defs", "properties", "components"]) {
    const map = schema[container];
    if (isPlainObject(map)) {
      for (const value of Object.values(map)) subschemas.push([`${container} entry`, value]);
    }
  }
  if (typeof items === "object" || typeof items === "boolean") subschemas.push(["items", items]);
  for (const container of ["additionalProperties", "unevaluatedProperties", "not"]) {
    const value = schema[container];
    if (isPlainObject(value) || typeof value === "boolean") subschemas.push([container, value]);
  }
  for (const container of ["allOf", "anyOf", "oneOf"]) {
    const members = schema[container];
    if (Array.isArray(members)) {
      for (const member of members) subschemas.push([container, member]);
    }
  }
  for (const [where, subschema] of subschemas) auditDocument(subschema, `${label} (${where})`);
}

/** One validation result: the issues, and the names this node evaluated. */
interface NodeResult {
  readonly ok: boolean;
  readonly evaluated: ReadonlySet<string>;
}

const EMPTY_EVALUATED: ReadonlySet<string> = new Set<string>();

/** Validates `data` against one schema node, collecting issues ajv-style. */
function validateNode(
  schema: SchemaNode,
  data: unknown,
  pointer: string,
  baseId: string,
  registry: DocumentRegistry,
  issues: StructureIssue[],
): NodeResult {
  if (schema === true) return { ok: true, evaluated: EMPTY_EVALUATED };
  if (schema === false || schema === undefined || schema === null) {
    issues.push({ pointer, message: "the schema is false here", keyword: "schema" });
    return { ok: false, evaluated: EMPTY_EVALUATED };
  }
  if (!isPlainObject(schema)) {
    issues.push({ pointer, message: "the schema node is neither a boolean nor an object", keyword: "schema" });
    return { ok: false, evaluated: EMPTY_EVALUATED };
  }

  let ok = true;
  const evaluated = new Set<string>();
  const fail = (issue: StructureIssue): void => {
    ok = false;
    issues.push(issue);
  };

  // $ref is transparent (2020-12): the referenced schema applies, and the
  // keywords beside it apply too (the committed documents only pair $ref
  // with annotations). Its evaluated names merge unconditionally, like
  // allOf — annotations follow application, not the branch's outcome.
  const ref = schema.$ref;
  let activeBaseId = baseId;
  if (typeof ref === "string") {
    const resolved = registry.resolve(ref, baseId);
    const result = validateNode(resolved.schema, data, pointer, resolved.baseId, registry, issues);
    for (const name of result.evaluated) evaluated.add(name);
    if (!result.ok) ok = false;
    activeBaseId = resolved.baseId;
  }

  // type, enum, const, pattern — applicable to any value.
  const declaredType = schema.type;
  if (declaredType !== undefined) {
    const names = Array.isArray(declaredType) ? declaredType : [declaredType];
    const validNames = names.filter((name) => typeof name === "string");
    if (
      names.length > 0 &&
      validNames.length === names.length &&
      !validNames.some((name) => typeMatches(name, data))
    ) {
      fail({
        pointer,
        message: `must be ${validNames.join(",")}`,
        keyword: "type",
      });
    }
  }
  const enumValues = schema.enum;
  if (Array.isArray(enumValues) && !enumValues.some((allowed) => jsonEqual(allowed, data))) {
    fail({ pointer, message: "must be equal to one of the allowed values", keyword: "enum" });
  }
  if (Object.hasOwn(schema, "const") && !jsonEqual(schema.const, data)) {
    fail({ pointer, message: "must be equal to constant", keyword: "const" });
  }
  const pattern = schema.pattern;
  if (typeof pattern === "string" && typeof data === "string" && !new RegExp(pattern).test(data)) {
    fail({ pointer, message: `must match pattern "${pattern}"`, keyword: "pattern" });
  }

  // Object keywords run only for plain objects (ajv's applicability guards).
  if (isPlainObject(data)) {
    const keys = Object.keys(data);

    const required = schema.required;
    if (Array.isArray(required)) {
      for (const name of required) {
        if (typeof name === "string" && !Object.hasOwn(data, name)) {
          fail({
            pointer,
            message: `must have required property '${name}'`,
            keyword: "required",
            missingProperty: name,
          });
        }
      }
    }

    const properties = isPlainObject(schema.properties) ? schema.properties : {};
    for (const [name, subschema] of Object.entries(properties)) {
      if (!Object.hasOwn(data, name)) continue;
      // A present key is evaluated when its subschema APPLIES, whatever the
      // outcome — ajv's convention (probed: a failed subschema never turns
      // its own key into an unevaluatedProperties row).
      evaluated.add(name);
      const result = validateNode(
        subschema,
        data[name],
        `${pointer}/${escapeToken(name)}`,
        activeBaseId,
        registry,
        issues,
      );
      if (!result.ok) ok = false;
    }

    const additional = schema.additionalProperties;
    const declared = new Set(Object.keys(properties));
    if (additional === false) {
      for (const name of keys) {
        if (declared.has(name)) continue;
        fail({
          pointer,
          message: "must NOT have additional properties",
          keyword: "additionalProperties",
          additionalProperty: name,
        });
      }
    } else if (isPlainObject(additional) || additional === true) {
      // `true` allows without evaluating; a schema validates AND evaluates.
      const schemaForm = isPlainObject(additional);
      for (const name of keys) {
        if (declared.has(name)) continue;
        if (!schemaForm) continue;
        evaluated.add(name);
        const result = validateNode(
          additional,
          data[name],
          `${pointer}/${escapeToken(name)}`,
          activeBaseId,
          registry,
          issues,
        );
        if (!result.ok) ok = false;
      }
    }
  }

  // Array keywords run only for arrays.
  if (Array.isArray(data)) {
    const minItems = schema.minItems;
    if (typeof minItems === "number" && data.length < minItems) {
      fail({ pointer, message: `must NOT have fewer than ${minItems} items`, keyword: "minItems" });
    }
    const maxItems = schema.maxItems;
    if (typeof maxItems === "number" && data.length > maxItems) {
      fail({ pointer, message: `must NOT have more than ${maxItems} items`, keyword: "maxItems" });
    }
    const items = schema.items;
    if (items !== undefined && !Array.isArray(items)) {
      data.forEach((item, index) => {
        const result = validateNode(items, item, `${pointer}/${index}`, activeBaseId, registry, issues);
        if (!result.ok) ok = false;
      });
    }
  }

  // In-place applicators — allOf feeds the evaluated set unconditionally
  // (ajv merges every member's annotations, whatever the member's outcome);
  // anyOf and oneOf feed it from their SUCCESSFUL branches only.
  const allOf = schema.allOf;
  if (Array.isArray(allOf)) {
    for (const member of allOf) {
      const result = validateNode(member, data, pointer, activeBaseId, registry, issues);
      for (const name of result.evaluated) evaluated.add(name);
      if (!result.ok) ok = false;
    }
  }
  const anyOf = schema.anyOf;
  if (Array.isArray(anyOf)) {
    let anyOk = false;
    const branchIssues: StructureIssue[][] = [];
    for (const member of anyOf) {
      const branch: StructureIssue[] = [];
      const result = validateNode(member, data, pointer, activeBaseId, registry, branch);
      branchIssues.push(branch);
      if (result.ok) {
        anyOk = true;
        for (const name of result.evaluated) evaluated.add(name);
      }
    }
    if (!anyOk) {
      ok = false;
      for (const branch of branchIssues) issues.push(...branch);
      issues.push({ pointer, message: "must match a schema in anyOf", keyword: "anyOf" });
    }
  }
  const oneOf = schema.oneOf;
  if (Array.isArray(oneOf)) {
    const branchIssues: StructureIssue[][] = [];
    const branchEvaluated: Array<ReadonlySet<string>> = [];
    let passes = 0;
    let passIndex = -1;
    oneOf.forEach((member, index) => {
      const branch: StructureIssue[] = [];
      const result = validateNode(member, data, pointer, activeBaseId, registry, branch);
      branchIssues.push(branch);
      branchEvaluated.push(result.evaluated);
      if (result.ok) {
        passes += 1;
        passIndex = index;
      }
    });
    if (passes === 1 && passIndex >= 0) {
      for (const name of branchEvaluated[passIndex] ?? []) evaluated.add(name);
    } else {
      ok = false;
      for (const branch of branchIssues) issues.push(...branch);
      issues.push({ pointer, message: "must match exactly one schema in oneOf", keyword: "oneOf" });
    }
  }
  const not = schema.not;
  if (not !== undefined) {
    const result = validateNode(not, data, pointer, activeBaseId, registry, issues);
    if (result.ok) {
      issues.push({ pointer, message: "must NOT be valid", keyword: "not" });
      ok = false;
    }
  }

  // unevaluatedProperties sees everything the node (and its successful
  // branches) evaluated — the cross-allOf aggregation the committed
  // component entries rely on for their closed property sets.
  if (isPlainObject(data)) {
    const unevaluated = schema.unevaluatedProperties;
    if (unevaluated !== undefined) {
      const remaining = Object.keys(data).filter((name) => !evaluated.has(name));
      if (unevaluated === false) {
        for (const name of remaining) {
          fail({
            pointer,
            message: "must NOT have unevaluated properties",
            keyword: "unevaluatedProperties",
            additionalProperty: name,
          });
        }
      } else if (isPlainObject(unevaluated) || unevaluated === true) {
        if (isPlainObject(unevaluated)) {
          for (const name of remaining) {
            const result = validateNode(
              unevaluated,
              data[name],
              `${pointer}/${escapeToken(name)}`,
              activeBaseId,
              registry,
              issues,
            );
            if (result.ok) evaluated.add(name);
            else ok = false;
          }
        }
      }
    }
  }

  return { ok, evaluated };
}

/**
 * Builds the eval-free structure validator for one catalogue, over the same
 * documents the ajv bridge registers. Construction audits every document:
 * a catalogue that grows past the implemented keyword surface fails loudly
 * here, in the build and its tests — never as a silent browser weakening.
 */
export function createInterpreterStructure(options: InterpreterStructureOptions): StructureValidator {
  const registry = new DocumentRegistry();
  const catalogId = registry.register(options.catalog, "catalogue document");
  if (typeof options.catalog.catalogId !== "string" || options.catalog.catalogId.length === 0) {
    throw new Error("the catalogue document must carry its catalogId (§5.2: $id = catalogId)");
  }
  const envelopeId = registry.register(options.envelopeSchema, "envelope schema");
  registry.register(options.commonTypes, "A2UI common types");
  registry.register(a2uiSdkCatalogSchema, "built catalog.json stub");
  auditDocument(options.catalog, "catalogue document");
  auditDocument(options.envelopeSchema, "envelope schema");
  auditDocument(options.commonTypes, "A2UI common types");
  auditDocument(a2uiSdkCatalogSchema, "built catalog.json stub");

  return {
    validateEnvelope(value: unknown): readonly StructureIssue[] {
      const issues: StructureIssue[] = [];
      validateNode(options.envelopeSchema, value, "", envelopeId, registry, issues);
      return issues;
    },

    validateComponent(component: string, root: unknown): readonly StructureIssue[] {
      const entry = options.catalog.components[component];
      if (entry === undefined) {
        return [
          {
            pointer: "/component",
            message: `no catalogued component is named ${component}`,
            keyword: "$compile",
          },
        ];
      }
      const issues: StructureIssue[] = [];
      validateNode(entry, root, "", catalogId, registry, issues);
      return issues;
    },
  };
}
