<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const SUPPLIERS = $derived([
    { value: "bosh", label: "Bosch Rexroth AG" },
    { value: "3m", label: "3M France SAS" },
    { value: "smc", label: "SMC Corporation" },
    { value: "festo", label: "Festo SE & Co. KG" }
  ]);

  const LINE_ROWS = $derived([
    { id: "1", ref: "BXR-7741", designation: fr ? "Vanne hydraulique 10L/min" : "10 L/min hydraulic valve", qty: "4", unit_price: "312,00 €", total: "1 248,00 €" },
    { id: "2", ref: "SMC-AF40", designation: fr ? "Filtre régulateur d'air" : "Air filter regulator", qty: "10", unit_price: "87,50 €", total: "875,00 €" },
    { id: "3", ref: "FES-ADVU", designation: fr ? "Vérin compact double effet" : "Compact double-acting cylinder", qty: "6", unit_price: "148,00 €", total: "888,00 €" },
    { id: "4", ref: "3M-VHB5952", designation: fr ? "Ruban adhésif haute résistance 25m" : "High-strength adhesive tape 25m", qty: "20", unit_price: "42,90 €", total: "858,00 €" }
  ]);

  const TOTALS = $derived([
    { key: fr ? "Total HT" : "Subtotal", value: "3 869,00 €" },
    { key: fr ? "TVA (20 %)" : "VAT (20 %)", value: "773,80 €" },
    { key: fr ? "Total TTC" : "Total", value: "4 642,80 €" }
  ]);

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "po-shell" },
      children: [
        {
          el: "div",
          props: { class: "po-header" },
          children: [
            {
              el: "div",
              props: { class: "po-header-id" },
              children: [
                { el: "h2", props: { class: "po-title" }, children: [fr ? "Nouvel ordre d'achat" : "New Purchase Order"] },
                { comp: "Badge", props: { tone: "warning" }, children: [fr ? "Brouillon" : "Draft"] }
              ]
            },
            {
              el: "div",
              props: { class: "po-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Annuler" : "Cancel"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Soumettre" : "Submit Order"] }
              ]
            }
          ]
        },
        {
          comp: "Card",
          props: {},
          children: [
            {
              el: "div",
              props: { class: "po-fields" },
              children: [
                {
                  el: "div",
                  props: { class: "po-field" },
                  children: [
                    { el: "label", props: { class: "po-label" }, children: [fr ? "Fournisseur" : "Supplier"] },
                    { comp: "Combobox", props: { options: SUPPLIERS, value: "bosh", placeholder: fr ? "Choisir un fournisseur…" : "Select a supplier…" } }
                  ]
                },
                {
                  el: "div",
                  props: { class: "po-field" },
                  children: [
                    { el: "label", props: { class: "po-label" }, children: [fr ? "Date de livraison souhaitée" : "Requested delivery date"] },
                    { comp: "DatePicker", props: { value: "2026-07-15", label: fr ? "Date de livraison" : "Delivery date" } }
                  ]
                },
                {
                  el: "div",
                  props: { class: "po-field" },
                  children: [
                    { el: "label", props: { class: "po-label" }, children: [fr ? "Référence commande" : "Order reference"] },
                    { comp: "Input", props: { value: "PO-2026-0847", placeholder: fr ? "Réf. interne…" : "Internal ref…" } }
                  ]
                }
              ]
            }
          ]
        },
        {
          el: "div",
          props: { class: "po-section" },
          children: [
            { el: "h3", props: { class: "po-section-title" }, children: [fr ? "Lignes d'articles" : "Line Items"] },
            {
              comp: "DataGrid",
              props: {
                caption: fr ? "Articles commandés" : "Ordered items",
                columns: [
                  { key: "ref", label: fr ? "Référence" : "Ref." },
                  { key: "designation", label: fr ? "Désignation" : "Description" },
                  { key: "qty", label: fr ? "Qté" : "Qty", align: "end" },
                  { key: "unit_price", label: fr ? "Prix unitaire" : "Unit price", align: "end" },
                  { key: "total", label: fr ? "Total HT" : "Subtotal", align: "end" }
                ],
                rows: LINE_ROWS
              }
            }
          ]
        },
        {
          el: "div",
          props: { class: "po-totals" },
          children: TOTALS.map((t) => ({
            el: "div",
            props: { class: "po-total-row" },
            children: [
              { el: "span", props: { class: "po-total-key" }, children: [t.key] },
              { el: "span", props: { class: "po-total-val" }, children: [t.value] }
            ]
          }))
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "Combobox", slug: "combobox" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "DataGrid", slug: "data-grid" },
    { name: "Input", slug: "input" },
    { name: "Card", slug: "card" },
    { name: "Button", slug: "button" },
    { name: "Badge", slug: "badge" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "ERP / Stock" : "ERP / Stock"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Ordre d'achat" : "Purchase Order"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Formulaire de création d'ordre d'achat : sélection fournisseur, date de livraison, lignes d'articles éditables avec quantités et prix, totaux. Combine entêtes en cartes et grille de saisie pour passer commande à un fournisseur."
        : "Purchase order creation form: supplier picker, delivery date, editable line items with quantities and prices, totals. Combines header cards and an entry grid to place an order with a supplier."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Ordre d'achat · PO-2026-0847 (données mock)" : "Purchase Order · PO-2026-0847 (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="po-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .po-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
  :global(.po-shell) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
  :global(.po-header) { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  :global(.po-header-id) { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  :global(.po-title) { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.po-header-actions) { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  :global(.po-fields) { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  :global(.po-field) { display: flex; flex-direction: column; gap: 0.375rem; }
  :global(.po-label) { font-size: 0.85rem; font-weight: 600; color: var(--st-semantic-text-secondary, #475569); }
  :global(.po-section) { display: flex; flex-direction: column; gap: 0.75rem; }
  :global(.po-section-title) { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.po-totals) { margin-left: auto; width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 0.4rem; border-top: 1px solid var(--st-semantic-border-subtle, #e2e8f0); padding-top: 0.75rem; }
  :global(.po-total-row) { display: flex; justify-content: space-between; font-size: 0.9rem; }
  :global(.po-total-key) { color: var(--st-semantic-text-secondary, #475569); }
  :global(.po-total-val) { font-weight: 600; color: var(--st-semantic-text-primary, #0f172a); }
</style>
