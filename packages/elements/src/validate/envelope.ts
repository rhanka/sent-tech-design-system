/**
 * The envelope validator (§4.3–§4.5): one pure orchestrator that turns an
 * unknown input into a list of §4.5 diagnostics, or an empty list when the
 * envelope renders.
 *
 * The check order is deliberate and total:
 *
 *   1. JSON-serializable, then the 1 MiB UTF-8 budget (§4.3 item 3) — a
 *      payload over the budget is refused whole, before anything parses it;
 *   2. envelope structure (§4.2: `catalogId`, `contract`, `mode`, `root`);
 *   3. the envelope's OPTIONAL `catalogId`, when present, must name THIS
 *      catalogue (absent = the renderer's catalogue, §4.2);
 *   4. `mode`: `preview` is reserved (§10.3) and refuses;
 *   5. `root.component` must be catalogued (`unknown-component`);
 *   6. a placeholder entry refuses (`component-unavailable`, §5.2 status);
 *   7. the §4.4 contract rule: an envelope may be OLDER than the entry
 *      (minors are additive) but never newer, and never another major;
 *   8. the root's structure against the targeted catalogue entry;
 *   9. semantics — ONLY when the structure is clean — through the injected
 *      port of the entry's `lazy:` engine (§4.3 item 2). `core` engines have
 *      no owner runtime and no port.
 *
 * Every step that refuses returns immediately: a refusal is never partially
 * validated, and no diagnostic hides an earlier one.
 */

import type { SemanticFinding, SemanticPort } from "../ports/types.js";
import type { Diagnostic } from "./diagnostics.js";
import { engineLoadFailed } from "./diagnostics.js";
import type { StructureIssue, StructureValidator } from "./structure.js";

/** The §4.3 item 3 budget: 1 MiB of UTF-8 (the limit itself is accepted). */
export const ENVELOPE_LIMIT_BYTES = 1048576;

/**
 * The prop every semantic engine validates. Fixed for L1's two semantic
 * components (DecisionDossier, BpmnCanvas): §5.1 names `document` the
 * semantic payload.
 */
const SEMANTIC_PAYLOAD_PROP = "document";

/** One catalogue entry, read structurally (the committed artifact's shape). */
export interface CatalogComponentEntry {
  readonly [property: string]: unknown;
}

/** The catalogue document the validator is created against (§5.2). */
export interface CatalogDocument {
  /** Every keyword of the committed artifact stays reachable (§5.2). */
  readonly [property: string]: unknown;
  /** §5.2: `$id` = `catalogId`; the envelope must name exactly this value. */
  readonly catalogId: string;
  /** The catalogue's entries, by component name. */
  readonly components: Record<string, CatalogComponentEntry>;
}

/** Escape one RFC 6901 token (`~` first, then `/`). */
function escapePointerToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

/** Appends one property token to an RFC 6901 pointer. */
function appendPointerToken(pointer: string, token: string): string {
  return `${pointer}/${escapePointerToken(token)}`;
}

/**
 * The JSON-form contract (review 1, B1): the envelope IS a JSON value
 * (§4.3) and the property channel (§6.2) feeds plain JS objects that may
 * carry `undefined` values TypeScript callers routinely produce
 * (`width: undefined`). `JSON.stringify` drops such keys, so the raw JS
 * object and its serialized form disagree — and ajv itself is inconsistent
 * on raw JS (`properties` skips an `undefined` value while
 * `additionalProperties`/`unevaluatedProperties` iterate `Object.keys` and
 * fire on it). The single JSON round-trip below defines the canonical form
 * ONCE for both seams: size measurement and both validators judge exactly
 * the bytes the host transmits. Chosen over ajv-mimicking `undefined`
 * skips in the interpreter because the envelope's wire form is the only
 * form both seams, the budget and the host ever share.
 */
export type NormalizedEnvelopeInput =
  | { readonly ok: true; readonly value: unknown; readonly text: string }
  | { readonly ok: false; readonly kind: "not-json-value" | "not-serializable"; readonly message: string };

export function normalizeEnvelopeInput(input: unknown): NormalizedEnvelopeInput {
  let text: string | undefined;
  try {
    const serialized = JSON.stringify(input);
    if (typeof serialized !== "string") {
      return {
        ok: false,
        kind: "not-json-value",
        message: "the envelope is not a JSON value (§4.3)",
      };
    }
    text = serialized;
  } catch (error) {
    return {
      ok: false,
      kind: "not-serializable",
      message: `the envelope is not JSON-serializable (§4.3): ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  return { ok: true, value: JSON.parse(text) as unknown, text };
}

/**
 * UTF-8 byte length without TextEncoder (the pure half stays free of
 * host-global identifiers; surrogates pair to 4 bytes like the encoder's).
 */
export function utf8ByteLength(text: string): number {
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 0x7f) total += 1;
    else if (code <= 0x7ff) total += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      total += 4;
      index += 1;
    } else total += 3;
  }
  return total;
}

/** A "major.minor" contract version (§4.4). */
interface ContractVersion {
  readonly major: number;
  readonly minor: number;
}

function parseContract(value: string): ContractVersion | undefined {
  const match = /^([0-9]+)\.([0-9]+)$/.exec(value);
  if (match === undefined || match === null) return undefined;
  return { major: Number(match[1]), minor: Number(match[2]) };
}

/** Structure issues become §4.5 `schema-violation` diagnostics. */
function structureDiagnostics(issues: readonly StructureIssue[], prefix: string): readonly Diagnostic[] {
  return issues.map((issue) => {
    let path = `${prefix}${issue.pointer}`;
    if (issue.keyword === "required" && issue.missingProperty !== undefined) {
      path = appendPointerToken(path, issue.missingProperty);
    } else if (
      (issue.keyword === "unevaluatedProperties" || issue.keyword === "additionalProperties") &&
      issue.additionalProperty !== undefined
    ) {
      path = appendPointerToken(path, issue.additionalProperty);
    }
    return {
      code: "schema-violation",
      path,
      message: issue.message,
      severity: "error",
      source: "catalog",
      detail: { keyword: issue.keyword },
    };
  });
}

/** Options of the core factory; the barrel fills the default `structure`. */
export interface EnvelopeValidatorOptions {
  readonly catalog: CatalogDocument;
  readonly envelopeSchema: Record<string, unknown>;
  /** The vendored A2UI common types (`ComponentCommon` et al.). */
  readonly commonTypes: Record<string, unknown>;
  /** Injected semantic ports, by engine chunk name (§4.3 item 2). */
  readonly ports?: Readonly<Partial<Record<string, SemanticPort>>>;
  /** The 2020-12 structure seam; defaults to the ajv bridge (src/structure). */
  readonly structure?: StructureValidator;
}

/** A validator bound to one catalogue; `validate` is pure and reusable. */
export interface EnvelopeValidator {
  validate(input: unknown): readonly Diagnostic[];
}

/** The core factory: `structure` is required here (see the barrel). */
export function createEnvelopeValidatorCore(
  options: EnvelopeValidatorOptions & { readonly structure: StructureValidator },
): EnvelopeValidator {
  const { catalog, structure, ports } = options;

  return {
    validate(input: unknown): readonly Diagnostic[] {
      // 1. The JSON round-trip (B1): the canonical form for size AND
      // validation. `undefined` keys vanish here, exactly as the wire sees
      // them, so both structure seams judge the same value.
      const normalized = normalizeEnvelopeInput(input);
      if (!normalized.ok) {
        return [
          {
            code: "schema-violation",
            path: "",
            message: normalized.message,
            severity: "error",
            source: "catalog",
          },
        ];
      }
      const text = normalized.text;
      const bytes = utf8ByteLength(text);
      if (bytes > ENVELOPE_LIMIT_BYTES) {
        return [
          {
            code: "payload-too-large",
            path: "",
            message: `the envelope is ${bytes} UTF-8 bytes, over the ${ENVELOPE_LIMIT_BYTES}-byte budget (§4.3 item 3)`,
            severity: "error",
            source: "catalog",
            detail: { limitBytes: ENVELOPE_LIMIT_BYTES, actualBytes: bytes },
          },
        ];
      }

      // 2. Envelope structure (§4.2), on the NORMALIZED value.
      const envelopeIssues = structure.validateEnvelope(normalized.value);
      if (envelopeIssues.length > 0) return structureDiagnostics(envelopeIssues, "");
      const envelope = normalized.value as Record<string, unknown>;

      // 3. `catalogId` is optional (§4.2: default = the renderer's catalogue):
      // absent names THIS catalogue; present, it must name THIS catalogue.
      // A non-string value that survived step 2 still refuses here.
      const envelopeCatalogId = envelope.catalogId;
      if (envelopeCatalogId !== undefined && envelopeCatalogId !== catalog.catalogId) {
        return [
          {
            code: "schema-violation",
            path: "/catalogId",
            message: `the envelope must name its catalogue (${String(catalog.catalogId)})`,
            severity: "error",
            source: "catalog",
            detail: { expected: catalog.catalogId, found: envelopeCatalogId },
          },
        ];
      }

      // 4. `preview` is reserved (§10.3).
      if (envelope.mode === "preview") {
        return [
          {
            code: "unsupported-mode",
            path: "/mode",
            message: 'mode "preview" is reserved and not rendered by this catalogue (§10.3)',
            severity: "error",
            source: "catalog",
            detail: { mode: "preview" },
          },
        ];
      }

      // 5. The targeted component must be catalogued.
      const root = envelope.root as Record<string, unknown>;
      const component = root.component;
      if (typeof component !== "string" || !(component in catalog.components)) {
        return [
          {
            code: "unknown-component",
            path: "/root/component",
            message: `no catalogued component is named ${String(component)}`,
            severity: "error",
            source: "catalog",
            detail: { component },
          },
        ];
      }

      // 6. A placeholder entry refuses (§5.2 x-sentropic.status).
      const entry = catalog.components[component];
      if (entry === undefined) {
        return [
          {
            code: "unknown-component",
            path: "/root/component",
            message: `no catalogued component is named ${component}`,
            severity: "error",
            source: "catalog",
            detail: { component },
          },
        ];
      }
      const sentropic = entry["x-sentropic"] as
        | { readonly contract?: unknown; readonly engine?: unknown; readonly status?: unknown }
        | undefined;
      if (sentropic?.status === "unknown") {
        return [
          {
            code: "component-unavailable",
            path: "/root/component",
            message: `${component} is catalogued as a placeholder (x-sentropic.status "unknown") and cannot render`,
            severity: "error",
            source: "catalog",
            detail: { component },
          },
        ];
      }

      // 7. The §4.4 contract rule: never newer, never another major.
      const envelopeContract = envelope.contract;
      const entryContract = sentropic?.contract;
      if (typeof entryContract !== "string") {
        return [
          {
            code: "schema-violation",
            path: "/root/component",
            message: `the catalogued entry for ${component} declares no x-sentropic contract`,
            severity: "error",
            source: "catalog",
          },
        ];
      }
      const parsedEntry = parseContract(entryContract);
      const parsedEnvelope = typeof envelopeContract === "string" ? parseContract(envelopeContract) : undefined;
      if (parsedEntry === undefined || parsedEnvelope === undefined) {
        return [
          {
            code: "schema-violation",
            path: "/contract",
            message: `contract versions are "major.minor" strings (§4.4): envelope ${String(
              envelopeContract,
            )}, entry ${entryContract}`,
            severity: "error",
            source: "catalog",
          },
        ];
      }
      if (parsedEnvelope.major !== parsedEntry.major || parsedEnvelope.minor > parsedEntry.minor) {
        return [
          {
            code: "unsupported-contract",
            path: "/contract",
            message: `the envelope targets contract ${String(envelopeContract)} but ${component} is at ${entryContract} (§4.4: an envelope may be older, never newer)`,
            severity: "error",
            source: "catalog",
            detail: { expected: entryContract, found: envelopeContract },
          },
        ];
      }

      // 8. The root's structure against the catalogue entry.
      const componentIssues = structure.validateComponent(component, root);
      if (componentIssues.length > 0) return structureDiagnostics(componentIssues, "/root");

      // 9. Semantics, only when the structure is clean (§4.3 item 2).
      const engine = sentropic?.engine;
      if (typeof engine !== "string" || !engine.startsWith("lazy:")) return [];
      const chunk = engine.slice("lazy:".length);
      const port = ports?.[chunk];
      const payloadPath = `/root/${SEMANTIC_PAYLOAD_PROP}`;
      if (port === undefined) {
        return [
          {
            code: "host-capability-missing",
            path: payloadPath,
            message: `the host did not inject the ${chunk} semantic port (engine ${engine}); the owning runtime validates this payload (§4.3 item 2)`,
            severity: "error",
            source: "host",
            detail: { chunk, engine },
          },
        ];
      }
      let findings: readonly SemanticFinding[];
      try {
        findings = port.validate(root[SEMANTIC_PAYLOAD_PROP]);
      } catch (error) {
        const cause = error instanceof Error ? error.message : String(error);
        return [{ ...engineLoadFailed(chunk, cause), path: payloadPath }];
      }
      return findings.map((finding) => ({
        // Engine warnings surface under the engine's own code (the one §4.5
        // names is `watermark-refused`); refusals are always `semantic-invalid`.
        code: finding.severity === "warning" ? finding.code : "semantic-invalid",
        path: `${payloadPath}${finding.pointer ?? ""}`,
        message: finding.message,
        severity: finding.severity,
        source: port.source,
        detail: { code: finding.code },
      }));
    },
  };
}
