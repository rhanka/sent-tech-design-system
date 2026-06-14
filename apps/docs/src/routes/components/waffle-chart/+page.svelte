<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "waffle-demo-row" },
      children: [
        {
          comp: "WaffleChart",
          props: {
            label: locale.value === "fr" ? "Parts de marché" : "Market share",
            size: 200,
            data: [
              { label: "Chrome", value: 65 },
              { label: "Safari", value: 20 },
              { label: "Firefox", value: 15 }
            ]
          }
        },
        {
          comp: "WaffleChart",
          props: {
            label: locale.value === "fr" ? "Statut des tâches" : "Task status",
            size: 200,
            data: [
              { label: locale.value === "fr" ? "Réussi" : "Passed", value: 78, tone: "success" },
              { label: locale.value === "fr" ? "En cours" : "In progress", value: 14, tone: "warning" },
              { label: locale.value === "fr" ? "Échoué" : "Failed", value: 8, tone: "error" }
            ]
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
      <h1>WaffleChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Grille N×M de cellules (façon « waffle ») : la proportion de cellules colorées encode la
        part de chaque catégorie. Chaque catégorie occupe <code>round(value / total × totalCells)</code>
        cellules consécutives, teintée par <code>tone</code> (ou category1…8 par index). Les cellules
        restantes forment une piste neutre. Légende des catégories sous le graphe.
      {:else}
        N×M cell grid (waffle style): the share of colored cells encodes each category's proportion.
        Each category occupies <code>round(value / total × totalCells)</code> consecutive cells,
        tinted by <code>tone</code> (or category1…8 by index). The remaining cells form a neutral
        track. A category legend sits below the chart.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Deux grilles 10×10 : parts de marché (tons dérivés) et statut des tâches teinté par ton
        sémantique.
      {:else}
        Two 10×10 grids: market share (derived tones) and task status tinted by semantic tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Grilles de proportion" : "Proportion grids"}
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
          <td><code>WaffleChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Catégories : { label, value, tone? }." : "Categories: { label, value, tone? }."}</td>
        </tr>
        <tr>
          <td><code>totalCells</code></td>
          <td><code>number</code></td>
          <td><code>100</code></td>
          <td>{locale.value === "fr" ? "Nombre total de cellules de la grille." : "Total number of cells in the grid."}</td>
        </tr>
        <tr>
          <td><code>columns</code></td>
          <td><code>number</code></td>
          <td><code>10</code></td>
          <td>{locale.value === "fr" ? "Nombre de colonnes de la grille." : "Number of grid columns."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible du graphe." : "Accessible chart label."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>240</code></td>
          <td>{locale.value === "fr" ? "Côté du SVG en pixels." : "SVG side in pixels."}</td>
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
        ? "WaffleChartDatum = { label: string; value: number; tone?: WaffleTone } : tone ∈ neutral | info | success | warning | error | category1…8"
        : "WaffleChartDatum = { label: string; value: number; tone?: WaffleTone } : tone ∈ neutral | info | success | warning | error | category1…8"}
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
          <td><code>--st-semantic-surface-subtle</code></td>
          <td>{locale.value === "fr" ? "Couleur de la piste neutre (cellules restantes)." : "Neutral track color (remaining cells)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs des cellules à ton sémantique." : "Semantic-tone cell colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleurs des catégories dérivées (sans tone)." : "Derived category colors (no explicit tone)."}</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
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

  :global(.waffle-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-6, 1.5rem);
    align-items: flex-start;
    margin-top: 0.75rem;
  }
</style>
