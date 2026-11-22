import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { assertFocusDocument } from "@sentropic/focus/validate";
import type { SceneDocument, SceneView } from "@sentropic/diagram-canvas/diagramSceneModel";
import { prepareDossierDiagram } from "./diagram-layout.js";
import { isRecord, resolveDossierScene } from "./diagram-source.js";

export interface DossierDiagramViews {
  readonly scene: SceneDocument;
  readonly views: { readonly expanded: SceneView; readonly folded: SceneView };
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
    const scene = JSON.parse(canonicalJson(resolveDossierScene(section))) as SceneDocument;
    const { expanded, folded } = prepareDossierDiagram(section.id, section.alt, scene);
    return [section.id, { scene, views: { expanded: expanded.result.view, folded: folded.result.view } }];
  }));
  return { contract: "focus-views/1", documentDigest: baseDigest(input), rendererDigest: baseDigest(kitManifest), diagrams };
}

export function dossierManifestViews(manifest: unknown): Record<string, unknown> | undefined {
  if (!isRecord(manifest) || manifest.contract !== "focus-dossier/1" || !Array.isArray(manifest.derived)) {
    throw new Error("Invalid focus-dossier/1 manifest");
  }
  const entries = manifest.derived.filter((entry: unknown) => isRecord(entry) && entry.path === "views.json");
  if (entries.length > 1) throw new Error("Duplicate views.json manifest entry");
  return entries[0];
}

export function validateDossierViews(
  dossier: unknown, manifest: unknown, companion: unknown, sectionIds: ReadonlySet<string>,
): ReadonlyMap<string, { readonly scene: unknown; readonly views: Record<string, unknown> }> {
  if (manifest === undefined && companion === undefined) return new Map();
  const entry = dossierManifestViews(manifest);
  if (!isRecord(manifest) || !isRecord(manifest.document) || manifest.document.digest !== baseDigest(dossier)) {
    throw new Error("Dossier document digest does not match the manifest");
  }
  if (companion === undefined && entry === undefined) return new Map();
  if (!isRecord(companion) || companion.contract !== "focus-views/1" || !isRecord(companion.diagrams) ||
      Object.keys(companion).length !== 4) throw new Error("Invalid focus-views/1 companion");
  if (companion.documentDigest !== manifest.document.digest) throw new Error("Views document digest does not match the manifest");
  if (!isRecord(manifest.renderer) || typeof companion.rendererDigest !== "string" ||
      !/^sha256:[0-9a-f]{64}$/.test(companion.rendererDigest) || companion.rendererDigest !== manifest.renderer.digest) {
    throw new Error("Views renderer digest does not match the manifest");
  }
  if (entry?.mimeType !== "application/json" || entry.digest !== baseDigest(companion) ||
      entry.bytes !== new TextEncoder().encode(canonicalJson(companion)).length) {
    throw new Error("Views file digest or size does not match the manifest");
  }
  return new Map(Object.entries(companion.diagrams).map(([id, diagram]) => {
    if (!sectionIds.has(id) || !isRecord(diagram) || !isRecord(diagram.scene) || !isRecord(diagram.views) ||
        Object.keys(diagram).length !== 2 || Object.keys(diagram.views).length !== 2) {
      throw new Error(`Invalid views companion entry for diagram "${id}"`);
    }
    return [id, { scene: diagram.scene, views: diagram.views }];
  }));
}
