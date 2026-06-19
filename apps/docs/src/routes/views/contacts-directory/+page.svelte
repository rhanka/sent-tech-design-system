<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  type Tone = "category1" | "category2" | "category3" | "category4" | "category5";
  const CONTACTS = [
    { id: "1", name: "Marie Lefebvre", tone: "category1" as Tone, role: () => (fr ? "Directrice Commerciale" : "Sales Director"), account: "Airbus Group", seg: () => (fr ? "Client" : "Customer"), email: "m.lefebvre@airbus.com" },
    { id: "2", name: "Karim Benali", tone: "category2" as Tone, role: () => (fr ? "Responsable IT" : "IT Manager"), account: "Orange SA", seg: () => (fr ? "Client" : "Customer"), email: "k.benali@orange.fr" },
    { id: "3", name: "Sophie Durand", tone: "category3" as Tone, role: () => (fr ? "Chef de Projet" : "Project Manager"), account: "Safran SA", seg: () => (fr ? "Prospect" : "Prospect"), email: "s.durand@safran.com" },
    { id: "4", name: "Léa Moreau", tone: "category4" as Tone, role: () => (fr ? "Analyste BI" : "BI Analyst"), account: "Thales Group", seg: () => (fr ? "Partenaire" : "Partner"), email: "l.moreau@thales.com" },
    { id: "5", name: "Tom Girard", tone: "category5" as Tone, role: () => (fr ? "Architecte Solutions" : "Solutions Architect"), account: "Capgemini", seg: () => (fr ? "Prospect" : "Prospect"), email: "t.girard@capgemini.com" },
    { id: "6", name: "Julie Martin", tone: "category1" as Tone, role: () => (fr ? "DSI" : "CIO"), account: "Société Générale", seg: () => (fr ? "Client" : "Customer"), email: "j.martin@socgen.fr" },
    { id: "7", name: "Romain Petit", tone: "category2" as Tone, role: () => (fr ? "DG Technique" : "CTO"), account: "Dassault Systèmes", seg: () => (fr ? "Partenaire" : "Partner"), email: "r.petit@3ds.com" }
  ];

  const ACCOUNTS = ["Airbus Group", "Orange SA", "Safran SA", "Thales Group", "Capgemini", "Société Générale", "Dassault Systèmes"];

  function rowNode(c: typeof CONTACTS[0]): NodeSpec {
    const segTone = c.seg() === (fr ? "Client" : "Customer") ? "success" : c.seg() === (fr ? "Prospect" : "Prospect") ? "info" : "neutral";
    return {
      el: "div", props: { class: "cd-row" }, children: [
        { el: "div", props: { class: "cd-cell cd-cell-contact" }, children: [
          { comp: "Avatar", props: { name: c.name, size: "sm", tone: c.tone } },
          { el: "div", props: { class: "cd-info" }, children: [
            { el: "span", props: { class: "cd-name" }, children: [c.name] },
            { el: "span", props: { class: "cd-email" }, children: [c.email] }
          ]}
        ]},
        { el: "div", props: { class: "cd-cell" }, children: [c.role()] },
        { el: "div", props: { class: "cd-cell" }, children: [c.account] },
        { el: "div", props: { class: "cd-cell" }, children: [{ comp: "Badge", props: { tone: segTone }, children: [c.seg()] }] },
        { el: "div", props: { class: "cd-cell cd-cell-actions" }, children: [
          { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Modifier" : "Edit"] },
          { comp: "Dropdown", props: { label: "⋯", size: "sm", variant: "ghost", items: [
            { id: "view", label: fr ? "Voir le profil" : "View profile" },
            { id: "email", label: fr ? "Envoyer un e-mail" : "Send email" },
            { id: "delete", label: fr ? "Supprimer" : "Delete" }
          ]}}
        ]}
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([{
    el: "div", props: { class: "cd-shell" }, children: [
      { el: "div", props: { class: "cd-toolbar" }, children: [
        { el: "div", props: { class: "cd-search" }, children: [
          { comp: "Input", props: { label: fr ? "Rechercher" : "Search", placeholder: fr ? "Nom, compte, e-mail…" : "Name, account, email…", type: "search" }}
        ]},
        { comp: "Select", props: { label: fr ? "Segment" : "Segment", value: "all", options: [
          { value: "all", label: fr ? "Tous" : "All" },
          { value: "client", label: fr ? "Clients" : "Customers" },
          { value: "prospect", label: fr ? "Prospects" : "Prospects" },
          { value: "partner", label: fr ? "Partenaires" : "Partners" }
        ]}},
        { comp: "Combobox", props: { label: fr ? "Compte" : "Account", placeholder: fr ? "Filtrer par compte…" : "Filter by account…", options: ACCOUNTS.map((a) => ({ value: a, label: a })) }},
        { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouveau contact" : "New contact"] }
      ]},
      { el: "div", props: { class: "cd-table-head" }, children: [
        fr ? "Contact" : "Contact", fr ? "Rôle" : "Role", fr ? "Compte" : "Account",
        fr ? "Segment" : "Segment", ""
      ].map((l) => ({ el: "div", props: { class: "cd-th" }, children: [l] }))},
      { el: "div", props: { class: "cd-table-body" }, children: CONTACTS.map(rowNode) }
    ]
  }]);

  const DS_COMPONENTS = [
    { name: "Input", slug: "input" }, { name: "Combobox", slug: "combobox" },
    { name: "Select", slug: "select" }, { name: "Avatar", slug: "avatar" },
    { name: "Badge", slug: "badge" }, { name: "Button", slug: "button" },
    { name: "Dropdown", slug: "dropdown" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · CRM" : "View · CRM"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Annuaire des contacts" : "Contacts Directory"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Répertoire filtrable des contacts avec recherche, segments et table dense.
        Avatar, rôle et compte rattaché pour chaque ligne, avec actions rapides d'édition via
        <code>Button</code> et <code>Dropdown</code>. Un seul <code>NodeSpec</code> → rendu identique en Svelte, React, Vue et Angular.
      {:else}
        Filterable contacts repository with search, segments and a dense table.
        Avatar, role and linked account on each row, with quick edit actions via
        <code>Button</code> and <code>Dropdown</code>. One <code>NodeSpec</code> → identical render in Svelte, React, Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Annuaire des contacts (données mock)" : "Contacts Directory (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="cd-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .cd-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }

  :global(.cd-shell) { display: flex; flex-direction: column; width: 100%; border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; overflow: hidden; background: var(--st-semantic-surface-raised, #fff); }
  :global(.cd-toolbar) { display: flex; align-items: flex-end; gap: 0.75rem; padding: 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); flex-wrap: wrap; }
  :global(.cd-search) { flex: 1 1 200px; min-width: 160px; }
  :global(.cd-table-head) { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr auto; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); }
  :global(.cd-th) { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--st-semantic-text-secondary, #475569); }
  :global(.cd-table-body) { display: flex; flex-direction: column; }
  :global(.cd-row) { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr auto; gap: 0.5rem; align-items: center; padding: 0.6rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); font-size: 0.875rem; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.cd-row:last-child) { border-bottom: none; }
  :global(.cd-row:hover) { background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.cd-cell) { display: flex; align-items: center; min-width: 0; overflow: hidden; }
  :global(.cd-cell-contact) { gap: 0.6rem; }
  :global(.cd-info) { display: flex; flex-direction: column; min-width: 0; }
  :global(.cd-name) { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.cd-email) { font-size: 0.75rem; color: var(--st-semantic-text-secondary, #475569); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global(.cd-cell-actions) { gap: 0.25rem; justify-content: flex-end; }
</style>
