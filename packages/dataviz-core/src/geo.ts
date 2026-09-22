/**
 * Geographic data contracts.
 *
 * These builders compute rendering-neutral inputs for pins, choropleths,
 * geo-flows/arcs, hexbins, point clusters, density grids and GeoJSON layers.
 * Map rendering belongs to the DS.
 */

import { aggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Config for point data. Either (latitude + longitude) or geometry must be provided.
 * When `geometry` is set, it must reference a column containing a GeoJSON Point object
 * ({ type: 'Point', coordinates: [lng, lat] }). In that case latitude and longitude
 * columns are not required.
 */
export interface GeoPointConfig {
  latitude?: string;
  longitude?: string;
  /** Column containing a GeoJSON Point geometry { type:'Point', coordinates:[lng,lat] }. */
  geometry?: string;
  id?: string;
  label?: string;
  value?: string;
}

export interface GeoPoint extends GeoCoordinate {
  id: string;
  label?: string;
  value?: number;
}

export interface GeoPointModel {
  points: GeoPoint[];
}

export interface ChoroplethClassification {
  method: 'quantile' | 'equal';
  count: number;
}

export interface ChoroplethConfig {
  region: string;
  measure: string;
  /** Optional classification scheme. When provided, `ChoroplethModel.breaks` is populated. */
  classification?: ChoroplethClassification;
}

export interface ChoroplethRegion {
  key: string;
  label: string;
  value: number;
}

export interface ChoroplethModel {
  regionId: string;
  measureId: string;
  regions: ChoroplethRegion[];
  /**
   * Classification breaks computed via `classify()`. Only present when
   * `ChoroplethConfig.classification` is provided.
   * Convention: count+1 values including min and max, so there are `count` classes.
   * E.g. classify([0,10,20,30], { method:'equal', count:2 }) → [0, 15, 30].
   */
  breaks?: number[];
}

export interface GeoFlowConfig {
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
}

export interface GeoFlowLink {
  id: string;
  source: GeoCoordinate;
  target: GeoCoordinate;
  count: number;
  value: number;
}

export interface GeoFlowModel {
  links: GeoFlowLink[];
}

export interface GeoHexbinConfig {
  latitude?: string;
  longitude?: string;
  /** Column containing a GeoJSON Point geometry { type:'Point', coordinates:[lng,lat] }. */
  geometry?: string;
  value?: string;
  cellSize?: number;
}

export interface GeoHexbin {
  id: string;
  q: number;
  r: number;
  center: GeoCoordinate;
  count: number;
  value: number;
  /** Optional: the 6 vertices of the hexagon (pointy-top) surrounding `center`, in lat/lng degrees. */
  polygon?: GeoCoordinate[];
}

export interface GeoHexbinModel {
  cellSize: number;
  bins: GeoHexbin[];
}

export interface GeoClusterConfig {
  latitude?: string;
  longitude?: string;
  /** Column containing a GeoJSON Point geometry { type:'Point', coordinates:[lng,lat] }. */
  geometry?: string;
  id?: string;
  value?: string;
  radius?: number;
}

export interface GeoCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  value: number;
  pointIds: string[];
}

export interface GeoClusterModel {
  radius: number;
  clusters: GeoCluster[];
}

export interface GeoDensityConfig {
  latitude?: string;
  longitude?: string;
  /** Column containing a GeoJSON Point geometry { type:'Point', coordinates:[lng,lat] }. */
  geometry?: string;
  value?: string;
  cellSize?: number;
}

export interface GeoBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface GeoDensityCell {
  id: string;
  x: number;
  y: number;
  bounds: GeoBounds;
  center: GeoCoordinate;
  count: number;
  value: number;
  density: number;
  /** Optional: the 4 corners of the cell rectangle (SW, SE, NE, NW), in lat/lng degrees. */
  polygon?: GeoCoordinate[];
}

export interface GeoDensityModel {
  cellSize: number;
  cells: GeoDensityCell[];
}

export type GeoJsonGeometryType =
  | 'Point'
  | 'MultiPoint'
  | 'LineString'
  | 'MultiLineString'
  | 'Polygon'
  | 'MultiPolygon';

export interface GeoJsonGeometry {
  type: GeoJsonGeometryType;
  coordinates: unknown[];
}

export interface GeoJsonLayerConfig {
  geometry: string;
  id?: string;
  label?: string;
  value?: string;
}

export interface GeoJsonFeature {
  id: string;
  label?: string;
  value?: number;
  geometry: GeoJsonGeometry;
  properties: Record<string, string | number>;
}

export interface GeoJsonLayerModel {
  geometryId: string;
  features: GeoJsonFeature[];
}

interface GeoInputPoint extends GeoCoordinate {
  id: string;
  label?: string;
  value: number;
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isCoordinate(latitude: number | undefined, longitude: number | undefined): boolean {
  return (
    latitude !== undefined &&
    longitude !== undefined &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function assertField(model: DataModel, id: string, role: string): void {
  if (!findDimension(model, id) && !findMeasure(model, id)) {
    throw new Error(`Unknown ${role} field: ${id}`);
  }
}

function assertDimension(model: DataModel, id: string, role: string): void {
  if (!findDimension(model, id)) {
    throw new Error(`Unknown ${role} dimension: ${id}`);
  }
}

function resolveMeasure(model: DataModel, id: string, role: string): Measure {
  const measure = findMeasure(model, id);
  if (!measure) {
    throw new Error(`Unknown ${role} measure: ${id}`);
  }
  return measure;
}

function assertPositiveFinite(value: number, message: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message);
  }
}

function groupRows(rows: readonly Row[], field: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = cellKey(row[field]);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

function valueFor(row: Row, valueField: string | undefined, fallback = 1): number {
  if (valueField === undefined) return fallback;
  return toFiniteNumber(row[valueField]) ?? 0;
}

function isGeoJsonGeometry(value: unknown): value is GeoJsonGeometry {
  if (typeof value !== 'object' || value === null) return false;
  const geometry = value as { type?: unknown; coordinates?: unknown };
  return (
    (geometry.type === 'Point' ||
      geometry.type === 'MultiPoint' ||
      geometry.type === 'LineString' ||
      geometry.type === 'MultiLineString' ||
      geometry.type === 'Polygon' ||
      geometry.type === 'MultiPolygon') &&
    Array.isArray(geometry.coordinates)
  );
}

/**
 * Extract lat/lng from a GeoJSON Point geometry object.
 * Returns undefined if the value is not a valid GeoJSON Point.
 */
function extractPointCoords(value: unknown): { latitude: number; longitude: number } | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const geom = value as { type?: unknown; coordinates?: unknown };
  if (geom.type !== 'Point' || !Array.isArray(geom.coordinates)) return undefined;
  const [lng, lat] = geom.coordinates as unknown[];
  const latitude = toFiniteNumber(lat);
  const longitude = toFiniteNumber(lng);
  if (latitude === undefined || longitude === undefined) return undefined;
  if (!isCoordinate(latitude, longitude)) return undefined;
  return { latitude, longitude };
}

/**
 * Compute classification breaks for a set of values.
 *
 * Convention: returns `count + 1` values including the overall min and max,
 * defining `count` non-overlapping classes. For example with count=3:
 *   [min, break1, break2, max]
 * Returns [] when `values` is empty or `count <= 0`.
 *
 * @param values - Input numbers (non-finite values are ignored).
 * @param opts.method - 'equal' for equal-width intervals, 'quantile' for quantile-based breaks.
 * @param opts.count  - Number of classes (result length = count + 1).
 */
export function classify(
  values: number[],
  opts: { method: 'quantile' | 'equal'; count: number },
): number[] {
  const { method, count } = opts;
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0 || count <= 0) return [];

  const sorted = [...finite].sort((a, b) => a - b);
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;

  if (count === 1) return [min, max];

  if (method === 'equal') {
    const step = (max - min) / count;
    const breaks: number[] = [min];
    for (let i = 1; i < count; i++) {
      breaks.push(min + step * i);
    }
    breaks.push(max);
    return breaks;
  }

  // quantile
  const breaks: number[] = [min];
  for (let i = 1; i < count; i++) {
    const pos = (i / count) * (sorted.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    const frac = pos - lo;
    breaks.push(sorted[lo]! + frac * (sorted[hi]! - sorted[lo]!));
  }
  breaks.push(max);
  return breaks;
}

/**
 * Compute the 6 vertices of a pointy-top hexagon centred at (centerLat, centerLon)
 * given a `cellSize` (in degrees of longitude). The latitude half-height is
 * cellSize * (sqrt(3)/2), matching the binning formula used in buildGeoHexbinModel.
 */
function hexagonVertices(centerLat: number, centerLon: number, cellSize: number): GeoCoordinate[] {
  const hw = cellSize / 2; // half-width in lng
  const hh = cellSize * (Math.sqrt(3) / 4); // half-height in lat (= height/2)
  // Pointy-top order: top, upper-right, lower-right, bottom, lower-left, upper-left
  return [
    { latitude: centerLat + hh * 2, longitude: centerLon },
    { latitude: centerLat + hh, longitude: centerLon + hw },
    { latitude: centerLat - hh, longitude: centerLon + hw },
    { latitude: centerLat - hh * 2, longitude: centerLon },
    { latitude: centerLat - hh, longitude: centerLon - hw },
    { latitude: centerLat + hh, longitude: centerLon - hw },
  ];
}

function collectPoints(model: DataModel, data: readonly Row[], config: GeoPointConfig): GeoInputPoint[] {
  const usingGeometry = config.geometry !== undefined;

  if (usingGeometry) {
    assertField(model, config.geometry!, 'geo geometry');
  } else {
    if (config.latitude === undefined) throw new Error('GeoPointConfig requires latitude or geometry');
    if (config.longitude === undefined) throw new Error('GeoPointConfig requires longitude or geometry');
    assertField(model, config.latitude, 'geo latitude');
    assertField(model, config.longitude, 'geo longitude');
  }
  if (config.id !== undefined) assertField(model, config.id, 'geo id');
  if (config.label !== undefined) assertField(model, config.label, 'geo label');
  if (config.value !== undefined) assertField(model, config.value, 'geo value');

  const points: GeoInputPoint[] = [];
  data.forEach((row, index) => {
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (usingGeometry) {
      const coords = extractPointCoords(row[config.geometry!]);
      if (!coords) return;
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else {
      latitude = toFiniteNumber(row[config.latitude!]);
      longitude = toFiniteNumber(row[config.longitude!]);
      if (!isCoordinate(latitude, longitude)) return;
    }

    points.push({
      id: config.id === undefined ? String(index) : cellKey(row[config.id]),
      label: config.label === undefined ? undefined : cellKey(row[config.label]),
      latitude: latitude!,
      longitude: longitude!,
      value: valueFor(row, config.value),
    });
  });
  return points;
}

export function buildGeoPointModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoPointConfig,
): GeoPointModel {
  const points = collectPoints(model, data, config).map((point) => ({
    id: point.id,
    ...(point.label === undefined ? {} : { label: point.label }),
    latitude: point.latitude,
    longitude: point.longitude,
    ...(config.value === undefined ? {} : { value: point.value }),
  }));
  return { points };
}

export function buildChoroplethModel(
  model: DataModel,
  data: readonly Row[],
  config: ChoroplethConfig,
): ChoroplethModel {
  assertDimension(model, config.region, 'choropleth region');
  const measure = resolveMeasure(model, config.measure, 'choropleth');

  const regions = Array.from(groupRows(data, config.region), ([key, rows]) => ({
    key,
    label: key,
    value: aggregate(rows, measure),
  }));

  const result: ChoroplethModel = { regionId: config.region, measureId: measure.id, regions };

  if (config.classification !== undefined) {
    result.breaks = classify(
      regions.map((r) => r.value),
      config.classification,
    );
  }

  return result;
}

export function buildGeoFlowModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoFlowConfig,
): GeoFlowModel {
  assertField(model, config.sourceLatitude, 'geo flow source latitude');
  assertField(model, config.sourceLongitude, 'geo flow source longitude');
  assertField(model, config.targetLatitude, 'geo flow target latitude');
  assertField(model, config.targetLongitude, 'geo flow target longitude');
  if (config.value !== undefined) assertField(model, config.value, 'geo flow value');

  const links = new Map<string, GeoFlowLink>();
  for (const row of data) {
    const sourceLatitude = toFiniteNumber(row[config.sourceLatitude]);
    const sourceLongitude = toFiniteNumber(row[config.sourceLongitude]);
    const targetLatitude = toFiniteNumber(row[config.targetLatitude]);
    const targetLongitude = toFiniteNumber(row[config.targetLongitude]);
    if (!isCoordinate(sourceLatitude, sourceLongitude)) continue;
    if (!isCoordinate(targetLatitude, targetLongitude)) continue;

    const id = `${sourceLatitude},${sourceLongitude}\u001f${targetLatitude},${targetLongitude}`;
    const current = links.get(id);
    if (current) {
      current.count += 1;
      current.value += valueFor(row, config.value);
    } else {
      links.set(id, {
        id,
        source: { latitude: sourceLatitude!, longitude: sourceLongitude! },
        target: { latitude: targetLatitude!, longitude: targetLongitude! },
        count: 1,
        value: valueFor(row, config.value),
      });
    }
  }

  return { links: [...links.values()] };
}

export function buildGeoHexbinModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoHexbinConfig,
): GeoHexbinModel {
  const cellSize = config.cellSize ?? 1;
  assertPositiveFinite(cellSize, 'Geo hexbin cellSize must be a positive finite number');
  const points = collectPoints(model, data, {
    latitude: config.latitude,
    longitude: config.longitude,
    geometry: config.geometry,
    value: config.value,
  });

  const height = cellSize * (Math.sqrt(3) / 2);
  const bins = new Map<string, GeoHexbin>();
  for (const point of points) {
    const q = Math.trunc(point.longitude / cellSize);
    const r = Math.trunc(point.latitude / height);
    const id = `${q}:${r}`;
    const bin = bins.get(id);
    if (bin) {
      bin.count += 1;
      bin.value += point.value;
    } else {
      const centerLat = r * height;
      const centerLon = q * cellSize;
      bins.set(id, {
        id,
        q,
        r,
        center: { latitude: centerLat, longitude: centerLon },
        count: 1,
        value: point.value,
        polygon: hexagonVertices(centerLat, centerLon, cellSize),
      });
    }
  }

  return { cellSize, bins: [...bins.values()] };
}

function distanceDegrees(a: GeoCoordinate, b: GeoCoordinate): number {
  const dLat = a.latitude - b.latitude;
  const dLon = a.longitude - b.longitude;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export function buildGeoClusterModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoClusterConfig,
): GeoClusterModel {
  const radius = config.radius ?? 1;
  assertPositiveFinite(radius, 'Geo cluster radius must be a positive finite number');
  const points = collectPoints(model, data, {
    latitude: config.latitude,
    longitude: config.longitude,
    geometry: config.geometry,
    id: config.id,
    value: config.value,
  });

  const clusters: GeoCluster[] = [];
  for (const point of points) {
    const cluster = clusters.find((item) => distanceDegrees(item, point) <= radius);
    if (!cluster) {
      clusters.push({
        id: `cluster:${clusters.length}`,
        latitude: point.latitude,
        longitude: point.longitude,
        count: 1,
        value: point.value,
        pointIds: [point.id],
      });
      continue;
    }

    cluster.latitude = (cluster.latitude * cluster.count + point.latitude) / (cluster.count + 1);
    cluster.longitude = (cluster.longitude * cluster.count + point.longitude) / (cluster.count + 1);
    cluster.count += 1;
    cluster.value += point.value;
    cluster.pointIds.push(point.id);
  }

  return { radius, clusters };
}

export function buildGeoDensityModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoDensityConfig,
): GeoDensityModel {
  const cellSize = config.cellSize ?? 1;
  assertPositiveFinite(cellSize, 'Geo density cellSize must be a positive finite number');
  const points = collectPoints(model, data, {
    latitude: config.latitude,
    longitude: config.longitude,
    geometry: config.geometry,
    value: config.value,
  });
  const area = cellSize * cellSize;
  const cells = new Map<string, GeoDensityCell>();

  for (const point of points) {
    const x = Math.floor((point.longitude + 180) / cellSize);
    const y = Math.floor((point.latitude + 90) / cellSize);
    const id = `${x}:${y}`;
    const cell = cells.get(id);
    if (cell) {
      cell.count += 1;
      cell.value += point.value;
      cell.density = cell.value / area;
      continue;
    }

    const west = x * cellSize - 180;
    const south = y * cellSize - 90;
    const north = south + cellSize;
    const east = west + cellSize;
    cells.set(id, {
      id,
      x,
      y,
      bounds: { south, west, north, east },
      center: { latitude: south + cellSize / 2, longitude: west + cellSize / 2 },
      count: 1,
      value: point.value,
      density: point.value / area,
      polygon: [
        { latitude: south, longitude: west },
        { latitude: south, longitude: east },
        { latitude: north, longitude: east },
        { latitude: north, longitude: west },
      ],
    });
  }

  return { cellSize, cells: [...cells.values()] };
}

export function buildGeoJsonLayerModel(
  model: DataModel,
  data: readonly Row[],
  config: GeoJsonLayerConfig,
): GeoJsonLayerModel {
  assertField(model, config.geometry, 'GeoJSON geometry');
  if (config.id !== undefined) assertField(model, config.id, 'GeoJSON id');
  if (config.label !== undefined) assertField(model, config.label, 'GeoJSON label');
  if (config.value !== undefined) assertField(model, config.value, 'GeoJSON value');

  const features: GeoJsonFeature[] = [];
  data.forEach((row, index) => {
    const geometry = row[config.geometry];
    if (!isGeoJsonGeometry(geometry)) return;

    const id = config.id === undefined ? String(index) : cellKey(row[config.id]);
    const properties: Record<string, string | number> = { id };
    const feature: GeoJsonFeature = { id, geometry, properties };

    if (config.label !== undefined) {
      const label = cellKey(row[config.label]);
      feature.label = label;
      properties.label = label;
    }
    if (config.value !== undefined) {
      const value = valueFor(row, config.value);
      feature.value = value;
      properties.value = value;
    }

    features.push(feature);
  });

  return { geometryId: config.geometry, features };
}
