import {
  buildAnalyticsClusterModel,
  buildForecastModel,
  type DataModel,
  type Row,
} from '@sentropic/dataviz-core';
import type {
  LineChartDatum,
  ScatterPlotCentroid,
  ScatterPlotDatum,
  ScatterPlotTone,
} from '@sentropic/design-system-vue';

const CLUSTER_TONES: ScatterPlotTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function numericPairs(rows: readonly Row[], xField: string, yField: string): Array<{ x: number; y: number }> {
  return rows
    .map((row) => {
      const x = toFiniteNumber(row[xField]);
      const y = toFiniteNumber(row[yField]);
      return x === undefined || y === undefined ? undefined : { x, y };
    })
    .filter((point): point is { x: number; y: number } => point !== undefined)
    .sort((a, b) => a.x - b.x);
}

export function buildForecastLineData(
  model: DataModel,
  rows: readonly Row[],
  config: { x: string; y: string; periods: number; step?: number },
): LineChartDatum[] {
  const forecast = buildForecastModel(model, rows, config);
  const actual = numericPairs(rows, config.x, config.y).map((point) => ({ x: point.x, y: point.y }));
  return [
    ...actual,
    ...forecast.points.map((point) => ({ x: point.x, y: point.y, forecast: true })),
  ];
}

export function buildClusterScatterData(
  model: DataModel,
  rows: readonly Row[],
  config: { fields: string[]; k: number; maxIterations?: number },
): {
  data: ScatterPlotDatum[];
  centroids: ScatterPlotCentroid[];
  xLabel: string;
  yLabel: string;
} {
  const clusterModel = buildAnalyticsClusterModel(model, rows, config);
  const xField = config.fields[0]!;
  const yField = config.fields[1] ?? xField;
  const rowCluster = new Map<number, number>();

  clusterModel.clusters.forEach((cluster, clusterIndex) => {
    cluster.rowIndices.forEach((rowIndex) => rowCluster.set(rowIndex, clusterIndex));
  });

  const data = rows
    .map((row, rowIndex): ScatterPlotDatum | undefined => {
      const x = toFiniteNumber(row[xField]);
      const y = toFiniteNumber(row[yField]);
      if (x === undefined || y === undefined) return undefined;
      const clusterIndex = rowCluster.get(rowIndex) ?? 0;
      const cluster = clusterModel.clusters[clusterIndex];
      return {
        x,
        y,
        label: `${xField} ${x} · ${yField} ${y}`,
        tone: CLUSTER_TONES[clusterIndex % CLUSTER_TONES.length],
        r: Math.max(5, Math.min(14, Math.sqrt(cluster?.count ?? 1) * 4)),
      };
    })
    .filter((point): point is ScatterPlotDatum => point !== undefined);

  const centroids = clusterModel.clusters
    .map((cluster, clusterIndex): ScatterPlotCentroid | undefined => {
      const x = cluster.centroid[xField];
      const y = cluster.centroid[yField];
      if (x === undefined || y === undefined) return undefined;
      return {
        x,
        y,
        label: `${cluster.id}: ${cluster.count}`,
        tone: CLUSTER_TONES[clusterIndex % CLUSTER_TONES.length],
      };
    })
    .filter((centroid): centroid is ScatterPlotCentroid => centroid !== undefined);

  return { data, centroids, xLabel: xField, yLabel: yField };
}
