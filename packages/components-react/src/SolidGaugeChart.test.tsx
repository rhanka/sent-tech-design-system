import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SolidGaugeChart } from "./SolidGaugeChart.js";
import type { SolidGaugeThreshold } from "./SolidGaugeChart.js";

describe("SolidGaugeChart", () => {
  it("renders a meter with the correct aria value attributes", () => {
    const { container } = render(<SolidGaugeChart value={42} min={0} max={100} label="CPU" />);
    const meter = container.querySelector('[role="meter"]');
    expect(meter).toBeTruthy();
    expect(meter?.getAttribute("aria-valuenow")).toBe("42");
    expect(meter?.getAttribute("aria-valuemin")).toBe("0");
    expect(meter?.getAttribute("aria-valuemax")).toBe("100");
    expect(meter?.getAttribute("aria-valuetext")).toBe("CPU: 42");
  });

  it("clamps the value into the [min, max] range", () => {
    const { container, rerender } = render(<SolidGaugeChart value={150} min={0} max={100} />);
    expect(container.querySelector('[role="meter"]')?.getAttribute("aria-valuenow")).toBe("100");

    rerender(<SolidGaugeChart value={-20} min={0} max={100} />);
    expect(container.querySelector('[role="meter"]')?.getAttribute("aria-valuenow")).toBe("0");
  });

  it("formats the central value as a percentage when format=percent", () => {
    const { container } = render(
      <SolidGaugeChart value={30} min={0} max={120} format="percent" label="Load" />,
    );
    expect(container.querySelector(".st-solidGaugeChart__value")?.textContent?.trim()).toBe("25%");
  });

  it("appends a unit suffix for numeric format", () => {
    const { container } = render(<SolidGaugeChart value={72} unit="%" />);
    expect(container.querySelector(".st-solidGaugeChart__value")?.textContent?.trim()).toBe("72 %");
  });

  it("draws a background track and a filled progress arc (no needle)", () => {
    const { container } = render(<SolidGaugeChart value={60} />);
    expect(container.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    const progress = container.querySelector(".st-solidGaugeChart__progress");
    expect(progress).toBeTruthy();
    expect(progress?.getAttribute("d")).toBeTruthy();
    expect(container.querySelector(".st-solidGaugeChart__needle")).toBeNull();
  });

  it("omits the filled arc when value is at the minimum", () => {
    const { container } = render(<SolidGaugeChart value={0} min={0} max={100} />);
    expect(container.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    expect(container.querySelector(".st-solidGaugeChart__progress")).toBeNull();
  });

  it("tints the filled arc by the reached threshold zone", () => {
    const thresholds: SolidGaugeThreshold[] = [
      { value: 0, tone: "error" },
      { value: 60, tone: "warning" },
      { value: 80, tone: "success" },
    ];
    const { container } = render(
      <SolidGaugeChart value={91} min={0} max={100} thresholds={thresholds} label="Score" />,
    );
    expect(container.querySelector(".st-solidGaugeChart__progress--success")).toBeTruthy();
    expect(container.querySelector(".st-solidGaugeChart__progress--warning")).toBeNull();
  });

  it("exposes an accessible data list fallback", () => {
    const { container } = render(<SolidGaugeChart value={10} min={0} max={50} label="Storage" />);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) =>
      n.textContent?.trim(),
    );
    expect(items[0]).toBe("Storage: 10 (min 0, max 50)");
  });
});
