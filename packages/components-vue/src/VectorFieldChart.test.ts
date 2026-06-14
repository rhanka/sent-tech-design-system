import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VectorFieldChart } from "./VectorFieldChart.js";

const field = [
  { x: 0, y: 0, length: 1, direction: 0 },
  { x: 1, y: 0, length: 2, direction: 90 },
  { x: 0, y: 1, length: 3, direction: 180 },
  { x: 1, y: 1, length: 4, direction: 270 },
];

const arrows = (el: HTMLElement) => Array.from(el.querySelectorAll(".st-vectorFieldChart__arrow"));

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("VectorFieldChart", () => {
  it("renders an img role and one arrow per datum", () => {
    const wrapper = mount(VectorFieldChart, { props: { data: field, label: "Vent" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(arrows(el).length).toBe(4);
  });

  it("draws a shaft and two head segments per arrow", () => {
    const wrapper = mount(VectorFieldChart, { props: { data: field, label: "V" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-vectorFieldChart__shaft").length).toBe(4);
    expect(el.querySelectorAll(".st-vectorFieldChart__head").length).toBe(8);
  });

  it("colours arrows by magnitude bin (largest magnitude → category8)", () => {
    const wrapper = mount(VectorFieldChart, { props: { data: field, label: "V" } });
    const last = arrows(wrapper.element as HTMLElement).at(-1) as Element;
    expect(last.classList.contains("st-vectorFieldChart__arrow--category8")).toBe(true);
  });

  it("renders graduated X/Y axes with nice ticks", () => {
    const wrapper = mount(VectorFieldChart, { props: { data: field, label: "V" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-vectorFieldChart__axis").length).toBe(2);
    expect(el.querySelectorAll(".st-vectorFieldChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every datum in the accessible data list", () => {
    const wrapper = mount(VectorFieldChart, {
      props: { data: [{ x: 2, y: 3, length: 5, direction: 45 }], label: "V" },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("x 2, y 3 · |v| 5 @ 45°");
  });

  it("drops non-finite or negative-magnitude points before rendering", () => {
    const wrapper = mount(VectorFieldChart, {
      props: {
        data: [
          { x: Number.NaN, y: 0, length: 1, direction: 0 },
          { x: 0, y: 0, length: -1, direction: 0 },
          { x: 1, y: 1, length: 2, direction: 0 },
        ],
        label: "V",
      },
    });
    expect(arrows(wrapper.element as HTMLElement).length).toBe(1);
  });

  it("merges a custom class onto the root", () => {
    const wrapper = mount(VectorFieldChart, { props: { data: field, class: "mine" } });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("st-vectorFieldChart")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});
