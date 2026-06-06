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
    // The decorative bars never carry interactive ARIA — they live in an
    // aria-hidden SVG.
    for (const bar of bars) {
      expect(bar.getAttribute("role")).toBeNull();
      expect(bar.getAttribute("tabindex")).toBeNull();
      expect(bar.getAttribute("aria-pressed")).toBeNull();
      expect(bar.getAttribute("aria-label")).toBeNull();
      expect(bar.classList.contains("st-barChart__bar--interactive")).toBe(false);
    }
    // No accessible selection surface at all.
    expect(container.querySelector(".st-barChart__filters")).toBeNull();
    expect(container.querySelectorAll(".st-barChart__filterChip").length).toBe(0);
  });

  it("renders an accessible filter-chip button per bar OUTSIDE the aria-hidden SVG", () => {
    const { container } = render(BarChart, { props: { label: "Pick", data, onSelect: () => {} } });

    // Selection surface is a real group of <button>s, not <rect>s.
    const group = container.querySelector(".st-barChart__filters")!;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe("Filtrer par Pick");

    // The chips live outside the aria-hidden SVG.
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.contains(group)).toBe(false);

    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    expect(chips.length).toBe(3);
    for (const chip of chips) {
      expect(chip.getAttribute("type")).toBe("button");
    }
    // Accessible name carries label + value.
    expect(chips[0].textContent?.trim()).toBe("A: 4");
    expect(chips[1].textContent?.trim()).toBe("B: 8");

    // Bars stay decorative — no ARIA semantics, only a mouse shortcut.
    for (const bar of container.querySelectorAll(".st-barChart__bar")) {
      expect(bar.getAttribute("role")).toBeNull();
      expect(bar.getAttribute("tabindex")).toBeNull();
      expect(bar.getAttribute("aria-pressed")).toBeNull();
    }
  });

  it("emits onSelect with the bar key (its label) when a chip button is clicked", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Click", data, onSelect } });
    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    await fireEvent.click(chips[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("B");
  });

  it("emits onSelect when a bar is clicked with the mouse (sighted shortcut)", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "BarClick", data, onSelect } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    await fireEvent.click(bars[2]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("C");
  });

  it("activates the chip via native keyboard (Enter/Space on a real button)", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Keys", data, onSelect } });
    const chip = container.querySelectorAll("button.st-barChart__filterChip")[2] as HTMLButtonElement;
    // A native <button> activates on click (the event Enter/Space dispatch).
    chip.focus();
    await fireEvent.click(chip);
    expect(onSelect).toHaveBeenLastCalledWith("C");
  });

  it("reflects selectedKeys via aria-pressed on the chips and the selected classes", () => {
    const { container } = render(BarChart, {
      props: { label: "Sel", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    expect(chips[0].getAttribute("aria-pressed")).toBe("false");
    expect(chips[1].getAttribute("aria-pressed")).toBe("true");
    expect(chips[1].classList.contains("st-barChart__filterChip--selected")).toBe(true);
    expect(chips[0].classList.contains("st-barChart__filterChip--selected")).toBe(false);

    // The bar shape echoes the selection (stroke via class).
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars[1].classList.contains("st-barChart__bar--selected")).toBe(true);
    expect(bars[0].classList.contains("st-barChart__bar--selected")).toBe(false);
  });

  it("dims non-selected bars when a selection is active", () => {
    const { container } = render(BarChart, {
      props: { label: "Dim", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars[1].classList.contains("st-barChart__bar--dim")).toBe(false);
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

const tickLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-barChart__tickLabel")).map((n) =>
    n.textContent?.trim()
  );

describe("BarChart shared value domain", () => {
  it("auto-scales to the data range when no domain is given", () => {
    const { container } = render(BarChart, { props: { label: "Auto", data } });
    // Data max is 8 → auto ticks top out at 8, never 100.
    const labels = tickLabels(container);
    expect(labels).toContain("8");
    expect(labels).not.toContain("100");
  });

  it("uses the provided domain for the value axis (shared scale)", () => {
    const { container } = render(BarChart, { props: { label: "Domain", data, domain: [0, 100] } });
    // The fixed domain forces the axis up to 100 regardless of the small data.
    const labels = tickLabels(container);
    expect(labels).toContain("100");
    expect(labels).not.toContain("8");
  });

  it("shrinks bars when the domain is wider than the data", () => {
    const { container: auto } = render(BarChart, { props: { label: "A", data } });
    const { container: scaled } = render(BarChart, {
      props: { label: "B", data, domain: [0, 100] }
    });
    const autoBar = auto.querySelector(".st-barChart__bar") as SVGRectElement;
    const scaledBar = scaled.querySelector(".st-barChart__bar") as SVGRectElement;
    // Same datum, wider domain → shorter bar.
    expect(Number(scaledBar.getAttribute("height"))).toBeLessThan(
      Number(autoBar.getAttribute("height"))
    );
  });

  it("falls back to auto when the domain is invalid (NaN / unordered)", () => {
    const nan = render(BarChart, {
      props: { label: "NaN", data, domain: [0, Number.NaN] as [number, number] }
    });
    expect(tickLabels(nan.container as HTMLElement)).toContain("8");
    expect(tickLabels(nan.container as HTMLElement)).not.toContain("100");

    const unordered = render(BarChart, {
      props: { label: "Rev", data, domain: [100, 0] }
    });
    expect(tickLabels(unordered.container as HTMLElement)).toContain("8");
    expect(tickLabels(unordered.container as HTMLElement)).not.toContain("100");
  });
});
