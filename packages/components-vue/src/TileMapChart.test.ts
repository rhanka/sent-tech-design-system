import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { TileMapChart } from "./TileMapChart.js";
import type { TileMapChartTile } from "./TileMapChart.js";

const data: TileMapChartTile[] = [
  { label: "AB", col: 0, row: 0, value: 10 },
  { label: "BC", col: 1, row: 0, value: 40 },
  { label: "ON", col: 0, row: 1, value: 90 },
  { label: "QC", col: 1, row: 1, value: 65 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("TileMapChart", () => {
  it("renders one tile per datum with role=img", () => {
    const wrapper = mount(TileMapChart, { props: { label: "Régions", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"][aria-label="Régions"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-tileMapChart__tile").length).toBe(4);
  });

  it("summarizes label and value in the accessible list", () => {
    const wrapper = mount(TileMapChart, { props: { label: "Régions", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["AB: 10", "BC: 40", "ON: 90", "QC: 65"]);
  });

  it("colors the lowest value with category1 and the highest with category8", () => {
    const wrapper = mount(TileMapChart, { props: { label: "Échelle", data } });
    const el = wrapper.element as HTMLElement;
    const tiles = Array.from(el.querySelectorAll(".st-tileMapChart__tile"));
    expect(tiles[0].classList.contains("st-tileMapChart__tile--category1")).toBe(true);
    expect(tiles[2].classList.contains("st-tileMapChart__tile--category8")).toBe(true);
  });

  it("drops tiles with non-finite col, row, or value", () => {
    const wrapper = mount(TileMapChart, {
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
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["D: 7"]);
    expect(el.querySelectorAll(".st-tileMapChart__tile").length).toBe(1);
  });

  it("renders a gradient legend", () => {
    const wrapper = mount(TileMapChart, { props: { label: "Légende", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-tileMapChart__legendSwatch").length).toBe(8);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const wrapper = mount(TileMapChart, { props: { label: "Empty", data: [] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-tileMapChart__tile").length).toBe(0);
    expect(listItems(el)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const wrapper = mount(TileMapChart, { props: { label: "Interactive", data } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="presentation"]')).toBeNull();

    await wrapper.findAll(".st-tileMapChart__tile")[2].trigger("pointermove");

    expect(el.querySelector('[role="presentation"]')).toBeTruthy();
    expect(el.querySelector(".st-tileMapChart__tooltipLabel")?.textContent).toBe("ON");

    await wrapper.find(".st-tileMapChart__visual").trigger("pointerleave");
    expect(el.querySelector('[role="presentation"]')).toBeNull();
  });
});
