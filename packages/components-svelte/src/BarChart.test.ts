import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import BarChart from "./lib/BarChart.svelte";
import type { BarChartDatum } from "./lib/BarChart.svelte";

const data: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8 },
  { label: "C", value: 2 }
];

describe("BarChart controlled selection", () => {
  it("is purely presentational when onSelect is absent (no regression)", () => {
    const { container } = render(BarChart, { props: { label: "Plain", data } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars.length).toBe(3);
    for (const bar of bars) {
      expect(bar.getAttribute("role")).toBeNull();
      expect(bar.getAttribute("tabindex")).toBeNull();
      expect(bar.getAttribute("aria-pressed")).toBeNull();
      expect(bar.getAttribute("aria-label")).toBeNull();
      expect(bar.classList.contains("st-barChart__bar--interactive")).toBe(false);
    }
  });

  it("makes each bar an activable button when onSelect is provided", () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Pick", data, onSelect } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    for (const bar of bars) {
      expect(bar.getAttribute("role")).toBe("button");
      expect(bar.getAttribute("tabindex")).toBe("0");
      expect(bar.classList.contains("st-barChart__bar--interactive")).toBe(true);
    }
    // aria-label describes the bar + its value.
    expect(bars[0].getAttribute("aria-label")).toBe("A: 4");
    expect(bars[1].getAttribute("aria-label")).toBe("B: 8");
  });

  it("emits onSelect with the bar key (its label) on click", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Click", data, onSelect } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    await fireEvent.click(bars[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("B");
  });

  it("activates on Enter and on Space (Space prevents default)", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Keys", data, onSelect } });
    const bar = container.querySelectorAll(".st-barChart__bar")[2];

    await fireEvent.keyDown(bar, { key: "Enter" });
    expect(onSelect).toHaveBeenLastCalledWith("C");

    const evt = await fireEvent.keyDown(bar, { key: " " });
    // fireEvent returns false when a handler called preventDefault().
    expect(evt).toBe(false);
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith("C");
  });

  it("reflects selectedKeys via aria-pressed and the selected class", () => {
    const { container } = render(BarChart, {
      props: { label: "Sel", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars[0].getAttribute("aria-pressed")).toBe("false");
    expect(bars[1].getAttribute("aria-pressed")).toBe("true");
    expect(bars[1].classList.contains("st-barChart__bar--selected")).toBe(true);
    expect(bars[0].classList.contains("st-barChart__bar--selected")).toBe(false);
  });

  it("dims non-selected bars when a selection is active", () => {
    const { container } = render(BarChart, {
      props: { label: "Dim", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    // selected bar is never dimmed
    expect(bars[1].classList.contains("st-barChart__bar--dim")).toBe(false);
    // others are dimmed
    expect(bars[0].classList.contains("st-barChart__bar--dim")).toBe(true);
    expect(bars[2].classList.contains("st-barChart__bar--dim")).toBe(true);
  });

  it("does not dim any bar when selectedKeys is empty", () => {
    const { container } = render(BarChart, {
      props: { label: "None", data, onSelect: () => {}, selectedKeys: [] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    for (const bar of bars) {
      expect(bar.classList.contains("st-barChart__bar--dim")).toBe(false);
      expect(bar.classList.contains("st-barChart__bar--selected")).toBe(false);
    }
  });
});
