import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaffleChart } from "./WaffleChart.js";

const market = [
  { label: "Chrome", value: 65 },
  { label: "Safari", value: 20 },
  { label: "Firefox", value: 15 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("WaffleChart", () => {
  it("renders totalCells cells in the grid", () => {
    const { container } = render(<WaffleChart label="Parts de marché" data={market} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(container.querySelectorAll(".st-waffleChart__cell").length).toBe(100);
  });

  it("allocates a proportional number of coloured cells per category", () => {
    const { container } = render(<WaffleChart label="Parts de marché" data={market} totalCells={100} />);
    expect(container.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(65);
    expect(container.querySelectorAll(".st-waffleChart__cell--category2").length).toBe(20);
    expect(container.querySelectorAll(".st-waffleChart__cell--category3").length).toBe(15);
  });

  it("uses explicit tones and renders a category legend", () => {
    const { container } = render(
      <WaffleChart
        label="Statut"
        data={[
          { label: "Réussi", value: 80, tone: "success" },
          { label: "Échoué", value: 20, tone: "error" },
        ]}
      />,
    );
    expect(container.querySelectorAll(".st-waffleChart__cell--success").length).toBe(80);
    expect(container.querySelectorAll(".st-waffleChart__cell--error").length).toBe(20);
    expect(container.querySelectorAll(".st-waffleChart__legendItem").length).toBe(2);
  });

  it("colours all cells once the values sum to the grid", () => {
    const { container } = render(
      <WaffleChart label="Partiel" data={[{ label: "A", value: 30 }, { label: "B", value: 10 }]} totalCells={100} />,
    );
    const track = container.querySelectorAll(".st-waffleChart__cell--track").length;
    const coloured = container.querySelectorAll(".st-waffleChart__cell").length - track;
    expect(coloured).toBe(100);
  });

  it("summarises each category in the accessible data list", () => {
    const { container } = render(<WaffleChart label="Parts" data={market} />);
    const items = listItems(container);
    expect(items[0]).toBe("Chrome: 65 (65%)");
    expect(items[1]).toBe("Safari: 20 (20%)");
  });

  it("drops unlabeled or non-positive categories before rendering", () => {
    const { container } = render(
      <WaffleChart
        label="Filtré"
        data={[
          { label: "", value: 50 },
          { label: "Bad", value: Number.NaN },
          { label: "Ok", value: 40 },
        ]}
      />,
    );
    expect(container.querySelectorAll(".st-waffleChart__legendItem").length).toBe(1);
    expect(container.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(100);
  });
});
