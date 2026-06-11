import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import LineChart from "./lib/LineChart.svelte";
import BarChart from "./lib/BarChart.svelte";
import AreaChart from "./lib/AreaChart.svelte";

const lineData = [
  { x: "Jan", y: 2 },
  { x: "Feb", y: 4 },
  { x: "Mar", y: 6 },
];
const barData = [
  { label: "A", value: 5 },
  { label: "B", value: 9 },
  { label: "C", value: 3 },
];

describe("LineChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled (no hoverKey): no crosshair by default, internal hover drives it", async () => {
    const { container } = render(LineChart, { props: { data: lineData, label: "Uncontrolled" } });
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-lineChart__tooltip")).toBeNull();

    const dots = container.querySelectorAll(".st-lineChart__dot");
    await fireEvent.pointerMove(dots[1]);
    expect(container.querySelector(".st-lineChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Feb");

    await fireEvent.pointerLeave(container.querySelector(".st-lineChart__visual") as Element);
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
  });

  it("controlled: crosshair + tooltip reflect hoverKey, ignoring internal pointer", async () => {
    const { container } = render(LineChart, { props: { data: lineData, label: "Controlled", hoverKey: "Mar" } });
    expect(container.querySelector(".st-lineChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Mar");

    const dots = container.querySelectorAll(".st-lineChart__dot");
    await fireEvent.pointerMove(dots[0]);
    expect(container.querySelector(".st-lineChart__tooltipLabel")?.textContent).toBe("Mar");
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const { container } = render(LineChart, { props: { data: lineData, label: "Null", hoverKey: null } });
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-lineChart__tooltip")).toBeNull();
  });

  it("emits onHoverKeyChange on move (the datum key) and on leave (null)", async () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(LineChart, { props: { data: lineData, label: "Emit", onHoverKeyChange } });
    const dots = container.querySelectorAll(".st-lineChart__dot");
    await fireEvent.pointerMove(dots[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
    await fireEvent.pointerLeave(container.querySelector(".st-lineChart__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("controlled chart STILL emits onHoverKeyChange (shared channel)", async () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(LineChart, {
      props: { data: lineData, label: "ControlledEmit", hoverKey: "Jan", onHoverKeyChange },
    });
    const dots = container.querySelectorAll(".st-lineChart__dot");
    await fireEvent.pointerMove(dots[1]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Feb");
  });
});

describe("BarChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair until hover", async () => {
    const { container } = render(BarChart, { props: { data: barData, label: "Bars" } });
    expect(container.querySelector(".st-barChart__crosshair")).toBeNull();
    const bars = container.querySelectorAll(".st-barChart__bar");
    await fireEvent.pointerMove(bars[1]);
    expect(container.querySelector(".st-barChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-barChart__tooltipLabel")?.textContent).toBe("B");
  });

  it("controlled: crosshair + tooltip track hoverKey (bar label)", () => {
    const { container } = render(BarChart, { props: { data: barData, label: "Bars", hoverKey: "C" } });
    expect(container.querySelector(".st-barChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-barChart__tooltipLabel")?.textContent).toBe("C");
  });

  it("emits onHoverKeyChange with the bar label / null", async () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(BarChart, { props: { data: barData, label: "Bars", onHoverKeyChange } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    await fireEvent.pointerMove(bars[0]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("A");
    await fireEvent.pointerLeave(container.querySelector(".st-barChart__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("horizontal bars: crosshair is rendered on hover too", () => {
    const { container } = render(BarChart, {
      props: { data: barData, label: "Bars", orientation: "horizontal", hoverKey: "A" },
    });
    expect(container.querySelector(".st-barChart__crosshairLine")).not.toBeNull();
  });
});

describe("AreaChart crosshair / synchronised hover (FR-3)", () => {
  const areaData = [
    { x: "Q1", y: 10 },
    { x: "Q2", y: 20 },
    { x: "Q3", y: 15 },
  ];

  it("uncontrolled: no crosshair until hover", async () => {
    const { container } = render(AreaChart, { props: { data: areaData, label: "Area" } });
    expect(container.querySelector(".st-areaChart__crosshair")).toBeNull();
    const dots = container.querySelectorAll(".st-areaChart__dot");
    await fireEvent.pointerMove(dots[1]);
    expect(container.querySelector(".st-areaChart__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-areaChart__tooltipLabel")?.textContent).toBe("Q2");
  });

  it("controlled: tracks hoverKey", () => {
    const { container } = render(AreaChart, { props: { data: areaData, label: "Area", hoverKey: "Q3" } });
    expect(container.querySelector(".st-areaChart__tooltipLabel")?.textContent).toBe("Q3");
  });

  it("bare-number data uses the index as key", async () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(AreaChart, { props: { data: [5, 7, 9], label: "Area", onHoverKeyChange } });
    const dots = container.querySelectorAll(".st-areaChart__dot");
    await fireEvent.pointerMove(dots[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("2");
  });
});
