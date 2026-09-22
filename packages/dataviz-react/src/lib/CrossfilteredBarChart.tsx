import {
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-react';
import {
  findDimension,
  findMeasure,
  groupAggregate,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

const HIDDEN_LIST_STYLE = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
} as const;

function classNames(...parts: Array<string | false | undefined>): string | undefined {
  return parts.filter(Boolean).join(' ') || undefined;
}

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trimNumber(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trimNumber(value / 1_000)}k`;
  return trimNumber(value);
}

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) return [min];
  const step = niceStep(Math.abs(max - min) / Math.max(target - 1, 1));
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }
  return ticks;
}

function dynamicHorizontalMargin(data: readonly BarChartDatum[], width: number): number {
  const longest = Math.max(0, ...data.map((item) => item.label.length));
  const requested = Math.ceil(longest * 6.6 + 18);
  return Math.min(Math.max(44, requested), Math.max(88, width * 0.45));
}

function scaleLinear(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d0 === d1) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

type HorizontalBarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  label: string;
  domain?: [number, number];
  selectedKeys?: string[];
  onSelect?: (key: string) => void;
  className?: string;
};

function HorizontalBarChart({
  data,
  width = 480,
  height = 240,
  label,
  domain,
  selectedKeys = [],
  onSelect,
  className,
}: HorizontalBarChartProps) {
  const selectedSet = new Set(selectedKeys);
  const hasSelection = selectedSet.size > 0;
  const interactive = typeof onSelect === 'function';
  const values = data.map((item) => item.value).filter(Number.isFinite);
  const minRaw = domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) ? domain[0] : Math.min(0, ...values);
  const maxRaw = domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) ? domain[1] : Math.max(0, ...values, 1);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0] ?? 0;
  const domainMax = ticks[ticks.length - 1] ?? 1;
  const margin = {
    top: 12,
    right: 16,
    bottom: 32,
    left: dynamicHorizontalMargin(data, width),
  };
  const plotWidth = Math.max(width - margin.left - margin.right, 1);
  const plotHeight = Math.max(height - margin.top - margin.bottom, 1);
  const band = data.length === 0 ? plotHeight : plotHeight / data.length;
  const barHeight = Math.max(4, band * 0.62);
  const xForValue = (value: number) => margin.left + scaleLinear(value, domainMin, domainMax, 0, plotWidth);
  const baselineX = xForValue(Math.min(domainMax, Math.max(domainMin, 0)));
  const bars = data.map((datum, index) => {
    const valueX = xForValue(datum.value);
    const y = margin.top + band * index + (band - barHeight) / 2;
    return {
      datum,
      tone: datum.tone ?? 'category1',
      x: Math.min(valueX, baselineX),
      y,
      width: Math.max(Math.abs(valueX - baselineX), 0.5),
      height: barHeight,
      cy: margin.top + band * (index + 0.5),
    };
  });

  return (
    <div className={classNames('st-barChart', className)}>
      <div className="st-barChart__visual" role="img" aria-label={label}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          {ticks.map((tick) => {
            const x = xForValue(tick);
            return (
              <g key={tick}>
                <line className="st-barChart__grid" x1={x} x2={x} y1={margin.top} y2={margin.top + plotHeight} />
                <text className="st-barChart__tickLabel" x={x} y={height - margin.bottom + 16} textAnchor="middle">
                  {formatCompact(tick)}
                </text>
              </g>
            );
          })}
          <line className="st-barChart__axis" x1={margin.left} x2={margin.left} y1={margin.top} y2={height - margin.bottom} />
          <line className="st-barChart__axis" x1={margin.left} x2={width - margin.right} y1={height - margin.bottom} y2={height - margin.bottom} />
          {bars.map((bar) => (
            <text key={`label-${bar.datum.label}`} className="st-barChart__categoryLabel" x={margin.left - 6} y={bar.cy} textAnchor="end" dominantBaseline="middle">
              {bar.datum.label}
            </text>
          ))}
          {bars.map((bar) => {
            const isSelected = selectedSet.has(bar.datum.label);
            return (
              <rect
                key={bar.datum.label}
                className={classNames(
                  'st-barChart__bar',
                  `st-barChart__bar--${bar.tone}`,
                  isSelected && 'st-barChart__bar--selected',
                  hasSelection && !isSelected && 'st-barChart__bar--dim',
                  interactive && 'st-barChart__bar--interactive',
                )}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx="2"
                onClick={interactive ? () => onSelect?.(bar.datum.label) : undefined}
              />
            );
          })}
        </svg>
      </div>
      {interactive ? (
        <div className="st-barChart__filters" role="group" aria-label={`Filtrer par ${label}`}>
          {bars.map((bar) => {
            const isSelected = selectedSet.has(bar.datum.label);
            return (
              <button
                key={bar.datum.label}
                type="button"
                className={classNames('st-barChart__filterChip', `st-barChart__filterChip--${bar.tone}`, isSelected && 'st-barChart__filterChip--selected')}
                aria-pressed={isSelected}
                onClick={() => onSelect?.(bar.datum.label)}
              >
                <span className="st-barChart__filterSwatch" aria-hidden="true" />
                {`${bar.datum.label}: ${bar.datum.value}`}
              </button>
            );
          })}
        </div>
      ) : null}
      <ul className="st-chartDataList" aria-label={`Data values for ${label}`} style={HIDDEN_LIST_STYLE}>
        {data.map((datum) => <li key={datum.label}>{`${datum.label}: ${datum.value}`}</li>)}
      </ul>
    </div>
  );
}

export type CrossfilteredBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id to group rows by (one bar per distinct value). */
  dimension: string;
  /** Measure id to aggregate into each bar's value. */
  measure: string;
  /** Accessible label of the chart (required by the design-system BarChart). */
  label: string;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  /**
   * When true (default) clicking a bar toggles this view's selection (brushing
   * input → `store.toggleSelection`); selected bars are highlighted. Set false
   * for an output-only facet.
   */
  selectable?: boolean;
  /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
  domain?: [number, number];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  className?: string;
};

/**
 * A design-system `BarChart` whose data is the cross-filtered, aggregated view
 * of the shared store. Clicking a bar brushes this view's selection (unless
 * `selectable` is false), and the chart re-aggregates as the shared state moves.
 */
export function CrossfilteredBarChart({
  store,
  viewId,
  dimension,
  measure,
  label,
  tone,
  selectable = true,
  domain,
  orientation = 'vertical',
  width,
  height,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  className,
}: CrossfilteredBarChartProps) {
  const state = useDashboard(store);
  const dim = findDimension(store.model, dimension);
  const m = findMeasure(store.model, measure);
  const data: BarChartDatum[] =
    dim && m
      ? groupAggregate(store.applyCrossfilter(viewId), dimension, m).map(({ key, value }) =>
          tone ? { label: key, value, tone } : { label: key, value },
        )
      : [];
  if (orientation === 'horizontal') {
    return (
      <HorizontalBarChart
        data={data}
        label={label}
        width={width}
        height={height}
        domain={domain}
        className={className}
        selectedKeys={selectable ? (state.selections[viewId] ?? []) : []}
        onSelect={selectable ? (key) => store.toggleSelection(viewId, key) : undefined}
      />
    );
  }
  return (
    <BarChart
      data={data}
      label={label}
      orientation={orientation}
      width={width}
      height={height}
      domain={domain}
      className={className}
      selectedKeys={selectable ? (state.selections[viewId] ?? []) : []}
      onSelect={selectable ? (key) => store.toggleSelection(viewId, key) : undefined}
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
    />
  );
}
