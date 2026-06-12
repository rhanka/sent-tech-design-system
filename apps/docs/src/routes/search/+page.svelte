<script lang="ts">
  // DÉMO LOCALE (non committée) : monte le module DocsSearch (PR #24) pour
  // visualiser la recherche docs propulsée chat-ui dans le chrome du site.
  import DocsSearch from "$lib/chat/DocsSearch.svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
</script>

<svelte:head>
  <title>{fr ? "Recherche" : "Search"} · Sent Tech Design System</title>
</svelte:head>

<section class="docs-search-page">
  <header class="docs-search-page__head">
    <h1>{fr ? "Recherche de la documentation" : "Documentation search"}</h1>
    <p>
      {fr
        ? "Démo du module DocsSearch (template « Read the Docs ») : recherche lexicale instantanée sur le catalogue + escalade conversationnelle propulsée chat-ui."
        : "DocsSearch module demo (Read the Docs template): instant lexical search over the catalog + conversational escalation powered by chat-ui."}
    </p>
  </header>

  <DocsSearch />
</section>

<style>
  .docs-search-page {
    max-width: 56rem;
    margin: 0 auto;
    padding: var(--st-spacing-8, 2rem) var(--st-spacing-6, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
  }
  .docs-search-page__head h1 {
    margin: 0 0 var(--st-spacing-2, 0.5rem);
    color: var(--st-semantic-text-primary);
    font-size: var(--st-font-size-2xl, 1.75rem);
  }
  .docs-search-page__head p {
    margin: 0;
    color: var(--st-semantic-text-secondary);
    max-width: 46rem;
  }
</style>
