import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import OrganizationChart from "./lib/OrganizationChart.svelte";
import type { OrganizationChartNode } from "./lib/OrganizationChart.svelte";

describe("OrganizationChart", () => {
  const org: OrganizationChartNode[] = [
    { id: "ceo", label: "Direction" },
    { id: "eng", parentId: "ceo", label: "Ingénierie" },
    { id: "sales", parentId: "ceo", label: "Ventes" },
    { id: "fe", parentId: "eng", label: "Frontend" },
    { id: "be", parentId: "eng", label: "Backend" }
  ];

  it("renders one box per node with role img and accessible list", () => {
    const { container } = render(OrganizationChart, {
      props: { data: org, label: "Organigramme" }
    });

    expect(screen.getByRole("img", { name: "Organigramme" })).toBeTruthy();

    const boxes = container.querySelectorAll(".st-organizationChart__box");
    expect(boxes.length).toBe(5);

    const list = container.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("Frontend (fe) → Ingénierie");
    expect(list?.textContent).toContain("Direction (ceo)");

    // Couleur par catégorie.
    expect(container.querySelector(".st-organizationChart__box--category1")).toBeTruthy();
  });

  it("draws one connector per parent→child edge (root excluded)", () => {
    const { container } = render(OrganizationChart, {
      props: { data: org, label: "Liens" }
    });

    // 5 nœuds, 1 racine → 4 connecteurs.
    const links = container.querySelectorAll(".st-organizationChart__link");
    expect(links.length).toBe(4);
  });

  it("supports multiple roots", () => {
    const { container } = render(OrganizationChart, {
      props: {
        data: [
          { id: "a", label: "Pôle A" },
          { id: "b", label: "Pôle B" },
          { id: "a1", parentId: "a", label: "Équipe A1" }
        ] as OrganizationChartNode[],
        label: "Deux pôles"
      }
    });

    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(3);
    // 1 seul lien (a → a1) ; les 2 racines n'ont pas de connecteur.
    expect(container.querySelectorAll(".st-organizationChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const { container } = render(OrganizationChart, {
      props: {
        data: [
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" }
        ] as OrganizationChartNode[],
        label: "Parent invalide"
      }
    });

    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(2);
    // parentId inconnu → traité comme racine → aucun connecteur.
    expect(container.querySelectorAll(".st-organizationChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const { container } = render(OrganizationChart, {
      props: { data: [], label: "Vide" }
    });

    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(0);
    expect(screen.getByRole("img", { name: "Vide" })).toBeTruthy();
  });
});
