import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN, localIdOf, occurrenceRef, defaultProfileRegistry,
  type OccurrenceRef, type SemanticDocument,
} from "@sentropic/diagram-core";
import { layoutCard, layoutZone, defaultCardMeasure, sceneCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import { layoutScene, type SceneLayoutInput } from "@sentropic/diagram-canvas/diagramSceneModel";
import { cardLineMeasurer, projectCardProps, projectZoneProps, renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";
import { DossierDiagramError } from "./diagram-source.js";

const measure = sceneCardMeasure(defaultCardMeasure);
const measureLines = cardLineMeasurer(measure);
const layoutFailures = new Set(["label-unplaced", "label-budget-exhausted", "route-obstructed", "channel-unresolved", "docking-overflow"]);

export function dossierDiagramLayout(scene: SemanticDocument) {
  const entities: SceneLayoutInput["presentation"]["entities"] = Object.fromEntries(
    Object.values(scene.entities).map((entity) => [
      occurrenceRef(`e.${localIdOf(entity.id)}`),
      {
        form: entity.type === "container" ? "container" : "card",
        text: { title: entity.attributes.name?.kind === "text" ? entity.attributes.name.value : entity.id },
      },
    ]),
  );
  const containers = Object.entries(entities)
    .filter(([, entity]) => entity.form === "container").map(([id]) => id as OccurrenceRef);
  const presentation: SceneLayoutInput["presentation"] = {
    contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN, entities, legends: {}, categoryTokens: [],
  };
  return { document: scene, registry: defaultProfileRegistry, presentation, measureLines, containers };
}

export function drawDossierDiagram(
  sectionId: string, title: string, layout: ReturnType<typeof dossierDiagramLayout>, collapsed: readonly OccurrenceRef[],
) {
  const input = { ...layout, collapsed };
  let drawing: ReturnType<typeof renderSceneSvg>;
  try {
    // renderSceneSvg uses layoutScene and resolveScene for the drawing.
    drawing = renderSceneSvg(input, { title, measure });
  } catch (error) {
    const result = layoutScene(input);
    if (result.status === "laid-out") throw error;
    throw new DossierDiagramError(sectionId, "diagram-layout-refused", "The DS engine refused the scene",
      [...result.refusals, ...result.diagnostics]);
  }
  const diagnostics = drawing.scene.nodes.flatMap((node) => {
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

export function prepareDossierDiagram(sectionId: string, title: string, scene: SemanticDocument) {
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
