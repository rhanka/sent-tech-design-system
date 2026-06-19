<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const KPI_TILES = $derived([
    { id: "kpi1", label: fr ? "Revenu" : "Revenue", value: "1,2 M$", trend: "+8,7 %", trendUp: true, col: "span 3" },
    { id: "kpi2", label: fr ? "Commandes" : "Orders", value: "3 412", trend: "+211", trendUp: true, col: "span 3" },
    { id: "kpi3", label: fr ? "Conversion" : "Conversion", value: "6,8 %", trend: "-0,3 %", trendUp: false, col: "span 3" },
    { id: "kpi4", label: fr ? "Satisfaction" : "Satisfaction", value: "4,6 / 5", trend: "+0,1", trendUp: true, col: "span 3" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "ag-shell" },
      children: [
        // Chrome
        {
          comp: "Header",
          props: { title: fr ? "Analytics" : "Analytics" }
        },
        // Grille de tuiles
        {
          el: "main",
          props: { class: "ag-main" },
          children: [
            {
              el: "div",
              props: { class: "ag-toolbar" },
              children: [
                { el: "h2", props: { class: "ag-page-title" }, children: [fr ? "Indicateurs clés" : "Key indicators"] },
                { comp: "Badge", props: { tone: "neutral" }, children: [fr ? "Juin 2026" : "June 2026"] }
              ]
            },
            // Rangée KPI (4 tuiles sur 12 colonnes)
            {
              el: "div",
              props: { class: "ag-kpi-row", "aria-label": fr ? "KPI" : "KPI" },
              children: KPI_TILES.map((tile) => ({
                el: "div",
                props: { class: "ag-kpi-tile" },
                children: [
                  { el: "span", props: { class: "ag-kpi-label" }, children: [tile.label] },
                  { el: "span", props: { class: "ag-kpi-value" }, children: [tile.value] },
                  {
                    el: "span",
                    props: { class: `ag-kpi-trend${tile.trendUp ? " ag-kpi-trend--up" : " ag-kpi-trend--down"}` },
                    children: [tile.trend]
                  }
                ]
              }))
            },
            // Rangée graphiques (zone de contenu fictive)
            {
              el: "div",
              props: { class: "ag-charts-row" },
              children: [
                {
                  el: "div",
                  props: { class: "ag-chart-tile ag-chart-tile--wide" },
                  children: [
                    { el: "p", props: { class: "ag-chart-label" }, children: [fr ? "Revenu mensuel — tendance 6 mois" : "Monthly revenue — 6-month trend"] },
                    {
                      comp: "LineChart",
                      props: {
                        label: fr ? "Revenu mensuel" : "Monthly revenue",
                        data: [
                          { x: "Jan", y: 88000 },
                          { x: fr ? "Fév" : "Feb", y: 94000 },
                          { x: fr ? "Mar" : "Mar", y: 101000 },
                          { x: fr ? "Avr" : "Apr", y: 107000 },
                          { x: fr ? "Mai" : "May", y: 115000 },
                          { x: fr ? "Juin" : "Jun", y: 124800 }
                        ],
                        tone: "category1",
                        height: 160
                      }
                    }
                  ]
                },
                {
                  el: "div",
                  props: { class: "ag-chart-tile" },
                  children: [
                    { el: "p", props: { class: "ag-chart-label" }, children: [fr ? "Répartition acquisition" : "Acquisition breakdown"] },
                    {
                      comp: "DonutChart",
                      props: {
                        label: fr ? "Sources" : "Sources",
                        data: [
                          { label: fr ? "Organique" : "Organic", value: 48, tone: "category1" },
                          { label: fr ? "Publicité" : "Paid", value: 27, tone: "category2" },
                          { label: fr ? "Direct" : "Direct", value: 25, tone: "category3" }
                        ],
                        height: 160
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "AppShell", slug: "app-shell" },
    { name: "DashboardGrid", slug: "dashboard-grid" },
    { name: "Grid", slug: "grid" },
    { name: "Card", slug: "card" },
    { name: "AppChrome", slug: "app-chrome" },
    { name: "Container", slug: "container" },
    { name: "KpiCard", slug: "kpi-card" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · Analytics / BI" : "Layout · Analytics / BI"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Grille analytique" : "Analytics grid"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Page d'analytique : chrome + grille de tuiles (KPI, graphiques, tableaux) sur 12 colonnes
        avec placement x/y/w/h par tuile via <code>DashboardGrid</code> (option <code>editable</code>
        pour déplacer/redimensionner). Pour un layout statique, <code>Grid</code> suffit. Convient
        aux tableaux de bord BI et aux pages de monitoring.
      {:else}
        Analytics page: chrome + tile grid (KPIs, charts, tables) on 12 columns with per-tile
        x/y/w/h placement via <code>DashboardGrid</code> (<code>editable</code> option to drag and
        resize). For a static layout, <code>Grid</code> is enough. Suited to BI dashboards and
        monitoring pages.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular."
        : "Use the tabs to switch between Svelte, React, Vue, and Angular."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Grille analytique (données mock)" : "Analytics grid (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ag-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="ag-comp-list">
      <li>{fr ? "Tableaux de bord exécutifs (KPI + graphiques + tableaux)" : "Executive dashboards (KPIs + charts + tables)"}</li>
      <li>{fr ? "Pages de monitoring ops ou SRE" : "Ops or SRE monitoring pages"}</li>
      <li>{fr ? "Rapports BI paramétrables (DashboardGrid editable)" : "Configurable BI reports (editable DashboardGrid)"}</li>
    </ul>
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

  .ag-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.ag-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.ag-main) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    width: 100%;
    box-sizing: border-box;
  }

  :global(.ag-toolbar) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.ag-page-title) {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
    flex: 1;
  }

  /* Grille KPI */
  :global(.ag-kpi-row) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  :global(.ag-kpi-tile) {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 1rem;
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
  }

  :global(.ag-kpi-label) {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary, #475569);
    font-weight: 500;
  }

  :global(.ag-kpi-value) {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
    line-height: 1.2;
  }

  :global(.ag-kpi-trend) {
    font-size: 0.75rem;
    font-weight: 600;
  }

  :global(.ag-kpi-trend--up) {
    color: var(--st-semantic-color-success, #16a34a);
  }

  :global(.ag-kpi-trend--down) {
    color: var(--st-semantic-color-danger, #dc2626);
  }

  /* Rangée de graphiques */
  :global(.ag-charts-row) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }

  :global(.ag-chart-tile) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  :global(.ag-chart-tile--wide) {
    /* déjà géré par grid-template-columns */
  }

  :global(.ag-chart-label) {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0;
  }

  @media (max-width: 700px) {
    :global(.ag-charts-row) {
      grid-template-columns: 1fr;
    }
  }
</style>
