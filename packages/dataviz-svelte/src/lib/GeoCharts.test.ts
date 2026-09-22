import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import ChoroplethMap from './ChoroplethMap.svelte';
import GeoClusterMap from './GeoClusterMap.svelte';
import GeoDensityMap from './GeoDensityMap.svelte';
import GeoFlowMap from './GeoFlowMap.svelte';
import GeoHexbinMap from './GeoHexbinMap.svelte';
import GeoJsonMap from './GeoJsonMap.svelte';
import GeoPointMap from './GeoPointMap.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'id', label: 'ID', type: 'discrete' },
    { id: 'city', label: 'City', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lon', label: 'Longitude', type: 'continuous' },
    { id: 'targetLat', label: 'Target latitude', type: 'continuous' },
    { id: 'targetLon', label: 'Target longitude', type: 'continuous' },
    { id: 'shape', label: 'Shape', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

const shape = {
  type: 'Polygon',
  coordinates: [
    [
      [2, 48],
      [3, 48],
      [3, 49],
      [2, 48],
    ],
  ],
} as const;

const rows: Row[] = [
  { id: 'paris', city: 'Paris', region: 'FR', lat: 48.8566, lon: 2.3522, targetLat: 45.764, targetLon: 4.8357, revenue: 100, orders: 1, shape },
  { id: 'lyon', city: 'Lyon', region: 'FR', lat: 45.764, lon: 4.8357, targetLat: 48.8566, targetLon: 2.3522, revenue: 50, orders: 1 },
  { id: 'nyc', city: 'New York', region: 'US', lat: 40.7128, lon: -74.006, targetLat: 48.8566, targetLon: 2.3522, revenue: 200, orders: 1 },
  { id: 'bad', city: 'Bad', region: 'XX', lat: 'north', lon: 2, revenue: 999, orders: 1, shape: { type: 'Feature' } },
];

const newStore = () => createDashboardStore({ model, data: rows });

describe('geo charts (svelte)', () => {
  it('renders geo core models through DS GeoMap layers', () => {
    const store = newStore();
    const points = render(GeoPointMap, {
      props: { store, viewId: 'points', latitude: 'lat', longitude: 'lon', id: 'id', labelField: 'city', value: 'revenue', label: 'Points' },
    });
    const regions = render(ChoroplethMap, {
      props: { store, viewId: 'regions', region: 'region', measure: 'revenue', geometry: 'shape', label: 'Regions' },
    });
    const flows = render(GeoFlowMap, {
      props: { store, viewId: 'flows', sourceLatitude: 'lat', sourceLongitude: 'lon', targetLatitude: 'targetLat', targetLongitude: 'targetLon', value: 'revenue', label: 'Flows' },
    });
    const hex = render(GeoHexbinMap, {
      props: { store, viewId: 'hex', latitude: 'lat', longitude: 'lon', value: 'revenue', cellSize: 10, label: 'Hexbins' },
    });
    const clusters = render(GeoClusterMap, {
      props: { store, viewId: 'clusters', latitude: 'lat', longitude: 'lon', id: 'id', value: 'revenue', radius: 4, label: 'Clusters' },
    });
    const density = render(GeoDensityMap, {
      props: { store, viewId: 'density', latitude: 'lat', longitude: 'lon', value: 'revenue', cellSize: 10, label: 'Density' },
    });
    const shapes = render(GeoJsonMap, {
      props: { store, viewId: 'geojson', geometry: 'shape', id: 'id', labelField: 'city', value: 'revenue', label: 'Shapes' },
    });

    expect(points.getByRole('img', { name: 'Points' })).toBeTruthy();
    expect(regions.getByRole('img', { name: 'Regions' })).toBeTruthy();
    expect(flows.getByRole('img', { name: 'Flows' })).toBeTruthy();
    expect(hex.getByRole('img', { name: 'Hexbins' })).toBeTruthy();
    expect(clusters.getByRole('img', { name: 'Clusters' })).toBeTruthy();
    expect(density.getByRole('img', { name: 'Density' })).toBeTruthy();
    expect(shapes.getByRole('img', { name: 'Shapes' })).toBeTruthy();
    expect(points.container.querySelectorAll('.st-geoPointMap.st-geoMap')).toHaveLength(1);
    expect(regions.container.querySelectorAll('.st-choroplethMap.st-geoMap')).toHaveLength(1);
    expect(flows.container.querySelectorAll('.st-geoFlowMap.st-geoMap')).toHaveLength(1);
    expect(hex.container.querySelectorAll('.st-geoHexbinMap.st-geoMap')).toHaveLength(1);
    expect(clusters.container.querySelectorAll('.st-geoClusterMap.st-geoMap')).toHaveLength(1);
    expect(density.container.querySelectorAll('.st-geoDensityMap.st-geoMap')).toHaveLength(1);
    expect(shapes.container.querySelectorAll('.st-geoJsonMap.st-geoMap')).toHaveLength(1);
    expect(points.container.querySelectorAll('.st-geoMap__point')).toHaveLength(3);
    expect(regions.container.querySelectorAll('.st-geoMap__region')).toHaveLength(1);
    expect(flows.container.querySelectorAll('.st-geoMap__flow')).toHaveLength(3);
    expect(hex.container.querySelectorAll('.st-geoMap__hexbin')).toHaveLength(2);
    expect(clusters.container.querySelectorAll('.st-geoMap__cluster')).toHaveLength(2);
    expect(density.container.querySelectorAll('.st-geoMap__density')).toHaveLength(3);
    expect(shapes.container.querySelectorAll('.st-geoMap__feature')).toHaveLength(1);
    expect(points.container.querySelectorAll('.st-geoPointMap__point')).toHaveLength(0);
    expect(regions.container.querySelectorAll('.st-choroplethMap__region')).toHaveLength(0);
    expect(flows.container.querySelectorAll('.st-geoFlowMap__link')).toHaveLength(0);
    expect(hex.container.querySelectorAll('.st-geoHexbinMap__bin')).toHaveLength(0);
    expect(clusters.container.querySelectorAll('.st-geoClusterMap__cluster')).toHaveLength(0);
    expect(density.container.querySelectorAll('.st-geoDensityMap__cell')).toHaveLength(0);
    expect(shapes.container.querySelectorAll('.st-geoJsonMap__feature')).toHaveLength(0);
    expect(points.container.textContent).toContain('Paris: 100');
    expect(regions.container.textContent).toContain('FR: 150');
  });
});
