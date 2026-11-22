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

    const workstream = cellTag(xml, "occurrence:e.workstream");
    expect(workstream).toContain('vertex="1"');
    expect(workstream).toContain('parent="occurrence:e.project"');
    expect(cellTag(xml, "occurrence:e.handoff")).toContain('parent="occurrence:e.project"');

    for (const child of ["occurrence:e.parser", "occurrence:e.planner", "occurrence:e.renderer"]) {
      expect(cellTag(xml, child)).toContain('parent="occurrence:e.workstream"');
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
    expect(feed).toContain("strokeWidth=2.5;");
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
    expect(handoff).toContain("strokeWidth=3;");
    expect(handoff).toContain("dashed=1;dashPattern=2 5;");
    expect(handoff).toContain("endArrow=none;");

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
    expect(cellTag(innerFolded, "occurrence:e.workstream")).toContain('parent="occurrence:e.project"');

    // Outer folded: project is a single atomic box at root, nested zone and cards absent.
    const outerIds = vertexIds(outerFolded);
    expect(outerIds).toEqual(["occurrence:e.project"]);
    expect(cellTag(outerFolded, "occurrence:e.project")).toContain('parent="1"');

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

  it("escapes titles and applies category tints on the E1 presentation", () => {
    const fixture = projectedChainFixture();
    const tweaked = {
      ...fixture.presentation,
      entities: {
        ...fixture.presentation.entities,
        "occurrence:e.parser": {
          ...fixture.presentation.entities["occurrence:e.parser"]!,
          text: { title: 'Parser & "Planner" <x>', body: "Reads the note" },
          categoryRef: "blue",
        },
        "occurrence:e.planner": {
          ...fixture.presentation.entities["occurrence:e.planner"]!,
          categoryRef: "green",
        },
        "occurrence:e.renderer": {
          ...fixture.presentation.entities["occurrence:e.renderer"]!,
          categoryRef: "custom-category",
        },
      },
    } as unknown as ScenePresentation;

    const xml = toDrawio(resolve([], tweaked));
    expect(xml).toContain('value="Parser &amp; &quot;Planner&quot; &lt;x&gt;"');
    expect(cellTag(xml, "occurrence:e.parser")).toContain("fillColor=#e3f2fd;");
    expect(cellTag(xml, "occurrence:e.planner")).toContain("fillColor=#e8f5e9;");
    expect(cellTag(xml, "occurrence:e.renderer")).toMatch(/fillColor=#[0-9a-f]{6};/);
    expect(cellTag(xml, "occurrence:e.handoff")).toContain("fillColor=#ffffff;");
  });
});
