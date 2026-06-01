<script lang="ts">
  import { Badge, StackedBarChart, type StackedBarDatum } from "@sentropic/design-system-svelte";

  const data: StackedBarDatum[] = [
    { label: "Q1", segments: [
      { label: "Composants", value: 20 },
      { label: "Tokens", value: 12 },
      { label: "Docs", value: 8 }
    ]},
    { label: "Q2", segments: [
      { label: "Composants", value: 26 },
      { label: "Tokens", value: 10 },
      { label: "Docs", value: 14 }
    ]},
    { label: "Q3", segments: [
      { label: "Composants", value: 16 },
      { label: "Tokens", value: 18 },
      { label: "Docs", value: 11 }
    ]}
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>StackedBarChart</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Barres empilées : chaque barre cumule plusieurs séries (segments). Couleur par
      série (palette data-vis), légende dérivée des labels, tooltip par segment au
      survol et liste accessible des segments hors SVG.
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <div class="docs-stacked-box">
      <StackedBarChart {data} label="Production par trimestre" />
    </div>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>StackedBarDatum[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>showLegend</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>480</code> / <code>260</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>StackedBarDatum</code> = <code>{`{ label, segments: { label, value, tone? }[] }`}</code>.
    </p>
  </section>
</div>

<style>
  .docs-stacked-box { max-width: 32rem; }
</style>
