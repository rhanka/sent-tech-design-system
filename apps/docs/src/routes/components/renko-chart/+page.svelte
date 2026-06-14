<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Série de prix : une marche aléatoire haussière puis baissière (24 points).
  const series = [] as { date: number; close: number }[];
  let price = 100;
  const moves = [
    4, 6, 3, 8, 5, -2, 7, 9, 4, 6, 3, 5,
    -4, -7, -3, -6, -2, -5, 4, -8, -3, 6, 2, -5
  ];
  for (let i = 0; i < moves.length; i++) {
    price += moves[i];
    series.push({ date: i, close: price });
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-renko-box" },
      children: [
        {
          comp: "RenkoChart",
          props: {
            label: locale.value === "fr" ? "Cours" : "Price",
            boxSize: 5,
            width: 640,
            height: 320,
            data: series
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
      <h1>RenkoChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Briques Renko (façon Highcharts Stock « renko »). À partir d'une série de prix, on empile des
        briques d'une taille fixe <code>boxSize</code> en ignorant le temps régulier : une brique
        n'apparaît qu'au franchissement de <code>boxSize</code>. Brique haussière = +boxSize
        au-dessus, brique baissière = -boxSize ; l'inversion exige 2×boxSize. Vert (hausse) / rouge
        (baisse) via les tons sémantiques. Axe Y prix gradué, pas d'axe temps régulier. Liste
        accessible des briques hors SVG.
      {:else}
        Renko bricks (Highcharts Stock "renko" style). From a price series, fixed-size
        <code>boxSize</code> bricks are stacked while ignoring regular time: a brick appears only when
        <code>boxSize</code> is crossed. Up brick = +boxSize above, down brick = -boxSize; a reversal
        requires 2×boxSize. Green (up) / red (down) via semantic tones. Graduated price Y axis, no
        regular time axis. An accessible brick list outside the SVG.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une série de prix qui monte puis redescend, brique de 5 : les colonnes vertes empilent la
        hausse, les rouges la baisse — le temps régulier est ignoré.
      {:else}
        A price series that rises then falls, box size 5: green columns stack the rise, red ones the
        fall — regular time is ignored.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Cours" : "Price"}
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
          <td><code>RenkoChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Série de prix : { date, close }." : "Price series: { date, close }."}</td>
        </tr>
        <tr>
          <td><code>boxSize</code></td>
          <td><code>number</code></td>
          <td>{locale.value === "fr" ? "auto" : "auto"}</td>
          <td>{locale.value === "fr" ? "Taille d'une brique (défaut auto ~ (max-min)/20)." : "Brick size (default auto ~ (max-min)/20)."}</td>
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
        ? "RenkoChartDatum = { date: number; close: number } : les points non finis sont écartés ; le temps régulier est ignoré (une brique par franchissement de boxSize)."
        : "RenkoChartDatum = { date: number; close: number } : non-finite points are dropped; regular time is ignored (one brick per boxSize crossing)."}
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
          <td><code>--st-semantic-feedback-success</code></td>
          <td>{locale.value === "fr" ? "Brique haussière." : "Up brick."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-error</code></td>
          <td>{locale.value === "fr" ? "Brique baissière." : "Down brick."}</td>
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
  :global(.docs-renko-box) {
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
