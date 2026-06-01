<script lang="ts">
  import { goto } from "$app/navigation";
  import { Alert, Badge, Link } from "@sentropic/design-system-svelte";
  import { onMount } from "svelte";
  import { CATEGORY_LABELS } from "$lib/components-catalog";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let { data } = $props();

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

  const text = $derived(copy[locale.value]);

  onMount(() => {
    if (data.redirectTo) {
      goto(data.redirectTo, { replaceState: true });
    }
  });
</script>

<svelte:head>
  {#if data.redirectTo}
    <meta http-equiv="refresh" content={`0; url=${data.redirectTo}`} />
    <link rel="canonical" href={data.redirectTo} />
  {/if}
</svelte:head>

{#if data.redirectTo}
  <div class="docs-page">
    <section class="docs-hero">
      <p class="docs-hero-kicker">Composant · {CATEGORY_LABELS[data.component.category][locale.value]}</p>
      <h1>{data.component.name}</h1>
      <p>Cette documentation est regroupée dans la page de famille du composant.</p>
      <p><Link href={data.redirectTo}>Ouvrir la page documentée</Link></p>
    </section>
  </div>
{:else}
<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {CATEGORY_LABELS[data.component.category][locale.value]}</p>
    <div class="docs-hero-title">
      <h1>{data.component.name}</h1>
      <Badge tone="neutral">{text.stubBadge}</Badge>
    </div>
    <p>{data.component.description[locale.value]}</p>
    <p class="docs-stub-meta">
      <span>{text.categoryLabel}: <strong>{CATEGORY_LABELS[data.component.category][locale.value]}</strong></span>
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
    <h2>{t(locale.value, "apiTitle")}</h2>
    <p>{text.alertMessage}</p>
  </section>
</div>
{/if}

<style>
  .docs-stub-meta {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.95rem;
    margin: 0;
  }
</style>
