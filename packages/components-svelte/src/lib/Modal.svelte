<script lang="ts">
  import { X } from "@lucide/svelte";
  import { tick } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ModalProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    open?: boolean;
    title: string;
    description?: string;
    closeLabel?: string;
    class?: string;
    /** Ferme sur clic du fond + Échap (défaut true). `false` = modale « statique »
     *  (étape obligatoire, wizard) que seul un bouton explicite peut fermer. */
    dismissible?: boolean;
    /** Override d'empilement (z-index du fond) — pour superposer une modale au-dessus
     *  d'un tiroir/une autre modale. Défaut = token `--st-component-overlay-zIndex`. */
    zIndex?: number;
    children?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  };

  let {
    open = false,
    title,
    description,
    closeLabel = "Close",
    class: className,
    dismissible = true,
    zIndex,
    children,
    footer,
    onclose,
    ...rest
  }: ModalProps = $props();

  let dialog: HTMLElement | undefined = $state();
  let closeButton: HTMLButtonElement | undefined = $state();
  let previousFocus: HTMLElement | null = null;
  const classes = () => ["st-modal", className].filter(Boolean).join(" ");

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  $effect(() => {
    if (!open) return;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    tick().then(() => closeButton?.focus());
  });

  function requestClose() {
    onclose?.();
    tick().then(() => previousFocus?.focus());
  }

  function onBackdropClick(event: MouseEvent) {
    if (dismissible && event.target === event.currentTarget) {
      requestClose();
    }
  }

  function trapFocus(event: KeyboardEvent) {
    if (!dialog || event.key !== "Tab") return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    const active = document.activeElement;

    if (!dialog.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") {
      if (!dismissible) return;
      event.preventDefault();
      requestClose();
      return;
    }
    trapFocus(event);
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
  <div
    class="st-modal__backdrop"
    onclick={onBackdropClick}
    role="presentation"
    style={zIndex != null ? `z-index:${zIndex}` : undefined}
  >
    <section
      {...rest}
      bind:this={dialog}
      class={classes()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
    >
      <header class="st-modal__header">
        <div>
          <h2 class="st-modal__title">{title}</h2>
          {#if description}<p class="st-modal__description">{description}</p>{/if}
        </div>
        <button
          bind:this={closeButton}
          class="st-modal__close"
          type="button"
          aria-label={closeLabel}
          onclick={requestClose}
        >
          <X size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </header>
      <div class="st-modal__body">
        {@render children?.()}
      </div>
      {#if footer}
        <footer class="st-modal__footer">
          {@render footer()}
        </footer>
      {/if}
    </section>
  </div>
{/if}

<style>
  .st-modal__backdrop {
    align-items: center;
    background: var(--st-component-overlay-backdrop, var(--st-semantic-surface-overlay));
    display: grid;
    inset: 0;
    justify-items: center;
    padding: var(--st-spacing-4, 1rem);
    position: fixed;
    z-index: var(--st-component-overlay-zIndex, 90);
  }

  .st-modal {
    background: var(--st-component-overlay-surface, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-overlay-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-overlay-radius, 0.5rem);
    box-shadow: var(--st-component-overlay-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    max-height: min(42rem, calc(100vh - 2rem));
    max-width: 36rem;
    overflow: auto;
    padding: var(--st-spacing-4, 1rem);
    width: min(100%, 36rem);
  }

  .st-modal__header {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
  }

  .st-modal__title {
    font-size: 1.25rem;
    line-height: 1.2;
    margin: 0;
  }

  .st-modal__description {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    margin: 0.5rem 0 0;
  }

  .st-modal__close {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    width: 2rem;
  }

  .st-modal__body {
    line-height: 1.5;
  }

  .st-modal__footer {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }
</style>
