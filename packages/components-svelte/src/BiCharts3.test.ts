import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BulletChart from "./lib/BulletChart.svelte";
import BumpChart from "./lib/BumpChart.svelte";
import CalendarHeatmapChart from "./lib/CalendarHeatmapChart.svelte";
import CandlestickChart from "./lib/CandlestickChart.svelte";
import MarimekkoChart from "./lib/MarimekkoChart.svelte";
import ParallelCoordinatesChart from "./lib/ParallelCoordinatesChart.svelte";

describe("BulletChart", () => {
  it("renders measure bars, target markers, range bands and SR values", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Sales performance",
        data: [
          { label: "Revenue", value: 270, target: 300, ranges: [200, 250, 300] },
          { label: "Profit", value: 90, target: 100, ranges: [60, 80, 100] }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Sales performance" })).toBeTruthy();
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(2);
    expect(container.querySelectorAll(".st-bulletChart__target")).toHaveLength(2);
    expect(container.querySelectorAll(".st-bulletChart__range").length).toBeGreaterThanOrEqual(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Revenue: value 270, target 300",
      "Profit: value 90, target 100"
    ]);
  });

  it("supports vertical orientation", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Vertical bullets",
        orientation: "vertical",
        data: [
          { label: "Q1", value: 50, target: 60 },
          { label: "Q2", value: 70, target: 65 }
        ]
      }
    });

    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(2);
  });

  it("shows tooltip on pointer move", async () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Tooltip test",
        data: [{ label: "KPI", value: 80, target: 100 }]
      }
    });

    await fireEvent.pointerMove(container.querySelector(".st-bulletChart__bar") as Element);
    expect(container.querySelector(".st-bulletChart__tooltip")).toBeTruthy();
  });

  it("handles missing ranges gracefully (no crash)", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "No ranges",
        data: [{ label: "X", value: 40, target: 50 }]
      }
    });

    expect(container.querySelector(".st-bulletChart__bar")).toBeTruthy();
  });

  // --- LIMITES ---

  it("skips datum with NaN/Infinity value or target (no crash, no bar)", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Invalid bullet",
        data: [
          { label: "ValidEntry", value: 50, target: 100 },
          { label: "NaNEntry", value: NaN, target: 100 },
          { label: "InfEntry", value: Infinity, target: 100 },
          { label: "NaNTarget", value: 50, target: NaN }
        ]
      }
    });

    // Seuls les datums avec value ET target finis doivent être rendus
    expect(container.querySelectorAll(".st-bulletChart__bar")).toHaveLength(1);
  });

  it("handles negative values correctly — domainMin includes negatives, baseline at 0", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Negative bullet",
        data: [
          { label: "A", value: -30, target: 10, ranges: [-50, 0, 50] }
        ]
      }
    });

    // Doit se rendre sans crash, une barre présente
    expect(container.querySelector(".st-bulletChart__bar")).toBeTruthy();
    // baseline presente
    expect(container.querySelector(".st-bulletChart__baseline")).toBeTruthy();
    // La barre doit avoir une largeur > 0
    const bar = container.querySelector(".st-bulletChart__bar") as SVGRectElement;
    expect(Number(bar.getAttribute("width"))).toBeGreaterThan(0);
  });

  it("handles flat domain (all values equal) without division by zero", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Flat domain",
        data: [{ label: "Flat", value: 42, target: 42, ranges: [42] }]
      }
    });

    expect(container.querySelector(".st-bulletChart__bar")).toBeTruthy();
  });

  it("renders baseline element for zero position", () => {
    const { container } = render(BulletChart, {
      props: {
        label: "Baseline test",
        data: [{ label: "B", value: 5, target: 10 }]
      }
    });

    expect(container.querySelector(".st-bulletChart__baseline")).toBeTruthy();
  });
});

describe("MarimekkoChart", () => {
  it("renders cells with tones, category labels and SR values", () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "Market share",
        data: [
          {
            label: "EMEA",
            width: 40,
            segments: [
              { label: "Product A", value: 60, tone: "category3" },
              { label: "Product B", value: 40 }
            ]
          },
          {
            label: "APAC",
            width: 60,
            segments: [
              { label: "Product A", value: 30 },
              { label: "Product B", value: 70, tone: "category5" }
            ]
          }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Market share" })).toBeTruthy();
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(4);
    expect(container.querySelector(".st-marimekkoChart__cell--category3")).toBeTruthy();
    expect(container.querySelector(".st-marimekkoChart__cell--category5")).toBeTruthy();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    // FIX #4 : le SR doit contenir le % de segment ET la part de colonne
    expect(items.some((t) => t?.includes("EMEA") && t?.includes("Product A") && t?.includes("60%"))).toBe(true);
    expect(items.some((t) => t?.includes("APAC") && t?.includes("Product B") && t?.includes("70%"))).toBe(true);
  });

  it("shows tooltip on pointer move", async () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "Tooltip marimekko",
        data: [
          {
            label: "CAT",
            width: 100,
            segments: [{ label: "S1", value: 100 }]
          }
        ]
      }
    });

    await fireEvent.pointerMove(container.querySelector(".st-marimekkoChart__cell") as Element);
    expect(container.querySelector(".st-marimekkoChart__tooltip")).toBeTruthy();
  });

  // --- LIMITES ---

  it("SR contains column width percentage (Marimekko 2D area = segment% × column%)", () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "SR width test",
        data: [
          {
            label: "Big",
            width: 75,
            segments: [{ label: "All", value: 100 }]
          },
          {
            label: "Small",
            width: 25,
            segments: [{ label: "All", value: 100 }]
          }
        ]
      }
    });

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent ?? "");
    // La colonne Big = 75% du total → le SR doit mentionner 75%
    expect(items.some((t) => t.includes("Big") && t.includes("75%"))).toBe(true);
    // La colonne Small = 25%
    expect(items.some((t) => t.includes("Small") && t.includes("25%"))).toBe(true);
  });

  it("skips columns with non-finite or <=0 width (no crash)", () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "Invalid widths",
        data: [
          { label: "Valid", width: 100, segments: [{ label: "S", value: 50 }] },
          { label: "NaN", width: NaN, segments: [{ label: "S", value: 50 }] },
          { label: "Negative", width: -10, segments: [{ label: "S", value: 50 }] },
          { label: "Zero", width: 0, segments: [{ label: "S", value: 50 }] }
        ]
      }
    });

    // Seule la colonne Valid doit être rendue
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("skips segments with NaN/negative values (no crash, no fake proportion)", () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "Invalid segments",
        data: [
          {
            label: "Col",
            width: 100,
            segments: [
              { label: "Good", value: 80 },
              { label: "NaNSeg", value: NaN },
              { label: "NegSeg", value: -10 },
              { label: "ZeroSeg", value: 0 }
            ]
          }
        ]
      }
    });

    // Seul le segment Good doit être rendu (>0)
    expect(container.querySelectorAll(".st-marimekkoChart__cell")).toHaveLength(1);
  });

  it("verifies geometric x position proportional to column width", () => {
    const { container } = render(MarimekkoChart, {
      props: {
        label: "Geometry test",
        width: 480,
        height: 300,
        data: [
          {
            label: "A",
            width: 30,
            segments: [{ label: "S1", value: 100 }]
          },
          {
            label: "B",
            width: 70,
            segments: [{ label: "S2", value: 100 }]
          }
        ]
      }
    });

    const cells = container.querySelectorAll(".st-marimekkoChart__cell");
    expect(cells).toHaveLength(2);
    const xA = Number((cells[0] as SVGRectElement).getAttribute("x"));
    const xB = Number((cells[1] as SVGRectElement).getAttribute("x"));
    const wA = Number((cells[0] as SVGRectElement).getAttribute("width"));
    // La colonne A commence au MARGIN.left=8
    expect(xA).toBeCloseTo(8, 0);
    // La colonne B commence après A : xA + wA (+1 gap)
    expect(xB).toBeGreaterThan(xA + wA - 2);
  });
});

describe("ParallelCoordinatesChart", () => {
  it("renders one polyline per data row with correct axis count", () => {
    const { container } = render(ParallelCoordinatesChart, {
      props: {
        label: "Parallel coordinates",
        axes: [
          { key: "speed", label: "Speed" },
          { key: "weight", label: "Weight" },
          { key: "cost", label: "Cost" }
        ],
        data: [
          { speed: 80, weight: 200, cost: 5000 },
          { speed: 120, weight: 150, cost: 8000 },
          { speed: 60, weight: 300, cost: 3500 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Parallel coordinates" })).toBeTruthy();
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(3);
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__axis")).toHaveLength(3);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toHaveLength(3);
  });

  it("accepts explicit tones array (renamed from tone)", () => {
    const { container } = render(ParallelCoordinatesChart, {
      props: {
        label: "Toned parallel",
        axes: [{ key: "x", label: "X" }, { key: "y", label: "Y" }],
        data: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
        tones: ["category4", "category7"]
      }
    });

    expect(container.querySelector(".st-parallelCoordinatesChart__line--category4")).toBeTruthy();
    expect(container.querySelector(".st-parallelCoordinatesChart__line--category7")).toBeTruthy();
  });

  // --- LIMITES ---

  it("creates gap (no coercion) for NaN/null/empty-string axis values", () => {
    const { container } = render(ParallelCoordinatesChart, {
      props: {
        label: "Gap test",
        axes: [
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" }
        ],
        data: [
          { a: 1, b: NaN, c: 3 },    // b invalide → gap
          { a: 2, b: null, c: 4 },   // b null → gap
          { a: 3, b: "",  c: 5 },    // b vide → gap
          { a: 4, b: Infinity, c: 6 } // b infini → gap
        ]
      }
    });

    // 4 lignes rendues (les paths existent même s'ils ont des gaps)
    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(4);
    // Les paths avec gap doivent contenir plusieurs sous-paths (M...L... M...)
    const paths = container.querySelectorAll(".st-parallelCoordinatesChart__line");
    for (const path of Array.from(paths)) {
      const d = path.getAttribute("d") ?? "";
      // Chaque path doit contenir au moins 2 "M" (gap crée 2 sous-segments)
      // ou être un path simple s'il n'y a qu'un point valide de chaque côté
      const mCount = (d.match(/M/g) ?? []).length;
      expect(mCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("handles all-invalid row gracefully (empty path, no crash)", () => {
    const { container } = render(ParallelCoordinatesChart, {
      props: {
        label: "All invalid",
        axes: [{ key: "x", label: "X" }, { key: "y", label: "Y" }],
        data: [
          { x: NaN, y: NaN },
          { x: 1, y: 2 }
        ]
      }
    });

    expect(container.querySelectorAll(".st-parallelCoordinatesChart__line")).toHaveLength(2);
  });

  it("uses explicit axis min/max and clamps values", () => {
    const { container } = render(ParallelCoordinatesChart, {
      props: {
        label: "Clamped",
        axes: [
          { key: "v", label: "V", min: 0, max: 100 }
        ],
        data: [{ v: 50 }]
      }
    });

    const path = container.querySelector(".st-parallelCoordinatesChart__line");
    expect(path).toBeTruthy();
    const d = path?.getAttribute("d") ?? "";
    // Le point doit être rendu (path non vide)
    expect(d.length).toBeGreaterThan(0);
    // La coordonnée y doit être au milieu du plotHeight (50% de [0,100])
    // MARGIN.top=32, plotHeight = 300-32-16=252, y = 32 + (1-0.5)*252 = 32+126 = 158
    const yMatch = d.match(/M[\d.]+,([\d.]+)/);
    expect(yMatch).toBeTruthy();
    expect(Number(yMatch![1])).toBeCloseTo(158, 0);
  });
});

describe("CandlestickChart", () => {
  it("renders candle bodies and wicks with up/down classes", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "OHLC chart",
        data: [
          { label: "Mon", open: 100, high: 115, low: 95, close: 110 },
          { label: "Tue", open: 110, high: 112, low: 100, close: 104 },
          { label: "Wed", open: 104, high: 120, low: 102, close: 118 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "OHLC chart" })).toBeTruthy();
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(3);
    expect(container.querySelectorAll(".st-candlestickChart__wick")).toHaveLength(3);
    expect(container.querySelectorAll(".st-candlestickChart__body--up")).toHaveLength(2);
    expect(container.querySelectorAll(".st-candlestickChart__body--down")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Mon: O 100 H 115 L 95 C 110",
      "Tue: O 110 H 112 L 100 C 104",
      "Wed: O 104 H 120 L 102 C 118"
    ]);
  });

  it("shows tooltip on pointer move over a candle body", async () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Tooltip candle",
        data: [{ label: "T1", open: 50, high: 60, low: 45, close: 55 }]
      }
    });

    await fireEvent.pointerMove(container.querySelector(".st-candlestickChart__body") as Element);
    expect(container.querySelector(".st-candlestickChart__tooltip")).toBeTruthy();
  });

  // --- LIMITES ---

  it("skips candles with any non-finite OHLC value (NaN/Infinity)", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Invalid OHLC",
        data: [
          { label: "Valid", open: 100, high: 110, low: 90, close: 105 },
          { label: "NaNOpen", open: NaN, high: 110, low: 90, close: 105 },
          { label: "InfHigh", open: 100, high: Infinity, low: 90, close: 105 },
          { label: "NaNLow", open: 100, high: 110, low: NaN, close: 105 },
          { label: "NaNClose", open: 100, high: 110, low: 90, close: NaN }
        ]
      }
    });

    // Seule la bougie Valid doit être rendue
    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(1);
    expect(container.querySelectorAll(".st-candlestickChart__wick")).toHaveLength(1);
  });

  it("clamps high/low when high<max(O,C) or low>min(O,C) — corps ne déborde pas de la mèche", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Clamped OHLC",
        width: 200,
        height: 200,
        data: [
          // high=95 < max(O=100,C=110) → doit être clampé à 110
          // low=115 > min(O=100,C=110) → doit être clampé à 100
          { label: "Bad", open: 100, high: 95, low: 115, close: 110 }
        ]
      }
    });

    const body = container.querySelector(".st-candlestickChart__body") as SVGRectElement;
    const wick = container.querySelector(".st-candlestickChart__wick") as SVGLineElement;
    expect(body).toBeTruthy();
    expect(wick).toBeTruthy();

    const bodyY = Number(body.getAttribute("y"));
    const bodyBot = bodyY + Number(body.getAttribute("height"));
    const wickTop = Number(wick.getAttribute("y1"));
    const wickBot = Number(wick.getAttribute("y2"));

    // Dans SVG, y augmente vers le bas → wickTop (high) ≤ bodyY (haut du corps)
    expect(wickTop).toBeLessThanOrEqual(bodyY + 1);
    // Et wickBot (low) ≥ bodyBot (bas du corps)
    expect(wickBot).toBeGreaterThanOrEqual(bodyBot - 1);
  });

  it("handles flat OHLC (all values equal) without crash or division by zero", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Flat OHLC",
        data: [{ label: "Flat", open: 50, high: 50, low: 50, close: 50 }]
      }
    });

    expect(container.querySelector(".st-candlestickChart__body")).toBeTruthy();
  });

  it("domain includes O/H/L/C so body never exceeds plot bounds", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Domain test",
        width: 200,
        height: 200,
        data: [
          // open=50, close=80 > high=60 → sans clamp, body déborderait du plot
          { label: "A", open: 50, high: 60, low: 40, close: 80 }
        ]
      }
    });

    const body = container.querySelector(".st-candlestickChart__body") as SVGRectElement;
    // MARGIN.top=12, height=200, MARGIN.bottom=32 → plotHeight=156
    // Avec clamp, high=80 (clamp), low=40 → domaine inclut O/H/L/C
    expect(body).toBeTruthy();
    const bodyY = Number(body.getAttribute("y"));
    expect(bodyY).toBeGreaterThanOrEqual(12); // >= MARGIN.top
  });

  it("handles duplicate labels without Svelte key crash", () => {
    const { container } = render(CandlestickChart, {
      props: {
        label: "Duplicate labels",
        data: [
          { label: "A", open: 10, high: 20, low: 5, close: 15 },
          { label: "A", open: 15, high: 25, low: 10, close: 20 },
          { label: "A", open: 20, high: 30, low: 15, close: 25 }
        ]
      }
    });

    expect(container.querySelectorAll(".st-candlestickChart__body")).toHaveLength(3);
  });
});

describe("CalendarHeatmapChart", () => {
  it("renders one cell per date with correct tone classes", () => {
    const dates = [
      { date: "2024-01-01", value: 5 },
      { date: "2024-01-02", value: 15 },
      { date: "2024-01-08", value: 0 },
      { date: "2024-01-15", value: 25 }
    ];

    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "Activity heatmap",
        data: dates
      }
    });

    expect(screen.getByRole("img", { name: "Activity heatmap" })).toBeTruthy();
    // cells include empty cells for the full week grid, at least 4 non-empty
    const nonEmptyCells = container.querySelectorAll(
      ".st-calendarHeatmapChart__cell:not(.st-calendarHeatmapChart__cell--empty)"
    );
    expect(nonEmptyCells.length).toBeGreaterThanOrEqual(4);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toContain("2024-01-01: 5");
    expect(items).toContain("2024-01-15: 25");
  });

  it("renders empty state without crash", () => {
    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "Empty calendar",
        data: []
      }
    });

    expect(screen.getByRole("img", { name: "Empty calendar" })).toBeTruthy();
    expect(container.querySelectorAll(".st-calendarHeatmapChart__cell")).toHaveLength(0);
  });

  it("shows tooltip on pointer move", async () => {
    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "Tooltip calendar",
        data: [{ date: "2024-03-10", value: 8 }]
      }
    });

    const cell = container.querySelector(".st-calendarHeatmapChart__cell:not(.st-calendarHeatmapChart__cell--empty)");
    if (cell) {
      await fireEvent.pointerMove(cell);
      expect(container.querySelector(".st-calendarHeatmapChart__tooltip")).toBeTruthy();
    }
  });

  // --- LIMITES ---

  it("rejects invalid dates (non-parsable, wrong format) without crash", () => {
    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "Invalid dates",
        data: [
          { date: "2024-01-15", value: 10 },
          { date: "not-a-date", value: 5 },
          { date: "2024-13-01", value: 5 },  // mois invalide
          { date: "2024-02-30", value: 5 },  // jour invalide
          { date: "20240115", value: 5 },    // format sans tiret
          { date: "", value: 5 }
        ]
      }
    });

    // Seul 2024-01-15 est valide
    const nonEmptyCells = container.querySelectorAll(
      ".st-calendarHeatmapChart__cell:not(.st-calendarHeatmapChart__cell--empty)"
    );
    expect(nonEmptyCells.length).toBeGreaterThanOrEqual(1);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toContain("2024-01-15: 10");
    // Les dates invalides ne doivent pas apparaître dans le SR
    expect(items.some((t) => t?.includes("not-a-date"))).toBe(false);
  });

  it("handles unsorted dates correctly (grid covers full range)", () => {
    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "Unsorted dates",
        data: [
          { date: "2024-01-15", value: 3 },
          { date: "2024-01-01", value: 7 },
          { date: "2024-01-08", value: 2 }
        ]
      }
    });

    const nonEmptyCells = container.querySelectorAll(
      ".st-calendarHeatmapChart__cell:not(.st-calendarHeatmapChart__cell--empty)"
    );
    // 3 dates valides dans la grille
    expect(nonEmptyCells.length).toBeGreaterThanOrEqual(3);
  });

  it("UTC day-of-week mapping: 2024-01-01 (Monday) is in row index 1 (UTC)", () => {
    // 2024-01-01 = lundi UTC → getUTCDay() = 1
    const { container } = render(CalendarHeatmapChart, {
      props: {
        label: "UTC DOW",
        width: 200,
        height: 140,
        data: [{ date: "2024-01-01", value: 10 }]
      }
    });

    const nonEmptyCells = container.querySelectorAll(
      ".st-calendarHeatmapChart__cell:not(.st-calendarHeatmapChart__cell--empty)"
    );
    expect(nonEmptyCells.length).toBeGreaterThanOrEqual(1);
    const cell = nonEmptyCells[0] as SVGRectElement;
    const cellY = Number(cell.getAttribute("y"));
    // MARGIN.top=24, plotHeight = 140-24-8=108, cellH=108/7≈15.43
    // 2024-01-01 = lundi → getUTCDay()=1 → y = MARGIN.top + 1*cellH ≈ 24+15.43≈39.43
    // La grille commence au dimanche de la semaine contenant le 1er jan,
    // soit 2023-12-31 (dimanche) → week=0, dow=1 pour 2024-01-01
    const MARGIN_TOP = 24;
    const plotH = 140 - 24 - 8;
    const cellH = plotH / 7;
    const expectedY = MARGIN_TOP + 1 * cellH; // lundi = row 1
    expect(cellY).toBeCloseTo(expectedY, 0);
  });
});

describe("BumpChart", () => {
  it("renders bump lines, dots, rank labels and SR values", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Ranking chart",
        categories: ["Q1", "Q2", "Q3", "Q4"],
        data: [
          { label: "Alpha", ranks: [1, 2, 1, 1], tone: "category2" },
          { label: "Beta", ranks: [2, 1, 3, 2] },
          { label: "Gamma", ranks: [3, 3, 2, 3], tone: "category6" }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Ranking chart" })).toBeTruthy();
    expect(container.querySelectorAll(".st-bumpChart__line")).toHaveLength(3);
    expect(container.querySelector(".st-bumpChart__line--category2")).toBeTruthy();
    expect(container.querySelector(".st-bumpChart__line--category6")).toBeTruthy();
    // 3 series × 4 categories = 12 dots
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(12);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toHaveLength(3);
    expect(items[0]).toContain("Alpha");
    expect(items[0]).toContain("Q1 #1");
  });

  it("handles a single category without crash", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Single period",
        categories: ["Jan"],
        data: [{ label: "A", ranks: [1] }, { label: "B", ranks: [2] }]
      }
    });

    expect(container.querySelectorAll(".st-bumpChart__line")).toHaveLength(2);
  });

  // --- LIMITES ---

  it("creates gap (no dot) for invalid/missing rank, SR uses '?' not '#1'", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Gap ranks",
        categories: ["Jan", "Feb", "Mar"],
        data: [
          { label: "A", ranks: [1, null as unknown as number, 2] },
          { label: "B", ranks: [2, NaN, 3] },
          { label: "C", ranks: [3, undefined as unknown as number, 1] }
        ]
      }
    });

    // 3 séries, chacune avec 2 rangs valides (Jan et Mar) → 6 dots
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(6);

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent ?? "");
    // Le SR doit utiliser "?" pour les rangs absents, pas "#1"
    expect(items.some((t) => t.includes("A") && t.includes("Feb ?"))).toBe(true);
    expect(items.some((t) => t.includes("B") && t.includes("Feb ?"))).toBe(true);
  });

  it("handles rank=0 and negative ranks as invalid (gap, not clamped to #1)", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Bad ranks",
        categories: ["T1", "T2"],
        data: [
          { label: "X", ranks: [0, 1] },   // 0 invalide
          { label: "Y", ranks: [-1, 2] }    // négatif invalide
        ]
      }
    });

    // X: T1 invalide, T2 valide → 1 dot
    // Y: T1 invalide, T2 valide → 1 dot
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(2);

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent ?? "");
    // T1 doit être "?" pas "#1"
    expect(items.some((t) => t.includes("X") && t.includes("T1 ?"))).toBe(true);
    expect(items.some((t) => t.includes("Y") && t.includes("T1 ?"))).toBe(true);
  });

  it("aligns ranks to categories length — no out-of-bounds render", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Misaligned",
        categories: ["A", "B"],  // 2 catégories
        data: [
          { label: "S1", ranks: [1, 2, 3, 4] }  // 4 rangs → only 2 rendus
        ]
      }
    });

    // Seuls 2 dots (alignés sur les 2 catégories)
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(2);
  });

  it("does not crash with duplicate series labels (composite key)", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Dup labels",
        categories: ["T1", "T2"],
        data: [
          { label: "Same", ranks: [1, 2] },
          { label: "Same", ranks: [2, 1] },
          { label: "Same", ranks: [3, 3] }
        ]
      }
    });

    expect(container.querySelectorAll(".st-bumpChart__line")).toHaveLength(3);
    expect(container.querySelectorAll(".st-bumpChart__dot")).toHaveLength(6);
  });

  it("geometric: rank 1 is at top (smaller y) than rank 3 in same series", () => {
    const { container } = render(BumpChart, {
      props: {
        label: "Geometry bump",
        width: 480,
        height: 300,
        categories: ["T1", "T2"],
        data: [
          { label: "X", ranks: [1, 3] }
        ]
      }
    });

    const dots = container.querySelectorAll(".st-bumpChart__dot");
    expect(dots).toHaveLength(2);
    const y1 = Number((dots[0] as SVGCircleElement).getAttribute("cy")); // rank 1
    const y2 = Number((dots[1] as SVGCircleElement).getAttribute("cy")); // rank 3
    // rank 1 = haut → y plus petit que rank 3
    expect(y1).toBeLessThan(y2);
  });
});
