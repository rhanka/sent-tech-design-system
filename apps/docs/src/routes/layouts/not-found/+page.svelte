<script lang="ts">
  // Écran 404 — EmptyState centré avec titre « 404 » et bouton de retour.
  // Page complète auto-contenue construite à partir des composants DS.
  import { EmptyState, Button } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
</script>

<div class="nf-screen">
  <EmptyState
    title="404"
    message={fr
      ? "La page que vous cherchez est introuvable ou a été déplacée."
      : "The page you are looking for could not be found or has moved."}
  >
    {#snippet action()}
      <Button variant="primary" onclick={() => history.back()}>
        {fr ? "Retour à l'accueil" : "Back to home"}
      </Button>
    {/snippet}
  </EmptyState>
</div>

<style>
  .nf-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 4rem 1rem;
    background: var(--st-semantic-surface-subtle, #f8fafc);
  }
</style>
