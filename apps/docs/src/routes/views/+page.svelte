<script lang="ts">
  import { Card, Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  interface ViewEntry {
    slug: string;
    name: string;
    nameFr: string;
    domain: string;
    domainFr: string;
    status: "available" | "soon";
    description: string;
    descriptionFr: string;
  }

  const VIEWS: ViewEntry[] = [
    {
      slug: "dashboard",
      name: "Executive Dashboard",
      nameFr: "Dashboard exécutif",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "KPI cards, line/bar/donut charts, and a top-N data table — the go-to pattern for business reporting.",
      descriptionFr: "Cartes KPI, graphiques ligne/barres/donut et table Top N — le patron de référence pour le reporting métier."
    },
    {
      slug: "app-shell",
      name: "App Shell",
      nameFr: "App Shell",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "soon",
      description: "Header + side navigation + main content area — the base of all application layouts.",
      descriptionFr: "Header + navigation latérale + zone principale — le socle de toutes les vues."
    },
    {
      slug: "list-report",
      name: "List Report",
      nameFr: "Liste rapport",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "soon",
      description: "Filter bar + paginated data table — covers 20+ Odoo list views.",
      descriptionFr: "Barre de filtres + table paginée — couvre 20+ vues liste Odoo."
    },
    {
      slug: "object-page",
      name: "Object Page",
      nameFr: "Page objet",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "soon",
      description: "Breadcrumb + sections + actions — the Fiori Object Page pattern for detail views.",
      descriptionFr: "Fil d'Ariane + sections + actions — le patron Fiori Object Page pour les fiches."
    },
    {
      slug: "kanban",
      name: "Kanban Board",
      nameFr: "Tableau Kanban",
      domain: "CRM / Sales",
      domainFr: "CRM / Ventes",
      status: "soon",
      description: "Columns of cards with drag-and-drop — the signature Odoo CRM pipeline view.",
      descriptionFr: "Colonnes de cartes avec glisser-déposer — la vue pipeline CRM Odoo emblématique."
    },
    {
      slug: "data-explorer",
      name: "Data Explorer",
      nameFr: "Explorateur de données",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "soon",
      description: "Pivot table + multi-chart layout — the BI showcase for the 36 chart components.",
      descriptionFr: "Tableau croisé dynamique + multi-graphiques — la vitrine BI des 36 composants graphiques."
    },
    {
      slug: "master-detail",
      name: "Master-Detail",
      nameFr: "Maître-détail",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "soon",
      description: "Split-panel list + detail — the Fiori master-detail / split-view pattern.",
      descriptionFr: "Volet liste + détail côte à côte — le patron Fiori split-view."
    },
    {
      slug: "wizard",
      name: "Multi-step Wizard",
      nameFr: "Assistant multi-étapes",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "soon",
      description: "Stepper + form steps + navigation — covers onboarding, import and setup flows.",
      descriptionFr: "Stepper + étapes formulaire + navigation — couvre onboarding, import et configuration."
    }
  ];

  const available = VIEWS.filter((v) => v.status === "available");
  const upcoming = VIEWS.filter((v) => v.status === "soon");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Section · Préfabriqués" : "Section · Prefabricated"}
    </p>
    <h1>{locale.value === "fr" ? "Vues" : "Views"}</h1>
    <p>
      {#if locale.value === "fr"}
        Écrans-type préfabriqués composés uniquement de composants DS, rendus en Svelte, React
        et Vue via le même pipeline <code>NodeSpec</code>. Chaque vue = une définition → 3
        rendus + 3 snippets copiables.
      {:else}
        Prefabricated screen patterns built exclusively from DS components, rendered in Svelte,
        React, and Vue through the shared <code>NodeSpec</code> pipeline. One definition → 3
        renders + 3 copy-ready code snippets.
      {/if}
    </p>
    <p class="views-meta">
      {locale.value === "fr"
        ? `${available.length} disponible · ${upcoming.length + available.length} prévues (100 au total)`
        : `${available.length} available · ${upcoming.length + available.length} planned (100 total)`}
    </p>
  </section>

  {#if available.length > 0}
    <section class="docs-section">
      <h2>{locale.value === "fr" ? "Disponibles" : "Available"}</h2>
      <div class="views-grid">
        {#each available as view (view.slug)}
          <a class="views-card-link" href="/views/{view.slug}">
            <Card class="views-card views-card--available" interactive>
              <div class="views-card-head">
                <span class="views-card-domain">
                  {locale.value === "fr" ? view.domainFr : view.domain}
                </span>
                <Badge tone="success">{locale.value === "fr" ? "Disponible" : "Available"}</Badge>
              </div>
              <h3 class="views-card-name">
                {locale.value === "fr" ? view.nameFr : view.name}
              </h3>
              <p class="views-card-desc">
                {locale.value === "fr" ? view.descriptionFr : view.description}
              </p>
            </Card>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "À venir" : "Coming soon"}</h2>
    <div class="views-grid">
      {#each upcoming as view (view.slug)}
        <div class="views-card-link views-card-link--disabled">
          <Card class="views-card">
            <div class="views-card-head">
              <span class="views-card-domain">
                {locale.value === "fr" ? view.domainFr : view.domain}
              </span>
              <Badge tone="neutral">{locale.value === "fr" ? "À venir" : "Soon"}</Badge>
            </div>
            <h3 class="views-card-name">
              {locale.value === "fr" ? view.nameFr : view.name}
            </h3>
            <p class="views-card-desc">
              {locale.value === "fr" ? view.descriptionFr : view.description}
            </p>
          </Card>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .views-meta {
    color: var(--docs-muted, #475569);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .views-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .views-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .views-card-link--disabled {
    cursor: default;
    opacity: 0.7;
  }

  :global(.views-card) {
    height: 100%;
  }

  .views-card-head {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }

  .views-card-domain {
    color: var(--docs-muted, #475569);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .views-card-name {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 0.4rem;
    color: var(--docs-ink, #0f172a);
  }

  .views-card-desc {
    color: var(--docs-muted, #475569);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }
</style>
