/**
 * Presentation application join (M3 §3.2.1).
 *
 * Closed input/output, normative execution order, no last-wins, no consumer
 * callback, no schema augmentation, no family-name or scene-id literals.
 */

import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { SemanticDocument } from "./document.js";
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_SCHEMA_PIN,
  familyPinForProfile,
  parsePinnedAdapterReference,
  presentationDigestOf,
  presentationPinsEqual,
  type DiagramPresentation,
  type PresentationPin,
} from "./presentation.js";
import { resolveGovernedCatalog } from "./presentation-catalog.js";
import type { ProfileRegistry } from "./profile.js";
import { validateDocument, validateView, type ValidationOptions } from "./validate.js";
import type { ViewDocument } from "./view.js";
import { sha256Hex } from "./sha256.js";

export interface ApplyPresentationInput {
  readonly familyPins: readonly PresentationPin[];
  readonly semanticDocument: SemanticDocument;
  readonly sourceView: ViewDocument;
  readonly contractPin: PresentationPin;
  readonly semanticCategoryPins: readonly PresentationPin[];
  readonly adapterPin: PresentationPin;
}

export type ApplyPresentationOutput =
  | {
      readonly outcome: "ok";
      readonly view: ViewDocument;
      readonly familyPins: readonly PresentationPin[];
      readonly contractPin: PresentationPin;
      readonly presentationDigest: string;
      readonly diagnostics: readonly [];
    }
  | { readonly outcome: "refused"; readonly diagnostics: readonly Diagnostic[] };

function pinMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check presentation-pin-mismatch",
    refs: [],
    details: { check: "presentation-pin-mismatch" },
  });
}

function shapeMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check presentation-shape-invalid",
    refs: [],
    details: { check: "presentation-shape-invalid" },
  });
}

function unknownProfileDiagnostic(id: string, registry: ProfileRegistry): Diagnostic {
  return diagnostic({
    code: "unknown-profile",
    severity: "error",
    path: "profileRefs",
    message: `profile ${id} is not in the registry (registered: ${registry.list().join(", ") || "none"})`,
    details: { profile: id },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function isWellFormedPin(value: unknown): value is PresentationPin {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== 3) return false;
  if (!keys.includes("id") || !keys.includes("version") || !keys.includes("contentDigest")) return false;
  if (typeof value["id"] !== "string" || (value["id"] as string).length === 0) return false;
  if (typeof value["version"] !== "string" || (value["version"] as string).length === 0) return false;
  if (typeof value["contentDigest"] !== "string") return false;
  return DIGEST_PATTERN.test(value["contentDigest"] as string);
}

function pinsEqual(left: PresentationPin, right: PresentationPin): boolean {
  return presentationPinsEqual(left, right);
}

export function applyPresentation(
  input: ApplyPresentationInput,
  options: ValidationOptions,
): ApplyPresentationOutput {
  const registry: ProfileRegistry = (options as ValidationOptions).registry;
  if (registry === undefined || typeof registry.get !== "function" || typeof registry.list !== "function") {
    return { outcome: "refused", diagnostics: [shapeMismatch("input")] };
  }

  // Closed input shape, safely before any dereference. Every failure returns
  // the refusal union, never throws.
  if (!isRecord(input as unknown)) {
    return { outcome: "refused", diagnostics: [shapeMismatch("input")] };
  }
  const inputRecord = input as unknown as Record<string, unknown>;
  const allowedInputKeys = new Set([
    "familyPins",
    "semanticDocument",
    "sourceView",
    "contractPin",
    "semanticCategoryPins",
    "adapterPin",
  ]);
  for (const key of Object.keys(inputRecord)) {
    if (!allowedInputKeys.has(key)) {
      return { outcome: "refused", diagnostics: [shapeMismatch(`input.${key}`)] };
    }
  }
  for (const required of ["familyPins", "semanticDocument", "sourceView", "contractPin", "semanticCategoryPins", "adapterPin"]) {
    if (inputRecord[required] === undefined) {
      return { outcome: "refused", diagnostics: [shapeMismatch(`input.${required}`)] };
    }
  }
  if (!Array.isArray(inputRecord["familyPins"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("input.familyPins")] };
  }
  if (!Array.isArray(inputRecord["semanticCategoryPins"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("input.semanticCategoryPins")] };
  }
  if (!isRecord(inputRecord["semanticDocument"]) || !isRecord(inputRecord["sourceView"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("input")] };
  }
  if (!isWellFormedPin(inputRecord["contractPin"])) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (!isWellFormedPin(inputRecord["adapterPin"])) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  for (const [index, pin] of (inputRecord["familyPins"] as readonly unknown[]).entries()) {
    if (!isWellFormedPin(pin)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
    void index;
  }
  for (const pin of inputRecord["semanticCategoryPins"] as readonly unknown[]) {
    if (!isWellFormedPin(pin)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
  }

  const typed = input as ApplyPresentationInput;
  const semanticDocument = typed.semanticDocument as SemanticDocument;
  const sourceView = typed.sourceView as ViewDocument;

  if (!isRecord((sourceView as unknown as Record<string, unknown>)["presentation"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("presentation.diagram")] };
  }
  const presentation = (sourceView as unknown as { presentation: Record<string, unknown> }).presentation;
  const diagramValue = presentation["diagram"] as unknown;
  if (diagramValue === undefined || diagramValue === null || !isRecord(diagramValue)) {
    return { outcome: "refused", diagnostics: [shapeMismatch("presentation.diagram")] };
  }

  // The persisted pin is validated before any comparison, so a missing, null
  // or malformed value returns the refusal union instead of throwing.
  if (!isWellFormedPin((diagramValue as Record<string, unknown>)["contractPin"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("presentation.diagram.contractPin")] };
  }

  // Family pins equal exactly the unique semantic profileRefs in stored order.
  if (!Array.isArray((semanticDocument as unknown as Record<string, unknown>)["profileRefs"])) {
    return { outcome: "refused", diagnostics: [shapeMismatch("input")] };
  }
  const profileRefs = semanticDocument.profileRefs as readonly unknown[];
  for (const ref of profileRefs) {
    if (typeof ref !== "string") {
      return { outcome: "refused", diagnostics: [unknownProfileDiagnostic(String(ref), registry)] };
    }
  }
  const uniqueRefs: string[] = [];
  for (const ref of profileRefs as readonly string[]) {
    if (!uniqueRefs.includes(ref)) uniqueRefs.push(ref);
  }
  if (uniqueRefs.length !== (profileRefs as readonly string[]).length) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (typed.familyPins.length !== uniqueRefs.length) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  for (const [index, ref] of uniqueRefs.entries()) {
    const profile = registry.get(ref as never);
    if (profile === undefined) {
      return { outcome: "refused", diagnostics: [unknownProfileDiagnostic(ref, registry)] };
    }
    const expected = familyPinForProfile(profile);
    const supplied = typed.familyPins[index] as PresentationPin | undefined;
    if (supplied === undefined || !pinsEqual(supplied, expected)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
  }

  // semanticCategoryPins is [] or exactly the declared generic@2 pin already
  // in profileRefs, no duplicates.
  const categoryPins = typed.semanticCategoryPins;
  const seenCategory = new Set<string>();
  for (const pin of categoryPins) {
    const key = `${pin.id}@${pin.version}#${pin.contentDigest}`;
    if (seenCategory.has(key)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
    seenCategory.add(key);
  }
  if (categoryPins.length > 1) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (categoryPins.length === 1) {
    const sole = categoryPins[0] as PresentationPin;
    const genericProfile = registry.get("generic@2" as never);
    if (genericProfile === undefined) {
      return { outcome: "refused", diagnostics: [unknownProfileDiagnostic("generic@2", registry)] };
    }
    const declared = familyPinForProfile(genericProfile);
    if (!pinsEqual(sole, declared)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
    const found = typed.familyPins.some((family) => pinsEqual(family, sole));
    if (!found) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
  }

  const diagram = diagramValue as unknown as DiagramPresentation;
  if (!pinsEqual(typed.contractPin, diagram.contractPin as PresentationPin)) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (!pinsEqual(typed.contractPin, DIAGRAM_PRESENTATION_CONTRACT_PIN)) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }

  // Governed adapter authentication: parse the packaged governed catalog
  // ontology.compatibility.adapter exact pinned reference, verify the
  // adapter bytes and its bound schema asset against
  // artifactBinding.schemaPin, and require equality with input.adapterPin.
  const catalog = resolveGovernedCatalog();
  if (!isRecord(catalog as unknown)) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  const catalogAdapterRef = (catalog as { compatibilityAdapter: unknown }).compatibilityAdapter;
  const catalogBytes = (catalog as { adapterBytes: unknown }).adapterBytes;
  const catalogSchemaPin = (catalog as { schemaPin: unknown }).schemaPin;
  if (typeof catalogAdapterRef !== "string") {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  if (!isWellFormedPin(catalogSchemaPin)) {
    return { outcome: "refused", diagnostics: [pinMismatch("artifactBinding.schemaPin")] };
  }
  if (!pinsEqual(catalogSchemaPin as PresentationPin, DIAGRAM_PRESENTATION_SCHEMA_PIN)) {
    return { outcome: "refused", diagnostics: [pinMismatch("artifactBinding.schemaPin")] };
  }
  const parsedAdapter = parsePinnedAdapterReference(catalogAdapterRef);
  if (parsedAdapter === undefined) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  if (typeof catalogBytes !== "string" || catalogBytes.length === 0) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  if (sha256Hex(catalogBytes) !== parsedAdapter.contentDigest) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  if (!pinsEqual(typed.adapterPin, parsedAdapter)) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }

  // Normative order §3.2.1: families, then occurrences against their owning
  // family, then closed presentation shape, references and values. Each
  // stage runs once; earlier diagnostics are never discarded.
  const semanticDiagnostics = validateDocument(semanticDocument, options);
  if (semanticDiagnostics.length > 0) {
    return { outcome: "refused", diagnostics: semanticDiagnostics };
  }

  const viewDiagnostics = validateView(sourceView, semanticDocument, options);
  if (viewDiagnostics.length > 0) {
    return { outcome: "refused", diagnostics: viewDiagnostics };
  }

  const presentationDigest = presentationDigestOf(diagram);
  return {
    outcome: "ok",
    view: sourceView,
    familyPins: [...typed.familyPins],
    contractPin: { ...typed.contractPin },
    presentationDigest,
    diagnostics: [],
  };
}
