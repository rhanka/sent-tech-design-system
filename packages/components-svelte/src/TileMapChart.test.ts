import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TileMapChart from "./lib/TileMapChart.svelte";
import type { TileMapChartTile } from "./lib/TileMapChart.svelte";

const data: TileMapChartTile[] = [
  { label: "AB", col: 0, row: 0, value: 10 },
  { label: "BC", col: 1, row: 0, value: 40 },
  { label: "ON", col: 0, row: 1, value: 90 },
  { label: "QC", col: 1, row: 1, value: 65 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("TileMapChart", () => {
  it("renders one tile per datum with role=img", () => {
    const { container } = render(TileMapChart, { props: { label: "Régions", data } });
    expect(screen.getByRole("img", { name: "Régions" })).toBeTruthy();
    expect(container.querySelectorAll(".st-tileMapChart__tile").length).toBe(4);
  });

  it("summarizes label and value in the accessible list", () => {
    const { container } = render(TileMapChart, { props: { label: "Régions", data } });
    expect(listItems(container)).toEqual(["AB: 10", "BC: 40", "ON: 90", "QC: 65"]);
  });

  it("colors the lowest value with category1 and the highest with category8", () => {
    const { container } = render(TileMapChart, { props: { label: "Échelle", data } });
    const tiles = Array.from(container.querySelectorAll(".st-tileMapChart__tile"));
    expect(tiles[0].classList.contains("st-tileMapChart__tile--category1")).toBe(true);
    expect(tiles[2].classList.contains("st-tileMapChart__tile--category8")).toBe(true);
  });

  it("drops tiles with non-finite col, row, or value", () => {
    const { container } = render(TileMapChart, {
      props: {
        label: "NaN",
        data: [
          { label: "A", col: NaN, row: 0, value: 5 },
          { label: "B", col: 0, row: Infinity, value: 5 },
          { label: "C", col: 1, row: 0, value: NaN },
          { label: "D", col: 0, row: 0, value: 7 },
        ],
      },
    });
    expect(listItems(container)).toEqual(["D: 7"]);
    expect(container.querySelectorAll(".st-tileMapChart__tile").length).toBe(1);
  });

  it("renders a gradient legend", () => {
    const { container } = render(TileMapChart, { props: { label: "Légende", data } });
    expect(container.querySelectorAll(".st-tileMapChart__legendSwatch").length).toBe(8);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const { container } = render(TileMapChart, { props: { label: "Empty", data: [] } });
    expect(container.querySelectorAll(".st-tileMapChart__tile").length).toBe(0);
    expect(listItems(container)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const { container } = render(TileMapChart, { props: { label: "Interactive", data } });

    expect(screen.queryByRole("presentation")).toBeNull();

    const tiles = container.querySelectorAll(".st-tileMapChart__tile");
    await fireEvent.pointerMove(tiles[2]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(container.querySelector(".st-tileMapChart__tooltipLabel")?.textContent).toBe("ON");

    await fireEvent.pointerLeave(container.querySelector(".st-tileMapChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
