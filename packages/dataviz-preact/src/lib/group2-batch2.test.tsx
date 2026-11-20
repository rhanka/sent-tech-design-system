import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DashboardState, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdvancedPivotDataTable } from "./AdvancedPivotDataTable.js";
import { AnalyticsClusterPlot } from "./AnalyticsClusterPlot.js";
import { AnimatedBubbleChart } from "./AnimatedBubbleChart.js";
import { AnomalySwimLaneChart } from "./AnomalySwimLaneChart.js";
import { DEFAULT_URL_SYNC_PARAM, readStateFromUrl, stateToQuery } from "./url-sync.js";
import { useUrlSync } from "./useUrlSync.js";

afterEach(cleanup);

describe("P6 group 2 batch 2 (Preact leg + MaybeSignal mutations)", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("useUrlSync hydrates from URL, mirrors store changes, handles popstate and unsubscribes on unmount", async () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Country", type: "discrete" }],
      measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }],
    };
    const sample: DashboardState = {
      filters: { country: { kind: "include", values: ["FR"] } },
      selections: { chart: ["FR"] },
      drill: {},
    };
    window.history.replaceState(null, "", stateToQuery(sample));
    const store = createDashboardStore({ model, data: [{ country: "FR", revenue: 10 }] });

    function Host() {
      useUrlSync(store);
      return <span data-testid="sync">ok</span>;
    }

    const { unmount } = render(<Host />);
    await waitFor(() => expect(store.getState()).toEqual(sample));

    store.setFilter("country", { kind: "include", values: ["US"] });
    expect(window.location.search).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(readStateFromUrl(store).filters?.country).toEqual({ kind: "include", values: ["US"] });

    window.history.replaceState(null, "", stateToQuery(sample));
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(store.getState()).toEqual(sample);

    unmount();
    store.clearAll();
    expect(window.location.search).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
  });

  it("AdvancedPivotDataTable reacts to post-mount className/includeSubtotals/collapsedRowPaths/heatmap signals and invokes onToggleRowPath", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "country", label: "Country", type: "discrete" },
        { id: "category", label: "Category", type: "discrete" },
        { id: "channel", label: "Channel", type: "discrete" },
        { id: "month", label: "Month", type: "discrete" },
      ],
      measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { country: "FR", category: "A", channel: "web", month: "Jan", revenue: 100 },
      { country: "FR", category: "B", channel: "web", month: "Feb", revenue: 50 },
      { country: "US", category: "A", channel: "store", month: "Jan", revenue: 200 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("pivot-a");
    const includeSubtotals = signal(true);
    const collapsedRowPaths = signal<readonly string[]>([]);
    const heatmap = signal(false);
    const onToggleRowPath = vi.fn();

    const { container } = render(
      <AdvancedPivotDataTable
        store={store}
        rows={["country", "category"]}
        columns={["channel"]}
        measures={["revenue"]}
        includeSubtotals={includeSubtotals}
        collapsedRowPaths={collapsedRowPaths}
        heatmap={heatmap}
        sparklineDimension="month"
        onToggleRowPath={onToggleRowPath}
        caption="Pivot"
        className={cls}
      />,
    );

    expect(container.querySelector(".pivot-a")).toBeTruthy();
    expect(container.textContent).toContain("FR subtotal");
    expect(container.textContent).toContain("FR A");
    expect(container.textContent).not.toContain("heat ");

    fireEvent.click(screen.getByText("FR subtotal").closest("tr")!);
    expect(onToggleRowPath).toHaveBeenCalledWith("FR", expect.objectContaining({ __kind: "subtotal" }));

    cls.value = "pivot-b";
    collapsedRowPaths.value = ["FR"];
    heatmap.value = true;
    await waitFor(() => {
      expect(container.querySelector(".pivot-b")).toBeTruthy();
      expect(container.textContent).not.toContain("FR A");
      expect(container.textContent).toContain("heat ");
    });

    includeSubtotals.value = false;
    await waitFor(() => expect(container.textContent).not.toContain("FR subtotal"));
  });

  it("AnalyticsClusterPlot reacts to post-mount className signal mutation and renders normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [{ id: "x", label: "X", type: "continuous" }],
      measures: [{ id: "y", label: "Y", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 10, y: 100 },
      { x: 11, y: 110 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("cluster-a");

    const { container } = render(
      <AnalyticsClusterPlot store={store} viewId="c" fields={["x", "y"]} k={2} label="Clusters" className={cls} />,
    );

    expect(container.querySelector(".st-analyticsClusterPlot")?.className).toContain("cluster-a");
    expect(container.querySelectorAll(".st-scatterPlot__point")).toHaveLength(4);
    expect(container.querySelectorAll(".st-scatterPlot__centroid")).toHaveLength(2);
    const svgText = container.querySelector("svg text");
    expect(svgText?.getAttribute("text-anchor")).toBeTruthy();
    expect(svgText?.getAttribute("textAnchor")).toBeNull();

    cls.value = "cluster-b";
    await waitFor(() => expect(container.querySelector(".st-analyticsClusterPlot")?.className).toContain("cluster-b"));
  });

  it("AnimatedBubbleChart updates step via range slider, toggles playback, and follows className signal", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "year", label: "Year", type: "discrete" },
        { id: "region", label: "Region", type: "discrete" },
      ],
      measures: [
        { id: "gdp", label: "GDP", aggregation: "sum" },
        { id: "life", label: "Life", aggregation: "avg" },
        { id: "pop", label: "Pop", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { year: "2020", region: "EU", gdp: 10, life: 80, pop: 100 },
      { year: "2021", region: "EU", gdp: 12, life: 81, pop: 105 },
      { year: "2022", region: "EU", gdp: 15, life: 82, pop: 110 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("bubble-a");

    const { container } = render(
      <AnimatedBubbleChart
        store={store}
        viewId="bubble"
        x="gdp"
        y="life"
        size="pop"
        time="year"
        series="region"
        label="Gapminder"
        className={cls}
      />,
    );

    expect(container.querySelector(".dataviz-animated-bubble")?.className).toContain("bubble-a");
    const slider = screen.getByLabelText("Pas de temps") as HTMLInputElement;
    expect(slider.getAttribute("aria-valuetext")).toBe("2020");

    const playBtn = screen.getByRole("button", { name: "Lecture" });
    fireEvent.click(playBtn);
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();

    fireEvent.input(slider, { target: { value: "2" } });
    await waitFor(() => {
      expect(slider.getAttribute("aria-valuetext")).toBe("2022");
      expect(screen.getByRole("button", { name: "Lecture" })).toBeTruthy();
    });

    cls.value = "bubble-b";
    await waitFor(() => expect(container.querySelector(".dataviz-animated-bubble")?.className).toContain("bubble-b"));
  });

  it("AnomalySwimLaneChart follows className signal mutation and crossfilter updates", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "job", label: "Job", type: "discrete" },
        { id: "at", label: "At", type: "continuous" },
      ],
      measures: [{ id: "score", label: "Score", aggregation: "max" }],
    };
    const rows: Row[] = [
      { job: "api", at: 1, score: 20 },
      { job: "api", at: 2, score: 85 },
      { job: "db", at: 1, score: 15 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("swim-a");

    const { container } = render(
      <AnomalySwimLaneChart store={store} viewId="swim" job="job" at="at" score="score" label="Anomalies" className={cls} />,
    );

    expect(container.querySelector(".swim-a")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Anomalies" })).toBeTruthy();

    cls.value = "swim-b";
    await waitFor(() => expect(container.querySelector(".swim-b")).toBeTruthy());

    store.setFilter("job", { kind: "include", values: ["api"] });
    await waitFor(() => expect(container.textContent).not.toContain("db"));
  });
});
