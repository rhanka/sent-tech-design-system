<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth/auth.svelte";
  import { locale } from "$lib/locale.svelte";

  // 'pending' tant que handleCallback tourne ; 'error' si la session a échoué.
  let phase = $state<"pending" | "error">("pending");

  onMount(async () => {
    const ok = await auth.handleCallback(window.location.search);
    if (ok) {
      // Succès : on retire le code/state de l'URL et on revient à l'accueil.
      await goto("/", { replaceState: true });
    } else {
      phase = "error";
    }
  });

  const t = $derived(
    locale.value === "fr"
      ? {
          pending: "Connexion en cours…",
          errorTitle: "Échec de la connexion",
          errorBody: "La session n'a pas pu être établie. Réessaie la connexion.",
          back: "Retour à l'accueil"
        }
      : {
          pending: "Signing in…",
          errorTitle: "Sign-in failed",
          errorBody: "The session could not be established. Please try signing in again.",
          back: "Back to home"
        }
  );
</script>

<svelte:head>
  <title>{t.pending}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="auth-callback">
  {#if phase === "pending"}
    <div class="auth-callback__card" role="status" aria-live="polite">
      <span class="auth-callback__spinner" aria-hidden="true"></span>
      <p class="auth-callback__msg">{t.pending}</p>
    </div>
  {:else}
    <div class="auth-callback__card" role="alert">
      <h1 class="auth-callback__title">{t.errorTitle}</h1>
      <p class="auth-callback__msg">{t.errorBody}</p>
      <a class="auth-callback__back" href="/">{t.back}</a>
    </div>
  {/if}
</main>

<style>
  .auth-callback {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 60vh;
    padding: var(--st-spacing-6, 1.5rem);
  }

  .auth-callback__card {
    align-items: center;
    background: var(--st-semantic-surface-raised);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    justify-items: center;
    max-width: 24rem;
    padding: var(--st-spacing-6, 1.5rem);
    text-align: center;
  }

  .auth-callback__title {
    color: var(--st-semantic-text-primary);
    font-family: var(--st-font-sans);
    font-size: 1.125rem;
    margin: 0;
  }

  .auth-callback__msg {
    color: var(--st-semantic-text-secondary);
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    margin: 0;
  }

  .auth-callback__spinner {
    animation: auth-callback-spin 0.8s linear infinite;
    border: 2px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-pill, 9999px);
    border-top-color: var(--st-semantic-action-primary);
    height: 1.75rem;
    width: 1.75rem;
  }

  .auth-callback__back {
    color: var(--st-semantic-action-primary);
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .auth-callback__back:hover {
    text-decoration: underline;
  }

  @keyframes auth-callback-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
