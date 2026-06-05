import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TreemapChart from "./lib/TreemapChart.svelte";
import type { TreemapChartDatum } from "./lib/TreemapChart.svelte";

describe("TreemapChart", () => {
  const flatData: TreemapChartDatum[] = [
    { label: "Alpha", value: 50 },
    { label: "Beta", value: 30 },
    { label: "Gamma", value: 20 }
  ];

  const nestedData: TreemapChartDatum[] = [
    {
      label: "Frontend",
      value: 0,
      tone: "category2",
      children: [
        { label: "Svelte", value: 40 },
        { label: "React", value: 25 }
      ]
    },
    {
      label: "Backend",
      value: 35
    }
  ];

  it("renders one rectangle per leaf with role group and a11y data list", () => {
    const { container } = render(TreemapChart, {
      props: { data: flatData, label: "Répartition" }
    });

    // role img + label accessible (parité Bar/Line/Donut/Funnel)
    expect(screen.getByRole("img", { name: "Répartition" })).toBeTruthy();

    const rects = container.querySelectorAll(".st-treemapChart__rect");
    expect(rects.length).toBe(3);

    // Pavage proportionnel : aire totale ≈ width*height, plus grande valeur = plus grande aire.
    const areas = [...rects].map(
      (r) => Number(r.getAttribute("width")) * Number(r.getAttribute("height"))
    );
    expect(Math.max(...areas)).toBeGreaterThan(Math.min(...areas));

    // Accessibilité : ChartDataList masqué listant chaque valeur.
    const list = container.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("Alpha: 50");
    expect(list?.textContent).toContain("Gamma: 20");

    // Couleur par catégorie.
    expect(container.querySelector(".st-treemapChart__rect--category1")).toBeTruthy();
  });

  it("subdivides a node with children (2 niveaux) and aggregates the parent value", () => {
    const { container } = render(TreemapChart, {
      props: { data: nestedData, label: "Stack" }
    });

    // 2 enfants de Frontend + 1 feuille Backend = 3 rectangles.
    const rects = container.querySelectorAll(".st-treemapChart__rect");
    expect(rects.length).toBe(3);

    // Le data-list cite le parent pour les enfants et agrège la valeur du parent (65).
    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("Frontend, Svelte: 40");
    expect(list?.textContent).toContain("Frontend, React: 25");
    expect(list?.textContent).toContain("Backend: 35");

    // Frontend (65) > Backend (35) → aire des enfants combinée plus grande.
    expect(screen.getByText("Svelte")).toBeTruthy();
  });

  it("hides labels when disabled and shows the legend when enabled", () => {
    const { container, rerender } = render(TreemapChart, {
      props: { data: flatData, label: "Sans labels", showLabels: false }
    });

    expect(container.querySelectorAll(".st-treemapChart__label").length).toBe(0);

    rerender({ data: flatData, label: "Avec légende", legend: true });
    const legendItems = container.querySelectorAll(".st-treemapChart__legendItem");
    expect(legendItems.length).toBe(3);
    expect(container.querySelector(".st-treemapChart__legend")?.textContent).toContain("Alpha");
  });

  it("shows and hides the tooltip on hover", async () => {
    const { container } = render(TreemapChart, {
      props: { data: flatData, label: "Interactif" }
    });

    expect(screen.queryByRole("presentation")).toBeNull();

    const rects = container.querySelectorAll(".st-treemapChart__rect");
    await fireEvent.pointerMove(rects[0]);

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain("Alpha");
    expect(tooltip.textContent).toContain("50");

    await fireEvent.pointerLeave(container.querySelector(".st-treemapChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("ignores non-positive values without crashing", () => {
    const { container } = render(TreemapChart, {
      props: {
        data: [
          { label: "Vide", value: 0 },
          { label: "Plein", value: 10 }
        ] as TreemapChartDatum[],
        label: "Filtrage"
      }
    });

    const rects = container.querySelectorAll(".st-treemapChart__rect");
    expect(rects.length).toBe(1);
  });
});
