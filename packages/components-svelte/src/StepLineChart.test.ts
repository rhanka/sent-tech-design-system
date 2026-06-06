import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StepLineChart from "./lib/StepLineChart.svelte";

describe("StepLineChart", () => {
  const data = [
    { x: "Jan", y: 12 },
    { x: "Feb", y: 18 },
    { x: "Mar", y: 10 }
  ];

  it("renders a stepped path, tone class, dots, and data values", () => {
    const { container } = render(StepLineChart, {
      props: {
        data,
        label: "Monthly retention",
        tone: "category4"
      }
    });

    expect(screen.getByRole("img", { name: "Monthly retention" })).toBeTruthy();
    expect(container.querySelector(".st-stepLineChart--category4")).toBeTruthy();

    const line = container.querySelector(".st-stepLineChart__line");
    const path = line?.getAttribute("d") ?? "";
    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("H");
    expect(path).toContain("V");
    expect(path).not.toContain("C");
    expect(container.querySelectorAll(".st-stepLineChart__dot")).toHaveLength(3);

    const dataList = screen.getByRole("list", { name: "Data values for Monthly retention" });
    expect(within(dataList).getByText("Jan: 12")).toBeTruthy();
    expect(within(dataList).getByText("Feb: 18")).toBeTruthy();
    expect(within(dataList).getByText("Mar: 10")).toBeTruthy();
  });

  it("supports numeric x values and exposes hover tooltip", async () => {
    const { container } = render(StepLineChart, {
      props: {
        data: [
          { x: 1, y: 4 },
          { x: 2, y: 8 }
        ],
        label: "Numeric steps"
      }
    });

    const dots = container.querySelectorAll(".st-stepLineChart__dot");
    await fireEvent.pointerMove(dots[1]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(container.querySelector(".st-stepLineChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("does not render a line or dots for empty data", () => {
    const { container } = render(StepLineChart, {
      props: {
        data: [],
        label: "Empty steps"
      }
    });

    expect(screen.getByRole("img", { name: "Empty steps" })).toBeTruthy();
    expect(container.querySelector(".st-stepLineChart__line")).toBeNull();
    expect(container.querySelectorAll(".st-stepLineChart__dot")).toHaveLength(0);
  });
});
