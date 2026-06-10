import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DependencyWheelChart from "./lib/DependencyWheelChart.svelte";

// Roue de dépendances : modules d'une appli et leurs imports pondérés.
//   core est cité par tous → arc le plus large, plusieurs rubans.
const deps = [
  { from: "ui", to: "core", weight: 8 },
  { from: "api", to: "core", weight: 5 },
  { from: "core", to: "utils", weight: 3 },
  { from: "api", to: "utils", weight: 2 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("DependencyWheelChart", () => {
  it("renders one ribbon per valid link and one arc per node", () => {
    const { container } = render(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-dependencyWheelChart__ribbon").length).toBe(deps.length);
    // Nœuds : ui, core, api, utils
    expect(container.querySelectorAll(".st-dependencyWheelChart__arc").length).toBe(4);
  });

  it("colours each ribbon by its source node tone", () => {
    const { container } = render(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const ribbons = container.querySelectorAll(".st-dependencyWheelChart__ribbon");
    // ui = 1er nœud (category1), api = 3e nœud (category3)
    expect(ribbons[0].classList.contains("st-dependencyWheelChart__ribbon--category1")).toBe(true);
    expect(ribbons[1].classList.contains("st-dependencyWheelChart__ribbon--category3")).toBe(true);
    // core -> utils : core = 2e nœud (category2)
    expect(ribbons[2].classList.contains("st-dependencyWheelChart__ribbon--category2")).toBe(true);
  });

  it("sizes ribbon stroke-width by weight (heaviest is thickest)", () => {
    const { container } = render(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const ribbons = container.querySelectorAll(".st-dependencyWheelChart__ribbon");
    const sw = (el: Element) => Number(el.getAttribute("stroke-width"));
    // weight 8 (le plus lourd) > weight 2 (le plus léger)
    expect(sw(ribbons[0])).toBeGreaterThan(sw(ribbons[3]));
  });

  it("renders a node legend entry per node", () => {
    const { container } = render(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const legend = container.querySelector(".st-dependencyWheelChart__legend");
    expect(legend).toBeTruthy();
    expect(legend!.querySelectorAll(".st-graphLegend__entry").length).toBe(4);
  });

  it("summarizes links in the accessible list as 'from -> to: weight'", () => {
    const { container } = render(DependencyWheelChart, { props: { label: "Dépendances", data: deps } });
    const items = listItems(container);
    expect(items.length).toBe(deps.length);
    expect(items[0]).toBe("ui -> core: 8");
  });

  it("uses labels for display when provided", () => {
    const { container } = render(DependencyWheelChart, {
      props: {
        label: "Dépendances",
        data: [{ from: "ui", to: "core", weight: 4 }],
        labels: { ui: "Interface", core: "Noyau" }
      }
    });
    const items = listItems(container);
    expect(items[0]).toBe("Interface -> Noyau: 4");
  });

  it("drops non-finite / non-positive links before rendering", () => {
    const { container } = render(DependencyWheelChart, {
      props: {
        label: "Filtré",
        data: [
          { from: "a", to: "b", weight: Number.NaN },
          { from: "a", to: "b", weight: -3 },
          { from: "a", to: "b", weight: 0 },
          { from: "a", to: "c", weight: 5 }
        ]
      }
    });
    expect(container.querySelectorAll(".st-dependencyWheelChart__ribbon").length).toBe(1);
  });
});
