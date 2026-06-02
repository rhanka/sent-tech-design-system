<!--
  Bandeau d'implémentation framework.
  Rendu au-dessus du contenu de chaque page documentaire quand un framework
  autre que Svelte (référence) est sélectionné dans le header.
  - React : indique que les exemples portés React sont disponibles via le package.
  - Vue : portage en cours → placeholder « bientôt ».
  Volontairement léger : pas d'island runtime React/Vue, juste un indicateur clair.
-->
<script lang="ts">
  import { framework } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
</script>

{#if framework.value === "react"}
  <aside class="docs-framework-banner docs-framework-banner--react" aria-live="polite">
    <span class="docs-framework-banner__tag">React</span>
    <span class="docs-framework-banner__text">
      {#if fr}
        Implémentation React — mêmes tokens, thèmes et classes que la version Svelte,
        via <code>@sentropic/design-system-react</code>.
      {:else}
        React implementation — same tokens, themes and component classes as the Svelte
        version, through <code>@sentropic/design-system-react</code>.
      {/if}
    </span>
  </aside>
{:else if framework.value === "vue"}
  <aside class="docs-framework-banner docs-framework-banner--vue" aria-live="polite">
    <span class="docs-framework-banner__tag">Vue</span>
    <span class="docs-framework-banner__text">
      {#if fr}
        Vue — bientôt. Le portage Vue du catalogue est en cours ; en attendant,
        référez-vous à l'implémentation Svelte.
      {:else}
        Vue — coming soon. The Vue port of the catalog is in progress; in the meantime,
        refer to the Svelte implementation.
      {/if}
    </span>
  </aside>
{/if}

<style>
  .docs-framework-banner {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--docs-line, #e2e8f0);
    border-radius: 0.5rem;
    color: var(--docs-ink, #0f172a);
    display: flex;
    font-size: 0.9rem;
    gap: 0.65rem;
    line-height: 1.45;
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
  }

  .docs-framework-banner__tag {
    background: var(--docs-accent, #0043ce);
    border-radius: 0.3rem;
    color: #ffffff;
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    padding: 0.2rem 0.5rem;
  }

  .docs-framework-banner--vue .docs-framework-banner__tag {
    background: #42b883;
  }

  .docs-framework-banner__text {
    color: var(--docs-muted, #475569);
  }

  .docs-framework-banner__text code {
    background: rgb(15 23 42 / 0.06);
    border-radius: 0.25rem;
    font-size: 0.82em;
    padding: 0.05rem 0.3rem;
  }
</style>
