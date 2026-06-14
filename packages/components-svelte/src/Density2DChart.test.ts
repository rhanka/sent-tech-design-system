import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Density2DChart from "./lib/Density2DChart.svelte";

// Points (x,y) concentrés dans un coin (densité élevée) + quelques points
// dispersés, agrégés sur une grille bins×bins.
const data = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 1 },
  { x: 9, y: 9 },
  { x: 5, y: 5 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("Density2DChart", () => {
  it("renders a non-empty grid of density cells", () => {
    const { container } = render(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-density2DChart__cell").length).toBeGreaterThan(0);
  });

  it("only emits cells for non-empty bins (sparse rendering)", () => {
    const { container } = render(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    // 6 points mais certains tombent dans le même bin → moins de cellules que 25.
    const cells = container.querySelectorAll(".st-density2DChart__cell");
    expect(cells.length).toBeLessThan(25);
  });

  it("colours the densest bin at the high end of the ramp", () => {
    const { container } = render(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    const cells = Array.from(container.querySelectorAll(".st-density2DChart__cell"));
    // le bin (1,1) groupe 3 points → ton le plus chaud présent.
    const hasTopTone = cells.some((c) =>
      c.classList.contains("st-density2DChart__cell--category8")
    );
    expect(hasTopTone).toBe(true);
  });

  it("respects the weight of each point when summing density", () => {
    const { container } = render(Density2DChart, {
      props: {
        label: "Pondéré",
        bins: 4,
        data: [
          { x: 0, y: 0, weight: 10 },
          { x: 9, y: 9, weight: 1 }
        ]
      }
    });
    const items = listItems(container);
    // un item porte la densité 10 (point pondéré).
    expect(items.some((t) => t?.endsWith(": 10"))).toBe(true);
  });

  it("renders a Low→High legend ramp of eight swatches", () => {
    const { container } = render(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    expect(container.querySelector(".st-density2DChart__legend")).toBeTruthy();
    expect(container.querySelectorAll(".st-density2DChart__legendSwatch").length).toBe(8);
  });

  it("renders X and Y axes", () => {
    const { container } = render(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    expect(container.querySelectorAll(".st-density2DChart__axis").length).toBe(2);
  });

  it("drops points with non-finite coordinates", () => {
    const { container } = render(Density2DChart, {
      props: {
        label: "Filtré",
        bins: 4,
        data: [
          { x: 0, y: 0 },
          { x: 9, y: 9 },
          { x: Number.NaN, y: 2 },
          { x: 3, y: Number.POSITIVE_INFINITY }
        ]
      }
    });
    // les 2 points non finis sont ignorés ; restent 2 points (coins opposés)
    // dans 2 bins distincts → 2 cellules.
    expect(container.querySelectorAll(".st-density2DChart__cell").length).toBe(2);
  });
});
