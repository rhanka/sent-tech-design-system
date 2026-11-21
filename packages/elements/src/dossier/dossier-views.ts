import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { assertFocusDocument } from "@sentropic/focus/validate";
import type { SemanticDocument, ViewDocument } from "@sentropic/diagram-core";
import { prepareDossierDiagram } from "./diagram-layout.js";
import { resolveDossierScene } from "./diagram-source.js";

export interface DossierDiagramViews {
  readonly scene: SemanticDocument;
  readonly views: { readonly expanded: ViewDocument; readonly folded: ViewDocument };
}

export interface DossierViews {
  readonly contract: "focus-views/1";
  readonly documentDigest: string;
  readonly rendererDigest: string;
  readonly diagrams: Readonly<Record<string, DossierDiagramViews>>;
}

/** Prepare the companion before writing an artifact. Encode it with Focus canonicalJson. */
export function buildDossierViews(input: unknown, kitManifest: unknown): DossierViews | undefined {
  const dossier = assertFocusDocument(input);
  const sections = dossier.sections.filter((section) => section.kind === "diagram");
  if (sections.length === 0) return undefined;
  const diagrams = Object.fromEntries(sections.map((section) => {
    const scene = JSON.parse(canonicalJson(resolveDossierScene(section))) as SemanticDocument;
    const { expanded, folded } = prepareDossierDiagram(section.id, section.alt, scene);
    return [section.id, { scene, views: { expanded: expanded.result.view, folded: folded.result.view } }];
  }));
  return { contract: "focus-views/1", documentDigest: baseDigest(input), rendererDigest: baseDigest(kitManifest), diagrams };
}
