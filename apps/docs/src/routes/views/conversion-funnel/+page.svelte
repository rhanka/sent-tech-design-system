<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock : entonnoir de conversion e-commerce ────────────────────

  const FUNNEL_STAGES = $derived([
    { key: "visit",    label: fr ? "Visites"          : "Visits",         value: 48200, pct: 100  },
    { key: "product",  label: fr ? "Pages produit"    : "Product Pages",  value: 29400, pct: 61.0 },
    { key: "cart",     label: fr ? "Ajouts panier"    : "Cart Adds",      value: 14700, pct: 50.0 },
    { key: "checkout", label: fr ? "Paiement initié"  : "Checkout Start", value:  7350, pct: 50.0 },
    { key: "order",    label: fr ? "Commandes"        : "Orders",         value:  3240, pct: 44.1 }
  ]);

  const STEP_ROWS = $derived([
    { id: "1", etape: fr ? "Visites → Pages produit"    : "Visits → Product Pages",  entree: "48 200", sortie: "29 400", taux_passage: "61,0 %", taux_chute: "39,0 %" },
    { id: "2", etape: fr ? "Pages produit → Panier"    : "Product Pages → Cart",     entree: "29 400", sortie: "14 700", taux_passage: "50,0 %", taux_chute: "50,0 %" },
    { id: "3", etape: fr ? "Panier → Paiement"         : "Cart → Checkout",          entree: "14 700", sortie:  "7 350", taux_passage: "50,0 %", taux_chute: "50,0 %" },
    { id: "4", etape: fr ? "Paiement → Commande"       : "Checkout → Order",         entree:  "7 350", sortie:  "3 240", taux_passage: "44,1 %", taux_chute: "55,9 %" }
  ]);

  const STEP_COLUMNS = $derived([
    { key: "etape",         label: fr ? "Transition"      : "Transition" },
    { key: "entree",        label: fr ? "Entrée"          : "Entry",       align: "end" as const },
    { key: "sortie",        label: fr ? "Sortie"          : "Exit",        align: "end" as const },
    { key: "taux_passage",  label: fr ? "Taux passage"    : "Pass-through",align: "end" as const },
    { key: "taux_chute",    label: fr ? "Taux de chute"   : "Drop-off",    align: "end" as const }
  ]);

  const SEGMENT_OPTIONS = $derived([
    { value: "all",     label: fr ? "Tous les segments"  : "All Segments"   },
    { value: "mobile",  label: "Mobile"                                       },
    { value: "desktop", label: "Desktop"                                      },
    { value: "new",     label: fr ? "Nouveaux visiteurs" : "New Visitors"    },
    { value: "return",  label: fr ? "Visiteurs récurrents":"Returning Visitors"}
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "cf-shell" },
      children: [
        // Alerte info
        {
          comp: "Alert",
          props: {
            tone: "info",
            title: fr ? "Données simulées — juin 2026" : "Simulated data — June 2026",
            message: fr
              ? "Entonnoir basé sur une boutique e-commerce fictive. Utilisez les filtres pour isoler un segment."
              : "Funnel based on a fictional e-commerce store. Use filters to isolate a segment."
          }
        },
        // KPI row
        {
          el: "div",
          props: { class: "cf-kpis" },
          children: [
            {
              comp: "KpiCard",
              props: { label: fr ? "Visites totales" : "Total Visits",    value: "48 200", delta: "+8,4 %", tone: "category1" }
            },
            {
              comp: "KpiCard",
              props: { label: fr ? "Commandes"       : "Orders",          value:  "3 240", delta: "+5,2 %", tone: "category2" }
            },
            {
              comp: "KpiCard",
              props: { label: fr ? "Conversion globale" : "Overall Rate", value:  "6,7 %", delta: "-0,3 %", tone: "category3" }
            },
            {
              comp: "KpiCard",
              props: { label: fr ? "Valeur moy. panier" : "Avg. Order Value", value: "87 €", delta: "+2,1 %", tone: "category4" }
            }
          ]
        },
        // Filtre segment
        {
          el: "div",
          props: { class: "cf-filters" },
          children: [
            {
              comp: "Select",
              props: {
                label: fr ? "Segment" : "Segment",
                options: SEGMENT_OPTIONS,
                value: "all"
              }
            }
          ]
        },
        // Graphique en barres décroissantes
        {
          comp: "BarChart",
          props: {
            label: fr ? "Entonnoir de conversion" : "Conversion Funnel",
            data: FUNNEL_STAGES.map((s) => ({ label: s.label, value: s.value, tone: "category1" as const })),
            orientation: "vertical",
            dataLabels: true
          }
        },
        // Progress bars entre étapes
        {
          el: "div",
          props: { class: "cf-progress-list" },
          children: FUNNEL_STAGES.slice(1).map((stage, i) => ({
            el: "div",
            props: { class: "cf-progress-item" },
            children: [
              {
                el: "div",
                props: { class: "cf-progress-meta" },
                children: [
                  { el: "span", props: { class: "cf-progress-label" }, children: [stage.label] },
                  {
                    comp: "Badge",
                    props: {
                      tone: stage.pct >= 50 ? "success" : "warning"
                    },
                    children: [`${stage.pct} %`]
                  }
                ]
              },
              {
                comp: "ProgressBar",
                props: { value: stage.pct, max: 100, tone: stage.pct >= 50 ? "success" : "warning", size: "sm" }
              }
            ]
          }))
        },
        // Table de détail par étape
        {
          comp: "Table",
          props: {
            caption: fr ? "Détail par transition" : "Per-step detail",
            columns: STEP_COLUMNS,
            rows: STEP_ROWS,
            size: "sm"
          }
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "BarChart", slug: "bar-chart" },
    { name: "KpiCard",  slug: "kpi-card"  },
    { name: "Table",    slug: "table"     },
    { name: "Select",   slug: "select"    },
    { name: "ProgressBar", slug: "progress-bar" },
    { name: "Badge",    slug: "badge"     },
    { name: "Alert",    slug: "alert"     }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Analytics / BI" : "Analytics / BI"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Entonnoir de conversion" : "Conversion Funnel"}</h1>
      <Badge tone="info">report</Badge>
    </div>
    <p>
      {#if fr}
        Visualisation d'entonnoir étape par étape construite sur des barres décroissantes, avec taux
        de passage et taux de chute affichés entre chaque palier. Cartes KPI de conversion globale,
        filtres de segment et table de détail par étape. Pour diagnostiquer les pertes du parcours
        utilisateur.
      {:else}
        Step-by-step funnel visualization built on descending bars, with pass-through and drop-off
        rates shown between each stage. Overall conversion KPI cards, segment filters and a per-step
        detail table. For diagnosing losses along the user journey.
      {/if}
    </p>
  </section>

  <TabbedExample nodes={demoNodes} title={fr ? "Entonnoir de conversion" : "Conversion Funnel"} />

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="cf-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  :global(.cf-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
  }

  :global(.cf-kpis) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  :global(.cf-filters) {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  :global(.cf-progress-list) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.cf-progress-item) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global(.cf-progress-meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  :global(.cf-progress-label) {
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  .cf-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
</style>
