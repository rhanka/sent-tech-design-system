import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type BulletChartDatum = {
  label: string;
  value: number;
  target: number;
  ranges?: number[];
};

export type BulletChartProps = {
  data: BulletChartDatum[];
  label: string;
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 };
const RANGE_OPACITIES = [0.18, 0.30, 0.44];

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

export const BulletChart = defineComponent({
  name: "BulletChart",
  props: {
    data: { type: Array as () => BulletChartDatum[], default: () => [] },
    label: { type: String, required: true },
    orientation: { type: String as () => "horizontal" | "vertical", default: "horizontal" },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
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
      const label = props.label;
      const orientation = props.orientation ?? "horizontal";
      const width = props.width ?? 480;
      const height = props.height ?? 240;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // FIX: filter invalid data (non-finite value/target → skip)
      const validData = data.filter(
        (d) => Number.isFinite(d.value) && Number.isFinite(d.target)
      );

      // FIX: domain includes 0, values, targets AND ranges; negative domain supported
      const allDomainValues: number[] = [0];
      for (const d of validData) {
        allDomainValues.push(d.value, d.target);
        for (const r of d.ranges ?? []) {
          if (Number.isFinite(r)) allDomainValues.push(r);
        }
      }
      const rawMin = Math.min(...allDomainValues);
      const rawMax = Math.max(...allDomainValues);
      // Flat domain → fallback +1
      const domainMax = rawMax === rawMin ? rawMin + 1 : rawMax;
      const domainMin = rawMin;

      const ticks = niceTicks(domainMin, domainMax, 5);
      const tickDomainMin = ticks[0] ?? domainMin;
      const tickDomainMax = ticks[ticks.length - 1] ?? domainMax;

      // Position of baseline (value 0) in pixels
      const baselineX = MARGIN.left + scaleLinear(0, tickDomainMin, tickDomainMax, 0, plotWidth);
      const baselineY = MARGIN.top + scaleLinear(0, tickDomainMin, tickDomainMax, plotHeight, 0);

      const bandCount = validData.length;
      type BulletEntry = {
        datum: BulletChartDatum;
        index: number;
        barX: number;
        barY: number;
        barW: number;
        barH: number;
        targetX: number;
        targetY: number;
        targetH: number;
        labelY: number;
        labelX?: number;
        rangeBands: { x?: number; y?: number; width: number; height: number; opacity: number }[];
        tooltipX: number;
        tooltipY: number;
      };

      const bullets: BulletEntry[] = [];
      if (bandCount > 0) {
        if (orientation === "horizontal") {
          const bandH = plotHeight / bandCount;
          const barH = bandH * 0.35;
          const rangeH = bandH * 0.65;

          for (let i = 0; i < validData.length; i++) {
            const d = validData[i];
            const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
            const sortedRanges = [...ranges].sort((a, b) => a - b);
            const bandY = MARGIN.top + i * bandH;
            const cx = MARGIN.left + scaleLinear(d.value, tickDomainMin, tickDomainMax, 0, plotWidth);
            const targetX = MARGIN.left + scaleLinear(d.target, tickDomainMin, tickDomainMax, 0, plotWidth);

            const rangeBands = sortedRanges.map((r, ri) => {
              const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
              return {
                x: MARGIN.left + scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
                width:
                  scaleLinear(r, tickDomainMin, tickDomainMax, 0, plotWidth) -
                  scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
                opacity: RANGE_OPACITIES[ri] ?? 0.44,
                y: bandY + (bandH - rangeH) / 2,
                height: rangeH,
              };
            });

            // FIX: bar starts from baseline (0)
            const zeroX = baselineX;
            const barLeft = Math.min(zeroX, cx);
            const barRight = Math.max(zeroX, cx);

            bullets.push({
              datum: d,
              index: i,
              barX: barLeft,
              barY: bandY + (bandH - barH) / 2,
              barW: Math.max(barRight - barLeft, 0.5),
              barH,
              targetX,
              targetY: bandY + (bandH - rangeH) / 2,
              targetH: rangeH,
              labelY: bandY + bandH / 2,
              rangeBands,
              tooltipX: cx,
              tooltipY: bandY + bandH / 2,
            });
          }
        } else {
          const bandW = plotWidth / bandCount;
          const barW = bandW * 0.35;
          const rangeW = bandW * 0.65;

          for (let i = 0; i < validData.length; i++) {
            const d = validData[i];
            const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
            const sortedRanges = [...ranges].sort((a, b) => a - b);
            const bandX = MARGIN.left + i * bandW;
            const cy = MARGIN.top + scaleLinear(d.value, tickDomainMin, tickDomainMax, plotHeight, 0);
            const targetY = MARGIN.top + scaleLinear(d.target, tickDomainMin, tickDomainMax, plotHeight, 0);

            const rangeBands = sortedRanges.map((r, ri) => {
              const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
              return {
                y: MARGIN.top + scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0),
                height: Math.abs(
                  scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0) -
                    scaleLinear(prevR, tickDomainMin, tickDomainMax, plotHeight, 0)
                ),
                opacity: RANGE_OPACITIES[ri] ?? 0.44,
                x: bandX + (bandW - rangeW) / 2,
                width: rangeW,
              };
            });

            // FIX: bar starts from baseline (0)
            const zeroY = baselineY;
            const barTop = Math.min(zeroY, cy);
            const barBot = Math.max(zeroY, cy);

            bullets.push({
              datum: d,
              index: i,
              barX: bandX + (bandW - barW) / 2,
              barY: barTop,
              barW: barW,
              barH: Math.max(barBot - barTop, 0.5),
              targetY,
              targetX: bandX + (bandW - rangeW) / 2,
              targetH: rangeW,
              labelY: MARGIN.top + plotHeight + 18,
              labelX: bandX + bandW / 2,
              rangeBands,
              tooltipX: bandX + bandW / 2,
              tooltipY: cy,
            });
          }
        }
      }

      const dataValueItems = validData.map(
        (d) => `${d.label}: value ${d.value}, target ${d.target}`
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // baseline
      if (orientation === "horizontal") {
        svgChildren.push(h("line", {
          class: "st-bulletChart__baseline",
          x1: baselineX, x2: baselineX,
          y1: MARGIN.top, y2: height - MARGIN.bottom,
        }));
      } else {
        svgChildren.push(h("line", {
          class: "st-bulletChart__baseline",
          x1: MARGIN.left, x2: width - MARGIN.right,
          y1: baselineY, y2: baselineY,
        }));
      }

      // axis lines
      svgChildren.push(h("line", {
        class: "st-bulletChart__axis",
        x1: MARGIN.left,
        x2: orientation === "horizontal" ? width - MARGIN.right : MARGIN.left,
        y1: MARGIN.top,
        y2: height - MARGIN.bottom,
      }));
      svgChildren.push(h("line", {
        class: "st-bulletChart__axis",
        x1: MARGIN.left,
        x2: orientation === "horizontal" ? MARGIN.left : width - MARGIN.right,
        y1: height - MARGIN.bottom,
        y2: height - MARGIN.bottom,
      }));

      // ticks
      for (const tick of ticks) {
        if (orientation === "horizontal") {
          const tx = MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth);
          svgChildren.push(h("line", { key: `g${tick}`, class: "st-bulletChart__grid", x1: tx, x2: tx, y1: MARGIN.top, y2: height - MARGIN.bottom }));
          svgChildren.push(h("text", { key: `t${tick}`, class: "st-bulletChart__tickLabel", x: tx, y: height - MARGIN.bottom + 14, "text-anchor": "middle" }, formatTick(tick)));
        } else {
          const ty = MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0);
          svgChildren.push(h("line", { key: `g${tick}`, class: "st-bulletChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: ty, y2: ty }));
          svgChildren.push(h("text", { key: `t${tick}`, class: "st-bulletChart__tickLabel", x: MARGIN.left - 6, y: ty, "text-anchor": "end", "dominant-baseline": "middle" }, formatTick(tick)));
        }
      }

      // bullets
      for (const b of bullets) {
        const i = b.index;
        // range bands
        for (let ri = 0; ri < b.rangeBands.length; ri++) {
          const rb = b.rangeBands[ri];
          svgChildren.push(h("rect", {
            key: `rb${i}-${ri}`,
            class: "st-bulletChart__range",
            x: rb.x ?? b.barX,
            y: rb.y ?? b.barY,
            width: rb.width,
            height: Math.abs(rb.height ?? 0),
            style: `opacity:${rb.opacity}`,
          }));
        }
        // bar
        svgChildren.push(h("rect", {
          key: `bar${i}-${b.datum.label}`,
          class: "st-bulletChart__bar",
          x: b.barX, y: b.barY,
          width: b.barW, height: b.barH,
          rx: 1,
          "data-chart-index": i,
        }));
        // target
        if (orientation === "horizontal") {
          svgChildren.push(h("line", {
            key: `tgt${i}`,
            class: "st-bulletChart__target",
            x1: b.targetX, x2: b.targetX,
            y1: b.targetY, y2: b.targetY + b.targetH,
          }));
          svgChildren.push(h("text", {
            key: `lbl${i}`,
            class: "st-bulletChart__categoryLabel",
            x: MARGIN.left - 8, y: b.labelY,
            "text-anchor": "end", "dominant-baseline": "middle",
          }, b.datum.label));
        } else {
          svgChildren.push(h("line", {
            key: `tgt${i}`,
            class: "st-bulletChart__target",
            x1: b.targetX, x2: (b.targetX ?? 0) + b.targetH,
            y1: b.targetY, y2: b.targetY,
          }));
          svgChildren.push(h("text", {
            key: `lbl${i}`,
            class: "st-bulletChart__categoryLabel",
            x: b.labelX ?? 0, y: b.labelY,
            "text-anchor": "middle",
          }, b.datum.label));
        }
      }

      const hoveredBullet = hoveredIndex.value !== null ? bullets[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-bulletChart__visual",
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

      if (hoveredBullet) {
        children.push(h("div", {
          class: "st-bulletChart__tooltip",
          role: "presentation",
          style: `left:${(hoveredBullet.tooltipX / width) * 100}%;top:${(hoveredBullet.tooltipY / height) * 100}%`,
        }, [
          h("span", { class: "st-bulletChart__tooltipLabel" }, hoveredBullet.datum.label),
          h("span", { class: "st-bulletChart__tooltipValue" }, `value: ${hoveredBullet.datum.value} / target: ${hoveredBullet.datum.target}`),
        ]));
      }

      return h("div", { ...attrs, class: classNames("st-bulletChart", props.class) }, children);
    };
  },
});
