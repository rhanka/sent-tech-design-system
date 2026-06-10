import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ErrorBarChart from "./lib/ErrorBarChart.svelte";
import type { ErrorBarChartDatum } from "./lib/ErrorBarChart.svelte";

const data: ErrorBarChartDatum[] = [
  { category: "Ingénierie", value: 70, low: 62, high: 78 },
  { category: "Design", value: 61, low: 54, high: 69 },
  { category: "Ventes", value: 60, low: 50, high: 72 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ErrorBarChart", () => {
  it("renders a whisker line per category", () => {
    const { container } = render(ErrorBarChart, { props: { label: "Mesures", data } });

    expect(screen.getByRole("img", { name: "Mesures" })).toBeTruthy();
    expect(container.querySelectorAll(".st-errorBarChart__whisker").length).toBe(3);
  });

  it("renders two caps (low + high) per category", () => {
    const { container } = render(ErrorBarChart, { props: { label: "Mesures", data } });
    expect(container.querySelectorAll(".st-errorBarChart__cap").length).toBe(6);
    expect(container.querySelectorAll(".st-errorBarChart__cap--low").length).toBe(3);
    expect(container.querySelectorAll(".st-errorBarChart__cap--high").length).toBe(3);
  });

  it("renders a center marker per category", () => {
    const { container } = render(ErrorBarChart, { props: { label: "Mesures", data } });
    expect(container.querySelectorAll(".st-errorBarChart__marker").length).toBe(3);
  });

  it("summarizes each value (low – high) in the accessible list", () => {
    const { container } = render(ErrorBarChart, { props: { label: "Mesures", data } });
    expect(listItems(container)).toEqual([
      "Ingénierie: 70 (62 – 78)",
      "Design: 61 (54 – 69)",
      "Ventes: 60 (50 – 72)",
    ]);
  });

  it("normalizes inverted low/high and clamps value into bounds", () => {
    const { container } = render(ErrorBarChart, {
      props: { label: "Inv", data: [{ category: "X", value: 15, low: 10, high: 2 }] },
    });
    expect(listItems(container)).toEqual(["X: 10 (2 – 10)"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(ErrorBarChart, {
      props: {
        label: "NaN",
        data: [
          { category: "A", value: 3, low: NaN, high: 5 },
          { category: "B", value: 2, low: 1, high: 4 },
        ],
      },
    });
    expect(listItems(container)).toEqual(["B: 2 (1 – 4)"]);
    expect(container.querySelectorAll(".st-errorBarChart__marker").length).toBe(1);
  });

  it("applies the tone class to whisker, caps and marker", () => {
    const { container } = render(ErrorBarChart, {
      props: { label: "Tone", data, tone: "category3" },
    });
    expect(container.querySelector(".st-errorBarChart__whisker")?.classList.contains("st-errorBarChart__whisker--category3")).toBe(true);
    expect(container.querySelector(".st-errorBarChart__cap")?.classList.contains("st-errorBarChart__cap--category3")).toBe(true);
    expect(container.querySelector(".st-errorBarChart__marker")?.classList.contains("st-errorBarChart__marker--category3")).toBe(true);
  });

  it("renders a legend with the chart label", () => {
    const { getAllByText } = render(ErrorBarChart, { props: { label: "Croissance", data } });
    expect(getAllByText("Croissance").length).toBeGreaterThan(0);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const { container } = render(ErrorBarChart, { props: { label: "Interactive", data } });

    expect(screen.queryByRole("presentation")).toBeNull();

    const markers = container.querySelectorAll(".st-errorBarChart__marker");
    await fireEvent.pointerMove(markers[1]); // Design marker

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("Design").length).toBeGreaterThan(0);
    expect(screen.getAllByText("61 (54 – 69)").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(container.querySelector(".st-errorBarChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
