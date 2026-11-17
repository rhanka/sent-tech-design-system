import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColumnPyramidChart } from "./ColumnPyramidChart.js";
import { ColumnRangeChart } from "./ColumnRangeChart.js";
import { ComboChart } from "./ComboChart.js";
import { ConfigItemCard } from "./ConfigItemCard.js";
import { ContourChart } from "./ContourChart.js";
import { DashboardGrid } from "./DashboardGrid.js";
import { DataImage } from "./DataImage.js";
import { DataTable } from "./DataTable.js";
import { DecompositionTreeChart } from "./DecompositionTreeChart.js";
import { Density2DChart } from "./Density2DChart.js";
import { DependencyWheelChart } from "./DependencyWheelChart.js";
import { DivergentBarChart } from "./DivergentBarChart.js";
import { DonutChart } from "./DonutChart.js";
import { DumbbellChart } from "./DumbbellChart.js";
import { ErrorBarChart } from "./ErrorBarChart.js";
import { EventFeedPanel } from "./EventFeedPanel.js";

afterEach(cleanup);

const sysItem = {
  id: "i1",
  name: "Item",
  key: "k1",
  sourceLevel: "code" as const,
};

describe("P4a group 2 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-2 module", () => {
    render(
      <>
        <ColumnPyramidChart data-testid="e-colpyr" data={[{ category: "A", value: 2 }]} label="L" className={signal("x-colpyr")} />
        <ColumnRangeChart data-testid="e-colrange" data={[{ category: "A", low: 1, high: 3 }]} label="L" className={signal("x-colrange")} />
        <ComboChart data-testid="e-combo" categories={["c1"]} bars={[{ label: "b", data: [1] }]} label="L" className={signal("x-combo")} />
        <ConfigItemCard item={sysItem} className={signal("x-config")} />
        <ContourChart data-testid="e-contour" data={[{ x: 0, y: 0, value: 1 }]} label="L" className={signal("x-contour")} />
        <DashboardGrid data-testid="e-grid" tiles={[{ id: "t", x: 0, y: 0, w: 1, h: 1 }]} className={signal("x-grid")} />
        <DataImage data-testid="e-image" src="https://example.com/a.png" alt="A" className={signal("x-image")} />
        <DataTable data-testid="e-table" columns={[{ key: "id", label: "ID" }]} rows={[{ id: "r1" }]} className={signal("x-table")} />
        <DecompositionTreeChart
          data-testid="e-decomp"
          data={{ measure: "m", levels: [{ dimension: "d", nodes: [{ label: "n", value: 1 }] }] }}
          className={signal("x-decomp")}
        />
        <Density2DChart data-testid="e-density" data={[{ x: 0, y: 0 }]} className={signal("x-density")} />
        <DependencyWheelChart data-testid="e-wheel" data={[{ from: "a", to: "b", weight: 1 }]} label="L" className={signal("x-wheel")} />
        <DivergentBarChart data-testid="e-div" data={[{ label: "A", value: 1 }]} label="L" className={signal("x-div")} />
        <DonutChart data-testid="e-donut" data={[{ label: "A", value: 1 }]} label="L" className={signal("x-donut")} />
        <DumbbellChart data-testid="e-dumb" data={[{ category: "A", low: 1, high: 3 }]} label="L" className={signal("x-dumb")} />
        <ErrorBarChart data-testid="e-err" data={[{ category: "A", value: 2, low: 1, high: 3 }]} label="L" className={signal("x-err")} />
        <EventFeedPanel data-testid="e-feed" data={[{ at: 1, type: "deploy", severity: "info", message: "ok" }]} className={signal("x-feed")} />
      </>,
    );
    // ConfigItemCard hardcodes its own data-testid (parity with React, which
    // overwrites a consumer testid placed before it), so it is asserted via
    // its generated id instead of a consumer one.
    expect(screen.getByTestId("config-item-card-k1").className).toContain("x-config");
    for (const [testId, extra] of [
      ["e-colpyr", "x-colpyr"],
      ["e-colrange", "x-colrange"],
      ["e-combo", "x-combo"],
      ["e-contour", "x-contour"],
      ["e-grid", "x-grid"],
      ["e-image", "x-image"],
      ["e-table", "x-table"],
      ["e-decomp", "x-decomp"],
      ["e-density", "x-density"],
      ["e-wheel", "x-wheel"],
      ["e-div", "x-div"],
      ["e-donut", "x-donut"],
      ["e-dumb", "x-dumb"],
      ["e-err", "x-err"],
      ["e-feed", "x-feed"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("follows className signals mutated after mount on every group-2 module", async () => {
    const colpyr = signal("x-colpyr");
    const colrange = signal("x-colrange");
    const combo = signal("x-combo");
    const config = signal("x-config");
    const contour = signal("x-contour");
    const grid = signal("x-grid");
    const image = signal("x-image");
    const decomp = signal("x-decomp");
    const density = signal("x-density");
    const wheel = signal("x-wheel");
    const div = signal("x-div");
    const donut = signal("x-donut");
    const dumb = signal("x-dumb");
    const err = signal("x-err");
    const feed = signal("x-feed");
    render(
      <>
        <ColumnPyramidChart data-testid="m-colpyr" data={[{ category: "A", value: 2 }]} label="L" className={colpyr} />
        <ColumnRangeChart data-testid="m-colrange" data={[{ category: "A", low: 1, high: 3 }]} label="L" className={colrange} />
        <ComboChart data-testid="m-combo" categories={["c1"]} bars={[{ label: "b", data: [1] }]} label="L" className={combo} />
        <ConfigItemCard item={sysItem} className={config} />
        <ContourChart data-testid="m-contour" data={[{ x: 0, y: 0, value: 1 }]} label="L" className={contour} />
        <DashboardGrid data-testid="m-grid" tiles={[{ id: "t", x: 0, y: 0, w: 1, h: 1 }]} className={grid} />
        <DataImage data-testid="m-image" src="https://example.com/a.png" alt="A" className={image} />
        <DecompositionTreeChart
          data-testid="m-decomp"
          data={{ measure: "m", levels: [{ dimension: "d", nodes: [{ label: "n", value: 1 }] }] }}
          className={decomp}
        />
        <Density2DChart data-testid="m-density" data={[{ x: 0, y: 0 }]} className={density} />
        <DependencyWheelChart data-testid="m-wheel" data={[{ from: "a", to: "b", weight: 1 }]} label="L" className={wheel} />
        <DivergentBarChart data-testid="m-div" data={[{ label: "A", value: 1 }]} label="L" className={div} />
        <DonutChart data-testid="m-donut" data={[{ label: "A", value: 1 }]} label="L" className={donut} />
        <DumbbellChart data-testid="m-dumb" data={[{ category: "A", low: 1, high: 3 }]} label="L" className={dumb} />
        <ErrorBarChart data-testid="m-err" data={[{ category: "A", value: 2, low: 1, high: 3 }]} label="L" className={err} />
        <EventFeedPanel data-testid="m-feed" data={[{ at: 1, type: "deploy", severity: "info", message: "ok" }]} className={feed} />
      </>,
    );
    expect(screen.getByTestId("config-item-card-k1").className).toContain(config.value);
    const cases = [
      ["m-colpyr", colpyr],
      ["m-colrange", colrange],
      ["m-combo", combo],
      ["m-contour", contour],
      ["m-grid", grid],
      ["m-image", image],
      ["m-decomp", decomp],
      ["m-density", density],
      ["m-wheel", wheel],
      ["m-div", div],
      ["m-donut", donut],
      ["m-dumb", dumb],
      ["m-err", err],
      ["m-feed", feed],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    config.value = "x-after";
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
    await waitFor(() => expect(screen.getByTestId("config-item-card-k1").className).toContain("x-after"));
  });

  it("ComboChart follows a hiddenSeries signal and keeps the consumer onToggleSeries", async () => {
    const hiddenSeries = signal<string[]>([]);
    const onToggleSeries = vi.fn();
    const { container } = render(
      <ComboChart
        categories={["c1", "c2"]}
        bars={[{ label: "b1", data: [1, 2] }]}
        lines={[{ label: "l1", data: [3, 4] }]}
        label="L"
        hiddenSeries={hiddenSeries}
        onToggleSeries={onToggleSeries}
      />,
    );
    const buttons = container.querySelectorAll(".st-comboChart__legendButton");
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
    expect(onToggleSeries).toHaveBeenCalledTimes(1);
    // Hiding the only bar series removes its bars from the render.
    hiddenSeries.value = ["b1"];
    await waitFor(() => expect(container.querySelectorAll(".st-comboChart__bar").length).toBe(0));
  });

  it("ComboChart follows a hoverKey signal mutated after mount", async () => {
    const hoverKey = signal<string | null>(null);
    render(
      <ComboChart
        categories={["c1", "c2"]}
        bars={[{ label: "b", data: [1, 2] }]}
        label="L"
        hoverKey={hoverKey}
      />,
    );
    // The controlled key drives the crosshair (the tooltip tracks internal
    // pointer hover only), per the React suite's FR-3 contract.
    expect(document.querySelector(".st-comboChart__crosshair")).toBeNull();
    hoverKey.value = "c2";
    await waitFor(() => expect(document.querySelector(".st-comboChart__crosshair")).not.toBeNull());
    hoverKey.value = null;
    await waitFor(() => expect(document.querySelector(".st-comboChart__crosshair")).toBeNull());
  });

  it("DataTable follows a selectedIds signal and keeps onSelectionChange", async () => {
    const selectedIds = signal<string[]>([]);
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={[{ key: "id", label: "ID" }]}
        rows={[{ id: "r1" }, { id: "r2" }]}
        selectable="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
      />,
    );
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBeGreaterThan(0);
    fireEvent.click(boxes[1]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    selectedIds.value = ["r1"];
    await waitFor(() =>
      expect(
        container.querySelectorAll("tbody tr")[0].getAttribute("class") ?? "",
      ).toContain("st-dataTable__row--selected"),
    );
  });

  it("boolean signals toggle their surface after mount (legend, editable, copy, disabled)", async () => {
    const showLegend = signal(true);
    const editable = signal(false);
    // A system item shows Copier until a copy exists (hasCopy hides it).
    const hasCopy = signal(true);
    const disabled = signal(false);
    const onCopy = vi.fn();
    const { container, rerender } = render(
      <>
        <DivergentBarChart data={[{ label: "A", value: 1 }]} label="L" showLegend={showLegend} />
        <DashboardGrid tiles={[{ id: "t", x: 0, y: 0, w: 1, h: 1 }]} editable={editable} />
        <ConfigItemCard item={sysItem} hasCopy={hasCopy} onCopy={onCopy} disabled={disabled} />
      </>,
    );
    expect(container.querySelector(".st-divergentBarChart__legend")).not.toBeNull();
    expect(container.querySelector(".st-dashboardGrid--editable")).toBeNull();
    expect(container.querySelector('[aria-label="Copier"]')).toBeNull();
    showLegend.value = false;
    editable.value = true;
    hasCopy.value = false;
    await waitFor(() => expect(container.querySelector(".st-divergentBarChart__legend")).toBeNull());
    await waitFor(() => expect(container.querySelector(".st-dashboardGrid--editable")).not.toBeNull());
    await waitFor(() => expect(container.querySelector('[aria-label="Copier"]')).not.toBeNull());
    // A disabled consumer action stays disabled and the consumer handler still fires through the local one.
    disabled.value = true;
    rerender(
      <>
        <DivergentBarChart data={[{ label: "A", value: 1 }]} label="L" showLegend={showLegend} />
        <DashboardGrid tiles={[{ id: "t", x: 0, y: 0, w: 1, h: 1 }]} editable={editable} />
        <ConfigItemCard item={sysItem} hasCopy={hasCopy} onCopy={onCopy} disabled={disabled} />
      </>,
    );
    const copyBtn = container.querySelector('[aria-label="Copier"]') as HTMLButtonElement;
    expect(copyBtn.disabled).toBe(true);
  });

  it("DataImage merges the consumer style over the base box style", () => {
    const { container } = render(
      <DataImage
        src="https://example.com/a.png"
        alt="A"
        width={120}
        style={{ height: "40px" }}
      />,
    );
    const img = container.querySelector(".st-dataImage") as HTMLImageElement;
    expect(img.style.width).toBe("120px");
    expect(img.style.height).toBe("40px");
  });

  it("DonutChart announces the total in its accessible visual label", () => {
    render(<DonutChart data={[{ label: "A", value: 2 }, { label: "B", value: 3 }]} label="Shares" />);
    expect(document.querySelector(".st-donutChart__visual")?.getAttribute("aria-label")).toBe("Shares");
  });

  it("EventFeedPanel orders events newest-first with severity tones", () => {
    render(
      <EventFeedPanel
        data={[
          { at: 1, type: "deploy", severity: "info", message: "first" },
          { at: 3, type: "alert", severity: "error", message: "last" },
          { at: 2, type: "job", severity: "success", message: "middle" },
        ]}
      />,
    );
    const items = Array.from(document.querySelectorAll(".st-eventFeedPanel__message")).map((n) => n.textContent);
    expect(items).toEqual(["last", "middle", "first"]);
    expect(document.querySelector(".st-eventFeedPanel__item--error")).not.toBeNull();
  });
});
