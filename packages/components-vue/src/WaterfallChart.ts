import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WaterfallType = "increase" | "decrease" | "total";

export type WaterfallChartDatum = {
  label: string;
  value: number;
  type?: WaterfallType;
};

export type WaterfallChartProps = {
  data: WaterfallChartDatum[];
  width?: number;
  height?: number;
  connectors?: boolean;
  format?: (value: number) => string;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

export const WaterfallChart = defineComponent({
  name: "WaterfallChart",
  props: {
    data: { type: Array as () => WaterfallChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    connectors: { type: Boolean, default: true },
    format: { type: Function as unknown as () => (value: number) => string, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredIndex.value = null;
        return;
      }
      const index = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const data = props.data ?? [];
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const connectors = props.connectors ?? true;
      const format = props.format;
      const label = props.label;

      const formatValue = (v: number): string => (format ? format(v) : formatTick(v));

      type Computed = {
        datum: WaterfallChartDatum;
        type: WaterfallType;
        start: number;
        end: number;
        displayValue: number;
        cumulative: number;
      };

      let cumulative = 0;
      let seeded = false; // un pas non-total a-t-il déjà alimenté le cumul ?
      const computed: Computed[] = data.map((d) => {
        // Valeurs non finies neutralisées (jamais de NaN dans la géométrie/DOM).
        const raw = Number.isFinite(d.value) ? d.value : 0;
        const type: WaterfallType = d.type ?? (raw >= 0 ? "increase" : "decrease");
        let start: number;
        let end: number;
        let displayValue: number;
        if (type === "total") {
          // Un total ouvrant (aucun pas antérieur) amorce le cumul avec sa valeur ;
          // un total de clôture est ANCRÉ au cumul réel, la valeur saisie étant
          // ignorée pour la géométrie (barre et connecteur coïncident toujours).
          start = 0;
          end = seeded ? cumulative : Math.abs(raw);
          cumulative = end;
          seeded = true;
          displayValue = end;
        } else {
          // Le signe est imposé par le type : increase = +|v|, decrease = -|v|.
          const signed = type === "increase" ? Math.abs(raw) : -Math.abs(raw);
          start = cumulative;
          end = cumulative + signed;
          cumulative = end;
          seeded = true;
          displayValue = signed;
        }
        const resolvedType: WaterfallType = type;
        return { datum: d, type: resolvedType, start, end, displayValue, cumulative };
      });

      const bounds = computed.flatMap((c) => [c.start, c.end]);
      const minRaw = Math.min(0, ...bounds);
      const maxRaw = Math.max(0, ...bounds);
      const ticks = niceTicks(minRaw, maxRaw, 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type Bar = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        type: WaterfallType;
        datum: WaterfallChartDatum;
        displayValue: number;
        cumulative: number;
        index: number;
      };

      let bars: Bar[] = [];
      if (computed.length !== 0) {
        const band = plotWidth / computed.length;
        const barWidth = band * 0.62;
        bars = computed.map((c, i) => {
          const startY = scaleLinear(c.start, domainMin, domainMax, plotHeight, 0);
          const endY = scaleLinear(c.end, domainMin, domainMax, plotHeight, 0);
          const y = Math.min(startY, endY);
          const hh = Math.abs(endY - startY);
          const x = MARGIN.left + band * i + (band - barWidth) / 2;
          return {
            x,
            y: MARGIN.top + y,
            width: barWidth,
            height: Math.max(hh, 0.5),
            cx: MARGIN.left + band * (i + 0.5),
            cy: MARGIN.top + Math.min(startY, endY),
            type: c.type,
            datum: c.datum,
            displayValue: c.displayValue,
            cumulative: c.cumulative,
            index: i,
          };
        });
      }

      const connectorLines: { x1: number; x2: number; y: number }[] = [];
      if (connectors && bars.length >= 2) {
        for (let i = 0; i < computed.length - 1; i++) {
          const level = computed[i].end;
          const y = MARGIN.top + scaleLinear(level, domainMin, domainMax, plotHeight, 0);
          // Du bord droit de la barre i au bord gauche de la barre i+1.
          connectorLines.push({ x1: bars[i].x + bars[i].width, x2: bars[i + 1].x, y });
        }
      }

      const valueAxisTicks = ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
      }));

      const zeroY = MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);

      const dataValueItems = computed.map((c) => `${c.datum.label}: ${formatValue(c.displayValue)}`);

      const legendItems: { type: WaterfallType; label: string }[] = [
        { type: "increase", label: "Hausse" },
        { type: "decrease", label: "Baisse" },
        { type: "total", label: "Total" },
      ];

      const svgChildren: ReturnType<typeof h>[] = [];

      for (const tick of valueAxisTicks) {
        svgChildren.push(
          h("line", { key: `g${tick.value}`, class: "st-waterfallChart__grid", x1: tick.x1, x2: tick.x2, y1: tick.y, y2: tick.y }),
          h(
            "text",
            { key: `t${tick.value}`, class: "st-waterfallChart__tickLabel", x: MARGIN.left - 6, y: tick.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(tick.value),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-waterfallChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-waterfallChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        h("line", { class: "st-waterfallChart__zero", x1: MARGIN.left, x2: width - MARGIN.right, y1: zeroY, y2: zeroY }),
      );

      connectorLines.forEach((line, i) => {
        svgChildren.push(
          h("line", { key: `c${i}`, class: "st-waterfallChart__connector", x1: line.x1, x2: line.x2, y1: line.y, y2: line.y }),
        );
      });

      bars.forEach((bar) => {
        svgChildren.push(
          h(
            "text",
            { key: `cl${bar.datum.label}`, class: "st-waterfallChart__categoryLabel", x: bar.x + bar.width / 2, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            bar.datum.label,
          ),
        );
      });

      bars.forEach((bar, i) => {
        svgChildren.push(
          h("rect", {
            key: `b${bar.datum.label}`,
            class: `st-waterfallChart__bar st-waterfallChart__bar--${bar.type}`,
            x: bar.x,
            y: bar.y,
            width: bar.width,
            height: bar.height,
            rx: "2",
            "data-chart-index": i,
          }),
        );
      });

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-waterfallChart__visual",
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
        h(
          "ul",
          { class: "st-waterfallChart__legend", "aria-hidden": "true" },
          legendItems.map((item) =>
            h("li", { key: item.type, class: "st-waterfallChart__legendItem" }, [
              h("span", { class: `st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--${item.type}` }),
              ` ${item.label}`,
            ]),
          ),
        ),
      ];

      const hoveredIdx = hoveredIndex.value;
      if (hoveredIdx !== null && bars[hoveredIdx]) {
        const bar = bars[hoveredIdx];
        children.push(
          h(
            "div",
            {
              class: "st-waterfallChart__tooltip",
              role: "presentation",
              style: `left: ${(bar.cx / width) * 100}%; top: ${(bar.cy / height) * 100}%`,
            },
            [
              h("span", { class: "st-waterfallChart__tooltipLabel" }, bar.datum.label),
              h("span", { class: "st-waterfallChart__tooltipValue" }, formatValue(bar.displayValue)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-waterfallChart", props.class) }, children);
    };
  },
});
