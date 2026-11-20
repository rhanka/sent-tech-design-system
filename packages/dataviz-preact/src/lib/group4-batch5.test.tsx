import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { PolygonChart } from "./PolygonChart.js";
import { QueryBar } from "./QueryBar.js";
import { RadarChart } from "./RadarChart.js";
import { RangeSliderFilter, numericDomain, rangeBoundsToSpec } from "./RangeSliderFilter.js";
import { RecordsTable } from "./RecordsTable.js";

afterEach(cleanup);

describe("P6 group 4 batch 5 (Preact leg + MaybeSignal mutations)", () => {
  it("PolygonChart, QueryBar, RadarChart, RangeSliderFilter and RecordsTable react to post-mount MaybeSignal mutations", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "service", label: "Service", type: "discrete" },
        { id: "message", label: "Message", type: "discrete" },
        { id: "amount", label: "Amount", type: "continuous" },
      ],
      measures: [
        { id: "x", label: "X", aggregation: "sum" },
        { id: "y", label: "Y", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { service: "checkout", message: "payment accepted", amount: 0, x: 10, y: 20 },
      { service: "billing", message: "Payment retried", amount: 5, x: 30, y: 15 },
      { service: "auth", message: "token refreshed", amount: 10, x: 20, y: 35 },
    ];
    const store = createDashboardStore({ model, data: rows });

    expect(numericDomain(rows, "amount")).toEqual({ min: 0, max: 10 });
    expect(rangeBoundsToSpec(2, 8, { min: 0, max: 10 })).toEqual({ kind: "range", min: 2, max: 8 });

    const polyCls = signal("poly-a");
    const queryCls = signal("query-a");
    const caseSensitive = signal(false);
    const radarCls = signal("radar-a");
    const radarLegend = signal(true);
    const rangeCls = signal("range-a");
    const recordsCls = signal("records-a");

    const { container } = render(
      <>
        <PolygonChart store={store} viewId="poly" x="x" y="y" label="Shape poly" className={polyCls} />
        <QueryBar store={store} dimension="service" fields={["message"]} label="Search logs" caseSensitive={caseSensitive} className={queryCls} />
        <RadarChart store={store} viewId="radar" axes={["x", "y"]} series="service" legend={radarLegend} label="Service radar" className={radarCls} />
        <RangeSliderFilter store={store} dimension="amount" label="Amount range" className={rangeCls} />
        <RecordsTable store={store} caption="Records" className={recordsCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Shape poly" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Service radar" })).toBeTruthy();
    expect(screen.getByText("Records")).toBeTruthy();

    expect(container.querySelector(".poly-a")).toBeTruthy();
    expect(container.querySelector(".st-queryBar")?.className).toContain("query-a");
    expect(container.querySelector(".radar-a")).toBeTruthy();
    expect(container.querySelector(".radar-a .st-radarChart__legend")).toBeTruthy();
    expect(container.querySelector(".range-a")).toBeTruthy();
    expect(container.querySelector(".records-a")).toBeTruthy();
    expect(container.querySelector(".records-a tbody")?.querySelectorAll("tr")).toHaveLength(3);

    const searchbox = screen.getByRole("searchbox", { name: "Search logs" });
    fireEvent.input(searchbox, { target: { value: "Payment" } });
    await waitFor(() => {
      expect(container.querySelector(".records-a tbody")?.querySelectorAll("tr")).toHaveLength(2);
    });

    polyCls.value = "poly-b";
    queryCls.value = "query-b";
    caseSensitive.value = true;
    radarCls.value = "radar-b";
    radarLegend.value = false;
    rangeCls.value = "range-b";
    recordsCls.value = "records-b";

    await waitFor(() => {
      expect(container.querySelector(".poly-b")).toBeTruthy();
      expect(container.querySelector(".st-queryBar")?.className).toContain("query-b");
      expect(container.querySelector(".radar-b")).toBeTruthy();
      expect(container.querySelector(".radar-b .st-radarChart__legend")).toBeNull();
      expect(container.querySelector(".range-b")).toBeTruthy();
      expect(container.querySelector(".records-b")).toBeTruthy();
    });

    fireEvent.input(searchbox, { target: { value: "Payment" } });
    await waitFor(() => {
      expect(container.querySelector(".records-b tbody")?.querySelectorAll("tr")).toHaveLength(1);
    });
  });
});
