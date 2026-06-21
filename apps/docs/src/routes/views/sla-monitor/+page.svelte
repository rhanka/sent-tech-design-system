<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock bilingues — Suivi des SLA projet ───────────────────────────

  const PIE_DATA = $derived([
    { label: fr ? "Critique" : "Critical", value: 8, tone: "danger" as const },
    { label: fr ? "Haute" : "High", value: 21, tone: "warning" as const },
    { label: fr ? "Moyenne" : "Medium", value: 43, tone: "category2" as const },
    { label: fr ? "Basse" : "Low", value: 28, tone: "category1" as const }
  ]);

  const GRID_ROWS = $derived([
    { id: "1", ref: "INC-4821", sujet: fr ? "Panne module paiement" : "Payment module outage", severite: fr ? "Critique" : "Critical", file: fr ? "Production" : "Production", echeance: "2026-06-19 10:00", restant: fr ? "-2h 15min" : "-2h 15min", statut: fr ? "Dépassé" : "Breached" },
    { id: "2", ref: "INC-4817", sujet: fr ? "Erreur authentification SSO" : "SSO authentication error", severite: fr ? "Critique" : "Critical", file: fr ? "Sécurité" : "Security", echeance: "2026-06-19 11:30", restant: fr ? "47min" : "47min", statut: fr ? "À risque" : "At risk" },
    { id: "3", ref: "INC-4809", sujet: fr ? "Export rapport lent (>5 min)" : "Slow report export (>5 min)", severite: fr ? "Haute" : "High", file: fr ? "Performance" : "Performance", echeance: "2026-06-19 14:00", restant: fr ? "3h 12min" : "3h 12min", statut: fr ? "À risque" : "At risk" },
    { id: "4", ref: "INC-4803", sujet: fr ? "Doublons synchronisation agenda" : "Calendar sync duplicates", severite: fr ? "Haute" : "High", file: fr ? "Intégrations" : "Integrations", echeance: "2026-06-19 16:45", restant: fr ? "5h 57min" : "5h 57min", statut: fr ? "En cours" : "In progress" },
    { id: "5", ref: "INC-4798", sujet: fr ? "Alerte quota stockage" : "Storage quota alert", severite: fr ? "Moyenne" : "Medium", file: fr ? "Infrastructure" : "Infrastructure", echeance: "2026-06-20 09:00", restant: fr ? "1j 1h" : "1d 1h", statut: fr ? "En cours" : "In progress" },
    { id: "6", ref: "INC-4791", sujet: fr ? "Traduction manquante (DE)" : "Missing translation (DE)", severite: fr ? "Basse" : "Low", file: fr ? "Localisation" : "Localisation", echeance: "2026-06-22 18:00", restant: fr ? "3j 9h" : "3d 9h", statut: fr ? "Ouvert" : "Open" }
  ]);

  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Alert", slug: "alert" },
    { name: "DonutChart", slug: "donut-chart" },
    { name: "DataGrid", slug: "data-grid" },
    { name: "Badge", slug: "badge" },
    { name: "Select", slug: "select" },
    { name: "DatePicker", slug: "date-picker" }
  ];

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div", props: { class: "sla-layout" },
      children: [
        // Filtres
        {
          el: "div", props: { class: "sla-filters" },
          children: [
            { comp: "DatePicker", props: { label: fr ? "Période" : "Period", value: "2026-06-01/2026-06-30" } },
            { comp: "Select", props: { label: fr ? "File" : "Queue", value: "all",
                options: [{ value: "all", label: fr ? "Toutes" : "All" }, { value: "prod", label: fr ? "Production" : "Production" }, { value: "sec", label: fr ? "Sécurité" : "Security" }, { value: "perf", label: fr ? "Performance" : "Performance" }] } },
            { comp: "Select", props: { label: fr ? "Priorité" : "Priority", value: "all",
                options: [{ value: "all", label: fr ? "Toutes" : "All" }, { value: "critical", label: fr ? "Critique" : "Critical" }, { value: "high", label: fr ? "Haute" : "High" }, { value: "medium", label: fr ? "Moyenne" : "Medium" }] } }
          ]
        },
        // Alerte violations imminentes
        {
          comp: "Alert", props: { tone: "danger", title: fr ? "2 tickets en dépassement SLA" : "2 tickets breaching SLA" },
          children: [fr ? "INC-4821 (Panne module paiement) dépasse le SLA de 2h 15min. Action immédiate requise." : "INC-4821 (Payment module outage) is 2h 15min past SLA. Immediate action required."]
        },
        // KPI row
        {
          el: "div", props: { class: "sla-kpi-row" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Taux de respect SLA" : "SLA Compliance Rate", value: 0.847, format: "percent", delta: -0.023, deltaFormat: "percent", tone: "category2" } },
            { comp: "KpiCard", props: { label: fr ? "Tickets en dépassement" : "Breached Tickets", value: 8, delta: 3, deltaFormat: "absolute", tone: "danger" } },
            { comp: "KpiCard", props: { label: fr ? "Tickets à risque" : "At-Risk Tickets", value: 14, delta: -2, deltaFormat: "absolute", tone: "warning" } },
            { comp: "KpiCard", props: { label: fr ? "Délai moyen de résolution" : "Avg. Resolution Time", value: "4h 32min", tone: "category3" } }
          ]
        },
        // Charts + grille
        {
          el: "div", props: { class: "sla-body" },
          children: [
            {
              el: "div", props: { class: "sla-pie-panel" },
              children: [
                { el: "h3", props: { class: "sla-panel-title" }, children: [fr ? "Répartition par sévérité" : "Breakdown by severity"] },
                { comp: "DonutChart", props: { centerLabel: fr ? "Tickets ouverts par sévérité" : "Open tickets by severity", data: PIE_DATA } }
              ]
            },
            {
              el: "div", props: { class: "sla-grid-panel" },
              children: [
                {
                  el: "div", props: { class: "sla-grid-header" },
                  children: [
                    { el: "h3", props: { class: "sla-panel-title" }, children: [fr ? "Tickets à risque ou en dépassement" : "At-risk or breached tickets"] },
                    { comp: "Badge", props: { tone: "danger" }, children: [fr ? "6 affichés" : "6 shown"] }
                  ]
                },
                { comp: "DataGrid", props: {
                    columns: [
                      { key: "ref", label: "#", sortable: true },
                      { key: "sujet", label: fr ? "Sujet" : "Subject", sortable: true },
                      { key: "severite", label: fr ? "Sévérité" : "Severity", sortable: true },
                      { key: "file", label: fr ? "File" : "Queue", sortable: true },
                      { key: "echeance", label: fr ? "Échéance" : "Due", sortable: true },
                      { key: "restant", label: fr ? "Restant" : "Remaining", sortable: true },
                      { key: "statut", label: fr ? "Statut" : "Status", sortable: true }
                    ],
                    rows: GRID_ROWS,
                    size: "sm",
                    pageSize: 6
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Projet" : "View · Project"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Suivi des SLA" : "SLA Monitor"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Tableau de bord de conformité SLA des tickets : KPI de respect des délais, répartition par sévérité et grille des tickets à risque ou en dépassement. Alertes pour les violations imminentes et filtres par file et priorité."
        : "Ticket SLA compliance dashboard: on-time KPIs, breakdown by severity, and a data grid of at-risk or breached tickets. Alerts for imminent breaches with queue and priority filters."}
    </p>
  </section>

  <TabbedExample nodes={nodes} title={fr ? "Suivi des SLA" : "SLA Monitor"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="sla-comp-list">
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
        <tr><td>KpiCard</td><td>value</td><td>number</td><td>{fr ? "Valeur principale affichée" : "Main displayed value"}</td></tr>
        <tr><td>KpiCard</td><td>delta</td><td>number</td><td>{fr ? "Variation absolue ou relative" : "Absolute or relative delta"}</td></tr>
        <tr><td>Alert</td><td>tone</td><td>string</td><td>{fr ? "Niveau de sévérité (danger, warning, info)" : "Severity level (danger, warning, info)"}</td></tr>
        <tr><td>DonutChart</td><td>data</td><td>{"{ label, value, tone }[]"}</td><td>{fr ? "Tranches avec libellé et ton" : "Slices with label and tone"}</td></tr>
        <tr><td>DataGrid</td><td>columns</td><td>Column[]</td><td>{fr ? "Colonnes avec clé, libellé et tri" : "Columns with key, label and sort"}</td></tr>
        <tr><td>Select</td><td>options</td><td>Option[]</td><td>{fr ? "Options du filtre déroulant" : "Dropdown filter options"}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .sla-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
  :global(.sla-layout) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
  :global(.sla-filters) { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  :global(.sla-kpi-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); width: 100%; }
  :global(.sla-body) { display: grid; gap: 1rem; grid-template-columns: 280px 1fr; width: 100%; }
  :global(.sla-pie-panel), :global(.sla-grid-panel) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow: hidden;
  }
  :global(.sla-panel-title) { font-size: 0.9rem; font-weight: 600; margin: 0 0 0.75rem; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.sla-grid-header) { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  @media (max-width: 860px) { :global(.sla-body) { grid-template-columns: 1fr; } }
</style>
