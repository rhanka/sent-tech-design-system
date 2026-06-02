<script lang="ts">
  // ───────────────────────────────────────────────────────────────────────────
  // Widget de chat « light-auth » de la documentation.
  //
  // CLIENT-ONLY : monté dans +layout.svelte, mais tout le rendu interactif est
  // gardé par `browser` (le site est prerendu via adapter-static).
  //
  // Réutilise les primitives du DS : ChatThread / ChatMessage / ChatComposer
  // + IconButton / Badge / Link. Aucun visuel bespoke : couleurs/espacements via
  // tokens sémantiques `--st-*`.
  //
  // Gating anonyme : compteur localStorage plafonné (ANON_LIMIT). À plafond
  // atteint, le composer est remplacé par un CTA de connexion (jamais de blocage
  // dur, jamais d'exception).
  // ───────────────────────────────────────────────────────────────────────────
  import { browser } from "$app/environment";
  import { MessageCircle, X, Sparkles, UserRound, LogIn } from "@lucide/svelte";
  import {
    ChatThread,
    ChatMessage,
    ChatComposer,
    IconButton,
    Badge,
    Link
  } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { chatCopy } from "./chat-i18n";
  import { anonCounter } from "./anon-counter.svelte";
  import {
    ANON_LIMIT,
    CHAT_AUTH_URL,
    isChatConfigured,
    sendChatMessage,
    type ChatWireMessage
  } from "./chat-config";

  const text = $derived(chatCopy(locale.value));
  const configured = isChatConfigured();

  type Item = {
    id: string;
    role: "user" | "assistant" | "system";
    status: "completed" | "processing" | "failed";
    content: string;
  };

  let open = $state(false);
  let messages = $state<Item[]>([]);
  let composerValue = $state("");
  let busy = $state(false);
  let panelEl: HTMLElement | undefined = $state();
  let launcherEl: HTMLButtonElement | undefined = $state();

  // Restaure le compteur anonyme au montage client.
  $effect(() => {
    if (browser) anonCounter.restore();
  });

  const remainingText = $derived(
    anonCounter.reached ? text.remainingNone : text.remaining(anonCounter.remaining)
  );

  let idSeed = 0;
  function nextId(prefix: string): string {
    idSeed += 1;
    return `${prefix}-${idSeed}`;
  }

  function toWire(): ChatWireMessage[] {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }) as ChatWireMessage);
  }

  async function handleSubmit(payload: { message: string }) {
    const content = payload.message.trim();
    if (!content || busy || anonCounter.reached) return;

    messages = [
      ...messages,
      { id: nextId("u"), role: "user", status: "completed", content }
    ];
    composerValue = "";

    // Une interaction anonyme consommée par message envoyé.
    anonCounter.increment();

    busy = true;
    const pendingId = nextId("a");
    messages = [
      ...messages,
      { id: pendingId, role: "assistant", status: "processing", content: text.thinking }
    ];

    const finish = (reply: string, status: "completed" | "failed") => {
      const idx = messages.findIndex((m) => m.id === pendingId);
      if (idx !== -1) {
        messages[idx] = { ...messages[idx], content: reply, status };
      }
      busy = false;
    };

    if (!configured) {
      // État « non configuré » : réponse de démonstration locale, clairement
      // étiquetée. Aucun appel réseau, aucune exception.
      window.setTimeout(() => finish(text.demoReply, "completed"), 350);
      return;
    }

    const result = await sendChatMessage(toWire(), locale.value);
    finish(result.reply, result.ok ? "completed" : "failed");
  }

  function toggle() {
    open = !open;
  }

  // Focus management : à l'ouverture on cible le panneau ; à la fermeture (via
  // Échap) on rend le focus au lanceur.
  $effect(() => {
    if (open && panelEl) {
      panelEl.focus();
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      open = false;
      launcherEl?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet userAvatar()}
  <span class="docs-chat-avatar docs-chat-avatar--user" aria-hidden="true">
    <UserRound size={13} />
  </span>
{/snippet}

{#snippet assistantAvatar()}
  <span class="docs-chat-avatar docs-chat-avatar--assistant" aria-hidden="true">
    <Sparkles size={12} />
  </span>
{/snippet}

{#snippet emptyState()}
  <div class="docs-chat-empty">
    <span class="docs-chat-empty-icon" aria-hidden="true"><Sparkles size={20} /></span>
    <p class="docs-chat-empty-title">{text.emptyTitle}</p>
    <p class="docs-chat-empty-body">{text.emptyBody}</p>
  </div>
{/snippet}

{#if browser}
  <div class="docs-chat-root">
    {#if open}
      <div
        bind:this={panelEl}
        class="docs-chat-panel"
        role="dialog"
        aria-modal="false"
        aria-label={text.panelTitle}
        tabindex="-1"
      >
        <header class="docs-chat-header">
          <span class="docs-chat-header-icon" aria-hidden="true"><Sparkles size={16} /></span>
          <span class="docs-chat-header-copy">
            <span class="docs-chat-title">{text.panelTitle}</span>
            <span class="docs-chat-subtitle">{text.panelSubtitle}</span>
          </span>
          <IconButton aria-label={text.close} size="sm" onclick={toggle}>
            <X size={18} />
          </IconButton>
        </header>

        <div class="docs-chat-body">
          <ChatThread label={text.threadLabel} {emptyState}>
            {#each messages as msg (msg.id)}
              <ChatMessage
                role={msg.role}
                status={msg.status}
                avatar={msg.role === "user"
                  ? userAvatar
                  : msg.role === "assistant"
                    ? assistantAvatar
                    : undefined}
              >
                <p>{msg.content}</p>
              </ChatMessage>
            {/each}
          </ChatThread>
        </div>

        <footer class="docs-chat-footer">
          {#if !configured}
            <p class="docs-chat-notice" role="note">{text.demoNotice}</p>
          {/if}

          {#if anonCounter.reached}
            <!-- Plafond anonyme atteint : CTA de connexion (jamais de blocage). -->
            <div class="docs-chat-cta">
              <p class="docs-chat-cta-title">{text.ctaTitle}</p>
              <p class="docs-chat-cta-body">{text.ctaBody}</p>
              <Link
                href={CHAT_AUTH_URL}
                variant="standalone"
                class="docs-chat-cta-link"
              >
                <LogIn size={16} aria-hidden="true" />
                <span>{text.ctaButton}</span>
              </Link>
            </div>
          {:else}
            <div class="docs-chat-meter">
              <Badge tone={anonCounter.remaining <= 1 ? "warning" : "neutral"}>
                {remainingText}
              </Badge>
            </div>
            <ChatComposer
              bind:value={composerValue}
              placeholder={text.placeholder}
              {busy}
              onsubmit={handleSubmit}
            />
          {/if}
        </footer>
      </div>
    {/if}

    <button
      bind:this={launcherEl}
      type="button"
      class="docs-chat-launcher"
      class:docs-chat-launcher--open={open}
      onclick={toggle}
      aria-label={open ? text.close : text.launcherLabel}
      aria-expanded={open}
    >
      {#if open}
        <X size={22} aria-hidden="true" />
      {:else}
        <MessageCircle size={22} aria-hidden="true" />
      {/if}
    </button>
  </div>
{/if}

<style>
  .docs-chat-root {
    position: fixed;
    right: var(--st-spacing-4, 1rem);
    bottom: var(--st-spacing-4, 1rem);
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--st-spacing-3, 0.75rem);
  }

  /* ── Lanceur flottant (cible ≥ 44px) ──────────────────────────────────── */
  .docs-chat-launcher {
    align-items: center;
    background: var(--st-semantic-action-primary, #2563eb);
    border: 1px solid transparent;
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-onAction, #ffffff);
    cursor: pointer;
    display: inline-flex;
    height: 3rem;
    width: 3rem;
    justify-content: center;
    box-shadow: var(--st-elevation-2, 0 4px 12px rgba(15, 23, 42, 0.18));
    transition:
      transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .docs-chat-launcher:hover {
    background: var(--st-semantic-action-primaryHover, var(--st-semantic-action-primary, #1d4ed8));
    transform: translateY(-1px);
  }

  .docs-chat-launcher:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  /* ── Panneau ──────────────────────────────────────────────────────────── */
  .docs-chat-panel {
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    box-shadow: var(--st-elevation-3, 0 12px 32px rgba(15, 23, 42, 0.18));
    display: flex;
    flex-direction: column;
    width: min(22rem, calc(100vw - 2rem));
    max-height: min(34rem, calc(100vh - 6rem));
    overflow: hidden;
  }

  .docs-chat-panel:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: -2px;
  }

  .docs-chat-header {
    align-items: center;
    border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .docs-chat-header-icon {
    align-items: center;
    color: var(--st-semantic-action-primary, #2563eb);
    display: inline-flex;
    flex: 0 0 auto;
  }

  .docs-chat-header-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .docs-chat-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.9375rem;
    font-weight: 650;
    line-height: 1.2;
  }

  .docs-chat-subtitle {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .docs-chat-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
  }

  .docs-chat-body :global(.st-chatThread) {
    flex: 1;
    max-height: none;
  }

  .docs-chat-footer {
    border-top: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .docs-chat-notice {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    line-height: 1.3;
    margin: 0;
  }

  .docs-chat-meter {
    display: flex;
    justify-content: flex-end;
  }

  /* ── État vide ────────────────────────────────────────────────────────── */
  .docs-chat-empty {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: var(--st-spacing-4, 1rem);
    text-align: center;
  }

  .docs-chat-empty-icon {
    align-items: center;
    color: var(--st-semantic-action-primary, #2563eb);
    display: inline-flex;
    margin-bottom: 0.25rem;
  }

  .docs-chat-empty-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  .docs-chat-empty-body {
    font-size: 0.8125rem;
    margin: 0;
    max-width: 16rem;
  }

  /* ── CTA de connexion (plafond atteint) ───────────────────────────────── */
  .docs-chat-cta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .docs-chat-cta-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  .docs-chat-cta-body {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0 0 0.25rem 0;
  }

  .docs-chat-cta :global(.docs-chat-cta-link) {
    align-items: center;
    display: inline-flex;
    gap: 0.4rem;
    min-height: 44px;
  }

  /* ── Avatars ──────────────────────────────────────────────────────────── */
  .docs-chat-avatar {
    align-items: center;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 999px;
    display: inline-flex;
    height: 1.5rem;
    justify-content: center;
    width: 1.5rem;
  }

  .docs-chat-avatar--user {
    background: var(--st-semantic-surface-subtle, #e2e8f0);
    color: var(--st-semantic-text-secondary);
  }

  .docs-chat-avatar--assistant {
    background: var(--st-semantic-surface-default, #ffffff);
    color: var(--st-semantic-action-primary, #2563eb);
  }

  /* ── Responsive : plein écran sur mobile ──────────────────────────────── */
  @media (max-width: 480px) {
    .docs-chat-panel {
      width: calc(100vw - 1.5rem);
      max-height: calc(100vh - 5.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .docs-chat-launcher {
      transition: none;
    }
    .docs-chat-launcher:hover {
      transform: none;
    }
  }
</style>
