import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type StatusHistoryTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StatusHistoryBucket = {
  at: number;
  value: string | number;
  tone?: StatusHistoryTone;
};

export type StatusHistorySeries = {
  series: string;
  buckets: StatusHistoryBucket[];
};

export type StatusHistoryChartProps = {
  data: StatusHistorySeries[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

export const StatusHistoryChart = defineComponent({
  name: "StatusHistoryChart",
  props: {
    data: { type: Array as () => StatusHistorySeries[], default: () => [] },
    label: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: 320 },
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
      const height = props.height ?? 320;
      const resolvedWidth = props.width ?? props.size ?? 640;

      const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Normalise: drop unlabeled series and non-finite buckets.
      const validData = data
        .filter((d) => typeof d.series === "string" && d.series.length > 0)
        .map((d) => ({
          series: d.series,
          buckets: (d.buckets ?? [])
            .filter((b) => Number.isFinite(b.at))
            .map((b) => ({ at: b.at, value: b.value, tone: b.tone })),
        }));

      // Distinct time columns (by `at`, ascending).
      const columnOrder: number[] = [];
      for (const d of validData) {
        for (const b of d.buckets) {
          if (!columnOrder.includes(b.at)) columnOrder.push(b.at);
        }
      }
      columnOrder.sort((a, b) => a - b);

      // Distinct statuses (first-seen order) → categoryN index (1..8, cycled)
      // when no explicit `tone`. An explicit `tone` on a bucket wins.
      const statusOrder: string[] = [];
      const explicitToneByStatus = new Map<string, StatusHistoryTone>();
      for (const d of validData) {
        for (const b of d.buckets) {
          const key = String(b.value);
          if (!statusOrder.includes(key)) statusOrder.push(key);
          if (b.tone) explicitToneByStatus.set(key, b.tone);
        }
      }
      const toneOf = (bucket: { value: string | number; tone?: StatusHistoryTone }): StatusHistoryTone => {
        if (bucket.tone) return bucket.tone;
        const key = String(bucket.value);
        const explicit = explicitToneByStatus.get(key);
        if (explicit) return explicit;
        const idx = statusOrder.indexOf(key);
        return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StatusHistoryTone;
      };
      const legendItems = statusOrder.map((value) => ({ value, tone: toneOf({ value }) }));
      const hasLegend = statusOrder.length > 0;

      type RowCell = {
        key: string;
        datum: (typeof validData)[number]["buckets"][number];
        x: number;
        width: number;
        cx: number;
        tone: StatusHistoryTone;
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
        const rowHeight = Math.min(band * 0.62, 28);
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
              tone: toneOf(b),
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
        (d) => `${d.series}: ${d.buckets.map((b) => `${b.at} = ${b.value}`).join(", ")}`,
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // tick labels (time axis)
      for (const column of columns) {
        svgChildren.push(
          h(
            "text",
            {
              key: `t${column.at}`,
              class: "st-statusHistoryChart__tickLabel",
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
        h("line", { class: "st-statusHistoryChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
      );
      svgChildren.push(
        h("line", { class: "st-statusHistoryChart__axis", x1: MARGIN.left, x2: resolvedWidth - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      // one row per series + left label + status cells per bucket
      for (const row of rows) {
        const i = row.index;
        svgChildren.push(
          h(
            "text",
            {
              key: `lbl${i}`,
              class: "st-statusHistoryChart__seriesLabel",
              x: MARGIN.left - 8,
              y: row.rowCenterY,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            ellipsize(row.datum.series, 18),
          ),
        );
        for (const cell of row.cells) {
          const isDim = hoveredKey.value !== null && hoveredKey.value !== cell.key;
          svgChildren.push(
            h("rect", {
              key: `cell${cell.key}`,
              class: classNames(
                "st-statusHistoryChart__cell",
                `st-statusHistoryChart__cell--${cell.tone}`,
                isDim ? "st-statusHistoryChart__cell--dim" : undefined,
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
            class: "st-statusHistoryChart__visual",
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
          h(
            "ul",
            { class: "st-statusHistoryChart__legend", "aria-label": `Statuts de ${label ?? "status history"}` },
            legendItems.map((item) =>
              h("li", { key: item.value, class: "st-statusHistoryChart__legendItem" }, [
                h("span", {
                  class: `st-statusHistoryChart__legendSwatch st-statusHistoryChart__legendSwatch--${item.tone}`,
                  "aria-hidden": "true",
                }),
                item.value,
              ]),
            ),
          ),
        );
      }

      children.push(chartDataList(label ?? "status history", dataValueItems));

      if (hovered) {
        children.push(
          h(
            "div",
            {
              class: "st-statusHistoryChart__tooltip",
              role: "presentation",
              style: `left:${(hovered.cell.cx / resolvedWidth) * 100}%;top:${(hovered.row.rowCenterY / height) * 100}%`,
            },
            [
              h("span", { class: "st-statusHistoryChart__tooltipLabel" }, `${hovered.row.datum.series} · ${hovered.cell.datum.at}`),
              h("span", { class: "st-statusHistoryChart__tooltipValue" }, `${hovered.cell.datum.value}`),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-statusHistoryChart", props.class) }, children);
    };
  },
});
