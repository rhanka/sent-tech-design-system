<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { timeSeriesDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet } from "@sentropic/design-system-svelte";
  import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Minimal real store (never a mock): continuous time dimension + measure.
  const model: DataModel = {
    dimensions: [{ id: "t", label: "Day", type: "continuous" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model,
    data: [
      { t: 1, revenue: 42 },
      { t: 2, revenue: 65 },
      { t: 3, revenue: 51 },
      { t: 4, revenue: 88 },
      { t: 5, revenue: 73 }
    ]
  });

  const demo = $derived<NodeSpec[]>(
    timeSeriesDemoNodes(store, {
      viewId: "ts",
      time: "t",
      measure: "revenue",
      label: fr ? "Revenu journalier" : "Daily revenue"
    })
  );

  const notes = $derived({
    svelte: fr
      ? "TimeSeriesLineChart n’existe que côté React : aucun adaptateur Svelte."
      : "TimeSeriesLineChart is React-only: no Svelte adapter.",
    vue: fr
      ? "TimeSeriesLineChart n’existe que côté React : aucun adaptateur Vue."
      : "TimeSeriesLineChart is React-only: no Vue adapter.",
    angular: fr
      ? "TimeSeriesLineChart n’existe que côté React : aucun adaptateur Angular."
      : "TimeSeriesLineChart is React-only: no Angular adapter."
  });

  const storeCode = `import { createDashboardStore } from "@sentropic/dataviz-core";
import { TimeSeriesLineChart } from "@sentropic/dataviz-react";

const store = createDashboardStore({
  model: {
    dimensions: [{ id: "t", label: "Day", type: "continuous" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  },
  data: [
    { t: 1, revenue: 42 },
    { t: 2, revenue: 65 },
    { t: 3, revenue: 51 },
    { t: 4, revenue: 88 },
    { t: 5, revenue: 73 }
  ]
});`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Dataviz · piloté par store" : "Dataviz · store-driven"}
    </p>
    <div class="docs-hero-title">
      <h1>TimeSeriesLineChart</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Série temporelle continue dérivée d’un <code>DashboardStore</code> : l’axe du
        temps accepte des horodatages numériques ou des chaînes parsables, avec
        regroupement optionnel par série, légende et bascule de séries. Sans composant
        DS sous-jacent : le tracé est propre à l’adaptateur.
      {:else}
        Continuous time series derived from a <code>DashboardStore</code>: the time axis
        accepts numeric timestamps or parsable strings, with optional series
        grouping, legend, and series toggling. No underlying DS component: the
        rendering is the adapter’s own.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Disponibilité par framework" : "Framework availability"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Framework</th>
          <th>{fr ? "Forme" : "Shape"}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Svelte</code></td>
          <td>{fr ? "Absent : composant React uniquement." : "Missing: React-only component."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Composant TimeSeriesLineChart (démo live ci-dessous)." : "TimeSeriesLineChart component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Absent : composant React uniquement." : "Missing: React-only component."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : composant React uniquement." : "Missing: React-only component."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        Cinq jours de revenu sur un store minimal réel. Seul l’onglet React rend le
        graphique ; les autres onglets l’énoncent au lieu de rester vides.
      {:else}
        Five days of revenue on a real minimal store. Only the React tab renders the
        chart; the other tabs state the absence instead of staying empty.
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Revenu journalier" : "Daily revenue"}
    />
    <h3 class="docs-demo-title">{fr ? "Amorce du store" : "Store bootstrap"}</h3>
    <CodeSnippet
      code={storeCode}
      language="ts"
      copyLabel={fr ? "Copier" : "Copy"}
      copiedLabel={fr ? "Copié" : "Copied"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>store</code></td>
          <td><code>DashboardStore</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>
            {fr
              ? "Store partagé (filtres croisés appliqués pour viewId)."
              : "Shared store (cross-filters applied for viewId)."}
          </td>
        </tr>
        <tr>
          <td><code>viewId</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "Identifiant de vue (cross-filter)." : "View id (cross-filter)."}</td>
        </tr>
        <tr>
          <td><code>time</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>
            {fr
              ? "Dimension temporelle (nombres ou chaînes parsables en dates)."
              : "Time dimension (numbers or date-parsable strings)."}
          </td>
        </tr>
        <tr>
          <td><code>measure</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "Mesure agrégée par pas de temps." : "Measure aggregated per time step."}</td>
        </tr>
        <tr>
          <td><code>series</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Dimension de regroupement en séries multiples."
              : "Grouping dimension for multiple series."}
          </td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
        </tr>
        <tr>
          <td><code>legend</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{fr ? "Affiche la légende des séries." : "Shows the series legend."}</td>
        </tr>
        <tr>
          <td><code>tone</code></td>
          <td><code>TimeSeriesLineChartTone</code></td>
          <td><code>"category1"</code></td>
          <td>
            {fr
              ? "Gamme sémantique (category1 à category8)."
              : "Semantic tone (category1 to category8)."}
          </td>
        </tr>
        <tr>
          <td><code>width</code> / <code>height</code></td>
          <td><code>number</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Dimensions du tracé." : "Plot dimensions."}</td>
        </tr>
        <tr>
          <td><code>hiddenSeries</code> / <code>onToggleSeries</code></td>
          <td><code>string[] / (id: string) =&gt; void</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Séries masquées et rappel de bascule (contrôle externe)."
              : "Hidden series and toggle callback (external control)."}
          </td>
        </tr>
        <tr>
          <td><code>formatTime</code> / <code>formatValue</code></td>
          <td><code>(value, context) =&gt; string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Formatteurs d’axe et de valeurs." : "Axis and value formatters."}</td>
        </tr>
        <tr>
          <td><code>className</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Classe transmise au conteneur." : "Class forwarded to the container."}</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>
