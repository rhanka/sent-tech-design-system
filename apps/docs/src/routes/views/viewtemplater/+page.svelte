<script lang="ts">
  import { ConfigItemCard, Badge } from "@sentropic/design-system-svelte";
  import type { ConfigItem } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // ViewSpec — spécification d'un gabarit de vue (format MVP)
  type ViewSpecObjectType =
    | "dashboard"
    | "container"
    | "detail"
    | "wizard"
    | "kanban"
    | "list-report";

  type ViewSpec = {
    id: string;
    name: string;
    objectType: ViewSpecObjectType;
    description?: string;
    sourceLevel: "code" | "admin" | "user";
    parentId?: string;
  };

  // Catalogue mock — 8 domaines × quelques gabarits chacun
  const TEMPLATES = $derived<ViewSpec[]>([
    // Analytics / BI
    { id: "tpl-dash-exec", name: fr ? "Dashboard exécutif" : "Executive Dashboard", objectType: "dashboard", description: fr ? "KPI, graphiques ligne/barres/donut, top-N" : "KPIs, line/bar/donut charts, top-N table", sourceLevel: "code" },
    { id: "tpl-dash-ops",  name: fr ? "Dashboard opérationnel" : "Ops Dashboard", objectType: "dashboard", description: fr ? "Métriques temps réel, alertes, file de tickets" : "Real-time metrics, alerts, ticket queue", sourceLevel: "code" },
    // CRM
    { id: "tpl-crm-pipeline", name: fr ? "Pipeline de vente" : "Sales Pipeline", objectType: "kanban", description: fr ? "Opportunités par étape, glisser-déposer" : "Deals by stage, drag-and-drop", sourceLevel: "code" },
    { id: "tpl-crm-contact",  name: fr ? "Fiche contact" : "Contact detail", objectType: "detail", description: fr ? "Profil client, timeline d'interactions" : "Customer profile, interaction timeline", sourceLevel: "code" },
    // ERP
    { id: "tpl-erp-stock",   name: fr ? "Gestion de stock" : "Stock management", objectType: "list-report", description: fr ? "Niveaux, réceptions, seuils d'alerte" : "Levels, receipts, alert thresholds", sourceLevel: "code" },
    { id: "tpl-erp-orders",  name: fr ? "Commandes fournisseurs" : "Purchase orders", objectType: "list-report", description: fr ? "PO, statuts, réceptions attendues" : "POs, statuses, expected receipts", sourceLevel: "code" },
    // Compta
    { id: "tpl-acc-invoice",  name: fr ? "Facturation" : "Invoicing", objectType: "list-report", description: fr ? "Factures, statuts de paiement, relances" : "Invoices, payment status, reminders", sourceLevel: "code" },
    { id: "tpl-acc-ledger",   name: fr ? "Grand livre" : "General ledger", objectType: "list-report", description: fr ? "Écritures comptables, rapprochement" : "Journal entries, reconciliation", sourceLevel: "code" },
    // RH
    { id: "tpl-hr-onboard",  name: fr ? "Onboarding" : "Onboarding", objectType: "wizard", description: fr ? "Parcours d'accueil multi-étapes" : "Multi-step onboarding wizard", sourceLevel: "code" },
    { id: "tpl-hr-perf",     name: fr ? "Évaluation de performance" : "Performance review", objectType: "detail", description: fr ? "Grilles d'évaluation, objectifs, scores" : "Evaluation grids, goals, scores", sourceLevel: "code" },
    // Projet / Helpdesk
    { id: "tpl-proj-kanban", name: fr ? "Tableau Kanban projet" : "Project Kanban", objectType: "kanban", description: fr ? "Tickets par sprint, bloquer/débloquer" : "Sprint tickets, block/unblock", sourceLevel: "code" },
    { id: "tpl-proj-gantt",  name: fr ? "Gantt de projet" : "Project Gantt", objectType: "container", description: fr ? "Jalons, dépendances, chemin critique" : "Milestones, dependencies, critical path", sourceLevel: "code" },
    // Copies utilisateur (exemples)
    { id: "tpl-dash-exec-copy", name: fr ? "Mon dashboard BI" : "My BI Dashboard", objectType: "dashboard", description: fr ? "Copie personnalisée du dashboard exécutif" : "Customized copy of executive dashboard", sourceLevel: "user", parentId: "tpl-dash-exec" },
    { id: "tpl-crm-custom",     name: fr ? "CRM Sectoriel" : "Sector CRM", objectType: "detail", description: fr ? "Gabarit CRM adapté au secteur public" : "CRM template adapted for public sector", sourceLevel: "user" },
  ]);

  const DOMAIN_LABELS: Record<string, { fr: string; en: string }> = {
    dashboard: { fr: "Analytics / BI", en: "Analytics / BI" },
    kanban:    { fr: "CRM · Projet", en: "CRM · Project" },
    "list-report": { fr: "ERP · Compta", en: "ERP · Accounting" },
    detail:    { fr: "CRM · RH", en: "CRM · HR" },
    wizard:    { fr: "RH · Onboarding", en: "HR · Onboarding" },
    container: { fr: "Projet", en: "Project" },
  };

  const domainOf = (t: ViewSpec) => DOMAIN_LABELS[t.objectType]?.[locale.value] ?? t.objectType;

  function toConfigItem(t: ViewSpec): ConfigItem {
    return {
      id: t.id,
      name: t.name,
      key: t.id,
      description: t.description,
      sourceLevel: t.sourceLevel,
      parentId: t.parentId ?? null,
    };
  }

  let copyLog = $state<string[]>([]);
  let editLog = $state<string[]>([]);

  function onCopy(id: string) {
    copyLog = [`Copié : ${id}`, ...copyLog].slice(0, 3);
  }
  function onEdit(id: string) {
    editLog = [`Édité : ${id}`, ...editLog].slice(0, 3);
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vues · Catalogue de gabarits" : "Views · Template catalog"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Catalogue de gabarits de vue" : "View template catalog"}</h1>
      <Badge tone="neutral">{fr ? "MVP" : "MVP"}</Badge>
    </div>
    <p>
      {fr
        ? "Catalogue des gabarits de vue disponibles par domaine métier. Les gabarits système (code/admin) peuvent être copiés et personnalisés par chaque équipe via ConfigItemCard."
        : "Catalog of available view templates by business domain. System templates (code/admin) can be copied and customized per team via ConfigItemCard."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Gabarits disponibles" : "Available templates"}</h2>
    <p>
      {fr
        ? `${TEMPLATES.length} gabarits · ${TEMPLATES.filter(t => t.sourceLevel !== 'user').length} système · ${TEMPLATES.filter(t => t.sourceLevel === 'user').length} utilisateur`
        : `${TEMPLATES.length} templates · ${TEMPLATES.filter(t => t.sourceLevel !== 'user').length} system · ${TEMPLATES.filter(t => t.sourceLevel === 'user').length} user`}
    </p>

    <div class="vtc-grid">
      {#each TEMPLATES as tpl (tpl.id)}
        <div class="vtc-item">
          <div class="vtc-domain">{domainOf(tpl)}</div>
          <ConfigItemCard
            item={toConfigItem(tpl)}
            hasCopy={TEMPLATES.some(t => t.parentId === tpl.id)}
            onCopy={tpl.sourceLevel !== 'user' ? onCopy : undefined}
            onEdit={tpl.sourceLevel === 'user' ? onEdit : undefined}
            onReset={tpl.sourceLevel === 'user' && !!tpl.parentId ? onEdit : undefined}
          />
        </div>
      {/each}
    </div>
  </section>

  {#if copyLog.length > 0 || editLog.length > 0}
    <section class="docs-section">
      <h2>{fr ? "Journal des actions" : "Action log"}</h2>
      <ul class="vtc-log">
        {#each [...copyLog, ...editLog] as entry}
          <li><code>{entry}</code></li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="docs-section">
    <h2>ViewSpec</h2>
    <p>
      {fr
        ? "Format de spécification d'un gabarit de vue. Utilisé par le moteur de rendu pour dispatcher vers le bon composant DS."
        : "View template specification format. Used by the renderer to dispatch to the right DS component."}
    </p>
    <pre class="vtc-code"><code>{`type ViewSpec = {
  id: string;
  name: string;
  objectType: "dashboard" | "container" | "detail"
            | "wizard" | "kanban" | "list-report";
  description?: string;
  sourceLevel: "code" | "admin" | "user";
  parentId?: string;  // si copie d'un gabarit système
};`}</code></pre>
  </section>
</div>

<style>
  .vtc-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    margin: 1.5rem 0;
  }

  .vtc-item {
    display: grid;
    gap: 0.4rem;
  }

  .vtc-domain {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .vtc-log {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.3rem;
  }

  .vtc-code {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.375rem;
    font-family: var(--st-foundation-font-mono, monospace);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0.75rem 0 1.5rem;
    overflow-x: auto;
    padding: 1rem 1.25rem;
    white-space: pre;
  }
</style>
