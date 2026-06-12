<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type ScatterPlotDatum } from "@sentropic/design-system-svelte";
  import type { ChartAnnotation } from "@sentropic/design-system-svelte";
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

  // Combine les capacités « classe Highcharts » : annotations (repère + zone),
  // étiquettes de points, crosshair croisé contrôlé et navigation clavier.
  const annotations: ChartAnnotation[] = [
    { kind: "region", axis: "y", from: 4, to: 6, label: "Cible" },
    { kind: "line", axis: "x", value: 4, label: "Médiane" },
    { kind: "point", x: 6, y: 6.1, label: "Pic" }
  ];

  const exampleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-scatter-box" },
      children: [
        {
          comp: "ScatterPlot",
          props: {
            data,
            label: "Corrélation démo",
            xLabel: "Effort",
            yLabel: "Valeur",
            annotations,
            dataLabels: true,
            hoverKey: "D",
            keyboardNav: true
          }
        }
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


  <section class="docs-section">
    <h2>Exemple</h2>
    <TabbedExample nodes={exampleDemo} title="Corrélation démo" />
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
        <tr><td><code>centroids</code></td><td><code>ScatterPlotCentroid[]</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>annotations</code></td><td><code>ChartAnnotation[]</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>dataLabels</code></td><td><code>boolean | &#123; format?, position? &#125;</code></td><td><code>false</code></td></tr>
        <tr><td><code>hoverKey</code> / <code>onHoverKeyChange</code></td><td><code>string | null</code> / <code>(key) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>keyboardNav</code> / <code>onSelectKey</code></td><td><code>boolean</code> / <code>(key) =&gt; void</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>ScatterPlotDatum</code> = <code>{`{ x, y, label?, tone?, r? }`}</code> —
      <code>r</code> est un rayon par point, borné à 32 (sinon <code>radius</code> global) ;
      <code>tone</code> est le ton par point (ton de cluster), sinon cycle de la palette.
      <code>ScatterPlotCentroid</code> = <code>{`{ x, y, tone?, label? }`}</code> : marqueurs de
      centroïdes (anneau + croix, plus grands que les points) dessinés au-dessus des points,
      intégrés au domaine des axes et annoncés « Centroïde&nbsp;: (x, y) » dans la liste accessible.
    </p>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-scatter-box) { max-width: 32rem; }
</style>
