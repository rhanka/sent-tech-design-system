import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { SolidGaugeChart } from "./SolidGaugeChart.js";
import type { SolidGaugeThreshold } from "./SolidGaugeChart.js";

describe("SolidGaugeChart", () => {
  it("renders a meter with the correct aria value attributes", () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 42, min: 0, max: 100, label: "CPU" } });
    const meter = (wrapper.element as HTMLElement).querySelector('[role="meter"]');
    expect(meter).toBeTruthy();
    expect(meter?.getAttribute("aria-valuenow")).toBe("42");
    expect(meter?.getAttribute("aria-valuemin")).toBe("0");
    expect(meter?.getAttribute("aria-valuemax")).toBe("100");
    expect(meter?.getAttribute("aria-valuetext")).toBe("CPU: 42");
  });

  it("clamps the value into the [min, max] range", async () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 150, min: 0, max: 100 } });
    expect((wrapper.element as HTMLElement).querySelector('[role="meter"]')?.getAttribute("aria-valuenow")).toBe("100");

    await wrapper.setProps({ value: -20 });
    expect((wrapper.element as HTMLElement).querySelector('[role="meter"]')?.getAttribute("aria-valuenow")).toBe("0");
  });

  it("formats the central value as a percentage when format=percent", () => {
    const wrapper = mount(SolidGaugeChart, {
      props: { value: 30, min: 0, max: 120, format: "percent", label: "Load" },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-solidGaugeChart__value")?.textContent?.trim()).toBe("25%");
  });

  it("appends a unit suffix for numeric format", () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 72, unit: "%" } });
    expect((wrapper.element as HTMLElement).querySelector(".st-solidGaugeChart__value")?.textContent?.trim()).toBe("72 %");
  });

  it("draws a background track and a filled progress arc (no needle)", () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 60 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    const progress = el.querySelector(".st-solidGaugeChart__progress");
    expect(progress).toBeTruthy();
    expect(progress?.getAttribute("d")).toBeTruthy();
    expect(el.querySelector(".st-solidGaugeChart__needle")).toBeNull();
  });

  it("omits the filled arc when value is at the minimum", () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 0, min: 0, max: 100 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-solidGaugeChart__track")).toBeTruthy();
    expect(el.querySelector(".st-solidGaugeChart__progress")).toBeNull();
  });

  it("tints the filled arc by the reached threshold zone", () => {
    const thresholds: SolidGaugeThreshold[] = [
      { value: 0, tone: "error" },
      { value: 60, tone: "warning" },
      { value: 80, tone: "success" },
    ];
    const wrapper = mount(SolidGaugeChart, {
      props: { value: 91, min: 0, max: 100, thresholds, label: "Score" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-solidGaugeChart__progress--success")).toBeTruthy();
    expect(el.querySelector(".st-solidGaugeChart__progress--warning")).toBeNull();
  });

  it("exposes an accessible data list fallback", () => {
    const wrapper = mount(SolidGaugeChart, { props: { value: 10, min: 0, max: 50, label: "Storage" } });
    const items = Array.from((wrapper.element as HTMLElement).querySelectorAll(".st-chartDataList li")).map((n) =>
      n.textContent?.trim(),
    );
    expect(items[0]).toBe("Storage: 10 (min 0, max 50)");
  });
});
