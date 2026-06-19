<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock — Backlog de sprint ─────────────────────────────────────

  const SPRINTS = $derived([
    { value: "s47", label: fr ? "Sprint 47 (2 juin – 13 juin)" : "Sprint 47 (Jun 2 – Jun 13)" },
    { value: "s48", label: fr ? "Sprint 48 (16 juin – 27 juin)" : "Sprint 48 (Jun 16 – Jun 27)" },
    { value: "s49", label: fr ? "Sprint 49 (30 juin – 11 juil.)" : "Sprint 49 (Jun 30 – Jul 11)" }
  ]);

  type Story = {
    id: string;
    title: () => string;
    assignee: string;
    points: number;
    status: () => string;
    statusTone: "neutral" | "info" | "warning" | "success" | "error";
    priority: () => string;
    priorityTone: "neutral" | "info" | "warning" | "error";
    tone: "category1" | "category2" | "category3" | "category4" | "category5";
  };

  const STORIES = $derived<Story[]>([
    { id: "US-201", title: () => fr ? "Authentification SSO SAML 2.0" : "SSO SAML 2.0 Authentication", assignee: "Marie Lefebvre", points: 8, status: () => fr ? "Terminée" : "Done", statusTone: "success", priority: () => fr ? "Critique" : "Critical", priorityTone: "error", tone: "category1" },
    { id: "US-202", title: () => fr ? "Tableau de bord temps réel" : "Real-time Dashboard", assignee: "Karim Benali", points: 13, status: () => fr ? "En cours" : "In Progress", statusTone: "info", priority: () => fr ? "Haute" : "High", priorityTone: "warning", tone: "category2" },
    { id: "US-203", title: () => fr ? "Export CSV des rapports" : "Report CSV Export", assignee: "Sophie Durand", points: 5, status: () => fr ? "En cours" : "In Progress", statusTone: "info", priority: () => fr ? "Haute" : "High", priorityTone: "warning", tone: "category3" },
    { id: "US-204", title: () => fr ? "Notifications email configurable" : "Configurable Email Notifications", assignee: "Léa Moreau", points: 3, status: () => fr ? "À faire" : "To Do", statusTone: "neutral", priority: () => fr ? "Moyenne" : "Medium", priorityTone: "neutral", tone: "category4" },
    { id: "US-205", title: () => fr ? "Filtres avancés liste tickets" : "Advanced Ticket List Filters", assignee: "Tom Girard", points: 5, status: () => fr ? "À faire" : "To Do", statusTone: "neutral", priority: () => fr ? "Moyenne" : "Medium", priorityTone: "neutral", tone: "category5" },
    { id: "US-206", title: () => fr ? "Intégration webhook Slack" : "Slack Webhook Integration", assignee: "Marie Lefebvre", points: 8, status: () => fr ? "Bloquée" : "Blocked", statusTone: "error", priority: () => fr ? "Basse" : "Low", priorityTone: "neutral", tone: "category1" }
  ]);

  const CAPACITY = $derived({
    total: 40,
    completed: 8,
    label: fr ? "Points complétés / capacité" : "Points completed / capacity"
  });

  function storyRowNode(s: Story, idx: number): NodeSpec {
    return {
      el: "div", props: { class: "sb-row" },
      children: [
        { el: "div", props: { class: "sb-cell sb-cell-order" }, children: [String(idx + 1)] },
        { el: "div", props: { class: "sb-cell sb-cell-id" }, children: [s.id] },
        { el: "div", props: { class: "sb-cell sb-cell-title" }, children: [
          { comp: "Avatar", props: { name: s.assignee, size: "sm", tone: s.tone } },
          { el: "span", props: { class: "sb-title-text" }, children: [s.title()] }
        ]},
        { el: "div", props: { class: "sb-cell sb-cell-pts" }, children: [
          { comp: "Badge", props: { tone: "neutral" }, children: [`${s.points} pt`] }
        ]},
        { el: "div", props: { class: "sb-cell" }, children: [
          { comp: "Badge", props: { tone: s.priorityTone }, children: [s.priority()] }
        ]},
        { el: "div", props: { class: "sb-cell" }, children: [
          { comp: "Badge", props: { tone: s.statusTone }, children: [s.status()] }
        ]},
        { el: "div", props: { class: "sb-cell sb-cell-action" }, children: [
          { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Détail" : "Detail"] }
        ]}
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([{
    el: "div", props: { class: "sb-shell" },
    children: [
      // En-tête : sélecteur de sprint + capacité
      { el: "div", props: { class: "sb-header" }, children: [
        { el: "div", props: { class: "sb-header-left" }, children: [
          { el: "label", props: { class: "sb-sprint-label" }, children: [fr ? "Sprint" : "Sprint"] },
          { comp: "Select", props: {
            value: "s48",
            options: SPRINTS.map(s => ({ value: s.value, label: s.label }))
          }}
        ]},
        { el: "div", props: { class: "sb-kpis" }, children: [
          { comp: "KpiCard", props: { label: fr ? "Stories" : "Stories", value: STORIES.length, tone: "category2" } },
          { comp: "KpiCard", props: { label: fr ? "Points totaux" : "Total points", value: STORIES.reduce((a, s) => a + s.points, 0), tone: "category3" } }
        ]}
      ]},
      // Barre de capacité
      { el: "div", props: { class: "sb-capacity" }, children: [
        { el: "span", props: { class: "sb-capacity-label" }, children: [CAPACITY.label] },
        { comp: "ProgressBar", props: {
          label: CAPACITY.label,
          value: Math.round((CAPACITY.completed / CAPACITY.total) * 100),
          size: "md",
          showValue: true
        }},
        { el: "span", props: { class: "sb-capacity-ratio" }, children: [`${CAPACITY.completed} / ${CAPACITY.total} pts`] }
      ]},
      // Tableau des stories
      { el: "div", props: { class: "sb-table-wrap" }, children: [
        { el: "div", props: { class: "sb-table-head" }, children: [
          fr ? "#" : "#",
          "ID",
          fr ? "Story" : "Story",
          fr ? "Points" : "Points",
          fr ? "Priorité" : "Priority",
          fr ? "Statut" : "Status",
          ""
        ].map(h => ({ el: "div", props: { class: "sb-th" }, children: [h] }))},
        { el: "div", props: { class: "sb-table-body" }, children: STORIES.map((s, i) => storyRowNode(s, i)) }
      ]}
    ]
  }]);

  const DS_COMPONENTS = [
    { name: "Select", slug: "select" },
    { name: "ProgressBar", slug: "progress-bar" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" },
    { name: "Avatar", slug: "avatar" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Projet" : "View · Project"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Backlog de sprint" : "Sprint Backlog"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Liste priorisée des stories du sprint avec capacité d'équipe, estimation en points et
        progression. En-tête avec sélecteur de sprint et barre de capacité, suivie d'un tableau de
        stories ordonnancées et glissables avec badges de statut et de priorité.
      {:else}
        Prioritized list of sprint stories with team capacity, point estimates and burn-down progress.
        Header with sprint selector and capacity bar, followed by an ordered, draggable table of
        stories with status and priority badges.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Backlog de sprint (données mock)" : "Sprint Backlog (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="sb-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .sb-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }

  :global(.sb-shell) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }

  :global(.sb-header) { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
  :global(.sb-header-left) { display: flex; align-items: center; gap: 0.75rem; }
  :global(.sb-sprint-label) { font-size: 0.875rem; font-weight: 600; color: var(--st-semantic-text-secondary, #475569); white-space: nowrap; }
  :global(.sb-kpis) { display: flex; gap: 1rem; }

  :global(.sb-capacity) { display: flex; flex-direction: column; gap: 0.4rem; background: var(--st-semantic-surface-subtle, #f8fafc); border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem 1rem; }
  :global(.sb-capacity-label) { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--st-semantic-text-secondary, #475569); }
  :global(.sb-capacity-ratio) { font-size: 0.8rem; color: var(--st-semantic-text-secondary, #475569); align-self: flex-end; }

  :global(.sb-table-wrap) { border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; overflow: hidden; background: var(--st-semantic-surface-raised, #fff); }
  :global(.sb-table-head) { display: grid; grid-template-columns: 2rem 4rem 1fr 5rem 6rem 7rem 5rem; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); }
  :global(.sb-th) { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--st-semantic-text-secondary, #475569); }
  :global(.sb-table-body) { display: flex; flex-direction: column; }
  :global(.sb-row) { display: grid; grid-template-columns: 2rem 4rem 1fr 5rem 6rem 7rem 5rem; gap: 0.5rem; align-items: center; padding: 0.55rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); font-size: 0.875rem; }
  :global(.sb-row:last-child) { border-bottom: none; }
  :global(.sb-row:hover) { background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.sb-cell) { display: flex; align-items: center; min-width: 0; }
  :global(.sb-cell-order) { font-size: 0.75rem; font-weight: 700; color: var(--st-semantic-text-secondary, #475569); }
  :global(.sb-cell-id) { font-size: 0.75rem; font-family: monospace; color: var(--st-semantic-text-secondary, #475569); }
  :global(.sb-cell-title) { gap: 0.5rem; overflow: hidden; }
  :global(.sb-title-text) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
  :global(.sb-cell-pts) { justify-content: center; }
  :global(.sb-cell-action) { justify-content: flex-end; }

  @media (max-width: 800px) {
    :global(.sb-table-head), :global(.sb-row) { grid-template-columns: 2rem 1fr 5rem 7rem 5rem; }
    :global(.sb-cell-id) { display: none; }
    :global(.sb-cell-pts) { display: none; }
  }
</style>
