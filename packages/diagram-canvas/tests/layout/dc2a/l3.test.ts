/**
 * DC-2a L3 — fold, zoom-invariance and #203 gates on the ten scenes
 * (SPEC_EVOL_DC2A §6.5, §7.3, §9.2; AC-7, AC-8, AC-9, AC-15, AC-21).
 */
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { formatDiagnostics, m3ProfileRegistry, serialiseView, shippedExecutorBindings, validateView } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { DEFAULT_LAYOUT_METRICS, DEFAULT_ROW_GAP_MAX } from "../../../src/index.js";
import { sceneDigests } from "./digest.js";
import { GAP_TOLERANCE, siblingGaps, unplacedLabels } from "./rowpack-metrics.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf, type CaseId, type SceneLayout } from "./scenes.js";

const STABILITY = new URL("./stability.json", import.meta.url);

const views = CASE_IDS.flatMap((caseId) => viewNamesOf(caseId).map((viewName) => ({ key: `${caseId}/${viewName}`, caseId, viewName })));
const lay = (caseId: CaseId, viewName: string, extra: Parameters<typeof layScene>[1] = {}): SceneLayout => {
  const input = sceneInput(caseId, viewName);
  return layScene(input, extra, { rootOrder: input.rootOrder });
};
const layouts = new Map(views.map((view) => [view.key, lay(view.caseId, view.viewName)] as const));
const short = (id: string): string => id.replace("occurrence:r.link.", "");

/** Lettered cases: their views are fold states of one dossier (§6.5). Transition scenes are separate source views. */
const FOLD_CASES: readonly CaseId[] = ["case-a", "case-b", "case-c", "case-d", "case-skills-r9", "case-integration-r9", "case-trackfocus-r9"];
const TRANSITION_CASES: readonly CaseId[] = ["vue-globale", "ajout-preprod", "migration-cluster-mesh"];

/** Everything a layout emits except the camera: zoom is a transform, never an input of geometry. */
const geometryBytes = (layout: SceneLayout): string =>
  JSON.stringify([
    [...layout.rects],
    layout.routes.map((route) => [route.id, route.points]),
    [...layout.labelBoxes],
    Object.entries(layout.orientations),
    layout.warnings,
  ]);

describe("DC-2a L3 zoom invariance (D-1, D-3, Z-6, AC-15)", () => {
  it("the target width never re-packs a measured view: rectangles, routes, labels and orientations are identical at any width", () => {
    for (const view of views) {
      const reference = geometryBytes(layouts.get(view.key)!);
      const zooms = new Set<number>();
      for (const targetWidth of [360, 8000]) {
        const layout = lay(view.caseId, view.viewName, { targetWidth });
        expect(geometryBytes(layout), `${view.key} at ${String(targetWidth)}`).toBe(reference);
        zooms.add(layout.view.presentation.camera.zoom);
        // The whole view differs by its camera only.
        const sameCamera = { ...layout.view, presentation: { ...layout.view.presentation, camera: layouts.get(view.key)!.view.presentation.camera } };
        expect(serialiseView(sameCamera)).toBe(serialiseView(layouts.get(view.key)!.view));
      }
      // The layout fit report does vary with the width; the geometry above does not.
      if (view.key === "vue-globale/after") expect(zooms.size).toBeGreaterThan(1);
    }
  }, 240_000);
});

describe("DC-2a L3 fold stability (S-1, S-2, AC-8)", () => {
  interface Toggle {
    /** Occurrences visible in both states. */
    readonly common: number;
    /** Those whose rectangle changed, in `cards[]` order (S-2: exactly these). */
    readonly moved: readonly string[];
  }
  const toggles = (): Record<string, Toggle> => {
    const out: Record<string, Toggle> = {};
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      for (let index = 1; index < names.length; index += 1) {
        const a = layouts.get(`${caseId}/${names[index - 1]!}`)!;
        const b = layouts.get(`${caseId}/${names[index]!}`)!;
        const common = a.input.visible.filter((id) => b.rects.has(id));
        const moved = common.filter((id) => JSON.stringify(a.rects.get(id)) !== JSON.stringify(b.rects.get(id)));
        out[`${caseId} ${names[index - 1]!} → ${names[index]!}`] = { common: common.length, moved };
      }
    }
    return out;
  };

  it("S-2: a fold toggle moves exactly the pinned occurrences", () => {
    const computed = toggles();
    if (process.env["DC2A_WRITE_AFTER"] === "1") writeFileSync(STABILITY, `${JSON.stringify(computed, null, 2)}\n`);
    expect(computed).toEqual(JSON.parse(readFileSync(STABILITY, "utf8")));
    expect(Object.keys(computed)).toHaveLength(12);
  });

  it("S-1: an occurrence outside the toggled zone, its descendants and its ancestors' levels stays put", () => {
    // A level is untouched when the toggled container is neither in it nor
    // under it: its siblings keep their offsets to one another.
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      for (let index = 1; index < names.length; index += 1) {
        const a = layouts.get(`${caseId}/${names[index - 1]!}`)!;
        const b = layouts.get(`${caseId}/${names[index]!}`)!;
        const folded = new Set(a.input.cards.filter((card) => card.folded !== b.input.cards.find((other) => other.id === card.id)?.folded).map((card) => card.id));
        const touches = (level: string | undefined): boolean => {
          // The level holds a toggled container or one of its ancestors.
          for (const id of folded) {
            for (let current: string | undefined = id; current !== undefined; current = a.input.cards.find((card) => card.id === current)?.parentId ?? undefined) {
              if ((a.input.cards.find((card) => card.id === current)?.parentId ?? undefined) === level) return true;
            }
          }
          return false;
        };
        const levels = new Map<string | undefined, string[]>();
        for (const id of a.input.visible) {
          if (!b.rects.has(id)) continue;
          const level = a.parentOf.get(id);
          (levels.get(level) ?? levels.set(level, []).get(level)!).push(id);
        }
        for (const [level, members] of levels) {
          if (touches(level) || (level !== undefined && [...folded].some((id) => id === level))) continue;
          const origin = members[0]!;
          for (const id of members) {
            const before = { x: a.rects.get(id)!.x - a.rects.get(origin)!.x, y: a.rects.get(id)!.y - a.rects.get(origin)!.y };
            const after = { x: b.rects.get(id)!.x - b.rects.get(origin)!.x, y: b.rects.get(id)!.y - b.rects.get(origin)!.y };
            // BLK-1 / S-1: 0 px — gutter-widening probes are scoped per level,
            // so folding inside P cannot alter gutters inside Q.
            expect(Math.abs(after.x - before.x), `${caseId} ${names[index]!} ${id} x`).toBe(0);
            expect(Math.abs(after.y - before.y), `${caseId} ${names[index]!} ${id} y`).toBe(0);
          }
        }
      }
    }
  });

  it("AC-20: transition scenes are four separate layout calls, each gated on its own", () => {
    for (const caseId of TRANSITION_CASES) {
      expect(viewNamesOf(caseId)).toEqual(["before", "intermediate", "after", "folded"]);
      for (const viewName of viewNamesOf(caseId)) {
        const layout = layouts.get(`${caseId}/${viewName}`)!;
        // No level of any step re-stacks in one column, and every gap holds the cap.
        for (const gap of siblingGaps(layout)) expect(gap.gap, `${caseId}/${viewName} ${gap.level}`).toBeLessThanOrEqual(DEFAULT_ROW_GAP_MAX + GAP_TOLERANCE);
        expect(layout.rects.size).toBe(layout.input.visible.length);
      }
    }
  });
});

describe("DC-2a L3 label gate (AC-21, DEC-3, DEC-6)", () => {
  // BLK-1: no misses bypass — AC-21 requires zero unplaced on all 31 views.

  it("no label box covers a card, a collapsed box, a title band or another label, on any of the 31 views", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      const margin = DEFAULT_LAYOUT_METRICS.labelMargin;
      const shapes = [...layout.input.leaves.map((id) => layout.rects.get(id)!), ...layout.titleBands.values()];
      const boxes = [...layout.labelBoxes];
      boxes.forEach(([id, box], index) => {
        const padded = { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
        const hits = (rect: { x: number; y: number; width: number; height: number }): boolean =>
          rect.x < padded.x + padded.width && padded.x < rect.x + rect.width && rect.y < padded.y + padded.height && padded.y < rect.y + rect.height;
        // The label margin is kept clear of every shape and of every other label.
        expect(shapes.some(hits), `${view.key} ${short(id)} over a shape`).toBe(false);
        for (const [other, otherBox] of boxes.slice(index + 1)) expect(hits(otherBox), `${view.key} ${short(id)} over ${short(other)}`).toBe(false);
      });
    }
  });

  it("every placed label sits on its own route", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      for (const route of layout.routes) {
        const box = layout.labelBoxes.get(route.id);
        if (box === undefined) continue;
        const onRoute = route.points.slice(1).some((point, index) => {
          const from = route.points[index]!;
          return (
            Math.min(from.x, point.x) <= box.x + box.width &&
            box.x <= Math.max(from.x, point.x) &&
            Math.min(from.y, point.y) <= box.y + box.height &&
            box.y <= Math.max(from.y, point.y)
          );
        });
        expect(onRoute, `${view.key} ${short(route.id)}`).toBe(true);
      }
    }
  });

  it("AC-21: zero label-unplaced on every acceptance view (DEC-3, §7.3, §10 L3)", () => {
    const unplaced = views.flatMap((view) => unplacedLabels(layouts.get(view.key)!).map((label) => ({ view: view.key, ...label })));
    // BLK-1: hard gate — no bypass list. Any unplaced label fails by name.
    expect(unplaced.map((label) => `${label.view} ${short(label.id)}${label.container === undefined ? "" : ` (in ${label.container})`}`)).toEqual([]);
    // Never a wider gutter to pass (DEC-6): every sibling gap holds the cap.
    for (const view of views) {
      for (const gap of siblingGaps(layouts.get(view.key)!)) expect(gap.gap, `${view.key} ${gap.level}`).toBeLessThanOrEqual(DEFAULT_ROW_GAP_MAX + GAP_TOLERANCE);
    }
  });
});

describe("DC-2a L3 #203 wiring (W-1–W-6, AC-9, AC-10)", () => {
  it("W-6: every view passes validateView with zero diagnostics", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      const diagnostics = validateView(layout.view, layout.input.document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings });
      expect(formatDiagnostics(diagnostics), view.key).toBe("");
    }
  }, 120_000);

  it("W-1/W-2/W-3: only visible occurrences take geometry; a relation hidden under a fold draws nothing; a projected one docks on the collapsed box", () => {
    let hidden = 0;
    let projected = 0;
    // The exported folded views already carry projected edges. To exercise the
    // engine's own projection, each container of an unfolded view is folded in
    // turn with the edges of the unfolded view kept.
    const folds = FOLD_CASES.flatMap((caseId) => {
      const viewName = viewNamesOf(caseId)[0]!;
      const containers = sceneInput(caseId, viewName).cards.filter((card) => card.container && !card.folded);
      return containers.map((card) => ({ key: `${caseId}/${viewName} + ${card.id}`, input: sceneInput(caseId, viewName, [card.id]) }));
    });
    expect(folds.length).toBeGreaterThan(10);
    for (const view of folds) {
      const layout = layScene(view.input, {}, { rootOrder: view.input.rootOrder });
      expect(formatDiagnostics(validateView(layout.view, view.input.document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })), view.key).toBe("");
      const visible = new Set(layout.input.visible);
      const byId = new Map(layout.input.cards.map((card) => [card.id, card] as const));
      /** The visible box an end is drawn on: itself, or its nearest collapsed ancestor. */
      const representative = (id: string): string => {
        let current = id;
        while (!visible.has(current)) current = byId.get(current)!.parentId!;
        return current;
      };
      // W-1: exactly the visible occurrences are placed (asserted by layScene) and no hidden one has a rectangle.
      expect([...layout.rects.keys()].sort()).toEqual([...visible].sort());
      for (const link of layout.input.links) {
        const source = representative(link.source);
        const target = representative(link.target);
        const route = layout.routes.find((candidate) => candidate.id === `occurrence:r.link.${link.id}`
          || layout.bundles?.[candidate.id]?.members.includes(`occurrence:r.link.${link.id}`));
        if (source === target) {
          // W-2: internal to one collapsed box — no route, no label, no space.
          hidden += 1;
          expect(route, `${view.key} ${link.id}`).toBeUndefined();
          expect(layout.labelBoxes.has(`occurrence:r.link.${link.id}`)).toBe(false);
          continue;
        }
        expect(route, `${view.key} ${link.id}`).toBeDefined();
        if (source !== link.source || target !== link.target) {
          // W-3: a projected end docks on the representative rectangle.
          projected += 1;
          const ends = [route!.points[0]!, route!.points[route!.points.length - 1]!];
          const onBorder = (point: { x: number; y: number }, id: string): boolean => {
            const rect = layout.rects.get(id)!;
            const inside = point.x >= rect.x - 0.5 && point.x <= rect.x + rect.width + 0.5 && point.y >= rect.y - 0.5 && point.y <= rect.y + rect.height + 0.5;
            const edge = Math.min(Math.abs(point.x - rect.x), Math.abs(point.x - rect.x - rect.width), Math.abs(point.y - rect.y), Math.abs(point.y - rect.y - rect.height));
            return inside && edge <= 0.5;
          };
          expect(onBorder(ends[0]!, source) || onBorder(ends[1]!, source), `${view.key} ${link.id} source`).toBe(true);
          expect(onBorder(ends[0]!, target) || onBorder(ends[1]!, target), `${view.key} ${link.id} target`).toBe(true);
        }
      }
    }
    expect(hidden).toBeGreaterThan(0);
    expect(projected).toBeGreaterThan(0);
  }, 120_000);

  it("W-5: unfolding recomputes from the retained source — a state reached through a fold is the state laid out directly", () => {
    for (const caseId of FOLD_CASES) {
      const names = viewNamesOf(caseId);
      const direct = serialiseView(layouts.get(`${caseId}/${names[0]!}`)!.view);
      // Lay the folded state, then the first state again: nothing of the fold survives.
      lay(caseId, names[names.length - 1]!);
      expect(serialiseView(lay(caseId, names[0]!).view), caseId).toBe(direct);
    }
  });

  it("AC-10: cards and collapsed zones keep their width and content height in every fold state", () => {
    for (const view of views) {
      const layout = layouts.get(view.key)!;
      for (const id of layout.input.leaves) {
        const rect = layout.rects.get(id)!;
        expect(rect.width, `${view.key} ${id}`).toBe(460);
        expect(rect.height, `${view.key} ${id}`).toBeGreaterThanOrEqual(200);
      }
    }
  });
});

describe("DC-2a L3 determinism (AC-7, D-2, S-3)", () => {
  it("D-2: the order of the document records changes nothing", () => {
    for (const view of views) {
      const input = sceneInput(view.caseId, view.viewName);
      const reversed = {
        ...input,
        document: {
          ...input.document,
          entities: Object.fromEntries(Object.entries(input.document.entities).reverse()),
          relations: Object.fromEntries(Object.entries(input.document.relations).reverse()),
        },
      };
      expect(Object.keys(reversed.document.entities)).not.toEqual(Object.keys(input.document.entities));
      const layout = layScene(reversed, {}, { rootOrder: input.rootOrder });
      expect(serialiseView(layout.view), view.key).toBe(serialiseView(layouts.get(view.key)!.view));
      expect(geometryBytes(layout)).toBe(geometryBytes(layouts.get(view.key)!));
    }
  }, 120_000);

  it("AC-7: ten fresh Node processes give the bytes of this one, on every view", async () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const packageRoot = join(here, "..", "..", "..");
    const vitest = join(dirname(createRequire(import.meta.url).resolve("vitest/package.json")), "vitest.mjs");
    const directory = mkdtempSync(join(tmpdir(), "dc2a-digest-"));
    try {
      const reference = sceneDigests();
      // One child at a time, each on a single worker: ten fresh processes
      // without starving the suites running beside this one.
      const runs: Record<string, string>[] = [];
      for (let index = 0; index < 10; index += 1) {
        const out = join(directory, `digest-${String(index)}.json`);
        runs.push(
          await new Promise<Record<string, string>>((resolve, reject) => {
            execFile(
              process.execPath,
              [vitest, "run", "tests/layout/dc2a/digest.child.test.ts", "--pool=forks", "--maxWorkers=1"],
              { cwd: packageRoot, env: { ...process.env, DC2A_DIGEST_OUT: out, DC2A_WRITE_AFTER: "" }, maxBuffer: 16 * 1024 * 1024 },
              (error, stdout, stderr) => {
                if (error !== null) reject(new Error(`child ${String(index)} failed: ${stdout}\n${stderr}`));
                else resolve(JSON.parse(readFileSync(out, "utf8")) as Record<string, string>);
              },
            );
          }),
        );
      }
      expect(Object.keys(reference)).toHaveLength(31);
      for (const run of runs) expect(run).toEqual(reference);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 600_000);
});
