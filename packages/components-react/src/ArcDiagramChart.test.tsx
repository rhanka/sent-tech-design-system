import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArcDiagramChart } from "./ArcDiagramChart.js";

// Diagramme en arcs : nœuds alignés sur un axe, arcs reliant les paires pondérées.
//   core est cité par tous → degré pondéré max → marqueur le plus gros.
const deps = [
  { from: "ui", to: "core", weight: 8 },
  { from: "api", to: "core", weight: 5 },
  { from: "core", to: "utils", weight: 3 },
  { from: "api", to: "utils", weight: 2 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ArcDiagramChart", () => {
  it("renders one arc per valid link and one node marker per node", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    expect(container.querySelectorAll(".st-arcDiagramChart__arc").length).toBe(deps.length);
    // Nœuds : ui, core, api, utils
    expect(container.querySelectorAll(".st-arcDiagramChart__node").length).toBe(4);
  });

  it("colours each arc by its source node tone", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    const arcs = container.querySelectorAll(".st-arcDiagramChart__arc");
    // ui = 1er nœud (category1), api = 3e nœud (category3)
    expect(arcs[0].classList.contains("st-arcDiagramChart__arc--category1")).toBe(true);
    expect(arcs[1].classList.contains("st-arcDiagramChart__arc--category3")).toBe(true);
    // core -> utils : core = 2e nœud (category2)
    expect(arcs[2].classList.contains("st-arcDiagramChart__arc--category2")).toBe(true);
  });

  it("sizes arc stroke-width by weight (heaviest is thickest)", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    const arcs = container.querySelectorAll(".st-arcDiagramChart__arc");
    const sw = (el: Element) => Number(el.getAttribute("stroke-width"));
    // weight 8 (le plus lourd) > weight 2 (le plus léger)
    expect(sw(arcs[0])).toBeGreaterThan(sw(arcs[3]));
  });

  it("sizes node markers by weighted degree (busiest node is largest)", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    const nodes = container.querySelectorAll(".st-arcDiagramChart__node");
    const r = (el: Element) => Number(el.getAttribute("r"));
    // core (2e nœud) cumule le plus de poids → plus grand que utils (4e nœud)
    expect(r(nodes[1])).toBeGreaterThan(r(nodes[3]));
  });

  it("renders a node legend entry per node", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    const legend = container.querySelector(".st-arcDiagramChart__legend");
    expect(legend).toBeTruthy();
    expect(legend!.querySelectorAll(".st-graphLegend__entry").length).toBe(4);
  });

  it("summarizes links in the accessible list as 'from -> to: weight'", () => {
    const { container } = render(<ArcDiagramChart label="Réseau" data={deps} />);
    const items = listItems(container);
    expect(items.length).toBe(deps.length);
    expect(items[0]).toBe("ui -> core: 8");
  });

  it("uses labels for display when provided", () => {
    const { container } = render(
      <ArcDiagramChart
        label="Réseau"
        data={[{ from: "ui", to: "core", weight: 4 }]}
        labels={{ ui: "Interface", core: "Noyau" }}
      />
    );
    const items = listItems(container);
    expect(items[0]).toBe("Interface -> Noyau: 4");
  });

  it("drops non-finite / non-positive links before rendering", () => {
    const { container } = render(
      <ArcDiagramChart
        label="Filtré"
        data={[
          { from: "a", to: "b", weight: Number.NaN },
          { from: "a", to: "b", weight: -3 },
          { from: "a", to: "b", weight: 0 },
          { from: "a", to: "c", weight: 5 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-arcDiagramChart__arc").length).toBe(1);
  });
});
