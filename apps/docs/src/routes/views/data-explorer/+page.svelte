<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (pivot ventes par région × trimestre) ────────────

  const TABLE_COLUMNS = [
    { key: "region", label: () => (fr ? "Région" : "Region"), sortable: true },
    { key: "t1", label: () => "T1", sortable: true, align: "end" as const },
    { key: "t2", label: () => "T2", sortable: true, align: "end" as const },
    { key: "t3", label: () => "T3", sortable: true, align: "end" as const },
    { key: "t4", label: () => "T4", sortable: true, align: "end" as const },
    { key: "total", label: () => "Total", sortable: true, align: "end" as const }
  ];

  const TABLE_ROWS = [
    { id: "1", region: fr ? "Europe" : "Europe", t1: "320 k€", t2: "358 k€", t3: "372 k€", t4: "410 k€", total: "1 460 k€" },
    { id: "2", region: fr ? "Amérique du Nord" : "North America", t1: "280 k€", t2: "295 k€", t3: "310 k€", t4: "342 k€", total: "1 227 k€" },
    { id: "3", region: fr ? "Asie-Pacifique" : "Asia-Pacific", t1: "180 k€", t2: "204 k€", t3: "228 k€", t4: "256 k€", total: "868 k€" },
    { id: "4", region: fr ? "Moyen-Orient" : "Middle East", t1: "95 k€", t2: "102 k€", t3: "118 k€", t4: "131 k€", total: "446 k€" },
    { id: "5", region: fr ? "Amérique latine" : "Latin America", t1: "72 k€", t2: "81 k€", t3: "88 k€", t4: "97 k€", total: "338 k€" }
  ];

  const BAR_DATA = [
    { x: fr ? "Europe" : "Europe", y: 1460 },
    { x: fr ? "Am. du Nord" : "N. America", y: 1227 },
    { x: fr ? "Asie-Pac." : "Asia-Pac.", y: 868 },
    { x: fr ? "Moy.-Orient" : "Mid. East", y: 446 },
    { x: fr ? "Am. latine" : "Lat. America", y: 338 }
  ];

  const DIM_OPTIONS = [
    { value: "region", label: fr ? "Région" : "Region" },
    { value: "product", label: fr ? "Produit" : "Product" },
    { value: "channel", label: fr ? "Canal" : "Channel" },
    { value: "rep", label: fr ? "Commercial" : "Sales rep" }
  ];

  const MEASURE_OPTIONS = [
    { value: "revenue", label: fr ? "Chiffre d'affaires" : "Revenue" },
    { value: "margin", label: fr ? "Marge" : "Margin" },
    { value: "units", label: fr ? "Unités vendues" : "Units sold" },
    { value: "orders", label: fr ? "Commandes" : "Orders" }
  ];

  const AGG_OPTIONS = [
    { value: "sum", label: fr ? "Somme" : "Sum" },
    { value: "avg", label: fr ? "Moyenne" : "Average" },
    { value: "min", label: "Min" },
    { value: "max", label: "Max" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "de-shell" },
      children: [
        // Barre d'outils : recherche + filtres
        {
          el: "div",
          props: { class: "de-toolbar" },
          children: [
            {
              el: "div",
              props: { class: "de-search" },
              children: [
                {
                  comp: "Search",
                  props: {
                    label: fr ? "Rechercher une dimension" : "Search a dimension",
                    placeholder: fr ? "Rechercher (région, produit, canal…)" : "Search (region, product, channel…)"
                  }
                }
              ]
            },
            {
              comp: "FilterBar",
              props: { label: fr ? "Filtres actifs" : "Active filters" },
              children: [
                { comp: "FilterPill", props: { field: fr ? "Année" : "Year", operator: "=", value: "2026", active: true, removable: true } },
                { comp: "FilterPill", props: { field: fr ? "Segment" : "Segment", operator: "in", value: fr ? "B2B, B2C" : "B2B, B2C", active: true, removable: true } }
              ]
            }
          ]
        },
        // Bascule table / graphique + bouton configurer
        {
          el: "div",
          props: { class: "de-controls" },
          children: [
            {
              comp: "ContentSwitcher",
              props: {
                items: [
                  { id: "table", label: fr ? "Tableau" : "Table" },
                  { id: "chart", label: fr ? "Graphique" : "Chart" }
                ]
              }
            },
            { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Configurer" : "Configure"] }
          ]
        },
        // Zone côte à côte : pivot (table) + graphique
        {
          el: "div",
          props: { class: "de-split" },
          children: [
            {
              el: "div",
              props: { class: "de-panel" },
              children: [
                { el: "h3", props: { class: "de-panel-title" }, children: [fr ? "Tableau croisé : CA par région × trimestre" : "Pivot: revenue by region × quarter"] },
                {
                  comp: "DataTable",
                  props: {
                    caption: fr ? "Chiffre d'affaires 2026 (k€)" : "2026 revenue (k€)",
                    columns: TABLE_COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable, align: c.align })),
                    rows: TABLE_ROWS,
                    sortable: true,
                    size: "sm"
                  }
                }
              ]
            },
            {
              el: "div",
              props: { class: "de-panel" },
              children: [
                { el: "h3", props: { class: "de-panel-title" }, children: [fr ? "Total par région (k€)" : "Total by region (k€)"] },
                {
                  comp: "BarChart",
                  props: {
                    label: fr ? "CA total par région" : "Total revenue by region",
                    data: BAR_DATA,
                    height: 260
                  }
                }
              ]
            }
          ]
        },
        // Volet de configuration (Drawer) : panneau latéral pivot
        {
          comp: "Drawer",
          props: {
            open: true,
            side: "right",
            placement: "right",
            title: fr ? "Configurer le tableau croisé" : "Configure pivot",
            description: fr ? "Choisissez les dimensions et la mesure à agréger." : "Pick the dimensions and the measure to aggregate."
          },
          children: [
            {
              el: "div",
              props: { class: "de-drawer-form" },
              children: [
                {
                  comp: "Select",
                  props: {
                    label: fr ? "Lignes (dimension)" : "Rows (dimension)",
                    value: "region",
                    options: DIM_OPTIONS
                  }
                },
                {
                  comp: "Select",
                  props: {
                    label: fr ? "Mesure" : "Measure",
                    value: "revenue",
                    options: MEASURE_OPTIONS
                  }
                },
                {
                  comp: "Select",
                  props: {
                    label: fr ? "Agrégation" : "Aggregation",
                    value: "sum",
                    options: AGG_OPTIONS
                  }
                },
                {
                  el: "div",
                  props: { class: "de-drawer-actions" },
                  children: [
                    { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Réinitialiser" : "Reset"] },
                    { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Appliquer" : "Apply"] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Search", slug: "search" },
    { name: "FilterBar", slug: "filter-bar" },
    { name: "FilterPill", slug: "filter-pill" },
    { name: "ContentSwitcher", slug: "content-switcher" },
    { name: "DataTable", slug: "data-table" },
    { name: "BarChart", slug: "bar-chart" },
    { name: "Drawer", slug: "drawer" },
    { name: "Select", slug: "select" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Analytics / BI" : "View · Analytics / BI"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Explorateur de données" : "Data Explorer"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Vitrine BI pivot : barre de recherche + barre de filtres + bascule
        <code>ContentSwitcher</code> (tableau / graphique) + tableau croisé (<code>DataTable</code>)
        et <code>BarChart</code> côte à côte + volet de configuration (<code>Drawer</code>) avec
        <code>Select</code> de dimension, mesure et agrégation. Un seul <code>NodeSpec</code> →
        rendu identique en Svelte, React et Vue.
      {:else}
        Pivot BI showcase: search + filter bar + <code>ContentSwitcher</code> toggle
        (table / chart) + a pivot <code>DataTable</code> and a <code>BarChart</code> side by side +
        a configuration <code>Drawer</code> with dimension, measure and aggregation
        <code>Select</code>s. One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu tri-framework" : "Tri-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React et Vue. Le rendu et le code copié reflètent le framework sélectionné."
        : "Use the tabs to switch between Svelte, React, and Vue. The render and copied code reflect the selected framework."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Explorateur de données : pivot ventes (données mock)" : "Data Explorer : sales pivot (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="de-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
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

  .de-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Data Explorer (global → propagé dans les îles React/Vue) ────── */
  :global(.de-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.de-toolbar) {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem;
  }

  :global(.de-search) {
    max-width: 420px;
    width: 100%;
    flex: 1 1 280px;
  }

  :global(.de-controls) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.de-split) {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 1rem;
    width: 100%;
    align-items: start;
  }

  :global(.de-panel) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1rem;
    min-width: 0;
  }

  :global(.de-panel-title) {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.de-drawer-form) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.de-drawer-actions) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  @media (max-width: 860px) {
    :global(.de-split) {
      grid-template-columns: 1fr;
    }
  }
</style>
