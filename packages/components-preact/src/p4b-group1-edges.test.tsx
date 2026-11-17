import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KpiCard } from "./KpiCard.js";
import { LineChart } from "./LineChart.js";
import { LollipopChart } from "./LollipopChart.js";
import { MarimekkoChart } from "./MarimekkoChart.js";
import { OHLCChart } from "./OHLCChart.js";
import { OrderedList } from "./OrderedList.js";
import { OrganizationChart } from "./OrganizationChart.js";
import { PackedBubblesChart } from "./PackedBubblesChart.js";
import { ParallelCoordinatesChart } from "./ParallelCoordinatesChart.js";
import { ParetoChart } from "./ParetoChart.js";
import { PointAndFigureChart } from "./PointAndFigureChart.js";
import { PolygonChart } from "./PolygonChart.js";
import { PriorityMatrix } from "./PriorityMatrix.js";
import { RadarChart } from "./RadarChart.js";
import { RenkoChart } from "./RenkoChart.js";
import { RibbonChart } from "./RibbonChart.js";
import { Sparkline } from "./Sparkline.js";

afterEach(cleanup);

describe("P4b group 1 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-1 module", () => {
    render(
      <>
        <KpiCard data-testid="e-kpi" value={42} label="Revenu" className={signal("x-kpi")} />
        <LineChart data-testid="e-line" data={[{ x: "A", y: 1 }]} label="L" className={signal("x-line")} />
        <LollipopChart data-testid="e-lolli" data={[{ label: "A", value: 1 }]} label="L" className={signal("x-lolli")} />
        <MarimekkoChart
          data-testid="e-mari"
          data={[{ label: "A", width: 1, segments: [{ label: "s", value: 1 }] }]}
          label="L"
          className={signal("x-mari")}
        />
        <OHLCChart
          data-testid="e-ohlc"
          data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]}
          label="L"
          className={signal("x-ohlc")}
        />
        <OrderedList data-testid="e-ordered" items={["a", "b"]} className={signal("x-ordered")} />
        <OrganizationChart
          data-testid="e-org"
          data={[{ id: "a", label: "Racine" }]}
          label="L"
          className={signal("x-org")}
        />
        <PackedBubblesChart
          data-testid="e-packed"
          data={[{ label: "A", value: 3 }]}
          label="L"
          className={signal("x-packed")}
        />
        <ParallelCoordinatesChart
          data-testid="e-parallel"
          axes={[{ key: "a", label: "A" }]}
          data={[{ a: 1 }]}
          label="L"
          className={signal("x-parallel")}
        />
        <ParetoChart data-testid="e-pareto" data={[{ label: "A", value: 2 }]} label="L" className={signal("x-pareto")} />
        <PointAndFigureChart
          data-testid="e-pf"
          data={[{ date: 1, close: 10 }]}
          label="L"
          className={signal("x-pf")}
        />
        <PolygonChart data-testid="e-polygon" data={[{ x: 1, y: 2 }]} label="L" className={signal("x-polygon")} />
        <PriorityMatrix
          data-testid="e-matrix"
          data={[{ x: 20, y: 80, label: "Rapide" }]}
          label="L"
          className={signal("x-matrix")}
        />
        <RadarChart
          data-testid="e-radar"
          axes={["a", "b", "c"]}
          series={[{ label: "S", values: [1, 2, 3] }]}
          label="L"
          className={signal("x-radar")}
        />
        <RenkoChart data-testid="e-renko" data={[{ date: 1, close: 10 }]} label="L" className={signal("x-renko")} />
        <RibbonChart
          data-testid="e-ribbon"
          data={[{ category: "A", period: "P1", value: 2 }]}
          label="L"
          className={signal("x-ribbon")}
        />
        <Sparkline data-testid="e-spark" data={[1, 2, 3]} className={signal("x-spark")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-kpi", "x-kpi"],
      ["e-line", "x-line"],
      ["e-lolli", "x-lolli"],
      ["e-mari", "x-mari"],
      ["e-ohlc", "x-ohlc"],
      ["e-ordered", "x-ordered"],
      ["e-org", "x-org"],
      ["e-packed", "x-packed"],
      ["e-parallel", "x-parallel"],
      ["e-pareto", "x-pareto"],
      ["e-pf", "x-pf"],
      ["e-polygon", "x-polygon"],
      ["e-matrix", "x-matrix"],
      ["e-radar", "x-radar"],
      ["e-renko", "x-renko"],
      ["e-ribbon", "x-ribbon"],
      ["e-spark", "x-spark"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("follows className signals mutated after mount on every group-1 module", async () => {
    const kpi = signal("x-kpi");
    const line = signal("x-line");
    const lolli = signal("x-lolli");
    const mari = signal("x-mari");
    const ohlc = signal("x-ohlc");
    const ordered = signal("x-ordered");
    const org = signal("x-org");
    const packed = signal("x-packed");
    const parallel = signal("x-parallel");
    const pareto = signal("x-pareto");
    const pf = signal("x-pf");
    const polygon = signal("x-polygon");
    const matrix = signal("x-matrix");
    const radar = signal("x-radar");
    const renko = signal("x-renko");
    const ribbon = signal("x-ribbon");
    const spark = signal("x-spark");
    render(
      <>
        <KpiCard data-testid="m-kpi" value={42} label="Revenu" className={kpi} />
        <LineChart data-testid="m-line" data={[{ x: "A", y: 1 }]} label="L" className={line} />
        <LollipopChart data-testid="m-lolli" data={[{ label: "A", value: 1 }]} label="L" className={lolli} />
        <MarimekkoChart
          data-testid="m-mari"
          data={[{ label: "A", width: 1, segments: [{ label: "s", value: 1 }] }]}
          label="L"
          className={mari}
        />
        <OHLCChart
          data-testid="m-ohlc"
          data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]}
          label="L"
          className={ohlc}
        />
        <OrderedList data-testid="m-ordered" items={["a", "b"]} className={ordered} />
        <OrganizationChart data-testid="m-org" data={[{ id: "a", label: "Racine" }]} label="L" className={org} />
        <PackedBubblesChart data-testid="m-packed" data={[{ label: "A", value: 3 }]} label="L" className={packed} />
        <ParallelCoordinatesChart
          data-testid="m-parallel"
          axes={[{ key: "a", label: "A" }]}
          data={[{ a: 1 }]}
          label="L"
          className={parallel}
        />
        <ParetoChart data-testid="m-pareto" data={[{ label: "A", value: 2 }]} label="L" className={pareto} />
        <PointAndFigureChart data-testid="m-pf" data={[{ date: 1, close: 10 }]} label="L" className={pf} />
        <PolygonChart data-testid="m-polygon" data={[{ x: 1, y: 2 }]} label="L" className={polygon} />
        <PriorityMatrix data-testid="m-matrix" data={[{ x: 20, y: 80, label: "Rapide" }]} label="L" className={matrix} />
        <RadarChart
          data-testid="m-radar"
          axes={["a", "b", "c"]}
          series={[{ label: "S", values: [1, 2, 3] }]}
          label="L"
          className={radar}
        />
        <RenkoChart data-testid="m-renko" data={[{ date: 1, close: 10 }]} label="L" className={renko} />
        <RibbonChart data-testid="m-ribbon" data={[{ category: "A", period: "P1", value: 2 }]} label="L" className={ribbon} />
        <Sparkline data-testid="m-spark" data={[1, 2, 3]} className={spark} />
      </>,
    );
    const cases = [
      ["m-kpi", kpi],
      ["m-line", line],
      ["m-lolli", lolli],
      ["m-mari", mari],
      ["m-ohlc", ohlc],
      ["m-ordered", ordered],
      ["m-org", org],
      ["m-packed", packed],
      ["m-parallel", parallel],
      ["m-pareto", pareto],
      ["m-pf", pf],
      ["m-polygon", polygon],
      ["m-matrix", matrix],
      ["m-radar", radar],
      ["m-renko", renko],
      ["m-ribbon", ribbon],
      ["m-spark", spark],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
  });

  it("LineChart follows smooth, area, trend, invertAxis, hoverKey and keyboardNav signals mutated after mount", async () => {
    const smooth = signal(false);
    const area = signal(false);
    const trend = signal(false);
    const invertAxis = signal(false);
    const hoverKey = signal<string | null>(null);
    const keyboardNav = signal(false);
    const { container } = render(
      <LineChart
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 5 },
          { x: 2, y: 2 },
        ]}
        label="L"
        smooth={smooth}
        area={area}
        trend={trend}
        invertAxis={invertAxis}
        hoverKey={hoverKey}
        keyboardNav={keyboardNav}
      />,
    );
    const line = () => container.querySelector(".st-lineChart__line")?.getAttribute("d") ?? "";
    const linearD = line();
    expect(linearD).not.toBe("");
    // No area fill, trend line, crosshair or nav overlay until wired.
    expect(container.querySelector(".st-lineChart__area")).toBeNull();
    expect(container.querySelector(".st-lineChart__trend")).toBeNull();
    expect(container.querySelector(".st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-lineChart__navDatum")).toBeNull();
    smooth.value = true;
    await waitFor(() => expect(line()).not.toBe(linearD));
    invertAxis.value = true;
    await waitFor(() => expect(line()).not.toBe(linearD));
    area.value = true;
    await waitFor(() => expect(container.querySelector(".st-lineChart__area")).not.toBeNull());
    trend.value = true;
    await waitFor(() => expect(container.querySelector(".st-lineChart__trend")).not.toBeNull());
    hoverKey.value = "1";
    await waitFor(() => expect(container.querySelector(".st-lineChart__crosshair")).not.toBeNull());
    keyboardNav.value = true;
    await waitFor(() => expect(container.querySelector(".st-lineChart__navDatum")).not.toBeNull());
  });

  it("LineChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <LineChart
        data={[
          { x: "A", y: 1 },
          { x: "B", y: 2 },
        ]}
        label="L"
        onClick={onClick}
        onHoverKeyChange={onHoverKeyChange}
      />,
    );
    const point = container.querySelector("[data-chart-index]");
    expect(point).not.toBeNull();
    fireEvent.pointerMove(point!);
    expect(onHoverKeyChange).toHaveBeenCalledWith("A");
    fireEvent.click(point!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("LineChart roving tabindex moves focus with ArrowRight (SVG tabIndex)", async () => {
    const { container } = render(
      <LineChart
        data={[
          { x: "A", y: 1 },
          { x: "B", y: 2 },
        ]}
        label="L"
        keyboardNav
      />,
    );
    const navRects = container.querySelectorAll(".st-lineChart__navDatum");
    expect(navRects).toHaveLength(2);
    // Roving tabindex: the first datum holds the single tab stop. The runtime
    // vnode hook normalises `tabIndex` to `tabindex` (SVG attribute names are
    // case-sensitive), so the rect is focusable like in React.
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    expect((navRects[1] as SVGRectElement).tabIndex).toBe(-1);
    (navRects[0] as SVGRectElement).focus();
    expect(document.activeElement).toBe(navRects[0]);
    fireEvent.keyDown(navRects[0], { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(navRects[1]));
  });

  it("OHLCChart follows hoverKey and keyboardNav signals mutated after mount", async () => {
    const hoverKey = signal<string | null>(null);
    const keyboardNav = signal(false);
    const { container } = render(
      <OHLCChart
        data={[
          { label: "D1", open: 1, high: 2, low: 0.5, close: 1.5 },
          { label: "D2", open: 1.5, high: 2.5, low: 1, close: 2 },
        ]}
        label="L"
        hoverKey={hoverKey}
        keyboardNav={keyboardNav}
      />,
    );
    expect(container.querySelector(".st-ohlcChart__crosshair")).toBeNull();
    expect(container.querySelector(".st-ohlcChart__navDatum")).toBeNull();
    hoverKey.value = "D2";
    await waitFor(() => expect(container.querySelector(".st-ohlcChart__crosshair")).not.toBeNull());
    keyboardNav.value = true;
    await waitFor(() => expect(container.querySelector(".st-ohlcChart__navDatum")).not.toBeNull());
  });

  it("OHLCChart selects the focused bar on Enter via onSelectKey (SVG tabIndex)", () => {
    const onSelectKey = vi.fn();
    const { container } = render(
      <OHLCChart
        data={[{ label: "D1", open: 1, high: 2, low: 0.5, close: 1.5 }]}
        label="L"
        keyboardNav
        onSelectKey={onSelectKey}
      />,
    );
    const navRects = container.querySelectorAll(".st-ohlcChart__navDatum");
    expect(navRects).toHaveLength(1);
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    fireEvent.keyDown(navRects[0], { key: "Enter" });
    expect(onSelectKey).toHaveBeenCalledTimes(1);
    expect(onSelectKey).toHaveBeenCalledWith("D1");
  });

  it("RadarChart follows a legend signal and Sparkline follows an area signal after mount", async () => {
    const legend = signal(false);
    const area = signal(false);
    const { container } = render(
      <>
        <RadarChart
          axes={["a", "b", "c"]}
          series={[{ label: "S", values: [1, 2, 3] }]}
          label="L"
          legend={legend}
        />
        <Sparkline data={[1, 2, 1, 3]} area={area} />
      </>,
    );
    expect(container.querySelector(".st-radarChart__legend")).toBeNull();
    expect(container.querySelector(".st-sparkline__area")).toBeNull();
    legend.value = true;
    area.value = true;
    await waitFor(() => expect(container.querySelector(".st-radarChart__legend")).not.toBeNull());
    await waitFor(() => expect(container.querySelector(".st-sparkline__area")).not.toBeNull());
  });

  it("OrderedList follows a nested signal mutated after mount", async () => {
    const nested = signal(false);
    const { container } = render(<OrderedList items={["a", "b"]} nested={nested} />);
    expect(container.querySelector("ol")?.className).not.toContain("st-orderedList--nested");
    nested.value = true;
    await waitFor(() =>
      expect(container.querySelector("ol")?.className).toContain("st-orderedList--nested"),
    );
  });

  it("KpiCard keeps a consumer onClick and renders its Sparkline dependency", () => {
    const onClick = vi.fn();
    const { container } = render(
      <KpiCard value={0.42} format="percent" label="Revenu" sparkline={[1, 2, 3]} onClick={onClick} />,
    );
    expect(container.querySelector(".st-sparkline")).not.toBeNull();
    expect(container.querySelector(".st-kpiCard__number")?.textContent).not.toBe("");
    const host = container.querySelector(".st-kpiCard")!;
    fireEvent.click(host);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
