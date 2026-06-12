<!--
  Aperçu multi-framework (A + C).
  Galerie qui rend chaque exemple avec le VRAI package du framework sélectionné
  dans le header (Svelte / React / Vue). Bascule en place via le sélecteur de
  framework : svelte = rendu inline, react/vue = îles montées côté client.
-->
<script lang="ts">
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import { EXAMPLES } from "$lib/framework/examples";
  import { framework } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
  const ids = Object.keys(EXAMPLES);
  const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
  const activeLabel = $derived(
    framework.value === "react" ? "React" : framework.value === "vue" ? "Vue" : "Svelte"
  );
</script>

<svelte:head>
  <title>{fr ? "Aperçu multi-framework" : "Multi-framework preview"} : Sentropic Design System</title>
</svelte:head>

<section class="preview-intro">
  <h1>{fr ? "Aperçu multi-framework" : "Multi-framework preview"}</h1>
  <p>
    {#if fr}
      Chaque aperçu ci-dessous est rendu avec le <strong>vrai package</strong> du
      framework actif (<strong>{activeLabel}</strong>). Utilisez le sélecteur
      <em>Svelte / React / Vue</em> dans l'en-tête : le rendu bascule en place
      (Svelte inline, React/Vue montés côté client) et le snippet de code suit.
    {:else}
      Each preview below renders with the <strong>real package</strong> of the
      active framework (<strong>{activeLabel}</strong>). Use the
      <em>Svelte / React / Vue</em> selector in the header: the preview switches
      in place (Svelte inline, React/Vue mounted client-side) and the code
      snippet follows.
    {/if}
  </p>
</section>

<div class="preview-grid">
  {#each ids as id (id)}
    <FrameworkPreview example={id} title={title(id)} />
  {/each}
</div>

<style>
  .preview-intro {
    margin-bottom: 1.75rem;
  }

  .preview-intro h1 {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .preview-intro p {
    color: var(--docs-muted, #475569);
    line-height: 1.6;
    max-width: 70ch;
  }

  .preview-grid {
    display: grid;
    gap: 1.25rem;
  }
</style>
