<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const NAV_ITEMS = $derived([
    { label: fr ? "Tableau de bord" : "Dashboard", href: "#", active: true },
    { label: fr ? "Projets" : "Projects", href: "#" },
    { label: fr ? "Équipe" : "Team", href: "#" },
    { label: fr ? "Paramètres" : "Settings", href: "#" }
  ]);

  const BREADCRUMB_ITEMS = $derived([
    { label: fr ? "Accueil" : "Home", href: "#" },
    { label: fr ? "Tableau de bord" : "Dashboard", current: true }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "sc-shell" },
      children: [
        // Chrome applicatif
        {
          comp: "Header",
          props: {
            title: fr ? "Console" : "Console",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active }))
          }
        },
        // Corps : nav latérale + contenu
        {
          el: "div",
          props: { class: "sc-body" },
          children: [
            // Navigation latérale persistante
            {
              el: "aside",
              props: { class: "sc-aside" },
              children: [
                {
                  comp: "SideNav",
                  props: {
                    items: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active })),
                    label: fr ? "Sections" : "Sections"
                  }
                }
              ]
            },
            // Zone de contenu principale (défile)
            {
              el: "main",
              props: { class: "sc-main" },
              children: [
                { comp: "Breadcrumb", props: { items: BREADCRUMB_ITEMS } },
                {
                  el: "h2",
                  props: { class: "sc-page-title" },
                  children: [fr ? "Tableau de bord" : "Dashboard"]
                },
                {
                  el: "p",
                  props: { class: "sc-page-lead" },
                  children: [
                    fr
                      ? "Zone de contenu principale. La navigation latérale reste collée (sticky) ; le contenu défile indépendamment."
                      : "Main content area. The sidebar stays sticky; content scrolls independently."
                  ]
                },
                {
                  el: "div",
                  props: { class: "sc-cards" },
                  children: [
                    {
                      comp: "Card",
                      children: [
                        { el: "h3", props: { class: "sc-card-title" }, children: [fr ? "Activité récente" : "Recent activity"] },
                        { el: "p", props: { class: "sc-card-body" }, children: [fr ? "14 actions au cours des 24 dernières heures." : "14 actions in the last 24 hours."] }
                      ]
                    },
                    {
                      comp: "Card",
                      children: [
                        { el: "h3", props: { class: "sc-card-title" }, children: [fr ? "Tâches assignées" : "Assigned tasks"] },
                        { el: "p", props: { class: "sc-card-body" }, children: [fr ? "6 tâches ouvertes, 2 arrivent à échéance cette semaine." : "6 open tasks, 2 due this week."] }
                      ]
                    },
                    {
                      comp: "Card",
                      children: [
                        { el: "h3", props: { class: "sc-card-title" }, children: [fr ? "Déploiements" : "Deployments"] },
                        { el: "p", props: { class: "sc-card-body" }, children: [fr ? "Dernière mise en prod il y a 3 h, statut sain." : "Last deploy 3 h ago, healthy."] }
                      ]
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
    { name: "AppChrome", slug: "app-chrome" },
    { name: "SideNav", slug: "side-nav" },
    { name: "NavSection", slug: "side-nav" },
    { name: "NavItem", slug: "side-nav" },
    { name: "Breadcrumb", slug: "breadcrumb" },
    { name: "Container", slug: "container" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · Workspace B2B" : "Layout · B2B Workspace"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Sidebar + contenu" : "Sidebar + content"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Gabarit B2B le plus courant : chrome applicatif en haut, navigation latérale persistante
        à gauche (<code>SideNav</code>), zone de contenu principale à droite. La nav reste collée ;
        le contenu défile. Idéal pour les pages d'admin et de paramètres.
      {:else}
        The most common B2B layout: top app chrome, persistent left sidebar (<code>SideNav</code>),
        main content area on the right. The nav stays sticky; content scrolls independently.
        Ideal for admin and settings pages.
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
      title={fr ? "Sidebar + contenu (données mock)" : "Sidebar + content (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="sc-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="sc-comp-list">
      <li>{fr ? "Pages d'administration à profondeur de nav modeste (2 niveaux max)" : "Admin pages with shallow nav depth (2 levels max)"}</li>
      <li>{fr ? "Pages de paramètres organisées en sections distinctes" : "Settings pages organized into distinct sections"}</li>
      <li>{fr ? "Interfaces B2B où la nav est stable entre les pages" : "B2B interfaces where nav is stable across pages"}</li>
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

  .sc-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.sc-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.sc-body) {
    display: grid;
    grid-template-columns: 220px 1fr;
    width: 100%;
    min-height: 280px;
  }

  :global(.sc-aside) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.75rem;
    /* Sidebar sticky (simulée dans le contexte docs) */
    position: sticky;
    top: 0;
    align-self: start;
  }

  :global(.sc-main) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    min-width: 0;
    overflow-y: auto;
  }

  :global(.sc-page-title) {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.sc-page-lead) {
    margin: 0;
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  :global(.sc-cards) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  :global(.sc-card-title) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.4rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.sc-card-body) {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 700px) {
    :global(.sc-body) {
      grid-template-columns: 1fr;
    }
    :global(.sc-aside) {
      position: static;
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
