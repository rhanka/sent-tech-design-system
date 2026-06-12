<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type PolygonChartPoint } from "@sentropic/design-system-svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const data: PolygonChartPoint[] = [
    { x: 2, y: 1 },
    { x: 6, y: 2 },
    { x: 8, y: 6 },
    { x: 5, y: 8 },
    { x: 1, y: 5 }
  ];

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-polygon-box" },
      children: [
        { comp: "PolygonChart", props: { data, label: "Zone de couverture", tone: "category2" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>PolygonChart</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Polygone fermé rempli : relie une série de points <code>x</code>/<code>y</code> dans
      l'ordre fourni en une zone remplie (couleur <code>tone</code> à opacité réduite),
      avec contour et marqueurs aux sommets. Utile pour délimiter une zone ou un cluster.
      Deux axes numériques (graduations « jolies » automatiques), tooltip au survol et
      liste accessible des coordonnées hors SVG.
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <TabbedExample nodes={exampleDemo} title="Zone de couverture" />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>PolygonChartPoint[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>tone</code></td><td><code>category1…8</code></td><td><code>category1</code></td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>480</code> / <code>360</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>PolygonChartPoint</code> = <code>{`{ x, y }`}</code> : les points sont reliés dans
      l'ordre fourni puis le contour est fermé (dernier → premier). Les coordonnées non
      finies sont filtrées ; le polygone n'est tracé qu'à partir de deux points valides.
    </p>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-polygon-box) { max-width: 32rem; }
</style>
