import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VariablePieChart } from "./VariablePieChart.js";
import type { VariablePieChartDatum } from "./VariablePieChart.js";

const data: VariablePieChartDatum[] = [
  { label: "Alpha", value: 40, z: 10 },
  { label: "Bravo", value: 25, z: 30 },
  { label: "Charlie", value: 20, z: 20 },
  { label: "Delta", value: 15, z: 50 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("VariablePieChart", () => {
  it("renders one sector per positive datum with role=img", () => {
    const wrapper = mount(VariablePieChart, { props: { label: "Ventes", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"][aria-label="Ventes"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-variablePieChart__sector").length).toBe(4);
  });

  it("summarizes label and value in the accessible list", () => {
    const wrapper = mount(VariablePieChart, { props: { label: "Ventes", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["Alpha: 40", "Bravo: 25", "Charlie: 20", "Delta: 15"]);
  });

  it("drops data with non-finite or non-positive value", () => {
    const wrapper = mount(VariablePieChart, {
      props: {
        label: "NaN",
        data: [
          { label: "A", value: NaN, z: 5 },
          { label: "B", value: -3, z: 5 },
          { label: "C", value: 10, z: 5 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["C: 10"]);
    expect(el.querySelectorAll(".st-variablePieChart__sector").length).toBe(1);
  });

  it("maps radius by z: larger z yields a larger sector radius", () => {
    const wrapper = mount(VariablePieChart, {
      props: {
        label: "Radius",
        data: [
          { label: "Small", value: 50, z: 1 },
          { label: "Big", value: 50, z: 100 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    const paths = Array.from(el.querySelectorAll<SVGPathElement>(".st-variablePieChart__sector"));
    const radiusOf = (p: SVGPathElement) => {
      const m = p.getAttribute("d")?.match(/A ([\d.]+) /);
      return m ? Number(m[1]) : 0;
    };
    expect(radiusOf(paths[1])).toBeGreaterThan(radiusOf(paths[0]));
  });

  it("applies the category tone class per sector", () => {
    const wrapper = mount(VariablePieChart, {
      props: { label: "Tone", data: [{ label: "X", value: 1, z: 1, tone: "category5" }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(
      el.querySelector(".st-variablePieChart__sector")?.classList.contains("st-variablePieChart__sector--category5"),
    ).toBe(true);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const wrapper = mount(VariablePieChart, { props: { label: "Empty", data: [] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-variablePieChart__sector").length).toBe(0);
    expect(listItems(el)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const wrapper = mount(VariablePieChart, { props: { label: "Interactive", data } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="presentation"]')).toBeNull();

    await wrapper.find(".st-variablePieChart__sector:nth-child(2)").trigger("pointermove");

    expect(el.querySelector('[role="presentation"]')).toBeTruthy();
    expect(el.querySelector(".st-variablePieChart__tooltipLabel")?.textContent).toBe("Bravo");

    await wrapper.find(".st-variablePieChart__visual").trigger("pointerleave");
    expect(el.querySelector('[role="presentation"]')).toBeNull();
  });
});
