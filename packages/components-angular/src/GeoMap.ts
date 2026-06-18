import { NgFor, NgIf } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type GeoMapTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

/** Coordonnée géographique — même forme que `GeoCoordinate` (dataviz-core). */
export type GeoMapCoordinate = {
  latitude: number;
  longitude: number;
};

/** Emprise géographique — même forme que `GeoBounds` (dataviz-core). */
export type GeoMapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type GeoMapProjection = "equirectangular" | "mercator";

export type GeoMapGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon";

/** Géométrie GeoJSON — même forme que `GeoJsonGeometry` (dataviz-core). */
export type GeoMapGeometry = {
  type: GeoMapGeometryType;
  coordinates: unknown[];
};

/** Entité géographique — sous-ensemble structurel de `GeoJsonFeature` (dataviz-core). */
export type GeoMapFeature = {
  id: string;
  label?: string;
  value?: number;
  geometry: GeoMapGeometry;
};

/** Point géographique — sur-ensemble structurel de `GeoPoint` (dataviz-core). */
export type GeoMapPoint = GeoMapCoordinate & {
  id?: string;
  label?: string;
  value?: number;
  tone?: GeoMapTone;
  /** Rayon explicite en px (prioritaire sur l'échelle par `value`), borné à 32. */
  r?: number;
};

/** Flux géographique — sous-ensemble structurel de `GeoFlowLink` (dataviz-core). */
export type GeoMapFlow = {
  id?: string;
  label?: string;
  source: GeoMapCoordinate;
  target: GeoMapCoordinate;
  value?: number;
};

/** Entités GeoJSON (polygones, lignes, points) ; ton par couche ou cycle de palette par entité. */
export type GeoMapGeojsonLayer = {
  type: "geojson";
  features: GeoMapFeature[];
  tone?: GeoMapTone;
  label?: string;
};

/** Choroplèthe : entités + valeur par id (`regions` dataviz : `key` → `value`) → intensité color-mix. */
export type GeoMapChoroplethLayer = {
  type: "choropleth";
  features: GeoMapFeature[];
  values: Record<string, number>;
  /** Ton de base de la rampe d'intensité (défaut `category1`). */
  tone?: GeoMapTone;
  label?: string;
};

/** Points/épingles : rayon ∝ `value` (bornes `minRadius`/`maxRadius`, défauts 5/14 comme dataviz). */
export type GeoMapPointsLayer = {
  type: "points";
  points: GeoMapPoint[];
  tone?: GeoMapTone;
  minRadius?: number;
  maxRadius?: number;
  label?: string;
};

/** Densité : cercles translucides superposés, rayon/intensité ∝ `value` (poids). */
export type GeoMapDensityLayer = {
  type: "density";
  points: GeoMapPoint[];
  /** Ton de la nappe (défaut `category3` — parité visuelle dataviz). */
  tone?: GeoMapTone;
  maxRadius?: number;
  label?: string;
};

/** Flux : arcs quadratiques source → target, épaisseur ∝ `value` (défaut ton `category1`). */
export type GeoMapFlowLayer = {
  type: "flow";
  flows: GeoMapFlow[];
  tone?: GeoMapTone;
  label?: string;
};

/** Hexbin : binning hexagonal des points (même binning que dataviz-core), intensité ∝ valeur agrégée. */
export type GeoMapHexbinLayer = {
  type: "hexbin";
  points: GeoMapPoint[];
  /** Taille de cellule en degrés (défaut 1). */
  cellSize?: number;
  tone?: GeoMapTone;
  label?: string;
};

/** Clusters : regroupement glouton des points (même algo que dataviz-core), centroïdes marqueurs distinctifs. */
export type GeoMapClusterLayer = {
  type: "cluster";
  points: GeoMapPoint[];
  /** Rayon de regroupement en degrés (défaut 1). */
  radius?: number;
  tone?: GeoMapTone;
  label?: string;
};

export type GeoMapLayer =
  | GeoMapGeojsonLayer
  | GeoMapChoroplethLayer
  | GeoMapPointsLayer
  | GeoMapDensityLayer
  | GeoMapFlowLayer
  | GeoMapHexbinLayer
  | GeoMapClusterLayer;

export type GeoMapProps = {
  layers: GeoMapLayer[];
  width?: number;
  height?: number;
  projection?: GeoMapProjection;
  /** Emprise explicite ; sinon auto-ajustement sur les données de toutes les couches + marge. */
  bounds?: GeoMapBounds;
  label: string;
  class?: string;
};

type FeatureMark = {
  key: string;
  d: string;
  tone: GeoMapTone;
  line: boolean;
  text: string;
};

type RegionMark = {
  key: string;
  d: string;
  tone: GeoMapTone;
  mix: string | null;
  text: string;
};

type CircleMark = {
  key: string;
  cx: number;
  cy: number;
  r: number;
  tone: GeoMapTone;
  mix: string | null;
  text: string;
};

type FlowMark = {
  key: string;
  d: string;
  strokeWidth: number;
  tone: GeoMapTone;
  text: string;
};

type HexMark = {
  key: string;
  points: string;
  tone: GeoMapTone;
  mix: string;
  text: string;
};

type ClusterMark = {
  key: string;
  cx: number;
  cy: number;
  r: number;
  tone: GeoMapTone;
  text: string;
};

type RenderLayer = {
  key: string;
  type: GeoMapLayer["type"];
  summary: string;
  features: FeatureMark[];
  regions: RegionMark[];
  circles: CircleMark[];
  flows: FlowMark[];
  hexes: HexMark[];
  clusters: ClusterMark[];
};

const PADDING = 24;
const MAX_POINT_RADIUS = 32;
const WORLD: GeoMapBounds = { south: -90, west: -180, north: 90, east: 180 };
const TONES: GeoMapTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];
const GEOMETRY_TYPES = new Set(["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"]);

function isFiniteCoordinate<T extends GeoMapCoordinate>(c: T | undefined): c is T {
  return !!c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
}

function scaleNumber(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

function mixPercent(value: number): string {
  return `${Math.round(Math.max(0, Math.min(100, value)))}%`;
}

function coordinatePair(value: unknown): GeoMapCoordinate | undefined {
  if (!Array.isArray(value) || value.length < 2 || Array.isArray(value[0])) return undefined;
  const longitude = Number(value[0]);
  const latitude = Number(value[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  return { latitude, longitude };
}

function collectGeometryCoordinates(value: unknown, out: GeoMapCoordinate[]): void {
  if (!Array.isArray(value)) return;
  const pair = coordinatePair(value);
  if (pair) {
    out.push(pair);
    return;
  }
  for (const item of value) collectGeometryCoordinates(item, out);
}

function isGeometry(geometry: GeoMapGeometry | undefined): geometry is GeoMapGeometry {
  return !!geometry && GEOMETRY_TYPES.has(geometry.type) && Array.isArray(geometry.coordinates);
}

function layerCoordinates(layer: GeoMapLayer): GeoMapCoordinate[] {
  switch (layer.type) {
    case "geojson":
    case "choropleth": {
      const out: GeoMapCoordinate[] = [];
      for (const feature of layer.features ?? []) {
        if (isGeometry(feature.geometry)) collectGeometryCoordinates(feature.geometry.coordinates, out);
      }
      return out;
    }
    case "points":
    case "density":
    case "hexbin":
    case "cluster":
      return (layer.points ?? []).filter(isFiniteCoordinate);
    case "flow": {
      const out: GeoMapCoordinate[] = [];
      for (const flow of layer.flows ?? []) {
        if (isFiniteCoordinate(flow.source)) out.push(flow.source);
        if (isFiniteCoordinate(flow.target)) out.push(flow.target);
      }
      return out;
    }
  }
}

function validBounds(candidate: GeoMapBounds | undefined): GeoMapBounds | null {
  return candidate &&
    Number.isFinite(candidate.south) &&
    Number.isFinite(candidate.west) &&
    Number.isFinite(candidate.north) &&
    Number.isFinite(candidate.east) &&
    candidate.north > candidate.south &&
    candidate.east > candidate.west
    ? candidate
    : null;
}

function fitBounds(all: GeoMapLayer[]): GeoMapBounds {
  const coords: GeoMapCoordinate[] = [];
  for (const layer of all) coords.push(...layerCoordinates(layer));
  if (coords.length === 0) return WORLD;
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;
  for (const c of coords) {
    if (c.latitude < south) south = c.latitude;
    if (c.latitude > north) north = c.latitude;
    if (c.longitude < west) west = c.longitude;
    if (c.longitude > east) east = c.longitude;
  }
  const latPad = Math.max((north - south) * 0.05, 1);
  const lonPad = Math.max((east - west) * 0.05, 1);
  return {
    south: Math.max(south - latPad, -90),
    west: Math.max(west - lonPad, -180),
    north: Math.min(north + latPad, 90),
    east: Math.min(east + lonPad, 180),
  };
}

function mercatorY(latitude: number): number {
  const clamped = Math.max(-85, Math.min(85, latitude));
  return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
}

type Projector = (c: GeoMapCoordinate) => { x: number; y: number };

function createProjector(b: GeoMapBounds, projection: GeoMapProjection, width: number, height: number): Projector {
  const innerW = Math.max(width - PADDING * 2, 1);
  const innerH = Math.max(height - PADDING * 2, 1);
  const projY = (latitude: number) => (projection === "mercator" ? mercatorY(latitude) : latitude);
  const top = projY(b.north);
  const bottom = projY(b.south);
  const lonSpan = b.east - b.west || 1;
  const ySpan = top - bottom || 1;
  return (c) => ({
    x: PADDING + ((c.longitude - b.west) / lonSpan) * innerW,
    y: PADDING + ((top - projY(c.latitude)) / ySpan) * innerH,
  });
}

function linePath(coordinates: unknown[], project: Projector): string {
  return coordinates
    .map((item, index) => {
      const pair = coordinatePair(item);
      if (!pair) return "";
      const p = project(pair);
      return `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
    .filter(Boolean)
    .join(" ");
}

function ringsPath(coordinates: unknown[], project: Projector): string {
  return coordinates
    .map((ring) => {
      const path = Array.isArray(ring) ? linePath(ring, project) : "";
      return path === "" ? "" : `${path} Z`;
    })
    .filter(Boolean)
    .join(" ");
}

function geometryPath(geometry: GeoMapGeometry, project: Projector): string {
  switch (geometry.type) {
    case "Point": {
      const pair = coordinatePair(geometry.coordinates);
      if (!pair) return "";
      const p = project(pair);
      return `M ${p.x - 5} ${p.y} a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`;
    }
    case "MultiPoint":
      return geometry.coordinates
        .map((c) => geometryPath({ type: "Point", coordinates: c as unknown[] }, project))
        .filter(Boolean)
        .join(" ");
    case "LineString":
      return linePath(geometry.coordinates, project);
    case "MultiLineString":
      return geometry.coordinates
        .map((line) => (Array.isArray(line) ? linePath(line, project) : ""))
        .filter(Boolean)
        .join(" ");
    case "Polygon":
      return ringsPath(geometry.coordinates, project);
    case "MultiPolygon":
      return geometry.coordinates
        .map((polygon) => (Array.isArray(polygon) ? ringsPath(polygon, project) : ""))
        .filter(Boolean)
        .join(" ");
  }
}

function pointRadius(point: GeoMapPoint, min: number, max: number, rMin: number, rMax: number): number {
  if (typeof point.r === "number" && Number.isFinite(point.r) && point.r >= 0) {
    return Math.min(point.r, MAX_POINT_RADIUS);
  }
  return scaleNumber(point.value ?? 1, min, max, rMin, rMax);
}

function hexagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function flowPath(source: GeoMapCoordinate, target: GeoMapCoordinate, project: Projector): string {
  const a = project(source);
  const b = project(target);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = mx - dy * 0.18;
  const cy = my + dx * 0.18;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

type HexbinBin = { id: string; q: number; r: number; center: GeoMapCoordinate; count: number; value: number };

function binPoints(points: GeoMapPoint[], cellSize: number): HexbinBin[] {
  const hexHeight = cellSize * (Math.sqrt(3) / 2);
  const bins = new Map<string, HexbinBin>();
  for (const point of points) {
    const q = Math.floor(point.longitude / cellSize);
    const r = Math.floor(point.latitude / hexHeight);
    const id = `${q}:${r}`;
    const bin = bins.get(id);
    const value = Number.isFinite(point.value) ? (point.value as number) : 1;
    if (bin) {
      bin.count += 1;
      bin.value += value;
    } else {
      bins.set(id, { id, q, r, center: { latitude: r * hexHeight, longitude: q * cellSize }, count: 1, value });
    }
  }
  return [...bins.values()];
}

type Cluster = GeoMapCoordinate & { id: string; count: number; value: number };

function clusterPoints(points: GeoMapPoint[], radius: number): Cluster[] {
  const clusters: Cluster[] = [];
  for (const point of points) {
    const cluster = clusters.find((item) => {
      const dLat = item.latitude - point.latitude;
      const dLon = item.longitude - point.longitude;
      return Math.sqrt(dLat * dLat + dLon * dLon) <= radius;
    });
    const value = Number.isFinite(point.value) ? (point.value as number) : 1;
    if (!cluster) {
      clusters.push({
        id: `cluster:${clusters.length}`,
        latitude: point.latitude,
        longitude: point.longitude,
        count: 1,
        value,
      });
      continue;
    }
    cluster.latitude = (cluster.latitude * cluster.count + point.latitude) / (cluster.count + 1);
    cluster.longitude = (cluster.longitude * cluster.count + point.longitude) / (cluster.count + 1);
    cluster.count += 1;
    cluster.value += value;
  }
  return clusters;
}

function positiveOr(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function emptyRenderLayer(type: GeoMapLayer["type"], key: string, summary: string): RenderLayer {
  return {
    key,
    type,
    summary,
    features: [],
    regions: [],
    circles: [],
    flows: [],
    hexes: [],
    clusters: [],
  };
}

@Component({
  selector: "st-geo-map",
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-geoMap__visual" role="img" [attr.aria-label]="label">
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <rect
            class="st-geoMap__frame"
            x="0.5"
            y="0.5"
            [attr.width]="resolvedWidth - 1"
            [attr.height]="resolvedHeight - 1"
            rx="4"
          ></rect>

          <g *ngFor="let layer of renderedLayers; trackBy: trackByKey" [attr.class]="layerClass(layer)">
            <ng-container *ngIf="layer.type === 'geojson'">
              <path
                *ngFor="let feature of layer.features; trackBy: trackByKey"
                [attr.class]="featureClass(feature)"
                [attr.d]="feature.d"
                fill-rule="evenodd"
              ></path>
            </ng-container>

            <ng-container *ngIf="layer.type === 'choropleth'">
              <path
                *ngFor="let region of layer.regions; trackBy: trackByKey"
                [attr.class]="regionClass(region)"
                [attr.d]="region.d"
                [style.--st-geoMap-mix]="region.mix"
                fill-rule="evenodd"
              ></path>
            </ng-container>

            <ng-container *ngIf="layer.type === 'points'">
              <circle
                *ngFor="let mark of layer.circles; trackBy: trackByKey"
                [attr.class]="pointClass(mark)"
                [attr.cx]="mark.cx"
                [attr.cy]="mark.cy"
                [attr.r]="mark.r"
              ></circle>
            </ng-container>

            <ng-container *ngIf="layer.type === 'density'">
              <circle
                *ngFor="let mark of layer.circles; trackBy: trackByKey"
                [attr.class]="densityClass(mark)"
                [attr.cx]="mark.cx"
                [attr.cy]="mark.cy"
                [attr.r]="mark.r"
                [style.--st-geoMap-mix]="mark.mix"
              ></circle>
            </ng-container>

            <ng-container *ngIf="layer.type === 'flow'">
              <path
                *ngFor="let mark of layer.flows; trackBy: trackByKey"
                [attr.class]="flowClass(mark)"
                [attr.d]="mark.d"
                [attr.stroke-width]="mark.strokeWidth"
              ></path>
            </ng-container>

            <ng-container *ngIf="layer.type === 'hexbin'">
              <polygon
                *ngFor="let mark of layer.hexes; trackBy: trackByKey"
                [attr.class]="hexClass(mark)"
                [attr.points]="mark.points"
                [style.--st-geoMap-mix]="mark.mix"
              ></polygon>
            </ng-container>

            <ng-container *ngIf="layer.type === 'cluster'">
              <g
                *ngFor="let mark of layer.clusters; trackBy: trackByKey"
                [attr.class]="clusterClass(mark)"
              >
                <circle class="st-geoMap__clusterDot" [attr.cx]="mark.cx" [attr.cy]="mark.cy" [attr.r]="mark.r"></circle>
                <circle
                  class="st-geoMap__clusterRing"
                  [attr.cx]="mark.cx"
                  [attr.cy]="mark.cy"
                  [attr.r]="mark.r + 3"
                ></circle>
              </g>
            </ng-container>
          </g>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>
    </div>
  `,
})
export class GeoMap {
  static readonly stComponentName = "GeoMap";
  readonly componentName = "GeoMap";
  @NgInput() layers: GeoMapLayer[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() projection?: GeoMapProjection;
  @NgInput() bounds?: GeoMapBounds;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-geoMap", this.classInput);
  }

  get resolvedWidth(): number {
    return this.width ?? 520;
  }

  get resolvedHeight(): number {
    return this.height ?? 320;
  }

  get resolvedProjection(): GeoMapProjection {
    return this.projection === "mercator" ? "mercator" : "equirectangular";
  }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
  }

  get renderedLayers(): RenderLayer[] {
    const layers = this.layers ?? [];
    const mapBounds = validBounds(this.bounds) ?? fitBounds(layers);
    const project = createProjector(mapBounds, this.resolvedProjection, this.resolvedWidth, this.resolvedHeight);

    return layers.map((layer, layerIndex) => {
      const key = `layer-${layerIndex}`;
      switch (layer.type) {
        case "geojson": {
          const features = (layer.features ?? [])
            .map((feature, index) => {
              if (!isGeometry(feature.geometry)) return null;
              const d = geometryPath(feature.geometry, project);
              if (d === "") return null;
              return {
                key: `${feature.id}-${index}`,
                d,
                tone: layer.tone ?? TONES[index % TONES.length],
                line: feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString",
                text: `${feature.label ?? feature.id}${feature.value === undefined ? "" : `: ${feature.value}`}`,
              } satisfies FeatureMark;
            })
            .filter((feature): feature is FeatureMark => feature !== null);
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "GeoJSON"}: ${features.length} entités`), features };
        }
        case "choropleth": {
          const values = layer.values ?? {};
          const finiteValues = (layer.features ?? [])
            .map((feature) => values[feature.id])
            .filter((value): value is number => Number.isFinite(value));
          const max = Math.max(1, ...finiteValues);
          const tone = layer.tone ?? "category1";
          const regions = (layer.features ?? [])
            .map((feature, index) => {
              if (!isGeometry(feature.geometry)) return null;
              const d = geometryPath(feature.geometry, project);
              if (d === "") return null;
              const value = values[feature.id];
              const valid = Number.isFinite(value);
              return {
                key: `${feature.id}-${index}`,
                d,
                tone,
                mix: valid ? mixPercent(scaleNumber(value, 0, max, 22, 90)) : null,
                text: valid ? `${feature.label ?? feature.id}: ${value}` : `${feature.label ?? feature.id}`,
              } satisfies RegionMark;
            })
            .filter((region): region is RegionMark => region !== null);
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Choroplèthe"}: ${regions.length} régions`), regions };
        }
        case "points": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const pointValues = valid.map((point) => (Number.isFinite(point.value) ? (point.value as number) : 1));
          const min = Math.min(0, ...pointValues);
          const max = Math.max(1, ...pointValues);
          const rMin = positiveOr(layer.minRadius, 5);
          const rMax = positiveOr(layer.maxRadius, 14);
          const circles = valid.map((point, index) => {
            const p = project(point);
            return {
              key: `${point.id ?? index}`,
              cx: p.x,
              cy: p.y,
              r: pointRadius(point, min, max, rMin, rMax),
              tone: point.tone ?? layer.tone ?? TONES[index % TONES.length],
              mix: null,
              text: `${point.label ?? point.id ?? `(${point.latitude}, ${point.longitude})`}${point.value === undefined ? "" : `: ${point.value}`}`,
            } satisfies CircleMark;
          });
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Points"}: ${circles.length}`), circles };
        }
        case "density": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const weights = valid.map((point) => (Number.isFinite(point.value) ? (point.value as number) : 1));
          const max = Math.max(1, ...weights);
          const rMax = positiveOr(layer.maxRadius, 17);
          const tone = layer.tone ?? "category3";
          const circles = valid.map((point, index) => {
            const p = project(point);
            const weight = Number.isFinite(point.value) ? (point.value as number) : 1;
            return {
              key: `${point.id ?? index}`,
              cx: p.x,
              cy: p.y,
              r: scaleNumber(weight, 0, max, 8, rMax),
              tone,
              mix: mixPercent(scaleNumber(weight, 0, max, 25, 60)),
              text: `(${point.latitude}, ${point.longitude}): ${weight}`,
            } satisfies CircleMark;
          });
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Densité"}: ${circles.length} points`), circles };
        }
        case "flow": {
          const valid = (layer.flows ?? []).filter((flow) => isFiniteCoordinate(flow.source) && isFiniteCoordinate(flow.target));
          const flowValues = valid.map((flow) => (Number.isFinite(flow.value) ? (flow.value as number) : 1));
          const max = Math.max(1, ...flowValues);
          const tone = layer.tone ?? "category1";
          const flows = valid.map((flow, index) => {
            const value = Number.isFinite(flow.value) ? (flow.value as number) : 1;
            return {
              key: `${flow.id ?? index}`,
              d: flowPath(flow.source, flow.target, project),
              strokeWidth: scaleNumber(value, 0, max, 2, 9),
              tone,
              text: `${flow.label ?? `(${flow.source.latitude}, ${flow.source.longitude}) → (${flow.target.latitude}, ${flow.target.longitude})`}: ${value}`,
            } satisfies FlowMark;
          });
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Flux"}: ${flows.length}`), flows };
        }
        case "hexbin": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const cellSize = positiveOr(layer.cellSize, 1);
          const bins = binPoints(valid, cellSize);
          const max = Math.max(1, ...bins.map((bin) => bin.value));
          const hexes = bins.map((bin, index) => {
            const p = project(bin.center);
            return {
              key: bin.id,
              points: hexagonPoints(p.x, p.y, scaleNumber(bin.value, 0, max, 10, 22)),
              tone: layer.tone ?? TONES[index % TONES.length],
              mix: mixPercent(scaleNumber(bin.value, 0, max, 25, 85)),
              text: `${bin.id}: ${bin.value}`,
            } satisfies HexMark;
          });
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Hexbin"}: ${hexes.length} alvéoles`), hexes };
        }
        case "cluster": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const radius = positiveOr(layer.radius, 1);
          const clusters = clusterPoints(valid, radius);
          const max = Math.max(1, ...clusters.map((cluster) => cluster.count));
          const marks = clusters.map((cluster, index) => {
            const p = project(cluster);
            return {
              key: cluster.id,
              cx: p.x,
              cy: p.y,
              r: scaleNumber(cluster.count, 0, max, 8, 24),
              tone: layer.tone ?? TONES[index % TONES.length],
              text: `${cluster.id}: ${cluster.count}`,
            } satisfies ClusterMark;
          });
          return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Clusters"}: ${marks.length}`), clusters: marks };
        }
      }
    });
  }

  get dataValueItems(): string[] {
    const items: string[] = [];
    for (const layer of this.renderedLayers) {
      items.push(layer.summary);
      items.push(...layer.features.map((feature) => feature.text));
      items.push(...layer.regions.map((region) => region.text));
      items.push(...layer.circles.map((circle) => circle.text));
      items.push(...layer.flows.map((flow) => flow.text));
      items.push(...layer.hexes.map((hex) => hex.text));
      items.push(...layer.clusters.map((cluster) => cluster.text));
    }
    return items;
  }

  trackByKey(_index: number, item: { key: string }): string {
    return item.key;
  }

  layerClass(layer: RenderLayer): string {
    return `st-geoMap__layer st-geoMap__layer--${layer.type}`;
  }

  featureClass(feature: FeatureMark): string {
    return classNames("st-geoMap__feature", `st-geoMap__feature--${feature.tone}`, feature.line && "st-geoMap__feature--line");
  }

  regionClass(region: RegionMark): string {
    return region.mix === null ? "st-geoMap__region st-geoMap__region--empty" : classNames("st-geoMap__region", `st-geoMap__region--${region.tone}`);
  }

  pointClass(mark: CircleMark): string {
    return classNames("st-geoMap__point", `st-geoMap__point--${mark.tone}`);
  }

  densityClass(mark: CircleMark): string {
    return classNames("st-geoMap__density", `st-geoMap__density--${mark.tone}`);
  }

  flowClass(mark: FlowMark): string {
    return classNames("st-geoMap__flow", `st-geoMap__flow--${mark.tone}`);
  }

  hexClass(mark: HexMark): string {
    return classNames("st-geoMap__hexbin", `st-geoMap__hexbin--${mark.tone}`);
  }

  clusterClass(mark: ClusterMark): string {
    return classNames("st-geoMap__cluster", `st-geoMap__cluster--${mark.tone}`);
  }
}
