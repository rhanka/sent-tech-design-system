import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import {
  createDashboardStore,
  type CalculatedFieldConfig,
  type CalculationVariable,
  type DataModel,
  type Row,
} from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoxPlotChart } from "./BoxPlotChart.js";
import { BulletChart } from "./BulletChart.js";
import { BumpChart } from "./BumpChart.js";
import { CalculationEditor } from "./CalculationEditor.js";
import { CalendarHeatmapChart } from "./CalendarHeatmapChart.js";

afterEach(cleanup);

describe("P6 group 2 batch 4 (Preact leg + MaybeSignal mutations)", () => {
  it("BoxPlotChart, BulletChart, BumpChart and CalendarHeatmapChart follow post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "segment", label: "Segment", type: "discrete" },
        { id: "day", label: "Day", type: "discrete" },
        { id: "date", label: "Date", type: "discrete" },
      ],
      measures: [
        { id: "revenue", label: "Revenue", aggregation: "sum" },
        { id: "target", label: "Target", aggregation: "max" },
      ],
    };
    const rows: Row[] = [
      { segment: "Enterprise", day: "Mon", date: "2026-01-01", revenue: 10, target: 30 },
      { segment: "Enterprise", day: "Tue", date: "2026-01-02", revenue: 25, target: 30 },
      { segment: "SMB", day: "Mon", date: "2026-01-01", revenue: 15, target: 20 },
      { segment: "SMB", day: "Tue", date: "2026-01-03", revenue: 12, target: 20 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const boxCls = signal("box-a");
    const bulletCls = signal("bullet-a");
    const bumpCls = signal("bump-a");
    const calCls = signal("cal-a");

    const { container } = render(
      <>
        <BoxPlotChart store={store} viewId="box" value="revenue" group="segment" label="Box" className={boxCls} />
        <BulletChart
          store={store}
          viewId="bullet"
          value="revenue"
          target="target"
          category="segment"
          ranges={[10, 25, 40]}
          label="Bullet"
          className={bulletCls}
        />
        <BumpChart store={store} viewId="bump" series="segment" category="day" measure="revenue" label="Bump" className={bumpCls} />
        <CalendarHeatmapChart store={store} viewId="cal" date="date" measure="revenue" label="Calendar" className={calCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Box" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Bullet" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Bump" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Calendar" })).toBeTruthy();
    expect(container.querySelector(".box-a")).toBeTruthy();
    expect(container.querySelector(".bullet-a")).toBeTruthy();
    expect(container.querySelector(".bump-a")).toBeTruthy();
    expect(container.querySelector(".cal-a")).toBeTruthy();
    expect(container.querySelectorAll(".st-boxPlotChart__box")).toHaveLength(2);
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(2);
    expect(container.querySelectorAll(".st-calendarHeatmapChart__cell").length).toBeGreaterThanOrEqual(3);

    const text = container.querySelector(".box-a svg text");
    expect(text?.getAttribute("text-anchor")).toBeTruthy();
    expect(text?.getAttribute("textAnchor")).toBeNull();

    boxCls.value = "box-b";
    bulletCls.value = "bullet-b";
    bumpCls.value = "bump-b";
    calCls.value = "cal-b";
    await waitFor(() => {
      expect(container.querySelector(".box-b")).toBeTruthy();
      expect(container.querySelector(".bullet-b")).toBeTruthy();
      expect(container.querySelector(".bump-b")).toBeTruthy();
      expect(container.querySelector(".cal-b")).toBeTruthy();
    });
  });

  it("CalculationEditor reacts to post-mount value and className signals and emits updates on input/select/suggestion clicks", async () => {
    const model: DataModel = {
      dimensions: [{ id: "segment", label: "Segment", type: "discrete" }],
      measures: [
        { id: "revenue", label: "Revenue", aggregation: "sum" },
        { id: "cost", label: "Cost", aggregation: "sum" },
      ],
    };
    const variables: CalculationVariable[] = [{ id: "discount", label: "Discount", value: 0.15 }];
    const value = signal<CalculatedFieldConfig>({
      id: "margin",
      label: "Margin",
      kind: "measure",
      expression: "[revenue] - [cost]",
      aggregation: "sum",
    });
    const cls = signal("calc-a");
    const onChange = vi.fn();

    const { container } = render(
      <CalculationEditor model={model} variables={variables} value={value} onChange={onChange} label="Calcul" className={cls} />,
    );

    expect(container.querySelector("[role='group']")?.className).toContain("calc-a");
    expect((screen.getByLabelText("Nom du calcul") as HTMLInputElement).value).toBe("Margin");
    expect(screen.getByLabelText("Agregation")).toBeTruthy();

    fireEvent.input(screen.getByLabelText("Nom du calcul"), { target: { value: "Net Margin" } });
    expect(onChange.mock.lastCall?.[0].label).toBe("Net Margin");

    fireEvent.input(screen.getByLabelText("Formule"), { target: { value: "[revenue] * 2" } });
    expect(onChange.mock.lastCall?.[0].expression).toBe("[revenue] * 2");

    fireEvent.click(screen.getByRole("button", { name: "Revenue" }));
    expect(onChange.mock.lastCall?.[0].expression).toBe("[revenue] - [cost] [revenue]");

    // Post-mount signal mutations update DOM (including hiding aggregation when kind becomes 'dimension').
    cls.value = "calc-b";
    value.value = {
      id: "tier",
      label: "Tier",
      kind: "dimension",
      expression: "IF([revenue] > 100, 'High', 'Low')",
    };
    await waitFor(() => {
      expect(container.querySelector("[role='group']")?.className).toContain("calc-b");
      expect((screen.getByLabelText("Nom du calcul") as HTMLInputElement).value).toBe("Tier");
      expect((screen.getByLabelText("Formule") as HTMLTextAreaElement).value).toBe("IF([revenue] > 100, 'High', 'Low')");
      expect(screen.queryByLabelText("Agregation")).toBeNull();
    });
  });
});
