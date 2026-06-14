import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { RibbonChart } from "./RibbonChart.js";

const data = [
  { category: "Card", period: "Q1", value: 42 },
  { category: "Transfer", period: "Q1", value: 30 },
  { category: "Wallet", period: "Q1", value: 18 },
  { category: "Card", period: "Q2", value: 35 },
  { category: "Transfer", period: "Q2", value: 41 },
  { category: "Wallet", period: "Q2", value: 24 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("RibbonChart", () => {
  it("renders one segment per datum across all periods", () => {
    const wrapper = mount(RibbonChart, { props: { label: "Rang", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-ribbonChart__seg").length).toBe(6);
  });

  it("links shared categories between consecutive periods with ribbons", () => {
    const wrapper = mount(RibbonChart, { props: { label: "Rang", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-ribbonChart__ribbon").length).toBe(3);
    expect(el.querySelectorAll(".st-ribbonChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per category when no tone is given", () => {
    const wrapper = mount(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Card", period: "Q1", value: 10 },
          { category: "Transfer", period: "Q1", value: 5 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-ribbonChart__seg--category1")).toBeTruthy();
    expect(el.querySelector(".st-ribbonChart__seg--category2")).toBeTruthy();
  });

  it("honours an explicit tone on a category", () => {
    const wrapper = mount(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Card", period: "Q1", value: 10, tone: "category5" as const },
          { category: "Card", period: "Q2", value: 8, tone: "category5" as const },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-ribbonChart__seg--category5")).toBeTruthy();
    expect(el.querySelector(".st-ribbonChart__ribbon--category5")).toBeTruthy();
  });

  it("ranks the largest category at the foot of each period", () => {
    const wrapper = mount(RibbonChart, {
      props: {
        label: "Rang",
        data: [
          { category: "Small", period: "Q1", value: 10 },
          { category: "Big", period: "Q1", value: 90 },
        ],
      },
    });
    const segs = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(".st-ribbonChart__seg");
    const ys = Array.from(segs).map((s) => Number(s.getAttribute("y")));
    const heights = Array.from(segs).map((s) => Number(s.getAttribute("height")));
    const bottomIndex = ys.indexOf(Math.max(...ys));
    expect(heights[bottomIndex]).toBe(Math.max(...heights));
  });

  it("summarises each category in the accessible data list", () => {
    const wrapper = mount(RibbonChart, { props: { label: "Rang", data } });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("Card: Q1 = 42, Q2 = 35");
  });

  it("drops unlabeled categories and non-finite values before rendering", () => {
    const wrapper = mount(RibbonChart, {
      props: {
        label: "Filtré",
        data: [
          { category: "", period: "Q1", value: 10 },
          { category: "Card", period: "Q1", value: Number.NaN },
          { category: "Card", period: "Q1", value: 12 },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-ribbonChart__seg").length).toBe(1);
  });
});
