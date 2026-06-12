<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (fiche client) ───────────────────────────────────

  const FIELDS = $derived([
    { key: fr ? "Raison sociale" : "Legal name", value: "Airbus Group SE" },
    { key: fr ? "Numéro client" : "Customer no.", value: "C-001042" },
    { key: "SIREN", value: "383 474 814" },
    { key: fr ? "Secteur" : "Industry", value: fr ? "Aéronautique & Défense" : "Aerospace & Defense" },
    { key: fr ? "Contact principal" : "Primary contact", value: "Marie Lefebvre" },
    { key: "Email", value: "m.lefebvre@airbus.example" },
    { key: fr ? "Téléphone" : "Phone", value: "+33 5 61 93 33 33" },
    { key: fr ? "Pays" : "Country", value: "France" }
  ]);

  const KPIS = $derived([
    { label: fr ? "Chiffre d'affaires" : "Revenue", value: 1240000, format: "currency" as const, delta: 0.124, deltaFormat: "percent" as const, tone: "category1" as const },
    { label: fr ? "Factures ouvertes" : "Open invoices", value: 7, delta: -2, deltaFormat: "absolute" as const, tone: "category2" as const },
    { label: fr ? "Encours" : "Outstanding", value: 84200, format: "currency" as const, delta: 0.03, deltaFormat: "percent" as const, tone: "category3" as const },
    { label: fr ? "Délai paiement moyen" : "Avg. payment delay", value: 28, unit: fr ? " j" : " d", delta: -3, deltaFormat: "absolute" as const, tone: "category4" as const }
  ]);

  const RELATED_COLUMNS = [
    { key: "ref", label: () => (fr ? "Référence" : "Reference"), sortable: true },
    { key: "date", label: () => "Date", sortable: true },
    { key: "montant", label: () => (fr ? "Montant" : "Amount"), sortable: true, align: "end" as const },
    { key: "statut", label: () => (fr ? "Statut" : "Status"), sortable: true }
  ];

  const RELATED_ROWS = [
    { id: "1", ref: "INV/2026/0142", date: "2026-06-01", montant: "42 300 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "2", ref: "INV/2026/0128", date: "2026-04-18", montant: "37 100 €", statut: () => (fr ? "Payée" : "Paid") },
    { id: "3", ref: "INV/2026/0119", date: "2026-03-22", montant: "29 800 €", statut: () => (fr ? "En attente" : "Pending") },
    { id: "4", ref: "INV/2026/0103", date: "2026-02-09", montant: "18 900 €", statut: () => (fr ? "En retard" : "Overdue") }
  ];

  const BREADCRUMB_ITEMS = [
    { label: () => (fr ? "Accueil" : "Home"), href: "#" },
    { label: () => (fr ? "Clients" : "Customers"), href: "#" },
    { label: () => "Airbus Group SE", current: true }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "op-shell" },
      children: [
        // Fil d'Ariane
        {
          comp: "Breadcrumb",
          props: {
            items: BREADCRUMB_ITEMS.map((b) => ({ label: b.label(), href: b.href, current: b.current }))
          }
        },
        // En-tête d'entité : titre + statut + actions
        {
          el: "div",
          props: { class: "op-header" },
          children: [
            {
              el: "div",
              props: { class: "op-header-id" },
              children: [
                { el: "h2", props: { class: "op-title" }, children: ["Airbus Group SE"] },
                { comp: "Badge", props: { tone: "success" }, children: [fr ? "Client actif" : "Active customer"] }
              ]
            },
            {
              el: "div",
              props: { class: "op-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Modifier" : "Edit"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouvelle facture" : "New invoice"] }
              ]
            }
          ]
        },
        // Rangée KPI
        {
          el: "div",
          props: { class: "op-kpi-row" },
          children: KPIS.map((k) => ({
            comp: "KpiCard" as const,
            props: {
              label: k.label,
              value: k.value,
              format: k.format,
              unit: k.unit,
              delta: k.delta,
              deltaFormat: k.deltaFormat,
              tone: k.tone
            }
          }))
        },
        // Onglets
        {
          comp: "Tabs",
          props: {
            items: [
              { id: "details", label: fr ? "Détails" : "Details", content: fr ? "Informations générales de l'entité." : "General entity information." },
              { id: "invoices", label: fr ? "Factures" : "Invoices", content: fr ? "Historique des factures liées." : "Linked invoice history." },
              { id: "activity", label: fr ? "Activité" : "Activity", content: fr ? "Journal d'activité récent." : "Recent activity log." }
            ]
          }
        },
        // Section champs (StructuredList)
        {
          el: "div",
          props: { class: "op-section" },
          children: [
            { el: "h3", props: { class: "op-section-title" }, children: [fr ? "Informations générales" : "General information"] },
            {
              comp: "StructuredList",
              props: {
                bordered: true,
                items: FIELDS.map((field) => ({ key: field.key, term: field.key, value: field.value }))
              }
            }
          ]
        },
        // Section lignes liées (DataTable)
        {
          el: "div",
          props: { class: "op-section" },
          children: [
            { el: "h3", props: { class: "op-section-title" }, children: [fr ? "Factures liées" : "Linked invoices"] },
            {
              comp: "DataTable",
              props: {
                caption: fr ? "Factures du client" : "Customer invoices",
                columns: RELATED_COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable, align: c.align })),
                rows: RELATED_ROWS.map((r) => ({ ...r, statut: r.statut() })),
                sortable: true,
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
    { name: "Breadcrumb", slug: "breadcrumb" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Tabs", slug: "tabs" },
    { name: "StructuredList", slug: "structured-list" },
    { name: "DataTable", slug: "data-table" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Patron de fiche" : "View · Object pattern"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Page objet" : "Object Page"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Patron de toutes les fiches (client, produit, facture…). Fil d'Ariane + en-tête d'entité
        (titre + <code>Badge</code> de statut + actions) + onglets + rangée de <code>KpiCard</code>
        + liste structurée des champs + table de lignes liées. Un seul <code>NodeSpec</code> →
        rendu identique en Svelte, React et Vue.
      {:else}
        The pattern for every detail view (customer, product, invoice…). Breadcrumb + entity header
        (title + status <code>Badge</code> + actions) + tabs + <code>KpiCard</code> row + structured
        field list + related-rows table. One <code>NodeSpec</code> → identical render in Svelte,
        React, and Vue.
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
      title={fr ? "Page objet : fiche client (données mock)" : "Object Page : customer detail (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="op-comp-list">
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

  .op-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Object Page (global → propagé dans les îles React/Vue) ──────── */
  :global(.op-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.op-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.op-header-id) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.op-title) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.op-header-actions) {
    display: flex;
    gap: 0.5rem;
  }

  :global(.op-kpi-row) {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    width: 100%;
  }

  :global(.op-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    width: 100%;
  }

  :global(.op-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.85rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }
</style>
