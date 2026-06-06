import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type BumpChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BumpChartSeries = {
  label: string;
  ranks: (number | null | undefined)[];
  tone?: BumpChartTone;
};

export type BumpChartProps = {
  data: BumpChartSeries[];
  categories: string[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const TONES: BumpChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 16, right: 80, bottom: 32, left: 80 };

// FIX: valid rank = integer ≥1 only
function isValidRank(r: unknown): r is number {
  return (
    typeof r === "number" &&
    Number.isFinite(r) &&
    Number.isInteger(r) &&
    r >= 1
  );
}

/**
 * Builds an SVG bump path with GAP for invalid ranks.
 * Uses cubic bezier curves for smooth bumps.
 */
function buildBumpPath(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  function flushSegment() {
    if (segment.length >= 2) {
      let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
      for (let i = 0; i < segment.length - 1; i++) {
        const p1 = segment[i];
        const p2 = segment[i + 1];
        const mx = (p1.x + p2.x) / 2;
        d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
      }
      parts.push(d);
    } else if (segment.length === 1) {
      parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
    }
    segment = [];
  }

  for (const pt of points) {
    if (pt === null) {
      flushSegment();
    } else {
      segment.push(pt);
    }
  }
  flushSegment();
  return parts.join(" ");
}

export const BumpChart = defineComponent({
  name: "BumpChart",
  props: {
    data: { type: Array as () => BumpChartSeries[], default: () => [] },
    categories: { type: Array as () => string[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 300 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) { hoveredIndex.value = null; return; }
      const idx = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(idx) ? idx : null;
    }

    return () => {
      const data = props.data ?? [];
      const categories = props.categories ?? [];
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 300;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      let maxRank = 1;
      for (const s of data) {
        for (const r of s.ranks) {
          if (isValidRank(r) && r > maxRank) maxRank = r;
        }
      }

      // FIX: align ranks and categories using Math.min(ranks.length, categories.length)
      const catCount = Math.max(categories.length, 2);

      function rankToY(rank: number): number {
        // rank 1 = top
        return MARGIN.top + ((rank - 1) / Math.max(maxRank - 1, 1)) * plotHeight;
      }

      function catToX(ci: number): number {
        return MARGIN.left + (ci / Math.max(catCount - 1, 1)) * plotWidth;
      }

      type SeriesEntry = {
        label: string;
        ranks: (number | null | undefined)[];
        tone: BumpChartTone;
        points: ({ x: number; y: number } | null)[];
        index: number;
        path: string;
        alignedLength: number;
      };

      const seriesList: SeriesEntry[] = data.map((s, si) => {
        const tone = s.tone ?? TONES[si % TONES.length];
        // FIX: align ranks/categories; invalid rank → null (GAP)
        const alignedLength = Math.min(s.ranks.length, categories.length);
        const points: ({ x: number; y: number } | null)[] = [];
        for (let ci = 0; ci < alignedLength; ci++) {
          const r = s.ranks[ci];
          if (isValidRank(r)) {
            points.push({ x: catToX(ci), y: rankToY(r) });
          } else {
            points.push(null); // GAP
          }
        }
        return {
          label: s.label,
          ranks: s.ranks,
          tone,
          points,
          index: si,
          path: buildBumpPath(points),
          alignedLength,
        };
      });

      const rankTicks: number[] = [];
      for (let r = 1; r <= maxRank; r++) rankTicks.push(r);

      // FIX: SR does not announce #1 for absent rank (uses "?" instead)
      const dataValueItems = data.map((s) => {
        const alignedLength = Math.min(s.ranks.length, categories.length);
        return (
          `${s.label}: ` +
          categories.slice(0, alignedLength).map((cat, ci) => {
            const r = s.ranks[ci];
            return `${cat} ${isValidRank(r) ? `#${r}` : "?"}`;
          }).join(", ")
        );
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      // horizontal rank grid lines
      for (const rank of rankTicks) {
        const ty = rankToY(rank);
        svgChildren.push(h("line", {
          key: `rg${rank}`,
          class: "st-bumpChart__grid",
          x1: MARGIN.left, x2: width - MARGIN.right,
          y1: ty, y2: ty,
        }));
        svgChildren.push(h("text", {
          key: `rl${rank}`,
          class: "st-bumpChart__rankLabel",
          x: MARGIN.left - 8, y: ty,
          "text-anchor": "end",
          "dominant-baseline": "middle",
        }, `#${rank}`));
      }

      // category labels
      for (let ci = 0; ci < categories.length; ci++) {
        svgChildren.push(h("text", {
          key: `cat${categories[ci]}`,
          class: "st-bumpChart__catLabel",
          x: catToX(ci),
          y: height - MARGIN.bottom + 16,
          "text-anchor": "middle",
        }, categories[ci]));
      }

      // FIX: composite key to avoid duplicates on s.label
      for (const s of seriesList) {
        const si = s.index;
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== s.index;
        const isActive = hoveredIndex.value === s.index;

        svgChildren.push(h("path", {
          key: `line${si}-${s.label}`,
          class: classNames(
            "st-bumpChart__line",
            `st-bumpChart__line--${s.tone}`,
            isDim ? "st-bumpChart__line--dim" : undefined,
            isActive ? "st-bumpChart__line--active" : undefined,
          ),
          d: s.path,
          fill: "none",
          "data-chart-index": s.index,
        }));

        // FIX: dots only for valid ranks (non-null)
        for (let ci = 0; ci < s.points.length; ci++) {
          const pt = s.points[ci];
          if (pt === null) continue;
          svgChildren.push(h("circle", {
            key: `dot${si}-${s.label}-${ci}`,
            class: classNames(
              "st-bumpChart__dot",
              `st-bumpChart__dot--${s.tone}`,
              isDim ? "st-bumpChart__dot--dim" : undefined,
            ),
            cx: pt.x, cy: pt.y, r: 4,
            "data-chart-index": s.index,
          }));
        }

        // end label: last valid point
        if (s.points.some((p) => p !== null)) {
          const lastValidPt = [...s.points].reverse().find((p) => p !== null);
          const firstValidPt = s.points.find((p) => p !== null);
          const validCount = s.points.filter((p) => p !== null).length;

          if (lastValidPt) {
            svgChildren.push(h("text", {
              key: `el${si}`,
              class: "st-bumpChart__seriesLabel",
              x: lastValidPt.x + 8, y: lastValidPt.y,
              "dominant-baseline": "middle",
            }, s.label));
          }
          if (firstValidPt && validCount > 1) {
            svgChildren.push(h("text", {
              key: `sl${si}`,
              class: "st-bumpChart__seriesLabel",
              x: firstValidPt.x - 8, y: firstValidPt.y,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            }, s.label));
          }
        }
      }

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-bumpChart__visual",
          role: "img",
          "aria-label": label,
          onPointermove: handlePointerMove,
          onPointerleave: handleLeave,
        }, [
          h("svg", {
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: "xMidYMid meet",
            width: "100%", height: "100%",
            focusable: "false", "aria-hidden": "true",
          }, svgChildren),
        ]),
        chartDataList(label, dataValueItems),
      ];

      return h("div", { ...attrs, class: classNames("st-bumpChart", props.class) }, children);
    };
  },
});
