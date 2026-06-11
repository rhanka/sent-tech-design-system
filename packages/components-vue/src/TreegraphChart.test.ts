import { mount } from "@vue/test-utils";
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

const listText = (el: HTMLElement) =>
  el.querySelector(".st-chartDataList")?.textContent ?? "";

describe("TreegraphChart", () => {
  it("renders one node per item with role img and accessible list", () => {
    const wrapper = mount(TreegraphChart, { props: { data: tree, label: "Arbre" } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Arbre");
    expect(el.querySelectorAll(".st-treegraphChart__dot").length).toBe(5);

    const text = listText(el);
    expect(text).toContain("Feuille A1 (a1) → Branche A");
    expect(text).toContain("Racine (root)");

    expect(el.querySelector(".st-treegraphChart__dot--category1")).toBeTruthy();
  });

  it("draws one bezier link per parent→child edge (root excluded)", () => {
    const wrapper = mount(TreegraphChart, { props: { data: tree, label: "Liens" } });
    const el = wrapper.element as HTMLElement;
    const links = el.querySelectorAll(".st-treegraphChart__link");
    expect(links.length).toBe(4);
    expect(links[0]?.getAttribute("d")).toContain("C");
  });

  it("supports multiple roots", () => {
    const wrapper = mount(TreegraphChart, {
      props: {
        data: [
          { id: "a", label: "Arbre A" },
          { id: "b", label: "Arbre B" },
          { id: "a1", parentId: "a", label: "Feuille A1" },
        ],
        label: "Deux arbres",
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-treegraphChart__dot").length).toBe(3);
    expect(el.querySelectorAll(".st-treegraphChart__link").length).toBe(1);
  });

  it("ignores invalid parentId (treats node as root, no crash)", () => {
    const wrapper = mount(TreegraphChart, {
      props: {
        data: [
          { id: "root", label: "Racine" },
          { id: "orphan", parentId: "missing", label: "Orphelin" },
        ],
        label: "Parent invalide",
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-treegraphChart__dot").length).toBe(2);
    expect(el.querySelectorAll(".st-treegraphChart__link").length).toBe(0);
  });

  it("renders nothing meaningful for empty data without crashing", () => {
    const wrapper = mount(TreegraphChart, { props: { data: [], label: "Vide" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-treegraphChart__dot").length).toBe(0);
    expect(el.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Vide");
  });
});
