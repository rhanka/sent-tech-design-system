import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  AreaChart,
  BarChart,
  DataTable,
  DonutChart,
  LineChart,
  ScatterPlot,
  Sparkline,
  StackedBarChart,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("BarChart parity with Svelte", () => {
  it("renders tone classes, category labels, axes and a screen-reader data list", () => {
    const { container } = render(
      <BarChart
        label="Revenue"
        data={[
          { label: "A", value: 4, tone: "category3" },
          { label: "B", value: 8 },
        ]}
      />,
    );
    const root = container.querySelector(".st-barChart")!;
    expect(root.querySelector(".st-barChart__visual")?.getAttribute("aria-label")).toBe("Revenue");
    expect(container.querySelector(".st-barChart__bar--category3")).toBeTruthy();
    // default tone is category1
    expect(container.querySelector(".st-barChart__bar--category1")).toBeTruthy();
    expect(container.querySelectorAll(".st-barChart__bar").length).toBe(2);
    expect(container.querySelectorAll(".st-barChart__axis").length).toBe(2);
    const labels = Array.from(container.querySelectorAll(".st-barChart__categoryLabel")).map((n) => n.textContent);
    expect(labels).toEqual(["A", "B"]);
    const dataList = container.querySelector(".st-chartDataList")!;
    expect(dataList.getAttribute("aria-label")).toBe("Data values for Revenue");
    expect(Array.from(dataList.querySelectorAll("li")).map((n) => n.textContent)).toEqual(["A: 4", "B: 8"]);
  });

  it("honours horizontal orientation and custom dimensions via viewBox", () => {
    const { container } = render(
      <BarChart label="H" width={300} height={120} orientation="horizontal" data={[{ label: "A", value: 4 }]} />,
    );
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 300 120");
    // horizontal category labels are end-anchored
    expect(container.querySelector(".st-barChart__categoryLabel")?.getAttribute("text-anchor")).toBe("end");
  });

  it("shows a tooltip on pointer move over a bar", () => {
    const { container } = render(<BarChart label="T" data={[{ label: "A", value: 4 }]} />);
    const bar = container.querySelector(".st-barChart__bar")!;
    fireEvent.pointerMove(bar);
    expect(container.querySelector(".st-barChart__tooltip")).toBeTruthy();
  });
});

describe("LineChart parity with Svelte", () => {
  it("applies tone modifier, draws a line path and dots, and exposes data values", () => {
    const { container } = render(
      <LineChart label="Series" tone="category5" data={[{ x: "Mon", y: 10 }, { x: "Tue", y: 14 }, { x: "Wed", y: 8 }]} />,
    );
    expect(container.querySelector(".st-lineChart--category5")).toBeTruthy();
    expect(container.querySelector(".st-lineChart__line")?.getAttribute("d")?.startsWith("M")).toBe(true);
    expect(container.querySelectorAll(".st-lineChart__dot").length).toBe(3);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Mon: 10", "Tue: 14", "Wed: 8"]);
  });

  it("renders an area path only when area is enabled and closes the path", () => {
    const { container: plain } = render(<LineChart label="L" data={[{ x: 0, y: 1 }, { x: 1, y: 3 }]} />);
    expect(plain.querySelector(".st-lineChart__area")).toBeNull();
    const { container: withArea } = render(<LineChart label="L" area data={[{ x: 0, y: 1 }, { x: 1, y: 3 }]} />);
    expect(withArea.querySelector(".st-lineChart__area")?.getAttribute("d")?.endsWith("Z")).toBe(true);
  });

  it("emits cubic beziers when smooth is set", () => {
    const { container } = render(
      <LineChart label="L" smooth data={[{ x: 0, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 2 }]} />,
    );
    expect(container.querySelector(".st-lineChart__line")?.getAttribute("d")).toContain("C");
  });
});

describe("AreaChart parity with Svelte", () => {
  it("accepts a bare number[] and normalises it, drawing area + line + dots", () => {
    const { container } = render(<AreaChart label="Bare" data={[3, 6, 2, 8]} />);
    expect(container.querySelector(".st-areaChart__area")).toBeTruthy();
    expect(container.querySelector(".st-areaChart__line")).toBeTruthy();
    expect(container.querySelectorAll(".st-areaChart__dot").length).toBe(4);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["0: 3", "1: 6", "2: 2", "3: 8"]);
  });

  it("fills the area with a gradient via a unique linearGradient id", () => {
    const { container } = render(<AreaChart label="Grad" tone="category2" data={[{ x: "a", y: 1 }, { x: "b", y: 5 }]} />);
    const grad = container.querySelector("linearGradient")!;
    const id = grad.getAttribute("id")!;
    expect(id).toContain("st-areachart-gradient-");
    expect(container.querySelector(".st-areaChart__area")?.getAttribute("fill")).toBe(`url(#${id})`);
    expect(container.querySelector(".st-areaChart--category2")).toBeTruthy();
  });
});

describe("Sparkline parity with Svelte", () => {
  it("renders a span with tone, default 120x28 viewBox and a stroke path", () => {
    const { container } = render(<Sparkline label="Trend" data={[1, 4, 2, 6]} />);
    const root = container.querySelector(".st-sparkline")!;
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.classList.contains("st-sparkline--neutral")).toBe(true);
    expect(root.getAttribute("aria-label")).toBe("Trend");
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 120 28");
    expect(container.querySelector(".st-sparkline__line")?.getAttribute("stroke-width")).toBe("1.5");
  });

  it("supports custom dimensions, strokeWidth, tone and an optional area fill", () => {
    const { container } = render(
      <Sparkline label="A" data={[1, 2, 3]} width={200} height={40} tone="success" strokeWidth={3} area />,
    );
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 40");
    expect(container.querySelector(".st-sparkline--success")).toBeTruthy();
    expect(container.querySelector(".st-sparkline__line")?.getAttribute("stroke-width")).toBe("3");
    expect(container.querySelector(".st-sparkline__area")).toBeTruthy();
  });
});

describe("DonutChart parity with Svelte", () => {
  it("draws ring slices with tone classes, a center total and an SR data list", () => {
    const { container } = render(
      <DonutChart
        label="Storage"
        data={[
          { label: "Used", value: 70, tone: "category3" },
          { label: "Free", value: 30 },
        ]}
      />,
    );
    expect(container.querySelector(".st-donutChart__visual")?.getAttribute("aria-label")).toBe("Storage");
    expect(container.querySelectorAll(".st-donutChart__slice").length).toBe(2);
    expect(container.querySelector(".st-donutChart__slice--category3")).toBeTruthy();
    expect(container.querySelector(".st-donutChart__slice")?.getAttribute("d")?.startsWith("M")).toBe(true);
    // default centerLabel is the total
    expect(container.querySelector(".st-donutChart__center")?.textContent).toBe("100");
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Used: 70 (70%)", "Free: 30 (30%)"]);
  });

  it("honours a custom centerLabel and hides it when null, and shows a tooltip on hover", () => {
    const { container, rerender } = render(<DonutChart label="L" centerLabel="42%" data={[{ label: "A", value: 1 }]} />);
    expect(container.querySelector(".st-donutChart__center")?.textContent).toBe("42%");
    fireEvent.pointerMove(container.querySelector(".st-donutChart__slice")!);
    expect(container.querySelector(".st-donutChart__tooltip")).toBeTruthy();
    rerender(<DonutChart label="L" centerLabel={null} data={[{ label: "A", value: 1 }]} />);
    expect(container.querySelector(".st-donutChart__center")).toBeNull();
  });
});

describe("ScatterPlot parity with Svelte", () => {
  it("plots points with tone classes, axes, gridlines, tick labels and a data list", () => {
    const { container } = render(
      <ScatterPlot
        label="Scatter"
        xLabel="X"
        yLabel="Y"
        data={[
          { x: 1, y: 2, label: "P1", tone: "category4" },
          { x: 3, y: 5 },
        ]}
      />,
    );
    expect(container.querySelector(".st-scatterPlot__visual")?.getAttribute("aria-label")).toBe("Scatter");
    expect(container.querySelectorAll(".st-scatterPlot__point").length).toBe(2);
    expect(container.querySelector(".st-scatterPlot__point--category4")).toBeTruthy();
    expect(container.querySelectorAll(".st-scatterPlot__axis").length).toBe(2);
    expect(container.querySelectorAll(".st-scatterPlot__grid").length).toBeGreaterThan(0);
    const axisLabels = Array.from(container.querySelectorAll(".st-scatterPlot__axisLabel")).map((n) => n.textContent);
    expect(axisLabels).toEqual(["X", "Y"]);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["P1: x 1, y 2", "x 3, y 5"]);
  });

  it("honours a custom radius and viewBox and shows a tooltip on hover", () => {
    const { container } = render(
      <ScatterPlot label="S" width={300} height={150} radius={9} data={[{ x: 1, y: 1, label: "Pt" }]} />,
    );
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 300 150");
    expect(container.querySelector(".st-scatterPlot__point")?.getAttribute("r")).toBe("9");
    fireEvent.pointerMove(container.querySelector(".st-scatterPlot__point")!);
    expect(container.querySelector(".st-scatterPlot__tooltip")).toBeTruthy();
  });
});

describe("StackedBarChart parity with Svelte", () => {
  it("stacks segments per bar with tone classes, category labels, a legend and a data list", () => {
    const { container } = render(
      <StackedBarChart
        label="Sales"
        data={[
          { label: "Q1", segments: [{ label: "Won", value: 7, tone: "category2" }, { label: "Lost", value: 3 }] },
          { label: "Q2", segments: [{ label: "Won", value: 5 }, { label: "Lost", value: 5 }] },
        ]}
      />,
    );
    expect(container.querySelector(".st-stackedBar__visual")?.getAttribute("aria-label")).toBe("Sales");
    expect(container.querySelectorAll(".st-stackedBar__seg").length).toBe(4);
    expect(container.querySelector(".st-stackedBar__seg--category2")).toBeTruthy();
    const cats = Array.from(container.querySelectorAll(".st-stackedBar__categoryLabel")).map((n) => n.textContent);
    expect(cats).toEqual(["Q1", "Q2"]);
    // legend derives one entry per unique series label
    const legend = Array.from(container.querySelectorAll(".st-stackedBar__legendItem")).map((n) => n.textContent?.trim());
    expect(legend).toEqual(["Won", "Lost"]);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toEqual(["Q1, Won: 7", "Q1, Lost: 3", "Q2, Won: 5", "Q2, Lost: 5"]);
  });

  it("can hide the legend and shows a tooltip on hover", () => {
    const { container } = render(
      <StackedBarChart label="S" showLegend={false} data={[{ label: "Q1", segments: [{ label: "A", value: 2 }] }]} />,
    );
    expect(container.querySelector(".st-stackedBar__legend")).toBeNull();
    fireEvent.pointerMove(container.querySelector(".st-stackedBar__seg")!);
    expect(container.querySelector(".st-stackedBar__tooltip")).toBeTruthy();
  });
});

describe("DataTable parity with Svelte", () => {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "count", label: "Count", align: "end" as const },
  ];
  const rows = [
    { id: "a", name: "Beta", count: 4 },
    { id: "b", name: "Alpha", count: 2 },
    { id: "c", name: "Gamma", count: 6 },
  ];

  it("renders a caption, headers, sortable buttons, aligned cells and rows", () => {
    const { container } = render(<DataTable columns={columns} rows={rows} caption="People" size="sm" />);
    expect(container.querySelector(".st-dataTable--sm")).toBeTruthy();
    expect(container.querySelector("caption")?.textContent).toBe("People");
    expect(container.querySelector(".st-dataTable__sortBtn")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
    expect(container.querySelector("td.st-dataTable__cell--end")?.textContent).toBe("4");
  });

  it("sorts rows asc, then desc, then resets on the third header click", () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const sortBtn = container.querySelector(".st-dataTable__sortBtn") as HTMLButtonElement;
    const names = () => Array.from(container.querySelectorAll("tbody tr td:first-child")).map((n) => n.textContent);
    expect(names()).toEqual(["Beta", "Alpha", "Gamma"]);
    fireEvent.click(sortBtn);
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(container.querySelector('th[aria-sort="ascending"]')).toBeTruthy();
    fireEvent.click(sortBtn);
    expect(names()).toEqual(["Gamma", "Beta", "Alpha"]);
    fireEvent.click(sortBtn);
    expect(names()).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  it("supports multiple selection with a header select-all and emits onSelectionChange", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable columns={columns} rows={rows} selectable="multiple" onSelectionChange={onSelectionChange} />,
    );
    const boxes = container.querySelectorAll('tbody input[type="checkbox"]');
    expect(boxes.length).toBe(3);
    fireEvent.click(boxes[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(["a"]);
    expect(container.querySelector(".st-dataTable__row--selected")).toBeTruthy();
    const selectAll = container.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(selectAll);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
  });

  it("paginates with a range label and prev/next controls", () => {
    const { container } = render(<DataTable columns={columns} rows={rows} pageSize={2} />);
    expect(container.querySelector(".st-dataTable__range")?.textContent).toBe("1–2 of 3");
    expect(container.querySelectorAll("tbody tr").length).toBe(2);
    const [prev, next] = Array.from(container.querySelectorAll(".st-dataTable__pagerBtn")) as HTMLButtonElement[];
    expect(prev.disabled).toBe(true);
    fireEvent.click(next);
    expect(container.querySelector(".st-dataTable__range")?.textContent).toBe("3–3 of 3");
    expect(container.querySelectorAll("tbody tr").length).toBe(1);
  });

  it("renders custom cells, an empty label and fires onRowClick", () => {
    const onRowClick = vi.fn();
    const { container, rerender } = render(
      <DataTable
        columns={[{ key: "name", label: "Name", cell: (row) => <strong>{String(row.name)}</strong> }]}
        rows={rows}
        onRowClick={onRowClick}
      />,
    );
    expect(container.querySelector("td strong")?.textContent).toBe("Beta");
    fireEvent.click(container.querySelector(".st-dataTable__row--clickable")!);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
    rerender(<DataTable columns={columns} rows={[]} emptyLabel="Nothing here" />);
    expect(container.querySelector(".st-dataTable__empty")?.textContent).toBe("Nothing here");
  });
});
