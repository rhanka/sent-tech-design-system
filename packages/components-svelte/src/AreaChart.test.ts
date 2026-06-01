import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AreaChart from "./lib/AreaChart.svelte";
import type { AreaChartDatum } from "./lib/AreaChart.svelte";

describe("AreaChart", () => {
  const numericData = [10, 30, 20, 50, 40];
  const objectData: AreaChartDatum[] = [
    { x: "Jan", y: 100 },
    { x: "Feb", y: 200 },
    { x: "Mar", y: 150 },
    { x: "Apr", y: 300 }
  ];

  it("renders properly with a simple numeric array", () => {
    const { container } = render(AreaChart, {
      props: {
        data: numericData,
        label: "Ventes mensuelles"
      }
    });

    // Check SVG container and role
    expect(screen.getByRole("img", { name: "Ventes mensuelles" })).toBeTruthy();
    const wrapper = container.querySelector(".st-areaChart");
    expect(wrapper?.className).toContain("st-areaChart");
    expect(wrapper?.className).toContain("st-areaChart--category1");

    // Check lines and area path
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    const areaPath = container.querySelector(".st-areaChart__area");
    expect(areaPath).toBeTruthy();
    expect(areaPath?.getAttribute("d")).toBeTruthy();
    // Ensure gradient fill is used
    expect(areaPath?.getAttribute("fill")).toContain("url(#st-areachart-gradient-");

    const linePath = container.querySelector(".st-areaChart__line");
    expect(linePath).toBeTruthy();
    expect(linePath?.getAttribute("d")).toBeTruthy();

    // Check that dots are rendered for each point
    const dots = container.querySelectorAll(".st-areaChart__dot");
    expect(dots.length).toBe(5);
  });

  it("renders properly with AreaChartDatum objects", () => {
    const { container } = render(AreaChart, {
      props: {
        data: objectData,
        label: "Performance",
        tone: "category3",
        smooth: true
      }
    });

    expect(screen.getByRole("img", { name: "Performance" })).toBeTruthy();
    const wrapper = container.querySelector(".st-areaChart");
    expect(wrapper?.className).toContain("st-areaChart--category3");

    // Check X axis tick labels
    expect(screen.getByText("Jan")).toBeTruthy();
    expect(screen.getByText("Feb")).toBeTruthy();
    expect(screen.getByText("Mar")).toBeTruthy();
    expect(screen.getByText("Apr")).toBeTruthy();

    const dots = container.querySelectorAll(".st-areaChart__dot");
    expect(dots.length).toBe(4);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const { container } = render(AreaChart, {
      props: {
        data: objectData,
        label: "Interactive Chart"
      }
    });

    // Tooltip should not be visible initially
    expect(screen.queryByRole("presentation")).toBeNull();

    // Hover the second point (Feb: 200)
    const dots = container.querySelectorAll(".st-areaChart__dot");
    await fireEvent.pointerMove(dots[1]);

    // Tooltip should be visible now
    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("Feb").length).toBeGreaterThan(0);
    expect(screen.getAllByText("200").length).toBeGreaterThan(0);

    // Move hover to another point (Mar: 150)
    await fireEvent.pointerMove(dots[2]);

    expect(screen.getAllByText("Mar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("150").length).toBeGreaterThan(0);

    // Remove hover
    await fireEvent.pointerLeave(container.querySelector(".st-areaChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
