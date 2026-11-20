import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { StreamgraphChart } from "./StreamgraphChart.js";
import { SunburstChart } from "./SunburstChart.js";
import { TileMapChart } from "./TileMapChart.js";
import { TimelineChart } from "./TimelineChart.js";
import { TopNFilter } from "./TopNFilter.js";

afterEach(cleanup);

describe("P6 group 4 batch 9 (Preact leg + MaybeSignal mutations)", () => {
  it("StreamgraphChart, SunburstChart, TileMapChart, TimelineChart and TopNFilter react to post-mount MaybeSignal mutations", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "period", label: "Period", type: "discrete" },
        { id: "region", label: "Region", type: "discrete" },
        { id: "segment", label: "Segment", type: "discrete" },
        { id: "event", label: "Event", type: "discrete" },
      ],
      measures: [
        { id: "rev", label: "Revenue", aggregation: "sum" },
        { id: "col", label: "Col", aggregation: "avg" },
        { id: "row", label: "Row", aggregation: "avg" },
        { id: "pos", label: "Pos", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { period: "Q1", region: "North", segment: "Ent", event: "Kickoff", rev: 40, col: 0, row: 0, pos: 1 },
      { period: "Q2", region: "North", segment: "SMB", event: "Beta", rev: 60, col: 1, row: 0, pos: 2 },
      { period: "Q1", region: "South", segment: "Ent", event: "Launch", rev: 25, col: 0, row: 1, pos: 3 },
      { period: "Q2", region: "South", segment: "SMB", event: "Scale", rev: 35, col: 1, row: 1, pos: 4 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const filterStore = createDashboardStore({ model, data: rows });

    const streamCls = signal("stream-a");
    const streamSmooth = signal(false);
    const streamLegend = signal(true);
    const sunCls = signal("sun-a");
    const sunLegend = signal(true);
    const tileCls = signal("tile-a");
    const timeCls = signal("time-a");
    const topCls = signal("top-a");

    const { container } = render(
      <>
        <StreamgraphChart
          store={store}
          viewId="sg"
          category="period"
          series="region"
          measure="rev"
          smooth={streamSmooth}
          showLegend={streamLegend}
          label="Revenue stream"
          className={streamCls}
        />
        <SunburstChart
          store={store}
          viewId="sun"
          hierarchy={["region", "segment"]}
          measure="rev"
          legend={sunLegend}
          label="Revenue sun"
          className={sunCls}
        />
        <TileMapChart store={store} viewId="tm" label_field="region" col="col" row="row" value="rev" label="Region tiles" className={tileCls} />
        <TimelineChart store={store} viewId="tl" label_field="event" position="pos" label="Milestones" className={timeCls} />
        <TopNFilter store={filterStore} dimension="region" measure="rev" defaultN={2} label="Top regions" className={topCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Revenue stream" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Revenue sun" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Region tiles" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Milestones" })).toBeTruthy();

    expect(container.querySelector(".stream-a")).toBeTruthy();
    const initialStreamPath = container.querySelector(".stream-a path")?.getAttribute("d");
    expect(container.querySelector(".stream-a .st-streamgraphChart__legend")).toBeTruthy();
    expect(container.querySelector(".sun-a")).toBeTruthy();
    expect(container.querySelector(".sun-a .st-sunburstChart__legend")).toBeTruthy();
    expect(container.querySelector(".tile-a")).toBeTruthy();
    expect(container.querySelector(".time-a")).toBeTruthy();
    expect(container.querySelector(".top-a")).toBeTruthy();

    fireEvent.input(screen.getByLabelText("Top regions"), { target: { value: "1" } });
    await waitFor(() => {
      expect(filterStore.getState().filters.region).toEqual({ kind: "include", values: ["North"] });
    });

    streamCls.value = "stream-b";
    streamSmooth.value = true;
    streamLegend.value = false;
    sunCls.value = "sun-b";
    sunLegend.value = false;
    tileCls.value = "tile-b";
    timeCls.value = "time-b";
    topCls.value = "top-b";

    await waitFor(() => {
      expect(container.querySelector(".stream-b")).toBeTruthy();
      expect(container.querySelector(".stream-b path")?.getAttribute("d")).not.toBe(initialStreamPath);
      expect(container.querySelector(".stream-b .st-streamgraphChart__legend")).toBeNull();
      expect(container.querySelector(".sun-b")).toBeTruthy();
      expect(container.querySelector(".sun-b .st-sunburstChart__legend")).toBeNull();
      expect(container.querySelector(".tile-b")).toBeTruthy();
      expect(container.querySelector(".time-b")).toBeTruthy();
      expect(container.querySelector(".top-b")).toBeTruthy();
    });
  });
});
