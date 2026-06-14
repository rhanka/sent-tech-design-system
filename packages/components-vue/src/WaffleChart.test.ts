import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WaffleChart } from "./WaffleChart.js";

const market = [
  { label: "Chrome", value: 65 },
  { label: "Safari", value: 20 },
  { label: "Firefox", value: 15 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("WaffleChart", () => {
  it("renders totalCells cells in the grid", () => {
    const wrapper = mount(WaffleChart, { props: { label: "Parts de marché", data: market } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-waffleChart__cell").length).toBe(100);
  });

  it("allocates a proportional number of coloured cells per category", () => {
    const wrapper = mount(WaffleChart, { props: { label: "Parts de marché", data: market, totalCells: 100 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(65);
    expect(el.querySelectorAll(".st-waffleChart__cell--category2").length).toBe(20);
    expect(el.querySelectorAll(".st-waffleChart__cell--category3").length).toBe(15);
  });

  it("uses explicit tones and renders a category legend", () => {
    const wrapper = mount(WaffleChart, {
      props: {
        label: "Statut",
        data: [
          { label: "Réussi", value: 80, tone: "success" },
          { label: "Échoué", value: 20, tone: "error" },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-waffleChart__cell--success").length).toBe(80);
    expect(el.querySelectorAll(".st-waffleChart__cell--error").length).toBe(20);
    expect(el.querySelectorAll(".st-waffleChart__legendItem").length).toBe(2);
  });

  it("colours all cells once the values sum to the grid", () => {
    const wrapper = mount(WaffleChart, {
      props: { label: "Partiel", data: [{ label: "A", value: 30 }, { label: "B", value: 10 }], totalCells: 100 },
    });
    const el = wrapper.element as HTMLElement;
    const track = el.querySelectorAll(".st-waffleChart__cell--track").length;
    const coloured = el.querySelectorAll(".st-waffleChart__cell").length - track;
    expect(coloured).toBe(100);
  });

  it("summarises each category in the accessible data list", () => {
    const wrapper = mount(WaffleChart, { props: { label: "Parts", data: market } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("Chrome: 65 (65%)");
    expect(items[1]).toBe("Safari: 20 (20%)");
  });

  it("drops unlabeled or non-positive categories before rendering", () => {
    const wrapper = mount(WaffleChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "", value: 50 },
          { label: "Bad", value: Number.NaN },
          { label: "Ok", value: 40 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-waffleChart__legendItem").length).toBe(1);
    expect(el.querySelectorAll(".st-waffleChart__cell--category1").length).toBe(100);
  });
});
