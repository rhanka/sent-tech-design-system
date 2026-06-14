import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import WaffleChart from "./lib/WaffleChart.svelte";

const market = [
  { label: "Chrome", value: 65 },
  { label: "Safari", value: 20 },
  { label: "Firefox", value: 15 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("WaffleChart", () => {
  it("renders totalCells cells in the grid", () => {
    const { container } = render(WaffleChart, {
      props: { label: "Parts de marché", data: market }
    });
    expect(screen.getByRole("img")).toBeTruthy();
    // Défaut totalCells = 100.
    expect(container.querySelectorAll(".st-waffleChart__cell").length).toBe(100);
  });

  it("allocates a proportional number of coloured cells per category", () => {
    const { container } = render(WaffleChart, {
      props: { label: "Parts de marché", data: market, totalCells: 100 }
    });
    // 65 % → 65 cellules category1, 20 % → 20 category2, 15 % → 15 category3.
    expect(container.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(65);
    expect(container.querySelectorAll(".st-waffleChart__cell--category2").length).toBe(20);
    expect(container.querySelectorAll(".st-waffleChart__cell--category3").length).toBe(15);
  });

  it("uses explicit tones and renders a category legend", () => {
    const { container } = render(WaffleChart, {
      props: {
        label: "Statut",
        data: [
          { label: "Réussi", value: 80, tone: "success" as const },
          { label: "Échoué", value: 20, tone: "error" as const }
        ]
      }
    });
    expect(container.querySelectorAll(".st-waffleChart__cell--success").length).toBe(80);
    expect(container.querySelectorAll(".st-waffleChart__cell--error").length).toBe(20);
    expect(container.querySelectorAll(".st-waffleChart__legendItem").length).toBe(2);
  });

  it("fills the remainder with a neutral track when values undershoot the grid", () => {
    const { container } = render(WaffleChart, {
      props: { label: "Partiel", data: [{ label: "A", value: 30 }, { label: "B", value: 10 }], totalCells: 100 }
    });
    // 30 + 10 = 40 → 75 % A (category1) + 25 % B (category2), pas de piste car total réparti.
    // 75 + 25 = 100 cellules colorées, 0 piste.
    const track = container.querySelectorAll(".st-waffleChart__cell--track").length;
    const coloured = container.querySelectorAll(".st-waffleChart__cell").length - track;
    expect(coloured).toBe(100);
  });

  it("summarises each category in the accessible data list", () => {
    const { container } = render(WaffleChart, {
      props: { label: "Parts", data: market }
    });
    const items = listItems(container);
    expect(items[0]).toBe("Chrome: 65 (65%)");
    expect(items[1]).toBe("Safari: 20 (20%)");
  });

  it("drops unlabeled or non-positive categories before rendering", () => {
    const { container } = render(WaffleChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "", value: 50 },
          { label: "Bad", value: Number.NaN },
          { label: "Ok", value: 40 }
        ]
      }
    });
    // Seul "Ok" subsiste → 1 item de légende, toutes les cellules colorées en category1.
    expect(container.querySelectorAll(".st-waffleChart__legendItem").length).toBe(1);
    expect(container.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(100);
  });
});
