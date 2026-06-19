<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  type Tone = "category1" | "category2" | "category3" | "category4" | "category5";

  const EMPLOYEES = [
    { id: "1", name: "Isabelle Fontaine", tone: "category1" as Tone, dept: () => (fr ? "Ingénierie" : "Engineering"), title: () => (fr ? "Ingénieure Senior" : "Senior Engineer"), status: () => (fr ? "Actif" : "Active"), location: "Montréal" },
    { id: "2", name: "Marc Tremblay", tone: "category2" as Tone, dept: () => (fr ? "Produit" : "Product"), title: () => (fr ? "Chef de Produit" : "Product Manager"), status: () => (fr ? "Actif" : "Active"), location: "Québec" },
    { id: "3", name: "Amina Choudhury", tone: "category3" as Tone, dept: () => (fr ? "Design" : "Design"), title: () => (fr ? "Designer UX" : "UX Designer"), status: () => (fr ? "Congé" : "On Leave"), location: "Toronto" },
    { id: "4", name: "Julien Bergeron", tone: "category4" as Tone, dept: () => (fr ? "Finance" : "Finance"), title: () => (fr ? "Analyste Financier" : "Financial Analyst"), status: () => (fr ? "Actif" : "Active"), location: "Montréal" },
    { id: "5", name: "Sara Okonkwo", tone: "category5" as Tone, dept: () => (fr ? "Ingénierie" : "Engineering"), title: () => (fr ? "Développeuse Full-Stack" : "Full-Stack Developer"), status: () => (fr ? "Actif" : "Active"), location: "Ottawa" },
    { id: "6", name: "Pierre Gagnon", tone: "category1" as Tone, dept: () => (fr ? "RH" : "HR"), title: () => (fr ? "Partenaire RH" : "HR Partner"), status: () => (fr ? "Inactif" : "Inactive"), location: "Laval" },
    { id: "7", name: "Nadia Khalil", tone: "category2" as Tone, dept: () => (fr ? "Marketing" : "Marketing"), title: () => (fr ? "Responsable Marketing" : "Marketing Manager"), status: () => (fr ? "Actif" : "Active"), location: "Montréal" }
  ];

  const DEPTS = [
    () => (fr ? "Tous les départements" : "All departments"),
    () => (fr ? "Ingénierie" : "Engineering"),
    () => (fr ? "Produit" : "Product"),
    () => (fr ? "Design" : "Design"),
    () => (fr ? "Finance" : "Finance"),
    () => (fr ? "RH" : "HR"),
    () => (fr ? "Marketing" : "Marketing")
  ];

  function statusTone(emp: typeof EMPLOYEES[0]): "success" | "warning" | "neutral" {
    const s = emp.status();
    if (s === "Actif" || s === "Active") return "success";
    if (s === "Congé" || s === "On Leave") return "warning";
    return "neutral";
  }

  function rowNode(emp: typeof EMPLOYEES[0]): NodeSpec {
    return {
      el: "div", props: { class: "ed-row" }, children: [
        { el: "div", props: { class: "ed-cell ed-cell-name" }, children: [
          { comp: "Avatar", props: { name: emp.name, size: "sm", tone: emp.tone } },
          { el: "div", props: { class: "ed-info" }, children: [
            { el: "span", props: { class: "ed-name" }, children: [emp.name] },
            { el: "span", props: { class: "ed-title" }, children: [emp.title()] }
          ]}
        ]},
        { el: "div", props: { class: "ed-cell" }, children: [emp.dept()] },
        { el: "div", props: { class: "ed-cell" }, children: [emp.location] },
        { el: "div", props: { class: "ed-cell" }, children: [
          { comp: "Badge", props: { tone: statusTone(emp) }, children: [emp.status()] }
        ]},
        { el: "div", props: { class: "ed-cell ed-cell-actions" }, children: [
          { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Profil" : "Profile"] }
        ]}
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([{
    el: "div", props: { class: "ed-shell" }, children: [
      { el: "div", props: { class: "ed-toolbar" }, children: [
        { el: "div", props: { class: "ed-search" }, children: [
          { comp: "Input", props: { label: fr ? "Rechercher" : "Search", placeholder: fr ? "Nom, titre, lieu…" : "Name, title, location…", type: "search" } }
        ]},
        { comp: "Select", props: { label: fr ? "Statut" : "Status", value: "all", options: [
          { value: "all", label: fr ? "Tous" : "All" },
          { value: "active", label: fr ? "Actif" : "Active" },
          { value: "leave", label: fr ? "Congé" : "On Leave" },
          { value: "inactive", label: fr ? "Inactif" : "Inactive" }
        ]}},
        { comp: "Combobox", props: { label: fr ? "Département" : "Department", placeholder: fr ? "Tous les départements" : "All departments", options: DEPTS.slice(1).map((d) => ({ value: d(), label: d() })) }},
        { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Ajouter un employé" : "Add employee"] }
      ]},
      { el: "div", props: { class: "ed-table-head" }, children: [
        fr ? "Employé" : "Employee", fr ? "Département" : "Department",
        fr ? "Lieu" : "Location", fr ? "Statut" : "Status", ""
      ].map((l) => ({ el: "div", props: { class: "ed-th" }, children: [l] }))},
      { el: "div", props: { class: "ed-table-body" }, children: EMPLOYEES.map(rowNode) },
      { el: "div", props: { class: "ed-pagination" }, children: [
        { comp: "Button", props: { variant: "ghost", size: "sm", disabled: true }, children: [fr ? "Précédent" : "Previous"] },
        { el: "span", props: { class: "ed-page-info" }, children: [fr ? "Page 1 sur 3" : "Page 1 of 3"] },
        { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Suivant" : "Next"] }
      ]}
    ]
  }]);

  const DS_COMPONENTS = [
    { name: "Input", slug: "input" }, { name: "Combobox", slug: "combobox" },
    { name: "Select", slug: "select" }, { name: "Avatar", slug: "avatar" },
    { name: "Badge", slug: "badge" }, { name: "Button", slug: "button" },
    { name: "Breadcrumb", slug: "breadcrumb" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · RH" : "View · HR"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Annuaire des employés" : "Employee Directory"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Liste filtrable des employés : recherche, filtres par département et statut, table dense
        avec avatar, badge de statut et pagination. Pour parcourir et qualifier l'effectif.
      {:else}
        Filterable employee list: search, department and status filters, dense table with avatar,
        status badge and pagination. For browsing and qualifying headcount.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Annuaire des employés (données mock)" : "Employee Directory (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ed-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .ed-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }

  :global(.ed-shell) { display: flex; flex-direction: column; width: 100%; border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; overflow: hidden; background: var(--st-semantic-surface-raised, #fff); }
  :global(.ed-toolbar) { display: flex; align-items: flex-end; gap: 0.75rem; padding: 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); flex-wrap: wrap; }
  :global(.ed-search) { flex: 1 1 200px; min-width: 160px; }
  :global(.ed-table-head) { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); }
  :global(.ed-th) { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--st-semantic-text-secondary, #475569); }
  :global(.ed-table-body) { display: flex; flex-direction: column; }
  :global(.ed-row) { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 0.5rem; align-items: center; padding: 0.6rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); font-size: 0.875rem; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.ed-row:last-child) { border-bottom: none; }
  :global(.ed-row:hover) { background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.ed-cell) { display: flex; align-items: center; min-width: 0; overflow: hidden; }
  :global(.ed-cell-name) { gap: 0.6rem; }
  :global(.ed-info) { display: flex; flex-direction: column; min-width: 0; }
  :global(.ed-name) { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.ed-title) { font-size: 0.75rem; color: var(--st-semantic-text-secondary, #475569); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.ed-cell-actions) { justify-content: flex-end; }
  :global(.ed-pagination) { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 0.75rem 1rem; border-top: 1px solid var(--st-semantic-border-subtle, #e2e8f0); background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.ed-page-info) { font-size: 0.8rem; color: var(--st-semantic-text-secondary, #475569); }
</style>
