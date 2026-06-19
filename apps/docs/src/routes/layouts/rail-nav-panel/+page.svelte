<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const RAIL_ITEMS = $derived([
    { id: "inbox", label: fr ? "Boîte" : "Inbox", badge: 4, active: true },
    { id: "projets", label: fr ? "Projets" : "Projects" },
    { id: "rapports", label: fr ? "Rapports" : "Reports" }
  ]);

  const PANEL_ITEMS = $derived([
    { id: "a", title: fr ? "Demande client — Acme" : "Client request — Acme", caption: fr ? "il y a 2 h" : "2 h ago", active: true },
    { id: "b", title: fr ? "Revue de PR #142" : "PR review #142", caption: fr ? "il y a 4 h" : "4 h ago" },
    { id: "c", title: fr ? "Onboarding Globex" : "Globex onboarding", caption: fr ? "hier" : "yesterday" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "rnp-shell" },
      children: [
        // Chrome applicatif
        {
          comp: "Header",
          props: { title: fr ? "Suite" : "Suite" }
        },
        // Corps triptyque : rail + panneau + contenu
        {
          el: "div",
          props: { class: "rnp-body" },
          children: [
            // Rail d'icônes (modules premier niveau)
            {
              el: "nav",
              props: { class: "rnp-rail", "aria-label": fr ? "Modules" : "Modules" },
              children: RAIL_ITEMS.map((item) => ({
                el: "button",
                props: {
                  class: `rnp-rail-item${item.active ? " rnp-rail-item--active" : ""}`,
                  type: "button",
                  "aria-label": item.label,
                  "aria-pressed": item.active ? "true" : "false"
                },
                children: [
                  { el: "span", props: { class: "rnp-rail-label" }, children: [item.label] },
                  ...(item.badge
                    ? [{ el: "span", props: { class: "rnp-rail-badge" }, children: [String(item.badge)] }]
                    : [])
                ]
              }))
            },
            // Panneau de navigation contextuel (sous-arbre du module actif)
            {
              el: "div",
              props: { class: "rnp-panel" },
              children: [
                {
                  el: "h3",
                  props: { class: "rnp-panel-title" },
                  children: [fr ? "Boîte de réception" : "Inbox"]
                },
                {
                  el: "p",
                  props: { class: "rnp-panel-subtitle" },
                  children: [fr ? "Aujourd'hui" : "Today"]
                },
                {
                  el: "ul",
                  props: { class: "rnp-panel-list", role: "list" },
                  children: PANEL_ITEMS.map((item) => ({
                    el: "li",
                    props: {
                      class: `rnp-panel-item${item.active ? " rnp-panel-item--active" : ""}`
                    },
                    children: [
                      { el: "span", props: { class: "rnp-panel-item-title" }, children: [item.title] },
                      { el: "span", props: { class: "rnp-panel-item-caption" }, children: [item.caption] }
                    ]
                  }))
                }
              ]
            },
            // Zone de contenu principale
            {
              el: "main",
              props: { class: "rnp-main" },
              children: [
                {
                  el: "h2",
                  props: { class: "rnp-main-title" },
                  children: [fr ? "Demande client — Acme" : "Client request — Acme"]
                },
                {
                  el: "p",
                  props: { class: "rnp-main-lead" },
                  children: [
                    fr
                      ? "Le rail d'icônes pilote l'activeItemId ; le panneau se recharge selon le module sélectionné. Le contenu correspond à l'élément actif dans le panneau."
                      : "The icon rail drives activeItemId; the panel reloads based on the selected module. Content corresponds to the active item in the panel."
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
    { name: "NavRail", slug: "nav-rail" },
    { name: "NavShell", slug: "nav-shell" },
    { name: "NavSection", slug: "side-nav" },
    { name: "NavItem", slug: "side-nav" },
    { name: "AppChrome", slug: "app-chrome" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · Workspace dense" : "Layout · Dense workspace"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Rail + panneau de navigation" : "Rail + nav panel"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Pour les apps à forte densité fonctionnelle : un rail vertical étroit d'icônes (modules
        de premier niveau) plus un panneau de navigation contextuel (sous-arbre du module sélectionné),
        puis le contenu principal. Le rail pilote <code>activeItemId</code> ; le panneau se recharge.
      {:else}
        For feature-dense apps: a narrow vertical icon rail (top-level modules) plus a contextual
        navigation panel (sub-tree of the selected module), then main content. The rail drives
        <code>activeItemId</code>; the panel reloads accordingly.
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
      title={fr ? "Rail + panneau de navigation (données mock)" : "Rail + nav panel (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="rnp-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="rnp-comp-list">
      <li>{fr ? "Applications à 3–5 modules distincts (messagerie, projets, analytics…)" : "Applications with 3–5 distinct modules (inbox, projects, analytics…)"}</li>
      <li>{fr ? "Quand chaque module a son propre sous-arbre de navigation" : "When each module has its own navigation sub-tree"}</li>
      <li>{fr ? "Apps desktop-first à haute densité fonctionnelle (CRM, ERP, suite)" : "Desktop-first, high-density apps (CRM, ERP, suites)"}</li>
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

  .rnp-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.rnp-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.rnp-body) {
    display: grid;
    grid-template-columns: 56px 220px 1fr;
    min-height: 300px;
    width: 100%;
  }

  /* Rail d'icônes */
  :global(.rnp-rail) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.25rem;
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-base, #f1f5f9);
  }

  :global(.rnp-rail-item) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    width: 44px;
    padding: 0.4rem 0.2rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    cursor: pointer;
    font-size: 0.65rem;
    color: var(--st-semantic-text-secondary, #475569);
    text-align: center;
    line-height: 1.2;
    transition: background 0.12s;
  }

  :global(.rnp-rail-item--active) {
    background: var(--st-semantic-surface-raised, #fff);
    color: var(--st-semantic-text-primary, #0f172a);
    font-weight: 600;
  }

  :global(.rnp-rail-badge) {
    position: absolute;
    top: 2px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--st-semantic-color-danger, #ef4444);
    color: #fff;
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 16px;
    text-align: center;
  }

  :global(.rnp-rail-label) {
    font-size: 0.6rem;
  }

  /* Panneau contextuel */
  :global(.rnp-panel) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem 0.75rem;
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    overflow-y: auto;
  }

  :global(.rnp-panel-title) {
    font-size: 0.875rem;
    font-weight: 700;
    margin: 0 0 0.1rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.rnp-panel-subtitle) {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--st-semantic-text-tertiary, #94a3b8);
    margin: 0.5rem 0 0.25rem;
  }

  :global(.rnp-panel-list) {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  :global(.rnp-panel-item) {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  :global(.rnp-panel-item--active) {
    background: var(--st-semantic-surface-raised, #fff);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  }

  :global(.rnp-panel-item-title) {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--st-semantic-text-primary, #0f172a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.rnp-panel-item-caption) {
    font-size: 0.7rem;
    color: var(--st-semantic-text-tertiary, #94a3b8);
  }

  /* Zone principale */
  :global(.rnp-main) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    min-width: 0;
  }

  :global(.rnp-main-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.rnp-main-lead) {
    margin: 0;
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  @media (max-width: 700px) {
    :global(.rnp-body) {
      grid-template-columns: 1fr;
    }
    :global(.rnp-rail) {
      flex-direction: row;
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
      padding: 0.5rem;
      overflow-x: auto;
    }
    :global(.rnp-panel) {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
