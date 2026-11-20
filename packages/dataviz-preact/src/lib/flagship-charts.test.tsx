import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import {
  createDashboardStore,
  rangeSelectionKey,
  type DataModel,
  type DateHistogramBin,
  type Row,
  type TimeRange,
} from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CrossfilteredBarChart } from "./CrossfilteredBarChart.js";
import { DateHistogramChart } from "./DateHistogramChart.js";
import { DivergingBarChart } from "./DivergingBarChart.js";
import { ParetoChart } from "./ParetoChart.js";
import { TimeSeriesLineChart } from "./TimeSeriesLineChart.js";

afterEach(cleanup);

describe("P6 batch 3 flagship charts (Preact leg + MaybeSignal mutations)", () => {
  it("CrossfilteredBarChart (vertical & horizontal) follows className, selectable and hoverKey signals post-mount", async () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const data: Row[] = [
      { country: "FR", sales: 15 },
      { country: "US", sales: 20 },
    ];
    const store = createDashboardStore({ model, data });
    const cls = signal("cf-a");
    const selectable = signal(true);
    const hoverKey = signal<string | null>(null);
    const onSelectKey = vi.fn();

    const { container, rerender } = render(
      <CrossfilteredBarChart
        store={store}
        viewId="byCountry"
        dimension="country"
        measure="sales"
        label="Ventes par pays"
        className={cls}
        selectable={selectable}
        hoverKey={hoverKey}
        onSelectKey={onSelectKey}
      />,
    );

    expect(container.querySelector(".st-barChart")?.className).toContain("cf-a");
    expect(screen.getByRole("button", { name: /^FR:/ })).toBeTruthy();
    expect(container.querySelector(".st-barChart__tooltip")).toBeNull();

    // Brushing click toggles store selection.
    fireEvent.click(screen.getByRole("button", { name: /^FR:/ }));
    expect(store.getState().selections.byCountry).toEqual(["FR"]);

    // Post-mount signal mutations update DOM.
    cls.value = "cf-b";
    selectable.value = false;
    hoverKey.value = "US";
    await waitFor(() => {
      expect(container.querySelector(".st-barChart")?.className).toContain("cf-b");
      expect(screen.queryByRole("button", { name: /^FR:/ })).toBeNull();
      expect(container.querySelector(".st-barChart__tooltip")?.textContent).toContain("20");
    });

    // Horizontal SVG branch also follows className & selectable signals.
    rerender(
      <CrossfilteredBarChart
        store={store}
        viewId="byCountry"
        dimension="country"
        measure="sales"
        label="Ventes par pays"
        orientation="horizontal"
        className={cls}
        selectable={selectable}
      />,
    );
    expect(container.querySelector(".st-barChart")?.className).toContain("cf-b");
    expect(screen.queryByRole("button", { name: /^FR:/ })).toBeNull();

    selectable.value = true;
    cls.value = "cf-horiz";
    await waitFor(() => {
      expect(container.querySelector(".st-barChart")?.className).toContain("cf-horiz");
      expect(screen.getByRole("button", { name: /^FR:/ })).toBeTruthy();
    });
  });

  it("TimeSeriesLineChart follows className, legend and hiddenSeries signals post-mount and preserves onToggleSeries", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "ts", label: "Time", type: "continuous" },
        { id: "api", label: "API", type: "discrete" },
      ],
      measures: [{ id: "users", label: "Users", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { ts: Date.UTC(2026, 4, 10), api: "search", users: 100 },
      { ts: Date.UTC(2026, 4, 11), api: "search", users: 200 },
      { ts: Date.UTC(2026, 4, 10), api: "auth", users: 50 },
      { ts: Date.UTC(2026, 4, 11), api: "auth", users: 80 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("ts-a");
    const legend = signal(true);
    const hidden = signal<string[]>([]);
    const onToggleSeries = vi.fn();

    const { container } = render(
      <TimeSeriesLineChart
        store={store}
        viewId="api"
        time="ts"
        series="api"
        measure="users"
        label="API users"
        className={cls}
        legend={legend}
        hiddenSeries={hidden}
        onToggleSeries={onToggleSeries}
      />,
    );

    expect(container.querySelector(".st-timeSeriesLineChart")?.className).toContain("ts-a");
    expect(container.querySelectorAll(".st-timeSeriesLineChart__line")).toHaveLength(2);
    expect(container.querySelector(".st-timeSeriesLineChart__legend")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "search" }));
    expect(onToggleSeries).toHaveBeenCalledWith("search");

    cls.value = "ts-b";
    hidden.value = ["search"];
    await waitFor(() => {
      expect(container.querySelector(".st-timeSeriesLineChart")?.className).toContain("ts-b");
      expect(container.querySelectorAll(".st-timeSeriesLineChart__line")).toHaveLength(1);
      expect(screen.getByRole("button", { name: "search" }).getAttribute("aria-pressed")).toBe("true");
    });

    legend.value = false;
    await waitFor(() => expect(container.querySelector(".st-timeSeriesLineChart__legend")).toBeNull());
  });

  it("DivergingBarChart follows className and showLegend signals post-mount", async () => {
    const model: DataModel = {
      dimensions: [{ id: "region", label: "Region", type: "discrete" }],
      measures: [{ id: "delta", label: "Delta", aggregation: "sum" }],
    };
    const data: Row[] = [
      { region: "North", delta: 15 },
      { region: "South", delta: -8 },
      { region: "West", delta: 0 },
    ];
    const store = createDashboardStore({ model, data });
    const cls = signal("div-a");
    const showLegend = signal(true);

    const { container } = render(
      <DivergingBarChart
        store={store}
        viewId="delta"
        category="region"
        measure="delta"
        label="Delta par region"
        className={cls}
        showLegend={showLegend}
      />,
    );

    expect(container.querySelector(".st-divergentBarChart")?.className).toContain("div-a");
    expect(container.querySelector(".st-divergentBarChart__legend")).toBeTruthy();
    expect(container.querySelectorAll(".st-divergentBarChart__bar")).toHaveLength(3);

    cls.value = "div-b";
    showLegend.value = false;
    await waitFor(() => {
      expect(container.querySelector(".st-divergentBarChart")?.className).toContain("div-b");
      expect(container.querySelector(".st-divergentBarChart__legend")).toBeNull();
    });
  });

  it("ParetoChart follows className signal post-mount and crossfilter updates", async () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const data: Row[] = [
      { country: "FR", sales: 15 },
      { country: "US", sales: 20 },
      { country: "CA", sales: 5 },
    ];
    const store = createDashboardStore({ model, data });
    const cls = signal("par-a");

    const { container } = render(
      <ParetoChart
        store={store}
        viewId="pareto"
        category="country"
        measure="sales"
        label="Pareto ventes"
        className={cls}
      />,
    );

    expect(container.querySelector(".st-paretoChart")?.className).toContain("par-a");
    expect(container.querySelectorAll(".st-paretoChart__bar")).toHaveLength(3);

    cls.value = "par-b";
    await waitFor(() => expect(container.querySelector(".st-paretoChart")?.className).toContain("par-b"));

    store.setFilter("country", { kind: "include", values: ["FR"] });
    await waitFor(() => expect(container.querySelectorAll(".st-paretoChart__bar")).toHaveLength(1));
  });

  it("DateHistogramChart follows className, selectable, hoverKey, enableBrush and brushRange signals post-mount", async () => {
    const DAY = 24 * 60 * 60 * 1000;
    const start = Date.UTC(2026, 0, 1);
    const model: DataModel = {
      dimensions: [{ id: "ts", label: "Timestamp", type: "continuous" }],
      measures: [],
    };
    const rows: Row[] = [
      { ts: start + 1_000 },
      { ts: start + 2_000 },
      { ts: start + DAY + 1_000 },
    ];
    const store = createDashboardStore({
      model,
      data: rows,
      crossfilter: {
        views: {
          events: { field: "ts", selection: "range" },
        },
      },
    });
    const formatLabel = (bin: DateHistogramBin) => `day ${bin.index + 1}`;
    const cls = signal("dh-a");
    const selectable = signal(true);
    const hoverKey = signal<string | null>(null);
    const enableBrush = signal(false);
    const brushRange = signal<TimeRange | null>(null);

    const { container } = render(
      <DateHistogramChart
        store={store}
        viewId="events"
        date="ts"
        interval="day"
        label="Events by day"
        formatLabel={formatLabel}
        className={cls}
        selectable={selectable}
        hoverKey={hoverKey}
        enableBrush={enableBrush}
        brushRange={brushRange}
      />,
    );

    expect(container.querySelector(".st-dateHistogramChart")?.className).toContain("dh-a");
    expect(screen.getByRole("button", { name: /^day 1:/ })).toBeTruthy();
    expect(container.querySelector(".st-dateHistogramChart__wrapper")).toBeNull();
    expect(container.querySelector(".st-barChart__tooltip")).toBeNull();

    // Brushing bin click writes range selection key into store.
    fireEvent.click(screen.getByRole("button", { name: /^day 1:/ }));
    expect(store.getState().selections.events).toEqual([rangeSelectionKey(start, start + DAY - 1)]);

    // Post-mount signal mutations update className, selectable, hoverKey, enableBrush and brushRange.
    cls.value = "dh-b";
    selectable.value = false;
    hoverKey.value = "day 2";
    enableBrush.value = true;
    await waitFor(() => {
      expect(container.querySelector(".st-dateHistogramChart")?.className).toContain("dh-b");
      expect(screen.queryByRole("button", { name: /^day 1:/ })).toBeNull();
      expect(container.querySelector(".st-barChart__tooltip")?.textContent).toContain("1");
      expect(container.querySelector(".st-dateHistogramChart__wrapper")).toBeTruthy();
    });

    const inputBefore = (container.querySelector(".st-dateHistogramChart__wrapper input") as HTMLInputElement)?.value;
    brushRange.value = { from: "2026-01-01T00:00:00.000Z", to: "2026-01-05T00:00:00.000Z" };
    await waitFor(() => {
      const inputAfter = (container.querySelector(".st-dateHistogramChart__wrapper input") as HTMLInputElement)?.value;
      expect(inputAfter).not.toBe(inputBefore);
      expect(inputAfter).toBeTruthy();
    });
  });
});
