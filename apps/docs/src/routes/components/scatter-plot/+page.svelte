<script lang="ts">
  import { Badge, type ScatterPlotDatum } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const data: ScatterPlotDatum[] = [
    { x: 1, y: 2, label: "A" },
    { x: 2, y: 3.5, label: "B" },
    { x: 3, y: 2.8, label: "C", tone: "category2" },
    { x: 4, y: 5, label: "D", tone: "category2" },
    { x: 5, y: 4.2, label: "E", tone: "category3" },
    { x: 6, y: 6.1, label: "F", tone: "category3" },
    { x: 7, y: 5.5, label: "G", tone: "category4" }
  ];

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-scatter-box" },
      children: [
        { comp: "ScatterPlot", props: { data, label: "Corrélation démo", xLabel: "Effort", yLabel: "Valeur" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>ScatterPlot</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Nuage de points : deux axes numériques (graduations « jolies » automatiques),
      points colorés par <code>tone</code> (palette data-vis), tooltip au survol et
      liste accessible des coordonnées hors SVG.
    </p>
  </section>
  <FrameworkPreview example="scatterplot" title="Aperçu live" />


  <section class="docs-section">
    <h2>Exemple</h2>
    <FrameworkDemo nodes={exampleDemo} label="Corrélation démo" />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ScatterPlotDatum[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>xLabel</code> / <code>yLabel</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>480</code> / <code>280</code></td></tr>
        <tr><td><code>radius</code></td><td><code>number</code></td><td><code>5</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>ScatterPlotDatum</code> = <code>{`{ x, y, label?, tone? }`}</code>.
    </p>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-scatter-box) { max-width: 32rem; }
</style>
