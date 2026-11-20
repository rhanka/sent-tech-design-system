import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaChart } from "./AreaChart.js";
import { ComboChart } from "./ComboChart.js";
import { LollipopChart } from "./LollipopChart.js";
import { StackedBarChart } from "./StackedBarChart.js";
import { StepLineChart } from "./StepLineChart.js";

afterEach(cleanup);

const model: DataModel = {
  dimensions: [
    { id: "quarter", label: "Trimestre", type: "discrete" },
    { id: "channel", label: "Canal", type: "discrete" },
  ],
  measures: [
    { id: "sales", label: "Ventes", aggregation: "sum" },
    { id: "margin", label: "Marge", aggregation: "sum" },
  ],
};

const data: Row[] = [
  { quarter: "Q1", channel: "Direct", sales: 10, margin: 2 },
  { quarter: "Q1", channel: "Partner", sales: 5, margin: 1 },
  { quarter: "Q2", channel: "Direct", sales: 20, margin: 3 },
  { quarter: "Q2", channel: "Partner", sales: 15, margin: 2 },
  { quarter: "Q3", channel: "Direct", sales: 8, margin: 4 },
];

const newStore = () => createDashboardStore({ model, data });

describe("P6 batch 2 categorical charts (Preact leg + MaybeSignal mutations)", () => {
  it("AreaChart reacts to crossfilter updates and post-mount className/smooth/hoverKey signal mutations", async () => {
    const store = newStore();
    const cls = signal("area-a");
    const smooth = signal(false);
    const hoverKey = signal<string | null>(null);
    const onHoverKeyChange = vi.fn();

    const { container } = render(
      <AreaChart
        store={store}
        viewId="area"
        category="quarter"
        measure="sales"
        label="Area ventes"
        className={cls}
        smooth={smooth}
        hoverKey={hoverKey}
        onHoverKeyChange={onHoverKeyChange}
      />,
    );

    expect(screen.getByRole("img", { name: "Area ventes" })).toBeTruthy();
    expect(container.querySelector(".st-areaChart")?.className).toContain("area-a");
    expect(container.querySelectorAll(".st-areaChart__dot")).toHaveLength(3);
    const linePath = () => container.querySelector(".st-areaChart__line")?.getAttribute("d") ?? "";
    expect(linePath()).not.toContain("C");
    expect(container.querySelector(".st-areaChart__tooltip")).toBeNull();

    // Post-mount signal mutations assert concrete DOM changes.
    cls.value = "area-b";
    smooth.value = true;
    hoverKey.value = "Q2";
    await waitFor(() => {
      expect(container.querySelector(".st-areaChart")?.className).toContain("area-b");
      expect(linePath()).toContain("C");
      expect(container.querySelector(".st-areaChart__tooltip")?.textContent).toContain("35");
    });

    // Crossfilter reactivity.
    store.setFilter("quarter", { kind: "include", values: ["Q1"] });
    await waitFor(() => expect(container.querySelectorAll(".st-areaChart__dot")).toHaveLength(1));
  });

  it("ComboChart reacts to post-mount className/legend/hiddenSeries/hoverKey signals and preserves onToggleSeries", async () => {
    const store = newStore();
    const cls = signal("combo-a");
    const legend = signal(true);
    const hidden = signal<string[]>([]);
    const hoverKey = signal<string | null>(null);
    const onToggleSeries = vi.fn();

    const { container } = render(
      <ComboChart
        store={store}
        viewId="combo"
        category="quarter"
        measures={["sales", { id: "margin", mark: "line", axis: "right" }]}
        label="Combo ventes"
        className={cls}
        legend={legend}
        hiddenSeries={hidden}
        hoverKey={hoverKey}
        onToggleSeries={onToggleSeries}
      />,
    );

    expect(container.querySelector(".st-comboChart")?.className).toContain("combo-a");
    expect(container.querySelector(".st-comboChart__legend")).toBeTruthy();
    expect(container.querySelectorAll(".st-comboChart__bar")).toHaveLength(3);
    expect(container.querySelectorAll(".st-comboChart__dot")).toHaveLength(3);
    expect(container.querySelector(".st-comboChart__crosshair")).toBeNull();

    const legendBtn = container.querySelector(".st-comboChart__legend button") as HTMLButtonElement;
    expect(legendBtn).toBeTruthy();
    fireEvent.click(legendBtn);
    expect(onToggleSeries).toHaveBeenCalledTimes(1);

    cls.value = "combo-b";
    hidden.value = ["Ventes"];
    hoverKey.value = "Q1";
    await waitFor(() => {
      expect(container.querySelector(".st-comboChart")?.className).toContain("combo-b");
      expect(container.querySelectorAll(".st-comboChart__bar")).toHaveLength(0);
      expect(container.querySelector(".st-comboChart__crosshair")).toBeTruthy();
    });

    legend.value = false;
    await waitFor(() => expect(container.querySelector(".st-comboChart__legend")).toBeNull());
  });

  it("StackedBarChart reacts to post-mount className/showLegend/hiddenSeries signals and preserves onToggleSeries", async () => {
    const store = newStore();
    const cls = signal("stack-a");
    const showLegend = signal(true);
    const hidden = signal<string[]>([]);
    const onToggleSeries = vi.fn();

    const { container } = render(
      <StackedBarChart
        store={store}
        viewId="stacked"
        category="quarter"
        series="channel"
        measure="sales"
        label="Ventes empilees"
        className={cls}
        showLegend={showLegend}
        hiddenSeries={hidden}
        onToggleSeries={onToggleSeries}
      />,
    );

    expect(container.querySelector(".st-stackedBar")?.className).toContain("stack-a");
    expect(container.querySelector(".st-stackedBar__legend")).toBeTruthy();
    expect(container.querySelectorAll(".st-stackedBar__seg")).toHaveLength(6);

    const legendBtn = container.querySelector(".st-stackedBar__legend button") as HTMLButtonElement;
    expect(legendBtn).toBeTruthy();
    fireEvent.click(legendBtn);
    expect(onToggleSeries).toHaveBeenCalledTimes(1);

    cls.value = "stack-b";
    hidden.value = ["Direct"];
    await waitFor(() => {
      expect(container.querySelector(".st-stackedBar")?.className).toContain("stack-b");
      expect(container.querySelectorAll(".st-stackedBar__seg")).toHaveLength(3);
    });

    showLegend.value = false;
    await waitFor(() => expect(container.querySelector(".st-stackedBar__legend")).toBeNull());
  });

  it("LollipopChart and StepLineChart react to post-mount className signals and crossfilter updates with kebab SVG attrs", async () => {
    const store = newStore();
    const lollipopCls = signal("lol-a");
    const stepCls = signal("step-a");

    const { container } = render(
      <>
        <LollipopChart
          store={store}
          viewId="lollipop"
          category="quarter"
          measure="sales"
          label="Lollipop ventes"
          className={lollipopCls}
        />
        <StepLineChart
          store={store}
          viewId="step"
          category="quarter"
          measure="sales"
          label="Step ventes"
          className={stepCls}
        />
      </>,
    );

    expect(container.querySelector(".st-lollipopChart")?.className).toContain("lol-a");
    expect(container.querySelector(".st-stepLineChart")?.className).toContain("step-a");
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(3);
    expect(container.querySelectorAll(".st-stepLineChart__dot")).toHaveLength(3);

    // SVG presentation attributes are normalised to kebab-case on Preact core.
    const tick = container.querySelector(".st-lollipopChart svg text");
    expect(tick?.getAttribute("text-anchor")).toBeTruthy();
    expect(tick?.getAttribute("textAnchor")).toBeNull();

    lollipopCls.value = "lol-b";
    stepCls.value = "step-b";
    await waitFor(() => {
      expect(container.querySelector(".st-lollipopChart")?.className).toContain("lol-b");
      expect(container.querySelector(".st-stepLineChart")?.className).toContain("step-b");
    });

    store.setFilter("quarter", { kind: "include", values: ["Q1"] });
    await waitFor(() => {
      expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(1);
      expect(container.querySelectorAll(".st-stepLineChart__dot")).toHaveLength(1);
    });
  });
});
