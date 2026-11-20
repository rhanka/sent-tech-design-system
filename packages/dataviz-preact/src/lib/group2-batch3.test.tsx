import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DashboardBookmark, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArcDiagramChart } from "./ArcDiagramChart.js";
import { AreaRangeChart } from "./AreaRangeChart.js";
import { AreaSplineRangeChart } from "./AreaSplineRangeChart.js";
import { BellCurveChart } from "./BellCurveChart.js";
import { BookmarkNavigator } from "./BookmarkNavigator.js";

afterEach(cleanup);

describe("P6 group 2 batch 3 (Preact leg + MaybeSignal mutations)", () => {
  it("ArcDiagramChart, AreaRangeChart and AreaSplineRangeChart follow post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "src", label: "Src", type: "discrete" },
        { id: "dst", label: "Dst", type: "discrete" },
        { id: "day", label: "Day", type: "discrete" },
      ],
      measures: [
        { id: "weight", label: "Weight", aggregation: "sum" },
        { id: "lo", label: "Low", aggregation: "min" },
        { id: "hi", label: "High", aggregation: "max" },
      ],
    };
    const rows: Row[] = [
      { src: "A", dst: "B", day: "Mon", weight: 5, lo: 10, hi: 20 },
      { src: "B", dst: "C", day: "Tue", weight: 8, lo: 12, hi: 26 },
      { src: "A", dst: "C", day: "Wed", weight: 3, lo: 15, hi: 24 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const arcCls = signal("arc-a");
    const rangeCls = signal("range-a");
    const splineCls = signal("spline-a");

    const { container } = render(
      <>
        <ArcDiagramChart store={store} viewId="arc" source="src" target="dst" weight="weight" label="Arc" className={arcCls} />
        <AreaRangeChart store={store} viewId="range" x_field="day" low="lo" high="hi" label="Range" className={rangeCls} />
        <AreaSplineRangeChart store={store} viewId="spline" x_field="day" low="lo" high="hi" label="Spline" className={splineCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Arc" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Range" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Spline" })).toBeTruthy();
    expect(container.querySelector(".arc-a")).toBeTruthy();
    expect(container.querySelector(".range-a")).toBeTruthy();
    expect(container.querySelector(".spline-a")).toBeTruthy();

    const text = container.querySelector(".range-a svg text");
    expect(text?.getAttribute("text-anchor")).toBeTruthy();
    expect(text?.getAttribute("textAnchor")).toBeNull();

    arcCls.value = "arc-b";
    rangeCls.value = "range-b";
    splineCls.value = "spline-b";
    await waitFor(() => {
      expect(container.querySelector(".arc-b")).toBeTruthy();
      expect(container.querySelector(".range-b")).toBeTruthy();
      expect(container.querySelector(".spline-b")).toBeTruthy();
    });
  });

  it("BellCurveChart follows post-mount className and smooth signal mutations", async () => {
    const model: DataModel = {
      dimensions: [{ id: "id", label: "ID", type: "discrete" }],
      measures: [{ id: "val", label: "Val", aggregation: "avg" }],
    };
    const rows: Row[] = [
      { id: "1", val: 10 },
      { id: "2", val: 12 },
      { id: "3", val: 15 },
      { id: "4", val: 18 },
      { id: "5", val: 21 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const cls = signal("bell-a");
    const smooth = signal(false);

    const { container } = render(
      <BellCurveChart store={store} viewId="bell" measure="val" label="Bell" className={cls} smooth={smooth} />,
    );

    expect(screen.getByRole("img", { name: /^Bell/ })).toBeTruthy();
    expect(container.querySelector(".bell-a")).toBeTruthy();
    const linePath = () => container.querySelector(".st-bellCurveChart__line")?.getAttribute("d") ?? "";
    expect(linePath().length).toBeGreaterThan(0);
    expect(linePath()).not.toContain("C");

    cls.value = "bell-b";
    smooth.value = true;
    await waitFor(() => {
      expect(container.querySelector(".bell-b")).toBeTruthy();
      expect(linePath()).toContain("C");
    });
  });

  it("BookmarkNavigator reacts to post-mount className/selectedId/showPlaybackControls/autoPlay signals and invokes onBookmarkChange", async () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const store = createDashboardStore({ model, data: [] });
    const bookmarks: DashboardBookmark[] = [
      { id: "fr", label: "France", state: { filters: { country: { kind: "include", values: ["FR"] } } } },
      { id: "us", label: "Etats-Unis", state: { filters: { country: { kind: "include", values: ["US"] } } } },
    ];
    const cls = signal("bm-a");
    const selectedId = signal("fr");
    const showPlaybackControls = signal(true);
    const autoPlay = signal(false);
    const onBookmarkChange = vi.fn();

    const { container } = render(
      <BookmarkNavigator
        store={store}
        bookmarks={bookmarks}
        selectedId={selectedId}
        showPlaybackControls={showPlaybackControls}
        autoPlay={autoPlay}
        onBookmarkChange={onBookmarkChange}
        className={cls}
      />,
    );

    expect(container.querySelector("[role='group']")?.className).toContain("bm-a");
    expect(screen.getByRole("button", { name: "France" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Lecture" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Etats-Unis" }));
    expect(onBookmarkChange).toHaveBeenCalledWith(bookmarks[1]);
    expect(store.getState().filters.country).toEqual({ kind: "include", values: ["US"] });

    cls.value = "bm-b";
    selectedId.value = "us";
    autoPlay.value = true;
    await waitFor(() => {
      expect(container.querySelector("[role='group']")?.className).toContain("bm-b");
      expect(screen.getByRole("button", { name: "Etats-Unis" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    });

    showPlaybackControls.value = false;
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Lecture" })).toBeNull();
    });
  });
});
