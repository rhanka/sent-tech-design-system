<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const NAV_ITEMS = $derived([
    { label: fr ? "Produit" : "Product", href: "#" },
    { label: fr ? "Tarifs" : "Pricing", href: "#", active: true },
    { label: "Docs", href: "#" }
  ]);

  const PLANS = $derived([
    {
      id: "starter",
      name: "Starter",
      price: fr ? "0 $ / mois" : "$0 / month",
      desc: fr ? "Pour les équipes qui démarrent." : "For teams just getting started.",
      features: [
        fr ? "5 utilisateurs" : "5 users",
        fr ? "10 projets" : "10 projects",
        fr ? "Assistance par e-mail" : "Email support"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: fr ? "49 $ / mois" : "$49 / month",
      desc: fr ? "Pour les équipes en croissance." : "For growing teams.",
      features: [
        fr ? "50 utilisateurs" : "50 users",
        fr ? "Projets illimités" : "Unlimited projects",
        fr ? "Assistance prioritaire" : "Priority support"
      ],
      highlight: true
    },
    {
      id: "enterprise",
      name: fr ? "Entreprise" : "Enterprise",
      price: fr ? "Sur devis" : "Custom",
      desc: fr ? "Pour les grandes organisations." : "For large organizations.",
      features: [
        fr ? "Utilisateurs illimités" : "Unlimited users",
        fr ? "SSO / SAML" : "SSO / SAML",
        fr ? "SLA garanti" : "Guaranteed SLA"
      ]
    }
  ]);

  const FOOTER_COLUMNS = $derived([
    {
      title: fr ? "Produit" : "Product",
      links: [
        { label: fr ? "Composants" : "Components", href: "#" },
        { label: "Tokens", href: "#" },
        { label: fr ? "Thèmes" : "Themes", href: "#" }
      ]
    },
    {
      title: fr ? "Entreprise" : "Company",
      links: [
        { label: fr ? "À propos" : "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" }
      ]
    },
    {
      title: fr ? "Légal" : "Legal",
      links: [
        { label: fr ? "Conditions" : "Terms", href: "#" },
        { label: fr ? "Confidentialité" : "Privacy", href: "#" }
      ]
    }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "mfw-site" },
      children: [
        // Header pleine largeur
        {
          comp: "Header",
          props: {
            title: "Sentropic",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active }))
          }
        },
        // Hero section
        {
          el: "section",
          props: { class: "mfw-hero" },
          children: [
            {
              el: "div",
              props: { class: "mfw-container" },
              children: [
                { el: "h1", props: { class: "mfw-hero-title" }, children: [fr ? "Tarification simple" : "Simple pricing"] },
                {
                  el: "p",
                  props: { class: "mfw-hero-lead" },
                  children: [
                    fr
                      ? "Des forfaits clairs pour chaque étape de votre croissance. Aucune surprise en fin de mois."
                      : "Clear plans for every stage of your growth. No surprises at end of month."
                  ]
                }
              ]
            }
          ]
        },
        // Grille de cartes (plans)
        {
          el: "section",
          props: { class: "mfw-plans-section" },
          children: [
            {
              el: "div",
              props: { class: "mfw-container" },
              children: [
                {
                  el: "div",
                  props: { class: "mfw-plans-grid" },
                  children: PLANS.map((plan) => ({
                    comp: "Card",
                    props: { class: plan.highlight ? "mfw-plan-card mfw-plan-card--highlight" : "mfw-plan-card" },
                    children: [
                      {
                        el: "div",
                        props: { class: "mfw-plan-header" },
                        children: [
                          { el: "span", props: { class: "mfw-plan-name" }, children: [plan.name] },
                          ...(plan.highlight
                            ? [{ comp: "Badge" as const, props: { tone: "brand" }, children: [fr ? "Populaire" : "Popular"] }]
                            : [])
                        ]
                      },
                      { el: "p", props: { class: "mfw-plan-price" }, children: [plan.price] },
                      { el: "p", props: { class: "mfw-plan-desc" }, children: [plan.desc] },
                      {
                        el: "ul",
                        props: { class: "mfw-plan-features" },
                        children: plan.features.map((f) => ({
                          el: "li",
                          props: {},
                          children: [f]
                        }))
                      }
                    ]
                  }))
                }
              ]
            }
          ]
        },
        // Footer multi-colonnes
        {
          comp: "Footer",
          props: {
            brand: "Sentropic",
            columns: FOOTER_COLUMNS,
            copyright: fr ? "© 2026 Sentropic. Tous droits réservés." : "© 2026 Sentropic. All rights reserved."
          }
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "AppShell", slug: "app-shell" },
    { name: "AppChrome", slug: "app-chrome" },
    { name: "Header", slug: "header" },
    { name: "Container", slug: "container" },
    { name: "Grid", slug: "grid" },
    { name: "Row", slug: "grid" },
    { name: "Col", slug: "grid" },
    { name: "Card", slug: "card" },
    { name: "Footer", slug: "footer" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · Site marketing" : "Layout · Marketing site"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Site pleine largeur" : "Full-width site"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Gabarit orienté site (pas workspace) : header pleine largeur via <code>AppChrome</code> ou
        <code>Header</code>, sections de contenu centrées dans un <code>Container</code>, mises en
        page en <code>Grid</code> responsive, et <code>Footer</code> multi-colonnes en bas. Convient
        aux pages publiques, landing, tarifs et documentation marketing.
      {:else}
        Site-oriented layout (not workspace): full-width header via <code>AppChrome</code> or
        <code>Header</code>, content sections centered in a <code>Container</code>, responsive
        <code>Grid</code> layouts, and a multi-column <code>Footer</code>. Suited to public pages,
        landing, pricing, and marketing documentation.
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
      title={fr ? "Site marketing pleine largeur (données mock)" : "Full-width marketing site (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="mfw-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="mfw-comp-list">
      <li>{fr ? "Pages publiques et landing pages de B2B SaaS" : "Public pages and B2B SaaS landing pages"}</li>
      <li>{fr ? "Pages de tarification ou de comparaison de plans" : "Pricing or plan comparison pages"}</li>
      <li>{fr ? "Documentation marketing ou site vitrine" : "Marketing docs or showcase site"}</li>
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

  .mfw-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.mfw-site) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.mfw-container) {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  /* Hero section */
  :global(.mfw-hero) {
    background: linear-gradient(135deg, var(--st-semantic-surface-subtle, #f8fafc) 0%, var(--st-semantic-surface-raised, #fff) 100%);
    padding: 2.5rem 0 2rem;
    text-align: center;
  }

  :global(.mfw-hero-title) {
    font-size: 2rem;
    font-weight: 800;
    color: var(--st-semantic-text-primary, #0f172a);
    margin: 0 0 0.75rem;
    line-height: 1.15;
  }

  :global(.mfw-hero-lead) {
    font-size: 1rem;
    color: var(--st-semantic-text-secondary, #475569);
    line-height: 1.6;
    max-width: 520px;
    margin: 0 auto;
  }

  /* Plans section */
  :global(.mfw-plans-section) {
    padding: 2rem 0;
  }

  :global(.mfw-plans-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  :global(.mfw-plan-card) {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.25rem;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.625rem;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.mfw-plan-card--highlight) {
    border-color: var(--st-semantic-color-brand, #6366f1);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--st-semantic-color-brand, #6366f1) 15%, transparent);
  }

  :global(.mfw-plan-header) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.mfw-plan-name) {
    font-size: 1rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.mfw-plan-price) {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--st-semantic-text-primary, #0f172a);
    margin: 0.25rem 0 0;
  }

  :global(.mfw-plan-desc) {
    margin: 0;
    font-size: 0.825rem;
    color: var(--st-semantic-text-secondary, #475569);
    line-height: 1.5;
  }

  :global(.mfw-plan-features) {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    border-top: 1px solid var(--st-semantic-border-subtle, #f1f5f9);
    padding-top: 0.75rem;
  }

  :global(.mfw-plan-features li) {
    font-size: 0.8rem;
    color: var(--st-semantic-text-primary, #0f172a);
    padding-left: 1.1rem;
    position: relative;
  }

  :global(.mfw-plan-features li::before) {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--st-semantic-color-success, #16a34a);
    font-weight: 700;
  }
</style>
