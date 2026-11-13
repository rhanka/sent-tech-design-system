<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type PointAndFigureChartMark = 'x' | 'o';

export type PointAndFigureChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des colonnes. */
  close: number;
};

export type PointAndFigureChartProps = {
  data: PointAndFigureChartDatum[];
  boxSize?: number;
  reversal?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

defineOptions({ name: 'PointAndFigureChart', inheritAttrs: false });
const props = withDefaults(defineProps<PointAndFigureChartProps>(), {
  data: () => [], boxSize: undefined, reversal: 3, label: undefined, width: 640, height: 320,
  size: undefined, class: undefined,
});

const hoveredKey = ref<string | null>(null);

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
}

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 320);

const validData = computed(() => (props.data ?? []).filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close)));

const effectiveBox = computed(() => {
  const valid = validData.value;
  const boxSize = props.boxSize;
  const closes = valid.map((d) => d.close);
  return Number.isFinite(boxSize) && (boxSize as number) > 0
    ? (boxSize as number)
    : closes.length
      ? Math.max(...closes) - Math.min(...closes) > 0
        ? (Math.max(...closes) - Math.min(...closes)) / 20
        : 1
      : 1;
});

const reversalBoxes = computed(() => Math.max(1, Math.floor(Number.isFinite(props.reversal) ? (props.reversal as number) : 3)));

const pnfColumns = computed(() => {
  const validDataV = validData.value;
  const effBox = effectiveBox.value;
  const baseMin = validDataV.length ? Math.min(...validDataV.map((d) => d.close)) : 0;
  const closes = validDataV.map((d) => d.close);
  const rawCols: { mark: PointAndFigureChartMark; low: number; high: number }[] = [];
  if (validDataV.length > 0 && effBox > 0) {
    const boxIndex = (price: number) => Math.floor((price - baseMin) / effBox + 1e-9);
    const firstBoxIndex = boxIndex(closes[0]);
    let mark: PointAndFigureChartMark | null = null;
    let low = firstBoxIndex;
    let high = firstBoxIndex;
    for (let i = 1; i < closes.length; i++) {
      const idx = boxIndex(closes[i]);
      if (mark === null) {
        if (idx >= firstBoxIndex + 1) {
          mark = 'x';
          low = firstBoxIndex;
          high = idx;
        } else if (idx <= firstBoxIndex - 1) {
          mark = 'o';
          low = idx;
          high = firstBoxIndex;
        }
        continue;
      }
      if (mark === 'x') {
        if (idx > high) {
          high = idx;
        } else if (idx <= high - reversalBoxes.value) {
          rawCols.push({ mark, low, high });
          mark = 'o';
          high = high - 1;
          low = idx;
        }
      } else {
        if (idx < low) {
          low = idx;
        } else if (idx >= low + reversalBoxes.value) {
          rawCols.push({ mark, low, high });
          mark = 'x';
          low = low + 1;
          high = idx;
        }
      }
    }
    if (mark !== null && high >= low) rawCols.push({ mark, low, high });
  }
  return rawCols.map((c) => ({
    mark: c.mark,
    low: c.low,
    high: c.high,
    priceLow: baseMin + c.low * effBox,
    priceHigh: baseMin + (c.high + 1) * effBox,
  }));
});

let priceMin = 0;
let priceMax = 0;
{
  const closes = validData.value.map((d) => d.close);
  if (pnfColumns.value.length === 0) {
    priceMin = closes.length ? Math.min(...closes) : 0;
    priceMax = closes.length ? Math.max(...closes) : 0;
  } else {
    priceMin = Infinity;
    priceMax = -Infinity;
    for (const c of pnfColumns.value) {
      if (c.priceLow < priceMin) priceMin = c.priceLow;
      if (c.priceHigh > priceMax) priceMax = c.priceHigh;
    }
  }
}

const yTicks = computed(() => niceTicks(priceMin, priceMax) as number[]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const colW = computed(() => (pnfColumns.value.length > 0 ? plotW.value / pnfColumns.value.length : plotW.value));
const glyph = computed(() =>
  Math.min(colW.value, scaleLinear(effectiveBox.value, 0, Math.max(yMax.value - yMin.value, effectiveBox.value), 0, plotH.value)) * 0.7);

const marks = computed(() => {
  const result: {
    key: string;
    mark: PointAndFigureChartMark;
    cx: number;
    cy: number;
    r: number;
    priceLow: number;
    priceHigh: number;
  }[] = [];
  const baseMin = validData.value.length ? Math.min(...validData.value.map((d) => d.close)) : 0;
  pnfColumns.value.forEach((c, ci) => {
    const cx = MARGIN.left + colW.value * ci + colW.value / 2;
    for (let b = c.low; b <= c.high; b++) {
      const priceMid = baseMin + (b + 0.5) * effectiveBox.value;
      const cy = MARGIN.top + scaleLinear(priceMid, yMin.value, yMax.value, plotH.value, 0);
      result.push({
        key: `${ci}-${b}`,
        mark: c.mark,
        cx,
        cy,
        r: Math.max(glyph.value / 2, 2),
        priceLow: c.priceLow,
        priceHigh: c.priceHigh,
      });
    }
  });
  return result;
});

const dataValueItems = computed(() => pnfColumns.value.map(
  (c) => `${c.mark === 'x' ? 'X' : 'O'} ${formatTick(c.priceLow)} → ${formatTick(c.priceHigh)}`,
));

const hoveredMark = computed(() =>
  hoveredKey.value === null ? null : marks.value.find((m) => m.key === hoveredKey.value) ?? null,
);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-pointAndFigureChart', props.class)) }" >
    <div
      class="st-pointAndFigureChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
      @pointerleave="hoveredKey = null"
    >
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <template v-for="t in yTicks" :key="`gy${t}`">
          <line class="st-pointAndFigureChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)" :y2="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)" />
          <text class="st-pointAndFigureChart__tick" :x="MARGIN.left - 6" :y="MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <line class="st-pointAndFigureChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-pointAndFigureChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="m in marks" :key="m.key">
          <g
            v-if="m.mark === 'x'"
            :class="classNames('st-pointAndFigureChart__mark', 'st-pointAndFigureChart__mark--x', hoveredKey !== null && hoveredKey !== m.key ? 'st-pointAndFigureChart__mark--dim' : undefined)"
            :data-chart-key="m.key"
          >
            <line class="st-pointAndFigureChart__glyph" :x1="m.cx - m.r" :y1="m.cy - m.r" :x2="m.cx + m.r" :y2="m.cy + m.r" :data-chart-key="m.key" />
            <line class="st-pointAndFigureChart__glyph" :x1="m.cx - m.r" :y1="m.cy + m.r" :x2="m.cx + m.r" :y2="m.cy - m.r" :data-chart-key="m.key" />
          </g>
          <circle
            v-else
            :class="classNames('st-pointAndFigureChart__mark', 'st-pointAndFigureChart__mark--o', 'st-pointAndFigureChart__glyph', hoveredKey !== null && hoveredKey !== m.key ? 'st-pointAndFigureChart__mark--dim' : undefined)"
            :cx="m.cx"
            :cy="m.cy"
            :r="m.r"
            :data-chart-key="m.key"
          />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'point and figure'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredMark"
      class="st-pointAndFigureChart__tooltip"
      role="presentation"
      :style="{ left: `${(hoveredMark.cx / width) * 100}%`, top: `${(hoveredMark.cy / height) * 100}%` }"
    >
      <span class="st-pointAndFigureChart__tooltipLabel">{{ hoveredMark.mark === 'x' ? 'X' : 'O' }}</span>
      <span class="st-pointAndFigureChart__tooltipValue">{{ `${formatTick(hoveredMark.priceLow)} → ${formatTick(hoveredMark.priceHigh)}` }}</span>
    </div>
  </div>
</template>
