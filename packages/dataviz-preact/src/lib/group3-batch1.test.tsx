import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { ColumnPyramidChart } from "./ColumnPyramidChart.js";
import { ColumnRangeChart } from "./ColumnRangeChart.js";
import { ContourChart } from "./ContourChart.js";
import { CorrelationMatrix } from "./CorrelationMatrix.js";
import { DashboardActiveFilters } from "./DashboardActiveFilters.js";

afterEach(cleanup);

describe("P6 group 3 batch 1 (Preact leg + MaybeSignal mutations)", () => {
  it("ColumnPyramidChart, ColumnRangeChart, ContourChart and CorrelationMatrix follow post-mount signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [{ id: "cat", label: "Category", type: "discrete" }],
      measures: [
        { id: "val", label: "Value", aggregation: "sum" },
        { id: "low", label: "Low", aggregation: "min" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "x", label: "X", aggregation: "avg" },
        { id: "y", label: "Y", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { cat: "A", val: 30, low: 10, high: 40, x: 1, y: 2 },
      { cat: "B", val: 50, low: 20, high: 65, x: 2, y: 4 },
      { cat: "C", val: 20, low: 5, high: 25, x: 3, y: 5 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const pyramidCls = signal("pyramid-a");
    const rangeCls = signal("range-a");
    const contourCls = signal("contour-a");
    const corrCls = signal("corr-a");
    const corrLegend = signal(true);

    const { container } = render(
      <>
        <ColumnPyramidChart store={store} viewId="pyr" category="cat" value="val" label="Pyramid" className={pyramidCls} />
        <ColumnRangeChart store={store} viewId="rng" category="cat" low="low" high="high" label="Range" className={rangeCls} />
        <ContourChart store={store} viewId="cnt" x="x" y="y" value="val" levels={3} label="Contour" className={contourCls} />
        <CorrelationMatrix store={store} viewId="cor" measures={["val", "low", "high"]} legend={corrLegend} label="Corr" className={corrCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Pyramid" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Range" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Contour" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Corr" })).toBeTruthy();
    expect(container.querySelector(".pyramid-a")).toBeTruthy();
    expect(container.querySelector(".range-a")).toBeTruthy();
    expect(container.querySelector(".contour-a")).toBeTruthy();
    expect(container.querySelector(".corr-a")).toBeTruthy();
    expect(container.querySelector(".corr-a .st-heatmapChart__legend")).toBeTruthy();

    const corrText = container.querySelector(".corr-a svg text");
    expect(corrText?.getAttribute("text-anchor")).toBeTruthy();
    expect(corrText?.getAttribute("textAnchor")).toBeNull();

    pyramidCls.value = "pyramid-b";
    rangeCls.value = "range-b";
    contourCls.value = "contour-b";
    corrCls.value = "corr-b";
    corrLegend.value = false;

    await waitFor(() => {
      expect(container.querySelector(".pyramid-b")).toBeTruthy();
      expect(container.querySelector(".range-b")).toBeTruthy();
      expect(container.querySelector(".contour-b")).toBeTruthy();
      expect(container.querySelector(".corr-b")).toBeTruthy();
      expect(container.querySelector(".corr-b .st-heatmapChart__legend")).toBeNull();
    });
  });

  it("DashboardActiveFilters follows post-mount className signal and clears filters while keeping selections", async () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const store = createDashboardStore({ model, data: [{ country: "France", sales: 10 }] });
    store.setFilter("country", { kind: "include", values: ["France"] });
    store.toggleSelection("byCountry", "France");
    const cls = signal("filters-a");

    const { container } = render(<DashboardActiveFilters store={store} className={cls} />);

    expect(container.querySelector(".filters-a")).toBeTruthy();
    expect(screen.getByText("Pays")).toBeTruthy();
    expect(screen.getByText("France")).toBeTruthy();

    cls.value = "filters-b";
    await waitFor(() => expect(container.querySelector(".filters-b")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Tout effacer" }));
    await waitFor(() => {
      expect(Object.keys(store.getState().filters)).toHaveLength(0);
      expect(store.getState().selections.byCountry).toEqual(["France"]);
    });
  });
});
