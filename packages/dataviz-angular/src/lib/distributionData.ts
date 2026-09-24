import {
  buildBoxPlotModel,
  buildBulletChartModel,
  buildGaugeChartModel,
  buildHeatmapModel,
  buildHistogramModel,
  findDimension,
  findMeasure,
  groupAggregate,
  type BoxPlotConfig,
  type BulletChartConfig,
  type DataModel,
  type GaugeChartConfig,
  type GaugeChartModel,
  type HeatmapConfig,
  type HistogramConfig,
  type Row,
} from '@sentropic/dataviz-core';

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

export function buildHistogramData(model: DataModel, rows: readonly Row[], config: HistogramConfig) {
  try {
    return buildHistogramModel(model, rows, config).bins.map((bin) => ({
      label: `${formatNumber(bin.x0)}-${formatNumber(bin.x1)}`,
      value: bin.count,
    }));
  } catch {
    return [];
  }
}

export function buildBoxPlotData(model: DataModel, rows: readonly Row[], config: BoxPlotConfig) {
  try {
    return buildBoxPlotModel(model, rows, config).groups.map((group) => ({
      label: group.label,
      min: group.min,
      q1: group.q1,
      median: group.median,
      q3: group.q3,
      max: group.max,
      outliers: group.outliers,
    }));
  } catch {
    return [];
  }
}

export function buildHeatmapData(model: DataModel, rows: readonly Row[], config: HeatmapConfig) {
  try {
    return buildHeatmapModel(model, rows, config).cells.map((cell) => ({
      x: cell.xKey,
      y: cell.yKey,
      value: cell.value,
    }));
  } catch {
    return [];
  }
}

export function buildCalendarHeatmapData(
  model: DataModel,
  rows: readonly Row[],
  date: string,
  measureId: string,
) {
  const measure = findMeasure(model, measureId);
  if (!findDimension(model, date) || !measure) return [];
  return groupAggregate([...rows], date, measure).map((point) => ({
    date: point.key,
    value: point.value,
  }));
}

export function buildBulletData(model: DataModel, rows: readonly Row[], config: BulletChartConfig) {
  try {
    return buildBulletChartModel(model, rows, config).data.map((datum) => ({
      label: datum.label,
      value: datum.value,
      target: datum.target,
      ranges: datum.ranges,
    }));
  } catch {
    return [];
  }
}

export function buildGaugeData(model: DataModel, rows: readonly Row[], config: GaugeChartConfig): GaugeChartModel {
  try {
    return buildGaugeChartModel(model, rows, config);
  } catch {
    return {
      label: config.label ?? config.value,
      valueId: config.value,
      value: 0,
      displayValue: 0,
      min: config.min ?? 0,
      max: config.max ?? 100,
      thresholds: config.thresholds ? [...config.thresholds] : undefined,
      format: config.format ?? 'number',
      unit: config.unit,
    };
  }
}
