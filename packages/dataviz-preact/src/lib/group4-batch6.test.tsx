import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { ReferenceLineChart } from "./ReferenceLineChart.js";
import { DEFAULT_RELATIVE_PRESETS, RelativeDateFilter, relativeRangeToSpec } from "./RelativeDateFilter.js";
import { RenkoChart } from "./RenkoChart.js";
import { RibbonChart } from "./RibbonChart.js";
import { RoseChart } from "./RoseChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 6 (Preact leg + MaybeSignal mutations)", () => {
  it("ReferenceLineChart, RelativeDateFilter, RenkoChart, RibbonChart and RoseChart react to post-mount MaybeSignal mutations", async () => {
    const NOW = new Date("2026-06-06T00:00:00Z");
    const DAY = 24 * 60 * 60 * 1000;
    expect(relativeRangeToSpec(7, NOW)).toEqual({
      kind: "range",
      min: NOW.getTime() - 7 * DAY,
      max: NOW.getTime(),
    });
    expect(DEFAULT_RELATIVE_PRESETS[0]?.value).toBe("all");

    const model: DataModel = {
      dimensions: [
        { id: "date", label: "Date", type: "continuous" },
        { id: "region", label: "Region", type: "discrete" },
        { id: "period", label: "Period", type: "discrete" },
      ],
      measures: [
        { id: "close", label: "Close", aggregation: "avg" },
        { id: "rev", label: "Revenue", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { date: 1, region: "North", period: "Q1", close: 100, rev: 60 },
      { date: 2, region: "North", period: "Q2", close: 112, rev: 40 },
      { date: 3, region: "South", period: "Q1", close: 108, rev: 30 },
      { date: 4, region: "South", period: "Q2", close: 120, rev: 50 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const refCls = signal("ref-a");
    const hoverKey = signal<string | null>(null);
    const relCls = signal("rel-a");
    const renkoCls = signal("renko-a");
    const ribbonCls = signal("ribbon-a");
    const roseCls = signal("rose-a");

    const { container } = render(
      <>
        <ReferenceLineChart store={store} viewId="ref" value={30} referenceLabel="Goal" label="Goal line" hoverKey={hoverKey} className={refCls} />
        <RelativeDateFilter store={store} dimension="date" label="Période" now={NOW} className={relCls} />
        <RenkoChart store={store} viewId="renko" date="date" close="close" boxSize={4} label="Renko close" className={renkoCls} />
        <RibbonChart store={store} viewId="ribbon" category="region" period="period" value="rev" label="Region ribbon" className={ribbonCls} />
        <RoseChart store={store} viewId="rose" category="region" measure="rev" label="Region rose" className={roseCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Goal line" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Renko close" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Region ribbon" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Region rose" })).toBeTruthy();

    expect(container.querySelector(".st-referenceLineChart")?.className).toContain("ref-a");
    expect(container.querySelector(".ref-a .st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".rel-a")).toBeTruthy();
    expect(container.querySelector(".renko-a")).toBeTruthy();
    expect(container.querySelector(".ribbon-a")).toBeTruthy();
    expect(container.querySelector(".rose-a")).toBeTruthy();
    expect(container.querySelector(".rose-a [strokeWidth]")).toBeNull();

    const select = screen.getByLabelText("Période") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "30d" } });
    await waitFor(() => {
      expect(store.getState().filters.date).toEqual({
        kind: "range",
        min: NOW.getTime() - 30 * DAY,
        max: NOW.getTime(),
      });
    });

    refCls.value = "ref-b";
    hoverKey.value = "30";
    relCls.value = "rel-b";
    renkoCls.value = "renko-b";
    ribbonCls.value = "ribbon-b";
    roseCls.value = "rose-b";

    await waitFor(() => {
      expect(container.querySelector(".st-referenceLineChart")?.className).toContain("ref-b");
      expect(container.querySelector(".ref-b .st-lineChart__crosshair")).toBeTruthy();
      expect(container.querySelector(".rel-b")).toBeTruthy();
      expect(container.querySelector(".renko-b")).toBeTruthy();
      expect(container.querySelector(".ribbon-b")).toBeTruthy();
      expect(container.querySelector(".rose-b")).toBeTruthy();
    });
  });
});
