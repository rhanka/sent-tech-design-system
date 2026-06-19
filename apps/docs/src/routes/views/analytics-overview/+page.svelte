<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const AREA_DATA = [
    { x: "Jan", y: 152000 }, { x: fr ? "Fév" : "Feb", y: 165000 },
    { x: "Mar", y: 178000 }, { x: fr ? "Avr" : "Apr", y: 192000 },
    { x: fr ? "Mai" : "May", y: 204000 }, { x: fr ? "Juin" : "Jun", y: 218600 }
  ];

  const PIE_DATA = [
    { label: fr ? "Organique" : "Organic", value: 44, tone: "category1" as const },
    { label: fr ? "Publicité" : "Paid Ads", value: 29, tone: "category2" as const },
    { label: fr ? "Référencement" : "Referral", value: 16, tone: "category3" as const },
    { label: "Direct", value: 11, tone: "category4" as const }
  ];

  const TABLE_ROWS = [
    { id: "1", segment: fr ? "Entreprise" : "Enterprise", sessions: "31 204", revenue: "98 400 €", conversion: "4,8 %" },
    { id: "2", segment: fr ? "PME" : "SMB", sessions: "27 650", revenue: "67 200 €", conversion: "3,6 %" },
    { id: "3", segment: "Startup", sessions: "14 310", revenue: "31 000 €", conversion: "3,1 %" },
    { id: "4", segment: fr ? "Particulier" : "Consumer", sessions: "9 870", revenue: "14 800 €", conversion: "2,2 %" },
    { id: "5", segment: fr ? "Secteur public" : "Public Sector", sessions: "1 286", revenue: "7 200 €", conversion: "1,9 %" }
  ];

  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" }, { name: "AreaChart", slug: "area-chart" },
    { name: "PieChart", slug: "pie-chart" }, { name: "Table", slug: "table" },
    { name: "DatePicker", slug: "date-picker" }, { name: "Select", slug: "select" },
    { name: "Badge", slug: "badge" }, { name: "Button", slug: "button" }
  ];

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div", props: { class: "ao-layout" },
      children: [
        {
          el: "div", props: { class: "ao-filters" },
          children: [
            { comp: "DatePicker", props: { label: fr ? "Période" : "Period", value: "2026-01-01/2026-06-30" } },
            { comp: "Select", props: { label: fr ? "Segment" : "Segment", value: "all",
                options: [{ value: "all", label: fr ? "Tous" : "All" }, { value: "enterprise", label: fr ? "Entreprise" : "Enterprise" }, { value: "smb", label: "SMB" }] } },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Appliquer" : "Apply"] }
          ]
        },
        {
          el: "div", props: { class: "ao-kpi-row" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Sessions actives" : "Active Sessions", value: 84320, delta: 0.123, deltaFormat: "percent", tone: "category1", sparkline: [54000, 61000, 68000, 72000, 79000, 84320] } },
            { comp: "KpiCard", props: { label: fr ? "Taux de conversion" : "Conversion Rate", value: 0.034, format: "percent", delta: 0.004, deltaFormat: "percent", tone: "category2", sparkline: [0.024, 0.026, 0.028, 0.031, 0.033, 0.034] } },
            { comp: "KpiCard", props: { label: fr ? "Revenu (€)" : "Revenue (€)", value: 218600, delta: 14300, deltaFormat: "absolute", tone: "category3", sparkline: [152000, 165000, 178000, 192000, 204000, 218600] } },
            { comp: "KpiCard", props: { label: fr ? "Désabonnement" : "Churn Rate", value: 0.021, format: "percent", delta: -0.003, deltaFormat: "percent", tone: "category4" } }
          ]
        },
        {
          el: "div", props: { class: "ao-charts-row" },
          children: [
            { el: "div", props: { class: "ao-chart-main" },
              children: [{ comp: "AreaChart", props: { label: fr ? "Revenu mensuel — tendance" : "Monthly Revenue — trend", data: AREA_DATA, tone: "category3", height: 220 } }] },
            { el: "div", props: { class: "ao-chart-side" },
              children: [{ comp: "PieChart", props: { label: fr ? "Sources de trafic" : "Traffic Sources", data: PIE_DATA, height: 220 } }] }
          ]
        },
        {
          el: "div", props: { class: "ao-table-section" },
          children: [
            { el: "div", props: { class: "ao-table-header" }, children: [
                { el: "h3", props: { class: "ao-section-title" }, children: [fr ? "Top 5 segments — Juin 2026" : "Top 5 Segments — June 2026"] },
                { comp: "Badge", props: { tone: "info" }, children: [fr ? "Classé par revenu" : "Ranked by revenue"] }
            ]},
            { comp: "Table", props: {
                columns: [
                  { key: "segment", label: fr ? "Segment" : "Segment" },
                  { key: "sessions", label: "Sessions", align: "end" },
                  { key: "revenue", label: fr ? "Revenu" : "Revenue", align: "end" },
                  { key: "conversion", label: fr ? "Conversion" : "Conversion", align: "end" }
                ],
                rows: TABLE_ROWS, size: "sm"
            }}
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Analytics / BI" : "View · Analytics / BI"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Vue d'ensemble analytique" : "Analytics Overview"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Tableau de bord exécutif : bandeau de cartes KPI avec variation, courbes de tendance sur l'aire, répartition en camembert et table top-N classée. Filtres de période et de segment en tête. Pour le suivi quotidien des indicateurs business."
        : "Executive dashboard: a band of KPI cards with deltas, area trend charts, a pie breakdown and a ranked top-N table. Period and segment filters in the header. For daily tracking of business indicators."}
    </p>
  </section>

  <TabbedExample nodes={nodes} title={fr ? "Vue d'ensemble analytique" : "Analytics Overview"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ao-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>API</h2>
    <table class="docs-api-table">
      <thead>
        <tr>
          <th>{fr ? "Composant" : "Component"}</th>
          <th>{fr ? "Prop clé" : "Key prop"}</th>
          <th>{fr ? "Type" : "Type"}</th>
          <th>{fr ? "Description" : "Description"}</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>KpiCard</td><td>delta</td><td>number</td><td>{fr ? "Variation absolue ou relative" : "Absolute or relative delta"}</td></tr>
        <tr><td>KpiCard</td><td>sparkline</td><td>number[]</td><td>{fr ? "Points du mini-graphe" : "Sparkline data points"}</td></tr>
        <tr><td>AreaChart</td><td>data</td><td>{'{ x, y }[]'}</td><td>{fr ? "Série temporelle" : "Time series data"}</td></tr>
        <tr><td>PieChart</td><td>data</td><td>{'{ label, value, tone }[]'}</td><td>{fr ? "Tranches avec libellé et ton" : "Slices with label and tone"}</td></tr>
        <tr><td>Table</td><td>columns</td><td>Column[]</td><td>{fr ? "Colonnes (key, label, align)" : "Columns (key, label, align)"}</td></tr>
        <tr><td>Select</td><td>options</td><td>Option[]</td><td>{fr ? "Choix disponibles" : "Available options"}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .ao-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
  :global(.ao-layout) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
  :global(.ao-filters) { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  :global(.ao-kpi-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); width: 100%; }
  :global(.ao-charts-row) { display: grid; gap: 1rem; grid-template-columns: 2fr 1fr; width: 100%; }
  :global(.ao-chart-main), :global(.ao-chart-side) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem; overflow: hidden; padding: 1rem;
  }
  :global(.ao-table-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem; overflow: hidden; padding: 1rem; width: 100%;
  }
  :global(.ao-table-header) { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  :global(.ao-section-title) { font-size: 0.9rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  @media (max-width: 860px) { :global(.ao-charts-row) { grid-template-columns: 1fr; } }
</style>
