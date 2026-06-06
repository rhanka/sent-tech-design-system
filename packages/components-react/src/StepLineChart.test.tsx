import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StepLineChart } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("StepLineChart", () => {
  const data = [
    { x: "Jan", y: 12 },
    { x: "Feb", y: 18 },
    { x: "Mar", y: 10 },
  ];

  it("renders a stepped path, tone class, dots, and data values", () => {
    const { container } = render(<StepLineChart data={data} label="Monthly retention" tone="category4" />);

    expect(container.querySelector('[role="img"][aria-label="Monthly retention"]')).toBeTruthy();
    expect(container.querySelector(".st-stepLineChart--category4")).toBeTruthy();

    const path = container.querySelector(".st-stepLineChart__line")?.getAttribute("d") ?? "";
    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("H");
    expect(path).toContain("V");
    expect(path).not.toContain("C");
    expect(container.querySelectorAll(".st-stepLineChart__dot")).toHaveLength(3);

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((node) => node.textContent);
    expect(items).toEqual(["Jan: 12", "Feb: 18", "Mar: 10"]);
  });

  it("supports numeric x values and exposes hover tooltip", () => {
    const { container } = render(
      <StepLineChart
        data={[
          { x: 1, y: 4 },
          { x: 2, y: 8 },
        ]}
        label="Numeric steps"
      />,
    );

    const dots = container.querySelectorAll(".st-stepLineChart__dot");
    fireEvent.pointerMove(dots[1]);

    expect(container.querySelector(".st-stepLineChart__tooltip")).toBeTruthy();
    expect(container.querySelector(".st-stepLineChart__tooltipLabel")?.textContent).toBe("2");
    expect(container.querySelector(".st-stepLineChart__tooltipValue")?.textContent).toBe("8");

    fireEvent.pointerLeave(container.querySelector(".st-stepLineChart__visual") as Element);
    expect(container.querySelector(".st-stepLineChart__tooltip")).toBeNull();
  });
});
