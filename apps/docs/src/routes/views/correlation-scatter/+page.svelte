<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const AREA_DATA = [
    { x: "Jan", y: 42 }, { x: "Fév", y: 58 }, { x: "Mar", y: 51 },
    { x: "Avr", y: 67 }, { x: "Mai", y: 74 }, { x: "Juin", y: 82 }
  ];

  const OUTLIER_ROWS = [
    { id: "1", label: "Dassault Systèmes", x: "3 900", y: "5.8", ecart: "+2.4σ" },
    { id: "2", label: "Société Générale", x: "3 200", y: "1.1", ecart: "−2.1σ" }
  ];

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "cs-shell" },
      children: [
        // Barre de contrôles
        {
          el: "div",
          props: { class: "cs-toolbar" },
          children: [
            { comp: "Select", props: { label: fr ? "Axe X" : "X axis", value: "adspend", options: [
              { value: "adspend", label: fr ? "Dépenses pub (k€)" : "Ad spend (k€)" },
              { value: "revenue", label: fr ? "Revenu (k€)" : "Revenue (k€)" },
              { value: "sessions", label: fr ? "Sessions web" : "Web sessions" }
            ] } },
            { comp: "Select", props: { label: fr ? "Axe Y" : "Y axis", value: "convrate", options: [
              { value: "convrate", label: fr ? "Taux conv. (%)" : "Conv. rate (%)" },
              { value: "retention", label: fr ? "Rétention (%)" : "Retention (%)" },
              { value: "cac", label: "CAC (€)" }
            ] } },
            { comp: "Combobox", props: { label: fr ? "Couleur" : "Color", value: "sector", placeholder: fr ? "Choisir…" : "Choose…", options: [
              { value: "sector", label: fr ? "Secteur" : "Sector" },
              { value: "region", label: fr ? "Région" : "Region" },
              { value: "tier", label: fr ? "Segment" : "Tier" }
            ] } },
            { comp: "DatePicker", props: { label: fr ? "Plage" : "Date range", value: "2026-01-01", max: "2026-06-30" } }
          ]
        },
        // Cartes de score de corrélation
        {
          el: "div",
          props: { class: "cs-scorecards" },
          children: [
            { comp: "Card", props: { variant: "outlined" }, children: [
              { comp: "KpiCard", props: { label: fr ? "Pearson r" : "Pearson r", value: 0.74, format: "decimal", delta: 0.06, deltaFormat: "absolute", tone: "category1" } }
            ] },
            { comp: "Card", props: { variant: "outlined" }, children: [
              { comp: "KpiCard", props: { label: "R²", value: 0.55, format: "decimal", delta: 0.04, deltaFormat: "absolute", tone: "category2" } }
            ] },
            { comp: "Card", props: { variant: "outlined" }, children: [
              { comp: "KpiCard", props: { label: fr ? "Points aberrants" : "Outliers", value: 2, format: "integer", delta: -1, deltaFormat: "absolute", tone: "category3" } }
            ] },
            { comp: "Card", props: { variant: "outlined" }, children: [
              { comp: "KpiCard", props: { label: fr ? "Observations" : "Data points", value: 10, format: "integer", tone: "category3" } }
            ] }
          ]
        },
        // Graphique de tendance
        { comp: "AreaChart", props: {
          title: fr ? "Évolution corrélation (6 mois)" : "Correlation trend (6 months)",
          data: AREA_DATA, xKey: "x", yKey: "y", tone: "category1", height: 200
        } },
        // Table des points aberrants
        {
          el: "div",
          props: { class: "cs-outliers" },
          children: [
            {
              el: "div",
              props: { class: "cs-outliers-header" },
              children: [
                { el: "h3", props: { class: "cs-outliers-title" }, children: [fr ? "Points aberrants (±2σ)" : "Outliers (±2σ)"] },
                { comp: "Badge", props: { tone: "warning" }, children: ["2"] }
              ]
            },
            { comp: "Table", props: {
              caption: fr ? "Entreprises hors plage normale" : "Companies outside normal range",
              columns: [
                { key: "label", label: fr ? "Entreprise" : "Company", sortable: true },
                { key: "x", label: fr ? "Dép. pub (k€)" : "Ad spend (k€)", sortable: true, align: "end" },
                { key: "y", label: fr ? "Conv. (%)" : "Conv. (%)", sortable: true, align: "end" },
                { key: "ecart", label: "σ", sortable: true, align: "end" }
              ],
              rows: OUTLIER_ROWS,
              size: "sm"
            } }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "AreaChart", slug: "area-chart" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Combobox", slug: "combobox" },
    { name: "Select", slug: "select" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "Table", slug: "table" },
    { name: "Badge", slug: "badge" },
    { name: "Card", slug: "card" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Analytics / BI" : "Analytics / BI"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Analyse de corrélation" : "Correlation Analysis"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Exploration de la relation entre deux métriques via un nuage de points (scatter), avec sélecteurs d'axes X et Y, dimension de couleur et plage de dates. Cartes de score de corrélation, filtres avancés et table des points aberrants. Pour repérer les liens entre indicateurs."
        : "Exploration of the relationship between two metrics via a scatter plot, with X and Y axis selectors, a color dimension and a date range. Correlation score cards, advanced filters and an outliers table. For spotting links between indicators."}
    </p>
  </section>

  <TabbedExample
    nodes={nodes}
    title={fr ? "Analyse de corrélation (données mock)" : "Correlation Analysis (mock data)"}
  />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="cs-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  :global(.cs-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
  }
  :global(.cs-toolbar) { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
  :global(.cs-scorecards) { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
  :global(.cs-outliers) { display: flex; flex-direction: column; gap: 0.5rem; }
  :global(.cs-outliers-header) { display: flex; align-items: center; gap: 0.5rem; }
  :global(.cs-outliers-title) { margin: 0; font-size: 1rem; font-weight: 600; color: var(--st-semantic-text-primary, #0f172a); }
  .cs-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
</style>
