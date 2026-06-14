<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "StateTimelineChart",
      props: {
        label: locale.value === "fr" ? "Disponibilité des services" : "Service availability",
        width: 640,
        height: 220,
        data: [
          {
            series: "API",
            segments: [
              { start: 0, end: 6, state: "OK", tone: "success" },
              { start: 6, end: 9, state: locale.value === "fr" ? "Dégradé" : "Degraded", tone: "warning" },
              { start: 9, end: 24, state: "OK", tone: "success" }
            ]
          },
          {
            series: "Base de données",
            segments: [
              { start: 0, end: 14, state: "OK", tone: "success" },
              { start: 14, end: 17, state: locale.value === "fr" ? "Panne" : "Down", tone: "error" },
              { start: 17, end: 24, state: "OK", tone: "success" }
            ]
          },
          {
            series: "CDN",
            segments: [
              { start: 0, end: 24, state: "OK", tone: "success" }
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
      <h1>StateTimelineChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Bandes d'états discrets dans le temps (façon « state timeline »). Chaque ligne
        (<code>series</code>) est une séquence de segments contigus qui pavent l'axe temporel ; la
        couleur encode l'état. Les segments fournissent un <code>tone</code> explicite, sinon une
        teinte stable est dérivée par état (cycle sur category1…8). Légende des états sous le graphe.
      {:else}
        Discrete state bands over time (state-timeline style). Each lane (<code>series</code>) is a
        sequence of contiguous segments paving the time axis; color encodes the state. Segments may
        provide an explicit <code>tone</code>, otherwise a stable hue is derived per state (cycling
        over category1…8). A state legend sits below the chart.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Disponibilité de trois services sur 24 heures : segments OK / dégradé / panne colorés par
        ton sémantique.
      {:else}
        Availability of three services over 24 hours: OK / degraded / down segments colored by
        semantic tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Chronologie d'états" : "State timeline"}
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
          <td><code>StateTimelineSeries[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Lignes : { series, segments[] }." : "Lanes: { series, segments[] }."}</td>
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
        ? "StateTimelineSegment = { start: number; end: number; state: string | number; tone?: StateTimelineTone } : tone ∈ neutral | info | success | warning | error | category1…8"
        : "StateTimelineSegment = { start: number; end: number; state: string | number; tone?: StateTimelineTone } : tone ∈ neutral | info | success | warning | error | category1…8"}
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
          <td><code>--st-semantic-feedback-success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs des segments à ton sémantique." : "Semantic-tone segment colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleurs des états dérivés (sans tone)." : "Derived state colors (no explicit tone)."}</td>
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
