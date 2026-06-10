import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { BellCurveChart } from "./index.js";

const sample = [62, 68, 71, 73, 74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84, 85, 86, 88, 91];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("BellCurveChart", () => {
  it("renders a non-empty normal-density curve", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Scores", data: sample } });
    const el = wrapper.element as HTMLElement;
    const line = el.querySelector(".st-bellCurveChart__line");
    const area = el.querySelector(".st-bellCurveChart__area");
    expect(line).toBeTruthy();
    expect(area).toBeTruthy();
    expect((line?.getAttribute("d") ?? "").length).toBeGreaterThan(10);
  });

  it("places the peak (mean line) close to μ on the x-axis", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Scores", data: sample, width: 480 } });
    const el = wrapper.element as HTMLElement;
    const mean = el.querySelector(".st-bellCurveChart__mean");
    expect(mean).toBeTruthy();
    const meanX = Number(mean?.getAttribute("x1"));
    const plotCenter = 44 + (480 - 44 - 16) / 2;
    expect(Math.abs(meanX - plotCenter)).toBeLessThan(1);
  });

  it("summarizes μ, σ and n in the accessible list", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Scores", data: sample } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.some((t) => t?.startsWith("Moyenne (μ):"))).toBe(true);
    expect(items.some((t) => t?.startsWith("Écart-type (σ):"))).toBe(true);
    expect(items).toContain("Taille de l'échantillon (n): 20");
  });

  it("renders an accessible empty state when n < 2 without crashing", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Vide", data: [42] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(el.querySelector(".st-bellCurveChart__area")).toBeNull();
    expect(listItems(el)).toEqual(["Échantillon insuffisant (au moins 2 valeurs requises)"]);
  });

  it("renders an accessible empty state when σ = 0 (identical values)", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Plat", data: [5, 5, 5, 5] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(listItems(el)).toEqual(["Écart-type nul (valeurs identiques)"]);
  });

  it("drops non-finite values before computing stats", () => {
    const wrapper = mount(BellCurveChart, {
      props: { label: "Filtré", data: [Number.NaN, Infinity, 10, 12, 14, 16] },
    });
    expect(listItems(wrapper.element as HTMLElement)).toContain("Taille de l'échantillon (n): 4");
  });

  it("applies the tone class to the root element", () => {
    const wrapper = mount(BellCurveChart, { props: { label: "Tone", data: sample, tone: "category3" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-bellCurveChart--category3")).toBe(true);
  });
});
