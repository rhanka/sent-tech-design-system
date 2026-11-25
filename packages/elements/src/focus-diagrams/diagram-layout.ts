import { layoutCard, layoutZone, defaultCardMeasure, sceneCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import {
  layoutScene,
  shippedSceneBindings,
  shippedSceneRegistry,
  type SceneDocument,
  type SceneLayoutInput,
  type SceneOccurrenceRef,
} from "@sentropic/diagram-canvas/diagramSceneModel";
import { cardLineMeasurer, projectCardProps, projectZoneProps, renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";
import { DossierDiagramError } from "./diagram-source.js";

/** Pinned column width for Focus `process@1` diagrams (72ch column, scale >= 0.9 under P-R1). */
export const FOCUS_PROCESS_TARGET_WIDTH = 640;

const measure = sceneCardMeasure(defaultCardMeasure);
const measureLines = cardLineMeasurer(measure);
const processMeasureLines: SceneLayoutInput["measureLines"] = (request) => {
  const layout = measureLines(request);
  if (request.role !== "edge-label" || layout.width === 0) return layout;
  // Pad static edge-label boxes by 4 px on each side so fallback sans fonts
  // (e.g. DejaVu/Liberation Sans on Linux) stay inside their label rect.
  return { ...layout, width: layout.width + 8 };
};
const layoutFailures = new Set([
  "label-unplaced",
  "label-budget-exhausted",
  "route-obstructed",
  "route-spacing-conflict",
  "channel-unresolved",
  "channel-capacity-exceeded",
  "docking-overflow",
]);

const PRESENTATION_CONTRACT_PIN: SceneLayoutInput["presentation"]["contractPin"] = {
  id: "diagram-presentation",
  version: "1",
  contentDigest: "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae",
};

// r7 creates fold groups only for types marked as containers. generic@1
// describes containment but omits that flag. Declare the foldable generic@1
// profile and its pinned legacy binding without importing diagram-core in the
// design-system layer.
const foldableGenericProfile: NonNullable<ReturnType<SceneLayoutInput["registry"]["get"]>> = {
  id: "generic@1",
  name: "generic",
  version: 1,
  completeness: "complete",
  entityTypes: [
    {
      id: "node",
      label: "Node",
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "state", kind: "enum", values: ["draft", "active", "retired"] },
        { name: "weight", kind: "quantity", units: ["unit"] },
        { name: "duration", kind: "quantity", units: ["s", "min", "h"] },
        { name: "createdAt", kind: "date" },
        { name: "pinned", kind: "boolean" },
        { name: "tags", kind: "collection", item: { kind: "text", maxLength: 40 }, maxItems: 8 },
        { name: "owner", kind: "reference", refKind: "entity" },
      ],
    },
    {
      id: "container",
      label: "Container",
      container: true,
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "collapsed", kind: "boolean" },
      ],
    },
  ],
  portTypes: [
    {
      id: "port",
      label: "Port",
      directions: ["in", "out", "inout"],
      attributes: [{ name: "label", kind: "text", maxLength: 80 }],
    },
  ],
  relationTypes: [
    {
      id: "link",
      label: "Link",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity", "port"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity", "port"] },
      ],
      attributes: [
        { name: "label", kind: "text", maxLength: 120 },
        { name: "weight", kind: "quantity", units: ["unit"] },
      ],
    },
    {
      id: "contains",
      label: "Contains",
      direction: "directed",
      roles: [
        { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["container"] },
        { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
      ],
      hierarchy: {
        id: "containment",
        shape: "tree",
        parentRole: "parent",
        childRole: "child",
      },
    },
    {
      id: "association",
      label: "Association",
      direction: "undirected",
      roles: [
        { role: "member", cardinality: { min: 2, max: 8 }, targets: ["entity"] },
      ],
      attributes: [{ name: "label", kind: "text", maxLength: 120 }],
    },
  ],
  constraints: [
    { kind: "acyclic-hierarchy", hierarchyId: "containment" },
    { kind: "unique-attribute", entityType: "container", attribute: "name" },
    { kind: "max-entities-of-type", entityType: "container", max: 64 },
  ],
  limits: {
    maxEntities: 100_000,
    maxRelations: 500_000,
    maxEndpointsPerRelation: 8,
  },
  notes: [
    "Foldable generic@1 profile for Focus dossier diagrams.",
  ],
};

const isProcessScene = (scene: SceneDocument): boolean =>
  scene.profileRefs.length === 1 && scene.profileRefs[0] === "process@1";

export const focusSceneRegistry: SceneLayoutInput["registry"] = {
  get: (id) => (id === "generic@1" ? foldableGenericProfile : shippedSceneRegistry.get(id)),
  has: (id) => id === "generic@1" || shippedSceneRegistry.has(id),
  list: () => ["generic@1", ...shippedSceneRegistry.list().filter((id) => id !== "generic@1")],
};

export const focusSceneBindings: NonNullable<SceneLayoutInput["bindings"]> = {
  schemaVersion: "1",
  rows: [
    {
      profileId: "generic@1",
      profilePin: {
        id: "generic@1",
        version: 1,
        contentDigest: "a003981971bdf75b50f455f19d701130c81fd896aeb7f4b0f0f9fe49dd874b8a",
      },
      declarationAdapter: "legacy-constraints@1",
    },
    ...shippedSceneBindings.rows,
  ],
};

const localIdOf = (ref: string): string => ref.slice(ref.indexOf(":") + 1);
const occurrenceRef = (id: string): SceneOccurrenceRef => `occurrence:${id}` as SceneOccurrenceRef;

export function dossierDiagramLayout(scene: SceneDocument) {
  const processScene = isProcessScene(scene);
  const entities: SceneLayoutInput["presentation"]["entities"] = processScene
    ? {}
    : Object.fromEntries(
        Object.values(scene.entities).map((entity) => [
          occurrenceRef(`e.${localIdOf(entity.id)}`),
          {
            form: entity.type === "container" ? "container" : "card",
            text: { title: entity.attributes.name?.kind === "text" ? entity.attributes.name.value : entity.id },
          },
        ]),
      );
  const containers = processScene
    ? []
    : Object.entries(entities)
        .filter(([, entity]) => entity.form === "container").map(([id]) => id as SceneOccurrenceRef);
  const presentation: SceneLayoutInput["presentation"] = {
    contractPin: PRESENTATION_CONTRACT_PIN, entities, legends: {}, categoryTokens: [],
  };
  return {
    document: scene,
    registry: focusSceneRegistry,
    bindings: focusSceneBindings,
    presentation,
    measureLines: processScene ? processMeasureLines : measureLines,
    containers,
    ...(processScene ? { targetWidth: FOCUS_PROCESS_TARGET_WIDTH } : {}),
  };
}

export function drawDossierDiagram(
  sectionId: string, title: string, layout: ReturnType<typeof dossierDiagramLayout>, collapsed: readonly SceneOccurrenceRef[],
) {
  const input = { ...layout, collapsed };
  let drawing: ReturnType<typeof renderSceneSvg>;
  try {
    // renderSceneSvg uses layoutScene and resolveScene for the drawing.
    drawing = renderSceneSvg(input, isProcessScene(layout.document) ? { title } : { title, measure });
  } catch (error) {
    const result = layoutScene(input);
    if (result.status === "laid-out") throw error;
    throw new DossierDiagramError(sectionId, "diagram-layout-refused", "The DS engine refused the scene",
      [...result.refusals, ...result.diagnostics]);
  }
  const diagnostics = drawing.scene.nodes.flatMap((node) => {
    if (node.kind === "process" || node.kind === "erd") return [];
    const options = { entityId: node.entity };
    const projected = node.kind === "zone"
      ? projectZoneProps(node.presentation, {
        ...options, collapsed: node.collapsed, width: node.rect.width, height: node.rect.height,
      })
      : projectCardProps(node.presentation, options);
    if (projected.kind === "label") return [];
    const overflow = projected.kind === "zone"
      ? layoutZone({ ...projected.props, autoSize: true }, measure).diagnostics
      : layoutCard({ ...projected.props, height: node.rect.height, autoSize: true }, measure).diagnostics;
    return [...overflow].filter((item) => item.code === "card-overflow" || item.code === "zone-overflow");
  });
  const warnings = drawing.result.warnings.filter(({ code }) => layoutFailures.has(code) || code.endsWith("-overflow"));
  return { ...drawing, diagnostics: [...diagnostics, ...warnings] };
}

export function prepareDossierDiagram(sectionId: string, title: string, scene: SceneDocument) {
  const layout = dossierDiagramLayout(scene);
  const expanded = drawDossierDiagram(sectionId, title, layout, []);
  const folded = layout.containers.length === 0 ? expanded : drawDossierDiagram(sectionId, title, layout, layout.containers);
  const diagnostics = folded === expanded ? expanded.diagnostics : [...expanded.diagnostics, ...folded.diagnostics];
  if (diagnostics.length !== 0) {
    throw new DossierDiagramError(sectionId, "diagram-layout-refused",
      `The DS engine reported ${diagnostics.map(({ code }) => code).join(", ")}`, diagnostics);
  }
  return { layout, expanded, folded };
}
