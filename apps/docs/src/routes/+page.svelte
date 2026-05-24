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

  <section class="docs-section" id="cli">
    <h2>{t(locale.value, "cliSectionTitle")}</h2>
    <p>{t(locale.value, "cliSectionIntro")}</p>
    <div class="docs-cli-grid">
      <div class="docs-cli-card">
        <div class="docs-cli-card-head">
          <code class="docs-cli-command">design init</code>
          <Badge tone="neutral">Strategic</Badge>
        </div>
        <p class="docs-cli-card-desc">
          {locale.value === "fr"
            ? "Configure le contexte de marque (PRODUCT.md) et fige les tokens existants (DESIGN.md)."
            : "Sets up the strategic brand context (PRODUCT.md) and extracts real tokens (DESIGN.md)."}
        </p>
      </div>

      <div class="docs-cli-card">
        <div class="docs-cli-card-head">
          <code class="docs-cli-command">design build</code>
          <Badge tone="success">Creation</Badge>
        </div>
        <p class="docs-cli-card-desc">
          {locale.value === "fr"
            ? "Zoning et ergonomie amont (--propose), suivi de la génération de code Svelte 5 / CSS (craft)."
            : "Ergonomic zoning and planning (--propose), followed by robust Svelte 5 / CSS code generation (craft)."}
        </p>
      </div>

      <div class="docs-cli-card">
        <div class="docs-cli-card-head">
          <code class="docs-cli-command">design check</code>
          <Badge tone="warning">Diagnostics</Badge>
        </div>
        <p class="docs-cli-card-desc">
          {locale.value === "fr"
            ? "Diagnostics techniques déterministes (--tech) et évaluation qualitative Nielsen par IA (--human)."
            : "Deterministic technical scans (--tech) and advanced Nielsen qualitative UX review by AI (--human)."}
        </p>
      </div>

      <div class="docs-cli-card">
        <div class="docs-cli-card-head">
          <code class="docs-cli-command">design align</code>
          <Badge tone="info">Fondations</Badge>
        </div>
        <p class="docs-cli-card-desc">
          {locale.value === "fr"
            ? "Calibrage physique strict (tones OKLCH, spacing grille, hiérarchie typo, a11y focus/targets 44px, responsive)."
            : "Strict physical calibration (OKLCH tones, grid spacing, typo hierarchy, a11y focus/44px targets, responsive)."}
        </p>
      </div>

      <div class="docs-cli-card">
        <div class="docs-cli-card-head">
          <code class="docs-cli-command">design polish</code>
          <Badge tone="success">Finesse</Badge>
        </div>
        <p class="docs-cli-card-desc">
          {locale.value === "fr"
            ? "Ajustements de finesse créative (motion Svelte, régulation de volume, spark cinétique, charm émotionnel, lucid microcopy, essence DOM)."
            : "Creative finishing (Svelte motion, volume regulation, kinetic spark, emotional charm, lucid microcopy, essence DOM)."}
        </p>
      </div>
    </div>

    <div class="docs-cli-didactic">
      {@html t(locale.value, "cliSectionQuestion")}
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
    height: 100%;
    outline: none;
  }

  .docs-catalog-card-link :global(.st-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.75rem !important; /* Premium rounded corner styling */
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02), 0 2px 4px -1px rgba(15, 23, 42, 0.01), 0 0 0 1px rgba(15, 23, 42, 0.02);
    position: relative;
    overflow: hidden;
    transition: 
      transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 320ms cubic-bezier(0.16, 1, 0.3, 1),
      background-color 320ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Subtly tinted background gradient on hover for components cards */
  .docs-catalog-card-link :global(.st-card::before) {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 100% 0%, oklch(0.96 0.03 260 / 0.12) 0%, transparent 65%);
    opacity: 0;
    transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    z-index: 1;
  }

  .docs-catalog-card-link:hover :global(.st-card),
  .docs-catalog-card-link:focus-visible :global(.st-card) {
    transform: translateY(-4px) scale(1.02);
    border-color: var(--docs-accent, #0043ce);
    box-shadow: 
      0 20px 25px -5px rgba(0, 67, 206, 0.04), 
      0 10px 10px -5px rgba(0, 67, 206, 0.02), 
      0 0 0 1px oklch(0.45 0.2 260 / 12%);
    background-color: oklch(0.99 0.002 245);
  }

  .docs-catalog-card-link:hover :global(.st-card::before),
  .docs-catalog-card-link:focus-visible :global(.st-card::before) {
    opacity: 1;
  }

  .docs-catalog-card-link .docs-catalog-card-name {
    position: relative;
    z-index: 2;
    transition: color 250ms ease;
  }

  .docs-catalog-card-link:hover .docs-catalog-card-name,
  .docs-catalog-card-link:focus-visible .docs-catalog-card-name {
    color: var(--docs-accent, #0043ce);
  }

  .docs-catalog-card-link :global(.st-card .st-badge) {
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 2;
  }

  .docs-catalog-card-link:hover :global(.st-card .st-badge),
  .docs-catalog-card-link:focus-visible :global(.st-card .st-badge) {
    transform: scale(1.05);
  }

  .docs-catalog-card-desc {
    position: relative;
    z-index: 2;
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }

  .docs-cli-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
    margin-bottom: 2rem;
  }

  .docs-cli-card {
    background: var(--st-semantic-surface-card, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.75rem; /* Harmonized corner radius */
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02), 0 2px 4px -1px rgba(15, 23, 42, 0.01), 0 0 0 1px rgba(15, 23, 42, 0.02);
    transition: 
      transform 320ms cubic-bezier(0.16, 1, 0.3, 1), 
      box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 320ms cubic-bezier(0.16, 1, 0.3, 1),
      background-color 320ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Micro border activation line on hover for CLI cards */
  .docs-cli-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #8b5cf6);
    opacity: 0;
    transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .docs-cli-card:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: oklch(0.6 0.18 260 / 20%);
    box-shadow: 
      0 20px 25px -5px rgba(37, 99, 235, 0.04), 
      0 10px 10px -5px rgba(37, 99, 235, 0.02),
      0 0 0 1px oklch(0.6 0.18 260 / 10%);
    background-color: oklch(0.99 0.002 250);
  }

  .docs-cli-card:hover::after {
    opacity: 1;
  }

  .docs-cli-card-head {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    margin-bottom: 0.85rem;
  }

  .docs-cli-command {
    font-family: var(--st-foundation-font-mono, monospace);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--st-semantic-text-accent, #2563eb);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 0.15rem 0.45rem;
    border-radius: 0.25rem;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    transition: 
      color 240ms cubic-bezier(0.16, 1, 0.3, 1), 
      background-color 240ms cubic-bezier(0.16, 1, 0.3, 1), 
      border-color 240ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
    display: inline-block;
  }

  .docs-cli-card:hover .docs-cli-command {
    color: #ffffff;
    background-color: var(--st-semantic-text-accent, #2563eb);
    border-color: var(--st-semantic-text-accent, #2563eb);
    transform: scale(1.03);
  }

  .docs-cli-card-desc {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.9rem;
    line-height: 1.55;
    margin: 0;
  }

  .docs-cli-didactic {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-left: 4px solid var(--st-semantic-text-accent, #2563eb);
    border-radius: 0 0.5rem 0.5rem 0;
    padding: 1.15rem 1.5rem;
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--st-semantic-text-secondary, #475569);
    margin-top: 1.5rem;
  }
</style>
