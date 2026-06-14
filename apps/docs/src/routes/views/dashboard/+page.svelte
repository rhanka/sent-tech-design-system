<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // ── Données mock neutres ──────────────────────────────────────────────────

  const KPI_DATA = {
    revenue: {
      label: () => (locale.value === "fr" ? "Revenu mensuel" : "Monthly Revenue"),
      value: 124800,
      delta: 0.087,
      deltaFormat: "percent" as const,
      tone: "category1" as const,
      sparkline: [88000, 94000, 101000, 107000, 115000, 124800]
    },
    orders: {
      label: () => (locale.value === "fr" ? "Commandes" : "Orders"),
      value: 3412,
      delta: 211,
      deltaFormat: "absolute" as const,
      tone: "category2" as const,
      sparkline: [2600, 2780, 2950, 3100, 3220, 3412]
    },
    conversion: {
      label: () => (locale.value === "fr" ? "Taux de conversion" : "Conversion Rate"),
      value: 0.068,
      format: "percent" as const,
      delta: -0.003,
      deltaFormat: "percent" as const,
      tone: "category3" as const
    },
    satisfaction: {
      label: () => (locale.value === "fr" ? "Satisfaction client" : "Customer Satisfaction"),
      value: 4.6,
      unit: "/ 5",
      delta: 0.1,
      deltaFormat: "absolute" as const,
      tone: "category4" as const
    }
  };

  const LINE_DATA = [
    { x: "Jan", y: 88000 },
    { x: "Fév", y: 94000 },
    { x: "Mar", y: 101000 },
    { x: "Avr", y: 107000 },
    { x: "Mai", y: 115000 },
    { x: "Juin", y: 124800 }
  ];

  const BAR_DATA = [
    { label: "Forge", value: 42000, tone: "category1" as const },
    { label: "Entropic", value: 31500, tone: "category2" as const },
    { label: "Airbus", value: 27300, tone: "category3" as const },
    { label: "DSFR", value: 14000, tone: "category4" as const },
    { label: "Carbon", value: 10000, tone: "category5" as const }
  ];

  const DONUT_DATA = [
    { label: "Organique", value: 48, tone: "category1" as const },
    { label: "Publicité", value: 27, tone: "category2" as const },
    { label: "Référence", value: 15, tone: "category3" as const },
    { label: "Direct", value: 10, tone: "category4" as const }
  ];

  const TABLE_COLUMNS = [
    { key: "client", header: () => (locale.value === "fr" ? "Client" : "Client") },
    { key: "montant", header: () => (locale.value === "fr" ? "Montant (€)" : "Amount (€)"), align: "end" as const },
    { key: "statut", header: () => (locale.value === "fr" ? "Statut" : "Status") },
    { key: "date", header: () => (locale.value === "fr" ? "Date" : "Date") }
  ];

  const TABLE_ROWS = [
    { id: "1", client: "Airbus Group", montant: "42 300 €", statut: locale.value === "fr" ? "Payé" : "Paid", date: "2026-06-01" },
    { id: "2", client: "Safran SA", montant: "31 800 €", statut: locale.value === "fr" ? "Payé" : "Paid", date: "2026-06-03" },
    { id: "3", client: "Orange SA", montant: "18 500 €", statut: locale.value === "fr" ? "En cours" : "Pending", date: "2026-06-05" },
    { id: "4", client: "Société Générale", montant: "14 200 €", statut: locale.value === "fr" ? "Payé" : "Paid", date: "2026-06-06" },
    { id: "5", client: "Thales Group", montant: "11 000 €", statut: locale.value === "fr" ? "Retard" : "Overdue", date: "2026-05-28" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "dash-layout" },
      children: [
        // Rangée KPI
        {
          el: "div",
          props: { class: "dash-kpi-row" },
          children: [
            {
              comp: "KpiCard",
              props: {
                label: KPI_DATA.revenue.label(),
                value: KPI_DATA.revenue.value,
                delta: KPI_DATA.revenue.delta,
                deltaFormat: KPI_DATA.revenue.deltaFormat,
                tone: KPI_DATA.revenue.tone,
                sparkline: KPI_DATA.revenue.sparkline
              }
            },
            {
              comp: "KpiCard",
              props: {
                label: KPI_DATA.orders.label(),
                value: KPI_DATA.orders.value,
                delta: KPI_DATA.orders.delta,
                deltaFormat: KPI_DATA.orders.deltaFormat,
                tone: KPI_DATA.orders.tone,
                sparkline: KPI_DATA.orders.sparkline
              }
            },
            {
              comp: "KpiCard",
              props: {
                label: KPI_DATA.conversion.label(),
                value: KPI_DATA.conversion.value,
                format: KPI_DATA.conversion.format,
                delta: KPI_DATA.conversion.delta,
                deltaFormat: KPI_DATA.conversion.deltaFormat,
                tone: KPI_DATA.conversion.tone
              }
            },
            {
              comp: "KpiCard",
              props: {
                label: KPI_DATA.satisfaction.label(),
                value: KPI_DATA.satisfaction.value,
                unit: KPI_DATA.satisfaction.unit,
                delta: KPI_DATA.satisfaction.delta,
                deltaFormat: KPI_DATA.satisfaction.deltaFormat,
                tone: KPI_DATA.satisfaction.tone
              }
            }
          ]
        },
        // Rangée graphiques
        {
          el: "div",
          props: { class: "dash-charts-row" },
          children: [
            {
              el: "div",
              props: { class: "dash-chart-main" },
              children: [
                {
                  comp: "LineChart",
                  props: {
                    label: locale.value === "fr" ? "Revenu mensuel (6 derniers mois)" : "Monthly Revenue (last 6 months)",
                    data: LINE_DATA,
                    tone: "category1",
                    height: 220
                  }
                }
              ]
            },
            {
              el: "div",
              props: { class: "dash-chart-side" },
              children: [
                {
                  comp: "BarChart",
                  props: {
                    label: locale.value === "fr" ? "Revenu par tenant" : "Revenue by tenant",
                    data: BAR_DATA,
                    height: 220
                  }
                }
              ]
            },
            {
              el: "div",
              props: { class: "dash-chart-side" },
              children: [
                {
                  comp: "DonutChart",
                  props: {
                    label: locale.value === "fr" ? "Sources d'acquisition" : "Acquisition sources",
                    data: DONUT_DATA,
                    height: 220
                  }
                }
              ]
            }
          ]
        },
        // Table Top N
        {
          el: "div",
          props: { class: "dash-table-section" },
          children: [
            {
              el: "h3",
              props: { class: "dash-section-title" },
              children: [locale.value === "fr" ? "Top 5 clients : revenu juin 2026" : "Top 5 clients: June 2026 revenue"]
            },
            {
              comp: "DataTable",
              props: {
                columns: TABLE_COLUMNS.map((c) => ({ key: c.key, label: c.header(), align: c.align })),
                rows: TABLE_ROWS.map((r) => ({ ...r, statut: r.statut })),
                size: "sm"
              }
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" },
    { name: "LineChart", slug: "line-chart" },
    { name: "BarChart", slug: "bar-chart" },
    { name: "DonutChart", slug: "donut-chart" },
    { name: "DataTable", slug: "data-table" },
    { name: "Header", slug: "header" },
    { name: "SideNav", slug: "side-nav" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Vue · Analytics / BI" : "View · Analytics / BI"}
    </p>
    <div class="docs-hero-title">
      <h1>{locale.value === "fr" ? "Dashboard exécutif" : "Executive Dashboard"}</h1>
      <Badge tone="success">{locale.value === "fr" ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Vue préfabriquée : 4 indicateurs KPI en rangée, graphique linéaire de tendance,
        graphique en barres par segment, donut de répartition, et table Top N. Un seul
        <code>NodeSpec</code> → rendu identique en Svelte, React, Vue et Angular.
      {:else}
        Prefabricated view: 4 KPI indicators in a row, trend line chart, bar chart by segment,
        acquisition donut, and a Top-N data table. One <code>NodeSpec</code> → identical
        render in Svelte, React, Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular. Le rendu et le
        code copié reflètent le framework sélectionné globalement.
      {:else}
        Use the tabs to switch between Svelte, React, Vue, and Angular. The render and copied code
        reflect the globally selected framework.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Dashboard exécutif : données mock" : "Executive Dashboard: mock data"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="dash-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li>
          <Link href="/components/{comp.slug}">{comp.name}</Link>
        </li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Variantes prévues" : "Planned variants"}</h2>
    <ul class="dash-variants-list">
      <li>{locale.value === "fr" ? "État chargement (squelettes KPI + graphiques)" : "Loading state (KPI + chart skeletons)"}</li>
      <li>{locale.value === "fr" ? "État vide (EmptyState pour chaque section)" : "Empty state (EmptyState per section)"}</li>
      <li>{locale.value === "fr" ? "Vue dense (taille sm sur tous les composants)" : "Dense view (sm size on all components)"}</li>
      <li>{locale.value === "fr" ? "Avec SideNav + Header (app shell complet)" : "With SideNav + Header (full app shell)"}</li>
      <li>{locale.value === "fr" ? "Rendu sous thème Airbus / Carbon / DSFR" : "Render under Airbus / Carbon / DSFR theme"}</li>
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

  .dash-comp-list,
  .dash-variants-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Styles globaux du layout dashboard (propagés dans les îles React/Vue/Angular) */
  :global(.dash-layout) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :global(.dash-kpi-row) {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    width: 100%;
  }

  :global(.dash-charts-row) {
    display: grid;
    gap: 1rem;
    grid-template-columns: 2fr 1fr 1fr;
    width: 100%;
  }

  :global(.dash-chart-main),
  :global(.dash-chart-side) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
  }

  :global(.dash-table-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
    width: 100%;
  }

  :global(.dash-section-title) {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  /* Responsive : sur mobile, graphiques en colonne */
  @media (max-width: 860px) {
    :global(.dash-charts-row) {
      grid-template-columns: 1fr;
    }
  }
</style>
