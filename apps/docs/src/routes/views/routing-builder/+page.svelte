<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock (gamme opératoire ERP Production) ────────────────────────

  const HEADER_FIELDS = $derived([
    { label: fr ? "Article" : "Item", value: "ART-00831" },
    { label: fr ? "Désignation" : "Description", value: fr ? "Vanne pneumatique DN50" : "Pneumatic valve DN50" },
    { label: fr ? "Révision" : "Revision", value: "B" },
    { label: fr ? "Statut" : "Status", value: fr ? "Actif" : "Active" },
    { label: fr ? "Temps total (min)" : "Total time (min)", value: "142" }
  ]);

  const OPERATIONS = $derived(
    fr ? [
      "OP-010 · Tournage CNC — Poste : TOUR-03 — Réglage : 15 min — Pièce : 8 min",
      "OP-020 · Perçage & alésage — Poste : PERC-01 — Réglage : 10 min — Pièce : 5 min",
      "OP-030 · Fraisage corps — Poste : FRAI-02 — Réglage : 20 min — Pièce : 12 min",
      "OP-040 · Ébavurage & nettoyage — Poste : FINI-01 — Réglage : 5 min — Pièce : 4 min",
      "OP-050 · Contrôle dimensionnel — Poste : CTRL-02 — Réglage : 8 min — Pièce : 6 min"
    ] : [
      "OP-010 · CNC Turning — Work center: LATHE-03 — Setup: 15 min — Cycle: 8 min",
      "OP-020 · Drilling & boring — Work center: DRILL-01 — Setup: 10 min — Cycle: 5 min",
      "OP-030 · Body milling — Work center: MILL-02 — Setup: 20 min — Cycle: 12 min",
      "OP-040 · Deburring & cleaning — Work center: FINISH-01 — Setup: 5 min — Cycle: 4 min",
      "OP-050 · Dimensional inspection — Work center: QC-02 — Setup: 8 min — Cycle: 6 min"
    ]
  );

  const BOM_ITEMS = $derived(
    fr ? [
      "Corps vanne acier inox 316L — Qté : 1 pce — Réf. : MAT-00221",
      "Actuateur pneumatique simple effet — Qté : 1 pce — Réf. : MAT-00354",
      "Joint torique NBR Ø50 — Qté : 2 pces — Réf. : MAT-00089",
      "Vis CHC M6×20 classe 8.8 — Qté : 8 pces — Réf. : MAT-00012"
    ] : [
      "Stainless steel valve body 316L — Qty: 1 pc — Ref: MAT-00221",
      "Single-acting pneumatic actuator — Qty: 1 pc — Ref: MAT-00354",
      "NBR O-ring Ø50 — Qty: 2 pcs — Ref: MAT-00089",
      "M6×20 socket head cap screw cl.8.8 — Qty: 8 pcs — Ref: MAT-00012"
    ]
  );

  const TAB_ITEMS = $derived([
    { value: "header", label: fr ? "En-tête" : "Header" },
    { value: "operations", label: fr ? "Opérations" : "Operations" },
    { value: "bom", label: fr ? "Nomenclature" : "Bill of Materials" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "rb-shell" },
      children: [
        // En-tête : titre + badge + actions
        {
          el: "div",
          props: { class: "rb-header" },
          children: [
            {
              el: "div",
              props: { class: "rb-header-id" },
              children: [
                { el: "h2", props: { class: "rb-title" }, children: [fr ? "GAM-2026-00831 · Vanne pneumatique DN50" : "RTG-2026-00831 · Pneumatic valve DN50"] },
                { comp: "Badge", props: { tone: "success" }, children: [fr ? "Actif" : "Active"] }
              ]
            },
            {
              el: "div",
              props: { class: "rb-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Dupliquer" : "Duplicate"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Enregistrer" : "Save"] }
              ]
            }
          ]
        },

        // Onglets
        {
          comp: "Tabs",
          props: { items: TAB_ITEMS, label: fr ? "Sections de la gamme" : "Routing sections" }
        },

        // Onglet En-tête : ConfigItemCard avec champs
        {
          el: "div",
          props: { class: "rb-section" },
          children: [
            { el: "h3", props: { class: "rb-section-title" }, children: [fr ? "Informations générales" : "General information"] },
            {
              el: "div",
              props: { class: "rb-fields" },
              children: HEADER_FIELDS.map((f) => ({
                comp: "FieldCard",
                props: { label: f.label, value: f.value }
              }))
            },
            {
              el: "div",
              props: { class: "rb-inputs" },
              children: [
                {
                  comp: "Input",
                  props: {
                    label: fr ? "Description longue" : "Long description",
                    placeholder: fr ? "Ex. : gamme validée en révision B" : "e.g. routing validated at revision B",
                    value: ""
                  }
                },
                {
                  comp: "Combobox",
                  props: {
                    label: fr ? "UDA de fabrication" : "Manufacturing UoM",
                    options: [
                      { value: "pce", label: fr ? "Pièce" : "Piece" },
                      { value: "lot", label: fr ? "Lot" : "Batch" },
                      { value: "kg", label: "kg" }
                    ],
                    value: "pce"
                  }
                }
              ]
            }
          ]
        },

        // Onglet Opérations : liste ordonnée
        {
          el: "div",
          props: { class: "rb-section" },
          children: [
            { el: "h3", props: { class: "rb-section-title" }, children: [fr ? "Séquence d'opérations" : "Operation sequence"] },
            { comp: "OrderedList", props: { items: OPERATIONS } },
            {
              comp: "Button",
              props: { variant: "secondary", size: "sm" },
              children: [fr ? "+ Ajouter une opération" : "+ Add operation"]
            }
          ]
        },

        // Onglet Nomenclature
        {
          el: "div",
          props: { class: "rb-section" },
          children: [
            { el: "h3", props: { class: "rb-section-title" }, children: [fr ? "Nomenclature liée" : "Bill of materials"] },
            { comp: "OrderedList", props: { items: BOM_ITEMS } }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Tabs", slug: "tabs" },
    { name: "OrderedList", slug: "ordered-list" },
    { name: "FieldCard", slug: "field-card" },
    { name: "Input", slug: "input" },
    { name: "Combobox", slug: "combobox" },
    { name: "Button", slug: "button" },
    { name: "Badge", slug: "badge" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Production" : "Manufacturing"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Gamme opératoire" : "Routing Builder"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Éditeur de gamme opératoire pour un article : séquence d'opérations en liste ordonnée,
        poste de charge, temps et outillage par étape. Onglets en-tête / opérations / nomenclature,
        fiches de configuration éditables. Pour définir le processus de fabrication.
      {:else}
        Routing editor for an item: operation sequence as an ordered list, work center, time and
        tooling per step. Header / operations / bill-of-materials tabs, editable configuration
        cards. For defining the manufacturing process.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Gamme opératoire : ART-00831 (données mock)" : "Routing Builder: ART-00831 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="rb-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .rb-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.rb-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  :global(.rb-header) { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  :global(.rb-header-id) { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  :global(.rb-title) { font-size: 1.3rem; font-weight: 700; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.rb-header-actions) { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  :global(.rb-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem; padding: 1.25rem;
    display: flex; flex-direction: column; gap: 1rem;
  }
  :global(.rb-section-title) { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.rb-fields) { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  :global(.rb-inputs) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 760px) {
    :global(.rb-fields), :global(.rb-inputs) { grid-template-columns: 1fr; }
  }
</style>
