import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilterBar } from "./FilterBar.js";
import { FilterPill } from "./FilterPill.js";
import { FlamegraphChart } from "./FlamegraphChart.js";
import { FunnelChart } from "./FunnelChart.js";
import { GanttChart } from "./GanttChart.js";
import { GaugeChart } from "./GaugeChart.js";
import { GeoChart } from "./GeoChart.js";
import { HLCChart } from "./HLCChart.js";
import { HeatmapChart } from "./HeatmapChart.js";
import { HeikinAshiChart } from "./HeikinAshiChart.js";
import { HistogramChart } from "./HistogramChart.js";
import { HollowCandlestickChart } from "./HollowCandlestickChart.js";
import { ItemChart } from "./ItemChart.js";

afterEach(cleanup);

describe("P4a group 3 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-3 module", () => {
    render(
      <>
        <FilterBar label="Filtres A" className={signal("x-filterbar")} />
        <FilterPill field="Pays" value="France" className={signal("x-filterpill")} />
        <FlamegraphChart data-testid="e-flame" data={{ name: "root", value: 2 }} label="L" className={signal("x-flame")} />
        <FunnelChart data-testid="e-funnel" data={[{ label: "A", value: 2 }]} label="L" className={signal("x-funnel")} />
        <GanttChart data-testid="e-gantt" data={[{ task: "T", start: 1, end: 3 }]} label="L" className={signal("x-gantt")} />
        <GaugeChart data-testid="e-gauge" value={50} label="L" className={signal("x-gauge")} />
        <GeoChart
          data-testid="e-geo"
          layers={[{ type: "points", points: [{ latitude: 48.8, longitude: 2.3 }] }]}
          label="L"
          className={signal("x-geo")}
        />
        <HLCChart data-testid="e-hlc" data={[{ label: "A", high: 5, low: 1, close: 4 }]} label="L" className={signal("x-hlc")} />
        <HeatmapChart data-testid="e-heat" data={[{ x: "a", y: "b", value: 1 }]} label="L" className={signal("x-heat")} />
        <HeikinAshiChart data-testid="e-ha" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={signal("x-ha")} />
        <HistogramChart data-testid="e-hist" data={[{ label: "A", value: 1 }]} label="L" className={signal("x-hist")} />
        <HollowCandlestickChart data-testid="e-hollow" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={signal("x-hollow")} />
        <ItemChart data-testid="e-item" data={[{ label: "A", value: 2 }]} label="L" className={signal("x-item")} />
      </>,
    );
    // FilterBar/FilterPill take no testid (parity with React, which spreads no
    // rest props there), so they are asserted via their group labels.
    expect(screen.getByRole("group", { name: "Filtres A" }).className).toContain("x-filterbar");
    expect(screen.getByRole("group", { name: "Filtre Pays" }).className).toContain("x-filterpill");
    for (const [testId, extra] of [
      ["e-flame", "x-flame"],
      ["e-funnel", "x-funnel"],
      ["e-gantt", "x-gantt"],
      ["e-gauge", "x-gauge"],
      ["e-geo", "x-geo"],
      ["e-hlc", "x-hlc"],
      ["e-heat", "x-heat"],
      ["e-ha", "x-ha"],
      ["e-hist", "x-hist"],
      ["e-hollow", "x-hollow"],
      ["e-item", "x-item"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("follows className signals mutated after mount on every group-3 module", async () => {
    const filterbar = signal("x-filterbar");
    const filterpill = signal("x-filterpill");
    const flame = signal("x-flame");
    const funnel = signal("x-funnel");
    const gantt = signal("x-gantt");
    const gauge = signal("x-gauge");
    const geo = signal("x-geo");
    const hlc = signal("x-hlc");
    const heat = signal("x-heat");
    const ha = signal("x-ha");
    const hist = signal("x-hist");
    const hollow = signal("x-hollow");
    const item = signal("x-item");
    render(
      <>
        <FilterBar label="Filtres M" className={filterbar} />
        <FilterPill field="Ville" value="Paris" className={filterpill} />
        <FlamegraphChart data-testid="m-flame" data={{ name: "root", value: 2 }} label="L" className={flame} />
        <FunnelChart data-testid="m-funnel" data={[{ label: "A", value: 2 }]} label="L" className={funnel} />
        <GanttChart data-testid="m-gantt" data={[{ task: "T", start: 1, end: 3 }]} label="L" className={gantt} />
        <GaugeChart data-testid="m-gauge" value={50} label="L" className={gauge} />
        <GeoChart
          data-testid="m-geo"
          layers={[{ type: "points", points: [{ latitude: 48.8, longitude: 2.3 }] }]}
          label="L"
          className={geo}
        />
        <HLCChart data-testid="m-hlc" data={[{ label: "A", high: 5, low: 1, close: 4 }]} label="L" className={hlc} />
        <HeatmapChart data-testid="m-heat" data={[{ x: "a", y: "b", value: 1 }]} label="L" className={heat} />
        <HeikinAshiChart data-testid="m-ha" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={ha} />
        <HistogramChart data-testid="m-hist" data={[{ label: "A", value: 1 }]} label="L" className={hist} />
        <HollowCandlestickChart data-testid="m-hollow" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={hollow} />
        <ItemChart data-testid="m-item" data={[{ label: "A", value: 2 }]} label="L" className={item} />
      </>,
    );
    expect(screen.getByRole("group", { name: "Filtres M" }).className).toContain(filterbar.value);
    expect(screen.getByRole("group", { name: "Filtre Ville" }).className).toContain(filterpill.value);
    const cases = [
      ["m-flame", flame],
      ["m-funnel", funnel],
      ["m-gantt", gantt],
      ["m-gauge", gauge],
      ["m-geo", geo],
      ["m-hlc", hlc],
      ["m-heat", heat],
      ["m-ha", ha],
      ["m-hist", hist],
      ["m-hollow", hollow],
      ["m-item", item],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    filterbar.value = "x-after";
    filterpill.value = "x-after";
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    await waitFor(() => expect(screen.getByRole("group", { name: "Filtres M" }).className).toContain("x-after"));
    await waitFor(() => expect(screen.getByRole("group", { name: "Filtre Ville" }).className).toContain("x-after"));
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
  });

  it("FilterPill follows active/removable/disabled signals and keeps onClick/onRemove", async () => {
    const active = signal(true);
    const removable = signal(true);
    const disabled = signal(false);
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <FilterPill field="Statut" value="Actif" active={active} removable={removable} disabled={disabled} onClick={onClick} onRemove={onRemove} />,
    );
    const group = screen.getByRole("group", { name: "Filtre Statut" });
    const body = group.querySelector(".st-filterPill__body") as HTMLButtonElement;
    expect(body.getAttribute("aria-pressed")).toBe("true");
    expect(group.querySelector(".st-filterPill__remove")).not.toBeNull();
    fireEvent.click(body);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(group.querySelector(".st-filterPill__remove")!);
    expect(onRemove).toHaveBeenCalledTimes(1);
    // Suppr on the body removes too.
    fireEvent.keyDown(body, { key: "Delete" });
    expect(onRemove).toHaveBeenCalledTimes(2);
    active.value = false;
    removable.value = false;
    disabled.value = true;
    await waitFor(() => expect(body.getAttribute("aria-pressed")).toBe("false"));
    await waitFor(() => expect(group.querySelector(".st-filterPill__remove")).toBeNull());
    await waitFor(() => expect(body.disabled).toBe(true));
    // Disabled pills swallow both handlers.
    fireEvent.click(body);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("FilterPill renders a static body without onClick", () => {
    render(<FilterPill field="Pays" value="France" />);
    const group = screen.getByRole("group", { name: "Filtre Pays" });
    expect(group.querySelector(".st-filterPill__body--static")).not.toBeNull();
    expect(group.querySelector("button.st-filterPill__body")).toBeNull();
  });

  it("FilterBar renders pills and only clears through the consumer onClearAll", () => {
    const onClearAll = vi.fn();
    const { rerender } = render(
      <FilterBar label="Filtres" onClearAll={onClearAll}>
        <FilterPill field="Pays" value="France" />
      </FilterBar>,
    );
    expect(screen.getByRole("group", { name: "Filtres" }).textContent).toContain("France");
    const clear = screen.getByRole("button", { name: "Tout effacer" });
    fireEvent.click(clear);
    expect(onClearAll).toHaveBeenCalledTimes(1);
    rerender(
      <FilterBar label="Filtres" clearAllLabel="Effacer">
        <FilterPill field="Pays" value="France" />
      </FilterBar>,
    );
    expect(screen.queryByRole("button", { name: "Effacer" })).toBeNull();
  });

  it("FunnelChart and HeatmapChart follow a legend signal mutated after mount", async () => {
    const funnelLegend = signal(false);
    const heatLegend = signal(false);
    render(
      <>
        <FunnelChart data={[{ label: "A", value: 2 }]} label="L" legend={funnelLegend} />
        <HeatmapChart data={[{ x: "a", y: "b", value: 1 }]} label="L" legend={heatLegend} />
      </>,
    );
    expect(document.querySelector(".st-funnelChart__legend")).toBeNull();
    expect(document.querySelector(".st-heatmapChart__legend")).toBeNull();
    funnelLegend.value = true;
    heatLegend.value = true;
    await waitFor(() => expect(document.querySelector(".st-funnelChart__legend")).not.toBeNull());
    await waitFor(() => expect(document.querySelector(".st-heatmapChart__legend")).not.toBeNull());
  });

  it("FunnelChart follows a showPercentages signal mutated after mount", async () => {
    const showPercentages = signal(true);
    const { container } = render(
      <FunnelChart data={[{ label: "A", value: 2 }]} label="L" showPercentages={showPercentages} />,
    );
    expect(container.querySelector(".st-funnelChart__value")?.textContent).toContain("%");
    showPercentages.value = false;
    await waitFor(() =>
      expect(container.querySelector(".st-funnelChart__value")?.textContent).not.toContain("%"),
    );
  });

  it("FunnelChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <FunnelChart data={[{ label: "A", value: 4 }, { label: "B", value: 2 }]} label="L" onClick={onClick} />,
    );
    // Percentages render against the first step by default.
    expect(container.querySelector(".st-funnelChart__value")?.textContent).toContain("%");
    const segment = container.querySelector(".st-funnelChart__segment")!;
    fireEvent.pointerMove(segment);
    expect(document.querySelector(".st-funnelChart__tooltipLabel")?.textContent).toBe("A");
    fireEvent.click(segment);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("GanttChart renders the marker and categories, with a tooltip on hover", () => {
    const { container } = render(
      <GanttChart
        data={[
          { task: "Alpha", start: 1, end: 4, category: "dev" },
          { task: "Beta", start: 2, end: 5, category: "ops" },
        ]}
        label="L"
        marker={3}
      />,
    );
    expect(container.querySelector(".st-ganttChart__marker")).not.toBeNull();
    expect(container.querySelector(".st-ganttChart__legend")?.textContent).toContain("dev");
    const bar = container.querySelector(".st-ganttChart__bar")!;
    fireEvent.pointerMove(bar);
    expect(document.querySelector(".st-ganttChart__tooltipLabel")?.textContent).toBe("Alpha");
  });

  it("GaugeChart clamps the value into [min,max] on the meter", () => {
    const { container, rerender } = render(
      <GaugeChart
        value={150}
        min={0}
        max={100}
        label="Charge"
        thresholds={[{ value: 70, tone: "warning" }]}
      />,
    );
    const meter = container.querySelector(".st-gaugeChart__visual")!;
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
    expect(meter.getAttribute("aria-valuetext")).toContain("Charge");
    // Thresholds replace the progress arc with bands.
    expect(container.querySelectorAll(".st-gaugeChart__band").length).toBeGreaterThan(0);
    expect(container.querySelector(".st-gaugeChart__progress")).toBeNull();
    rerender(<GaugeChart value={40} min={0} max={100} label="Charge" />);
    expect(container.querySelector(".st-gaugeChart__progress")).not.toBeNull();
  });

  it("GeoChart projects a points layer into seats of the visual", () => {
    const { container } = render(
      <GeoChart
        layers={[{ type: "points", points: [{ latitude: 48.8, longitude: 2.3, label: "Paris" }] }]}
        label="Carte"
      />,
    );
    expect(container.querySelector(".st-geoMap__visual")?.getAttribute("aria-label")).toBe("Carte");
    expect(container.querySelectorAll(".st-geoMap__point")).toHaveLength(1);
  });

  it("HLCChart marks rising closes up and HeikinAshiChart smooths candles", () => {
    render(
      <>
        <HLCChart data={[{ label: "A", high: 5, low: 1, close: 4 }, { label: "B", high: 6, low: 2, close: 2 }]} label="L" />
        <HeikinAshiChart data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" />
      </>,
    );
    expect(document.querySelectorAll(".st-hlcChart__bar--up")).toHaveLength(1);
    expect(document.querySelectorAll(".st-hlcChart__bar--down")).toHaveLength(1);
    expect(document.querySelector(".st-heikinAshiChart__body--up")).not.toBeNull();
  });

  it("HistogramChart bins raw numbers and HollowCandlestickChart fills bearish bodies", () => {
    render(
      <>
        <HistogramChart data={[1, 1, 1, 2, 2, 3]} bins={2} label="L" />
        <HollowCandlestickChart
          data={[
            { label: "U", open: 1, high: 3, low: 0.5, close: 2 },
            { label: "D", open: 3, high: 4, low: 1, close: 2 },
          ]}
          label="L"
        />
      </>,
    );
    expect(document.querySelectorAll(".st-histogramChart__bar")).toHaveLength(2);
    expect(document.querySelector(".st-hollowCandlestickChart__candle--hollow")).not.toBeNull();
    expect(document.querySelector(".st-hollowCandlestickChart__candle--filled")).not.toBeNull();
  });

  it("ItemChart lays out one seat per rounded unit with the total", () => {
    render(<ItemChart data={[{ label: "A", value: 2 }, { label: "B", value: 3 }]} label="L" />);
    expect(document.querySelectorAll(".st-itemChart__seat")).toHaveLength(5);
    expect(document.querySelector(".st-itemChart__total")?.textContent).toBe("5");
  });
});
