import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrganizationChart } from "./OrganizationChart.js";
import type { OrganizationChartNode } from "./OrganizationChart.js";

const org: OrganizationChartNode[] = [
  { id: "ceo", label: "Direction" },
  { id: "eng", parentId: "ceo", label: "Ingénierie" },
  { id: "sales", parentId: "ceo", label: "Ventes" },
  { id: "fe", parentId: "eng", label: "Frontend" },
  { id: "be", parentId: "eng", label: "Backend" },
];

const listText = (container: HTMLElement) =>
  container.querySelector(".st-chartDataList")?.textContent ?? "";

describe("OrganizationChart", () => {
  it("renders one box per node with role img and accessible list", () => {
    const { container, getByRole } = render(
      <OrganizationChart data={org} label="Organigramme" />,
    );

    expect(getByRole("img", { name: "Organigramme" })).toBeTruthy();
    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(5);

    const text = listText(container);
    expect(text).toContain("Frontend (fe) → Ingénierie");
    expect(text).toContain("Direction (ceo)");

    expect(container.querySelector(".st-organizationChart__box--category1")).toBeTruthy();
  });

  it("draws one connector per parent→child edge (root excluded)", () => {
    const { container } = render(<OrganizationChart data={org} label="Liens" />);
    expect(container.querySelectorAll(".st-organizationChart__link").length).toBe(4);
  });

  it("supports multiple roots", () => {
    const { container } = render(
      <OrganizationChart
        data={[
          { id: "a", label: "Pôle A" },
          { id: "b", label: "Pôle B" },
          { id: "a1", parentId: "a", label: "Équipe A1" },
        ]}
        label="Deux pôles"
      />,
    );

    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(3);
    expect(container.querySelectorAll(".st-organizationChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const { container } = render(
      <OrganizationChart
        data={[
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" },
        ]}
        label="Parent invalide"
      />,
    );

    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(2);
    expect(container.querySelectorAll(".st-organizationChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const { container, getByRole } = render(<OrganizationChart data={[]} label="Vide" />);
    expect(container.querySelectorAll(".st-organizationChart__box").length).toBe(0);
    expect(getByRole("img", { name: "Vide" })).toBeTruthy();
  });
});
