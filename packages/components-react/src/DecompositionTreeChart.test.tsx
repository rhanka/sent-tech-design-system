import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DecompositionTreeChart } from "./DecompositionTreeChart.js";

const data = {
  measure: "Revenu",
  levels: [
    {
      dimension: "Région",
      nodes: [
        { label: "Nord", value: 60 },
        { label: "Sud", value: 40 },
      ],
    },
    {
      dimension: "Canal",
      nodes: [
        { label: "Web", value: 35, parent: "Nord" },
        { label: "Magasin", value: 25, parent: "Nord" },
        { label: "Web", value: 30, parent: "Sud" },
      ],
    },
  ],
};

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("DecompositionTreeChart", () => {
  it("renders one bar per node (root + every level node)", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(container.querySelectorAll(".st-decompositionTreeChart__bar").length).toBe(6);
  });

  it("colours bars by level (categoryN cycling on the column)", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    const bars = container.querySelectorAll(".st-decompositionTreeChart__bar");
    expect(bars[0].classList.contains("st-decompositionTreeChart__bar--category1")).toBe(true);
    expect(bars[1].classList.contains("st-decompositionTreeChart__bar--category2")).toBe(true);
  });

  it("makes a bar width proportional to its value within the level", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    const bars = container.querySelectorAll<SVGRectElement>(".st-decompositionTreeChart__bar");
    const wNord = Number(bars[1].getAttribute("width"));
    const wSud = Number(bars[2].getAttribute("width"));
    expect(wNord).toBeGreaterThan(wSud);
  });

  it("places successive levels in separate columns (increasing x)", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    const bars = container.querySelectorAll<SVGRectElement>(".st-decompositionTreeChart__bar");
    const xRoot = Number(bars[0].getAttribute("x"));
    const xLevel1 = Number(bars[1].getAttribute("x"));
    const xLevel2 = Number(bars[3].getAttribute("x"));
    expect(xLevel1).toBeGreaterThan(xRoot);
    expect(xLevel2).toBeGreaterThan(xLevel1);
  });

  it("draws a link from each node to its parent", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    expect(container.querySelectorAll(".st-decompositionTreeChart__link").length).toBe(5);
  });

  it("summarises each node (indented by level) in the accessible data list", () => {
    const { container } = render(<DecompositionTreeChart label="Décompo" data={data} />);
    const items = listItems(container);
    expect(items[0]).toBe("Revenu: 100");
    expect(items[1]).toBe("·Nord: 60");
  });

  it("drops nodes with non-finite values", () => {
    const { container } = render(
      <DecompositionTreeChart
        label="Filtré"
        data={{
          measure: "Total",
          levels: [
            {
              dimension: "X",
              nodes: [
                { label: "ok", value: 6 },
                { label: "nan", value: Number.NaN },
              ],
            },
          ],
        }}
      />,
    );
    expect(container.querySelectorAll(".st-decompositionTreeChart__bar").length).toBe(2);
  });
});
