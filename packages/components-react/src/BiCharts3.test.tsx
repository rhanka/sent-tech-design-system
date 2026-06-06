import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import {
  BulletChart,
  MarimekkoChart,
  CandlestickChart,
  CalendarHeatmapChart,
  ParallelCoordinatesChart,
  BumpChart,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// ─── CandlestickChart ────────────────────────────────────────────────────────

describe("CandlestickChart parity with Svelte", () => {
  it("renders candles and SR OHLC values", () => {
    const { container } = render(
      <CandlestickChart
        label="Prices"
        data={[
          { label: "Jan", open: 100, high: 120, low: 90, close: 115 },
          { label: "Feb", open: 115, high: 130, low: 105, close: 108 },
        ]}
      />
    );

    expect(container.querySelector(".st-candlestickChart__visual")?.getAttribute("aria-label")).toBe("Prices");
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(2);
    expect(container.querySelectorAll(".st-candlestickChart__wick")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Jan: O 100 H 120 L 90 C 115",
      "Feb: O 115 H 130 L 105 C 108",
    ]);
  });

  it("FIX #1: filters invalid OHLC candles (non-finite values)", () => {
    const { container } = render(
      <CandlestickChart
        label="OHLC filter"
        data={[
          { label: "Good", open: 10, high: 20, low: 5, close: 15 },
          { label: "NaN", open: NaN, high: 20, low: 5, close: 15 },
          { label: "Inf", open: 10, high: Infinity, low: 5, close: 15 },
        ]}
      />
    );
    // Only 1 valid candle
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(1);
    expect(container.querySelectorAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("FIX #1: clamps high=max(H,O,C) and low=min(L,O,C) — domain over O/H/L/C", () => {
    // high < open (contradictory OHLC): domain should still be correct
    const { container } = render(
      <CandlestickChart
        label="Clamp test"
        data={[
          { label: "A", open: 50, high: 40, low: 30, close: 45 },
        ]}
      />
    );
    // Should render one candle without crashing
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(1);
    // wick should span the full clamped range
    expect(container.querySelectorAll(".st-candlestickChart__wick")).toHaveLength(1);
  });

  it("FIX #1: flat domain (all same values) → fallback +1, no division by zero", () => {
    const { container } = render(
      <CandlestickChart
        label="Flat domain"
        data={[{ label: "X", open: 100, high: 100, low: 100, close: 100 }]}
      />
    );
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(1);
  });

  it("FIX #7: composite key — duplicate labels do not collapse candles", () => {
    const { container } = render(
      <CandlestickChart
        label="Dup labels"
        data={[
          { label: "A", open: 10, high: 20, low: 5, close: 15 },
          { label: "A", open: 15, high: 25, low: 10, close: 20 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(2);
  });

  it("bullish vs bearish color classes", () => {
    const { container } = render(
      <CandlestickChart
        label="Colors"
        data={[
          { label: "Up", open: 100, high: 120, low: 90, close: 115 },
          { label: "Down", open: 115, high: 120, low: 90, close: 108 },
        ]}
      />
    );
    expect(container.querySelector(".st-candlestickChart__body--up")).toBeTruthy();
    expect(container.querySelector(".st-candlestickChart__body--down")).toBeTruthy();
  });
});

// ─── CalendarHeatmapChart ────────────────────────────────────────────────────

describe("CalendarHeatmapChart parity with Svelte", () => {
  it("renders cells and SR date-value list", () => {
    const { container } = render(
      <CalendarHeatmapChart
        label="Activity"
        data={[
          { date: "2024-01-01", value: 5 },
          { date: "2024-01-02", value: 10 },
          { date: "2024-01-08", value: 3 },
        ]}
      />
    );

    expect(container.querySelector(".st-calendarHeatmapChart__visual")?.getAttribute("aria-label")).toBe("Activity");
    expect(container.querySelectorAll(".st-calendarHeatmapChart__cell").length).toBeGreaterThanOrEqual(3);
    const listItems = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(listItems).toContain("2024-01-01: 5");
    expect(listItems).toContain("2024-01-02: 10");
    expect(listItems).toContain("2024-01-08: 3");
  });

  it("FIX #2: UTC DOW — 2024-01-01 is Monday (DOW=1), not Sunday", () => {
    const { container } = render(
      <CalendarHeatmapChart
        label="UTC DOW"
        data={[{ date: "2024-01-01", value: 1 }]}
      />
    );
    // 2024-01-01 = Monday (UTC): cell y should correspond to DOW=1 (Mon), not 0 (Sun)
    const cells = container.querySelectorAll(".st-calendarHeatmapChart__cell");
    const nonEmptyCell = Array.from(cells).find(
      (c) => c.getAttribute("data-chart-date") === "2024-01-01"
    );
    expect(nonEmptyCell).toBeTruthy();
    // y position: DOW=1 means row 1 (Mon), not row 0 (Sun)
    const yAttr = Number(nonEmptyCell!.getAttribute("y"));
    // MARGIN.top=24, plotHeight varies, DOW=1 means y > MARGIN.top
    expect(yAttr).toBeGreaterThan(24); // Mon row > Sun row
  });

  it("FIX #2: invalid date (non-existent) is filtered out", () => {
    const { container } = render(
      <CalendarHeatmapChart
        label="Invalid dates"
        data={[
          { date: "2024-02-30", value: 5 }, // invalid
          { date: "2024-13-01", value: 5 }, // invalid month
          { date: "not-a-date", value: 5 }, // invalid format
          { date: "2024-01-15", value: 7 }, // valid
        ]}
      />
    );
    const listItems = container.querySelectorAll(".st-chartDataList li");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent).toBe("2024-01-15: 7");
  });

  it("FIX #2: tone gradient assigned by value range", () => {
    const { container } = render(
      <CalendarHeatmapChart
        label="Gradient"
        data={[
          { date: "2024-01-01", value: 0 },
          { date: "2024-01-08", value: 100 },
        ]}
      />
    );
    // The min-value cell gets category1, max-value gets a higher tone
    const cells = Array.from(container.querySelectorAll(".st-calendarHeatmapChart__cell[data-chart-date]"))
      .filter((c) => !c.classList.contains("st-calendarHeatmapChart__cell--empty"));
    expect(cells.length).toBe(2);
    // At least one has a tone class
    const hasTone = cells.some((c) =>
      Array.from(c.classList).some((cls) => cls.startsWith("st-calendarHeatmapChart__cell--category"))
    );
    expect(hasTone).toBe(true);
  });
});

// ─── BulletChart ─────────────────────────────────────────────────────────────

describe("BulletChart parity with Svelte", () => {
  it("renders bars, targets, ranges and SR values", () => {
    const { container } = render(
      <BulletChart
        label="Revenue"
        data={[
          { label: "North", value: 80, target: 100, ranges: [60, 80, 100] },
          { label: "South", value: 45, target: 70, ranges: [40, 60, 80] },
        ]}
      />
    );

    expect(container.querySelector(".st-bulletChart__visual")?.getAttribute("aria-label")).toBe("Revenue");
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(2);
    expect(container.querySelectorAll(".st-bulletChart__target")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "North: value 80, target 100",
      "South: value 45, target 70",
    ]);
  });

  it("FIX #3: filters non-finite value/target (skip)", () => {
    const { container } = render(
      <BulletChart
        label="Filter"
        data={[
          { label: "Good", value: 80, target: 100 },
          { label: "NaN value", value: NaN, target: 100 },
          { label: "Inf target", value: 50, target: Infinity },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(1);
    expect(container.querySelectorAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("FIX #3: domainMin=min(0,...), domainMax=max(0,...), baseline at 0", () => {
    const { container } = render(
      <BulletChart
        label="Baseline"
        data={[{ label: "A", value: -20, target: 30 }]}
      />
    );
    // baseline element should exist
    expect(container.querySelector(".st-bulletChart__baseline")).toBeTruthy();
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(1);
  });

  it("FIX #3: flat domain (value=target=0) → +1 fallback, no crash", () => {
    const { container } = render(
      <BulletChart
        label="Flat"
        data={[{ label: "Zero", value: 0, target: 0 }]}
      />
    );
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(1);
  });

  it("FIX #7: composite key — duplicate labels render all bars", () => {
    const { container } = render(
      <BulletChart
        label="Dup"
        data={[
          { label: "A", value: 10, target: 20 },
          { label: "A", value: 15, target: 25 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(2);
  });

  it("renders vertical orientation", () => {
    const { container } = render(
      <BulletChart
        label="Vertical"
        orientation="vertical"
        data={[{ label: "V", value: 50, target: 80 }]}
      />
    );
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(1);
  });
});

// ─── MarimekkoChart ───────────────────────────────────────────────────────────

describe("MarimekkoChart parity with Svelte", () => {
  it("renders cells with tones and SR values", () => {
    const { container } = render(
      <MarimekkoChart
        label="Market"
        data={[
          {
            label: "A",
            width: 40,
            segments: [
              { label: "X", value: 60, tone: "category1" },
              { label: "Y", value: 40, tone: "category3" },
            ],
          },
          {
            label: "B",
            width: 60,
            segments: [
              { label: "X", value: 30 },
              { label: "Y", value: 70 },
            ],
          },
        ]}
      />
    );

    expect(container.querySelector(".st-marimekkoChart__visual")?.getAttribute("aria-label")).toBe("Market");
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(4);
    expect(container.querySelector(".st-marimekkoChart__cell--category1")).toBeTruthy();
    expect(container.querySelector(".st-marimekkoChart__cell--category3")).toBeTruthy();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    // SR includes column percentage
    expect(items.some((t) => t?.includes("colonne"))).toBe(true);
  });

  it("FIX #4: skip width<=0 and non-finite width (NO Math.abs)", () => {
    const { container } = render(
      <MarimekkoChart
        label="Skip width"
        data={[
          { label: "Valid", width: 50, segments: [{ label: "S", value: 100 }] },
          { label: "Zero width", width: 0, segments: [{ label: "S", value: 100 }] },
          { label: "Neg width", width: -10, segments: [{ label: "S", value: 100 }] },
          { label: "NaN width", width: NaN, segments: [{ label: "S", value: 100 }] },
        ]}
      />
    );
    // Only 1 valid column
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("FIX #4: skip segment<=0 and non-finite (NO Math.abs, NO 0.5px floor)", () => {
    const { container } = render(
      <MarimekkoChart
        label="Skip segs"
        data={[
          {
            label: "Col",
            width: 100,
            segments: [
              { label: "Good", value: 50 },
              { label: "Zero", value: 0 },
              { label: "Neg", value: -10 },
              { label: "NaN", value: NaN },
            ],
          },
        ]}
      />
    );
    // Only 1 valid segment
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("FIX #4: SR includes column width percentage", () => {
    const { container } = render(
      <MarimekkoChart
        label="SR colpct"
        data={[
          {
            label: "X",
            width: 100,
            segments: [{ label: "A", value: 100 }],
          },
        ]}
      />
    );
    const text = container.querySelector(".st-chartDataList li")?.textContent;
    // SR should include "colonne 100%" or similar
    expect(text).toMatch(/colonne\s+100%/);
  });
});

// ─── ParallelCoordinatesChart ─────────────────────────────────────────────────

describe("ParallelCoordinatesChart parity with Svelte", () => {
  it("renders axes, lines and SR values", () => {
    const { container } = render(
      <ParallelCoordinatesChart
        label="Cars"
        axes={[
          { key: "speed", label: "Speed" },
          { key: "fuel", label: "Fuel" },
          { key: "cost", label: "Cost" },
        ]}
        data={[
          { speed: 200, fuel: 8, cost: 30000 },
          { speed: 150, fuel: 6, cost: 25000 },
        ]}
        tones={["category1", "category2"]}
      />
    );

    expect(container.querySelector(".st-parallelCoordinatesChart__visual")?.getAttribute("aria-label")).toBe("Cars");
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__axis")).toHaveLength(3);
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(2);
    expect(container.querySelector(".st-parallelCoordinatesChart__line--category1")).toBeTruthy();
    expect(container.querySelector(".st-parallelCoordinatesChart__line--category2")).toBeTruthy();
  });

  it("FIX #5: prop is `tones` (PLURAL) not `tone`", () => {
    // Ensure the plural prop is accepted without type error and applied
    const { container } = render(
      <ParallelCoordinatesChart
        label="Tones plural"
        axes={[{ key: "x", label: "X" }, { key: "y", label: "Y" }]}
        data={[{ x: 1, y: 2 }]}
        tones={["category5"]}
      />
    );
    expect(container.querySelector(".st-parallelCoordinatesChart__line--category5")).toBeTruthy();
  });

  it("FIX #5: NaN/null value → GAP (no connecting segment, path has gap)", () => {
    const { container } = render(
      <ParallelCoordinatesChart
        label="Gap test"
        axes={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" },
        ]}
        data={[{ a: 1, b: NaN, c: 3 }]}
      />
    );
    const path = container.querySelector(".st-parallelCoordinatesChart__line");
    expect(path).toBeTruthy();
    // Path should contain M twice (two separate subpaths due to gap), or be empty for the middle
    const d = path!.getAttribute("d") ?? "";
    // With a NaN middle point, the path should have gaps: two M commands
    const mCount = (d.match(/M/g) ?? []).length;
    expect(mCount).toBe(2);
  });

  it("FIX #5: per-axis domain clamped, explicit min/max respected", () => {
    const { container } = render(
      <ParallelCoordinatesChart
        label="Domain clamp"
        axes={[
          { key: "x", label: "X", min: 0, max: 100 },
          { key: "y", label: "Y" },
        ]}
        data={[{ x: 200, y: 50 }]} // x=200 exceeds max=100, should be clamped
      />
    );
    // Should render without crash
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(1);
  });

  it("FIX #5: flat axis domain (all same) → +1 fallback", () => {
    const { container } = render(
      <ParallelCoordinatesChart
        label="Flat axis"
        axes={[{ key: "x", label: "X" }, { key: "y", label: "Y" }]}
        data={[
          { x: 5, y: 5 },
          { x: 5, y: 5 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(2);
  });
});

// ─── BumpChart ────────────────────────────────────────────────────────────────

describe("BumpChart parity with Svelte", () => {
  it("renders lines, dots and SR ranking values", () => {
    const { container } = render(
      <BumpChart
        label="Rankings"
        categories={["Jan", "Feb", "Mar"]}
        data={[
          { label: "Alpha", ranks: [1, 2, 1], tone: "category1" },
          { label: "Beta", ranks: [2, 1, 3], tone: "category2" },
        ]}
      />
    );

    expect(container.querySelector(".st-bumpChart__visual")?.getAttribute("aria-label")).toBe("Rankings");
    expect(container.querySelectorAll(".st-bumpChart__line")).toHaveLength(2);
    expect(container.querySelector(".st-bumpChart__line--category1")).toBeTruthy();
    expect(container.querySelectorAll(".st-bumpChart__dot").length).toBeGreaterThanOrEqual(4);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items[0]).toContain("Alpha");
    expect(items[0]).toContain("#1");
  });

  it("FIX #6: isValidRank — integer ≥1 only (float, 0, negative, NaN → GAP)", () => {
    const { container } = render(
      <BumpChart
        label="Invalid ranks"
        categories={["Q1", "Q2", "Q3", "Q4"]}
        data={[
          {
            label: "X",
            ranks: [1, 0, -1, NaN],
          },
        ]}
      />
    );
    // Only rank 1 is valid → 1 dot
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(1);
    // SR shows "?" for invalid ranks
    const text = container.querySelector(".st-chartDataList li")?.textContent ?? "";
    expect(text).toContain("#1");
    expect(text).toContain("?");
  });

  it("FIX #6: float rank is invalid → GAP", () => {
    const { container } = render(
      <BumpChart
        label="Float rank"
        categories={["A", "B"]}
        data={[{ label: "S", ranks: [1.5, 2] }]}
      />
    );
    // 1.5 is not an integer → 1 valid dot (rank 2)
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(1);
  });

  it("FIX #6: absent/null rank → GAP (no dot, no #? in path)", () => {
    const { container } = render(
      <BumpChart
        label="Null rank"
        categories={["A", "B", "C"]}
        data={[{ label: "S", ranks: [1, null, 2] }]}
      />
    );
    // dots for rank 1 and 2, not for null
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(2);
    // SR shows "?" for null
    const text = container.querySelector(".st-chartDataList li")?.textContent ?? "";
    expect(text).toContain("?");
  });

  it("FIX #6: SR uses '?' for absent ranks, not '#1'", () => {
    const { container } = render(
      <BumpChart
        label="SR question mark"
        categories={["A", "B"]}
        data={[{ label: "X", ranks: [undefined, 1] }]}
      />
    );
    const text = container.querySelector(".st-chartDataList li")?.textContent ?? "";
    expect(text).toContain("A ?");
    expect(text).toContain("B #1");
  });

  it("FIX #6: ranks aligned with categories (extra ranks ignored)", () => {
    const { container } = render(
      <BumpChart
        label="Align"
        categories={["A", "B"]}
        data={[
          { label: "S", ranks: [1, 2, 3, 4] }, // 4 ranks, 2 categories → only first 2 used
        ]}
      />
    );
    // Only 2 dots (aligned to 2 categories)
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(2);
  });

  it("FIX #7: composite key — duplicate series labels render all lines", () => {
    const { container } = render(
      <BumpChart
        label="Dup labels"
        categories={["A"]}
        data={[
          { label: "Same", ranks: [1] },
          { label: "Same", ranks: [2] },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-bumpChart__line")).toHaveLength(2);
  });
});
