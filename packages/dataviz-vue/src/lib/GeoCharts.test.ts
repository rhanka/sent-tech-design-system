import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ChoroplethMap } from './ChoroplethMap.js';
import { GeoClusterMap } from './GeoClusterMap.js';
import { GeoDensityMap } from './GeoDensityMap.js';
import { GeoFlowMap } from './GeoFlowMap.js';
import { GeoHexbinMap } from './GeoHexbinMap.js';
import { GeoJsonMap } from './GeoJsonMap.js';
import { GeoPointMap } from './GeoPointMap.js';

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

describe('geo charts (vue)', () => {
  it('renders geo core models through DS GeoMap layers', () => {
    const store = newStore();
    const points = mount(GeoPointMap, {
      props: { store, viewId: 'points', latitude: 'lat', longitude: 'lon', id: 'id', labelField: 'city', value: 'revenue', label: 'Points' },
    });
    const regions = mount(ChoroplethMap, {
      props: { store, viewId: 'regions', region: 'region', measure: 'revenue', geometry: 'shape', label: 'Regions' },
    });
    const flows = mount(GeoFlowMap, {
      props: { store, viewId: 'flows', sourceLatitude: 'lat', sourceLongitude: 'lon', targetLatitude: 'targetLat', targetLongitude: 'targetLon', value: 'revenue', label: 'Flows' },
    });
    const hex = mount(GeoHexbinMap, {
      props: { store, viewId: 'hex', latitude: 'lat', longitude: 'lon', value: 'revenue', cellSize: 10, label: 'Hexbins' },
    });
    const clusters = mount(GeoClusterMap, {
      props: { store, viewId: 'clusters', latitude: 'lat', longitude: 'lon', id: 'id', value: 'revenue', radius: 4, label: 'Clusters' },
    });
    const density = mount(GeoDensityMap, {
      props: { store, viewId: 'density', latitude: 'lat', longitude: 'lon', value: 'revenue', cellSize: 10, label: 'Density' },
    });
    const shapes = mount(GeoJsonMap, {
      props: { store, viewId: 'geojson', geometry: 'shape', id: 'id', labelField: 'city', value: 'revenue', label: 'Shapes' },
    });

    expect(points.find('[role="img"]').attributes('aria-label')).toBe('Points');
    expect(regions.find('[role="img"]').attributes('aria-label')).toBe('Regions');
    expect(flows.find('[role="img"]').attributes('aria-label')).toBe('Flows');
    expect(hex.find('[role="img"]').attributes('aria-label')).toBe('Hexbins');
    expect(clusters.find('[role="img"]').attributes('aria-label')).toBe('Clusters');
    expect(density.find('[role="img"]').attributes('aria-label')).toBe('Density');
    expect(shapes.find('[role="img"]').attributes('aria-label')).toBe('Shapes');
    expect(points.findAll('.st-geoPointMap.st-geoMap')).toHaveLength(1);
    expect(regions.findAll('.st-choroplethMap.st-geoMap')).toHaveLength(1);
    expect(flows.findAll('.st-geoFlowMap.st-geoMap')).toHaveLength(1);
    expect(hex.findAll('.st-geoHexbinMap.st-geoMap')).toHaveLength(1);
    expect(clusters.findAll('.st-geoClusterMap.st-geoMap')).toHaveLength(1);
    expect(density.findAll('.st-geoDensityMap.st-geoMap')).toHaveLength(1);
    expect(shapes.findAll('.st-geoJsonMap.st-geoMap')).toHaveLength(1);
    expect(points.findAll('.st-geoMap__point')).toHaveLength(3);
    expect(regions.findAll('.st-geoMap__region')).toHaveLength(1);
    expect(flows.findAll('.st-geoMap__flow')).toHaveLength(3);
    expect(hex.findAll('.st-geoMap__hexbin')).toHaveLength(2);
    expect(clusters.findAll('.st-geoMap__cluster')).toHaveLength(2);
    expect(density.findAll('.st-geoMap__density')).toHaveLength(3);
    expect(shapes.findAll('.st-geoMap__feature')).toHaveLength(1);
    expect(points.findAll('.st-geoPointMap__point')).toHaveLength(0);
    expect(regions.findAll('.st-choroplethMap__region')).toHaveLength(0);
    expect(flows.findAll('.st-geoFlowMap__link')).toHaveLength(0);
    expect(hex.findAll('.st-geoHexbinMap__bin')).toHaveLength(0);
    expect(clusters.findAll('.st-geoClusterMap__cluster')).toHaveLength(0);
    expect(density.findAll('.st-geoDensityMap__cell')).toHaveLength(0);
    expect(shapes.findAll('.st-geoJsonMap__feature')).toHaveLength(0);
    expect(points.text()).toContain('Paris: 100');
    expect(regions.text()).toContain('FR: 150');
  });
});
