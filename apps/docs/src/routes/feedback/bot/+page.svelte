<script lang="ts">
  import GraphifyBot from "$lib/feedback/GraphifyBot.svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  const systemPrompt =
    "Page de démo : Sent Tech Design System, documentation des composants tri-framework.";
</script>

<svelte:head>
  <title>{fr ? "Assistant graphify" : "Graphify assistant"} · Sent Tech Design System</title>
</svelte:head>

<section class="graphify-page">
  <header class="graphify-page__head">
    <h1>{fr ? "Assistant graphify" : "Graphify assistant"}</h1>
    <p>
      {fr
        ? "Démo du chatbot des docs assisté par graphify (codex 5.4 mini). Squelette WP17 : les réponses sont simulées en attendant le branchement du modèle et la soumission de bug agent-à-agent."
        : "Demo of the docs chatbot assisted by graphify (codex 5.4 mini). WP17 skeleton: replies are mocked while the model wiring and agent-to-agent bug submission land."}
    </p>
  </header>

  <GraphifyBot {systemPrompt} />
</section>

<style>
  .graphify-page {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
    margin: 0 auto;
    max-width: 48rem;
    padding: var(--st-spacing-8, 2rem) var(--st-spacing-6, 1.5rem);
  }

  .graphify-page__head h1 {
    color: var(--st-semantic-text-primary);
    font-size: var(--st-font-size-2xl, 1.75rem);
    margin: 0 0 var(--st-spacing-2, 0.5rem);
  }

  .graphify-page__head p {
    color: var(--st-semantic-text-secondary);
    margin: 0;
    max-width: 42rem;
  }
</style>
