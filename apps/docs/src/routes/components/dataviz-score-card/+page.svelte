<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { scoreCardStoreDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet, Link } from "@sentropic/design-system-svelte";
  import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Minimal real store (never a mock): monthly revenue aggregated by the card.
  const model: DataModel = {
    dimensions: [{ id: "month", label: "Month", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model,
    data: [
      { month: "Jan", revenue: 120 },
      { month: "Feb", revenue: 150 },
      { month: "Mar", revenue: 210 }
    ]
  });

  const demo = $derived<NodeSpec[]>(
    scoreCardStoreDemoNodes(store, {
      viewId: "sc",
      measure: "revenue",
      label: fr ? "Revenu trimestriel" : "Quarterly revenue"
    })
  );

  const notes = $derived({
    angular: fr
      ? "Aucun adaptateur ScoreCard côté Angular."
      : "No ScoreCard adapter in Angular."
  });

  const storeCode = `import { createDashboardStore } from "@sentropic/dataviz-core";
import { ScoreCard } from "@sentropic/dataviz-svelte";

const store = createDashboardStore({
  model: {
    dimensions: [{ id: "month", label: "Month", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  },
  data: [
    { month: "Jan", revenue: 120 },
    { month: "Feb", revenue: 150 },
    { month: "Mar", revenue: 210 }
  ]
});`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "datavizKicker")}</p>
    <div class="docs-hero-title">
      <h1>ScoreCard</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Carte d’indicateur dérivée d’un <code>DashboardStore</code> : la mesure est
        agrégée sur les lignes filtrées, avec objectif, étincelle et delta optionnels.
        Ce n’est pas le <code>ScoreCard</code> natif (carte de notation) : l’adaptateur
        compose <code>KpiCard</code>.
      {:else}
        Indicator card derived from a <code>DashboardStore</code>: the measure is
        aggregated over the filtered rows, with optional goal, sparkline, and delta.
        This is not the native <code>ScoreCard</code> (rating card): the adapter
        composes <code>KpiCard</code>.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "datavizCoverageTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Framework</th>
          <th>{t(locale.value, "datavizFrameworkShape")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Svelte</code></td>
          <td>{fr ? "Composant ScoreCard (démo live ci-dessous)." : "ScoreCard component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Composant ScoreCard (démo live ci-dessous, className au lieu de class)." : "ScoreCard component (live demo below, className instead of class)."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Composant ScoreCard (démo live ci-dessous)." : "ScoreCard component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : aucun adaptateur." : "Missing: no adapter."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        Trois mois de revenu agrégés en une carte. Pour la carte de notation
        (étoiles, score sur cinq), voir la page native.
      {:else}
        Three months of revenue aggregated into one card. For the rating card
        (stars, score out of five), see the native page.
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Revenu trimestriel" : "Quarterly revenue"}
    />
    <p>
      <Link href="/components/score-card">
        {fr ? "ScoreCard natif (notation)" : "Native ScoreCard (rating)"}
      </Link>
      {" · "}
      <Link href="/components/kpi-card">
        {fr ? "KpiCard (rendu sous-jacent)" : "KpiCard (underlying render)"}
      </Link>
    </p>
    <h3 class="docs-demo-title">{t(locale.value, "datavizBootstrapTitle")}</h3>
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
          <td><code>measure</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "Mesure agrégée en valeur principale." : "Measure aggregated as the headline value."}</td>
        </tr>
        <tr>
          <td><code>viewId</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Identifiant de vue (cross-filter)." : "View id (cross-filter)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>{fr ? "libellé de la mesure" : "measure label"}</td>
          <td>{fr ? "Libellé affiché de la carte." : "Displayed card label."}</td>
        </tr>
        <tr>
          <td><code>goal</code></td>
          <td><code>number</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Objectif : active l’affichage de progression quand défini."
              : "Goal: enables the progress display when set."}
          </td>
        </tr>
        <tr>
          <td><code>sparklineDimension</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Dimension alimentant l’étincelle inline (ex. month)."
              : "Dimension feeding the inline sparkline (e.g. month)."}
          </td>
        </tr>
        <tr>
          <td><code>comparisonData</code></td>
          <td><code>Row[]</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Lignes de période précédente pour le calcul du delta."
              : "Previous-period rows for delta computation."}
          </td>
        </tr>
        <tr>
          <td><code>format</code> / <code>deltaFormat</code></td>
          <td><code>KpiCardFormat / KpiCardDeltaFormat</code></td>
          <td><code>"percent"</code> {fr ? "pour deltaFormat" : "for deltaFormat"}</td>
          <td>{fr ? "Formats de valeur et de delta (KpiCard)." : "Value and delta formats (KpiCard)."}</td>
        </tr>
        <tr>
          <td><code>unit</code> / <code>currency</code> / <code>locale</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Habillage de la valeur (KpiCard)." : "Value dressing (KpiCard)."}</td>
        </tr>
        <tr>
          <td><code>size</code> / <code>tone</code></td>
          <td><code>KpiCardSize / KpiCardTone</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Taille et tonalité (KpiCard)." : "Size and tone (KpiCard)."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Classe transmise à KpiCard (className côté React)."
              : "Class forwarded to KpiCard (className in React)."}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if fr}
        Faux ami assumé : l’homonyme natif <code>ScoreCard</code> (title, score, stars,
        max, unit, type) est une carte de notation sans store ; cette page documente
        l’adaptateur dataviz, qui rend <code>KpiCard</code>. Tokens : ceux de
        <code>KpiCard</code>.
      {:else}
        Deliberate false friend: the native namesake <code>ScoreCard</code> (title,
        score, stars, max, unit, type) is a store-free rating card; this page
        documents the dataviz adapter, which renders <code>KpiCard</code>. Tokens:
        <code>KpiCard</code>’s.
      {/if}
    </p>
  </section>
</div>
