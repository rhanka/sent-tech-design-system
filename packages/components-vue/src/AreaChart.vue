<script setup lang="ts">
import { computed, useId, useAttrs } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from './chartScale.js';
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from './chartAnnotations.js';
import {
  formatDataLabel,
  normalizeDataLabels,
  type DataLabelsProp,
} from './chartDataLabels.js';
import { keyForX, resolveActiveIndex } from './chartCrosshair.js';
import {
  datapointAriaLabel,
  datapointNavAction,
  rovingTabIndex,
} from './chartKeyboardNav.js';
export type AreaChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';
export type AreaChartDatum = {
  x: number | string;
  y: number;
};
export type AreaChartProps = {
  data: (number | AreaChartDatum)[];
  width?: number;
  height?: number;
  tone?: AreaChartTone;
  smooth?: boolean;
  label: string;
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons), resolved to pixels via the chart scales. Regions render behind
   * the area, every other kind above it. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override. Default position is `top` (above the point).
   * Labels are `aria-hidden` — the values already live in the accessible
   * ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
   * provided (string or null), the crosshair + tooltip track this key instead of
   * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * points (data order), Home/End jump to the first/last, Enter/Space select the
   * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
   * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused point via Enter/Space (its key,
   * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
   * also turns the keyboard navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  class?: string;
};
const MARGIN = CHART_MARGIN;

defineOptions({ name: 'AreaChart', inheritAttrs: false });
const props = withDefaults(defineProps<AreaChartProps>(), {
  data: () => [],
  width: 480,
  height: 240,
  tone: 'category1',
  smooth: false,
  annotations: undefined,
  dataLabels: undefined,
  hoverKey: undefined,
  onHoverKeyChange: undefined,
  keyboardNav: undefined,
  onSelectKey: undefined,
  class: undefined,
});
const attrs = useAttrs();
const hoveredIndex = ref<number | null>(null);
const focusedIndex = ref<number>(-1);
const datapointRefs: Array<SVGRectElement | null> = [];
const gradientId = 'st-areachart-gradient-' + useId();
function setDatapointRef(el: unknown, i: number) {
  datapointRefs[i] = el as SVGRectElement | null;
}
const geometry = computed(() => {
  const width = props.width ?? 480;
  const height = props.height ?? 240;
  const tone = props.tone ?? 'category1';
  const smooth = props.smooth ?? false;
  const label = props.label;

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const normalizedData: AreaChartDatum[] = (props.data ?? []).map((d, i) =>
    typeof d === 'number' ? ({ x: i, y: d } as AreaChartDatum) : d,
  );

  const dataValueItems = [
    ...normalizedData.map((d) => `${d.x}: ${d.y}`),
    ...annotationDataListItems(props.annotations),
  ];

  let xDomain:
    | { kind: 'ordinal'; values: (number | string)[] }
    | { kind: 'numeric'; min: number; max: number };
  if (normalizedData.length === 0) {
    xDomain = { kind: 'ordinal', values: [] };
  } else if (normalizedData.every((d) => isNumeric(d.x))) {
    const xs = normalizedData.map((d) => d.x as number);
    xDomain = { kind: 'numeric', min: Math.min(...xs), max: Math.max(...xs) };
  } else {
    xDomain = { kind: 'ordinal', values: normalizedData.map((d) => d.x) };
  }

  let yTicks: number[];
  const ys = normalizedData.map((d) => d.y);
  if (ys.length === 0) {
    yTicks = [0];
  } else {
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
    const minTickVal = Math.min(0, yMin - padded);
    yTicks = niceTicks(minTickVal, yMax + padded, 5);
  }
  const yDomain =
    yTicks.length === 0
      ? { min: 0, max: 1 }
      : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  type Point = { x: number; y: number; datum: AreaChartDatum; index: number };
  let points: Point[] = [];
  if (normalizedData.length !== 0) {
    points = normalizedData.map((d, i) => {
      let x: number;
      if (xDomain.kind === 'numeric') {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(normalizedData.length - 1, 1);
        x =
          normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  }

  // --- Annotation overlay -------------------------------------------------
  // `xScale` honours the ordinal/numeric x domain; `yScale` mirrors the
  // point y mapping. Out-of-domain coordinates yield `null` → the resolver
  // drops them.
  const ordinalIndex = (v: number | string) => {
    if (xDomain.kind !== 'ordinal') return null;
    const i = normalizedData.findIndex((d) => d.x === v);
    if (i < 0) return null;
    const denom = Math.max(normalizedData.length - 1, 1);
    return normalizedData.length === 1
      ? plotWidth / 2
      : (i / denom) * plotWidth;
  };
  const annotationXScale = (v: number | string): number | null => {
    if (xDomain.kind === 'numeric') {
      if (typeof v !== 'number' || !Number.isFinite(v)) return null;
      if (v < xDomain.min || v > xDomain.max) return null;
      return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
    }
    return ordinalIndex(v);
  };
  const annotationYScale = (v: number): number | null => {
    if (!Number.isFinite(v) || v < yDomain.min || v > yDomain.max) return null;
    return scaleLinear(v, yDomain.min, yDomain.max, plotHeight, 0);
  };
  const resolvedAnnotations = resolveAnnotations(props.annotations, {
    xScale: annotationXScale,
    yScale: annotationYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter(
    (a) => a.kind === 'region',
  );
  const annotationAbove = resolvedAnnotations.filter(
    (a) => a.kind !== 'region',
  );

  // --- Data labels ------------------------------------------------------
  // One value label per point. Default `top`: just above the dot. `center`
  // sits on the dot. aria-hidden (values are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(props.dataLabels);
  type DataLabelItem = {
    key: number;
    x: number;
    y: number;
    text: string;
    baseline: string;
  };
  const dataLabelItems: DataLabelItem[] = dataLabelOpts.enabled
    ? points.map((p) => {
        const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
        const center =
          dataLabelOpts.position === 'center' ||
          dataLabelOpts.position === 'inside';
        return {
          key: p.index,
          x: p.x,
          y: center ? p.y : p.y - 8,
          text,
          baseline: center ? 'middle' : 'auto',
        };
      })
    : [];

  const linePath =
    points.length === 0
      ? ''
      : smooth
        ? buildSmoothPath(points)
        : buildLinearPath(points);

  let areaPath = '';
  if (points.length !== 0) {
    const base =
      MARGIN.top +
      scaleLinear(
        Math.max(0, yDomain.min),
        yDomain.min,
        yDomain.max,
        plotHeight,
        0,
      );
    const first = points[0];
    const last = points[points.length - 1];
    areaPath = `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  }

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  let xTickEntries: { x: number; label: string }[] = [];
  if (normalizedData.length !== 0) {
    if (xDomain.kind === 'ordinal') {
      xTickEntries = points.map((p, i) => ({
        x: p.x,
        label: String(normalizedData[i].x),
      }));
    } else {
      const target = Math.min(5, normalizedData.length);
      const stride = Math.max(
        1,
        Math.round((normalizedData.length - 1) / (target - 1 || 1)),
      );
      for (let i = 0; i < normalizedData.length; i += stride) {
        xTickEntries.push({
          x: points[i].x,
          label: String(normalizedData[i].x),
        });
      }
      const lastIdx = normalizedData.length - 1;
      if (
        xTickEntries[xTickEntries.length - 1]?.label !==
        String(normalizedData[lastIdx].x)
      ) {
        xTickEntries.push({
          x: points[lastIdx].x,
          label: String(normalizedData[lastIdx].x),
        });
      }
    }
  }

  return {
    width,
    height,
    tone,
    plotWidth,
    plotHeight,
    normalizedData,
    points,
    gridLines,
    xTickEntries,
    annotationRegions,
    annotationAbove,
    dataLabelItems,
    dataValueItems,
    linePath,
    areaPath,
  };
});
const hoverKeys = computed(() =>
  geometry.value.normalizedData.map((d) => keyForX(d.x)),
);
const emitHoverKey = (index: number | null) => {
  props.onHoverKeyChange?.(
    index == null ? null : (hoverKeys.value[index] ?? null),
  );
};
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

// Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey`
// when provided (resolved against `hoverKeys`), else the pointer index.
const activeIndex = computed(() =>
  resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys.value),
);
const hoveredPoint = computed(() =>
  activeIndex.value >= 0 ? geometry.value.points[activeIndex.value] : undefined,
);

// --- Keyboard navigation (FR-5) --------------------------------------
const navEnabled = computed(
  () =>
    (props.keyboardNav === true || props.onSelectKey !== undefined) &&
    geometry.value.points.length > 0,
);
// Comfortable square hit area centred on each dot.
const NAV_HIT = 18;
const focusDatum = (index: number) => {
  focusedIndex.value = index;
  datapointRefs[index]?.focus();
  emitHoverKey(index);
};
function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
  const points = geometry.value.points;
  const action = datapointNavAction(event.key, index, points.length);
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
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (
      classNames('st-areaChart', `st-areaChart--${geometry.tone}`, props.class)
    ) }"

  >
    <div
      class="st-areaChart__visual"
      role="img"
      :aria-label="props.label"
      @pointermove="handleVisualPointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <template v-for="g in geometry.gridLines" :key="`g${g.value}`">
          <line
            class="st-areaChart__grid"
            :x1="MARGIN.left"
            :x2="geometry.width - MARGIN.right"
            :y1="g.y"
            :y2="g.y"
          />
          <text
            class="st-areaChart__tickLabel"
            :x="MARGIN.left - 6"
            :y="g.y"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ formatTick(g.value) }}
          </text>
        </template>
        <line
          class="st-areaChart__axis"
          :x1="MARGIN.left"
          :x2="MARGIN.left"
          :y1="MARGIN.top"
          :y2="geometry.height - MARGIN.bottom"
        />
        <line
          class="st-areaChart__axis"
          :x1="MARGIN.left"
          :x2="geometry.width - MARGIN.right"
          :y1="geometry.height - MARGIN.bottom"
          :y2="geometry.height - MARGIN.bottom"
        />
        <text
          v-for="(tick, i) in geometry.xTickEntries"
          :key="`x${i}`"
          class="st-areaChart__tickLabel"
          :x="tick.x"
          :y="geometry.height - MARGIN.bottom + 16"
          text-anchor="middle"
        >
          {{ tick.label }}
        </text>
        <g
          v-if="geometry.annotationRegions.length > 0"
          class="st-areaChart__annotations st-areaChart__annotations--behind"
        >
          <template
            v-for="a in geometry.annotationRegions"
            :key="`ann-region-${a.key}`"
          >
            <rect
              class="st-areaChart__annotationRegion"
              :x="a.x"
              :y="a.y"
              :width="a.width"
              :height="a.height"
            />
            <text
              v-if="a.label"
              class="st-areaChart__annotationLabel"
              :x="a.x + 4"
              :y="a.y + 11"
            >
              {{ a.label }}
            </text>
          </template>
        </g>
        <path
          v-if="geometry.areaPath"
          class="st-areaChart__area"
          :d="geometry.areaPath"
          :fill="`url(#${gradientId})`"
        />
        <path
          v-if="geometry.linePath"
          class="st-areaChart__line"
          :d="geometry.linePath"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="p in geometry.points"
          :key="p.index"
          class="st-areaChart__dot"
          :cx="p.x"
          :cy="p.y"
          r="4"
          :data-chart-index="p.index"
        />
        <g
          v-if="geometry.annotationAbove.length > 0"
          class="st-areaChart__annotations st-areaChart__annotations--above"
        >
          <template v-for="a in geometry.annotationAbove" :key="`ann-${a.key}`">
            <template v-if="a.kind === 'line'">
              <line
                class="st-areaChart__annotationLine"
                :x1="a.x1"
                :y1="a.y1"
                :x2="a.x2"
                :y2="a.y2"
              />
              <text
                v-if="a.label"
                class="st-areaChart__annotationLabel"
                :x="
                  a.axis === 'x'
                    ? a.x1 + 4
                    : MARGIN.left + geometry.plotWidth - 4
                "
                :y="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                :text-anchor="a.axis === 'x' ? 'start' : 'end'"
              >
                {{ a.label }}
              </text>
            </template>
            <template v-else-if="a.kind === 'shape'">
              <polygon
                class="st-areaChart__annotationShape"
                :points="polygonPoints(a.points)"
              />
              <text
                v-if="a.label"
                class="st-areaChart__annotationLabel"
                :x="a.labelX"
                :y="a.labelY"
                text-anchor="middle"
              >
                {{ a.label }}
              </text>
            </template>
            <template v-else-if="a.kind === 'point'">
              <circle
                class="st-areaChart__annotationPoint"
                :cx="a.x"
                :cy="a.y"
                r="4.5"
              />
              <text
                v-if="a.label"
                class="st-areaChart__annotationLabel"
                :x="a.x"
                :y="a.y - 8"
                text-anchor="middle"
              >
                {{ a.label }}
              </text>
            </template>
            <text
              v-else
              class="st-areaChart__annotationText"
              :x="a.x"
              :y="a.y"
              :text-anchor="
                (a as { anchor?: string }).anchor ??
                (a as { anchor: string }).anchor
              "
            >
              {{ a.text }}
            </text>
          </template>
        </g>
        <g
          v-if="geometry.dataLabelItems.length > 0"
          class="st-areaChart__dataLabels"
          aria-hidden="true"
        >
          <text
            v-for="d in geometry.dataLabelItems"
            :key="`dl-${d.key}`"
            class="st-areaChart__dataLabel"
            :x="d.x"
            :y="d.y"
            text-anchor="middle"
            :dominant-baseline="d.baseline"
          >
            {{ d.text }}
          </text>
        </g>
        <g
          v-if="hoveredPoint"
          class="st-areaChart__crosshair"
          aria-hidden="true"
        >
          <line
            class="st-areaChart__crosshairLine"
            :x1="hoveredPoint.x"
            :x2="hoveredPoint.x"
            :y1="MARGIN.top"
            :y2="MARGIN.top + geometry.plotHeight"
          />
          <circle
            class="st-areaChart__crosshairMarker"
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.y"
            r="5"
          />
        </g>
      </svg>
      <svg
        v-if="navEnabled"
        class="st-areaChart__navLayer"
        :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        :aria-label="`${props.label} — points de données`"
      >
        <rect
          v-for="(p, i) in geometry.points"
          :key="p.index"
          :ref="(el: unknown) => setDatapointRef(el, i)"
          class="st-areaChart__navDatum"
          :x="p.x - 9"
          :y="p.y - 9"
          :width="18"
          :height="18"
          rx="3"
          role="img"
          :tabindex="rovingTabIndex(i, focusedIndex, geometry.points.length)"
          :aria-label="datapointAriaLabel(p.datum.x, p.datum.y)"
          @keydown="handleDatapointKeyDown($event, i)"
          @focus="
            focusedIndex = i;
            emitHoverKey(i);
          "
        />
      </svg>
    </div>
    <ul
      v-if="geometry.dataValueItems.length > 0"
      class="st-chartDataList"
      :aria-label="`Data values for ${props.label}`"
    >
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredPoint"
      class="st-areaChart__tooltip"
      role="presentation"
      :style="`left: ${(hoveredPoint.x / geometry.width) * 100}%; top: ${(hoveredPoint.y / geometry.height) * 100}%`"
    >
      <span class="st-areaChart__tooltipLabel">{{
        String(hoveredPoint.datum.x)
      }}</span
      ><span class="st-areaChart__tooltipValue">{{
        String(hoveredPoint.datum.y)
      }}</span>
    </div>
  </div>
</template>
