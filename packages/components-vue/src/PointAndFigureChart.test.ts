import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { PointAndFigureChart } from "./PointAndFigureChart.js";

const series = [
  { date: 0, close: 100 },
  { date: 1, close: 110 },
  { date: 2, close: 120 },
  { date: 3, close: 130 },
  { date: 4, close: 100 },
  { date: 5, close: 90 },
];

const marks = (el: HTMLElement) => Array.from(el.querySelectorAll(".st-pointAndFigureChart__mark"));

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("PointAndFigureChart", () => {
  it("renders an img role and X/O marks from the price series", () => {
    const wrapper = mount(PointAndFigureChart, { props: { data: series, boxSize: 10, reversal: 3, label: "P&F" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(marks(el).length).toBeGreaterThan(0);
  });

  it("draws X marks for the rising column", () => {
    const wrapper = mount(PointAndFigureChart, {
      props: { data: [{ date: 0, close: 100 }, { date: 1, close: 130 }], boxSize: 10, reversal: 3, label: "P" },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-pointAndFigureChart__mark--x").length).toBeGreaterThan(0);
  });

  it("switches to a column of O marks after a reversal", () => {
    const wrapper = mount(PointAndFigureChart, { props: { data: series, boxSize: 10, reversal: 3, label: "P" } });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-pointAndFigureChart__mark--o").length).toBeGreaterThan(0);
  });

  it("renders a graduated price (Y) axis with nice ticks", () => {
    const wrapper = mount(PointAndFigureChart, { props: { data: series, boxSize: 10, reversal: 3, label: "P" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-pointAndFigureChart__axis").length).toBe(2);
    expect(el.querySelectorAll(".st-pointAndFigureChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every column in the accessible data list", () => {
    const wrapper = mount(PointAndFigureChart, {
      props: { data: [{ date: 0, close: 100 }, { date: 1, close: 130 }], boxSize: 10, reversal: 3, label: "P" },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.startsWith("X")).toBe(true);
  });

  it("drops non-finite points before building columns", () => {
    const wrapper = mount(PointAndFigureChart, {
      props: {
        data: [
          { date: Number.NaN, close: 100 },
          { date: 0, close: Number.NaN },
          { date: 1, close: 100 },
          { date: 2, close: 130 },
        ],
        boxSize: 10,
        reversal: 3,
        label: "P",
      },
    });
    expect(marks(wrapper.element as HTMLElement).length).toBeGreaterThan(0);
  });

  it("merges a custom class onto the root", () => {
    const wrapper = mount(PointAndFigureChart, { props: { data: series, class: "mine" } });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("st-pointAndFigureChart")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});
