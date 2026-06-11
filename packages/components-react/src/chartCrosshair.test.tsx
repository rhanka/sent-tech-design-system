import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LineChart, BarChart, AreaChart } from "./index.js";
import type { LineChartDatum } from "./LineChart.js";
import type { BarChartDatum } from "./BarChart.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const lineData: LineChartDatum[] = [
  { x: "Jan", y: 2 },
  { x: "Feb", y: 4 },
  { x: "Mar", y: 6 },
];
const barData: BarChartDatum[] = [
  { label: "A", value: 5 },
  { label: "B", value: 9 },
  { label: "C", value: 3 },
];

describe("LineChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled (no hoverKey): no crosshair by default, internal hover drives it", () => {
    const { container } = render(<LineChart label="Uncontrolled" data={lineData} />);
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-lineChart__tooltip")).toBeNull();

    const dots = container.querySelectorAll(".st-lineChart__dot");
    fireEvent.pointerMove(dots[1]);
    expect(container.querySelector(".st-lineChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Feb");

    fireEvent.pointerLeave(container.querySelector(".st-lineChart__visual") as Element);
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
  });

  it("controlled: crosshair + tooltip reflect hoverKey, ignoring internal pointer", () => {
    const { container } = render(<LineChart label="Controlled" data={lineData} hoverKey="Mar" />);
    expect(container.querySelector(".st-lineChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Mar");

    // Internal hover on another dot must NOT change the displayed key.
    const dots = container.querySelectorAll(".st-lineChart__dot");
    fireEvent.pointerMove(dots[0]);
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Mar");
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const { container } = render(<LineChart label="Null" data={lineData} hoverKey={null} />);
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-lineChart__tooltip")).toBeNull();
  });

  it("emits onHoverKeyChange on move (the datum key) and on leave (null)", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <LineChart label="Emit" data={lineData} onHoverKeyChange={onHoverKeyChange} />,
    );
    const dots = container.querySelectorAll(".st-lineChart__dot");
    fireEvent.pointerMove(dots[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
    fireEvent.pointerLeave(container.querySelector(".st-lineChart__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("controlled chart STILL emits onHoverKeyChange (shared channel)", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <LineChart label="ControlledEmit" data={lineData} hoverKey="Jan" onHoverKeyChange={onHoverKeyChange} />,
    );
    const dots = container.querySelectorAll(".st-lineChart__dot");
    fireEvent.pointerMove(dots[1]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Feb");
  });
});

describe("BarChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair until hover", () => {
    const { container } = render(<BarChart label="Bars" data={barData} />);
    expect(container.querySelector(".st-barChart__crosshair")).toBeNull();
    const bars = container.querySelectorAll(".st-barChart__bar");
    fireEvent.pointerMove(bars[1]);
    expect(container.querySelector(".st-barChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-barChart__tooltipLabel")?.textContent).toBe("B");
  });

  it("controlled: crosshair + tooltip track hoverKey (bar label)", () => {
    const { container } = render(<BarChart label="Bars" data={barData} hoverKey="C" />);
    expect(container.querySelector(".st-barChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-barChart__tooltipLabel")?.textContent).toBe("C");
  });

  it("emits onHoverKeyChange with the bar label / null", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(<BarChart label="Bars" data={barData} onHoverKeyChange={onHoverKeyChange} />);
    const bars = container.querySelectorAll(".st-barChart__bar");
    fireEvent.pointerMove(bars[0]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("A");
    fireEvent.pointerLeave(container.querySelector(".st-barChart__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("horizontal bars: crosshair is rendered on hover too", () => {
    const { container } = render(<BarChart label="Bars" data={barData} orientation="horizontal" hoverKey="A" />);
    expect(container.querySelector(".st-barChart__crosshairLine")).not.toBeNull();
  });
});

describe("AreaChart crosshair / synchronised hover (FR-3)", () => {
  const areaData = [
    { x: "Q1", y: 10 },
    { x: "Q2", y: 20 },
    { x: "Q3", y: 15 },
  ];

  it("uncontrolled: no crosshair until hover", () => {
    const { container } = render(<AreaChart label="Area" data={areaData} />);
    expect(container.querySelector(".st-areaChart__crosshair")).toBeNull();
    const dots = container.querySelectorAll(".st-areaChart__dot");
    fireEvent.pointerMove(dots[1]);
    expect(container.querySelector(".st-areaChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-areaChart__tooltipLabel")?.textContent).toBe("Q2");
  });

  it("controlled: tracks hoverKey", () => {
    const { container } = render(<AreaChart label="Area" data={areaData} hoverKey="Q3" />);
    expect(container.querySelector(".st-areaChart__tooltipLabel")?.textContent).toBe("Q3");
  });

  it("bare-number data uses the index as key", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(<AreaChart label="Area" data={[5, 7, 9]} onHoverKeyChange={onHoverKeyChange} />);
    const dots = container.querySelectorAll(".st-areaChart__dot");
    fireEvent.pointerMove(dots[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("2");
  });
});
