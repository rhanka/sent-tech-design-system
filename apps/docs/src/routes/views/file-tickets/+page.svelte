<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (file de tickets Helpdesk-like) ──────────────────

  const ASSIGNEES = [
    { name: "Marie Lefebvre", tone: "category1" as const },
    { name: "Karim Benali", tone: "category2" as const },
    { name: "Sophie Durand", tone: "category3" as const },
    { name: "Léa Moreau", tone: "category4" as const }
  ];

  const COLUMNS = [
    { key: "ref", label: () => "#", sortable: true },
    { key: "sujet", label: () => (fr ? "Sujet" : "Subject"), sortable: true },
    { key: "priorite", label: () => (fr ? "Priorité" : "Priority"), sortable: true },
    { key: "sla", label: () => "SLA", sortable: true },
    { key: "assigne", label: () => (fr ? "Assigné à" : "Assigned to"), sortable: true },
    { key: "statut", label: () => (fr ? "Statut" : "Status"), sortable: true }
  ];

  const ROWS = $derived([
    { id: "1", ref: "T-2041", sujet: fr ? "Connexion impossible après MAJ" : "Cannot log in after update", priorite: fr ? "Urgente" : "Urgent", sla: fr ? "2 h restantes" : "2h left", assigne: "Marie Lefebvre", statut: fr ? "Ouvert" : "Open" },
    { id: "2", ref: "T-2040", sujet: fr ? "Export PDF tronqué" : "PDF export truncated", priorite: fr ? "Haute" : "High", sla: fr ? "5 h restantes" : "5h left", assigne: "Karim Benali", statut: fr ? "En cours" : "In progress" },
    { id: "3", ref: "T-2039", sujet: fr ? "Demande de nouvelle fonctionnalité" : "Feature request", priorite: fr ? "Basse" : "Low", sla: fr ? "3 j restants" : "3d left", assigne: "Sophie Durand", statut: fr ? "Ouvert" : "Open" },
    { id: "4", ref: "T-2038", sujet: fr ? "Facture en double" : "Duplicate invoice", priorite: fr ? "Moyenne" : "Medium", sla: fr ? "1 j restant" : "1d left", assigne: "Léa Moreau", statut: fr ? "En attente" : "Pending" },
    { id: "5", ref: "T-2037", sujet: fr ? "Lenteur du tableau de bord" : "Dashboard is slow", priorite: fr ? "Haute" : "High", sla: fr ? "Dépassé" : "Breached", assigne: "Karim Benali", statut: fr ? "En cours" : "In progress" },
    { id: "6", ref: "T-2036", sujet: fr ? "Mot de passe oublié" : "Forgotten password", priorite: fr ? "Basse" : "Low", sla: fr ? "Résolu" : "Resolved", assigne: "Marie Lefebvre", statut: fr ? "Fermé" : "Closed" },
    { id: "7", ref: "T-2035", sujet: fr ? "Erreur 500 sur l'API" : "500 error on the API", priorite: fr ? "Urgente" : "Urgent", sla: fr ? "1 h restante" : "1h left", assigne: "Sophie Durand", statut: fr ? "Ouvert" : "Open" },
    { id: "8", ref: "T-2034", sujet: fr ? "Traduction manquante (ES)" : "Missing translation (ES)", priorite: fr ? "Basse" : "Low", sla: fr ? "5 j restants" : "5d left", assigne: "Léa Moreau", statut: fr ? "En attente" : "Pending" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "ft-shell" },
      children: [
        // Barre de titre + action
        {
          el: "div",
          props: { class: "ft-titlebar" },
          children: [
            { el: "h2", props: { class: "ft-title" }, children: [fr ? "File de tickets" : "Ticket queue"] },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Nouveau ticket" : "New ticket"] }
          ]
        },
        // Légende des agents (Avatar)
        {
          el: "div",
          props: { class: "ft-agents" },
          children: [
            { el: "span", props: { class: "ft-agents-label" }, children: [fr ? "Agents :" : "Agents:"] },
            {
              comp: "AvatarGroup",
              props: { max: 4 },
              children: ASSIGNEES.map((a) => ({
                comp: "Avatar" as const,
                props: { name: a.name, size: "sm", tone: a.tone }
              }))
            }
          ]
        },
        // Recherche + filtres
        {
          el: "div",
          props: { class: "ft-toolbar" },
          children: [
            {
              el: "div",
              props: { class: "ft-search" },
              children: [
                {
                  comp: "Search",
                  props: {
                    label: fr ? "Rechercher un ticket" : "Search tickets",
                    placeholder: fr ? "Rechercher par sujet ou n°…" : "Search by subject or number…"
                  }
                }
              ]
            },
            {
              comp: "FilterBar",
              props: { label: fr ? "Filtres actifs" : "Active filters" },
              children: [
                { comp: "FilterPill", props: { field: fr ? "Priorité" : "Priority", operator: "in", value: fr ? "Urgente, Haute" : "Urgent, High", active: true, removable: true } },
                { comp: "FilterPill", props: { field: fr ? "Statut" : "Status", operator: "!=", value: fr ? "Fermé" : "Closed", active: true, removable: true } },
                { comp: "FilterPill", props: { field: "SLA", operator: "=", value: fr ? "Dépassé" : "Breached", active: false, removable: true } }
              ]
            }
          ]
        },
        // Table paginée des tickets
        {
          el: "div",
          props: { class: "ft-table" },
          children: [
            {
              comp: "DataTable",
              props: {
                caption: fr ? "Tickets ouverts : support niveau 1" : "Open tickets : level-1 support",
                columns: COLUMNS.map((c) => ({ key: c.key, label: c.label(), sortable: c.sortable })),
                rows: ROWS,
                sortable: true,
                pageSize: 5,
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
    { name: "AvatarGroup", slug: "avatar-group" },
    { name: "Avatar", slug: "avatar" },
    { name: "Search", slug: "search" },
    { name: "FilterBar", slug: "filter-bar" },
    { name: "FilterPill", slug: "filter-pill" },
    { name: "DataTable", slug: "data-table" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Helpdesk" : "View · Helpdesk"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "File de tickets" : "Ticket Queue"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Déclinaison du patron liste rapport pour le helpdesk : barre de recherche
        (<code>Search</code>) + barre de filtres (<code>FilterPill</code>) + <code>DataTable</code>
        des tickets (sujet, priorité, SLA, assigné, statut) paginée + légende des agents
        (<code>AvatarGroup</code>). Un seul <code>NodeSpec</code> → rendu identique en Svelte, React
        et Vue.
      {:else}
        A declination of the list-report pattern for the helpdesk: a <code>Search</code> bar + a
        filter bar (<code>FilterPill</code>) + a paginated <code>DataTable</code> of tickets
        (subject, priority, SLA, assignee, status) + an agents legend (<code>AvatarGroup</code>).
        One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
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
      title={fr ? "File de tickets : support niveau 1 (données mock)" : "Ticket Queue : level-1 support (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="ft-comp-list">
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

  .ft-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout File de tickets (global → propagé dans les îles React/Vue) ──── */
  :global(.ft-shell) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--st-semantic-surface-raised, #fff);
    padding: 1.25rem;
  }

  :global(.ft-titlebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.ft-title) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.ft-agents) {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  :global(.ft-agents-label) {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.ft-toolbar) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :global(.ft-search) {
    max-width: 420px;
    width: 100%;
  }

  @media (max-width: 760px) {
    :global(.ft-search) {
      max-width: none;
    }
  }
</style>
