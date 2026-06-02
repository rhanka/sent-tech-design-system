<script lang="ts">
  import { ArrowUp } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type BackToTopProps = Omit<HTMLAttributes<HTMLButtonElement>, "class"> & {
    label?: string;
    targetId?: string;
    threshold?: number;
    autoHide?: boolean;
    smooth?: boolean;
    class?: string;
  };

  let {
    label = "Retour en haut",
    targetId = "top",
    threshold = 240,
    autoHide = true,
    smooth = true,
    class: className,
    ...rest
  }: BackToTopProps = $props();

  const normalizedTarget = () => (targetId ? `#${targetId.replace(/^#/, "")}` : "#top");

  let visible = $state(false);
  let hideOnScroll = $state(true);

  $effect(() => {
    hideOnScroll = autoHide;
    visible = !autoHide;
  });

  $effect(() => {
    if (!hideOnScroll || typeof window === "undefined") {
      if (!hideOnScroll) {
        visible = true;
      }
      return;
    }

    const updateVisibility = () => {
      visible = window.scrollY > threshold;
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  });

  function goTop() {
    const target = normalizedTarget();
    const anchor = target.startsWith("#") ? target.slice(1) : target;
    const element = anchor ? document.getElementById(anchor) : null;

    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start"
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto"
    });
  }

  const classes = () => ["st-backToTop", className].filter(Boolean).join(" ");
</script>

<button
  type="button"
  class={classes()}
  onclick={goTop}
  aria-label={label}
  aria-hidden={autoHide && !visible}
  aria-live={autoHide && !visible ? "polite" : undefined}
  tabindex={autoHide && !visible ? -1 : undefined}
  disabled={rest.disabled}
  {...rest}
>
  <span class="st-backToTop__icon" aria-hidden="true">
    <ArrowUp size={16} />
  </span>
  <span class="st-backToTop__label">{label}</span>
</button>

<style>
  .st-backToTop {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-contrast, #0f172a));
    border: 1px solid var(--st-component-control-border, #334155);
    border-radius: 999px;
    bottom: var(--st-spacing-4, 1rem);
    color: var(--st-semantic-text-inverse, #fff);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    gap: 0.5rem;
    opacity: 0;
    padding: 0.6rem 0.8rem;
    position: fixed;
    pointer-events: none;
    right: var(--st-spacing-4, 1rem);
    transform: translateY(0.75rem);
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    z-index: var(--st-zindex-toast, 70);
  }

  .st-backToTop:not([aria-hidden="true"]) {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .st-backToTop:hover:not(:disabled),
  .st-backToTop:focus-visible {
    background: var(--st-component-control-hoverBackground, #111827);
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, #38bdf8);
    outline: none;
  }

  .st-backToTop:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, #38bdf8);
    outline-offset: 2px;
  }

  .st-backToTop__label {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .st-backToTop__icon {
    align-items: center;
    display: inline-flex;
  }

  @media (max-width: 38rem) {
    .st-backToTop__label {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-backToTop {
      transition: none;
    }
  }
</style>
