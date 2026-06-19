<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const NAV_ITEMS = $derived([
    { label: fr ? "Comptes" : "Accounts", href: "#", active: true },
    { label: fr ? "Contacts" : "Contacts", href: "#" },
    { label: fr ? "Affaires" : "Deals", href: "#" }
  ]);

  const ACCOUNT_ROWS = $derived([
    { id: "1", name: "Acme Inc.", status: fr ? "Client actif" : "Active client", selected: true },
    { id: "2", name: "Globex Corp.", status: fr ? "Prospect" : "Prospect" },
    { id: "3", name: "Initech SA", status: fr ? "Client inactif" : "Inactive client" }
  ]);

  const CONTEXT_FIELDS = $derived([
    { term: fr ? "Plan" : "Plan", def: fr ? "Entreprise" : "Enterprise" },
    { term: fr ? "Revenu annuel" : "Annual revenue", def: "4,2 M$" },
    { term: fr ? "Depuis" : "Since", def: "2021-03-15" },
    { term: fr ? "Responsable" : "Owner", def: "Marie Dupont" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "d3p-shell" },
      children: [
        // Chrome
        {
          comp: "Header",
          props: {
            title: "CRM",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active }))
          }
        },
        // Corps triptyque
        {
          el: "div",
          props: { class: "d3p-body" },
          children: [
            // Panneau de navigation gauche
            {
              el: "aside",
              props: { class: "d3p-nav" },
              children: [
                {
                  comp: "SideNav",
                  props: {
                    items: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active })),
                    label: fr ? "Entités" : "Entities"
                  }
                }
              ]
            },
            // Contenu central (liste)
            {
              el: "main",
              props: { class: "d3p-main" },
              children: [
                { el: "h2", props: { class: "d3p-section-title" }, children: [fr ? "Comptes" : "Accounts"] },
                {
                  el: "ul",
                  props: { class: "d3p-account-list", role: "listbox", "aria-label": fr ? "Comptes" : "Accounts" },
                  children: ACCOUNT_ROWS.map((row) => ({
                    el: "li",
                    props: {
                      class: `d3p-account-row${row.selected ? " d3p-account-row--selected" : ""}`,
                      role: "option",
                      "aria-selected": row.selected ? "true" : "false"
                    },
                    children: [
                      { el: "span", props: { class: "d3p-account-name" }, children: [row.name] },
                      { el: "span", props: { class: "d3p-account-status" }, children: [row.status] }
                    ]
                  }))
                }
              ]
            },
            // Panneau de contexte droit (inspecteur)
            {
              el: "aside",
              props: { class: "d3p-context", "aria-label": fr ? "Détails du compte" : "Account details" },
              children: [
                { el: "h3", props: { class: "d3p-context-title" }, children: ["Acme Inc."] },
                { el: "p", props: { class: "d3p-context-subtitle" }, children: [fr ? "Client actif" : "Active client"] },
                {
                  el: "dl",
                  props: { class: "d3p-context-dl" },
                  children: CONTEXT_FIELDS.flatMap((f) => [
                    { el: "dt", props: { class: "d3p-context-dt" }, children: [f.term] },
                    { el: "dd", props: { class: "d3p-context-dd" }, children: [f.def] }
                  ])
                },
                {
                  el: "div",
                  props: { class: "d3p-context-actions" },
                  children: [
                    {
                      comp: "Badge",
                      props: { tone: "success" },
                      children: [fr ? "Actif" : "Active"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "AppShell", slug: "app-shell" },
    { name: "SideNav", slug: "side-nav" },
    { name: "ContextPanel", slug: "context-panel" },
    { name: "Grid", slug: "grid" },
    { name: "Card", slug: "card" },
    { name: "AppChrome", slug: "app-chrome" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · CRM / Éditeur" : "Layout · CRM / Editor"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Dashboard 3 panneaux" : "3-panel dashboard"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Disposition triptyque : navigation à gauche, contenu central (liste), panneau de contexte
        à droite (inspecteur / propriétés de l'élément sélectionné). Convient aux apps CRM,
        éditeur ou data-room où l'utilisateur inspecte un élément sans quitter la liste.
      {:else}
        Triptych layout: left navigation, central content (list), right context panel
        (inspector / properties of the selected item). Suited to CRM, editor, or data-room apps
        where the user inspects an item without leaving the list.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular."
        : "Use the tabs to switch between Svelte, React, Vue, and Angular."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Dashboard 3 panneaux (données mock)" : "3-panel dashboard (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="d3p-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="d3p-comp-list">
      <li>{fr ? "CRM : liste de comptes/contacts + fiche de détail" : "CRM: accounts/contacts list + detail card"}</li>
      <li>{fr ? "Éditeur de code ou de contenu avec panneau de propriétés" : "Code or content editor with properties panel"}</li>
      <li>{fr ? "Data-room : liste de documents + aperçu/métadonnées" : "Data-room: document list + preview / metadata"}</li>
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

  .d3p-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.d3p-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.d3p-body) {
    display: grid;
    grid-template-columns: 180px 1fr 220px;
    min-height: 300px;
    width: 100%;
  }

  :global(.d3p-nav) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.75rem;
  }

  :global(.d3p-main) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    min-width: 0;
    overflow-y: auto;
  }

  :global(.d3p-section-title) {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.d3p-account-list) {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  :global(.d3p-account-row) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.1s;
    gap: 0.5rem;
  }

  :global(.d3p-account-row:hover) {
    background: var(--st-semantic-surface-subtle, #f8fafc);
  }

  :global(.d3p-account-row--selected) {
    background: var(--st-semantic-surface-subtle, #f0f4ff);
    border-left: 3px solid var(--st-semantic-color-brand, #6366f1);
  }

  :global(.d3p-account-name) {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.d3p-account-status) {
    font-size: 0.75rem;
    color: var(--st-semantic-text-tertiary, #94a3b8);
  }

  /* Panneau de contexte */
  :global(.d3p-context) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    border-left: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    overflow-y: auto;
  }

  :global(.d3p-context-title) {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.d3p-context-subtitle) {
    margin: 0;
    font-size: 0.8rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.d3p-context-dl) {
    margin: 0.5rem 0 0;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.75rem;
    row-gap: 0.35rem;
  }

  :global(.d3p-context-dt) {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--st-semantic-text-tertiary, #94a3b8);
    white-space: nowrap;
  }

  :global(.d3p-context-dd) {
    font-size: 0.8rem;
    color: var(--st-semantic-text-primary, #0f172a);
    margin: 0;
  }

  :global(.d3p-context-actions) {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  @media (max-width: 860px) {
    :global(.d3p-body) {
      grid-template-columns: 1fr;
    }
    :global(.d3p-nav),
    :global(.d3p-context) {
      border: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
