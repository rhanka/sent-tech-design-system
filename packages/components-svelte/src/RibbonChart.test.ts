import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import RibbonChart from "./lib/RibbonChart.svelte";

// Rang empilé à rubans : par période, des segments empilés triés par valeur, et
// des rubans reliant la même catégorie d'une période à la suivante.
const data = [
  { category: "Card", period: "Q1", value: 42 },
  { category: "Transfer", period: "Q1", value: 30 },
  { category: "Wallet", period: "Q1", value: 18 },
  { category: "Card", period: "Q2", value: 35 },
  { category: "Transfer", period: "Q2", value: 41 },
  { category: "Wallet", period: "Q2", value: 24 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("RibbonChart", () => {
  it("renders one segment per datum across all periods", () => {
    const { container } = render(RibbonChart, { props: { label: "Rang", data } });
    expect(screen.getByRole("img")).toBeTruthy();
    // 3 + 3 = 6 segments au total.
    expect(container.querySelectorAll(".st-ribbonChart__seg").length).toBe(6);
  });

  it("links shared categories between consecutive periods with ribbons", () => {
    const { container } = render(RibbonChart, { props: { label: "Rang", data } });
    // 3 catégories partagées entre Q1 et Q2 → 3 rubans.
    expect(container.querySelectorAll(".st-ribbonChart__ribbon").length).toBe(3);
    expect(container.querySelectorAll(".st-ribbonChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per category when no tone is given", () => {
    const { container } = render(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Card", period: "Q1", value: 10 },
          { category: "Transfer", period: "Q1", value: 5 }
        ]
      }
    });
    // Card → category1, Transfer → category2 (ordre d'apparition).
    expect(container.querySelector(".st-ribbonChart__seg--category1")).toBeTruthy();
    expect(container.querySelector(".st-ribbonChart__seg--category2")).toBeTruthy();
  });

  it("honours an explicit tone on a category", () => {
    const { container } = render(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Card", period: "Q1", value: 10, tone: "category5" as const },
          { category: "Card", period: "Q2", value: 8, tone: "category5" as const }
        ]
      }
    });
    expect(container.querySelector(".st-ribbonChart__seg--category5")).toBeTruthy();
    expect(container.querySelector(".st-ribbonChart__ribbon--category5")).toBeTruthy();
  });

  it("ranks the largest category at the foot of each period", () => {
    const { container } = render(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Small", period: "Q1", value: 10 },
          { category: "Big", period: "Q1", value: 90 }
        ]
      }
    });
    const segs = container.querySelectorAll<SVGRectElement>(".st-ribbonChart__seg");
    // 2 segments dans la même colonne : le plus grand a le plus grand y (au pied).
    const ys = Array.from(segs).map((s) => Number(s.getAttribute("y")));
    const heights = Array.from(segs).map((s) => Number(s.getAttribute("height")));
    const bottomIndex = ys.indexOf(Math.max(...ys));
    // Le segment du bas est le plus grand.
    expect(heights[bottomIndex]).toBe(Math.max(...heights));
  });

  it("summarises each category in the accessible data list", () => {
    const { container } = render(RibbonChart, { props: { label: "Rang", data } });
    const items = listItems(container);
    expect(items[0]).toBe("Card: Q1 = 42, Q2 = 35");
  });

  it("drops unlabeled categories and non-finite values before rendering", () => {
    const { container } = render(RibbonChart, {
      props: {
        label: "Filtré",
        data: [
          { category: "", period: "Q1", value: 10 },
          { category: "Card", period: "Q1", value: Number.NaN },
          { category: "Card", period: "Q1", value: 12 }
        ]
      }
    });
    // Catégorie vide + valeur NaN supprimées → 1 segment restant.
    expect(container.querySelectorAll(".st-ribbonChart__seg").length).toBe(1);
  });
});
