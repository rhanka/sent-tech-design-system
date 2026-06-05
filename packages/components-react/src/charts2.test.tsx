import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  ComboChart,
  FunnelChart,
  GaugeChart,
  KpiCard,
  TreemapChart,
  WaterfallChart,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("KpiCard parity with Svelte", () => {
  it("renders label, formatted value, unit and derives the trend from delta", () => {
    const { container } = render(
      <KpiCard label="Latency" value={1234} unit="ms" delta={0.05} format="number" locale="en-US" />,
    );
    const root = container.querySelector(".st-kpiCard")!;
    expect(root.tagName.toLowerCase()).toBe("article");
    expect(root.getAttribute("role")).toBe("group");
    expect(container.querySelector(".st-kpiCard__label")?.textContent).toBe("Latency");
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("1,234");
    expect(container.querySelector(".st-kpiCard__unit")?.textContent).toBe("ms");
    // positive delta -> up trend, success-coloured delta
    expect(container.querySelector(".st-kpiCard__delta--up")).toBeTruthy();
    expect(container.querySelector(".st-kpiCard__deltaValue")?.textContent).toBe("+5%");
  });

  it("formats currency/percent, applies a tone accent and renders a sparkline", () => {
    const { container } = render(
      <KpiCard
        label="MRR"
        value={4200}
        format="currency"
        currency="USD"
        locale="en-US"
        tone="category3"
        sparkline={[1, 4, 2, 6]}
        delta={-0.1}
      />,
    );
    expect(container.querySelector(".st-kpiCard--category3")).toBeTruthy();
    expect(container.querySelector(".st-kpiCard--toned")).toBeTruthy();
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("$4,200.00");
    // negative delta -> down trend, sparkline tone error
    expect(container.querySelector(".st-kpiCard__delta--down")).toBeTruthy();
    expect(container.querySelector(".st-kpiCard__sparkline.st-sparkline--error")).toBeTruthy();
  });

  it("accepts a string value verbatim and shows a flat trend at delta 0", () => {
    const { container } = render(<KpiCard label="Status" value="N/A" delta={0} />);
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("N/A");
    expect(container.querySelector(".st-kpiCard__delta--flat")).toBeTruthy();
  });
});

describe("ComboChart parity with Svelte", () => {
  it("draws grouped bars, a line with dots, a legend and an SR data list", () => {
    const { container } = render(
      <ComboChart
        label="Revenue vs margin"
        categories={["Q1", "Q2"]}
        bars={[{ label: "Revenue", data: [10, 20] }]}
        lines={[{ label: "Margin", data: [3, 5] }]}
      />,
    );
    expect(container.querySelector(".st-comboChart__visual")?.getAttribute("aria-label")).toBe(
      "Revenue vs margin",
    );
    expect(container.querySelectorAll(".st-comboChart__bar").length).toBe(2);
    expect(container.querySelector(".st-comboChart__line")?.getAttribute("d")?.startsWith("M")).toBe(true);
    expect(container.querySelectorAll(".st-comboChart__dot").length).toBe(2);
    // bar uses category1, line shifts to category2 (after the single bar series)
    expect(container.querySelector(".st-comboChart__bar--category1")).toBeTruthy();
    expect(container.querySelector(".st-comboChart__line--category2")).toBeTruthy();
    const legend = Array.from(container.querySelectorAll(".st-comboChart__legendItem")).map((n) =>
      n.textContent?.trim(),
    );
    expect(legend).toEqual(["Revenue", "Margin"]);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Revenue, Q1: 10", "Revenue, Q2: 20", "Margin, Q1: 3", "Margin, Q2: 5"]);
  });

  it("hides the legend and shows a tooltip on bar hover", () => {
    const { container } = render(
      <ComboChart
        label="C"
        legend={false}
        categories={["A"]}
        bars={[{ label: "B", data: [5] }]}
      />,
    );
    expect(container.querySelector(".st-comboChart__legend")).toBeNull();
    fireEvent.pointerMove(container.querySelector(".st-comboChart__bar")!);
    expect(container.querySelector(".st-comboChart__tooltip")).toBeTruthy();
  });
});

describe("GaugeChart parity with Svelte", () => {
  it("renders a meter with value bounds, a progress arc and a needle", () => {
    const { container } = render(<GaugeChart value={60} label="Load" />);
    const meter = container.querySelector(".st-gaugeChart__visual")!;
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("60");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(meter.getAttribute("aria-valuetext")).toBe("Load: 60");
    // no thresholds -> a progress arc is drawn
    expect(container.querySelector(".st-gaugeChart__progress")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__needle")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__value")?.textContent).toBe("60");
  });

  it("draws threshold bands instead of a progress arc and formats percent", () => {
    const { container } = render(
      <GaugeChart
        value={50}
        format="percent"
        thresholds={[
          { value: 40, tone: "success" },
          { value: 80, tone: "warning" },
        ]}
      />,
    );
    expect(container.querySelector(".st-gaugeChart__progress")).toBeNull();
    expect(container.querySelector(".st-gaugeChart__band--success")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__band--warning")).toBeTruthy();
    expect(container.querySelector(".st-gaugeChart__value")?.textContent).toBe("50%");
  });
});

describe("FunnelChart parity with Svelte", () => {
  it("renders trapezoid segments, tone classes, percentages and an SR data list", () => {
    const { container } = render(
      <FunnelChart
        label="Conversion"
        data={[
          { label: "Visits", value: 1000 },
          { label: "Signups", value: 400, tone: "category5" },
          { label: "Paid", value: 100 },
        ]}
      />,
    );
    expect(container.querySelector(".st-funnelChart__visual")?.getAttribute("aria-label")).toBe(
      "Conversion",
    );
    expect(container.querySelectorAll(".st-funnelChart__segment").length).toBe(3);
    expect(container.querySelector(".st-funnelChart__segment--category5")).toBeTruthy();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Visits: 1000 (100%)", "Signups: 400 (40%)", "Paid: 100 (10%)"]);
  });

  it("supports ofPrevious percent mode, an optional legend and a hover tooltip", () => {
    const { container } = render(
      <FunnelChart
        label="F"
        percentMode="ofPrevious"
        legend
        data={[
          { label: "A", value: 100 },
          { label: "B", value: 50 },
        ]}
      />,
    );
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["A: 100 (100%)", "B: 50 (50%)"]);
    expect(container.querySelectorAll(".st-funnelChart__legendItem").length).toBe(2);
    fireEvent.pointerMove(container.querySelector(".st-funnelChart__segment")!);
    expect(container.querySelector(".st-funnelChart__tooltip")).toBeTruthy();
  });
});

describe("WaterfallChart parity with Svelte", () => {
  it("classifies bars by sign, draws connectors, a legend and a data list", () => {
    const { container } = render(
      <WaterfallChart
        label="Cash"
        data={[
          { label: "Start", value: 100, type: "total" },
          { label: "Up", value: 40 },
          { label: "Down", value: -30 },
          { label: "End", value: 110, type: "total" },
        ]}
      />,
    );
    expect(container.querySelector(".st-waterfallChart__visual")?.getAttribute("aria-label")).toBe("Cash");
    expect(container.querySelectorAll(".st-waterfallChart__bar").length).toBe(4);
    expect(container.querySelector(".st-waterfallChart__bar--total")).toBeTruthy();
    expect(container.querySelector(".st-waterfallChart__bar--increase")).toBeTruthy();
    expect(container.querySelector(".st-waterfallChart__bar--decrease")).toBeTruthy();
    // 3 connectors between 4 bars
    expect(container.querySelectorAll(".st-waterfallChart__connector").length).toBe(3);
    const legend = Array.from(container.querySelectorAll(".st-waterfallChart__legendItem")).map((n) =>
      n.textContent?.trim(),
    );
    expect(legend).toEqual(["Hausse", "Baisse", "Total"]);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Start: 100", "Up: 40", "Down: -30", "End: 110"]);
  });

  it("honours a custom format, drops connectors when disabled and shows a tooltip", () => {
    const { container } = render(
      <WaterfallChart
        label="W"
        connectors={false}
        format={(v) => `$${v}`}
        data={[
          { label: "A", value: 10 },
          { label: "B", value: 5 },
        ]}
      />,
    );
    expect(container.querySelector(".st-waterfallChart__connector")).toBeNull();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["A: $10", "B: $5"]);
    fireEvent.pointerMove(container.querySelector(".st-waterfallChart__bar")!);
    expect(container.querySelector(".st-waterfallChart__tooltipValue")?.textContent).toBe("$10");
  });
});

describe("TreemapChart parity with Svelte", () => {
  it("tiles cells with tone classes, labels and an SR data list", () => {
    const { container } = render(
      <TreemapChart
        label="Disk"
        width={400}
        height={300}
        data={[
          { label: "Apps", value: 60, tone: "category2" },
          { label: "Media", value: 40 },
        ]}
      />,
    );
    expect(container.querySelector(".st-treemapChart__visual")?.getAttribute("aria-label")).toBe("Disk");
    expect(container.querySelectorAll(".st-treemapChart__rect").length).toBe(2);
    expect(container.querySelector(".st-treemapChart__rect--category2")).toBeTruthy();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Apps: 60", "Media: 40"]);
  });

  it("subdivides children into level-2 cells, prefixing the parent in the data list", () => {
    const { container } = render(
      <TreemapChart
        label="Tree"
        legend
        data={[
          {
            label: "Group",
            value: 0,
            children: [
              { label: "Child A", value: 30 },
              { label: "Child B", value: 20 },
            ],
          },
        ]}
      />,
    );
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Group, Child A: 30", "Group, Child B: 20"]);
    // legend renders one swatch for the top-level group
    expect(container.querySelectorAll(".st-treemapChart__legendItem").length).toBe(1);
    fireEvent.pointerMove(container.querySelector(".st-treemapChart__rect")!);
    expect(container.querySelector(".st-treemapChart__tooltip")).toBeTruthy();
  });
});
