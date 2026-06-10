import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import GanttChart from "./lib/GanttChart.svelte";

// Planning : une ligne par tâche, barre start→end sur un axe temporel commun.
const plan = [
  { task: "Cadrage", start: 0, end: 3, category: "Étude" },
  { task: "Conception", start: 3, end: 8, category: "Étude" },
  { task: "Développement", start: 6, end: 16, category: "Build" },
  { task: "Recette", start: 14, end: 20, category: "Build" }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("GanttChart", () => {
  it("renders one bar per task", () => {
    const { container } = render(GanttChart, { props: { label: "Planning projet", data: plan } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-ganttChart__bar").length).toBe(plan.length);
  });

  it("colours bars by category (categoryN) and renders a legend", () => {
    const { container } = render(GanttChart, { props: { label: "Planning projet", data: plan } });
    const bars = container.querySelectorAll(".st-ganttChart__bar");
    // Étude → category1, Build → category2 (ordre d'apparition)
    expect(bars[0].classList.contains("st-ganttChart__bar--category1")).toBe(true);
    expect(bars[1].classList.contains("st-ganttChart__bar--category1")).toBe(true);
    expect(bars[2].classList.contains("st-ganttChart__bar--category2")).toBe(true);
    // légende des deux catégories distinctes
    expect(container.querySelectorAll(".st-ganttChart__legendItem").length).toBe(2);
  });

  it("offsets each bar by its start (x0 = start, width = end - start)", () => {
    const { container } = render(GanttChart, { props: { label: "P", data: plan } });
    const bars = container.querySelectorAll<SVGRectElement>(".st-ganttChart__bar");
    const x0 = Number(bars[0].getAttribute("x"));
    const w0 = Number(bars[0].getAttribute("width"));
    const x2 = Number(bars[2].getAttribute("x"));
    // Cadrage commence à 0 (collé à l'axe), Développement commence plus loin (start 6).
    expect(x2).toBeGreaterThan(x0);
    // Développement (durée 10) est plus large que Cadrage (durée 3).
    const w2 = Number(bars[2].getAttribute("width"));
    expect(w2).toBeGreaterThan(w0);
  });

  it("draws a vertical marker when `marker` is provided", () => {
    const { container } = render(GanttChart, { props: { label: "P", data: plan, marker: 10 } });
    expect(container.querySelectorAll(".st-ganttChart__marker").length).toBe(1);
  });

  it("normalises start > end and summarises task → start → end in the accessible list", () => {
    const { container } = render(GanttChart, {
      props: { label: "P", data: [{ task: "Inversée", start: 9, end: 4 }] }
    });
    const items = listItems(container);
    expect(items[0]).toBe("Inversée: 4 → 9");
  });

  it("drops non-finite or unlabeled tasks before rendering", () => {
    const { container } = render(GanttChart, {
      props: {
        label: "Filtré",
        data: [
          { task: "Bad", start: Number.NaN, end: 5 },
          { task: "", start: 1, end: 2 },
          { task: "Ok", start: 2, end: 6 }
        ]
      }
    });
    expect(container.querySelectorAll(".st-ganttChart__bar").length).toBe(1);
  });
});
