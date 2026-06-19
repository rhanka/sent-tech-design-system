import * as i0 from "@angular/core";
export type GeoMapTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
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
export type GeoMapGeometryType = "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon";
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
export type GeoMapLayer = GeoMapGeojsonLayer | GeoMapChoroplethLayer | GeoMapPointsLayer | GeoMapDensityLayer | GeoMapFlowLayer | GeoMapHexbinLayer | GeoMapClusterLayer;
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
export declare class GeoMap {
    static readonly stComponentName = "GeoMap";
    readonly componentName = "GeoMap";
    layers: GeoMapLayer[];
    width?: number;
    height?: number;
    projection?: GeoMapProjection;
    bounds?: GeoMapBounds;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get resolvedProjection(): GeoMapProjection;
    get viewBox(): string;
    get renderedLayers(): RenderLayer[];
    get dataValueItems(): string[];
    trackByKey(_index: number, item: {
        key: string;
    }): string;
    layerClass(layer: RenderLayer): string;
    featureClass(feature: FeatureMark): string;
    regionClass(region: RegionMark): string;
    pointClass(mark: CircleMark): string;
    densityClass(mark: CircleMark): string;
    flowClass(mark: FlowMark): string;
    hexClass(mark: HexMark): string;
    clusterClass(mark: ClusterMark): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<GeoMap, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GeoMap, "st-geo-map", never, { "layers": { "alias": "layers"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "projection": { "alias": "projection"; "required": false; }; "bounds": { "alias": "bounds"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=GeoMap.d.ts.map