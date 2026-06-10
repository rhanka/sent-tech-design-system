import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { GanttChart } from "./GanttChart.js";

const plan = [
  { task: "Cadrage", start: 0, end: 3, category: "Étude" },
  { task: "Conception", start: 3, end: 8, category: "Étude" },
  { task: "Développement", start: 6, end: 16, category: "Build" },
  { task: "Recette", start: 14, end: 20, category: "Build" },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("GanttChart", () => {
  it("renders one bar per task", () => {
    const wrapper = mount(GanttChart, { props: { label: "Planning projet", data: plan } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-ganttChart__bar").length).toBe(plan.length);
  });

  it("colours bars by category (categoryN) and renders a legend", () => {
    const wrapper = mount(GanttChart, { props: { label: "Planning projet", data: plan } });
    const bars = (wrapper.element as HTMLElement).querySelectorAll(".st-ganttChart__bar");
    expect(bars[0].classList.contains("st-ganttChart__bar--category1")).toBe(true);
    expect(bars[1].classList.contains("st-ganttChart__bar--category1")).toBe(true);
    expect(bars[2].classList.contains("st-ganttChart__bar--category2")).toBe(true);
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-ganttChart__legendItem").length).toBe(2);
  });

  it("offsets each bar by its start (x0 = start, width = end - start)", () => {
    const wrapper = mount(GanttChart, { props: { label: "P", data: plan } });
    const bars = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(".st-ganttChart__bar");
    const x0 = Number(bars[0].getAttribute("x"));
    const w0 = Number(bars[0].getAttribute("width"));
    const x2 = Number(bars[2].getAttribute("x"));
    const w2 = Number(bars[2].getAttribute("width"));
    expect(x2).toBeGreaterThan(x0);
    expect(w2).toBeGreaterThan(w0);
  });

  it("draws a vertical marker when `marker` is provided", () => {
    const wrapper = mount(GanttChart, { props: { label: "P", data: plan, marker: 10 } });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-ganttChart__marker").length).toBe(1);
  });

  it("normalises start > end and summarises task → start → end in the accessible list", () => {
    const wrapper = mount(GanttChart, {
      props: { label: "P", data: [{ task: "Inversée", start: 9, end: 4 }] },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("Inversée: 4 → 9");
  });

  it("drops non-finite or unlabeled tasks before rendering", () => {
    const wrapper = mount(GanttChart, {
      props: {
        label: "Filtré",
        data: [
          { task: "Bad", start: Number.NaN, end: 5 },
          { task: "", start: 1, end: 2 },
          { task: "Ok", start: 2, end: 6 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-ganttChart__bar").length).toBe(1);
  });
});
