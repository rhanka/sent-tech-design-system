<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const WAREHOUSES = $derived([
    { value: "wh-paris", label: fr ? "Paris – Entrepôt central" : "Paris – Central warehouse" },
    { value: "wh-lyon", label: fr ? "Lyon – Plateforme régionale" : "Lyon – Regional hub" },
    { value: "wh-bordeaux", label: fr ? "Bordeaux – Dépôt secondaire" : "Bordeaux – Secondary depot" },
    { value: "wh-marseille", label: fr ? "Marseille – Zone franche" : "Marseille – Free zone" }
  ]);

  const BASKET_ROWS = $derived([
    { id: "1", ref: "ART-10482", desc: fr ? "Câble réseau Cat6 (305 m)" : "Cat6 cable (305 m reel)", stock: "48", qty: "12" },
    { id: "2", ref: "ART-20317", desc: fr ? "Rack 19\" 42U anthracite" : '19" 42U rack dark grey', stock: "9", qty: "3" },
    { id: "3", ref: "ART-30891", desc: fr ? "Switch PoE 48 ports" : "48-port PoE switch", stock: "14", qty: "6" },
    { id: "4", ref: "ART-41205", desc: fr ? "Module SFP+ 10G multimode" : "10G multimode SFP+ module", stock: "120", qty: "24" }
  ]);

  const BASKET_COLS = $derived([
    { key: "ref", label: fr ? "Référence" : "Reference", sortable: true },
    { key: "desc", label: fr ? "Désignation" : "Description", sortable: false },
    { key: "stock", label: fr ? "Stock dispo" : "Avail. stock", sortable: true, align: "end" as const },
    { key: "qty", label: fr ? "Qté" : "Qty", sortable: false, align: "end" as const }
  ]);

  const HISTORY_ROWS = $derived([
    { id: "TRF-2026-0091", from: "Lyon", to: "Paris", date: "2026-06-10", lines: "5", status: fr ? "Reçu" : "Received", tone: "success" as const },
    { id: "TRF-2026-0084", from: "Paris", to: "Bordeaux", date: "2026-05-28", lines: "3", status: fr ? "Reçu" : "Received", tone: "success" as const },
    { id: "TRF-2026-0077", from: "Marseille", to: "Lyon", date: "2026-05-14", lines: "8", status: fr ? "Annulé" : "Cancelled", tone: "danger" as const }
  ]);

  const HISTORY_COLS = $derived([
    { key: "id", label: fr ? "N° transfert" : "Transfer #", sortable: true },
    { key: "from", label: fr ? "Origine" : "Source", sortable: true },
    { key: "to", label: fr ? "Destination" : "Destination", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "lines", label: fr ? "Lignes" : "Lines", sortable: true, align: "end" as const },
    { key: "status", label: fr ? "Statut" : "Status", sortable: false }
  ]);

  const SHIP_STEPS = $derived([
    { id: "s1", label: fr ? "Imprimer les étiquettes de colisage" : "Print packing labels" },
    { id: "s2", label: fr ? "Scanner les articles à expédier" : "Scan items for shipment" },
    { id: "s3", label: fr ? "Confirmer la remise au transporteur" : "Confirm handover to carrier" }
  ]);

  // ── NodeSpec ───────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "wt-shell" },
      children: [
        // Sélection entrepôts
        {
          el: "div",
          props: { class: "wt-header" },
          children: [
            { comp: "Select", props: { label: fr ? "Origine" : "Source", value: "wh-paris", options: WAREHOUSES } },
            { el: "span", props: { class: "wt-arrow" }, children: ["→"] },
            { comp: "Select", props: { label: fr ? "Destination" : "Destination", value: "wh-lyon", options: WAREHOUSES } },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Créer" : "Create"] }
          ]
        },
        // Onglets : préparation / expédition / réception / historique
        {
          comp: "Tabs",
          props: {
            value: "picking",
            tabs: [
              { value: "picking", label: fr ? "Préparation" : "Picking" },
              { value: "shipping", label: fr ? "Expédition" : "Shipping" },
              { value: "history", label: fr ? "Historique" : "History" }
            ]
          },
          children: [
            // Préparation : panier DataGrid
            {
              el: "div",
              props: { slot: "picking", class: "wt-panel" },
              children: [
                {
                  el: "div",
                  props: { class: "wt-panel-head" },
                  children: [
                    { el: "h3", props: { class: "wt-panel-title" }, children: [fr ? "Articles à préparer" : "Items to pick"] },
                    { comp: "Badge", props: { tone: "info" }, children: [`${BASKET_ROWS.length} ${fr ? "lignes" : "lines"}`] }
                  ]
                },
                {
                  comp: "DataGrid",
                  props: {
                    caption: fr ? "Panier TRF-2026-0099" : "Basket TRF-2026-0099",
                    columns: BASKET_COLS,
                    rows: BASKET_ROWS,
                    size: "sm"
                  }
                },
                {
                  el: "div",
                  props: { class: "wt-actions" },
                  children: [
                    { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Ajouter un article" : "Add item"] },
                    { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Valider la préparation" : "Confirm picking"] }
                  ]
                }
              ]
            },
            // Expédition : liste ordonnée
            {
              el: "div",
              props: { slot: "shipping", class: "wt-panel" },
              children: [
                { comp: "OrderedList", props: { label: fr ? "Étapes d'expédition" : "Shipping steps", items: SHIP_STEPS } },
                {
                  el: "div",
                  props: { class: "wt-actions" },
                  children: [
                    { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Valider l'expédition" : "Confirm shipment"] }
                  ]
                }
              ]
            },
            // Historique : DataGrid avec Badge statut
            {
              el: "div",
              props: { slot: "history", class: "wt-panel" },
              children: [
                {
                  comp: "DataGrid",
                  props: {
                    caption: fr ? "Historique des transferts" : "Transfer history",
                    columns: HISTORY_COLS,
                    rows: HISTORY_ROWS.map((r) => ({
                      ...r,
                      status: { comp: "Badge", props: { tone: r.tone }, children: [r.status] }
                    })),
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

  const DS_COMPONENTS = [
    { name: "Select", slug: "select" },
    { name: "Tabs", slug: "tabs" },
    { name: "DataGrid", slug: "data-grid" },
    { name: "Badge", slug: "badge" },
    { name: "OrderedList", slug: "ordered-list" },
    { name: "Button", slug: "button" },
    { name: "Breadcrumb", slug: "breadcrumb" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "ERP / Stock" : "ERP / Stock"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Transfert entre entrepôts" : "Warehouse Transfer"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Gestion des transferts entre entrepôts : sélection origine/destination, panier d'articles à déplacer avec niveaux de stock, fil d'avancement par onglets (préparation, expédition, réception) et historique. Pour orchestrer les mouvements inter-sites."
        : "Inter-warehouse transfer management: source/destination selection, basket of items to move with stock levels, status flow in tabs (picking, shipping, receiving) and history. To orchestrate stock movements between sites."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Transfert entre entrepôts (données mock)" : "Warehouse Transfer (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="wt-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .wt-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.wt-shell) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }

  :global(.wt-header) { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.75rem; }

  :global(.wt-arrow) { font-size: 1.4rem; color: var(--st-semantic-text-secondary, #475569); line-height: 2.4rem; }

  :global(.wt-panel) { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }

  :global(.wt-panel-head) { display: flex; align-items: center; gap: 0.75rem; }

  :global(.wt-panel-title) { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }

  :global(.wt-actions) { display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
