<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const AREA_DATA = $derived([
    { x: "Jan", y: 1540000 }, { x: fr ? "Fév" : "Feb", y: 1612000 },
    { x: fr ? "Mar" : "Mar", y: 1688000 }, { x: fr ? "Avr" : "Apr", y: 1730000 },
    { x: fr ? "Mai" : "May", y: 1790000 }, { x: fr ? "Juin" : "Jun", y: 1842600 }
  ]);

  const PIE_DATA = $derived([
    { label: fr ? "Entrepôt Lyon" : "Lyon Warehouse", value: 38, tone: "category1" as const },
    { label: fr ? "Entrepôt Paris" : "Paris Warehouse", value: 29, tone: "category2" as const },
    { label: fr ? "Entrepôt Bordeaux" : "Bordeaux Warehouse", value: 21, tone: "category3" as const },
    { label: fr ? "Entrepôt Lille" : "Lille Warehouse", value: 12, tone: "category4" as const }
  ]);

  const TABLE_ROWS = $derived([
    { id: "1", article: fr ? "Vis M6×20 inox" : "M6×20 stainless screw", ref: "VIS-M6-20", stock: 142, seuil: 500, statut: fr ? "Critique" : "Critical" },
    { id: "2", article: fr ? "Joint torique 15mm" : "O-ring 15mm", ref: "JTO-015", stock: 80, seuil: 300, statut: fr ? "Critique" : "Critical" },
    { id: "3", article: fr ? "Roulement 6205 ZZ" : "Bearing 6205 ZZ", ref: "RLT-6205", stock: 27, seuil: 100, statut: fr ? "Rupture" : "Stockout" },
    { id: "4", article: fr ? "Câble électrique 2,5mm²" : "2.5mm² electric cable", ref: "CAB-25", stock: 310, seuil: 1000, statut: fr ? "Bas" : "Low" },
    { id: "5", article: fr ? "Filtre hydraulique HF6" : "Hydraulic filter HF6", ref: "FLT-HF6", stock: 5, seuil: 50, statut: fr ? "Rupture" : "Stockout" }
  ]);

  const nodes = $derived<NodeSpec[]>([
    {
      el: "div", props: { class: "so-layout" },
      children: [
        {
          el: "div", props: { class: "so-filters" },
          children: [
            { comp: "Select", props: { label: fr ? "Entrepôt" : "Warehouse", value: "all", options: [
              { value: "all", label: fr ? "Tous les entrepôts" : "All Warehouses" },
              { value: "lyon", label: fr ? "Entrepôt Lyon" : "Lyon Warehouse" },
              { value: "paris", label: fr ? "Entrepôt Paris" : "Paris Warehouse" },
              { value: "bordeaux", label: fr ? "Entrepôt Bordeaux" : "Bordeaux Warehouse" }
            ] } },
            { comp: "Select", props: { label: fr ? "Catégorie" : "Category", value: "all", options: [
              { value: "all", label: fr ? "Toutes catégories" : "All Categories" },
              { value: "fixation", label: fr ? "Fixation" : "Fasteners" },
              { value: "electrique", label: fr ? "Électrique" : "Electrical" }
            ] } }
          ]
        },
        {
          el: "div", props: { class: "so-kpi-row" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Valeur du stock" : "Stock Value", value: 1842600, delta: 52400, deltaFormat: "absolute", tone: "category1", sparkline: [1540000, 1612000, 1688000, 1730000, 1790000, 1842600] } },
            { comp: "KpiCard", props: { label: fr ? "Ruptures actives" : "Active Stockouts", value: 14, delta: -3, deltaFormat: "absolute", tone: "category4", sparkline: [22, 20, 18, 17, 17, 14] } },
            { comp: "KpiCard", props: { label: fr ? "Taux de rotation" : "Turnover Rate", value: 4.7, delta: 0.3, deltaFormat: "absolute", tone: "category2", sparkline: [3.8, 4.0, 4.1, 4.4, 4.5, 4.7] } },
            { comp: "KpiCard", props: { label: fr ? "Articles sous seuil" : "Below-Threshold Items", value: 38, delta: 5, deltaFormat: "absolute", tone: "category3" } }
          ]
        },
        {
          el: "div", props: { class: "so-charts-row" },
          children: [
            { el: "div", props: { class: "so-chart-main" }, children: [
              { comp: "AreaChart", props: { label: fr ? "Évolution de la valeur du stock" : "Stock Value Trend", data: AREA_DATA, tone: "category1", height: 220 } }
            ] },
            { el: "div", props: { class: "so-chart-side" }, children: [
              { comp: "PieChart", props: { label: fr ? "Répartition par entrepôt" : "Breakdown by Warehouse", data: PIE_DATA, height: 220 } }
            ] }
          ]
        },
        {
          el: "div", props: { class: "so-table-section" },
          children: [
            { el: "div", props: { class: "so-table-header" }, children: [
              { el: "h3", props: { class: "so-section-title" }, children: [fr ? "Articles sous seuil de réapprovisionnement" : "Items Below Reorder Threshold"] },
              { comp: "Badge", props: { tone: "danger" }, children: [fr ? "Action requise" : "Action required"] }
            ] },
            { comp: "Table", props: {
              columns: [
                { key: "article", label: fr ? "Article" : "Item" },
                { key: "ref", label: fr ? "Référence" : "Reference" },
                { key: "stock", label: fr ? "Stock actuel" : "Current Stock", align: "end" },
                { key: "seuil", label: fr ? "Seuil mini" : "Min Threshold", align: "end" },
                { key: "statut", label: fr ? "Statut" : "Status", align: "center" }
              ],
              rows: TABLE_ROWS,
              size: "sm"
            } }
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · ERP / Stock" : "View · ERP / Stock"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Vue d'ensemble du stock" : "Stock Overview"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Cartes KPI (valeur du stock, ruptures, taux de rotation) + courbe d'évolution + camembert par entrepôt + table des articles sous seuil. Pour piloter la santé globale des stocks d'un coup d'oeil."
        : "KPI cards (stock value, stockouts, turnover rate) + trend chart + warehouse pie breakdown + below-threshold items table. To monitor overall inventory health at a glance."}
    </p>
  </section>

  <TabbedExample nodes={nodes} title={fr ? "Vue d'ensemble du stock" : "Stock Overview"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="so-comp-list">
      {#each [
        { name: "KpiCard", slug: "kpi-card" },
        { name: "AreaChart", slug: "area-chart" },
        { name: "PieChart", slug: "pie-chart" },
        { name: "Table", slug: "table" },
        { name: "Badge", slug: "badge" },
        { name: "Select", slug: "select" }
      ] as comp (comp.slug)}
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
        <tr><td>KpiCard</td><td>sparkline</td><td>number[]</td><td>{fr ? "Série de points pour le mini-graphe" : "Data points for the sparkline"}</td></tr>
        <tr><td>AreaChart</td><td>data</td><td>{"{ x, y }[]"}</td><td>{fr ? "Points de la série temporelle" : "Time series data points"}</td></tr>
        <tr><td>PieChart</td><td>data</td><td>{"{ label, value, tone }[]"}</td><td>{fr ? "Tranches avec libellé et ton" : "Slices with label and tone"}</td></tr>
        <tr><td>Table</td><td>columns</td><td>Column[]</td><td>{fr ? "Définition des colonnes (key, label, align)" : "Column definitions (key, label, align)"}</td></tr>
        <tr><td>Select</td><td>options</td><td>Option[]</td><td>{fr ? "Liste de choix disponibles" : "Available option list"}</td></tr>
        <tr><td>Badge</td><td>tone</td><td>string</td><td>{fr ? "Ton sémantique (danger, success, info…)" : "Semantic tone (danger, success, info…)"}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .so-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
  :global(.so-layout) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
  :global(.so-filters) { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  :global(.so-kpi-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); width: 100%; }
  :global(.so-charts-row) { display: grid; gap: 1rem; grid-template-columns: 2fr 1fr; width: 100%; }
  :global(.so-chart-main), :global(.so-chart-side) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
  }
  :global(.so-table-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
    width: 100%;
  }
  :global(.so-table-header) { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  :global(.so-section-title) { font-size: 0.9rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  @media (max-width: 860px) { :global(.so-charts-row) { grid-template-columns: 1fr; } }
</style>
