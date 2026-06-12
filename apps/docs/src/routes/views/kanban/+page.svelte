<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (pipeline CRM) ───────────────────────────────────

  type Card = {
    title: string;
    amount: string;
    owner: string;
    tone: "category1" | "category2" | "category3" | "category4" | "category5";
    priority: () => string;
    priorityTone: "info" | "warning" | "error" | "success";
    progress: number;
  };

  type Column = {
    id: string;
    title: () => string;
    badgeTone: "neutral" | "info" | "success";
    cards: Card[];
  };

  const COLUMNS: Column[] = [
    {
      id: "qualif",
      title: () => (fr ? "Qualification" : "Qualification"),
      badgeTone: "neutral",
      cards: [
        { title: "Airbus : Refonte ERP", amount: "120 000 €", owner: "Marie Lefebvre", tone: "category1", priority: () => (fr ? "Haute" : "High"), priorityTone: "error", progress: 20 },
        { title: "Orange : Portail self-care", amount: "65 000 €", owner: "Karim Benali", tone: "category2", priority: () => (fr ? "Moyenne" : "Medium"), priorityTone: "warning", progress: 15 }
      ]
    },
    {
      id: "propal",
      title: () => (fr ? "Proposition" : "Proposal"),
      badgeTone: "info",
      cards: [
        { title: "Safran : Migration cloud", amount: "210 000 €", owner: "Sophie Durand", tone: "category3", priority: () => (fr ? "Haute" : "High"), priorityTone: "error", progress: 55 },
        { title: "Thales : Dashboard BI", amount: "48 000 €", owner: "Léa Moreau", tone: "category4", priority: () => (fr ? "Basse" : "Low"), priorityTone: "info", progress: 40 },
        { title: "Capgemini : Audit DS", amount: "32 000 €", owner: "Tom Girard", tone: "category5", priority: () => (fr ? "Moyenne" : "Medium"), priorityTone: "warning", progress: 50 }
      ]
    },
    {
      id: "negoc",
      title: () => (fr ? "Négociation" : "Negotiation"),
      badgeTone: "success",
      cards: [
        { title: "Société Générale : App mobile", amount: "175 000 €", owner: "Marie Lefebvre", tone: "category1", priority: () => (fr ? "Haute" : "High"), priorityTone: "error", progress: 80 },
        { title: "Dassault : Design tokens", amount: "54 000 €", owner: "Sophie Durand", tone: "category3", priority: () => (fr ? "Moyenne" : "Medium"), priorityTone: "warning", progress: 70 }
      ]
    }
  ];

  function cardNode(card: Card): NodeSpec {
    return {
      comp: "Card",
      props: { interactive: true, class: "kb-card" },
      children: [
        { el: "h4", props: { class: "kb-card-title" }, children: [card.title] },
        {
          el: "div",
          props: { class: "kb-card-meta" },
          children: [
            { el: "span", props: { class: "kb-card-amount" }, children: [card.amount] },
            { comp: "Badge", props: { tone: card.priorityTone }, children: [card.priority()] }
          ]
        },
        {
          comp: "ProgressBar",
          props: { label: fr ? "Avancement" : "Progress", value: card.progress, size: "sm", showValue: true }
        },
        {
          el: "div",
          props: { class: "kb-card-owner" },
          children: [
            { comp: "Avatar", props: { name: card.owner, size: "sm", tone: card.tone } },
            { el: "span", props: { class: "kb-card-owner-name" }, children: [card.owner] }
          ]
        }
      ]
    };
  }

  function columnNode(col: Column): NodeSpec {
    return {
      el: "div",
      props: { class: "kb-column" },
      children: [
        {
          el: "div",
          props: { class: "kb-column-head" },
          children: [
            { el: "span", props: { class: "kb-column-title" }, children: [col.title()] },
            { comp: "Badge", props: { tone: col.badgeTone }, children: [String(col.cards.length)] }
          ]
        },
        {
          el: "div",
          props: { class: "kb-column-cards" },
          children: col.cards.map(cardNode)
        }
      ]
    };
  }

  // ── NodeSpec ──────────────────────────────────────────────────────────────
  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "kb-board" },
      children: COLUMNS.map(columnNode)
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
    <p class="docs-hero-kicker">{fr ? "Vue · CRM / Ventes" : "View · CRM / Sales"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Tableau Kanban" : "Kanban Board"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Signature Odoo : board en colonnes de cartes (pipeline CRM, tâches projet…). Chaque carte
        combine <code>Card</code> + <code>Badge</code> de priorité + <code>ProgressBar</code>
        d'avancement + <code>Avatar</code> du responsable. Un seul <code>NodeSpec</code> → rendu
        identique en Svelte, React et Vue. Débloque les boards tâches, recrutement, OF… par échange
        de colonnes/cartes.
      {:else}
        The signature Odoo view: columns of cards (CRM pipeline, project tasks…). Each card combines
        <code>Card</code> + priority <code>Badge</code> + progress <code>ProgressBar</code> + owner
        <code>Avatar</code>. One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
        Unlocks task, recruiting, and manufacturing boards by swapping columns/cards.
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
      title={fr ? "Tableau Kanban : pipeline CRM (données mock)" : "Kanban Board : CRM pipeline (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="kb-comp-list">
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

  .kb-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Kanban (global → propagé dans les îles React/Vue) ──────────── */
  :global(.kb-board) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
    align-items: start;
  }

  :global(.kb-column) {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.kb-column-head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  :global(.kb-column-title) {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.kb-column-cards) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.kb-card) {
    display: block;
  }

  :global(.kb-card .kb-card-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.6rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.kb-card-meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }

  :global(.kb-card-amount) {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.kb-card-owner) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.7rem;
  }

  :global(.kb-card-owner-name) {
    font-size: 0.8rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 760px) {
    :global(.kb-board) {
      grid-template-columns: 1fr;
    }
  }
</style>
