/**
 * Presentation application join (M3 §3.2.1).
 *
 * Closed input/output, normative execution order, no last-wins, no consumer
 * callback, no schema augmentation, no family-name or scene-id literals.
 */

import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { SemanticDocument } from "./document.js";
import {
  DIAGRAM_PRESENTATION_ADAPTER_PIN,
  DIAGRAM_PRESENTATION_ADAPTER_SCHEMA_PIN,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_SCHEMA_PIN,
  familyPinForProfile,
  presentationDigestOf,
  presentationPinsEqual,
  type DiagramPresentation,
  type PresentationPin,
} from "./presentation.js";
import { validateDiagramPresentation } from "./presentation-validate.js";
import { createTypeResolver } from "./resolver.js";
import type { ProfileRegistry } from "./profile.js";
import { validateDocument, validateView, type ValidationOptions } from "./validate.js";
import type { ViewDocument } from "./view.js";

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

function pinsEqual(left: PresentationPin, right: PresentationPin): boolean {
  return presentationPinsEqual(left, right);
}

export function applyPresentation(
  input: ApplyPresentationInput,
  options: ValidationOptions,
): ApplyPresentationOutput {
  const registry: ProfileRegistry = options.registry;

  const uniqueRefs: string[] = [];
  for (const ref of input.semanticDocument.profileRefs) {
    if (!uniqueRefs.includes(ref)) uniqueRefs.push(ref);
  }
  if (uniqueRefs.length !== input.semanticDocument.profileRefs.length) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (input.familyPins.length !== uniqueRefs.length) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  for (const [index, ref] of uniqueRefs.entries()) {
    const profile = registry.get(ref as never);
    if (profile === undefined) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
    const expected = familyPinForProfile(profile);
    const supplied = input.familyPins[index] as PresentationPin | undefined;
    if (supplied === undefined || !pinsEqual(supplied, expected)) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
  }

  for (const pin of input.semanticCategoryPins) {
    const found = input.familyPins.some((family) => pinsEqual(family, pin));
    if (!found) {
      return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
    }
  }

  const diagram = input.sourceView.presentation.diagram as DiagramPresentation | undefined;
  if (diagram === undefined) {
    return {
      outcome: "refused",
      diagnostics: [
        diagnostic({
          code: "occurrence-endpoint-mismatch",
          severity: "error",
          path: "presentation.diagram",
          message: "diagram presentation fails check presentation-shape-invalid",
          refs: [],
          details: { check: "presentation-shape-invalid" },
        }),
      ],
    };
  }
  if (!pinsEqual(input.contractPin, diagram.contractPin as PresentationPin)) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }
  if (!pinsEqual(input.contractPin, DIAGRAM_PRESENTATION_CONTRACT_PIN)) {
    return { outcome: "refused", diagnostics: [pinMismatch("presentation.diagram.contractPin")] };
  }

  if (!pinsEqual(input.adapterPin, DIAGRAM_PRESENTATION_ADAPTER_PIN)) {
    return { outcome: "refused", diagnostics: [pinMismatch("input.adapterPin")] };
  }
  if (!pinsEqual(DIAGRAM_PRESENTATION_ADAPTER_SCHEMA_PIN, DIAGRAM_PRESENTATION_SCHEMA_PIN)) {
    return { outcome: "refused", diagnostics: [pinMismatch("artifactBinding.schemaPin")] };
  }

  const semanticDiagnostics = validateDocument(input.semanticDocument, options);
  if (semanticDiagnostics.length > 0) {
    return { outcome: "refused", diagnostics: semanticDiagnostics };
  }

  const resolver = createTypeResolver(input.semanticDocument);
  void resolver;

  const presentationDiagnostics = validateDiagramPresentation(input.semanticDocument, input.sourceView, options);
  if (presentationDiagnostics.length > 0) {
    const viewDiagnostics = validateView(input.sourceView, input.semanticDocument, options);
    const merged = [...presentationDiagnostics];
    for (const entry of viewDiagnostics) {
      if (!merged.some((existing) => existing.path === entry.path && existing.code === entry.code)) {
        if (
          entry.path.startsWith("presentation.diagram") ||
          entry.code === "dangling-reference" ||
          entry.code === "reference-type-mismatch" ||
          entry.code === "tone-category-unknown" ||
          entry.code === "text-pattern-mismatch" ||
          entry.code === "text-too-long"
        ) {
          merged.push(entry);
        }
      }
    }
    return { outcome: "refused", diagnostics: presentationDiagnostics };
  }

  const viewDiagnostics = validateView(input.sourceView, input.semanticDocument, options);
  if (viewDiagnostics.length > 0) {
    return { outcome: "refused", diagnostics: viewDiagnostics };
  }

  const presentationDigest = presentationDigestOf(diagram);
  return {
    outcome: "ok",
    view: input.sourceView,
    familyPins: [...input.familyPins],
    contractPin: { ...input.contractPin },
    presentationDigest,
    diagnostics: [],
  };
}
