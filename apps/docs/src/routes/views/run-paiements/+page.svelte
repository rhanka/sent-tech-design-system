<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (lot de paiements fournisseurs) ──────────────────────────

  const STEPS = $derived([
    { label: fr ? "Sélection des factures" : "Invoice selection", description: fr ? "Terminé" : "Done" },
    { label: fr ? "Compte bancaire" : "Bank account", description: fr ? "En cours" : "Current" },
    { label: fr ? "Validation" : "Review" },
    { label: fr ? "Exécution" : "Execute" }
  ]);

  const INVOICE_COLUMNS = $derived([
    { key: "ref", label: fr ? "Référence" : "Reference", sortable: false },
    { key: "fournisseur", label: fr ? "Fournisseur" : "Supplier", sortable: false },
    { key: "echeance", label: fr ? "Échéance" : "Due date", sortable: false },
    { key: "montant", label: fr ? "Montant TTC" : "Amount", sortable: false, align: "end" as const }
  ]);

  const INVOICE_ROWS = $derived([
    { id: "1", ref: "FACT-2026-0441", fournisseur: "Acme Solutions Inc.", echeance: "2026-06-20", montant: "12 480,00 €" },
    { id: "2", ref: "FACT-2026-0398", fournisseur: "DataBridge Consulting", echeance: "2026-06-22", montant: "8 250,00 €" },
    { id: "3", ref: "FACT-2026-0415", fournisseur: "Nord Imprimerie SAS", echeance: "2026-06-25", montant: "3 610,80 €" },
    { id: "4", ref: "FACT-2026-0429", fournisseur: "Sécurinet Télécoms", echeance: "2026-06-28", montant: "5 990,00 €" }
  ]);

  const BANK_OPTIONS = $derived([
    { value: "bnp-ope", label: fr ? "BNP Paribas – Compte opérationnel (FR76 3000…)" : "BNP Paribas – Operating account (FR76 3000…)" },
    { value: "sg-treso", label: fr ? "Société Générale – Trésorerie (FR76 3003…)" : "Société Générale – Treasury (FR76 3003…)" },
    { value: "cm-eur", label: fr ? "Crédit Mutuel – EUR courant (FR76 1027…)" : "Crédit Mutuel – EUR current (FR76 1027…)" }
  ]);

  const KPI_TOTAL = "30 330,80 €";
  const KPI_COUNT = "4";

  // ── NodeSpec ─────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "rp-shell" },
      children: [
        // Stepper de progression
        {
          comp: "Stepper",
          props: {
            current: 1,
            label: fr ? "Lot de paiements" : "Payment run",
            steps: STEPS
          }
        },
        // KPI rapides
        {
          el: "div",
          props: { class: "rp-kpis" },
          children: [
            {
              comp: "KpiCard",
              props: {
                label: fr ? "Factures sélectionnées" : "Selected invoices",
                value: KPI_COUNT,
                trend: "neutral"
              }
            },
            {
              comp: "KpiCard",
              props: {
                label: fr ? "Total à décaisser" : "Total to disburse",
                value: KPI_TOTAL,
                trend: "neutral"
              }
            },
            {
              comp: "Progress",
              props: {
                value: 25,
                label: fr ? "Avancement du lot" : "Batch progress",
                showLabel: true
              }
            }
          ]
        },
        // Corps : tableau des factures + choix du compte
        {
          el: "div",
          props: { class: "rp-body" },
          children: [
            // Tableau des factures
            {
              el: "div",
              props: { class: "rp-section" },
              children: [
                { el: "h3", props: { class: "rp-section-title" }, children: [fr ? "Factures à régler" : "Invoices to pay"] },
                {
                  comp: "Table",
                  props: {
                    caption: fr ? "Factures fournisseurs sélectionnées" : "Selected supplier invoices",
                    columns: INVOICE_COLUMNS,
                    rows: INVOICE_ROWS,
                    size: "sm"
                  }
                }
              ]
            },
            // Panneau latéral : compte bancaire + alerte
            {
              el: "aside",
              props: { class: "rp-aside" },
              children: [
                { el: "h3", props: { class: "rp-section-title" }, children: [fr ? "Compte émetteur" : "Paying account"] },
                {
                  comp: "Select",
                  props: {
                    label: fr ? "Compte bancaire" : "Bank account",
                    value: "bnp-ope",
                    options: BANK_OPTIONS
                  }
                },
                {
                  comp: "Alert",
                  props: { tone: "warning" },
                  children: [fr ? "Vérifiez le solde disponible avant d'exécuter le lot." : "Check the available balance before executing the batch."]
                }
              ]
            }
          ]
        },
        // Navigation Précédent / Suivant
        {
          el: "div",
          props: { class: "rp-nav" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Précédent" : "Previous"] },
            { comp: "Button", props: { variant: "primary" }, children: [fr ? "Suivant" : "Next"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS ────────────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Progress", slug: "progress" },
    { name: "Table", slug: "table" },
    { name: "Select", slug: "select" },
    { name: "Alert", slug: "alert" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Comptabilité" : "View · Accounting"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Lot de paiements" : "Payment Run"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Assistant pas-à-pas pour préparer un lot de paiements : sélection des factures, choix du compte bancaire, validation et exécution. Pour ordonnancer les règlements fournisseurs."
        : "Step-by-step wizard to prepare a payment batch: invoice selection, bank account choice, validation and execution. For scheduling supplier payouts."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Lot de paiements fournisseurs (données mock)" : "Supplier payment run (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="rp-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .rp-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.rp-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :global(.rp-kpis) {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 1rem;
    align-items: center;
  }

  :global(.rp-body) {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  :global(.rp-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    min-width: 0;
  }

  :global(.rp-aside) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    min-width: 0;
  }

  :global(.rp-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.rp-nav) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  @media (max-width: 760px) {
    :global(.rp-kpis) {
      grid-template-columns: 1fr 1fr;
    }
    :global(.rp-body) {
      grid-template-columns: 1fr;
    }
  }
</style>
