<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type VectorFieldChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type VectorFieldChartDatum = {
  x: number;
  y: number;
  /** Magnitude (≥ 0) : pilote la longueur normalisée et la couleur. */
  length: number;
  /** Direction en DEGRÉS (0° = +X, sens trigonométrique). */
  direction: number;
};

export type VectorFieldChartProps = {
  data: VectorFieldChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: VectorFieldChartTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

defineOptions({ name: 'VectorFieldChart', inheritAttrs: false });
const props = withDefaults(defineProps<VectorFieldChartProps>(), {
  width: 640, height: 320, size: 26, class: undefined, label: undefined,
});


const rootProps = computed(() => ({

  class: classNames('st-vectorFieldChart', props.class),
}));

const hoveredKey = ref<string | null>(null);

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
}

function handleLeave() {
  hoveredKey.value = null;
}

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 320);

// Points valides : coordonnées finies, magnitude finie ≥ 0.
const validData = computed(() => (props.data ?? []).filter(
  (d) =>
    d &&
    Number.isFinite(d.x) &&
    Number.isFinite(d.y) &&
    Number.isFinite(d.length) &&
    d.length >= 0 &&
    Number.isFinite(d.direction),
));

const xTicks = computed(() => {
  const xs = validData.value.map((d) => d.x);
  return niceTicks(Math.min(...xs), Math.max(...xs));
});
const yTicks = computed(() => {
  const ys = validData.value.map((d) => d.y);
  return niceTicks(Math.min(...ys), Math.max(...ys));
});
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const xMin = computed(() => xTicks.value[0]);
const xMax = computed(() => xTicks.value[xTicks.value.length - 1]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);

function xOf(t: number): number {
  return MARGIN.left + scaleLinear(t, xMin.value, xMax.value, 0, plotW.value);
}

function yOf(t: number): number {
  return MARGIN.top + scaleLinear(t, yMin.value, yMax.value, plotH.value, 0);
}

// Une flèche par point : segment (base → pointe) + 2 traits de pointe.
const arrows = computed(() => {
  const maxLength = validData.value.reduce((max, d) => (d.length > max ? d.length : max), 0);
  const size = props.size ?? 26;
  return validData.value.map((d, i) => {
    const cx = MARGIN.left + scaleLinear(d.x, xMin.value, xMax.value, 0, plotW.value);
    const cy = MARGIN.top + scaleLinear(d.y, yMin.value, yMax.value, plotH.value, 0);
    const max = maxLength > 0 ? maxLength : 1;
    const len = (d.length / max) * size;
    const rad = (d.direction * Math.PI) / 180;
    const dx = Math.cos(rad) * len;
    const dy = -Math.sin(rad) * len;
    const x1 = cx - dx / 2;
    const y1 = cy - dy / 2;
    const x2 = cx + dx / 2;
    const y2 = cy + dy / 2;
    const head = Math.min(Math.max(len * 0.28, 3), 8);
    const headAngle = (28 * Math.PI) / 180;
    const baseAngle = Math.atan2(y2 - y1, x2 - x1);
    const hx1 = x2 - head * Math.cos(baseAngle - headAngle);
    const hy1 = y2 - head * Math.sin(baseAngle - headAngle);
    const hx2 = x2 - head * Math.cos(baseAngle + headAngle);
    const hy2 = y2 - head * Math.sin(baseAngle + headAngle);
    const bin = Math.min(Math.floor((d.length / max) * TONES.length), TONES.length - 1);
    return {
      key: `${i}`,
      datum: d,
      cx,
      cy,
      x1,
      y1,
      x2,
      y2,
      hx1,
      hy1,
      hx2,
      hy2,
      tone: TONES[Math.max(0, bin)],
    };
  });
});

const dataValueItems = computed(() => validData.value.map(
  (d) => `x ${d.x}, y ${d.y} · |v| ${formatTick(d.length)} @ ${formatTick(d.direction)}°`,
));

const hoveredArrow = computed(() =>
  hoveredKey.value === null ? null : arrows.value.find((a) => a.key === hoveredKey.value) ?? null,
);

function arrowClass(a: { tone: string; key: string }) {
  return classNames(
    'st-vectorFieldChart__arrow',
    `st-vectorFieldChart__arrow--${a.tone}`,
    hoveredKey.value !== null && hoveredKey.value !== a.key ? 'st-vectorFieldChart__arrow--dim' : undefined,
  );
}
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-vectorFieldChart__visual" role="img" :aria-label="props.label" @pointermove="handlePointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <template v-for="t in yTicks" :key="`gy${t}`">
          <line class="st-vectorFieldChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="yOf(t)" :y2="yOf(t)" />
          <text class="st-vectorFieldChart__tick" :x="MARGIN.left - 6" :y="yOf(t)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <text v-for="t in xTicks" :key="`tx${t}`" class="st-vectorFieldChart__tick" :x="xOf(t)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(t) }}</text>
        <line class="st-vectorFieldChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-vectorFieldChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <g v-for="a in arrows" :key="a.key" :class="arrowClass(a)">
          <line class="st-vectorFieldChart__shaft" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" :data-chart-key="a.key" />
          <line class="st-vectorFieldChart__head" :x1="a.x2" :y1="a.y2" :x2="a.hx1" :y2="a.hy1" />
          <line class="st-vectorFieldChart__head" :x1="a.x2" :y1="a.y2" :x2="a.hx2" :y2="a.hy2" />
        </g>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label ?? 'vector field'}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hoveredArrow" class="st-vectorFieldChart__tooltip" role="presentation" :style="{ left: `${(hoveredArrow.cx / width) * 100}%`, top: `${(hoveredArrow.cy / height) * 100}%` }">
      <span class="st-vectorFieldChart__tooltipLabel">{{ `x ${hoveredArrow.datum.x} · y ${hoveredArrow.datum.y}` }}</span>
      <span class="st-vectorFieldChart__tooltipValue">{{ `|v| ${formatTick(hoveredArrow.datum.length)} @ ${formatTick(hoveredArrow.datum.direction)}°` }}</span>
    </div>
  </div>
</template>
