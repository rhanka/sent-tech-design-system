<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const ORDERS = $derived([
    { id: "OF-2026-0441", product: fr ? "Carter moteur AL-7075" : "AL-7075 Motor Housing", line: fr ? "Ligne A" : "Line A", qty: 60, done: 47, status: fr ? "En cours" : "In Progress", priority: fr ? "Haute" : "High", due: "2026-06-21" },
    { id: "OF-2026-0438", product: fr ? "Vilebrequin acier forgé" : "Forged Steel Crankshaft", line: fr ? "Ligne B" : "Line B", qty: 20, done: 20, status: fr ? "Terminé" : "Done", priority: fr ? "Normale" : "Normal", due: "2026-06-19" },
    { id: "OF-2026-0452", product: fr ? "Boîtier électronique IP67" : "IP67 Electronic Enclosure", line: fr ? "Ligne C" : "Line C", qty: 100, done: 12, status: fr ? "En retard" : "Late", priority: fr ? "Critique" : "Critical", due: "2026-06-18" },
    { id: "OF-2026-0461", product: fr ? "Bras robotique soudé" : "Welded Robotic Arm", line: fr ? "Ligne A" : "Line A", qty: 8, done: 0, status: fr ? "Planifié" : "Scheduled", priority: fr ? "Normale" : "Normal", due: "2026-06-25" },
    { id: "OF-2026-0455", product: fr ? "Support de transmission" : "Transmission Bracket", line: fr ? "Ligne B" : "Line B", qty: 35, done: 28, status: fr ? "En cours" : "In Progress", priority: fr ? "Haute" : "High", due: "2026-06-22" }
  ]);

  const LINE_OPTIONS = $derived([
    { value: "all", label: fr ? "Toutes les lignes" : "All Lines" },
    { value: "a", label: fr ? "Ligne A" : "Line A" },
    { value: "b", label: fr ? "Ligne B" : "Line B" },
    { value: "c", label: fr ? "Ligne C" : "Line C" }
  ]);

  const PERIOD_OPTIONS = $derived([
    { value: "today", label: fr ? "Aujourd'hui" : "Today" },
    { value: "week", label: fr ? "Cette semaine" : "This week" },
    { value: "month", label: fr ? "Ce mois" : "This month" }
  ]);

  const TABLE_ROWS = $derived(
    ORDERS.map((o) => ({
      id: o.id,
      order: o.id,
      product: o.product,
      line: o.line,
      progress: Math.round((o.done / o.qty) * 100),
      qty: `${o.done} / ${o.qty}`,
      status: o.status,
      priority: o.priority,
      due: o.due
    }))
  );

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div", props: { class: "wob-layout" },
      children: [
        {
          el: "div", props: { class: "wob-kpi-row" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Ordres actifs" : "Active Orders", value: 5, delta: 2, deltaFormat: "absolute", tone: "category1", sparkline: [3, 4, 4, 5, 5, 5] } },
            { comp: "KpiCard", props: { label: fr ? "Pièces produites" : "Parts Produced", value: 107, delta: 14, deltaFormat: "absolute", tone: "category2", sparkline: [70, 80, 88, 93, 100, 107] } },
            { comp: "KpiCard", props: { label: fr ? "Taux de complétion" : "Completion Rate", value: 48, delta: -5, deltaFormat: "absolute", tone: "category3", sparkline: [60, 58, 55, 52, 50, 48] } },
            { comp: "KpiCard", props: { label: fr ? "Ordres en retard" : "Late Orders", value: 1, delta: 0, deltaFormat: "absolute", tone: "category4", sparkline: [0, 1, 1, 2, 1, 1] } }
          ]
        },
        {
          el: "div", props: { class: "wob-filters" },
          children: [
            { comp: "Select", props: { label: fr ? "Ligne" : "Line", value: "all", options: LINE_OPTIONS } },
            { comp: "Select", props: { label: fr ? "Période" : "Period", value: "week", options: PERIOD_OPTIONS } },
            { comp: "DatePicker", props: { label: fr ? "Date de début" : "Start date", value: "2026-06-16" } },
            { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Réinitialiser" : "Reset"] }
          ]
        },
        {
          el: "div", props: { class: "wob-table-section" },
          children: [
            {
              el: "div", props: { class: "wob-table-header" },
              children: [
                { el: "h3", props: { class: "wob-section-title" }, children: [fr ? "Carnet de production" : "Production Backlog"] },
                { comp: "Badge", props: { tone: "danger" }, children: [fr ? "1 en retard" : "1 late"] }
              ]
            },
            {
              comp: "DataGrid",
              props: {
                caption: fr ? "Ordres de fabrication" : "Work orders",
                columns: [
                  { key: "order", label: fr ? "N° OF" : "WO#" },
                  { key: "product", label: fr ? "Produit" : "Product" },
                  { key: "line", label: fr ? "Ligne" : "Line" },
                  { key: "qty", label: fr ? "Réalisé / Cible" : "Done / Target", align: "end" },
                  { key: "progress", label: fr ? "Avancement %" : "Progress %", align: "end" },
                  { key: "status", label: fr ? "Statut" : "Status", align: "center" },
                  { key: "priority", label: fr ? "Priorité" : "Priority", align: "center" },
                  { key: "due", label: fr ? "Échéance" : "Due date" }
                ],
                rows: TABLE_ROWS,
                size: "sm"
              }
            }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Select", slug: "select" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "DataGrid", slug: "data-grid" },
    { name: "Progress", slug: "progress" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" },
    { name: "Breadcrumb", slug: "breadcrumb" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Production" : "Manufacturing"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Ordres de fabrication" : "Work Orders"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Liste filtrable des ordres de fabrication avec avancement, statut et priorité. KPI d'atelier en tête, filtres par ligne et période, table dense avec barres de progression. Pour piloter le carnet de production au quotidien."
        : "Filterable list of work orders with progress, status and priority. Shop-floor KPIs on top, filters by line and period, dense table with progress bars. For managing the daily production backlog."}
    </p>
  </section>

  <TabbedExample nodes={nodes} title={fr ? "Ordres de fabrication" : "Work Orders"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="wob-comp-list">
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
        <tr><td>KpiCard</td><td>sparkline</td><td>number[]</td><td>{fr ? "Série de points pour le mini-graphe" : "Data points for the sparkline"}</td></tr>
        <tr><td>KpiCard</td><td>delta</td><td>number</td><td>{fr ? "Variation depuis la période précédente" : "Change from the previous period"}</td></tr>
        <tr><td>DataGrid</td><td>columns</td><td>Column[]</td><td>{fr ? "Définition des colonnes (key, label, align)" : "Column definitions (key, label, align)"}</td></tr>
        <tr><td>DataGrid</td><td>rows</td><td>Row[]</td><td>{fr ? "Données à afficher, une ligne par objet" : "Data to display, one row per object"}</td></tr>
        <tr><td>Select</td><td>options</td><td>Option[]</td><td>{fr ? "Liste des choix disponibles" : "Available option list"}</td></tr>
        <tr><td>DatePicker</td><td>value</td><td>string</td><td>{fr ? "Date initiale au format ISO 8601" : "Initial date in ISO 8601 format"}</td></tr>
        <tr><td>Badge</td><td>tone</td><td>string</td><td>{fr ? "Ton sémantique (danger, success, info…)" : "Semantic tone (danger, success, info…)"}</td></tr>
        <tr><td>Button</td><td>variant</td><td>string</td><td>{fr ? "Style du bouton (primary, secondary…)" : "Button style (primary, secondary…)"}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .wob-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
  :global(.wob-layout) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
  :global(.wob-kpi-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); width: 100%; }
  :global(.wob-filters) { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  :global(.wob-table-section) { display: flex; flex-direction: column; gap: 0.75rem; }
  :global(.wob-table-header) { display: flex; align-items: center; gap: 0.75rem; }
  :global(.wob-section-title) { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
</style>
