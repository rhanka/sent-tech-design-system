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
      description: "KPI cards, line/bar/donut charts, and a top-N data table : the go-to pattern for business reporting.",
      descriptionFr: "Cartes KPI, graphiques ligne/barres/donut et table Top N : le patron de référence pour le reporting métier."
    },
    {
      slug: "app-shell",
      name: "App Shell",
      nameFr: "App Shell",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Header + side nav + breadcrumb + content area (title + cards) + footer : the skeleton reused by every view.",
      descriptionFr: "Header + nav latérale + fil d'Ariane + zone de contenu (titre + cartes) + footer : le squelette réutilisé par toutes les vues."
    },
    {
      slug: "settings",
      name: "Settings / Admin",
      nameFr: "Paramètres / Administration",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Sub-section side nav + category tabs + form/form-group (select, input, toggle, switch) + a save bar : the master-detail admin pattern.",
      descriptionFr: "SideNav de sous-sections + onglets de catégories + form/form-group (select, input, toggle, switch) + barre d'enregistrement : le patron admin master-détail."
    },
    {
      slug: "facture",
      name: "Customer Invoice",
      nameFr: "Facture client",
      domain: "Finance / Accounting",
      domainFr: "Finance / Comptabilité",
      status: "available",
      description: "Breadcrumb + invoice header (number + status badge + actions) + structured fields + line-items table + a totals list : an object-page declination.",
      descriptionFr: "Fil d'Ariane + en-tête (n° + badge de statut + actions) + champs structurés + table des lignes + liste des totaux : une déclinaison de la page objet."
    },
    {
      slug: "pipeline-crm",
      name: "CRM Pipeline",
      nameFr: "Pipeline CRM",
      domain: "CRM / Sales",
      domainFr: "CRM / Ventes",
      status: "available",
      description: "Columns per stage (New/Qualified/Proposal/Won) of opportunity cards (amount + avatar + probability bar) : a kanban declination.",
      descriptionFr: "Colonnes par étape (Nouveau/Qualifié/Proposition/Gagné) de cartes d'opportunités (montant + avatar + barre de probabilité) : une déclinaison du kanban."
    },
    {
      slug: "file-tickets",
      name: "Ticket Queue",
      nameFr: "File de tickets",
      domain: "Support / Helpdesk",
      domainFr: "Support / Helpdesk",
      status: "available",
      description: "Search + filter bar + a paginated tickets table (subject, priority, SLA, assignee, status) + an agents legend : a list-report declination.",
      descriptionFr: "Recherche + barre de filtres + table de tickets paginée (sujet, priorité, SLA, assigné, statut) + légende des agents : une déclinaison de la liste rapport."
    },
    {
      slug: "list-report",
      name: "List Report",
      nameFr: "Liste rapport",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Header + side nav + search + filter bar + paginated sortable table : the pattern of typical business list views.",
      descriptionFr: "Header + nav latérale + recherche + barre de filtres + table paginée triable : le patron des vues liste de gestion."
    },
    {
      slug: "object-page",
      name: "Object Page",
      nameFr: "Page objet",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Breadcrumb + entity header + tabs + KPI row + structured fields + related table : the pattern of all detail views.",
      descriptionFr: "Fil d'Ariane + en-tête d'entité + onglets + rangée KPI + champs structurés + table liée : le patron de toutes les fiches."
    },
    {
      slug: "kanban",
      name: "Kanban Board",
      nameFr: "Tableau Kanban",
      domain: "CRM / Sales",
      domainFr: "CRM / Ventes",
      status: "available",
      description: "Columns of cards with badge, avatar and progress : the signature CRM pipeline view.",
      descriptionFr: "Colonnes de cartes avec badge, avatar et progression : la vue pipeline CRM emblématique."
    },
    {
      slug: "data-explorer",
      name: "Data Explorer",
      nameFr: "Explorateur de données",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "Pivot table + bar chart side by side + filter bar + content switcher + a configuration drawer : the BI pivot showcase.",
      descriptionFr: "Tableau croisé + graphique en barres côte à côte + barre de filtres + bascule table/graphique + volet de configuration : la vitrine BI pivot."
    },
    {
      slug: "import-mapping",
      name: "Data Import / Mapping",
      nameFr: "Import / mappage de données",
      domain: "Import / Data",
      domainFr: "Import / Données",
      status: "available",
      description: "Stepper + file uploader + preview table + column→field select mapping + validation alert : the BI tool import flow.",
      descriptionFr: "Stepper + import de fichier + table d'aperçu + mappage colonne→champ + alerte de validation : le flux d'import des outils BI."
    },
    {
      slug: "master-detail",
      name: "Master-Detail",
      nameFr: "Maître-détail",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Selectable list on the left + detail panel (structured fields, KPI cards, mini table) on the right : the Fiori split-view pattern.",
      descriptionFr: "Liste sélectionnable à gauche + panneau détail (champs, KpiCard, mini table) à droite : le patron Fiori split-view."
    },
    {
      slug: "wizard",
      name: "Multi-step Wizard",
      nameFr: "Assistant multi-étapes",
      domain: "App Shell",
      domainFr: "App Shell",
      status: "available",
      description: "Stepper + the current step's form/form-group + a previous/next button group + a structured-list summary : onboarding and setup flows.",
      descriptionFr: "Stepper + formulaire de l'étape courante + boutons Précédent/Suivant + récapitulatif structuré : onboarding et configuration."
    },
    {
      slug: "login",
      name: "Login / Auth",
      nameFr: "Connexion / Auth",
      domain: "Authentication",
      domainFr: "Authentification",
      status: "available",
      description: "Centered card + form with email input, password input, remember-me checkbox, button, error alert and links : the universal quick-win.",
      descriptionFr: "Carte centrée + formulaire avec e-mail, mot de passe, case « se souvenir », bouton, alerte d'erreur et liens : le quick-win universel."
    },
    {
      slug: "viewtemplater",
      name: "View template catalog",
      nameFr: "Catalogue de gabarits de vue",
      domain: "Configuration",
      domainFr: "Configuration",
      status: "available",
      description: "ConfigItemCard grid of ViewSpec templates organized by domain — copy, edit, reset, delete. Shows the ViewSpec format and the ConfigItemCard/FieldCard/ScoreCard patterns.",
      descriptionFr: "Grille ConfigItemCard de gabarits ViewSpec par domaine — copier, éditer, réinitialiser, supprimer. Illustre le format ViewSpec et les patterns ConfigItemCard/FieldCard/ScoreCard."
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
