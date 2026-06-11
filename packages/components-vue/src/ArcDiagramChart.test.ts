import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ArcDiagramChart } from "./ArcDiagramChart.js";

// Diagramme en arcs : nœuds alignés sur un axe, arcs reliant les paires pondérées.
const deps = [
  { from: "ui", to: "core", weight: 8 },
  { from: "api", to: "core", weight: 5 },
  { from: "core", to: "utils", weight: 3 },
  { from: "api", to: "utils", weight: 2 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ArcDiagramChart", () => {
  it("renders one arc per valid link and one node marker per node", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-arcDiagramChart__arc").length).toBe(deps.length);
    expect(el.querySelectorAll(".st-arcDiagramChart__node").length).toBe(4);
  });

  it("colours each arc by its source node tone", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const arcs = (wrapper.element as HTMLElement).querySelectorAll(".st-arcDiagramChart__arc");
    expect(arcs[0].classList.contains("st-arcDiagramChart__arc--category1")).toBe(true);
    expect(arcs[1].classList.contains("st-arcDiagramChart__arc--category3")).toBe(true);
    expect(arcs[2].classList.contains("st-arcDiagramChart__arc--category2")).toBe(true);
  });

  it("sizes arc stroke-width by weight (heaviest is thickest)", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const arcs = (wrapper.element as HTMLElement).querySelectorAll(".st-arcDiagramChart__arc");
    const sw = (el: Element) => Number(el.getAttribute("stroke-width"));
    expect(sw(arcs[0])).toBeGreaterThan(sw(arcs[3]));
  });

  it("sizes node markers by weighted degree (busiest node is largest)", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const nodes = (wrapper.element as HTMLElement).querySelectorAll(".st-arcDiagramChart__node");
    const r = (el: Element) => Number(el.getAttribute("r"));
    expect(r(nodes[1])).toBeGreaterThan(r(nodes[3]));
  });

  it("renders a node legend entry per node", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const legend = (wrapper.element as HTMLElement).querySelector(".st-arcDiagramChart__legend");
    expect(legend).toBeTruthy();
    expect(legend!.querySelectorAll(".st-graphLegend__entry").length).toBe(4);
  });

  it("summarizes links in the accessible list as 'from -> to: weight'", () => {
    const wrapper = mount(ArcDiagramChart, { props: { label: "Réseau", data: deps } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(deps.length);
    expect(items[0]).toBe("ui -> core: 8");
  });

  it("uses labels for display when provided", () => {
    const wrapper = mount(ArcDiagramChart, {
      props: {
        label: "Réseau",
        data: [{ from: "ui", to: "core", weight: 4 }],
        labels: { ui: "Interface", core: "Noyau" },
      },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("Interface -> Noyau: 4");
  });

  it("drops non-finite / non-positive links before rendering", () => {
    const wrapper = mount(ArcDiagramChart, {
      props: {
        label: "Filtré",
        data: [
          { from: "a", to: "b", weight: Number.NaN },
          { from: "a", to: "b", weight: -3 },
          { from: "a", to: "b", weight: 0 },
          { from: "a", to: "c", weight: 5 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-arcDiagramChart__arc").length).toBe(1);
  });
});
