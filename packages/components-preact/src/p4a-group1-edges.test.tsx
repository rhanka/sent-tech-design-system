import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnomalySwimLaneChart } from "./AnomalySwimLaneChart.js";
import { ArcDiagramChart } from "./ArcDiagramChart.js";
import { AreaChart } from "./AreaChart.js";
import { AreaRangeChart } from "./AreaRangeChart.js";
import { AreaSplineRangeChart } from "./AreaSplineRangeChart.js";
import { BarChart } from "./BarChart.js";
import { BellCurveChart } from "./BellCurveChart.js";
import { BoxPlotChart } from "./BoxPlotChart.js";
import { BulletChart } from "./BulletChart.js";
import { BumpChart } from "./BumpChart.js";
import { CalendarHeatmapChart } from "./CalendarHeatmapChart.js";
import { CandlestickChart } from "./CandlestickChart.js";
import { ChordDiagram } from "./ChordDiagram.js";
import { CodeSnippet } from "./CodeSnippet.js";
import { ColorScaleBar } from "./ColorScaleBar.js";
import { ForceGraph } from "./ForceGraph.js";

afterEach(cleanup);

describe("P4a group 1 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-1 module", () => {
    render(
      <>
        <AnomalySwimLaneChart data-testid="e-anomaly" data={[{ job: "j", buckets: [{ at: 1, score: 2 }] }]} label="L" className={signal("x-anomaly")} />
        <ArcDiagramChart data-testid="e-arc" data={[{ from: "a", to: "b", weight: 1 }]} label="L" className={signal("x-arc")} />
        <AreaChart data-testid="e-area" data={[{ x: "A", y: 1 }]} label="L" className={signal("x-area")} />
        <AreaRangeChart data-testid="e-arearange" data={[{ x: "A", low: 1, high: 2 }]} label="L" className={signal("x-arearange")} />
        <AreaSplineRangeChart data-testid="e-areaspline" data={[{ x: "A", low: 1, high: 2 }]} label="L" className={signal("x-areaspline")} />
        <BarChart data-testid="e-bar" data={[{ label: "A", value: 1 }]} label="L" className={signal("x-bar")} />
        <BellCurveChart data-testid="e-bell" data={[1, 2, 3]} label="L" className={signal("x-bell")} />
        <BoxPlotChart data-testid="e-box" data={[{ label: "A", min: 1, q1: 2, median: 3, q3: 4, max: 5 }]} label="L" className={signal("x-box")} />
        <BulletChart data-testid="e-bullet" data={[{ label: "A", value: 5, target: 7 }]} label="L" className={signal("x-bullet")} />
        <BumpChart data-testid="e-bump" data={[{ label: "S", ranks: [1, 2] }]} categories={["c1", "c2"]} label="L" className={signal("x-bump")} />
        <CalendarHeatmapChart data-testid="e-cal" data={[{ date: "2024-01-01", value: 3 }]} label="L" className={signal("x-cal")} />
        <CandlestickChart data-testid="e-candle" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={signal("x-candle")} />
        <ChordDiagram data-testid="e-chord" data={[{ from: "a", to: "b", value: 1 }]} label="L" className={signal("x-chord")} />
        <CodeSnippet data-testid="e-snippet" code="x = 1" className={signal("x-snippet")} />
        <ColorScaleBar data-testid="e-scalebar" colors={["red", "blue"]} className={signal("x-scalebar")} />
        <ForceGraph data-testid="e-force" nodes={[{ id: "a" }, { id: "b" }]} edges={[{ source: "a", target: "b" }]} label="L" className={signal("x-force")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-anomaly", "x-anomaly"],
      ["e-arc", "x-arc"],
      ["e-area", "x-area"],
      ["e-arearange", "x-arearange"],
      ["e-areaspline", "x-areaspline"],
      ["e-bar", "x-bar"],
      ["e-bell", "x-bell"],
      ["e-box", "x-box"],
      ["e-bullet", "x-bullet"],
      ["e-bump", "x-bump"],
      ["e-cal", "x-cal"],
      ["e-candle", "x-candle"],
      ["e-chord", "x-chord"],
      ["e-snippet", "x-snippet"],
      ["e-scalebar", "x-scalebar"],
      ["e-force", "x-force"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("follows className signals mutated after mount on every group-1 module", async () => {
    const anomaly = signal("x-anomaly");
    const arc = signal("x-arc");
    const area = signal("x-area");
    const bar = signal("x-bar");
    const bell = signal("x-bell");
    const box = signal("x-box");
    const bullet = signal("x-bullet");
    const bump = signal("x-bump");
    const cal = signal("x-cal");
    const candle = signal("x-candle");
    const chord = signal("x-chord");
    const snippet = signal("x-snippet");
    const scalebar = signal("x-scalebar");
    const force = signal("x-force");
    render(
      <>
        <AnomalySwimLaneChart data-testid="m-anomaly" data={[{ job: "j", buckets: [{ at: 1, score: 2 }] }]} label="L" className={anomaly} />
        <ArcDiagramChart data-testid="m-arc" data={[{ from: "a", to: "b", weight: 1 }]} label="L" className={arc} />
        <AreaChart data-testid="m-area" data={[{ x: "A", y: 1 }]} label="L" className={area} />
        <BarChart data-testid="m-bar" data={[{ label: "A", value: 1 }]} label="L" className={bar} />
        <BellCurveChart data-testid="m-bell" data={[1, 2, 3]} label="L" className={bell} />
        <BoxPlotChart data-testid="m-box" data={[{ label: "A", min: 1, q1: 2, median: 3, q3: 4, max: 5 }]} label="L" className={box} />
        <BulletChart data-testid="m-bullet" data={[{ label: "A", value: 5, target: 7 }]} label="L" className={bullet} />
        <BumpChart data-testid="m-bump" data={[{ label: "S", ranks: [1, 2] }]} categories={["c1", "c2"]} label="L" className={bump} />
        <CalendarHeatmapChart data-testid="m-cal" data={[{ date: "2024-01-01", value: 3 }]} label="L" className={cal} />
        <CandlestickChart data-testid="m-candle" data={[{ label: "D", open: 1, high: 2, low: 0.5, close: 1.5 }]} label="L" className={candle} />
        <ChordDiagram data-testid="m-chord" data={[{ from: "a", to: "b", value: 1 }]} label="L" className={chord} />
        <CodeSnippet data-testid="m-snippet" code="x = 1" className={snippet} />
        <ColorScaleBar data-testid="m-scalebar" colors={["red", "blue"]} className={scalebar} />
        <ForceGraph data-testid="m-force" nodes={[{ id: "a" }, { id: "b" }]} edges={[{ source: "a", target: "b" }]} label="L" className={force} />
      </>,
    );
    const cases = [
      ["m-anomaly", anomaly],
      ["m-arc", arc],
      ["m-area", area],
      ["m-bar", bar],
      ["m-bell", bell],
      ["m-box", box],
      ["m-bullet", bullet],
      ["m-bump", bump],
      ["m-cal", cal],
      ["m-candle", candle],
      ["m-chord", chord],
      ["m-snippet", snippet],
      ["m-scalebar", scalebar],
      ["m-force", force],
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

  it("AreaChart follows a hoverKey signal mutated after mount", async () => {
    const hoverKey = signal<string | null>(null);
    const onHoverKeyChange = vi.fn();
    render(
      <AreaChart
        data={[{ x: "A", y: 1 }, { x: "B", y: 2 }]}
        label="L"
        hoverKey={hoverKey}
        onHoverKeyChange={onHoverKeyChange}
      />,
    );
    // Controlled with null: no tooltip even though data exists.
    expect(document.querySelector(".st-areaChart__tooltip")).toBeNull();
    hoverKey.value = "B";
    await waitFor(() => expect(document.querySelector(".st-areaChart__tooltip")).not.toBeNull());
    expect(document.querySelector(".st-areaChart__tooltipLabel")?.textContent).toBe("B");
    hoverKey.value = null;
    await waitFor(() => expect(document.querySelector(".st-areaChart__tooltip")).toBeNull());
  });

  it("BarChart follows a selectedKeys signal and keeps consumer onSelect", async () => {
    const selectedKeys = signal<string[]>([]);
    const onSelect = vi.fn();
    render(
      <BarChart
        data={[{ label: "A", value: 1 }, { label: "B", value: 2 }]}
        label="L"
        selectedKeys={selectedKeys}
        onSelect={onSelect}
      />,
    );
    // Two accessible filter chips; none selected initially.
    const chips = document.querySelectorAll(".st-barChart__filterChip");
    expect(chips).toHaveLength(2);
    expect(chips[0].getAttribute("aria-pressed")).toBe("false");
    // Consumer handler fires with the bar key.
    fireEvent.click(chips[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("B");
    // Controlled selection follows the signal.
    selectedKeys.value = ["A"];
    await waitFor(() =>
      expect(document.querySelectorAll(".st-barChart__filterChip")[0].getAttribute("aria-pressed")).toBe("true"),
    );
  });

  it("BarChart emits onHoverKeyChange from pointer hover", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <BarChart data={[{ label: "A", value: 1 }]} label="L" onHoverKeyChange={onHoverKeyChange} />,
    );
    const bar = container.querySelector(".st-barChart__bar");
    expect(bar).not.toBeNull();
    fireEvent.pointerMove(bar!);
    expect(onHoverKeyChange).toHaveBeenCalledWith("A");
  });

  it("CandlestickChart selects the focused candle on Enter via onSelectKey", () => {
    const onSelectKey = vi.fn();
    const { container } = render(
      <CandlestickChart
        data={[{ label: "D1", open: 1, high: 2, low: 0.5, close: 1.5 }]}
        label="L"
        keyboardNav
        onSelectKey={onSelectKey}
      />,
    );
    // Keyboard overlay renders exactly one tab stop. The runtime vnode hook
    // normalises `tabIndex` to `tabindex` (SVG attribute names are
    // case-sensitive), so the rect is focusable like in React.
    const navRects = container.querySelectorAll(".st-candlestickChart__navDatum");
    expect(navRects).toHaveLength(1);
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    fireEvent.keyDown(navRects[0], { key: "Enter" });
    expect(onSelectKey).toHaveBeenCalledTimes(1);
    expect(onSelectKey).toHaveBeenCalledWith("D1");
  });

  it("CandlestickChart roving tabindex moves focus with ArrowRight", async () => {
    const { container } = render(
      <CandlestickChart
        data={[
          { label: "D1", open: 1, high: 2, low: 0.5, close: 1.5 },
          { label: "D2", open: 1.5, high: 2.5, low: 1, close: 2 },
        ]}
        label="L"
        keyboardNav
      />,
    );
    const navRects = container.querySelectorAll(".st-candlestickChart__navDatum");
    expect(navRects).toHaveLength(2);
    // Roving tabindex: the first datum holds the single tab stop.
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    expect((navRects[1] as SVGRectElement).tabIndex).toBe(-1);
    (navRects[0] as SVGRectElement).focus();
    expect(document.activeElement).toBe(navRects[0]);
    fireEvent.keyDown(navRects[0], { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(navRects[1]));
  });

  it("ForceGraph nodes are keyboard-focusable and Enter selects", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ForceGraph
        nodes={[{ id: "a" }, { id: "b" }]}
        edges={[{ source: "a", target: "b" }]}
        label="L"
        onSelect={onSelect}
      />,
    );
    const shapes = container.querySelectorAll(".st-forceGraph__shape");
    expect(shapes.length).toBe(2);
    expect((shapes[0] as SVGCircleElement).tabIndex).toBe(0);
    (shapes[0] as SVGCircleElement).focus();
    expect(document.activeElement).toBe(shapes[0]);
    fireEvent.keyDown(shapes[0], { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("ArcDiagramChart renders the GraphLegend entries", () => {
    render(
      <ArcDiagramChart
        data={[{ from: "alpha", to: "beta", weight: 3 }]}
        labels={{ alpha: "Alpha", beta: "Beta" }}
        label="L"
      />,
    );
    const legend = document.querySelector(".st-arcDiagramChart__legend");
    expect(legend).not.toBeNull();
    expect(legend?.textContent).toContain("Alpha");
    expect(legend?.textContent).toContain("Beta");
  });

  it("ForceGraph keeps onSelect and onOpenEntity and follows selectedIds", async () => {
    const selectedIds = signal<string[]>([]);
    const onSelect = vi.fn();
    const onOpenEntity = vi.fn();
    const { container } = render(
      <ForceGraph
        nodes={[{ id: "a" }, { id: "b" }]}
        edges={[{ source: "a", target: "b" }]}
        label="L"
        selectedIds={selectedIds}
        onSelect={onSelect}
        onOpenEntity={onOpenEntity}
      />,
    );
    const shapes = container.querySelectorAll(".st-forceGraph__shape");
    expect(shapes.length).toBe(2);
    fireEvent.click(shapes[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("a");
    // Double-click maps to onOpenEntity on both runtimes (dblClick adapter).
    fireEvent.dblClick(shapes[1]);
    expect(onOpenEntity).toHaveBeenCalledTimes(1);
    expect(onOpenEntity).toHaveBeenCalledWith("b");
    // Controlled selection follows the signal.
    selectedIds.value = ["b"];
    await waitFor(() =>
      expect(
        container.querySelectorAll(".st-forceGraph__node")[1].getAttribute("class") ?? "",
      ).toContain("st-forceGraph__node--selected"),
    );
  });

  it("ForceGraph renders its legend overlay when entries are provided", () => {
    render(
      <ForceGraph
        nodes={[{ id: "a" }]}
        edges={[]}
        label="L"
        legend={[{ label: "Nodes", shape: "circle", tone: "category2" }]}
      />,
    );
    const legend = document.querySelector(".st-forceGraph__legend");
    expect(legend).not.toBeNull();
    expect(legend?.textContent).toContain("Nodes");
  });

  it("CodeSnippet renders the copy button unless copyable is off", async () => {
    const copyable = signal(true);
    render(<CodeSnippet code="x = 1" copyable={copyable} />);
    expect(document.querySelector(".st-codeSnippet__copy")).not.toBeNull();
    copyable.value = false;
    await waitFor(() => expect(document.querySelector(".st-codeSnippet__copy")).toBeNull());
  });

  it("BellCurveChart announces computed sample statistics", () => {
    render(<BellCurveChart data={[1, 2, 3, 4, 5]} label="L" />);
    // mean = 3 exactly for [1..5]; a wrong stats implementation would differ.
    expect(document.querySelector(".st-bellCurveChart__visual")?.getAttribute("aria-label")).toContain("μ 3");
  });

  it("ColorScaleBar renders the gradient and end labels", () => {
    render(<ColorScaleBar colors={["#000000", "#ffffff"]} min="low" max="high" label="L" />);
    const bar = document.querySelector<HTMLDivElement>(".st-colorScaleBar__bar");
    expect(bar?.style.background).toContain("linear-gradient");
    expect(document.querySelector(".st-colorScaleBar__end--max")?.textContent).toBe("high");
    expect(document.querySelector(".st-colorScaleBar__end--min")?.textContent).toBe("low");
  });
});
