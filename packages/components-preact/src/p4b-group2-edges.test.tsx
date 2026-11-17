import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoseChart } from "./RoseChart.js";
import { SankeyChart } from "./SankeyChart.js";
import { ScatterPlot } from "./ScatterPlot.js";
import { ScoreCard } from "./ScoreCard.js";
import { SelectionChip } from "./SelectionChip.js";
import { SolidGaugeChart } from "./SolidGaugeChart.js";
import { StackedBarChart } from "./StackedBarChart.js";
import { StateTimelineChart } from "./StateTimelineChart.js";
import { StatusHistoryChart } from "./StatusHistoryChart.js";
import { StepLineChart } from "./StepLineChart.js";
import { StreamgraphChart } from "./StreamgraphChart.js";
import { StructuredList } from "./StructuredList.js";
import { SunburstChart } from "./SunburstChart.js";
import { Table } from "./Table.js";
import { Tag } from "./Tag.js";

afterEach(cleanup);

describe("P4b group 2 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-2 module", () => {
    // SelectionChip takes no rest props (like its React twin), so it is
    // located by class instead of by test id.
    const { container } = render(
      <>
        <RoseChart data-testid="e-rose" data={[{ label: "A", value: 2 }]} label="L" className={signal("x-rose")} />
        <SankeyChart
          data-testid="e-sankey"
          nodes={[
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ]}
          links={[{ source: "a", target: "b", value: 3 }]}
          label="L"
          className={signal("x-sankey")}
        />
        <ScatterPlot data-testid="e-scatter" data={[{ x: 1, y: 2 }]} label="L" className={signal("x-scatter")} />
        <ScoreCard data-testid="e-score" title="T" score={4} stars={3} className={signal("x-score")} />
        <SelectionChip label="L" className={signal("x-chip")} />
        <SolidGaugeChart data-testid="e-gauge" value={42} className={signal("x-gauge")} />
        <StackedBarChart
          data-testid="e-stack"
          data={[{ label: "Q", segments: [{ label: "A", value: 2 }] }]}
          label="L"
          className={signal("x-stack")}
        />
        <StateTimelineChart
          data-testid="e-state"
          data={[{ series: "S", segments: [{ start: 0, end: 1, state: "A" }] }]}
          label="L"
          className={signal("x-state")}
        />
        <StatusHistoryChart
          data-testid="e-status"
          data={[{ series: "S", buckets: [{ at: 0, value: "A" }] }]}
          label="L"
          className={signal("x-status")}
        />
        <StepLineChart data-testid="e-step" data={[{ x: "A", y: 1 }]} label="L" className={signal("x-step")} />
        <StreamgraphChart
          data-testid="e-stream"
          data={[{ category: "A", values: [{ label: "S", value: 2 }] }]}
          label="L"
          className={signal("x-stream")}
        />
        <StructuredList data-testid="e-list" items={[{ term: "T", description: "D" }]} className={signal("x-list")} />
        <SunburstChart
          data-testid="e-sun"
          data={{ label: "R", children: [{ label: "A", value: 2 }] }}
          label="L"
          className={signal("x-sun")}
        />
        <Table
          data-testid="e-table"
          columns={[{ key: "a", label: "A" }]}
          rows={[{ id: "1", a: "x" }]}
          className={signal("x-table")}
        />
        <Tag data-testid="e-tag" className={signal("x-tag")}>T</Tag>
      </>,
    );
    for (const [testId, extra] of [
      ["e-rose", "x-rose"],
      ["e-sankey", "x-sankey"],
      ["e-scatter", "x-scatter"],
      ["e-score", "x-score"],
      ["e-gauge", "x-gauge"],
      ["e-stack", "x-stack"],
      ["e-state", "x-state"],
      ["e-status", "x-status"],
      ["e-step", "x-step"],
      ["e-stream", "x-stream"],
      ["e-list", "x-list"],
      ["e-sun", "x-sun"],
      ["e-table", "x-table"],
      ["e-tag", "x-tag"],
    ] as const) {
      // The Table test id lands on the `<table>` itself (inside the wrap div).
      const node = screen.getByTestId(testId);
      expect(node.className).toContain(extra);
    }
    expect(container.querySelector(".st-selectionChip")?.className).toContain("x-chip");
  });

  it("follows className signals mutated after mount on every group-2 module", async () => {
    const rose = signal("x-rose");
    const sankey = signal("x-sankey");
    const scatter = signal("x-scatter");
    const score = signal("x-score");
    const chip = signal("x-chip");
    const gauge = signal("x-gauge");
    const stack = signal("x-stack");
    const state = signal("x-state");
    const status = signal("x-status");
    const step = signal("x-step");
    const stream = signal("x-stream");
    const list = signal("x-list");
    const sun = signal("x-sun");
    const table = signal("x-table");
    const tag = signal("x-tag");
    render(
      <>
        <RoseChart data-testid="m-rose" data={[{ label: "A", value: 2 }]} label="L" className={rose} />
        <SankeyChart
          data-testid="m-sankey"
          nodes={[
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ]}
          links={[{ source: "a", target: "b", value: 3 }]}
          label="L"
          className={sankey}
        />
        <ScatterPlot data-testid="m-scatter" data={[{ x: 1, y: 2 }]} label="L" className={scatter} />
        <ScoreCard data-testid="m-score" title="T" score={4} stars={3} className={score} />
        <SelectionChip label="L" className={chip} />
        <SolidGaugeChart data-testid="m-gauge" value={42} className={gauge} />
        <StackedBarChart
          data-testid="m-stack"
          data={[{ label: "Q", segments: [{ label: "A", value: 2 }] }]}
          label="L"
          className={stack}
        />
        <StateTimelineChart
          data-testid="m-state"
          data={[{ series: "S", segments: [{ start: 0, end: 1, state: "A" }] }]}
          label="L"
          className={state}
        />
        <StatusHistoryChart
          data-testid="m-status"
          data={[{ series: "S", buckets: [{ at: 0, value: "A" }] }]}
          label="L"
          className={status}
        />
        <StepLineChart data-testid="m-step" data={[{ x: "A", y: 1 }]} label="L" className={step} />
        <StreamgraphChart
          data-testid="m-stream"
          data={[{ category: "A", values: [{ label: "S", value: 2 }] }]}
          label="L"
          className={stream}
        />
        <StructuredList data-testid="m-list" items={[{ term: "T", description: "D" }]} className={list} />
        <SunburstChart
          data-testid="m-sun"
          data={{ label: "R", children: [{ label: "A", value: 2 }] }}
          label="L"
          className={sun}
        />
        <Table
          data-testid="m-table"
          columns={[{ key: "a", label: "A" }]}
          rows={[{ id: "1", a: "x" }]}
          className={table}
        />
        <Tag data-testid="m-tag" className={tag}>T</Tag>
      </>,
    );
    const cases = [
      ["m-rose", rose],
      ["m-sankey", sankey],
      ["m-scatter", scatter],
      ["m-score", score],
      ["m-gauge", gauge],
      ["m-stack", stack],
      ["m-state", state],
      ["m-status", status],
      ["m-step", step],
      ["m-stream", stream],
      ["m-list", list],
      ["m-sun", sun],
      ["m-table", table],
      ["m-tag", tag],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    chip.value = "x-after-chip";
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
    await waitFor(() =>
      expect(screen.getByText("L", { selector: ".st-selectionChip__label" }).closest(".st-selectionChip")?.className).toContain(
        "x-after-chip",
      ),
    );
  });

  it("StreamgraphChart follows smooth and showLegend signals mutated after mount", async () => {
    const smooth = signal(true);
    const showLegend = signal(true);
    const data = [
      { category: "A", values: [{ label: "S", value: 2 }] },
      { category: "B", values: [{ label: "S", value: 4 }] },
      { category: "C", values: [{ label: "S", value: 3 }] },
    ];
    const { container } = render(<StreamgraphChart data={data} label="L" smooth={smooth} showLegend={showLegend} />);
    const area = () => container.querySelector(".st-streamgraphChart__area")?.getAttribute("d") ?? "";
    // Smoothed areas use cubic segments; the legend is rendered.
    expect(area()).toContain("C");
    expect(container.querySelector(".st-streamgraphChart__legend")).not.toBeNull();
    smooth.value = false;
    await waitFor(() => expect(area()).not.toContain("C"));
    expect(area()).toContain("L");
    showLegend.value = false;
    await waitFor(() => expect(container.querySelector(".st-streamgraphChart__legend")).toBeNull());
  });

  it("StackedBarChart follows showLegend and hiddenSeries signals mutated after mount", async () => {
    const showLegend = signal(true);
    const hiddenSeries = signal<string[]>([]);
    const { container } = render(
      <StackedBarChart
        data={[
          { label: "Q1", segments: [{ label: "A", value: 2 }] },
          { label: "Q2", segments: [{ label: "A", value: 3 }] },
        ]}
        label="L"
        showLegend={showLegend}
        hiddenSeries={hiddenSeries}
        onToggleSeries={() => {}}
      />,
    );
    expect(container.querySelector(".st-stackedBar__legend")).not.toBeNull();
    expect(container.querySelectorAll(".st-stackedBar__seg")).toHaveLength(2);
    hiddenSeries.value = ["A"];
    await waitFor(() => expect(container.querySelectorAll(".st-stackedBar__seg")).toHaveLength(0));
    expect(container.querySelector(".st-stackedBar__legendItem--off")).not.toBeNull();
    hiddenSeries.value = [];
    await waitFor(() => expect(container.querySelectorAll(".st-stackedBar__seg")).toHaveLength(2));
    showLegend.value = false;
    await waitFor(() => expect(container.querySelector(".st-stackedBar__legend")).toBeNull());
  });

  it("SunburstChart follows a legend signal mutated after mount", async () => {
    const legend = signal(false);
    const { container } = render(
      <SunburstChart data={{ label: "R", children: [{ label: "A", value: 2 }] }} label="L" legend={legend} />,
    );
    expect(container.querySelector(".st-sunburstChart__legend")).toBeNull();
    legend.value = true;
    await waitFor(() => expect(container.querySelector(".st-sunburstChart__legend")).not.toBeNull());
  });

  it("ScatterPlot follows hoverKey and keyboardNav signals mutated after mount", async () => {
    const hoverKey = signal<string | null>(null);
    const keyboardNav = signal(false);
    const { container } = render(
      <ScatterPlot
        data={[
          { x: 1, y: 2, label: "A" },
          { x: 3, y: 4, label: "B" },
        ]}
        label="L"
        hoverKey={hoverKey}
        keyboardNav={keyboardNav}
      />,
    );
    expect(container.querySelector(".st-scatterPlot__crosshair")).toBeNull();
    expect(container.querySelector(".st-scatterPlot__navDatum")).toBeNull();
    hoverKey.value = "B";
    await waitFor(() => expect(container.querySelector(".st-scatterPlot__crosshair")).not.toBeNull());
    expect(container.querySelector(".st-scatterPlot__tooltipValue")?.textContent).toContain("4");
    keyboardNav.value = true;
    await waitFor(() => expect(container.querySelector(".st-scatterPlot__navDatum")).not.toBeNull());
  });

  it("ScatterPlot roving tabindex moves focus with ArrowRight (SVG tabIndex)", async () => {
    const { container } = render(
      <ScatterPlot
        data={[
          { x: 1, y: 2, label: "A" },
          { x: 3, y: 4, label: "B" },
        ]}
        label="L"
        keyboardNav
      />,
    );
    const navRects = container.querySelectorAll(".st-scatterPlot__navDatum");
    expect(navRects).toHaveLength(2);
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    expect((navRects[1] as SVGRectElement).tabIndex).toBe(-1);
    (navRects[0] as SVGRectElement).focus();
    expect(document.activeElement).toBe(navRects[0]);
    fireEvent.keyDown(navRects[0], { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(navRects[1]));
  });

  it("ScatterPlot selects the focused point on Enter via onSelectKey (SVG tabIndex)", () => {
    const onSelectKey = vi.fn();
    const { container } = render(
      <ScatterPlot data={[{ x: 1, y: 2, label: "A" }]} label="L" keyboardNav onSelectKey={onSelectKey} />,
    );
    const navRects = container.querySelectorAll(".st-scatterPlot__navDatum");
    expect(navRects).toHaveLength(1);
    expect((navRects[0] as SVGRectElement).tabIndex).toBe(0);
    fireEvent.keyDown(navRects[0], { key: "Enter" });
    expect(onSelectKey).toHaveBeenCalledTimes(1);
    expect(onSelectKey).toHaveBeenCalledWith("A");
  });

  it("Tag follows disabled and dismissible signals mutated after mount", async () => {
    const disabled = signal(false);
    const dismissible = signal(false);
    const { container } = render(<Tag disabled={disabled} dismissible={dismissible}>T</Tag>);
    expect(container.querySelector(".st-tag__dismiss")).toBeNull();
    dismissible.value = true;
    await waitFor(() => expect(container.querySelector(".st-tag__dismiss")).not.toBeNull());
    disabled.value = true;
    await waitFor(() =>
      expect(container.querySelector(".st-tag__dismiss")?.getAttribute("disabled")).not.toBeNull(),
    );
  });

  it("SelectionChip follows a disabled signal mutated after mount", async () => {
    const disabled = signal(false);
    const { container } = render(<SelectionChip label="L" onClear={() => {}} disabled={disabled} />);
    const button = () => container.querySelector(".st-selectionChip__clear") as HTMLButtonElement;
    expect(button().disabled).toBe(false);
    disabled.value = true;
    await waitFor(() => expect(button().disabled).toBe(true));
  });

  it("StructuredList follows a bordered signal mutated after mount", async () => {
    const bordered = signal(false);
    const { container } = render(<StructuredList items={[{ term: "T", description: "D" }]} bordered={bordered} />);
    expect(container.querySelector("dl")?.className).not.toContain("st-structuredList--bordered");
    bordered.value = true;
    await waitFor(() =>
      expect(container.querySelector("dl")?.className).toContain("st-structuredList--bordered"),
    );
  });

  it("RoseChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <RoseChart data={[{ label: "A", value: 2 }]} label="L" onClick={onClick} />,
    );
    const host = container.querySelector(".st-roseChart")!;
    fireEvent.click(host);
    expect(onClick).toHaveBeenCalledTimes(1);
    const sector = container.querySelector("[data-chart-index]");
    expect(sector).not.toBeNull();
    fireEvent.pointerMove(sector!);
    expect(container.querySelector(".st-roseChart__tooltip")).not.toBeNull();
  });

  it("ScatterPlot keeps a consumer onClick on the host and emits hover keys", () => {
    const onClick = vi.fn();
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <ScatterPlot data={[{ x: 1, y: 2, label: "A" }]} label="L" onClick={onClick} onHoverKeyChange={onHoverKeyChange} />,
    );
    const point = container.querySelector("[data-chart-index]");
    expect(point).not.toBeNull();
    fireEvent.pointerMove(point!);
    expect(onHoverKeyChange).toHaveBeenCalledWith("A");
    fireEvent.click(point!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("StackedBarChart legend toggle reaches the consumer without dropping the hover tooltip", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(
      <StackedBarChart
        data={[{ label: "Q1", segments: [{ label: "A", value: 2 }] }]}
        label="L"
        onToggleSeries={onToggleSeries}
      />,
    );
    fireEvent.click(container.querySelector(".st-stackedBar__legendButton")!);
    expect(onToggleSeries).toHaveBeenCalledTimes(1);
    expect(onToggleSeries).toHaveBeenCalledWith("A");
    const seg = container.querySelector("[data-bar-index]");
    expect(seg).not.toBeNull();
    fireEvent.pointerMove(seg!);
    expect(container.querySelector(".st-stackedBar__tooltip")).not.toBeNull();
  });

  it("SelectionChip clear reaches the consumer exactly once", () => {
    const onClear = vi.fn();
    const { container } = render(<SelectionChip label="Région" onClear={onClear} />);
    fireEvent.click(container.querySelector(".st-selectionChip__clear")!);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("Tag dismiss composes with the consumer onClick on the host", () => {
    const onDismiss = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Tag dismissible onDismiss={onDismiss} onClick={onClick}>T</Tag>,
    );
    fireEvent.click(container.querySelector(".st-tag__dismiss")!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // The dismiss click bubbles to the host span, which also runs the
    // consumer onClick from the rest props: neither handler overwrote the other.
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
