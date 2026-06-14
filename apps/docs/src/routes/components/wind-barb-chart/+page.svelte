<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const base = Date.UTC(2026, 5, 14, 6, 0, 0);

  // 8 relevés horaires : la vitesse monte puis redescend, la direction tourne.
  const series = [] as { at: number; speed: number; direction: number }[];
  const speeds = [5, 12, 20, 35, 55, 40, 25, 10];
  for (let i = 0; i < speeds.length; i++) {
    series.push({
      at: base + i * 3_600_000,
      speed: speeds[i],
      direction: (i * 35) % 360
    });
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-windbarb-box" },
      children: [
        {
          comp: "WindBarbChart",
          props: {
            label: locale.value === "fr" ? "Profil de vent" : "Wind profile",
            width: 640,
            height: 160,
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
      <h1>WindBarbChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Barbes de vent (façon Highcharts « windbarb »). Une barbe par point le long d'un axe
        temporel : la hampe est orientée selon <code>direction</code> (en degrés, 0° = Nord) et les
        barbules encodent <code>speed</code> (en nœuds) par paliers météo standard — demi-barbule
        = 5 kt, barbule pleine = 10 kt, fanion = 50 kt. La couleur encode la vitesse (échelle data
        category1…8). Liste accessible des points hors SVG.
      {:else}
        Wind barbs (Highcharts "windbarb" style). One barb per point along a time axis: the shaft is
        oriented by <code>direction</code> (in degrees, 0° = North) and the feathers encode
        <code>speed</code> (in knots) by standard meteorological steps — half feather = 5 kt, full
        feather = 10 kt, pennant = 50 kt. Colour encodes the speed (data category1…8 scale). An
        accessible point list outside the SVG.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        8 relevés horaires : la vitesse monte jusqu'à un pic (fanion) puis redescend, la direction
        tourne — les barbes les plus rapides passent au ton data le plus chaud.
      {:else}
        8 hourly readings: speed rises to a peak (pennant) then falls, direction rotates — the fastest
        barbs shift to the warmest data tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Profil de vent" : "Wind profile"}
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
          <td><code>WindBarbChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Points : { at, speed, direction }." : "Points: { at, speed, direction }."}</td>
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
          <td><code>160</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>32</code></td>
          <td>{locale.value === "fr" ? "Longueur (px) de la hampe d'une barbe." : "Length (px) of a barb shaft."}</td>
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
        ? "WindBarbChartDatum = { at: number; speed: number; direction: number } : speed en nœuds, direction en degrés (0° = Nord) ; les points non finis ou à vitesse négative sont écartés."
        : "WindBarbChartDatum = { at: number; speed: number; direction: number } : speed in knots, direction in degrees (0° = North); non-finite or negative-speed points are dropped."}
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
          <td>{locale.value === "fr" ? "Couleur de l'axe temporel." : "Time axis color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleur des barbes par bin de vitesse." : "Barb color per speed bin."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-secondary</code></td>
          <td>{locale.value === "fr" ? "Graduations de l'axe." : "Axis tick labels."}</td>
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
  :global(.docs-windbarb-box) {
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
