import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import SolidGaugeChart from "./lib/SolidGaugeChart.svelte";
import type { SolidGaugeThreshold } from "./lib/SolidGaugeChart.svelte";

describe("SolidGaugeChart", () => {
  it("renders a meter with the correct aria value attributes", () => {
    render(SolidGaugeChart, {
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
    const { rerender } = render(SolidGaugeChart, {
      props: { value: 150, min: 0, max: 100 }
    });

    let meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("100");

    rerender({ value: -20, min: 0, max: 100 });
    meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("0");
  });

  it("formats the central value as a percentage when format=percent", () => {
    render(SolidGaugeChart, {
      props: { value: 30, min: 0, max: 120, format: "percent", label: "Load" }
    });

    // 30 of 120 → 25%
    expect(screen.getByText("25%")).toBeTruthy();
  });

  it("appends a unit suffix for numeric format", () => {
    const { container } = render(SolidGaugeChart, {
      props: { value: 72, unit: "%" }
    });

    const value = container.querySelector(".st-solidGaugeChart__value");
    expect(value?.textContent?.trim()).toBe("72 %");
  });

  it("draws a background track and a filled progress arc", () => {
    const { container } = render(SolidGaugeChart, {
      props: { value: 60 }
    });

    expect(container.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    const progress = container.querySelector(".st-solidGaugeChart__progress");
    expect(progress).toBeTruthy();
    expect(progress?.getAttribute("d")).toBeTruthy();
    // No needle in the solid variant.
    expect(container.querySelector(".st-solidGaugeChart__needle")).toBeNull();
  });

  it("omits the filled arc when value is at the minimum", () => {
    const { container } = render(SolidGaugeChart, {
      props: { value: 0, min: 0, max: 100 }
    });

    expect(container.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    expect(container.querySelector(".st-solidGaugeChart__progress")).toBeNull();
  });

  it("tints the filled arc by the reached threshold zone", () => {
    const thresholds: SolidGaugeThreshold[] = [
      { value: 0, tone: "error" },
      { value: 60, tone: "warning" },
      { value: 80, tone: "success" }
    ];
    const { container } = render(SolidGaugeChart, {
      props: { value: 91, min: 0, max: 100, thresholds, label: "Score" }
    });

    // 91 ≥ 80 → success zone tints the filled arc.
    expect(container.querySelector(".st-solidGaugeChart__progress--success")).toBeTruthy();
    expect(container.querySelector(".st-solidGaugeChart__progress--warning")).toBeNull();
  });

  it("exposes an accessible data list fallback", () => {
    render(SolidGaugeChart, {
      props: { value: 10, min: 0, max: 50, label: "Storage" }
    });

    expect(screen.getByText("Storage: 10 (min 0, max 50)")).toBeTruthy();
  });
});
