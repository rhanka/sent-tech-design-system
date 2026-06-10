import { mount } from "@vue/test-utils";
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

const listText = (el: HTMLElement) =>
  el.querySelector(".st-chartDataList")?.textContent ?? "";

describe("OrganizationChart", () => {
  it("renders one box per node with role img and accessible list", () => {
    const wrapper = mount(OrganizationChart, { props: { data: org, label: "Organigramme" } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Organigramme");
    expect(el.querySelectorAll(".st-organizationChart__box").length).toBe(5);

    const text = listText(el);
    expect(text).toContain("Frontend (fe) → Ingénierie");
    expect(text).toContain("Direction (ceo)");

    expect(el.querySelector(".st-organizationChart__box--category1")).toBeTruthy();
  });

  it("draws one connector per parent→child edge (root excluded)", () => {
    const wrapper = mount(OrganizationChart, { props: { data: org, label: "Liens" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-organizationChart__link").length).toBe(4);
  });

  it("supports multiple roots", () => {
    const wrapper = mount(OrganizationChart, {
      props: {
        data: [
          { id: "a", label: "Pôle A" },
          { id: "b", label: "Pôle B" },
          { id: "a1", parentId: "a", label: "Équipe A1" },
        ],
        label: "Deux pôles",
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-organizationChart__box").length).toBe(3);
    expect(el.querySelectorAll(".st-organizationChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const wrapper = mount(OrganizationChart, {
      props: {
        data: [
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" },
        ],
        label: "Parent invalide",
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-organizationChart__box").length).toBe(2);
    expect(el.querySelectorAll(".st-organizationChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const wrapper = mount(OrganizationChart, { props: { data: [], label: "Vide" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-organizationChart__box").length).toBe(0);
    expect(el.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Vide");
  });
});
