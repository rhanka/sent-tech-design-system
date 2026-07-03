<script lang="ts">
  import { Card, Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  interface LayoutEntry {
    slug: string;
    nameFr: string;
    nameEn: string;
    categoryFr: string;
    categoryEn: string;
    status: "available" | "soon";
    descriptionFr: string;
    descriptionEn: string;
  }

  const LAYOUTS: LayoutEntry[] = [
    {
      slug: "sidebar-content",
      nameFr: "Sidebar + contenu",
      nameEn: "Sidebar + content",
      categoryFr: "Workspace B2B",
      categoryEn: "B2B Workspace",
      status: "available",
      descriptionFr: "Chrome applicatif en haut, navigation latérale persistante à gauche, zone de contenu principale à droite. Le gabarit B2B le plus courant pour les pages d'admin.",
      descriptionEn: "App chrome on top, persistent left sidebar, main content area on the right. The most common B2B layout for admin pages."
    },
    {
      slug: "rail-nav-panel",
      nameFr: "Rail + panneau de navigation",
      nameEn: "Rail + nav panel",
      categoryFr: "Workspace dense",
      categoryEn: "Dense workspace",
      status: "available",
      descriptionFr: "Rail vertical d'icônes (modules premier niveau) + panneau contextuel (sous-arbre du module actif) + contenu. Idéal pour les apps à forte densité fonctionnelle.",
      descriptionEn: "Vertical icon rail (top-level modules) + contextual panel (active module sub-tree) + content. Ideal for feature-dense apps."
    },
    {
      slug: "dashboard-3-panels",
      nameFr: "Dashboard 3 panneaux",
      nameEn: "3-panel dashboard",
      categoryFr: "CRM / Éditeur",
      categoryEn: "CRM / Editor",
      status: "available",
      descriptionFr: "Navigation à gauche, liste au centre, panneau de contexte (inspecteur/propriétés) à droite. Convient aux apps CRM, éditeur ou data-room.",
      descriptionEn: "Left nav, center list, right context panel (inspector/properties). Suited to CRM, editor, or data-room apps."
    },
    {
      slug: "analytics-grid",
      nameFr: "Grille analytique",
      nameEn: "Analytics grid",
      categoryFr: "Analytics / BI",
      categoryEn: "Analytics / BI",
      status: "available",
      descriptionFr: "Chrome + grille de tuiles (KPI, graphiques, tableaux) sur 12 colonnes. Layout statique ou éditable via DashboardGrid. Pour les dashboards BI et le monitoring.",
      descriptionEn: "Chrome + tile grid (KPIs, charts, tables) on 12 columns. Static or editable layout via DashboardGrid. For BI dashboards and monitoring."
    },
    {
      slug: "list-event-feed",
      nameFr: "Liste + flux d'événements",
      nameEn: "List + event feed",
      categoryFr: "Console ops / Support",
      categoryEn: "Ops console / Support",
      status: "available",
      descriptionFr: "Navigation à gauche, liste au centre, panneau utilitaire (flux d'événements, journal) réservé ou overlay à droite. Pour les consoles de supervision et support.",
      descriptionEn: "Left nav, center list, right utility panel (event feed, log) in reserved or overlay mode. For monitoring and support consoles."
    },
    {
      slug: "marketing-fullwidth",
      nameFr: "Site marketing pleine largeur",
      nameEn: "Full-width marketing site",
      categoryFr: "Site public",
      categoryEn: "Public site",
      status: "available",
      descriptionFr: "Header pleine largeur, sections de contenu centrées dans un Container, Grid responsive et Footer multi-colonnes. Pour les pages publiques et landing pages.",
      descriptionEn: "Full-width header, content sections centered in a Container, responsive Grid, and multi-column Footer. For public pages and landing pages."
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Design System · Sentropic" : "Design System · Sentropic"}</p>
    <h1>{fr ? "Gabarits" : "Templates"}</h1>
    <p>
      {#if fr}
        Assemblages réutilisables prêts à l'emploi : chaque gabarit combine les composants du DS
        en une page neutre métier, testée et documentée. Un seul <code>NodeSpec</code> → rendu identique
        en Svelte, React, Vue et Angular.
      {:else}
        Ready-to-use templates: each one combines DS components into a business-neutral, tested,
        documented page. One <code>NodeSpec</code> → identical render in Svelte, React,
        Vue, and Angular.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <div class="layouts-grid">
      {#each LAYOUTS as layout (layout.slug)}
        <a class="layouts-card-link" href="/layouts/{layout.slug}">
          <Card class="layouts-card">
            <div class="layouts-card-header">
              <span class="layouts-card-category">
                {fr ? layout.categoryFr : layout.categoryEn}
              </span>
              <Badge tone={layout.status === "available" ? "success" : "neutral"}>
                {layout.status === "available"
                  ? (fr ? "Disponible" : "Available")
                  : (fr ? "Bientôt" : "Coming soon")}
              </Badge>
            </div>
            <h2 class="layouts-card-name">{fr ? layout.nameFr : layout.nameEn}</h2>
            <p class="layouts-card-desc">{fr ? layout.descriptionFr : layout.descriptionEn}</p>
          </Card>
        </a>
      {/each}
    </div>
  </section>
</div>

<style>
  .layouts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .layouts-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .layouts-card-link:hover :global(.layouts-card) {
    border-color: var(--st-semantic-color-brand, #6366f1);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--st-semantic-color-brand, #6366f1) 12%, transparent);
  }

  .layouts-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .layouts-card-category {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--st-semantic-text-tertiary, #94a3b8);
  }

  .layouts-card-name {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.4rem;
    color: var(--st-semantic-text-primary, #0f172a);
    line-height: 1.3;
  }

  .layouts-card-desc {
    margin: 0;
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #475569);
    line-height: 1.55;
  }
</style>
