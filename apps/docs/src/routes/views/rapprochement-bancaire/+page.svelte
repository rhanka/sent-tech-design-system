<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (rapprochement bancaire) ────────────────────────────────

  const BANK_COLS = $derived([
    { key: "date", label: fr ? "Date" : "Date", sortable: true },
    { key: "libelle", label: fr ? "Libellé relevé" : "Statement label", sortable: false },
    { key: "montant", label: fr ? "Montant" : "Amount", sortable: true, align: "end" as const },
    { key: "statut", label: fr ? "Statut" : "Status", sortable: false }
  ]);

  const BANK_ROWS = $derived([
    { id: "b1", date: "2026-06-02", libelle: fr ? "Virement client Dupont SA" : "Transfer Dupont SA", montant: "12 400,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "b2", date: "2026-06-05", libelle: fr ? "Prélèvement loyer bureaux" : "Office rent debit", montant: "-3 200,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "b3", date: "2026-06-08", libelle: fr ? "CB carburant TOTAL 0612" : "Fuel card TOTAL 0612", montant: "-187,40 €", statut: fr ? "Suggéré" : "Suggested" },
    { id: "b4", date: "2026-06-10", libelle: fr ? "Virement fournisseur ImprimCo" : "Supplier transfer ImprimCo", montant: "-2 750,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "b5", date: "2026-06-14", libelle: fr ? "Encaissement chèque 004521" : "Cheque deposit 004521", montant: "5 680,00 €", statut: fr ? "Non lettré" : "Unmatched" },
    { id: "b6", date: "2026-06-17", libelle: fr ? "Frais bancaires juin" : "Bank fees June", montant: "-42,00 €", statut: fr ? "Suggéré" : "Suggested" }
  ]);

  const LEDGER_COLS = $derived([
    { key: "date", label: fr ? "Date" : "Date", sortable: true },
    { key: "compte", label: fr ? "Compte" : "Account", sortable: false },
    { key: "libelle", label: fr ? "Libellé écriture" : "Entry label", sortable: false },
    { key: "montant", label: fr ? "Montant" : "Amount", sortable: true, align: "end" as const },
    { key: "statut", label: fr ? "Statut" : "Status", sortable: false }
  ]);

  const LEDGER_ROWS = $derived([
    { id: "l1", date: "2026-06-02", compte: "411000", libelle: fr ? "Règlement Dupont SA FAC-0512" : "Payment Dupont SA INV-0512", montant: "12 400,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "l2", date: "2026-06-05", compte: "613200", libelle: fr ? "Loyer juin — bail 2024-08" : "June rent — lease 2024-08", montant: "-3 200,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "l3", date: "2026-06-08", compte: "624100", libelle: fr ? "Carburant véhicule commercial" : "Commercial vehicle fuel", montant: "-187,40 €", statut: fr ? "Suggéré" : "Suggested" },
    { id: "l4", date: "2026-06-10", compte: "401000", libelle: fr ? "Règlement ImprimCo FC-2206" : "Payment ImprimCo FC-2206", montant: "-2 750,00 €", statut: fr ? "Rapproché" : "Matched" },
    { id: "l5", date: "2026-06-17", compte: "627000", libelle: fr ? "Frais de tenue de compte" : "Account maintenance fee", montant: "-42,00 €", statut: fr ? "Suggéré" : "Suggested" }
  ]);

  const TAB_ITEMS = $derived([
    { value: "bank", label: fr ? "Relevé bancaire" : "Bank statement" },
    { value: "ledger", label: fr ? "Écritures comptables" : "Ledger entries" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "rb-shell" },
      children: [
        // Barre de titre
        {
          el: "div",
          props: { class: "rb-titlebar" },
          children: [
            { el: "h2", props: { class: "rb-title" }, children: [fr ? "Rapprochement — Juin 2026" : "Reconciliation — June 2026"] },
            {
              el: "div",
              props: { class: "rb-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Exporter" : "Export"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Valider le rapprochement" : "Validate reconciliation"] }
              ]
            }
          ]
        },
        // KPI
        {
          el: "div",
          props: { class: "rb-kpis" },
          children: [
            { comp: "KpiCard", props: { label: fr ? "Solde relevé" : "Statement balance", value: "11 900,60 €", trend: "neutral" } },
            { comp: "KpiCard", props: { label: fr ? "Solde comptable" : "Ledger balance", value: "6 220,60 €", trend: "neutral" } },
            { comp: "KpiCard", props: { label: fr ? "Écart résiduel" : "Residual gap", value: "5 680,00 €", trend: "down" } },
            { comp: "KpiCard", props: { label: fr ? "Lignes non lettrées" : "Unmatched lines", value: "1", trend: "neutral" } }
          ]
        },
        // Onglets deux volets
        {
          comp: "Tabs",
          props: { items: TAB_ITEMS, value: "bank" },
          children: [
            // Volet relevé
            {
              el: "div",
              props: { "data-tab": "bank", class: "rb-pane" },
              children: [
                {
                  el: "div",
                  props: { class: "rb-pane-header" },
                  children: [
                    { el: "span", props: { class: "rb-pane-label" }, children: [fr ? "6 opérations · BNP Paribas — IBAN FR76 3000 4028 3700 0100 7232 847" : "6 transactions · BNP Paribas — IBAN FR76 3000 4028 3700 0100 7232 847"] },
                    { comp: "Badge", props: { tone: "warning" }, children: [fr ? "1 non lettré" : "1 unmatched"] }
                  ]
                },
                {
                  comp: "Table",
                  props: { caption: fr ? "Lignes du relevé bancaire" : "Bank statement lines", columns: BANK_COLS, rows: BANK_ROWS, size: "sm" }
                }
              ]
            },
            // Volet écritures
            {
              el: "div",
              props: { "data-tab": "ledger", class: "rb-pane" },
              children: [
                {
                  el: "div",
                  props: { class: "rb-pane-header" },
                  children: [
                    { el: "span", props: { class: "rb-pane-label" }, children: [fr ? "5 écritures · Compte 512000 Banque principale" : "5 entries · Account 512000 Main bank"] },
                    { comp: "Badge", props: { tone: "success" }, children: [fr ? "2 suggérés" : "2 suggested"] }
                  ]
                },
                {
                  comp: "Table",
                  props: { caption: fr ? "Écritures comptables" : "Ledger entries", columns: LEDGER_COLS, rows: LEDGER_ROWS, size: "sm" }
                }
              ]
            }
          ]
        },
        // Pied de page
        {
          el: "div",
          props: { class: "rb-footer" },
          children: [
            { comp: "Badge", props: { tone: "danger" }, children: [fr ? "Rapprochement incomplet" : "Incomplete reconciliation"] },
            { el: "span", props: { class: "rb-footer-label" }, children: [fr ? "1 ligne bancaire non lettrée — chèque 004521 (5 680,00 €)" : "1 unmatched bank line — cheque 004521 (5 680.00 €)"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Table", slug: "table" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Tabs", slug: "tabs" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Comptabilité" : "View · Accounting"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Rapprochement bancaire" : "Bank Reconciliation"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Vue en deux volets confrontant les lignes du relevé bancaire aux écritures comptables, avec
        suggestions de correspondance et solde résiduel. Pour lettrer et rapprocher les opérations.
        Combine <code>Table</code>, <code>KpiCard</code>, <code>Tabs</code>, <code>Badge</code> et
        <code>Button</code> en un seul <code>NodeSpec</code> → rendu identique en Svelte, React, Vue
        et Angular.
      {:else}
        Two-pane view matching bank statement lines against ledger entries, with match suggestions
        and residual balance. For clearing and reconciling transactions. Combines <code>Table</code>,
        <code>KpiCard</code>, <code>Tabs</code>, <code>Badge</code> and <code>Button</code> in one
        <code>NodeSpec</code> → identical render in Svelte, React, Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Rapprochement bancaire — Juin 2026 (données mock)" : "Bank Reconciliation — June 2026 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="rb-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .rb-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.rb-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.rb-titlebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.rb-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.rb-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.rb-kpis) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  :global(.rb-pane) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.rb-pane-header) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.rb-pane-label) {
    font-size: 0.875rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.rb-footer) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  :global(.rb-footer-label) {
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 768px) {
    :global(.rb-kpis) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    :global(.rb-kpis) {
      grid-template-columns: 1fr;
    }
  }
</style>
