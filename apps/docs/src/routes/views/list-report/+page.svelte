<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (factures) ───────────────────────────────────────

  const NAV_ITEMS = [
    { label: () => (fr ? "Tableau de bord" : "Dashboard"), href: "#" },
    { label: () => (fr ? "Factures" : "Invoices"), href: "#", active: true },
    { label: () => (fr ? "Devis" : "Quotes"), href: "#" },
    { label: () => (fr ? "Clients" : "Customers"), href: "#" },
    { label: () => (fr ? "Produits" : "Products"), href: "#" },
    { label: () => (fr ? "Rapports" : "Reports"), href: "#" }
  ];

  const COLUMNS = [
    { key: "ref", label: () => (fr ? "Référence" : "Reference"), sortable: true },
    { key: "client", label: () => (fr ? "Client" : "Customer"), sortable: true },
    { key: "date", label: () => "Date", sortable: true },
    { key: "echeance", label: () => (fr ? "Échéance" : "Due date"), sortable: true },
    { key: "montant", label: () => (fr ? "Montant" : "Amount"), sortable: true, align: "end" as const },
    { key: "statut", label: () => (fr ? "Statut" : "Status"), sortable: true }
  ];

  const ROWS = [
    { id: "1", ref: "INV/2026/0142", client: "Airbus Group", date: "2026-06-01", echeance: "2026-07-01", montant: "42 300 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "2", ref: "INV/2026/0141", client: "Safran SA", date: "2026-05-29", echeance: "2026-06-28", montant: "31 800 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "3", ref: "INV/2026/0140", client: "Orange SA", date: "2026-05-27", echeance: "2026-06-26", montant: "18 500 €", statut: () => (fr ? "En attente" : "Pending") },
    { id: "4", ref: "INV/2026/0139", client: "Société Générale", date: "2026-05-24", echeance: "2026-06-23", montant: "14 200 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "5", ref: "INV/2026/0138", client: "Thales Group", date: "2026-05-20", echeance: "2026-06-04", montant: "11 000 €", statut: () => (fr ? "En retard" : "Overdue") },
    { id: "6", ref: "INV/2026/0137", client: "Capgemini", date: "2026-05-18", echeance: "2026-06-17", montant: "9 750 €", statut: () => (fr ? "Brouillon" : "Draft") },
    { id: "7", ref: "INV/2026/0136", client: "Dassault Systèmes", date: "2026-05-15", echeance: "2026-06-14", montant: "8 200 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "8", ref: "INV/2026/0135", client: "Atos SE", date: "2026-05-12", echeance: "2026-05-27", montant: "6 480 €", statut: () => (fr ? "En retard" : "Overdue") }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "lr-shell" },
      children: [
        // En-tête applicatif
        {
          comp: "Header",
          props: {
            title: "Sent Tech ERP",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label(), href: i.href, active: i.active })),
            account: { name: "Fabien Antoine", email: "fabien@sent-tech.ca" }
          }
        },
        // Corps : rail latéral + zone principale
        {
          el: "div",
          props: { class: "lr-body" },
          children: [
            {
              el: "aside",
              props: { class: "lr-aside" },
              children: [
                {
                  comp: "SideNav",
                  props: {
                    items: NAV_ITEMS.map((i) => ({ label: i.label(), href: i.href, active: i.active }))
                  }
                }
              ]
            },
            {
              el: "main",
              props: { class: "lr-main" },
              children: [
                // Barre de titre + actions
                {
                  el: "div",
                  props: { class: "lr-titlebar" },
                  children: [
                    { el: "h2", props: { class: "lr-title" }, children: [fr ? "Factures" : "Invoices"] },
                    {
                      el: "div",
                      props: { class: "lr-titlebar-actions" },
                      children: [
                        { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Exporter" : "Export"] },
                        { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouvelle facture" : "New invoice"] }
                      ]
                    }
                  ]
                },
                // Recherche + filtres
                {
                  el: "div",
                  props: { class: "lr-toolbar" },
                  children: [
                    {
                      el: "div",
                      props: { class: "lr-search" },
                      children: [
                        {
                          comp: "Search",
                          props: {
                            label: fr ? "Rechercher des factures" : "Search invoices",
                            placeholder: fr ? "Rechercher par référence ou client…" : "Search by reference or customer…"
                          }
                        }
                      ]
                    },
                    {
                      comp: "FilterBar",
                      props: { label: fr ? "Filtres actifs" : "Active filters" },
                      children: [
                        { comp: "FilterPill", props: { field: fr ? "Statut" : "Status", operator: "in", value: fr ? "Payée, En attente" : "Paid, Pending", active: true, removable: true } },
                        { comp: "FilterPill", props: { field: "Date", operator: ">=", value: "2026-05-01", active: true, removable: true } },
                        { comp: "FilterPill", props: { field: fr ? "Montant" : "Amount", operator: ">", value: "5 000 €", active: true, removable: true } }
                      ]
                    }
                  ]
                },
                // Table paginée
                {
                  el: "div",
                  props: { class: "lr-table" },
                  children: [
                    {
                      comp: "DataTable",
                      props: {
                        caption: fr ? "Liste des factures : mai/juin 2026" : "Invoice list : May/June 2026",
                        columns: COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable, align: c.align })),
                        rows: ROWS.map((r) => ({ ...r, statut: r.statut() })),
                        sortable: true,
                        pageSize: 5,
                        size: "sm"
                      }
                    }
                  ]
                },
                // Action de ligne (OverflowMenu)
                {
                  el: "div",
                  props: { class: "lr-rowmenu" },
                  children: [
                    { el: "span", props: { class: "lr-rowmenu-label" }, children: [fr ? "Actions sur une ligne :" : "Row actions:"] },
                    {
                      comp: "OverflowMenu",
                      props: {
                        label: "⋮",
                        items: [
                          { id: "view", label: fr ? "Ouvrir" : "Open" },
                          { id: "edit", label: fr ? "Modifier" : "Edit" },
                          { id: "send", label: fr ? "Envoyer" : "Send" },
                          { id: "delete", label: fr ? "Supprimer" : "Delete" }
                        ]
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

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Header", slug: "header" },
    { name: "SideNav", slug: "side-nav" },
    { name: "Search", slug: "search" },
    { name: "FilterBar", slug: "filter-bar" },
    { name: "FilterPill", slug: "filter-pill" },
    { name: "DataTable", slug: "data-table" },
    { name: "OverflowMenu", slug: "overflow-menu" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Patron de liste" : "View · List pattern"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Liste rapport" : "List Report"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Patron de toutes les listes métier (factures, articles, tickets…). Header + navigation
        latérale + barre de recherche + barre de filtres (<code>FilterPill</code>) + table paginée
        triable + menu d'actions par ligne. Un seul <code>NodeSpec</code> → rendu identique en
        Svelte, React et Vue. Débloque 20+ écrans liste de gestion par simple échange de colonnes/données.
      {:else}
        The pattern for every business list (invoices, items, tickets…). Header + side navigation +
        search + filter bar (<code>FilterPill</code>) + sortable paginated table + per-row action menu.
        One <code>NodeSpec</code> → identical render in Svelte, React, and Vue. Unlocks 20+ business list
        views by swapping columns/data.
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
      title={fr ? "Liste rapport : factures (données mock)" : "List Report : invoices (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="lr-comp-list">
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

  .lr-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout List Report (global → propagé dans les îles React/Vue) ──────── */
  :global(.lr-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.lr-body) {
    display: grid;
    grid-template-columns: 220px 1fr;
    width: 100%;
    min-height: 0;
  }

  :global(.lr-aside) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.75rem;
  }

  :global(.lr-main) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    min-width: 0;
  }

  :global(.lr-titlebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.lr-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.lr-titlebar-actions) {
    display: flex;
    gap: 0.5rem;
  }

  :global(.lr-toolbar) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.lr-search) {
    max-width: 420px;
    width: 100%;
  }

  :global(.lr-rowmenu) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 760px) {
    :global(.lr-body) {
      grid-template-columns: 1fr;
    }
    :global(.lr-aside) {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
