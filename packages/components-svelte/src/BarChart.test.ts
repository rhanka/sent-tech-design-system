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

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("BarChart analytical overlays + error bars", () => {
  it("renders no overlays/error bars by default (additive — zero regression)", () => {
    const { container } = render(BarChart, { props: { label: "Plain", data } });
    expect(container.querySelector(".st-barChart__band")).toBeNull();
    expect(container.querySelector(".st-barChart__refLine")).toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(container.querySelector(".st-barChart__errorBar")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("renders a reference line with a tone class and describes it", () => {
    const { container } = render(BarChart, {
      props: { label: "Ref", data, referenceLines: [{ value: 6, label: "Seuil", tone: "error" }] }
    });
    const ref = container.querySelector(".st-barChart__refLine");
    expect(ref).not.toBeNull();
    expect(ref!.classList.contains("st-barChart__refLine--error")).toBe(true);
    expect(listItems(container)).toContain("Référence: Seuil = 6");
  });

  it("renders a band and a goal line, describing both", () => {
    const { container } = render(BarChart, {
      props: { label: "BG", data, bands: [{ from: 2, to: 5, label: "Zone" }], goalLine: { value: 7 } }
    });
    expect(container.querySelector(".st-barChart__band")).not.toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).not.toBeNull();
    expect(listItems(container)).toContain("Bande: Zone (2–5)");
    expect(listItems(container)).toContain("Objectif: 7");
  });

  it("draws bands BELOW the bars and the goal line ABOVE them (document order)", () => {
    const { container } = render(BarChart, {
      props: { label: "Order", data, bands: [{ from: 2, to: 5 }], goalLine: { value: 7 } }
    });
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const firstBar = nodes.findIndex((n) => n.classList.contains("st-barChart__bar"));
    const band = nodes.findIndex((n) => n.classList.contains("st-barChart__band"));
    const goal = nodes.findIndex((n) => n.classList.contains("st-barChart__goalLine"));
    expect(band).toBeGreaterThanOrEqual(0);
    expect(band).toBeLessThan(firstBar);
    expect(goal).toBeGreaterThan(firstBar);
  });

  it("renders an error-bar whisker per datum that carries finite extents", () => {
    const withErrors: BarChartDatum[] = [
      { label: "A", value: 4, errorLow: 3, errorHigh: 5 },
      { label: "B", value: 8 },
      { label: "C", value: 2, errorLow: Number.NaN, errorHigh: Number.NaN }
    ];
    const { container } = render(BarChart, { props: { label: "Err", data: withErrors } });
    // Only A has finite extents → exactly one whisker group.
    const groups = container.querySelectorAll(".st-barChart__errorBar");
    expect(groups.length).toBe(1);
    expect(groups[0].querySelectorAll(".st-barChart__errorCap").length).toBe(2);
    expect(groups[0].querySelector(".st-barChart__errorStem")).not.toBeNull();
  });

  it("extends the value domain so a reference beyond the data stays on-plot", () => {
    const { container } = render(BarChart, {
      props: { label: "Domain", data, referenceLines: [{ value: 100 }] }
    });
    expect(tickLabels(container as HTMLElement)).toContain("100");
  });

  it("does NOT widen a pinned domain for overlays (small-multiples stay aligned)", () => {
    const { container } = render(BarChart, {
      props: { label: "Pinned", data, domain: [0, 10], referenceLines: [{ value: 100 }] }
    });
    // Pinned [0,10] is authoritative — the 100 reference must not raise ticks.
    expect(tickLabels(container as HTMLElement)).not.toContain("100");
    expect(tickLabels(container as HTMLElement)).toContain("10");
  });

  it("ignores a non-finite goal value", () => {
    const { container } = render(BarChart, {
      props: { label: "NaN", data, goalLine: { value: Number.NaN } }
    });
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });
});
