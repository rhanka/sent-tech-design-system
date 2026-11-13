import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { layers: [{ type: 'points', points: [{ latitude: 48.85, longitude: 2.35, label: 'Paris', value: 10 }, { latitude: 45.76, longitude: 4.83, label: 'Lyon', value: 5 }] }], label: 'Cities' } },
  { id: 'geojson-polygon', props: { layers: [{ type: 'geojson', label: 'Zone', features: [{ id: 'z1', label: 'Zone A', value: 3, geometry: { type: 'Polygon', coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] } }] }], label: 'Map' } },
  { id: 'choropleth', props: { layers: [{ type: 'choropleth', features: [{ id: 'r1', geometry: { type: 'Polygon', coordinates: [[[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]] } }, { id: 'r2', geometry: { type: 'Polygon', coordinates: [[[[3, 0], [5, 0], [5, 2], [3, 2], [3, 0]]]] } }], values: { r1: 30, r2: 90 } }], label: 'Regions' } },
  { id: 'flow', props: { layers: [{ type: 'flow', flows: [{ source: { latitude: 48.85, longitude: 2.35 }, target: { latitude: 43.3, longitude: 5.37 }, value: 7 }] }], label: 'Routes' } },
  { id: 'multi-layer', props: { layers: [{ type: 'density', points: [{ latitude: 48, longitude: 2, value: 4 }, { latitude: 48.2, longitude: 2.1, value: 9 }] }, { type: 'hexbin', points: [{ latitude: 49, longitude: 3, value: 2 }, { latitude: 49.1, longitude: 3.1, value: 3 }] }, { type: 'cluster', points: [{ latitude: 47, longitude: 1, value: 1 }, { latitude: 47.05, longitude: 1.05, value: 1 }] }], label: 'Overlays' } },
  { id: 'mercator-custom', props: { layers: [{ type: 'points', points: [{ latitude: 0, longitude: 0, value: 1 }] }], label: 'Sized', projection: 'mercator', bounds: { south: -10, west: -10, north: 10, east: 10 }, width: 640, height: 400, class: 'consumer', style: 'color: red', 'data-bench': 'geo' } },
] satisfies Fixture[];
