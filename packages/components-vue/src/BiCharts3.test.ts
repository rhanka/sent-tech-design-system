import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  BulletChart,
  MarimekkoChart,
  CandlestickChart,
  CalendarHeatmapChart,
  ParallelCoordinatesChart,
  BumpChart,
} from "./index.js";

// ─── CandlestickChart ────────────────────────────────────────────────────────

describe("CandlestickChart parity with Svelte", () => {
  it("renders candles and SR OHLC values", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "Prices",
        data: [
          { label: "Jan", open: 100, high: 120, low: 90, close: 115 },
          { label: "Feb", open: 115, high: 130, low: 105, close: 108 },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Prices"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-candlestickChart__body")).toHaveLength(2);
    expect(wrapper.findAll(".st-candlestickChart__wick")).toHaveLength(2);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Jan: O 100 H 120 L 90 C 115",
      "Feb: O 115 H 130 L 105 C 108",
    ]);
  });

  it("FIX #1: filters invalid OHLC candles (non-finite values)", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "OHLC filter",
        data: [
          { label: "Good", open: 10, high: 20, low: 5, close: 15 },
          { label: "NaN", open: NaN, high: 20, low: 5, close: 15 },
          { label: "Inf", open: 10, high: Infinity, low: 5, close: 15 },
        ],
      },
    });
    expect(wrapper.findAll(".st-candlestickChart__body")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("FIX #1: clamps high=max(H,O,C) and low=min(L,O,C) — no crash on contradictory OHLC", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "Clamp test",
        data: [{ label: "A", open: 50, high: 40, low: 30, close: 45 }],
      },
    });
    expect(wrapper.findAll(".st-candlestickChart__body")).toHaveLength(1);
    expect(wrapper.findAll(".st-candlestickChart__wick")).toHaveLength(1);
  });

  it("FIX #1: flat domain → fallback +1, no division by zero", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "Flat domain",
        data: [{ label: "X", open: 100, high: 100, low: 100, close: 100 }],
      },
    });
    expect(wrapper.findAll(".st-candlestickChart__body")).toHaveLength(1);
  });

  it("FIX #7: composite key — duplicate labels do not collapse candles", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "Dup labels",
        data: [
          { label: "A", open: 10, high: 20, low: 5, close: 15 },
          { label: "A", open: 15, high: 25, low: 10, close: 20 },
        ],
      },
    });
    expect(wrapper.findAll(".st-candlestickChart__body")).toHaveLength(2);
  });

  it("bullish vs bearish color classes", () => {
    const wrapper = mount(CandlestickChart, {
      props: {
        label: "Colors",
        data: [
          { label: "Up", open: 100, high: 120, low: 90, close: 115 },
          { label: "Down", open: 115, high: 120, low: 90, close: 108 },
        ],
      },
    });
    expect(wrapper.find(".st-candlestickChart__body--up").exists()).toBe(true);
    expect(wrapper.find(".st-candlestickChart__body--down").exists()).toBe(true);
  });
});

// ─── CalendarHeatmapChart ────────────────────────────────────────────────────

describe("CalendarHeatmapChart parity with Svelte", () => {
  it("renders cells and SR date-value list", () => {
    const wrapper = mount(CalendarHeatmapChart, {
      props: {
        label: "Activity",
        data: [
          { date: "2024-01-01", value: 5 },
          { date: "2024-01-02", value: 10 },
          { date: "2024-01-08", value: 3 },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Activity"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-calendarHeatmapChart__cell").length).toBeGreaterThanOrEqual(3);
    const listItems = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(listItems).toContain("2024-01-01: 5");
    expect(listItems).toContain("2024-01-02: 10");
    expect(listItems).toContain("2024-01-08: 3");
  });

  it("FIX #2: UTC DOW — 2024-01-01 is Monday (DOW=1), not Sunday", () => {
    const wrapper = mount(CalendarHeatmapChart, {
      props: {
        label: "UTC DOW",
        data: [{ date: "2024-01-01", value: 1 }],
      },
    });
    const nonEmptyCell = wrapper
      .findAll(".st-calendarHeatmapChart__cell")
      .find((c) => c.attributes("data-chart-date") === "2024-01-01");
    expect(nonEmptyCell).toBeTruthy();
    // y position: DOW=1 means row 1 (Mon), not row 0 (Sun) → y > MARGIN.top(=24)
    const yAttr = Number(nonEmptyCell!.attributes("y"));
    expect(yAttr).toBeGreaterThan(24);
  });

  it("FIX #2: invalid date (non-existent) is filtered out", () => {
    const wrapper = mount(CalendarHeatmapChart, {
      props: {
        label: "Invalid dates",
        data: [
          { date: "2024-02-30", value: 5 }, // invalid
          { date: "2024-13-01", value: 5 }, // invalid month
          { date: "not-a-date", value: 5 }, // invalid format
          { date: "2024-01-15", value: 7 }, // valid
        ],
      },
    });
    const listItems = wrapper.findAll(".st-chartDataList li");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].text()).toBe("2024-01-15: 7");
  });

  it("FIX #2: tone gradient assigned by value range", () => {
    const wrapper = mount(CalendarHeatmapChart, {
      props: {
        label: "Gradient",
        data: [
          { date: "2024-01-01", value: 0 },
          { date: "2024-01-08", value: 100 },
        ],
      },
    });
    const cells = wrapper
      .findAll(".st-calendarHeatmapChart__cell[data-chart-date]")
      .filter((c) => !c.classes().includes("st-calendarHeatmapChart__cell--empty"));
    expect(cells.length).toBe(2);
    const hasTone = cells.some((c) =>
      c.classes().some((cls) => cls.startsWith("st-calendarHeatmapChart__cell--category"))
    );
    expect(hasTone).toBe(true);
  });
});

// ─── BulletChart ─────────────────────────────────────────────────────────────

describe("BulletChart parity with Svelte", () => {
  it("renders bars, targets, ranges and SR values", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Revenue",
        data: [
          { label: "North", value: 80, target: 100, ranges: [60, 80, 100] },
          { label: "South", value: 45, target: 70, ranges: [40, 60, 80] },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Revenue"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(2);
    expect(wrapper.findAll(".st-bulletChart__target")).toHaveLength(2);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "North: value 80, target 100",
      "South: value 45, target 70",
    ]);
  });

  it("FIX #3: filters non-finite value/target (skip)", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Filter",
        data: [
          { label: "Good", value: 80, target: 100 },
          { label: "NaN value", value: NaN, target: 100 },
          { label: "Inf target", value: 50, target: Infinity },
        ],
      },
    });
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("FIX #3: baseline at 0 exists", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Baseline",
        data: [{ label: "A", value: -20, target: 30 }],
      },
    });
    expect(wrapper.find(".st-bulletChart__baseline").exists()).toBe(true);
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(1);
  });

  it("FIX #3: flat domain (value=target=0) → +1 fallback, no crash", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Flat",
        data: [{ label: "Zero", value: 0, target: 0 }],
      },
    });
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(1);
  });

  it("FIX #7: composite key — duplicate labels render all bars", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Dup",
        data: [
          { label: "A", value: 10, target: 20 },
          { label: "A", value: 15, target: 25 },
        ],
      },
    });
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(2);
  });

  it("renders vertical orientation", () => {
    const wrapper = mount(BulletChart, {
      props: {
        label: "Vertical",
        orientation: "vertical",
        data: [{ label: "V", value: 50, target: 80 }],
      },
    });
    expect(wrapper.findAll(".st-bulletChart__bar")).toHaveLength(1);
  });
});

// ─── MarimekkoChart ───────────────────────────────────────────────────────────

describe("MarimekkoChart parity with Svelte", () => {
  it("renders cells with tones and SR values", () => {
    const wrapper = mount(MarimekkoChart, {
      props: {
        label: "Market",
        data: [
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
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Market"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-marimekkoChart__cell")).toHaveLength(4);
    expect(wrapper.find(".st-marimekkoChart__cell--category1").exists()).toBe(true);
    expect(wrapper.find(".st-marimekkoChart__cell--category3").exists()).toBe(true);
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items.some((t) => t.includes("colonne"))).toBe(true);
  });

  it("FIX #4: skip width<=0 and non-finite width (NO Math.abs)", () => {
    const wrapper = mount(MarimekkoChart, {
      props: {
        label: "Skip width",
        data: [
          { label: "Valid", width: 50, segments: [{ label: "S", value: 100 }] },
          { label: "Zero width", width: 0, segments: [{ label: "S", value: 100 }] },
          { label: "Neg width", width: -10, segments: [{ label: "S", value: 100 }] },
          { label: "NaN width", width: NaN, segments: [{ label: "S", value: 100 }] },
        ],
      },
    });
    expect(wrapper.findAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("FIX #4: skip segment<=0 and non-finite (NO Math.abs, NO 0.5px floor)", () => {
    const wrapper = mount(MarimekkoChart, {
      props: {
        label: "Skip segs",
        data: [
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
        ],
      },
    });
    expect(wrapper.findAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("FIX #4: SR includes column width percentage", () => {
    const wrapper = mount(MarimekkoChart, {
      props: {
        label: "SR colpct",
        data: [
          {
            label: "X",
            width: 100,
            segments: [{ label: "A", value: 100 }],
          },
        ],
      },
    });
    const text = wrapper.find(".st-chartDataList li").text();
    expect(text).toMatch(/colonne\s+100%/);
  });
});

// ─── ParallelCoordinatesChart ─────────────────────────────────────────────────

describe("ParallelCoordinatesChart parity with Svelte", () => {
  it("renders axes, lines and SR values", () => {
    const wrapper = mount(ParallelCoordinatesChart, {
      props: {
        label: "Cars",
        axes: [
          { key: "speed", label: "Speed" },
          { key: "fuel", label: "Fuel" },
          { key: "cost", label: "Cost" },
        ],
        data: [
          { speed: 200, fuel: 8, cost: 30000 },
          { speed: 150, fuel: 6, cost: 25000 },
        ],
        tones: ["category1", "category2"],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Cars"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-parallelCoordinatesChart__axis")).toHaveLength(3);
    expect(wrapper.findAll(".st-parallelCoordinatesChart__line")).toHaveLength(2);
    expect(wrapper.find(".st-parallelCoordinatesChart__line--category1").exists()).toBe(true);
    expect(wrapper.find(".st-parallelCoordinatesChart__line--category2").exists()).toBe(true);
  });

  it("FIX #5: prop is `tones` (PLURAL) not `tone`", () => {
    const wrapper = mount(ParallelCoordinatesChart, {
      props: {
        label: "Tones plural",
        axes: [{ key: "x", label: "X" }, { key: "y", label: "Y" }],
        data: [{ x: 1, y: 2 }],
        tones: ["category5"],
      },
    });
    expect(wrapper.find(".st-parallelCoordinatesChart__line--category5").exists()).toBe(true);
  });

  it("FIX #5: NaN/null value → GAP (path has 2 M commands)", () => {
    const wrapper = mount(ParallelCoordinatesChart, {
      props: {
        label: "Gap test",
        axes: [
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" },
        ],
        data: [{ a: 1, b: NaN, c: 3 }],
      },
    });
    const path = wrapper.find(".st-parallelCoordinatesChart__line");
    expect(path.exists()).toBe(true);
    const d = path.attributes("d") ?? "";
    const mCount = (d.match(/M/g) ?? []).length;
    expect(mCount).toBe(2);
  });

  it("FIX #5: per-axis domain clamped, explicit min/max respected", () => {
    const wrapper = mount(ParallelCoordinatesChart, {
      props: {
        label: "Domain clamp",
        axes: [
          { key: "x", label: "X", min: 0, max: 100 },
          { key: "y", label: "Y" },
        ],
        data: [{ x: 200, y: 50 }],
      },
    });
    expect(wrapper.findAll(".st-parallelCoordinatesChart__line")).toHaveLength(1);
  });

  it("FIX #5: flat axis domain → +1 fallback", () => {
    const wrapper = mount(ParallelCoordinatesChart, {
      props: {
        label: "Flat axis",
        axes: [{ key: "x", label: "X" }, { key: "y", label: "Y" }],
        data: [{ x: 5, y: 5 }, { x: 5, y: 5 }],
      },
    });
    expect(wrapper.findAll(".st-parallelCoordinatesChart__line")).toHaveLength(2);
  });
});

// ─── BumpChart ────────────────────────────────────────────────────────────────

describe("BumpChart parity with Svelte", () => {
  it("renders lines, dots and SR ranking values", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Rankings",
        categories: ["Jan", "Feb", "Mar"],
        data: [
          { label: "Alpha", ranks: [1, 2, 1], tone: "category1" },
          { label: "Beta", ranks: [2, 1, 3], tone: "category2" },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Rankings"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-bumpChart__line")).toHaveLength(2);
    expect(wrapper.find(".st-bumpChart__line--category1").exists()).toBe(true);
    expect(wrapper.findAll(".st-bumpChart__dot").length).toBeGreaterThanOrEqual(4);
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items[0]).toContain("Alpha");
    expect(items[0]).toContain("#1");
  });

  it("FIX #6: isValidRank — integer ≥1 only (float, 0, negative, NaN → GAP)", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Invalid ranks",
        categories: ["Q1", "Q2", "Q3", "Q4"],
        data: [{ label: "X", ranks: [1, 0, -1, NaN] }],
      },
    });
    expect(wrapper.findAll(".st-bumpChart__dot")).toHaveLength(1);
    const text = wrapper.find(".st-chartDataList li").text();
    expect(text).toContain("#1");
    expect(text).toContain("?");
  });

  it("FIX #6: float rank is invalid → GAP", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Float rank",
        categories: ["A", "B"],
        data: [{ label: "S", ranks: [1.5, 2] }],
      },
    });
    // 1.5 is not an integer → only rank 2 is valid
    expect(wrapper.findAll(".st-bumpChart__dot")).toHaveLength(1);
  });

  it("FIX #6: absent/null rank → GAP (no dot for null)", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Null rank",
        categories: ["A", "B", "C"],
        data: [{ label: "S", ranks: [1, null, 2] }],
      },
    });
    expect(wrapper.findAll(".st-bumpChart__dot")).toHaveLength(2);
    const text = wrapper.find(".st-chartDataList li").text();
    expect(text).toContain("?");
  });

  it("FIX #6: SR uses '?' for absent ranks, not '#1'", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "SR question mark",
        categories: ["A", "B"],
        data: [{ label: "X", ranks: [undefined, 1] }],
      },
    });
    const text = wrapper.find(".st-chartDataList li").text();
    expect(text).toContain("A ?");
    expect(text).toContain("B #1");
  });

  it("FIX #6: ranks aligned with categories (extra ranks ignored)", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Align",
        categories: ["A", "B"],
        data: [{ label: "S", ranks: [1, 2, 3, 4] }],
      },
    });
    expect(wrapper.findAll(".st-bumpChart__dot")).toHaveLength(2);
  });

  it("FIX #7: composite key — duplicate series labels render all lines", () => {
    const wrapper = mount(BumpChart, {
      props: {
        label: "Dup labels",
        categories: ["A"],
        data: [
          { label: "Same", ranks: [1] },
          { label: "Same", ranks: [2] },
        ],
      },
    });
    expect(wrapper.findAll(".st-bumpChart__line")).toHaveLength(2);
  });
});
