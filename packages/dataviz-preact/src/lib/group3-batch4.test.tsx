import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DrillChart } from "./DrillChart.js";
import { DumbbellChart } from "./DumbbellChart.js";
import { ErrorBarsChart } from "./ErrorBarsChart.js";
import { EventFeedPanel } from "./EventFeedPanel.js";
import { FieldPane } from "./FieldPane.js";

afterEach(cleanup);

describe("P6 group 3 batch 4 (Preact leg + MaybeSignal mutations)", () => {
  it("DrillChart drills across bar, donut and treemap kinds and follows post-mount className signals", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "region", label: "Region", type: "discrete" },
        { id: "city", label: "City", type: "discrete" },
      ],
      measures: [{ id: "sales", label: "Sales", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { region: "Nord", city: "Lille", sales: 15 },
      { region: "Sud", city: "Nice", sales: 20 },
    ];
    const storeBar = createDashboardStore({ model, data: rows });
    const storeDonut = createDashboardStore({ model, data: rows });
    const storeTree = createDashboardStore({ model, data: rows });
    const barCls = signal("dc-bar-a");
    const donutCls = signal("dc-donut-a");
    const treeCls = signal("dc-tree-a");

    const { container } = render(
      <>
        <DrillChart store={storeBar} viewId="b" hierarchy={["region", "city"]} measure="sales" label="BarDrill" kind="bar" className={barCls} />
        <DrillChart store={storeDonut} viewId="d" hierarchy={["region", "city"]} measure="sales" label="DonutDrill" kind="donut" className={donutCls} />
        <DrillChart store={storeTree} viewId="t" hierarchy={["region", "city"]} measure="sales" label="TreeDrill" kind="treemap" className={treeCls} />
      </>,
    );

    expect(container.querySelector(".dc-bar-a")).toBeTruthy();
    expect(container.querySelector(".dc-donut-a")).toBeTruthy();
    expect(container.querySelector(".dc-tree-a")).toBeTruthy();
    expect(screen.getByRole("group", { name: "DonutDrill — drill" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "TreeDrill — drill" })).toBeTruthy();

    fireEvent.click(within(screen.getByRole("group", { name: "DonutDrill — drill" })).getByRole("button", { name: "Nord: 15" }));
    await waitFor(() => {
      expect(storeDonut.getState().drill.d).toEqual(["city"]);
      expect(screen.getByRole("group", { name: "DonutDrill — select" })).toBeTruthy();
    });

    barCls.value = "dc-bar-b";
    donutCls.value = "dc-donut-b";
    treeCls.value = "dc-tree-b";
    await waitFor(() => {
      expect(container.querySelector(".dc-bar-b")).toBeTruthy();
      expect(container.querySelector(".dc-donut-b")).toBeTruthy();
      expect(container.querySelector(".dc-tree-b")).toBeTruthy();
    });
  });

  it("DumbbellChart, ErrorBarsChart and EventFeedPanel follow post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "cat", label: "Cat", type: "discrete" },
        { id: "type", label: "Type", type: "discrete" },
        { id: "severity", label: "Severity", type: "discrete" },
        { id: "message", label: "Message", type: "discrete" },
      ],
      measures: [
        { id: "low", label: "Low", aggregation: "min" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "val", label: "Val", aggregation: "avg" },
        { id: "at", label: "At", aggregation: "max" },
      ],
    };
    const rows: Row[] = [
      { cat: "A", low: 10, high: 30, val: 20, at: 1700000000000, type: "deploy", severity: "info", message: "Deployed v1" },
      { cat: "A", low: 12, high: 28, val: 24, at: 1700000060000, type: "alert", severity: "warning", message: "High CPU" },
      { cat: "B", low: 5, high: 15, val: 10, at: 1700000120000, type: "deploy", severity: "info", message: "Deployed v2" },
    ];
    const store = createDashboardStore({ model, data: rows });
    const dumbCls = signal("dumb-a");
    const errCls = signal("err-a");
    const feedCls = signal("feed-a");

    const { container } = render(
      <>
        <DumbbellChart store={store} viewId="dumb" category="cat" low="low" high="high" label="Dumbbell" className={dumbCls} />
        <ErrorBarsChart store={store} viewId="err" category="cat" value="val" label="ErrorBars" className={errCls} />
        <EventFeedPanel store={store} viewId="feed" at="at" type="type" severity="severity" message="message" label="Events" className={feedCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Dumbbell" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "ErrorBars" })).toBeTruthy();
    expect(container.querySelector(".dumb-a")).toBeTruthy();
    expect(container.querySelector(".st-errorBarsChart")?.className).toContain("err-a");
    expect(container.querySelector(".feed-a")).toBeTruthy();
    expect(container.textContent).toContain("Deployed v1");

    const errText = container.querySelector(".err-a svg text");
    if (errText) {
      expect(errText.getAttribute("textAnchor")).toBeNull();
      expect(errText.getAttribute("dominantBaseline")).toBeNull();
    }

    dumbCls.value = "dumb-b";
    errCls.value = "err-b";
    feedCls.value = "feed-b";
    await waitFor(() => {
      expect(container.querySelector(".dumb-b")).toBeTruthy();
      expect(container.querySelector(".st-errorBarsChart")?.className).toContain("err-b");
      expect(container.querySelector(".feed-b")).toBeTruthy();
    });
  });

  it("FieldPane reacts to post-mount includeDimensions/includeMeasures/selectedId/expandedIds/className signals and calls onSelect", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "country", label: "Pays", type: "discrete", folder: "Geo" },
        { id: "age", label: "Age", type: "continuous" },
      ],
      measures: [{ id: "revenue", label: "Revenu", aggregation: "sum", folder: "Finance" }],
    };
    const includeDimensions = signal(true);
    const includeMeasures = signal(true);
    const selectedId = signal<string>("dimension:country");
    const expandedIds = signal<string[]>(["group:dimensions", "folder:dimension:Geo", "group:measures", "folder:measure:Finance"]);
    const cls = signal("fp-a");
    const onSelect = vi.fn();

    const { container } = render(
      <FieldPane
        model={model}
        includeDimensions={includeDimensions}
        includeMeasures={includeMeasures}
        selectedId={selectedId}
        expandedIds={expandedIds}
        onSelect={onSelect}
        className={cls}
      />,
    );

    expect(container.querySelector(".st-treeView")?.className).toContain("fp-a");
    expect(screen.getByText("Pays").closest(".st-treeView__row")?.classList.contains("st-treeView__row--selected")).toBe(true);
    expect(screen.getByText("Revenu")).toBeTruthy();

    fireEvent.click(screen.getByText("Revenu"));
    expect(onSelect).toHaveBeenCalledWith("measure:revenue");

    selectedId.value = "measure:revenue";
    cls.value = "fp-b";
    await waitFor(() => {
      expect(container.querySelector(".st-treeView")?.className).toContain("fp-b");
      expect(screen.getByText("Revenu").closest(".st-treeView__row")?.classList.contains("st-treeView__row--selected")).toBe(true);
    });

    expandedIds.value = ["group:dimensions", "group:measures"];
    await waitFor(() => expect(screen.queryByText("Pays")).toBeNull());

    includeDimensions.value = false;
    await waitFor(() => expect(screen.queryByText("Dimensions")).toBeNull());

    includeMeasures.value = false;
    await waitFor(() => expect(screen.queryByText("Measures")).toBeNull());
  });
});
