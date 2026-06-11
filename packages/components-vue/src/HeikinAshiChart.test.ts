import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { HeikinAshiChart } from "./HeikinAshiChart.js";

// Données OHLC brutes ; les valeurs Heikin-Ashi sont RECALCULÉES.
// Lun : close brut 108 ≥ open 100 (haussier brut) MAIS haClose 103.25 < haOpen 104 → baisse HA.
const week = [
  { label: "Lun", open: 100, high: 110, low: 95, close: 108 },
  { label: "Mar", open: 108, high: 112, low: 104, close: 106 },
  { label: "Mer", open: 106, high: 109, low: 99, close: 101 },
  { label: "Jeu", open: 101, high: 107, low: 100, close: 105 },
  { label: "Ven", open: 105, high: 115, low: 104, close: 113 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("HeikinAshiChart", () => {
  it("renders one body and one wick per period", () => {
    const wrapper = mount(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-heikinAshiChart__body").length).toBe(week.length);
    expect(el.querySelectorAll(".st-heikinAshiChart__wick").length).toBe(week.length);
  });

  it("colours each body by Heikin-Ashi haClose vs haOpen, not raw OHLC", () => {
    const wrapper = mount(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const bodies = (wrapper.element as HTMLElement).querySelectorAll(".st-heikinAshiChart__body");
    // Lun : haussier brut MAIS baisse HA
    expect(bodies[0].classList.contains("st-heikinAshiChart__body--down")).toBe(true);
    expect(bodies[0].classList.contains("st-heikinAshiChart__body--up")).toBe(false);
    expect(bodies[1].classList.contains("st-heikinAshiChart__body--up")).toBe(true);
    expect(bodies[2].classList.contains("st-heikinAshiChart__body--down")).toBe(true);
    expect(bodies[4].classList.contains("st-heikinAshiChart__body--up")).toBe(true);
  });

  it("colours wicks consistently with their body direction", () => {
    const wrapper = mount(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const wicks = (wrapper.element as HTMLElement).querySelectorAll(".st-heikinAshiChart__wick");
    expect(wicks[0].classList.contains("st-heikinAshiChart__wick--down")).toBe(true);
    expect(wicks[1].classList.contains("st-heikinAshiChart__wick--up")).toBe(true);
  });

  it("summarizes RECALCULATED Heikin-Ashi O/H/L/C per period in the accessible list", () => {
    const wrapper = mount(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(week.length);
    expect(items[0]).toBe("Lun: O 104 H 110 L 95 C 103.25");
    expect(items[1]).toBe("Mar: O 103.63 H 112 L 103.63 C 107.50");
  });

  it("drops non-finite periods before computing Heikin-Ashi", () => {
    const wrapper = mount(HeikinAshiChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "Bad", open: Number.NaN, high: 10, low: 1, close: 5 },
          { label: "Ok", open: 4, high: 8, low: 2, close: 6 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-heikinAshiChart__body").length).toBe(1);
    const items = listItems(el);
    expect(items[0]).toBe("Ok: O 5 H 8 L 2 C 5");
  });
});
