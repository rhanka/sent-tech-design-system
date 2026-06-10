import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreamgraphChart } from "./index.js";

const months = [
  { category: "Jan", values: [ { label: "Direct", value: 30 }, { label: "Référé", value: 18 }, { label: "Social", value: 12 } ] },
  { category: "Fév", values: [ { label: "Direct", value: 34 }, { label: "Référé", value: 22 }, { label: "Social", value: 16 } ] },
  { category: "Mar", values: [ { label: "Direct", value: 28 }, { label: "Référé", value: 26 }, { label: "Social", value: 22 } ] },
  { category: "Avr", values: [ { label: "Direct", value: 36 }, { label: "Référé", value: 24 }, { label: "Social", value: 30 } ] },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StreamgraphChart", () => {
  it("renders one smoothed area per series", () => {
    const { container } = render(<StreamgraphChart label="Trafic" data={months} />);
    expect(container.querySelectorAll(".st-streamgraphChart__area").length).toBe(3);
  });

  it("each area path has a non-empty d attribute", () => {
    const { container } = render(<StreamgraphChart label="Trafic" data={months} />);
    const areas = container.querySelectorAll(".st-streamgraphChart__area");
    areas.forEach((a) => {
      const d = a.getAttribute("d") ?? "";
      expect(d.length).toBeGreaterThan(0);
      expect(d.startsWith("M")).toBe(true);
      expect(d.trimEnd().endsWith("Z")).toBe(true);
    });
  });

  it("applies the streamgraph class on the area path", () => {
    const { container } = render(<StreamgraphChart label="Trafic" data={months} />);
    const area = container.querySelector(".st-streamgraphChart__area") as SVGPathElement;
    expect(area.classList.contains("st-streamgraphChart__area")).toBe(true);
    expect(area.classList.contains("st-streamgraphChart__area--category1")).toBe(true);
  });

  it("renders a legend item per series", () => {
    const { container } = render(<StreamgraphChart label="Trafic" data={months} />);
    expect(container.querySelectorAll(".st-streamgraphChart__legend .st-streamgraphChart__legendItem").length).toBe(3);
  });

  it("summarizes each series total and the grand total in the accessible list", () => {
    const { container } = render(<StreamgraphChart label="Trafic" data={months} />);
    const items = listItems(container);
    expect(items.length).toBe(4);
    expect(items[0]).toBe("Direct: 128");
    expect(items[items.length - 1]).toBe("Total: 298");
  });

  it("clamps negative and non-finite values to 0 (does not crash)", () => {
    const { container } = render(
      <StreamgraphChart
        label="Filtré"
        data={[
          { category: "A", values: [ { label: "S1", value: -5 }, { label: "S2", value: Number.NaN } ] },
          { category: "B", values: [ { label: "S1", value: 10 }, { label: "S2", value: 4 } ] },
        ]}
      />
    );
    const items = listItems(container);
    expect(items[0]).toBe("S1: 10");
    expect(items[1]).toBe("S2: 4");
    expect(items[items.length - 1]).toBe("Total: 14");
    expect(container.querySelectorAll(".st-streamgraphChart__area").length).toBe(2);
  });

  it("renders without crashing for empty data", () => {
    const { container } = render(<StreamgraphChart label="Vide" data={[]} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(container.querySelectorAll(".st-streamgraphChart__area").length).toBe(0);
  });
});
