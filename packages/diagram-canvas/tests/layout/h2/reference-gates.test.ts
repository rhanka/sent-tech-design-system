import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  ASPECT_16_9_TARGET,
  ASPECT_16_9_TOLERANCE,
  createLayoutCache,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
} from "../../../src/index.js";
import { connectorPath } from "../../../src/presentation/connectorPath.js";
import { connectorStrokeWidth } from "../../../src/presentation/connectorStyle.js";
import { resolveScene } from "../../../src/presentation/diagramSceneModel.js";
import {
  H2_OVERLAY_CATALOG,
  measureH2SceneResiduals,
} from "../../../test-support/h2ReferenceFixtures.js";
import {
  connectorFindings,
  exposedSegments,
  legendFindings,
  linkStrokeWidthFindings,
  roundedElbowFindings,
  segmentInterval,
} from "../../../../../tools/diagram-first-paint/geometry.mjs";
import {
  buildAll13ReferenceScenes,
  buildAppctxArchitecture16x9,
  buildExampleA,
  buildExampleB,
  enumerateVisibleFoldStates,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

const TOL = 1 / 64;

function baseOptionsOf(scene: H2ReferenceScene, extra?: Partial<LayoutOptions>): LayoutOptions {
  return {
    registry: scene.registry,
    bindings: scene.bindings,
    presentation: scene.presentation,
    measureLines: scene.measureLines,
    measureText: () => ({ width: 80, height: 20 }),
    targetWidth: 1440,
    hints: scene.hints,
    ...extra,
  };
}

function mustLayOut(res: LayoutResult, label: string): Extract<LayoutResult, { status: "laid-out" }> {
  expect(res.status, label).toBe("laid-out");
  if (res.status !== "laid-out") throw new Error(`refused ${label}: ${JSON.stringify(res.refusals)}`);
  return res;
}

function segmentDistance(
  box: { left: number; top: number; right: number; bottom: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  if (segmentInterval(box, a, b) !== undefined) return 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const pointToBox = (p: { x: number; y: number }) =>
    Math.hypot(Math.max(box.left - p.x, 0, p.x - box.right), Math.max(box.top - p.y, 0, p.y - box.bottom));
  const pointToSegment = (x: number, y: number) => {
    const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - a.x - t * dx, y - a.y - t * dy);
  };
  return Math.min(
    pointToBox(a),
    pointToBox(b),
    ...[box.left, box.right].flatMap((x) => [box.top, box.bottom].map((y) => pointToSegment(x, y))),
  );
}

describe("H2.9 final reference scenes, residual measurements (T-09, T-49/T-50, T-37, T-45), and full-corpus gates", () => {
  it("catalogues all 14 H2 reference scenes with valid T-rows and NE-1..NE-9 residual tags and zero client content", () => {
    const scenes = [...buildAll13ReferenceScenes(), buildAppctxArchitecture16x9()];
    const ids = new Set(scenes.map((s) => s.id));
    expect(H2_OVERLAY_CATALOG).toHaveLength(14);
    for (const meta of H2_OVERLAY_CATALOG) {
      expect(ids.has(meta.id), meta.id).toBe(true);
      expect(meta.carries.length, meta.id).toBeGreaterThan(0);
      expect(meta.residuals.length, meta.id).toBeGreaterThan(0);
    }
    const neCovered = new Set(H2_OVERLAY_CATALOG.flatMap((m) => m.residuals.map((r) => r.ne)));
    for (const ne of ["NE-1", "NE-2", "NE-3", "NE-4", "NE-5", "NE-6", "NE-7", "NE-8", "NE-9"]) {
      expect(neCovered.has(ne), ne).toBe(true);
    }
  });

  it("BLOCKING H2.9 GATE: conflicts === 0, label-unplaced === 0, and route-obstructed === 0 across ALL 14 reference scenes and ALL 108 visible fold states", () => {
    const finalReferenceSet: readonly H2ReferenceScene[] = [
      ...buildAll13ReferenceScenes(),
      buildAppctxArchitecture16x9(),
    ];
    let totalStates = 0;
    const failures: string[] = [];

    for (const scene of finalReferenceSet) {
      const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
      const cache = createLayoutCache({ maxEntries: 128 });
      for (const collapsed of states) {
        totalStates += 1;
        const laid = mustLayOut(
          cache.layout(scene.document, baseOptionsOf(scene, { collapsed }), scene.sourceView),
          `${scene.id}[${collapsed.join(",")}]`,
        );
        const m = measureH2SceneResiduals(scene.id, laid);
        if (m.conflictCount > 0 || m.unplacedLabelCount > 0 || m.obstructedCount > 0) {
          failures.push(
            `${scene.id}[${collapsed.join(",")}]: conflicts=${m.conflictCount} (${laid.routeSpacing?.conflicts.map((c) => `${c.kind}:${c.routes.join("+")}`).join("; ") ?? ""}) label-unplaced=${m.unplacedLabelCount} obstructed=${m.obstructedCount}`,
          );
        }
      }
    }

    expect(totalStates).toBe(108);
    expect(failures, failures.join("\n")).toEqual([]);
  }, 90_000);

  it("re-runs the H2.6 16:9 ratio gate on the final 16:9 reference scene (appctx-architecture, R-7)", () => {
    const scene = buildAppctxArchitecture16x9();
    const laid = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [] }), scene.sourceView), "16:9");
    const m = measureH2SceneResiduals(scene.id, laid);
    expect(Math.abs(m.aspectRatio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(laid.warnings.filter((w) => w.code === "aspect-unreached")).toHaveLength(0);
    expect(m.conflictCount).toBe(0);
    expect(m.unplacedLabelCount).toBe(0);
  });

  it("measures T-09 (schema-3), T-49/T-50 (ref-3), T-37 (ref-1), and T-45 (ref-2) residuals quantitatively", () => {
    const all13 = new Map(buildAll13ReferenceScenes().map((s) => [s.id, s]));

    // T-09 (r7 schema 3 / Example B): ax centred exactly on s1..s2 midpoint (0 world residual vs +0.805% capture offset)
    const s3 = all13.get("schema-3")!;
    const m3 = measureH2SceneResiduals("schema-3", mustLayOut(layoutMeasured(s3.document, baseOptionsOf(s3)), "schema-3"));
    expect(m3.t09).toBeDefined();
    expect(Math.abs(m3.t09!.deltaX)).toBeLessThanOrEqual(TOL);
    expect(m3.t09!.r7CaptureOffsetPct).toBeCloseTo(0.805, 2);

    // T-49 & T-50 (ref 3): path stays centred on 6-source stack; sink aligns to path-s5 on s5 and stays inside l1..l6
    const r3 = all13.get("ref-3")!;
    const mr3 = measureH2SceneResiduals("ref-3", mustLayOut(layoutMeasured(r3.document, baseOptionsOf(r3)), "ref-3"));
    expect(mr3.t49AndT50).toBeDefined();
    expect(Math.abs(mr3.t49AndT50!.t49DeltaY)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(mr3.t49AndT50!.t50DeltaX)).toBeLessThanOrEqual(TOL);
    expect(mr3.t49AndT50!.sinkBottomInsideStack).toBe(true);
    expect(mr3.t49AndT50!.sinkTopGapBelowPath).toBeGreaterThan(0);
    expect(Math.abs(mr3.t49AndT50!.t50DeltaFromL5L6CenterY)).toBeLessThanOrEqual(TOL);

    // T-37 (ref 1, NE-1): root sources vs host local triggers vertical drift measured per lane
    const r1 = all13.get("ref-1")!;
    const mr1 = measureH2SceneResiduals("ref-1", mustLayOut(layoutMeasured(r1.document, baseOptionsOf(r1)), "ref-1"));
    expect(mr1.t37).toBeDefined();
    expect(mr1.t37).toHaveLength(4);
    for (const lane of mr1.t37!) {
      expect(Number.isFinite(lane.deltaY)).toBe(true);
    }

    // T-45 (ref 2, NE-4): column 4 cards align on tiers 1, 2, 3 (delta 0 on each tier)
    const r2 = all13.get("ref-2")!;
    const mr2 = measureH2SceneResiduals("ref-2", mustLayOut(layoutMeasured(r2.document, baseOptionsOf(r2)), "ref-2"));
    expect(mr2.t45).toBeDefined();
    expect(Math.abs(mr2.t45!.tierDeltaTop)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(mr2.t45!.tierDeltaMid)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(mr2.t45!.tierDeltaThird)).toBeLessThanOrEqual(TOL);
  });

  it("verifies all browser first-paint geometry invariants on Examples A, B, and 16:9 (connectors, rounded elbows, widths, legend, label clearance)", () => {
    const cases: readonly {
      readonly name: string;
      readonly scene: H2ReferenceScene;
      readonly expectR7: boolean;
      readonly expectedAnchor?: "free-cell" | "right";
      readonly expectedStyles?: readonly string[];
      readonly expectAspect16x9?: boolean;
    }[] = [
      {
        name: "h2-example-a",
        scene: buildExampleA(),
        expectR7: true,
        expectedAnchor: "free-cell",
        expectedStyles: ["solid:arrow:default", "solid:arrow:emphasis", "dashed:arrow:default"],
      },
      {
        name: "h2-example-b",
        scene: buildExampleB(),
        expectR7: true,
        expectedAnchor: "right",
        expectedStyles: ["solid:arrow:default", "dashed:arrow:default"],
      },
      {
        name: "h2-aspect-16-9",
        scene: buildAppctxArchitecture16x9(),
        expectR7: false,
        expectAspect16x9: true,
      },
    ];

    for (const item of cases) {
      const laid = mustLayOut(
        layoutMeasured(item.scene.document, baseOptionsOf(item.scene, { collapsed: [] }), item.scene.sourceView),
        item.name,
      );
      const resolved = resolveScene(laid, {
        document: item.scene.document,
        presentation: item.scene.presentation,
        measureLines: item.scene.measureLines,
      });
      expect(resolved.r7Connectors, `${item.name}:r7`).toBe(item.expectR7);

      const nodes = resolved.nodes.map((n) => ({
        id: String(n.occurrence),
        left: n.rect.x,
        top: n.rect.y,
        right: n.rect.x + n.rect.width,
        bottom: n.rect.y + n.rect.height,
      }));
      const occluders = [
        ...resolved.nodes
          .filter((n) => n.kind !== "zone")
          .map((n) => ({ left: n.rect.x + 8, top: n.rect.y + 8, right: n.rect.x + n.rect.width - 8, bottom: n.rect.y + n.rect.height - 8 })),
        ...resolved.connectorCutouts.map((c) => ({ left: c.x, top: c.y, right: c.x + c.width, bottom: c.y + c.height })),
      ];
      const paths = resolved.edges.map((e) => {
        const sw = resolved.r7Connectors ? connectorStrokeWidth(e) : 1.5;
        return {
          id: String(e.occurrence),
          d: connectorPath(e.points, resolved.r7Connectors ? 12 : 0),
          stroke: sw / 2,
          strokeWidthCss: sw,
          emphasis: e.emphasis ?? "default",
          arrowhead: e.arrowhead ?? "arrow",
          flow: false,
          erd: false,
          points: e.points.map((p) => ({ x: p.x, y: p.y })),
        };
      });
      const connectorLabels = resolved.labels.map((l) => String(l.occurrence));

      expect(
        connectorFindings({ paths, labels: connectorLabels, nodes, occluders, tolerance: 1 }),
        `${item.name}:connectors`,
      ).toEqual([]);
      if (item.expectR7) {
        expect(roundedElbowFindings({ paths, maxRadius: 12 }), `${item.name}:elbows`).toEqual([]);
        expect(linkStrokeWidthFindings({ paths }), `${item.name}:widths`).toEqual([]);
      }

      if (item.expectedStyles !== undefined && item.expectedAnchor !== undefined) {
        const legend =
          resolved.linkLegend === undefined
            ? null
            : {
                id: "legend",
                left: resolved.linkLegend.rect.x,
                top: resolved.linkLegend.rect.y,
                right: resolved.linkLegend.rect.x + resolved.linkLegend.rect.width,
                bottom: resolved.linkLegend.rect.y + resolved.linkLegend.rect.height,
                anchor: resolved.linkLegend.anchor,
                styles: resolved.linkLegend.entries.map((e) => e.key),
              };
        expect(
          legendFindings({
            legend,
            nodes,
            expectedAnchor: item.expectedAnchor,
            expectedStyles: [...item.expectedStyles],
          }),
          `${item.name}:legend`,
        ).toEqual([]);
      } else {
        expect(resolved.linkLegend, `${item.name}:no-legend`).toBeUndefined();
      }

      if (item.expectAspect16x9 === true) {
        expect(resolved.bounds, `${item.name}:bounds`).toBeDefined();
        const ratio = resolved.bounds!.width / resolved.bounds!.height;
        expect(Math.abs(ratio / ASPECT_16_9_TARGET - 1), `${item.name}:ratio=${ratio.toFixed(4)}`).toBeLessThanOrEqual(
          ASPECT_16_9_TOLERANCE,
        );
      }

      // Verify edge label & expanded-zone header clearance >= 4 world units (labelPadding token at scale 1, matching browser.mjs)
      const visiblePaths = paths.map((p) => ({
        ...p,
        segments: p.points.slice(1).flatMap((pt, i) => exposedSegments(p.points[i]!, pt, occluders, p.stroke)),
      }));
      const clearanceDefects: string[] = [];
      for (const lbl of resolved.labels) {
        const box = {
          left: lbl.box.x,
          top: lbl.box.y,
          right: lbl.box.x + lbl.box.width,
          bottom: lbl.box.y + lbl.box.height,
        };
        for (const p of visiblePaths) {
          for (const [a, b] of p.segments) {
            const dist = segmentDistance(box, a, b) - p.stroke;
            if (dist + TOL < 4) {
              clearanceDefects.push(`${lbl.occurrence} vs ${p.id}: dist=${dist.toFixed(2)} < 4`);
            }
          }
        }
      }
      for (const node of resolved.nodes) {
        if (node.kind !== "zone" || node.collapsed) continue;
        // Expanded zone frames paint behind connectors, so header text must stay clear of visible connector segments.
        const headerBox = {
          left: node.rect.x + 16,
          top: node.rect.y + 8,
          right: node.rect.x + node.rect.width - 56,
          bottom: node.rect.y + 56,
        };
        for (const p of visiblePaths) {
          for (const [a, b] of p.segments) {
            const dist = segmentDistance(headerBox, a, b) - p.stroke;
            if (dist + TOL < 4) {
              clearanceDefects.push(`zone-header(${node.occurrence}) vs ${p.id}: dist=${dist.toFixed(2)} < 4`);
            }
          }
        }
      }
      expect(clearanceDefects, `${item.name}:label-clearance`).toEqual([]);
    }
  });

  it("keeps @1 schema and anatomy contracts untouched (REQ-R7-28)", () => {
    const v1Schema = readFileSync(new URL("../../../../diagram-core/schemas/ds-layout-hints-1.json", import.meta.url), "utf8");
    expect(v1Schema).toContain("ds-layout-hints@1");
    expect(v1Schema).not.toContain("ds-layout-hints@2");
  });
});
