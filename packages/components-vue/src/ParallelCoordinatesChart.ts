import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type ParallelCoordinatesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParallelAxis = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

export type ParallelCoordinatesChartProps = {
  axes: ParallelAxis[];
  data: Record<string, unknown>[];
  label: string;
  // FIX: prop is `tones` (PLURAL) — consistency with other charts
  tones?: ParallelCoordinatesChartTone[];
  width?: number;
  height?: number;
  class?: string;
};

const TONES: ParallelCoordinatesChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// FIX: strict parse of a row value. Returns null if not finite → GAP in path.
function parseStrictFinite(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string" && raw !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Builds an SVG path with GAP (M...L... M...) for null points.
 */
function buildPathWithGaps(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  for (const pt of points) {
    if (pt === null) {
      if (segment.length > 0) {
        parts.push(
          segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
        );
        segment = [];
      }
    } else {
      segment.push(pt);
    }
  }
  if (segment.length > 0) {
    parts.push(
      segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
    );
  }
  return parts.join(" ");
}

export const ParallelCoordinatesChart = defineComponent({
  name: "ParallelCoordinatesChart",
  props: {
    axes: { type: Array as () => ParallelAxis[], default: () => [] },
    data: { type: Array as () => Record<string, unknown>[], default: () => [] },
    label: { type: String, required: true },
    // FIX: plural tones
    tones: { type: Array as () => ParallelCoordinatesChartTone[], default: undefined },
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
      const axes = props.axes ?? [];
      const data = props.data ?? [];
      const label = props.label;
      const tonesArr = props.tones ?? [];
      const width = props.width ?? 480;
      const height = props.height ?? 300;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // FIX: per-axis domains with strict parse
      function axisDomain(axis: ParallelAxis): { min: number; max: number } {
        const vals = data
          .map((d) => {
            const raw = d[axis.key];
            if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
            if (typeof raw === "string" && raw !== "") {
              const n = Number(raw);
              return Number.isFinite(n) ? n : null;
            }
            return null;
          })
          .filter((v): v is number => v !== null);

        const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
        const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
        const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;

        return {
          min: Number.isFinite(axis.min) ? (axis.min as number) : rawMin,
          max: Number.isFinite(axis.max) ? (axis.max as number) : safeMax,
        };
      }

      const axisX = axes.map(
        (_, i) =>
          MARGIN.left +
          (axes.length <= 1 ? plotWidth / 2 : (i / (axes.length - 1)) * plotWidth)
      );

      const lines = data.map((row, ri) => {
        const rowTone = tonesArr[ri] ?? TONES[ri % TONES.length];
        const points: ({ x: number; y: number } | null)[] = axes.map((axis, ai) => {
          const domain = axisDomain(axis);
          // FIX: strict parse → null if invalid
          const val = parseStrictFinite(row[axis.key]);
          if (val === null) return null; // GAP
          // FIX: clamp to domain bounds
          const clamped = Math.min(Math.max(val, domain.min), domain.max);
          const t =
            domain.max === domain.min
              ? 0.5
              : (clamped - domain.min) / (domain.max - domain.min);
          return { x: axisX[ai], y: MARGIN.top + (1 - t) * plotHeight };
        });
        return { points, tone: rowTone, index: ri, row, path: buildPathWithGaps(points) };
      });

      const dataValueItems = data.map((row) =>
        axes.map((axis) => `${axis.label}: ${row[axis.key] ?? ""}`).join(", ")
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // polylines
      for (const line of lines) {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== line.index;
        const isActive = hoveredIndex.value === line.index;
        svgChildren.push(h("path", {
          key: `line${line.index}`,
          class: classNames(
            "st-parallelCoordinatesChart__line",
            `st-parallelCoordinatesChart__line--${line.tone}`,
            isDim ? "st-parallelCoordinatesChart__line--dim" : undefined,
            isActive ? "st-parallelCoordinatesChart__line--active" : undefined,
          ),
          d: line.path,
          fill: "none",
          "data-chart-index": line.index,
        }));
      }

      // axes and labels
      for (let ai = 0; ai < axes.length; ai++) {
        const axis = axes[ai];
        const domain = axisDomain(axis);
        const ax = axisX[ai];
        svgChildren.push(h("line", {
          key: `ax${axis.key}`,
          class: "st-parallelCoordinatesChart__axis",
          x1: ax, x2: ax,
          y1: MARGIN.top, y2: MARGIN.top + plotHeight,
        }));
        svgChildren.push(h("text", {
          key: `lbl${axis.key}`,
          class: "st-parallelCoordinatesChart__axisLabel",
          x: ax, y: MARGIN.top - 10,
          "text-anchor": "middle",
        }, axis.label));
        // min/max ticks
        svgChildren.push(h("text", {
          key: `tmin${axis.key}`,
          class: "st-parallelCoordinatesChart__tickLabel",
          x: ax + 4, y: MARGIN.top + plotHeight,
          "dominant-baseline": "auto",
        }, formatTick(domain.min)));
        svgChildren.push(h("text", {
          key: `tmax${axis.key}`,
          class: "st-parallelCoordinatesChart__tickLabel",
          x: ax + 4, y: MARGIN.top,
          "dominant-baseline": "hanging",
        }, formatTick(domain.max)));
      }

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-parallelCoordinatesChart__visual",
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

      return h("div", { ...attrs, class: classNames("st-parallelCoordinatesChart", props.class) }, children);
    };
  },
});
