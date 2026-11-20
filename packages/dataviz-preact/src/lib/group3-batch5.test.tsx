import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, createFormatPanelState, type DataModel, type FormatPanelState, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FlamegraphChart } from "./FlamegraphChart.js";
import { ForceGraph } from "./ForceGraph.js";
import { ForecastLineChart } from "./ForecastLineChart.js";
import { FormatPanel } from "./FormatPanel.js";
import { FunnelChart } from "./FunnelChart.js";

afterEach(cleanup);

describe("P6 group 3 batch 5 (Preact leg + MaybeSignal mutations)", () => {
  it("FlamegraphChart, ForceGraph, ForecastLineChart and FunnelChart follow post-mount signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "id", label: "Id", type: "discrete" },
        { id: "parentId", label: "Parent", type: "discrete" },
        { id: "name", label: "Name", type: "discrete" },
        { id: "source", label: "Source", type: "discrete" },
        { id: "target", label: "Target", type: "discrete" },
        { id: "stage", label: "Stage", type: "discrete" },
      ],
      measures: [
        { id: "val", label: "Value", aggregation: "sum" },
        { id: "x", label: "X", aggregation: "avg" },
        { id: "y", label: "Y", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { id: "root", parentId: "", name: "main", source: "A", target: "B", stage: "Lead", val: 100, x: 1, y: 10 },
      { id: "c1", parentId: "root", name: "render", source: "B", target: "C", stage: "Demo", val: 60, x: 2, y: 20 },
      { id: "c2", parentId: "root", name: "fetch", source: "C", target: "A", stage: "Won", val: 30, x: 3, y: 30 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const flameCls = signal("flame-a");
    const forceCls = signal("force-a");
    const forecastCls = signal("forecast-a");
    const hoverKey = signal<string | null>(null);
    const funnelCls = signal("funnel-a");
    const showPercentages = signal(true);
    const legend = signal(true);

    const { container } = render(
      <>
        <FlamegraphChart store={store} viewId="fl" id="id" parentId="parentId" name="name" value="val" label="Flame" className={flameCls} />
        <ForceGraph store={store} viewId="fg" source="source" target="target" weight="val" label="Graph" className={forceCls} />
        <ForecastLineChart
          store={store}
          viewId="fc"
          x="x"
          y="y"
          periods={2}
          label="Forecast"
          hoverKey={hoverKey}
          className={forecastCls}
        />
        <FunnelChart
          store={store}
          viewId="fn"
          category="stage"
          measure="val"
          showPercentages={showPercentages}
          legend={legend}
          label="Funnel"
          className={funnelCls}
        />
      </>,
    );

    expect(screen.getByRole("img", { name: "Flame" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Forecast" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Funnel" })).toBeTruthy();
    expect(container.querySelector(".flame-a")).toBeTruthy();
    expect(container.querySelector(".force-a")).toBeTruthy();
    expect(container.querySelector(".st-forecastLineChart")?.className).toContain("forecast-a");
    expect(container.querySelector(".forecast-a .st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".funnel-a")).toBeTruthy();
    expect(container.querySelector(".funnel-a .st-funnelChart__legend")).toBeTruthy();
    expect(container.querySelector(".funnel-a .st-funnelChart__value")?.textContent).toContain("%");

    const funnelLabel = container.querySelector(".funnel-a .st-funnelChart__label");
    expect(funnelLabel?.getAttribute("text-anchor")).toBe("middle");
    expect(funnelLabel?.getAttribute("dominant-baseline")).toBe("middle");
    expect(funnelLabel?.getAttribute("textAnchor")).toBeNull();
    expect(funnelLabel?.getAttribute("dominantBaseline")).toBeNull();

    flameCls.value = "flame-b";
    forceCls.value = "force-b";
    forecastCls.value = "forecast-b";
    hoverKey.value = "2";
    funnelCls.value = "funnel-b";
    showPercentages.value = false;
    legend.value = false;

    await waitFor(() => {
      expect(container.querySelector(".flame-b")).toBeTruthy();
      expect(container.querySelector(".force-b")).toBeTruthy();
      expect(container.querySelector(".st-forecastLineChart")?.className).toContain("forecast-b");
      expect(container.querySelector(".forecast-b .st-lineChart__crosshair")).toBeTruthy();
      expect(container.querySelector(".funnel-b")).toBeTruthy();
      expect(container.querySelector(".funnel-b .st-funnelChart__legend")).toBeNull();
      expect(container.querySelector(".funnel-b .st-funnelChart__value")?.textContent).not.toContain("%");
    });
  });

  it("FormatPanel follows post-mount value and className signals and emits edits", async () => {
    const initial: FormatPanelState = createFormatPanelState({
      axes: [{ id: "revenue", label: "Revenue" }],
      legends: [{ id: "segment", label: "Segment" }],
      markers: [{ id: "points", label: "Points" }],
    });
    const valueSig = signal<FormatPanelState>(initial);
    const clsSig = signal("fmt-a");
    const onChange = vi.fn((next: FormatPanelState) => {
      valueSig.value = next;
    });

    const { container } = render(<FormatPanel value={valueSig} onChange={onChange} className={clsSig} />);

    expect(container.querySelector(".fmt-a")).toBeTruthy();

    fireEvent.input(screen.getByLabelText("Minimum Revenue"), { target: { value: "10" } });
    expect(onChange.mock.lastCall?.[0].axes[0].min).toBe(10);

    fireEvent.click(screen.getByLabelText("Inverser Revenue"));
    expect(onChange.mock.lastCall?.[0].axes[0].inverted).toBe(true);

    fireEvent.input(screen.getByLabelText("Titre Segment"), { target: { value: "Markets" } });
    expect(onChange.mock.lastCall?.[0].legends[0].title).toBe("Markets");

    fireEvent.change(screen.getByLabelText("Forme Points"), { target: { value: "diamond" } });
    expect(onChange.mock.lastCall?.[0].markers[0].shape).toBe("diamond");

    clsSig.value = "fmt-b";
    valueSig.value = {
      ...valueSig.value,
      legends: [{ ...valueSig.value.legends[0]!, title: "Updated Title" }],
    };

    await waitFor(() => {
      expect(container.querySelector(".fmt-b")).toBeTruthy();
      expect((screen.getByLabelText("Titre Segment") as HTMLInputElement).value).toBe("Updated Title");
    });
  });
});
