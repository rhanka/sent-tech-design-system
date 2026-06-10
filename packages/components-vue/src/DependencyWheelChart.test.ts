import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { DependencyWheelChart } from "./DependencyWheelChart.js";

// Roue de dépendances : modules d'une appli et leurs imports pondérés.
const deps = [
  { from: "ui", to: "core", weight: 8 },
  { from: "api", to: "core", weight: 5 },
  { from: "core", to: "utils", weight: 3 },
  { from: "api", to: "utils", weight: 2 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("DependencyWheelChart", () => {
  it("renders one ribbon per valid link and one arc per node", () => {
    const wrapper = mount(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-dependencyWheelChart__ribbon").length).toBe(deps.length);
    expect(el.querySelectorAll(".st-dependencyWheelChart__arc").length).toBe(4);
  });

  it("colours each ribbon by its source node tone", () => {
    const wrapper = mount(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const ribbons = (wrapper.element as HTMLElement).querySelectorAll(".st-dependencyWheelChart__ribbon");
    expect(ribbons[0].classList.contains("st-dependencyWheelChart__ribbon--category1")).toBe(true);
    expect(ribbons[1].classList.contains("st-dependencyWheelChart__ribbon--category3")).toBe(true);
    expect(ribbons[2].classList.contains("st-dependencyWheelChart__ribbon--category2")).toBe(true);
  });

  it("sizes ribbon stroke-width by weight (heaviest is thickest)", () => {
    const wrapper = mount(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const ribbons = (wrapper.element as HTMLElement).querySelectorAll(".st-dependencyWheelChart__ribbon");
    const sw = (el: Element) => Number(el.getAttribute("stroke-width"));
    expect(sw(ribbons[0])).toBeGreaterThan(sw(ribbons[3]));
  });

  it("renders a node legend entry per node", () => {
    const wrapper = mount(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const legend = (wrapper.element as HTMLElement).querySelector(".st-dependencyWheelChart__legend");
    expect(legend).toBeTruthy();
    expect(legend!.querySelectorAll(".st-graphLegend__entry").length).toBe(4);
  });

  it("summarizes links in the accessible list as 'from -> to: weight'", () => {
    const wrapper = mount(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(deps.length);
    expect(items[0]).toBe("ui -> core: 8");
  });

  it("uses labels for display when provided", () => {
    const wrapper = mount(DependencyWheelChart, {
      props: {
        label: "Dépendances",
        data: [{ from: "ui", to: "core", weight: 4 }],
        labels: { ui: "Interface", core: "Noyau" },
      },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("Interface -> Noyau: 4");
  });

  it("drops non-finite / non-positive links before rendering", () => {
    const wrapper = mount(DependencyWheelChart, {
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
    expect(el.querySelectorAll(".st-dependencyWheelChart__ribbon").length).toBe(1);
  });
});
