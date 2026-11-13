<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type BulletChartDatum = {
  label: string;
  value: number;
  target: number;
  ranges?: number[];
};

export type BulletChartProps = {
  data: BulletChartDatum[];
  label: string;
  orientation?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 };
const RANGE_OPACITIES = [0.18, 0.3, 0.44];

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

defineOptions({ name: 'BulletChart', inheritAttrs: false });
const props = withDefaults(defineProps<BulletChartProps>(), {
  data: () => [],
  orientation: 'horizontal',
  width: 480,
  height: 240,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);

function handleLeave() {
  hoveredIndex.value = null;
}

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const idx = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(idx) ? idx : null;
}

const orientation = computed(() => props.orientation ?? 'horizontal');
const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);

const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

// Filter invalid data (non-finite value/target → skip)
const validData = computed(() =>
  (props.data ?? []).filter((d) => Number.isFinite(d.value) && Number.isFinite(d.target)),
);

// Domain includes 0, values, targets AND ranges; negative domain supported
const ticks = computed(() => {
  const allDomainValues: number[] = [0];
  for (const d of validData.value) {
    allDomainValues.push(d.value, d.target);
    for (const r of d.ranges ?? []) {
      if (Number.isFinite(r)) allDomainValues.push(r);
    }
  }
  const rawMin = Math.min(...allDomainValues);
  const rawMax = Math.max(...allDomainValues);
  // Flat domain → fallback +1
  const domainMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  return niceTicks(rawMin, domainMax, 5);
});
const tickDomainMin = computed(() => (ticks.value[0] ?? 0));
const tickDomainMax = computed(() => (ticks.value[ticks.value.length - 1] ?? 0));

// Position of baseline (value 0) in pixels
const baselineX = computed(() => MARGIN.left + scaleLinear(0, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value));
const baselineY = computed(() => MARGIN.top + scaleLinear(0, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0));

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

const bullets = computed<BulletEntry[]>(() => {
  const bandCount = validData.value.length;
  if (bandCount === 0) return [];
  const entries: BulletEntry[] = [];
  if (orientation.value === 'horizontal') {
    const bandH = plotHeight.value / bandCount;
    const barH = bandH * 0.35;
    const rangeH = bandH * 0.65;

    for (let i = 0; i < validData.value.length; i++) {
      const d = validData.value[i];
      const ranges = (d.ranges ?? [tickDomainMax.value]).filter(Number.isFinite).slice(0, 3);
      const sortedRanges = [...ranges].sort((a, b) => a - b);
      const bandY = MARGIN.top + i * bandH;
      const cx = MARGIN.left + scaleLinear(d.value, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value);
      const targetX = MARGIN.left + scaleLinear(d.target, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value);

      const rangeBands = sortedRanges.map((r, ri) => {
        const prevR = ri === 0 ? tickDomainMin.value : sortedRanges[ri - 1];
        return {
          x: MARGIN.left + scaleLinear(prevR, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value),
          width:
            scaleLinear(r, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value) -
            scaleLinear(prevR, tickDomainMin.value, tickDomainMax.value, 0, plotWidth.value),
          opacity: RANGE_OPACITIES[ri] ?? 0.44,
          y: bandY + (bandH - rangeH) / 2,
          height: rangeH,
        };
      });

      // Bar starts from baseline (0)
      const zeroX = baselineX.value;
      const barLeft = Math.min(zeroX, cx);
      const barRight = Math.max(zeroX, cx);

      entries.push({
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
    const bandW = plotWidth.value / bandCount;
    const barW = bandW * 0.35;
    const rangeW = bandW * 0.65;

    for (let i = 0; i < validData.value.length; i++) {
      const d = validData.value[i];
      const ranges = (d.ranges ?? [tickDomainMax.value]).filter(Number.isFinite).slice(0, 3);
      const sortedRanges = [...ranges].sort((a, b) => a - b);
      const bandX = MARGIN.left + i * bandW;
      const cy = MARGIN.top + scaleLinear(d.value, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0);
      const targetY = MARGIN.top + scaleLinear(d.target, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0);

      const rangeBands = sortedRanges.map((r, ri) => {
        const prevR = ri === 0 ? tickDomainMin.value : sortedRanges[ri - 1];
        return {
          y: MARGIN.top + scaleLinear(r, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0),
          height: Math.abs(
            scaleLinear(r, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0) -
              scaleLinear(prevR, tickDomainMin.value, tickDomainMax.value, plotHeight.value, 0),
          ),
          opacity: RANGE_OPACITIES[ri] ?? 0.44,
          x: bandX + (bandW - rangeW) / 2,
          width: rangeW,
        };
      });

      // Bar starts from baseline (0)
      const zeroY = baselineY.value;
      const barTop = Math.min(zeroY, cy);
      const barBot = Math.max(zeroY, cy);

      entries.push({
        datum: d,
        index: i,
        barX: bandX + (bandW - barW) / 2,
        barY: barTop,
        barW: barW,
        barH: Math.max(barBot - barTop, 0.5),
        targetY,
        targetX: bandX + (bandW - rangeW) / 2,
        targetH: rangeW,
        labelY: MARGIN.top + plotHeight.value + 18,
        labelX: bandX + bandW / 2,
        rangeBands,
        tooltipX: bandX + bandW / 2,
        tooltipY: cy,
      });
    }
  }
  return entries;
});

const dataValueItems = computed(() =>
  validData.value.map((d) => `${d.label}: value ${d.value}, target ${d.target}`),
);

const hoveredBullet = computed(() => (hoveredIndex.value !== null ? bullets.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-bulletChart', props.class)">
    <div
      class="st-bulletChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handlePointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <line v-if="orientation === 'horizontal'" class="st-bulletChart__baseline" :x1="baselineX" :x2="baselineX" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line v-else class="st-bulletChart__baseline" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="baselineY" :y2="baselineY" />
        <line class="st-bulletChart__axis" :x1="MARGIN.left" :x2="orientation === 'horizontal' ? width - MARGIN.right : MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-bulletChart__axis" :x1="MARGIN.left" :x2="orientation === 'horizontal' ? MARGIN.left : width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <template v-for="tick in ticks" :key="`g${tick}`">
          <line v-if="orientation === 'horizontal'" class="st-bulletChart__grid" :x1="MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth)" :x2="MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth)" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
          <line v-else class="st-bulletChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0)" :y2="MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0)" />
          <text v-if="orientation === 'horizontal'" class="st-bulletChart__tickLabel" :x="MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth)" :y="height - MARGIN.bottom + 14" text-anchor="middle">{{ formatTick(tick) }}</text>
          <text v-else class="st-bulletChart__tickLabel" :x="MARGIN.left - 6" :y="MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0)" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick) }}</text>
        </template>
        <template v-for="b in bullets" :key="b.index">
          <rect v-for="(rb, ri) in b.rangeBands" :key="`rb${b.index}-${ri}`" class="st-bulletChart__range" :x="rb.x ?? b.barX" :y="rb.y ?? b.barY" :width="rb.width" :height="Math.abs(rb.height ?? 0)" :style="`opacity:${rb.opacity}`" />
          <rect class="st-bulletChart__bar" :x="b.barX" :y="b.barY" :width="b.barW" :height="b.barH" rx="1" :data-chart-index="b.index" />
          <template v-if="orientation === 'horizontal'">
            <line class="st-bulletChart__target" :x1="b.targetX" :x2="b.targetX" :y1="b.targetY" :y2="b.targetY + b.targetH" />
            <text class="st-bulletChart__categoryLabel" :x="MARGIN.left - 8" :y="b.labelY" text-anchor="end" dominant-baseline="middle">{{ b.datum.label }}</text>
          </template>
          <template v-else>
            <line class="st-bulletChart__target" :x1="b.targetX" :x2="(b.targetX ?? 0) + b.targetH" :y1="b.targetY" :y2="b.targetY" />
            <text class="st-bulletChart__categoryLabel" :x="b.labelX ?? 0" :y="b.labelY" text-anchor="middle">{{ b.datum.label }}</text>
          </template>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredBullet"
      class="st-bulletChart__tooltip"
      role="presentation"
      :style="`left:${(hoveredBullet.tooltipX / width) * 100}%;top:${(hoveredBullet.tooltipY / height) * 100}%`"
    >
      <span class="st-bulletChart__tooltipLabel">{{ hoveredBullet.datum.label }}</span>
      <span class="st-bulletChart__tooltipValue">{{ `value: ${hoveredBullet.datum.value} / target: ${hoveredBullet.datum.target}` }}</span>
    </div>
  </div>
</template>
