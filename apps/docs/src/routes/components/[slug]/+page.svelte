<script lang="ts">
  import { Alert, Badge, Link } from "@sentropic/design-system-svelte";
  import { CATEGORY_LABELS } from "$lib/components-catalog";
  import { t, type Locale } from "$lib/i18n";

  let { data } = $props();
  let locale = $state<Locale>("fr");

  const sourceUrl = $derived(
    `https://github.com/rhanka/sent-tech-design-system/blob/main/packages/components-svelte/src/lib/${data.component.name}.svelte`
  );

  const copy = {
    fr: {
      stubBadge: "À documenter",
      intro: "Cette page est un stub. Le composant est livré et exporté depuis le DS, mais sa documentation détaillée (états, variantes, props, tokens) reste à écrire.",
      alertTitle: "Documentation à compléter",
      alertMessage:
        "En attendant, lisez la source pour découvrir l’API (props typés et tokens consommés).",
      sourceLabel: "Voir la source sur GitHub",
      categoryLabel: "Catégorie",
      backHome: "Retour au catalogue"
    },
    en: {
      stubBadge: "To document",
      intro: "This page is a stub. The component is shipped and exported from the DS, but its detailed documentation (states, variants, props, tokens) is still pending.",
      alertTitle: "Documentation pending",
      alertMessage: "In the meantime, read the source to discover the API (typed props and consumed tokens).",
      sourceLabel: "View source on GitHub",
      categoryLabel: "Category",
      backHome: "Back to catalog"
    }
  } as const;

  const text = $derived(copy[locale]);
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>
      {data.component.name}
      <Badge tone="neutral">{text.stubBadge}</Badge>
    </h1>
    <p>{data.component.description}</p>
    <p class="docs-stub-meta">
      <span>{text.categoryLabel}: <strong>{CATEGORY_LABELS[data.component.category][locale]}</strong></span>
    </p>
  </section>

  <section class="docs-section">
    <Alert tone="info" title={text.alertTitle} message={text.intro} />
  </section>

  <section class="docs-section">
    <h2>{text.alertMessage}</h2>
    <ul class="docs-token-list">
      <li>
        <Link href={sourceUrl} external>{text.sourceLabel}</Link>
      </li>
      <li>
        <Link href="/">{text.backHome}</Link>
      </li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <p>{text.alertMessage}</p>
  </section>
</div>

<style>
  .docs-stub-meta {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    margin: 0;
  }
</style>
