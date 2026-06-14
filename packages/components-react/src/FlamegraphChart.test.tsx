import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlamegraphChart } from "./FlamegraphChart.js";

const tree = {
  name: "root",
  value: 100,
  children: [
    {
      name: "a",
      value: 60,
      children: [
        { name: "a1", value: 40 },
        { name: "a2", value: 20 },
      ],
    },
    { name: "b", value: 40 },
  ],
};

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("FlamegraphChart", () => {
  it("renders one frame per node in the recursive tree", () => {
    const { container } = render(<FlamegraphChart label="Profil" data={tree} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(container.querySelectorAll(".st-flamegraphChart__frame").length).toBe(5);
  });

  it("colours frames by depth (categoryN cycling on the level)", () => {
    const { container } = render(<FlamegraphChart label="Profil" data={tree} />);
    const frames = container.querySelectorAll(".st-flamegraphChart__frame");
    expect(frames[0].classList.contains("st-flamegraphChart__frame--category1")).toBe(true);
    expect(frames[1].classList.contains("st-flamegraphChart__frame--category2")).toBe(true);
  });

  it("makes a child width proportional to its value within the parent", () => {
    const { container } = render(<FlamegraphChart label="Profil" data={tree} />);
    const frames = container.querySelectorAll<SVGRectElement>(".st-flamegraphChart__frame");
    const wRoot = Number(frames[0].getAttribute("width"));
    const wA = Number(frames[1].getAttribute("width"));
    const wB = Number(frames[frames.length - 1].getAttribute("width"));
    expect(wA).toBeGreaterThan(wB);
    expect(wA + wB).toBeCloseTo(wRoot, 1);
  });

  it("stacks deeper nodes below their parent (increasing y by depth)", () => {
    const { container } = render(<FlamegraphChart label="Profil" data={tree} />);
    const frames = container.querySelectorAll<SVGRectElement>(".st-flamegraphChart__frame");
    const yRoot = Number(frames[0].getAttribute("y"));
    const yA = Number(frames[1].getAttribute("y"));
    const yA1 = Number(frames[2].getAttribute("y"));
    expect(yA).toBeGreaterThan(yRoot);
    expect(yA1).toBeGreaterThan(yA);
  });

  it("summarises each node (indented by depth) in the accessible data list", () => {
    const { container } = render(<FlamegraphChart label="Profil" data={tree} />);
    const items = listItems(container);
    expect(items[0]).toBe("root: 100");
    expect(items[1]).toBe("·a: 60");
    expect(items[2]).toBe("··a1: 40");
  });

  it("drops children with non-positive or non-finite values", () => {
    const { container } = render(
      <FlamegraphChart
        label="Filtré"
        data={{
          name: "root",
          value: 10,
          children: [
            { name: "ok", value: 6 },
            { name: "zero", value: 0 },
            { name: "nan", value: Number.NaN },
          ],
        }}
      />,
    );
    expect(container.querySelectorAll(".st-flamegraphChart__frame").length).toBe(2);
  });
});
