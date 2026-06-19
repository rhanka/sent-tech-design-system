<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock cohortes de rétention ───────────────────────────────────

  const MEASURE_OPTIONS = $derived([
    { value: "users", label: fr ? "Utilisateurs actifs" : "Active users" },
    { value: "revenue", label: fr ? "Revenu récurrent" : "Recurring revenue" },
    { value: "sessions", label: fr ? "Sessions" : "Sessions" }
  ]);

  const GRANULARITY_OPTIONS = $derived([
    { value: "week", label: fr ? "Semaine" : "Week" },
    { value: "month", label: fr ? "Mois" : "Month" },
    { value: "quarter", label: fr ? "Trimestre" : "Quarter" }
  ]);

  const COHORT_COLUMNS = $derived([
    { key: "cohort", label: fr ? "Cohorte" : "Cohort", sortable: false },
    { key: "size", label: fr ? "Taille" : "Size", sortable: true, align: "end" as const },
    { key: "p0", label: "M+0", sortable: true, align: "end" as const },
    { key: "p1", label: "M+1", sortable: true, align: "end" as const },
    { key: "p2", label: "M+2", sortable: true, align: "end" as const },
    { key: "p3", label: "M+3", sortable: true, align: "end" as const },
    { key: "p4", label: "M+4", sortable: true, align: "end" as const },
    { key: "p5", label: "M+5", sortable: true, align: "end" as const }
  ]);

  const COHORT_ROWS = [
    { id: "1", cohort: "Jan 2026", size: "4 820", p0: "100 %", p1: "68 %", p2: "52 %", p3: "44 %", p4: "39 %", p5: "35 %" },
    { id: "2", cohort: "Fév 2026", size: "5 130", p0: "100 %", p1: "71 %", p2: "55 %", p3: "47 %", p4: "41 %", p5: "—" },
    { id: "3", cohort: "Mar 2026", size: "6 240", p0: "100 %", p1: "73 %", p2: "58 %", p3: "49 %", p4: "—", p5: "—" },
    { id: "4", cohort: "Avr 2026", size: "7 080", p0: "100 %", p1: "75 %", p2: "61 %", p3: "—", p4: "—", p5: "—" },
    { id: "5", cohort: "Mai 2026", size: "8 310", p0: "100 %", p1: "77 %", p2: "—", p3: "—", p4: "—", p5: "—" },
    { id: "6", cohort: "Jun 2026", size: "9 150", p0: "100 %", p1: "—", p2: "—", p3: "—", p4: "—", p5: "—" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "ch-shell" },
      children: [
        // Barre de contrôles
        {
          el: "div",
          props: { class: "ch-toolbar" },
          children: [
            {
              comp: "Select",
              props: {
                label: fr ? "Mesure" : "Measure",
                value: "users",
                options: MEASURE_OPTIONS
              }
            },
            {
              comp: "Select",
              props: {
                label: fr ? "Granularité" : "Granularity",
                value: "month",
                options: GRANULARITY_OPTIONS
              }
            },
            {
              comp: "Combobox",
              props: {
                label: fr ? "Segment" : "Segment",
                placeholder: fr ? "Tous les segments" : "All segments",
                options: [
                  { value: "all", label: fr ? "Tous" : "All" },
                  { value: "web", label: "Web" },
                  { value: "mobile", label: "Mobile" },
                  { value: "api", label: "API" }
                ]
              }
            },
            {
              comp: "Badge",
              props: { tone: "info" },
              children: [fr ? "Données live" : "Live data"]
            }
          ]
        },
        // Cartes de synthèse
        {
          el: "div",
          props: { class: "ch-scorecards" },
          children: [
            {
              comp: "ScoreCard",
              props: {
                label: fr ? "Rétention M+1 moy." : "Avg M+1 Retention",
                value: "72,8 %",
                delta: "+4,2 pp",
                trend: "up" as const
              }
            },
            {
              comp: "ScoreCard",
              props: {
                label: fr ? "Rétention M+3 moy." : "Avg M+3 Retention",
                value: "46,7 %",
                delta: "+2,1 pp",
                trend: "up" as const
              }
            },
            {
              comp: "ScoreCard",
              props: {
                label: fr ? "Nouvelles cohortes" : "New cohorts",
                value: "6",
                delta: fr ? "Jan – Jun 2026" : "Jan – Jun 2026"
              }
            },
            {
              comp: "ScoreCard",
              props: {
                label: fr ? "Taille moy. cohorte" : "Avg cohort size",
                value: "6 788",
                delta: "+19 %",
                trend: "up" as const
              }
            }
          ]
        },
        // Alerte seuil
        {
          comp: "Alert",
          props: {
            tone: "warning",
            title: fr ? "Seuil critique M+2" : "M+2 critical threshold",
            message: fr
              ? "La rétention M+2 de la cohorte Jan 2026 (52 %) passe sous le seuil cible de 55 %."
              : "Jan 2026 cohort M+2 retention (52 %) is below the 55 % target threshold."
          }
        },
        // Grille heatmap sous forme de DataGrid
        {
          comp: "DataGrid",
          props: {
            caption: fr ? "Rétention par cohorte — taux de maintien par période" : "Cohort Retention — keep rate by period",
            columns: COHORT_COLUMNS,
            rows: COHORT_ROWS,
            density: "compact" as const
          }
        },
        // Légende badges seuil
        {
          el: "div",
          props: { class: "ch-legend" },
          children: [
            { el: "span", props: {}, children: [fr ? "Seuils : " : "Thresholds: "] },
            { comp: "Badge", props: { tone: "success" }, children: ["≥ 70 %"] },
            { comp: "Badge", props: { tone: "warning" }, children: ["50 – 69 %"] },
            { comp: "Badge", props: { tone: "error" }, children: ["< 50 %"] }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "DataGrid", slug: "data-grid" },
    { name: "ScoreCard", slug: "score-card" },
    { name: "Select", slug: "select" },
    { name: "Combobox", slug: "combobox" },
    { name: "Badge", slug: "badge" },
    { name: "Alert", slug: "alert" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Analytics / BI" : "Analytics / BI"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Rétention par cohorte" : "Cohort Retention"}</h1>
      <Badge tone="info">report</Badge>
    </div>
    <p>
      {fr
        ? "Analyse de rétention en grille type heatmap : chaque ligne est une cohorte d'acquisition, chaque colonne une période de suivi, l'intensité de la cellule traduit le taux de rétention. Sélecteurs de mesure et de granularité, cartes de synthèse et badges de seuil. Pour mesurer la fidélisation dans le temps."
        : "Retention analysis as a heatmap-style grid: each row is an acquisition cohort, each column a follow-up period, and cell intensity encodes the retention rate. Measure and granularity selectors, summary cards and threshold badges. For measuring loyalty over time."}
    </p>
  </section>

  <TabbedExample nodes={demoNodes} title={fr ? "Rétention par cohorte" : "Cohort Retention"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ch-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  :global(.ch-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.ch-toolbar) {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.ch-scorecards) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  :global(.ch-legend) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  .ch-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
</style>
