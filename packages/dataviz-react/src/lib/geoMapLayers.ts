import {
  buildChoroplethModel,
  buildGeoFlowModel,
  buildGeoJsonLayerModel,
  buildGeoPointModel,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import type { GeoChartFeature, GeoChartFlow, GeoChartLayer, GeoChartPoint } from '@sentropic/design-system-react';

export function mapClass(base: string, className?: string): string {
  return [base, className].filter(Boolean).join(' ');
}

function pointModel(
  store: DashboardStore,
  viewId: string,
  config: { latitude: string; longitude: string; id?: string; label?: string; value?: string },
): GeoChartPoint[] {
  return buildGeoPointModel(store.model, store.applyCrossfilter(viewId), config).points;
}

export function pointsLayer(
  store: DashboardStore,
  viewId: string,
  config: { latitude: string; longitude: string; id?: string; label?: string; value?: string; labelText?: string },
): GeoChartLayer {
  return {
    type: 'points',
    points: pointModel(store, viewId, config),
    label: config.labelText,
  };
}

export function choroplethLayer(
  store: DashboardStore,
  viewId: string,
  config: { region: string; measure: string; geometry?: string; labelText?: string },
): GeoChartLayer {
  const rows = store.applyCrossfilter(viewId);
  const model = buildChoroplethModel(store.model, rows, config);
  const values = Object.fromEntries(model.regions.map((region) => [region.key, region.value]));
  const seen = new Set<string>();
  const features: GeoChartFeature[] =
    config.geometry === undefined
      ? []
      : buildGeoJsonLayerModel(store.model, rows, {
          geometry: config.geometry,
          id: config.region,
          label: config.region,
        }).features
          .filter((feature) => {
            if (seen.has(feature.id)) return false;
            seen.add(feature.id);
            return true;
          })
          .map((feature) => ({ ...feature, value: values[feature.id] }));

  return {
    type: 'choropleth',
    features,
    values,
    label: config.labelText,
  };
}

export function flowLayer(
  store: DashboardStore,
  viewId: string,
  config: {
    sourceLatitude: string;
    sourceLongitude: string;
    targetLatitude: string;
    targetLongitude: string;
    value?: string;
    labelText?: string;
  },
): GeoChartLayer {
  const model = buildGeoFlowModel(store.model, store.applyCrossfilter(viewId), config);
  const flows: GeoChartFlow[] = model.links.map((link) => ({
    id: link.id,
    label: `${link.count} flows`,
    source: link.source,
    target: link.target,
    value: link.value,
  }));
  return { type: 'flow', flows, label: config.labelText };
}

export function hexbinLayer(
  store: DashboardStore,
  viewId: string,
  config: { latitude: string; longitude: string; value?: string; cellSize?: number; labelText?: string },
): GeoChartLayer {
  return {
    type: 'hexbin',
    points: pointModel(store, viewId, config),
    cellSize: config.cellSize,
    label: config.labelText,
  };
}

export function clusterLayer(
  store: DashboardStore,
  viewId: string,
  config: { latitude: string; longitude: string; id?: string; value?: string; radius?: number; labelText?: string },
): GeoChartLayer {
  return {
    type: 'cluster',
    points: pointModel(store, viewId, config),
    radius: config.radius,
    label: config.labelText,
  };
}

export function densityLayer(
  store: DashboardStore,
  viewId: string,
  config: { latitude: string; longitude: string; value?: string; labelText?: string },
): GeoChartLayer {
  return {
    type: 'density',
    points: pointModel(store, viewId, config),
    label: config.labelText,
  };
}

export function geojsonLayer(
  store: DashboardStore,
  viewId: string,
  config: { geometry: string; id?: string; label?: string; value?: string; labelText?: string },
): GeoChartLayer {
  return {
    type: 'geojson',
    features: buildGeoJsonLayerModel(store.model, store.applyCrossfilter(viewId), config).features,
    label: config.labelText,
  };
}
