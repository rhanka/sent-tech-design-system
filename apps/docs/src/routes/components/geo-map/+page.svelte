<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type GeoMapLayer } from "@sentropic/design-system-svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Choroplèthe : trois régions rectangulaires + valeurs par id.
  const square = (id: string, label: string, west: number) => ({
    id,
    label,
    geometry: {
      type: "Polygon" as const,
      coordinates: [[[west, 40], [west + 8, 40], [west + 8, 50], [west, 50], [west, 40]]]
    }
  });

  const choroplethLayers: GeoMapLayer[] = [
    {
      type: "choropleth",
      label: "Population",
      features: [square("a", "Région A", -10), square("b", "Région B", 0), square("c", "Région C", 10)],
      values: { a: 24, b: 67, c: 41 },
      tone: "category1"
    }
  ];

  const clusterHexbinLayers: GeoMapLayer[] = [
    {
      type: "hexbin",
      label: "Signalements",
      cellSize: 4,
      points: [
        { latitude: 45.2, longitude: 5.4 }, { latitude: 45.8, longitude: 5.9 },
        { latitude: 46.1, longitude: 6.2 }, { latitude: 48.8, longitude: 2.3 },
        { latitude: 48.9, longitude: 2.5 }, { latitude: 43.3, longitude: 5.4 }
      ]
    },
    {
      type: "cluster",
      label: "Agences",
      radius: 2,
      points: [
        { latitude: 48.85, longitude: 2.35 }, { latitude: 48.95, longitude: 2.45 },
        { latitude: 43.3, longitude: 5.37 }, { latitude: 45.76, longitude: 4.84 }
      ]
    }
  ];

  const densityLayers: GeoMapLayer[] = [
    {
      type: "density",
      label: "Activité",
      points: [
        { latitude: 48.85, longitude: 2.35, value: 9 },
        { latitude: 48.8, longitude: 2.3, value: 4 },
        { latitude: 45.76, longitude: 4.84, value: 6 },
        { latitude: 43.3, longitude: 5.37, value: 2 }
      ]
    }
  ];

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-geomap-box" },
      children: [
        { comp: "GeoMap", props: { label: "Choroplèthe démo", layers: choroplethLayers, height: 240 } },
        { comp: "GeoMap", props: { label: "Hexbin et clusters démo", layers: clusterHexbinLayers, height: 240 } },
        { comp: "GeoMap", props: { label: "Densité démo", layers: densityLayers, height: 240 } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>GeoMap</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Carte 2D générique à couches (SVG, présentationnel pur) : couches GeoJSON,
      choroplèthe, points/épingles, densité, flux (arcs), hexbin et clusters,
      empilables sur une même projection (équirectangulaire par défaut, Mercator
      en option). L'emprise s'ajuste automatiquement sur les données de toutes
      les couches (avec marge) sauf si <code>bounds</code> est fourni. Les tons
      utilisent la palette data-vis (intensités via <code>color-mix</code>) et
      chaque couche est résumée dans la liste de valeurs accessible hors SVG.
      Cette surface couvre fonctionnellement les surcouches Highcharts Maps
      <code>mapline</code>, <code>mappoint</code>, <code>mapbubble</code>,
      <code>flowmap</code> et <code>geoheatmap</code>. Le cas
      <code>tiledwebmap</code> reste hors scope : pas de provider ni de fond
      tuilé/raster embarqué.
    </p>
  </section>


  <section class="docs-section">
    <h2>Exemple : couches choroplèthe, hexbin + clusters, densité</h2>
    <TabbedExample nodes={exampleDemo} title="Cartes démo" />
  </section>

  <section class="docs-section">
    <h2>Correspondance avec Highcharts Maps</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Type Highcharts</th><th>Couche GeoMap</th><th>Notes</th></tr>
      </thead>
      <tbody>
        <tr><td><code>mapline</code></td><td><code>geojson</code></td><td>Utiliser des géométries <code>LineString</code> ou <code>MultiLineString</code>.</td></tr>
        <tr><td><code>mappoint</code></td><td><code>points</code> ou <code>geojson</code></td><td><code>points</code> pour des marqueurs pilotés par données ; <code>geojson</code> si la source est déjà en <code>Point</code>/<code>MultiPoint</code>.</td></tr>
        <tr><td><code>mapbubble</code></td><td><code>points</code></td><td>Rayon drivé par <code>value</code> via <code>minRadius</code>/<code>maxRadius</code>, ou fixé par <code>r</code>.</td></tr>
        <tr><td><code>flowmap</code></td><td><code>flow</code></td><td>Arcs source → cible avec épaisseur proportionnelle à <code>value</code>.</td></tr>
        <tr><td><code>geoheatmap</code></td><td><code>density</code> ou <code>hexbin</code></td><td><code>density</code> pour une nappe continue par poids ; <code>hexbin</code> pour une agrégation par cellules.</td></tr>
        <tr><td><code>tiledwebmap</code></td><td><em>non couvert</em></td><td><code>GeoMap</code> reste un rendu SVG pur : aucun provider, aucune URL de tuiles, aucun fond raster.</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>layers</code></td><td><code>GeoMapLayer[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>520</code> / <code>320</code></td></tr>
        <tr><td><code>projection</code></td><td><code>"equirectangular" | "mercator"</code></td><td><code>"equirectangular"</code></td></tr>
        <tr><td><code>bounds</code></td><td><code>{`{ south, west, north, east }`}</code></td><td><em>auto-fit + marge</em></td></tr>
      </tbody>
    </table>
    <h3>Couches (<code>GeoMapLayer</code>, union discriminée par <code>type</code>)</h3>
    <table class="docs-table">
      <thead>
        <tr><th><code>type</code></th><th>Données</th><th>Rendu</th></tr>
      </thead>
      <tbody>
        <tr><td><code>geojson</code></td><td><code>features: {`{ id, label?, value?, geometry }`}[]</code></td><td>Polygones/lignes/points, remplissage translucide + contour au ton (cycle de palette ou <code>tone</code> de couche).</td></tr>
        <tr><td><code>choropleth</code></td><td><code>features</code> + <code>values: Record&lt;id, number&gt;</code></td><td>Intensité <code>color-mix</code> ∝ valeur sur le ton de la couche ; région sans valeur neutre.</td></tr>
        <tr><td><code>points</code></td><td><code>points: {`{ latitude, longitude, label?, value?, tone?, r? }`}[]</code></td><td>Rayon ∝ <code>value</code> (5–14 px par défaut), <code>r</code> explicite prioritaire, tons cyclés.</td></tr>
        <tr><td><code>density</code></td><td><code>points</code> (poids dans <code>value</code>)</td><td>Cercles translucides superposés, rayon et intensité ∝ poids (ton <code>category3</code> par défaut).</td></tr>
        <tr><td><code>flow</code></td><td><code>flows: {`{ source, target, value?, label? }`}[]</code></td><td>Arcs quadratiques, épaisseur ∝ <code>value</code> (2–9 px), ton <code>category1</code> par défaut.</td></tr>
        <tr><td><code>hexbin</code></td><td><code>points</code> + <code>cellSize?</code> (degrés, défaut 1)</td><td>Binning hexagonal (même binning que dataviz-core), taille et intensité ∝ valeur agrégée.</td></tr>
        <tr><td><code>cluster</code></td><td><code>points</code> + <code>radius?</code> (degrés, défaut 1)</td><td>Regroupement glouton (même algo que dataviz-core), centroïdes distinctifs disque + anneau ∝ effectif.</td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      Les coordonnées sont des couples <code>{`{ latitude, longitude }`}</code> (mêmes
      formes que les modèles géo de dataviz-core) ; les coordonnées et valeurs non
      finies sont ignorées (<code>Number.isFinite</code>). Le composant est purement
      présentationnel : pas d'interactivité, <code>role="img"</code> + liste de
      valeurs accessible (résumé « Couche: N » puis une entrée par élément).
    </p>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-geomap-box) { display: grid; gap: 1rem; max-width: 36rem; }
</style>
