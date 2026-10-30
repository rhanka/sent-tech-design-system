/**
 * Contract module for `DecisionDossier` (§5.1, §5.4 — the composition pilot).
 *
 * SOURCE OF TRUTH: the `DecisionDossierDocument` of `@sentropic/focus`
 * (owner decision 2026-10-30: proceed on 0.5.0-rc.9, npm tag `next`). The pin
 * below records WHY v1: the package's `./validate` export validates legacy v1
 * by default when `schemaVersion` is absent (its d.ts names the v1 asset as
 * the published schema it matches, `DOSSIER_SCHEMA_VERSION = "1.0.0"`), while
 * v2 requires an explicit `schemaVersion: 2` with a breaking evidence
 * envelope. The catalogue therefore embeds the v1 schema
 * (`@sentropic/focus/schemas/decision-dossier-document.v1.schema.json`,
 * `$id` `urn:sentropic:focus:DecisionDossierDocument:1.0.0`) and routes
 * semantics to `@sentropic/focus/validate` (§4.3 item 2, source "focus").
 * The embedded copy is scoped to its host document — its internal
 * `#/$defs/X` refs are rewritten to `#/$defs/DecisionDossierDocument/$defs/X`
 * and its root `$id` dropped (the A2UI SDK's zod converter resolves `#/` refs
 * against the host root); the urn identity stays in
 * `x-sentropic.semantic.schemaId`.
 *
 * The generator fails if the installed schema file's sha256 no longer matches
 * the pin. The `document` prop below is a MARKER type the emitter replaces
 * with a `$ref` to the embedded schema — the declared replacement type for
 * this prop, never an implicit `any`.
 */

import type { ContractModule } from "./types.js";

/**
 * Marker replaced at emission by
 * `{"$ref": "#/$defs/DecisionDossierDocument"}` — the embedded, pinned focus
 * v1 schema (see the module header for why v1). Declared so the props
 * interface stays valid TypeScript while the schema comes from the owner.
 */
export interface DecisionDossierDocumentRef {
  readonly "$sentropic.embedded": "DecisionDossierDocument";
}

/** The JSON subset of the DecisionDossier props: the pinned document alone. */
export interface DecisionDossierProps {
  /** The pinned DecisionDossierDocument, semantically validated by the focus runtime through the injected focus port. */
  "document": DecisionDossierDocumentRef;
}

/** The declared contract of `DecisionDossier` (§5.1, §11.2). */
export const decisionDossierContract: ContractModule = {
  component: "DecisionDossier",
  propsTypeName: "DecisionDossierProps",
  source: {
    packageName: "@sentropic/focus",
    file: "schemas/decision-dossier-document.v1.schema.json",
    typeName: "DecisionDossierDocument",
    note:
      "Semantic documents reuse their owners' types (§5.1): the schema is embedded " +
      "from the pinned package, not re-declared here.",
  },
  excluded: [],
  replacedTypes: [
    {
      prop: "document",
      sourceType: "DecisionDossierDocument (focus v1, urn:sentropic:focus:DecisionDossierDocument:1.0.0)",
      replacement:
        "Embedded focus v1 JSON Schema under $defs.DecisionDossierDocument, referenced by " +
        "$ref from the document property (marker type DecisionDossierDocumentRef). The " +
        "embedded copy is scoped to its host: the root $id is dropped and every internal " +
        "#/$defs/X ref is rewritten to #/$defs/DecisionDossierDocument/$defs/X so it " +
        "resolves inside the catalogue and standalone documents; the urn identity stays " +
        "in x-sentropic.semantic.schemaId and the sha256 pin verifies the source file. " +
        "The pinned owner schema declares diagramNode.scene as an unconstrained object " +
        "('{ \"type\": \"object\" }' plus its description): an owner declaration, not an " +
        "implicit any of this generator — it is listed in the scan's inventory.",
      reason:
        "§5.1: the owner's schema is authoritative; the marker keeps the props interface " +
        "declared while the emitted schema is the owner's, sha256-pinned below.",
    },
  ],
  narrowedUnions: [],
  callbacks: [
    {
      callback: "onChooseOption (option card click)",
      signature: "(optionId: string) => void",
      intent: "choose-option",
      targetFrom: "option id",
      note: "§11.2 criterion 4: clicking an option card emits choose-option with the option id.",
    },
  ],
  frameworks: [
    { framework: "svelte", file: "packages/components-svelte", typeName: "", role: "no-counterpart" },
    { framework: "react", file: "packages/components-react", typeName: "", role: "no-counterpart" },
    { framework: "vue", file: "packages/components-vue", typeName: "", role: "no-counterpart" },
    { framework: "angular", file: "packages/components-angular", typeName: "", role: "no-counterpart" },
  ],
  metadata: {
    contract: "1.0",
    element: "st-decision-dossier",
    engine: "lazy:focus",
    events: ["choose-option"],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "DecisionDossier",
    "document": {
      ref: "decision-1",
      subject: "Adopt the JSON render standard for design-system rendering",
      title: "Decision: adopt the JSON render standard",
      hash: "b7d3f0c9",
      cursor: "2026-10-30T10:00:00Z",
      sections: [
        {
          kind: "question",
          id: "q1",
          targetRef: "decision-1",
          question: "Which rendering contract do we adopt?",
          state: "open",
        },
        {
          kind: "optionSet",
          id: "options-1",
          targetRef: "q1",
          title: "Options",
          options: [
            {
              kind: "option",
              id: "opt-json",
              targetRef: "q1",
              label: "Adopt the JSON render standard",
              annotation: "none",
            },
            {
              kind: "option",
              id: "opt-status-quo",
              targetRef: "q1",
              label: "Keep the status quo",
              annotation: "none",
            },
          ],
        },
      ],
      interactions: [],
      provenance: { source: "track", readAt: "2026-10-30T10:00:00Z" },
      amendmentTrace: [],
    },
  },
  semantic: {
    source: "focus",
    runtimePackage: "@sentropic/focus@0.5.0-rc.9",
    schemaSubpath: "schemas/decision-dossier-document.v1.schema.json",
    schemaId: "urn:sentropic:focus:DecisionDossierDocument:1.0.0",
    sha256: "725bc07e7c6b6ad51a1f720cc9fb02649d8f31bc54e71c61c350fd20058c8852",
    reason:
      "§4.3 item 2: the pinned focus validator is authoritative for a DecisionDossierDocument. " +
      "The example above is valid for both the embedded schema and the real validator.",
  },
};
