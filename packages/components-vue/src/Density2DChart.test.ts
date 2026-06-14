import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Density2DChart } from "./Density2DChart.js";

const data = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 1 },
  { x: 9, y: 9 },
  { x: 5, y: 5 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("Density2DChart", () => {
  it("renders a non-empty grid of density cells", () => {
    const wrapper = mount(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-density2DChart__cell").length).toBeGreaterThan(0);
  });

  it("only emits cells for non-empty bins (sparse rendering)", () => {
    const wrapper = mount(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    const cells = (wrapper.element as HTMLElement).querySelectorAll(".st-density2DChart__cell");
    expect(cells.length).toBeLessThan(25);
  });

  it("colours the densest bin at the high end of the ramp", () => {
    const wrapper = mount(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    const cells = Array.from(
      (wrapper.element as HTMLElement).querySelectorAll(".st-density2DChart__cell"),
    );
    const hasTopTone = cells.some((c) =>
      c.classList.contains("st-density2DChart__cell--category8"),
    );
    expect(hasTopTone).toBe(true);
  });

  it("respects the weight of each point when summing density", () => {
    const wrapper = mount(Density2DChart, {
      props: {
        label: "Pondéré",
        bins: 4,
        data: [
          { x: 0, y: 0, weight: 10 },
          { x: 9, y: 9, weight: 1 },
        ],
      },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.some((t) => t?.endsWith(": 10"))).toBe(true);
  });

  it("renders a Low→High legend ramp of eight swatches", () => {
    const wrapper = mount(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-density2DChart__legend")).toBeTruthy();
    expect(el.querySelectorAll(".st-density2DChart__legendSwatch").length).toBe(8);
  });

  it("renders X and Y axes", () => {
    const wrapper = mount(Density2DChart, { props: { label: "Densité", data, bins: 5 } });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-density2DChart__axis").length).toBe(2);
  });

  it("drops points with non-finite coordinates", () => {
    const wrapper = mount(Density2DChart, {
      props: {
        label: "Filtré",
        bins: 4,
        data: [
          { x: 0, y: 0 },
          { x: 9, y: 9 },
          { x: Number.NaN, y: 2 },
          { x: 3, y: Number.POSITIVE_INFINITY },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-density2DChart__cell").length).toBe(2);
  });
});
