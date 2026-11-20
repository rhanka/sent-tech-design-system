import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { SankeyChart } from "./SankeyChart.js";
import { ScatterPlot } from "./ScatterPlot.js";
import { ScatterPlotMatrix } from "./ScatterPlotMatrix.js";
import { ScoreCard } from "./ScoreCard.js";
import { SelectionLegend } from "./SelectionLegend.js";

afterEach(cleanup);

describe("P6 group 4 batch 7 (Preact leg + MaybeSignal mutations)", () => {
  it("SankeyChart, ScatterPlot, ScatterPlotMatrix, ScoreCard and SelectionLegend react to post-mount className signals", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "source", label: "Source", type: "discrete" },
        { id: "target", label: "Target", type: "discrete" },
        { id: "month", label: "Month", type: "discrete" },
      ],
      measures: [
        { id: "x", label: "X", aggregation: "sum" },
        { id: "y", label: "Y", aggregation: "sum" },
        { id: "rev", label: "Revenue", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { source: "Lead", target: "Qualified", month: "Jan", x: 10, y: 20, rev: 70 },
      { source: "Qualified", target: "Won", month: "Feb", x: 30, y: 40, rev: 50 },
    ];
    const store = createDashboardStore({ model, data: rows });
    store.toggleSelection("map", "FR");

    const sankeyCls = signal("sankey-a");
    const scatterCls = signal("scatter-a");
    const splomCls = signal("splom-a");
    const scoreCls = signal("score-a");
    const legendCls = signal("legend-a");

    const { container } = render(
      <>
        <SankeyChart store={store} viewId="sk" source="source" target="target" measure="rev" label="Funnel flow" className={sankeyCls} />
        <ScatterPlot store={store} viewId="sc" x="x" y="y" label="XY scatter" className={scatterCls} />
        <ScatterPlotMatrix store={store} viewId="sm" measures={["x", "y"]} label="Metrics SPLOM" className={splomCls} />
        <ScoreCard store={store} measure="rev" label="Total rev" sparklineDimension="month" className={scoreCls} />
        <SelectionLegend store={store} labels={{ map: "Carte" }} className={legendCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Funnel flow" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "XY scatter" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Metrics SPLOM" })).toBeTruthy();
    expect(container.querySelector(".score-a")?.textContent).toContain("120");
    expect(screen.getByRole("group", { name: "Sélections actives" })).toBeTruthy();

    expect(container.querySelector(".sankey-a")).toBeTruthy();
    expect(container.querySelector(".scatter-a")).toBeTruthy();
    expect(container.querySelector(".splom-grid")?.className).toContain("splom-a");
    expect(container.querySelector(".score-a")).toBeTruthy();
    expect(container.querySelector(".legend-a")).toBeTruthy();
    expect(container.querySelector(".sankey-a [strokeWidth]")).toBeNull();

    sankeyCls.value = "sankey-b";
    scatterCls.value = "scatter-b";
    splomCls.value = "splom-b";
    scoreCls.value = "score-b";
    legendCls.value = "legend-b";

    await waitFor(() => {
      expect(container.querySelector(".sankey-b")).toBeTruthy();
      expect(container.querySelector(".scatter-b")).toBeTruthy();
      expect(container.querySelector(".splom-grid")?.className).toContain("splom-b");
      expect(container.querySelector(".score-b")).toBeTruthy();
      expect(container.querySelector(".legend-b")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Effacer Carte" }));
    await waitFor(() => {
      expect(store.getState().selections.map).toBeUndefined();
      expect(container.querySelector(".legend-b")).toBeNull();
    });
  });
});
