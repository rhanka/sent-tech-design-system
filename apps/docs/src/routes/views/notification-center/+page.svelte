<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  type NotifTone = "category1" | "category2" | "category3" | "category4" | "category5";
  type BadgeTone = "info" | "warning" | "error" | "success" | "neutral";

  const NOTIFS: {
    id: string; name: string; tone: NotifTone;
    label: () => string; labelTone: BadgeTone;
    msg: () => string; time: string; read: boolean;
  }[] = [
    { id: "1", name: "Marie Lefebvre", tone: "category1", label: () => (fr ? "Mention" : "Mention"), labelTone: "info", msg: () => (fr ? "Vous a mentionné dans « Refonte ERP Airbus »" : "Mentioned you in «Airbus ERP Overhaul»"), time: "09:42", read: false },
    { id: "2", name: "Système", tone: "category3", label: () => (fr ? "Alerte" : "Alert"), labelTone: "error", msg: () => (fr ? "Échec du job d'import de données (lot #2847)" : "Data import job failed (batch #2847)"), time: "09:15", read: false },
    { id: "3", name: "Karim Benali", tone: "category2", label: () => (fr ? "Approbation" : "Approval"), labelTone: "warning", msg: () => (fr ? "En attente de votre validation pour le devis #4412" : "Awaiting your approval on quote #4412"), time: "08:57", read: false },
    { id: "4", name: "Sophie Durand", tone: "category4", label: () => (fr ? "Commentaire" : "Comment"), labelTone: "neutral", msg: () => (fr ? "A répondu à votre commentaire sur la migration Safran" : "Replied to your comment on Safran migration"), time: "08:30", read: true },
    { id: "5", name: "Système", tone: "category5", label: () => (fr ? "Succès" : "Success"), labelTone: "success", msg: () => (fr ? "Export CSV terminé — 1 248 lignes générées" : "CSV export complete — 1,248 rows generated"), time: "07:55", read: true }
  ];

  function notifRow(n: typeof NOTIFS[0]): NodeSpec {
    return {
      el: "div", props: { class: `nc-row${n.read ? " nc-row--read" : ""}` }, children: [
        { comp: "Avatar", props: { name: n.name, size: "sm", tone: n.tone } },
        { el: "div", props: { class: "nc-body" }, children: [
          { el: "div", props: { class: "nc-top" }, children: [
            { el: "span", props: { class: "nc-sender" }, children: [n.name] },
            { comp: "Badge", props: { tone: n.labelTone }, children: [n.label()] },
            { el: "span", props: { class: "nc-time" }, children: [n.time] }
          ]},
          { el: "p", props: { class: "nc-msg" }, children: [n.msg()] }
        ]},
        { el: "div", props: { class: "nc-dot-wrap" }, children: [
          ...(!n.read ? [{ el: "span", props: { class: "nc-dot" } } as NodeSpec] : [])
        ]}
      ]
    };
  }

  const demoNodes = $derived<NodeSpec[]>([{
    el: "div", props: { class: "nc-shell" }, children: [
      { el: "div", props: { class: "nc-toolbar" }, children: [
        { comp: "Tabs", props: { activeValue: "all", label: fr ? "Filtres de notifications" : "Notification filters", items: [
          { value: "all",      label: fr ? "Tout" : "All",        content: "" },
          { value: "mentions", label: fr ? "Mentions" : "Mentions", content: "" },
          { value: "alerts",   label: fr ? "Alertes" : "Alerts",   content: "" },
          { value: "system",   label: fr ? "Système" : "System",   content: "" }
        ]}},
        { el: "div", props: { class: "nc-actions" }, children: [
          { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Tout marquer comme lu" : "Mark all as read"] },
          { comp: "OverflowMenu", props: { label: fr ? "Filtrer" : "Filter", triggerLabel: fr ? "Filtrer" : "Filter", placement: "bottom-end", items: [
            { value: "unread", label: fr ? "Non lus seulement" : "Unread only" },
            { value: "mentions", label: fr ? "Mentions" : "Mentions" },
            { value: "alerts", label: fr ? "Alertes" : "Alerts" }
          ]}}
        ]}
      ]},
      { comp: "Alert", props: { tone: "info" }, children: [fr ? "3 notifications non lues" : "3 unread notifications"] },
      { el: "div", props: { class: "nc-list" }, children: NOTIFS.map(notifRow) }
    ]
  }]);

  const DS_COMPONENTS = [
    { name: "Tabs",          slug: "tabs" },
    { name: "Card",          slug: "card" },
    { name: "Avatar",        slug: "avatar" },
    { name: "Badge",         slug: "badge" },
    { name: "Button",        slug: "button" },
    { name: "OverflowMenu",  slug: "overflow-menu" },
    { name: "Alert",         slug: "alert" },
    { name: "UnorderedList", slug: "unordered-list" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Transversal" : "View · Transversal"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Centre de notifications" : "Notification Center"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Inbox unifiée : onglets par catégorie, liste de notifications avec avatar et badge de statut,
        filtres et actions groupées (tout marquer comme lu). Pour centraliser alertes, mentions et événements système.
      {:else}
        Unified inbox: category tabs, notification list with avatar and status badge, filters and bulk
        actions (mark all as read). For centralizing alerts, mentions and system events.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample nodes={demoNodes} title={fr ? "Centre de notifications (données mock)" : "Notification Center (mock data)"} />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="nc-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .nc-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }

  :global(.nc-shell) { display: flex; flex-direction: column; width: 100%; border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; overflow: hidden; background: var(--st-semantic-surface-raised, #fff); }
  :global(.nc-toolbar) { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--st-semantic-surface-subtle, #f8fafc); border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); flex-wrap: wrap; }
  :global(.nc-actions) { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
  :global(.nc-list) { display: flex; flex-direction: column; }
  :global(.nc-row) { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.9rem 1rem; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); background: var(--st-semantic-surface-raised, #fff); }
  :global(.nc-row:last-child) { border-bottom: none; }
  :global(.nc-row--read) { background: var(--st-semantic-surface-subtle, #f8fafc); opacity: 0.75; }
  :global(.nc-body) { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.3rem; }
  :global(.nc-top) { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  :global(.nc-sender) { font-weight: 600; font-size: 0.875rem; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.nc-time) { margin-left: auto; font-size: 0.75rem; color: var(--st-semantic-text-secondary, #475569); white-space: nowrap; }
  :global(.nc-msg) { margin: 0; font-size: 0.875rem; color: var(--st-semantic-text-secondary, #475569); line-height: 1.4; }
  :global(.nc-dot-wrap) { display: flex; align-items: center; padding-top: 0.25rem; flex-shrink: 0; }
  :global(.nc-dot) { width: 8px; height: 8px; border-radius: 50%; background: var(--st-semantic-accent-primary, #3b82f6); display: block; }
</style>
