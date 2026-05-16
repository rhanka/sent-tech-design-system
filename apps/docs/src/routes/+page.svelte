<script lang="ts">
  import { Badge, Card } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";
  import {
    CATEGORY_LABELS,
    COMPONENTS,
    componentHref,
    groupByCategory
  } from "$lib/components-catalog";

  let locale = $state<Locale>("fr");

  const groups = groupByCategory(COMPONENTS);
  const total = COMPONENTS.length;
  const documented = COMPONENTS.filter((c) => c.status === "documented").length;

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
    <h1>{t(locale, "title")}</h1>
    <p>{t(locale, "subtitle")}</p>
    <p class="docs-hero-meta">{summary}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "overview")}</h2>
    <p>{t(locale, "overviewBody")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "components")}</h2>
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

  <section class="docs-section">
    <h2>{t(locale, "tokenPolicyTitle")}</h2>
    <p>{t(locale, "tokenPolicyBody")}</p>
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
    letter-spacing: 0.04em;
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
