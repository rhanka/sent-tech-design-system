import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { HeikinAshiChart } from "./HeikinAshiChart.js";
import { HistogramChart } from "./HistogramChart.js";
import { HollowCandlestickChart } from "./HollowCandlestickChart.js";
import { ItemChart } from "./ItemChart.js";
import { KpiCardGroup } from "./KpiCardGroup.js";

afterEach(cleanup);

describe("P6 group 4 batch 2 (Preact leg + MaybeSignal mutations)", () => {
  it("HeikinAshiChart, HistogramChart, HollowCandlestickChart, ItemChart and KpiCardGroup react to post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "day", label: "Day", type: "discrete" },
        { id: "party", label: "Party", type: "discrete" },
      ],
      measures: [
        { id: "open", label: "Open", aggregation: "avg" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "low", label: "Low", aggregation: "min" },
        { id: "close", label: "Close", aggregation: "avg" },
        { id: "seats", label: "Seats", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { day: "Mon", party: "A", open: 100, high: 120, low: 95, close: 115, seats: 12 },
      { day: "Tue", party: "B", open: 115, high: 125, low: 105, close: 110, seats: 8 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const haCls = signal("ha-a");
    const histCls = signal("hist-a");
    const hollowCls = signal("hollow-a");
    const itemCls = signal("item-a");
    const kpiCls = signal("kpi-a");

    const { container } = render(
      <>
        <HeikinAshiChart store={store} viewId="ha" label_field="day" open="open" high="high" low="low" close="close" label="Heikin Ashi" className={haCls} />
        <HistogramChart store={store} viewId="hist" value="seats" bins={2} label="Seats histogram" className={histCls} />
        <HollowCandlestickChart store={store} viewId="hc" label_field="day" open="open" high="high" low="low" close="close" label="Hollow candles" className={hollowCls} />
        <ItemChart store={store} viewId="item" label_field="party" value="seats" label="Seat count" className={itemCls} />
        <KpiCardGroup store={store} configs={[{ id: "seats", measure: "seats", sparklineDimension: "day" }]} className={kpiCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Heikin Ashi" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Seats histogram" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Hollow candles" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Seat count" })).toBeTruthy();
    expect(container.querySelector(".kpi-a")?.textContent).toContain("Seats");
    expect(container.querySelector(".kpi-a")?.textContent).toContain("20");

    expect(container.querySelector(".ha-a")).toBeTruthy();
    expect(container.querySelector(".hist-a")).toBeTruthy();
    expect(container.querySelector(".hollow-a")).toBeTruthy();
    expect(container.querySelector(".item-a")).toBeTruthy();
    expect(container.querySelector(".kpi-a")).toBeTruthy();
    expect(container.querySelector(".ha-a [strokeWidth]")).toBeNull();
    expect(container.querySelector(".hollow-a [strokeWidth]")).toBeNull();

    haCls.value = "ha-b";
    histCls.value = "hist-b";
    hollowCls.value = "hollow-b";
    itemCls.value = "item-b";
    kpiCls.value = "kpi-b";

    await waitFor(() => {
      expect(container.querySelector(".ha-b")).toBeTruthy();
      expect(container.querySelector(".hist-b")).toBeTruthy();
      expect(container.querySelector(".hollow-b")).toBeTruthy();
      expect(container.querySelector(".item-b")).toBeTruthy();
      expect(container.querySelector(".kpi-b")).toBeTruthy();
    });
  });
});
