<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (fiche facture Odoo-like) ────────────────────────

  const BREADCRUMB_ITEMS = $derived([
    { label: fr ? "Comptabilité" : "Accounting", href: "#" },
    { label: fr ? "Factures clients" : "Customer invoices", href: "#" },
    { label: "INV/2026/0142", current: true }
  ]);

  const INFO_FIELDS = $derived([
    { key: fr ? "Client" : "Customer", value: "Airbus Group SE" },
    { key: fr ? "Adresse de facturation" : "Billing address", value: fr ? "2 rond-point Émile Dewoitine, 31700 Blagnac" : "2 rond-point Émile Dewoitine, 31700 Blagnac, France" },
    { key: fr ? "Date de facturation" : "Invoice date", value: "2026-06-01" },
    { key: fr ? "Date d'échéance" : "Due date", value: "2026-07-01" },
    { key: fr ? "Conditions de paiement" : "Payment terms", value: fr ? "30 jours net" : "30 days net" },
    { key: fr ? "Référence client" : "Customer ref.", value: "PO-AIR-88421" }
  ]);

  const LINE_COLUMNS = [
    { key: "designation", label: () => (fr ? "Désignation" : "Description"), sortable: false },
    { key: "qte", label: () => (fr ? "Qté" : "Qty"), sortable: false, align: "end" as const },
    { key: "pu", label: () => (fr ? "Prix unitaire" : "Unit price"), sortable: false, align: "end" as const },
    { key: "total", label: () => (fr ? "Total HT" : "Subtotal"), sortable: false, align: "end" as const }
  ];

  const LINE_ROWS = $derived([
    { id: "1", designation: fr ? "Licence Design System : abonnement annuel" : "Design System license : annual", qte: "10", pu: "1 200 €", total: "12 000 €" },
    { id: "2", designation: fr ? "Atelier de conception (jours)" : "Design workshop (days)", qte: "8", pu: "1 500 €", total: "12 000 €" },
    { id: "3", designation: fr ? "Audit d'accessibilité" : "Accessibility audit", qte: "1", pu: "9 800 €", total: "9 800 €" },
    { id: "4", designation: fr ? "Support premium (trimestre)" : "Premium support (quarter)", qte: "1", pu: "8 500 €", total: "8 500 €" }
  ]);

  const TOTALS = $derived([
    { key: fr ? "Total HT" : "Subtotal", value: "42 300 €" },
    { key: fr ? "TVA (20 %)" : "VAT (20%)", value: "8 460 €" },
    { key: fr ? "Total TTC" : "Total", value: "50 760 €" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fc-shell" },
      children: [
        // Fil d'Ariane
        { comp: "Breadcrumb", props: { items: BREADCRUMB_ITEMS } },
        // En-tête : n° facture + statut + actions
        {
          el: "div",
          props: { class: "fc-header" },
          children: [
            {
              el: "div",
              props: { class: "fc-header-id" },
              children: [
                { el: "h2", props: { class: "fc-title" }, children: ["INV/2026/0142"] },
                { comp: "Badge", props: { tone: "success" }, children: [fr ? "Payée" : "Paid"] }
              ]
            },
            {
              el: "div",
              props: { class: "fc-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Imprimer" : "Print"] },
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Envoyer" : "Send"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Enregistrer un paiement" : "Register payment"] }
              ]
            }
          ]
        },
        // Informations client / dates / conditions
        {
          el: "div",
          props: { class: "fc-section" },
          children: [
            { el: "h3", props: { class: "fc-section-title" }, children: [fr ? "Informations" : "Information"] },
            {
              comp: "StructuredList",
              props: {
                bordered: true,
                items: INFO_FIELDS.map((f) => ({ key: f.key, term: f.key, value: f.value }))
              }
            }
          ]
        },
        // Lignes de facture
        {
          el: "div",
          props: { class: "fc-section" },
          children: [
            { el: "h3", props: { class: "fc-section-title" }, children: [fr ? "Lignes de facture" : "Invoice lines"] },
            {
              comp: "DataTable",
              props: {
                caption: fr ? "Détail des lignes facturées" : "Itemized invoice lines",
                columns: LINE_COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable, align: c.align })),
                rows: LINE_ROWS,
                size: "sm"
              }
            }
          ]
        },
        // Totaux (HT / TVA / TTC)
        {
          el: "div",
          props: { class: "fc-totals" },
          children: [
            {
              comp: "StructuredList",
              props: {
                bordered: true,
                items: TOTALS.map((t) => ({ key: t.key, term: t.key, value: t.value }))
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
    { name: "StructuredList", slug: "structured-list" },
    { name: "DataTable", slug: "data-table" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Comptabilité (Odoo)" : "View · Accounting (Odoo)"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Facture client" : "Customer Invoice"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Déclinaison du patron page objet pour une fiche facture Odoo : <code>Breadcrumb</code> +
        en-tête (n° de facture + <code>Badge</code> de statut + <code>Button</code> d'actions) +
        <code>StructuredList</code> (client, dates, conditions) + <code>DataTable</code> des lignes
        + <code>StructuredList</code> des totaux (HT / TVA / TTC). Un seul <code>NodeSpec</code> →
        rendu identique en Svelte, React et Vue.
      {:else}
        A declination of the object-page pattern for an Odoo invoice: <code>Breadcrumb</code> +
        header (invoice number + status <code>Badge</code> + action <code>Button</code>s) +
        <code>StructuredList</code> (customer, dates, terms) + <code>DataTable</code> of lines +
        a totals <code>StructuredList</code> (subtotal / VAT / total). One <code>NodeSpec</code> →
        identical render in Svelte, React, and Vue.
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
      title={fr ? "Facture client : INV/2026/0142 (données mock)" : "Customer Invoice : INV/2026/0142 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="fc-comp-list">
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

  .fc-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Facture (global → propagé dans les îles React/Vue) ──────────── */
  :global(.fc-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.fc-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.fc-header-id) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.fc-title) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.fc-header-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.fc-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    width: 100%;
  }

  :global(.fc-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.85rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.fc-totals) {
    margin-left: auto;
    width: 100%;
    max-width: 360px;
  }

  @media (max-width: 760px) {
    :global(.fc-totals) {
      max-width: none;
    }
  }
</style>
