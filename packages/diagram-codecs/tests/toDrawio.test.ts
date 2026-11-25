/** Draw.io and SVG codec tests driven by the E1 projected-chain fixture on main. */
import {
  layoutScene,
  resolveScene,
  type SceneLayoutInput,
  type SceneModel,
  type SceneOccurrenceRef,
  type ScenePresentation,
} from "@sentropic/diagram-canvas/diagramSceneModel";
import { renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";
import { describe, expect, it } from "vitest";

import {
  PROJECTED_CHAIN_CARDS,
  PROJECTED_CHAIN_TARGET_WIDTH,
  PROJECTED_CHAIN_WINDOW_HEIGHT,
  PROJECTED_CHAIN_ZONES,
  projectedChainFixture,
} from "../../diagram-canvas/test-support/projectedChainFixture.js";
import { toDrawio, toSvg } from "../src/index.js";

function sceneInput(
  collapsed: readonly SceneOccurrenceRef[] = [],
  presentationOverride?: ScenePresentation,
): SceneLayoutInput {
  const fixture = projectedChainFixture();
  return {
    document: fixture.document,
    presentation: presentationOverride ?? fixture.presentation,
    registry: fixture.registry,
    bindings: fixture.bindings,
    measureLines: fixture.measureLines,
    hints: fixture.hints,
    targetWidth: PROJECTED_CHAIN_TARGET_WIDTH,
    collapsed: [...collapsed],
  };
}

function resolve(
  collapsed: readonly SceneOccurrenceRef[] = [],
  presentationOverride?: ScenePresentation,
): SceneModel {
  const input = sceneInput(collapsed, presentationOverride);
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result.refusals)}`);
  return resolveScene(result, input, {
    viewWidth: PROJECTED_CHAIN_TARGET_WIDTH,
    windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT,
  });
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

function cellAttr(xml: string, id: string, attr: string): string {
  const tag = cellTag(xml, id);
  const match = tag.match(new RegExp(`\\b${attr}="([^"]*)"`));
  expect(match, `missing ${attr} on ${id}`).not.toBeNull();
  return match![1]!;
}

/** Decode standard XML attribute character entities (simulates XML parsing of `value="..."`). */
function decodeXmlAttr(raw: string): string {
  return raw
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

/** Decode standard HTML text entities (simulates HTML label rendering when `html=1;`). */
function decodeHtmlText(raw: string): string {
  return raw
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

function cellGeometry(xml: string, id: string): { x: number; y: number; width: number; height: number } {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(
    new RegExp(
      `<mxCell id="${escaped}"[^>]*>\\s*<mxGeometry x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" as="geometry"/>`,
    ),
  );
  expect(match, `missing geometry for ${id}`).not.toBeNull();
  return {
    x: Number(match![1]),
    y: Number(match![2]),
    width: Number(match![3]),
    height: Number(match![4]),
  };
}

describe("toDrawio", () => {
  it("re-exports renderSceneSvg as toSvg and produces identical SVG on the E1 fixture", () => {
    expect(toSvg).toBe(renderSceneSvg);
    const input = sceneInput();
    const viaCodec = toSvg(input, { windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT });
    const viaCanvas = renderSceneSvg(input, { windowHeight: PROJECTED_CHAIN_WINDOW_HEIGHT });
    expect(viaCodec.svg).toBe(viaCanvas.svg);
  });

  it("emits an mxfile from the E1 fixture with nested zone containers, relative geometry, and kept ids", () => {
    const scene = resolve();
    const xml = toDrawio(scene);
    expect(xml).toContain("<mxfile ");
    expect(xml).toContain("</mxfile>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);

    const project = cellTag(xml, "occurrence:e.project");
    expect(project).toContain('vertex="1"');
    expect(project).toContain('parent="1"');
    expect(project).toContain("rounded=1");
    expect(project).toContain("container=1;");
    expect(project).toContain("collapsible=0;");
    expect(project).toContain("verticalAlign=top;");

    const workstream = cellTag(xml, "occurrence:e.workstream");
    expect(workstream).toContain('vertex="1"');
    expect(workstream).toContain('parent="occurrence:e.project"');
    expect(workstream).toContain("container=1;");
    expect(workstream).toContain("collapsible=0;");
    expect(workstream).toContain("verticalAlign=top;");

    const handoff = cellTag(xml, "occurrence:e.handoff");
    expect(handoff).toContain('parent="occurrence:e.project"');
    expect(handoff).not.toContain("container=1");
    expect(handoff).not.toContain("verticalAlign=top");

    for (const child of ["occurrence:e.parser", "occurrence:e.planner", "occurrence:e.renderer"]) {
      const card = cellTag(xml, child);
      expect(card).toContain('parent="occurrence:e.workstream"');
      expect(card).not.toContain("container=1");
      expect(card).not.toContain("verticalAlign=top");
    }

    const ids = vertexIds(xml);
    for (const id of [...PROJECTED_CHAIN_ZONES, ...PROJECTED_CHAIN_CARDS]) {
      expect(ids).toContain(`occurrence:e.${id}`);
    }

    // Child coordinates are emitted relative to their containing zone.
    const byId = new Map(scene.nodes.map((node) => [String(node.occurrence), node]));
    const projectNode = byId.get("occurrence:e.project")!;
    const workstreamNode = byId.get("occurrence:e.workstream")!;
    const parserNode = byId.get("occurrence:e.parser")!;
    expect(cellGeometry(xml, "occurrence:e.workstream")).toEqual({
      x: workstreamNode.rect.x - projectNode.rect.x,
      y: workstreamNode.rect.y - projectNode.rect.y,
      width: workstreamNode.rect.width,
      height: workstreamNode.rect.height,
    });
    expect(cellGeometry(xml, "occurrence:e.parser")).toEqual({
      x: parserNode.rect.x - workstreamNode.rect.x,
      y: parserNode.rect.y - workstreamNode.rect.y,
      width: parserNode.rect.width,
      height: parserNode.rect.height,
    });
  });

  it("keeps edge source and target ids, waypoints, and DE-2 registry style words", () => {
    const scene = resolve();
    const xml = toDrawio(scene);
    expect(scene.edges).toHaveLength(3);

    const feed = cellTag(xml, "occurrence:r.lnk-feed");
    expect(feed).toContain('edge="1"');
    expect(feed).toContain('source="occurrence:e.parser"');
    expect(feed).toContain('target="occurrence:e.planner"');
    expect(feed).toContain("orthogonalEdgeStyle");
    expect(feed).toContain("strokeColor=#0f172a;");
    expect(feed).toContain("strokeWidth=3.5;");
    expect(feed).toContain("endArrow=classic;");
    expect(feed).not.toContain("dashed=1");

    const drive = cellTag(xml, "occurrence:r.lnk-drive");
    expect(drive).toContain('source="occurrence:e.planner"');
    expect(drive).toContain('target="occurrence:e.renderer"');
    expect(drive).toContain("strokeColor=#001f33;");
    expect(drive).toContain("strokeWidth=3.5;");
    expect(drive).toContain("dashed=1;dashPattern=8 6;");
    expect(drive).toContain("endArrow=classic;");

    const handoff = cellTag(xml, "occurrence:r.lnk-handoff");
    expect(handoff).toContain('source="occurrence:e.parser"');
    expect(handoff).toContain('target="occurrence:e.handoff"');
    expect(handoff).toContain("strokeColor=#0f172a;");
    expect(handoff).toContain("strokeWidth=3.5;");
    expect(handoff).toContain("dashed=1;dashPattern=2 5;");
    expect(handoff).toContain("endArrow=none;");

    // Non-r7 v1 edges keep frozen #64748b and 2.5/3 widths byte-identical (REQ-R7-28).
    const v1Scene: SceneModel = {
      ...scene,
      r7Connectors: false,
      edges: scene.edges.map((edge) => {
        const { r7: _ignored, ...rest } = edge;
        return rest;
      }),
    };
    const v1Xml = toDrawio(v1Scene);
    const v1Feed = cellTag(v1Xml, "occurrence:r.lnk-feed");
    expect(v1Feed).toContain("strokeColor=#64748b;");
    expect(v1Feed).toContain("strokeWidth=2.5;");
    const v1Handoff = cellTag(v1Xml, "occurrence:r.lnk-handoff");
    expect(v1Handoff).toContain("strokeColor=#64748b;");
    expect(v1Handoff).toContain("strokeWidth=3;");

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

  it("exports unfolded, inner-folded, and outer-folded E1 states, all valid", () => {
    const fixture = projectedChainFixture();
    const unfolded = toDrawio(resolve([]));
    const innerFolded = toDrawio(resolve([fixture.foldOccurrence]));
    const outerFolded = toDrawio(resolve([fixture.outerFoldOccurrence]));

    for (const xml of [unfolded, innerFolded, outerFolded]) {
      expect(xml).toContain("<mxfile ");
      expect(xml.endsWith("</mxfile>\n")).toBe(true);
      expect(xml.match(/<mxCell /g)!.length).toBeGreaterThan(2);
    }

    // Inner folded: workstream is an atomic box under project, its children absent, handoff kept.
    const innerIds = vertexIds(innerFolded);
    expect(innerIds).toContain("occurrence:e.project");
    expect(innerIds).toContain("occurrence:e.workstream");
    expect(innerIds).toContain("occurrence:e.handoff");
    expect(innerIds).not.toContain("occurrence:e.parser");
    const innerProject = cellTag(innerFolded, "occurrence:e.project");
    expect(innerProject).toContain("container=1;");
    expect(innerProject).toContain("collapsible=0;");
    expect(innerProject).toContain("verticalAlign=top;");
    const innerWorkstream = cellTag(innerFolded, "occurrence:e.workstream");
    expect(innerWorkstream).toContain('parent="occurrence:e.project"');
    expect(innerWorkstream).not.toContain("container=1");
    expect(innerWorkstream).not.toContain("verticalAlign=top");

    // Outer folded: project is a single atomic box at root, nested zone and cards absent.
    const outerIds = vertexIds(outerFolded);
    expect(outerIds).toEqual(["occurrence:e.project"]);
    const outerProject = cellTag(outerFolded, "occurrence:e.project");
    expect(outerProject).toContain('parent="1"');
    expect(outerProject).not.toContain("container=1");
    expect(outerProject).not.toContain("verticalAlign=top");

    // Unfolded: nested cards ride inside workstream.
    expect(vertexIds(unfolded)).toContain("occurrence:e.parser");
  });

  it("is byte-stable across calls", () => {
    const scene = resolve();
    expect(toDrawio(scene)).toBe(toDrawio(scene));
    expect(toDrawio(scene, { metadata: "carrier://x" })).toBe(toDrawio(scene, { metadata: "carrier://x" }));
  });

  it("round-trips opaque metadata untouched", () => {
    const scene = resolve();
    const payload = "carrier://alpha<>&\"q\"";
    const withMeta = toDrawio(scene, { metadata: payload });
    const match = withMeta.match(/<DiagramCodecsMetadata><!\[CDATA\[([\s\S]*?)\]\]><\/DiagramCodecsMetadata>/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(payload);

    const plain = toDrawio(scene);
    expect(plain).not.toContain("DiagramCodecsMetadata");
  });

  it("escapes HTML-unsafe titles for draw.io html=1 labels and applies category tints on the E1 presentation", () => {
    const fixture = projectedChainFixture();
    const parserTitle = 'Parser & "Planner" <x>';
    const plannerTitle = "A < B &lt;raw&gt;";
    const rendererTitle = "<img src=x onerror=alert(1)>";
    const tweaked = {
      ...fixture.presentation,
      entities: {
        ...fixture.presentation.entities,
        "occurrence:e.parser": {
          ...fixture.presentation.entities["occurrence:e.parser"]!,
          text: { title: parserTitle, body: "Reads the note" },
          categoryRef: "blue",
        },
        "occurrence:e.planner": {
          ...fixture.presentation.entities["occurrence:e.planner"]!,
          text: { title: plannerTitle, body: "Plans steps" },
          categoryRef: "green",
        },
        "occurrence:e.renderer": {
          ...fixture.presentation.entities["occurrence:e.renderer"]!,
          text: { title: rendererTitle, body: "Renders output" },
          categoryRef: "custom-category",
        },
      },
    } as unknown as ScenePresentation;

    const xml = toDrawio(resolve([], tweaked));
    expect(xml).toContain('value="Parser &amp;amp; &quot;Planner&quot; &amp;lt;x&amp;gt;"');

    for (const [id, expectedText] of [
      ["occurrence:e.parser", parserTitle],
      ["occurrence:e.planner", plannerTitle],
      ["occurrence:e.renderer", rendererTitle],
    ] as const) {
      const style = cellAttr(xml, id, "style");
      expect(style).toContain("html=1;");
      const xmlParsedValue = decodeXmlAttr(cellAttr(xml, id, "value"));
      // After XML attribute parsing, mxCell.value is handed to draw.io's HTML label renderer:
      // no raw `<` or `>` may survive, and `&...;` in input must stay escaped so it renders literally.
      expect(xmlParsedValue).not.toContain("<");
      expect(xmlParsedValue).not.toContain(">");
      expect(decodeHtmlText(xmlParsedValue)).toBe(expectedText);
    }

    expect(cellTag(xml, "occurrence:e.parser")).toContain("fillColor=#e3f2fd;");
    expect(cellTag(xml, "occurrence:e.planner")).toContain("fillColor=#e8f5e9;");
    expect(cellTag(xml, "occurrence:e.renderer")).toMatch(/fillColor=#[0-9a-f]{6};/);
    expect(cellTag(xml, "occurrence:e.handoff")).toContain("fillColor=#ffffff;");
  });
});
