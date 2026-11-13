<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from './chartDataLabels.js';
import { resolveActiveIndex } from './chartCrosshair.js';
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from './chartKeyboardNav.js';

export type ScatterPlotTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
  r?: number;
};

/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
  x: number;
  y: number;
  tone?: ScatterPlotTone;
  label?: string;
};

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  centroids?: ScatterPlotCentroid[];
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;
const MAX_POINT_RADIUS = 32;
const TONES: ScatterPlotTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];
const NAV_HIT = 18;

/** Stable hover/selection key of a point: its label, else `"x,y"`. */
function keyForPoint(d: ScatterPlotDatum): string {
  return d.label ?? `${d.x},${d.y}`;
}

defineOptions({ name: 'ScatterPlot', inheritAttrs: false });
const props = withDefaults(defineProps<ScatterPlotProps>(), {
  width: 480, height: 280, xLabel: undefined, yLabel: undefined, radius: 5,
  centroids: undefined, annotations: undefined, dataLabels: undefined, hoverKey: undefined,
  onHoverKeyChange: undefined, keyboardNav: undefined, onSelectKey: undefined, class: undefined,
});

const hoveredIndex = ref<number | null>(null);
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];

function emitHoverKey(index: number | null) {
  props.onHoverKeyChange?.(index == null ? null : hoverKeys.value[index] ?? null);
}

function handleLeave() {
  hoveredIndex.value = null;
  emitHoverKey(null);
}

function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    emitHoverKey(null);
    return;
  }
  const raw = Number(target.getAttribute('data-chart-index'));
  const index = Number.isInteger(raw) ? raw : null;
  hoveredIndex.value = index;
  emitHoverKey(index);
}

function focusDatum(index: number) {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
}

function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const action = datapointNavAction(event.key, index, points.value.length);
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'move') {
    focusDatum(action.index);
  } else if (action.kind === 'select') {
    props.onSelectKey?.(hoverKeys.value[index] ?? null);
  } else {
    focusedIndex.value = -1;
    emitHoverKey(null);
    props.onSelectKey?.(null);
    (event.currentTarget as SVGElement).blur();
  }
}

function onNavFocus(i: number) {
  focusedIndex.value = i;
  emitHoverKey(i);
}

function setNavRef(el: unknown, index: number) {
  datapointRefs[index] = (el as SVGRectElement) ?? null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 280);
const radius = computed(() => props.radius ?? 5);
const label = computed(() => props.label);
const data = computed(() => props.data);

const validCentroids = computed(() =>
  (props.centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y)),
);

const xs = computed(() =>
  [...data.value.map((d) => d.x), ...validCentroids.value.map((c) => c.x)].filter(Number.isFinite),
);
const ys = computed(() =>
  [...data.value.map((d) => d.y), ...validCentroids.value.map((c) => c.y)].filter(Number.isFinite),
);
const xTicks = computed(() => niceTicks(Math.min(...xs.value), Math.max(...xs.value)));
const yTicks = computed(() => niceTicks(Math.min(...ys.value), Math.max(...ys.value)));
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));
const xMin = computed(() => xTicks.value[0]);
const xMax = computed(() => xTicks.value[xTicks.value.length - 1]);
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);

type PointGeom = { cx: number; cy: number; r: number; datum: ScatterPlotDatum; index: number; tone: ScatterPlotTone };
const points = computed<PointGeom[]>(() =>
  data.value.map((d, i) => ({
    cx: MARGIN.left + scaleLinear(d.x, xMin.value, xMax.value, 0, plotW.value),
    cy: MARGIN.top + scaleLinear(d.y, yMin.value, yMax.value, plotH.value, 0),
    r: typeof d.r === 'number' && Number.isFinite(d.r) && d.r >= 0 ? Math.min(d.r, MAX_POINT_RADIUS) : radius.value,
    datum: d,
    index: i,
    tone: (d.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
  })),
);

type CentroidGeom = { cx: number; cy: number; tone: ScatterPlotTone; label?: string };
const centroidMarks = computed<CentroidGeom[]>(() =>
  validCentroids.value.map((c, i) => ({
    cx: MARGIN.left + scaleLinear(c.x, xMin.value, xMax.value, 0, plotW.value),
    cy: MARGIN.top + scaleLinear(c.y, yMin.value, yMax.value, plotH.value, 0),
    tone: (c.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
    label: c.label,
  })),
);

function annotationXScale(v: number | string): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (v < xMin.value || v > xMax.value) return null;
  return scaleLinear(v, xMin.value, xMax.value, 0, plotW.value);
}
function annotationYScale(v: number): number | null {
  if (!Number.isFinite(v)) return null;
  if (v < yMin.value || v > yMax.value) return null;
  return scaleLinear(v, yMin.value, yMax.value, plotH.value, 0);
}

const resolvedAnnotations = computed(() =>
  resolveAnnotations(props.annotations, {
    xScale: annotationXScale,
    yScale: annotationYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth: plotW.value,
    plotHeight: plotH.value,
  }),
);
const annotationRegions = computed(() => resolvedAnnotations.value.filter((a) => a.kind === 'region'));
const annotationAbove = computed(() => resolvedAnnotations.value.filter((a) => a.kind !== 'region'));

const dataLabelOpts = computed(() => normalizeDataLabels(props.dataLabels));
type DataLabelGeom = { key: number; x: number; y: number; text: string; baseline: 'middle' | 'auto' };
const dataLabelItems = computed<DataLabelGeom[]>(() => {
  const opts = dataLabelOpts.value;
  if (!opts.enabled) return [];
  return points.value.map((p) => {
    const text = p.datum.label ?? formatDataLabel(p.datum.y, opts, formatTick);
    const center = opts.position === 'center' || opts.position === 'inside';
    return {
      key: p.index,
      x: p.cx,
      y: center ? p.cy : p.cy - (p.r + 5),
      text,
      baseline: (center ? 'middle' : 'auto') as 'middle' | 'auto',
    };
  });
});

const dataValueItems = computed(() => [
  ...data.value.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`)),
  ...validCentroids.value.map((c) =>
    c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`,
  ),
  ...annotationDataListItems(props.annotations),
]);

const hoverKeys = computed(() => data.value.map((d) => keyForPoint(d)));
const activeIndex = computed(() => resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value));
const hovered = computed(() => (activeIndex.value >= 0 ? points.value[activeIndex.value] : undefined));
const navEnabled = computed(() => (props.keyboardNav === true || props.onSelectKey !== undefined) && points.value.length > 0);

function gridY(t: number): number {
  return MARGIN.top + scaleLinear(t, yMin.value, yMax.value, plotH.value, 0);
}
function tickX(t: number): number {
  return MARGIN.left + scaleLinear(t, xMin.value, xMax.value, 0, plotW.value);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-scatterPlot', props.class)">
    <div
      class="st-scatterPlot__visual"
      role="img"
      :aria-label="label"
      @pointermove="handleVisualPointerMove"
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
        <template v-for="t in yTicks" :key="t">
          <line class="st-scatterPlot__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="gridY(t)" :y2="gridY(t)" />
          <text class="st-scatterPlot__tick" :x="MARGIN.left - 6" :y="gridY(t)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <text v-for="t in xTicks" :key="`xt${t}`" class="st-scatterPlot__tick" :x="tickX(t)" :y="height - MARGIN.bottom + 16" text-anchor="middle">{{ formatTick(t) }}</text>
        <line class="st-scatterPlot__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-scatterPlot__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <text v-if="props.xLabel" class="st-scatterPlot__axisLabel" :x="MARGIN.left + plotW / 2" :y="height - 4" text-anchor="middle">{{ props.xLabel }}</text>
        <text
          v-if="props.yLabel"
          class="st-scatterPlot__axisLabel"
          :x="12"
          :y="MARGIN.top + plotH / 2"
          text-anchor="middle"
          :transform="`rotate(-90 12 ${MARGIN.top + plotH / 2})`"
        >{{ props.yLabel }}</text>
        <g v-if="annotationRegions.length > 0" class="st-scatterPlot__annotations st-scatterPlot__annotations--behind">
          <template v-for="a in annotationRegions" :key="`ann-region-${a.key}`">
            <rect class="st-scatterPlot__annotationRegion" :x="a.x" :y="a.y" :width="a.width" :height="a.height" />
            <text v-if="a.label" class="st-scatterPlot__annotationLabel" :x="a.x + 4" :y="a.y + 11">{{ a.label }}</text>
          </template>
        </g>
        <circle
          v-for="(p, i) in points"
          :key="`p${i}`"
          :class="classNames('st-scatterPlot__point', `st-scatterPlot__point--${p.tone}`)"
          :cx="p.cx"
          :cy="p.cy"
          :r="p.r"
          :data-chart-index="i"
        />
        <g v-for="(c, i) in centroidMarks" :key="`c${i}`" :class="classNames('st-scatterPlot__centroid', `st-scatterPlot__centroid--${c.tone}`)">
          <circle class="st-scatterPlot__centroidRing" :cx="c.cx" :cy="c.cy" r="7" />
          <line class="st-scatterPlot__centroidCross" :x1="c.cx - 3.5" :x2="c.cx + 3.5" :y1="c.cy" :y2="c.cy" />
          <line class="st-scatterPlot__centroidCross" :x1="c.cx" :x2="c.cx" :y1="c.cy - 3.5" :y2="c.cy + 3.5" />
        </g>
        <g v-if="annotationAbove.length > 0" class="st-scatterPlot__annotations st-scatterPlot__annotations--above">
          <template v-for="a in annotationAbove" :key="a.key">
            <template v-if="a.kind === 'line'">
              <line class="st-scatterPlot__annotationLine" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" />
              <text
                v-if="a.label"
                class="st-scatterPlot__annotationLabel"
                :x="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotW - 4"
                :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                :text-anchor="a.axis === 'x' ? 'start' : 'end'"
              >{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon class="st-scatterPlot__annotationShape" :points="polygonPoints(a.points)" />
              <text v-if="a.label" class="st-scatterPlot__annotationLabel" :x="a.labelX" :y="a.labelY" text-anchor="middle">{{ a.label }}</text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle class="st-scatterPlot__annotationPoint" :cx="a.x" :cy="a.y" r="4.5" />
              <text v-if="a.label" class="st-scatterPlot__annotationLabel" :x="a.x" :y="a.y - 8" text-anchor="middle">{{ a.label }}</text>
            </template>
            <text v-else class="st-scatterPlot__annotationText" :x="a.x" :y="a.y" :text-anchor="a.anchor">{{ a.text }}</text>
          </template>
        </g>
        <g v-if="dataLabelItems.length > 0" class="st-scatterPlot__dataLabels" aria-hidden="true">
          <text
            v-for="d in dataLabelItems"
            :key="d.key"
            class="st-scatterPlot__dataLabel"
            :x="d.x"
            :y="d.y"
            text-anchor="middle"
            :dominant-baseline="d.baseline"
          >{{ d.text }}</text>
        </g>
        <g v-if="hovered" class="st-scatterPlot__crosshair" aria-hidden="true">
          <line class="st-scatterPlot__crosshairLine" :x1="hovered.cx" :x2="hovered.cx" :y1="MARGIN.top" :y2="MARGIN.top + plotH" />
          <line class="st-scatterPlot__crosshairLine" :x1="MARGIN.left" :x2="MARGIN.left + plotW" :y1="hovered.cy" :y2="hovered.cy" />
          <circle class="st-scatterPlot__crosshairMarker" :cx="hovered.cx" :cy="hovered.cy" r="5" />
        </g>
      </svg>
      <svg
        v-if="navEnabled"
        class="st-scatterPlot__navLayer"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        :aria-label="`${label} — points de données`"
      >
        <rect
          v-for="(p, i) in points"
          :key="`nav${p.index}`"
          :ref="(el) => setNavRef(el, i)"
          class="st-scatterPlot__navDatum"
          :x="p.cx - NAV_HIT / 2"
          :y="p.cy - NAV_HIT / 2"
          :width="NAV_HIT"
          :height="NAV_HIT"
          rx="3"
          role="img"
          :tabindex="rovingTabIndex(i, focusedIndex, points.length)"
          :aria-label="datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y)"
          @keydown="(event: KeyboardEvent) => handleDatapointKeyDown(event, i)"
          @focus="onNavFocus(i)"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hovered"
      class="st-scatterPlot__tooltip"
      role="presentation"
      :style="`left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`"
    >
      <span v-if="hovered.datum.label" class="st-scatterPlot__tooltipLabel">{{ hovered.datum.label }}</span>
      <span class="st-scatterPlot__tooltipValue">{{ `x ${hovered.datum.x} · y ${hovered.datum.y}` }}</span>
    </div>
  </div>
</template>
