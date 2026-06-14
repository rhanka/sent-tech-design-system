<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Grille 5×4 : direction qui tourne avec x, magnitude qui croît avec y.
  const field = [] as { x: number; y: number; length: number; direction: number }[];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 5; x++) {
      field.push({
        x,
        y,
        length: 1 + (x + y) * 0.6,
        direction: (x * 45 + y * 20) % 360
      });
    }
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-vector-box" },
      children: [
        {
          comp: "VectorFieldChart",
          props: {
            label: locale.value === "fr" ? "Champ de vent" : "Wind field",
            width: 640,
            height: 320,
            data: field
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
      <h1>VectorFieldChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Champ de vecteurs (façon Highcharts « vector »). Une flèche par point : la <code>length</code>
        (magnitude) pilote la longueur normalisée et la couleur (échelle data category1…8), la
        <code>direction</code> (en degrés, 0° = +X, sens trigonométrique) donne l'orientation. Axes
        X/Y gradués par graduations « jolies » automatiques, et liste accessible des points hors SVG.
      {:else}
        Vector field (Highcharts "vector" style). One arrow per point: <code>length</code> (magnitude)
        drives the normalized length and color (data category1…8 scale), and <code>direction</code>
        (in degrees, 0° = +X, trigonometric) sets the orientation. Graduated X/Y axes with automatic
        "nice" ticks, and an accessible point list outside the SVG.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Grille 5×4 : la direction tourne avec x, la magnitude croît avec x+y — les flèches les plus
        longues passent au ton data le plus chaud.
      {:else}
        5×4 grid: direction rotates with x, magnitude grows with x+y — the longest arrows shift to the
        warmest data tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Champ de vent" : "Wind field"}
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
          <td><code>VectorFieldChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Points : { x, y, length, direction }." : "Points: { x, y, length, direction }."}</td>
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
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>26</code></td>
          <td>{locale.value === "fr" ? "Longueur (px) de la plus grande flèche." : "Length (px) of the largest arrow."}</td>
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
        ? "VectorFieldChartDatum = { x: number; y: number; length: number; direction: number } : direction en degrés (0° = +X, sens trigonométrique) ; les points non finis ou à magnitude négative sont écartés."
        : "VectorFieldChartDatum = { x: number; y: number; length: number; direction: number } : direction in degrees (0° = +X, trigonometric); non-finite or negative-magnitude points are dropped."}
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
          <td>{locale.value === "fr" ? "Couleur des flèches par bin de magnitude." : "Arrow color per magnitude bin."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-secondary</code></td>
          <td>{locale.value === "fr" ? "Graduations des axes." : "Axis tick labels."}</td>
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
  :global(.docs-vector-box) {
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
