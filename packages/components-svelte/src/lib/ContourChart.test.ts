import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ContourChart from "./ContourChart.svelte";

// Grille 2×2 régulière, valeurs croissantes.
const grid = [
  { x: 0, y: 0, value: 1 },
  { x: 1, y: 0, value: 2 },
  { x: 0, y: 1, value: 3 },
  { x: 1, y: 1, value: 4 }
];

const cells = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-contourChart__cell"));

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

const structuralClass = (el: Element) => el.className.split(/\s+/)[0];

describe("ContourChart", () => {
  it("renders an img role and one cell per datum", () => {
    const { container } = render(ContourChart, { props: { data: grid, label: "Relief" } });
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(cells(container).length).toBe(4);
  });

  it("colours cells by value band (largest value → category8)", () => {
    const { container } = render(ContourChart, { props: { data: grid, label: "C" } });
    const last = cells(container).at(-1) as Element;
    expect(last.classList.contains("st-contourChart__cell--category8")).toBe(true);
  });

  it("renders graduated X/Y axes with nice ticks", () => {
    const { container } = render(ContourChart, { props: { data: grid, label: "C" } });
    expect(container.querySelectorAll(".st-contourChart__axis").length).toBe(2);
    expect(container.querySelectorAll(".st-contourChart__tick").length).toBeGreaterThan(0);
  });

  it("renders a level legend ramp", () => {
    const { container } = render(ContourChart, { props: { data: grid, levels: 4, label: "C" } });
    expect(container.querySelectorAll(".st-contourChart__legendSwatch").length).toBe(4);
  });

  it("lists every datum in the accessible data list", () => {
    const { container } = render(ContourChart, {
      props: { data: [{ x: 2, y: 3, value: 5 }], label: "C" }
    });
    expect(listItems(container)[0]).toBe("x 2, y 3 · 5");
  });

  it("drops non-finite points before rendering", () => {
    const { container } = render(ContourChart, {
      props: {
        data: [
          { x: Number.NaN, y: 0, value: 1 },
          { x: 0, y: 0, value: Number.NaN },
          { x: 1, y: 1, value: 2 }
        ],
        label: "C"
      }
    });
    expect(cells(container).length).toBe(1);
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(ContourChart, { props: { data: grid, class: "mine" } });
    const root = container.querySelector(".st-contourChart") as HTMLElement;
    expect(structuralClass(root)).toBe("st-contourChart");
    expect(root.classList.contains("mine")).toBe(true);
  });
});
