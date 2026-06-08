<script lang="ts">
  import { Badge, type StackedBarDatum } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

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

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-stacked-box" },
      children: [
        { comp: "StackedBarChart", props: { data, label: "Production par trimestre" } }
      ]
    }
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
  <FrameworkPreview example="stackedbarchart" title="Aperçu live" />


  <section class="docs-section">
    <h2>Exemple</h2>
    <FrameworkDemo nodes={exampleDemo} label="Production par trimestre" />
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
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-stacked-box) { max-width: 32rem; }
</style>
