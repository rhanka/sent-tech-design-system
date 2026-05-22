<script lang="ts">
  import { Badge, Card } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import {
    CATEGORY_LABELS,
    COMPONENTS,
    componentHref,
    groupByCategory
  } from "$lib/components-catalog";
  import { DOCS_VERSION } from "$lib/docs-navigation";

  const groups = groupByCategory(COMPONENTS);
  const total = COMPONENTS.length;
  const documented = COMPONENTS.filter((c) => c.status === "documented").length;
  const pending = total - documented;

  const summary = $derived(
    locale.value === "fr"
      ? `${total} composants exportés · ${documented} documentés en détail`
      : `${total} exported components · ${documented} fully documented`
  );

  const stubLabel = (loc: Locale) => (loc === "fr" ? "À documenter" : "To document");
  const documentedLabel = (loc: Locale) => (loc === "fr" ? "Documenté" : "Documented");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "homeHeroKicker")}</p>
    <h1>{t(locale.value, "title")}</h1>
    <p>{t(locale.value, "subtitle")}</p>
    <p class="docs-hero-meta">{summary}</p>
    <div class="docs-hero-actions">
      <a class="docs-button-link" href="#components">{t(locale.value, "components")}</a>
      <a class="docs-button-link docs-button-link--secondary" href="#contracts">{t(locale.value, "tokenPolicyTitle")}</a>
    </div>
  </section>

  <section class="docs-section" id="foundations">
    <h2>{t(locale.value, "overview")}</h2>
    <p>{t(locale.value, "overviewBody")}</p>
    <div class="docs-metric-grid" aria-label="Documentation status">
      <div class="docs-metric">
        <strong>{DOCS_VERSION}</strong>
        <span>{t(locale.value, "metricReleasePublished")}</span>
      </div>
      <div class="docs-metric">
        <strong>{total}</strong>
        <span>{t(locale.value, "metricExportedComponents")}</span>
      </div>
      <div class="docs-metric">
        <strong>{documented}</strong>
        <span>{t(locale.value, "metricDocumented")}</span>
      </div>
      <div class="docs-metric">
        <strong>{pending}</strong>
        <span>{t(locale.value, "metricStubs")}</span>
      </div>
    </div>
    <div class="docs-foundation-grid">
      <div class="docs-foundation-item">
        <h3>{t(locale.value, "foundationSemanticTokensTitle")}</h3>
        <span>{t(locale.value, "foundationSemanticTokensBody")}</span>
      </div>
      <div class="docs-foundation-item">
        <h3>{t(locale.value, "foundationTenantThemesTitle")}</h3>
        <span>{t(locale.value, "foundationTenantThemesBody")}</span>
      </div>
      <div class="docs-foundation-item">
        <h3>{t(locale.value, "foundationSvelteComponentsTitle")}</h3>
        <span>{t(locale.value, "foundationSvelteComponentsBody")}</span>
      </div>
    </div>
  </section>

  <section class="docs-section" id="components">
    <h2>{t(locale.value, "components")}</h2>
    <p>{t(locale.value, "componentsCatalogIntro")}</p>
    {#each groups as group (group.category)}
      <div class="docs-catalog-group">
        <h3 class="docs-catalog-group-title">{CATEGORY_LABELS[group.category][locale.value]}</h3>
        <div class="docs-catalog-grid">
          {#each group.components as component (component.slug)}
            <a class="docs-catalog-card-link" href={componentHref(component)}>
              <Card interactive>
                <div class="docs-catalog-card-head">
                  <span class="docs-catalog-card-name">{component.name}</span>
                  {#if component.status === "documented"}
                    <Badge tone="success">{documentedLabel(locale.value)}</Badge>
                  {:else}
                    <Badge tone="neutral">{stubLabel(locale.value)}</Badge>
                  {/if}
                </div>
                <p class="docs-catalog-card-desc">{component.description[locale.value]}</p>
              </Card>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  <section class="docs-section" id="tokens">
    <h2>{t(locale.value, "tokensSectionTitle")}</h2>
    <p>{t(locale.value, "tokensSectionIntro")}</p>
    <div class="docs-contract-grid">
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractFoundationTitle")}</h3>
        <span>{t(locale.value, "contractFoundationBody")}</span>
      </div>
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractSemanticTitle")}</h3>
        <span>{t(locale.value, "contractSemanticBody")}</span>
      </div>
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractComponentTitle")}</h3>
        <span>{t(locale.value, "contractComponentBody")}</span>
      </div>
    </div>
  </section>

  <section class="docs-section" id="themes">
    <h2>{t(locale.value, "themesSectionTitle")}</h2>
    <p>{t(locale.value, "themesSectionIntro")}</p>
  </section>

  <section class="docs-section" id="contracts">
    <h2>{t(locale.value, "tokenPolicyTitle")}</h2>
    <p>{t(locale.value, "tokenPolicyBody")}</p>
    <div class="docs-contract-grid">
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractProductAppsTitle")}</h3>
        <span>{t(locale.value, "contractProductAppsBody")}</span>
      </div>
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractExternalThemesTitle")}</h3>
        <span>{t(locale.value, "contractExternalThemesBody")}</span>
      </div>
      <div class="docs-contract-item">
        <h3>{t(locale.value, "contractChatUiTitle")}</h3>
        <span>{t(locale.value, "contractChatUiBody")}</span>
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
    gap: 1rem;
  }

  .docs-catalog-group-title {
    font-size: 1rem;
    margin: 0;
    text-transform: uppercase;
    color: var(--st-semantic-text-secondary, #475569);
  }

  .docs-catalog-grid {
    display: grid;
    gap: 1.15rem;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
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
    gap: 0.75rem;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .docs-catalog-card-name {
    font-weight: 600;
  }

  .docs-catalog-card-desc {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }
</style>
