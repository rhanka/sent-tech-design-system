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
    },
    {
      slug: "analytics-overview",
      name: "Analytics Overview",
      nameFr: "Vue d'ensemble analytique",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "Executive dashboard: a band of KPI cards with deltas, area trend charts, a pie breakdown and a ranked top-N table. Period and segment filters in the header. For daily tracking of business indicators.",
      descriptionFr: "Tableau de bord exécutif : bandeau de cartes KPI avec variation, courbes de tendance sur l'aire, répartition en camembert et table top-N classée. Filtres de période et de segment en tête. Pour le suivi quotidien des indicateurs business."
    },
    {
      slug: "cohort-heatmap",
      name: "Cohort Retention",
      nameFr: "Rétention par cohorte",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "Retention analysis as a heatmap-style grid: each row is an acquisition cohort, each column a follow-up period, and cell intensity encodes the retention rate. Measure and granularity selectors, summary cards and threshold badges. For measuring loyalty over time.",
      descriptionFr: "Analyse de rétention en grille type heatmap : chaque ligne est une cohorte d'acquisition, chaque colonne une période de suivi, l'intensité de la cellule traduit le taux de rétention. Sélecteurs de mesure et de granularité, cartes de synthèse et badges de seuil. Pour mesurer la fidélisation dans le temps."
    },
    {
      slug: "conversion-funnel",
      name: "Conversion Funnel",
      nameFr: "Entonnoir de conversion",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "Step-by-step funnel visualization built on descending bars, with pass-through and drop-off rates shown between each stage. Overall conversion KPI cards, segment filters and a per-step detail table. For diagnosing losses along the user journey.",
      descriptionFr: "Visualisation d'entonnoir étape par étape construite sur des barres décroissantes, avec taux de passage et taux de chute affichés entre chaque palier. Cartes KPI de conversion globale, filtres de segment et table de détail par étape. Pour diagnostiquer les pertes du parcours utilisateur."
    },
    {
      slug: "correlation-scatter",
      name: "Correlation Analysis",
      nameFr: "Analyse de corrélation",
      domain: "Analytics / BI",
      domainFr: "Analytics / BI",
      status: "available",
      description: "Exploration of the relationship between two metrics via a scatter plot, with X and Y axis selectors, a color dimension and a date range. Correlation score cards, advanced filters and an outliers table. For spotting links between indicators.",
      descriptionFr: "Exploration de la relation entre deux métriques via un nuage de points (scatter), avec sélecteurs d'axes X et Y, dimension de couleur et plage de dates. Cartes de score de corrélation, filtres avancés et table des points aberrants. Pour repérer les liens entre indicateurs."
    },
    {
      slug: "contacts-directory",
      name: "Contacts Directory",
      nameFr: "Annuaire des contacts",
      domain: "CRM",
      domainFr: "CRM",
      status: "available",
      description: "Filterable contacts repository with search, segments and a dense table. Avatar, role and linked account on each row, with quick edit actions.",
      descriptionFr: "Repertoire filtrable des contacts avec recherche, segments et table dense. Avatar, role et compte rattache pour chaque ligne, avec actions rapides d'edition."
    },
    {
      slug: "opportunity-detail",
      name: "Opportunity Detail",
      nameFr: "Fiche opportunite",
      domain: "CRM",
      domainFr: "CRM",
      status: "available",
      description: "360 view of an opportunity: sales stage, weighted amount, contacts and activities. Progress stepper, deal KPIs and quote/history tabs.",
      descriptionFr: "Vue 360 d'une opportunite : etape du cycle, montant pondere, contacts et activites. Stepper de progression, KPI de deal et onglets devis/historique."
    },
    {
      slug: "quote-tracker",
      name: "Quote Tracker",
      nameFr: "Suivi des devis",
      domain: "CRM",
      domainFr: "CRM",
      status: "available",
      description: "Quote tracking by status (sent, accepted, expired) with totals and acceptance rate. Period filters, expiry alerts and an amount-bearing table.",
      descriptionFr: "Suivi des devis par statut (envoye, accepte, expire) avec totaux et taux d'acceptation. Filtres par periode, alertes d'echeance et table avec montants."
    },
    {
      slug: "lead-scoring",
      name: "Lead Scoring",
      nameFr: "Scoring des leads",
      domain: "CRM",
      domainFr: "CRM",
      status: "available",
      description: "Lead qualification by score: score card, source breakdown and a prioritized list. Combines ScoreCard, pie breakdown and a hot-leads table.",
      descriptionFr: "Qualification des leads par score : carte de score, repartition par source et liste priorisee. Combine ScoreCard, repartition camembert et table des leads chauds."
    },
    {
      slug: "stock-overview",
      name: "Stock Overview",
      nameFr: "Vue d'ensemble du stock",
      domain: "ERP / Stock",
      domainFr: "ERP / Stock",
      status: "available",
      description: "KPI cards (stock value, stockouts, turnover rate) + trend chart + warehouse pie breakdown + below-threshold items table. To monitor overall inventory health at a glance.",
      descriptionFr: "Cartes KPI (valeur du stock, ruptures, taux de rotation) + courbe d'évolution + camembert par entrepôt + table des articles sous seuil. Pour piloter la santé globale des stocks d'un coup d'oeil."
    },
    {
      slug: "purchase-order",
      name: "Purchase Order",
      nameFr: "Ordre d'achat",
      domain: "ERP / Stock",
      domainFr: "ERP / Stock",
      status: "available",
      description: "Purchase order creation form: supplier picker, delivery date, editable line items with quantities and prices, totals. Combines header cards and an entry grid to place an order with a supplier.",
      descriptionFr: "Formulaire de création d'ordre d'achat : sélection fournisseur, date de livraison, lignes d'articles éditables avec quantités et prix, totaux. Combine entêtes en cartes et grille de saisie pour passer commande à un fournisseur."
    },
    {
      slug: "goods-receipt",
      name: "Goods Receipt",
      nameFr: "Réception de marchandises",
      domain: "ERP / Stock",
      domainFr: "ERP / Stock",
      status: "available",
      description: "Stepped receiving wizard: purchase order recall, received vs expected quantity check, discrepancy alerting, delivery note upload. To record the physical arrival of items into a warehouse.",
      descriptionFr: "Assistant de réception en étapes : rappel de l'ordre d'achat, contrôle des quantités reçues vs attendues, signalement d'écarts par alerte, dépôt du bon de livraison. Pour enregistrer l'entrée physique des articles en entrepôt."
    },
    {
      slug: "warehouse-transfer",
      name: "Warehouse Transfer",
      nameFr: "Transfert entre entrepôts",
      domain: "ERP / Stock",
      domainFr: "ERP / Stock",
      status: "available",
      description: "Inter-warehouse transfer management: source/destination selection, basket of items to move with stock levels, status flow in tabs (picking, shipping, receiving) and history. To orchestrate stock movements between sites.",
      descriptionFr: "Gestion des transferts entre entrepôts : sélection origine/destination, panier d'articles à déplacer avec niveaux de stock, fil d'avancement par onglets (préparation, expédition, réception) et historique. Pour orchestrer les mouvements inter-sites."
    },
    {
      slug: "balance-comptable",
      name: "Trial Balance",
      nameFr: "Balance comptable",
      domain: "Accounting",
      domainFr: "Comptabilité",
      status: "available",
      description: "Trial balance grid by account with debit/credit totals, period filters and export. For reviewing the balance before period close.",
      descriptionFr: "Grille de la balance générale par compte avec totaux débit/crédit, filtres par période et export. Pour la revue de la balance avant clôture."
    },
    {
      slug: "factures-fournisseurs",
      name: "Supplier Invoices",
      nameFr: "Factures fournisseurs",
      domain: "Accounting",
      domainFr: "Comptabilité",
      status: "available",
      description: "Filterable supplier invoice list with approval status, due dates and document upload. For processing and approving payables.",
      descriptionFr: "Liste filtrable des factures fournisseurs avec statut de validation, échéances et téléversement de pièces. Pour le traitement et l'approbation des factures à payer."
    },
    {
      slug: "run-paiements",
      name: "Payment Run",
      nameFr: "Lot de paiements",
      domain: "Accounting",
      domainFr: "Comptabilité",
      status: "available",
      description: "Step-by-step wizard to prepare a payment batch: invoice selection, bank account choice, validation and execution. For scheduling supplier payouts.",
      descriptionFr: "Assistant pas-à-pas pour préparer un lot de paiements : sélection des factures, choix du compte bancaire, validation et exécution. Pour ordonnancer les règlements fournisseurs."
    },
    {
      slug: "rapprochement-bancaire",
      name: "Bank Reconciliation",
      nameFr: "Rapprochement bancaire",
      domain: "Accounting",
      domainFr: "Comptabilité",
      status: "available",
      description: "Two-pane view matching bank statement lines against ledger entries, with match suggestions and residual balance. For clearing and reconciling transactions.",
      descriptionFr: "Vue en deux volets confrontant les lignes du relevé bancaire aux écritures comptables, avec suggestions de correspondance et solde résiduel. Pour lettrer et rapprocher les opérations."
    },
    {
      slug: "employee-directory",
      name: "Employee Directory",
      nameFr: "Annuaire des employes",
      domain: "HR",
      domainFr: "RH",
      status: "available",
      description: "Filterable employee list: search, department and status filters, dense table with avatar, status badge and pagination. For browsing and qualifying headcount.",
      descriptionFr: "Liste filtrable des employes : recherche, filtres par departement et statut, table dense avec avatar, badge de statut et pagination. Pour parcourir et qualifier l'effectif."
    },
    {
      slug: "employee-profile",
      name: "Employee Profile",
      nameFr: "Fiche employe",
      domain: "HR",
      domainFr: "RH",
      status: "available",
      description: "Detailed employee record: avatar and identity header, KPI cards (tenure, leave balance), Information / Contract / Documents tabs with fields and history. For viewing and editing an individual file.",
      descriptionFr: "Fiche detaillee d'un employe : en-tete avatar et identite, cartes KPI (anciennete, solde de conges), onglets Informations / Contrat / Documents avec champs et historique. Pour consulter et editer un dossier individuel."
    },
    {
      slug: "leave-attendance",
      name: "Leave & Attendance",
      nameFr: "Conges et presences",
      domain: "HR",
      domainFr: "RH",
      status: "available",
      description: "Leave and attendance tracking: balance and presence-rate KPIs, distribution and trend charts, request approval table with status badges and a date-range picker. For managing absences and approvals.",
      descriptionFr: "Suivi des conges et presences : KPI de solde et taux de presence, graphiques de repartition et tendance, table des demandes a valider avec badges de statut et selecteur de periode. Pour piloter absences et approbations."
    },
    {
      slug: "sprint-backlog",
      name: "Sprint Backlog",
      nameFr: "Backlog de sprint",
      domain: "Project",
      domainFr: "Projet",
      status: "available",
      description: "Prioritized list of sprint stories with team capacity, point estimates and burn-down progress. Header with sprint selector and capacity bar, followed by an ordered, draggable table of stories with status and priority badges.",
      descriptionFr: "Liste priorisee des stories du sprint avec capacite d'equipe, estimation en points et progression. En-tete avec selecteur de sprint et barre de capacite, suivie d'un tableau de stories ordonnancees et glissables avec badges de statut et de priorite."
    },
    {
      slug: "roadmap-timeline",
      name: "Roadmap Timeline",
      nameFr: "Feuille de route",
      domain: "Project",
      domainFr: "Projet",
      status: "available",
      description: "Timeline view of epics and milestones by quarter with team and status filters. Milestone stepper at the top, epic cards with progress bars, and a cumulative velocity chart.",
      descriptionFr: "Vue chronologique des epics et jalons par trimestre avec filtres d'equipe et de statut. Stepper de jalons en tete, cartes d'epics avec barres d'avancement et graphique de velocite cumulee."
    },
    {
      slug: "sla-monitor",
      name: "SLA Monitor",
      nameFr: "Suivi des SLA",
      domain: "Project",
      domainFr: "Projet",
      status: "available",
      description: "Ticket SLA compliance dashboard: on-time KPIs, breakdown by severity, and a data grid of at-risk or breached tickets. Alerts for imminent breaches with queue and priority filters.",
      descriptionFr: "Tableau de bord de conformite SLA des tickets : KPI de respect des delais, repartition par severite et grille des tickets a risque ou en depassement. Alertes pour les violations imminentes et filtres par file et priorite."
    },
    {
      slug: "work-order-board",
      name: "Work Orders",
      nameFr: "Ordres de fabrication",
      domain: "Manufacturing",
      domainFr: "Production",
      status: "available",
      description: "Filterable list of work orders with progress, status and priority. Shop-floor KPIs on top, filters by line and period, dense table with progress bars. For managing the daily production backlog.",
      descriptionFr: "Liste filtrable des ordres de fabrication avec avancement, statut et priorite. KPI d'atelier en tete, filtres par ligne et periode, table dense avec barres de progression. Pour piloter le carnet de production au quotidien."
    },
    {
      slug: "routing-builder",
      name: "Routing Builder",
      nameFr: "Gamme operatoire",
      domain: "Manufacturing",
      domainFr: "Production",
      status: "available",
      description: "Routing editor for an item: operation sequence as an ordered list, work center, time and tooling per step. Header / operations / bill-of-materials tabs, editable configuration cards. For defining the manufacturing process.",
      descriptionFr: "Editeur de gamme operatoire pour un article : sequence d'operations en liste ordonnee, poste de charge, temps et outillage par etape. Onglets entete / operations / nomenclature, fiches de configuration editables. Pour definir le processus de fabrication."
    },
    {
      slug: "quality-inspection",
      name: "Quality Inspection",
      nameFr: "Controle qualite",
      domain: "Manufacturing",
      domainFr: "Production",
      status: "available",
      description: "Multi-step quality control record: batch selection, measurement entry, pass / fail verdict and certificate attachment. Conformity score, defect breakdown and non-conformance alert. For signing off quality at the end of an operation.",
      descriptionFr: "Releve de controle qualite en plusieurs etapes : selection du lot, saisie des mesures, verdict conforme / non-conforme et piece jointe du certificat. Score de conformite, repartition des defauts et alerte de non-conformite. Pour valider la qualite en fin d'operation."
    },
    {
      slug: "notification-center",
      name: "Notification Center",
      nameFr: "Centre de notifications",
      domain: "Transversal",
      domainFr: "Transversal",
      status: "available",
      description: "Unified inbox: category tabs, notification list with avatar and status badge, filters and bulk actions (mark all as read). For centralizing alerts, mentions and system events.",
      descriptionFr: "Inbox unifiee : onglets par categorie, liste de notifications avec avatar et badge de statut, filtres et actions groupees (tout marquer comme lu). Pour centraliser alertes, mentions et evenements systeme."
    },
    {
      slug: "user-preferences",
      name: "User Preferences",
      nameFr: "Preferences utilisateur",
      domain: "Transversal",
      domainFr: "Transversal",
      status: "available",
      description: "Preferences page: profile card with avatar, language/timezone/format settings via selects, per-category notification channels and configuration cards. For personalizing account and notifications.",
      descriptionFr: "Page de preferences : carte profil avec avatar, reglages langue/fuseau/format via selects, canaux de notification par categorie et fiches de configuration. Pour personnaliser compte et notifications."
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
