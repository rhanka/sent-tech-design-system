import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { PalettePicker } from "./PalettePicker.js";
import { ParallelCoordinatesChart } from "./ParallelCoordinatesChart.js";
import { PercentileBandChart } from "./PercentileBandChart.js";
import { PivotDataTable } from "./PivotDataTable.js";
import { PointAndFigureChart } from "./PointAndFigureChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 4 (Preact leg + MaybeSignal mutations)", () => {
  it("PalettePicker, ParallelCoordinatesChart, PercentileBandChart, PivotDataTable and PointAndFigureChart react to post-mount className signals", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "country", label: "Country", type: "discrete" },
        { id: "ts", label: "Time", type: "continuous" },
      ],
      measures: [
        { id: "sales", label: "Sales", aggregation: "sum" },
        { id: "cost", label: "Cost", aggregation: "sum" },
        { id: "close", label: "Close", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { country: "FR", ts: 1, sales: 10, cost: 4, close: 100 },
      { country: "FR", ts: 2, sales: 20, cost: 8, close: 112 },
      { country: "US", ts: 3, sales: 30, cost: 15, close: 104 },
      { country: "US", ts: 4, sales: 40, cost: 18, close: 120 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const palCls = signal("pal-a");
    const parCls = signal("par-a");
    const bandCls = signal("band-a");
    const pivotCls = signal("pivot-a");
    const pnfCls = signal("pnf-a");

    const { container } = render(
      <>
        <PalettePicker
          categorical={["#1f77b4", "#ff7f0e"]}
          sequential={["#f7fbff", "#08306b"]}
          diverging={["#b2182b", "#f7f7f7", "#2166ac"]}
          label="Brand"
          className={palCls}
        />
        <ParallelCoordinatesChart store={store} viewId="par" measures={["sales", "cost"]} series="country" label="Parallel metrics" className={parCls} />
        <PercentileBandChart store={store} viewId="band" value="sales" lower={0.25} upper={0.75} label="Sales band" className={bandCls} />
        <PivotDataTable store={store} rows={["country"]} measures={["sales"]} caption="Pivot sales" className={pivotCls} />
        <PointAndFigureChart store={store} viewId="pnf" date="ts" close="close" boxSize={4} reversal={2} label="P&F close" className={pnfCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Parallel metrics" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Sales band" })).toBeTruthy();
    expect(screen.getByText("Pivot sales")).toBeTruthy();
    expect(screen.getByRole("img", { name: "P&F close" })).toBeTruthy();

    expect(container.querySelector(".pal-a")).toBeTruthy();
    expect(container.querySelector(".par-a")).toBeTruthy();
    expect(container.querySelector(".st-percentileBandChart")?.className).toContain("band-a");
    expect(container.querySelector(".pivot-a")).toBeTruthy();
    expect(container.querySelector(".pnf-a")).toBeTruthy();
    expect(container.querySelector(".band-a [strokeWidth]")).toBeNull();
    expect(container.querySelector(".par-a [strokeWidth]")).toBeNull();

    palCls.value = "pal-b";
    parCls.value = "par-b";
    bandCls.value = "band-b";
    pivotCls.value = "pivot-b";
    pnfCls.value = "pnf-b";

    await waitFor(() => {
      expect(container.querySelector(".pal-b")).toBeTruthy();
      expect(container.querySelector(".par-b")).toBeTruthy();
      expect(container.querySelector(".st-percentileBandChart")?.className).toContain("band-b");
      expect(container.querySelector(".pivot-b")).toBeTruthy();
      expect(container.querySelector(".pnf-b")).toBeTruthy();
    });
  });
});
