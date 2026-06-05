import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import WaterfallChart from "./lib/WaterfallChart.svelte";
import type { WaterfallChartDatum } from "./lib/WaterfallChart.svelte";

describe("WaterfallChart", () => {
  const data: WaterfallChartDatum[] = [
    { label: "Départ", value: 100, type: "total" },
    { label: "Ventes", value: 60, type: "increase" },
    { label: "Coûts", value: -40, type: "decrease" },
    { label: "Final", value: 120, type: "total" }
  ];

  it("renders an accessible img with one bar per datum", () => {
    const { container } = render(WaterfallChart, {
      props: { data, label: "Flux de trésorerie" }
    });

    expect(screen.getByRole("img", { name: "Flux de trésorerie" })).toBeTruthy();
    const wrapper = container.querySelector(".st-waterfallChart");
    expect(wrapper?.className).toContain("st-waterfallChart");

    const bars = container.querySelectorAll(".st-waterfallChart__bar");
    expect(bars.length).toBe(4);

    // Category labels rendered
    expect(screen.getByText("Départ")).toBeTruthy();
    expect(screen.getByText("Final")).toBeTruthy();
  });

  it("applies semantic classes by type and infers type from sign", () => {
    const { container } = render(WaterfallChart, {
      props: {
        data: [
          { label: "Base", value: 100, type: "total" },
          { label: "Up", value: 50 },
          { label: "Down", value: -30 }
        ],
        label: "Cascade"
      }
    });

    const bars = container.querySelectorAll(".st-waterfallChart__bar");
    expect(bars[0].getAttribute("class")).toContain("st-waterfallChart__bar--total");
    expect(bars[1].getAttribute("class")).toContain("st-waterfallChart__bar--increase");
    expect(bars[2].getAttribute("class")).toContain("st-waterfallChart__bar--decrease");
  });

  it("floats increase bars from the running cumulative", () => {
    const { container } = render(WaterfallChart, {
      props: {
        data: [
          { label: "Start", value: 100, type: "total" },
          { label: "Add", value: 50, type: "increase" }
        ],
        label: "Floating",
        width: 480,
        height: 240
      }
    });

    const bars = container.querySelectorAll<SVGRectElement>(".st-waterfallChart__bar");
    // The increase bar (cumulative 100 -> 150) sits above the total bar (0 -> 100),
    // so its top edge (y) must be smaller than the total bar's top edge.
    const totalY = Number(bars[0].getAttribute("y"));
    const incY = Number(bars[1].getAttribute("y"));
    expect(incY).toBeLessThan(totalY);
  });

  it("renders connector lines by default and omits them when disabled", () => {
    const { container: withConnectors } = render(WaterfallChart, {
      props: { data, label: "With" }
    });
    expect(
      withConnectors.querySelectorAll(".st-waterfallChart__connector").length
    ).toBe(data.length - 1);

    const { container: withoutConnectors } = render(WaterfallChart, {
      props: { data, label: "Without", connectors: false }
    });
    expect(
      withoutConnectors.querySelectorAll(".st-waterfallChart__connector").length
    ).toBe(0);
  });

  it("renders a zero baseline and a legend", () => {
    const { container } = render(WaterfallChart, {
      props: { data, label: "Zero" }
    });

    expect(container.querySelector(".st-waterfallChart__zero")).toBeTruthy();
    const legendItems = container.querySelectorAll(".st-waterfallChart__legendItem");
    expect(legendItems.length).toBe(3);
  });

  it("uses a custom format for the accessible data list and tooltip", async () => {
    const { container } = render(WaterfallChart, {
      props: {
        data,
        label: "Formatted",
        format: (v: number) => `$${v}`
      }
    });

    // Accessible data list reflects formatted values
    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("$100");
    expect(list?.textContent).toContain("$60");

    // Tooltip on hover reflects the same formatting
    const bars = container.querySelectorAll(".st-waterfallChart__bar");
    await fireEvent.pointerMove(bars[1]);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("$60").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(
      container.querySelector(".st-waterfallChart__visual") as Element
    );
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("handles an empty dataset without crashing", () => {
    const { container } = render(WaterfallChart, {
      props: { data: [], label: "Empty" }
    });
    expect(container.querySelectorAll(".st-waterfallChart__bar").length).toBe(0);
    expect(screen.getByRole("img", { name: "Empty" })).toBeTruthy();
  });
});
