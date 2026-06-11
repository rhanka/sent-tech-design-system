import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TreegraphChart } from "./TreegraphChart.js";
import type { TreegraphChartNode } from "./TreegraphChart.js";

const tree: TreegraphChartNode[] = [
  { id: "root", label: "Racine" },
  { id: "a", parentId: "root", label: "Branche A" },
  { id: "b", parentId: "root", label: "Branche B" },
  { id: "a1", parentId: "a", label: "Feuille A1" },
  { id: "a2", parentId: "a", label: "Feuille A2" },
];

const listText = (container: HTMLElement) =>
  container.querySelector(".st-chartDataList")?.textContent ?? "";

describe("TreegraphChart", () => {
  it("renders one node per item with role img and accessible list", () => {
    const { container, getByRole } = render(<TreegraphChart data={tree} label="Arbre" />);

    expect(getByRole("img", { name: "Arbre" })).toBeTruthy();
    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(5);

    const text = listText(container);
    expect(text).toContain("Feuille A1 (a1) → Branche A");
    expect(text).toContain("Racine (root)");

    expect(container.querySelector(".st-treegraphChart__dot--category1")).toBeTruthy();
  });

  it("draws one bezier link per parent→child edge (root excluded)", () => {
    const { container } = render(<TreegraphChart data={tree} label="Liens" />);
    const links = container.querySelectorAll(".st-treegraphChart__link");
    expect(links.length).toBe(4);
    expect(links[0]?.getAttribute("d")).toContain("C");
  });

  it("supports multiple roots", () => {
    const { container } = render(
      <TreegraphChart
        data={[
          { id: "a", label: "Arbre A" },
          { id: "b", label: "Arbre B" },
          { id: "a1", parentId: "a", label: "Feuille A1" },
        ]}
        label="Deux arbres"
      />,
    );

    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(3);
    expect(container.querySelectorAll(".st-treegraphChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const { container } = render(
      <TreegraphChart
        data={[
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" },
        ]}
        label="Parent invalide"
      />,
    );

    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(2);
    expect(container.querySelectorAll(".st-treegraphChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const { container, getByRole } = render(<TreegraphChart data={[]} label="Vide" />);
    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(0);
    expect(getByRole("img", { name: "Vide" })).toBeTruthy();
  });
});
