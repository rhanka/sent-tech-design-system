import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import GaugeChart from "./lib/GaugeChart.svelte";
import type { GaugeChartThreshold } from "./lib/GaugeChart.svelte";

describe("GaugeChart", () => {
  it("renders a meter with the correct aria value attributes", () => {
    render(GaugeChart, {
      props: { value: 42, min: 0, max: 100, label: "CPU" }
    });

    const meter = screen.getByRole("meter", { name: "CPU" });
    expect(meter).toBeTruthy();
    expect(meter.getAttribute("aria-valuenow")).toBe("42");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(meter.getAttribute("aria-valuetext")).toBe("CPU: 42");
  });

  it("clamps the value into the [min, max] range", () => {
    const { rerender } = render(GaugeChart, {
      props: { value: 150, min: 0, max: 100 }
    });

    let meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("100");

    rerender({ value: -20, min: 0, max: 100 });
    meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("0");
  });

  it("formats the central value as a percentage when format=percent", () => {
    render(GaugeChart, {
      props: { value: 30, min: 0, max: 120, format: "percent", label: "Load" }
    });

    // 30 of 120 → 25%
    expect(screen.getByText("25%")).toBeTruthy();
  });

  it("appends a unit suffix for numeric format", () => {
    const { container } = render(GaugeChart, {
      props: { value: 72, unit: "km/h" }
    });

    const value = container.querySelector(".st-gaugeChart__value");
    expect(value?.textContent?.trim()).toBe("72 km/h");
  });

  it("renders one colored band per threshold segment", () => {
    const thresholds: GaugeChartThreshold[] = [
      { value: 40, tone: "success" },
      { value: 70, tone: "warning" },
      { value: 100, tone: "error" }
    ];
    const { container } = render(GaugeChart, {
      props: { value: 55, min: 0, max: 100, thresholds, label: "Score" }
    });

    const bands = container.querySelectorAll(".st-gaugeChart__band");
    expect(bands.length).toBe(3);
    expect(container.querySelector(".st-gaugeChart__band--success")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__band--warning")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__band--error")).toBeTruthy();

    // With thresholds, the plain progress arc is not drawn.
    expect(container.querySelector(".st-gaugeChart__progress")).toBeNull();
  });

  it("draws a progress arc and needle when no thresholds are given", () => {
    const { container } = render(GaugeChart, {
      props: { value: 60 }
    });

    expect(container.querySelector(".st-gaugeChart__progress")).toBeTruthy();
    const needle = container.querySelector(".st-gaugeChart__needle");
    expect(needle).toBeTruthy();
    expect(needle?.getAttribute("d")).toBeTruthy();
  });

  it("supports custom start/end angles (full circle)", () => {
    const { container } = render(GaugeChart, {
      props: { value: 50, startAngle: 90, endAngle: 450 }
    });

    const track = container.querySelector(".st-gaugeChart__track");
    expect(track?.getAttribute("d")).toBeTruthy();
  });

  it("exposes an accessible data list fallback", () => {
    render(GaugeChart, {
      props: { value: 10, min: 0, max: 50, label: "Storage" }
    });

    expect(screen.getByText("Storage: 10 (min 0, max 50)")).toBeTruthy();
  });
});
