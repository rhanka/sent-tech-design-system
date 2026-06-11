import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StackedBarChart, ComboChart } from "./index.js";
import type { StackedBarDatum } from "./StackedBarChart.js";
import type { ComboChartBarSeries, ComboChartLineSeries } from "./ComboChart.js";

// FR-4 — interactive legend (toggle series visibility), strict tri-framework parity.

const stackData: StackedBarDatum[] = [
  { label: "Q1", segments: [
    { label: "Alpha", value: 10 },
    { label: "Beta", value: 20 },
    { label: "Gamma", value: 30 },
  ] },
  { label: "Q2", segments: [
    { label: "Alpha", value: 15 },
    { label: "Beta", value: 25 },
    { label: "Gamma", value: 5 },
  ] },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StackedBarChart — interactive legend (FR-4)", () => {
  it("is non-interactive by default (no props): legend items are plain, no buttons", () => {
    const { container } = render(<StackedBarChart data={stackData} label="Stack" />);
    expect(container.querySelectorAll(".st-stackedBar__legendButton").length).toBe(0);
    expect(container.querySelectorAll(".st-stackedBar__seg").length).toBe(6);
  });

  it("renders legend buttons with aria-pressed when onToggleSeries is provided", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(<StackedBarChart data={stackData} label="Stack" onToggleSeries={onToggleSeries} />);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton");
    expect(buttons.length).toBe(3);
    buttons.forEach((b) => expect(b.getAttribute("aria-pressed")).toBe("false"));
  });

  it("emits the series id on click", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(<StackedBarChart data={stackData} label="Stack" onToggleSeries={onToggleSeries} />);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton");
    fireEvent.click(buttons[1]);
    expect(onToggleSeries).toHaveBeenCalledWith("Beta");
  });

  it("hides series in hiddenSeries: segments dropped, item shown off, removed from data list", () => {
    const { container } = render(
      <StackedBarChart data={stackData} label="Stack" hiddenSeries={["Beta"]} onToggleSeries={() => {}} />,
    );
    expect(container.querySelectorAll(".st-stackedBar__seg").length).toBe(4);
    const offItem = container.querySelector(".st-stackedBar__legendItem--off");
    expect(offItem?.textContent).toContain("Beta");
    const betaButton = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton")).find(
      (b) => b.textContent?.includes("Beta"),
    );
    expect(betaButton?.getAttribute("aria-pressed")).toBe("true");
    expect(listItems(container).some((t) => t?.includes("Beta"))).toBe(false);
    expect(listItems(container).some((t) => t?.includes("Alpha"))).toBe(true);
  });

  it("keeps tone stable for visible series when a series is hidden", () => {
    const { container } = render(
      <StackedBarChart data={stackData} label="Stack" hiddenSeries={["Alpha"]} onToggleSeries={() => {}} />,
    );
    const segs = Array.from(container.querySelectorAll(".st-stackedBar__seg")).map((s) => s.getAttribute("class"));
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category1"))).toBe(false);
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category2"))).toBe(true);
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category3"))).toBe(true);
  });
});

const categories = ["Jan", "Feb", "Mar"];
const bars: ComboChartBarSeries[] = [
  { label: "Revenue", data: [100, 200, 150], tone: "category1" },
  { label: "Cost", data: [60, 90, 80], tone: "category2" },
];
const lines: ComboChartLineSeries[] = [{ label: "Margin", data: [10, 25, 18], tone: "category3" }];

describe("ComboChart — interactive legend (FR-4)", () => {
  it("legend has aria-hidden by default and no buttons", () => {
    const { container } = render(<ComboChart categories={categories} bars={bars} lines={lines} label="Perf" />);
    const ul = container.querySelector(".st-comboChart__legend");
    expect(ul?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(".st-comboChart__legendButton").length).toBe(0);
  });

  it("drops aria-hidden and renders buttons in interactive mode", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(
      <ComboChart categories={categories} bars={bars} lines={lines} label="Perf" onToggleSeries={onToggleSeries} />,
    );
    const ul = container.querySelector(".st-comboChart__legend");
    expect(ul?.getAttribute("aria-hidden")).toBeNull();
    expect(container.querySelectorAll(".st-comboChart__legendButton").length).toBe(3);
  });

  it("emits id on click", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(
      <ComboChart categories={categories} bars={bars} lines={lines} label="Perf" onToggleSeries={onToggleSeries} />,
    );
    const costBtn = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-comboChart__legendButton")).find(
      (b) => b.textContent?.includes("Cost"),
    )!;
    fireEvent.click(costBtn);
    expect(onToggleSeries).toHaveBeenCalledWith("Cost");
  });

  it("hides a line series when in hiddenSeries", () => {
    const { container } = render(
      <ComboChart categories={categories} bars={bars} lines={lines} label="Perf" hiddenSeries={["Margin"]} onToggleSeries={() => {}} />,
    );
    expect(container.querySelectorAll(".st-comboChart__line").length).toBe(0);
    expect(container.querySelectorAll(".st-comboChart__dot").length).toBe(0);
    expect(container.querySelectorAll(".st-comboChart__bar").length).toBeGreaterThan(0);
    const off = container.querySelector(".st-comboChart__legendItem--off");
    expect(off?.textContent).toContain("Margin");
    expect(listItems(container).some((t) => t?.includes("Margin"))).toBe(false);
  });

  it("hides a bar series when in hiddenSeries (its rects gone)", () => {
    const { container } = render(
      <ComboChart categories={categories} bars={bars} lines={lines} label="Perf" hiddenSeries={["Cost"]} onToggleSeries={() => {}} />,
    );
    expect(container.querySelectorAll(".st-comboChart__bar").length).toBe(categories.length);
    expect(listItems(container).some((t) => t?.includes("Cost"))).toBe(false);
  });
});
