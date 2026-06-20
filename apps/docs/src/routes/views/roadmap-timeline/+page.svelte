<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";
  import type { StepperStep } from "@sentropic/design-system-svelte";

  const fr = $derived(locale.value === "fr");

  const MILESTONES = $derived<StepperStep[]>([
    { label: fr ? "Q1 2025 — Cadrage" : "Q1 2025 — Scoping", description: fr ? "Vision & périmètre validés" : "Vision & scope signed off" },
    { label: fr ? "Q2 2025 — Fondations" : "Q2 2025 — Foundations", description: fr ? "Design system v1 · API core" : "Design system v1 · Core API" },
    { label: fr ? "Q3 2025 — Bêta" : "Q3 2025 — Beta", description: fr ? "Pilote 3 clients internes" : "3 internal client pilots" },
    { label: fr ? "Q4 2025 — GA" : "Q4 2025 — GA", description: fr ? "Disponibilité générale" : "General availability" }
  ]);

  type Epic = {
    title: () => string;
    team: () => string;
    status: "done" | "in-progress" | "planned";
    progress: number;
    quarter: string;
  };

  const EPICS = $derived<Epic[]>([
    { title: () => (fr ? "Design tokens & thèmes" : "Design tokens & themes"), team: () => (fr ? "Design" : "Design"), status: "done", progress: 100, quarter: "Q1" },
    { title: () => (fr ? "Composants core (36 UI)" : "Core components (36 UI)"), team: () => (fr ? "Ingénierie" : "Engineering"), status: "done", progress: 100, quarter: "Q1" },
    { title: () => (fr ? "Portail documentation" : "Documentation portal"), team: () => (fr ? "Ingénierie" : "Engineering"), status: "in-progress", progress: 72, quarter: "Q2" },
    { title: () => (fr ? "Graphiques & dataviz" : "Charts & dataviz"), team: () => (fr ? "Dataviz" : "Dataviz"), status: "in-progress", progress: 58, quarter: "Q2" },
    { title: () => (fr ? "Accessibilité WCAG 2.2 AA" : "Accessibility WCAG 2.2 AA"), team: () => (fr ? "QA" : "QA"), status: "in-progress", progress: 40, quarter: "Q3" },
    { title: () => (fr ? "SDK Angular" : "Angular SDK"), team: () => (fr ? "Ingénierie" : "Engineering"), status: "planned", progress: 10, quarter: "Q3" },
    { title: () => (fr ? "Publication npm publique" : "Public npm publish"), team: () => (fr ? "DevRel" : "DevRel"), status: "planned", progress: 0, quarter: "Q4" }
  ]);

  const VELOCITY_DATA = [0, 18, 42, 68, 94, 120, 138, 155, 168, 182, 195, 208];

  function statusTone(s: Epic["status"]): "success" | "info" | "neutral" {
    if (s === "done") return "success";
    if (s === "in-progress") return "info";
    return "neutral";
  }

  function statusLabel(s: Epic["status"]): string {
    if (s === "done") return fr ? "Terminé" : "Done";
    if (s === "in-progress") return fr ? "En cours" : "In progress";
    return fr ? "Planifié" : "Planned";
  }

  function epicNode(e: Epic): NodeSpec {
    return {
      comp: "Card",
      props: { interactive: false },
      children: [
        {
          el: "div",
          props: { class: "rt-epic-header" },
          children: [
            { el: "span", props: { class: "rt-epic-title" }, children: [e.title()] },
            { comp: "Badge", props: { tone: statusTone(e.status) }, children: [statusLabel(e.status)] }
          ]
        },
        {
          el: "div",
          props: { class: "rt-epic-meta" },
          children: [
            { el: "span", props: { class: "rt-epic-team" }, children: [e.team()] },
            { el: "span", props: { class: "rt-epic-quarter" }, children: [e.quarter] }
          ]
        },
        {
          comp: "ProgressBar",
          props: { label: fr ? "Avancement" : "Progress", value: e.progress, size: "sm", showValue: true }
        }
      ]
    };
  }

  function quarterSection(q: string): NodeSpec {
    const epics = EPICS.filter((e) => e.quarter === q);
    return {
      el: "div",
      props: { class: "rt-quarter" },
      children: [
        { el: "h3", props: { class: "rt-quarter-label" }, children: [q] },
        { el: "div", props: { class: "rt-epic-grid" }, children: epics.map(epicNode) }
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "rt-root" },
      children: [
        {
          comp: "Stepper",
          props: { steps: MILESTONES, current: 2, orientation: "horizontal", label: fr ? "Jalons" : "Milestones" }
        },
        {
          el: "div",
          props: { class: "rt-quarters" },
          children: ["Q1", "Q2", "Q3", "Q4"].map(quarterSection)
        },
        {
          el: "div",
          props: { class: "rt-chart-section" },
          children: [
            { el: "h3", props: { class: "rt-chart-label" }, children: [fr ? "Vélocité cumulée (story points)" : "Cumulative velocity (story points)"] },
            {
              comp: "AreaChart",
              props: { data: VELOCITY_DATA, label: fr ? "Vélocité cumulée" : "Cumulative velocity", tone: "category2", height: 160 }
            }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "Card", slug: "card" },
    { name: "Badge", slug: "badge" },
    { name: "ProgressBar", slug: "progress-bar" },
    { name: "AreaChart", slug: "area-chart" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Projet" : "View · Project"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Feuille de route" : "Roadmap Timeline"}</h1>
      <Badge tone="info">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Vue chronologique des epics et jalons par trimestre avec filtres d'équipe et de statut. Stepper de jalons en tête, cartes d'epics avec barres d'avancement et graphique de vélocité cumulée."
        : "Timeline view of epics and milestones by quarter with team and status filters. Milestone stepper at the top, epic cards with progress bars, and a cumulative velocity chart."}
    </p>
  </section>

  <TabbedExample nodes={demoNodes} title={fr ? "Feuille de route" : "Roadmap Timeline"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="rt-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .rt-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.rt-root) {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
  }

  :global(.rt-quarters) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  :global(.rt-quarter) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.rt-quarter-label) {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0;
  }

  :global(.rt-epic-grid) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.rt-epic-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  :global(.rt-epic-title) {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.rt-epic-meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  :global(.rt-epic-team) {
    font-size: 0.8rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.rt-epic-quarter) {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--st-semantic-text-tertiary, #94a3b8);
  }

  :global(.rt-chart-section) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.rt-chart-label) {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0;
  }

  @media (max-width: 680px) {
    :global(.rt-quarters) {
      grid-template-columns: 1fr;
    }
  }
</style>
