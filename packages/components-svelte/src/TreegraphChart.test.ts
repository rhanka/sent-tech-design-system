import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TreegraphChart from "./lib/TreegraphChart.svelte";
import type { TreegraphChartNode } from "./lib/TreegraphChart.svelte";

describe("TreegraphChart", () => {
  const tree: TreegraphChartNode[] = [
    { id: "root", label: "Racine" },
    { id: "a", parentId: "root", label: "Branche A" },
    { id: "b", parentId: "root", label: "Branche B" },
    { id: "a1", parentId: "a", label: "Feuille A1" },
    { id: "a2", parentId: "a", label: "Feuille A2" }
  ];

  it("renders one node per item with role img and accessible list", () => {
    const { container } = render(TreegraphChart, {
      props: { data: tree, label: "Arbre" }
    });

    expect(screen.getByRole("img", { name: "Arbre" })).toBeTruthy();

    const dots = container.querySelectorAll(".st-treegraphChart__dot");
    expect(dots.length).toBe(5);

    const list = container.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("Feuille A1 (a1) → Branche A");
    expect(list?.textContent).toContain("Racine (root)");

    // Couleur par catégorie.
    expect(container.querySelector(".st-treegraphChart__dot--category1")).toBeTruthy();
  });

  it("draws one bezier link per parent→child edge (root excluded)", () => {
    const { container } = render(TreegraphChart, {
      props: { data: tree, label: "Liens" }
    });

    // 5 nœuds, 1 racine → 4 liens.
    const links = container.querySelectorAll(".st-treegraphChart__link");
    expect(links.length).toBe(4);
    // Lien = courbe bezier cubique (commande C).
    expect(links[0]?.getAttribute("d")).toContain("C");
  });

  it("supports multiple roots", () => {
    const { container } = render(TreegraphChart, {
      props: {
        data: [
          { id: "a", label: "Arbre A" },
          { id: "b", label: "Arbre B" },
          { id: "a1", parentId: "a", label: "Feuille A1" }
        ] as TreegraphChartNode[],
        label: "Deux arbres"
      }
    });

    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(3);
    // 1 seul lien (a → a1) ; les 2 racines n'ont pas de lien.
    expect(container.querySelectorAll(".st-treegraphChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const { container } = render(TreegraphChart, {
      props: {
        data: [
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" }
        ] as TreegraphChartNode[],
        label: "Parent invalide"
      }
    });

    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(2);
    // parentId inconnu → traité comme racine → aucun lien.
    expect(container.querySelectorAll(".st-treegraphChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const { container } = render(TreegraphChart, {
      props: { data: [], label: "Vide" }
    });

    expect(container.querySelectorAll(".st-treegraphChart__dot").length).toBe(0);
    expect(screen.getByRole("img", { name: "Vide" })).toBeTruthy();
  });
});
