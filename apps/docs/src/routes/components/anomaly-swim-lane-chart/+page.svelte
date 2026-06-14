<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "AnomalySwimLaneChart",
      props: {
        label: locale.value === "fr" ? "Scores d'anomalie" : "Anomaly scores",
        width: 600,
        height: 240,
        max: 100,
        data: [
          {
            job: locale.value === "fr" ? "Connexions" : "Logins",
            buckets: [
              { at: 0, score: 8 },
              { at: 1, score: 22 },
              { at: 2, score: 71 },
              { at: 3, score: 94 },
              { at: 4, score: 35 }
            ]
          },
          {
            job: locale.value === "fr" ? "Paiements" : "Payments",
            buckets: [
              { at: 0, score: 4 },
              { at: 1, score: 12 },
              { at: 2, score: 18 },
              { at: 3, score: 48 },
              { at: 4, score: 88 }
            ]
          },
          {
            job: "API",
            buckets: [
              { at: 0, score: 2 },
              { at: 1, score: 6 },
              { at: 2, score: 9 },
              { at: 3, score: 14 },
              { at: 4, score: 20 }
            ]
          }
        ]
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>AnomalySwimLaneChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Heatmap temps × job (façon Kibana ML « anomaly swim lane »). Une ligne = un <code>job</code> ;
        une colonne = un bucket temporel (trié par <code>at</code>). La couleur encode un
        <code>score</code> CONTINU — pas un statut discret — via un gradient d'intensité : le score
        normalisé 0…<code>max</code> mappe l'échelle continue category1…8. Légende d'échelle
        Low → High sous le graphe.
      {:else}
        Time × job heatmap (Kibana ML anomaly-swim-lane style). One lane = one <code>job</code>; one
        column = a time bucket (sorted by <code>at</code>). Color encodes a CONTINUOUS
        <code>score</code> — not a discrete status — via an intensity gradient: the score normalized
        0…<code>max</code> maps the continuous category1…8 scale. A Low → High scale legend sits
        below the chart.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Trois jobs sur cinq buckets : l'intensité de chaque cellule suit le score d'anomalie, de
        faible (froid) à élevé (chaud).
      {:else}
        Three jobs across five buckets: each cell's intensity tracks the anomaly score, from low
        (cool) to high (hot).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Scores d'anomalie" : "Anomaly scores"}
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
          <td><code>AnomalySwimLaneSeries[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Lignes : { job, buckets[] }." : "Lanes: { job, buckets[] }."}</td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td><code>number</code></td>
          <td>{locale.value === "fr" ? "dérivé" : "derived"}</td>
          <td>{locale.value === "fr" ? "Score max de l'échelle (défaut : max des données)." : "Scale max score (default: data max)."}</td>
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
          <td><code>520</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>300</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Alias de width (largeur du viewBox)." : "Alias of width (viewBox width)."}</td>
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
        ? "AnomalySwimLaneBucket = { at: number; score: number } ; score normalisé 0…max → category1…8"
        : "AnomalySwimLaneBucket = { at: number; score: number } ; score normalized 0…max → category1…8"}
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
          <td>{locale.value === "fr" ? "Couleur des axes." : "Axis color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Échelle continue d'intensité du score." : "Continuous score-intensity scale."}</td>
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
