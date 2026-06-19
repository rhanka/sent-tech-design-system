<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (balance comptable) ─────────────────────────────────────

  const PERIOD_OPTIONS = $derived([
    { value: "2026-05", label: fr ? "Mai 2026" : "May 2026" },
    { value: "2026-04", label: fr ? "Avril 2026" : "April 2026" },
    { value: "2026-03", label: fr ? "Mars 2026" : "March 2026" },
    { value: "2026-q1", label: fr ? "T1 2026" : "Q1 2026" }
  ]);

  const COLUMNS = $derived([
    { key: "compte", label: fr ? "N° compte" : "Account no.", sortable: true },
    { key: "libelle", label: fr ? "Libellé" : "Label", sortable: false },
    { key: "debit", label: fr ? "Débit" : "Debit", sortable: true, align: "end" as const },
    { key: "credit", label: fr ? "Crédit" : "Credit", sortable: true, align: "end" as const },
    { key: "solde", label: fr ? "Solde" : "Balance", sortable: true, align: "end" as const },
    { key: "statut", label: fr ? "Statut" : "Status", sortable: false }
  ]);

  const ROWS = $derived([
    { id: "1", compte: "101000", libelle: fr ? "Capital social" : "Share capital", debit: "0,00 €", credit: "250 000,00 €", solde: "-250 000,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "2", compte: "401000", libelle: fr ? "Fournisseurs" : "Accounts payable", debit: "18 340,00 €", credit: "52 780,00 €", solde: "-34 440,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "3", compte: "411000", libelle: fr ? "Clients" : "Accounts receivable", debit: "87 450,00 €", credit: "41 200,00 €", solde: "46 250,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "4", compte: "512000", libelle: fr ? "Banque principale" : "Main bank account", debit: "124 900,00 €", credit: "98 300,00 €", solde: "26 600,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "5", compte: "607000", libelle: fr ? "Achats de marchandises" : "Purchases", debit: "34 120,00 €", credit: "0,00 €", solde: "34 120,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "6", compte: "613200", libelle: fr ? "Locations et charges locatives" : "Rent & occupancy", debit: "8 400,00 €", credit: "0,00 €", solde: "8 400,00 €", statut: fr ? "Équilibré" : "Balanced" },
    { id: "7", compte: "707000", libelle: fr ? "Ventes de marchandises" : "Sales revenue", debit: "0,00 €", credit: "142 600,00 €", solde: "-142 600,00 €", statut: fr ? "Équilibré" : "Balanced" }
  ]);

  const KPI_TOTAL_DEBIT = "273 210,00 €";
  const KPI_TOTAL_CREDIT = "597 380,00 €";
  const KPI_COMPTES = "7";

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "tb-shell" },
      children: [
        // Barre de titre + actions
        {
          el: "div",
          props: { class: "tb-titlebar" },
          children: [
            { el: "h2", props: { class: "tb-title" }, children: [fr ? "Balance comptable" : "Trial Balance"] },
            {
              el: "div",
              props: { class: "tb-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Exporter CSV" : "Export CSV"] },
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Imprimer" : "Print"] }
              ]
            }
          ]
        },
        // Filtres : période + statut
        {
          el: "div",
          props: { class: "tb-filters" },
          children: [
            {
              comp: "Select",
              props: {
                label: fr ? "Période" : "Period",
                value: "2026-05",
                options: PERIOD_OPTIONS
              }
            },
            {
              comp: "DatePicker",
              props: {
                label: fr ? "Date de clôture" : "Closing date",
                value: "2026-05-31"
              }
            },
            {
              comp: "Select",
              props: {
                label: fr ? "Classe de compte" : "Account class",
                value: "all",
                options: [
                  { value: "all", label: fr ? "Toutes les classes" : "All classes" },
                  { value: "1", label: fr ? "Classe 1 — Capitaux" : "Class 1 — Equity" },
                  { value: "4", label: fr ? "Classe 4 — Tiers" : "Class 4 — Third parties" },
                  { value: "6", label: fr ? "Classe 6 — Charges" : "Class 6 — Expenses" },
                  { value: "7", label: fr ? "Classe 7 — Produits" : "Class 7 — Revenue" }
                ]
              }
            }
          ]
        },
        // KPI cards
        {
          el: "div",
          props: { class: "tb-kpis" },
          children: [
            {
              comp: "KpiCard",
              props: { label: fr ? "Total débit" : "Total debit", value: KPI_TOTAL_DEBIT, trend: "neutral" }
            },
            {
              comp: "KpiCard",
              props: { label: fr ? "Total crédit" : "Total credit", value: KPI_TOTAL_CREDIT, trend: "neutral" }
            },
            {
              comp: "KpiCard",
              props: { label: fr ? "Comptes actifs" : "Active accounts", value: KPI_COMPTES, trend: "neutral" }
            }
          ]
        },
        // Grille de la balance
        {
          comp: "DataGrid",
          props: {
            caption: fr ? "Balance générale — Mai 2026" : "General trial balance — May 2026",
            columns: COLUMNS,
            rows: ROWS,
            sortable: true,
            pageSize: 8,
            size: "sm"
          }
        },
        // Badge récapitulatif
        {
          el: "div",
          props: { class: "tb-footer" },
          children: [
            { comp: "Badge", props: { tone: "success" }, children: [fr ? "Balance équilibrée" : "Balanced"] },
            { el: "span", props: { class: "tb-footer-label" }, children: [fr ? "Prêt pour clôture" : "Ready for period close"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "DataGrid", slug: "data-grid" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Select", slug: "select" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Comptabilité" : "View · Accounting"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Balance comptable" : "Trial Balance"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Grille de la balance générale par compte avec totaux débit/crédit, filtres par période et
        export. Pour la revue de la balance avant clôture. Combine <code>DataGrid</code>,
        <code>KpiCard</code>, <code>Select</code>, <code>DatePicker</code>, <code>Badge</code> et
        <code>Button</code> en un seul <code>NodeSpec</code> → rendu identique en Svelte, React, Vue
        et Angular.
      {:else}
        Trial balance grid by account with debit/credit totals, period filters and export. For
        reviewing the balance before period close. Combines <code>DataGrid</code>,
        <code>KpiCard</code>, <code>Select</code>, <code>DatePicker</code>, <code>Badge</code> and
        <code>Button</code> in one <code>NodeSpec</code> → identical render in Svelte, React, Vue,
        and Angular.
      {/if}
    </p>
  </section>

  <TabbedExample
    nodes={demoNodes}
    title={fr ? "Balance comptable — Mai 2026 (données mock)" : "Trial Balance — May 2026 (mock data)"}
  />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="tb-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .tb-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.tb-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.tb-titlebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.tb-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.tb-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.tb-filters) {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  :global(.tb-kpis) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  :global(.tb-footer) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  :global(.tb-footer-label) {
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 640px) {
    :global(.tb-kpis) {
      grid-template-columns: 1fr;
    }
  }
</style>
