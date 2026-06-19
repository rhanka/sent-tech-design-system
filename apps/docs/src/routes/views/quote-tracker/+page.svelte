<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (suivi des devis CRM) ───────────────────────────────────

  const KPI_DATA = $derived([
    { label: fr ? "Total devis" : "Total quotes", value: "24", trend: "+3", tone: "neutral" as const },
    { label: fr ? "Montant total" : "Total amount", value: "1 248 500 €", trend: "+12 %", tone: "success" as const },
    { label: fr ? "Taux d'acceptation" : "Acceptance rate", value: "62 %", trend: "+5 pt", tone: "success" as const },
    { label: fr ? "Devis expirés" : "Expired quotes", value: "4", trend: "-1", tone: "danger" as const }
  ]);

  const QUOTE_ROWS = $derived([
    { id: "DEV-2026-041", client: "Airbus Group SE",   amount: "210 000 €", status: fr ? "Accepté" : "Accepted", statusTone: "success" as const, expires: "2026-06-30" },
    { id: "DEV-2026-038", client: "Orange Business",   amount: "87 500 €",  status: fr ? "Envoyé"  : "Sent",     statusTone: "info"    as const, expires: "2026-07-15" },
    { id: "DEV-2026-035", client: "Société Générale",  amount: "320 000 €", status: fr ? "Envoyé"  : "Sent",     statusTone: "info"    as const, expires: "2026-07-02" },
    { id: "DEV-2026-031", client: "Capgemini France",  amount: "54 000 €",  status: fr ? "Expiré"  : "Expired",  statusTone: "danger"  as const, expires: "2026-05-31" },
    { id: "DEV-2026-028", client: "Thales Group",      amount: "175 000 €", status: fr ? "Accepté" : "Accepted", statusTone: "success" as const, expires: "2026-06-20" },
    { id: "DEV-2026-024", client: "Safran SA",         amount: "98 000 €",  status: fr ? "Expiré"  : "Expired",  statusTone: "danger"  as const, expires: "2026-05-15" }
  ]);

  const TABLE_COLUMNS = $derived([
    { key: "id", label: fr ? "N° devis" : "Quote #", sortable: true },
    { key: "client", label: fr ? "Client" : "Customer", sortable: true },
    { key: "amount", label: fr ? "Montant HT" : "Amount (excl. VAT)", sortable: true, align: "end" as const },
    { key: "status", label: fr ? "Statut" : "Status", sortable: true },
    { key: "expires", label: fr ? "Échéance" : "Expiry", sortable: true }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "qt-shell" },
      children: [
        // Alerte devis expirants
        {
          comp: "Alert",
          props: {
            tone: "warning",
            title: fr ? "2 devis expirent dans moins de 7 jours" : "2 quotes expire within 7 days"
          },
          children: [fr ? "DEV-2026-038 (Orange) et DEV-2026-035 (Société Générale) arrivent à échéance prochainement." : "DEV-2026-038 (Orange) and DEV-2026-035 (Société Générale) are due soon."]
        },
        // Filtres
        {
          el: "div",
          props: { class: "qt-filters" },
          children: [
            {
              comp: "Select",
              props: {
                label: fr ? "Période" : "Period",
                value: "q2-2026",
                options: [
                  { value: "q1-2026", label: fr ? "T1 2026" : "Q1 2026" },
                  { value: "q2-2026", label: fr ? "T2 2026" : "Q2 2026" },
                  { value: "q3-2026", label: fr ? "T3 2026" : "Q3 2026" }
                ]
              }
            },
            {
              comp: "Select",
              props: {
                label: fr ? "Statut" : "Status",
                value: "all",
                options: [
                  { value: "all", label: fr ? "Tous" : "All" },
                  { value: "sent", label: fr ? "Envoyé" : "Sent" },
                  { value: "accepted", label: fr ? "Accepté" : "Accepted" },
                  { value: "expired", label: fr ? "Expiré" : "Expired" }
                ]
              }
            },
            {
              comp: "DatePicker",
              props: { label: fr ? "Du" : "From", value: "2026-04-01" }
            },
            {
              comp: "DatePicker",
              props: { label: fr ? "Au" : "To", value: "2026-06-30" }
            }
          ]
        },
        // KPI cards
        {
          el: "div",
          props: { class: "qt-kpis" },
          children: KPI_DATA.map((kpi) => ({
            comp: "KpiCard",
            props: { label: kpi.label, value: kpi.value, trend: kpi.trend, tone: kpi.tone }
          }))
        },
        // Tableau des devis
        {
          comp: "DataTable",
          props: {
            caption: fr ? "Liste des devis" : "Quote list",
            columns: TABLE_COLUMNS,
            rows: QUOTE_ROWS.map((r) => ({
              ...r,
              status: { comp: "Badge", props: { tone: r.statusTone }, children: [r.status] }
            })),
            size: "sm"
          }
        },
        // Boutons d'action
        {
          el: "div",
          props: { class: "qt-actions" },
          children: [
            { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Exporter CSV" : "Export CSV"] },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouveau devis" : "New quote"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Alert", slug: "alert" },
    { name: "Select", slug: "select" },
    { name: "DatePicker", slug: "date-picker" },
    { name: "DataTable", slug: "data-table" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · CRM" : "View · CRM"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Suivi des devis" : "Quote Tracker"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Suivi des devis par statut (envoyé, accepté, expiré) avec totaux et taux d'acceptation.
        Filtres par période via <code>Select</code> et <code>DatePicker</code>, alertes d'échéance
        via <code>Alert</code>, indicateurs clés via <code>KpiCard</code> et table des montants
        via <code>DataTable</code> + <code>Badge</code>. Un seul <code>NodeSpec</code> →
        rendu identique en Svelte, React, Vue et Angular.
      {:else}
        Quote tracking by status (sent, accepted, expired) with totals and acceptance rate.
        Period filters via <code>Select</code> and <code>DatePicker</code>, expiry alerts via
        <code>Alert</code>, key indicators via <code>KpiCard</code>, and an amount-bearing table
        via <code>DataTable</code> + <code>Badge</code>. One <code>NodeSpec</code> →
        identical render in Svelte, React, Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular. Le rendu et le code copié reflètent le framework sélectionné."
        : "Use the tabs to switch between Svelte, React, Vue, and Angular. The render and copied code reflect the selected framework."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Suivi des devis : T2 2026 (données mock)" : "Quote Tracker : Q2 2026 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="qt-comp-list">
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

  .qt-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Quote Tracker (global → propagé dans les îles React/Vue/Angular) ── */
  :global(.qt-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.qt-filters) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
  }

  :global(.qt-kpis) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  :global(.qt-actions) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  @media (max-width: 900px) {
    :global(.qt-kpis) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 520px) {
    :global(.qt-kpis) {
      grid-template-columns: 1fr;
    }
  }
</style>
