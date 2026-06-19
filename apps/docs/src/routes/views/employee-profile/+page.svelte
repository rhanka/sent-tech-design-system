<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock RH ───────────────────────────────────────────────────────

  const KPIS = $derived([
    { label: fr ? "Ancienneté" : "Tenure", value: 7, unit: fr ? " ans" : " yrs", tone: "category1" as const },
    { label: fr ? "Solde congés" : "Leave balance", value: 18, unit: fr ? " j" : " d", tone: "category2" as const },
    { label: fr ? "Jours travaillés" : "Days worked", value: 142, tone: "category3" as const }
  ]);

  const INFO_FIELDS = $derived([
    { label: fr ? "Poste" : "Job title", value: fr ? "Ingénieure logicielle senior" : "Senior Software Engineer" },
    { label: fr ? "Département" : "Department", value: fr ? "Produit & Ingénierie" : "Product & Engineering" },
    { label: fr ? "Site" : "Location", value: fr ? "Paris, France" : "Paris, France" },
    { label: fr ? "Manager" : "Manager", value: "Frédéric Moreau" },
    { label: "Email", value: "c.bernard@sent.example" },
    { label: fr ? "Téléphone" : "Phone", value: "+33 1 42 68 90 12" }
  ]);

  const CONTRACT_FIELDS = $derived([
    { label: fr ? "Type de contrat" : "Contract type", value: fr ? "CDI" : "Permanent" },
    { label: fr ? "Date d'entrée" : "Start date", value: "2019-03-18" },
    { label: fr ? "Temps de travail" : "Work schedule", value: fr ? "Temps plein (39 h)" : "Full-time (39 h)" },
    { label: fr ? "Convention collective" : "Collective agreement", value: fr ? "SYNTEC" : "SYNTEC" },
    { label: fr ? "Salaire brut annuel" : "Annual gross salary", value: "68 400 €" }
  ]);

  const DOC_COLUMNS = $derived([
    { key: "nom", label: fr ? "Document" : "Document", sortable: true },
    { key: "date", label: fr ? "Date" : "Date", sortable: true },
    { key: "statut", label: fr ? "Statut" : "Status", sortable: false }
  ]);

  const DOC_ROWS = $derived([
    { id: "1", nom: fr ? "Contrat de travail" : "Employment contract", date: "2019-03-18", statut: fr ? "Signé" : "Signed" },
    { id: "2", nom: fr ? "Avenant télétravail" : "Remote work amendment", date: "2022-09-01", statut: fr ? "Signé" : "Signed" },
    { id: "3", nom: fr ? "Entretien annuel 2025" : "Annual review 2025", date: "2025-11-15", statut: fr ? "Validé" : "Validated" },
    { id: "4", nom: fr ? "Attestation employeur" : "Employer certificate", date: "2026-04-02", statut: fr ? "Disponible" : "Available" }
  ]);

  const TAB_ITEMS = $derived([
    { value: "info", label: fr ? "Informations" : "Information" },
    { value: "contract", label: fr ? "Contrat" : "Contract" },
    { value: "documents", label: "Documents" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "ep-shell" },
      children: [
        // En-tête avatar + identité
        {
          el: "div",
          props: { class: "ep-header" },
          children: [
            {
              el: "div",
              props: { class: "ep-identity" },
              children: [
                { comp: "Avatar", props: { name: "Claire Bernard", size: "xl", tone: "category2" } },
                {
                  el: "div",
                  props: { class: "ep-identity-text" },
                  children: [
                    { el: "h2", props: { class: "ep-name" }, children: ["Claire Bernard"] },
                    { el: "p", props: { class: "ep-role" }, children: [fr ? "Ingénieure logicielle senior · Produit & Ingénierie" : "Senior Software Engineer · Product & Engineering"] },
                    { comp: "Badge", props: { tone: "success" }, children: [fr ? "Actif" : "Active"] }
                  ]
                }
              ]
            },
            {
              el: "div",
              props: { class: "ep-header-actions" },
              children: [
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Modifier" : "Edit"] },
                { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouvelle demande" : "New request"] }
              ]
            }
          ]
        },
        // KPI cards
        {
          el: "div",
          props: { class: "ep-kpis" },
          children: KPIS.map((k) => ({
            comp: "KpiCard" as const,
            props: { label: k.label, value: k.value, unit: k.unit, tone: k.tone }
          }))
        },
        // Onglets
        {
          comp: "Tabs",
          props: { items: TAB_ITEMS, label: fr ? "Sections de la fiche" : "Profile sections" }
        },
        // Informations générales
        {
          comp: "FieldCard",
          props: { label: fr ? "Informations générales" : "General information", variant: "bordered" },
          children: [
            {
              comp: "Table",
              props: {
                columns: [
                  { key: "label", label: fr ? "Champ" : "Field" },
                  { key: "value", label: fr ? "Valeur" : "Value" }
                ],
                rows: INFO_FIELDS.map((f, i) => ({ id: String(i), label: f.label, value: f.value })),
                size: "sm"
              }
            }
          ]
        },
        // Contrat
        {
          comp: "FieldCard",
          props: { label: fr ? "Contrat" : "Contract", variant: "bordered" },
          children: [
            {
              comp: "Table",
              props: {
                columns: [
                  { key: "label", label: fr ? "Champ" : "Field" },
                  { key: "value", label: fr ? "Valeur" : "Value" }
                ],
                rows: CONTRACT_FIELDS.map((f, i) => ({ id: String(i), label: f.label, value: f.value })),
                size: "sm"
              }
            }
          ]
        },
        // Documents
        {
          comp: "FieldCard",
          props: { label: "Documents", variant: "bordered" },
          children: [
            {
              comp: "Table",
              props: {
                columns: DOC_COLUMNS,
                rows: DOC_ROWS,
                sortable: true,
                size: "sm"
              }
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Avatar", slug: "avatar" },
    { name: "Badge", slug: "badge" },
    { name: "KpiCard", slug: "kpi-card" },
    { name: "Tabs", slug: "tabs" },
    { name: "FieldCard", slug: "field-card" },
    { name: "Table", slug: "table" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "RH" : "HR"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Fiche employé" : "Employee Profile"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Fiche détaillée d'un employé : en-tête avatar et identité, cartes KPI (ancienneté, solde de
        congés), onglets Informations / Contrat / Documents avec champs et historique. Pour consulter
        et éditer un dossier individuel.
      {:else}
        Detailed employee record: avatar and identity header, KPI cards (tenure, leave balance),
        Information / Contract / Documents tabs with fields and history. For viewing and editing an
        individual file.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Fiche employé : Claire Bernard (données mock)" : "Employee Profile: Claire Bernard (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ep-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .ep-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
  :global(.ep-shell) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
  :global(.ep-header) { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  :global(.ep-identity) { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  :global(.ep-identity-text) { display: flex; flex-direction: column; gap: 0.35rem; }
  :global(.ep-name) { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.ep-role) { font-size: 0.9rem; margin: 0; color: var(--st-semantic-text-secondary, #64748b); }
  :global(.ep-header-actions) { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  :global(.ep-kpis) { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  @media (max-width: 640px) { :global(.ep-kpis) { grid-template-columns: 1fr; } }
</style>
