<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (catalogue clients, split Fiori) ──────────────────

  const ACCOUNTS = $derived([
    { value: "airbus", name: "Airbus Group SE", meta: fr ? "Aéronautique" : "Aerospace", selected: true },
    { value: "safran", name: "Safran SA", meta: fr ? "Aéronautique" : "Aerospace" },
    { value: "orange", name: "Orange SA", meta: fr ? "Télécoms" : "Telecom" },
    { value: "thales", name: "Thales Group", meta: fr ? "Défense" : "Defense" },
    { value: "atos", name: "Atos SE", meta: fr ? "Services IT" : "IT services" }
  ]);

  const DETAIL_FIELDS = $derived([
    { key: fr ? "Raison sociale" : "Legal name", value: "Airbus Group SE" },
    { key: fr ? "Numéro client" : "Customer no.", value: "C-001042" },
    { key: fr ? "Secteur" : "Industry", value: fr ? "Aéronautique & Défense" : "Aerospace & Defense" },
    { key: fr ? "Contact" : "Contact", value: "Marie Lefebvre" },
    { key: fr ? "Pays" : "Country", value: "France" }
  ]);

  const KPIS = $derived([
    { label: fr ? "Chiffre d'affaires" : "Revenue", value: 1240000, format: "currency" as const, delta: 0.124, deltaFormat: "percent" as const, tone: "category1" as const },
    { label: fr ? "Factures ouvertes" : "Open invoices", value: 7, delta: -2, deltaFormat: "absolute" as const, tone: "category2" as const }
  ]);

  const RELATED_COLUMNS = [
    { key: "ref", label: () => (fr ? "Référence" : "Reference"), sortable: true },
    { key: "date", label: () => "Date", sortable: true },
    { key: "montant", label: () => (fr ? "Montant" : "Amount"), sortable: true, align: "end" as const }
  ];

  const RELATED_ROWS = [
    { id: "1", ref: "INV/2026/0142", date: "2026-06-01", montant: "42 300 €" },
    { id: "2", ref: "INV/2026/0128", date: "2026-04-18", montant: "37 100 €" },
    { id: "3", ref: "INV/2026/0119", date: "2026-03-22", montant: "29 800 €" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "md-shell" },
      children: [
        // Volet gauche : liste sélectionnable
        {
          el: "aside",
          props: { class: "md-master" },
          children: [
            { el: "h3", props: { class: "md-master-title" }, children: [fr ? "Clients" : "Customers"] },
            {
              comp: "SelectableList",
              props: { label: fr ? "Liste des clients" : "Customer list", value: "airbus" },
              children: ACCOUNTS.map((a) => ({
                comp: "SelectableRow" as const,
                props: { value: a.value, selected: a.selected },
                children: [
                  {
                    el: "div",
                    props: { class: "md-row" },
                    children: [
                      { el: "span", props: { class: "md-row-name" }, children: [a.name] },
                      { el: "span", props: { class: "md-row-meta" }, children: [a.meta] }
                    ]
                  }
                ]
              }))
            }
          ]
        },
        // Volet droit : détail
        {
          el: "main",
          props: { class: "md-detail" },
          children: [
            {
              el: "div",
              props: { class: "md-detail-head" },
              children: [
                { el: "h2", props: { class: "md-detail-title" }, children: ["Airbus Group SE"] },
                { comp: "Badge", props: { tone: "success" }, children: [fr ? "Client actif" : "Active customer"] }
              ]
            },
            // Rangée KPI
            {
              el: "div",
              props: { class: "md-kpi-row" },
              children: KPIS.map((k) => ({
                comp: "KpiCard" as const,
                props: {
                  label: k.label,
                  value: k.value,
                  format: k.format,
                  delta: k.delta,
                  deltaFormat: k.deltaFormat,
                  tone: k.tone
                }
              }))
            },
            // Champs structurés
            {
              el: "div",
              props: { class: "md-detail-section" },
              children: [
                { el: "h3", props: { class: "md-detail-subtitle" }, children: [fr ? "Informations générales" : "General information"] },
                {
                  comp: "StructuredList",
                  props: {
                    bordered: true,
                    items: DETAIL_FIELDS.map((f) => ({ key: f.key, term: f.key, value: f.value }))
                  }
                }
              ]
            },
            // Mini table liée
            {
              el: "div",
              props: { class: "md-detail-section" },
              children: [
                { el: "h3", props: { class: "md-detail-subtitle" }, children: [fr ? "Dernières factures" : "Latest invoices"] },
                {
                  comp: "DataTable",
                  props: {
                    caption: fr ? "Factures récentes du client" : "Recent customer invoices",
                    columns: RELATED_COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable, align: c.align })),
                    rows: RELATED_ROWS,
                    size: "sm"
                  }
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
    { name: "SelectableList", slug: "selectable-list" },
    { name: "SelectableRow", slug: "selectable-row" },
    { name: "Badge", slug: "badge" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "StructuredList", slug: "structured-list" },
    { name: "DataTable", slug: "data-table" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Patron split" : "View · Split pattern"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Maître-détail" : "Master-Detail"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Patron Fiori split-view : <code>SelectableList</code> à gauche (lignes
        <code>SelectableRow</code> sélectionnables) et panneau détail à droite
        (<code>StructuredList</code> + rangée de <code>KpiCard</code> + mini <code>DataTable</code>).
        Un seul <code>NodeSpec</code> → rendu identique en Svelte, React et Vue.
      {:else}
        Fiori split-view pattern: <code>SelectableList</code> on the left (selectable
        <code>SelectableRow</code> items) and a detail panel on the right
        (<code>StructuredList</code> + <code>KpiCard</code> row + mini <code>DataTable</code>).
        One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
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
      title={fr ? "Maître-détail : clients (données mock)" : "Master-Detail : customers (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="md-comp-list">
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

  .md-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Master-Detail (global → propagé dans les îles React/Vue) ────── */
  :global(.md-shell) {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 0;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
    align-items: stretch;
  }

  :global(.md-master) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 1rem;
    min-width: 0;
  }

  :global(.md-master-title) {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0 0 0.75rem;
  }

  :global(.md-row) {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  :global(.md-row-name) {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.md-row-meta) {
    font-size: 0.78rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.md-detail) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    min-width: 0;
  }

  :global(.md-detail-head) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.md-detail-title) {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.md-kpi-row) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  :global(.md-detail-subtitle) {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  @media (max-width: 760px) {
    :global(.md-shell) {
      grid-template-columns: 1fr;
    }
    :global(.md-master) {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
