<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (fiche opportunité CRM) ──────────────────────────────────

  const BREADCRUMB_ITEMS = $derived([
    { label: fr ? "CRM" : "CRM", href: "#" },
    { label: fr ? "Opportunités" : "Opportunities", href: "#" },
    { label: fr ? "Airbus – Refonte portail fournisseurs" : "Airbus – Supplier portal redesign", current: true }
  ]);

  const STEPPER_STEPS = $derived([
    { label: fr ? "Nouveau" : "New", description: fr ? "Contact entrant" : "Inbound contact" },
    { label: fr ? "Qualifié" : "Qualified", description: fr ? "Besoin confirmé" : "Need confirmed" },
    { label: fr ? "Proposition" : "Proposal", description: fr ? "Devis envoyé" : "Quote sent" },
    { label: fr ? "Négociation" : "Negotiation", description: fr ? "En cours" : "Ongoing" },
    { label: fr ? "Gagné" : "Won", description: fr ? "Bon de commande" : "Purchase order" }
  ]);

  const KPIS = $derived([
    { label: fr ? "Montant brut" : "Gross amount", value: 320000, format: "currency" as const, delta: 12, unit: undefined },
    { label: fr ? "Montant pondéré" : "Weighted amount", value: 192000, format: "currency" as const, delta: 8, unit: undefined },
    { label: fr ? "Probabilité" : "Probability", value: 60, format: "number" as const, unit: "%" }
  ]);

  const QUOTE_ITEMS = $derived([
    fr ? "DEV-2026-031 : Audit architecture — 28 000 €" : "DEV-2026-031: Architecture audit — €28 000",
    fr ? "DEV-2026-032 : Design System (lot 1) — 96 000 €" : "DEV-2026-032: Design System (lot 1) — €96 000",
    fr ? "DEV-2026-033 : Intégration back-office — 128 000 €" : "DEV-2026-033: Back-office integration — €128 000",
    fr ? "DEV-2026-034 : Formation & accompagnement — 68 000 €" : "DEV-2026-034: Training & support — €68 000"
  ]);

  const HISTORY_ITEMS = $derived([
    fr ? "2026-06-12 — Réunion de lancement avec le DSI d'Airbus" : "2026-06-12 — Kick-off meeting with Airbus CIO",
    fr ? "2026-05-28 — Envoi du cahier des charges (appel d'offres)" : "2026-05-28 — RFP document sent",
    fr ? "2026-05-14 — Qualification par Marie Lefebvre" : "2026-05-14 — Qualified by Marie Lefebvre",
    fr ? "2026-04-30 — Premier contact via salon Viva Tech" : "2026-04-30 — First contact at Viva Tech"
  ]);

  const TAB_ITEMS = $derived([
    {
      value: "quotes",
      label: fr ? "Devis" : "Quotes",
      content: fr ? "Devis associés à cette opportunité" : "Quotes linked to this opportunity"
    },
    {
      value: "history",
      label: fr ? "Historique" : "History",
      content: fr ? "Chronologie des interactions" : "Interaction timeline"
    }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "od-shell" },
      children: [
        // Fil d'Ariane
        { comp: "Breadcrumb", props: { items: BREADCRUMB_ITEMS } },

        // En-tête : titre + badge étape
        {
          el: "div",
          props: { class: "od-header" },
          children: [
            {
              el: "div",
              props: { class: "od-header-id" },
              children: [
                { el: "h2", props: { class: "od-title" }, children: [fr ? "Airbus – Refonte portail fournisseurs" : "Airbus – Supplier portal redesign"] },
                { comp: "Badge", props: { tone: "warning" }, children: [fr ? "Proposition" : "Proposal"] }
              ]
            },
            {
              el: "div",
              props: { class: "od-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Modifier" : "Edit"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Marquer gagné" : "Mark won"] }
              ]
            }
          ]
        },

        // Stepper de progression
        {
          comp: "Stepper",
          props: { steps: STEPPER_STEPS, current: 2, orientation: "horizontal" }
        },

        // KPI cards
        {
          el: "div",
          props: { class: "od-kpis" },
          children: KPIS.map((kpi) => ({
            comp: "KpiCard",
            props: {
              label: kpi.label,
              value: kpi.value,
              format: kpi.format,
              currency: "EUR",
              delta: kpi.delta,
              unit: kpi.unit
            }
          }))
        },

        // Onglets devis / historique
        {
          el: "div",
          props: { class: "od-section" },
          children: [
            {
              comp: "Tabs",
              props: { items: TAB_ITEMS, label: fr ? "Sections de l'opportunité" : "Opportunity sections" }
            },
            // Contenu devis
            {
              el: "div",
              props: { class: "od-tab-content" },
              children: [
                { el: "h3", props: { class: "od-section-title" }, children: [fr ? "Devis associés" : "Associated quotes"] },
                { comp: "OrderedList", props: { items: QUOTE_ITEMS } }
              ]
            },
            // Contenu historique
            {
              el: "div",
              props: { class: "od-tab-content" },
              children: [
                { el: "h3", props: { class: "od-section-title" }, children: [fr ? "Historique des interactions" : "Interaction history"] },
                { comp: "OrderedList", props: { items: HISTORY_ITEMS } }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Breadcrumb", slug: "breadcrumb" },
    { name: "Stepper", slug: "stepper" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Tabs", slug: "tabs" },
    { name: "Badge", slug: "badge" },
    { name: "OrderedList", slug: "ordered-list" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · CRM" : "View · CRM"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Fiche opportunité" : "Opportunity Detail"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Vue 360 d'une opportunité : étape du cycle (<code>Stepper</code>), montant pondéré et
        probabilité (<code>KpiCard</code>), contacts et activités. Onglets devis / historique via
        <code>Tabs</code> + <code>OrderedList</code>. Un seul <code>NodeSpec</code> → rendu
        identique en Svelte, React, Vue et Angular.
      {:else}
        360 view of an opportunity: sales stage (<code>Stepper</code>), weighted amount and
        probability (<code>KpiCard</code>), contacts and activities. Quote / history tabs via
        <code>Tabs</code> + <code>OrderedList</code>. One <code>NodeSpec</code> → identical render
        in Svelte, React, Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="od-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular. Le rendu et le code copié reflètent le framework sélectionné."
        : "Use the tabs to switch between Svelte, React, Vue, and Angular. The render and copied code reflect the selected framework."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Fiche opportunité : Airbus (données mock)" : "Opportunity Detail: Airbus (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="od-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .od-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .od-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Fiche Opportunité (global → propagé dans les îles React/Vue/Angular) ─── */
  :global(.od-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.od-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.od-header-id) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.od-title) {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.od-header-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.od-kpis) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  :global(.od-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.od-tab-content) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.od-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  @media (max-width: 760px) {
    :global(.od-kpis) {
      grid-template-columns: 1fr;
    }
  }
</style>
