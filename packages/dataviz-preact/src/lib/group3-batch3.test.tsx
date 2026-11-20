import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { DependencyWheelChart } from "./DependencyWheelChart.js";
import { DonutChart } from "./DonutChart.js";
import { DrillBarChart } from "./DrillBarChart.js";
import { DrillBreadcrumb } from "./DrillBreadcrumb.js";
import { TreemapChart } from "./TreemapChart.js";

afterEach(cleanup);

describe("P6 group 3 batch 3 (Preact leg + MaybeSignal mutations)", () => {
  it("DependencyWheelChart, DonutChart and TreemapChart follow post-mount signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "source", label: "Source", type: "discrete" },
        { id: "target", label: "Target", type: "discrete" },
        { id: "region", label: "Region", type: "discrete" },
        { id: "city", label: "City", type: "discrete" },
      ],
      measures: [{ id: "sales", label: "Sales", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { source: "Web", target: "API", region: "Nord", city: "Lille", sales: 120 },
      { source: "API", target: "DB", region: "Sud", city: "Nice", sales: 80 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const wheelCls = signal("wheel-a");
    const donutCls = signal("donut-a");
    const treeCls = signal("treemap-a");
    const showLabels = signal(true);
    const legend = signal(true);

    const { container } = render(
      <>
        <DependencyWheelChart store={store} viewId="wheel" source="source" target="target" weight="sales" label="Deps" className={wheelCls} />
        <DonutChart store={store} viewId="donut" category="region" measure="sales" label="Donut" className={donutCls} />
        <TreemapChart
          store={store}
          viewId="tree"
          hierarchy={["region", "city"]}
          measure="sales"
          showLabels={showLabels}
          legend={legend}
          label="Treemap"
          className={treeCls}
        />
      </>,
    );

    expect(screen.getByRole("img", { name: "Deps" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Donut" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Treemap" })).toBeTruthy();
    expect(container.querySelector(".wheel-a")).toBeTruthy();
    expect(container.querySelector(".donut-a")).toBeTruthy();
    expect(container.querySelector(".treemap-a")).toBeTruthy();
    expect(container.querySelectorAll(".treemap-a .st-treemapChart__label").length).toBeGreaterThan(0);
    expect(container.querySelector(".treemap-a .st-treemapChart__legend")).toBeTruthy();

    const donutCenter = container.querySelector(".donut-a .st-donutChart__center");
    expect(donutCenter?.getAttribute("text-anchor")).toBe("middle");
    expect(donutCenter?.getAttribute("dominant-baseline")).toBe("central");
    expect(donutCenter?.getAttribute("textAnchor")).toBeNull();
    expect(donutCenter?.getAttribute("dominantBaseline")).toBeNull();

    wheelCls.value = "wheel-b";
    donutCls.value = "donut-b";
    treeCls.value = "treemap-b";
    showLabels.value = false;
    legend.value = false;

    await waitFor(() => {
      expect(container.querySelector(".wheel-b")).toBeTruthy();
      expect(container.querySelector(".donut-b")).toBeTruthy();
      expect(container.querySelector(".treemap-b")).toBeTruthy();
      expect(container.querySelectorAll(".treemap-b .st-treemapChart__label")).toHaveLength(0);
      expect(container.querySelector(".treemap-b .st-treemapChart__legend")).toBeNull();
    });
  });

  it("DrillBarChart and DrillBreadcrumb drill down, brush at leaf, go back, and follow post-mount className signals", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "region", label: "Région", type: "discrete" },
        { id: "city", label: "Ville", type: "discrete" },
      ],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { region: "Nord", city: "Lille", sales: 15 },
      { region: "Sud", city: "Nice", sales: 20 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const barCls = signal("drill-bar-a");
    const bcCls = signal("drill-bc-a");

    const { container } = render(
      <>
        <DrillBreadcrumb store={store} viewId="d" hierarchy={["region", "city"]} className={bcCls} />
        <DrillBarChart store={store} viewId="d" hierarchy={["region", "city"]} measure="sales" label="Ventes" className={barCls} />
      </>,
    );

    expect(container.querySelector(".drill-bar-a")).toBeTruthy();
    expect(container.querySelector(".drill-bc-a")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Remonter" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Nord:/ }));
    await waitFor(() => {
      expect(store.getState().drill.d).toEqual(["city"]);
      expect(screen.getByRole("button", { name: /^Lille:/ })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Remonter" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Lille:/ }));
    expect(store.getState().selections.d).toEqual(["Lille"]);

    fireEvent.click(screen.getByRole("button", { name: "Remonter" }));
    await waitFor(() => {
      expect(store.getState().drill.d ?? []).toEqual([]);
      expect(store.getState().filters.region).toBeUndefined();
    });

    barCls.value = "drill-bar-b";
    bcCls.value = "drill-bc-b";
    await waitFor(() => {
      expect(container.querySelector(".drill-bar-b")).toBeTruthy();
      expect(container.querySelector(".drill-bc-b")).toBeTruthy();
    });
  });
});
