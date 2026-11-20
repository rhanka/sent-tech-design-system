import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { projectedChainFixture } from "../../../diagram-canvas/test-support/projectedChainFixture.js";
import DiagramSceneFigure, { type DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} takeRecords() { return []; } });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 1280 });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth; });

function propsOf(): DiagramSceneFigureProps {
  const f = projectedChainFixture();
  return {
    document: f.document,
    registry: f.registry,
    bindings: f.bindings,
    presentation: f.presentation,
    measureLines: f.measureLines,
    hints: { ordering: f.ordering, rootOrder: f.rootOrder },
  } as DiagramSceneFigureProps;
}

describe("DiagramSceneFigure projected chain E1 — Svelte fold", () => {
  it("should fold and unfold the inner zone live with relayout and link recompute", async () => {
    const view = render(DiagramSceneFigure, propsOf());
    await tick();

    const toggle = () =>
      view.container.querySelector<HTMLButtonElement>(
        `[data-scene-occurrence="occurrence:e.workstream"] button[aria-expanded]`,
      )!;
    const openEdges = [...view.container.querySelectorAll("[data-scene-edge]")].map(
      (e) => e.getAttribute("data-scene-edge"),
    );
    expect(openEdges.sort()).toEqual(
      ["occurrence:r.lnk-drive", "occurrence:r.lnk-feed", "occurrence:r.lnk-handoff"].sort(),
    );
    expect(toggle().getAttribute("aria-expanded")).toBe("true");

    await fireEvent.click(toggle());
    await tick();
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    const foldedEdges = [...view.container.querySelectorAll("[data-scene-edge]")].map(
      (e) => e.getAttribute("data-scene-edge"),
    );
    expect(foldedEdges).toEqual(["occurrence:r.lnk-handoff"]);
    expect(view.container.querySelector('[data-scene-occurrence="occurrence:e.parser"]')).toBeNull();

    await fireEvent.click(toggle());
    await tick();
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(view.container.querySelector('[data-scene-occurrence="occurrence:e.parser"]')).not.toBeNull();
  });
});
