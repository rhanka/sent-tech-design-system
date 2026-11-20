<script lang="ts">
  import { tick } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type DrawerProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    open?: boolean;
    title: string;
    description?: string;
    side?: "left" | "right" | "bottom";
    closeLabel?: string;
    class?: string;
    children?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  };

  let {
    open = $bindable(false),
    title,
    description,
    side = "right",
    closeLabel = "Close",
    class: className,
    children,
    footer,
    onclose,
    ...rest
  }: DrawerProps = $props();

  let drawerEl: HTMLElement | undefined = $state();
  let closeButton: HTMLButtonElement | undefined = $state();
  let previousFocus: HTMLElement | null = null;
  let wasOpen = false;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const classes = () => ["st-drawer", `st-drawer--${side}`, className].filter(Boolean).join(" ");

  $effect(() => {
    if (open && !wasOpen) {
      wasOpen = true;
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      void tick().then(() => {
        if (!open || !drawerEl) return;
        if (!drawerEl.contains(document.activeElement)) {
          (closeButton ?? drawerEl).focus();
        }
      });
    } else if (!open && wasOpen) {
      wasOpen = false;
      const target = previousFocus;
      previousFocus = null;
      void tick().then(() => {
        if (target?.isConnected) {
          target.focus();
        }
      });
    }
  });

  function close() {
    open = false;
    onclose?.();
  }

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function trapFocus(event: KeyboardEvent) {
    if (!drawerEl || event.key !== "Tab") return;
    const focusables = Array.from(drawerEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
    );

    if (focusables.length === 0) {
      event.preventDefault();
      drawerEl.focus();
      return;
    }

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement;

    if (!drawerEl.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (!open || event.defaultPrevented) return;
    const targetEl = event.target instanceof Element ? event.target : null;
    const activeEl = document.activeElement instanceof Element ? document.activeElement : null;
    const otherModal =
      targetEl?.closest('[aria-modal="true"]') ?? activeEl?.closest('[aria-modal="true"]');
    if (otherModal && otherModal !== drawerEl) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    trapFocus(event);
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
  <div class="st-drawer__backdrop" onclick={onBackdropClick} role="presentation">
    <aside
      {...rest}
      bind:this={drawerEl}
      class={classes()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
    >
      <header class="st-drawer__header">
        <div>
          <h2 class="st-drawer__title" tabindex="-1">{title}</h2>
          {#if description}<p class="st-drawer__description">{description}</p>{/if}
        </div>
        <button
          bind:this={closeButton}
          class="st-drawer__close"
          type="button"
          aria-label={closeLabel}
          onclick={close}
        >
          <span aria-hidden="true">x</span>
        </button>
      </header>
      <div class="st-drawer__body">
        {@render children?.()}
      </div>
      {#if footer}
        <footer class="st-drawer__footer">
          {@render footer()}
        </footer>
      {/if}
    </aside>
  </div>
{/if}

<style>
  .st-drawer__backdrop {
    background: var(--st-component-drawer-backdrop, var(--st-semantic-surface-overlay));
    inset: 0;
    position: fixed;
    z-index: var(--st-component-drawer-zIndex, 90);
  }

  .st-drawer {
    background: var(--st-component-drawer-surface, var(--st-semantic-surface-raised));
    border-color: var(--st-component-drawer-border, var(--st-semantic-border-subtle));
    box-shadow: var(--st-component-drawer-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    max-width: min(100vw, var(--st-component-drawer-width, 24rem));
    padding: var(--st-spacing-4, 1rem);
    position: absolute;
    top: 0;
    width: var(--st-component-drawer-width, 24rem);
  }

  .st-drawer--right {
    border-left-style: solid;
    border-left-width: 1px;
    right: 0;
  }

  .st-drawer--left {
    border-right-style: solid;
    border-right-width: 1px;
    left: 0;
  }

  /* Tiroir ancré en bas (G2) : pleine largeur, hauteur auto plafonnée. Override
     des assises horizontales du tiroir gauche/droite (largeur fixe + top:0). */
  .st-drawer--bottom {
    border-top-style: solid;
    border-top-width: 1px;
    bottom: 0;
    height: auto;
    left: 0;
    max-height: min(90vh, var(--st-component-drawer-height, 24rem));
    max-width: 100vw;
    right: 0;
    top: auto;
    width: 100%;
  }

  .st-drawer__header {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
  }

  .st-drawer__title {
    font-size: 1.125rem;
    line-height: 1.3;
    margin: 0;
  }

  .st-drawer__description {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    margin: 0.5rem 0 0;
  }

  .st-drawer__close {
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

  .st-drawer__body {
    line-height: 1.5;
    overflow: auto;
    padding-block: var(--st-spacing-4, 1rem);
  }

  .st-drawer__footer {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }
</style>
