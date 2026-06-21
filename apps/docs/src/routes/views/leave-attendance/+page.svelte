<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const TREND_DATA = $derived([
    { x: "Jan", y: 94 }, { x: fr ? "Fév" : "Feb", y: 91 },
    { x: "Mar", y: 95 }, { x: fr ? "Avr" : "Apr", y: 89 },
    { x: fr ? "Mai" : "May", y: 93 }, { x: fr ? "Juin" : "Jun", y: 96 }
  ]);

  const PIE_DATA = $derived([
    { label: fr ? "Congés payés" : "Annual Leave", value: 48, tone: "category1" as const },
    { label: fr ? "Maladie" : "Sick Leave", value: 21, tone: "category2" as const },
    { label: fr ? "RTT" : "Time Off in Lieu", value: 18, tone: "category3" as const },
    { label: fr ? "Exceptionnel" : "Special Leave", value: 13, tone: "category4" as const }
  ]);

  const TABLE_ROWS = $derived([
    { id: "1", employee: "Sophie Martin", type: fr ? "Congés payés" : "Annual Leave", period: "23–27 juin 2026", days: "5", status: "pending" },
    { id: "2", employee: "Lucas Bernard", type: fr ? "Maladie" : "Sick Leave", period: "18–19 juin 2026", days: "2", status: "approved" },
    { id: "3", employee: "Amina Diallo", type: "RTT", period: "30 juin 2026", days: "1", status: "pending" },
    { id: "4", employee: "Thomas Leclerc", type: fr ? "Congés payés" : "Annual Leave", period: "7–18 juil. 2026", days: "10", status: "approved" },
    { id: "5", employee: "Chloé Nguyen", type: fr ? "Exceptionnel" : "Special Leave", period: "20 juin 2026", days: "1", status: "rejected" }
  ]);

  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" }, { name: "DatePicker", slug: "date-picker" },
    { name: "DonutChart", slug: "donut-chart" }, { name: "AreaChart", slug: "area-chart" },
    { name: "Table", slug: "table" }, { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" }, { name: "Alert", slug: "alert" }
  ];

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div", props: { class: "la-layout" },
      children: [
        {
          el: "div", props: { class: "la-filters" },
          children: [
            { comp: "DatePicker", props: { label: fr ? "Période" : "Period", value: "2026-01-01/2026-06-30" } },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Appliquer" : "Apply"] }
          ]
        },
        {
          comp: "Alert", props: { tone: "warning" },
          children: [fr ? "3 demandes en attente de validation." : "3 requests pending approval."]
        },
        {
          el: "div", props: { class: "la-kpi-row" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Solde moyen (jours)" : "Avg. Leave Balance (days)", value: 14.3, delta: 1.2, deltaFormat: "absolute", tone: "category1", sparkline: [11, 12, 13, 13.5, 14, 14.3] } },
            { comp: "KpiCard", props: { label: fr ? "Taux de présence" : "Attendance Rate", value: 0.94, format: "percent", delta: 0.02, deltaFormat: "percent", tone: "category2", sparkline: [0.91, 0.93, 0.92, 0.95, 0.93, 0.94] } },
            { comp: "KpiCard", props: { label: fr ? "Absences (jours)" : "Absences (days)", value: 62, delta: -8, deltaFormat: "absolute", tone: "category4", sparkline: [80, 74, 70, 68, 65, 62] } },
            { comp: "KpiCard", props: { label: fr ? "Demandes en attente" : "Pending Requests", value: 3, tone: "category3" } }
          ]
        },
        {
          el: "div", props: { class: "la-charts-row" },
          children: [
            { el: "div", props: { class: "la-chart-main" },
              children: [{ comp: "AreaChart", props: { label: fr ? "Taux de présence mensuel (%)" : "Monthly Attendance Rate (%)", data: TREND_DATA, tone: "category2", height: 220 } }] },
            { el: "div", props: { class: "la-chart-side" },
              children: [{ comp: "DonutChart", props: { centerLabel: fr ? "Répartition des absences" : "Absence Breakdown", data: PIE_DATA } }] }
          ]
        },
        {
          el: "div", props: { class: "la-table-section" },
          children: [
            { el: "div", props: { class: "la-table-header" }, children: [
              { el: "h3", props: { class: "la-section-title" }, children: [fr ? "Demandes récentes" : "Recent Requests"] },
              { comp: "Badge", props: { tone: "warning" }, children: [fr ? "3 en attente" : "3 pending"] }
            ]},
            { comp: "Table", props: {
                columns: [
                  { key: "employee", label: fr ? "Employé" : "Employee" },
                  { key: "type", label: fr ? "Type" : "Type" },
                  { key: "period", label: fr ? "Période" : "Period" },
                  { key: "days", label: fr ? "Jours" : "Days", align: "end" },
                  { key: "status", label: fr ? "Statut" : "Status", align: "center" }
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
    <p class="docs-hero-kicker">{fr ? "RH" : "HR"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Congés et présences" : "Leave & Attendance"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Suivi des congés et présences : KPI de solde et taux de présence, graphiques de répartition et tendance, table des demandes à valider avec badges de statut et sélecteur de période. Pour piloter absences et approbations."
        : "Leave and attendance tracking: balance and presence-rate KPIs, distribution and trend charts, request approval table with status badges and a date-range picker. For managing absences and approvals."}
    </p>
  </section>

  <TabbedExample nodes={nodes} title={fr ? "Congés et présences" : "Leave & Attendance"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="la-comp-list">
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
        <tr><td>KpiCard</td><td>sparkline</td><td>number[]</td><td>{fr ? "Points du mini-graphe tendance" : "Sparkline trend points"}</td></tr>
        <tr><td>KpiCard</td><td>format</td><td>string</td><td>{fr ? '"percent" pour afficher en %' : '"percent" to display as %'}</td></tr>
        <tr><td>AreaChart</td><td>data</td><td>{'{ x, y }[]'}</td><td>{fr ? "Série temporelle mensuelle" : "Monthly time series"}</td></tr>
        <tr><td>DonutChart</td><td>data</td><td>{'{ label, value, tone }[]'}</td><td>{fr ? "Tranches d'absence par type" : "Absence slices by type"}</td></tr>
        <tr><td>Table</td><td>columns</td><td>Column[]</td><td>{fr ? "Colonnes (key, label, align)" : "Columns (key, label, align)"}</td></tr>
        <tr><td>Alert</td><td>tone</td><td>string</td><td>{fr ? "Niveau d'alerte (warning, info…)" : "Alert level (warning, info…)"}</td></tr>
        <tr><td>Badge</td><td>tone</td><td>string</td><td>{fr ? "Statut visuel de la demande" : "Visual status of the request"}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .la-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
  :global(.la-layout) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
  :global(.la-filters) { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  :global(.la-kpi-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); width: 100%; }
  :global(.la-charts-row) { display: grid; gap: 1rem; grid-template-columns: 2fr 1fr; width: 100%; }
  :global(.la-chart-main), :global(.la-chart-side) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem; overflow: hidden; padding: 1rem;
  }
  :global(.la-table-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem; overflow: hidden; padding: 1rem; width: 100%;
  }
  :global(.la-table-header) { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  :global(.la-section-title) { font-size: 0.9rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  @media (max-width: 860px) { :global(.la-charts-row) { grid-template-columns: 1fr; } }
</style>
