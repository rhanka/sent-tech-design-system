<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock bilingues (factures fournisseurs) ────────────────────────

  const COLUMNS = $derived([
    { key: "ref", label: fr ? "N° facture" : "Invoice #", sortable: true },
    { key: "fournisseur", label: fr ? "Fournisseur" : "Supplier", sortable: true },
    { key: "date", label: fr ? "Date" : "Date", sortable: true },
    { key: "echeance", label: fr ? "Échéance" : "Due date", sortable: true },
    { key: "montant", label: fr ? "Montant HT" : "Amount (excl.)", sortable: true, align: "end" as const },
    { key: "statut", label: fr ? "Statut" : "Status", sortable: true }
  ]);

  const ROWS = $derived([
    { id: "1", ref: "FOURN/2026/0318", fournisseur: "Atos SE", date: "2026-06-10", echeance: "2026-07-10", montant: "28 400 €", statut: fr ? "En attente" : "Pending" },
    { id: "2", ref: "FOURN/2026/0317", fournisseur: "Capgemini", date: "2026-06-07", echeance: "2026-07-07", montant: "19 200 €", statut: fr ? "Approuvée" : "Approved" },
    { id: "3", ref: "FOURN/2026/0316", fournisseur: "Sopra Steria", date: "2026-06-04", echeance: "2026-06-19", montant: "14 500 €", statut: fr ? "En retard" : "Overdue" },
    { id: "4", ref: "FOURN/2026/0315", fournisseur: "CGI Inc.", date: "2026-06-01", echeance: "2026-07-01", montant: "11 750 €", statut: fr ? "Approuvée" : "Approved" },
    { id: "5", ref: "FOURN/2026/0314", fournisseur: "Wavestone", date: "2026-05-28", echeance: "2026-06-27", montant: "9 300 €", statut: fr ? "Payée" : "Paid" },
    { id: "6", ref: "FOURN/2026/0313", fournisseur: "Atos SE", date: "2026-05-24", echeance: "2026-06-08", montant: "7 820 €", statut: fr ? "En retard" : "Overdue" },
    { id: "7", ref: "FOURN/2026/0312", fournisseur: "Econocom", date: "2026-05-20", echeance: "2026-06-19", montant: "6 410 €", statut: fr ? "Payée" : "Paid" }
  ]);

  const SUPPLIER_OPTIONS = $derived([
    { value: "", label: fr ? "Tous les fournisseurs" : "All suppliers" },
    { value: "atos", label: "Atos SE" },
    { value: "capgemini", label: "Capgemini" },
    { value: "sopra", label: "Sopra Steria" },
    { value: "cgi", label: "CGI Inc." },
    { value: "wavestone", label: "Wavestone" },
    { value: "econocom", label: "Econocom" }
  ]);

  const STATUS_OPTIONS = $derived([
    { value: "", label: fr ? "Tous les statuts" : "All statuses" },
    { value: "pending", label: fr ? "En attente" : "Pending" },
    { value: "approved", label: fr ? "Approuvée" : "Approved" },
    { value: "overdue", label: fr ? "En retard" : "Overdue" },
    { value: "paid", label: fr ? "Payée" : "Paid" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "ff-shell" },
      children: [
        // Barre titre + actions
        {
          el: "div",
          props: { class: "ff-titlebar" },
          children: [
            { el: "h2", props: { class: "ff-title" }, children: [fr ? "Factures fournisseurs" : "Supplier Invoices"] },
            {
              el: "div",
              props: { class: "ff-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Exporter" : "Export"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Déposer une facture" : "Upload invoice"] }
              ]
            }
          ]
        },
        // Alerte factures en retard
        {
          comp: "Alert",
          props: {
            tone: "warning",
            title: fr ? "2 factures en retard" : "2 overdue invoices",
            description: fr
              ? "Des factures dépassent leur échéance. Traitez-les en priorité pour éviter des pénalités."
              : "Some invoices are past due. Process them first to avoid late fees."
          }
        },
        // Filtres : fournisseur + statut + période
        {
          el: "div",
          props: { class: "ff-toolbar" },
          children: [
            {
              comp: "Combobox",
              props: {
                label: fr ? "Fournisseur" : "Supplier",
                options: SUPPLIER_OPTIONS,
                placeholder: fr ? "Filtrer par fournisseur…" : "Filter by supplier…"
              }
            },
            {
              comp: "Combobox",
              props: {
                label: fr ? "Statut" : "Status",
                options: STATUS_OPTIONS,
                placeholder: fr ? "Filtrer par statut…" : "Filter by status…"
              }
            },
            {
              comp: "DatePicker",
              props: {
                label: fr ? "Échéance avant le" : "Due before",
                placeholder: "YYYY-MM-DD"
              }
            }
          ]
        },
        // Table des factures fournisseurs
        {
          comp: "Table",
          props: {
            caption: fr ? "Factures fournisseurs : juin 2026" : "Supplier invoices : June 2026",
            columns: COLUMNS,
            rows: ROWS,
            sortable: true,
            pageSize: 5,
            size: "sm"
          }
        },
        // Téléversement pièce justificative
        {
          el: "div",
          props: { class: "ff-upload" },
          children: [
            { el: "h3", props: { class: "ff-section-title" }, children: [fr ? "Joindre une pièce justificative" : "Attach supporting document"] },
            {
              comp: "FileUploader",
              props: {
                label: fr ? "Téléverser un document" : "Upload document",
                accept: ".pdf,.png,.jpg",
                multiple: false,
                helperText: fr ? "PDF, PNG ou JPG — max 10 Mo" : "PDF, PNG or JPG — max 10 MB"
              }
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Table", slug: "table" },
    { name: "Badge", slug: "badge" },
    { name: "Combobox", slug: "combobox" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "FileUploader", slug: "file-uploader" },
    { name: "Alert", slug: "alert" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Comptabilité" : "Accounting"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Factures fournisseurs" : "Supplier Invoices"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Liste filtrable des factures fournisseurs avec statut de validation, échéances et téléversement de pièces. Pour le traitement et l'approbation des factures à payer."
        : "Filterable supplier invoice list with approval status, due dates and document upload. For processing and approving payables."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Factures fournisseurs (données mock)" : "Supplier Invoices (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ff-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .ff-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.ff-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.ff-titlebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.ff-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.ff-actions) {
    display: flex;
    gap: 0.5rem;
  }

  :global(.ff-toolbar) {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  :global(.ff-upload) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  :global(.ff-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.85rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }
</style>
