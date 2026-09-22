import {
  buildCategoricalSeries,
  findDimension,
  findMeasure,
  type CategoricalMeasureInput,
  type CategoricalMode,
  type CategoricalSeriesConfig,
  type CategoricalSeriesModel,
  type DataModel,
  type Row,
} from '@sentropic/dataviz-core';

const EMPTY_CATEGORICAL: CategoricalSeriesModel = {
  categories: [],
  mode: 'grouped',
  series: [],
};

export type SimpleCategoricalDatum = {
  label: string;
  value: number;
};

export type SimpleCategoricalPoint = {
  x: string;
  y: number;
};

export function measureInputId(input: CategoricalMeasureInput): string {
  return typeof input === 'string' ? input : input.id;
}

export function buildSafeCategoricalSeries(
  model: DataModel,
  rows: readonly Row[],
  config: CategoricalSeriesConfig,
): CategoricalSeriesModel {
  if (!findDimension(model, config.category)) return EMPTY_CATEGORICAL;
  if (config.series !== undefined && !findDimension(model, config.series)) return EMPTY_CATEGORICAL;
  if (!config.measures.every((measure) => findMeasure(model, measureInputId(measure)))) {
    return EMPTY_CATEGORICAL;
  }
  return buildCategoricalSeries(model, rows, config);
}

export function buildSimpleCategoricalSeries(
  model: DataModel,
  rows: readonly Row[],
  category: string,
  measure: string,
): CategoricalSeriesModel {
  return buildSafeCategoricalSeries(model, rows, { category, measures: [measure] });
}

export function toSimpleCategoricalData(seriesModel: CategoricalSeriesModel): SimpleCategoricalDatum[] {
  const values = seriesModel.series[0]?.values ?? [];
  return seriesModel.categories.map((label, index) => ({ label, value: values[index] ?? 0 }));
}

export function toSimpleCategoricalPoints(seriesModel: CategoricalSeriesModel): SimpleCategoricalPoint[] {
  const values = seriesModel.series[0]?.values ?? [];
  return seriesModel.categories.map((x, index) => ({ x, y: values[index] ?? 0 }));
}

export function toStackedCategoricalData(seriesModel: CategoricalSeriesModel) {
  return seriesModel.categories.map((label, index) => ({
    label,
    segments: seriesModel.series.map((series) => ({
      label: series.seriesLabel ?? series.label,
      value: series.values[index] ?? 0,
    })),
  }));
}

export type StackedMode = Extract<CategoricalMode, 'stacked' | 'stacked-100'>;
