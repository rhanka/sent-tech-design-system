<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (import CSV → champs CRM) ─────────────────────────

  const STEPS = $derived([
    { label: fr ? "Source" : "Source", description: fr ? "Fichier" : "File" },
    { label: fr ? "Mappage" : "Mapping", description: fr ? "Colonnes → champs" : "Columns → fields" },
    { label: fr ? "Revue" : "Review", description: fr ? "Aperçu" : "Preview" },
    { label: "Import" }
  ]);

  const PREVIEW_COLUMNS = [
    { key: "c1", label: () => "company_name" },
    { key: "c2", label: () => "contact_email" },
    { key: "c3", label: () => "country_code" },
    { key: "c4", label: () => "annual_rev" }
  ];

  const PREVIEW_ROWS = [
    { id: "1", c1: "Airbus Group", c2: "m.lefebvre@airbus.example", c3: "FR", c4: "1240000" },
    { id: "2", c1: "Safran SA", c2: "contact@safran.example", c3: "FR", c4: "880000" },
    { id: "3", c1: "Orange SA", c2: "b2b@orange.example", c3: "FR", c4: "650000" },
    { id: "4", c1: "Atos SE", c2: "—", c3: "FR", c4: "" }
  ];

  const FIELD_OPTIONS = [
    { value: "", label: fr ? "— Ignorer —" : "— Ignore —" },
    { value: "name", label: fr ? "Nom du compte" : "Account name" },
    { value: "email", label: fr ? "Email de contact" : "Contact email" },
    { value: "country", label: fr ? "Pays" : "Country" },
    { value: "revenue", label: fr ? "Chiffre d'affaires" : "Revenue" }
  ];

  const MAPPINGS = $derived([
    { source: "company_name", field: "name" },
    { source: "contact_email", field: "email" },
    { source: "country_code", field: "country" },
    { source: "annual_rev", field: "revenue" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "im-shell" },
      children: [
        // Stepper du flux
        {
          comp: "Stepper",
          props: {
            current: 1,
            label: fr ? "Import de données" : "Data import",
            steps: STEPS
          }
        },
        // Étape 1 — Source : FileUploader
        {
          el: "div",
          props: { class: "im-section" },
          children: [
            { el: "h3", props: { class: "im-section-title" }, children: [fr ? "1 · Source du fichier" : "1 · File source"] },
            {
              comp: "FileUploader",
              props: {
                label: fr ? "Glisser-déposer un CSV ou cliquer pour importer" : "Drag-and-drop a CSV or click to import",
                accept: ".csv",
                items: [
                  {
                    name: "contacts-2026.csv",
                    size: 184320,
                    file: { name: "contacts-2026.csv", size: 184320 },
                    status: "complete"
                  }
                ]
              }
            }
          ]
        },
        // Étape 2 — Mappage colonne → champ (Select par ligne)
        {
          el: "div",
          props: { class: "im-section" },
          children: [
            { el: "h3", props: { class: "im-section-title" }, children: [fr ? "2 · Mappage des colonnes" : "2 · Column mapping"] },
            {
              el: "div",
              props: { class: "im-map-grid" },
              children: MAPPINGS.flatMap((m) => [
                {
                  el: "div",
                  props: { class: "im-map-source" },
                  children: [
                    { el: "code", props: { class: "im-map-col" }, children: [m.source] },
                    { el: "span", props: { class: "im-map-arrow" }, children: ["→"] }
                  ]
                },
                {
                  comp: "Select" as const,
                  props: {
                    label: fr ? "Champ cible" : "Target field",
                    value: m.field,
                    options: FIELD_OPTIONS
                  }
                }
              ])
            }
          ]
        },
        // Étape 3 — Revue : aperçu + alerte de validation
        {
          el: "div",
          props: { class: "im-section" },
          children: [
            { el: "h3", props: { class: "im-section-title" }, children: [fr ? "3 · Revue & validation" : "3 · Review & validation"] },
            {
              comp: "Alert",
              props: {
                tone: "warning",
                title: fr ? "1 ligne à vérifier" : "1 row to review",
                message: fr
                  ? "La ligne « Atos SE » a un email manquant et un chiffre d'affaires vide. Elle sera importée avec des valeurs nulles."
                  : "Row “Atos SE” has a missing email and an empty revenue. It will be imported with null values."
              }
            },
            {
              comp: "DataTable",
              props: {
                caption: fr ? "Aperçu des 4 premières lignes" : "Preview of the first 4 rows",
                columns: PREVIEW_COLUMNS.map((c) => ({ key: c.key, label: c.label() })),
                rows: PREVIEW_ROWS,
                size: "sm"
              }
            }
          ]
        },
        // Actions du flux
        {
          el: "div",
          props: { class: "im-actions" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Précédent" : "Back"] },
            { comp: "Button", props: { variant: "primary" }, children: [fr ? "Lancer l'import" : "Run import"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "FileUploader", slug: "file-uploader" },
    { name: "DataTable", slug: "data-table" },
    { name: "Select", slug: "select" },
    { name: "Alert", slug: "alert" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Import / Données" : "View · Import / Data"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Import / mappage de données" : "Data import / mapping"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Le flux d'import des outils BI (PowerBI, Qlik, Tableau) : <code>Stepper</code>
        (Source → Mappage → Revue → Import) + <code>FileUploader</code> + <code>DataTable</code>
        d'aperçu + <code>Select</code> de mappage colonne → champ + <code>Alert</code> de
        validation. Un seul <code>NodeSpec</code> → rendu identique en Svelte, React et Vue.
      {:else}
        The import flow of BI tools (PowerBI, Qlik, Tableau): <code>Stepper</code>
        (Source → Mapping → Review → Import) + <code>FileUploader</code> + preview
        <code>DataTable</code> + column→field <code>Select</code> mapping + validation
        <code>Alert</code>. One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
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
      title={fr ? "Import / mappage — flux CSV (données mock)" : "Import / mapping — CSV flow (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="im-comp-list">
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

  .im-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Import / mapping (global → propagé dans les îles React/Vue) ─── */
  :global(.im-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :global(.im-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  :global(.im-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.im-map-grid) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: 0.75rem 1rem;
    align-items: end;
  }

  :global(.im-map-source) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }

  :global(.im-map-col) {
    font-size: 0.85rem;
    font-weight: 600;
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border-radius: 0.25rem;
    padding: 0.2rem 0.45rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.im-map-arrow) {
    color: var(--st-semantic-text-secondary, #475569);
    font-weight: 700;
  }

  :global(.im-actions) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    :global(.im-map-grid) {
      grid-template-columns: 1fr;
    }
    :global(.im-map-source) {
      padding-bottom: 0;
    }
  }
</style>
