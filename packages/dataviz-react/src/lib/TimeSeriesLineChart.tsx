import React from 'react';
import { buildTimeSeriesModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TimeSeriesLineChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type TimeSeriesLineChartProps = {
  store: DashboardStore;
  viewId: string;
  time: string;
  measure: string;
  series?: string;
  tone?: TimeSeriesLineChartTone;
  width?: number;
  height?: number;
  label: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  formatTime?: (value: number, context: { min: number; max: number }) => string;
  formatValue?: (value: number) => string;
  className?: string;
};

type Point = {
  x: number;
  y: number;
  value: number;
  time: number;
  index: number;
};

const TONES: TimeSeriesLineChartTone[] = ['category1', 'category2', 'category3', 'category4', 'category5', 'category6', 'category7', 'category8'];

const HIDDEN_LIST_STYLE: React.CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
};

function classNames(...parts: Array<string | undefined | false>): string | undefined {
  return parts.filter(Boolean).join(' ') || undefined;
}

function scaleLinear(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d0 === d1) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
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

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function defaultFormatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trimNumber(value / 1_000_000)} M`;
  if (abs >= 1_000) return `${trimNumber(value / 1_000)} k`;
  return trimNumber(value);
}

function defaultFormatTime(value: number, context: { min: number; max: number }): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value);
  const span = context.max - context.min;
  const day = 24 * 60 * 60 * 1000;
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
  if (span < day * 2) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(date).replace(' AM', 'am').replace(' PM', 'pm');
  }
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(date).replace(' AM', 'am').replace(' PM', 'pm');
  return `${monthDay},\n${time}`;
}

function selectTickIndexes(count: number, plotWidth: number): number[] {
  if (count <= 0) return [];
  if (count <= 6) return Array.from({ length: count }, (_value, index) => index);
  const target = Math.max(2, Math.min(6, Math.floor(plotWidth / 92)));
  const stride = Math.max(1, Math.ceil((count - 1) / Math.max(target - 1, 1)));
  const indexes: number[] = [];
  for (let index = 0; index < count; index += stride) indexes.push(index);
  if (indexes[indexes.length - 1] !== count - 1) indexes.push(count - 1);
  return indexes;
}

function buildPath(points: Point[]): string {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function toneFor(index: number, preferred?: TimeSeriesLineChartTone): TimeSeriesLineChartTone {
  return index === 0 && preferred ? preferred : TONES[index % TONES.length];
}

function toneColor(tone: TimeSeriesLineChartTone): string {
  return `var(--st-semantic-data-${tone})`;
}

function lineRuns(points: Array<Point | null>): Point[][] {
  const runs: Point[][] = [];
  let current: Point[] = [];
  for (const point of points) {
    if (point) {
      current.push(point);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) runs.push(current);
  return runs;
}

function tickAnchor(index: number, count: number): 'start' | 'middle' | 'end' {
  if (index === 0) return 'start';
  if (index === count - 1) return 'end';
  return 'middle';
}

function renderMultilineLabel(label: string, x: number, y: number, anchor: 'start' | 'middle' | 'end') {
  const lines = label.split('\n');
  return (
    <text className="st-timeSeriesLineChart__xTickLabel" x={x} y={y} textAnchor={anchor} fill="var(--st-semantic-text-secondary)" fontSize="11">
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function TimeSeriesLineChart({
  store,
  viewId,
  time,
  measure,
  series,
  tone,
  width = 480,
  height = 240,
  label,
  legend = true,
  hiddenSeries,
  onToggleSeries,
  formatTime = defaultFormatTime,
  formatValue = defaultFormatValue,
  className,
}: TimeSeriesLineChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildTimeSeriesModel(store.model, store.applyCrossfilter(viewId), { time, measure, series });
  const hiddenSet = new Set(hiddenSeries ?? []);
  const visibleSeries = model.series.filter((item) => !hiddenSet.has(item.label));
  const values = visibleSeries.flatMap((item) => item.values).filter((value): value is number => value !== null && Number.isFinite(value));
  const minRaw = values.length === 0 ? 0 : Math.min(...values);
  const maxRaw = values.length === 0 ? 1 : Math.max(...values);
  const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
  const yMinRaw = minRaw >= 0 ? 0 : minRaw - padded;
  const yMaxRaw = maxRaw <= 0 ? 0 : maxRaw + padded;
  const yTicks = niceTicks(yMinRaw, yMaxRaw, 5);
  const yMin = yTicks[0] ?? 0;
  const yMax = yTicks[yTicks.length - 1] ?? 1;
  const longestY = Math.max(...yTicks.map((tick) => formatValue(tick).length), 1);
  const margin = { top: 12, right: 18, bottom: 44, left: Math.max(44, longestY * 7 + 18) };
  const plotWidth = Math.max(width - margin.left - margin.right, 1);
  const plotHeight = Math.max(height - margin.top - margin.bottom - (legend ? 20 : 0), 1);
  const minTime = model.times[0] ?? 0;
  const maxTime = model.times[model.times.length - 1] ?? minTime + 1;
  const xForTime = (value: number) => margin.left + scaleLinear(value, minTime, maxTime, 0, plotWidth);
  const yForValue = (value: number) => margin.top + scaleLinear(value, yMin, yMax, plotHeight, 0);
  const tickIndexes = selectTickIndexes(model.times.length, plotWidth);
  const dataItems = model.series.flatMap((item) =>
    item.values.flatMap((value, index) =>
      value === null ? [] : [`${item.label}, ${formatTime(model.times[index] ?? 0, { min: minTime, max: maxTime }).replace('\n', ' ')}: ${formatValue(value)}`],
    ),
  );
  const legendInteractive = onToggleSeries !== undefined || hiddenSeries !== undefined;

  return (
    <div className={classNames('st-timeSeriesLineChart', className)}>
      <div className="st-timeSeriesLineChart__visual" role="img" aria-label={label}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" focusable="false" aria-hidden="true">
          {yTicks.map((tick) => {
            const y = yForValue(tick);
            return (
              <React.Fragment key={tick}>
                <line className="st-timeSeriesLineChart__grid" x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="var(--st-semantic-border-subtle)" strokeDasharray="2 3" />
                <text className="st-timeSeriesLineChart__yTickLabel" x={margin.left - 6} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--st-semantic-text-secondary)" fontSize="11">
                  {formatValue(tick)}
                </text>
              </React.Fragment>
            );
          })}
          <line className="st-timeSeriesLineChart__axis" x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + plotHeight} stroke="var(--st-semantic-border-subtle)" />
          <line className="st-timeSeriesLineChart__axis" x1={margin.left} x2={width - margin.right} y1={margin.top + plotHeight} y2={margin.top + plotHeight} stroke="var(--st-semantic-border-subtle)" />
          {tickIndexes.map((index) => {
            const tick = model.times[index] ?? 0;
            return (
              <React.Fragment key={tick}>
                {renderMultilineLabel(formatTime(tick, { min: minTime, max: maxTime }), xForTime(tick), margin.top + plotHeight + 15, tickAnchor(index, model.times.length))}
              </React.Fragment>
            );
          })}
          {model.series.map((item, seriesIndex) => {
            if (hiddenSet.has(item.label)) return null;
            const color = toneColor(toneFor(seriesIndex, tone));
            const points = item.values.map((value, index): Point | null => {
              if (value === null || !Number.isFinite(value)) return null;
              const timeValue = model.times[index];
              if (timeValue === undefined) return null;
              return { x: xForTime(timeValue), y: yForValue(value), value, time: timeValue, index };
            });
            return lineRuns(points).map((run, runIndex) => (
              <path key={`${item.id}-${runIndex}`} className="st-timeSeriesLineChart__line" d={buildPath(run)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ));
          })}
        </svg>
      </div>
      <ul className="st-chartDataList" aria-label={`Data values for ${label}`} style={HIDDEN_LIST_STYLE}>
        {dataItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ul>
      {legend && model.series.length > 0 ? (
        <ul className="st-timeSeriesLineChart__legend" aria-hidden={legendInteractive ? undefined : true} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', listStyle: 'none', margin: '6px 0 0', padding: 0 }}>
          {model.series.map((item, index) => {
            const color = toneColor(toneFor(index, tone));
            const off = hiddenSet.has(item.label);
            const content = (
              <>
                <span className="st-timeSeriesLineChart__legendSwatch" aria-hidden="true" style={{ background: color, borderRadius: 999, display: 'inline-block', height: 8, marginRight: 6, width: 8 }} />
                {item.label}
              </>
            );
            return (
              <li key={item.id} className="st-timeSeriesLineChart__legendItem" style={{ color: 'var(--st-semantic-text-secondary)', fontSize: 12 }}>
                {legendInteractive ? (
                  <button type="button" aria-pressed={off} onClick={() => onToggleSeries?.(item.label)} style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', opacity: off ? 0.5 : 1, padding: 0 }}>
                    {content}
                  </button>
                ) : content}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
