import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { AreaChart, BarChart, LineChart, Sparkline } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("BarChart parity with Svelte", () => {
  it("renders tone classes, category labels, axes and a screen-reader data list", () => {
    const { container } = render(
      <BarChart
        label="Revenue"
        data={[
          { label: "A", value: 4, tone: "category3" },
          { label: "B", value: 8 },
        ]}
      />,
    );
    const root = container.querySelector(".st-barChart")!;
    expect(root.querySelector(".st-barChart__visual")?.getAttribute("aria-label")).toBe("Revenue");
    expect(container.querySelector(".st-barChart__bar--category3")).toBeTruthy();
    // default tone is category1
    expect(container.querySelector(".st-barChart__bar--category1")).toBeTruthy();
    expect(container.querySelectorAll(".st-barChart__bar").length).toBe(2);
    expect(container.querySelectorAll(".st-barChart__axis").length).toBe(2);
    const labels = Array.from(container.querySelectorAll(".st-barChart__categoryLabel")).map((n) => n.textContent);
    expect(labels).toEqual(["A", "B"]);
    const dataList = container.querySelector(".st-chartDataList")!;
    expect(dataList.getAttribute("aria-label")).toBe("Data values for Revenue");
    expect(Array.from(dataList.querySelectorAll("li")).map((n) => n.textContent)).toEqual(["A: 4", "B: 8"]);
  });

  it("honours horizontal orientation and custom dimensions via viewBox", () => {
    const { container } = render(
      <BarChart label="H" width={300} height={120} orientation="horizontal" data={[{ label: "A", value: 4 }]} />,
    );
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 300 120");
    // horizontal category labels are end-anchored
    expect(container.querySelector(".st-barChart__categoryLabel")?.getAttribute("text-anchor")).toBe("end");
  });

  it("shows a tooltip on pointer move over a bar", () => {
    const { container } = render(<BarChart label="T" data={[{ label: "A", value: 4 }]} />);
    const bar = container.querySelector(".st-barChart__bar")!;
    fireEvent.pointerMove(bar);
    expect(container.querySelector(".st-barChart__tooltip")).toBeTruthy();
  });
});

describe("LineChart parity with Svelte", () => {
  it("applies tone modifier, draws a line path and dots, and exposes data values", () => {
    const { container } = render(
      <LineChart label="Series" tone="category5" data={[{ x: "Mon", y: 10 }, { x: "Tue", y: 14 }, { x: "Wed", y: 8 }]} />,
    );
    expect(container.querySelector(".st-lineChart--category5")).toBeTruthy();
    expect(container.querySelector(".st-lineChart__line")?.getAttribute("d")?.startsWith("M")).toBe(true);
    expect(container.querySelectorAll(".st-lineChart__dot").length).toBe(3);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Mon: 10", "Tue: 14", "Wed: 8"]);
  });

  it("renders an area path only when area is enabled and closes the path", () => {
    const { container: plain } = render(<LineChart label="L" data={[{ x: 0, y: 1 }, { x: 1, y: 3 }]} />);
    expect(plain.querySelector(".st-lineChart__area")).toBeNull();
    const { container: withArea } = render(<LineChart label="L" area data={[{ x: 0, y: 1 }, { x: 1, y: 3 }]} />);
    expect(withArea.querySelector(".st-lineChart__area")?.getAttribute("d")?.endsWith("Z")).toBe(true);
  });

  it("emits cubic beziers when smooth is set", () => {
    const { container } = render(
      <LineChart label="L" smooth data={[{ x: 0, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 2 }]} />,
    );
    expect(container.querySelector(".st-lineChart__line")?.getAttribute("d")).toContain("C");
  });
});

describe("AreaChart parity with Svelte", () => {
  it("accepts a bare number[] and normalises it, drawing area + line + dots", () => {
    const { container } = render(<AreaChart label="Bare" data={[3, 6, 2, 8]} />);
    expect(container.querySelector(".st-areaChart__area")).toBeTruthy();
    expect(container.querySelector(".st-areaChart__line")).toBeTruthy();
    expect(container.querySelectorAll(".st-areaChart__dot").length).toBe(4);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["0: 3", "1: 6", "2: 2", "3: 8"]);
  });

  it("fills the area with a gradient via a unique linearGradient id", () => {
    const { container } = render(<AreaChart label="Grad" tone="category2" data={[{ x: "a", y: 1 }, { x: "b", y: 5 }]} />);
    const grad = container.querySelector("linearGradient")!;
    const id = grad.getAttribute("id")!;
    expect(id).toContain("st-areachart-gradient-");
    expect(container.querySelector(".st-areaChart__area")?.getAttribute("fill")).toBe(`url(#${id})`);
    expect(container.querySelector(".st-areaChart--category2")).toBeTruthy();
  });
});

describe("Sparkline parity with Svelte", () => {
  it("renders a span with tone, default 120x28 viewBox and a stroke path", () => {
    const { container } = render(<Sparkline label="Trend" data={[1, 4, 2, 6]} />);
    const root = container.querySelector(".st-sparkline")!;
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.classList.contains("st-sparkline--neutral")).toBe(true);
    expect(root.getAttribute("aria-label")).toBe("Trend");
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 120 28");
    expect(container.querySelector(".st-sparkline__line")?.getAttribute("stroke-width")).toBe("1.5");
  });

  it("supports custom dimensions, strokeWidth, tone and an optional area fill", () => {
    const { container } = render(
      <Sparkline label="A" data={[1, 2, 3]} width={200} height={40} tone="success" strokeWidth={3} area />,
    );
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 40");
    expect(container.querySelector(".st-sparkline--success")).toBeTruthy();
    expect(container.querySelector(".st-sparkline__line")?.getAttribute("stroke-width")).toBe("3");
    expect(container.querySelector(".st-sparkline__area")).toBeTruthy();
  });
});
