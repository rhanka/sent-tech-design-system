<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "StatusHistoryChart",
      props: {
        label: locale.value === "fr" ? "Historique des statuts" : "Status history",
        width: 640,
        height: 220,
        data: [
          {
            series: "API",
            buckets: [
              { at: 0, value: "OK", tone: "success" },
              { at: 1, value: "OK", tone: "success" },
              { at: 2, value: locale.value === "fr" ? "Dégradé" : "Degraded", tone: "warning" },
              { at: 3, value: "OK", tone: "success" }
            ]
          },
          {
            series: locale.value === "fr" ? "Base de données" : "Database",
            buckets: [
              { at: 0, value: "OK", tone: "success" },
              { at: 1, value: locale.value === "fr" ? "Panne" : "Down", tone: "error" },
              { at: 2, value: "OK", tone: "success" },
              { at: 3, value: "OK", tone: "success" }
            ]
          },
          {
            series: "CDN",
            buckets: [
              { at: 0, value: "OK", tone: "success" },
              { at: 1, value: "OK", tone: "success" },
              { at: 2, value: "OK", tone: "success" },
              { at: 3, value: "OK", tone: "success" }
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
      <h1>StatusHistoryChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Grille temps × entité (façon « status history »). Chaque ligne (<code>series</code>) aligne
        ses <code>buckets</code> temporels en cellules, et la couleur encode un <code>value</code>
        de statut DISCRET — pas un dégradé continu. Les buckets fournissent un <code>tone</code>
        explicite, sinon une teinte stable est dérivée par statut (cycle sur category1…8). Légende
        des statuts sous le graphe.
      {:else}
        Time × entity grid (status-history style). Each lane (<code>series</code>) aligns its time
        <code>buckets</code> as cells, and color encodes a DISCRETE status <code>value</code> — not a
        continuous gradient. Buckets may provide an explicit <code>tone</code>, otherwise a stable
        hue is derived per status (cycling over category1…8). A status legend sits below the chart.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Historique de trois services sur quatre buckets : cellules de statut OK / dégradé / panne
        colorées par ton sémantique.
      {:else}
        History of three services across four buckets: OK / degraded / down status cells colored by
        semantic tone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Historique des statuts" : "Status history"}
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
          <td><code>StatusHistorySeries[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Lignes : { series, buckets[] }." : "Lanes: { series, buckets[] }."}</td>
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
        ? "StatusHistoryBucket = { at: number; value: string | number; tone?: StatusHistoryTone } : tone ∈ neutral | info | success | warning | error | category1…8"
        : "StatusHistoryBucket = { at: number; value: string | number; tone?: StatusHistoryTone } : tone ∈ neutral | info | success | warning | error | category1…8"}
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
          <td><code>--st-semantic-feedback-success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs des cellules à ton sémantique." : "Semantic-tone cell colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleurs des statuts dérivés (sans tone)." : "Derived status colors (no explicit tone)."}</td>
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
