<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (squelette applicatif) ───────────────────────────

  const NAV_ITEMS = $derived([
    { label: fr ? "Tableau de bord" : "Dashboard", href: "#", active: true },
    { label: fr ? "Projets" : "Projects", href: "#" },
    { label: fr ? "Équipe" : "Team", href: "#" },
    { label: fr ? "Rapports" : "Reports", href: "#" },
    { label: fr ? "Paramètres" : "Settings", href: "#" }
  ]);

  const BREADCRUMB_ITEMS = $derived([
    { label: fr ? "Accueil" : "Home", href: "#" },
    { label: fr ? "Projets" : "Projects", href: "#" },
    { label: "Sent Forge", current: true }
  ]);

  const CARDS = $derived([
    { title: fr ? "Activité récente" : "Recent activity", body: fr ? "14 actions enregistrées au cours des dernières 24 heures." : "14 actions recorded in the last 24 hours." },
    { title: fr ? "Tâches assignées" : "Assigned tasks", body: fr ? "6 tâches ouvertes, dont 2 arrivent à échéance cette semaine." : "6 open tasks, 2 of which are due this week." },
    { title: fr ? "Déploiements" : "Deployments", body: fr ? "Dernière mise en production : il y a 3 heures, statut sain." : "Last production deploy: 3 hours ago, healthy." }
  ]);

  const FOOTER_COLUMNS = $derived([
    {
      title: fr ? "Produit" : "Product",
      links: [
        { label: fr ? "Composants" : "Components", href: "#" },
        { label: "Tokens", href: "#" },
        { label: "Documentation", href: "#" }
      ]
    },
    {
      title: fr ? "Entreprise" : "Company",
      links: [
        { label: fr ? "À propos" : "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" }
      ]
    }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "as-shell" },
      children: [
        // En-tête applicatif
        {
          comp: "Header",
          props: {
            title: "Sent Tech",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active })),
            account: { name: "Fabien Antoine", email: "fabien@sent-tech.ca" }
          }
        },
        // Corps : rail latéral + zone principale
        {
          el: "div",
          props: { class: "as-body" },
          children: [
            {
              el: "aside",
              props: { class: "as-aside" },
              children: [
                {
                  comp: "SideNav",
                  props: {
                    items: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active }))
                  }
                }
              ]
            },
            {
              el: "main",
              props: { class: "as-main" },
              children: [
                { comp: "Breadcrumb", props: { items: BREADCRUMB_ITEMS } },
                {
                  el: "div",
                  props: { class: "as-page-head" },
                  children: [
                    { el: "h2", props: { class: "as-page-title" }, children: ["Sent Forge"] },
                    { comp: "Badge", props: { tone: "success" }, children: [fr ? "Actif" : "Active"] }
                  ]
                },
                {
                  el: "p",
                  props: { class: "as-page-lead" },
                  children: [fr ? "Zone de contenu de la page — remplacée par chaque vue spécifique." : "Page content area — replaced by each specific view."]
                },
                {
                  el: "div",
                  props: { class: "as-cards" },
                  children: CARDS.map((c) => ({
                    comp: "Card" as const,
                    children: [
                      { el: "h3", props: { class: "as-card-title" }, children: [c.title] },
                      { el: "p", props: { class: "as-card-body" }, children: [c.body] }
                    ]
                  }))
                }
              ]
            }
          ]
        },
        // Pied de page
        {
          comp: "Footer",
          props: {
            brand: "Sent Tech",
            columns: FOOTER_COLUMNS,
            copyright: fr ? "© 2026 Sent Tech. Tous droits réservés." : "© 2026 Sent Tech. All rights reserved."
          }
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Header", slug: "header" },
    { name: "SideNav", slug: "side-nav" },
    { name: "Breadcrumb", slug: "breadcrumb" },
    { name: "Card", slug: "card" },
    { name: "Badge", slug: "badge" },
    { name: "Footer", slug: "footer" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Socle applicatif" : "View · App Shell"}</p>
    <div class="docs-hero-title">
      <h1>App Shell</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Le squelette réutilisé par toutes les vues : <code>Header</code> + <code>SideNav</code>
        + <code>Breadcrumb</code> + zone de contenu (titre + <code>Card</code>) + <code>Footer</code>.
        Un seul <code>NodeSpec</code> → rendu identique en Svelte, React et Vue. Toutes les autres
        vues s'insèrent dans la zone de contenu.
      {:else}
        The skeleton reused by every view: <code>Header</code> + <code>SideNav</code>
        + <code>Breadcrumb</code> + content area (title + <code>Card</code>) + <code>Footer</code>.
        One <code>NodeSpec</code> → identical render in Svelte, React, and Vue. Every other view
        slots into the content area.
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
      title={fr ? "App Shell — squelette applicatif (données mock)" : "App Shell — application skeleton (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="as-comp-list">
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

  .as-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout App Shell (global → propagé dans les îles React/Vue) ────────── */
  :global(.as-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.as-body) {
    display: grid;
    grid-template-columns: 220px 1fr;
    width: 100%;
    min-height: 0;
  }

  :global(.as-aside) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.75rem;
  }

  :global(.as-main) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    min-width: 0;
  }

  :global(.as-page-head) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.as-page-title) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.as-page-lead) {
    margin: 0;
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
  }

  :global(.as-cards) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
  }

  :global(.as-card-title) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.4rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.as-card-body) {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 760px) {
    :global(.as-body) {
      grid-template-columns: 1fr;
    }
    :global(.as-aside) {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
