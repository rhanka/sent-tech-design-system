<script lang="ts">
  // ───────────────────────────────────────────────────────────────────────────
  // DocsSearch : recherche du contenu docs propulsée chat-ui (scaffold).
  //
  // Wrapper au-dessus de deux briques existantes :
  //   - le composant `Search` du DS (champ de recherche tokenisé) ;
  //   - le contrat chat du ChatWidget (`sendChatMessage`, chat-config.ts).
  //
  // Deux étages :
  //   1. Recherche LEXICALE instantanée sur l'index statique (docs-search-index) ;
  //   2. Escalade CONVERSATIONNELLE optionnelle : la question + les meilleurs
  //      résultats partent au même endpoint que le ChatWidget, qui répond en
  //      langage naturel ancré dans les pages indexées.
  //
  // CLIENT-ONLY comme le ChatWidget (site prerendu adapter-static) : le rendu
  // interactif est gardé par `browser`. Aucun visuel bespoke : tokens `--st-*`.
  //
  // SCAFFOLD : non monté dans le layout pour l'instant. Le câblage (header ou
  // page /search) est une décision d'intégration tracée dans
  // docs/docs-template-extraction.md.
  // ───────────────────────────────────────────────────────────────────────────
  import { browser } from "$app/environment";
  import { Sparkles } from "@lucide/svelte";
  import { Badge, Button, Search } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import {
    buildAssistantPrompt,
    buildDocsSearchIndex,
    searchDocs,
    type DocsSearchDocument
  } from "./docs-search-index";
  import { docsSearchCopy } from "./docs-search-i18n";
  import { isChatConfigured, sendChatMessage } from "./chat-config";

  type Props = {
    /** Index de contenu : par défaut celui du site docs DS. Un client du
     * template (ex. dataviz) injecte ici les documents de sa registry. */
    index?: DocsSearchDocument[];
    /** Nombre maximal de résultats lexicaux affichés. */
    limit?: number;
  };

  let { index = buildDocsSearchIndex(), limit = 8 }: Props = $props();

  const text = $derived(docsSearchCopy(locale.value));
  const configured = isChatConfigured();

  let query = $state("");
  let assistantAnswer = $state("");
  let assistantBusy = $state(false);
  let assistantFailed = $state(false);

  const results = $derived(searchDocs(index, query, locale.value, limit));
  const showEmpty = $derived(query.trim().length > 0 && results.length === 0);

  // Toute nouvelle requête invalide la réponse conversationnelle précédente.
  $effect(() => {
    void query;
    assistantAnswer = "";
    assistantFailed = false;
  });

  async function askAssistant() {
    const content = query.trim();
    if (!content || assistantBusy || !configured) return;

    assistantBusy = true;
    assistantAnswer = "";
    assistantFailed = false;

    const prompt = buildAssistantPrompt(content, results, locale.value);
    const result = await sendChatMessage(
      [{ role: "user", content: prompt }],
      locale.value
    );

    assistantAnswer = result.reply;
    assistantFailed = !result.ok;
    assistantBusy = false;
  }
</script>

{#if browser}
  <div class="docs-search" role="search" aria-label={text.label}>
    <Search
      bind:value={query}
      label={text.label}
      placeholder={text.placeholder}
      clearLabel={text.clearLabel}
    />

    {#if results.length > 0}
      <ul class="docs-search-results" aria-label={text.resultsLabel}>
        {#each results as result (result.doc.id)}
          <li class="docs-search-result">
            <a class="docs-search-result-link" href={result.doc.url}>
              <span class="docs-search-result-title">
                {result.doc.title[locale.value]}
              </span>
              <Badge tone="neutral">{text.kindLabels[result.doc.kind]}</Badge>
            </a>
            {#if result.doc.excerpt[locale.value]}
              <p class="docs-search-result-excerpt">
                {result.doc.excerpt[locale.value]}
              </p>
            {/if}
          </li>
        {/each}
      </ul>
    {:else if showEmpty}
      <p class="docs-search-empty">{text.noResults(query.trim())}</p>
    {/if}

    {#if query.trim().length > 0}
      <div class="docs-search-assistant">
        {#if configured}
          <Button
            variant="secondary"
            onclick={askAssistant}
            disabled={assistantBusy}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>{text.askAssistant}</span>
          </Button>
          <p class="docs-search-hint">{text.askAssistantHint}</p>
        {:else}
          <p class="docs-search-hint" role="note">{text.assistantUnavailable}</p>
        {/if}

        <div aria-live="polite">
          {#if assistantBusy}
            <p class="docs-search-thinking">{text.assistantThinking}</p>
          {:else if assistantAnswer}
            <div
              class="docs-search-answer"
              class:docs-search-answer--failed={assistantFailed}
            >
              <p class="docs-search-answer-label">{text.assistantAnswerLabel}</p>
              <p class="docs-search-answer-body">{assistantAnswer}</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .docs-search {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .docs-search-results {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .docs-search-result {
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .docs-search-result-link {
    align-items: center;
    color: var(--st-semantic-text-primary);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    text-decoration: none;
  }

  .docs-search-result-link:hover .docs-search-result-title {
    text-decoration: underline;
  }

  .docs-search-result-link:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  .docs-search-result-title {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .docs-search-result-excerpt {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0.25rem 0 0 0;
  }

  .docs-search-empty {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }

  .docs-search-assistant {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .docs-search-hint {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    line-height: 1.3;
    margin: 0;
  }

  .docs-search-thinking {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }

  .docs-search-answer {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .docs-search-answer--failed {
    border-color: var(--st-semantic-feedback-error, #dc2626);
  }

  .docs-search-answer-label {
    color: var(--st-semantic-text-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .docs-search-answer-body {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
  }
</style>
