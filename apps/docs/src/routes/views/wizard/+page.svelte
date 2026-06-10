<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (assistant de création de projet) ────────────────

  const STEPS = $derived([
    { label: fr ? "Organisation" : "Organization", description: fr ? "Terminé" : "Done" },
    { label: fr ? "Projet" : "Project", description: fr ? "En cours" : "Current" },
    { label: fr ? "Équipe" : "Team" },
    { label: fr ? "Confirmation" : "Confirm" }
  ]);

  const RECAP = $derived([
    { key: fr ? "Organisation" : "Organization", value: "Sent Tech" },
    { key: fr ? "Région" : "Region", value: "Canada — Québec" },
    { key: fr ? "Plan" : "Plan", value: "Pro" }
  ]);

  const REGION_OPTIONS = [
    { value: "ca-qc", label: "Canada — Québec" },
    { value: "ca-on", label: "Canada — Ontario" },
    { value: "eu-fr", label: fr ? "Europe — France" : "Europe — France" }
  ];

  const VISIBILITY_OPTIONS = [
    { value: "private", label: fr ? "Privé" : "Private" },
    { value: "internal", label: fr ? "Interne" : "Internal" },
    { value: "public", label: fr ? "Public" : "Public" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "wz-shell" },
      children: [
        // Stepper de progression
        {
          comp: "Stepper",
          props: {
            current: 1,
            label: fr ? "Création du projet" : "Project setup",
            steps: STEPS
          }
        },
        {
          el: "div",
          props: { class: "wz-body" },
          children: [
            // Étape courante — formulaire
            {
              el: "div",
              props: { class: "wz-step" },
              children: [
                { el: "h3", props: { class: "wz-step-title" }, children: [fr ? "Étape 2 · Détails du projet" : "Step 2 · Project details"] },
                {
                  comp: "Form",
                  props: { status: "idle" },
                  children: [
                    {
                      comp: "FormGroup",
                      props: {
                        legend: fr ? "Informations du projet" : "Project information",
                        helperText: fr ? "Ces informations identifient le projet." : "These identify the project."
                      },
                      children: [
                        { comp: "Input", props: { label: fr ? "Nom du projet" : "Project name", value: "Forge", placeholder: "Sent Forge" } },
                        {
                          comp: "Select",
                          props: { label: fr ? "Région d'hébergement" : "Hosting region", value: "ca-qc", options: REGION_OPTIONS }
                        },
                        {
                          comp: "Select",
                          props: { label: fr ? "Visibilité" : "Visibility", value: "private", options: VISIBILITY_OPTIONS }
                        }
                      ]
                    },
                    {
                      comp: "FormGroup",
                      props: { legend: fr ? "Options" : "Options" },
                      children: [
                        { comp: "Checkbox", props: { label: fr ? "Activer les déploiements automatiques" : "Enable automatic deployments", checked: true } },
                        { comp: "Checkbox", props: { label: fr ? "Notifier l'équipe par e-mail" : "Notify the team by email" } }
                      ]
                    }
                  ]
                }
              ]
            },
            // Récapitulatif latéral
            {
              el: "aside",
              props: { class: "wz-recap" },
              children: [
                { el: "h3", props: { class: "wz-step-title" }, children: [fr ? "Récapitulatif" : "Summary"] },
                {
                  comp: "StructuredList",
                  props: {
                    bordered: true,
                    items: RECAP.map((r) => ({ key: r.key, term: r.key, value: r.value }))
                  }
                }
              ]
            }
          ]
        },
        // Navigation Précédent / Suivant
        {
          comp: "ButtonGroup",
          props: { label: fr ? "Navigation de l'assistant" : "Wizard navigation", class: "wz-nav" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Précédent" : "Previous"] },
            { comp: "Button", props: { variant: "primary" }, children: [fr ? "Suivant" : "Next"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "Form", slug: "form" },
    { name: "FormGroup", slug: "form-group" },
    { name: "Input", slug: "input" },
    { name: "Select", slug: "select" },
    { name: "Checkbox", slug: "checkbox" },
    { name: "ButtonGroup", slug: "button-group" },
    { name: "StructuredList", slug: "structured-list" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Assistant" : "View · Wizard"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Assistant multi-étapes" : "Multi-step Wizard"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Patron de tous les flux guidés (onboarding, configuration, création) :
        <code>Stepper</code> de progression + <code>Form</code>/<code>FormGroup</code> de l'étape
        courante + <code>ButtonGroup</code> (Précédent / Suivant) + récapitulatif
        <code>StructuredList</code>. Un seul <code>NodeSpec</code> → rendu identique en Svelte,
        React et Vue.
      {:else}
        The pattern for every guided flow (onboarding, setup, creation):
        a progress <code>Stepper</code> + the current step's <code>Form</code>/<code>FormGroup</code>
        + a <code>ButtonGroup</code> (Previous / Next) + a <code>StructuredList</code> summary.
        One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
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
      title={fr ? "Assistant multi-étapes — création de projet (données mock)" : "Multi-step Wizard — project setup (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="wz-comp-list">
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

  .wz-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Wizard (global → propagé dans les îles React/Vue) ──────────── */
  :global(.wz-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :global(.wz-body) {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  :global(.wz-step) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    min-width: 0;
  }

  :global(.wz-recap) {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    min-width: 0;
  }

  :global(.wz-step-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.wz-nav) {
    justify-content: flex-end;
  }

  @media (max-width: 760px) {
    :global(.wz-body) {
      grid-template-columns: 1fr;
    }
  }
</style>
