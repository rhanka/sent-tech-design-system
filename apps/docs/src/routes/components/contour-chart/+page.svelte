<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Grille 12×8 : relief radial — la valeur décroît avec la distance au centre.
  const grid = [] as { x: number; y: number; value: number }[];
  const cols = 12;
  const rows = 8;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - (cols - 1) / 2;
      const dy = y - (rows - 1) / 2;
      const value = Math.round(100 - Math.sqrt(dx * dx + dy * dy) * 12);
      grid.push({ x, y, value });
    }
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-contour-box" },
      children: [
        {
          comp: "ContourChart",
          props: {
            label: locale.value === "fr" ? "Relief" : "Relief",
            levels: 6,
            width: 640,
            height: 320,
            data: grid
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>ContourChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Contour topographique (façon Highcharts « contour »). Chaque cellule d'une grille 2D
        régulière est peinte d'une bande de couleur selon sa <code>value</code> normalisée, découpée
        en <code>levels</code> paliers sur l'échelle data category1…8. Axes X/Y gradués par
        graduations « jolies » automatiques, légende des paliers et liste accessible des points hors
        SVG.
      {:else}
        Topographic contour (Highcharts "contour" style). Each cell of a regular 2D grid is painted
        with a colour band based on its normalized <code>value</code>, split into <code>levels</code>
        steps on the data category1…8 scale. Graduated X/Y axes with automatic "nice" ticks, a level
        legend and an accessible point list outside the SVG.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Grille 12×8 : un relief radial dont la valeur décroît avec la distance au centre — les paliers
        les plus hauts passent au ton data le plus chaud.
      {:else}
        12×8 grid: a radial relief whose value decreases with distance from the center — the highest
        levels shift to the warmest data tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Relief" : "Relief"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{locale.value === "fr" ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>data</code></td>
          <td><code>ContourChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Points de grille : { x, y, value }." : "Grid points: { x, y, value }."}</td>
        </tr>
        <tr>
          <td><code>levels</code></td>
          <td><code>number</code></td>
          <td><code>6</code></td>
          <td>{locale.value === "fr" ? "Nombre de paliers de couleur (plafonné à 8)." : "Number of colour levels (capped at 8)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible du graphe." : "Accessible chart label."}</td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>640</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>320</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "ContourChartDatum = { x: number; y: number; value: number } : grille régulière supposée ; les points non finis sont écartés."
        : "ContourChartDatum = { x: number; y: number; value: number } : a regular grid is assumed; non-finite points are dropped."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Couleur des axes et de la grille." : "Axis and gridline color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleur des bandes par palier de valeur." : "Band color per value level."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-secondary</code></td>
          <td>{locale.value === "fr" ? "Graduations des axes et légende." : "Axis ticks and legend."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-inverse</code></td>
          <td>{locale.value === "fr" ? "Fond de l'infobulle au survol." : "Hover tooltip background."}</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-contour-box) {
    max-width: 40rem;
  }

  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }
</style>
