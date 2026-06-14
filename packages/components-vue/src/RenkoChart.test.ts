import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { RenkoChart } from "./RenkoChart.js";

const series = [
  { date: 0, close: 100 },
  { date: 1, close: 110 },
  { date: 2, close: 120 },
  { date: 3, close: 130 },
  { date: 4, close: 120 },
  { date: 5, close: 110 },
];

const bricks = (el: HTMLElement) => Array.from(el.querySelectorAll(".st-renkoChart__brick"));

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("RenkoChart", () => {
  it("renders an img role and bricks from the price series", () => {
    const wrapper = mount(RenkoChart, { props: { data: series, boxSize: 10, label: "Renko" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(bricks(el).length).toBeGreaterThan(0);
  });

  it("forms one up-brick per box crossing on a rising series", () => {
    const wrapper = mount(RenkoChart, {
      props: { data: [{ date: 0, close: 100 }, { date: 1, close: 130 }], boxSize: 10, label: "R" },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-renkoChart__brick--up").length).toBe(3);
  });

  it("colours descending bricks with the down tone", () => {
    const wrapper = mount(RenkoChart, { props: { data: series, boxSize: 10, label: "R" } });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-renkoChart__brick--down").length).toBeGreaterThan(0);
  });

  it("renders a graduated price (Y) axis with nice ticks", () => {
    const wrapper = mount(RenkoChart, { props: { data: series, boxSize: 10, label: "R" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-renkoChart__axis").length).toBe(2);
    expect(el.querySelectorAll(".st-renkoChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every brick in the accessible data list", () => {
    const wrapper = mount(RenkoChart, {
      props: { data: [{ date: 0, close: 100 }, { date: 1, close: 110 }], boxSize: 10, label: "R" },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("▲ 100 → 110");
  });

  it("drops non-finite points before building bricks", () => {
    const wrapper = mount(RenkoChart, {
      props: {
        data: [
          { date: Number.NaN, close: 100 },
          { date: 0, close: Number.NaN },
          { date: 1, close: 100 },
          { date: 2, close: 120 },
        ],
        boxSize: 10,
        label: "R",
      },
    });
    expect(bricks(wrapper.element as HTMLElement).length).toBe(2);
  });

  it("merges a custom class onto the root", () => {
    const wrapper = mount(RenkoChart, { props: { data: series, class: "mine" } });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("st-renkoChart")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});
