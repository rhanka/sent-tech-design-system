<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ──────────────────────────────────────────────────────────

  const NAV_ITEMS = $derived([
    { label: fr ? "Incidents" : "Incidents", href: "#", active: true },
    { label: fr ? "Services" : "Services", href: "#" },
    { label: fr ? "Alertes" : "Alerts", href: "#" }
  ]);

  const INCIDENTS = $derived([
    { id: "1", title: fr ? "Latence API élevée" : "High API latency", svc: "api-gateway", severity: fr ? "Critique" : "Critical", open: true },
    { id: "2", title: fr ? "Pic mémoire pods" : "Memory spike pods", svc: "worker-fleet", severity: fr ? "Avertissement" : "Warning", open: true },
    { id: "3", title: fr ? "Déploiement v2.4.1" : "Deploy v2.4.1", svc: "backend", severity: fr ? "Info" : "Info", open: false }
  ]);

  const EVENTS = $derived([
    { id: "e1", title: fr ? "Alerte CPU > 90 %" : "CPU alert > 90 %", time: "10:02", status: "error" },
    { id: "e2", title: fr ? "Déploiement OK — v2.4.0" : "Deploy OK — v2.4.0", time: "09:40", status: "success" },
    { id: "e3", title: fr ? "Scale-out automatique" : "Auto scale-out", time: "09:12", status: "info" },
    { id: "e4", title: fr ? "Backup terminé" : "Backup complete", time: "08:55", status: "success" }
  ]);

  const statusTone: Record<string, string> = {
    error: "danger",
    success: "success",
    warning: "warning",
    info: "neutral"
  };

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "lef-shell" },
      children: [
        // Chrome
        {
          comp: "Header",
          props: {
            title: fr ? "Ops" : "Ops",
            navItems: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active }))
          }
        },
        // Corps : nav + liste + flux d'événements
        {
          el: "div",
          props: { class: "lef-body" },
          children: [
            // Navigation latérale
            {
              el: "aside",
              props: { class: "lef-nav" },
              children: [
                {
                  comp: "SideNav",
                  props: {
                    items: NAV_ITEMS.map((i) => ({ label: i.label, href: i.href, active: i.active })),
                    label: fr ? "Vues" : "Views"
                  }
                }
              ]
            },
            // Contenu central (liste d'incidents)
            {
              el: "main",
              props: { class: "lef-main" },
              children: [
                {
                  el: "h2",
                  props: { class: "lef-section-title" },
                  children: [fr ? "Incidents ouverts" : "Open incidents"]
                },
                {
                  el: "table",
                  props: { class: "lef-table", role: "table" },
                  children: [
                    {
                      el: "thead",
                      props: {},
                      children: [
                        {
                          el: "tr",
                          props: {},
                          children: [
                            { el: "th", props: { scope: "col" }, children: [fr ? "Titre" : "Title"] },
                            { el: "th", props: { scope: "col" }, children: [fr ? "Service" : "Service"] },
                            { el: "th", props: { scope: "col" }, children: [fr ? "Sévérité" : "Severity"] }
                          ]
                        }
                      ]
                    },
                    {
                      el: "tbody",
                      props: {},
                      children: INCIDENTS.map((inc) => ({
                        el: "tr",
                        props: { class: `lef-table-row${inc.open ? " lef-table-row--open" : ""}` },
                        children: [
                          { el: "td", props: { class: "lef-td-title" }, children: [inc.title] },
                          { el: "td", props: { class: "lef-td-svc" }, children: [inc.svc] },
                          {
                            el: "td",
                            props: {},
                            children: [
                              {
                                comp: "Badge",
                                props: {
                                  tone: inc.severity === (fr ? "Critique" : "Critical")
                                    ? "danger"
                                    : inc.severity === (fr ? "Avertissement" : "Warning")
                                      ? "warning"
                                      : "neutral"
                                },
                                children: [inc.severity]
                              }
                            ]
                          }
                        ]
                      }))
                    }
                  ]
                }
              ]
            },
            // Flux d'événements (panneau utilitaire réservé, côté droit)
            {
              el: "aside",
              props: { class: "lef-feed", "aria-label": fr ? "Flux d'activité" : "Activity feed" },
              children: [
                { el: "h3", props: { class: "lef-feed-title" }, children: [fr ? "Événements" : "Events"] },
                {
                  el: "ul",
                  props: { class: "lef-feed-list", role: "list" },
                  children: EVENTS.map((ev) => ({
                    el: "li",
                    props: { class: `lef-feed-item lef-feed-item--${ev.status}` },
                    children: [
                      {
                        el: "div",
                        props: { class: "lef-feed-item-dot", "aria-hidden": "true" },
                        children: []
                      },
                      {
                        el: "div",
                        props: { class: "lef-feed-item-body" },
                        children: [
                          { el: "span", props: { class: "lef-feed-item-title" }, children: [ev.title] },
                          { el: "span", props: { class: "lef-feed-item-time" }, children: [ev.time] }
                        ]
                      }
                    ]
                  }))
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
    { name: "EventFeedPanel", slug: "event-feed-panel" },
    { name: "UtilityPanel", slug: "utility-panel" },
    { name: "AppChrome", slug: "app-chrome" },
    { name: "DataTable", slug: "data-table" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Gabarit · Console ops / Support" : "Layout · Ops console / Support"}
    </p>
    <div class="docs-hero-title">
      <h1>{fr ? "Liste + flux d'événements" : "List + event feed"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Layout opérationnel : navigation à gauche, liste au centre, panneau utilitaire (flux
        d'événements, journal d'activité) à droite. Le panneau peut être réservé (occupe l'espace)
        ou overlay (glisse par-dessus). Convient aux consoles de supervision, ops et support.
      {:else}
        Operational layout: left nav, center list, right utility panel (event feed, activity log).
        The panel can be reserved (takes up space) or overlay (slides over). Suited to
        monitoring, ops, and support consoles.
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
      title={fr ? "Liste + flux d'événements (données mock)" : "List + event feed (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="lef-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug + comp.name)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Modes du panneau utilitaire" : "Utility panel modes"}</h2>
    <ul class="lef-comp-list">
      <li><strong>{fr ? "Réservé" : "Reserved"}</strong> — {fr ? "le panneau occupe un espace fixe (utilisé ici)" : "the panel takes up fixed space (used here)"}</li>
      <li><strong>{fr ? "Overlay" : "Overlay"}</strong> — {fr ? "le panneau glisse par-dessus le contenu sans décaler la mise en page" : "the panel slides over content without shifting the layout"}</li>
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

  .lef-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.lef-shell) {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
  }

  :global(.lef-body) {
    display: grid;
    grid-template-columns: 180px 1fr 220px;
    min-height: 300px;
    width: 100%;
  }

  :global(.lef-nav) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.75rem;
  }

  :global(.lef-main) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    min-width: 0;
    overflow-x: auto;
  }

  :global(.lef-section-title) {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.lef-table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.825rem;
  }

  :global(.lef-table th) {
    text-align: left;
    padding: 0.4rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--st-semantic-text-tertiary, #94a3b8);
    border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
  }

  :global(.lef-table-row td) {
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--st-semantic-border-subtle, #f1f5f9);
    color: var(--st-semantic-text-primary, #0f172a);
    vertical-align: middle;
  }

  :global(.lef-table-row--open .lef-td-title) {
    font-weight: 500;
  }

  :global(.lef-td-svc) {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  /* Flux d'événements (panneau utilitaire réservé) */
  :global(.lef-feed) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 0.875rem;
    border-left: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    overflow-y: auto;
  }

  :global(.lef-feed-title) {
    font-size: 0.8rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.lef-feed-list) {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  :global(.lef-feed-item) {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--st-semantic-border-subtle, #f1f5f9);
  }

  :global(.lef-feed-item-dot) {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 4px;
    background: var(--st-semantic-text-tertiary, #cbd5e1);
  }

  :global(.lef-feed-item--error .lef-feed-item-dot) {
    background: var(--st-semantic-color-danger, #ef4444);
  }

  :global(.lef-feed-item--success .lef-feed-item-dot) {
    background: var(--st-semantic-color-success, #22c55e);
  }

  :global(.lef-feed-item--warning .lef-feed-item-dot) {
    background: var(--st-semantic-color-warning, #f59e0b);
  }

  :global(.lef-feed-item-body) {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    min-width: 0;
  }

  :global(.lef-feed-item-title) {
    font-size: 0.75rem;
    color: var(--st-semantic-text-primary, #0f172a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.lef-feed-item-time) {
    font-size: 0.65rem;
    color: var(--st-semantic-text-tertiary, #94a3b8);
  }

  @media (max-width: 860px) {
    :global(.lef-body) {
      grid-template-columns: 1fr;
    }
    :global(.lef-nav),
    :global(.lef-feed) {
      border: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
