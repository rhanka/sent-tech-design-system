<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock Production ───────────────────────────────────────────────

  const STEPS = $derived([
    { label: fr ? "Sélection du lot" : "Batch selection", description: fr ? "Terminé" : "Done" },
    { label: fr ? "Saisie des mesures" : "Measurement entry", description: fr ? "Terminé" : "Done" },
    { label: fr ? "Verdict" : "Verdict", description: fr ? "En cours" : "Current" },
    { label: fr ? "Certificat" : "Certificate" }
  ]);

  const PIE_DATA = $derived([
    { label: fr ? "Conforme" : "Pass", value: 87, tone: "category1" as const },
    { label: fr ? "Défaut mineur" : "Minor defect", value: 9, tone: "category2" as const },
    { label: fr ? "Défaut majeur" : "Major defect", value: 4, tone: "category3" as const }
  ]);

  const SCORE_CARDS = $derived([
    { label: fr ? "Score de conformité" : "Conformity score", value: "87 %", tone: "category1" as const },
    { label: fr ? "Pièces inspectées" : "Parts inspected", value: "115 / 120", tone: "category2" as const },
    { label: fr ? "Non-conformités" : "Non-conformances", value: "15", tone: "category3" as const }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "qi-shell" },
      children: [
        // Stepper multi-étapes
        {
          comp: "Stepper",
          props: {
            current: 2,
            label: fr ? "Contrôle qualité" : "Quality Inspection",
            steps: STEPS
          }
        },
        // KPIs de conformité
        {
          el: "div",
          props: { class: "qi-kpis" },
          children: SCORE_CARDS.map((c) => ({
            comp: "KpiCard",
            props: { label: c.label, value: c.value, tone: c.tone }
          }))
        },
        // Répartition des défauts
        {
          el: "div",
          props: { class: "qi-section" },
          children: [
            { el: "h3", props: { class: "qi-section-title" }, children: [fr ? "Répartition des défauts — Lot LOT-2026-0412" : "Defect breakdown — Batch LOT-2026-0412"] },
            {
              comp: "DonutChart",
              props: {
                data: PIE_DATA,
                centerLabel: fr ? "Répartition" : "Breakdown"
              }
            }
          ]
        },
        // Alerte non-conformité
        {
          comp: "Alert",
          props: {
            tone: "danger",
            title: fr ? "Non-conformité détectée" : "Non-conformance detected"
          },
          children: [fr
            ? "13 pièces présentent des défauts majeurs ou mineurs sur le lot LOT-2026-0412. Veuillez compléter le verdict et joindre le certificat de contrôle avant validation."
            : "13 parts show major or minor defects on batch LOT-2026-0412. Please complete the verdict and attach the inspection certificate before sign-off."]
        },
        // Verdict + pièce jointe
        {
          el: "div",
          props: { class: "qi-section" },
          children: [
            { el: "h3", props: { class: "qi-section-title" }, children: [fr ? "Étape 3 · Verdict et certification" : "Step 3 · Verdict and certification"] },
            {
              comp: "Input",
              props: {
                label: fr ? "Commentaire de l'inspecteur" : "Inspector comment",
                placeholder: fr ? "Ex. : défauts de soudure sur 4 pièces de la série B" : "e.g. weld defects on 4 parts of series B",
                value: ""
              }
            },
            {
              el: "div",
              props: { class: "qi-verdict-row" },
              children: [
                { comp: "Badge", props: { tone: "success" }, children: [fr ? "Conforme" : "Pass"] },
                { comp: "Badge", props: { tone: "danger" }, children: [fr ? "Non-conforme" : "Fail"] }
              ]
            },
            {
              comp: "FileUploader",
              props: {
                label: fr ? "Certificat de contrôle (PDF ou image)" : "Inspection certificate (PDF or image)",
                accept: ".pdf,.png,.jpg",
                buttonLabel: fr ? "Joindre le certificat" : "Attach certificate"
              }
            }
          ]
        },
        // Navigation
        {
          el: "div",
          props: { class: "qi-actions" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Précédent" : "Previous"] },
            { comp: "Button", props: { variant: "primary" }, children: [fr ? "Valider le contrôle" : "Sign off inspection"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "DonutChart", slug: "donut-chart" },
    { name: "Input", slug: "input" },
    { name: "FileUploader", slug: "file-uploader" },
    { name: "Alert", slug: "alert" },
    { name: "Badge", slug: "badge" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Production" : "Manufacturing"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Contrôle qualité" : "Quality Inspection"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Relevé de contrôle qualité en plusieurs étapes : sélection du lot, saisie des mesures, verdict conforme / non-conforme et pièce jointe du certificat. Score de conformité, répartition des défauts et alerte de non-conformité. Pour valider la qualité en fin d'opération."
        : "Multi-step quality control record: batch selection, measurement entry, pass / fail verdict and certificate attachment. Conformity score, defect breakdown and non-conformance alert. For signing off quality at the end of an operation."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Contrôle qualité · LOT-2026-0412 (données mock)" : "Quality Inspection · LOT-2026-0412 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="qi-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .qi-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
  :global(.qi-shell) { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
  :global(.qi-kpis) { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
  :global(.qi-section) { background: var(--st-semantic-surface-raised, #fff); border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
  :global(.qi-section-title) { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.qi-verdict-row) { display: flex; gap: 0.75rem; align-items: center; }
  :global(.qi-actions) { display: flex; justify-content: flex-end; gap: 0.75rem; }
</style>
