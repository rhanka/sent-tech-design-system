import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type MarimekkoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type MarimekkoChartSegment = {
  label: string;
  value: number;
  tone?: MarimekkoChartTone;
};

export type MarimekkoChartDatum = {
  label: string;
  width: number;
  segments: MarimekkoChartSegment[];
};

export type MarimekkoChartProps = {
  data: MarimekkoChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const TONES: MarimekkoChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 12, right: 16, bottom: 32, left: 8 };

export const MarimekkoChart = defineComponent({
  name: "MarimekkoChart",
  props: {
    data: { type: Array as () => MarimekkoChartDatum[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 300 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredKey = ref<string | null>(null);

    function handleLeave() {
      hoveredKey.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) { hoveredKey.value = null; return; }
      hoveredKey.value = target.getAttribute("data-chart-key") ?? null;
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 300;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // FIX: ignore (skip) non-finite or <=0 widths, NO Math.abs
      let totalWidth = 0;
      for (const d of data) {
        const w = d.width;
        if (Number.isFinite(w) && w > 0) totalWidth += w;
      }
      if (totalWidth <= 0) totalWidth = 1;

      type Cell = {
        key: string;
        catLabel: string;
        segLabel: string;
        tone: MarimekkoChartTone;
        x: number;
        y: number;
        w: number;
        h: number;
        cx: number;
        cy: number;
        pct: number;
        colPct: number;
      };

      const cells: Cell[] = [];
      let xCursor = MARGIN.left;

      for (const datum of data) {
        const safeW = Number.isFinite(datum.width) && datum.width > 0 ? datum.width : 0;
        // FIX: skip invalid columns
        if (safeW <= 0) continue;
        const colW = (safeW / totalWidth) * plotWidth;
        const colPct = safeW / totalWidth;

        // FIX: ignore non-finite or <=0 segments (NO Math.abs, NO 0.5px floor)
        const validSegs = datum.segments.filter(
          (s) => Number.isFinite(s.value) && s.value > 0
        );
        const segSum = validSegs.reduce((acc, s) => acc + s.value, 0);
        const safeSum = segSum > 0 ? segSum : 1;

        let yCursor = MARGIN.top;
        for (let si = 0; si < validSegs.length; si++) {
          const seg = validSegs[si];
          const pct = seg.value / safeSum;
          const segH = pct * plotHeight;
          const tone = seg.tone ?? TONES[si % TONES.length];
          cells.push({
            key: `${datum.label}-${seg.label}`,
            catLabel: datum.label,
            segLabel: seg.label,
            tone,
            x: xCursor,
            y: yCursor,
            // FIX: no floor at 0.5px for zeros (they are filtered)
            w: Math.max(colW - 1, 1),
            h: Math.max(segH, 1),
            cx: xCursor + colW / 2,
            cy: yCursor + segH / 2,
            pct,
            colPct,
          });
          yCursor += segH;
        }
        xCursor += colW;
      }

      // FIX a11y: SR includes column width share (colPct) in addition to segment %
      const dataValueItems = cells.map(
        (c) =>
          `${c.catLabel}, ${c.segLabel}: ${Math.round(c.pct * 100)}% (colonne ${Math.round(c.colPct * 100)}%)`
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // axis
      svgChildren.push(h("line", {
        class: "st-marimekkoChart__axis",
        x1: MARGIN.left, x2: width - MARGIN.right,
        y1: height - MARGIN.bottom, y2: height - MARGIN.bottom,
      }));

      // cells
      for (const cell of cells) {
        const isDim = hoveredKey.value !== null && hoveredKey.value !== cell.key;
        svgChildren.push(h("rect", {
          key: cell.key,
          class: classNames(
            "st-marimekkoChart__cell",
            `st-marimekkoChart__cell--${cell.tone}`,
            isDim ? "st-marimekkoChart__cell--dim" : undefined,
          ),
          x: cell.x, y: cell.y, width: cell.w, height: cell.h,
          "data-chart-key": cell.key,
        }));
        if (cell.w > 28 && cell.h > 14) {
          svgChildren.push(h("text", {
            key: `lbl-${cell.key}`,
            class: "st-marimekkoChart__cellLabel",
            x: cell.cx, y: cell.cy,
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            style: `fill:${contrastTextForTone(cell.tone)}`,
            "pointer-events": "none",
          }, `${Math.round(cell.pct * 100)}%`));
        }
      }

      // category labels below axis
      let xCursor2 = MARGIN.left;
      for (const datum of data) {
        const safeW = Number.isFinite(datum.width) && datum.width > 0 ? datum.width : 0;
        if (safeW <= 0) continue;
        const colW = (safeW / totalWidth) * plotWidth;
        const startX = cells.find((c) => c.catLabel === datum.label)?.x ?? MARGIN.left;
        svgChildren.push(h("text", {
          key: `cat-${datum.label}`,
          class: "st-marimekkoChart__catLabel",
          x: startX + colW / 2,
          y: height - MARGIN.bottom + 16,
          "text-anchor": "middle",
        }, datum.label));
        xCursor2 += colW;
      }

      const hoveredCell =
        hoveredKey.value !== null ? cells.find((c) => c.key === hoveredKey.value) ?? null : null;

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-marimekkoChart__visual",
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

      if (hoveredCell) {
        children.push(h("div", {
          class: "st-marimekkoChart__tooltip",
          role: "presentation",
          style: `left:${(hoveredCell.cx / width) * 100}%;top:${(hoveredCell.cy / height) * 100}%`,
        }, [
          h("span", { class: "st-marimekkoChart__tooltipLabel" }, `${hoveredCell.catLabel} / ${hoveredCell.segLabel}`),
          h("span", { class: "st-marimekkoChart__tooltipValue" }, `${Math.round(hoveredCell.pct * 100)}%`),
        ]));
      }

      return h("div", { ...attrs, class: classNames("st-marimekkoChart", props.class) }, children);
    };
  },
});
