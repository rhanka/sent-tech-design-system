import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { SmallMultiples } from "./SmallMultiples.js";
import { SolidGaugeChart } from "./SolidGaugeChart.js";
import { Sparkline } from "./Sparkline.js";
import { StateTimelineChart } from "./StateTimelineChart.js";
import { StatusHistoryChart } from "./StatusHistoryChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 8 (Preact leg + MaybeSignal mutations)", () => {
  it("SmallMultiples, SolidGaugeChart, Sparkline, StateTimelineChart and StatusHistoryChart react to post-mount MaybeSignal mutations", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "region", label: "Region", type: "discrete" },
        { id: "product", label: "Product", type: "discrete" },
        { id: "service", label: "Service", type: "discrete" },
        { id: "status", label: "Status", type: "discrete" },
      ],
      measures: [
        { id: "sales", label: "Sales", aggregation: "sum" },
        { id: "start", label: "Start", aggregation: "min" },
        { id: "end", label: "End", aggregation: "max" },
        { id: "at", label: "At", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { region: "North", product: "A", service: "api", status: "ok", sales: 10, start: 0, end: 5, at: 1 },
      { region: "North", product: "B", service: "api", status: "warn", sales: 25, start: 5, end: 10, at: 2 },
      { region: "South", product: "A", service: "db", status: "ok", sales: 40, start: 0, end: 10, at: 1 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const smCls = signal("sm-a");
    const sgCls = signal("sg-a");
    const sparkCls = signal("spark-a");
    const sparkArea = signal(false);
    const stCls = signal("st-a");
    const shCls = signal("sh-a");

    const { container } = render(
      <>
        <SmallMultiples store={store} viewId="sm" facetBy="region" dimension="product" measure="sales" label="Sales facets" className={smCls} />
        <SolidGaugeChart store={store} viewId="sg" value="sales" min={0} max={100} label="Sales gauge" className={sgCls} />
        <Sparkline store={store} viewId="sp" dimension="product" measure="sales" area={sparkArea} label="Sales spark" className={sparkCls} />
        <StateTimelineChart store={store} viewId="st" series="service" start="start" end="end" state="status" label="Service state" className={stCls} />
        <StatusHistoryChart store={store} viewId="sh" series="service" at="at" value="status" label="Service history" className={shCls} />
      </>,
    );

    expect(screen.getByRole("group", { name: "Sales facets" })).toBeTruthy();
    expect(screen.getByRole("meter", { name: "Sales gauge" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Sales spark" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Service state" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Service history" })).toBeTruthy();

    expect(container.querySelector(".sm-a")).toBeTruthy();
    expect(container.querySelector(".sg-a")).toBeTruthy();
    expect(container.querySelector(".spark-a")).toBeTruthy();
    expect(container.querySelector(".spark-a .st-sparkline__area")).toBeNull();
    expect(container.querySelector(".st-a")).toBeTruthy();
    expect(container.querySelector(".sh-a")).toBeTruthy();
    expect(container.querySelector(".spark-a [strokeWidth]")).toBeNull();

    smCls.value = "sm-b";
    sgCls.value = "sg-b";
    sparkCls.value = "spark-b";
    sparkArea.value = true;
    stCls.value = "st-b";
    shCls.value = "sh-b";

    await waitFor(() => {
      expect(container.querySelector(".sm-b")).toBeTruthy();
      expect(container.querySelector(".sg-b")).toBeTruthy();
      expect(container.querySelector(".spark-b")).toBeTruthy();
      expect(container.querySelector(".spark-b .st-sparkline__area")).toBeTruthy();
      expect(container.querySelector(".st-b")).toBeTruthy();
      expect(container.querySelector(".sh-b")).toBeTruthy();
    });
  });
});
