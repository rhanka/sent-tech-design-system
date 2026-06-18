import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type AnomalySwimLaneTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AnomalySwimLaneChartScale = "categorical" | "sequential";

export type AnomalySwimLaneBucket = {
  at: number;
  score: number;
};

export type AnomalySwimLaneSeries = {
  job: string;
  buckets: AnomalySwimLaneBucket[];
};

export type AnomalySwimLaneChartProps = {
  data: AnomalySwimLaneSeries[];
  max?: number;
  scale?: AnomalySwimLaneChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 132 };
const TONES: AnomalySwimLaneTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function normalizedScale(value: AnomalySwimLaneChartScale | undefined): AnomalySwimLaneChartScale {
  return value === "categorical" ? "categorical" : "sequential";
}

// Continuous scale: score intensity normalised 0..max → category1..8 (shared
// with HeatmapChart). max ≤ 0 or non-finite score → category1 (floor intensity).
function toneForScore(score: number, scoreMax: number): AnomalySwimLaneTone {
  if (!Number.isFinite(score) || scoreMax <= 0) return "category1";
  const ratio = Math.max(0, Math.min(1, score / scoreMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

export const AnomalySwimLaneChart = defineComponent({
  name: "AnomalySwimLaneChart",
  props: {
    data: { type: Array as () => AnomalySwimLaneSeries[], default: () => [] },
    max: { type: Number, default: undefined },
    scale: { type: String as () => AnomalySwimLaneChartScale, default: "sequential" },
    label: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: 300 },
    size: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredKey = ref<string | null>(null);

    function handleLeave() {
      hoveredKey.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredKey.value = null;
        return;
      }
      hoveredKey.value = target.getAttribute("data-chart-key");
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const height = props.height ?? 300;
      const resolvedWidth = props.width ?? props.size ?? 520;
      const resolvedScale = normalizedScale(props.scale);

      const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Normalise: drop unlabeled jobs and non-finite buckets.
      const validData = data
        .filter((d) => typeof d.job === "string" && d.job.length > 0)
        .map((d) => ({
          job: d.job,
          buckets: (d.buckets ?? [])
            .filter((b) => Number.isFinite(b.at))
            .map((b) => ({ at: b.at, score: b.score })),
        }));

      // Distinct time columns (by `at`, ascending).
      const columnOrder: number[] = [];
      for (const d of validData) {
        for (const b of d.buckets) {
          if (!columnOrder.includes(b.at)) columnOrder.push(b.at);
        }
      }
      columnOrder.sort((a, b) => a - b);

      // Effective max score: `max` prop when finite and > 0, else from data.
      const scoreMax = (() => {
        if (typeof props.max === "number" && Number.isFinite(props.max) && props.max > 0) return props.max;
        const scores = validData
          .flatMap((d) => d.buckets.map((b) => b.score))
          .filter(Number.isFinite);
        return scores.length > 0 ? Math.max(...scores) : 1;
      })();

      type RowCell = {
        key: string;
        datum: (typeof validData)[number]["buckets"][number];
        x: number;
        width: number;
        cx: number;
        tone: AnomalySwimLaneTone;
      };
      type Row = {
        datum: (typeof validData)[number];
        index: number;
        y: number;
        height: number;
        rowCenterY: number;
        cells: RowCell[];
      };

      let rows: Row[] = [];
      if (validData.length > 0 && columnOrder.length > 0) {
        const band = plotHeight / validData.length;
        const rowHeight = Math.min(band * 0.78, 34);
        const colWidth = plotWidth / columnOrder.length;
        rows = validData.map((d, i) => {
          const y = MARGIN.top + band * i + (band - rowHeight) / 2;
          const cells = d.buckets.map((b, j) => {
            const colIndex = Math.max(0, columnOrder.indexOf(b.at));
            const x = MARGIN.left + colIndex * colWidth;
            const w = Math.max(colWidth - 2, 1);
            return {
              key: `${i}-${j}`,
              datum: b,
              x,
              width: w,
              cx: x + w / 2,
              tone: toneForScore(b.score, scoreMax),
            };
          });
          return {
            datum: d,
            index: i,
            y,
            height: rowHeight,
            rowCenterY: MARGIN.top + band * (i + 0.5),
            cells,
          };
        });
      }

      const columns =
        columnOrder.length === 0
          ? []
          : columnOrder.map((at, index) => ({
              at,
              cx: MARGIN.left + (index + 0.5) * (plotWidth / columnOrder.length),
            }));

      const dataValueItems = validData.map(
        (d) => `${d.job}: ${d.buckets.map((b) => `${b.at} = ${b.score}`).join(", ")}`,
      );

      const legendItems = TONES.map((tone) => ({ tone }));
      const hasLegend = validData.length > 0 && columnOrder.length > 0;

      const svgChildren: ReturnType<typeof h>[] = [];

      // tick labels (time axis)
      for (const column of columns) {
        svgChildren.push(
          h(
            "text",
            {
              key: `t${column.at}`,
              class: "st-anomalySwimLaneChart__tickLabel",
              x: column.cx,
              y: height - MARGIN.bottom + 16,
              "text-anchor": "middle",
            },
            formatTick(column.at),
          ),
        );
      }

      // axes
      svgChildren.push(
        h("line", { class: "st-anomalySwimLaneChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
      );
      svgChildren.push(
        h("line", { class: "st-anomalySwimLaneChart__axis", x1: MARGIN.left, x2: resolvedWidth - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      // one row per job + left label + score cells per bucket
      for (const row of rows) {
        const i = row.index;
        svgChildren.push(
          h(
            "text",
            {
              key: `lbl${i}`,
              class: "st-anomalySwimLaneChart__jobLabel",
              x: MARGIN.left - 8,
              y: row.rowCenterY,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            ellipsize(row.datum.job, 18),
          ),
        );
        for (const cell of row.cells) {
          const isDim = hoveredKey.value !== null && hoveredKey.value !== cell.key;
          svgChildren.push(
            h("rect", {
              key: `cell${cell.key}`,
              class: classNames(
                "st-anomalySwimLaneChart__cell",
                `st-anomalySwimLaneChart__cell--${cell.tone}`,
                isDim ? "st-anomalySwimLaneChart__cell--dim" : undefined,
              ),
              x: cell.x,
              y: row.y,
              width: cell.width,
              height: row.height,
              rx: 2,
              "data-chart-key": cell.key,
            }),
          );
        }
      }

      let hovered: { row: Row; cell: RowCell } | null = null;
      if (hoveredKey.value !== null) {
        for (const row of rows) {
          for (const cell of row.cells) {
            if (cell.key === hoveredKey.value) hovered = { row, cell };
          }
        }
      }

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-anomalySwimLaneChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handlePointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${resolvedWidth} ${height}`,
                preserveAspectRatio: "xMidYMid meet",
                width: "100%",
                height: "100%",
                focusable: "false",
                "aria-hidden": "true",
              },
              svgChildren,
            ),
          ],
        ),
      ];

      if (hasLegend) {
        children.push(
          h("div", { class: "st-anomalySwimLaneChart__legend", "aria-hidden": "true" }, [
            h("span", { class: "st-anomalySwimLaneChart__legendText" }, "Low"),
            h(
              "span",
              { class: "st-anomalySwimLaneChart__legendRamp" },
              legendItems.map((item) =>
                h("span", {
                  key: item.tone,
                  class: `st-anomalySwimLaneChart__legendSwatch st-anomalySwimLaneChart__legendSwatch--${item.tone}`,
                }),
              ),
            ),
            h("span", { class: "st-anomalySwimLaneChart__legendText" }, "High"),
          ]),
        );
      }

      children.push(chartDataList(label ?? "anomaly swim lane", dataValueItems));

      if (hovered) {
        children.push(
          h(
            "div",
            {
              class: "st-anomalySwimLaneChart__tooltip",
              role: "presentation",
              style: `left:${(hovered.cell.cx / resolvedWidth) * 100}%;top:${(hovered.row.rowCenterY / height) * 100}%`,
            },
            [
              h("span", { class: "st-anomalySwimLaneChart__tooltipLabel" }, `${hovered.row.datum.job} · ${hovered.cell.datum.at}`),
              h("span", { class: "st-anomalySwimLaneChart__tooltipValue" }, `${hovered.cell.datum.score}`),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-anomalySwimLaneChart", `st-anomalySwimLaneChart--${resolvedScale}`, props.class) }, children);
    };
  },
});
