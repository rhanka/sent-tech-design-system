<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type DonutChartDatum } from "@sentropic/design-system-svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const data: DonutChartDatum[] = [
    { label: "Composants", value: 62 },
    { label: "Tokens", value: 28 },
    { label: "Thèmes", value: 14 },
    { label: "Contrats", value: 9 }
  ];

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-donut-box" },
      children: [
        { comp: "DonutChart", props: { data, label: "Répartition des éléments du DS", centerLabel: "113" } }
      ]
    }
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


  <section class="docs-section">
    <h2>Exemple</h2>
    <TabbedExample nodes={exampleDemo} title="Répartition des éléments du DS" />
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
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-donut-box) { max-width: 16rem; }
</style>
