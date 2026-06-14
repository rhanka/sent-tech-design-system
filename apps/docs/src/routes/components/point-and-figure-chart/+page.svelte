<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Série de prix : montée, repli marqué, reprise — alterne colonnes X et O.
  const series = [] as { date: number; close: number }[];
  let price = 100;
  const moves = [
    4, 6, 3, 8, 5, 7, 9, 4, -6, -12, -8, -6,
    -9, -5, 7, 11, 8, 6, 9, -8, -14, -6, 7, 9
  ];
  for (let i = 0; i < moves.length; i++) {
    price += moves[i];
    series.push({ date: i, close: price });
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-pnf-box" },
      children: [
        {
          comp: "PointAndFigureChart",
          props: {
            label: locale.value === "fr" ? "Cours" : "Price",
            boxSize: 5,
            reversal: 3,
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
      <h1>PointAndFigureChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Point & Figure (façon Highcharts Stock « pointandfigure »). Des colonnes de X (hausse) ou de O
        (baisse) selon le mouvement de prix, calées sur une grille de <code>boxSize</code>. On change
        de colonne quand le prix recule d'au moins <code>reversal</code>×<code>boxSize</code> en sens
        inverse. X = ton success, O = ton error. Axe Y prix gradué, pas d'axe temps régulier. Liste
        accessible des colonnes hors SVG.
      {:else}
        Point & Figure (Highcharts Stock "pointandfigure" style). Columns of X (up) or O (down)
        following the price movement, snapped onto a <code>boxSize</code> grid. The column switches
        when the price reverses by at least <code>reversal</code>×<code>boxSize</code>. X = success
        tone, O = error tone. Graduated price Y axis, no regular time axis. An accessible column list
        outside the SVG.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une série de prix qui alterne hausses et baisses, case de 5 et inversion à 3 : les colonnes de
        X marquent les poussées, les colonnes de O les replis.
      {:else}
        A price series alternating ups and downs, box size 5 and reversal 3: X columns mark the
        pushes, O columns the pullbacks.
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
          <td><code>PointAndFigureChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Série de prix : { date, close }." : "Price series: { date, close }."}</td>
        </tr>
        <tr>
          <td><code>boxSize</code></td>
          <td><code>number</code></td>
          <td>{locale.value === "fr" ? "auto" : "auto"}</td>
          <td>{locale.value === "fr" ? "Taille d'une case (défaut auto ~ (max-min)/20)." : "Box size (default auto ~ (max-min)/20)."}</td>
        </tr>
        <tr>
          <td><code>reversal</code></td>
          <td><code>number</code></td>
          <td><code>3</code></td>
          <td>{locale.value === "fr" ? "Nombre de cases pour inverser de colonne." : "Number of boxes to reverse the column."}</td>
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
        ? "PointAndFigureChartDatum = { date: number; close: number } : les points non finis sont écartés ; le temps régulier est ignoré (grille de boxSize, inversion à reversal cases)."
        : "PointAndFigureChartDatum = { date: number; close: number } : non-finite points are dropped; regular time is ignored (boxSize grid, reversal-box switch)."}
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
          <td>{locale.value === "fr" ? "Glyphe X (colonne haussière)." : "X glyph (rising column)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-error</code></td>
          <td>{locale.value === "fr" ? "Glyphe O (colonne baissière)." : "O glyph (falling column)."}</td>
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
  :global(.docs-pnf-box) {
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
