import { NgFor, NgIf } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const PADDING = 24;
const MAX_POINT_RADIUS = 32;
const WORLD = { south: -90, west: -180, north: 90, east: 180 };
const TONES = [
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
function isFiniteCoordinate(c) {
    return !!c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
}
function scaleNumber(value, min, max, start, end) {
    return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}
function mixPercent(value) {
    return `${Math.round(Math.max(0, Math.min(100, value)))}%`;
}
function coordinatePair(value) {
    if (!Array.isArray(value) || value.length < 2 || Array.isArray(value[0]))
        return undefined;
    const longitude = Number(value[0]);
    const latitude = Number(value[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        return undefined;
    return { latitude, longitude };
}
function collectGeometryCoordinates(value, out) {
    if (!Array.isArray(value))
        return;
    const pair = coordinatePair(value);
    if (pair) {
        out.push(pair);
        return;
    }
    for (const item of value)
        collectGeometryCoordinates(item, out);
}
function isGeometry(geometry) {
    return !!geometry && GEOMETRY_TYPES.has(geometry.type) && Array.isArray(geometry.coordinates);
}
function layerCoordinates(layer) {
    switch (layer.type) {
        case "geojson":
        case "choropleth": {
            const out = [];
            for (const feature of layer.features ?? []) {
                if (isGeometry(feature.geometry))
                    collectGeometryCoordinates(feature.geometry.coordinates, out);
            }
            return out;
        }
        case "points":
        case "density":
        case "hexbin":
        case "cluster":
            return (layer.points ?? []).filter(isFiniteCoordinate);
        case "flow": {
            const out = [];
            for (const flow of layer.flows ?? []) {
                if (isFiniteCoordinate(flow.source))
                    out.push(flow.source);
                if (isFiniteCoordinate(flow.target))
                    out.push(flow.target);
            }
            return out;
        }
    }
}
function validBounds(candidate) {
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
function fitBounds(all) {
    const coords = [];
    for (const layer of all)
        coords.push(...layerCoordinates(layer));
    if (coords.length === 0)
        return WORLD;
    let south = Infinity;
    let west = Infinity;
    let north = -Infinity;
    let east = -Infinity;
    for (const c of coords) {
        if (c.latitude < south)
            south = c.latitude;
        if (c.latitude > north)
            north = c.latitude;
        if (c.longitude < west)
            west = c.longitude;
        if (c.longitude > east)
            east = c.longitude;
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
function mercatorY(latitude) {
    const clamped = Math.max(-85, Math.min(85, latitude));
    return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
}
function createProjector(b, projection, width, height) {
    const innerW = Math.max(width - PADDING * 2, 1);
    const innerH = Math.max(height - PADDING * 2, 1);
    const projY = (latitude) => (projection === "mercator" ? mercatorY(latitude) : latitude);
    const top = projY(b.north);
    const bottom = projY(b.south);
    const lonSpan = b.east - b.west || 1;
    const ySpan = top - bottom || 1;
    return (c) => ({
        x: PADDING + ((c.longitude - b.west) / lonSpan) * innerW,
        y: PADDING + ((top - projY(c.latitude)) / ySpan) * innerH,
    });
}
function linePath(coordinates, project) {
    return coordinates
        .map((item, index) => {
        const pair = coordinatePair(item);
        if (!pair)
            return "";
        const p = project(pair);
        return `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
        .filter(Boolean)
        .join(" ");
}
function ringsPath(coordinates, project) {
    return coordinates
        .map((ring) => {
        const path = Array.isArray(ring) ? linePath(ring, project) : "";
        return path === "" ? "" : `${path} Z`;
    })
        .filter(Boolean)
        .join(" ");
}
function geometryPath(geometry, project) {
    switch (geometry.type) {
        case "Point": {
            const pair = coordinatePair(geometry.coordinates);
            if (!pair)
                return "";
            const p = project(pair);
            return `M ${p.x - 5} ${p.y} a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`;
        }
        case "MultiPoint":
            return geometry.coordinates
                .map((c) => geometryPath({ type: "Point", coordinates: c }, project))
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
function pointRadius(point, min, max, rMin, rMax) {
    if (typeof point.r === "number" && Number.isFinite(point.r) && point.r >= 0) {
        return Math.min(point.r, MAX_POINT_RADIUS);
    }
    return scaleNumber(point.value ?? 1, min, max, rMin, rMax);
}
function hexagonPoints(cx, cy, radius) {
    return Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI / 3) * index - Math.PI / 6;
        return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
    }).join(" ");
}
function flowPath(source, target, project) {
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
function binPoints(points, cellSize) {
    const hexHeight = cellSize * (Math.sqrt(3) / 2);
    const bins = new Map();
    for (const point of points) {
        const q = Math.floor(point.longitude / cellSize);
        const r = Math.floor(point.latitude / hexHeight);
        const id = `${q}:${r}`;
        const bin = bins.get(id);
        const value = Number.isFinite(point.value) ? point.value : 1;
        if (bin) {
            bin.count += 1;
            bin.value += value;
        }
        else {
            bins.set(id, { id, q, r, center: { latitude: r * hexHeight, longitude: q * cellSize }, count: 1, value });
        }
    }
    return [...bins.values()];
}
function clusterPoints(points, radius) {
    const clusters = [];
    for (const point of points) {
        const cluster = clusters.find((item) => {
            const dLat = item.latitude - point.latitude;
            const dLon = item.longitude - point.longitude;
            return Math.sqrt(dLat * dLat + dLon * dLon) <= radius;
        });
        const value = Number.isFinite(point.value) ? point.value : 1;
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
function positiveOr(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function emptyRenderLayer(type, key, summary) {
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
export class GeoMap {
    static stComponentName = "GeoMap";
    componentName = "GeoMap";
    layers = [];
    width;
    height;
    projection;
    bounds;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-geoMap", this.classInput);
    }
    get resolvedWidth() {
        return this.width ?? 520;
    }
    get resolvedHeight() {
        return this.height ?? 320;
    }
    get resolvedProjection() {
        return this.projection === "mercator" ? "mercator" : "equirectangular";
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
    }
    get renderedLayers() {
        const layers = this.layers ?? [];
        const mapBounds = validBounds(this.bounds) ?? fitBounds(layers);
        const project = createProjector(mapBounds, this.resolvedProjection, this.resolvedWidth, this.resolvedHeight);
        return layers.map((layer, layerIndex) => {
            const key = `layer-${layerIndex}`;
            switch (layer.type) {
                case "geojson": {
                    const features = (layer.features ?? [])
                        .map((feature, index) => {
                        if (!isGeometry(feature.geometry))
                            return null;
                        const d = geometryPath(feature.geometry, project);
                        if (d === "")
                            return null;
                        return {
                            key: `${feature.id}-${index}`,
                            d,
                            tone: layer.tone ?? TONES[index % TONES.length],
                            line: feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString",
                            text: `${feature.label ?? feature.id}${feature.value === undefined ? "" : `: ${feature.value}`}`,
                        };
                    })
                        .filter((feature) => feature !== null);
                    return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "GeoJSON"}: ${features.length} entités`), features };
                }
                case "choropleth": {
                    const values = layer.values ?? {};
                    const finiteValues = (layer.features ?? [])
                        .map((feature) => values[feature.id])
                        .filter((value) => Number.isFinite(value));
                    const max = Math.max(1, ...finiteValues);
                    const tone = layer.tone ?? "category1";
                    const regions = (layer.features ?? [])
                        .map((feature, index) => {
                        if (!isGeometry(feature.geometry))
                            return null;
                        const d = geometryPath(feature.geometry, project);
                        if (d === "")
                            return null;
                        const value = values[feature.id];
                        const valid = Number.isFinite(value);
                        return {
                            key: `${feature.id}-${index}`,
                            d,
                            tone,
                            mix: valid ? mixPercent(scaleNumber(value, 0, max, 22, 90)) : null,
                            text: valid ? `${feature.label ?? feature.id}: ${value}` : `${feature.label ?? feature.id}`,
                        };
                    })
                        .filter((region) => region !== null);
                    return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Choroplèthe"}: ${regions.length} régions`), regions };
                }
                case "points": {
                    const valid = (layer.points ?? []).filter(isFiniteCoordinate);
                    const pointValues = valid.map((point) => (Number.isFinite(point.value) ? point.value : 1));
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
                        };
                    });
                    return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Points"}: ${circles.length}`), circles };
                }
                case "density": {
                    const valid = (layer.points ?? []).filter(isFiniteCoordinate);
                    const weights = valid.map((point) => (Number.isFinite(point.value) ? point.value : 1));
                    const max = Math.max(1, ...weights);
                    const rMax = positiveOr(layer.maxRadius, 17);
                    const tone = layer.tone ?? "category3";
                    const circles = valid.map((point, index) => {
                        const p = project(point);
                        const weight = Number.isFinite(point.value) ? point.value : 1;
                        return {
                            key: `${point.id ?? index}`,
                            cx: p.x,
                            cy: p.y,
                            r: scaleNumber(weight, 0, max, 8, rMax),
                            tone,
                            mix: mixPercent(scaleNumber(weight, 0, max, 25, 60)),
                            text: `(${point.latitude}, ${point.longitude}): ${weight}`,
                        };
                    });
                    return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Densité"}: ${circles.length} points`), circles };
                }
                case "flow": {
                    const valid = (layer.flows ?? []).filter((flow) => isFiniteCoordinate(flow.source) && isFiniteCoordinate(flow.target));
                    const flowValues = valid.map((flow) => (Number.isFinite(flow.value) ? flow.value : 1));
                    const max = Math.max(1, ...flowValues);
                    const tone = layer.tone ?? "category1";
                    const flows = valid.map((flow, index) => {
                        const value = Number.isFinite(flow.value) ? flow.value : 1;
                        return {
                            key: `${flow.id ?? index}`,
                            d: flowPath(flow.source, flow.target, project),
                            strokeWidth: scaleNumber(value, 0, max, 2, 9),
                            tone,
                            text: `${flow.label ?? `(${flow.source.latitude}, ${flow.source.longitude}) → (${flow.target.latitude}, ${flow.target.longitude})`}: ${value}`,
                        };
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
                        };
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
                        };
                    });
                    return { ...emptyRenderLayer(layer.type, key, `${layer.label ?? "Clusters"}: ${marks.length}`), clusters: marks };
                }
            }
        });
    }
    get dataValueItems() {
        const items = [];
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
    trackByKey(_index, item) {
        return item.key;
    }
    layerClass(layer) {
        return `st-geoMap__layer st-geoMap__layer--${layer.type}`;
    }
    featureClass(feature) {
        return classNames("st-geoMap__feature", `st-geoMap__feature--${feature.tone}`, feature.line && "st-geoMap__feature--line");
    }
    regionClass(region) {
        return region.mix === null ? "st-geoMap__region st-geoMap__region--empty" : classNames("st-geoMap__region", `st-geoMap__region--${region.tone}`);
    }
    pointClass(mark) {
        return classNames("st-geoMap__point", `st-geoMap__point--${mark.tone}`);
    }
    densityClass(mark) {
        return classNames("st-geoMap__density", `st-geoMap__density--${mark.tone}`);
    }
    flowClass(mark) {
        return classNames("st-geoMap__flow", `st-geoMap__flow--${mark.tone}`);
    }
    hexClass(mark) {
        return classNames("st-geoMap__hexbin", `st-geoMap__hexbin--${mark.tone}`);
    }
    clusterClass(mark) {
        return classNames("st-geoMap__cluster", `st-geoMap__cluster--${mark.tone}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GeoMap, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: GeoMap, isStandalone: true, selector: "st-geo-map", inputs: { layers: "layers", width: "width", height: "height", projection: "projection", bounds: "bounds", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GeoMap, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { layers: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], projection: [{
                type: NgInput
            }], bounds: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=GeoMap.js.map