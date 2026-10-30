/**
 * Contract module for `BpmnCanvas` (§5.1, §5.4 — the third-party-engine pilot).
 *
 * SOURCE OF TRUTH: the F1 document consumed by `packages/diagram-canvas`'s
 * BPMN engine. No BPMN engine is installed in this workspace and the F1
 * input's full schema lives on an unpushed workbench branch, so per §5.1 the
 * `document` prop is a STRUCTURAL ENVELOPE: `$type` is required, every other
 * key is kept as an unknown F1 extension field, and the real validation is
 * the engine's `hydrate` (§4.3 item 2), wired in L6 through the injected
 * `bpmn-canvas` semantic port. The facts that could not be sourced locally:
 * F1's exact document schema, the hydrate signature and its error-code list.
 *
 * The keep-unknown-extensions form is the declared replacement type for this
 * prop (never an implicit `any`): the index signature is `unknown`, recorded
 * in `replacedTypes`, and the emitted `additionalProperties: {}` is listed in
 * the replacement inventory the no-implicit-any scan checks.
 */

import type { ContractModule } from "./types.js";

/**
 * F1 structural envelope (§5.1): `$type` required, extension fields kept.
 * The index signature is `unknown` (not `any`) and emits exactly
 * `additionalProperties: {}`; its validation belongs to the engine's
 * hydrate, so it carries no JSDoc of its own (the emitted schema node must
 * stay the plain declared replacement).
 */
export interface BpmnCanvasDocument {
  /** F1 type discriminator, e.g. "bpmn:Definitions". */
  $type: string;
  [key: string]: unknown;
}

/** The JSON subset of the BpmnCanvas props: the F1 document alone. */
export interface BpmnCanvasProps {
  /** The F1 document to render: a structural envelope the engine's hydrate validates. */
  "document": BpmnCanvasDocument;
}

/** The declared contract of `BpmnCanvas` (§5.1). */
export const bpmnCanvasContract: ContractModule = {
  component: "BpmnCanvas",
  propsTypeName: "BpmnCanvasProps",
  source: {
    packageName: "@sentropic/design-system-diagram-canvas",
    file: "packages/diagram-canvas/src/lib/BpmnCanvas.svelte",
    typeName: "BpmnCanvasProps",
    note:
      "F1 input contract of the BPMN engine; not published in this workspace " +
      "(unpushed workbench branch), so the document prop is a structural envelope " +
      "whose real validation is the engine's hydrate (§4.3 item 2, §5.1).",
  },
  excluded: [],
  replacedTypes: [
    {
      prop: "document",
      sourceType: "F1 document (BPMN engine input, schema not published in this workspace)",
      replacement:
        "BpmnCanvasDocument structural envelope: $type required, other keys kept as unknown F1 " +
        "extension fields (emitted as additionalProperties: {})",
      reason:
        "§5.1: F1 is catalogued as a structural envelope whose real validation is the " +
        "engine's hydrate; the keep-unknown form is deliberate, listed in the " +
        "replacement inventory the no-implicit-any scan checks.",
    },
  ],
  narrowedUnions: [],
  callbacks: [],
  frameworks: [
    { framework: "svelte", file: "packages/components-svelte", typeName: "", role: "no-counterpart" },
    { framework: "react", file: "packages/components-react", typeName: "", role: "no-counterpart" },
    { framework: "vue", file: "packages/components-vue", typeName: "", role: "no-counterpart" },
    { framework: "angular", file: "packages/components-angular", typeName: "", role: "no-counterpart" },
  ],
  metadata: {
    contract: "1.0",
    element: "st-bpmn-canvas",
    engine: "lazy:bpmn-canvas",
    events: [],
    fallback: "svg",
  },
  example: {
    id: "root",
    component: "BpmnCanvas",
    "document": {
      $type: "bpmn:Definitions",
      id: "definitions-1",
      targetNamespace: "https://example.com/bpmn",
    },
  },
  semantic: {
    source: "bpmn-canvas",
    runtimePackage: "@sentropic/design-system-diagram-canvas",
    reason:
      "The engine's hydrate is the authoritative validator of the F1 document (§4.3 " +
      "item 2). No engine is installed here, so the port is injected (L6) and the " +
      "workspace-side tests use a typed stub.",
  },
};
