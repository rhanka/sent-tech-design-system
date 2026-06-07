import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { GeoMap } from "./index.js";
import type { GeoMapBounds, GeoMapFeature, GeoMapLayer, GeoMapPoint } from "./GeoMap.js";

// WP15 — GeoMap générique à couches : surface DS native qui remplace les 7
// fallbacks géo de dataviz (GeoPointMap, ChoroplethMap, GeoFlowMap,
// GeoHexbinMap, GeoClusterMap, GeoDensityMap, GeoJsonMap). Présentationnel pur.

const WORLD: GeoMapBounds = { south: -90, west: -180, north: 90, east: 180 };

const pointsLayer = (points: GeoMapPoint[]): GeoMapLayer => ({ type: "points", points });

const circles = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGCircleElement>(".st-geoMap__point"));
const dataListItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("GeoMap (WP15 — carte générique à couches)", () => {
  it("renders an accessible figure (role=img + aria-label) with a tokenized SVG frame", () => {
    const el = mount(GeoMap, { props: { label: "Carte démo", layers: [] } }).element as HTMLElement;
    const visual = el.querySelector('[role="img"]');
    expect(visual?.getAttribute("aria-label")).toBe("Carte démo");
    const svg = el.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 520 320");
    expect(el.querySelector(".st-geoMap__frame")).not.toBeNull();
  });

  it("projects equirectangular coordinates linearly within explicit bounds", () => {
    const el = mount(GeoMap, {
      props: { label: "Monde", bounds: WORLD, layers: [pointsLayer([{ latitude: 0, longitude: 0 }])] },
    }).element as HTMLElement;
    const [c] = circles(el);
    // padding 24 ; (0,0) au centre : x = 24 + 236 = 260, y = 24 + 136 = 160.
    expect(Number(c.getAttribute("cx"))).toBeCloseTo(260, 5);
    expect(Number(c.getAttribute("cy"))).toBeCloseTo(160, 5);
  });

  it("mercator projection shifts mid-latitudes versus equirectangular", () => {
    const layers = [pointsLayer([{ latitude: 60, longitude: 0 }])];
    const equirect = mount(GeoMap, {
      props: { label: "Projection", bounds: WORLD, layers, projection: "equirectangular" as const },
    }).element as HTMLElement;
    const mercator = mount(GeoMap, {
      props: { label: "Projection", bounds: WORLD, layers, projection: "mercator" as const },
    }).element as HTMLElement;
    const yEq = Number(circles(equirect)[0].getAttribute("cy"));
    const yMe = Number(circles(mercator)[0].getAttribute("cy"));
    expect(yEq).not.toBeCloseTo(yMe, 1);
    // Mercator étire les pôles : une latitude moyenne descend vers le centre.
    expect(yMe).toBeGreaterThan(yEq);
  });

  it("auto-fits bounds on the data of all layers with a margin", () => {
    const el = mount(GeoMap, {
      props: {
        label: "Fit",
        layers: [pointsLayer([
          { latitude: 0, longitude: 0 },
          { latitude: 10, longitude: 10 },
        ])],
      },
    }).element as HTMLElement;
    const [a, b] = circles(el);
    const ax = Number(a.getAttribute("cx"));
    const bx = Number(b.getAttribute("cx"));
    // Marge : les données restent strictement à l'intérieur du padding (24).
    expect(ax).toBeGreaterThan(24);
    expect(bx).toBeLessThan(520 - 24);
    expect(ax).toBeLessThan(bx);
    // Latitude croissante ⇒ y décroissant.
    expect(Number(a.getAttribute("cy"))).toBeGreaterThan(Number(b.getAttribute("cy")));
  });

  it("renders a geojson layer (closed polygon, line without fill, tone classes)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "geojson",
        features: [
          {
            id: "zone",
            geometry: { type: "Polygon", coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
          },
          { id: "route", geometry: { type: "LineString", coordinates: [[0, 0], [10, 10]] } },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "GeoJSON", layers } }).element as HTMLElement;
    const paths = Array.from(el.querySelectorAll<SVGPathElement>(".st-geoMap__feature"));
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute("d")).toContain("Z");
    expect(paths[0].classList.contains("st-geoMap__feature--category1")).toBe(true);
    expect(paths[1].classList.contains("st-geoMap__feature--line")).toBe(true);
    expect(paths[1].classList.contains("st-geoMap__feature--category2")).toBe(true);
    expect(paths[1].getAttribute("d")).not.toContain("Z");
  });

  it("choropleth: color-mix intensity proportional to the value by feature id", () => {
    const square = (x: number): GeoMapFeature => ({
      id: `r${x}`,
      geometry: { type: "Polygon", coordinates: [[[x, 0], [x + 5, 0], [x + 5, 5], [x, 5], [x, 0]]] },
    });
    const layers: GeoMapLayer[] = [
      {
        type: "choropleth",
        features: [square(0), square(10), square(20)],
        values: { r0: 10, r10: 100 },
        tone: "category4",
      },
    ];
    const el = mount(GeoMap, { props: { label: "Choro", layers } }).element as HTMLElement;
    const regions = Array.from(el.querySelectorAll<SVGPathElement>(".st-geoMap__region"));
    expect(regions.length).toBe(3);
    const mix = (item: SVGPathElement) => Number(/--st-geoMap-mix:\s*(\d+)%/.exec(item.getAttribute("style") ?? "")?.[1]);
    expect(mix(regions[0])).toBeLessThan(mix(regions[1]));
    expect(regions[0].classList.contains("st-geoMap__region--category4")).toBe(true);
    // Région sans valeur : neutre (pas d'intensité).
    expect(regions[2].classList.contains("st-geoMap__region--empty")).toBe(true);
  });

  it("points: radius scales with value (5..14 as dataviz), explicit r wins, tones cycle", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "points",
        points: [
          { latitude: 0, longitude: 0, value: 1 },
          { latitude: 5, longitude: 5, value: 100 },
          { latitude: 10, longitude: 10, r: 3, tone: "category6" },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Points", layers } }).element as HTMLElement;
    const pts = circles(el);
    expect(pts.length).toBe(3);
    const r = (i: number) => Number(pts[i].getAttribute("r"));
    expect(r(0)).toBeGreaterThanOrEqual(5);
    expect(r(0)).toBeLessThan(r(1));
    expect(r(1)).toBeCloseTo(14, 5);
    expect(r(2)).toBe(3);
    expect(pts[0].classList.contains("st-geoMap__point--category1")).toBe(true);
    expect(pts[1].classList.contains("st-geoMap__point--category2")).toBe(true);
    expect(pts[2].classList.contains("st-geoMap__point--category6")).toBe(true);
  });

  it("skips invalid coordinates and flow endpoints (Number.isFinite guard)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "points",
        points: [
          { latitude: Number.NaN, longitude: 0 },
          { latitude: 0, longitude: Number.POSITIVE_INFINITY },
          { latitude: 1, longitude: 1 },
        ],
      },
      {
        type: "flow",
        flows: [
          { source: { latitude: Number.NaN, longitude: 0 }, target: { latitude: 1, longitude: 1 } },
          { source: { latitude: 0, longitude: 0 }, target: { latitude: 2, longitude: 2 }, value: 4 },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Guarded", layers } }).element as HTMLElement;
    expect(circles(el).length).toBe(1);
    expect(el.querySelectorAll(".st-geoMap__flow").length).toBe(1);
    const items = dataListItems(el);
    expect(items).toContain("Points: 1");
    expect(items).toContain("Flux: 1");
  });

  it("density: translucent circles sized and mixed by weight (default tone category3)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "density",
        points: [
          { latitude: 0, longitude: 0, value: 1 },
          { latitude: 5, longitude: 5, value: 9 },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Densité", layers } }).element as HTMLElement;
    const cells = Array.from(el.querySelectorAll<SVGCircleElement>(".st-geoMap__density"));
    expect(cells.length).toBe(2);
    expect(Number(cells[0].getAttribute("r"))).toBeLessThan(Number(cells[1].getAttribute("r")));
    expect(cells[0].classList.contains("st-geoMap__density--category3")).toBe(true);
    expect(cells[0].getAttribute("style")).toContain("--st-geoMap-mix:");
  });

  it("flow: quadratic arcs with stroke width proportional to value (2..9 as dataviz)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "flow",
        flows: [
          { source: { latitude: 0, longitude: 0 }, target: { latitude: 10, longitude: 10 }, value: 1 },
          { source: { latitude: 0, longitude: 10 }, target: { latitude: 10, longitude: 0 }, value: 10 },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Flux", layers } }).element as HTMLElement;
    const flows = Array.from(el.querySelectorAll<SVGPathElement>(".st-geoMap__flow"));
    expect(flows.length).toBe(2);
    expect(flows[0].getAttribute("d")).toContain("Q");
    const w = (i: number) => Number(flows[i].getAttribute("stroke-width"));
    expect(w(0)).toBeLessThan(w(1));
    expect(w(1)).toBeCloseTo(9, 5);
    expect(flows[0].classList.contains("st-geoMap__flow--category1")).toBe(true);
  });

  it("hexbin: bins points into hexagonal cells (same binning as dataviz-core)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "hexbin",
        cellSize: 10,
        points: [
          { latitude: 1, longitude: 1 },
          { latitude: 2, longitude: 2 },
          { latitude: 50, longitude: 40 },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Hexbin", layers } }).element as HTMLElement;
    const bins = Array.from(el.querySelectorAll<SVGPolygonElement>(".st-geoMap__hexbin"));
    expect(bins.length).toBe(2);
    // 6 sommets par alvéole.
    expect((bins[0].getAttribute("points") ?? "").split(" ").length).toBe(6);
    const items = dataListItems(el);
    expect(items).toContain("Hexbin: 2 alvéoles");
    expect(items).toContain("0:0: 2");
  });

  it("cluster: merges nearby points into distinctive centroid markers (running mean)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "cluster",
        radius: 5,
        points: [
          { latitude: 0, longitude: 0 },
          { latitude: 2, longitude: 2 },
          { latitude: 40, longitude: 40 },
        ],
      },
    ];
    const el = mount(GeoMap, { props: { label: "Clusters", layers } }).element as HTMLElement;
    const marks = Array.from(el.querySelectorAll<SVGGElement>(".st-geoMap__cluster"));
    expect(marks.length).toBe(2);
    // Marqueur distinctif : disque + anneau.
    expect(marks[0].querySelector(".st-geoMap__clusterDot")).not.toBeNull();
    expect(marks[0].querySelector(".st-geoMap__clusterRing")).not.toBeNull();
    // Le cluster de 2 points est plus gros que le singleton.
    const r = (m: SVGGElement) => Number(m.querySelector(".st-geoMap__clusterDot")?.getAttribute("r"));
    expect(r(marks[0])).toBeGreaterThan(r(marks[1]));
    const items = dataListItems(el);
    expect(items).toContain("cluster:0: 2");
    expect(items).toContain("cluster:1: 1");
  });

  it("summarizes every layer in the accessible data list (ChartDataList)", () => {
    const layers: GeoMapLayer[] = [
      {
        type: "points",
        label: "Bureaux",
        points: [
          { latitude: 48.85, longitude: 2.35, label: "Paris", value: 12 },
          { latitude: 45.5, longitude: -73.55, label: "Montréal" },
        ],
      },
      {
        type: "flow",
        flows: [
          {
            source: { latitude: 48.85, longitude: 2.35 },
            target: { latitude: 45.5, longitude: -73.55 },
            value: 7,
            label: "Paris → Montréal",
          },
        ],
      },
      {
        type: "choropleth",
        features: [
          {
            id: "fr",
            label: "France",
            geometry: { type: "Polygon", coordinates: [[[0, 40], [10, 40], [10, 50], [0, 50], [0, 40]]] },
          },
        ],
        values: { fr: 67 },
      },
    ];
    const el = mount(GeoMap, { props: { label: "Synthèse", layers } }).element as HTMLElement;
    const items = dataListItems(el);
    expect(items).toContain("Bureaux: 2");
    expect(items).toContain("Paris: 12");
    expect(items).toContain("Montréal");
    expect(items).toContain("Flux: 1");
    expect(items).toContain("Paris → Montréal: 7");
    expect(items).toContain("Choroplèthe: 1 régions");
    expect(items).toContain("France: 67");
  });

  it("renders the world frame with no data (fallback bounds) and stays empty", () => {
    const el = mount(GeoMap, { props: { label: "Vide", layers: [] } }).element as HTMLElement;
    expect(el.querySelector(".st-geoMap__frame")).not.toBeNull();
    expect(el.querySelectorAll(".st-geoMap__layer").length).toBe(0);
    expect(el.querySelector(".st-chartDataList")).toBeNull();
  });

  it("GeoMap styles are tokenized (color-mix on data tokens, no raw hex) and respect reduced motion", () => {
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
    const start = css.indexOf(".st-geoMap {");
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start);
    expect(block).toContain("color-mix");
    expect(block).toContain("--st-semantic-data-category1");
    expect(block).toContain("--st-semantic-data-category8");
    expect(block).toContain("--st-semantic-surface-default");
    expect(block).toContain("--st-semantic-border-subtle");
    expect(block).toContain("prefers-reduced-motion");
    expect(block).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
