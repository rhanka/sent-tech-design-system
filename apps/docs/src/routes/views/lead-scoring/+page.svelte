<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock CRM — Scoring des leads ─────────────────────────────────

  const SCORECARDS = $derived([
    { label: fr ? "Score moyen" : "Avg Score", value: "74", delta: "+8", trend: "up" as const },
    { label: fr ? "Leads chauds" : "Hot Leads", value: "23", delta: "+5", trend: "up" as const },
    { label: fr ? "Convertis ce mois" : "Converted this month", value: "11", delta: "+3", trend: "up" as const },
    { label: fr ? "Délai moyen (j)" : "Avg Time (d)", value: "18", delta: "-4", trend: "down" as const }
  ]);

  const PIE_SLICES = $derived([
    { label: fr ? "Inbound web" : "Inbound web", value: 38, tone: "category1" as const },
    { label: fr ? "Campagne email" : "Email campaign", value: 27, tone: "category2" as const },
    { label: fr ? "Événement" : "Event", value: 19, tone: "category3" as const },
    { label: fr ? "Référencement" : "Referral", value: 10, tone: "category4" as const },
    { label: fr ? "Autre" : "Other", value: 6, tone: "category5" as const }
  ]);

  type Lead = { name: string; company: string; score: number; source: string; status: string; statusTone: "success" | "warning" | "info"; tone: "category1" | "category2" | "category3" | "category4" | "category5" };

  const LEADS = $derived<Lead[]>([
    { name: "Marie Lefebvre", company: "Airbus Group", score: 92, source: fr ? "Inbound web" : "Inbound web", status: fr ? "Chaud" : "Hot", statusTone: "success", tone: "category1" },
    { name: "Karim Benali", company: "Orange SA", score: 88, source: fr ? "Campagne email" : "Email campaign", status: fr ? "Chaud" : "Hot", statusTone: "success", tone: "category2" },
    { name: "Sophie Durand", company: "Safran SA", score: 81, source: fr ? "Événement" : "Event", status: fr ? "Chaud" : "Hot", statusTone: "success", tone: "category3" },
    { name: "Léa Moreau", company: "Thales Group", score: 74, source: fr ? "Référencement" : "Referral", status: fr ? "Tiède" : "Warm", statusTone: "warning", tone: "category4" },
    { name: "Tom Girard", company: "Capgemini", score: 67, source: fr ? "Campagne email" : "Email campaign", status: fr ? "Tiède" : "Warm", statusTone: "warning", tone: "category5" },
    { name: "Julie Martin", company: "Société Générale", score: 55, source: fr ? "Inbound web" : "Inbound web", status: fr ? "Froid" : "Cold", statusTone: "info", tone: "category1" }
  ]);

  const TABLE_COLS = $derived([fr ? "Lead" : "Lead", fr ? "Score" : "Score", fr ? "Source" : "Source", fr ? "Statut" : "Status", ""]);

  function leadRowNode(lead: Lead): NodeSpec {
    return {
      el: "div", props: { class: "ls-row" },
      children: [
        { el: "div", props: { class: "ls-cell ls-cell-lead" }, children: [
          { comp: "Avatar", props: { name: lead.name, size: "sm", tone: lead.tone } },
          { el: "div", props: { class: "ls-lead-info" }, children: [
            { el: "span", props: { class: "ls-lead-name" }, children: [lead.name] },
            { el: "span", props: { class: "ls-lead-company" }, children: [lead.company] }
          ]}
        ]},
        { el: "div", props: { class: "ls-cell ls-cell-score" }, children: [
          { el: "span", props: { class: "ls-score-value" }, children: [String(lead.score)] },
          { comp: "ProgressBar", props: { label: "", value: lead.score, size: "sm", showValue: false } }
        ]},
        { el: "div", props: { class: "ls-cell" }, children: [lead.source] },
        { el: "div", props: { class: "ls-cell" }, children: [{ comp: "Badge", props: { tone: lead.statusTone }, children: [lead.status] }] },
        { el: "div", props: { class: "ls-cell ls-cell-actions" }, children: [{ comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Contacter" : "Contact"] }] }
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([{
    el: "div", props: { class: "ls-shell" },
    children: [
      { el: "div", props: { class: "ls-scorecards" }, children: SCORECARDS.map((s) => ({ comp: "ScoreCard", props: { label: s.label, value: s.value, delta: s.delta, trend: s.trend } })) },
      { el: "div", props: { class: "ls-mid" }, children: [
        { el: "div", props: { class: "ls-kpis" }, children: [
          { comp: "KpiCard", props: { label: fr ? "Score cible (≥ 80)" : "Target score (≥ 80)", value: 23, delta: 5, deltaFormat: "absolute", tone: "category1", sparkline: [10, 13, 15, 17, 20, 23] } },
          { comp: "KpiCard", props: { label: fr ? "Taux de qualification" : "Qualification rate", value: 0.38, format: "percent" as const, delta: 0.06, deltaFormat: "percent" as const, tone: "category2", sparkline: [0.26, 0.29, 0.31, 0.34, 0.36, 0.38] } }
        ]},
        { el: "div", props: { class: "ls-pie-legend" }, children: [
          { el: "h3", props: { class: "ls-legend-title" }, children: [fr ? "Répartition par source" : "Breakdown by source"] },
          { el: "div", props: { class: "ls-legend-items" }, children: PIE_SLICES.map((s) => ({ el: "div", props: { class: "ls-legend-row" }, children: [{ comp: "Badge", props: { tone: s.tone }, children: [`${s.value} %`] }, { el: "span", props: { class: "ls-legend-label" }, children: [s.label] }] })) }
        ]}
      ]},
      { el: "div", props: { class: "ls-table-wrap" }, children: [
        { el: "h3", props: { class: "ls-table-title" }, children: [fr ? "Leads prioritaires" : "Priority leads"] },
        { el: "div", props: { class: "ls-table-head" }, children: TABLE_COLS.map((c) => ({ el: "div", props: { class: "ls-th" }, children: [c] })) },
        { el: "div", props: { class: "ls-table-body" }, children: LEADS.map(leadRowNode) }
      ]}
    ]
  }]);

  const DS_COMPONENTS = [
    { name: "ScoreCard", slug: "score-card" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Badge", slug: "badge" },
    { name: "ProgressBar", slug: "progress-bar" },
    { name: "Avatar", slug: "avatar" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · CRM" : "View · CRM"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Scoring des leads" : "Lead Scoring"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Qualification des leads par score : carte de score, répartition par source et liste priorisée.
        Combine <code>ScoreCard</code>, répartition en légende et table des leads chauds avec
        <code>ProgressBar</code>, <code>Badge</code> et <code>Avatar</code>.
      {:else}
        Lead qualification by score: score card, source breakdown and a prioritized list.
        Combines <code>ScoreCard</code>, legend breakdown and a hot-leads table with
        <code>ProgressBar</code>, <code>Badge</code> and <code>Avatar</code>.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Scoring des leads (données mock)" : "Lead Scoring (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ls-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .ls-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }

  :global(.ls-shell) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
  :global(.ls-scorecards) { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  :global(.ls-mid) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
  :global(.ls-kpis) { display: flex; flex-direction: column; gap: 1rem; }
  :global(.ls-pie-legend) { background: var(--st-semantic-surface-subtle, #f8fafc); border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; padding: 1rem; }
  :global(.ls-legend-title) { font-size: 0.875rem; font-weight: 700; margin: 0 0 0.75rem; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.ls-legend-items) { display: flex; flex-direction: column; gap: 0.5rem; }
  :global(.ls-legend-row) { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
  :global(.ls-legend-label) { color: var(--st-semantic-text-secondary, #475569); }
  :global(.ls-table-wrap) { border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; overflow: hidden; background: var(--st-semantic-surface-raised, #fff); }
  :global(.ls-table-title) { font-size: 0.875rem; font-weight: 700; margin: 0; padding: 0.75rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.ls-table-head) { display: grid; grid-template-columns: 2fr 1.5fr 1.2fr 1fr auto; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); }
  :global(.ls-th) { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--st-semantic-text-secondary, #475569); }
  :global(.ls-table-body) { display: flex; flex-direction: column; }
  :global(.ls-row) { display: grid; grid-template-columns: 2fr 1.5fr 1.2fr 1fr auto; gap: 0.5rem; align-items: center; padding: 0.6rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); font-size: 0.875rem; }
  :global(.ls-row:last-child) { border-bottom: none; }
  :global(.ls-row:hover) { background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.ls-cell) { display: flex; align-items: center; min-width: 0; }
  :global(.ls-cell-lead) { gap: 0.6rem; }
  :global(.ls-lead-info) { display: flex; flex-direction: column; min-width: 0; }
  :global(.ls-lead-name) { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.ls-lead-company) { font-size: 0.75rem; color: var(--st-semantic-text-secondary, #475569); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.ls-cell-score) { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
  :global(.ls-score-value) { font-size: 1rem; font-weight: 700; }
  :global(.ls-cell-actions) { justify-content: flex-end; }

  @media (max-width: 900px) {
    :global(.ls-scorecards) { grid-template-columns: repeat(2, 1fr); }
    :global(.ls-mid) { grid-template-columns: 1fr; }
    :global(.ls-table-head), :global(.ls-row) { grid-template-columns: 1fr 1fr auto; }
  }
</style>
