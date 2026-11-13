<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type WaterfallType = 'increase' | 'decrease' | 'total';

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

defineOptions({ name: 'WaterfallChart', inheritAttrs: false });
const props = withDefaults(defineProps<WaterfallChartProps>(), {
  width: 480, height: 240, connectors: true, format: undefined, class: undefined,
});

const attrs = useAttrs();
const rootProps = computed(() => ({

  class: classNames('st-waterfallChart', props.class),
}));

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
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 240);

function formatValue(v: number): string {
  const format = props.format;
  return format ? format(v) : formatTick(v);
}

type ComputedBar = {
  datum: WaterfallChartDatum;
  type: WaterfallType;
  start: number;
  end: number;
  displayValue: number;
  cumulative: number;
};

const computedBars = computed<ComputedBar[]>(() => {
  const data = props.data ?? [];
  let cumulative = 0;
  let seeded = false; // un pas non-total a-t-il déjà alimenté le cumul ?
  return data.map((d) => {
    // Valeurs non finies neutralisées (jamais de NaN dans la géométrie/DOM).
    const raw = Number.isFinite(d.value) ? d.value : 0;
    const type: WaterfallType = d.type ?? (raw >= 0 ? 'increase' : 'decrease');
    let start: number;
    let end: number;
    let displayValue: number;
    if (type === 'total') {
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
      const signed = type === 'increase' ? Math.abs(raw) : -Math.abs(raw);
      start = cumulative;
      end = cumulative + signed;
      cumulative = end;
      seeded = true;
      displayValue = signed;
    }
    const resolvedType: WaterfallType = type;
    return { datum: d, type: resolvedType, start, end, displayValue, cumulative };
  });
});

const bounds = computed(() => computedBars.value.flatMap((c) => [c.start, c.end]));
const ticks = computed(() => {
  const minRaw = Math.min(0, ...bounds.value);
  const maxRaw = Math.max(0, ...bounds.value);
  return niceTicks(minRaw, maxRaw, 5);
});
const domainMin = computed(() => ticks.value[0]);
const domainMax = computed(() => ticks.value[ticks.value.length - 1]);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotHeight = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

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

const bars = computed<Bar[]>(() => {
  if (computedBars.value.length === 0) return [];
  const band = plotWidth.value / computedBars.value.length;
  const barWidth = band * 0.62;
  return computedBars.value.map((c, i) => {
    const startY = scaleLinear(c.start, domainMin.value, domainMax.value, plotHeight.value, 0);
    const endY = scaleLinear(c.end, domainMin.value, domainMax.value, plotHeight.value, 0);
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
});

const connectorLines = computed(() => {
  const lines: { x1: number; x2: number; y: number }[] = [];
  if ((props.connectors ?? true) && bars.value.length >= 2) {
    for (let i = 0; i < computedBars.value.length - 1; i++) {
      const level = computedBars.value[i].end;
      const y = MARGIN.top + scaleLinear(level, domainMin.value, domainMax.value, plotHeight.value, 0);
      // Du bord droit de la barre i au bord gauche de la barre i+1.
      lines.push({ x1: bars.value[i].x + bars.value[i].width, x2: bars.value[i + 1].x, y });
    }
  }
  return lines;
});

const valueAxisTicks = computed(() => ticks.value.map((tick) => ({
  value: tick,
  x1: MARGIN.left,
  x2: MARGIN.left + plotWidth.value,
  y: MARGIN.top + scaleLinear(tick, domainMin.value, domainMax.value, plotHeight.value, 0),
})));

const zeroY = computed(() => MARGIN.top + scaleLinear(0, domainMin.value, domainMax.value, plotHeight.value, 0));

const dataValueItems = computed(() => computedBars.value.map((c) => `${c.datum.label}: ${formatValue(c.displayValue)}`));

const legendItems: { type: WaterfallType; label: string }[] = [
  { type: 'increase', label: 'Hausse' },
  { type: 'decrease', label: 'Baisse' },
  { type: 'total', label: 'Total' },
];

const hoveredIdx = computed(() => hoveredIndex.value);
const hovered = computed(() => hoveredIdx.value !== null ? bars.value[hoveredIdx.value] : undefined);
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-waterfallChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="tick in valueAxisTicks" :key="`g${tick.value}`">
          <line class="st-waterfallChart__grid" :x1="tick.x1" :x2="tick.x2" :y1="tick.y" :y2="tick.y" />
          <text class="st-waterfallChart__tickLabel" :x="MARGIN.left - 6" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(tick.value) }}</text>
        </template>
        <line class="st-waterfallChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-waterfallChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <line class="st-waterfallChart__zero" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="zeroY" :y2="zeroY" />
        <line v-for="(line, i) in connectorLines" :key="`c${i}`" class="st-waterfallChart__connector" :x1="line.x1" :x2="line.x2" :y1="line.y" :y2="line.y" />
        <text v-for="bar in bars" :key="`cl${bar.datum.label}`" class="st-waterfallChart__categoryLabel" :x="bar.x + bar.width / 2" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ bar.datum.label }}</text>
        <rect v-for="(bar, i) in bars" :key="`b${bar.datum.label}`" :class="`st-waterfallChart__bar st-waterfallChart__bar--${bar.type}`" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="2" :data-chart-index="i" />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <ul class="st-waterfallChart__legend" aria-hidden="true">
      <li v-for="item in legendItems" :key="item.type" class="st-waterfallChart__legendItem"><span :class="`st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--${item.type}`" />{{ ` ${item.label}` }}</li>
    </ul>
    <div v-if="hovered" class="st-waterfallChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`">
      <span class="st-waterfallChart__tooltipLabel">{{ hovered.datum.label }}</span>
      <span class="st-waterfallChart__tooltipValue">{{ formatValue(hovered.displayValue) }}</span>
    </div>
  </div>
</template>
