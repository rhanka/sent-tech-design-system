/**
 * Natural-size and `Tout voir` rules of the Focus static kit (owner feedback
 * 24/11, track 01M85JMWB3YWBM69DAKPMZ9KX8).
 *
 * RED HISTORY: a diagram rendered enlarged above its natural size, and there
 * was no `Tout voir` mode at all — the owner could not read the scene and had
 * no way to see it whole.
 */
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { createDossierDiagram } from "../src/element/dom/engines/dossier-diagrams.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageCss = readFileSync(join(packageDir, "src", "element", "dom", "dossier-page.css"), "utf8");
const engineCss = readFileSync(join(packageDir, "src", "element", "dom", "engines", "dossier.css"), "utf8");

const scene = {
  documentId: "document:sizing", schemaVersion: { major: 1, minor: 1 }, revision: 0,
  profileRefs: ["generic@1"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
  entities: {
    "entity:group": { id: "entity:group", profile: "generic@1", type: "container", attributes: { name: { kind: "text", value: "Group" } } },
    "entity:child": { id: "entity:child", profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: "Child" } } },
  },
  relations: {
    "relation:group": { id: "relation:group", profile: "generic@1", type: "contains", attributes: {},
      endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:child" }] },
  },
};

const section = {
  kind: "diagram", id: "diagram-1", targetRef: "decision-1", alt: "Sizing diagram",
  syntax: "mermaid", source: "flowchart LR\na[\"A\"]", scene,
} as never;

function renderDiagram(): HTMLElement {
  return createDossierDiagram(document, section);
}

const hosts: HTMLElement[] = [];
afterEach(() => {
  for (const host of hosts.splice(0)) host.remove();
});

describe("diagram natural size (static kit CSS)", () => {
  it("renders the viewport SVG at its natural size, never enlarged", () => {
    const rule = pageCss.match(/\.st-dossier__diagramViewport\s*>\s*svg\s*\{[^}]*\}/);
    expect(rule).not.toBeNull();
    expect(rule![0]).toContain("width: auto");
    expect(rule![0]).toContain("max-width: 100%");
    expect(rule![0]).toContain("height: auto");
  });

  it("keeps pinch zoom available on the viewport", () => {
    expect(pageCss).toContain("touch-action: pinch-zoom");
  });

  it("triggers no narrow variant above 599 px (print is the only media query)", () => {
    for (const css of [pageCss, engineCss]) {
      for (const query of css.matchAll(/@media\s+([^{]+)\{/g)) {
        expect(query[1]!.trim()).toBe("print");
      }
      for (const match of css.matchAll(/min-width:\s*(\d+)px/g)) {
        expect(Number(match[1])).toBeLessThanOrEqual(599);
      }
    }
  });

  it("carries the SVG with explicit width, height and viewBox attributes", () => {
    const host = document.body.appendChild(document.createElement("main"));
    hosts.push(host);
    host.append(renderDiagram());
    const svg = host.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toMatch(/^\S+ \S+ \S+ \S+$/);
    expect(svg.getAttribute("width")).toMatch(/^\d+(\.\d+)?$/);
    expect(svg.getAttribute("height")).toMatch(/^\d+(\.\d+)?$/);
  });
});

describe("Tout voir and fullscreen never enlarge (P1 reproductions)", () => {
  const FILL = /(?<![-\w])width:\s*100%/;
  const FILL_HEIGHT = /(?<![-\w])height:\s*100%/;
  function svgRule(selector: string): string {
    const rule = pageCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*\\}`));
    expect(rule).not.toBeNull();
    return rule![0];
  }

  it("Tout voir never enlarges: no width: 100% on the SVG, capped by max-width and max-height", () => {
    const rule = svgRule(".st-dossier__diagramViewport[data-view-all=\"true\"] > svg");
    expect(rule).not.toMatch(FILL);
    expect(rule).toContain("width: auto");
    expect(rule).toContain("max-width: 100%");
    expect(rule).toContain("height: auto");
    expect(rule).toMatch(/max-height:\s*\d+dvh|max-height:\s*\d+vh|max-height:\s*100%/);
    // A small diagram stays at natural size in Tout voir (at most the
    // companion-fit maxZoom analogue): width is auto, so a narrower-than-column
    // scene is never stretched to the column width.
    expect(pageCss).not.toMatch(/\.st-dossier__diagramViewport\[data-view-all="true"\]\s*>\s*svg\s*\{[^}]*?(?<![-\w])width:\s*100%/);
  });

  it("fullscreen gives the viewport a definite height so a tall scene fits whole", () => {
    expect(pageCss).toContain("height: 100vh");
    expect(pageCss).toContain("height: 100dvh");
    const nativeDrawing = pageCss.match(/\.st-dossier__diagramDrawing:fullscreen\s*\{[^}]*\}/);
    expect(nativeDrawing).not.toBeNull();
    expect(nativeDrawing![0]).toMatch(/height:\s*100(dvh|vh)/);
    for (const selector of [
      ".st-dossier__diagramDrawing:fullscreen .st-dossier__diagramViewport",
      ".st-dossier__diagramDrawing[data-fullscreen=\"true\"] .st-dossier__diagramViewport",
    ]) {
      const rule = svgRule(selector);
      expect(rule).toMatch(/flex:\s*1\s+1\s+auto|height:\s*100%|height:\s*100dvh/);
      expect(rule).toContain("min-height: 0");
    }
  });

  it("fullscreen never enlarges: width/height auto with max caps, no max-height: none", () => {
    for (const selector of [
      ".st-dossier__diagramDrawing:fullscreen .st-dossier__diagramViewport > svg",
      ".st-dossier__diagramDrawing[data-fullscreen=\"true\"] .st-dossier__diagramViewport > svg",
    ]) {
      const rule = svgRule(selector);
      expect(rule).not.toMatch(FILL);
      expect(rule).not.toMatch(FILL_HEIGHT);
      expect(rule).not.toMatch(/max-height:\s*none/);
      expect(rule).toContain("width: auto");
      expect(rule).toContain("max-width: 100%");
      expect(rule).toContain("height: auto");
      expect(rule).toContain("max-height: 100%");
    }
  });

  it("no diagram SVG rule enlarges past natural size, in any mode", () => {
    for (const match of pageCss.matchAll(/\.st-dossier__diagramViewport[^{]*>\s*svg\s*\{[^}]*\}/g)) {
      expect(match[0]).not.toMatch(FILL);
      expect(match[0]).toContain("width: auto");
    }
  });
});

describe("Tout voir mode", () => {
  function mount() {
    const host = document.body.appendChild(document.createElement("main"));
    hosts.push(host);
    const drawing = renderDiagram();
    host.append(drawing);
    const viewport = drawing.querySelector(".st-dossier__diagramViewport")!;
    const viewAll = drawing.querySelector<HTMLButtonElement>("button")!;
    const allButtons = [...drawing.querySelectorAll("button")];
    const toutVoir = allButtons.find((button) => button.textContent === "Tout voir")!;
    const pleinEcran = allButtons.find((button) => button.getAttribute("aria-label") === "Plein écran")!;
    return { host, drawing, viewport, toutVoir, pleinEcran };
  }

  it("starts from the natural size with the toggle off and fullscreen unoffered", () => {
    const { viewport, toutVoir, pleinEcran } = mount();
    expect(viewport.hasAttribute("data-view-all")).toBe(false);
    expect(toutVoir.getAttribute("aria-pressed")).toBe("false");
    expect(toutVoir.getAttribute("aria-controls")).toBe(viewport.id);
    expect(pleinEcran.hidden).toBe(true);
    expect(pleinEcran.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows the whole scene with no scroll and offers fullscreen", () => {
    const { viewport, toutVoir, pleinEcran } = mount();
    toutVoir.click();
    expect(viewport.getAttribute("data-view-all")).toBe("true");
    expect(toutVoir.getAttribute("aria-pressed")).toBe("true");
    expect(pleinEcran.hidden).toBe(false);
  });

  it("restores the natural size when toggled off, having left fullscreen first", () => {
    const { drawing, viewport, toutVoir, pleinEcran } = mount();
    toutVoir.click();
    pleinEcran.click();
    expect(drawing.getAttribute("data-fullscreen")).toBe("true");
    expect(pleinEcran.getAttribute("aria-pressed")).toBe("true");
    toutVoir.click();
    expect(viewport.hasAttribute("data-view-all")).toBe(false);
    expect(drawing.hasAttribute("data-fullscreen")).toBe(false);
    expect(toutVoir.getAttribute("aria-pressed")).toBe("false");
    expect(pleinEcran.hidden).toBe(true);
  });

  it("leaves fullscreen with Escape without leaving view-all", () => {
    const { drawing, viewport, toutVoir, pleinEcran } = mount();
    toutVoir.click();
    pleinEcran.click();
    expect(drawing.getAttribute("data-fullscreen")).toBe("true");
    drawing.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(drawing.hasAttribute("data-fullscreen")).toBe(false);
    expect(viewport.getAttribute("data-view-all")).toBe("true");
    drawing.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(viewport.hasAttribute("data-view-all")).toBe(false);
  });

  it("keeps pinch zoom and reduced motion: no touch-action none, no animated motion", () => {
    expect(pageCss).not.toMatch(/touch-action:\s*none/);
    expect(pageCss).not.toMatch(/transition\s*:/);
    expect(pageCss).not.toMatch(/animation\s*:/);
  });
});
