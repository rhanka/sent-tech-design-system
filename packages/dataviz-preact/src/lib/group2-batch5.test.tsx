import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { CandlestickChart } from "./CandlestickChart.js";
import { ChartExport, DEFAULT_EXPORT_LABELS } from "./ChartExport.js";
import { ChordChart } from "./ChordChart.js";
import { ChoroplethMap } from "./ChoroplethMap.js";
import { ExportMenu, rowsToCsv } from "./ExportMenu.js";

afterEach(cleanup);

describe("P6 group 2 batch 5 (Preact leg + MaybeSignal mutations)", () => {
  it("CandlestickChart, ChordChart and ChoroplethMap follow post-mount className signals with normalised SVG", async () => {
    const poly = {
      type: "Polygon",
      coordinates: [[[2, 48], [3, 48], [3, 49], [2, 48]]],
    } as const;
    const model: DataModel = {
      dimensions: [
        { id: "day", label: "Day", type: "discrete" },
        { id: "source", label: "Source", type: "discrete" },
        { id: "target", label: "Target", type: "discrete" },
        { id: "region", label: "Region", type: "discrete" },
        { id: "shape", label: "Shape", type: "discrete" },
      ],
      measures: [
        { id: "open", label: "Open", aggregation: "avg" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "low", label: "Low", aggregation: "min" },
        { id: "close", label: "Close", aggregation: "avg" },
        { id: "revenue", label: "Revenue", aggregation: "sum" },
      ],
    };
    const rows = [
      { day: "Mon", source: "Lead", target: "Qualified", region: "FR", shape: poly, open: 10, high: 15, low: 8, close: 14, revenue: 100 },
      { day: "Tue", source: "Qualified", target: "Won", region: "FR", shape: poly, open: 14, high: 18, low: 12, close: 13, revenue: 50 },
    ] as unknown as Row[];
    const store = createDashboardStore({ model, data: rows });
    const candleCls = signal("candle-a");
    const chordCls = signal("chord-a");
    const choroCls = signal("choro-a");

    const { container } = render(
      <>
        <CandlestickChart
          store={store}
          viewId="candle"
          label_field="day"
          open="open"
          high="high"
          low="low"
          close="close"
          label="Candles"
          className={candleCls}
        />
        <ChordChart store={store} viewId="chord" source="source" target="target" measure="revenue" label="Chord" className={chordCls} />
        <ChoroplethMap store={store} viewId="choro" region="region" measure="revenue" geometry="shape" label="Regions" className={choroCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Candles" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Chord" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Regions" })).toBeTruthy();
    expect(container.querySelector(".candle-a")).toBeTruthy();
    expect(container.querySelector(".chord-a")).toBeTruthy();
    expect(container.querySelector(".st-choroplethMap")?.className).toContain("choro-a");
    expect(container.querySelectorAll(".st-chordDiagram__ribbon")).toHaveLength(2);
    expect(container.querySelectorAll(".st-choroplethMap .st-geoMap__region")).toHaveLength(1);

    const text = container.querySelector(".candle-a svg text");
    expect(text?.getAttribute("text-anchor")).toBeTruthy();
    expect(text?.getAttribute("textAnchor")).toBeNull();

    candleCls.value = "candle-b";
    chordCls.value = "chord-b";
    choroCls.value = "choro-b";
    await waitFor(() => {
      expect(container.querySelector(".candle-b")).toBeTruthy();
      expect(container.querySelector(".chord-b")).toBeTruthy();
      expect(container.querySelector(".st-choroplethMap")?.className).toContain("choro-b");
    });
  });

  it("ExportMenu and ChartExport follow post-mount className signals and export safely in jsdom", async () => {
    expect(rowsToCsv([{ country: "FR", sales: 10 }], [{ key: "country", label: "Pays" }, { key: "sales", label: "Ventes" }])).toBe(
      "Pays,Ventes\nFR,10",
    );
    expect(DEFAULT_EXPORT_LABELS.print).toBe("Print");

    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const store = createDashboardStore({ model, data: [{ country: "FR", sales: 10 }] });
    const menuCls = signal("menu-a");
    const exportCls = signal("export-a");

    const { container } = render(
      <>
        <ExportMenu store={store} label="Exporter (CSV)" className={menuCls} />
        <ChartExport store={store} target="#nope" className={exportCls} />
      </>,
    );

    expect(container.querySelector(".menu-a")).toBeTruthy();
    expect(container.querySelector(".export-a")).toBeTruthy();
    expect(() => screen.getByRole("button", { name: "Exporter (CSV)" }).click()).not.toThrow();
    for (const f of ["png", "svg", "pdf", "print", "csv"] as const) {
      expect(() => screen.getByRole("button", { name: DEFAULT_EXPORT_LABELS[f] }).click()).not.toThrow();
    }

    menuCls.value = "menu-b";
    exportCls.value = "export-b";
    await waitFor(() => {
      expect(container.querySelector(".menu-b")).toBeTruthy();
      expect(container.querySelector(".export-b")).toBeTruthy();
    });
  });
});
