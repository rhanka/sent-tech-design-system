import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ContourChart } from "./ContourChart.js";

const grid = [
  { x: 0, y: 0, value: 1 },
  { x: 1, y: 0, value: 2 },
  { x: 0, y: 1, value: 3 },
  { x: 1, y: 1, value: 4 },
];

const cells = (el: HTMLElement) => Array.from(el.querySelectorAll(".st-contourChart__cell"));

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ContourChart", () => {
  it("renders an img role and one cell per datum", () => {
    const wrapper = mount(ContourChart, { props: { data: grid, label: "Relief" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(cells(el).length).toBe(4);
  });

  it("colours cells by value band (largest value → category8)", () => {
    const wrapper = mount(ContourChart, { props: { data: grid, label: "C" } });
    const last = cells(wrapper.element as HTMLElement).at(-1) as Element;
    expect(last.classList.contains("st-contourChart__cell--category8")).toBe(true);
  });

  it("renders graduated X/Y axes with nice ticks", () => {
    const wrapper = mount(ContourChart, { props: { data: grid, label: "C" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-contourChart__axis").length).toBe(2);
    expect(el.querySelectorAll(".st-contourChart__tick").length).toBeGreaterThan(0);
  });

  it("renders a level legend ramp", () => {
    const wrapper = mount(ContourChart, { props: { data: grid, levels: 4, label: "C" } });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-contourChart__legendSwatch").length).toBe(4);
  });

  it("lists every datum in the accessible data list", () => {
    const wrapper = mount(ContourChart, {
      props: { data: [{ x: 2, y: 3, value: 5 }], label: "C" },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("x 2, y 3 · 5");
  });

  it("drops non-finite points before rendering", () => {
    const wrapper = mount(ContourChart, {
      props: {
        data: [
          { x: Number.NaN, y: 0, value: 1 },
          { x: 0, y: 0, value: Number.NaN },
          { x: 1, y: 1, value: 2 },
        ],
        label: "C",
      },
    });
    expect(cells(wrapper.element as HTMLElement).length).toBe(1);
  });

  it("merges a custom class onto the root", () => {
    const wrapper = mount(ContourChart, { props: { data: grid, class: "mine" } });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("st-contourChart")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});
