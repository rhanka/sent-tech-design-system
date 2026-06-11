import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ColumnPyramidChart } from "./ColumnPyramidChart.js";
import type { ColumnPyramidChartDatum } from "./ColumnPyramidChart.js";

// ColumnPyramidChart : colonnes triangulaires (base sur l'axe X, sommet à la valeur).
const data: ColumnPyramidChartDatum[] = [
  { category: "Q1", value: 40, tone: "category1" },
  { category: "Q2", value: 25, tone: "category2" },
  { category: "Q3", value: 60, tone: "category3" },
  { category: "Q4", value: 15, tone: "category4" },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ColumnPyramidChart", () => {
  it("renders one triangular polygon per datum with role=img", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Ventes", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"][aria-label="Ventes"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-columnPyramidChart__column").length).toBe(4);
  });

  it("draws each column as a triangle: 3 points, base on the X axis, apex centred at the value", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Ventes", data } });
    const el = wrapper.element as HTMLElement;
    const cols = el.querySelectorAll<SVGPolygonElement>(".st-columnPyramidChart__column");
    const pts = cols[0].getAttribute("points")?.trim().split(/\s+/) ?? [];
    expect(pts.length).toBe(3);
    const coords = pts.map((p) => p.split(",").map(Number));
    const [baseLeft, baseRight, apex] = coords;
    expect(baseLeft[1]).toBeCloseTo(baseRight[1]);
    expect(apex[1]).toBeLessThan(baseLeft[1]);
    expect(apex[0]).toBeCloseTo((baseLeft[0] + baseRight[0]) / 2);
  });

  it("makes a larger value reach a higher apex (smaller apex Y)", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Ventes", data } });
    const el = wrapper.element as HTMLElement;
    const cols = el.querySelectorAll<SVGPolygonElement>(".st-columnPyramidChart__column");
    const apexY = (c: SVGPolygonElement) =>
      Number(c.getAttribute("points")?.trim().split(/\s+/)[2].split(",")[1]);
    expect(apexY(cols[2])).toBeLessThan(apexY(cols[3]));
  });

  it("applies the category tone class per column", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Tone", data } });
    const el = wrapper.element as HTMLElement;
    const cols = el.querySelectorAll(".st-columnPyramidChart__column");
    expect(cols[0].classList.contains("st-columnPyramidChart__column--category1")).toBe(true);
    expect(cols[2].classList.contains("st-columnPyramidChart__column--category3")).toBe(true);
  });

  it("falls back to the component-level tone when a datum has none", () => {
    const wrapper = mount(ColumnPyramidChart, {
      props: { label: "Tone", tone: "category5", data: [{ category: "X", value: 10 }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(
      el.querySelector(".st-columnPyramidChart__column")?.classList.contains("st-columnPyramidChart__column--category5"),
    ).toBe(true);
  });

  it("summarizes category and value in the accessible list", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Ventes", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["Q1: 40", "Q2: 25", "Q3: 60", "Q4: 15"]);
  });

  it("drops data with non-finite or non-positive value", () => {
    const wrapper = mount(ColumnPyramidChart, {
      props: {
        label: "Filtré",
        data: [
          { category: "A", value: NaN },
          { category: "B", value: -3 },
          { category: "C", value: 0 },
          { category: "D", value: 12 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["D: 12"]);
    expect(el.querySelectorAll(".st-columnPyramidChart__column").length).toBe(1);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Empty", data: [] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-columnPyramidChart__column").length).toBe(0);
    expect(listItems(el)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const wrapper = mount(ColumnPyramidChart, { props: { label: "Interactive", data } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="presentation"]')).toBeNull();

    const cols = wrapper.findAll(".st-columnPyramidChart__column");
    await cols[2].trigger("pointermove");

    expect(el.querySelector('[role="presentation"]')).toBeTruthy();
    expect(el.querySelector(".st-columnPyramidChart__tooltipLabel")?.textContent).toBe("Q3");

    await wrapper.find(".st-columnPyramidChart__visual").trigger("pointerleave");
    expect(el.querySelector('[role="presentation"]')).toBeNull();
  });
});
