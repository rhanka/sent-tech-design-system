<script lang="ts">
  import { Badge, Card } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";
  import {
    CATEGORY_LABELS,
    COMPONENTS,
    componentHref,
    groupByCategory
  } from "$lib/components-catalog";
  import { DOCS_VERSION } from "$lib/docs-navigation";

  let locale = $state<Locale>("fr");

  const groups = groupByCategory(COMPONENTS);
  const total = COMPONENTS.length;
  const documented = COMPONENTS.filter((c) => c.status === "documented").length;
  const pending = total - documented;

  const summary = $derived(
    locale === "fr"
      ? `${total} composants exportés · ${documented} documentés en détail`
      : `${total} exported components · ${documented} fully documented`
  );

  const stubLabel = (loc: Locale) => (loc === "fr" ? "À documenter" : "To document");
  const documentedLabel = (loc: Locale) => (loc === "fr" ? "Documenté" : "Documented");
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <p class="docs-hero-kicker">SENT-tech · Product design infrastructure</p>
    <h1>{t(locale, "title")}</h1>
    <p>{t(locale, "subtitle")}</p>
    <p class="docs-hero-meta">{summary}</p>
    <div class="docs-hero-actions">
      <a class="docs-button-link" href="#components">{t(locale, "components")}</a>
      <a class="docs-button-link docs-button-link--secondary" href="#contracts">{t(locale, "tokenPolicyTitle")}</a>
    </div>
  </section>

  <section class="docs-section" id="foundations">
    <h2>{t(locale, "overview")}</h2>
    <p>{t(locale, "overviewBody")}</p>
    <div class="docs-metric-grid" aria-label="Documentation status">
      <div class="docs-metric">
        <strong>{DOCS_VERSION}</strong>
        <span>release publiée</span>
      </div>
      <div class="docs-metric">
        <strong>{total}</strong>
        <span>composants Svelte exportés</span>
      </div>
      <div class="docs-metric">
        <strong>{documented}</strong>
        <span>pages documentées en détail</span>
      </div>
      <div class="docs-metric">
        <strong>{pending}</strong>
        <span>stubs à compléter</span>
      </div>
    </div>
    <div class="docs-foundation-grid">
      <div class="docs-foundation-item">
        <h3>Tokens sémantiques</h3>
        <span>Surface, texte, bordures, actions, feedback et statuts sont exposés comme contrat stable.</span>
      </div>
      <div class="docs-foundation-item">
        <h3>Thèmes tenant</h3>
        <span>Sent Tech, Forge et Entropic partagent la même API de thème et restent remplaçables.</span>
      </div>
      <div class="docs-foundation-item">
        <h3>Composants Svelte</h3>
        <span>Les primitives restent découplées du produit et prêtes pour Forge, Onyxia et Chat UI.</span>
      </div>
    </div>
  </section>

  <section class="docs-section" id="components">
    <h2>{t(locale, "components")}</h2>
    <p>Catalogue opérationnel des exports `@sentropic/design-system-svelte`, groupé par usage pour retrouver vite le composant et son niveau de documentation.</p>
    {#each groups as group (group.category)}
      <div class="docs-catalog-group">
        <h3 class="docs-catalog-group-title">{CATEGORY_LABELS[group.category][locale]}</h3>
        <div class="docs-catalog-grid">
          {#each group.components as component (component.slug)}
            <a class="docs-catalog-card-link" href={componentHref(component)}>
              <Card interactive>
                <div class="docs-catalog-card-head">
                  <span class="docs-catalog-card-name">{component.name}</span>
                  {#if component.status === "documented"}
                    <Badge tone="success">{documentedLabel(locale)}</Badge>
                  {:else}
                    <Badge tone="neutral">{stubLabel(locale)}</Badge>
                  {/if}
                </div>
                <p class="docs-catalog-card-desc">{component.description}</p>
              </Card>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  <section class="docs-section" id="tokens">
    <h2>Tokens</h2>
    <p>Le design system publie des tokens foundation, semantic et component. Les composants ne consomment pas les couleurs brutes: ils lisent les variables sémantiques et les component tokens.</p>
    <div class="docs-contract-grid">
      <div class="docs-contract-item">
        <h3>Foundation</h3>
        <span>Palette, typographie et échelles de base.</span>
      </div>
      <div class="docs-contract-item">
        <h3>Semantic</h3>
        <span>Surface, texte, action, feedback, statut.</span>
      </div>
      <div class="docs-contract-item">
        <h3>Component</h3>
        <span>Variables propres aux composants et aux patterns produit.</span>
      </div>
    </div>
  </section>

  <section class="docs-section" id="themes">
    <h2>Thèmes</h2>
    <p>Le package `@sentropic/design-system-themes` expose les thèmes Sent Tech, Forge et Entropic. Les consommateurs peuvent utiliser le `ThemeProvider` Svelte ou le CSS build-time selon leur intégration.</p>
  </section>

  <section class="docs-section" id="contracts">
    <h2>{t(locale, "tokenPolicyTitle")}</h2>
    <p>{t(locale, "tokenPolicyBody")}</p>
    <div class="docs-contract-grid">
      <div class="docs-contract-item">
        <h3>Applications produit</h3>
        <span>Import des composants Svelte et du thème tenant, sans logique métier dans le DS.</span>
      </div>
      <div class="docs-contract-item">
        <h3>Thèmes externes</h3>
        <span>Mapping CSS ou runtime depuis les variables sémantiques existantes.</span>
      </div>
      <div class="docs-contract-item">
        <h3>Chat UI Sentropic</h3>
        <span>Contrat `entropicTheme`, tokens chat et styles consommables sans fork produit.</span>
      </div>
    </div>
  </section>
</div>

<style>
  .docs-hero-meta {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    margin: 0;
  }

  .docs-catalog-group {
    display: grid;
    gap: 0.75rem;
  }

  .docs-catalog-group-title {
    font-size: 1rem;
    margin: 0;
    text-transform: uppercase;
    color: var(--st-semantic-text-secondary, #475569);
  }

  .docs-catalog-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  }

  .docs-catalog-card-link {
    color: inherit;
    display: block;
    text-decoration: none;
  }

  .docs-catalog-card-link:hover,
  .docs-catalog-card-link:focus-visible {
    text-decoration: none;
  }

  .docs-catalog-card-head {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .docs-catalog-card-name {
    font-weight: 600;
  }

  .docs-catalog-card-desc {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.9rem;
    line-height: 1.45;
    margin: 0;
  }
</style>
