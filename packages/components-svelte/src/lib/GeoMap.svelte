<script lang="ts" module>
  export type GeoMapTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

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
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type GeoMapProps = {
    layers: GeoMapLayer[];
    width?: number;
    height?: number;
    projection?: GeoMapProjection;
    /** Emprise explicite ; sinon auto-ajustement sur les données de toutes les couches + marge. */
    bounds?: GeoMapBounds;
    label: string;
    class?: string;
  };

  let {
    layers,
    width = 520,
    height = 320,
    projection = "equirectangular",
    bounds,
    label,
    class: className
  }: GeoMapProps = $props();

  const PADDING = 24;
  const MAX_POINT_RADIUS = 32;
  const WORLD: GeoMapBounds = { south: -90, west: -180, north: 90, east: 180 };
  const TONES = ["category1","category2","category3","category4","category5","category6","category7","category8"] as const;
  const GEOMETRY_TYPES = new Set(["Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon"]);

  function isFiniteCoordinate<T extends GeoMapCoordinate>(c: T | undefined): c is T {
    return !!c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
  }

  function scaleNumber(value: number, min: number, max: number, start: number, end: number): number {
    return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
  }

  /** Pourcentage color-mix valide (0–100, arrondi). */
  function mixPercent(value: number): number {
    return Math.round(Math.max(0, Math.min(100, value)));
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
      Number.isFinite(candidate.south) && Number.isFinite(candidate.west) &&
      Number.isFinite(candidate.north) && Number.isFinite(candidate.east) &&
      candidate.north > candidate.south && candidate.east > candidate.west
      ? candidate
      : null;
  }

  function fitBounds(all: GeoMapLayer[]): GeoMapBounds {
    const coords = all.flatMap(layerCoordinates);
    if (coords.length === 0) return WORLD;
    let south = Infinity, west = Infinity, north = -Infinity, east = -Infinity;
    for (const c of coords) {
      if (c.latitude < south) south = c.latitude;
      if (c.latitude > north) north = c.latitude;
      if (c.longitude < west) west = c.longitude;
      if (c.longitude > east) east = c.longitude;
    }
    // Marge : 5 % de l'étendue, 1° minimum (point isolé), bornée au monde.
    const latPad = Math.max((north - south) * 0.05, 1);
    const lonPad = Math.max((east - west) * 0.05, 1);
    return {
      south: Math.max(south - latPad, -90),
      west: Math.max(west - lonPad, -180),
      north: Math.min(north + latPad, 90),
      east: Math.min(east + lonPad, 180)
    };
  }

  function mercatorY(latitude: number): number {
    const clamped = Math.max(-85, Math.min(85, latitude));
    return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
  }

  const mapBounds = $derived(validBounds(bounds) ?? fitBounds(layers ?? []));

  const project = $derived.by(() => {
    const b = mapBounds;
    const innerW = Math.max(width - PADDING * 2, 1);
    const innerH = Math.max(height - PADDING * 2, 1);
    const projY = (latitude: number) => (projection === "mercator" ? mercatorY(latitude) : latitude);
    const top = projY(b.north);
    const bottom = projY(b.south);
    const lonSpan = b.east - b.west || 1;
    const ySpan = top - bottom || 1;
    return (c: GeoMapCoordinate) => ({
      x: PADDING + ((c.longitude - b.west) / lonSpan) * innerW,
      y: PADDING + ((top - projY(c.latitude)) / ySpan) * innerH
    });
  });

  function linePath(coordinates: unknown[]): string {
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

  function ringsPath(coordinates: unknown[]): string {
    return coordinates
      .map((ring) => {
        const path = Array.isArray(ring) ? linePath(ring) : "";
        return path === "" ? "" : `${path} Z`;
      })
      .filter(Boolean)
      .join(" ");
  }

  function geometryPath(geometry: GeoMapGeometry): string {
    switch (geometry.type) {
      case "Point": {
        const pair = coordinatePair(geometry.coordinates);
        if (!pair) return "";
        const p = project(pair);
        return `M ${p.x - 5} ${p.y} a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`;
      }
      case "MultiPoint":
        return geometry.coordinates
          .map((c) => geometryPath({ type: "Point", coordinates: c as unknown[] }))
          .filter(Boolean)
          .join(" ");
      case "LineString":
        return linePath(geometry.coordinates);
      case "MultiLineString":
        return geometry.coordinates
          .map((line) => (Array.isArray(line) ? linePath(line) : ""))
          .filter(Boolean)
          .join(" ");
      case "Polygon":
        return ringsPath(geometry.coordinates);
      case "MultiPolygon":
        return geometry.coordinates
          .map((polygon) => (Array.isArray(polygon) ? ringsPath(polygon) : ""))
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

  function flowPath(source: GeoMapCoordinate, target: GeoMapCoordinate): string {
    const a = project(source);
    const b = project(target);
    // Arc quadratique : point de contrôle au milieu, décalé perpendiculairement.
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
      const q = Math.trunc(point.longitude / cellSize);
      const r = Math.trunc(point.latitude / hexHeight);
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
          value
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

  type FeatureMark = { key: string; d: string; tone: GeoMapTone; line: boolean; text: string };
  type RegionMark = { key: string; d: string; mix: number | null; text: string };
  type CircleMark = { key: string; cx: number; cy: number; r: number; tone: GeoMapTone; mix?: number; text: string };
  type FlowMark = { key: string; d: string; strokeWidth: number; text: string };
  type HexMark = { key: string; points: string; mix: number; text: string; tone: GeoMapTone };

  type LayerMarks =
    | { type: "geojson"; key: string; summary: string; features: FeatureMark[] }
    | { type: "choropleth"; key: string; summary: string; tone: GeoMapTone; regions: RegionMark[] }
    | { type: "points"; key: string; summary: string; circles: CircleMark[] }
    | { type: "density"; key: string; summary: string; tone: GeoMapTone; circles: CircleMark[] }
    | { type: "flow"; key: string; summary: string; tone: GeoMapTone; flows: FlowMark[] }
    | { type: "hexbin"; key: string; summary: string; bins: HexMark[] }
    | { type: "cluster"; key: string; summary: string; clusters: CircleMark[] };

  const layerMarks = $derived.by((): LayerMarks[] => {
    return (layers ?? []).map((layer, layerIndex): LayerMarks => {
      const key = `layer-${layerIndex}`;
      switch (layer.type) {
        case "geojson": {
          const features: FeatureMark[] = [];
          (layer.features ?? []).forEach((feature, index) => {
            if (!isGeometry(feature.geometry)) return;
            const d = geometryPath(feature.geometry);
            if (d === "") return;
            features.push({
              key: `${feature.id}-${index}`,
              d,
              tone: layer.tone ?? TONES[index % TONES.length],
              line: feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString",
              text: `${feature.label ?? feature.id}${feature.value === undefined ? "" : `: ${feature.value}`}`
            });
          });
          return { type: "geojson", key, summary: `${layer.label ?? "GeoJSON"}: ${features.length} entités`, features };
        }
        case "choropleth": {
          const values = layer.values ?? {};
          const finiteValues = (layer.features ?? [])
            .map((feature) => values[feature.id])
            .filter((v): v is number => Number.isFinite(v));
          const max = Math.max(1, ...finiteValues);
          const regions: RegionMark[] = [];
          (layer.features ?? []).forEach((feature, index) => {
            if (!isGeometry(feature.geometry)) return;
            const d = geometryPath(feature.geometry);
            if (d === "") return;
            const value = values[feature.id];
            const valid = Number.isFinite(value);
            regions.push({
              key: `${feature.id}-${index}`,
              d,
              mix: valid ? mixPercent(scaleNumber(value, 0, max, 22, 90)) : null,
              text: valid ? `${feature.label ?? feature.id}: ${value}` : `${feature.label ?? feature.id}`
            });
          });
          return {
            type: "choropleth",
            key,
            summary: `${layer.label ?? "Choroplèthe"}: ${regions.length} régions`,
            tone: layer.tone ?? "category1",
            regions
          };
        }
        case "points": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const values = valid.map((p) => (Number.isFinite(p.value) ? (p.value as number) : 1));
          const min = Math.min(0, ...values);
          const max = Math.max(1, ...values);
          const rMin = positiveOr(layer.minRadius, 5);
          const rMax = positiveOr(layer.maxRadius, 14);
          const circles = valid.map((point, index): CircleMark => {
            const p = project(point);
            return {
              key: `${point.id ?? index}`,
              cx: p.x,
              cy: p.y,
              r: pointRadius(point, min, max, rMin, rMax),
              tone: point.tone ?? layer.tone ?? TONES[index % TONES.length],
              text: `${point.label ?? point.id ?? `(${point.latitude}, ${point.longitude})`}${point.value === undefined ? "" : `: ${point.value}`}`
            };
          });
          return { type: "points", key, summary: `${layer.label ?? "Points"}: ${circles.length}`, circles };
        }
        case "density": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const weights = valid.map((p) => (Number.isFinite(p.value) ? (p.value as number) : 1));
          const max = Math.max(1, ...weights);
          const rMax = positiveOr(layer.maxRadius, 17);
          const circles = valid.map((point, index): CircleMark => {
            const p = project(point);
            const weight = Number.isFinite(point.value) ? (point.value as number) : 1;
            return {
              key: `${point.id ?? index}`,
              cx: p.x,
              cy: p.y,
              r: scaleNumber(weight, 0, max, 8, rMax),
              tone: layer.tone ?? "category3",
              mix: mixPercent(scaleNumber(weight, 0, max, 25, 60)),
              text: `(${point.latitude}, ${point.longitude}): ${weight}`
            };
          });
          return {
            type: "density",
            key,
            summary: `${layer.label ?? "Densité"}: ${circles.length} points`,
            tone: layer.tone ?? "category3",
            circles
          };
        }
        case "flow": {
          const valid = (layer.flows ?? []).filter((f) => isFiniteCoordinate(f.source) && isFiniteCoordinate(f.target));
          const values = valid.map((f) => (Number.isFinite(f.value) ? (f.value as number) : 1));
          const max = Math.max(1, ...values);
          const flows = valid.map((flow, index): FlowMark => {
            const value = Number.isFinite(flow.value) ? (flow.value as number) : 1;
            return {
              key: `${flow.id ?? index}`,
              d: flowPath(flow.source, flow.target),
              strokeWidth: scaleNumber(value, 0, max, 2, 9),
              text: `${flow.label ?? `(${flow.source.latitude}, ${flow.source.longitude}) → (${flow.target.latitude}, ${flow.target.longitude})`}: ${value}`
            };
          });
          return {
            type: "flow",
            key,
            summary: `${layer.label ?? "Flux"}: ${flows.length}`,
            tone: layer.tone ?? "category1",
            flows
          };
        }
        case "hexbin": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const cellSize = positiveOr(layer.cellSize, 1);
          const bins = binPoints(valid, cellSize);
          const max = Math.max(1, ...bins.map((bin) => bin.value));
          const marks = bins.map((bin, index): HexMark => {
            const p = project(bin.center);
            return {
              key: bin.id,
              points: hexagonPoints(p.x, p.y, scaleNumber(bin.value, 0, max, 10, 22)),
              mix: mixPercent(scaleNumber(bin.value, 0, max, 25, 85)),
              tone: layer.tone ?? TONES[index % TONES.length],
              text: `${bin.id}: ${bin.value}`
            };
          });
          return { type: "hexbin", key, summary: `${layer.label ?? "Hexbin"}: ${marks.length} alvéoles`, bins: marks };
        }
        case "cluster": {
          const valid = (layer.points ?? []).filter(isFiniteCoordinate);
          const radius = positiveOr(layer.radius, 1);
          const clusters = clusterPoints(valid, radius);
          const max = Math.max(1, ...clusters.map((cluster) => cluster.count));
          const marks = clusters.map((cluster, index): CircleMark => {
            const p = project(cluster);
            return {
              key: cluster.id,
              cx: p.x,
              cy: p.y,
              r: scaleNumber(cluster.count, 0, max, 8, 24),
              tone: layer.tone ?? TONES[index % TONES.length],
              text: `${cluster.id}: ${cluster.count}`
            };
          });
          return { type: "cluster", key, summary: `${layer.label ?? "Clusters"}: ${marks.length}`, clusters: marks };
        }
      }
    });
  });

  const dataValueItems = $derived(
    layerMarks.flatMap((marks) => {
      switch (marks.type) {
        case "geojson":
          return [marks.summary, ...marks.features.map((f) => f.text)];
        case "choropleth":
          return [marks.summary, ...marks.regions.map((r) => r.text)];
        case "points":
        case "density":
          return [marks.summary, ...marks.circles.map((c) => c.text)];
        case "flow":
          return [marks.summary, ...marks.flows.map((f) => f.text)];
        case "hexbin":
          return [marks.summary, ...marks.bins.map((b) => b.text)];
        case "cluster":
          return [marks.summary, ...marks.clusters.map((c) => c.text)];
      }
    })
  );

  const classes = () => ["st-geoMap", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div class="st-geoMap__visual" role="img" aria-label={label}>
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      <rect class="st-geoMap__frame" x="0.5" y="0.5" width={width - 1} height={height - 1} rx="4" />
      {#each layerMarks as marks (marks.key)}
        <g class="st-geoMap__layer st-geoMap__layer--{marks.type}">
          {#if marks.type === "geojson"}
            {#each marks.features as feature (feature.key)}
              <path
                class="st-geoMap__feature st-geoMap__feature--{feature.tone}{feature.line ? ' st-geoMap__feature--line' : ''}"
                d={feature.d}
                fill-rule="evenodd"
              />
            {/each}
          {:else if marks.type === "choropleth"}
            {#each marks.regions as region (region.key)}
              {#if region.mix === null}
                <path class="st-geoMap__region st-geoMap__region--empty" d={region.d} fill-rule="evenodd" />
              {:else}
                <path
                  class="st-geoMap__region st-geoMap__region--{marks.tone}"
                  d={region.d}
                  fill-rule="evenodd"
                  style="--st-geoMap-mix: {region.mix}%"
                />
              {/if}
            {/each}
          {:else if marks.type === "points"}
            {#each marks.circles as circle (circle.key)}
              <circle class="st-geoMap__point st-geoMap__point--{circle.tone}" cx={circle.cx} cy={circle.cy} r={circle.r} />
            {/each}
          {:else if marks.type === "density"}
            {#each marks.circles as circle (circle.key)}
              <circle
                class="st-geoMap__density st-geoMap__density--{circle.tone}"
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                style="--st-geoMap-mix: {circle.mix}%"
              />
            {/each}
          {:else if marks.type === "flow"}
            {#each marks.flows as flow (flow.key)}
              <path class="st-geoMap__flow st-geoMap__flow--{marks.tone}" d={flow.d} stroke-width={flow.strokeWidth} />
            {/each}
          {:else if marks.type === "hexbin"}
            {#each marks.bins as bin (bin.key)}
              <polygon
                class="st-geoMap__hexbin st-geoMap__hexbin--{bin.tone}"
                points={bin.points}
                style="--st-geoMap-mix: {bin.mix}%"
              />
            {/each}
          {:else if marks.type === "cluster"}
            {#each marks.clusters as cluster (cluster.key)}
              <g class="st-geoMap__cluster st-geoMap__cluster--{cluster.tone}">
                <circle class="st-geoMap__clusterDot" cx={cluster.cx} cy={cluster.cy} r={cluster.r} />
                <circle class="st-geoMap__clusterRing" cx={cluster.cx} cy={cluster.cy} r={cluster.r + 3} />
              </g>
            {/each}
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-geoMap { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-geoMap svg, .st-geoMap__visual { display: block; }
  .st-geoMap__frame { fill: var(--st-semantic-surface-default, Canvas); stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  /* GeoJSON : remplissage translucide (color-mix) + contour au ton. */
  .st-geoMap__feature { stroke-width: 1.5; transition: fill-opacity 120ms ease; }
  .st-geoMap__feature--category1 { fill: color-mix(in srgb, var(--st-semantic-data-category1) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category1); }
  .st-geoMap__feature--category2 { fill: color-mix(in srgb, var(--st-semantic-data-category2) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category2); }
  .st-geoMap__feature--category3 { fill: color-mix(in srgb, var(--st-semantic-data-category3) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category3); }
  .st-geoMap__feature--category4 { fill: color-mix(in srgb, var(--st-semantic-data-category4) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category4); }
  .st-geoMap__feature--category5 { fill: color-mix(in srgb, var(--st-semantic-data-category5) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category5); }
  .st-geoMap__feature--category6 { fill: color-mix(in srgb, var(--st-semantic-data-category6) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category6); }
  .st-geoMap__feature--category7 { fill: color-mix(in srgb, var(--st-semantic-data-category7) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category7); }
  .st-geoMap__feature--category8 { fill: color-mix(in srgb, var(--st-semantic-data-category8) var(--st-geoMap-mix, 34%), transparent); stroke: var(--st-semantic-data-category8); }
  .st-geoMap__feature--line { fill: none; }
  /* Choroplèthe : intensité ∝ valeur via color-mix sur le ton de la couche. */
  .st-geoMap__region { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-geoMap__region--empty { fill: var(--st-semantic-surface-default, Canvas); }
  .st-geoMap__region--category1 { fill: color-mix(in srgb, var(--st-semantic-data-category1) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category2 { fill: color-mix(in srgb, var(--st-semantic-data-category2) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category3 { fill: color-mix(in srgb, var(--st-semantic-data-category3) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category4 { fill: color-mix(in srgb, var(--st-semantic-data-category4) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category5 { fill: color-mix(in srgb, var(--st-semantic-data-category5) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category6 { fill: color-mix(in srgb, var(--st-semantic-data-category6) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category7 { fill: color-mix(in srgb, var(--st-semantic-data-category7) var(--st-geoMap-mix, 60%), transparent); }
  .st-geoMap__region--category8 { fill: color-mix(in srgb, var(--st-semantic-data-category8) var(--st-geoMap-mix, 60%), transparent); }
  /* Points/épingles : ton plein, légère translucidité (parité dataviz). */
  .st-geoMap__point { fill-opacity: 0.82; }
  .st-geoMap__point--category1 { fill: var(--st-semantic-data-category1); }
  .st-geoMap__point--category2 { fill: var(--st-semantic-data-category2); }
  .st-geoMap__point--category3 { fill: var(--st-semantic-data-category3); }
  .st-geoMap__point--category4 { fill: var(--st-semantic-data-category4); }
  .st-geoMap__point--category5 { fill: var(--st-semantic-data-category5); }
  .st-geoMap__point--category6 { fill: var(--st-semantic-data-category6); }
  .st-geoMap__point--category7 { fill: var(--st-semantic-data-category7); }
  .st-geoMap__point--category8 { fill: var(--st-semantic-data-category8); }
  /* Densité : cercles translucides superposés (color-mix ∝ poids). */
  .st-geoMap__density--category1 { fill: color-mix(in srgb, var(--st-semantic-data-category1) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category2 { fill: color-mix(in srgb, var(--st-semantic-data-category2) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category3 { fill: color-mix(in srgb, var(--st-semantic-data-category3) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category4 { fill: color-mix(in srgb, var(--st-semantic-data-category4) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category5 { fill: color-mix(in srgb, var(--st-semantic-data-category5) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category6 { fill: color-mix(in srgb, var(--st-semantic-data-category6) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category7 { fill: color-mix(in srgb, var(--st-semantic-data-category7) var(--st-geoMap-mix, 45%), transparent); }
  .st-geoMap__density--category8 { fill: color-mix(in srgb, var(--st-semantic-data-category8) var(--st-geoMap-mix, 45%), transparent); }
  /* Flux : arcs quadratiques, épaisseur portée par l'attribut stroke-width. */
  .st-geoMap__flow { fill: none; stroke-linecap: round; stroke-opacity: 0.62; }
  .st-geoMap__flow--category1 { stroke: var(--st-semantic-data-category1); }
  .st-geoMap__flow--category2 { stroke: var(--st-semantic-data-category2); }
  .st-geoMap__flow--category3 { stroke: var(--st-semantic-data-category3); }
  .st-geoMap__flow--category4 { stroke: var(--st-semantic-data-category4); }
  .st-geoMap__flow--category5 { stroke: var(--st-semantic-data-category5); }
  .st-geoMap__flow--category6 { stroke: var(--st-semantic-data-category6); }
  .st-geoMap__flow--category7 { stroke: var(--st-semantic-data-category7); }
  .st-geoMap__flow--category8 { stroke: var(--st-semantic-data-category8); }
  /* Hexbin : intensité ∝ valeur agrégée via color-mix. */
  .st-geoMap__hexbin--category1 { fill: color-mix(in srgb, var(--st-semantic-data-category1) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category2 { fill: color-mix(in srgb, var(--st-semantic-data-category2) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category3 { fill: color-mix(in srgb, var(--st-semantic-data-category3) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category4 { fill: color-mix(in srgb, var(--st-semantic-data-category4) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category5 { fill: color-mix(in srgb, var(--st-semantic-data-category5) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category6 { fill: color-mix(in srgb, var(--st-semantic-data-category6) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category7 { fill: color-mix(in srgb, var(--st-semantic-data-category7) var(--st-geoMap-mix, 72%), transparent); }
  .st-geoMap__hexbin--category8 { fill: color-mix(in srgb, var(--st-semantic-data-category8) var(--st-geoMap-mix, 72%), transparent); }
  /* Clusters : centroïde distinctif (disque + anneau), toné via currentColor. */
  .st-geoMap__cluster--category1 { color: var(--st-semantic-data-category1); }
  .st-geoMap__cluster--category2 { color: var(--st-semantic-data-category2); }
  .st-geoMap__cluster--category3 { color: var(--st-semantic-data-category3); }
  .st-geoMap__cluster--category4 { color: var(--st-semantic-data-category4); }
  .st-geoMap__cluster--category5 { color: var(--st-semantic-data-category5); }
  .st-geoMap__cluster--category6 { color: var(--st-semantic-data-category6); }
  .st-geoMap__cluster--category7 { color: var(--st-semantic-data-category7); }
  .st-geoMap__cluster--category8 { color: var(--st-semantic-data-category8); }
  .st-geoMap__clusterDot { fill: currentColor; fill-opacity: 0.78; }
  .st-geoMap__clusterRing { fill: none; stroke: currentColor; stroke-width: 1.5; }
  @media (prefers-reduced-motion: reduce) {
    .st-geoMap__feature { transition: none; }
  }
</style>
