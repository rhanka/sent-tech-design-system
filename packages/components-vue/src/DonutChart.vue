<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';

export type DonutChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type DonutChartDatum = {
  label: string;
  value: number;
  tone?: DonutChartTone;
};

export type DonutChartProps = {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  /**
   * Per-slice value labels. `false`/absent (default) → none. `true` → each slice's
   * value with the default formatter. Object → `format(value)` and/or a `position`
   * override (default `center` of the arc). Slices too thin to fit a legible label
   * are skipped. Labels are `aria-hidden` — the values already live in the
   * accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  label: string;
  class?: string;
};

const TONES: DonutChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

const fmtPct = (p: number): string => `${p.toFixed(p < 10 ? 1 : 0)}%`;

// A slice must span at least this many degrees to host a legible label.
const DATA_LABEL_MIN_DEG = 18;

type Slice = {
  d: DonutChartDatum;
  path: string;
  tone: DonutChartTone;
  pct: number;
  spanDeg: number;
  labelX: number;
  labelY: number;
};

defineOptions({ name: 'DonutChart', inheritAttrs: false });
const props = withDefaults(defineProps<DonutChartProps>(), {
  size: 220,
  thickness: 34,
  centerLabel: undefined,
  dataLabels: undefined,
  class: undefined,
});

const hoveredIndex = ref<number | null>(null);

const handleLeave = () => {
  hoveredIndex.value = null;
};
const handleVisualPointerMove = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
};

const size = computed(() => props.size ?? 220);
const thickness = computed(() => props.thickness ?? 34);
const centerLabel = computed(() => props.centerLabel);
const label = computed(() => props.label);
const data = computed(() => props.data);

const total = computed(() => data.value.reduce((sum, d) => sum + Math.max(d.value, 0), 0));
const items = computed<Slice[]>(() => {
  if (total.value <= 0) return [];
  const cx = size.value / 2;
  const cy = size.value / 2;
  const rOuter = size.value / 2 - 2;
  const rInner = Math.max(rOuter - thickness.value, 1);
  const TWO_PI = Math.PI * 2;
  let angle = -Math.PI / 2;
  const polar = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  return data.value.map((d, i) => {
    const frac = Math.max(d.value, 0) / total.value;
    const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
    const a0 = angle;
    const a1 = angle + span;
    angle = a1;
    const large = span > Math.PI ? 1 : 0;
    const [x0o, y0o] = polar(rOuter, a0);
    const [x1o, y1o] = polar(rOuter, a1);
    const [x1i, y1i] = polar(rInner, a1);
    const [x0i, y0i] = polar(rInner, a0);
    const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
    // Label anchor: centre of the arc (mid-angle, mid-radius of the ring).
    const aMid = (a0 + a1) / 2;
    const rMid = (rOuter + rInner) / 2;
    const [labelX, labelY] = polar(rMid, aMid);
    return { d, path, tone: d.tone ?? TONES[i % TONES.length], pct: frac * 100, spanDeg: (span * 180) / Math.PI, labelX, labelY };
  });
});

const dataValueItems = computed(() => items.value.map((slice) => `${slice.d.label}: ${slice.d.value} (${fmtPct(slice.pct)})`));

// --- Data labels ----------------------------------------------------------
// One value label centred in each arc (default `center`). Slices thinner than
// DATA_LABEL_MIN_DEG are skipped so labels stay legible. aria-hidden (values
// are in the ChartDataList already).
const dataLabelItems = computed(() => {
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  if (!dataLabelOpts.enabled) return [];
  return items.value
    .filter((slice) => slice.spanDeg >= DATA_LABEL_MIN_DEG)
    .map((slice) => ({
      key: slice.d.label,
      x: slice.labelX,
      y: slice.labelY,
      text: formatDataLabel(slice.d.value, dataLabelOpts, (v) => String(v)),
    }));
});

const hovered = computed(() => (hoveredIndex.value !== null ? items.value[hoveredIndex.value] : undefined));
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-donutChart', props.class)">
    <div class="st-donutChart__visual" role="img" :aria-label="label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${size} ${size}`" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-if="total > 0">
          <path v-for="(slice, i) in items" :key="slice.d.label" :class="classNames('st-donutChart__slice', `st-donutChart__slice--${slice.tone}`, hoveredIndex !== null && hoveredIndex !== i && 'st-donutChart__slice--dim')" :d="slice.path" :data-chart-index="i"></path>
          <text v-if="centerLabel !== null" class="st-donutChart__center" :x="size / 2" :y="size / 2" text-anchor="middle" dominant-baseline="central">{{ String(centerLabel ?? total) }}</text>
          <g v-if="dataLabelItems.length > 0" class="st-donutChart__dataLabels" aria-hidden="true">
            <text v-for="d in dataLabelItems" :key="`dl-${d.key}`" class="st-donutChart__dataLabel" :x="d.x" :y="d.y" text-anchor="middle" dominant-baseline="central">{{ d.text }}</text>
          </g>
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-donutChart__tooltip" role="presentation">
      <span class="st-donutChart__tooltipLabel">{{ hovered.d.label }}</span>
      <span class="st-donutChart__tooltipValue">{{ hovered.d.value }} · {{ fmtPct(hovered.pct) }}</span>
    </div>
  </div>
</template>
