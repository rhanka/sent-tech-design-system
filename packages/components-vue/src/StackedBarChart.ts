import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type StackedBarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StackedBarSegment = {
  label: string;
  value: number;
  tone?: StackedBarTone;
};

export type StackedBarDatum = {
  label: string;
  segments: StackedBarSegment[];
};

export type StackedBarChartProps = {
  data: StackedBarDatum[];
  width?: number;
  height?: number;
  label: string;
  showLegend?: boolean;
  /**
   * Per-segment value labels. `false`/absent (default) → none. `true` → each
   * segment's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override (default `center` of the segment). Segments too
   * short to host a legible label are skipped. Labels are `aria-hidden` — the
   * values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * Interactive legend (FR-4). Ids/labels of series hidden from the render
   * (controlled by the parent; default = all visible). Each segment whose
   * `label` ∈ `hiddenSeries` is omitted and its legend item is shown "off"
   * (`aria-pressed`). Undefined → legacy non-interactive legend, unless
   * `onToggleSeries` is provided.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 } as const;

// A segment must be at least this tall (px) to host a legible label.
const DATA_LABEL_MIN_SEG_PX = 14;

const TONES: StackedBarTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type Seg = {
  x: number;
  y: number;
  width: number;
  height: number;
  seg: StackedBarSegment;
  tone: StackedBarTone;
  cx: number;
  cy: number;
};

type Bar = { x: number; band: number; label: string; segs: Seg[]; cxLabel: number };

export const StackedBarChart = defineComponent({
  name: "StackedBarChart",
  props: {
    data: { type: Array as () => StackedBarDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 260 },
    label: { type: String, required: true },
    showLegend: { type: Boolean, default: true },
    dataLabels: { type: [Boolean, Object] as unknown as () => DataLabelsProp, default: undefined },
    hiddenSeries: { type: Array as () => string[], default: undefined },
    onToggleSeries: { type: Function as unknown as () => (seriesId: string) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hovered = ref<{ bar: number; seg: number } | null>(null);

    function handleLeave() {
      hovered.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hovered.value = null;
        return;
      }
      const bar = Number(target.getAttribute("data-bar-index"));
      const seg = Number(target.getAttribute("data-segment-index"));
      hovered.value = Number.isInteger(bar) && Number.isInteger(seg) ? { bar, seg } : null;
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 260;
      const showLegend = props.showLegend ?? true;
      const label = props.label;
      const data = props.data;

      // Interactive legend is active as soon as the parent wires either prop.
      const legendInteractive = props.onToggleSeries !== undefined || props.hiddenSeries !== undefined;
      const hiddenSet = new Set(props.hiddenSeries ?? []);

      const seen = new Map<string, StackedBarTone>();
      data.forEach((bar) =>
        bar.segments.forEach((seg, i) => {
          if (!seen.has(seg.label)) seen.set(seg.label, seg.tone ?? TONES[i % TONES.length]);
        }),
      );
      const legend = [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));

      const totals = data.map((b) =>
        b.segments.reduce((s, x) => (hiddenSet.has(x.label) ? s : s + Math.max(x.value, 0)), 0),
      );
      const ticks = niceTicks(0, Math.max(0, ...totals));
      const domainMax = ticks[ticks.length - 1];
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      let bars: Bar[] = [];
      if (data.length !== 0) {
        const band = plotW / data.length;
        const barWidth = band * 0.6;
        bars = data.map((bar, bi) => {
          const x = MARGIN.left + band * bi + (band - barWidth) / 2;
          let acc = 0;
          // Tone is bound to the original segment index so it stays stable when
          // a series is toggled off; hidden segments are dropped before stacking.
          const segs = bar.segments
            .map((seg, si) => ({ seg, tone: seg.tone ?? TONES[si % TONES.length] }))
            .filter(({ seg }) => !hiddenSet.has(seg.label))
            .map(({ seg, tone }) => {
              const v = Math.max(seg.value, 0);
              const yTop = MARGIN.top + scaleLinear(acc + v, 0, domainMax, plotH, 0);
              const yBottom = MARGIN.top + scaleLinear(acc, 0, domainMax, plotH, 0);
              acc += v;
              return {
                x,
                y: yTop,
                width: barWidth,
                height: Math.max(yBottom - yTop, 0),
                seg,
                tone,
                cx: x + barWidth / 2,
                cy: yTop + (yBottom - yTop) / 2,
              };
            });
          return { x, band, label: bar.label, segs, cxLabel: MARGIN.left + band * (bi + 0.5) };
        });
      }

      const dataValueItems = data.flatMap((bar) =>
        bar.segments.filter((seg) => !hiddenSet.has(seg.label)).map((seg) => `${bar.label}, ${seg.label}: ${seg.value}`),
      );

      // --- Data labels ------------------------------------------------------
      // One value label centred in each segment (default `center`). Segments
      // shorter than DATA_LABEL_MIN_SEG_PX are skipped so labels stay legible.
      // aria-hidden (values are in the ChartDataList already).
      const dataLabelOpts = normalizeDataLabels(props.dataLabels);
      const dataLabelItems = dataLabelOpts.enabled
        ? bars.flatMap((bar) =>
            bar.segs
              .filter((s) => s.height >= DATA_LABEL_MIN_SEG_PX)
              .map((s) => ({
                key: `${bar.label}-${s.seg.label}`,
                x: s.cx,
                y: s.cy,
                text: formatDataLabel(s.seg.value, dataLabelOpts, formatTick),
              })),
          )
        : [];

      const svgChildren: ReturnType<typeof h>[] = [];
      for (const t of ticks) {
        const y = MARGIN.top + scaleLinear(t, 0, domainMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `g${t}`, class: "st-stackedBar__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `t${t}`, class: "st-stackedBar__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-stackedBar__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-stackedBar__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      bars.forEach((bar, bi) => {
        svgChildren.push(
          h(
            "text",
            { key: `cat${bar.label}`, class: "st-stackedBar__categoryLabel", x: bar.cxLabel, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            bar.label,
          ),
        );
        bar.segs.forEach((s, si) => {
          svgChildren.push(
            h("rect", {
              key: `seg${bar.label}-${s.seg.label}`,
              class: classNames(
                "st-stackedBar__seg",
                `st-stackedBar__seg--${s.tone}`,
                hovered.value !== null && !(hovered.value.bar === bi && hovered.value.seg === si) && "st-stackedBar__seg--dim",
              ),
              x: s.x,
              y: s.y,
              width: s.width,
              height: s.height,
              "data-bar-index": bi,
              "data-segment-index": si,
            }),
          );
        });
      });

      // Data labels — one value per segment, drawn on top. aria-hidden.
      if (dataLabelItems.length > 0) {
        svgChildren.push(
          h(
            "g",
            { class: "st-stackedBar__dataLabels", "aria-hidden": "true" },
            dataLabelItems.map((d) =>
              h(
                "text",
                {
                  key: `dl-${d.key}`,
                  class: "st-stackedBar__dataLabel",
                  x: d.x,
                  y: d.y,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                },
                d.text,
              ),
            ),
          ),
        );
      }

      const hoveredSeg = hovered.value && bars[hovered.value.bar]?.segs[hovered.value.seg];

      return h("div", { ...attrs, class: classNames("st-stackedBar", props.class) }, [
        h(
          "div",
          {
            class: "st-stackedBar__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${width} ${height}`,
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
        chartDataList(label, dataValueItems),
        hoveredSeg
          ? h(
              "div",
              {
                class: "st-stackedBar__tooltip",
                role: "presentation",
                style: `left: ${(hoveredSeg.cx / width) * 100}%; top: ${(hoveredSeg.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-stackedBar__tooltipLabel" }, hoveredSeg.seg.label),
                h("span", { class: "st-stackedBar__tooltipValue" }, String(hoveredSeg.seg.value)),
              ],
            )
          : null,
        showLegend && legend.length > 0
          ? h(
              "ul",
              { class: "st-stackedBar__legend" },
              legend.map((item) => {
                const off = hiddenSet.has(item.seriesLabel);
                const swatch = h("span", {
                  class: classNames("st-stackedBar__legendSwatch", `st-stackedBar__legendSwatch--${item.tone}`),
                  "aria-hidden": "true",
                });
                return h(
                  "li",
                  {
                    key: item.seriesLabel,
                    class: classNames(
                      "st-stackedBar__legendItem",
                      legendInteractive && off && "st-stackedBar__legendItem--off",
                    ),
                  },
                  legendInteractive
                    ? [
                        h(
                          "button",
                          {
                            type: "button",
                            class: "st-stackedBar__legendButton",
                            "aria-pressed": off ? "true" : "false",
                            onClick: () => props.onToggleSeries?.(item.seriesLabel),
                          },
                          [swatch, ` ${item.seriesLabel}`],
                        ),
                      ]
                    : [swatch, item.seriesLabel],
                );
              }),
            )
          : null,
      ]);
    };
  },
});
