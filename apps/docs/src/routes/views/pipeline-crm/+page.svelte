<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (pipeline CRM Odoo-like) ─────────────────────────

  type Opp = {
    title: string;
    amount: string;
    owner: string;
    tone: "category1" | "category2" | "category3" | "category4" | "category5";
    probability: number;
  };

  type Stage = {
    id: string;
    title: () => string;
    badgeTone: "neutral" | "info" | "warning" | "success";
    cards: Opp[];
  };

  const STAGES: Stage[] = [
    {
      id: "new",
      title: () => (fr ? "Nouveau" : "New"),
      badgeTone: "neutral",
      cards: [
        { title: "Airbus : Refonte ERP", amount: "120 000 €", owner: "Marie Lefebvre", tone: "category1", probability: 10 },
        { title: "Orange : Portail self-care", amount: "65 000 €", owner: "Karim Benali", tone: "category2", probability: 15 }
      ]
    },
    {
      id: "qualified",
      title: () => (fr ? "Qualifié" : "Qualified"),
      badgeTone: "info",
      cards: [
        { title: "Safran : Migration cloud", amount: "210 000 €", owner: "Sophie Durand", tone: "category3", probability: 35 },
        { title: "Thales : Dashboard BI", amount: "48 000 €", owner: "Léa Moreau", tone: "category4", probability: 40 }
      ]
    },
    {
      id: "proposal",
      title: () => (fr ? "Proposition" : "Proposal"),
      badgeTone: "warning",
      cards: [
        { title: "Société Générale : App mobile", amount: "175 000 €", owner: "Marie Lefebvre", tone: "category1", probability: 65 },
        { title: "Capgemini : Audit DS", amount: "32 000 €", owner: "Tom Girard", tone: "category5", probability: 60 }
      ]
    },
    {
      id: "won",
      title: () => (fr ? "Gagné" : "Won"),
      badgeTone: "success",
      cards: [
        { title: "Dassault : Design tokens", amount: "54 000 €", owner: "Sophie Durand", tone: "category3", probability: 100 }
      ]
    }
  ];

  function cardNode(card: Opp): NodeSpec {
    return {
      comp: "Card",
      props: { interactive: true, class: "pc-card" },
      children: [
        { el: "h4", props: { class: "pc-card-title" }, children: [card.title] },
        {
          el: "div",
          props: { class: "pc-card-meta" },
          children: [
            { el: "span", props: { class: "pc-card-amount" }, children: [card.amount] }
          ]
        },
        {
          comp: "ProgressBar",
          props: { label: fr ? "Probabilité" : "Probability", value: card.probability, size: "sm", showValue: true }
        },
        {
          el: "div",
          props: { class: "pc-card-owner" },
          children: [
            { comp: "Avatar", props: { name: card.owner, size: "sm", tone: card.tone } },
            { el: "span", props: { class: "pc-card-owner-name" }, children: [card.owner] }
          ]
        }
      ]
    };
  }

  function stageNode(stage: Stage): NodeSpec {
    return {
      el: "div",
      props: { class: "pc-column" },
      children: [
        {
          el: "div",
          props: { class: "pc-column-head" },
          children: [
            { el: "span", props: { class: "pc-column-title" }, children: [stage.title()] },
            { comp: "Badge", props: { tone: stage.badgeTone }, children: [String(stage.cards.length)] }
          ]
        },
        {
          el: "div",
          props: { class: "pc-column-cards" },
          children: stage.cards.map(cardNode)
        }
      ]
    };
  }

  // ── NodeSpec ──────────────────────────────────────────────────────────────
  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "pc-board" },
      children: STAGES.map(stageNode)
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Card", slug: "card" },
    { name: "Badge", slug: "badge" },
    { name: "Avatar", slug: "avatar" },
    { name: "ProgressBar", slug: "progress-bar" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · CRM (Odoo)" : "View · CRM (Odoo)"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Pipeline CRM" : "CRM Pipeline"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Déclinaison du patron Kanban pour le pipeline commercial Odoo : une colonne par étape
        (Nouveau / Qualifié / Proposition / Gagné) de cartes d'opportunités. Chaque carte combine
        <code>Card</code> + montant + <code>ProgressBar</code> de probabilité + <code>Avatar</code>
        du responsable. Un seul <code>NodeSpec</code> → rendu identique en Svelte, React et Vue.
      {:else}
        A declination of the Kanban pattern for the Odoo sales pipeline: one column per stage
        (New / Qualified / Proposal / Won) of opportunity cards. Each card combines
        <code>Card</code> + amount + a probability <code>ProgressBar</code> + the owner's
        <code>Avatar</code>. One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
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
      title={fr ? "Pipeline CRM : opportunités (données mock)" : "CRM Pipeline : opportunities (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="pc-comp-list">
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

  .pc-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Pipeline CRM (global → propagé dans les îles React/Vue) ─────── */
  :global(.pc-board) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    width: 100%;
    align-items: start;
  }

  :global(.pc-column) {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.pc-column-head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  :global(.pc-column-title) {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.pc-column-cards) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.pc-card) {
    display: block;
  }

  :global(.pc-card .pc-card-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.6rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.pc-card-meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }

  :global(.pc-card-amount) {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.pc-card-owner) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.7rem;
  }

  :global(.pc-card-owner-name) {
    font-size: 0.8rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 980px) {
    :global(.pc-board) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    :global(.pc-board) {
      grid-template-columns: 1fr;
    }
  }
</style>
