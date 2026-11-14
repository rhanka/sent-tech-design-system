import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { m3ProfileRegistry, shippedExecutorBindings, type SemanticDocument, type ViewDocument } from "@sentropic/diagram-core";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../../src/presentation/diagramCardModel.js";

export function hCondInput(name: "architecture" | "ontology", folded: boolean) {
  const load = (suffix: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/h-cond/appctx-${name}.${suffix}.json`, import.meta.url).href).replace(/^\/@fs(?=\/)/, ""), "utf8"));
  const document = load("semantic") as SemanticDocument;
  const view = load(`view-${name}`) as ViewDocument;
  return { document, view, presentation: view.presentation.diagram!, registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings, measureLines: cardLineMeasurer(sceneCardMeasure(defaultCardMeasure)),
    collapsed: folded ? Object.values(view.groups).flatMap(group => group.occurrence === undefined ? [] : [group.occurrence]) : [] };
}
