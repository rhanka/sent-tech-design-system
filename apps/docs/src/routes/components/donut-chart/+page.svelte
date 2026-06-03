<script lang="ts">
  import { Badge, DonutChart, type DonutChartDatum } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const data: DonutChartDatum[] = [
    { label: "Composants", value: 62 },
    { label: "Tokens", value: 28 },
    { label: "Thèmes", value: 14 },
    { label: "Contrats", value: 9 }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>DonutChart</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Graphique en anneau : parts d'un total, palette data-vis catégorielle du thème
      (<code>category1…8</code>), tooltip au survol (valeur + %), total affiché
      au centre. Le graphique porte <code>role="img"</code> avec un label parlant et
      expose les parts dans une liste accessible hors SVG.
    </p>
  </section>
  <FrameworkPreview example="donutchart" title="Aperçu live" />


  <section class="docs-section">
    <h2>Exemple</h2>
    <div class="docs-donut-box">
      <DonutChart {data} label="Répartition des éléments du DS" centerLabel="113" />
    </div>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>DonutChartDatum[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>size</code></td><td><code>number</code></td><td><code>220</code></td></tr>
        <tr><td><code>thickness</code></td><td><code>number</code></td><td><code>34</code></td></tr>
        <tr><td><code>centerLabel</code></td><td><code>string | null</code></td><td>total (<code>null</code> pour masquer)</td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>DonutChartDatum</code> = <code>{`{ label, value, tone? }`}</code> ;
      <code>tone</code> ∈ <code>category1…8</code> (sinon assigné cycliquement).
    </p>
  </section>
</div>

<style>
  .docs-donut-box { max-width: 16rem; }
</style>
