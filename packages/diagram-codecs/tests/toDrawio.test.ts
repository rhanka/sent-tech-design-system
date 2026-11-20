/** Small generic scene reused across the draw.io export tests. */
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import { layoutScene, resolveScene, type SceneModel, type SceneOccurrenceRef, type ScenePresentation } from "@sentropic/diagram-canvas/diagramSceneModel";
import { renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";
import { describe, expect, it } from "vitest";

import { toDrawio, toSvg } from "../src/index.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));

function smallSceneInput() {
  const document = {
    documentId: "document:codecs-fixture",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:group": { id: "entity:group", profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Group" } } },
      "entity:a": { id: "entity:a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
      "entity:b": { id: "entity:b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
      "entity:c": { id: "entity:c", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gamma" } } },
      "entity:legend": { id: "entity:legend", profile: "generic@2", type: "legend", attributes: { name: { kind: "text", value: "Key" } } },
      "entity:k-blue": { id: "entity:k-blue", profile: "generic@2", type: "legend-key", attributes: { name: { kind: "text", value: "blue" }, category: { kind: "text", value: "blue" } } },
      "entity:k-green": { id: "entity:k-green", profile: "generic@2", type: "legend-key", attributes: { name: { kind: "text", value: "green" }, category: { kind: "text", value: "green" } } },
    },
    relations: {
      "relation:contains.a": { id: "relation:contains.a", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:a" }], attributes: {} },
      "relation:contains.b": { id: "relation:contains.b", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:b" }], attributes: {} },
      "relation:contains.c": { id: "relation:contains.c", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:c" }], attributes: {} },
      "relation:contains.k-blue": { id: "relation:contains.k-blue", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:legend" }, { role: "child", target: "entity:k-blue" }], attributes: {} },
      "relation:contains.k-green": { id: "relation:contains.k-green", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:legend" }, { role: "child", target: "entity:k-green" }], attributes: {} },
      "relation:a-b": { id: "relation:a-b", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:b" }], attributes: { label: { kind: "text", value: "calls" } } },
      "relation:b-c": { id: "relation:b-c", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:b" }, { role: "target", target: "entity:c" }], attributes: { label: { kind: "text", value: "realizes" } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  } as unknown as SemanticDocument;

  const presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      "occurrence:e.group": { form: "container", text: { title: "Group", subtitle: "Area" }, anatomy: "v2" },
      "occurrence:e.a": { form: "card", text: { title: "Alpha", body: "Service A" }, anatomy: "v2", categoryRef: "entity:k-blue" },
      "occurrence:e.b": { form: "card", text: { title: "Beta", body: "Service B" }, anatomy: "v2", categoryRef: "entity:k-green" },
      "occurrence:e.c": { form: "card", text: { title: "Gamma", body: "Service C" }, anatomy: "v2" },
      "occurrence:e.legend": { form: "legend", text: { title: "Key", subtitle: "tones" }, anatomy: "v2" },
      "occurrence:e.k-blue": { form: "legend-key", text: { title: "blue" }, anatomy: "v2" },
      "occurrence:e.k-green": { form: "legend-key", text: { title: "green" }, anatomy: "v2" },
    },
    relations: {
      "relation:a-b": { strokeStyle: "solid", arrowhead: "filled-triangle" },
      "relation:b-c": { strokeStyle: "dotted", arrowhead: "open-triangle" },
    },
    legends: {},
    categoryTokens: [],
  } as unknown as ScenePresentation;

  return { document, presentation };
}

function resolve(collapsed: readonly SceneOccurrenceRef[]): SceneModel {
  const { document, presentation } = smallSceneInput();
  const result = layoutScene({
    document,
    presentation,
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureLines,
    collapsed: [...collapsed],
  });
  if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result.refusals)}`);
  return resolveScene(result, { document, presentation, measureLines });
}

/** ids of every emitted vertex cell, in document order. */
function vertexIds(xml: string): readonly string[] {
  return [...xml.matchAll(/<mxCell id="([^"]+)"[^>]*vertex="1"/g)].map((match) => match[1]!);
}

function cellTag(xml: string, id: string): string {
  const match = xml.match(new RegExp(`<mxCell id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*/?>`));
  expect(match, `missing cell ${id}`).not.toBeNull();
  return match![0];
}

describe("toDrawio", () => {
  it("re-exports renderSceneSvg as toSvg", () => {
    expect(toSvg).toBe(renderSceneSvg);
  });

  it("emits an mxfile with the zone as container and kept ids", () => {
    const scene = resolve([]);
    const xml = toDrawio(scene);
    expect(xml).toContain("<mxfile ");
    expect(xml).toContain("</mxfile>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);

    const group = cellTag(xml, "occurrence:e.group");
    expect(group).toContain('vertex="1"');
    expect(group).toContain("rounded=1");
    // Children are parented inside the zone container.
    for (const child of ["occurrence:e.a", "occurrence:e.b", "occurrence:e.c"]) {
      expect(cellTag(xml, child)).toContain('parent="occurrence:e.group"');
    }
    expect(vertexIds(xml)).toContain("occurrence:e.group");

    // Tints come from the resolved category references.
    expect(cellTag(xml, "occurrence:e.a")).toContain("fillColor=#fce4ec");
    expect(cellTag(xml, "occurrence:e.b")).toContain("fillColor=#fff3e0");
    expect(cellTag(xml, "occurrence:e.c")).toContain("fillColor=#ffffff");
  });

  it("keeps edge source and target ids, waypoints, and registry style words", () => {
    const scene = resolve([]);
    const xml = toDrawio(scene);
    expect(scene.edges).toHaveLength(2);

    const ab = cellTag(xml, "occurrence:r.a-b");
    expect(ab).toContain('edge="1"');
    expect(ab).toContain('source="occurrence:e.a"');
    expect(ab).toContain('target="occurrence:e.b"');
    expect(ab).toContain("orthogonalEdgeStyle");

    const bc = cellTag(xml, "occurrence:r.b-c");
    expect(bc).toContain('source="occurrence:e.b"');
    expect(bc).toContain('target="occurrence:e.c"');
    // Dotted + open-triangle come from the DE-2 registry words.
    expect(bc).toContain("dashed=1");
    expect(bc).toContain("dashPattern=2 5");
    expect(bc).toContain("endFill=0");

    // Every edge references only ids emitted as vertices.
    const ids = new Set(vertexIds(xml));
    for (const edge of scene.edges) {
      const tag = cellTag(xml, edge.occurrence);
      for (const attr of ["source", "target"]) {
        const value = tag.match(new RegExp(`${attr}="([^"]+)"`))?.[1];
        if (value !== undefined) expect(ids.has(value)).toBe(true);
      }
    }
  });

  it("exports folded and unfolded states, both valid", () => {
    const unfolded = toDrawio(resolve([]));
    const folded = toDrawio(resolve([occurrenceRef("e.group")]));

    for (const xml of [unfolded, folded]) {
      expect(xml).toContain("<mxfile ");
      expect(xml.endsWith("</mxfile>\n")).toBe(true);
      expect(xml.match(/<mxCell /g)!.length).toBeGreaterThan(2);
    }

    // Folded: the zone is a single atomic box, its children absent.
    const foldedIds = vertexIds(folded);
    expect(foldedIds).toContain("occurrence:e.group");
    expect(foldedIds).not.toContain("occurrence:e.a");
    expect(cellTag(folded, "occurrence:e.group")).toContain('parent="1"');

    // Unfolded: contained children ride inside the container.
    expect(vertexIds(unfolded)).toContain("occurrence:e.a");
  });

  it("is byte-stable across calls", () => {
    const scene = resolve([]);
    expect(toDrawio(scene)).toBe(toDrawio(scene));
    expect(toDrawio(scene, { metadata: "carrier://x" })).toBe(toDrawio(scene, { metadata: "carrier://x" }));
  });

  it("round-trips opaque metadata untouched", () => {
    const scene = resolve([]);
    const payload = "carrier://alpha<>&\"q\"";
    const withMeta = toDrawio(scene, { metadata: payload });
    const match = withMeta.match(/<DiagramCodecsMetadata><!\[CDATA\[([\s\S]*?)\]\]><\/DiagramCodecsMetadata>/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(payload);

    const plain = toDrawio(scene);
    expect(plain).not.toContain("DiagramCodecsMetadata");
  });

  it("escapes titles", () => {
    const { document, presentation } = smallSceneInput();
    const tweaked = {
      ...presentation,
      entities: {
        ...presentation.entities,
        "occurrence:e.a": { form: "card", text: { title: 'Alpha & "Beta" <x>' }, anatomy: "v2" },
      },
    } as unknown as typeof presentation;
    const result = layoutScene({
      document,
      presentation: tweaked,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    if (result.status !== "laid-out") throw new Error("refused");
    const scene = resolveScene(result, { document, presentation: tweaked, measureLines });
    const xml = toDrawio(scene);
    expect(xml).toContain('value="Alpha &amp; &quot;Beta&quot; &lt;x&gt;"');
  });
});
