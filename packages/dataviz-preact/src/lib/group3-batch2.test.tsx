import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DashboardLayout, type DataModel, type Row, type TimeRange } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardFilterBar, type ActiveFilter } from "./DashboardFilterBar.js";
import { DashboardGrid } from "./DashboardGrid.js";
import { DateRangeFilter, dateRangeToSpec } from "./DateRangeFilter.js";
import { DecompositionTreeChart } from "./DecompositionTreeChart.js";
import { Density2DChart } from "./Density2DChart.js";

afterEach(cleanup);

describe("P6 group 3 batch 2 (Preact leg + MaybeSignal mutations)", () => {
  it("DashboardFilterBar follows post-mount className/chips/activeFilters/timeRange signals and invokes handlers", async () => {
    const cls = signal("fbar-a");
    const chips = signal(false);
    const activeFilters = signal<ActiveFilter[]>([
      { field: "severity", operator: "eq", value: "error", label: "Sévérité" },
    ]);
    const timeRange = signal<TimeRange | null>(null);
    const onQueryChange = vi.fn();
    const onFiltersChange = vi.fn();
    const onExport = vi.fn();
    const exportConfig = { label: "Exporter CSV", fields: ["time"], filenameTemplate: "out.csv" };

    const { container } = render(
      <DashboardFilterBar
        controls={[
          { kind: "query-search", label: "Recherche", fields: ["source"] },
          { kind: "date-range", label: "Période" },
        ]}
        chips={chips}
        activeFilters={activeFilters}
        timeRange={timeRange}
        export={exportConfig}
        onQueryChange={onQueryChange}
        onFiltersChange={onFiltersChange}
        onExport={onExport}
        className={cls}
      />,
    );

    expect(container.querySelector(".st-dashboardFilterBar")?.className).toContain("fbar-a");
    expect(screen.queryByText("Sévérité")).toBeNull();

    fireEvent.input(screen.getByRole("searchbox"), { target: { value: "warn" } });
    expect(onQueryChange).toHaveBeenCalledWith("warn");

    fireEvent.click(screen.getByRole("button", { name: "Exporter CSV" }));
    expect(onExport).toHaveBeenCalledWith(exportConfig);

    cls.value = "fbar-b";
    chips.value = true;
    timeRange.value = { from: "2024-01-01T00:00:00.000Z", to: "2024-01-10T00:00:00.000Z" };
    await waitFor(() => {
      expect(container.querySelector(".st-dashboardFilterBar")?.className).toContain("fbar-b");
      expect(screen.getByText("Sévérité")).toBeTruthy();
      expect(screen.getByText("error")).toBeTruthy();
      const dateInput = container.querySelector<HTMLInputElement>(".st-datepicker__control");
      expect(dateInput?.value).toContain("2024");
    });

    activeFilters.value = [{ field: "region", operator: "eq", value: "EU", label: "Région" }];
    await waitFor(() => {
      expect(screen.getByText("Région")).toBeTruthy();
      expect(screen.getByText("EU")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retirer le filtre Région" }));
    expect(onFiltersChange).toHaveBeenCalledWith([]);
  });

  it("DashboardGrid follows post-mount layout/editable/className signals and emits normalized layout edits", async () => {
    const initialLayout: DashboardLayout = {
      columns: 12,
      panels: [
        { id: "kpis", x: 0, y: 0, w: 12, h: 1 },
        { id: "trend", x: 0, y: 1, w: 8, h: 3 },
      ],
    };
    const nextLayout: DashboardLayout = {
      columns: 12,
      panels: [
        { id: "kpis", x: 0, y: 0, w: 6, h: 1 },
      ],
    };
    const panels = [
      { id: "kpis", title: "Revenue cards", description: "KPI row" },
      { id: "trend", title: "Revenue trend" },
    ];
    const layoutSig = signal<DashboardLayout>(initialLayout);
    const editableSig = signal(false);
    const clsSig = signal("grid-a");
    const onLayoutChange = vi.fn();

    const { container } = render(
      <DashboardGrid
        layout={layoutSig}
        panels={panels}
        editable={editableSig}
        onLayoutChange={onLayoutChange}
        className={clsSig}
      />,
    );

    expect(container.querySelector(".grid-a")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Move Revenue trend right" })).toBeNull();

    editableSig.value = true;
    clsSig.value = "grid-b";
    await waitFor(() => {
      expect(container.querySelector(".grid-b")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Move Revenue trend right" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Move Revenue trend right" }));
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: "kpis", x: 0, y: 0, w: 12, h: 1 },
        { id: "trend", x: 1, y: 1, w: 8, h: 3 },
      ],
    });

    layoutSig.value = nextLayout;
    await waitFor(() => {
      expect(screen.queryByRole("listitem", { name: "Revenue trend" })).toBeNull();
      expect(screen.getByRole("listitem", { name: "Revenue cards" }).getAttribute("style")).toContain("grid-column: 1 / span 6");
    });
  });

  it("DateRangeFilter, DecompositionTreeChart and Density2DChart follow post-mount className signals with normalised SVG", async () => {
    expect(dateRangeToSpec({ start: null, end: null })).toBeNull();
    const d1 = new Date("2020-01-01T00:00:00Z");
    const d2 = new Date("2020-12-31T00:00:00Z");
    expect(dateRangeToSpec({ start: d1, end: d2 })).toEqual({
      kind: "range",
      min: d1.getTime(),
      max: d2.getTime(),
    });

    const model: DataModel = {
      dimensions: [
        { id: "date", label: "Date", type: "continuous" },
        { id: "region", label: "Region", type: "discrete" },
        { id: "city", label: "City", type: "discrete" },
      ],
      measures: [
        { id: "sales", label: "Sales", aggregation: "sum" },
        { id: "x", label: "X", aggregation: "avg" },
        { id: "y", label: "Y", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { date: d1.getTime(), region: "EU", city: "Paris", sales: 120, x: 1, y: 2 },
      { date: d2.getTime(), region: "EU", city: "Lyon", sales: 80, x: 3, y: 4 },
      { date: d2.getTime(), region: "US", city: "NYC", sales: 200, x: 5, y: 6 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const drCls = signal("dr-a");
    const treeCls = signal("tree-a");
    const densCls = signal("dens-a");

    const { container } = render(
      <>
        <DateRangeFilter store={store} dimension="date" label="Période" className={drCls} />
        <DecompositionTreeChart store={store} viewId="dec" measure="sales" levels={["region", "city"]} label="Decomp" className={treeCls} />
        <Density2DChart store={store} viewId="den" x="x" y="y" bins={4} label="Density" className={densCls} />
      </>,
    );

    expect(container.querySelector(".dr-a")).toBeTruthy();
    expect(container.querySelector(".tree-a")).toBeTruthy();
    expect(container.querySelector(".dens-a")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Decomp" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Density" })).toBeTruthy();

    const treeText = container.querySelector(".tree-a svg text");
    if (treeText) {
      expect(treeText.getAttribute("textAnchor")).toBeNull();
      expect(treeText.getAttribute("dominantBaseline")).toBeNull();
    }

    drCls.value = "dr-b";
    treeCls.value = "tree-b";
    densCls.value = "dens-b";
    await waitFor(() => {
      expect(container.querySelector(".dr-b")).toBeTruthy();
      expect(container.querySelector(".tree-b")).toBeTruthy();
      expect(container.querySelector(".dens-b")).toBeTruthy();
    });
  });
});
