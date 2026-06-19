<script lang="ts">
  // ───────────────────────────────────────────────────────────────────────────
  // Chat Feedback (WP17) — skeleton frontend.
  //
  // Bouton flottant « Feedback » en bas à droite de chaque page de docs. Au clic,
  // un panneau s'ouvre : un Textarea + un bouton « Envoyer ». State 100 % local
  // pour l'instant — l'envoi ne fait qu'un console.log (le backend = app
  // principale viendra plus tard, avec login libre RP OAuth).
  //
  // CLIENT-ONLY : tout le rendu interactif est gardé par `browser` (le site est
  // prérendu via adapter-static). Aucun visuel bespoke : on réutilise les
  // primitives du DS (Button / IconButton / Textarea) et les tokens sémantiques
  // `--st-*`. Positionné au-dessus du ChatWidget pour ne pas le chevaucher.
  // ───────────────────────────────────────────────────────────────────────────
  import { browser } from "$app/environment";
  import { MessageSquarePlus, X, Send, CircleCheckBig } from "@lucide/svelte";
  import { Button, IconButton, Textarea } from "@sentropic/design-system-svelte";
  import { page } from "$app/state";
  import { locale } from "$lib/locale.svelte";

  // Copie i18n inline (FR par défaut, EN secondaire) — alignée sur la convention
  // `locale.value` du layout. À extraire vers un module dédié quand le backend
  // arrivera (parité avec chat/chat-i18n.ts).
  const copy = $derived(
    locale.value === "fr"
      ? {
          launcher: "Feedback",
          panelTitle: "Votre avis sur cette page",
          panelSubtitle: "Aidez-nous à améliorer la documentation",
          placeholder: "Qu'est-ce qui pourrait être plus clair ?",
          send: "Envoyer",
          close: "Fermer",
          sentTitle: "Merci !",
          sentBody: "Votre retour a bien été pris en compte.",
          again: "Envoyer un autre retour"
        }
      : {
          launcher: "Feedback",
          panelTitle: "Feedback on this page",
          panelSubtitle: "Help us improve the documentation",
          placeholder: "What could be clearer?",
          send: "Send",
          close: "Close",
          sentTitle: "Thank you!",
          sentBody: "Your feedback has been recorded.",
          again: "Send more feedback"
        }
  );

  let open = $state(false);
  let value = $state("");
  let sent = $state(false);
  let panelEl: HTMLElement | undefined = $state();
  let launcherEl: HTMLButtonElement | undefined = $state();
  let textareaEl: HTMLDivElement | undefined = $state();

  const canSend = $derived(value.trim().length > 0);

  function toggle() {
    open = !open;
    if (open) sent = false;
  }

  function handleSubmit() {
    const message = value.trim();
    if (!message) return;
    // Skeleton : pas de backend encore. On trace localement le payload qui sera
    // POSTé vers l'app principale (page courante + message + locale).
    // eslint-disable-next-line no-console
    console.log("[ChatFeedback] submit", {
      path: browser ? page.url.pathname : "",
      locale: locale.value,
      message
    });
    value = "";
    sent = true;
  }

  function reset() {
    sent = false;
    value = "";
  }

  // Focus : à l'ouverture on cible le panneau ; à la fermeture (Échap) on rend
  // le focus au lanceur.
  $effect(() => {
    if (open && panelEl) panelEl.focus();
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      open = false;
      launcherEl?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if browser}
  <div class="docs-feedback-root">
    {#if open}
      <div
        bind:this={panelEl}
        class="docs-feedback-panel"
        role="dialog"
        aria-modal="false"
        aria-label={copy.panelTitle}
        tabindex="-1"
      >
        <header class="docs-feedback-header">
          <span class="docs-feedback-header-copy">
            <span class="docs-feedback-title">{copy.panelTitle}</span>
            <span class="docs-feedback-subtitle">{copy.panelSubtitle}</span>
          </span>
          <IconButton aria-label={copy.close} size="sm" onclick={toggle}>
            <X size={18} />
          </IconButton>
        </header>

        <div class="docs-feedback-body">
          {#if sent}
            <div class="docs-feedback-success" role="status">
              <span class="docs-feedback-success-icon" aria-hidden="true">
                <CircleCheckBig size={28} />
              </span>
              <p class="docs-feedback-success-title">{copy.sentTitle}</p>
              <p class="docs-feedback-success-body">{copy.sentBody}</p>
              <Button variant="secondary" size="sm" onclick={reset}>
                {copy.again}
              </Button>
            </div>
          {:else}
            <div bind:this={textareaEl}>
              <Textarea
                bind:value
                placeholder={copy.placeholder}
                rows={4}
                aria-label={copy.panelTitle}
              />
            </div>
            <div class="docs-feedback-actions">
              <Button onclick={handleSubmit} disabled={!canSend}>
                <Send size={16} aria-hidden="true" />
                <span>{copy.send}</span>
              </Button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <button
      bind:this={launcherEl}
      type="button"
      class="docs-feedback-launcher"
      class:docs-feedback-launcher--open={open}
      onclick={toggle}
      aria-label={copy.launcher}
      aria-expanded={open}
    >
      {#if open}
        <X size={18} aria-hidden="true" />
      {:else}
        <MessageSquarePlus size={18} aria-hidden="true" />
      {/if}
      <span class="docs-feedback-launcher-label">{copy.launcher}</span>
    </button>
  </div>
{/if}

<style>
  /* Ancrage en bas à droite, EMPILÉ au-dessus du ChatWidget (bottom ~1rem) pour
     ne pas le chevaucher. */
  .docs-feedback-root {
    position: fixed;
    right: var(--st-spacing-4, 1rem);
    bottom: calc(var(--st-spacing-4, 1rem) + 4rem);
    z-index: 59;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--st-spacing-3, 0.75rem);
  }

  /* ── Lanceur (pilule, cible ≥ 44px de haut) ───────────────────────────── */
  .docs-feedback-launcher {
    align-items: center;
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-primary, #0f172a);
    cursor: pointer;
    display: inline-flex;
    gap: 0.4rem;
    min-height: 2.5rem;
    padding: 0 var(--st-spacing-3, 0.75rem);
    box-shadow: var(--st-elevation-2, 0 4px 12px rgba(15, 23, 42, 0.18));
    transition:
      transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .docs-feedback-launcher:hover {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    transform: translateY(-1px);
  }

  .docs-feedback-launcher:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  .docs-feedback-launcher-label {
    font-size: 0.8125rem;
    font-weight: 600;
  }

  /* ── Panneau ──────────────────────────────────────────────────────────── */
  .docs-feedback-panel {
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    box-shadow: var(--st-elevation-3, 0 12px 32px rgba(15, 23, 42, 0.18));
    display: flex;
    flex-direction: column;
    width: min(22rem, calc(100vw - 2rem));
    overflow: hidden;
  }

  .docs-feedback-panel:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: -2px;
  }

  .docs-feedback-header {
    align-items: flex-start;
    border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .docs-feedback-header-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .docs-feedback-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.9375rem;
    font-weight: 650;
    line-height: 1.2;
  }

  .docs-feedback-subtitle {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .docs-feedback-body {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .docs-feedback-actions {
    display: flex;
    justify-content: flex-end;
  }

  /* ── État de succès ───────────────────────────────────────────────────── */
  .docs-feedback-success {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: var(--st-spacing-3, 0.75rem) 0;
    text-align: center;
  }

  .docs-feedback-success-icon {
    align-items: center;
    color: var(--st-semantic-status-success, #16a34a);
    display: inline-flex;
    margin-bottom: 0.25rem;
  }

  .docs-feedback-success-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.9375rem;
    font-weight: 650;
    margin: 0;
  }

  .docs-feedback-success-body {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0 0 0.5rem 0;
    max-width: 16rem;
  }

  @media (max-width: 480px) {
    .docs-feedback-panel {
      width: calc(100vw - 1.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .docs-feedback-launcher {
      transition: none;
    }
    .docs-feedback-launcher:hover {
      transform: none;
    }
  }
</style>
