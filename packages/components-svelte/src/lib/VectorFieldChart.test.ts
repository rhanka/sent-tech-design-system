import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import VectorFieldChart from "./VectorFieldChart.svelte";

const field = [
  { x: 0, y: 0, length: 1, direction: 0 },
  { x: 1, y: 0, length: 2, direction: 90 },
  { x: 0, y: 1, length: 3, direction: 180 },
  { x: 1, y: 1, length: 4, direction: 270 }
];

const arrows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-vectorFieldChart__arrow"));

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

const structuralClass = (el: Element) => el.className.split(/\s+/)[0];

describe("VectorFieldChart", () => {
  it("renders an img role and one arrow per datum", () => {
    const { container } = render(VectorFieldChart, { props: { data: field, label: "Vent" } });
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(arrows(container).length).toBe(4);
  });

  it("draws a shaft and two head segments per arrow", () => {
    const { container } = render(VectorFieldChart, { props: { data: field, label: "V" } });
    expect(container.querySelectorAll(".st-vectorFieldChart__shaft").length).toBe(4);
    expect(container.querySelectorAll(".st-vectorFieldChart__head").length).toBe(8);
  });

  it("colours arrows by magnitude bin (largest magnitude → category8)", () => {
    const { container } = render(VectorFieldChart, { props: { data: field, label: "V" } });
    const last = arrows(container).at(-1) as Element;
    expect(last.classList.contains("st-vectorFieldChart__arrow--category8")).toBe(true);
  });

  it("renders graduated X/Y axes with nice ticks", () => {
    const { container } = render(VectorFieldChart, { props: { data: field, label: "V" } });
    expect(container.querySelectorAll(".st-vectorFieldChart__axis").length).toBe(2);
    expect(container.querySelectorAll(".st-vectorFieldChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every datum in the accessible data list", () => {
    const { container } = render(VectorFieldChart, {
      props: { data: [{ x: 2, y: 3, length: 5, direction: 45 }], label: "V" }
    });
    expect(listItems(container)[0]).toBe("x 2, y 3 · |v| 5 @ 45°");
  });

  it("drops non-finite or negative-magnitude points before rendering", () => {
    const { container } = render(VectorFieldChart, {
      props: {
        data: [
          { x: Number.NaN, y: 0, length: 1, direction: 0 },
          { x: 0, y: 0, length: -1, direction: 0 },
          { x: 1, y: 1, length: 2, direction: 0 }
        ],
        label: "V"
      }
    });
    expect(arrows(container).length).toBe(1);
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(VectorFieldChart, { props: { data: field, class: "mine" } });
    const root = container.querySelector(".st-vectorFieldChart") as HTMLElement;
    expect(structuralClass(root)).toBe("st-vectorFieldChart");
    expect(root.classList.contains("mine")).toBe(true);
  });
});
